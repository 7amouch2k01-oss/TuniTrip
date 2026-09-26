import React, { useState } from 'react';
import { X, Globe, DollarSign, Key, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Currency, TripProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onChangeCurrency: (c: Currency) => void;
  profile: TripProfile;
  onUpdateProfile: (updates: Partial<TripProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onChangeCurrency,
  profile,
  onUpdateProfile,
}) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tunitrip_gemini_key') || '');
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('tunitrip_gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('tunitrip_gemini_key');
    }
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EADBCE]">
        
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0A4D68] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                TuniTrip Settings & Preferences
              </h3>
              <p className="text-xs text-slate-500 font-medium">Configure currency, language & AI settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Currency */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#C5A059]" />
              <span>Display Currency</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['USD', 'EUR', 'GBP', 'TND'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeCurrency(c)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-[#088395] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#088395]" />
              <span>Language Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                English (Default)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  language === 'fr'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-[#088395] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Travel Pace */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Default Travel Pace
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Relaxed', 'Moderate', 'Fast-paced'] as const).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => onUpdateProfile({ preferredPace: pace })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    profile.preferredPace === pace
                      ? 'bg-[#0A4D68] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Gemini API Key */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#C5A059]" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Demo Mode Works 100% Offline
              </span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank for built-in high-fidelity demo engine)"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl text-xs text-slate-800 placeholder-slate-400 border border-[#EADBCE] focus:outline-none focus:border-[#088395]"
            />
            <p className="text-[11px] text-slate-400">
              In Presentation & Demo Mode, TuniTrip runs an intelligent multi-step agent over verified Tunisian tourism datasets without requiring an API key.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-[#088395] hover:bg-[#0A4D68] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
