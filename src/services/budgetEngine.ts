import { BudgetBreakdown, Currency, ItineraryDay, TripProfile } from '../types';
import { EXCHANGE_RATES } from '../data/knowledgeBase';

export class BudgetEngine {
  /**
   * Calculate live comprehensive budget for an itinerary and user profile
   */
  public calculate(
    itinerary: ItineraryDay[],
    profile: TripProfile,
    userCurrency: Currency = 'USD'
  ): BudgetBreakdown {
    const travelers = Math.max(1, profile.travelers || 4);
    const duration = Math.max(1, profile.durationDays || itinerary.length || 7);
    const userBudgetUSD = profile.currency === 'USD' 
      ? profile.budget 
      : profile.budget / (EXCHANGE_RATES[profile.currency] || 1);

    let hotelsTotalUSD = 0;
    let activitiesTotalUSD = 0;

    // Tally from itinerary
    itinerary.forEach((day) => {
      // Hotel stay for the night
      if (day.hotelStay) {
        hotelsTotalUSD += day.hotelStay.priceUSD;
      }
      // Activities
      day.activities.forEach((act) => {
        activitiesTotalUSD += (act.costUSD || 0) * travelers;
      });
    });

    // If hotels aren't explicitly assigned to each day yet, estimate standard hotel stay
    if (hotelsTotalUSD === 0) {
      // average $120/night for family accommodation
      hotelsTotalUSD = 120 * duration;
    }

    // Transportation estimation based on itinerary:
    // Airport roundtrip private minivan ($120) + regional daily transfers ($25/day)
    const transportTotalUSD = 120 + Math.round(duration * 24);

    // Food estimation:
    // ~$18 per person per day for authentic Tunisian dining (couscous, salads, seafood, pastries)
    const foodTotalUSD = Math.round(travelers * duration * 18);

    // Extras estimation:
    // Museum photo permits, bottled water, souvenirs, tips, café stops (~$6/person/day)
    const extrasTotalUSD = Math.round(travelers * duration * 6);

    const totalEstimatedUSD =
      hotelsTotalUSD + transportTotalUSD + activitiesTotalUSD + foodTotalUSD + extrasTotalUSD;

    const remainingUSD = Math.round(userBudgetUSD - totalEstimatedUSD);
    const percentageUsed = Math.min(100, Math.round((totalEstimatedUSD / userBudgetUSD) * 100));
    const costPerTravelerUSD = Math.round(totalEstimatedUSD / travelers);
    const isOverBudget = totalEstimatedUSD > userBudgetUSD;

    let optimizationAdvice: string | undefined;
    if (isOverBudget) {
      const overAmount = Math.abs(remainingUSD);
      optimizationAdvice = `Plan is $${overAmount} above target. We can switch from 5-star Hasdrubal to 4-star Marillia Yasmine to save $360, bringing total to $${totalEstimatedUSD - 360} (under budget).`;
    } else if (remainingUSD > 200) {
      optimizationAdvice = `Comfortable buffer: You have $${remainingUSD} remaining for spontaneous artisan gifts in Nabeul or special sunset seafood dinners.`;
    }

    return {
      hotelsTotalUSD,
      transportTotalUSD,
      activitiesTotalUSD,
      foodTotalUSD,
      extrasTotalUSD,
      totalEstimatedUSD,
      userBudgetUSD: Math.round(userBudgetUSD),
      remainingUSD,
      percentageUsed,
      costPerTravelerUSD,
      currency: userCurrency,
      isOverBudget,
      optimizationAdvice,
    };
  }

  /**
   * Convert any USD amount to target currency string with symbol
   */
  public formatCurrency(amountUSD: number, targetCurrency: Currency): string {
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    const converted = Math.round(amountUSD * rate);

    switch (targetCurrency) {
      case 'TND':
        return `${converted.toLocaleString()} TND`;
      case 'EUR':
        return `€${converted.toLocaleString()}`;
      case 'GBP':
        return `£${converted.toLocaleString()}`;
      case 'USD':
      default:
        return `$${converted.toLocaleString()}`;
    }
  }
}

export const budgetService = new BudgetEngine();
