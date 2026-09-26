import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Compass,
} from 'lucide-react';
import {
  ChatMessage,
  PlaceItem,
  ToolExecutionStep,
  PlanMode,
  TripProfile,
  Currency,
} from '../types';
import { budgetService } from '../services/budgetEngine';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentToolSteps: ToolExecutionStep[];
  isAgentThinking: boolean;
  profile: TripProfile;
  currency: Currency;
  planModes: PlanMode[];
  activePlanId: string;
  onSelectPlanMode: (planId: string) => void;
  onSendMessage: (text: string) => void;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onTriggerBookingReview: () => void;
  onSwitchToWorkspaceTab: (tab: 'itinerary' | 'map' | 'budget' | 'bookings') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentToolSteps,
  isAgentThinking,
  profile,
  currency,
  planModes,
  activePlanId,
  onSelectPlanMode,
  onSendMessage,
  onOpenPlaceDetails,
  onTriggerBookingReview,
  onSwitchToWorkspaceTab,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentToolSteps, isAgentThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAgentThinking) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-[740px] lg:h-[calc(100vh-8.5rem)] min-h-[640px] bg-[#FAF7F2]/70 rounded-3xl shadow-sm border border-[#EADBCE] overflow-hidden">
      
      {/* Editorial Header (Section 5) */}
      <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#EADBCE] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A4D68] flex items-center justify-center text-white shadow-sm shadow-[#0A4D68]/20 shrink-0">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#088395]">
                TuniTrip AI
              </span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="font-serif font-bold text-slate-900 text-base leading-tight">
              Travel Architect
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Your local Tunisian travel intelligence.
            </p>
          </div>
        </div>

        {/* Compact Context Pills (Section 5) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#EADBCE] text-[11px] font-medium text-slate-700">
            {profile.travelers} Guests
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#EADBCE] text-[11px] font-medium text-slate-700">
            {profile.durationDays} Days
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
            {budgetService.formatCurrency(profile.budget, currency)}
          </span>
        </div>
      </div>

      {/* Plan Modes Selector (Section 10) */}
      {planModes.length > 0 && (
        <div className="bg-[#FAF7F2] px-4 py-2 border-b border-[#EADBCE] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            Modes:
          </span>
          {planModes.map((mode) => {
            const isActive = mode.id === activePlanId;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectPlanMode(mode.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0A4D68] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-[#EADBCE]'
                }`}
              >
                <span>{mode.name}</span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-slate-600'
                  }`}
                >
                  {budgetService.formatCurrency(mode.estimatedCostUSD, currency)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Conversation Message Stream */}
      <div className="panel-scroll flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gradient-to-b from-[#FAF7F2]/40 to-white/70">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser ? 'bg-[#0A4D68] text-white' : 'bg-white border border-[#EADBCE] text-[#0A4D68]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4 text-[#088395]" />}
              </div>

              {/* Message Bubble Container */}
              <div className="flex flex-col gap-3 max-w-full sm:max-w-2xl min-w-0">
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#0A4D68] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-[#EADBCE] rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Markdown or formatted text */}
                  <div className="whitespace-pre-line prose-sm prose-slate max-w-none">
                    {msg.content}
                  </div>

                  {/* Booking Confirmation CTA inside Message if ready */}
                  {msg.structuredData?.readyForConfirmation && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-900">
                          Ready when you are
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 mb-3">
                        TuniTrip does not commit any financial transaction without your direct verification. Review the itemized hotel, activities, and transport breakdown before proceeding.
                      </p>
                      <button
                        onClick={onTriggerBookingReview}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Review Itemized Reservations & Confirm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Timestamp & Verified badge */}
                  <div className="mt-3 flex items-center justify-between text-[11px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <span className="flex items-center gap-1 text-[#088395] font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Grounding</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Structured Place Recommendation Cards Inside Chat (Section 8) */}
                {msg.structuredData?.recommendations && msg.structuredData.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>Curated Options For Your Trip</span>
                    </div>

                    <div className="space-y-3">
                      {msg.structuredData.recommendations.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row group"
                        >
                          <div className="relative sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden bg-slate-100">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{item.rating}</span>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-[#0A4D68]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[10px] font-semibold shadow-xs">
                              📍 {item.city}
                            </div>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                                  {item.title}
                                </h3>
                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF7F2] text-slate-600 border border-[#EADBCE] shrink-0">
                                  {item.category.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-normal">
                                {item.shortDescription}
                              </p>
                              {item.matchReason && (
                                <p className="text-[11px] text-[#088395] bg-[#E8F6F8] p-2 rounded-xl font-medium leading-relaxed mb-2">
                                  💡 <strong>WHY IT MATCHES:</strong> {item.matchReason}
                                </p>
                              )}
                            </div>

                            <div>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div className="text-xs shrink-0">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {budgetService.formatCurrency(item.estimatedPrice, currency)}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">
                                    {' '}
                                    / {item.priceUnit.replace('_', ' ')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => onOpenPlaceDetails(item)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#088395] hover:bg-[#E8F6F8] transition-colors cursor-pointer"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => onSwitchToWorkspaceTab('itinerary')}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#088395] hover:bg-[#0A4D68] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>In Plan</span>
                                  </button>
                                </div>
                              </div>

                              {/* Source Citation Badge */}
                              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-50 pt-1.5">
                                <span className="truncate max-w-[170px]">
                                  Source: {item.sourceName}
                                </span>
                                <span className="shrink-0 text-slate-400">
                                  Checked: {item.lastChecked}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources Footnote in Message */}
                {msg.structuredData?.sources && msg.structuredData.sources.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-1">
                      Authoritative Research Sources:
                    </span>
                    <ul className="space-y-1">
                      {msg.structuredData.sources.map((s, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="truncate font-medium">
                            {s.name} — <span className="text-slate-500 font-normal">{s.context}</span>
                          </span>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#088395] hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                          >
                            <span>Official Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Step-by-Step AI Execution Indicator (Section 7) */}
        {isAgentThinking && (
          <div className="flex gap-3 max-w-xl mr-auto animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-[#0A4D68] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADBCE] shadow-xs flex-1 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D68]">
                  <span className="flex h-2 w-2 rounded-full bg-[#088395] animate-ping" />
                  <span>TuniTrip is researching Tunisia...</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Real-time Grounding</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-0.5">
                {[
                  { label: 'Understanding your family preferences', stepIdx: 0 },
                  { label: 'Searching family activities & Carthage Land games', stepIdx: 1 },
                  { label: 'Comparing beachfront hotels in Hammamet', stepIdx: 2 },
                  { label: 'Checking transit times & calm swimming spots', stepIdx: 3 },
                  { label: 'Optimizing 7-day budget with safe buffer', stepIdx: 4 },
                ].map((item, idx) => {
                  const isDone = currentToolSteps.length > idx || (!currentToolSteps.length && idx < 2);
                  const isCurrent = currentToolSteps.length === idx;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 transition-all">
                      {isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full border-2 border-[#088395] border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                      )}
                      <span
                        className={
                          isDone
                            ? 'text-slate-700 font-medium'
                            : isCurrent
                            ? 'text-[#088395] font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Pills (Section 19) */}
      <div className="bg-[#FAF7F2] px-4 py-2 border-t border-[#EADBCE] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Suggested:
        </span>
        <button
          onClick={() => handleSuggestionClick("I like this plan but I don't want to stay in Tunis")}
          className="text-xs font-medium px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-[#EADBCE] shrink-0 transition-colors cursor-pointer shadow-2xs"
        >
          “I don’t want to stay in Tunis”
        </button>
        <button
          onClick={() => handleSuggestionClick("Keep the hotel in Hammamet but replace the second activity")}
          className="text-xs font-medium px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-[#EADBCE] shrink-0 transition-colors cursor-pointer shadow-2xs"
        >
          “Keep hotel in Hammamet, replace 2nd activity”
        </button>
        <button
          onClick={() => handleSuggestionClick("Perfect. Book it.")}
          className="text-xs font-bold px-3 py-1 rounded-full bg-[#088395]/15 hover:bg-[#088395]/25 text-[#088395] border border-[#088395]/30 shrink-0 transition-colors cursor-pointer shadow-2xs"
        >
          “Perfect. Book it.”
        </button>
      </div>

      {/* Chat Input Field */}
      <div className="p-3.5 bg-white border-t border-[#EADBCE] shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex-1 bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 border border-[#EADBCE] focus-within:border-[#088395] focus-within:ring-2 focus-within:ring-[#088395]/15 transition-all flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about Tunisia or adjust your trip (e.g. 'Add more beach days' or 'Book it')..."
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isAgentThinking}
            className="w-10 h-10 rounded-xl bg-[#088395] hover:bg-[#0A4D68] disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
