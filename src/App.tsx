import React, { useState, useEffect } from 'react';
import {
  Currency,
  ItineraryDay,
  PlaceItem,
  PlanMode,
  ToolExecutionStep,
  TripProfile,
  ChatMessage,
  BudgetBreakdown,
} from './types';
import { travelAgent } from './services/travelAgent';
import { budgetService } from './services/budgetEngine';
import { Navbar } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { StickyStorytelling } from './components/StickyStorytelling';
import { StickyDestinationStory } from './components/StickyDestinationStory';
import { UnforgettableExperiences } from './components/UnforgettableExperiences';
import { ChatInterface } from './components/ChatInterface';
import { TripWorkspace } from './components/TripWorkspace';
import { ExploreView } from './components/ExploreView';
import { SavedPlacesView } from './components/SavedPlacesView';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

export function App() {
  const [activeNav, setActiveNav] = useState<'planner' | 'explore' | 'workspace' | 'saved'>('planner');
  const [workspaceTab, setWorkspaceTab] = useState<'itinerary' | 'map' | 'budget' | 'bookings'>('itinerary');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [showHero, setShowHero] = useState<boolean>(true);

  // Agent & Trip State
  const [profile, setProfile] = useState<TripProfile>(() => travelAgent.getProfile());
  const [planModes, setPlanModes] = useState<PlanMode[]>(() => travelAgent.getPlanModes());
  const [activePlanId, setActivePlanId] = useState<string>('family-adventure');
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => travelAgent.getActiveItinerary());
  const [budget, setBudget] = useState<BudgetBreakdown>(() => travelAgent.getBudget());
  const [bookingStatusAll, setBookingStatusAll] = useState<'not_booked' | 'ready_to_book' | 'confirmed'>('ready_to_book');

  // Chat stream
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentToolSteps, setCurrentToolSteps] = useState<ToolExecutionStep[]>([]);
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

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          content: `**As-salamu alaykum! Welcome to TuniTrip.** 🇹🇳\n\nI’m your local Tunisian AI travel architect. I research destinations across Tunisia, match your travel pace and interests, calculate budgets in your currency, and assemble verified day-by-day itineraries.\n\nTell me about your dream Tunisia trip! For example:\n> *“Hello, I want to visit Tunisia for 7 days with 3 other family members. We love games like Disneyland or Carthage Land, history, swimming and calm places. Our budget is $2,450.”*`,
          timestamp: 'Just now',
        },
      ]);
    }
  }, []);

  // Update currency changes across travel profile & budget
  const handleChangeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    const updated = travelAgent.updateProfile({ currency: newCurrency });
    setProfile(updated);
    setBudget(travelAgent.getBudget());
  };

  // Send message to AI travel agent
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isAgentThinking) return;

    setShowHero(false);
    setActiveNav('planner');

    // Scroll to planner view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsAgentThinking(true);
    setCurrentToolSteps([]);

    try {
      const response = await travelAgent.processMessage(text, (step) => {
        setCurrentToolSteps((prev) => {
          const existingIdx = prev.findIndex((s) => s.toolName === step.toolName);
          if (existingIdx >= 0) {
            const next = [...prev];
            next[existingIdx] = step;
            return next;
          }
          return [...prev, step];
        });
      });

      // Update state with structured response
      setProfile(travelAgent.getProfile());
      setItinerary(travelAgent.getActiveItinerary());
      setBudget(travelAgent.getBudget());
      setPlanModes(travelAgent.getPlanModes());

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'assistant',
        content: response.messageText,
        timestamp: 'Just now',
        structuredData: response,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Agent error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content:
          'I encountered an issue verifying one of the live travel endpoints, but I have retained all verified Tunisian records. How would you like to proceed?',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Trigger Demo Mode: The exact investor scenario from Section 19!
  const handleTriggerDemo = () => {
    const demoPrompt =
      'Hello I wanna visit Tunisia for 7 days with 3 other family members. We love playing games like Disneyland or Carthage Land games. We love history and swimming and calm places. My budget is 2450 dollars.';
    handleSendMessage(demoPrompt);
  };

  const handleSelectPlanMode = (planId: string) => {
    setActivePlanId(planId);
    const { itinerary: newItinerary, budget: newBudget } = travelAgent.setActivePlan(planId);
    setItinerary(newItinerary);
    setBudget(newBudget);
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
      reasonWhy: `Added directly by you from our Explore collection.`,
      sourceName: place.sourceName,
      sourceUrl: place.sourceUrl,
      bookingStatus: 'ready_to_book' as const,
    };

    setItinerary((prev) => {
      const next = [...prev];
      if (next.length > 0) {
        next[0].activities.push(newAct);
      }
      return next;
    });

    setWorkspaceTab('itinerary');
    setActiveNav('workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-slate-800 selection:bg-[#088395]/20 selection:text-[#0A4D68]">
      
      {/* Sticky/Transparent Responsive Navbar */}
      <Navbar
        activeTab={activeNav}
        onSelectTab={(tab) => {
          setActiveNav(tab);
          if (tab === 'planner') setShowHero(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
        onTriggerDemo={handleTriggerDemo}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedCount={savedPlaceIds.length}
        isTransparent={showHero && activeNav === 'planner'}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        
        {/* ================= LANDING PAGE EDITORIAL EXPERIENCE ================= */}
        {showHero && activeNav === 'planner' && (
          <>
            {/* Cinematic Hero Section */}
            <HeroLanding
              onStartPlanning={(prompt) => {
                if (prompt) {
                  handleSendMessage(prompt);
                } else {
                  setShowHero(false);
                }
              }}
              onExplore={() => {
                setActiveNav('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTriggerDemo={handleTriggerDemo}
            />

            {/* Sticky Scroll Storytelling Section ("One country. A thousand ways to experience it.") */}
            <StickyStorytelling
              onStartPlanningWithPrompt={(prompt) => handleSendMessage(prompt)}
            />

            {/* Sticky Destination Story ("Destinations Worth Remembering") */}
            <StickyDestinationStory
              onPlanDestination={(destName) => {
                handleSendMessage(`Plan a trip in Tunisia featuring ${destName}`);
              }}
            />

            {/* Unforgettable Experiences Section (Matching Reference Image) */}
            <UnforgettableExperiences
              currency={currency}
              onStartPlanningWithPrompt={(prompt) => handleSendMessage(prompt)}
            />
          </>
        )}

        {/* ================= AI PLANNER & WORKSPACE INTERFACE ================= */}
        {activeNav === 'planner' && !showHero && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 animate-fadeIn">
            
            {/* Subtle Integrated Trip Context Header (Section 3) */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADBCE]/70">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0A4D68]/10 text-[#0A4D68] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 text-[#0A4D68]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#088395]">
                      AI TRAVEL ARCHITECT
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-serif font-bold text-sm text-slate-900">
                      Tunisia Family Coastal & Adventure Escape
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>4 guests</span>
                    <span>·</span>
                    <span>7 days</span>
                    <span>·</span>
                    <span>{budgetService.formatCurrency(profile.budget, currency)} budget</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/60 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Status: {bookingStatusAll === 'confirmed' ? 'Booked' : bookingStatusAll === 'ready_to_book' ? 'Ready to Confirm' : 'Planning'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                <button
                  onClick={() => {
                    setShowHero(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-[#EADBCE] transition-all cursor-pointer text-xs"
                >
                  View Editorial Homepage
                </button>
                <button
                  onClick={handleTriggerDemo}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A4D68] hover:bg-[#088395] text-white font-bold transition-all cursor-pointer text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Reset Demo Scenario</span>
                </button>
              </div>
            </div>

            {/* Dual Grid: AI Conversational Workspace (Left ~42%) + Trip Workspace (Right ~58%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
              
              {/* Left Column: Conversational AI Travel Agent (5 cols = ~42%, Sticky on Desktop) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <ChatInterface
                  messages={messages}
                  currentToolSteps={currentToolSteps}
                  isAgentThinking={isAgentThinking}
                  profile={profile}
                  currency={currency}
                  planModes={planModes}
                  activePlanId={activePlanId}
                  onSelectPlanMode={handleSelectPlanMode}
                  onSendMessage={handleSendMessage}
                  onOpenPlaceDetails={(place) => setSelectedPlace(place)}
                  onTriggerBookingReview={() => setIsBookingModalOpen(true)}
                  onSwitchToWorkspaceTab={(tab) => {
                    setWorkspaceTab(tab);
                    setActiveNav('workspace');
                  }}
                />
              </div>

              {/* Right Column: Digital Notebook / Itinerary / Map (7 cols = ~58%) */}
              <div className="lg:col-span-7">
                <TripWorkspace
                  itinerary={itinerary}
                  budget={budget}
                  profile={profile}
                  currency={currency}
                  activeTab={workspaceTab}
                  onSelectTab={(tab) => setWorkspaceTab(tab)}
                  onOpenPlaceDetails={(place) => setSelectedPlace(place)}
                  onTriggerBookingReview={() => setIsBookingModalOpen(true)}
                  bookingStatusAll={bookingStatusAll}
                />
              </div>
            </div>

            {/* Sticky Bottom Booking Bar (Section 21) */}
            {bookingStatusAll === 'ready_to_book' && (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EADBCE] shadow-lg py-3 px-4 sm:px-8 animate-fadeIn">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                      ✓
                    </div>
                    <div>
                      <span className="font-serif font-bold text-slate-900 text-sm">
                        {budgetService.formatCurrency(1980, currency)} estimated total
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        within your {budgetService.formatCurrency(profile.budget, currency)} budget
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setWorkspaceTab('bookings');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      View Reservations
                    </button>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-bold shadow-md shadow-[#088395]/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Review & Confirm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= EXPLORE VIEW ================= */}
        {activeNav === 'explore' && (
          <div className="pt-20">
            <ExploreView
              currency={currency}
              onOpenPlaceDetails={(place) => setSelectedPlace(place)}
              onAddToTrip={handleAddToTrip}
              savedPlaceIds={savedPlaceIds}
              onToggleSave={handleToggleSave}
            />
          </div>
        )}

        {/* ================= DEDICATED TRIP WORKSPACE VIEW ================= */}
        {activeNav === 'workspace' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <TripWorkspace
              itinerary={itinerary}
              budget={budget}
              profile={profile}
              currency={currency}
              activeTab={workspaceTab}
              onSelectTab={(tab) => setWorkspaceTab(tab)}
              onOpenPlaceDetails={(place) => setSelectedPlace(place)}
              onTriggerBookingReview={() => setIsBookingModalOpen(true)}
              bookingStatusAll={bookingStatusAll}
            />
          </div>
        )}

        {/* ================= SAVED PLACES VIEW ================= */}
        {activeNav === 'saved' && (
          <div className="pt-20">
            <SavedPlacesView
              savedPlaceIds={savedPlaceIds}
              currency={currency}
              onOpenPlaceDetails={(place) => setSelectedPlace(place)}
              onRemoveSaved={(id) => setSavedPlaceIds((prev) => prev.filter((pId) => pId !== id))}
              onExploreMore={() => {
                setActiveNav('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

      </main>

      {/* Global Luxury Footer */}
      <Footer
        onSelectNav={(tab) => {
          setActiveNav(tab);
          if (tab === 'planner') setShowHero(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

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
        onClose={() => setIsBookingModalOpen(false)}
        budget={budget}
        profile={profile}
        currency={currency}
        onConfirmBookings={() => {
          setBookingStatusAll('confirmed');
          setWorkspaceTab('bookings');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
        profile={profile}
        onUpdateProfile={(updates) => setProfile(travelAgent.updateProfile(updates))}
      />

    </div>
  );
}

export default App;
