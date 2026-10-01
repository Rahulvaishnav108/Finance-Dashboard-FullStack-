import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboard.store';

export function RecentOrders() {
  const { recentOrders } = useDashboardStore();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent Orders</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-0.5">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.id}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{order.customer}</p>
              <p className="text-[11px] text-gray-300 dark:text-gray-600">{order.time}</p>
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{order.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}