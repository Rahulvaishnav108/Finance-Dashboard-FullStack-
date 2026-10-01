import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import type { MenuItemStatus, AdvancedFilter } from '../../store/menu.store';

// Re-export for any consumers that still import FilterOptions from here
export type { AdvancedFilter as FilterOptions };

interface Props {
  initial: AdvancedFilter;
  onApply: (opts: AdvancedFilter) => void;
  onClose: () => void;
}

const ALL_STATUSES: MenuItemStatus[] = ['Available', 'Unavailable', 'Low Stock', 'Out of Stock'];

const STATUS_COLORS: Record<MenuItemStatus, string> = {
  'Available':    'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  'Unavailable':  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Low Stock':    'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'Out of Stock': 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
};

export function FilterModal({ initial, onApply, onClose }: Props): JSX.Element {
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [statuses, setStatuses] = useState<MenuItemStatus[]>(initial.statuses);

  const toggleStatus = (s: MenuItemStatus) => {
    setStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleApply = () => {
    onApply({ minPrice: minPrice.trim(), maxPrice: maxPrice.trim(), statuses });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setStatuses([]);
  };

  const inputClass = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 focus:border-orange-300 dark:focus:border-orange-700 placeholder:text-gray-400 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Advanced Filter</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Price Range */}
          <div>
            <label htmlFor="filter-min-price" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold pointer-events-none">₹</span>
                  <input
                    id="filter-min-price"
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Minimum</p>
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold pointer-events-none">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="∞"
                    className={`${inputClass} pl-7`}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Maximum</p>
              </div>
            </div>

            {/* Live price range preview */}
            {(minPrice !== '' || maxPrice !== '') && (
              <p className="text-xs text-orange-500 font-semibold mt-2">
                Filtering: ₹{minPrice || '0'} — ₹{maxPrice || '∞'}
              </p>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Status</span>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    statuses.includes(s)
                      ? `${STATUS_COLORS[s]} border-current`
                      : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Reset All
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}