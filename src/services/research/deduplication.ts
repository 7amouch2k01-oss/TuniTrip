import { EvidenceItem } from '../ai/types';

export class DeduplicationEngine {
  /**
   * Merges duplicate evidence items across providers by normalized name & coordinates.
   * Preserves the highest confidence and highest source priority.
   */
  public static deduplicate(items: EvidenceItem[]): {
    deduplicated: EvidenceItem[];
    mergedCount: number;
  } {
    const uniqueMap = new Map<string, EvidenceItem>();
    let mergedCount = 0;

    for (const item of items) {
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/hotel|resort|thalassa|restaurant|cafe|plage|beach|site|parc|park/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();

      // Check if another item with similar name exists
      let matchedKey: string | null = null;
      for (const key of uniqueMap.keys()) {
        if (key === normalizedTitle || (key.length > 5 && (key.includes(normalizedTitle) || normalizedTitle.includes(key)))) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        mergedCount++;
        const existing = uniqueMap.get(matchedKey)!;
        // Merge attributes, preferring official source and higher confidence
        const preferredSource = this.getSourcePriority(item.sourceType) > this.getSourcePriority(existing.sourceType) ? item : existing;
        uniqueMap.set(matchedKey, {
          ...existing,
          ...item,
          title: preferredSource.title,
          source: preferredSource.source,
          sourceUrl: preferredSource.sourceUrl,
          sourceType: preferredSource.sourceType,
          confidence: Math.max(existing.confidence, item.confidence),
          rating: item.rating || existing.rating,
          reviewCount: Math.max(existing.reviewCount || 0, item.reviewCount || 0),
          price: item.price || existing.price,
          openingHours: item.openingHours || existing.openingHours,
        });
      } else {
        uniqueMap.set(normalizedTitle || item.id, item);
      }
    }

    return {
      deduplicated: Array.from(uniqueMap.values()),
      mergedCount,
    };
  }

  private static getSourcePriority(type?: string): number {
    switch (type) {
      case 'official_gov':
      case 'unesco':
        return 10;
      case 'official_business':
        return 9;
      case 'google_places':
        return 8;
      case 'reputable_travel':
        return 7;
      case 'curated_rag':
        return 6;
      case 'web_search':
        return 5;
      default:
        return 1;
    }
  }
}
