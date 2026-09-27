import {
  AIMessage,
  AIProvider,
  AIResponse,
  AgentToolDefinition,
  ModelRole,
} from '../ai/types';
import { ragService } from '../ragEngine';
import { nlpIntentEngine } from '../nlpIntentEngine';

export class LocalFallbackProvider implements AIProvider {
  public readonly id = 'local' as const;
  public readonly name = 'TuniTrip Local Fallback';

  public isAvailable(): boolean {
    return true; // Always available offline
  }

  public supports(_feature: 'web_search' | 'tool_call' | 'structured_output' | 'grounding'): boolean {
    return false;
  }

  public async generate(
    messages: AIMessage[],
    options?: { role?: ModelRole }
  ): Promise<AIResponse> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const lower = lastUserMessage.toLowerCase();

    // Fast Chat response for greetings
    if (
      lower.includes('hello') ||
      lower.includes('hi ') ||
      lower === 'hi' ||
      lower.includes('hey') ||
      lower.includes('salam')
    ) {
      return {
        content: `As-salamu alaykum! Welcome to TuniTrip. I am your autonomous AI travel advisor for Tunisia. Whether you want to explore the ruins of Carthage, unwind in Sidi Bou Said, plan a family adventure at Carthage Land, or embark on a Sahara desert expedition, tell me what you're dreaming of and I'll craft the perfect journey!`,
        role: 'assistant',
        provider: 'local',
        model: 'local-rag-v1',
      };
    }

    // Capital question
    if (lower.includes('capital of tunisia')) {
      return {
        content: `The capital of Tunisia is **Tunis**. It is the country's largest city and cultural heart, home to the UNESCO-listed ancient Medina, the world-renowned Bardo National Museum, and nearby coastal jewels like Carthage and Sidi Bou Said.`,
        role: 'assistant',
        provider: 'local',
        model: 'local-rag-v1',
      };
    }

    // Who built El Jem
    if (lower.includes('el jem') || lower.includes('amphitheatre')) {
      return {
        content: `The Amphitheatre of El Jem was built by the Roman Empire around **238 AD** under the direction of Proconsul Gordian (who briefly became Emperor Gordian I). It is one of the best-preserved and largest Roman stone amphitheaters in the world (3rd largest after Rome and Capua), designated a UNESCO World Heritage site.`,
        role: 'assistant',
        provider: 'local',
        model: 'local-rag-v1',
      };
    }

    // Carthage history
    if (lower.includes('history of carthage') || lower.includes('who was hannibal')) {
      return {
        content: `**Carthage** was founded in the 9th century BC by Phoenician settlers led by Queen Dido. It grew into a formidable maritime empire dominating the western Mediterranean. Its legendary general, **Hannibal Barca**, famously marched war elephants across the Alps during the Second Punic War (218–201 BC) to challenge Rome.\n\nAfter its destruction in 146 BC, Rome rebuilt it as Roman Carthage, creating marvels like the Antonine Baths. Today, it is an evocative UNESCO World Heritage site just 20 minutes from central Tunis.`,
        role: 'assistant',
        provider: 'local',
        model: 'local-rag-v1',
      };
    }

    // Query RAG for domain knowledge
    const ragResults = ragService.search({ query: lastUserMessage, limit: 3 });
    if (ragResults.length > 0) {
      const best = ragResults[0];
      return {
        content: `Based on our curated Tunisia knowledge base:\n\n**${best.title}** (${best.city})\n${best.fullDescription}\n\n*Note: Operating in local offline mode. Live external verification is currently unavailable.*`,
        role: 'assistant',
        provider: 'local',
        model: 'local-rag-v1',
      };
    }

    return {
      content: `I have analyzed your request using TuniTrip's local knowledgebase. While live web connections are currently unavailable, Tunisia offers magnificent destinations ranging from coastal Hammamet to the UNESCO ruins of Carthage and the golden sands of Djerba. Please let me know how many days and travelers you have, and I will calculate a tailored itinerary and budget!`,
      role: 'assistant',
      provider: 'local',
      model: 'local-rag-v1',
    };
  }

  public async toolCall(
    messages: AIMessage[],
    _tools: AgentToolDefinition[],
    options?: { role?: ModelRole }
  ): Promise<AIResponse> {
    return this.generate(messages, options);
  }

  public async structuredOutput<T>(
    messages: AIMessage[],
    _schema: Record<string, unknown>,
    _options?: { role?: ModelRole }
  ): Promise<T> {
    const text = messages.find((m) => m.role === 'user')?.content || '';
    const profile = nlpIntentEngine.extractTripProfile(text);
    return profile as unknown as T;
  }
}
