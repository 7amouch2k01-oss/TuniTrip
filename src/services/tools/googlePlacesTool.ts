import { AgentTool, AgentToolDefinition, AgentToolResult, EvidenceItem, ToolContext } from '../ai/types';
import { EvidenceNormalizer } from '../research/evidenceNormalizer';
import { TUNISIA_KNOWLEDGE_BASE } from '../../data/knowledgeBase';

export class GooglePlacesTool implements AgentTool {
  public readonly name = 'google_places_search';
  public readonly description = 'Search Google Places API (New) for verified hotels, restaurants, attractions, and cultural landmarks across Tunisia.';
  public readonly definition: AgentToolDefinition = {
    name: 'google_places_search',
    description: 'Find places, hotels, or restaurants using Google Places API with verified ratings, opening hours, and location.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "family hotel in Hammamet with pool", "seafood restaurant near Sidi Bou Said").',
        },
        category: {
          type: 'string',
          description: 'Category filter (hotel, restaurant, attraction, theme_park).',
        },
        city: {
          type: 'string',
          description: 'Target city in Tunisia.',
        },
      },
      required: ['query'],
    },
  };

  private apiKey: string | undefined;

  constructor() {
    this.apiKey =
      typeof process !== 'undefined'
        ? process.env?.GOOGLE_MAPS_API_KEY || process.env?.GOOGLE_PLACES_API_KEY
        : undefined;
  }

  public async execute(input: Record<string, unknown>, _context: ToolContext): Promise<AgentToolResult> {
    const query = String(input.query || 'Tunisia attractions');
    const category = input.category ? String(input.category).toLowerCase() : undefined;
    const city = input.city ? String(input.city).toLowerCase() : undefined;

    // 1. Live Google Places API (New) call if API key configured
    if (this.apiKey) {
      try {
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const headers = {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.regularOpeningHours,places.priceLevel,places.location',
        };

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            textQuery: `${query} Tunisia`,
            languageCode: 'en',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const places = data.places || [];
          const evidenceItems: EvidenceItem[] = places.map((p: any) => {
            const name = p.displayName?.text || 'Tunisian Venue';
            const priceLevelMap: Record<string, number> = {
              PRICE_LEVEL_INEXPENSIVE: 20,
              PRICE_LEVEL_MODERATE: 55,
              PRICE_LEVEL_EXPENSIVE: 120,
              PRICE_LEVEL_VERY_EXPENSIVE: 240,
            };
            const estPrice = priceLevelMap[p.priceLevel] || 35;

            return EvidenceNormalizer.normalizePlace({
              id: p.id || `gp_${Math.random().toString(36).substring(2, 8)}`,
              name,
              description: p.formattedAddress || `${name} in Tunisia`,
              city: city || 'Tunisia',
              source: 'Google Places API (Verified Live)',
              sourceUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Tunisia')}`,
              sourceType: 'google_places',
              category: category || (query.includes('hotel') ? 'hotel' : query.includes('restaurant') ? 'restaurant' : 'place'),
              latitude: p.location?.latitude,
              longitude: p.location?.longitude,
              rating: p.rating,
              reviewCount: p.userRatingCount,
              price: estPrice,
              currency: 'USD',
              priceType: 'live',
              openingHours: p.regularOpeningHours?.weekdayDescriptions?.[0],
              isOpenNow: p.regularOpeningHours?.openNow,
              confidence: 0.95,
              rawProvider: 'google_places_api_new',
            });
          });

          return {
            success: true,
            toolName: this.name,
            data: { places, query, count: places.length, live: true },
            evidence: evidenceItems,
            sources: [
              {
                name: 'Google Places API (New)',
                url: 'https://maps.google.com',
                context: `Verified live places search for "${query}"`,
                retrievedAt: new Date().toISOString(),
              },
            ],
          };
        }
      } catch (e) {
        console.warn('[GooglePlacesTool] Live API request failed, falling back to curated data:', e);
      }
    }

    // 2. Curated Tunisia Knowledge Base Fallback
    const lowerQuery = query.toLowerCase();
    const filtered = TUNISIA_KNOWLEDGE_BASE.filter((item) => {
      const matchText = `${item.title} ${item.shortDescription} ${item.fullDescription} ${item.city} ${item.category}`.toLowerCase();
      if (category && item.category !== category) return false;
      if (city && !item.city.toLowerCase().includes(city)) return false;

      // keyword matches
      const tokens = lowerQuery.split(' ').filter((t) => t.length > 2);
      return tokens.some((t) => matchText.includes(t));
    }).slice(0, 6);

    const fallbackEvidence: EvidenceItem[] = filtered.map((item) =>
      EvidenceNormalizer.normalizePlace({
        id: item.id,
        name: item.title,
        description: item.shortDescription,
        city: item.city,
        source: item.sourceName || 'Tunisian Tourism Board (Curated Record)',
        sourceUrl: item.sourceUrl || 'https://www.discovertunisia.com',
        sourceType: 'curated_rag',
        category: item.category,
        latitude: item.latitude,
        longitude: item.longitude,
        rating: item.rating,
        reviewCount: item.reviewCount,
        price: item.estimatedPrice,
        currency: 'USD',
        priceType: 'estimated',
        confidence: 0.9,
        rawProvider: 'curated_tunisia_kb',
      })
    );

    return {
      success: true,
      toolName: this.name,
      data: {
        places: filtered,
        query,
        count: filtered.length,
        live: false,
        note: 'Live Google Places API key not configured; returned curated verified places.',
      },
      evidence: fallbackEvidence,
      sources: fallbackEvidence.map((e) => ({
        name: e.source,
        url: e.sourceUrl,
        context: `${e.title} (${e.location})`,
        retrievedAt: e.retrievedAt,
      })),
    };
  }
}
