import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useMenuStore, type FilterTab, type SortOption, type AdvancedFilter } from '../../store/menu.store';
import { FilterModal } from './FilterModal';

const FILTER_TABS: FilterTab[] = ['All Items', 'Available', 'Unavailable', 'Low Stock'];
const SORT_OPTIONS: SortOption[] = ['Name A-Z', 'Name Z-A', 'Price Low-High', 'Price High-Low', 'Stock Low-High'];

const DEFAULT_FILTER: AdvancedFilter = { minPrice: '', maxPrice: '', statuses: [] };

export function MenuFilterBar(): JSX.Element {
  const {
    activeFilter,   setActiveFilter,
    searchQuery,    setSearchQuery,
    sortOption,     setSortOption,
    advancedFilter, setAdvancedFilter,
  } = useMenuStore();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasAdvFilter =
    advancedFilter.minPrice !== '' ||
    advancedFilter.maxPrice !== '' ||
    advancedFilter.statuses.length > 0;

  const clearAdvFilter = () => setAdvancedFilter(DEFAULT_FILTER);

  return (
    <>
      <div className="mb-4 sm:mb-5">
        {/* Tab row */}
        <div className="flex items-center overflow-x-auto border-b border-gray-100 dark:border-gray-800 mb-3"
          style={{ scrollbarWidth: 'none' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px flex-shrink-0 ${
                activeFilter === tab
                  ? 'border-orange-500 text-orange-500 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search + controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items…"
              className="w-full sm:w-44 pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 focus:border-orange-300 dark:focus:border-orange-700 placeholder:text-gray-400 text-gray-700 dark:text-gray-200 transition-all"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors flex-shrink-0 ${
              hasAdvFilter
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasAdvFilter && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center ml-0.5">
                !
              </span>
            )}
          </button>

          {/* Clear advanced filter */}
          {hasAdvFilter && (
            <button
              onClick={clearAdvFilter}
              title="Clear advanced filters"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-gray-200 dark:border-gray-700 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Active filter chips */}
          {hasAdvFilter && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {advancedFilter.minPrice !== '' && (
                <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full border border-orange-200 dark:border-orange-800">
                  Min ₹{advancedFilter.minPrice}
                </span>
              )}
              {advancedFilter.maxPrice !== '' && (
                <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full border border-orange-200 dark:border-orange-800">
                  Max ₹{advancedFilter.maxPrice}
                </span>
              )}
              {advancedFilter.statuses.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full border border-orange-200 dark:border-orange-800">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="relative flex-shrink-0 ml-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 outline-none transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>Sort: {opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {showFilterModal && (
        <FilterModal
          initial={advancedFilter}
          onApply={(opts) => setAdvancedFilter(opts)}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </>
  );
}