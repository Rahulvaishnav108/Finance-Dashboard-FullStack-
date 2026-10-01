import React from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { useCustomersStore, type CustomerStatus, type LoyaltyTier } from '../../store/customers.store';

const STATUS_OPTIONS: Array<CustomerStatus | 'All'> = ['All', 'Active', 'Inactive'];
const TIER_OPTIONS: Array<LoyaltyTier | 'All'>      = ['All', 'Gold', 'Silver', 'Bronze'];

export function CustomersFilterBar() {
  const {
    searchQuery,        setSearchQuery,
    activeStatusFilter, setStatusFilter,
    activeTierFilter,   setTierFilter,
  } = useCustomersStore();

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800">
      {/* Search — full width on mobile, constrained on sm+ */}
      <div className="relative w-full sm:flex-1 sm:min-w-[160px] sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 dark:focus:border-orange-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={activeStatusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'All')}
          className="appearance-none pl-3 pr-7 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 cursor-pointer"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Tier filter */}
      <div className="relative">
        <select
          value={activeTierFilter}
          onChange={(e) => setTierFilter(e.target.value as LoyaltyTier | 'All')}
          className="appearance-none pl-3 pr-7 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 cursor-pointer"
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'Loyalty Tier' : t}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Filter button */}
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Filter className="w-3.5 h-3.5" />
        Filter
      </button>
    </div>
  );
}