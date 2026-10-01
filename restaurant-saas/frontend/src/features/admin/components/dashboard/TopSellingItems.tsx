import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboard.store';

export function TopSellingItems() {
  const { topSellingItems } = useDashboardStore();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Top Selling Items</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3.5">
        {topSellingItems.map((item) => {
          const pct = Math.round((item.count / item.maxCount) * 100);
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-lg flex-shrink-0">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-2 flex-shrink-0">{item.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}