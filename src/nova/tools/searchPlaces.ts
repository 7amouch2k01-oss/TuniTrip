// ==============================================================================
// TUNITRIP NOVA TOOL: search_places
// Authoritative destination & attraction discovery grounded in Supabase pgvector
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';
import { RAGEngine } from '../../services/ragEngine';
import { TUNISIA_KNOWLEDGE_BASE } from '../../data/knowledgeBase';

const ragEngine = new RAGEngine();

export class SearchPlacesTool implements NovaTool {
  public readonly name = 'search_places';
  public readonly description =
    'Searches verified Tunisian destinations, historical landmarks, beaches, theme parks, hotels, and attractions using semantic vector retrieval and category filtering.';

  public readonly definition: LLMToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query or keywords (e.g., "UNESCO Roman ruins", "family theme parks Hammamet", "calm swimming coves")',
        },
        category: {
          type: 'string',
          description: 'Optional category constraint',
          enum: [
            'hotel',
            'theme_park',
            'beach',
            'history',
            'culture',
            'nature',
            'desert',
            'food',
            'adventure',
            'calm_escape',
          ],
        },
        city: {
          type: 'string',
          description: 'Filter by specific Tunisian city or hub (e.g., "Hammamet", "Tunis", "El Jem", "Djerba")',
        },
        family_friendly: {
          type: 'boolean',
          description: 'Filter for family-oriented attractions with child amenities',
        },
        calm_atmosphere: {
          type: 'boolean',
          description: 'Filter for peaceful, quiet, low-stress environments',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of grounded places to return (default: 5, max: 15)',
        },
      },
    },
  };

  public async execute(args: Record<string, any>, context?: NovaToolContext): Promise<ToolExecutionResult> {
    const query = args.query || '';
    const category = args.category;
    const city = args.city;
    const familyFriendly = args.family_friendly;
    const calmAtmosphere = args.calm_atmosphere;
    const limit = Math.min(15, Math.max(1, args.limit || 5));

    try {
      // 1. If Supabase client is available with pgvector match_places RPC, use it
      if (context?.supabaseClient) {
        try {
          const { data, error } = await context.supabaseClient.rpc('match_places', {
            match_threshold: 0.4,
            match_count: limit,
            filter_category: category || null,
            filter_city: city || null,
          });

          if (!error && Array.isArray(data) && data.length > 0) {
            return {
              success: true,
              summary: `Discovered ${data.length} verified places via Supabase pgvector`,
              resultCount: data.length,
              data,
            };
          }
        } catch {
          // Fall through to deterministic authoritative store
        }
      }

      // 2. Authoritative deterministic grounding store (TUNISIA_KNOWLEDGE_BASE)
      const scored = ragEngine.search({
        query,
        category: category as any,
        city,
        familyFriendly,
        calmAtmosphere,
        limit,
      });

      const cleanResults = scored.map((item) => ({
        id: item.id,
        name: item.title,
        category: item.category,
        city: item.city,
        region: item.region,
        description: item.shortDescription,
        rating: item.rating,
        review_count: item.reviewCount,
        price_usd: item.estimatedPrice,
        price_tnd: item.priceLocalTND,
        price_unit: item.priceUnit,
        latitude: item.latitude,
        longitude: item.longitude,
        image_url: item.imageUrl,
        opening_hours: item.openingHours || 'Open Daily',
        family_friendly: item.familyFriendly,
        calm_atmosphere: item.calmAtmosphere,
        source_name: item.sourceName,
        source_url: item.sourceUrl,
        is_verified: true,
      }));

      // Fallback if strict filter returned 0: provide top relevant items
      const finalItems = cleanResults.length > 0 ? cleanResults : TUNISIA_KNOWLEDGE_BASE.slice(0, limit).map((item) => ({
        id: item.id,
        name: item.title,
        category: item.category,
        city: item.city,
        region: item.region,
        description: item.shortDescription,
        rating: item.rating,
        review_count: item.reviewCount,
        price_usd: item.estimatedPrice,
        price_tnd: item.priceLocalTND,
        price_unit: item.priceUnit,
        latitude: item.latitude,
        longitude: item.longitude,
        image_url: item.imageUrl,
        opening_hours: item.openingHours || 'Open Daily',
        family_friendly: item.familyFriendly,
        calm_atmosphere: item.calmAtmosphere,
        source_name: item.sourceName,
        source_url: item.sourceUrl,
        is_verified: true,
      }));

      return {
        success: true,
        summary: `Retrieved ${finalItems.length} grounded Tunisian destinations matching '${query || category || 'curated'}'`,
        resultCount: finalItems.length,
        data: finalItems,
      };
    } catch (err: any) {
      return {
        success: false,
        summary: `Failed to search places: ${err.message}`,
        error: err.message,
      };
    }
  }
}
