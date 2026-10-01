import React, { useState, useEffect } from 'react';
import { ORDERS, type KitchenOrder, type OrderStatus, type OrderType } from '../store/kitchenData';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Delayed', value: 'delayed' },
  { label: 'Completed', value: 'completed' },
];

const TYPE_TABS: { label: string; value: OrderType | 'all' }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Dine In', value: 'dine-in' },
  { label: 'Take Away', value: 'take-away' },
  { label: 'Delivery', value: 'delivery' },
];

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-400',
};

export default function KitchenOrdersPage() {
  const { query } = useKitchenSearch();

  const [orders, setOrders] = useState<KitchenOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_orders');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored kitchen orders", e);
        }
      }
    }
    return ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('kitchen_orders', JSON.stringify(orders));
  }, [orders]);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_orders_status_filter');
      if (stored) return stored as OrderStatus | 'all';
    }
    return 'all';
  });

  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_orders_type_filter');
      if (stored) return stored as OrderType | 'all';
    }
    return 'all';
  });

  const handleStatusFilterChange = (filter: OrderStatus | 'all') => {
    setStatusFilter(filter);
    localStorage.setItem('kitchen_orders_status_filter', filter);
  };

  const handleTypeFilterChange = (filter: OrderType | 'all') => {
    setTypeFilter(filter);
    localStorage.setItem('kitchen_orders_type_filter', filter);
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.table.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q));
    }
    return true;
  });

  const handleAction = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-sans">Orders Management</h2>
          <p className="text-sm text-slate-500 font-sans">Track and manage all kitchen orders</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500 font-sans">{filtered.length} orders</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Tabs */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(({ label, value }) => (
            <button key={value} onClick={() => handleStatusFilterChange(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-colors ${statusFilter === value ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
        {/* Type Tabs */}
        <div className="flex gap-1 flex-wrap">
          {TYPE_TABS.map(({ label, value }) => (
            <button key={value} onClick={() => handleTypeFilterChange(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-colors ${typeFilter === value ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Table</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-[200px]">
                    {order.items.map(i => `${i.qty}× ${i.name}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">{order.table}</td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{order.type.replace('-', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{order.timeAgo}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      {order.status === 'new' && (
                        <>
                          <button onClick={() => handleAction(order.id, 'preparing')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700">Accept</button>
                          <button onClick={() => handleAction(order.id, 'cancelled')} className="px-3 py-1 border border-red-200 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-50">Reject</button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => handleAction(order.id, 'ready')} className="px-3 py-1 bg-orange-600 text-white rounded-lg text-[10px] font-bold hover:bg-orange-700">Ready</button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => handleAction(order.id, 'completed')} className="px-3 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700">Pickup</button>
                      )}
                      {order.status === 'delayed' && (
                        <button onClick={() => handleAction(order.id, 'preparing')} className="px-3 py-1 border border-red-200 text-red-500 rounded-lg text-[10px] font-bold">⚡ Rush</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-sans">No orders match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
