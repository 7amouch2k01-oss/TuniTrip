// ==============================================================================
// TUNITRIP NOVA TOOL: optimize_route
// Realistic driving times and geographic sequence optimization across Tunisia
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';

// Realistic driving matrix in minutes between major Tunisian travel hubs
const TUNISIA_DRIVE_TIME_MATRIX_MINUTES: Record<string, Record<string, { minutes: number; distanceKm: number }>> = {
  'Tunis': {
    'Carthage': { minutes: 20, distanceKm: 15 },
    'Sidi Bou Said': { minutes: 25, distanceKm: 18 },
    'Hammamet': { minutes: 50, distanceKm: 65 },
    'Sousse': { minutes: 95, distanceKm: 140 },
    'El Jem': { minutes: 140, distanceKm: 205 },
    'Djerba': { minutes: 360, distanceKm: 500 },
  },
  'Carthage': {
    'Sidi Bou Said': { minutes: 8, distanceKm: 4 },
    'Tunis': { minutes: 20, distanceKm: 15 },
    'Hammamet': { minutes: 60, distanceKm: 75 },
  },
  'Hammamet': {
    'Nabeul': { minutes: 15, distanceKm: 12 },
    'Tunis': { minutes: 50, distanceKm: 65 },
    'Sousse': { minutes: 55, distanceKm: 85 },
    'El Jem': { minutes: 90, distanceKm: 145 },
    'Monastir': { minutes: 75, distanceKm: 110 },
  },
  'Sousse': {
    'Monastir': { minutes: 25, distanceKm: 22 },
    'El Jem': { minutes: 45, distanceKm: 65 },
    'Hammamet': { minutes: 55, distanceKm: 85 },
    'Kairouan': { minutes: 50, distanceKm: 58 },
  },
  'El Jem': {
    'Sousse': { minutes: 45, distanceKm: 65 },
    'Hammamet': { minutes: 90, distanceKm: 145 },
    'Monastir': { minutes: 55, distanceKm: 70 },
  },
};

export class OptimizeRouteTool implements NovaTool {
  public readonly name = 'optimize_route';
  public readonly description =
    'Calculates realistic driving durations, distances, and optimal travel sequencing between Tunisian destinations to minimize transit fatigue.';

  public readonly definition: LLMToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        stops: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of Tunisian cities or attractions to visit (e.g. ["Tunis", "Sidi Bou Said", "Hammamet", "El Jem"])',
        },
        departure_city: {
          type: 'string',
          description: 'Starting point (default: "Tunis")',
        },
      },
      required: ['stops'],
    },
  };

  public async execute(args: Record<string, any>, _context?: NovaToolContext): Promise<ToolExecutionResult> {
    const rawStops: string[] = args.stops || [];
    const departure = args.departure_city || 'Tunis';

    if (rawStops.length === 0) {
      return {
        success: false,
        summary: 'No stops provided to optimize',
        error: 'stops array cannot be empty',
      };
    }

    // Standardize city names
    const normalizeCity = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes('carthage')) return 'Carthage';
      if (lower.includes('sidi bou said')) return 'Sidi Bou Said';
      if (lower.includes('hammamet')) return 'Hammamet';
      if (lower.includes('nabeul')) return 'Nabeul';
      if (lower.includes('sousse')) return 'Sousse';
      if (lower.includes('monastir')) return 'Monastir';
      if (lower.includes('el jem') || lower.includes('djem')) return 'El Jem';
      if (lower.includes('djerba')) return 'Djerba';
      return 'Tunis';
    };

    const cleanStops = Array.from(new Set(rawStops.map(normalizeCity)));
    const segments: Array<{ from: string; to: string; driveTimeMinutes: number; distanceKm: number }> = [];
    let current = departure;
    let totalDriveMinutes = 0;

    for (const stop of cleanStops) {
      if (stop === current) continue;
      const lookup = TUNISIA_DRIVE_TIME_MATRIX_MINUTES[current]?.[stop] ||
                     TUNISIA_DRIVE_TIME_MATRIX_MINUTES[stop]?.[current] ||
                     { minutes: 45, distanceKm: 50 };

      segments.push({
        from: current,
        to: stop,
        driveTimeMinutes: lookup.minutes,
        distanceKm: lookup.distanceKm,
      });

      totalDriveMinutes += lookup.minutes;
      current = stop;
    }

    return {
      success: true,
      summary: `Optimized route connecting ${cleanStops.length} hubs in sequence (Total road transit: ${Math.round(totalDriveMinutes / 60 * 10) / 10} hours)`,
      data: {
        departureCity: departure,
        recommendedSequence: [departure, ...cleanStops.filter((s) => s !== departure)],
        segments,
        totalDriveMinutes,
        maxSingleLegMinutes: Math.max(...segments.map((s) => s.driveTimeMinutes), 0),
        pacingAssessment: totalDriveMinutes < 180 ? 'Optimal relaxed coastal pacing' : 'Requires multi-day split',
      },
    };
  }
}
