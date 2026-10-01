import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../store/orders.store';

const orders = [
  { id: '#ORD-1042', table: 'Table 7',  items: 'Pasta, Wine, Tiramisu',   total: '₹1,240', status: 'Served',    time: '2 min ago',  statusColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
  { id: '#ORD-1041', table: 'Table 12', items: 'Burger, Fries, Coke',      total: '₹680',   status: 'Preparing', time: '8 min ago',  statusColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' },
  { id: '#ORD-1040', table: 'Table 3',  items: 'Sushi Platter, Sake',      total: '₹2,100', status: 'Pending',   time: '12 min ago', statusColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
  { id: '#ORD-1039', table: 'Table 5',  items: 'Steak, Salad, Juice',      total: '₹1,850', status: 'Served',    time: '18 min ago', statusColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
  { id: '#ORD-1038', table: 'Table 9',  items: 'Pizza, Garlic Bread',      total: '₹920',   status: 'Cancelled', time: '25 min ago', statusColor: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
];

export function RecentOrdersTable(): JSX.Element {
  const navigate = useNavigate();
  const { setSortBy, setActiveTab, setCurrentPage } = useOrdersStore();

  function handleViewAll() {
    setActiveTab('All');
    setSortBy('time');
    setCurrentPage(1);
    navigate('/admin/orders');
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Recent Orders</h3>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide">Order</th>
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide">Table</th>
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide hidden lg:table-cell">Items</th>
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide">Total</th>
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide">Status</th>
              <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 px-4 sm:px-5 py-3 uppercase tracking-wide hidden sm:table-cell">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={handleViewAll}
                className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer last:border-b-0"
              >
                <td className="px-4 sm:px-5 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{order.id}</td>
                <td className="px-4 sm:px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{order.table}</td>
                <td className="px-4 sm:px-5 py-3.5 text-sm text-gray-500 dark:text-gray-500 hidden lg:table-cell max-w-[180px] truncate">{order.items}</td>
                <td className="px-4 sm:px-5 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{order.total}</td>
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-xs text-gray-400 dark:text-gray-500 hidden sm:table-cell whitespace-nowrap">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}