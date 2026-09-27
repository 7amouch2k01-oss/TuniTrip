import React, { useState } from 'react';
import {
  Currency,
  TripPlan,
  PlaceItem,
  ChatMessage,
} from './types';
import { travelAgent } from './services/travelAgent';
import { budgetService } from './services/budgetEngine';
import { ChatInterface } from './components/ChatInterface';
import { TripWorkspace } from './components/TripWorkspace';
import { PlanSidebar } from './components/PlanSidebar';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ArrowRight, Clock } from 'lucide-react';

export function App() {
  const [workspaceTab, setWorkspaceTab] = useState<'itinerary' | 'map' | 'budget' | 'bookings' | 'plans'>('itinerary');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(true);

  // Multi-Plan State (Each plan has its own dedicated conversation + workspace)
  const [plans, setPlans] = useState<TripPlan[]>(() => travelAgent.getDefaultPlans('USD'));
  const [activePlanId, setActivePlanId] = useState<string>('plan-family-coastal');
  const [isPlanSidebarCollapsed, setIsPlanSidebarCollapsed] = useState<boolean>(false);
  const [planToConfirm, setPlanToConfirm] = useState<TripPlan | null>(null);

  // Active Plan Derivation
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || travelAgent.getDefaultPlans(currency)[0];

  // Agent Thinking state
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);

  // Modals & Saved Places
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([
    'carthage-land-hammamet',
    'hotel-hasdrubal-thalassa-hammamet',
    'sidi-bou-said-village',
  ]);

  // Update currency changes across travel profile & budget
  const handleChangeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setPlans((prev) =>
      prev.map((plan) => {
        const updatedProfile = { ...plan.profile, currency: newCurrency };
        const updatedBudget = budgetService.calculate(plan.itinerary, updatedProfile, newCurrency);
        return {
          ...plan,
          profile: updatedProfile,
          budget: updatedBudget,
        };
      })
    );
  };

  // Create a brand new plan with its own fresh AI chat
  const handleCreateNewPlan = () => {
    const newPlan = travelAgent.createNewPlan(undefined, currency);
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
  };

  // Select an existing plan
  const handleSelectPlan = (planId: string) => {
    setActivePlanId(planId);
  };

  // Delete a plan
  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => {
      const remaining = prev.filter((p) => p.id !== planId);
      if (activePlanId === planId && remaining.length > 0) {
        setActivePlanId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Send message to AI travel agent within the active plan's chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isAgentThinking || !activePlan) return;

    // Add user message to active plan
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: 'Just now',
    };

    const currentPlanSnapshot: TripPlan = {
      ...activePlan,
      messages: [...activePlan.messages, userMsg],
      currentToolSteps: [],
    };

    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? currentPlanSnapshot : p))
    );

    setIsAgentThinking(true);

    try {
      const { response, updatedPlan } = await travelAgent.processMessageForPlan(
        text,
        currentPlanSnapshot,
        (step) => {
          setPlans((prev) =>
            prev.map((p) => {
              if (p.id !== activePlan.id) return p;
              const existingIdx = p.currentToolSteps.findIndex((s) => s.toolName === step.toolName);
              const nextSteps = [...p.currentToolSteps];
              if (existingIdx >= 0) {
                nextSteps[existingIdx] = step;
              } else {
                nextSteps.push(step);
              }
              return { ...p, currentToolSteps: nextSteps };
            })
          );
        }
      );

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'assistant',
        content: response.messageText,
        timestamp: 'Just now',
        structuredData: response,
      };

      const finalPlan: TripPlan = {
        ...updatedPlan,
        messages: [...currentPlanSnapshot.messages, agentMsg],
        currentToolSteps: [],
      };

      setPlans((prev) =>
        prev.map((p) => (p.id === activePlan.id ? finalPlan : p))
      );
    } catch (err) {
      console.error('Agent error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content:
          'I encountered an issue verifying one of the live travel endpoints, but I have retained all verified Tunisian records. How would you like to proceed?',
        timestamp: 'Just now',
      };

      setPlans((prev) =>
        prev.map((p) =>
          p.id === activePlan.id
            ? { ...p, messages: [...p.messages, errorMsg], currentToolSteps: [] }
            : p
        )
      );
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleSelectPlanMode = (planId: string) => {
    const plan = activePlan.planModes.find((p) => p.id === planId) || activePlan.planModes[0];
    if (plan) {
      const newBudget = budgetService.calculate(plan.itinerary, activePlan.profile, currency);
      setPlans((prev) =>
        prev.map((p) =>
          p.id === activePlan.id
            ? {
                ...p,
                activePlanModeId: planId,
                itinerary: plan.itinerary,
                budget: newBudget,
              }
            : p
        )
      );
    }
  };

  const handleToggleSave = (place: PlaceItem) => {
    setSavedPlaceIds((prev) =>
      prev.includes(place.id) ? prev.filter((id) => id !== place.id) : [...prev, place.id]
    );
  };

  const handleAddToTrip = (place: PlaceItem) => {
    const newAct = {
      id: `act-added-${Date.now()}`,
      time: '02:00 PM',
      title: place.title,
      description: place.shortDescription,
      category: place.category,
      city: place.city,
      durationHours: 2.5,
      costUSD: place.estimatedPrice,
      costTND: place.priceLocalTND,
      latitude: place.latitude,
      longitude: place.longitude,
      imageUrl: place.imageUrl,
      reasonWhy: `Added directly by you from our collection.`,
      sourceName: place.sourceName,
      sourceUrl: place.sourceUrl,
      bookingStatus: 'ready_to_book' as const,
    };

    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const nextItin = [...p.itinerary];
        if (nextItin.length > 0) {
          nextItin[0].activities.push(newAct);
        }
        return {
          ...p,
          itinerary: nextItin,
          budget: budgetService.calculate(nextItin, p.profile, currency),
        };
      })
    );

    setWorkspaceTab('itinerary');
    setIsWorkspaceOpen(true);
  };

  // Confirm booking for a specific plan
  const handleConfirmPlanBooking = () => {
    const targetPlan = planToConfirm || activePlan;
    if (!targetPlan) return;

    const confirmationCode = `TN-${Math.floor(1000 + Math.random() * 9000)}-CONF`;
    const confirmedMsg: ChatMessage = {
      id: `conf-${Date.now()}`,
      sender: 'assistant',
      content: `🎉 **Trip Reservations Confirmed & Guaranteed!**\n\nYour official booking reference code is **#${confirmationCode}**.\n\nAll verified hotel suites, private airport minivan transfers, and activity passes are locked in with the Tunisian National Tourism Office (ONTT) and partner suppliers.\n\nYou can access your itemized vouchers anytime in your **Saved Plans**!`,
      timestamp: 'Just now',
    };

    setPlans((prev) =>
      prev.map((p) =>
        p.id === targetPlan.id
          ? {
              ...p,
              status: 'confirmed',
              bookingConfirmationCode: confirmationCode,
              confirmedAt: 'Just now',
              messages: [...p.messages, confirmedMsg],
            }
          : p
      )
    );

    setIsBookingModalOpen(false);
    setPlanToConfirm(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      
      {/* 1. Left Column: Classic ChatGPT Dark Sidebar (Collapsible) */}
      <PlanSidebar
        plans={plans}
        activePlanId={activePlan.id}
        currency={currency}
        onSelectPlan={handleSelectPlan}
        onCreateNewPlan={handleCreateNewPlan}
        onDeletePlan={handleDeletePlan}
        onOpenPlansHub={() => {
          setIsWorkspaceOpen(true);
          setWorkspaceTab('plans');
        }}
        isCollapsed={isPlanSidebarCollapsed}
        onToggleCollapse={() => setIsPlanSidebarCollapsed((prev) => !prev)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Center Area: Chat (ChatGPT monochrome style) + Slide-Over / Side-by-Side Workspace */}
      <div className="flex-1 flex min-w-0 h-full overflow-hidden relative">
        
        {/* Chat Interface Container (Resizes smoothly when workspace opens/closes) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
          <ChatInterface
            messages={activePlan.messages}
            currentToolSteps={activePlan.currentToolSteps}
            isAgentThinking={isAgentThinking}
            profile={activePlan.profile}
            currency={currency}
            planModes={activePlan.planModes}
            activePlanId={activePlan.activePlanModeId}
            planTitle={activePlan.title}
            planStatus={activePlan.status}
            isWorkspaceOpen={isWorkspaceOpen}
            onToggleWorkspace={() => setIsWorkspaceOpen((prev) => !prev)}
            onSelectPlanMode={handleSelectPlanMode}
            onSendMessage={handleSendMessage}
            onOpenPlaceDetails={(place) => setSelectedPlace(place)}
            onTriggerBookingReview={() => {
              setIsWorkspaceOpen(true);
              setPlanToConfirm(activePlan);
              setIsBookingModalOpen(true);
            }}
            onSwitchToWorkspaceTab={(tab) => {
              setIsWorkspaceOpen(true);
              setWorkspaceTab(tab);
            }}
            onTogglePlanSidebar={() => setIsPlanSidebarCollapsed((prev) => !prev)}
            onOpenPlansHub={() => {
              setIsWorkspaceOpen(true);
              setWorkspaceTab('plans');
            }}
          />

          {/* Sticky Bottom Booking Bar (when active plan is ready for review) */}
          {activePlan.status === 'pending_confirmation' && (
            <div className="shrink-0 bg-neutral-900 text-white border-t border-neutral-800 py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0 border border-neutral-700">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-xs sm:text-sm text-white">
                    {budgetService.formatCurrency(activePlan.budget.totalEstimatedUSD, currency)} total
                  </span>
                  <span className="text-[11px] text-neutral-400 ml-2 hidden sm:inline">
                    within your {budgetService.formatCurrency(activePlan.profile.budget, currency)} budget ({activePlan.title})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setIsWorkspaceOpen(true);
                    setWorkspaceTab('plans');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  View All ({plans.length})
                </button>
                <button
                  onClick={() => {
                    setPlanToConfirm(activePlan);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Right Panel: Structured Plan Workspace (Itinerary, Map, Budget, Bookings, Saved Plans) */}
        {isWorkspaceOpen && (
          <aside className="w-full lg:w-[480px] xl:w-[580px] shrink-0 border-l border-neutral-200 h-full overflow-hidden p-3 bg-neutral-50/70 transition-all duration-300 animate-fadeIn flex flex-col">
            <TripWorkspace
              itinerary={activePlan.itinerary}
              budget={activePlan.budget}
              profile={activePlan.profile}
              currency={currency}
              activeTab={workspaceTab}
              onSelectTab={(tab) => setWorkspaceTab(tab)}
              onOpenPlaceDetails={(place) => setSelectedPlace(place)}
              onTriggerBookingReview={() => {
                setPlanToConfirm(activePlan);
                setIsBookingModalOpen(true);
              }}
              bookingStatusAll={
                activePlan.status === 'confirmed'
                  ? 'confirmed'
                  : activePlan.status === 'pending_confirmation'
                  ? 'ready_to_book'
                  : 'not_booked'
              }
              plans={plans}
              activePlanId={activePlan.id}
              planTitle={activePlan.title}
              planStatus={activePlan.status}
              onSelectPlan={handleSelectPlan}
              onCreateNewPlan={handleCreateNewPlan}
              onOpenBookingModalForPlan={(plan) => {
                setPlanToConfirm(plan);
                setIsBookingModalOpen(true);
              }}
              onCloseWorkspace={() => setIsWorkspaceOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Editorial Destination Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        currency={currency}
        onAddToTrip={handleAddToTrip}
        isSaved={selectedPlace ? savedPlaceIds.includes(selectedPlace.id) : false}
        onToggleSave={selectedPlace ? () => handleToggleSave(selectedPlace) : undefined}
      />

      {/* Explicit 2-Stage Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPlanToConfirm(null);
        }}
        budget={(planToConfirm || activePlan).budget}
        profile={(planToConfirm || activePlan).profile}
        currency={currency}
        planTitle={(planToConfirm || activePlan).title}
        onConfirmBookings={handleConfirmPlanBooking}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
        profile={activePlan.profile}
        onUpdateProfile={(updates) => {
          setPlans((prev) =>
            prev.map((p) =>
              p.id === activePlan.id
                ? {
                    ...p,
                    profile: { ...p.profile, ...updates },
                  }
                : p
            )
          );
        }}
      />

    </div>
  );
}

export default App;
