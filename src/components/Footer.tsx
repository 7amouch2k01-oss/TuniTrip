import React from 'react';
import { Compass, Sparkles, Heart, Globe, ArrowRight } from 'lucide-react';

interface FooterProps {
  onSelectNav?: (tab: 'planner' | 'explore' | 'workspace' | 'saved') => void;
  onOpenSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectNav, onOpenSettings }) => {
  return (
    <footer className="bg-[#0A4D68] text-white pt-20 pb-12 border-t border-[#088395]/40 relative overflow-hidden">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#088395]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#C5A059]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Large Statement Section */}
        <div className="border-b border-white/10 pb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4AF37] block mb-2">
              Start Your Journey
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Tunisia is waiting.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mt-3 font-normal leading-relaxed">
              Discover more. Travel deeper. Experience Tunisia differently with an intelligent local companion designed for authentic exploration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => onSelectNav && onSelectNav('planner')}
              className="px-8 py-4 rounded-full bg-[#D4AF37] hover:bg-[#C5A059] text-[#0A4D68] font-bold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#0A4D68]" />
              <span>Plan My Tunisia Trip with AI</span>
            </button>
            <div className="font-hand text-2xl text-amber-200/90 rotate-2">
              Tunisia awaits you ♡
            </div>
          </div>
        </div>

        {/* Links & Brand Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-white/10 text-xs">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                Tuni<span className="text-[#D4AF37]">Trip</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              The intelligent travel platform for Tunisia. Built with grounded Tunisian heritage databases, budget optimization, and verified local expertise.
            </p>
            <div className="text-[11px] text-slate-400">
              Approved for foreign visitors & international travelers.
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <span className="font-bold text-sm text-white uppercase tracking-wider block mb-3">
              Explore
            </span>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => onSelectNav && onSelectNav('explore')} className="hover:text-white transition-colors cursor-pointer">
                  Destinations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('explore')} className="hover:text-white transition-colors cursor-pointer">
                  Experiences
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('explore')} className="hover:text-white transition-colors cursor-pointer">
                  Theme Parks & Family
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('explore')} className="hover:text-white transition-colors cursor-pointer">
                  UNESCO Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('explore')} className="hover:text-white transition-colors cursor-pointer">
                  Calm Coastal Escapes
                </button>
              </li>
            </ul>
          </div>

          {/* Trip Planner Col */}
          <div>
            <span className="font-bold text-sm text-white uppercase tracking-wider block mb-3">
              Planner
            </span>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => onSelectNav && onSelectNav('planner')} className="hover:text-white transition-colors cursor-pointer">
                  AI Travel Assistant
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('workspace')} className="hover:text-white transition-colors cursor-pointer">
                  Trip Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('workspace')} className="hover:text-white transition-colors cursor-pointer">
                  Itinerary Generator
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('workspace')} className="hover:text-white transition-colors cursor-pointer">
                  Budget Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onSelectNav && onSelectNav('saved')} className="hover:text-white transition-colors cursor-pointer">
                  Saved Places
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <span className="font-bold text-sm text-white uppercase tracking-wider block mb-3">
              Trust & Partners
            </span>
            <ul className="space-y-2 text-slate-300">
              <li><span className="text-slate-400">UNESCO Grounded</span></li>
              <li><span className="text-slate-400">ONTT Official Sources</span></li>
              <li><span className="text-slate-400">Carthage Land Partner</span></li>
              <li><span className="text-slate-400">Zero Ghost Bookings</span></li>
              <li>
                <button onClick={onOpenSettings} className="hover:text-white transition-colors cursor-pointer">
                  Settings & Preferences
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sign-off */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <span>Discover Tunisia</span>
            <span>•</span>
            <span>Experience Culture</span>
            <span>•</span>
            <span>Create Memories</span>
          </div>

          <div className="text-[11px] text-slate-400">
            © 2026 TuniTrip Inc. All rights reserved. Crafted for presentation to investors and tourism stakeholders.
          </div>
        </div>

      </div>
    </footer>
  );
};
