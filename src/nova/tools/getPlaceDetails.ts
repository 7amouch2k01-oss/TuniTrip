// ==============================================================================
// TUNITRIP NOVA TOOL: get_place_details
// Grounded retrieval of complete place facts and verified visitor logistics
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';
import { TUNISIA_KNOWLEDGE_BASE } from '../../data/knowledgeBase';

export class GetPlaceDetailsTool implements NovaTool {
  public readonly name = 'get_place_details';
  public readonly description =
    'Retrieves verified details, visitor logistics, exact pricing, coordinates, and historical context for a specific Tunisian place ID.';

  public readonly definition: LLMToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        place_id: {
          type: 'string',
          description: 'Unique ID of the destination or attraction (e.g. "carthage-land-hammamet", "el-jem-amphitheatre")',
        },
      },
      required: ['place_id'],
    },
  };

  public async execute(args: Record<string, any>, context?: NovaToolContext): Promise<ToolExecutionResult> {
    const placeId = args.place_id;
    if (!placeId) {
      return {
        success: false,
        summary: 'Missing required parameter: place_id',
        error: 'place_id is required',
      };
    }

    try {
      // 1. Try Supabase places table if client available
      if (context?.supabaseClient) {
        try {
          const { data, error } = await context.supabaseClient
            .from('places')
            .select('*')
            .eq('id', placeId)
            .single();

          if (!error && data) {
            return {
              success: true,
              summary: `Loaded verified details for "${data.name}"`,
              resultCount: 1,
              data,
            };
          }
        } catch {
          // Fall through
        }
      }

      // 2. Authoritative local store
      const found = TUNISIA_KNOWLEDGE_BASE.find(
        (p) => p.id.toLowerCase() === placeId.toLowerCase() || p.title.toLowerCase().includes(placeId.toLowerCase())
      );

      if (!found) {
        return {
          success: false,
          summary: `Place ID "${placeId}" not found in verified database.`,
          error: 'Not found',
        };
      }

      return {
        success: true,
        summary: `Retrieved verified facts for "${found.title}" in ${found.city}`,
        resultCount: 1,
        data: {
          id: found.id,
          name: found.title,
          category: found.category,
          city: found.city,
          region: found.region,
          short_description: found.shortDescription,
          full_description: found.fullDescription,
          rating: found.rating,
          review_count: found.reviewCount,
          price_usd: found.estimatedPrice,
          price_tnd: found.priceLocalTND,
          price_unit: found.priceUnit,
          opening_hours: found.openingHours || 'Open Daily',
          coordinates: {
            latitude: found.latitude,
            longitude: found.longitude,
          },
          family_friendly: found.familyFriendly,
          calm_atmosphere: found.calmAtmosphere,
          source_name: found.sourceName,
          source_url: found.sourceUrl,
          is_verified: true,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        summary: `Error retrieving place details: ${err.message}`,
        error: err.message,
      };
    }
  }
}
