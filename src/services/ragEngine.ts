import { PlaceItem, PlaceCategory, TripProfile } from '../types';
import { TUNISIA_KNOWLEDGE_BASE } from '../data/knowledgeBase';

export interface RAGSearchOptions {
  query?: string;
  category?: PlaceCategory | 'all';
  city?: string;
  maxPriceUSD?: number;
  familyFriendly?: boolean;
  calmAtmosphere?: boolean;
  limit?: number;
}

export interface ScoredPlaceItem extends PlaceItem {
  relevanceScore: number;
  matchedKeywords: string[];
}

export class RAGEngine {
  private items: PlaceItem[] = TUNISIA_KNOWLEDGE_BASE;

  // Synonyms and semantic expansions for Tunisia travel
  private synonymMap: Record<string, string[]> = {
    games: ['theme_park', 'carthage land', 'rollercoaster', 'rides', 'entertainment', 'kids', 'arcade'],
    disneyland: ['carthage land', 'theme park', 'amusement park', 'rollercoaster', 'rides'],
    carthage: ['carthage land', 'archaeological', 'ruins', 'antonine baths', 'punic', 'byrsa'],
    swimming: ['beach', 'sea', 'pool', 'lagoon', 'plage', 'aquasplash', 'water', 'shallow'],
    history: ['unesco', 'ruins', 'amphitheatre', 'medina', 'ribat', 'museum', 'roman', 'byzantine', 'punic'],
    calm: ['quiet', 'peaceful', 'tranquil', 'terrace', 'bougainvillea', 'sheltered', 'gentle', 'serenity'],
    family: ['familyfriendly', 'connecting rooms', 'kids club', 'slides', 'children', 'suites'],
    beach: ['corniche', 'sand', 'swimming', 'turquoise', 'mediterranean', 'seaside'],
    food: ['couscous', 'tajine', 'oud', 'dining', 'bambalouni', 'mint tea', 'restaurant'],
  };

  /**
   * Semantic search over the Tunisia knowledge base
   */
  public search(options: RAGSearchOptions, profile?: TripProfile): ScoredPlaceItem[] {
    const query = (options.query || '').toLowerCase().trim();
    const queryTokens = query ? query.split(/[\s,.-]+/).filter((t) => t.length > 2) : [];

    // Expand tokens with domain synonyms
    const expandedTokens = new Set<string>(queryTokens);
    for (const token of queryTokens) {
      for (const [key, synonyms] of Object.entries(this.synonymMap)) {
        if (key.includes(token) || token.includes(key)) {
          synonyms.forEach((s) => expandedTokens.add(s.toLowerCase()));
        }
      }
    }

    const scoredItems: ScoredPlaceItem[] = this.items.map((item) => {
      let score = 0;
      const matchedKeywords: string[] = [];

      // Filter constraints
      if (options.category && options.category !== 'all' && item.category !== options.category) {
        return { ...item, relevanceScore: -1, matchedKeywords: [] };
      }

      if (options.city && options.city.toLowerCase() !== 'all' && !item.city.toLowerCase().includes(options.city.toLowerCase())) {
        score -= 20;
      }

      if (options.maxPriceUSD && item.estimatedPrice > options.maxPriceUSD) {
        score -= 30;
      }

      if (options.familyFriendly && !item.familyFriendly) {
        score -= 25;
      }

      if (options.calmAtmosphere && !item.calmAtmosphere) {
        score -= 15;
      }

      // Profile alignment bonus
      if (profile) {
        if (profile.tripType === 'Family' && item.familyFriendly) score += 35;
        if (profile.interests.some((i) => i.toLowerCase().includes('game') || i.toLowerCase().includes('disney') || i.toLowerCase().includes('carthage land')) && item.category === 'theme_park') {
          score += 50;
        }
        if (profile.interests.some((i) => i.toLowerCase().includes('swim')) && (item.category === 'beach' || (item.amenities && item.amenities.some((a) => a.toLowerCase().includes('pool'))))) {
          score += 40;
        }
        if (profile.interests.some((i) => i.toLowerCase().includes('history')) && (item.category === 'history' || item.category === 'culture')) {
          score += 45;
        }
        if (profile.interests.some((i) => i.toLowerCase().includes('calm')) && item.calmAtmosphere) {
          score += 35;
        }
      }

      // Text semantic matching across title, descriptions, city, amenities, source
      const itemCorpus = `${item.title} ${item.shortDescription} ${item.fullDescription} ${item.city} ${item.region} ${(item.amenities || []).join(' ')} ${item.sourceName}`.toLowerCase();

      // Check direct and expanded tokens
      expandedTokens.forEach((token) => {
        if (itemCorpus.includes(token)) {
          score += 15;
          if (queryTokens.includes(token)) {
            score += 25; // Direct user token bonus
            matchedKeywords.push(token);
          }
        }
      });

      // Special boost for Carthage Land when user requests theme parks / Disney / games
      if (
        (query.includes('carthage land') || query.includes('disney') || query.includes('game') || query.includes('park')) &&
        item.id === 'carthage-land-hammamet'
      ) {
        score += 80;
        matchedKeywords.push('theme park match');
      }

      // Boost for high rating
      score += (item.rating - 4.0) * 10;

      return {
        ...item,
        relevanceScore: Math.round(score),
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      };
    });

    const results = scoredItems
      .filter((item) => item.relevanceScore >= 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (options.limit) {
      return results.slice(0, options.limit);
    }
    return results;
  }

  public getById(id: string): PlaceItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  public getAll(): PlaceItem[] {
    return [...this.items];
  }

  public getByCity(city: string): PlaceItem[] {
    return this.items.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  }

  public getByCategory(category: PlaceCategory): PlaceItem[] {
    return this.items.filter((item) => item.category === category);
  }
}

export const ragService = new RAGEngine();
