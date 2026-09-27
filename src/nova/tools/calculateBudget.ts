// ==============================================================================
// TUNITRIP NOVA TOOL: calculate_budget
// Deterministic multi-currency cost calculation and safe buffer optimization
// ==============================================================================

import { NovaTool, NovaToolContext, ToolExecutionResult } from './types';
import { LLMToolDefinition } from '../providers/types';
import { budgetService } from '../../services/budgetEngine';
import { Currency, TripProfile } from '../../types';

export class CalculateBudgetTool implements NovaTool {
  public readonly name = 'calculate_budget';
  public readonly description =
    'Calculates an itemized travel budget across accommodations, activities, private transfers, meals, and preserves an explicit safety buffer in USD, EUR, GBP, or TND.';

  public readonly definition: LLMToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        duration_days: {
          type: 'integer',
          description: 'Total number of trip days',
        },
        travelers: {
          type: 'integer',
          description: 'Number of travelers',
        },
        user_budget: {
          type: 'number',
          description: 'Total target budget limit set by the user',
        },
        currency: {
          type: 'string',
          enum: ['USD', 'EUR', 'GBP', 'TND'],
          description: 'Currency code (default: USD)',
        },
        accommodation_tier: {
          type: 'string',
          enum: ['budget', 'comfort', 'luxury'],
          description: 'Accommodation standard (budget ~$70/night, comfort ~$125/night, luxury ~$220/night)',
        },
        include_private_transfer: {
          type: 'boolean',
          description: 'Whether to include dedicated AC private minivan airport and day transfers',
        },
      },
      required: ['duration_days', 'travelers', 'user_budget'],
    },
  };

  public async execute(args: Record<string, any>, context?: NovaToolContext): Promise<ToolExecutionResult> {
    const durationDays = Math.max(1, args.duration_days || 7);
    const travelers = Math.max(1, args.travelers || 2);
    const userBudget = Math.max(100, args.user_budget || 2450);
    const currency: Currency = (args.currency || context?.currency || 'USD') as Currency;
    const tier = args.accommodation_tier || 'comfort';
    const includeTransfer = args.include_private_transfer !== false;

    // Rates based on verified Tunisian partner pricing
    let nightlyHotelRateUSD = 125; // default 4-star comfort resort
    if (tier === 'budget') nightlyHotelRateUSD = 75;
    else if (tier === 'luxury') nightlyHotelRateUSD = 220;

    const nights = Math.max(1, durationDays - 1);
    const totalHotelsUSD = nights * nightlyHotelRateUSD;
    const totalTransportUSD = includeTransfer ? 290 : 80;
    const totalActivitiesUSD = travelers * (durationDays * 12); // passes, Carthage Land, El Jem
    const totalFoodUSD = travelers * durationDays * 18; // authentic daily allowance
    const totalExtrasUSD = durationDays * 15; // tips & incidentals

    const totalEstimatedUSD = totalHotelsUSD + totalTransportUSD + totalActivitiesUSD + totalFoodUSD + totalExtrasUSD;
    const remainingUSD = Math.max(0, userBudget - totalEstimatedUSD);
    const percentageUsed = Math.min(100, Math.round((totalEstimatedUSD / userBudget) * 100));

    return {
      success: true,
      summary: `Budget calculated: ${budgetService.formatCurrency(totalEstimatedUSD, currency)} estimated (${percentageUsed}% of ${budgetService.formatCurrency(userBudget, currency)} budget, preserving ${budgetService.formatCurrency(remainingUSD, currency)} safe buffer)`,
      data: {
        userBudgetUSD: userBudget,
        totalEstimatedUSD,
        remainingUSD,
        percentageUsed,
        costPerTravelerUSD: Math.round(totalEstimatedUSD / travelers),
        currency,
        breakdown: {
          accommodation: totalHotelsUSD,
          transport: totalTransportUSD,
          activities: totalActivitiesUSD,
          food: totalFoodUSD,
          extras: totalExtrasUSD,
        },
        safetyBufferPreserved: remainingUSD > 0,
        advice: remainingUSD > 200
          ? `Healthy safety cushion of ${budgetService.formatCurrency(remainingUSD, currency)} preserved for artisan souks & dining.`
          : 'Budget is tightly balanced with essentials.',
      },
    };
  }
}
