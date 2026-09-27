import React, { useState } from 'react';
import {
  Plus,
  Compass,
  Search,
  Trash2,
  ChevronRight,
  ChevronLeft,
  FolderHeart,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { TripPlan, Currency } from '../types';
import { budgetService } from '../services/budgetEngine';

interface PlanSidebarProps {
  plans: TripPlan[];
  activePlanId: string;
  currency: Currency;
  onSelectPlan: (planId: string) => void;
  onCreateNewPlan: () => void;
  onDeletePlan: (planId: string) => void;
  onOpenPlansHub: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenSettings?: () => void;
}

export const PlanSidebar: React.FC<PlanSidebarProps> = ({
  plans,
  activePlanId,
  currency,
  onSelectPlan,
  onCreateNewPlan,
  onDeletePlan,
  onOpenPlansHub,
  isCollapsed = false,
  onToggleCollapse,
  onOpenSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const confirmedCount = plans.filter((p) => p.status === 'confirmed').length;
  const pendingCount = plans.filter((p) => p.status === 'pending_confirmation' || p.status === 'draft').length;

  const filteredPlans = plans.filter((plan) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'confirmed'
        ? plan.status === 'confirmed'
        : plan.status === 'pending_confirmation' || plan.status === 'draft';

    const matchesSearch =
      searchQuery.trim() === '' ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Collapsed State: Minimal Dark Rail
  if (isCollapsed) {
    return (
      <div className="w-14 bg-[#171717] border-r border-neutral-800 p-2 flex flex-col items-center gap-3 shrink-0 h-full text-neutral-300 transition-all font-sans">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onCreateNewPlan}
          className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="New trip chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-6 h-px bg-neutral-800" />

        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto scrollbar-none w-full">
          {plans.map((p) => {
            const isActive = p.id === activePlanId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlan(p.id)}
                className={`w-9 h-9 rounded-lg relative flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
                title={p.title}
              >
                <Compass className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onOpenPlansHub}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Saved Plans"
          >
            <FolderHeart className="w-4 h-4" />
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Expanded State: Classic ChatGPT Dark Sidebar
  return (
    <div className="w-64 bg-[#171717] text-neutral-200 border-r border-neutral-800 flex flex-col h-full shrink-0 transition-all font-sans overflow-hidden">
      
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
              T
            </div>
            <span className="font-semibold text-white text-sm">
              TuniTrip
            </span>
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Trip Chat Button (ChatGPT + New chat style) */}
        <button
          onClick={onCreateNewPlan}
          className="w-full py-2 px-3 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>New trip chat</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">⌘N</span>
        </button>

        {/* Search */}
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips..."
            className="w-full pl-7.5 pr-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 mt-2.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            All ({plans.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'confirmed'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            Draft ({pendingCount})
          </button>
        </div>
      </div>

      {/* Plan Conversations Stream */}
      <div className="flex-1 overflow-y-auto panel-scroll p-2 space-y-1">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-8 px-3">
            <MessageSquare className="w-5 h-5 text-neutral-600 mx-auto mb-1.5" />
            <p className="text-xs text-neutral-400">No chats found</p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isActive = plan.id === activePlanId;
            const isConfirmed = plan.status === 'confirmed';

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`group relative rounded-lg p-2.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#212121] text-white border border-neutral-700/80 shadow-2xs'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isConfirmed ? 'bg-white' : 'bg-neutral-500'
                      }`}
                    />
                    <span className="text-[10px] text-neutral-400 font-medium truncate">
                      {isConfirmed ? 'Confirmed' : 'Draft'}
                    </span>
                  </div>

                  {plans.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${plan.title}"?`)) {
                          onDeletePlan(plan.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-neutral-500 hover:text-red-400 transition-opacity cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <h4 className="text-xs font-medium leading-snug line-clamp-1">
                  {plan.title}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500">
                  <span className="truncate max-w-[120px]">{plan.destination}</span>
                  <span className="text-neutral-400 font-medium shrink-0">
                    {budgetService.formatCurrency(plan.budget.totalEstimatedUSD, currency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status & Settings */}
      <div className="p-2 border-t border-neutral-800 bg-[#171717] shrink-0 space-y-1">
        <button
          onClick={onOpenPlansHub}
          className="w-full py-1.5 px-2.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>Autonomous Engine v2.0</span>
          </div>
          <FolderHeart className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full py-1.5 px-2.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              <span>Settings & Preferences</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">{currency}</span>
          </button>
        )}
      </div>
    </div>
  );
};
