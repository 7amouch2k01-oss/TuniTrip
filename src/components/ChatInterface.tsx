import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Star,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronDown,
  Clock,
  ArrowRight,
  Plus,
  Compass,
  FolderHeart,
  PanelRightClose,
  PanelRightOpen,
  ArrowUp,
} from 'lucide-react';
import {
  ChatMessage,
  PlaceItem,
  ToolExecutionStep,
  PlanMode,
  TripProfile,
  Currency,
  PlanStatus,
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
  planTitle?: string;
  planStatus?: PlanStatus;
  isWorkspaceOpen?: boolean;
  onToggleWorkspace?: () => void;
  onSelectPlanMode: (planId: string) => void;
  onSendMessage: (text: string) => void;
  onOpenPlaceDetails: (place: PlaceItem) => void;
  onTriggerBookingReview: () => void;
  onSwitchToWorkspaceTab: (tab: 'itinerary' | 'map' | 'budget' | 'bookings' | 'plans') => void;
  onTogglePlanSidebar?: () => void;
  onOpenPlansHub?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentToolSteps,
  isAgentThinking,
  profile: _profile,
  currency,
  planModes,
  activePlanId,
  planTitle: _planTitle,
  planStatus: _planStatus,
  isWorkspaceOpen = true,
  onToggleWorkspace,
  onSelectPlanMode,
  onSendMessage,
  onOpenPlaceDetails,
  onTriggerBookingReview,
  onSwitchToWorkspaceTab,
  onTogglePlanSidebar: _onTogglePlanSidebar,
  onOpenPlansHub: _onOpenPlansHub,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedRecMessageIds, setExpandedRecMessageIds] = useState<string[]>([]);
  const [expandedCatalogMessageIds, setExpandedCatalogMessageIds] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
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
    <div className="flex flex-col h-full bg-white text-neutral-900 overflow-hidden font-sans">
      
      {/* ChatGPT-Style Minimal Header */}
      <div className="bg-white px-4 sm:px-6 py-3 border-b border-neutral-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 text-sm">
                TuniTrip
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                Autonomous Engine
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">
              Autonomous Travel Research · Live Grounding
            </p>
          </div>
        </div>

        {/* Right Action: Workspace Toggle (ChatGPT panel style) */}
        <div className="flex items-center gap-2">
          {onToggleWorkspace && (
            <button
              onClick={onToggleWorkspace}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isWorkspaceOpen
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                  : 'bg-black text-white border-black hover:bg-neutral-800'
              }`}
              title={isWorkspaceOpen ? 'Hide Structured Plan Drawer' : 'View Structured Plan (Itinerary, Map & Budget)'}
            >
              {isWorkspaceOpen ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Close Drawer</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5" />
                  <span>Structured Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Plan Modes (Monochrome Pills) */}
      {planModes.length > 0 && (
        <div className="bg-neutral-50 px-4 sm:px-6 py-2 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider shrink-0">
            Trip Modes:
          </span>
          {planModes.map((mode) => {
            const isActive = mode.id === activePlanId;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectPlanMode(mode.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white font-medium shadow-2xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                <span>{mode.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  {budgetService.formatCurrency(mode.estimatedCostUSD, currency)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Conversation Message Stream (ChatGPT Center Column) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-white panel-scroll"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {/* Assistant Avatar in ChatGPT Style */}
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col gap-3 min-w-0 ${isUser ? 'max-w-xl' : 'max-w-2xl flex-1'}`}>
                  
                  {/* User Bubble vs Assistant Response */}
                  {isUser ? (
                    <div className="bg-neutral-100 text-neutral-900 rounded-3xl px-5 py-3 text-sm leading-relaxed border border-neutral-200/50 shadow-2xs">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-neutral-900 text-sm leading-relaxed space-y-3">
                      
                      {/* Deep Research Tool Step Accordion (ChatGPT Thinking view) */}
                      {msg.toolSteps && msg.toolSteps.length > 0 && (
                        <details className="group rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-xs mb-3">
                          <summary className="font-medium text-neutral-700 cursor-pointer flex items-center justify-between select-none list-none">
                            <span className="flex items-center gap-2 font-semibold text-neutral-900">
                              <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
                              <span>Autonomous Research Process ({msg.toolSteps.length} steps completed)</span>
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-2.5 pt-2 border-t border-neutral-200 space-y-1.5 font-mono text-[11px] text-neutral-600">
                            {msg.toolSteps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-neutral-400 shrink-0">✓</span>
                                <span className="font-semibold text-neutral-800">{step.toolName}:</span>
                                <span className="text-neutral-600 truncate">{step.summary}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Assistant Text */}
                      <div className="whitespace-pre-line text-neutral-900 leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Booking Confirmation CTA inside Message if ready */}
                      {msg.structuredData?.readyForConfirmation && (
                        <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-300">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Clock className="w-4 h-4 text-neutral-700" />
                            <span className="font-bold text-xs uppercase tracking-wider text-neutral-900">
                              Stage 4: Ready for Verification
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                            TuniTrip preserves full consumer safety: no financial charges occur without your explicit confirmation.
                          </p>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <button
                              onClick={onTriggerBookingReview}
                              className="w-full sm:w-auto py-2 px-4 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>Review & Confirm Bookings</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSwitchToWorkspaceTab('plans')}
                              className="w-full sm:w-auto py-2 px-3 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-300 transition-colors cursor-pointer text-center"
                            >
                              View in Plans Hub
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timestamp & Verified badge */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{msg.timestamp}</span>
                        <span className="flex items-center gap-1 text-neutral-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-neutral-800" />
                          <span>Verified Grounding</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Structured Place Recommendation Cards Inside Chat (Monochrome) */}
                  {msg.structuredData?.recommendations && msg.structuredData.recommendations.length > 0 && (() => {
                    const allRecs = msg.structuredData.recommendations;
                    const isExpanded = expandedRecMessageIds.includes(msg.id);
                    const displayedRecs = isExpanded ? allRecs : allRecs.slice(0, 3);
                    const remainingCount = allRecs.length - 3;

                    return (
                      <div className="space-y-3 mt-1">
                        <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center justify-between px-1">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-neutral-800" />
                            <span>Curated Recommendations</span>
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {isExpanded ? allRecs.length : Math.min(3, allRecs.length)} of {allRecs.length}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {displayedRecs.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs hover:border-neutral-400 transition-all flex flex-col sm:flex-row group"
                            >
                              <div className="relative sm:w-36 h-28 sm:h-auto shrink-0 overflow-hidden bg-neutral-100">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale contrast-110"
                                  loading="lazy"
                                />
                                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                  <span>{item.rating}</span>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-neutral-900/90 px-2 py-0.5 rounded text-white text-[10px] font-medium shadow-2xs">
                                  📍 {item.city}
                                </div>
                              </div>

                              <div className="p-3.5 flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-1">
                                      {item.title}
                                    </h3>
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0">
                                      {item.category.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-600 line-clamp-2 mb-2 font-normal">
                                    {item.shortDescription}
                                  </p>
                                  {item.matchReason && (
                                    <p className="text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded-lg font-medium leading-relaxed mb-2 border border-neutral-200">
                                      <strong>Why it matches:</strong> {item.matchReason}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                                    <div className="text-xs shrink-0">
                                      <span className="font-bold text-neutral-900 text-sm">
                                        {budgetService.formatCurrency(item.estimatedPrice, currency)}
                                      </span>
                                      <span className="text-neutral-400 text-[10px]">
                                        {' '}
                                        / {item.priceUnit.replace('_', ' ')}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => onOpenPlaceDetails(item)}
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                      >
                                        Details
                                      </button>
                                      <button
                                        onClick={() => onSwitchToWorkspaceTab('itinerary')}
                                        className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>In Plan</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Source Citation Badge */}
                                  <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-50 pt-1.5">
                                    <span className="truncate max-w-[170px]">
                                      Verified: {item.sourceName}
                                    </span>
                                    <span className="text-[10px] text-neutral-500">
                                      {item.lastChecked}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Expand / Collapse Button if > 3 */}
                        {remainingCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedRecMessageIds((prev) =>
                                isExpanded ? prev.filter((id) => id !== msg.id) : [...prev, msg.id]
                              );
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <span>Show fewer recommendations</span>
                                <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform" />
                              </>
                            ) : (
                              <>
                                <span>Show more recommendations (+{remainingCount})</span>
                                <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Autonomous Proactive Intelligence Insights (Monochrome) */}
                  {msg.structuredData?.proactiveInsights && msg.structuredData.proactiveInsights.length > 0 && (
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-neutral-800 font-semibold uppercase tracking-wider text-[10px]">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                        <span>Proactive Travel Intelligence</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {msg.structuredData.proactiveInsights.map((insight, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-neutral-200 shadow-2xs">
                            <span className="font-semibold text-neutral-900 block text-[11px] mb-0.5">
                              {insight.title}
                            </span>
                            <p className="text-[11px] text-neutral-600 leading-snug">
                              {insight.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete Discovered Research Catalog (Expandable) */}
                  {msg.structuredData?.allDiscoveredPlaces && msg.structuredData.allDiscoveredPlaces.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FolderHeart className="w-4 h-4 text-neutral-800" />
                          <span className="font-semibold text-neutral-900 text-xs">
                            All Discovered Places ({msg.structuredData.allDiscoveredPlaces.length} verified)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedCatalogMessageIds((prev) =>
                              prev.includes(msg.id) ? prev.filter((id) => id !== msg.id) : [...prev, msg.id]
                            );
                          }}
                          className="text-[11px] font-semibold text-neutral-800 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{expandedCatalogMessageIds.includes(msg.id) ? 'Collapse' : 'View All Places'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedCatalogMessageIds.includes(msg.id) ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {expandedCatalogMessageIds.includes(msg.id) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto panel-scroll pr-1 pt-1 border-t border-neutral-100">
                          {msg.structuredData.allDiscoveredPlaces.map((item) => (
                            <div key={item.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="font-semibold text-neutral-900 text-xs truncate block">{item.name}</span>
                                <span className="text-[10px] text-neutral-500 block">
                                  📍 {item.city} · ★ {item.rating} · {budgetService.formatCurrency(item.exact_price, currency)}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  onOpenPlaceDetails({
                                    id: item.id,
                                    title: item.name,
                                    category: item.category,
                                    city: item.city,
                                    region: item.region,
                                    shortDescription: item.description,
                                    fullDescription: item.description,
                                    rating: item.rating,
                                    reviewCount: item.review_count,
                                    estimatedPrice: item.exact_price,
                                    priceLocalTND: Math.round(item.exact_price * 3.1),
                                    priceUnit: item.category === 'hotel' ? 'per_night' : 'entry',
                                    latitude: item.coordinates.latitude,
                                    longitude: item.coordinates.longitude,
                                    imageUrl: item.photos[0] || 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=80',
                                    familyFriendly: item.family_friendly,
                                    calmAtmosphere: item.quietness >= 7,
                                    matchReason: item.matchExplanation,
                                    sourceName: item.source,
                                    sourceUrl: item.source_url,
                                    lastChecked: item.last_checked,
                                    isVerified: item.isVerified,
                                  })
                                }
                                className="px-2 py-1 rounded-md bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-[11px] font-medium shrink-0 cursor-pointer transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sources Footnote in Message */}
                  {msg.structuredData?.sources && msg.structuredData.sources.length > 0 && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 shadow-2xs">
                      <span className="font-semibold text-neutral-900 block mb-1">
                        Authoritative Sources:
                      </span>
                      <ul className="space-y-1">
                        {msg.structuredData.sources.map((s, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span className="truncate font-medium">
                              {s.name} — <span className="text-neutral-500 font-normal">{s.context}</span>
                            </span>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-900 hover:underline flex items-center gap-0.5 shrink-0 ml-2 font-medium"
                            >
                              <span>Official Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Minimal Thinking State (ChatGPT Style) */}
          {isAgentThinking && (
            <div className="flex gap-3 max-w-md mr-auto animate-fadeIn">
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 shadow-2xs flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  <span className="text-xs font-semibold text-neutral-900">
                    Researching places, driving routes & budget...
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 pl-3 border-l-2 border-neutral-200">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <Check className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Understanding requirements</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-800 font-medium">
                    {currentToolSteps.length > 2 ? (
                      <Check className="w-3.5 h-3.5 text-black shrink-0" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin shrink-0" />
                    )}
                    <span>Executing live queries</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentToolSteps.length > 2 ? 'text-neutral-800 font-medium' : 'text-neutral-400'}`}>
                    {currentToolSteps.length > 3 ? (
                      <Check className="w-3.5 h-3.5 text-black shrink-0" />
                    ) : currentToolSteps.length > 2 ? (
                      <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 ml-1 mr-1 shrink-0" />
                    )}
                    <span>Optimizing route & buffer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Quick Prompts (ChatGPT pill style) */}
      <div className="px-4 py-2 bg-white border-t border-neutral-100 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => handleSuggestionClick("I like this plan but I don't want to stay in Tunis")}
          className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0 transition-colors cursor-pointer"
        >
          “Don’t stay in Tunis”
        </button>
        <button
          onClick={() => handleSuggestionClick("Keep the hotel in Hammamet but replace the second activity")}
          className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0 transition-colors cursor-pointer"
        >
          “Replace second activity”
        </button>
        <button
          onClick={() => handleSuggestionClick("Add more beach and swimming time")}
          className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0 transition-colors cursor-pointer"
        >
          “More swimming”
        </button>
        <button
          onClick={() => handleSuggestionClick("Perfect. Book it.")}
          className="text-xs font-semibold px-3 py-1 rounded-full bg-black hover:bg-neutral-800 text-white shrink-0 transition-colors cursor-pointer"
        >
          “Perfect. Book it.”
        </button>
      </div>

      {/* ChatGPT Floating Input Bar */}
      <div className="p-4 bg-white border-t border-neutral-200 shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2 bg-neutral-50 border border-neutral-300 rounded-3xl p-2 px-4 focus-within:border-neutral-700 focus-within:bg-white transition-all shadow-xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask TuniTrip to plan a journey... (e.g. '7 days in Tunisia for 4, budget $2450')"
            className="w-full text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none bg-transparent py-1.5"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAgentThinking}
            className="w-8 h-8 rounded-full bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
        <div className="text-center text-[11px] text-neutral-400 mt-2">
          TuniTrip Autonomous AI Travel Research Engine · Verifies live rates, routes & tickets.
        </div>
      </div>
    </div>
  );
};
