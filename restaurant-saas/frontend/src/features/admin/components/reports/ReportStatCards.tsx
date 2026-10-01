import React from 'react';
import { useReportsStore } from '../../store/reports.store';

export function ReportStatCards(): JSX.Element {
  const { getStats } = useReportsStore();
  const stats = getStats();

  const cards = [
    { label: 'Total Revenue',     value: stats.totalRevenue,                    change: stats.totalRevenueChange,     up: true },
    { label: 'Total Orders',      value: stats.totalOrders.toLocaleString(),     change: stats.totalOrdersChange,      up: true },
    { label: 'Avg. Order Value',  value: stats.avgOrderValue,                   change: stats.avgOrderValueChange,    up: true },
    { label: 'Total Customers',   value: stats.totalCustomers.toLocaleString(), change: stats.totalCustomersChange,   up: true },
    { label: 'Repeat Customers',  value: stats.repeatCustomers.toLocaleString(),change: stats.repeatCustomersChange,  up: true },
    { label: 'Net Profit',        value: stats.netProfit,                       change: stats.netProfitChange,        up: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 sm:p-4"
        >
          <p className="text-[11px] text-gray-400 font-medium leading-tight">{c.label}</p>
          <p className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 mt-1 truncate">
            {c.value}
          </p>
          <p className={`text-[10px] font-semibold mt-0.5 ${c.up ? 'text-green-500' : 'text-red-500'}`}>
            {c.change}
          </p>
        </div>
      ))}
    </div>
  );
}