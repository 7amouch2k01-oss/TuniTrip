import { travelAgent } from '../services/travelAgent';
import { TripPlan } from '../types';

async function runMultiPlanTest() {
  console.log('====================================================');
  console.log('TESTING TUNITRIP MULTI-PLAN & INDIVIDUAL CHATS');
  console.log('====================================================\n');

  // Test 1: Default Plans
  const defaultPlans = travelAgent.getDefaultPlans('USD');
  console.log(`[1] Default Plans loaded: ${defaultPlans.length}`);
  if (defaultPlans.length < 3) {
    throw new Error('Expected at least 3 default plans');
  }

  const confirmedPlan = defaultPlans.find((p) => p.status === 'confirmed');
  const pendingPlan = defaultPlans.find((p) => p.status === 'pending_confirmation');

  console.log(`  - Confirmed Plan: "${confirmedPlan?.title}" (Code: ${confirmedPlan?.bookingConfirmationCode})`);
  console.log(`  - Pending Plan: "${pendingPlan?.title}"`);

  if (!confirmedPlan || !pendingPlan) {
    throw new Error('Default plans must include both confirmed and pending confirmation plans');
  }

  // Test 2: Create New Plan with its own Chat
  console.log('\n[2] Creating a Brand New Plan with Individual Chat:');
  const newPlan = travelAgent.createNewPlan('Sahara Expedition & Desert Stargazing', 'USD');
  console.log(`  - Created Plan ID: ${newPlan.id}`);
  console.log(`  - Status: ${newPlan.status}`);
  console.log(`  - Messages in new plan chat: ${newPlan.messages.length}`);
  console.log(`  - Welcome Message: "${newPlan.messages[0].content.slice(0, 60)}..."`);

  if (newPlan.messages.length !== 1 || newPlan.status !== 'draft') {
    throw new Error('New plan must initialize with a fresh individual chat and draft status');
  }

  // Test 3: Chatting in the New Plan
  console.log('\n[3] Chatting with AI inside the New Plan:');
  const prompt = 'I want a 4-day Sahara desert tour with camel trekking in Douz and Tozeur for 2 people with a budget of 1200 dollars.';
  const { response, updatedPlan } = await travelAgent.processMessageForPlan(prompt, newPlan);

  console.log(`  - AI Response Message length: ${response.messageText.length} characters`);
  console.log(`  - Updated Plan Title: "${updatedPlan.title}"`);
  console.log(`  - Updated Destination: "${updatedPlan.destination}"`);
  console.log(`  - Updated Status: "${updatedPlan.status}"`);
  console.log(`  - Updated Profile Duration: ${updatedPlan.profile.durationDays} days, ${updatedPlan.profile.travelers} travelers`);

  if (updatedPlan.profile.durationDays !== 4 || updatedPlan.profile.travelers !== 2) {
    throw new Error('Profile was not updated properly for the new plan');
  }

  // Verify that the original confirmed plan's chat remains untouched
  if (confirmedPlan.messages.length < 3) {
    throw new Error('Original plan messages were compromised');
  }
  console.log(`  ✓ Plan isolation verified: Confirmed plan retains its ${confirmedPlan.messages.length} messages untouched`);

  console.log('\n====================================================');
  console.log('ALL MULTI-PLAN TESTS PASSED SUCCESSFULLY! 🇹🇳');
  console.log('====================================================\n');
}

runMultiPlanTest().catch((err) => {
  console.error('Multi-plan test failed:', err);
  process.exit(1);
});
