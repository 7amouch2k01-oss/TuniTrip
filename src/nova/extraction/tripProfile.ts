// ==============================================================================
// TUNITRIP NOVA — STRUCTURED TRIP PROFILE EXTRACTOR
// Natural language extraction into deterministic parameters for travel tools
// ==============================================================================

import { Currency } from '../../types';

export interface StructuredTripProfile {
  destination: string;
  currentLocation?: string;
  durationDays: number;
  travelers: number;
  travelerType: 'family' | 'couple' | 'solo' | 'friends' | 'business';
  budget: {
    amount: number;
    currency: Currency;
  };
  interests: string[];
  inferredCategories: string[];
  pace: 'relaxed' | 'moderate' | 'fast-paced';
  accommodationPreferences: string[];
  foodPreferences: string[];
  activityPreferences: string[];
}

export class TripProfileExtractor {
  public static extract(text: string, currentProfile?: Partial<StructuredTripProfile>): StructuredTripProfile {
    const lower = text.toLowerCase();

    // 1. Duration (e.g. "7 days", "10-day trip", "a week", "2 weeks")
    let duration = currentProfile?.durationDays || 7;
    const daysMatch = lower.match(/(\d+)\s*(?:days?|nuits?|journée?s?)/);
    if (daysMatch) {
      duration = Math.max(1, Math.min(30, parseInt(daysMatch[1], 10)));
    } else if (lower.includes('two weeks') || lower.includes('2 weeks')) {
      duration = 14;
    } else if (lower.includes('a week') || lower.includes('one week')) {
      duration = 7;
    } else if (lower.includes('weekend')) {
      duration = 3;
    }

    // 2. Party Size & Traveler Type
    let travelers = currentProfile?.travelers || 2;
    let travelerType: StructuredTripProfile['travelerType'] = currentProfile?.travelerType || 'couple';

    const familyWithOther = lower.match(/(?:with\s*)(\d+)\s*(?:other\s*)?(?:family\s*members?|kids?|children|people|guests)/);
    const explicitNum = lower.match(/(\d+)\s*(?:people|persons|travelers|guests|members|adults)/);

    if (familyWithOther) {
      travelers = parseInt(familyWithOther[1], 10) + 1; // e.g. "with 3 other family members" -> 4
      travelerType = 'family';
    } else if (explicitNum) {
      travelers = Math.max(1, Math.min(20, parseInt(explicitNum[1], 10)));
    }

    if (lower.includes('family') || lower.includes('kids') || lower.includes('children') || lower.includes('disneyland')) {
      travelerType = 'family';
    } else if (lower.includes('solo') || lower.includes('alone') || lower.includes('myself')) {
      travelerType = 'solo';
      travelers = 1;
    } else if (lower.includes('honeymoon') || lower.includes('couple') || lower.includes('partner') || lower.includes('wife') || lower.includes('husband')) {
      travelerType = 'couple';
      if (!explicitNum && !familyWithOther) travelers = 2;
    } else if (lower.includes('friends') || lower.includes('group') || lower.includes('buddies')) {
      travelerType = 'friends';
    } else if (lower.includes('business') || lower.includes('conference') || lower.includes('work')) {
      travelerType = 'business';
    }

    // 3. Budget & Currency
    let currency: Currency = currentProfile?.budget?.currency || 'USD';
    if (lower.includes('eur') || lower.includes('euro') || lower.includes('€')) {
      currency = 'EUR';
    } else if (lower.includes('gbp') || lower.includes('pound') || lower.includes('£')) {
      currency = 'GBP';
    } else if (lower.includes('tnd') || lower.includes('dinar') || lower.includes('dt')) {
      currency = 'TND';
    }

    let budgetAmount = currentProfile?.budget?.amount || (travelers * 600);
    const budgetMatch = lower.match(/(?:budget\s*(?:is|of)?\s*[\$€£]?\s*|\$\s*|£\s*|€\s*)(\d[\d,\.]*)/);
    if (budgetMatch) {
      const parsed = parseFloat(budgetMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 50) {
        budgetAmount = parsed;
      }
    } else {
      const standaloneNum = lower.match(/(\d{3,5})\s*(?:dollars?|usd|eur|euros?|pounds?|tnd|dinars?)/);
      if (standaloneNum) {
        budgetAmount = parseFloat(standaloneNum[1]);
      }
    }

    // 4. Current Location
    let currentLocation = currentProfile?.currentLocation;
    const locationMatch = lower.match(/(?:currently\s*in|i\s*am\s*in|staying\s*in|arriving\s*at|from)\s+([a-zA-Z\s]+?)(?:\.|,|\s+and|\s+with|$)/);
    if (locationMatch && locationMatch[1].length < 30) {
      currentLocation = locationMatch[1].trim();
    }

    // 5. Destination Detection
    let destination = currentProfile?.destination || 'Tunisia';
    const regions: string[] = [];
    if (lower.includes('hammamet')) regions.push('Hammamet');
    if (lower.includes('tunis')) regions.push('Tunis');
    if (lower.includes('carthage')) regions.push('Carthage');
    if (lower.includes('sidi bou said')) regions.push('Sidi Bou Said');
    if (lower.includes('djerba')) regions.push('Djerba');
    if (lower.includes('sousse')) regions.push('Sousse');
    if (lower.includes('el jem') || lower.includes('el djem')) regions.push('El Jem');
    if (lower.includes('tozeur') || lower.includes('sahara') || lower.includes('desert') || lower.includes('douz')) regions.push('Sahara Desert & Tozeur');

    if (regions.length > 0) {
      destination = regions.join(', ');
    }

    // 6. Pace
    let pace: StructuredTripProfile['pace'] = currentProfile?.pace || 'relaxed';
    if (lower.includes('fast') || lower.includes('packed') || lower.includes('active') || lower.includes('see everything')) {
      pace = 'fast-paced';
    } else if (lower.includes('moderate') || lower.includes('balanced')) {
      pace = 'moderate';
    } else if (lower.includes('calm') || lower.includes('relaxed') || lower.includes('slow') || lower.includes('chill') || lower.includes('peaceful')) {
      pace = 'relaxed';
    }

    // 7. Interests & Categories Expansion
    const interests: string[] = [];
    const inferredCategories: string[] = [];
    const activityPreferences: string[] = [];
    const accommodationPreferences: string[] = [];
    const foodPreferences: string[] = [];

    if (lower.includes('game') || lower.includes('disneyland') || lower.includes('carthage land') || lower.includes('theme park') || lower.includes('rides')) {
      interests.push('Theme parks & games');
      inferredCategories.push('theme_park');
      activityPreferences.push('Carthage Land rides', 'Aqua Land water slides', '5D cinema');
    }

    if (lower.includes('history') || lower.includes('ruin') || lower.includes('unesco') || lower.includes('roman') || lower.includes('carthage') || lower.includes('colosseum')) {
      interests.push('History & Archaeology');
      inferredCategories.push('history', 'culture');
      activityPreferences.push('UNESCO Roman ruins', 'El Jem Amphitheatre', 'Punic Carthage & Byrsa Hill');
    }

    if (lower.includes('swim') || lower.includes('beach') || lower.includes('water') || lower.includes('sea') || lower.includes('coastal')) {
      interests.push('Swimming & Beaches');
      inferredCategories.push('beach');
      activityPreferences.push('Mediterranean beach swimming', 'Private catamaran sail');
    }

    if (lower.includes('calm') || lower.includes('quiet') || lower.includes('relax') || lower.includes('peaceful') || lower.includes('tranquil')) {
      interests.push('Tranquil Escapes');
      inferredCategories.push('calm_escape');
      accommodationPreferences.push('Quiet beachfront hotel with private garden');
    }

    if (lower.includes('food') || lower.includes('eat') || lower.includes('culinary') || lower.includes('seafood') || lower.includes('restaurant')) {
      interests.push('Gastronomy');
      inferredCategories.push('food');
      foodPreferences.push('Authentic Tunisian couscous', 'Fresh Gulf of Hammamet grilled seafood', 'Bambalouni & mint tea');
    }

    if (lower.includes('hotel') || lower.includes('resort') || lower.includes('thalasso') || lower.includes('spa')) {
      inferredCategories.push('hotel');
      accommodationPreferences.push('5-star Thalasso resort', 'Family connecting suite');
    }

    if (interests.length === 0) {
      interests.push('Cultural Discovery', 'Coastal Relaxation');
      inferredCategories.push('culture', 'beach');
    }

    return {
      destination,
      currentLocation,
      durationDays: duration,
      travelers,
      travelerType,
      budget: {
        amount: budgetAmount,
        currency,
      },
      interests,
      inferredCategories: Array.from(new Set(inferredCategories)),
      pace,
      accommodationPreferences,
      foodPreferences,
      activityPreferences,
    };
  }
}
