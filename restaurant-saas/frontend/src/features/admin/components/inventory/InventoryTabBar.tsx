import React, { useRef, useState, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { useInventoryStore, type ItemTab, type ItemCategory } from '../../store/inventory.store';

const TABS: ItemTab[] = ['All Items', 'Ingredients', 'Beverages', 'Packaging', 'Cleaning Supplies', 'Other'];
const CATEGORIES: Array<ItemCategory | 'All Categories'> = [
  'All Categories', 'Ingredients', 'Beverages', 'Packaging', 'Cleaning Supplies', 'Other',
];

export function InventoryTabBar() {
  const {
    activeTab, setActiveTab,
    activeCategory, setActiveCategory,
    searchQuery, setSearchQuery,
    items,
  } = useInventoryStore();

  const [catOpen, setCatOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!catOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [catOpen]);

  const tabCount = (tab: ItemTab) => {
    if (tab === 'All Items') return items.length;
    return items.filter((i) => i.category === tab).length;
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      {/* ── Tabs row: horizontally scrollable, no clipping ── */}
      <div
        ref={tabsRef}
        className="flex items-end overflow-x-auto pb-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium
                whitespace-nowrap border-b-2 transition-all flex-shrink-0
                first:pl-4 last:pr-4
                ${isActive
                  ? 'border-orange-500 text-orange-500 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
              `}
            >
              {tab}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${
                  isActive
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                {tabCount(tab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + filter row ── */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Search — takes all remaining space */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter button — fixed width, never shrinks */}
        <div className="relative flex-shrink-0" ref={dropRef}>
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <Filter className="w-4 h-4 text-gray-400" />
            <span>Filter</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
          </button>

          {catOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-30 py-1 w-52">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-2 pb-1">
                Category
              </p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setActiveCategory(cat); setCatOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-500 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}