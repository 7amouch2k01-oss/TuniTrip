import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Hotel,
  Car,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { BudgetBreakdown, Currency, TripProfile } from '../types';
import { budgetService } from '../services/budgetEngine';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetBreakdown;
  profile: TripProfile;
  currency: Currency;
  planTitle?: string;
  onConfirmBookings: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  budget,
  profile,
  currency,
  planTitle,
  onConfirmBookings,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isChecked || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onConfirmBookings();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-200 transform transition-all">
        
        {/* Header */}
        <div className="bg-neutral-900 p-5 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white border border-neutral-700">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Verification & Authorization
              </span>
              <h3 className="font-bold text-base text-white truncate max-w-sm">
                {isSuccess
                  ? 'Reservations Confirmed!'
                  : planTitle
                  ? `Confirm: ${planTitle}`
                  : 'Review & Confirm Trip Arrangements'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isSuccess ? (
            <>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Consumer Protection:</strong> TuniTrip will never initiate payment or reservation locks without your explicit, itemized authorization.
                </span>
              </div>

              {/* Itemized Cost Summary */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-200">
                  Itemized Trip Package
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-neutral-700" />
                    <span>Hasdrubal Thalassa Hammamet 5★ (6 Nights)</span>
                  </div>
                  <span className="font-bold text-neutral-900">
                    {budgetService.formatCurrency(870, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neutral-700" />
                    <span>Carthage Land, Aqua Land, El Jem & Pirate Cruise ({profile.travelers} guests)</span>
                  </div>
                  <span className="font-bold text-neutral-900">
                    {budgetService.formatCurrency(380, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-neutral-700" />
                    <span>Private AC Minivan & Airport Chauffeur (7 Days)</span>
                  </div>
                  <span className="font-bold text-neutral-900">
                    {budgetService.formatCurrency(290, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-neutral-900">Total Estimated Trip Cost:</span>
                  <span className="font-bold text-xl text-neutral-900">
                    {budgetService.formatCurrency(1980, currency)}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-600 font-semibold text-right">
                  Safe Budget Buffer: +{budgetService.formatCurrency(budget.remainingUSD, currency)}
                </div>
              </div>

              {/* Explicit User Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-900 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900 cursor-pointer"
                />
                <span className="text-xs text-neutral-700 leading-snug">
                  I have reviewed the plan and authorize TuniTrip to assist with verified reservations and partner deep links for our trip to Tunisia.
                </span>
              </label>

              {/* Confirm Button */}
              <button
                disabled={!isChecked || isProcessing}
                onClick={handleConfirm}
                className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Securing Partner Confirmations...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm and Authorize Bookings</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-xl text-neutral-900">
                  Congratulations! Your Tunisia Trip is Confirmed
                </h4>
                <p className="text-xs text-neutral-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your reservation request has been processed. Confirmation reference vouchers have been generated for Hasdrubal Thalassa Hammamet and Carthage Land.
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-2">
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-neutral-500">Hotel Voucher:</span>
                  <span className="text-neutral-900">TN-HTL-7741</span>
                </div>
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-neutral-500">Theme Park Voucher:</span>
                  <span className="text-neutral-900">CL-PAS-9921</span>
                </div>
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-neutral-500">Chauffeur Booking:</span>
                  <span className="text-neutral-900">TN-TRN-3418</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                Done • View Active Trip Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
