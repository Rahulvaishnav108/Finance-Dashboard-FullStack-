import React from 'react';
import { Search, X } from 'lucide-react';
import { useOrdersStore, type OrderStatus } from '../../store/orders.store';
import { STATUS_TABS } from './orders.constants';

export function OrdersTabBar() {
  const { orders, activeTab, searchQuery, setActiveTab, setSearchQuery } = useOrdersStore();

  const tabCount = (tab: OrderStatus | 'All') =>
    tab === 'All' ? orders.length : orders.filter((o) => o.status === tab).length;

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      {/* Tabs row — scrollable on mobile */}
      <div className="flex items-center gap-0 overflow-x-auto px-3 sm:px-5 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px flex-shrink-0 ${
                isActive
                  ? 'border-orange-500 text-orange-500 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {tabCount(tab)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline search below tabs — full width on mobile, right-aligned on sm+ */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-end">
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search orders..."
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
      </div>
    </div>
  );
}