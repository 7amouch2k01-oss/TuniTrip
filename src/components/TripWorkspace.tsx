import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Car,
  Hotel,
  Info,
  Sparkles,
  ArrowRight,
  Ticket,
  PanelRightClose,
  FolderHeart,
} from 'lucide-react';
import {
  BudgetBreakdown,
  Currency,
  ItineraryDay,
  PlaceItem,
  PlanStatus,
  TripPlan,
  TripProfile,
} from '../types';
import { budgetService } from '../services/budgetEngine';
import { InteractiveMap } from './InteractiveMap';
import { PlansHubView } from './PlansHubView';

interface TripWorkspaceProps {
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  profile: TripProfile;
  currency: Currency;
  activeTab: 'itinerary' | 'map' | 'budget' | 'bookings' | 'plans';
  onSelectTab: (tab: 'itinerary' | 'map' | 'budget' | 'bookings' | 'plans') => void;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onTriggerBookingReview: () => void;
  bookingStatusAll: 'not_booked' | 'ready_to_book' | 'confirmed';
  plans?: TripPlan[];
  activePlanId?: string;
  planTitle?: string;
  planStatus?: PlanStatus;
  onSelectPlan?: (planId: string) => void;
  onCreateNewPlan?: () => void;
  onOpenBookingModalForPlan?: (plan: TripPlan) => void;
  onCloseWorkspace?: () => void;
}

export const TripWorkspace: React.FC<TripWorkspaceProps> = ({
  itinerary,
  budget,
  profile,
  currency,
  activeTab,
  onSelectTab,
  onOpenPlaceDetails: _onOpenPlaceDetails,
  onTriggerBookingReview,
  bookingStatusAll,
  plans = [],
  activePlanId,
  planTitle: _planTitle,
  planStatus,
  onSelectPlan,
  onCreateNewPlan,
  onOpenBookingModalForPlan,
  onCloseWorkspace,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const activeDay = itinerary.find((d) => d.dayNumber === selectedDayNumber) || itinerary[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[740px] lg:h-[calc(100vh-8.5rem)] min-h-[640px]">
      
      {/* Workspace Header: Clean Monochrome Tabs & Actions */}
      <div className="bg-white px-4 py-3 border-b border-neutral-200 flex items-center justify-between gap-3 shrink-0">
        {/* Workspace Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'map', label: 'Map', icon: MapPin },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'bookings', label: 'Bookings', icon: CheckCircle2, hasBadge: bookingStatusAll === 'ready_to_book' },
            { id: 'plans', label: 'Saved Plans', icon: FolderHeart },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.hasBadge && (
                  <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse ml-0.5 border border-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Actions: Status Badge & Close */}
        <div className="flex items-center gap-2 shrink-0">
          {planStatus === 'confirmed' ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white border border-neutral-800">
              <CheckCircle2 className="w-3 h-3 text-white" />
              Confirmed
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              <Clock className="w-3 h-3 text-neutral-500" />
              Draft
            </span>
          )}

          {onCloseWorkspace && (
            <button
              onClick={onCloseWorkspace}
              className="p-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Close panel"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="panel-scroll flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-6">
        
        {/* ================= TAB 1: ITINERARY VIEW ================= */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Day Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {itinerary.map((day) => {
                const isSelected = day.dayNumber === selectedDayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => {
                      setSelectedDayNumber(day.dayNumber);
                      setSelectedActivityId(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <span className="font-bold text-xs">Day 0{day.dayNumber}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {day.city.split('&')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Detail */}
            {activeDay && (
              <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
                      Day 0{activeDay.dayNumber} Schedule • {activeDay.city}
                    </span>
                    <h3 className="font-bold text-lg sm:text-xl text-neutral-900 mt-0.5">
                      {activeDay.title}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Est. Day Total
                    </span>
                    <span className="font-bold text-sm sm:text-base text-neutral-900">
                      {budgetService.formatCurrency(activeDay.dailyTotalUSD, currency)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {activeDay.summary}
                </p>

                {/* Transit Info Banner */}
                {activeDay.travelInfo && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 font-medium">
                    <Car className="w-4 h-4 text-neutral-700 shrink-0" />
                    <span><strong>Transit Info:</strong> {activeDay.travelInfo}</span>
                  </div>
                )}

                {/* Day Activities Timeline */}
                <div className="space-y-3 pt-1">
                  {activeDay.activities.map((act, idx) => (
                    <div
                      key={act.id || idx}
                      onClick={() => setSelectedActivityId(act.id)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-3.5 ${
                        selectedActivityId === act.id
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      {/* Photo Thumbnail (with grayscale filter for crisp monochrome look) */}
                      <div className="relative w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 shadow-2xs border border-neutral-200 bg-neutral-100">
                        <img
                          src={act.imageUrl}
                          alt={act.title}
                          className="w-full h-full object-cover grayscale contrast-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-neutral-900/85 backdrop-blur-md px-2 py-0.5 rounded text-white text-[10px] font-bold">
                          {act.time}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-neutral-900 text-sm">{act.title}</h4>
                            <span className="font-bold text-xs text-neutral-900 shrink-0">
                              {act.costUSD > 0
                                ? `${budgetService.formatCurrency(act.costUSD, currency)} / person`
                                : 'Included / Free'}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {act.description}
                          </p>

                          {/* Why Matched */}
                          <div className="mt-2 text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded-lg font-medium border border-neutral-200 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-neutral-600 shrink-0 mt-0.5" />
                            <span><strong>Why matched:</strong> {act.reasonWhy}</span>
                          </div>
                        </div>

                        {/* Citation & Booking Status */}
                        <div className="mt-2 pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
                          <a
                            href={act.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Source: {act.sourceName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] border ${
                            bookingStatusAll === 'confirmed'
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : act.bookingStatus === 'ready_to_book'
                              ? 'bg-neutral-200 text-neutral-800 border-neutral-300'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}>
                            {bookingStatusAll === 'confirmed' ? 'Confirmed' : act.bookingStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Night Hotel Stay Card */}
                {activeDay.hotelStay && (
                  <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs border border-neutral-200">
                        <img
                          src={activeDay.hotelStay.imageUrl}
                          alt={activeDay.hotelStay.hotelName}
                          className="w-full h-full object-cover grayscale"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-500 block">
                          Nightly Accommodation Stay
                        </span>
                        <h4 className="font-bold text-neutral-900 text-sm">
                          {activeDay.hotelStay.hotelName}
                        </h4>
                        <span className="text-xs text-neutral-500 font-medium">
                          📍 {activeDay.hotelStay.city} • ★ {activeDay.hotelStay.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-900 block">
                        {budgetService.formatCurrency(activeDay.hotelStay.priceUSD, currency)}
                      </span>
                      <span className="text-[10px] text-neutral-400">/ night</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: LIVE MAP VIEW ================= */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>Showing all day destinations, hotels, and attractions</span>
              <span className="font-semibold text-neutral-900">Click any marker for location details</span>
            </div>

            <InteractiveMap
              activities={activeDay.activities}
              selectedPlaceId={selectedActivityId}
              onSelectPlace={(id) => setSelectedActivityId(id)}
              className="h-[520px] rounded-xl border border-neutral-200"
            />
          </div>
        )}

        {/* ================= TAB 3: BUDGET ENGINE VIEW ================= */}
        {activeTab === 'budget' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* 3 Key Numbers Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Your Budget
                </span>
                <div className="font-bold text-2xl sm:text-3xl text-neutral-900 mt-1">
                  {budgetService.formatCurrency(budget.userBudgetUSD, currency)}
                </div>
                <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                  Target trip limit
                </span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                  Estimated Trip
                </span>
                <div className="font-bold text-2xl sm:text-3xl text-neutral-900 mt-1">
                  {budgetService.formatCurrency(budget.totalEstimatedUSD, currency)}
                </div>
                <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                  {budget.percentageUsed}% of budget used
                </span>
              </div>

              <div className="bg-neutral-900 text-white p-4 rounded-xl border border-neutral-900">
                <span className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider block">
                  Remaining Buffer
                </span>
                <div className="font-bold text-2xl sm:text-3xl text-white mt-1">
                  +{budgetService.formatCurrency(budget.remainingUSD, currency)}
                </div>
                <span className="text-[11px] text-neutral-300 font-medium block mt-0.5">
                  Available safety cushion
                </span>
              </div>
            </div>

            {/* Budget Utilization Progress Bar */}
            <div className="bg-white rounded-xl p-4 border border-neutral-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-700">Budget Utilization</span>
                <span className="text-neutral-500 font-medium">
                  {budgetService.formatCurrency(budget.totalEstimatedUSD, currency)} of {budgetService.formatCurrency(budget.userBudgetUSD, currency)}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
                />
              </div>
              {budget.optimizationAdvice && (
                <div className="pt-2 text-xs text-neutral-600 flex items-start gap-2 border-t border-neutral-100">
                  <Info className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                  <span>{budget.optimizationAdvice}</span>
                </div>
              )}
            </div>

            {/* Clean Category Breakdown */}
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block px-1 mb-2.5">
                Expense Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">🏨 Accommodation</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.hotelsTotalUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Verified hotel stay</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">🚗 Transport</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.transportTotalUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Transfers & private car</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">🍽️ Food & Dining</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.foodTotalUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Daily meal allowance</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">🎡 Activities & Tickets</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.activitiesTotalUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Entry passes & excursions</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">🏷️ Extras & Souvenirs</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.extrasTotalUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Tips & incidentals</span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">👥 Cost Per Traveler</span>
                  <span className="font-bold text-lg text-neutral-900 mt-1 block">
                    {budgetService.formatCurrency(budget.costPerTravelerUSD, currency)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">{profile.travelers} travelers</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: BOOKINGS & CONFIRMATION ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Reassurance Header */}
            <div className={`p-5 rounded-xl border ${
              bookingStatusAll === 'confirmed'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {bookingStatusAll === 'confirmed' ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Clock className="w-5 h-5 text-neutral-700" />
                    )}
                    <h3 className={`font-bold text-lg ${bookingStatusAll === 'confirmed' ? 'text-white' : 'text-neutral-900'}`}>
                      {bookingStatusAll === 'confirmed'
                        ? 'All Reservations Confirmed & Protected'
                        : 'Ready when you are.'}
                    </h3>
                  </div>
                  <p className={`text-xs leading-relaxed max-w-xl ${bookingStatusAll === 'confirmed' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {bookingStatusAll === 'confirmed'
                      ? 'Your reservations are verified with Tunisian hotel and transport partners. Official reference vouchers have been generated below.'
                      : 'Your trip is prepared. No financial action will occur until you review and confirm the complete reservation package.'}
                  </p>
                </div>

                {/* Key Numbers Preview */}
                <div className={`flex items-center gap-4 p-3 rounded-xl border self-start sm:self-auto shrink-0 ${
                  bookingStatusAll === 'confirmed'
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-white border-neutral-200 text-neutral-900'
                }`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Estimated Total
                    </span>
                    <span className="font-bold text-base">
                      {budgetService.formatCurrency(budget.totalEstimatedUSD, currency)}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-neutral-300 dark:bg-neutral-600" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Remaining
                    </span>
                    <span className="font-bold text-base">
                      +{budgetService.formatCurrency(budget.remainingUSD, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {bookingStatusAll !== 'confirmed' && (
                <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                    <ShieldCheck className="w-4 h-4 text-neutral-700" />
                    <span>100% Guaranteed Booking Protection • ONTT Registered Partners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTab('itinerary')}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200 transition-all cursor-pointer"
                    >
                      Edit Itinerary
                    </button>
                    <button
                      onClick={onTriggerBookingReview}
                      className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Review & Confirm All Bookings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Travel Booking Cards */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block px-1">
                Itemized Trip Reservations:
              </span>

              {/* Hotel Reservation Card */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Hotel className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-neutral-900 text-sm">
                        Hasdrubal Thalassa & Spa Yasmine Hammamet
                      </h4>
                      <span className="text-[10px] text-neutral-600 font-bold">5★</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      6 nights · Family Connecting Suite · Beachfront · Seawater Pool · Breakfast
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-neutral-900 block">
                      {budgetService.formatCurrency(870, currency)}
                    </span>
                    <span className="text-[10px] text-neutral-400">Total Accommodation</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: TN-HTL-7741' : 'Ready to book'}
                  </span>
                </div>
              </div>

              {/* Theme Park Tickets Card */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">
                      Carthage Land & Aqua Land Theme Park Passes
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      4 All-Day Combo Passes · 25+ Rides, Water Slides, 5D Cinema
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-neutral-900 block">
                      {budgetService.formatCurrency(64, currency)}
                    </span>
                    <span className="text-[10px] text-neutral-400">4 Guests</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: CL-PAS-9921' : 'Ready to book'}
                  </span>
                </div>
              </div>

              {/* Private Transfer Minivan Card */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">
                      Private AC Minivan & Chauffeur Fleet
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tunis Airport Roundtrip + Hammamet, Sousse & El Jem day transfers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-neutral-900 block">
                      {budgetService.formatCurrency(290, currency)}
                    </span>
                    <span className="text-[10px] text-neutral-400">7-Day Transit</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: TN-TRN-3418' : 'Ready to book'}
                  </span>
                </div>
              </div>

              {/* Bottom CTA */}
              {bookingStatusAll !== 'confirmed' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onTriggerBookingReview}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Review & Confirm All Bookings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Official Deep Links */}
            <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-2">
              <span>Secure official partner booking integrations:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://carthageland.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Carthage Land Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://hasdrubal-hotels.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Hasdrubal Direct</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PLANS HUB (CONFIRMED & PENDING) ================= */}
        {activeTab === 'plans' && (
          <PlansHubView
            plans={plans}
            activePlanId={activePlanId || ''}
            currency={currency}
            onSelectPlan={(id) => {
              if (onSelectPlan) onSelectPlan(id);
            }}
            onCreateNewPlan={() => {
              if (onCreateNewPlan) onCreateNewPlan();
            }}
            onOpenBookingModal={(plan) => {
              if (onOpenBookingModalForPlan) onOpenBookingModalForPlan(plan);
              else onTriggerBookingReview();
            }}
            onSwitchToTab={(tab) => onSelectTab(tab)}
          />
        )}

      </div>
    </div>
  );
};
