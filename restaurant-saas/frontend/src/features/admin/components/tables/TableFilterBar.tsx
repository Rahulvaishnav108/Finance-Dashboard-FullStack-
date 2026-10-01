import React, { useState } from 'react';
import { Search, LayoutGrid, List, Map, ChevronDown } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import type { TableSection, TableStatus } from '../../store/tables.store';

const sections: (TableSection | 'All')[] = ['All', 'Indoor', 'Outdoor', 'Bar', 'Private'];
const statuses: (TableStatus | 'All')[]  = ['All', 'Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked'];
const floors:   (number | 'All')[]       = ['All', 1, 2];

export function TableFilterBar(): JSX.Element {
  const { filter, viewMode, setFilter, setViewMode } = useTablesStore();
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  return (
    <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
      {/* Row 1 (mobile) / inline (desktop): Search + selects + view toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search table…"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 dark:focus:border-orange-600 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 w-36"
          />
        </div>

        {/* Status filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value as TableStatus | 'All' })}
          className="py-2 pl-3 pr-8 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Status' : s}
            </option>
          ))}
        </select>

        {/* Floor filter */}
        <select
          value={filter.floor}
          onChange={(e) =>
            setFilter({ floor: e.target.value === 'All' ? 'All' : Number(e.target.value) })
          }
          className="py-2 pl-3 pr-8 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-100"
        >
          {floors.map((f) => (
            <option key={f} value={f}>
              {f === 'All' ? 'All Floors' : `Floor ${f}`}
            </option>
          ))}
        </select>

        {/* View mode toggle – pushed right on desktop */}
        <div className="sm:ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(
            [
              { mode: 'floor-map', icon: Map },
              { mode: 'grid',      icon: LayoutGrid },
              { mode: 'list',      icon: List },
            ] as const
          ).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
              title={mode.replace('-', ' ')}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Section filter – scrollable on mobile, pill row on desktop */}
      <div className="relative sm:hidden">
        <button
          onClick={() => setShowSectionMenu((v) => !v)}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300"
        >
          <span className="flex-1 text-left">
            Section: {filter.section === 'All' ? 'All' : filter.section}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSectionMenu ? 'rotate-180' : ''}`} />
        </button>
        {showSectionMenu && (
          <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 overflow-hidden">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilter({ section: s as TableSection | 'All' });
                  setShowSectionMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                  filter.section === s
                    ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section pills – visible on sm+ */}
      <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex-wrap">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setFilter({ section: s as TableSection | 'All' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter.section === s
                ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}