// components/Toolbar.tsx
import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, CheckCheck, Trash2 } from 'lucide-react';
import { FilterType, SortOrder } from './index';
import { cx } from '../../utils/Alertutils';

interface ToolbarProps {
  activeFilter: FilterType;
  setActiveFilter: (f: FilterType) => void;
  sortOrder: SortOrder;
  setSortOrder: (s: SortOrder) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onMarkAllRead: () => void;
  onDismissAll: () => void;
  newCount: number;
  darkMode: boolean;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Resolved', value: 'resolved' },
];

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'By severity', value: 'severity' },
];

export default function Toolbar({
  activeFilter, setActiveFilter, sortOrder, setSortOrder,
  searchQuery, setSearchQuery, onMarkAllRead, onDismissAll,
  newCount, darkMode,
}: ToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  const base = darkMode
    ? 'bg-slate-900 border-slate-800 text-slate-300'
    : 'bg-white border-gray-100 text-gray-600';

  const inputBase = darkMode
    ? 'bg-slate-900/70 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-orange-500'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-400';

  return (
    <div className={cx('rounded-2xl border shadow-sm mb-6 transition-colors', base)}>
      {/* Search Row */}
      <div className="px-4 pt-4 pb-3 border-b border-inherit">
        <div className="relative">
          <Search className={cx('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', darkMode ? 'text-slate-500' : 'text-gray-400')} />
          <input
            type="text"
            placeholder="Search by title, entity, or tag…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={cx(
              'w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm transition-colors outline-none',
              inputBase
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={cx('absolute right-3 top-1/2 -translate-y-1/2', darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filter chips — scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 flex-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cx(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                activeFilter === f.value
                  ? 'bg-[#ff5a1f] text-white shadow-sm shadow-orange-500/30'
                  : darkMode
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={cx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors',
                darkMode ? 'border-slate-700 hover:border-slate-600 text-slate-400' : 'border-gray-200 hover:border-gray-300 text-gray-500'
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort</span>
              <ChevronDown className={cx('w-3 h-3 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className={cx(
                'absolute right-0 top-full mt-1.5 w-44 rounded-xl border shadow-xl z-20 py-1 overflow-hidden',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
              )}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortOrder(opt.value); setSortOpen(false); }}
                    className={cx(
                      'w-full text-left px-4 py-2 text-xs font-medium transition-colors',
                      sortOrder === opt.value
                        ? 'text-orange-500'
                        : darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark all read */}
          {newCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className={cx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors',
                darkMode ? 'border-slate-700 hover:border-orange-800 text-slate-400 hover:text-orange-400' : 'border-gray-200 hover:border-orange-200 text-gray-500 hover:text-orange-600'
              )}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {/* Dismiss all visible */}
          <button
            onClick={onDismissAll}
            className={cx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors',
              darkMode ? 'border-slate-700 hover:border-red-900 text-slate-400 hover:text-red-400' : 'border-gray-200 hover:border-red-100 text-gray-500 hover:text-red-500'
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dismiss visible</span>
          </button>
        </div>
      </div>
    </div>
  );
}