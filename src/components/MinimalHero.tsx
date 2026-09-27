import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MinimalHeroProps {
  onStartPlanning: (prompt: string) => void;
  onExplore: () => void;
  onHowItWorks?: () => void;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({
  onStartPlanning,
}) => {
  const [promptInput, setPromptInput] = useState('');

  const samplePrompts = [
    '7 days with my family, beaches and history',
    'Romantic weekend under $1,500',
    'I want to discover the Sahara',
    'Quiet places and local food',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = promptInput.trim() || '7 days with my family, beaches and history';
    onStartPlanning(query);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden">
      {/* Background Photography with Warm Editorial Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2200&q=85"
          alt="Tunisia Mediterranean Coastline in Sidi Bou Said"
          className="w-full h-full object-cover scale-105"
        />
        {/* Restrained Editorial Overlay (Not dark muddy, warm & luminous) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A4D68]/75 via-[#0A4D68]/45 to-[#FAF7F2]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
        {/* Small label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>YOUR AI TRAVEL COMPANION FOR TUNISIA</span>
        </div>

        {/* Large Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.08] mb-6 drop-shadow-sm">
          Discover Tunisia, <br />
          <span className="italic font-normal text-amber-200">your way.</span>
        </h1>

        {/* Supporting sentence */}
        <p className="text-lg sm:text-2xl text-slate-100 font-normal leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-sm">
          Tell us what you love. <br className="hidden sm:inline" />
          We'll build a trip around you.
        </p>

        {/* The Conversational Input: The Heart of the Homepage */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl border border-white/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all group-focus-within:ring-4 group-focus-within:ring-[#088395]/20 group-focus-within:border-[#088395]/40">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Tell me about your trip..."
                className="flex-1 px-5 py-3 text-base sm:text-lg text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                aria-label="Trip planning prompt"
              />

              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl sm:rounded-full bg-[#088395] hover:bg-[#0A4D68] text-white font-bold text-sm sm:text-base shadow-md shadow-[#088395]/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <span>Plan my trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Small Examples Below Input */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/80 font-medium mr-1">Try:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onStartPlanning(prompt)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-slate-100 border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-2xs backdrop-blur-xs"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
