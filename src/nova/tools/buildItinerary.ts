// ==============================================================================
// TUNITRIP NOVA TOOL: build_itinerary
// Geographically clustered, paced day-by-day schedule generation
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';
import { itineraryService } from '../../services/itineraryEngine';
import { TripProfile, ItineraryDay, ItineraryActivity } from '../../types';

export class BuildItineraryTool implements NovaTool {
  public readonly name = 'build_itinerary';
  public readonly description =
    'Generates a realistic, day-by-day Tunisian travel itinerary with verified activities, travel times between cities, and hotel stays, avoiding backtracking and transit fatigue.';

  public readonly definition: LLMToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        duration_days: {
          type: 'integer',
          description: 'Number of trip days (e.g. 3, 5, 7, 10)',
        },
        travelers: {
          type: 'integer',
          description: 'Number of travelers in the party',
        },
        interests: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of traveler interests (e.g. ["theme_park", "history", "swimming", "calm_escape"])',
        },
        preferred_pace: {
          type: 'string',
          enum: ['relaxed', 'moderate', 'fast-paced'],
          description: 'Pacing preference for daily stops',
        },
        selected_cities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional focus cities (e.g. ["Hammamet", "Tunis", "El Jem"])',
        },
      },
      required: ['duration_days', 'travelers'],
    },
  };

  public async execute(args: Record<string, any>, context?: NovaToolContext): Promise<ToolExecutionResult> {
    const durationDays = Math.max(1, Math.min(14, args.duration_days || 7));
    const travelers = Math.max(1, args.travelers || 2);
    const interests = args.interests || ['history', 'beach', 'culture'];
    const preferredPace = args.preferred_pace || 'relaxed';

    const profile: TripProfile = {
      destination: 'Tunisia (Hammamet, Tunis, Carthage & El Jem)',
      travelers,
      durationDays,
      budget: 2450,
      currency: context?.currency || 'USD',
      tripType: travelers > 2 ? 'Family' : 'Couple',
      interests,
      preferredPace,
    };

    try {
      const planModes = itineraryService.generatePlanModes(profile);
      const full7DayItin: ItineraryDay[] = planModes[0]?.itinerary || [];
      const scaledItin: ItineraryDay[] = full7DayItin.slice(0, durationDays).map((day: ItineraryDay, idx: number) => ({
        ...day,
        dayNumber: idx + 1,
      }));

      const totalActivities = scaledItin.reduce((sum: number, d: ItineraryDay) => sum + d.activities.length, 0);

      return {
        success: true,
        summary: `Assembled ${scaledItin.length}-day geographically optimized route (${totalActivities} activities, transit times calculated)`,
        resultCount: scaledItin.length,
        data: {
          durationDays: scaledItin.length,
          travelers,
          preferredPace,
          itinerary: scaledItin.map((d: ItineraryDay) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            city: d.city,
            summary: d.summary,
            travelInfo: d.travelInfo,
            hotelStay: d.hotelStay ? {
              hotelName: d.hotelStay.hotelName,
              city: d.hotelStay.city,
              priceUSD: d.hotelStay.priceUSD,
              rating: d.hotelStay.rating,
            } : undefined,
            dailyTotalUSD: d.dailyTotalUSD,
            activities: d.activities.map((a: ItineraryActivity) => ({
              time: a.time,
              title: a.title,
              city: a.city,
              costUSD: a.costUSD,
              reasonWhy: a.reasonWhy,
              sourceName: a.sourceName,
              durationHours: a.durationHours,
            })),
          })),
        },
      };
    } catch (err: any) {
      return {
        success: false,
        summary: `Failed to build itinerary: ${err.message}`,
        error: err.message,
      };
    }
  }
}
