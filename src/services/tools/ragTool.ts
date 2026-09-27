import { AgentTool, AgentToolDefinition, AgentToolResult, EvidenceItem, ToolContext } from '../ai/types';
import { ragService } from '../ragEngine';
import { EvidenceNormalizer } from '../research/evidenceNormalizer';

export class RagTool implements AgentTool {
  public readonly name = 'rag_search';
  public readonly description = 'Retrieve curated internal knowledge on Tunisian cultural heritage, UNESCO monuments, destinations, and local travel tips.';
  public readonly definition: AgentToolDefinition = {
    name: 'rag_search',
    description: 'Hybrid semantic and keyword retrieval across the curated Tunisia knowledge base.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g. "Carthage Roman history", "El Jem amphitheatre", "Medina of Tunis").',
        },
        limit: {
          type: 'number',
          description: 'Maximum items to retrieve (default: 5).',
        },
      },
      required: ['query'],
    },
  };

  public async execute(input: Record<string, unknown>, _context: ToolContext): Promise<AgentToolResult> {
    const query = String(input.query || 'Tunisia');
    const limit = typeof input.limit === 'number' ? input.limit : 5;

    const scored = ragService.search({ query, limit });
    const evidence: EvidenceItem[] = scored.map((item) =>
      EvidenceNormalizer.normalizePlace({
        id: item.id,
        name: item.title,
        description: item.fullDescription,
        city: item.city,
        source: item.sourceName || 'Tunisian National Heritage Institute (INP)',
        sourceUrl: item.sourceUrl || 'https://whc.unesco.org',
        sourceType: item.category === 'history' || item.category === 'culture' ? 'unesco' : 'curated_rag',
        category: item.category,
        latitude: item.latitude,
        longitude: item.longitude,
        rating: item.rating,
        reviewCount: item.reviewCount,
        price: item.estimatedPrice,
        currency: 'USD',
        priceType: 'estimated',
        confidence: 0.95,
        rawProvider: 'hybrid_rag_engine',
      })
    );

    return {
      success: true,
      toolName: this.name,
      data: { query, results: scored, count: scored.length },
      evidence,
      sources: evidence.map((e) => ({
        name: e.source,
        url: e.sourceUrl,
        context: `${e.title} (${e.location})`,
        retrievedAt: e.retrievedAt,
      })),
    };
  }
}
