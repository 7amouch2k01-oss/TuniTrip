import React, { useState } from 'react';
import { X, Globe, DollarSign, Key, Check, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200">
        
        {/* Header */}
        <div className="bg-neutral-900 p-5 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white border border-neutral-700">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                TuniTrip Settings & Preferences
              </h3>
              <p className="text-xs text-neutral-400 font-medium">Configure currency, language & AI parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Currency */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-neutral-700" />
              <span>Display Currency</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['USD', 'EUR', 'GBP', 'TND'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeCurrency(c)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-neutral-700" />
              <span>Language Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                English (Default)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'fr'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Travel Pace */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Default Travel Pace
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Relaxed', 'Moderate', 'Fast-paced'] as const).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => onUpdateProfile({ preferredPace: pace })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    profile.preferredPace === pace
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Gemini API Key */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-neutral-700" />
                <span>Google Gemini API Key (Optional)</span>
              </label>
              <span className="text-[10px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full font-semibold border border-neutral-200">
                Autonomous Engine Active
              </span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank for built-in high-fidelity engine)"
              className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-800 placeholder-neutral-400 border border-neutral-200 focus:outline-none focus:border-neutral-900"
            />
            <p className="text-[11px] text-neutral-400">
              TuniTrip runs a deterministic 10-stage autonomous research engine over live verified Tunisian tourism knowledgebases even without an external API key.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveToast ? (
                <>
                  <Check className="w-4 h-4 text-white" />
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
