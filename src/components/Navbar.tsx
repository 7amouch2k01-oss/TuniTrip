import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  DollarSign,
  Menu,
  X,
} from 'lucide-react';
import { Currency } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: 'planner' | 'explore' | 'workspace' | 'saved' | 'plans';
  onSelectTab: (tab: 'planner' | 'explore' | 'workspace' | 'saved' | 'plans') => void;
  onGoHome?: () => void;
  currency: Currency;
  onChangeCurrency: (c: Currency) => void;
  onTriggerDemo: () => void;
  onOpenSettings: () => void;
  savedCount: number;
  plansCount?: number;
  isTransparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onGoHome,
  currency,
  onChangeCurrency,
  onTriggerDemo,
  onOpenSettings,
  savedCount: _savedCount,
  plansCount = 3,
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
            ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADBCE] shadow-xs py-3'
            : 'bg-gradient-to-b from-black/60 via-black/25 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Upgraded Luxury Title */}
          <BrandLogo
            variant={showSolidNav ? 'light' : 'transparent'}
            size="md"
            onClick={onGoHome || (() => onSelectTab('planner'))}
          />

          {/* Desktop Navigation Links (Section 4 & 18) */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => onSelectTab('explore')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav
                  ? activeTab === 'explore'
                    ? 'text-[#088395] font-bold'
                    : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Explore
            </button>

            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setTimeout(() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                showSolidNav ? 'text-slate-700 hover:text-[#088395]' : 'text-white/90 hover:text-white'
              }`}
            >
              How it works
            </button>

            {/* My Trips Link with Count Badge */}
            <button
              onClick={() => onSelectTab('plans')}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 ${
                showSolidNav
                  ? activeTab === 'plans' || activeTab === 'workspace'
                    ? 'text-[#088395] font-bold'
                    : 'text-slate-700 hover:text-[#088395]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>My Trips</span>
              {plansCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D4AF37] text-slate-900 shadow-2xs">
                  {plansCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Tools: Currency, Demo CTA, Sign In, Settings */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Currency Selector */}
            <div
              className={`relative flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors ${
                showSolidNav
                  ? 'bg-white border border-[#EADBCE] text-slate-700'
                  : 'bg-black/35 backdrop-blur-md border border-white/20 text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#C5A059] mr-0.5" />
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as Currency)}
                aria-label="Select Currency"
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs font-medium"
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
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B38E46] hover:to-[#C5A059] text-white text-xs font-bold shadow-md shadow-[#C5A059]/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95 shrink-0"
              title="Preload the 7-day family scenario ($2,450 budget)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span className="hidden sm:inline">Try Demo Trip</span>
              <span className="sm:hidden">Demo</span>
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

      {/* Full-Screen Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A4D68] text-white animate-fadeIn">
          {/* Top header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <BrandLogo
              variant="dark"
              size="md"
              onClick={() => {
                if (onGoHome) onGoHome();
                else onSelectTab('planner');
                setIsMobileMenuOpen(false);
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links (Section 18) */}
          <div className="flex-1 p-8 space-y-6 text-xl font-serif">
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                else onSelectTab('planner');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectTab('explore');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Explore
            </button>
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => {
                onSelectTab('plans');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#D4AF37] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>My Trips</span>
              {plansCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[#D4AF37] text-slate-900 font-bold">
                  {plansCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-base text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Settings & Currency
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
