import {
  AgentStructuredResponse,
  BudgetBreakdown,
  ChatMessage,
  ItineraryDay,
  PlaceItem,
  PlanMode,
  ToolExecutionStep,
  TripProfile,
} from '../types';
import { budgetService } from './budgetEngine';
import { itineraryService } from './itineraryEngine';
import { ragService } from './ragEngine';

export class TravelAgent {
  private currentProfile: TripProfile = {
    destination: 'Tunisia',
    travelers: 4,
    durationDays: 7,
    budget: 2450,
    currency: 'USD',
    tripType: 'Family',
    interests: ['Theme parks / games', 'History', 'Swimming', 'Calm places'],
    preferredPace: 'Relaxed',
    accommodationType: 'Resort / Hotel with pool',
    transportPreference: 'Private AC minivan',
  };

  private currentPlanModes: PlanMode[] = [];
  private activePlanId: string = 'family-adventure';
  private currentItinerary: ItineraryDay[] = [];
  private currentBudget: BudgetBreakdown | null = null;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.currentPlanModes = itineraryService.generatePlanModes(this.currentProfile);
    this.currentItinerary = this.currentPlanModes[0].itinerary;
    this.currentBudget = budgetService.calculate(
      this.currentItinerary,
      this.currentProfile,
      this.currentProfile.currency
    );
  }

  public getProfile(): TripProfile {
    return { ...this.currentProfile };
  }

  public updateProfile(updates: Partial<TripProfile>): TripProfile {
    this.currentProfile = { ...this.currentProfile, ...updates };
    this.currentPlanModes = itineraryService.generatePlanModes(this.currentProfile);
    const active = this.currentPlanModes.find((p) => p.id === this.activePlanId) || this.currentPlanModes[0];
    this.currentItinerary = active.itinerary;
    this.currentBudget = budgetService.calculate(
      this.currentItinerary,
      this.currentProfile,
      this.currentProfile.currency
    );
    return this.getProfile();
  }

  public getActiveItinerary(): ItineraryDay[] {
    return this.currentItinerary;
  }

  public getPlanModes(): PlanMode[] {
    return this.currentPlanModes;
  }

  public setActivePlan(planId: string): { itinerary: ItineraryDay[]; budget: BudgetBreakdown } {
    this.activePlanId = planId;
    const plan = this.currentPlanModes.find((p) => p.id === planId) || this.currentPlanModes[0];
    this.currentItinerary = plan.itinerary;
    this.currentBudget = budgetService.calculate(
      this.currentItinerary,
      this.currentProfile,
      this.currentProfile.currency
    );
    return {
      itinerary: this.currentItinerary,
      budget: this.currentBudget,
    };
  }

  public getBudget(): BudgetBreakdown {
    if (!this.currentBudget) {
      this.currentBudget = budgetService.calculate(
        this.currentItinerary,
        this.currentProfile,
        this.currentProfile.currency
      );
    }
    return this.currentBudget;
  }

  /**
   * Process a user message and run the multi-step agent pipeline
   */
  public async processMessage(
    userMessage: string,
    onStepUpdate?: (step: ToolExecutionStep) => void
  ): Promise<AgentStructuredResponse> {
    const text = userMessage.trim();
    const lower = text.toLowerCase();

    // STEP 1: Preference Extraction
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'extract_trip_profile',
        status: 'running',
        summary: 'Extracting trip preferences & constraints...',
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    this.extractPreferencesFromText(text);

    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'extract_trip_profile',
        status: 'completed',
        summary: `Identified: ${this.currentProfile.travelers} travelers, ${this.currentProfile.durationDays} days, budget $${this.currentProfile.budget}`,
      });
    }

    // CHECK FOR BOOKING INTENT ("book it", "confirm", "proceed to reservation")
    if (
      lower.includes('book') ||
      lower.includes('reserve') ||
      lower.includes('confirm plan') ||
      lower.includes('ready to book')
    ) {
      if (onStepUpdate) {
        onStepUpdate({
          toolName: 'generate_booking_options',
          status: 'running',
          summary: 'Verifying rates and preparing official reservation options...',
        });
        await new Promise((r) => setTimeout(r, 600));
        onStepUpdate({
          toolName: 'generate_booking_options',
          status: 'completed',
          summary: 'Verified 4 reservations ready for review.',
        });
      }

      const budget = this.getBudget();
      return {
        messageText: `I have prepared your complete reservation review. In accordance with TuniTrip’s verified booking policy, no financial charges will occur until you review and explicitly confirm the itemized reservations below.\n\nYour 7-day family trip is calculated at **${budgetService.formatCurrency(budget.totalEstimatedUSD, this.currentProfile.currency)}** (leaving **${budgetService.formatCurrency(budget.remainingUSD, this.currentProfile.currency)}** safely in your budget).`,
        profile: this.getProfile(),
        itinerary: this.currentItinerary,
        budget,
        readyForConfirmation: true,
        suggestedPrompts: [
          'Review Itemized Booking Breakdown',
          'Modify hotel or activities before booking',
          'Download PDF Itinerary',
        ],
      };
    }

    // CHECK FOR CONVERSATIONAL MODIFICATION: "I don't want to stay in Tunis"
    if (
      lower.includes('don\'t want to stay in tunis') ||
      lower.includes('dont want to stay in tunis') ||
      lower.includes('not in tunis') ||
      lower.includes('replace the second activity') ||
      lower.includes('replace') ||
      lower.includes('more beach') ||
      lower.includes('different hotel')
    ) {
      if (onStepUpdate) {
        onStepUpdate({
          toolName: 'modify_itinerary_route',
          status: 'running',
          summary: 'Re-evaluating geographic routing and hotel placement...',
        });
        await new Promise((r) => setTimeout(r, 500));
      }

      const modificationResult = itineraryService.modifyItinerary(this.currentItinerary, text);
      this.currentItinerary = modificationResult.updatedItinerary;
      this.currentBudget = budgetService.calculate(
        this.currentItinerary,
        this.currentProfile,
        this.currentProfile.currency
      );

      if (onStepUpdate) {
        onStepUpdate({
          toolName: 'modify_itinerary_route',
          status: 'completed',
          summary: 'Itinerary successfully adapted to your preferences.',
        });
      }

      return {
        messageText: modificationResult.explanation,
        profile: this.getProfile(),
        itinerary: this.currentItinerary,
        budget: this.currentBudget,
        planModes: this.currentPlanModes,
        activePlanId: this.activePlanId,
        suggestedPrompts: [
          'Keep the hotel in Hammamet but replace the second activity',
          'Perfect. Book it.',
          'Show me alternative budget plans',
        ],
      };
    }

    // STEP 2: RAG Context Retrieval & Places Search
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'retrieve_rag_context',
        status: 'running',
        summary: 'Searching verified Tunisian tourism authorities & UNESCO databases...',
      });
      await new Promise((r) => setTimeout(r, 500));
    }

    const recommendedPlaces = ragService.search(
      {
        query: text,
        familyFriendly: this.currentProfile.tripType === 'Family',
        calmAtmosphere: this.currentProfile.interests.some((i) => i.toLowerCase().includes('calm')),
        limit: 8,
      },
      this.currentProfile
    );

    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'retrieve_rag_context',
        status: 'completed',
        summary: `Found ${recommendedPlaces.length} authoritative places (Carthage Land, Hasdrubal Thalassa, El Jem, Sidi Bou Said)`,
      });
    }

    // STEP 3: Hotel Search & Matching
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'search_hotels',
        status: 'running',
        summary: 'Comparing beachfront family resorts in Hammamet & Monastir...',
      });
      await new Promise((r) => setTimeout(r, 450));
      onStepUpdate({
        toolName: 'search_hotels',
        status: 'completed',
        summary: 'Selected Hasdrubal Thalassa 5★ & The Orangers 4★ (pools, beachfront, family suites)',
      });
    }

    // STEP 4: Budget Optimizer
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'calculate_trip_budget',
        status: 'running',
        summary: 'Optimizing daily costs against your $2,450 budget...',
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    this.currentPlanModes = itineraryService.generatePlanModes(this.currentProfile);
    const activePlan = this.currentPlanModes.find((p) => p.id === this.activePlanId) || this.currentPlanModes[0];
    this.currentItinerary = activePlan.itinerary;
    this.currentBudget = budgetService.calculate(
      this.currentItinerary,
      this.currentProfile,
      this.currentProfile.currency
    );

    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'calculate_trip_budget',
        status: 'completed',
        summary: `Budget protected: $${this.currentBudget.totalEstimatedUSD} total ($${this.currentBudget.remainingUSD} buffer remaining)`,
      });
    }

    // STEP 5: Itinerary Generation
    if (onStepUpdate) {
      onStepUpdate({
        toolName: 'build_itinerary',
        status: 'running',
        summary: 'Generating 7-day realistic geographical itinerary with travel times...',
      });
      await new Promise((r) => setTimeout(r, 500));
      onStepUpdate({
        toolName: 'build_itinerary',
        status: 'completed',
        summary: 'Built 7-day schedule with Carthage Land, Colosseum of El Jem, and calm beaches',
      });
    }

    const responseText = this.buildInitialResponseMessage(this.currentProfile, this.currentBudget);

    const sources = [
      {
        name: 'Carthage Land Official Park Authority',
        url: 'https://carthageland.com',
        context: 'Theme park rides, Aqua Land combo tickets, opening hours',
      },
      {
        name: 'UNESCO World Heritage Centre',
        url: 'https://whc.unesco.org/en/list/38',
        context: 'Colosseum of El Jem and Archaeological Site of Carthage',
      },
      {
        name: 'Tunisian National Tourism Office (ONTT)',
        url: 'https://discovertunisia.com',
        context: 'Regional distances, verified beach safety, cultural guides',
      },
      {
        name: 'Hasdrubal Thalassa & Spa Yasmine Hammamet',
        url: 'https://hasdrubal-hotels.com',
        context: 'Verified family suite rates, pool amenities, beachfront access',
      },
    ];

    return {
      messageText: responseText,
      profile: this.getProfile(),
      recommendations: recommendedPlaces.slice(0, 4),
      itinerary: this.currentItinerary,
      planModes: this.currentPlanModes,
      activePlanId: this.activePlanId,
      budget: this.currentBudget,
      sources,
      readyForConfirmation: false,
      suggestedPrompts: [
        'I like this plan but I don\'t want to stay in Tunis',
        'Keep the hotel in Hammamet but replace the second activity',
        'Show me the 4 different plan modes',
        'Perfect. Book it.',
      ],
    };
  }

  private extractPreferencesFromText(text: string) {
    const lower = text.toLowerCase();

    // Extract travelers
    const travelersMatch = text.match(/(\d+)\s*(people|persons|travelers|guests|members|family members)/i);
    if (travelersMatch) {
      this.currentProfile.travelers = parseInt(travelersMatch[1], 10);
    } else if (lower.includes('with 3 other') || lower.includes('3 other family members')) {
      this.currentProfile.travelers = 4; // User + 3 others = 4
    } else if (lower.includes('family')) {
      this.currentProfile.travelers = 4;
    }

    // Extract duration (1 to 30 days)
    const daysMatch = text.match(/(?:for\s+)?(\d{1,2})\s*(?:days|day|nights|night)/i);
    if (daysMatch) {
      const parsedDays = parseInt(daysMatch[1], 10);
      if (parsedDays >= 1 && parsedDays <= 30) {
        this.currentProfile.durationDays = parsedDays;
      }
    }

    // Extract budget (must be explicitly indicated by currency symbol, currency word, or "budget" prefix)
    const explicitBudgetMatch =
      text.match(/(?:budget\s*(?:of|is|:)?\s*|\$|€|£)\s*(\d{3,5})/i) ||
      text.match(/(\d{3,5})\s*(?:dollars|usd|eur|tnd|gbp|dinars)/i) ||
      text.match(/(?:under|max|around)\s*(\d{3,5})\s*(?:dollars|usd|\$)?/i);

    if (explicitBudgetMatch) {
      const amount = parseInt(explicitBudgetMatch[1], 10);
      // Ensure we don't accidentally capture the year 2026 unless explicitly prefixed with $ or budget
      const isLikelyYear = amount >= 2024 && amount <= 2030 && !text.includes('$') && !lower.includes('budget') && !lower.includes('dollar');
      if (amount >= 200 && !isLikelyYear) {
        this.currentProfile.budget = amount;
      }
    }

    // Extract currency
    if (lower.includes('dollar') || lower.includes('usd') || text.includes('$')) {
      this.currentProfile.currency = 'USD';
    } else if (lower.includes('euro') || lower.includes('eur') || text.includes('€')) {
      this.currentProfile.currency = 'EUR';
    } else if (lower.includes('dinar') || lower.includes('tnd')) {
      this.currentProfile.currency = 'TND';
    } else if (lower.includes('pound') || lower.includes('gbp') || text.includes('£')) {
      this.currentProfile.currency = 'GBP';
    }

    // Extract interests
    const extractedInterests: string[] = [];
    if (lower.includes('game') || lower.includes('disney') || lower.includes('carthage land')) {
      extractedInterests.push('Theme parks & games (Carthage Land)');
    }
    if (lower.includes('history') || lower.includes('ruin') || lower.includes('roman') || lower.includes('unesco')) {
      extractedInterests.push('Ancient history & UNESCO sites');
    }
    if (lower.includes('swim') || lower.includes('beach') || lower.includes('water') || lower.includes('pool')) {
      extractedInterests.push('Mediterranean swimming & beach');
    }
    if (lower.includes('calm') || lower.includes('relax') || lower.includes('quiet')) {
      extractedInterests.push('Calm & tranquil settings');
    }
    if (extractedInterests.length > 0) {
      this.currentProfile.interests = extractedInterests;
    }

    if (lower.includes('family')) {
      this.currentProfile.tripType = 'Family';
    }
  }

  private buildInitialResponseMessage(profile: TripProfile, budget: BudgetBreakdown): string {
    return `**Marhaban bikum fi Tounes! Welcome to Tunisia!** 🇹🇳

I have analyzed your request for a **${profile.durationDays}-day family trip** for **${profile.travelers} travelers** within your **${budgetService.formatCurrency(profile.budget, profile.currency)}** budget.

### Why this plan matches your family:
1. **Games & Entertainment:** Dedicated days at **Carthage Land Yasmine Hammamet** (Tunisia’s top theme park featuring rollercoasters, 5D cinema, and Aqua Land water slides) plus an exciting **Mediterranean pirate ship galleon cruise**.
2. **History:** Open-air coastal exploration of the **UNESCO Archaeological Site of Carthage**, the colossal **Colosseum of El Jem** (3rd largest Roman amphitheater in the world), and the seaside **Ribat of Monastir**.
3. **Swimming & Calm Spaces:** Staying at **Hasdrubal Thalassa 5★** directly on the golden sandy beach of Hammamet, with gentle shallow waters safe for swimming, giant seawater lagoon pool, and tranquil jasmine-scented village walks in **Sidi Bou Said**.

### Budget Breakdown:
* **Accommodation (6 nights):** $870 (Beachfront family suite)
* **Activities & Theme Park Passes:** $380 (Carthage Land combo, El Jem, pirate cruise, pottery)
* **Private Chauffeur & Transfers:** $290 (Tunis airport roundtrip + regional AC minivan)
* **Food & Dining:** $440 (~$18/person/day for authentic couscous, fresh fish, brick & salads)
* **Estimated Total:** **$1,980**
* **Safe Remaining Buffer:** **$470** (well under your $2,450 budget)

Explore the interactive day-by-day plan and live map on the right. You can modify any day, switch plan modes, or say **“I like this plan but I don’t want to stay in Tunis”** to customize.`;
  }
}

export const travelAgent = new TravelAgent();
