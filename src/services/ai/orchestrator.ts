import {
  AgentStructuredResponse,
  ChatMessage,
  Currency,
  ItineraryDay,
  NormalizedPlaceItem,
  PlaceItem,
  PlanMode,
  ProactiveInsight,
  StructuredTripProfile,
  ToolExecutionStep,
  TripProfile,
} from '../../types';
import {
  AIMessage,
  AgentTool,
  CorroborationResult,
  CritiqueResult,
  EvidenceItem,
  OrchestratorLogEntry,
  ProviderId,
  SearchClassification,
  ToolContext,
} from './types';
import { providerRouter, ProviderRouter } from './providerRouter';
import { QueryPlanner } from '../research/queryPlanner';
import { DeduplicationEngine } from '../research/deduplication';
import { EvidenceVerifier } from '../research/evidenceVerifier';
import { EvidenceRankingEngine } from '../research/ranking';
import { createDefaultAgentTools } from '../tools';
import { itineraryService } from '../itineraryEngine';
import { budgetService } from '../budgetEngine';
import { nlpIntentEngine } from '../nlpIntentEngine';

export class AIOrchestrator {
  private router: ProviderRouter;
  private tools: Map<string, AgentTool> = new Map();
  private logs: OrchestratorLogEntry[] = [];

  constructor(router: ProviderRouter = providerRouter, tools: AgentTool[] = createDefaultAgentTools()) {
    this.router = router;
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  public getLogs(): OrchestratorLogEntry[] {
    return [...this.logs];
  }

  /**
   * CENTRAL AUTONOMOUS RESEARCH PIPELINE
   */
  public async orchestrate(
    userMessage: string,
    history: ChatMessage[] = [],
    currentProfile: TripProfile,
    onStepUpdate?: (step: ToolExecutionStep) => void
  ): Promise<{
    response: AgentStructuredResponse;
    log: OrchestratorLogEntry;
  }> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const errors: string[] = [];
    const fallbacks: string[] = [];
    const providersUsed: ProviderId[] = [];
    const rawEvidence: EvidenceItem[] = [];
    const sourcesCollected: Array<{ name: string; url: string; context: string; retrievedAt?: string }> = [];

    // 1. INTENT & COMPLEXITY ROUTER
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'intent_router',
        status: 'running',
        summary: 'Understanding request intent and determining research requirements...',
      });
    }

    const plan: SearchClassification = QueryPlanner.plan(userMessage);

    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'intent_router',
        status: 'completed',
        summary: `Intent: ${plan.intent} (${plan.complexity} complexity) — ${plan.explanation}`,
      });
    }

    // =========================================================================
    // CASE A: FAST CHAT / SIMPLE GREETING (ZERO UNNECESSARY RESEARCH)
    // =========================================================================
    if (plan.intent === 'greeting' && !plan.needs_web && !plan.needs_places && !plan.needs_rag) {
      const messages: AIMessage[] = [
        ...history.slice(-4).map((h) => ({
          role: h.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: h.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const { response: aiRes, providersAttempted, usedFallback } = await this.router.generateWithFallback(messages, {
        role: 'FAST_CHAT',
        temperature: 0.5,
      });

      providersUsed.push(...providersAttempted);
      if (usedFallback) fallbacks.push(...providersAttempted.slice(1));

      const log: OrchestratorLogEntry = {
        requestId,
        timestamp: new Date().toISOString(),
        userMessage,
        intent: plan.intent,
        complexity: plan.complexity,
        selectedTools: [],
        providersUsed,
        queries: [],
        latencyMs: Date.now() - startTime,
        evidenceCount: 0,
        errors: [],
        fallbacks,
        finalSources: [],
      };
      this.logs.push(log);

      return {
        response: {
          messageText: aiRes.content,
          profile: currentProfile,
          suggestedPrompts: [
            'Plan a 7-day family trip to Tunisia ($2450)',
            'Find a beachfront hotel in Hammamet with pool',
            'What is the weather in Djerba tomorrow?',
            'What is Carthage Land admission fee?',
          ],
        },
        log,
      };
    }

    // =========================================================================
    // CASE B: TOOL SELECTION & PARALLEL EXECUTION
    // =========================================================================
    const toolsToExecute: AgentTool[] = [];
    if (plan.needs_weather && this.tools.has('weather')) toolsToExecute.push(this.tools.get('weather')!);
    if (plan.needs_exchange_rate && this.tools.has('exchange_rate')) toolsToExecute.push(this.tools.get('exchange_rate')!);
    if (plan.needs_places && this.tools.has('google_places_search')) toolsToExecute.push(this.tools.get('google_places_search')!);
    if (plan.needs_web && this.tools.has('web_search')) toolsToExecute.push(this.tools.get('web_search')!);
    if (plan.needs_rag && this.tools.has('rag_search')) toolsToExecute.push(this.tools.get('rag_search')!);
    if (plan.needs_maps && this.tools.has('route_matrix')) toolsToExecute.push(this.tools.get('route_matrix')!);

    const toolContext: ToolContext = {
      requestId,
      profile: currentProfile,
      currency: currentProfile.currency,
    };

    if (toolsToExecute.length > 0 && onStepUpdate) {
      onStepUpdate({
        toolName: 'parallel_research',
        status: 'running',
        summary: `Executing parallel research across ${toolsToExecute.map((t) => t.name).join(', ')}...`,
      });
    }

    // Execute all tools concurrently via Promise.allSettled
    const toolPromises = toolsToExecute.map(async (tool) => {
      try {
        let input: Record<string, unknown> = { query: plan.targetQueries[0] || userMessage };
        if (tool.name === 'weather') {
          input = { city: userMessage };
        } else if (tool.name === 'exchange_rate') {
          input = { baseCurrency: currentProfile.currency || 'USD' };
        } else if (tool.name === 'route_matrix') {
          input = { origin: 'Tunis', destination: 'Hammamet' };
        }

        const res = await tool.execute(input, toolContext);
        if (res.success) {
          if (res.evidence) rawEvidence.push(...res.evidence);
          if (res.sources) sourcesCollected.push(...res.sources);
        } else if (res.error) {
          errors.push(`${tool.name}: ${res.error}`);
        }
      } catch (err: any) {
        errors.push(`${tool.name} failed: ${err?.message || err}`);
      }
    });

    await Promise.allSettled(toolPromises);

    if (toolsToExecute.length > 0 && onStepUpdate) {
      onStepUpdate({
        toolName: 'parallel_research',
        status: 'completed',
        summary: `Retrieved ${rawEvidence.length} evidence records across ${toolsToExecute.length} tools.`,
      });
    }

    // =========================================================================
    // CASE C: NORMALIZATION & DEDUPLICATION
    // =========================================================================
    const { deduplicated: evidence, mergedCount } = DeduplicationEngine.deduplicate(rawEvidence);

    // =========================================================================
    // CASE D: CROSS-SOURCE VERIFICATION & CRITIQUE
    // =========================================================================
    const corroborations: CorroborationResult[] = EvidenceVerifier.verifyFacts(evidence);
    const conflicts = corroborations.filter((c) => c.status === 'conflict');

    const structuredProfile: StructuredTripProfile = nlpIntentEngine.extractTripProfile(userMessage);
    const critique: CritiqueResult = EvidenceVerifier.critiquePlan(evidence, {
      travelers: currentProfile.travelers,
      duration_days: currentProfile.durationDays,
      budget: { amount: currentProfile.budget },
    });

    // =========================================================================
    // CASE E: RANKING & TRAVEL ENGINE SYNTHESIS (IF TRIP OR PLACES INVOLVED)
    // =========================================================================
    let updatedProfile = { ...currentProfile };
    let finalItinerary: ItineraryDay[] | undefined = undefined;
    let finalBudget = undefined;
    let recommendations: PlaceItem[] = [];

    if (plan.intent === 'trip_planning' || plan.needs_places || plan.needs_maps) {
      if (onStepUpdate) {
        onStepUpdate({
          toolName: 'travel_reasoning',
          status: 'running',
          summary: 'Applying 7-factor weighted ranking, geographic clustering, and budget itemization...',
        });
      }

      // Sync extracted profile if duration/travelers/budget were provided
      if (structuredProfile.duration_days && structuredProfile.duration_days !== 7) {
        updatedProfile.durationDays = structuredProfile.duration_days;
      }
      if (structuredProfile.travelers && structuredProfile.travelers !== 4) {
        updatedProfile.travelers = structuredProfile.travelers;
      }
      if (structuredProfile.budget?.amount) {
        updatedProfile.budget = structuredProfile.budget.amount;
      }

      const { topPlaces } = EvidenceRankingEngine.rank(evidence, structuredProfile);
      recommendations = topPlaces;

      const planModes = itineraryService.generatePlanModes(updatedProfile);
      finalItinerary = planModes[0].itinerary;
      finalBudget = budgetService.calculate(finalItinerary, updatedProfile, updatedProfile.currency);

      if (onStepUpdate) {
        onStepUpdate({
          toolName: 'travel_reasoning',
          status: 'completed',
          summary: `Curated ${recommendations.length} top options and generated ${updatedProfile.durationDays}-day geographically paced route ($${finalBudget.totalEstimatedUSD} total).`,
        });
      }
    }

    // =========================================================================
    // CASE F: FINAL ANSWER GENERATION (SYNTHESIZER)
    // =========================================================================
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'evidence_synthesizer',
        status: 'running',
        summary: 'Synthesizing evidence, verifying factual accuracy, and generating response...',
      });
    }

    const synthesisContext = {
      userMessage,
      planIntent: plan.intent,
      evidenceSummary: evidence.map((e) => `[${e.type.toUpperCase()}] ${e.title} (${e.source}): ${e.description}${e.price ? ` - Price: $${e.price}` : ''}`).join('\n'),
      conflicts: conflicts.map((c) => c.explanation),
      critiqueSuggestions: critique.suggestions,
      recommendations: recommendations.map((r) => `${r.title} in ${r.city} (Rating: ${r.rating}★, Est: $${r.estimatedPrice})`),
      budgetTotal: finalBudget ? `$${finalBudget.totalEstimatedUSD}` : undefined,
    };

    const synthPrompt = `User question: "${userMessage}"
Retrieved and Verified Evidence:
${synthesisContext.evidenceSummary || 'None needed; direct authoritative answer.'}

${conflicts.length > 0 ? `Important Cross-Source Notes (Be honest about differences):\n${conflicts.map((c) => `- ${c.explanation} Advice: ${c.recommendedAdvice || ''}`).join('\n')}` : ''}

${recommendations.length > 0 ? `Curated Recommendations:\n${recommendations.map((r) => `- ${r.title} (${r.city}) - Rating: ${r.rating}★ - Price: $${r.estimatedPrice}`).join('\n')}` : ''}

Synthesize a friendly, warm, and natural travel response. Address the user directly, cite verified facts, clearly disclose any price estimates or conflicting hours, and guide them on what to do next.`;

    const { response: aiSynthesis, providersAttempted: synthProviders, usedFallback } =
      await this.router.generateWithFallback(
        [
          { role: 'system', content: 'You are TuniTrip NOVA, a trustworthy, friendly Tunisian travel companion. Synthesize evidence accurately without dumping technical logs.' },
          { role: 'user', content: synthPrompt },
        ],
        { role: 'SYNTHESIZER', temperature: 0.3 }
      );

    providersUsed.push(...synthProviders);
    if (usedFallback) fallbacks.push(...synthProviders.slice(1));

    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'evidence_synthesizer',
        status: 'completed',
        summary: `Response generated with ${sourcesCollected.length} verifiable citations.`,
      });
    }

    const proactiveInsights: ProactiveInsight[] = [];
    if (plan.intent === 'trip_planning') {
      proactiveInsights.push({
        type: 'route_synergy',
        title: 'Geographic Synergies',
        description: 'Tunis, Carthage, and Sidi Bou Said are clustered within 20 minutes drive, eliminating transit fatigue on initial days.',
      });
      proactiveInsights.push({
        type: 'family_convenience',
        title: 'Carthage Land Pass Efficiency',
        description: 'Admission includes Aqua Land water slides in a combined ticket, offering significant savings for families.',
      });
      if (finalBudget) {
        proactiveInsights.push({
          type: 'budget_warning',
          title: 'Budget Cushion',
          description: `Calculated trip total leaves a safe ${finalBudget.remainingUSD > 0 ? `$${finalBudget.remainingUSD}` : '$0'} buffer for personal dining and local shopping.`,
        });
      }
    }

    // Build unique clickable sources
    const uniqueSourcesMap = new Map<string, { name: string; url: string; context: string }>();
    for (const s of sourcesCollected) {
      if (!uniqueSourcesMap.has(s.url)) {
        uniqueSourcesMap.set(s.url, s);
      }
    }

    const log: OrchestratorLogEntry = {
      requestId,
      timestamp: new Date().toISOString(),
      userMessage,
      intent: plan.intent,
      complexity: plan.complexity,
      selectedTools: toolsToExecute.map((t) => t.name),
      providersUsed: Array.from(new Set(providersUsed)),
      queries: plan.targetQueries,
      latencyMs: Date.now() - startTime,
      evidenceCount: evidence.length,
      errors,
      fallbacks,
      finalSources: Array.from(uniqueSourcesMap.values()).map((s) => s.name),
    };
    this.logs.push(log);

    return {
      response: {
        messageText: aiSynthesis.content,
        profile: updatedProfile,
        itinerary: finalItinerary,
        budget: finalBudget,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        sources: Array.from(uniqueSourcesMap.values()),
        proactiveInsights: proactiveInsights.length > 0 ? proactiveInsights : undefined,
        suggestedPrompts: [
          'Show me everything you found',
          'Adjust hotel to beachfront only',
          'Recalculate budget in Tunisian Dinar (TND)',
          'Perfect. Book it.',
        ],
      },
      log,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
