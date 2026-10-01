import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore, type StockStatus } from '../../store/dashboard.store';

const statusStyle: Record<StockStatus, string> = {
  'Low Stock':   'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  'Running Low': 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  'In Stock':    'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
};

export function LowStockAlerts() {
  const { stockAlerts } = useDashboardStore();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Low Stock Alerts</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {stockAlerts.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
              {item.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{item.stock}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${statusStyle[item.status]}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}