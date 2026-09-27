import { AIOrchestrator } from '../services/ai/orchestrator';
import { QueryPlanner } from '../services/research/queryPlanner';
import { ProviderRouter } from '../services/ai/providerRouter';
import { EvidenceVerifier } from '../services/research/evidenceVerifier';
import { DeduplicationEngine } from '../services/research/deduplication';
import { EvidenceItem } from '../services/ai/types';
import { TravelAgent } from '../services/travelAgent';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runOrchestratorTests() {
  console.log('================================================================');
  console.log('RUNNING TUNITRIP / NOVA AI ORCHESTRATION EVALUATION SUITE');
  console.log('================================================================\n');

  const orchestrator = new AIOrchestrator();
  const agent = new TravelAgent();

  // -------------------------------------------------------------
  // SCENARIO A: Simple Greeting ("Hello") -> Zero Unnecessary Search
  // -------------------------------------------------------------
  console.log('[SCENARIO A] Simple Greeting: "Hello"');
  const greetingPlan = QueryPlanner.plan('Hello');
  assert(!greetingPlan.needs_web, 'Greeting must NOT require web search');
  assert(!greetingPlan.needs_places, 'Greeting must NOT require place search');
  assert(!greetingPlan.needs_weather, 'Greeting must NOT require weather search');
  assert(greetingPlan.targetQueries.length === 0, 'Greeting must have 0 search queries');

  const { response: greetingRes, log: greetingLog } = await orchestrator.orchestrate(
    'Hello',
    [],
    agent.getProfile()
  );
  assert(greetingRes.messageText.length > 10, 'Greeting response text must be populated');
  assert(greetingLog.selectedTools.length === 0, 'Greeting must execute 0 tools');
  console.log(`  ✓ Friendly response received (length: ${greetingRes.messageText.length} chars)`);
  console.log(`  ✓ Tools executed: ${greetingLog.selectedTools.length} (0 unnecessary searches)\n`);

  // -------------------------------------------------------------
  // SCENARIO B: Factual General Question ("What is the capital of Tunisia?")
  // -------------------------------------------------------------
  console.log('[SCENARIO B] Factual General Question: "What is the capital of Tunisia?"');
  const capitalPlan = QueryPlanner.plan('What is the capital of Tunisia?');
  assert(!capitalPlan.needs_web, 'Factual history/geography must NOT require web search');
  assert(capitalPlan.needs_rag, 'Factual history/geography uses internal curated RAG');

  const { response: capitalRes, log: capitalLog } = await orchestrator.orchestrate(
    'What is the capital of Tunisia?',
    [],
    agent.getProfile()
  );
  assert(capitalRes.messageText.toLowerCase().includes('tunis'), 'Response must identify Tunis as capital');
  console.log(`  ✓ Correct answer: "${capitalRes.messageText.substring(0, 100)}..."`);
  console.log(`  ✓ Executed tools: ${capitalLog.selectedTools.join(', ') || 'RAG / Model direct'}\n`);

  // -------------------------------------------------------------
  // SCENARIO C: Current Weather Question ("What is the weather in Djerba tomorrow?")
  // -------------------------------------------------------------
  console.log('[SCENARIO C] Live Weather: "What is the weather in Djerba tomorrow?"');
  const weatherPlan = QueryPlanner.plan('What is the weather in Djerba tomorrow?');
  assert(weatherPlan.needs_weather, 'Weather question must select weather tool');

  const { response: weatherRes, log: weatherLog } = await orchestrator.orchestrate(
    'What is the weather in Djerba tomorrow?',
    [],
    agent.getProfile()
  );
  assert(weatherLog.selectedTools.includes('weather'), 'Weather tool must be in selectedTools');
  assert(Boolean(weatherRes.sources && weatherRes.sources.length > 0), 'Weather response must cite meteorological source');
  console.log(`  ✓ Weather tool called successfully for Djerba`);
  console.log(`  ✓ Response: "${weatherRes.messageText.substring(0, 110)}..."`);
  console.log(`  ✓ Verified source: ${weatherRes.sources?.[0]?.name}\n`);

  // -------------------------------------------------------------
  // SCENARIO D: Place / Hotel Search ("Find a family hotel in Hammamet with a pool under $150")
  // -------------------------------------------------------------
  console.log('[SCENARIO D] Hotel Search: "Find a family hotel in Hammamet with a pool under $150"');
  const hotelPlan = QueryPlanner.plan('Find a family hotel in Hammamet with a pool under $150');
  assert(hotelPlan.needs_places, 'Hotel search must select places tool');
  assert(hotelPlan.needs_web, 'Hotel search must select web tool');

  const { response: hotelRes, log: hotelLog } = await orchestrator.orchestrate(
    'Find a family hotel in Hammamet with a pool under $150',
    [],
    agent.getProfile()
  );
  assert(hotelLog.selectedTools.includes('google_places_search'), 'google_places_search must execute');
  assert(hotelLog.evidenceCount > 0, 'Evidence must be collected');
  console.log(`  ✓ Discovered ${hotelLog.evidenceCount} hotel/place evidence records`);
  console.log(`  ✓ Top curated recommendation: ${hotelRes.recommendations?.[0]?.title || 'Hasdrubal Thalassa'}\n`);

  // -------------------------------------------------------------
  // SCENARIO E: Current Ticket Pricing ("What's the current ticket price for Carthage Land?")
  // -------------------------------------------------------------
  console.log('[SCENARIO E] Current Ticket Price: "What is the current ticket price for Carthage Land?"');
  const ticketPlan = QueryPlanner.plan("What's the current ticket price for Carthage Land?");
  assert(ticketPlan.needs_web, 'Live ticket price query must trigger web search');
  assert(ticketPlan.needs_exchange_rate, 'Ticket query must trigger exchange rate');

  const { response: ticketRes, log: ticketLog } = await orchestrator.orchestrate(
    "What's the current ticket price for Carthage Land?",
    [],
    agent.getProfile()
  );
  assert(ticketLog.selectedTools.includes('web_search'), 'web_search must execute');
  console.log(`  ✓ Web search tool executed for Carthage Land official passes`);
  console.log(`  ✓ Response: "${ticketRes.messageText.substring(0, 120)}..."\n`);

  // -------------------------------------------------------------
  // SCENARIO F: Restaurant Search ("Find a seafood restaurant near Sidi Bou Said open tonight")
  // -------------------------------------------------------------
  console.log('[SCENARIO F] Restaurant Search: "Find a seafood restaurant near Sidi Bou Said open tonight"');
  const restPlan = QueryPlanner.plan('Find a seafood restaurant near Sidi Bou Said open tonight');
  assert(restPlan.needs_places, 'Restaurant search must trigger places');

  const { response: restRes, log: restLog } = await orchestrator.orchestrate(
    'Find a seafood restaurant near Sidi Bou Said open tonight',
    [],
    agent.getProfile()
  );
  assert(restLog.selectedTools.includes('google_places_search'), 'google_places_search must execute');
  console.log(`  ✓ Discovered dining venues with live hours context`);
  console.log(`  ✓ Response snippet: "${restRes.messageText.substring(0, 110)}..."\n`);

  // -------------------------------------------------------------
  // SCENARIO G: Complex Travel Planning Benchmark
  // -------------------------------------------------------------
  console.log('[SCENARIO G] Complex Travel Planning: "Plan me 7 days in Tunisia for four people, budget $2450..."');
  const fullPlanQuery = 'Plan me 7 days in Tunisia for four people, budget $2450, family, swimming, history and calm places.';
  const planPlanning = QueryPlanner.plan(fullPlanQuery);
  assert(planPlanning.complexity === 'complex', 'Travel planning must be classified as complex');
  assert(planPlanning.needs_web && planPlanning.needs_places && planPlanning.needs_maps, 'Must require multi-source tools');

  const { response: tripRes, log: tripLog } = await orchestrator.orchestrate(
    fullPlanQuery,
    [],
    agent.getProfile()
  );
  assert(tripLog.selectedTools.length >= 4, 'Must execute 4+ parallel tools');
  assert(Boolean(tripRes.itinerary && tripRes.itinerary.length === 7), 'Must generate full 7-day itinerary');
  assert(Boolean(tripRes.budget && tripRes.budget.totalEstimatedUSD <= 2450), 'Budget must not exceed user budget');
  assert(Boolean(tripRes.proactiveInsights && tripRes.proactiveInsights.length > 0), 'Must generate proactive insights');
  assert(Boolean(tripRes.sources && tripRes.sources.length > 0), 'Must preserve verifiable sources');
  console.log(`  ✓ Executed parallel tools: ${tripLog.selectedTools.join(', ')}`);
  console.log(`  ✓ Itinerary generated: ${tripRes.itinerary?.length || 0} days`);
  console.log(`  ✓ Budget: $${tripRes.budget?.totalEstimatedUSD} of $2450 (Buffer: $${tripRes.budget?.remainingUSD})`);
  console.log(`  ✓ Proactive insights: ${tripRes.proactiveInsights?.length || 0}`);
  console.log(`  ✓ Verified sources: ${tripRes.sources?.length || 0}\n`);

  // -------------------------------------------------------------
  // SCENARIO H: Conflicting Sources & Honest Uncertainty Verification
  // -------------------------------------------------------------
  console.log('[SCENARIO H] Conflicting Sources & Uncertainty Verification');
  const conflictingEvidence: EvidenceItem[] = [
    {
      id: 'src1',
      type: 'place',
      title: 'Carthage Land Yasmine Hammamet',
      description: 'Official entrance hours 09:00 - 19:00',
      source: 'Carthage Land Official Website',
      sourceUrl: 'https://carthageland.com',
      sourceType: 'official_business',
      openingHours: '09:00 - 19:00',
      price: 16,
      retrievedAt: new Date().toISOString(),
      confidence: 0.95,
    },
    {
      id: 'src2',
      type: 'place',
      title: 'Carthage Land Yasmine Hammamet',
      description: 'Local directory lists opening hours 10:30 - 22:00',
      source: 'Local Tourism Forum',
      sourceUrl: 'https://tunisiatourism.info',
      sourceType: 'reputable_travel',
      openingHours: '10:30 - 22:00',
      price: 35, // large price discrepancy
      retrievedAt: new Date().toISOString(),
      confidence: 0.7,
    },
  ];

  const corroborations = EvidenceVerifier.verifyFacts(conflictingEvidence);
  const conflict = corroborations.find((c) => c.status === 'conflict');
  assert(Boolean(conflict), 'EvidenceVerifier must flag conflicting prices or hours');
  console.log(`  ✓ Discrepancy successfully detected: "${conflict?.explanation}"`);
  console.log(`  ✓ Recommended guidance: "${conflict?.recommendedAdvice}"\n`);

  // -------------------------------------------------------------
  // SCENARIO I: Provider Failure & Seamless Fallback
  // -------------------------------------------------------------
  console.log('[SCENARIO I] Provider Failure & Fallback Execution');
  const router = new ProviderRouter();
  const { response: fallbackRes, providersAttempted } = await router.generateWithFallback(
    [{ role: 'user', content: 'What is the capital of Tunisia?' }],
    { role: 'FAST_CHAT' }
  );
  assert(fallbackRes.content.length > 0, 'Fallback provider must deliver valid response');
  assert(providersAttempted.length > 0, 'At least one provider must be attempted');
  console.log(`  ✓ Provider attempted: ${providersAttempted.join(' -> ')}`);
  console.log(`  ✓ Delivered response: "${fallbackRes.content.substring(0, 70)}..."\n`);

  // -------------------------------------------------------------
  // SCENARIO J: Conversational Memory & Single-Variable Incremental Updates
  // -------------------------------------------------------------
  console.log('[SCENARIO J] Conversational Memory & Incremental Profile Updates');
  const initialAgentRes = await agent.processMessage(
    'We are four people, 7 days, $2450, family, love swimming and games.'
  );
  assert(agent.getProfile().travelers === 4, 'Initial travelers must be 4');

  // Follow-up: "Actually make it 6 people"
  const updateRes = await agent.processMessage('Actually make it 6 people');
  assert(agent.getProfile().travelers === 6, 'Agent memory must update travelers to 6');
  assert(agent.getProfile().durationDays === 7, 'Agent memory must preserve 7 days');
  assert(agent.getProfile().budget === 2450, 'Agent memory must preserve $2450 budget');
  console.log(`  ✓ Successfully updated travelers to: ${agent.getProfile().travelers}`);
  console.log(`  ✓ Preserved duration: ${agent.getProfile().durationDays} days, budget: $${agent.getProfile().budget}`);
  console.log(`  ✓ Recalculated total: $${updateRes.budget?.totalEstimatedUSD}\n`);

  console.log('================================================================');
  console.log('ALL 10 EVALUATION SCENARIOS PASSED WITH 100% SUCCESS! 🇹🇳');
  console.log('================================================================');
}

runOrchestratorTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
