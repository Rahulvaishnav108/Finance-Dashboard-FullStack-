import React, { useState } from 'react';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';
import { useStaffDashboard } from '../hooks/useStaffDashboard';
import type { Order } from '../store/staff.store';

export default function StaffOrdersPage() {
  const { query } = useStaffSearch();
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('Active');
  const { orders, setOrders } = useStaffDashboard();

  const updateOrderStatus = (id: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  // Filter orders by tab
  const tabFiltered = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return ['Pending', 'Preparing', 'Ready', 'Served'].includes(order.status);
    if (activeTab === 'Completed') return order.status === 'Completed';
    if (activeTab === 'Cancelled') return order.status === 'Cancelled';
    return true;
  });

  // Filter orders by search query
  const searchedOrders = tabFiltered.filter(order =>
    order.id.toLowerCase().includes(query.toLowerCase()) ||
    order.table.toLowerCase().includes(query.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track, update, and settle guest orders.</p>
        </div>
        <button
          onClick={() => {
            const tableNum = prompt("Enter Table Number (e.g. Table 6):");
            if (tableNum) {
              const newOrder: Order = {
                id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                table: tableNum,
                items: [{ name: 'Chef Special Starter', qty: 1, price: 290 }],
                status: 'Pending',
                time: 'Just now',
                total: 290
              };
              setOrders([newOrder, ...orders]);
            }
          }}
          className="bg-dine-orange hover:bg-dine-orange/90 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-dine-orange/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['Active', 'Completed', 'Cancelled', 'All'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 font-sans text-xs font-bold transition-all relative border-b-2 ${
              activeTab === tab
                ? 'border-dine-orange text-dine-orange'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab} Orders
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {searchedOrders.length > 0 ? (
          searchedOrders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between"
            >
              {/* Top Row: Order ID, Table & Status */}
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 font-sans">{order.table}</span>
                    <span className="text-[10px] text-slate-400 font-sans ml-2">({order.id})</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    order.status === 'Pending' ? 'bg-orange-50 text-dine-orange dark:bg-orange-950/40 dark:text-orange-400 animate-pulse' :
                    order.status === 'Preparing' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                    order.status === 'Ready' ? 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 animate-bounce' :
                    order.status === 'Served' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' :
                    order.status === 'Completed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Mid section: Items list */}
                <div className="py-4 space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">{item.qty}x</span>
                        <span className="font-medium text-slate-750 dark:text-slate-300 font-sans">{item.name}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom section: Actions & Total */}
              <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 font-sans">Total Amount</span>
                  <span className="text-slate-800 dark:text-slate-150 font-sans text-sm">₹{order.total}</span>
                </div>
                <div className="flex gap-2">
                  {order.status === 'Ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Served')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-[11px] py-2 px-3 rounded-lg shadow-sm transition-all"
                    >
                      Mark Served
                    </button>
                  )}
                  {order.status === 'Served' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Completed')}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold text-[11px] py-2 px-3 rounded-lg shadow-sm transition-all"
                    >
                      Collect Payment
                    </button>
                  )}
                  {['Pending', 'Preparing'].includes(order.status) && (
                    <button
                      onClick={() => {
                        const newName = prompt("Add item name:");
                        if (newName) {
                          const newQty = parseInt(prompt("Qty:") || "1", 10);
                          const newPrice = parseInt(prompt("Price (₹):") || "100", 10);
                          setOrders(prev => prev.map(o => o.id === order.id ? {
                            ...o,
                            items: [...o.items, { name: newName, qty: newQty, price: newPrice }],
                            total: o.total + (newPrice * newQty)
                          } : o));
                        }
                      }}
                      className="flex-1 border border-slate-205 hover:border-dine-orange text-slate-650 hover:text-dine-orange font-bold text-[10px] py-2 px-3 rounded-lg transition-all"
                    >
                      + Add Item
                    </button>
                  )}
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                      className="border border-red-105 hover:border-red-500 text-red-500 font-bold text-[10px] px-2.5 py-2 rounded-lg transition-all"
                      title="Cancel Order"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-sans">
                  <span>Ordered {order.time}</span>
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">av_timer</span>
                    Kitchen sync active
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No matching orders found.
          </div>
        )}
      </div>
    </div>
  );
}
