import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCtaProps {
  onPlanTrip: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onPlanTrip }) => {
  return (
    <section className="py-24 sm:py-32 bg-[#0A4D68] text-white text-center relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#088395]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          Ready to discover Tunisia?
        </h2>

        <p className="text-base sm:text-xl text-slate-200 font-normal leading-relaxed max-w-xl mx-auto mb-10">
          Tell us what you love, and let your local AI companion build your trip.
        </p>

        <button
          onClick={onPlanTrip}
          className="px-8 py-4 rounded-full bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A4D68] font-bold text-base shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#0A4D68]" />
          <span>Plan my trip</span>
          <ArrowRight className="w-4 h-4 text-[#0A4D68]" />
        </button>
      </div>
    </section>
  );
};
