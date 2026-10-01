import React from 'react';
import { useSearch } from '../components/dashboard/SearchContext';
import FoodCard from '../components/dashboard/FoodCard';
import CategoryFilter from '../components/dashboard/CategoryFilter';

export default function CustomerMenuPage() {
  const { filteredItems, sortBy, setSortBy, vegOnly, setVegOnly, spicyOnly, setSpicyOnly, query } = useSearch();

  return (
    <div className="flex-1 flex flex-col h-full bg-sd-surface overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 sd-custom-scrollbar pb-24 md:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sd-on-surface font-sans">Our Menu</h2>
            <p className="text-sm text-sd-on-surface-variant font-sans">Delicious meals, made just for you.</p>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter />

        {/* Sub-filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-sd-surface-variant pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-sd-on-surface-variant font-sans">Sort by:</span>
              <select
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-sm font-semibold text-sd-primary p-0 cursor-pointer font-sans"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Recommended</option>
                <option>Popularity</option>
                <option>Price: Low to High</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Veg Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-sd-on-surface-variant font-sans">Veg Mode</span>
              <div
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  vegOnly ? 'bg-sd-secondary/20' : 'bg-sd-surface-variant'
                }`}
              >
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                />
                <div
                  className={`absolute left-0.5 h-4 w-4 rounded-full shadow-sm transition-all ${
                    vegOnly ? 'translate-x-4 bg-sd-secondary' : 'bg-white'
                  }`}
                />
              </div>
            </label>

            {/* Spicy Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="material-symbols-outlined text-sd-primary text-[18px]">local_fire_department</span>
              <span className="text-sm font-semibold text-sd-on-surface-variant font-sans">Extra Spicy</span>
              <div
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  spicyOnly ? 'bg-sd-primary/20' : 'bg-sd-surface-variant'
                }`}
              >
                <input
                  className="sr-only peer"
                  type="checkbox"
                  checked={spicyOnly}
                  onChange={(e) => setSpicyOnly(e.target.checked)}
                />
                <div
                  className={`absolute left-0.5 h-4 w-4 rounded-full shadow-sm transition-all ${
                    spicyOnly ? 'translate-x-4 bg-sd-primary' : 'bg-white'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Search results info */}
        {query && (
          <p className="text-sm text-sd-on-surface-variant font-sans">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>
        )}

        {/* Food Grid */}
        {filteredItems.length > 0 ? (
          <div className="food-grid-container">
            <div className="cq-food-grid-6">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-sd-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-30">search_off</span>
            <p className="text-lg font-bold font-sans">No dishes found</p>
            <p className="text-sm font-sans">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
