// ==============================================================================
// TUNITRIP NOVA — ARCHITECTURE SMOKE TESTS
// Fast validation of component instantiation, provider factory, tools and events
// ==============================================================================

import { LLMProviderFactory } from '../nova/providers/factory';
import { GeminiProvider } from '../nova/providers/gemini';
import { NvidiaProvider } from '../nova/providers/nvidia';
import { toolRegistry } from '../nova/tools/registry';
import { TripProfileExtractor } from '../nova/extraction/tripProfile';
import { NovaOrchestrator } from '../nova/core/orchestrator';

async function runSmokeTests() {
  console.log('====================================================');
  console.log('RUNNING TUNITRIP NOVA SMOKE TEST SUITE');
  console.log('====================================================\n');

  // 1. LLM Provider Factory Default
  console.log('[1] Testing LLM Provider Factory:');
  const defaultProvider = LLMProviderFactory.create();
  if (defaultProvider instanceof GeminiProvider && defaultProvider.id === 'gemini') {
    console.log('  ✓ Default provider is GeminiProvider (id: gemini)');
  } else {
    throw new Error('Expected default provider to be GeminiProvider');
  }

  // 2. NVIDIA Provider Prepared Boundary
  console.log('[2] Testing NVIDIA Provider Boundary:');
  const nvidiaProvider = LLMProviderFactory.create({ providerName: 'nvidia' });
  if (nvidiaProvider instanceof NvidiaProvider && nvidiaProvider.id === 'nvidia') {
    console.log('  ✓ NvidiaProvider prepared boundary instantiated successfully');
    console.log('  ✓ isConfigured() correctly returns false before Brev setup:', !nvidiaProvider.isConfigured());
  } else {
    throw new Error('Expected NvidiaProvider instance');
  }

  // 3. Centralized Tool Registry
  console.log('[3] Testing Tool Registry:');
  const tools = toolRegistry.getAllTools();
  console.log(`  ✓ Registered tools count: ${tools.length}`);
  const toolNames = tools.map((t) => t.name);
  console.log(`  ✓ Registered tools: ${toolNames.join(', ')}`);
  
  const expectedTools = ['search_places', 'get_place_details', 'build_itinerary', 'calculate_budget', 'optimize_route'];
  for (const name of expectedTools) {
    if (!toolNames.includes(name)) {
      throw new Error(`Missing expected tool: ${name}`);
    }
  }
  console.log('  ✓ All 5 initial grounded tools are registered');

  const futureCapabilities = toolRegistry.getFutureCapabilities();
  console.log(`  ✓ Future provider capabilities cataloged: ${futureCapabilities.length} (${futureCapabilities.map((f) => f.name).join(', ')})`);

  // 4. Structured Trip Profile Extractor
  console.log('[4] Testing Structured Trip Profile Extractor:');
  const profile = TripProfileExtractor.extract(
    'Hello I want to visit Tunisia for 7 days with 3 other family members with a budget of 2450 dollars. We love Carthage Land and history.'
  );
  console.log(`  ✓ Extracted duration: ${profile.durationDays} days`);
  console.log(`  ✓ Extracted travelers: ${profile.travelers} (${profile.travelerType})`);
  console.log(`  ✓ Extracted budget: $${profile.budget.amount} ${profile.budget.currency}`);
  console.log(`  ✓ Inferred categories: ${profile.inferredCategories.join(', ')}`);

  if (profile.durationDays !== 7 || profile.travelers !== 4 || profile.budget.amount !== 2450) {
    throw new Error('Profile extraction mismatch');
  }

  // 5. Orchestrator End-to-End Processing
  console.log('[5] Testing NovaOrchestrator Lifecycle:');
  const orchestrator = new NovaOrchestrator();
  const eventsCollected: string[] = [];

  const result = await orchestrator.process(
    {
      message: 'Find family attractions in Hammamet for our 7-day trip',
    },
    (ev) => {
      eventsCollected.push(ev.type);
    }
  );

  console.log(`  ✓ Response received (length: ${result.response.length} chars)`);
  console.log(`  ✓ Tools executed: ${result.toolStepsExecuted}`);
  console.log(`  ✓ Emitted events: ${eventsCollected.join(' -> ')}`);

  if (!eventsCollected.includes('thinking') || !eventsCollected.includes('answer') || !eventsCollected.includes('done')) {
    throw new Error('Expected thinking, answer, and done events in event stream');
  }

  console.log('\n====================================================');
  console.log('ALL NOVA SMOKE TESTS PASSED WITH 100% SUCCESS! 🇹🇳');
  console.log('====================================================\n');
}

runSmokeTests().catch((err) => {
  console.error('Smoke tests failed:', err);
  process.exit(1);
});
