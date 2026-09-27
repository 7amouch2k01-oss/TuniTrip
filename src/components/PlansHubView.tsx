import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Hotel,
  Car,
  Ticket,
  AlertCircle,
  Plus,
  Compass,
} from 'lucide-react';
import { TripPlan, Currency } from '../types';
import { budgetService } from '../services/budgetEngine';

interface PlansHubViewProps {
  plans: TripPlan[];
  activePlanId: string;
  currency: Currency;
  onSelectPlan: (planId: string) => void;
  onCreateNewPlan: () => void;
  onOpenBookingModal: (plan: TripPlan) => void;
  onSwitchToTab: (tab: 'itinerary' | 'map' | 'budget' | 'bookings') => void;
}

export const PlansHubView: React.FC<PlansHubViewProps> = ({
  plans,
  activePlanId,
  currency,
  onSelectPlan,
  onCreateNewPlan,
  onOpenBookingModal,
  onSwitchToTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const confirmedPlans = plans.filter((p) => p.status === 'confirmed');
  const pendingPlans = plans.filter((p) => p.status === 'pending_confirmation' || p.status === 'draft');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalConfirmedSpend = confirmedPlans.reduce(
    (sum, p) => sum + p.budget.totalEstimatedUSD,
    0
  );
  const totalPendingSpend = pendingPlans.reduce(
    (sum, p) => sum + p.budget.totalEstimatedUSD,
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Banner (Pure Monochrome Dark Header) */}
      <div className="bg-neutral-900 rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden border border-neutral-800 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-[11px] font-semibold tracking-wider uppercase text-neutral-300 mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Tunisia Travel Portfolio & Verification Center</span>
          </div>
          
          <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            Your Curated Tunisia Plans
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
            Review and track all your custom Tunisia trips designed with our autonomous AI travel architect. Inspect confirmed reservations with official supplier reference codes or authorize pending itineraries.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-neutral-800">
            <div className="bg-neutral-800/80 rounded-xl p-3 sm:p-4 border border-neutral-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirmed Trips</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {confirmedPlans.length}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {budgetService.formatCurrency(totalConfirmedSpend, currency)} booked
              </p>
            </div>

            <div className="bg-neutral-800/80 rounded-xl p-3 sm:p-4 border border-neutral-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>Pending Review</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {pendingPlans.length}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {budgetService.formatCurrency(totalPendingSpend, currency)} estimated
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-neutral-800/80 rounded-xl p-3 sm:p-4 border border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Start Another Journey</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Each plan has its own dedicated AI conversation.
                </p>
              </div>
              <button
                onClick={onCreateNewPlan}
                className="mt-3 py-1.5 px-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Plan + Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            All Plans ({plans.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'confirmed'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
            <span>Confirmed ({confirmedPlans.length})</span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'pending'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Pending Confirmation ({pendingPlans.length})</span>
          </button>
        </div>

        <button
          onClick={onCreateNewPlan}
          className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* SECTION 1: CONFIRMED PLANS */}
      {(filter === 'all' || filter === 'confirmed') && confirmedPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <h3 className="font-bold text-neutral-900 text-base">
              Confirmed & Guaranteed Trips
            </h3>
            <span className="text-xs text-neutral-500">
              ({confirmedPlans.length} verified reservations)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {confirmedPlans.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const hotel = plan.itinerary[0]?.hotelStay;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:border-neutral-400 transition-all ${
                    isCurrent ? 'border-neutral-900 ring-2 ring-neutral-900/10' : 'border-neutral-200'
                  }`}
                >
                  {/* Confirmed Top Header Banner */}
                  <div className="bg-neutral-900 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white shrink-0 border border-neutral-700">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                            OFFICIAL ONTT GUARANTEED
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-neutral-900">
                              CURRENTLY VIEWING
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-white mt-0.5">
                          {plan.title}
                        </h4>
                      </div>
                    </div>

                    {/* Booking Voucher Code */}
                    <div className="bg-neutral-800 px-3.5 py-2 rounded-xl border border-neutral-700 flex items-center gap-3 self-start sm:self-auto">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">
                          VOUCHER CODE
                        </span>
                        <span className="font-mono font-bold text-sm text-white">
                          {plan.bookingConfirmationCode || '#TN-8492-CONF'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(plan.bookingConfirmationCode || '#TN-8492-CONF')}
                        className="p-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors cursor-pointer"
                        title="Copy voucher code"
                      >
                        {copiedCode === (plan.bookingConfirmationCode || '#TN-8492-CONF') ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                          <Compass className="w-4 h-4 text-neutral-700" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            DESTINATIONS
                          </span>
                          <span className="text-xs font-semibold text-neutral-800">
                            {plan.destination}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                          <Calendar className="w-4 h-4 text-neutral-700" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            SCHEDULE
                          </span>
                          <span className="text-xs font-semibold text-neutral-800">
                            {plan.profile.durationDays} Days · {plan.profile.travelers} Guests
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                          <DollarSign className="w-4 h-4 text-neutral-700" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            CONFIRMED TOTAL
                          </span>
                          <span className="text-xs font-bold text-neutral-900">
                            {budgetService.formatCurrency(plan.budget.totalEstimatedUSD, currency)} (Locked)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verified Items Checklist */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Locked Inclusions & Vouchers
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5 text-xs text-neutral-800 font-medium">
                          <Hotel className="w-4 h-4 text-neutral-700 shrink-0" />
                          <span className="truncate">
                            {hotel?.hotelName || '5-Star Beachfront Suite'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5 text-xs text-neutral-800 font-medium">
                          <Car className="w-4 h-4 text-neutral-700 shrink-0" />
                          <span className="truncate">
                            {plan.profile.transportPreference || 'Private AC Minivan Chauffeur'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5 text-xs text-neutral-800 font-medium">
                          <Ticket className="w-4 h-4 text-neutral-700 shrink-0" />
                          <span className="truncate">
                            Theme Park & Guided Heritage Passes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-600" />
                        <span>{plan.messages.length} messages in AI planning chat</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            onSelectPlan(plan.id);
                            onSwitchToTab('itinerary');
                          }}
                          className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Schedule
                        </button>

                        <button
                          onClick={() => onSelectPlan(plan.id)}
                          className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Plan Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PENDING CONFIRMATION PLANS */}
      {(filter === 'all' || filter === 'pending') && pendingPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-1 pt-2">
            <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-xs border border-neutral-300">
              ⏳
            </div>
            <h3 className="font-bold text-neutral-900 text-base">
              Pending Confirmation Itineraries
            </h3>
            <span className="text-xs text-neutral-500">
              (Awaiting your authorization to lock in)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {pendingPlans.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const budget = plan.budget;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:border-neutral-400 transition-all ${
                    isCurrent ? 'border-neutral-900 ring-2 ring-neutral-900/10' : 'border-neutral-200'
                  }`}
                >
                  {/* Pending Top Header Banner */}
                  <div className="bg-neutral-50 p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300">
                            STAGE 4: READY FOR YOUR REVIEW
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                              ACTIVE IN CHAT
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-neutral-900 mt-0.5">
                          {plan.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right self-start sm:self-auto">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        ESTIMATED INVESTMENT
                      </span>
                      <span className="font-bold text-lg text-neutral-900">
                        {budgetService.formatCurrency(budget.totalEstimatedUSD, currency)}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold block">
                        (${budget.remainingUSD} buffer safe)
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Consumer Notice */}
                    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Consumer Protection Guarantee:</strong> TuniTrip will not initiate payments until you review the full itemized breakdown. You can chat with the AI to change any detail or confirm below.
                      </span>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Travelers
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {plan.profile.travelers} Guests ({plan.profile.tripType})
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Duration
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {plan.profile.durationDays} Days / {plan.profile.durationDays - 1} Nights
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Destination
                        </span>
                        <span className="font-semibold text-neutral-800 truncate block">
                          {plan.destination}
                        </span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Your Target Budget
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {budgetService.formatCurrency(plan.profile.budget, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => onSelectPlan(plan.id)}
                        className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Chat & Modify with AI</span>
                      </button>

                      <button
                        onClick={() => onOpenBookingModal(plan)}
                        className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>Review & Confirm This Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPlansCount(filter, confirmedPlans, pendingPlans) === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
          <Compass className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h4 className="font-bold text-neutral-800 text-base">
            No plans found in this filter
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            You can start a new personalized Tunisia trip anytime with our local AI architect.
          </p>
          <button
            onClick={onCreateNewPlan}
            className="mt-4 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Create New Plan
          </button>
        </div>
      )}
    </div>
  );
};

function filteredPlansCount(
  filter: 'all' | 'confirmed' | 'pending',
  confirmed: TripPlan[],
  pending: TripPlan[]
): number {
  if (filter === 'confirmed') return confirmed.length;
  if (filter === 'pending') return pending.length;
  return confirmed.length + pending.length;
}
