import { Currency, StructuredTripProfile, ResearchSearchPlan, TripProfile, PlaceCategory } from '../types';

export class NLPIntentEngine {
  public extractTripProfile(userMessage: string): StructuredTripProfile {
    return this.extractStructuredProfile(userMessage).structuredProfile;
  }

  /**
   * Main entrypoint: Understands user message in natural language,
   * performs semantic category inference, and produces a structured trip profile.
   */
  public extractStructuredProfile(
    userMessage: string,
    existingProfile?: TripProfile | StructuredTripProfile
  ): {
    structuredProfile: StructuredTripProfile;
    isModification: boolean;
    modificationType?: 'budget' | 'travelers' | 'interest_remove' | 'location_lock' | 'pace' | 'general';
  } {
    const text = userMessage.trim();
    // Normalize commas inside formatted numbers (e.g. $3,000 -> $3000, $2,450 -> $2450)
    const normalizedText = text.replace(/(\d+),(\d+)/g, '$1$2');
    const lower = normalizedText.toLowerCase();

    // Base defaults
    let travelers = existingProfile?.travelers || 4;
    let durationDays = existingProfile ? ('durationDays' in existingProfile ? existingProfile.durationDays : existingProfile.duration_days) : 7;
    let budgetAmount = existingProfile ? (typeof existingProfile.budget === 'number' ? existingProfile.budget : existingProfile.budget.amount) : 2450;
    let currency: Currency = existingProfile ? (typeof existingProfile.budget === 'object' ? existingProfile.budget.currency : ('currency' in existingProfile ? (existingProfile as any).currency : 'USD')) : 'USD';
    let travelerType: StructuredTripProfile['traveler_type'] = existingProfile
      ? ('tripType' in existingProfile && (existingProfile as any).tripType
          ? ((existingProfile as any).tripType.toLowerCase() as any)
          : ('traveler_type' in existingProfile ? (existingProfile as any).traveler_type : 'family'))
      : 'family';
    let preferredPace: StructuredTripProfile['preferred_pace'] = 'relaxed';
    let interests: string[] = existingProfile?.interests ? [...existingProfile.interests] : [];
    let priorities: string[] = ['family-friendly', 'water activities', 'historical places', 'low-stress environments'];
    let destinationRegions: string[] = ['Hammamet', 'Tunis', 'Carthage'];

    let isModification = false;
    let modificationType: 'budget' | 'travelers' | 'interest_remove' | 'location_lock' | 'pace' | 'general' | undefined = undefined;

    // SECTION 24: Single-Variable Update Detection
    // Case A: "Keep everything, but increase the budget to $3,000" or "Change budget to 3000"
    const budgetModMatch =
      lower.match(/(?:increase|change|update|set|make|to)?\s*(?:the\s*)?budget\s*(?:to|is|of)?\s*[\$€£]?\s*(\d{3,6})/i) ||
      lower.match(/[\$€£]\s*(\d{3,6})\s*(?:budget)?/i);
    if ((lower.includes('budget') || lower.includes('increase') || lower.includes('keep everything')) && budgetModMatch) {
      budgetAmount = parseInt(budgetModMatch[1], 10);
      isModification = true;
      modificationType = 'budget';
    }

    // Case B: "We now have 5 travelers" or "Add 1 person" or "Now 5 travelers"
    const travelerModMatch = lower.match(/(?:now\s+have|now|we\s+are|change\s+to|update\s+to)\s*(\d+)\s*(?:travelers|people|guests|members|persons)/i);
    if (travelerModMatch) {
      travelers = parseInt(travelerModMatch[1], 10);
      isModification = true;
      modificationType = 'travelers';
    } else {
      // General travelers extraction from initial prompt
      const travelersMatch = text.match(/(\d+)\s*(?:people|persons|travelers|guests|members|family members)/i);
      if (travelersMatch) {
        travelers = parseInt(travelersMatch[1], 10);
      } else if (lower.includes('with 3 other') || lower.includes('3 other family members')) {
        travelers = 4; // User + 3 others = 4
      } else if (lower.includes('couple') || lower.includes('with my wife') || lower.includes('with my husband') || lower.includes('romantic')) {
        travelers = 2;
        travelerType = 'couple';
      } else if (lower.includes('solo') || lower.includes('by myself')) {
        travelers = 1;
        travelerType = 'solo';
      } else if (lower.includes('family')) {
        travelers = 4;
        travelerType = 'family';
      }
    }

    // Case C: "Same trip but remove theme parks" or "remove carthage land"
    if (lower.includes('remove') || lower.includes('without theme park') || lower.includes('no theme park')) {
      if (lower.includes('theme park') || lower.includes('carthage land') || lower.includes('games')) {
        interests = interests.filter((i) => !i.toLowerCase().includes('theme') && !i.toLowerCase().includes('carthage land') && !i.toLowerCase().includes('game'));
        priorities = priorities.filter((p) => !p.toLowerCase().includes('theme'));
        isModification = true;
        modificationType = 'interest_remove';
      }
    }

    // Extract duration
    const daysMatch = text.match(/(?:for\s+)?(\d{1,2})[\s-]*(?:days|day|nights|night)/i);
    if (daysMatch) {
      const parsed = parseInt(daysMatch[1], 10);
      if (parsed >= 1 && parsed <= 30) {
        durationDays = parsed;
      }
    } else if (lower.includes('a week') || lower.includes('one week')) {
      durationDays = 7;
    } else if (lower.includes('weekend') || lower.includes('3 days')) {
      durationDays = 3;
    }

    // Extract currency
    if (lower.includes('dollar') || lower.includes('usd') || text.includes('$')) {
      currency = 'USD';
    } else if (lower.includes('euro') || lower.includes('eur') || text.includes('€')) {
      currency = 'EUR';
    } else if (lower.includes('dinar') || lower.includes('tnd')) {
      currency = 'TND';
    } else if (lower.includes('pound') || lower.includes('gbp') || text.includes('£')) {
      currency = 'GBP';
    }

    // Extract budget from initial prompt if not a single-variable modification
    if (!isModification) {
      const explicitBudgetMatch =
        text.match(/(?:budget\s*(?:of|is|:)?\s*|\$|€|£)\s*(\d{3,5})/i) ||
        text.match(/(\d{3,5})\s*(?:dollars|usd|eur|tnd|gbp|dinars)/i) ||
        text.match(/(?:under|max|around)\s*(\d{3,5})\s*(?:dollars|usd|\$)?/i);

      if (explicitBudgetMatch) {
        const amount = parseInt(explicitBudgetMatch[1], 10);
        const isLikelyYear = amount >= 2024 && amount <= 2030 && !text.includes('$') && !lower.includes('budget') && !lower.includes('dollar');
        if (amount >= 200 && !isLikelyYear) {
          budgetAmount = amount;
        }
      }
    }

    // SECTION 3: Semantic Category Inference
    const inferredCategories: string[] = [];
    const extractedInterests: string[] = [];

    // Rule 1: "places like Disneyland" -> theme parks, amusement parks, family entertainment, rides, water parks
    if (lower.includes('disney') || lower.includes('game') || lower.includes('carthage land') || lower.includes('theme park') || lower.includes('amusement')) {
      extractedInterests.push('theme parks');
      extractedInterests.push('family entertainment');
      inferredCategories.push(
        'theme_park',
        'amusement_park',
        'family_entertainment',
        'rides',
        'water_parks',
        'children_activities',
        'interactive_attractions'
      );
      if (!priorities.includes('family-friendly')) priorities.push('family-friendly');
    }

    // Rule 2: "calm places" -> quiet beaches, relaxed coastal towns, low-noise areas, nature, peaceful accommodations
    if (lower.includes('calm') || lower.includes('quiet') || lower.includes('relax') || lower.includes('peaceful') || lower.includes('serene')) {
      extractedInterests.push('calm places');
      inferredCategories.push(
        'quiet_beaches',
        'relaxed_coastal_towns',
        'low_noise_areas',
        'nature',
        'less_nightlife',
        'slow_travel',
        'peaceful_accommodations'
      );
      preferredPace = 'relaxed';
      if (!priorities.includes('low-stress environments')) priorities.push('low-stress environments');
    }

    // Rule 3: "history" -> archaeological sites, Roman ruins, Punic sites, museums, medinas, historical monuments
    if (lower.includes('history') || lower.includes('ruin') || lower.includes('roman') || lower.includes('unesco') || lower.includes('ancient') || lower.includes('carthage')) {
      extractedInterests.push('history');
      inferredCategories.push(
        'archaeological_sites',
        'roman_ruins',
        'punic_sites',
        'museums',
        'medinas',
        'historical_monuments',
        'heritage_villages',
        'guided_cultural_experiences'
      );
      if (!priorities.includes('historical places')) priorities.push('historical places');
    }

    // Rule 4: "swimming" -> beaches, resorts, pools, water parks, snorkeling, boat trips
    if (lower.includes('swim') || lower.includes('beach') || lower.includes('sea') || lower.includes('pool') || lower.includes('water')) {
      extractedInterests.push('swimming');
      inferredCategories.push(
        'beaches',
        'resorts',
        'pools',
        'water_parks',
        'snorkeling',
        'water_sports',
        'boat_trips'
      );
      if (!priorities.includes('water activities')) priorities.push('water activities');
    }

    // Rule 5: Food & dining
    if (lower.includes('food') || lower.includes('culinary') || lower.includes('restaurant') || lower.includes('couscous') || lower.includes('seafood')) {
      extractedInterests.push('authentic cuisine');
      inferredCategories.push('medina_dining', 'fresh_seafood', 'traditional_tea_houses', 'cooking_workshops');
    }

    // Rule 6: Desert / Sahara
    if (lower.includes('desert') || lower.includes('sahara') || lower.includes('douz') || lower.includes('tozeur') || lower.includes('oasis') || lower.includes('matmata') || lower.includes('star wars')) {
      extractedInterests.push('Sahara desert & Berber culture');
      inferredCategories.push('desert_camps', 'dune_trekking', 'troglodyte_dwellings', 'oasis_canyons');
      destinationRegions = ['Tozeur', 'Douz', 'Matmata'];
    }

    // Rule 7: Djerba island
    if (lower.includes('djerba')) {
      extractedInterests.push('Djerba Island & Thalasso');
      destinationRegions = ['Djerba', 'Midoun', 'Houmt Souk'];
    }

    // Merge interests if we extracted new ones
    if (extractedInterests.length > 0 && !isModification) {
      interests = Array.from(new Set([...interests, ...extractedInterests]));
    }

    const structuredProfile: StructuredTripProfile = {
      travelers,
      duration_days: durationDays,
      destination_country: 'Tunisia',
      destination_regions: destinationRegions,
      budget: {
        amount: budgetAmount,
        currency,
      },
      traveler_type: travelerType,
      interests: interests.length > 0 ? interests : ['Theme parks', 'History', 'Swimming', 'Calm places'],
      inferred_categories: Array.from(new Set(inferredCategories)),
      preferred_pace: preferredPace,
      priorities: Array.from(new Set(priorities)),
    };

    return { structuredProfile, isModification, modificationType };
  }

  /**
   * SECTION 4 & 17: Automatic Search Plan & Query Generation
   * Generates a focused, targeted research plan and query set.
   * Avoids searching irrelevant domains (e.g. no Sahara searches for coastal trips).
   */
  public generateSearchPlan(profile: StructuredTripProfile): ResearchSearchPlan {
    const searchCategories: string[] = [];
    const targetQueries: string[] = [];
    const mustIncludeFeatures: string[] = [];

    const isFamily = profile.traveler_type === 'family';
    const isCoastal = profile.interests.some((i) => i.toLowerCase().includes('swim') || i.toLowerCase().includes('beach'));
    const wantsThemeParks = profile.interests.some((i) => i.toLowerCase().includes('game') || i.toLowerCase().includes('disney') || i.toLowerCase().includes('theme'));
    const wantsHistory = profile.interests.some((i) => i.toLowerCase().includes('history') || i.toLowerCase().includes('ruin'));
    const wantsCalm = profile.interests.some((i) => i.toLowerCase().includes('calm') || i.toLowerCase().includes('quiet'));
    const isSahara = profile.interests.some((i) => i.toLowerCase().includes('sahara') || i.toLowerCase().includes('desert'));

    // 1. Family attractions & Theme Parks
    if (wantsThemeParks) {
      searchCategories.push('Family attractions', 'Theme / amusement parks');
      targetQueries.push(
        'family friendly amusement parks Tunisia',
        'Carthage Land Yasmine Hammamet official rides and Aqua Land combo',
        'Tunisia interactive children entertainment attractions'
      );
      mustIncludeFeatures.push('theme park admission', 'interactive rides');
    }

    // 2. Historical & Cultural Attractions
    if (wantsHistory) {
      searchCategories.push('Historical attractions', 'UNESCO World Heritage sites');
      targetQueries.push(
        'UNESCO Roman ruins and archaeological sites near Hammamet and Tunis',
        'Archaeological Site of Carthage and Antonine Baths opening hours',
        'Colosseum of El Jem amphitheater official tickets and guide'
      );
      mustIncludeFeatures.push('UNESCO heritage verified', 'guided historical access');
    }

    // 3. Beaches & Water Activities
    if (isCoastal) {
      searchCategories.push('Beaches', 'Water activities');
      targetQueries.push(
        'best shallow calm beaches for swimming in Hammamet Tunisia',
        'family water activities Port El Kantaoui pirate ship cruise Hammamet',
        'safe Mediterranean swimming coves Tunisia'
      );
      mustIncludeFeatures.push('safe beach swimming', 'pool access');
    }

    // 4. Quiet Coastal Destinations & Relaxation
    if (wantsCalm) {
      searchCategories.push('Quiet coastal destinations');
      targetQueries.push(
        'peaceful tranquil coastal towns in Tunisia with low noise',
        'Sidi Bou Said pedestrian village sunset tea terraces'
      );
      mustIncludeFeatures.push('tranquil atmosphere', 'pedestrian friendly');
    }

    // 5. Desert / Sahara (only if user actually requested it!)
    if (isSahara) {
      searchCategories.push('Desert & Oasis experiences');
      targetQueries.push(
        'Sahara desert camel trekking Douz',
        'Matmata troglodyte Berber subterranean houses'
      );
    }

    // 6. Accommodations matching budget
    searchCategories.push(isFamily ? 'Family beachfront hotels & suites' : 'Curated hotels');
    const primaryRegion = profile.destination_regions[0] || 'Hammamet';
    targetQueries.push(
      `family hotels in ${primaryRegion} with private pool and direct beach access`,
      `verified hotel room rates in ${primaryRegion} under $180 per night`
    );

    // 7. Local Dining & Restaurants
    searchCategories.push('Authentic family restaurants');
    targetQueries.push(`family-friendly authentic Tunisian cuisine and fresh seafood near ${primaryRegion}`);

    // 8. Ground Transportation
    searchCategories.push('Private ground transport & transfers');
    targetQueries.push(`private air-conditioned minivan chauffeur hire Tunis airport to ${primaryRegion}`);

    // Budget constraints
    const nights = Math.max(1, profile.duration_days - 1);
    const maxHotelBudget = profile.budget.amount * 0.45; // Max 45% of total budget for accommodation
    const budgetConstraintPerNightUSD = Math.round(maxHotelBudget / nights);

    return {
      searchCategories,
      targetQueries,
      mustIncludeFeatures,
      budgetConstraintPerNightUSD,
      maxDriveTimeMinutesPerDay: wantsCalm ? 75 : 120, // Max 75 mins driving per day for calm/family
    };
  }
}

export const nlpIntentEngine = new NLPIntentEngine();
