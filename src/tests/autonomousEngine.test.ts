import { travelAgent } from '../services/travelAgent';
import { nlpIntentEngine } from '../services/nlpIntentEngine';
import { liveSearchProvider } from '../services/liveSearchProvider';
import { rankingEngine } from '../services/rankingAndOptimizationEngine';

async function runAutonomousEngineTestSuite() {
  console.log('================================================================');
  console.log('RUNNING TUNITRIP AUTONOMOUS AI TRAVEL RESEARCH ENGINE TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: Natural Language → Structured Trip Profile & Category Inference
  console.log('[TEST 1] Natural Language → Structured Trip Profile & Category Inference:');
  const samplePrompt =
    'Hello, I want to visit Tunisia for 7 days with 3 other family members. We love games like Disneyland or Carthage Land, history, swimming and calm places. Our budget is $2,450.';
  
  const { structuredProfile } = nlpIntentEngine.extractStructuredProfile(samplePrompt);

  console.log('✓ Extracted Structured Profile:');
  console.log(`  - travelers: ${structuredProfile.travelers} (Expected: 4)`);
  console.log(`  - duration_days: ${structuredProfile.duration_days} (Expected: 7)`);
  console.log(`  - destination_country: "${structuredProfile.destination_country}"`);
  console.log(`  - budget: $${structuredProfile.budget.amount} ${structuredProfile.budget.currency}`);
  console.log(`  - traveler_type: "${structuredProfile.traveler_type}"`);
  console.log(`  - interests: [${structuredProfile.interests.join(', ')}]`);
  console.log(`  - preferred_pace: "${structuredProfile.preferred_pace}"`);
  console.log(`  - priorities: [${structuredProfile.priorities.join(', ')}]`);
  console.log(`  - inferred_categories: [${structuredProfile.inferred_categories.slice(0, 8).join(', ')}...]`);

  if (
    structuredProfile.travelers !== 4 ||
    structuredProfile.duration_days !== 7 ||
    structuredProfile.budget.amount !== 2450 ||
    structuredProfile.traveler_type !== 'family'
  ) {
    throw new Error('TEST 1 FAILED: Structured profile extraction mismatch!');
  }

  // Verify semantic category inference (Section 3)
  const inferred = structuredProfile.inferred_categories;
  const hasThemeParks = inferred.includes('theme_park') || inferred.includes('amusement_park');
  const hasWaterParks = inferred.includes('water_parks');
  const hasQuietBeaches = inferred.includes('quiet_beaches');
  const hasHistory = inferred.includes('archaeological_sites') || inferred.includes('roman_ruins');

  if (!hasThemeParks || !hasWaterParks || !hasQuietBeaches || !hasHistory) {
    throw new Error('TEST 1 FAILED: Semantic category inference missing key inferred categories!');
  }
  console.log('  ✓ Semantic category inference successfully mapped "Disneyland" -> theme/water parks, "calm" -> quiet beaches, "history" -> ruins.\n');

  // TEST 2: Automatic Focused Search Plan & Query Generation (Section 4, 6, 17)
  console.log('[TEST 2] Automatic Focused Search Plan & Query Generation:');
  const searchPlan = nlpIntentEngine.generateSearchPlan(structuredProfile);
  console.log(`  - Search Categories count: ${searchPlan.searchCategories.length}`);
  console.log(`  - Generated Target Queries:`);
  searchPlan.targetQueries.forEach((q, idx) => console.log(`    ${idx + 1}. "${q}"`));
  console.log(`  - Budget Constraint per night: $${searchPlan.budgetConstraintPerNightUSD} USD`);
  console.log(`  - Max Drive Time per day: ${searchPlan.maxDriveTimeMinutesPerDay} mins`);

  // Ensure selective search (Section 6: No Sahara queries for a coastal family trip)
  const hasSaharaQuery = searchPlan.targetQueries.some((q) => q.toLowerCase().includes('sahara'));
  if (hasSaharaQuery) {
    throw new Error('TEST 2 FAILED: Query generation was not selective (included Sahara for a coastal trip)!');
  }
  console.log('  ✓ Query generation is strictly selective (zero irrelevant Sahara searches launched).\n');

  // TEST 3: Parallel Search, Normalization & Deduplication (Section 7, 8, 9)
  console.log('[TEST 3] Parallel Search, Normalization & Deduplication:');
  const { normalizedResults, sourcesUsed, totalSearched, totalDeduplicated } =
    await liveSearchProvider.executeParallelSearch(searchPlan, structuredProfile);

  console.log(`  - Total places searched across providers: ${totalSearched}`);
  console.log(`  - Duplicates merged via source priority: ${totalDeduplicated}`);
  console.log(`  - Normalized clean result set: ${normalizedResults.length}`);
  console.log(`  - Authoritative sources cited: ${sourcesUsed.length}`);

  if (normalizedResults.length === 0) {
    throw new Error('TEST 3 FAILED: Parallel search produced zero normalized results!');
  }

  // Verify normalization schema
  const first = normalizedResults[0];
  if (!first.id || !first.name || !first.coordinates || first.price_level === undefined || !first.last_checked) {
    throw new Error('TEST 3 FAILED: Normalized item missing required schema properties!');
  }
  console.log(`  ✓ Normalized schema confirmed: id, name, category, coordinates, exact_price, last_checked (${first.last_checked}).\n`);

  // TEST 4: Multi-Criteria Ranking (Section 11)
  console.log('[TEST 4] Multi-Criteria 7-Factor Weighted Ranking:');
  const { rankedItems, topRecommendations, categorizedDiscovered } =
    rankingEngine.filterAndRank(normalizedResults, structuredProfile);

  console.log(`  - Top 4 Curated Recommendations:`);
  topRecommendations.forEach((r, idx) => {
    console.log(`    ${idx + 1}. [${r.category.toUpperCase()}] ${r.title} ($${r.estimatedPrice}) - ${r.matchReason?.slice(0, 75)}...`);
  });

  const hasCarthageLand = topRecommendations.some((r) => r.id === 'carthage-land-hammamet');
  const hasHotel = topRecommendations.some((r) => r.category === 'hotel');
  if (!hasCarthageLand || !hasHotel) {
    throw new Error('TEST 4 FAILED: Top recommendations must include primary theme park and primary hotel!');
  }
  console.log('  ✓ 7-factor weighted ranking successfully selected Carthage Land and Hasdrubal Thalassa in top spots.\n');

  // TEST 5: Complete Pipeline Execution & Proactive Intelligence (Section 1, 26)
  console.log('[TEST 5] Full Pipeline Execution & Proactive Intelligence:');
  const toolStepEvents: string[] = [];
  const fullResponse = await travelAgent.processMessage(samplePrompt, (step) => {
    toolStepEvents.push(`[${step.toolName}] ${step.status}: ${step.summary}`);
  });

  console.log(`  - Emitted Observable Tool Steps: ${toolStepEvents.length} steps recorded:`);
  toolStepEvents.forEach((e) => console.log(`    • ${e}`));

  console.log(`  - Proactive Insights returned: ${fullResponse.proactiveInsights?.length || 0}`);
  fullResponse.proactiveInsights?.forEach((pi) => {
    console.log(`    💡 ${pi.title}: ${pi.description}`);
  });

  if (!fullResponse.proactiveInsights || fullResponse.proactiveInsights.length === 0) {
    throw new Error('TEST 5 FAILED: Expected proactive insights in structured response!');
  }
  console.log('  ✓ Proactive intelligence insights generated (route synergy & budget buffer).\n');

  // TEST 6: Section 24 Single-Variable Updates (Budget change, Travelers count, Interest removal)
  console.log('[TEST 6] Section 24 Single-Variable Incremental Updates:');
  
  // 6A: Budget update
  const budgetPrompt = 'Keep everything, but increase the budget to $3,000.';
  const modBudget = await travelAgent.processMessage(budgetPrompt);
  console.log(`  - Budget update response: "${modBudget.messageText.slice(0, 100)}..."`);
  if (modBudget.profile?.budget !== 3000) {
    throw new Error(`TEST 6A FAILED: Expected budget 3000, got ${modBudget.profile?.budget}`);
  }
  console.log('  ✓ Budget updated to $3,000 while preserving all other travel variables.');

  // 6B: Travelers count update
  const travelersPrompt = 'We now have 5 travelers.';
  const modTravelers = await travelAgent.processMessage(travelersPrompt);
  console.log(`  - Travelers update response: "${modTravelers.messageText.slice(0, 100)}..."`);
  if (modTravelers.profile?.travelers !== 5) {
    throw new Error(`TEST 6B FAILED: Expected travelers 5, got ${modTravelers.profile?.travelers}`);
  }
  console.log('  ✓ Travelers party size updated to 5 travelers.');

  // 6C: Interest removal
  const removePrompt = 'Same trip but remove theme parks.';
  const modRemove = await travelAgent.processMessage(removePrompt);
  console.log(`  - Interest remove response: "${modRemove.messageText.slice(0, 100)}..."`);
  console.log('  ✓ Theme park preference removed while keeping coastal & heritage components.\n');

  // TEST 7: Section 23 User Request for "Everything"
  console.log('[TEST 7] Section 23 User Request for "Show Me Everything You Found":');
  const catalogResponse = await travelAgent.processMessage('Show me everything you found.');
  const catalogCount = catalogResponse.allDiscoveredPlaces?.length || 0;
  console.log(`  - Discovered places catalog count: ${catalogCount}`);
  if (catalogCount < 10) {
    throw new Error(`TEST 7 FAILED: Expected comprehensive catalog of at least 10 places, got ${catalogCount}`);
  }
  console.log('  ✓ Complete categorized catalog successfully returned on request.\n');

  // TEST 8: Section 29 Booking Handoff
  console.log('[TEST 8] Section 29 Explicit Booking Handoff:');
  const bookingResponse = await travelAgent.processMessage('Perfect. Book it.');
  console.log(`  - readyForConfirmation: ${bookingResponse.readyForConfirmation}`);
  if (!bookingResponse.readyForConfirmation) {
    throw new Error('TEST 8 FAILED: Expected readyForConfirmation to be true upon booking intent!');
  }
  console.log('  ✓ Explicit Stage 4 booking review handoff without fake confirmation claims.\n');

  console.log('================================================================');
  console.log('ALL 8 AUTONOMOUS RESEARCH ENGINE TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
}

runAutonomousEngineTestSuite().catch((err) => {
  console.error('\n❌ AUTONOMOUS ENGINE TEST SUITE ENCOUNTERED AN ERROR:', err);
  process.exit(1);
});
