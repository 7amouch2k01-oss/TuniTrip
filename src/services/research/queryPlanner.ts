import { SearchClassification } from '../ai/types';
import { nlpIntentEngine } from '../nlpIntentEngine';

export class QueryPlanner {
  /**
   * SECTION 15, 16, 17: Intelligent Classification & Targeted Query Generation
   */
  public static plan(userMessage: string): SearchClassification {
    const text = userMessage.trim();
    const lower = text.toLowerCase();

    // 1. Simple Greetings & Conversational Chit-Chat (NO SEARCH REQUIRED)
    const isGreeting =
      lower === 'hello' ||
      lower === 'hi' ||
      lower.startsWith('hello ') ||
      lower.startsWith('hi ') ||
      lower.startsWith('hey') ||
      lower === 'good morning' ||
      lower === 'good evening' ||
      lower.includes('how are you');

    if (isGreeting && text.length < 35 && !lower.includes('find') && !lower.includes('hotel') && !lower.includes('price')) {
      return {
        needs_web: false,
        needs_places: false,
        needs_maps: false,
        needs_weather: false,
        needs_exchange_rate: false,
        needs_rag: false,
        needs_external_llm: false,
        complexity: 'simple',
        intent: 'greeting',
        targetQueries: [],
        explanation: 'User prompt is a simple greeting; no external search or knowledge retrieval required.',
      };
    }

    // 2. Weather Question (WEATHER TOOL REQUIRED)
    if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast') || lower.includes('rain')) {
      let targetCity = 'Tunis';
      if (lower.includes('djerba')) targetCity = 'Djerba';
      else if (lower.includes('hammamet')) targetCity = 'Hammamet';
      else if (lower.includes('tozeur')) targetCity = 'Tozeur';
      else if (lower.includes('sousse')) targetCity = 'Sousse';
      else if (lower.includes('sidi bou said')) targetCity = 'Sidi Bou Said';

      return {
        needs_web: false,
        needs_places: false,
        needs_maps: false,
        needs_weather: true,
        needs_exchange_rate: false,
        needs_rag: false,
        needs_external_llm: false,
        complexity: 'simple',
        intent: 'weather',
        targetQueries: [`weather forecast ${targetCity} Tunisia`],
        explanation: `User is asking about current weather in ${targetCity}; live weather tool selected.`,
      };
    }

    // 3. Stable Cultural / Historical / General Questions (RAG / INTERNAL SUFFICIENT)
    const isFactualHistorical =
      lower.includes('capital of tunisia') ||
      lower.includes('who was hannibal') ||
      lower.includes('history of carthage') ||
      lower.includes('who built') ||
      lower.includes('what is a medina') ||
      lower.includes('tell me about el jem');

    if (isFactualHistorical && !lower.includes('price') && !lower.includes('book') && !lower.includes('hotel')) {
      return {
        needs_web: false,
        needs_places: false,
        needs_maps: false,
        needs_weather: false,
        needs_exchange_rate: false,
        needs_rag: true,
        needs_external_llm: false,
        complexity: 'simple',
        intent: 'general_question',
        targetQueries: [text],
        explanation: 'Factual Tunisian history or geography; curated RAG knowledge base is authoritative without live search.',
      };
    }

    // 4. Restaurant Search (PLACES + HOURS)
    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat') || lower.includes('seafood') || lower.includes('cafe')) {
      let city = 'Tunis';
      if (lower.includes('sidi bou said')) city = 'Sidi Bou Said';
      else if (lower.includes('hammamet')) city = 'Hammamet';
      else if (lower.includes('mahdia')) city = 'Mahdia';
      else if (lower.includes('djerba')) city = 'Djerba';
      else if (lower.includes('sousse')) city = 'Sousse';

      return {
        needs_web: true,
        needs_places: true,
        needs_maps: false,
        needs_weather: false,
        needs_exchange_rate: false,
        needs_rag: true,
        needs_external_llm: false,
        complexity: 'moderate',
        intent: 'restaurant_search',
        targetQueries: [
          `best restaurants in ${city} Tunisia`,
          `traditional Tunisian dining ${city} seafood`,
          `restaurants near ${city} open tonight`,
        ],
        explanation: `User looking for dining in ${city}; triggering Google Places and live status research.`,
      };
    }

    // 5. Hotel / Accommodation Search
    if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('accommodation')) {
      let city = 'Hammamet';
      if (lower.includes('mahdia')) city = 'Mahdia';
      else if (lower.includes('djerba')) city = 'Djerba';
      else if (lower.includes('tunis')) city = 'Tunis';
      else if (lower.includes('sousse')) city = 'Sousse';

      return {
        needs_web: true,
        needs_places: true,
        needs_maps: false,
        needs_weather: false,
        needs_exchange_rate: false,
        needs_rag: true,
        needs_external_llm: false,
        complexity: 'moderate',
        intent: 'hotel_search',
        targetQueries: [
          `family hotels in ${city} Tunisia with pool`,
          `verified beachfront resorts ${city} Tunisia`,
          `hotel room rates ${city} under $180 per night`,
        ],
        explanation: `User looking for hotels in ${city}; querying Google Places, rates, and amenities.`,
      };
    }

    // 6. Current Pricing / Ticket Queries (LIVE WEB SEARCH)
    if (lower.includes('how much') || lower.includes('ticket price') || lower.includes('cost of carthage land') || lower.includes('ticket')) {
      return {
        needs_web: true,
        needs_places: true,
        needs_maps: false,
        needs_weather: false,
        needs_exchange_rate: true,
        needs_rag: true,
        needs_external_llm: false,
        complexity: 'moderate',
        intent: 'place_search',
        targetQueries: [
          'Carthage Land Yasmine Hammamet official admission ticket rates 2026',
          'Carthage Land Aqua Land combo pass entry fee',
        ],
        explanation: 'User inquiring about live attraction pricing; live web search and currency conversion triggered.',
      };
    }

    // 7. Full Travel Planning (COMPLEX MULTI-SOURCE PIPELINE)
    const extracted = nlpIntentEngine.extractTripProfile(text);
    const queries: string[] = [
      'UNESCO Roman ruins and archaeological sites near Hammamet and Tunis',
      'Carthage Land Yasmine Hammamet official rides and Aqua Land combo',
      'best shallow calm beaches for swimming in Hammamet Tunisia',
      'family hotels in Hammamet with private pool and direct beach access',
      'Colosseum of El Jem amphitheater official tickets and guide',
      'family-friendly authentic Tunisian cuisine and fresh seafood near Hammamet',
      'private air-conditioned minivan chauffeur hire Tunis airport to Hammamet',
    ];

    return {
      needs_web: true,
      needs_places: true,
      needs_maps: true,
      needs_weather: true,
      needs_exchange_rate: true,
      needs_rag: true,
      needs_external_llm: true,
      complexity: 'complex',
      intent: 'trip_planning',
      targetQueries: queries,
      explanation: `Multi-day trip planning detected (${extracted.duration_days} days, ${extracted.travelers} travelers, $${extracted.budget.amount}). Parallel multi-tool research plan generated.`,
    };
  }
}
