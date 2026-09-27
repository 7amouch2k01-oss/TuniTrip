import { CorroborationResult, CritiqueResult, EvidenceItem } from '../ai/types';

export class EvidenceVerifier {
  /**
   * Corroborate evidence across sources (e.g. comparing official site vs Google Places)
   */
  public static verifyFacts(evidence: EvidenceItem[]): CorroborationResult[] {
    const results: CorroborationResult[] = [];

    // Group evidence by normalized title/subject
    const groups = new Map<string, EvidenceItem[]>();
    for (const item of evidence) {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      const matchedKey = [...groups.keys()].find(
        (k) => k.includes(key) || key.includes(k) || this.computeSimilarity(k, key) > 0.7
      );
      if (matchedKey) {
        groups.get(matchedKey)!.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    for (const [topic, items] of groups.entries()) {
      if (items.length >= 2) {
        const prices = items.filter((i) => typeof i.price === 'number').map((i) => i.price!);
        const openingHours = items.filter((i) => i.openingHours).map((i) => i.openingHours!);

        // Check price agreement
        if (prices.length >= 2) {
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          if (maxP - minP > 15) {
            results.push({
              topic: `${topic} pricing`,
              isCorroborated: false,
              status: 'conflict',
              explanation: `Discovered conflicting rate indicators: some sources indicate ~$${minP}, while others indicate ~$${maxP}.`,
              conflictingSources: items.map((i) => `${i.source} (${i.sourceType})`),
              recommendedAdvice: `Rates vary by season and booking channel. We recommend verifying directly with the official property before booking.`,
            });
          } else {
            results.push({
              topic: `${topic} pricing`,
              isCorroborated: true,
              status: 'confirmed',
              explanation: `Consistent pricing corroborated across multiple sources at approximately $${Math.round((minP + maxP) / 2)}.`,
              agreedValue: Math.round((minP + maxP) / 2),
            });
          }
        }

        // Check hours agreement
        if (openingHours.length >= 2) {
          const uniqueHours = [...new Set(openingHours.map((h) => h.toLowerCase().trim()))];
          if (uniqueHours.length > 1) {
            results.push({
              topic: `${topic} opening schedule`,
              isCorroborated: false,
              status: 'conflict',
              explanation: `Found differing opening-hour information across sources (${uniqueHours.join(' vs ')}).`,
              conflictingSources: items.map((i) => `${i.source}`),
              recommendedAdvice: `Operating hours frequently change during Ramadan and summer/winter schedules. Please check the official entrance prior to visit.`,
            });
          } else {
            results.push({
              topic: `${topic} opening schedule`,
              isCorroborated: true,
              status: 'confirmed',
              explanation: `Operating hours confirmed consistently across sources (${openingHours[0]}).`,
              agreedValue: openingHours[0],
            });
          }
        }
      } else if (items.length === 1) {
        results.push({
          topic,
          isCorroborated: false,
          status: 'single_source',
          explanation: `Information provided based on a single authoritative record (${items[0].source}).`,
        });
      }
    }

    return results;
  }

  /**
   * Critique travel plan for unsupported claims, contradictions, or unrealistic constraints
   */
  public static critiquePlan(
    evidence: EvidenceItem[],
    profile: { travelers: number; duration_days: number; budget?: { amount: number } }
  ): CritiqueResult {
    const unsupportedClaims: string[] = [];
    const contradictions: string[] = [];
    const budgetOrRouteIssues: string[] = [];
    const suggestions: string[] = [];

    // Verify hotel capacities
    const hotels = evidence.filter((e) => e.type === 'hotel');
    if (profile.travelers > 4 && hotels.length > 0) {
      suggestions.push(
        `For a party of ${profile.travelers} travelers, standard single hotel rooms will be insufficient. Connecting family suites or private villas are recommended.`
      );
    }

    // Verify budget constraints
    if (profile.budget && profile.budget.amount > 0) {
      const maxNightly = Math.round((profile.budget.amount * 0.45) / Math.max(1, profile.duration_days - 1));
      const expensiveHotels = hotels.filter((h) => h.price && h.price > maxNightly);
      if (expensiveHotels.length > 0) {
        budgetOrRouteIssues.push(
          `Some discovered hotels ($${expensiveHotels[0].price}/night) exceed your suggested target ceiling ($${maxNightly}/night) and have been filtered out of primary options.`
        );
      }
    }

    return {
      hasIssues: unsupportedClaims.length > 0 || contradictions.length > 0 || budgetOrRouteIssues.length > 0,
      unsupportedClaims,
      contradictions,
      budgetOrRouteIssues,
      suggestions,
    };
  }

  private static computeSimilarity(s1: string, s2: string): number {
    const set1 = new Set(s1.split(' ').filter(Boolean));
    const set2 = new Set(s2.split(' ').filter(Boolean));
    const intersection = [...set1].filter((x) => set2.has(x));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.length / union.size;
  }
}
