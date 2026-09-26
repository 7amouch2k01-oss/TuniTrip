import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, MapPin, Bookmark, Settings, DollarSign, Menu, X, ShieldCheck, Heart } from 'lucide-react';
import { Currency } from '../types';

interface NavbarProps {
  activeTab: 'planner' | 'explore' | 'workspace' | 'saved';
  onSelectTab: (tab: 'planner' | 'explore' | 'workspace' | 'saved') => void;
  currency: Currency;
  onChangeCurrency: (c: Currency) => void;
  onTriggerDemo: () => void;
  onOpenSettings: () => void;
  savedCount: number;
  isTransparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currency,
  onChangeCurrency,
  onTriggerDemo,
  onOpenSettings,
  savedCount,
  isTransparent = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSolidNav = !isTransparent || isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showSolidNav
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE] shadow-xs py-3.5'
            : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('planner')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              showSolidNav
                ? 'bg-[#0A4D68] text-white shadow-sm'
                : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
            }`}>
              <Compass className="w-5 h-5 text-[#D4AF37] group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className={`font-display font-extrabold text-2xl tracking-tight transition-colors ${
                  showSolidNav ? 'text-[#0A4D68]' : 'text-white'
                }`}>
                  Tuni<span className="text-[#D4AF37]">Trip</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-[#C5A059]/20 text-[#D4AF37] border border-[#C5A059]/30">
                  AI
                </span>
              </div>
              <p className={`text-[10px] font-medium tracking-wide transition-colors ${
                showSolidNav ? 'text-slate-500' : 'text-slate-200'
              }`}>
                Discover Tunisia
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => onSelectTab('planner')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav
                  ? activeTab === 'planner' ? 'text-[#088395] font-bold' : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onSelectTab('explore')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav
                  ? activeTab === 'explore' ? 'text-[#088395] font-bold' : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Destinations
            </button>

            <button
              onClick={() => onSelectTab('explore')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav ? 'text-slate-700 hover:text-[#088395]' : 'text-white/90 hover:text-white'
              }`}
            >
              Experiences
            </button>

            <button
              onClick={() => onSelectTab('workspace')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav
                  ? activeTab === 'workspace' ? 'text-[#088395] font-bold' : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Plan Your Trip
            </button>

            <button
              onClick={() => onSelectTab('saved')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1 ${
                showSolidNav
                  ? activeTab === 'saved' ? 'text-[#088395] font-bold' : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#088395] text-white">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Tools: Currency, Demo CTA, Sign In, Settings */}
          <div className="flex items-center gap-3">
            
            {/* Quick Currency Selector */}
            <div className={`relative flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors ${
              showSolidNav
                ? 'bg-white border border-[#EADBCE] text-slate-700'
                : 'bg-black/30 backdrop-blur-md border border-white/20 text-white'
            }`}>
              <DollarSign className="w-3.5 h-3.5 text-[#C5A059] mr-1" />
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as Currency)}
                aria-label="Select Currency"
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                <option value="USD" className="text-slate-800">USD ($)</option>
                <option value="EUR" className="text-slate-800">EUR (€)</option>
                <option value="TND" className="text-slate-800">TND (DT)</option>
                <option value="GBP" className="text-slate-800">GBP (£)</option>
              </select>
            </div>

            {/* Investor Presentation "Try Demo Trip" Pill */}
            <button
              onClick={onTriggerDemo}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B38E46] hover:to-[#C5A059] text-white text-xs font-bold shadow-md shadow-[#C5A059]/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95 shrink-0"
              title="Preload the 7-day family scenario ($2,450 budget)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span>Try Demo Trip</span>
            </button>

            {/* Sign in Button (reference image style) */}
            <button
              onClick={onOpenSettings}
              className={`hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                showSolidNav
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-[#EADBCE]'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30'
              }`}
            >
              Sign In
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                showSolidNav
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-[#F4EFE6]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-full transition-colors cursor-pointer ${
                showSolidNav ? 'text-slate-800' : 'text-white'
              }`}
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Full-Screen Mobile Drawer Menu (matching reference image top-right) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A4D68] text-white animate-fadeIn">
          {/* Top header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#D4AF37]" />
              <span className="font-display font-bold text-2xl">TuniTrip</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-8 space-y-6 text-lg font-serif">
            <button
              onClick={() => {
                onSelectTab('planner');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              🏠 Home
            </button>
            <button
              onClick={() => {
                onSelectTab('explore');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              📍 Destinations
            </button>
            <button
              onClick={() => {
                onSelectTab('explore');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              ✨ Experiences
            </button>
            <button
              onClick={() => {
                onSelectTab('workspace');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              📅 Plan Your Trip
            </button>
            <button
              onClick={() => {
                onSelectTab('saved');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              🔖 Saved Places ({savedCount})
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Mobile Bottom Backdrop Photo & Note */}
          <div className="p-8 border-t border-white/10 relative overflow-hidden">
            <div className="font-hand text-3xl text-amber-200/90 mb-3">
              Tunisia awaits you ♡
            </div>
            <button
              onClick={() => {
                onTriggerDemo();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3.5 rounded-full bg-[#D4AF37] text-[#0A4D68] font-bold text-sm shadow-lg"
            >
              Launch 7-Day Family Demo Trip
            </button>
          </div>
        </div>
      )}
    </>
  );
};
