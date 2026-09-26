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
} from 'lucide-react';
import {
  BudgetBreakdown,
  Currency,
  ItineraryDay,
  PlaceItem,
  TripProfile,
} from '../types';
import { budgetService } from '../services/budgetEngine';
import { InteractiveMap } from './InteractiveMap';

interface TripWorkspaceProps {
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  profile: TripProfile;
  currency: Currency;
  activeTab: 'itinerary' | 'map' | 'budget' | 'bookings';
  onSelectTab: (tab: 'itinerary' | 'map' | 'budget' | 'bookings') => void;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onTriggerBookingReview: () => void;
  bookingStatusAll: 'not_booked' | 'ready_to_book' | 'confirmed';
}

export const TripWorkspace: React.FC<TripWorkspaceProps> = ({
  itinerary,
  budget,
  profile,
  currency,
  activeTab,
  onSelectTab,
  onOpenPlaceDetails,
  onTriggerBookingReview,
  bookingStatusAll,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const activeDay = itinerary.find((d) => d.dayNumber === selectedDayNumber) || itinerary[0];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#EADBCE] overflow-hidden flex flex-col h-[740px] lg:h-[calc(100vh-8.5rem)] min-h-[640px]">
      
      {/* Workspace Top Header (Section 10 & 11) */}
      <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#EADBCE] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#088395] block">
              PERSONALIZED TRIP WORKSPACE
            </span>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
              Tunisia Family Coastal & Adventure Escape
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {profile.durationDays} days · {profile.travelers} travelers · {budgetService.formatCurrency(profile.budget, currency)} budget
            </p>
          </div>

          {/* Compact Progress Indicator (Section 11) */}
          <div className="flex items-center gap-1 self-start md:self-auto bg-white px-3 py-1 rounded-full border border-[#EADBCE] text-[11px] font-medium text-slate-500 shadow-2xs">
            {['Planning', 'Research', 'Review', 'Confirm', 'Booked'].map((step, idx) => {
              const isBooked = bookingStatusAll === 'confirmed';
              const isReview = bookingStatusAll === 'ready_to_book';
              const isCurrent =
                (step === 'Booked' && isBooked) ||
                (step === 'Confirm' && isReview && activeTab === 'bookings') ||
                (step === 'Review' && isReview && activeTab !== 'bookings') ||
                (step === 'Research' && !isReview && !isBooked && activeTab !== 'itinerary') ||
                (step === 'Planning' && !isReview && !isBooked && activeTab === 'itinerary');

              const isPast =
                isBooked ||
                (isReview && (step === 'Planning' || step === 'Research'));

              return (
                <React.Fragment key={step}>
                  <span
                    className={`px-2 py-0.5 rounded-full transition-all text-[10px] ${
                      isCurrent
                        ? 'bg-[#0A4D68] text-white font-bold'
                        : isPast
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                  {idx < 4 && <span className="text-slate-300 text-[9px]">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Workspace Sub-tabs Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#EADBCE]/60 overflow-x-auto scrollbar-none">
          {[
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'map', label: 'Live Map', icon: MapPin },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'bookings', label: 'Bookings', icon: CheckCircle2, hasBadge: bookingStatusAll === 'ready_to_book' },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? 'bg-[#0A4D68] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-[#EADBCE]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.hasBadge && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="panel-scroll flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-6">
        
        {/* ================= TAB 1: ITINERARY VIEW (Section 15 & 16) ================= */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Sticky Day Navigation (Section 16) */}
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#0A4D68] text-white shadow-xs'
                        : 'bg-[#FAF7F2] hover:bg-slate-100 text-slate-700 border border-[#EADBCE]'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs">Day 0{day.dayNumber}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                      {day.city.split('&')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Detail */}
            {activeDay && (
              <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#088395] block">
                      Day 0{activeDay.dayNumber} Schedule • {activeDay.city}
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
                      {activeDay.title}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Est. Day Total
                    </span>
                    <span className="font-bold text-sm sm:text-base text-[#088395]">
                      {budgetService.formatCurrency(activeDay.dailyTotalUSD, currency)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {activeDay.summary}
                </p>

                {/* Transit Info Banner */}
                {activeDay.travelInfo && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] text-xs text-slate-600 font-medium">
                    <Car className="w-4 h-4 text-[#088395] shrink-0" />
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
                          ? 'border-[#088395] bg-[#E8F6F8]/40 shadow-xs'
                          : 'border-[#EADBCE] bg-white hover:border-[#088395]/40'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={act.imageUrl}
                          alt={act.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-white text-[10px] font-bold">
                          {act.time}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-serif font-bold text-slate-900 text-sm">{act.title}</h4>
                            <span className="font-bold text-xs text-[#088395] shrink-0">
                              {act.costUSD > 0
                                ? `${budgetService.formatCurrency(act.costUSD, currency)} / person`
                                : 'Included / Free'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {act.description}
                          </p>

                          {/* Why Matched */}
                          <div className="mt-2 text-[11px] text-[#0A4D68] bg-[#FAF7F2] p-2 rounded-lg font-medium border border-[#EADBCE]/60 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                            <span><strong>Why matched:</strong> {act.reasonWhy}</span>
                          </div>
                        </div>

                        {/* Citation & Booking Status */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                          <a
                            href={act.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#088395] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Source: {act.sourceName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            bookingStatusAll === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.bookingStatus === 'ready_to_book'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
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
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F0F9FA] border border-[#088395]/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={activeDay.hotelStay.imageUrl}
                          alt={activeDay.hotelStay.hotelName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[#088395] block">
                          Nightly Accommodation Stay
                        </span>
                        <h4 className="font-serif font-bold text-slate-900 text-sm">
                          {activeDay.hotelStay.hotelName}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          📍 {activeDay.hotelStay.city} • ★ {activeDay.hotelStay.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 block">
                        {budgetService.formatCurrency(activeDay.hotelStay.priceUSD, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">/ night</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: LIVE MAP VIEW (Section 17) ================= */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Showing all day destinations, hotels, and attractions</span>
              <span className="font-semibold text-[#088395]">Click any marker for location details</span>
            </div>

            <InteractiveMap
              activities={activeDay.activities}
              selectedPlaceId={selectedActivityId}
              onSelectPlace={(id) => setSelectedActivityId(id)}
              className="h-[520px] rounded-2xl"
            />
          </div>
        )}

        {/* ================= TAB 3: BUDGET ENGINE VIEW (Section 18) ================= */}
        {activeTab === 'budget' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Budget Overview Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EADBCE] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Estimated Trip Cost
                  </span>
                  <div className="font-serif font-bold text-3xl sm:text-4xl text-[#0A4D68]">
                    {budgetService.formatCurrency(budget.totalEstimatedUSD, currency)}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Target User Budget: <strong>{budgetService.formatCurrency(budget.userBudgetUSD, currency)}</strong>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Remaining Safe Buffer
                  </span>
                  <span className="font-serif font-bold text-xl text-emerald-700">
                    +{budgetService.formatCurrency(budget.remainingUSD, currency)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    {budget.percentageUsed}% of budget used
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#088395] to-[#C5A059] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>$0</span>
                  <span>Target: {budgetService.formatCurrency(budget.userBudgetUSD, currency)}</span>
                </div>
              </div>

              {/* Optimization Advice */}
              {budget.optimizationAdvice && (
                <div className="p-3 rounded-xl bg-white border border-[#EADBCE] text-xs text-slate-700 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>{budget.optimizationAdvice}</span>
                </div>
              )}
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">🏨 Accommodation</span>
                <span className="font-serif font-bold text-lg text-slate-900 mt-1 block">
                  {budgetService.formatCurrency(budget.hotelsTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">6 nights beachfront</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">🎡 Activities & Parks</span>
                <span className="font-serif font-bold text-lg text-slate-900 mt-1 block">
                  {budgetService.formatCurrency(budget.activitiesTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Carthage Land, El Jem, cruise</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">🚗 Private Transport</span>
                <span className="font-serif font-bold text-lg text-slate-900 mt-1 block">
                  {budgetService.formatCurrency(budget.transportTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">AC Minivan & chauffeur</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">🍽️ Food & Dining</span>
                <span className="font-serif font-bold text-lg text-slate-900 mt-1 block">
                  {budgetService.formatCurrency(budget.foodTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">~$18/day/traveler</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">🏷️ Extras & Souvenirs</span>
                <span className="font-serif font-bold text-lg text-slate-900 mt-1 block">
                  {budgetService.formatCurrency(budget.extrasTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Museum permits, tips</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">👥 Cost Per Traveler</span>
                <span className="font-serif font-bold text-lg text-[#088395] mt-1 block">
                  {budgetService.formatCurrency(budget.costPerTravelerUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Based on 4 travelers</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: BOOKINGS & CONFIRMATION (Section 12 & 13) ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Luxury Reassurance Header (Section 12) */}
            <div className={`p-5 rounded-2xl border ${
              bookingStatusAll === 'confirmed'
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-[#FAF7F2] border-[#EADBCE]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {bookingStatusAll === 'confirmed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600" />
                    )}
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      {bookingStatusAll === 'confirmed'
                        ? 'All Reservations Confirmed & Protected'
                        : 'Ready when you are.'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    {bookingStatusAll === 'confirmed'
                      ? 'Your reservations are verified with our Tunisian hotel and transport partners. Official reference vouchers have been generated below.'
                      : 'Your trip is prepared. No financial action will occur until you review and confirm the complete reservation package.'}
                  </p>
                </div>

                {/* Key Numbers Preview */}
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#EADBCE] self-start sm:self-auto shrink-0 shadow-2xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                      Estimated Total
                    </span>
                    <span className="font-serif font-bold text-base text-[#0A4D68]">
                      {budgetService.formatCurrency(1980, currency)}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                      Remaining
                    </span>
                    <span className="font-serif font-bold text-base text-emerald-600">
                      {budgetService.formatCurrency(470, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {bookingStatusAll !== 'confirmed' && (
                <div className="mt-4 pt-3 border-t border-[#EADBCE]/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Guaranteed Booking Protection • ONTT Registered Partners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTab('itinerary')}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-[#EADBCE] transition-all cursor-pointer"
                    >
                      Edit Itinerary
                    </button>
                    <button
                      onClick={onTriggerBookingReview}
                      className="px-5 py-2 rounded-xl bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Review & Confirm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Travel Booking Cards (Section 13) */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block px-1">
                Itemized Trip Reservations:
              </span>

              {/* Hotel Reservation Card */}
              <div className="p-4 rounded-xl bg-white border border-[#EADBCE] shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0A4D68] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Hotel className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Hasdrubal Thalassa & Spa Yasmine Hammamet
                      </h4>
                      <span className="text-[10px] text-amber-500 font-bold">5★</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      6 nights · Family Connecting Suite · Beachfront · Seawater Pool · Breakfast
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 block">
                      {budgetService.formatCurrency(870, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">Total Accommodation</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: TN-HTL-7741' : 'Ready to book'}
                  </span>
                </div>
              </div>

              {/* Theme Park Tickets Card */}
              <div className="p-4 rounded-xl bg-white border border-[#EADBCE] shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Carthage Land & Aqua Land Theme Park Passes
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      4 All-Day Combo Passes · 25+ Rides, Water Slides, 5D Cinema
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 block">
                      {budgetService.formatCurrency(64, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">4 Guests</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: CL-PAS-9921' : 'Ready to book'}
                  </span>
                </div>
              </div>

              {/* Private Transfer Minivan Card */}
              <div className="p-4 rounded-xl bg-white border border-[#EADBCE] shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#088395] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Private AC Minivan & Chauffeur Fleet
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tunis Airport Roundtrip + Hammamet, Sousse & El Jem day transfers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 block">
                      {budgetService.formatCurrency(290, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">7-Day Transit</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      bookingStatusAll === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bookingStatusAll === 'confirmed' ? 'Ref: TN-TRN-3418' : 'Ready to book'}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Deep Links */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>Secure official partner booking integrations:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://carthageland.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#088395] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Carthage Land Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://hasdrubal-hotels.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#088395] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Hasdrubal Direct</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
