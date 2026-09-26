import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Hotel,
  Car,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BudgetBreakdown, Currency, TripProfile } from '../types';
import { budgetService } from '../services/budgetEngine';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetBreakdown;
  profile: TripProfile;
  currency: Currency;
  onConfirmBookings: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  budget,
  profile,
  currency,
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

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#088395', '#C5A059', '#D4AF37', '#FAF7F2'],
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#EADBCE] transform transition-all">
        
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#088395] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059]">
                Stage 4 & 5 Verification
              </span>
              <h3 className="font-display font-bold text-base text-slate-900">
                {isSuccess ? 'Reservations Confirmed!' : 'Review & Confirm Trip Arrangements'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isSuccess ? (
            <>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Consumer Protection:</strong> TuniTrip will never initiate payment or reservation locks without your explicit, itemized authorization.
                </span>
              </div>

              {/* Itemized Cost Summary (Section 16 Prompt Format) */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EADBCE] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200">
                  Itemized Trip Package
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-[#088395]" />
                    <span>Hasdrubal Thalassa Hammamet 5★ (6 Nights)</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {budgetService.formatCurrency(870, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EA580C]" />
                    <span>Carthage Land, Aqua Land, El Jem & Pirate Cruise ({profile.travelers} guests)</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {budgetService.formatCurrency(380, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#088395]" />
                    <span>Private AC Minivan & Airport Chauffeur (7 Days)</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {budgetService.formatCurrency(290, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Estimated Trip Cost:</span>
                  <span className="font-display font-extrabold text-xl text-[#088395]">
                    {budgetService.formatCurrency(1980, currency)}
                  </span>
                </div>

                <div className="text-[11px] text-emerald-700 font-semibold text-right">
                  Safe Budget Buffer: +{budgetService.formatCurrency(budget.remainingUSD, currency)}
                </div>
              </div>

              {/* Explicit User Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#088395] transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#088395] rounded border-gray-300 focus:ring-[#088395] cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  I have reviewed the plan and authorize TuniTrip to assist with verified reservations and partner deep links for our family trip to Tunisia.
                </span>
              </label>

              {/* Confirm Button */}
              <button
                disabled={!isChecked || isProcessing}
                onClick={handleConfirm}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#088395] hover:bg-[#0A4D68] disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-[#088395]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Securing Partner Confirmations...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm and Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-display font-bold text-xl text-slate-900">
                  Congratulations! Your Tunisia Trip is Confirmed
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your reservation request has been processed. Confirmation reference vouchers have been generated for Hasdrubal Thalassa Hammamet and Carthage Land.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EADBCE] text-left text-xs space-y-2">
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-slate-500">Hotel Voucher:</span>
                  <span className="text-[#088395]">TN-HTL-7741</span>
                </div>
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-slate-500">Theme Park Voucher:</span>
                  <span className="text-[#EA580C]">CL-PAS-9921</span>
                </div>
                <div className="flex justify-between font-mono font-semibold">
                  <span className="text-slate-500">Chauffeur Booking:</span>
                  <span className="text-[#088395]">TN-TRN-3418</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-[#0A4D68] hover:bg-[#088395] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
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
