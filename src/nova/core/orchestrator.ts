// ==============================================================================
// TUNITRIP NOVA — CORE ORCHESTRATOR
// Coordinates Request Validation, Auth, Context, LLM Provider, Tools & Streaming
// ==============================================================================

import { LLMProvider } from '../providers/types';
import { LLMProviderFactory } from '../providers/factory';
import { NovaToolRegistry, toolRegistry } from '../tools/registry';
import { ConversationManager } from '../conversation/manager';
import { NovaEventStream, NovaEvent } from './events';
import { NovaError } from './errors';
import { TripProfileExtractor, StructuredTripProfile } from '../extraction/tripProfile';
import { LLMMessage, LLMToolResult } from '../providers/types';
import { Currency } from '../../types';

export interface OrchestratorRequest {
  message: string;
  conversationId?: string;
  userId?: string;
  userRole?: 'authenticated' | 'anon';
  currency?: Currency;
  supabaseClient?: any;
}

export interface OrchestratorResult {
  conversationId: string;
  response: string;
  structuredProfile: StructuredTripProfile;
  toolStepsExecuted: number;
  events: NovaEvent[];
}

export class NovaOrchestrator {
  private llmProvider: LLMProvider;
  private registry: NovaToolRegistry;

  constructor(customProvider?: LLMProvider, customRegistry?: NovaToolRegistry) {
    this.llmProvider = customProvider || LLMProviderFactory.create();
    this.registry = customRegistry || toolRegistry;
  }

  /**
   * System Instruction grounding NOVA as an authoritative Tunisian travel agent
   */
  private buildSystemPrompt(profile: StructuredTripProfile, currency: Currency): string {
    return `You are NOVA, the autonomous travel architect for TuniTrip — Tunisia's premier intelligent travel platform.
You behave as an expert human travel agent, not a generic chatbot.

CURRENT TRIP PROFILE EXTRACTED FROM USER:
- Destination: ${profile.destination}
- Duration: ${profile.durationDays} days
- Travelers: ${profile.travelers} (${profile.travelerType})
- Budget Limit: ${profile.budget.amount} ${currency}
- Interests: ${profile.interests.join(', ')}
- Preferred Pace: ${profile.pace}
${profile.currentLocation ? `- Current Location: ${profile.currentLocation}` : ''}

GROUNDING & TRUTH RULES (STRICT):
1. Never hallucinate or invent availability, hotel rooms, restaurant tables, current prices, or booking confirmations.
2. Distinguish clearly between:
   - Verified facts from our Supabase knowledgebase (via search_places and get_place_details)
   - Calculated estimates from deterministic tools (build_itinerary, calculate_budget, optimize_route)
   - Unknown information: If specific opening hours or pricing are unavailable in our database, explicitly say so.
3. Never call static historical data "live".
4. When travelers mention activities, theme parks (like Carthage Land), Roman ruins (El Jem, Carthage), swimming, or beaches, invoke the appropriate tools to retrieve verified data.
5. In your recommendations, be concise, warm, culturally respectful, and structured with bullet points.
6. When calculating budgets or creating itineraries, use the deterministic tools build_itinerary and calculate_budget rather than guessing numbers.`;
  }

  /**
   * Main entrypoint to process a conversational turn through the 10-stage lifecycle.
   */
  public async process(
    request: OrchestratorRequest,
    eventListener?: (event: NovaEvent) => void
  ): Promise<OrchestratorResult> {
    const eventStream = new NovaEventStream();
    const collectedEvents: NovaEvent[] = [];

    eventStream.subscribe((ev) => {
      collectedEvents.push(ev);
      if (eventListener) {
        eventListener(ev);
      }
    });

    // 1. Request Validation
    if (!request.message || typeof request.message !== 'string' || !request.message.trim()) {
      throw NovaError.badRequest('Message content cannot be empty.');
    }
    const cleanMessage = request.message.trim();
    const currency: Currency = request.currency || 'USD';

    try {
      // 2. Event: Thinking (Intent understanding & memory lookup)
      eventStream.emitThinking('intent_understanding', 'Analyzing natural language requirements and parsing trip profile...');

      // 3. Multi-turn Context Loading & Authentication Check
      const context = await ConversationManager.getOrCreateConversation(
        request.conversationId,
        request.userId,
        request.supabaseClient,
        10 // Bounded to last 10 messages
      );

      // 4. Structured Trip Profile Extraction
      const structuredProfile = TripProfileExtractor.extract(cleanMessage);

      // 5. Persist Incoming User Message
      await ConversationManager.recordUserMessage(context, cleanMessage, request.supabaseClient);

      // 6. Build LLM Conversation Context
      const systemPrompt = this.buildSystemPrompt(structuredProfile, currency);
      const conversationHistory = ConversationManager.formatForLLM(context.messages);

      const messagesForLLM: LLMMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: cleanMessage },
      ];

      // 7. Tool Selection & LLM Invocation Loop
      eventStream.emitThinking('tool_selection', 'Querying LLM provider for analytical reasoning and tool planning...');
      const availableTools = this.registry.getToolDefinitions();

      let llmTurn = await this.llmProvider.chat(messagesForLLM, availableTools);
      let toolsExecutedCount = 0;
      let finalAssistantContent = llmTurn.content || '';
      const toolResultsAcc: LLMToolResult[] = [];

      // If the LLM requested tool execution
      if (llmTurn.toolCalls && llmTurn.toolCalls.length > 0) {
        for (const call of llmTurn.toolCalls) {
          toolsExecutedCount++;
          eventStream.emitToolRunning(call.name, call.id, call.arguments);

          const toolContext = {
            conversationId: context.conversation.id,
            userId: request.userId,
            currency,
            supabaseClient: request.supabaseClient,
          };

          const executionResult = await this.registry.execute(call.name, call.arguments, toolContext);
          eventStream.emitToolDone(call.name, call.id, executionResult.summary, executionResult.resultCount, executionResult.data);

          toolResultsAcc.push({
            toolCallId: call.id,
            name: call.name,
            result: executionResult.data,
          });
        }

        // Send tool results back to LLM for final synthesis
        messagesForLLM.push({
          role: 'assistant',
          content: llmTurn.content || '',
          toolCalls: llmTurn.toolCalls,
        });

        messagesForLLM.push({
          role: 'tool',
          content: 'Tool execution completed.',
          toolResults: toolResultsAcc,
        });

        eventStream.emitThinking('grounded_synthesis', 'Synthesizing verified tool results into conversational recommendation...');
        const finalTurn = await this.llmProvider.chat(messagesForLLM);
        finalAssistantContent = finalTurn.content || finalAssistantContent;
      }

      // 8. Stream Final Answer
      eventStream.emitAnswer(finalAssistantContent, true);

      // 9. Persist Assistant Response & Tool Records
      await ConversationManager.recordAssistantTurn(
        context,
        finalAssistantContent,
        llmTurn.toolCalls,
        toolResultsAcc.length > 0 ? toolResultsAcc : undefined,
        { structuredProfile },
        request.supabaseClient
      );

      // 10. Done Event
      eventStream.emitDone(context.conversation.id, toolsExecutedCount, llmTurn.usage?.totalTokens);

      return {
        conversationId: context.conversation.id,
        response: finalAssistantContent,
        structuredProfile,
        toolStepsExecuted: toolsExecutedCount,
        events: collectedEvents,
      };
    } catch (err: any) {
      const novaErr = err instanceof NovaError ? err : NovaError.internal(err.message);
      eventStream.emitError(novaErr.code, novaErr.message);
      throw novaErr;
    }
  }
}
