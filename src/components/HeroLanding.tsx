import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Compass,
  ShieldCheck,
  Award,
  Search,
} from 'lucide-react';

interface HeroLandingProps {
  onStartPlanning: (initialPrompt?: string) => void;
  onExplore: () => void;
  onTriggerDemo: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartPlanning,
  onExplore,
  onTriggerDemo,
}) => {
  const [destinationInput, setDestinationInput] = useState('Hammamet & Tunis');
  const [checkIn, setCheckIn] = useState('12 Apr 2026');
  const [checkOut, setCheckOut] = useState('19 Apr 2026');
  const [naturalPrompt, setNaturalPrompt] = useState('');

  const samplePrompts = [
    '7 days in Tunisia with my family ($2,450 budget)',
    'We love Carthage Land, swimming and calm places',
    'I want beaches, Roman history and local food',
    'A romantic trip for two under $1,800',
    '5 days exploring southern Tunisia & Sahara dunes',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (naturalPrompt.trim()) {
      onStartPlanning(naturalPrompt.trim());
    } else {
      onStartPlanning(
        `Plan a 7-day trip to ${destinationInput} from ${checkIn} to ${checkOut} for a family with swimming and activities`
      );
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between pt-24 pb-16 overflow-hidden">
      
      {/* Full-Bleed Cinematic Photography Background (Reference Image Style) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2200&q=85"
          alt="Tunisia Mediterranean Coastline"
          className="w-full h-full object-cover scale-105 animate-pulse-glow"
          style={{ animationDuration: '20s' }}
        />
        {/* Soft Warm Editorial Overlay (Restrained, not dark muddy gradient) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-12 lg:pt-20">
        
        {/* Editorial Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-0.5 bg-[#D4AF37]" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37]">
            DISCOVER TUNISIA
          </span>
        </div>

        {/* Huge Editorial Headline */}
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-6">
            Real People. <br />
            <span className="italic font-normal text-amber-200">Authentic Tunisia.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-100 font-normal leading-relaxed max-w-2xl mb-10 drop-shadow-sm">
            Explore Tunisia like a local. Discover its cities, beaches, ancient ruins, and hidden gems.
            Plan your journey with an intelligent local AI travel companion that understands your preferences and budget.
          </p>
        </div>

        {/* Floating Pill Search Bar (Matching Reference Image) */}
        <div className="max-w-4xl">
          <form onSubmit={handleSearchSubmit}>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-full p-2.5 sm:p-2 shadow-2xl border border-white/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Destination Search */}
              <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <MapPin className="w-4 h-4 text-[#088395] mr-2.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Where do you want to go?
                  </span>
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="e.g. Hammamet, Sidi Bou Said, Djerba"
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Check in */}
              <div className="flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 shrink-0">
                <Calendar className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Check in
                  </span>
                  <input
                    type="text"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-24 text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Check out */}
              <div className="flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 shrink-0">
                <Calendar className="w-4 h-4 text-[#C5A059] mr-2 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Check out
                  </span>
                  <input
                    type="text"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-24 text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-[#088395] hover:bg-[#0A4D68] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#088395]/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Natural Language Prompt Input Secondary Bar */}
          <div className="mt-3 bg-black/40 backdrop-blur-md rounded-2xl p-2 px-4 border border-white/20 flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <input
              type="text"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              placeholder="Or type naturally: “7 days in Tunisia with family, Carthage Land, swimming & history under $2,450”..."
              className="flex-1 text-xs text-white placeholder-slate-300 focus:outline-none bg-transparent font-medium"
            />
            {naturalPrompt && (
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1 rounded-xl bg-[#D4AF37] text-[#0A4D68] font-bold text-xs cursor-pointer hover:bg-amber-300"
              >
                Plan with AI
              </button>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-white/80">Try asking:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onStartPlanning(p)}
                className="text-xs font-medium px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-100 border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Hero Bottom Bar: Trust Badges & Handwritten Cursive Note (Reference Image Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/20">
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-white font-medium">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>Authentic Experiences</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>Local Guides & Grounded Knowledge</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Safe & Trusted Booking Safeguards</span>
            </div>
          </div>

          {/* Subtle Cursive Handwritten Sign-off (Reference Image Style) */}
          <div className="font-hand text-2xl sm:text-3xl text-amber-200/90 rotate-[-2deg] select-none">
            Tunisia is waiting for you ♡
          </div>
        </div>
      </div>

    </div>
  );
};
