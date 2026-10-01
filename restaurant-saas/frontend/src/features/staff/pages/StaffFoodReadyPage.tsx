import React from 'react';
import { Link } from 'react-router-dom';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';
import { useStaffDashboard } from '../hooks/useStaffDashboard';

export default function StaffFoodReadyPage() {
  const { query } = useStaffSearch();
  const { readyItems: items, setReadyItems: setItems } = useStaffDashboard();

  const markServed = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const markAllServed = () => {
    setItems([]);
  };

  const filteredItems = items.filter(item =>
    item.item.toLowerCase().includes(query.toLowerCase()) ||
    item.table.toLowerCase().includes(query.toLowerCase()) ||
    item.station.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Food Ready Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Collect completed orders from the kitchen and serve guests.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={markAllServed}
            className="border border-green-500 text-green-605 hover:bg-green-50 dark:hover:bg-green-950/20 font-bold text-xs py-2 px-4 rounded-xl transition-all"
          >
            Mark All Picked Up
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between ${
                item.elapsedSec >= 240
                  ? 'border-l-4 border-l-red-500 dark:hover:border-red-900/40'
                  : 'border-l-4 border-l-green-500'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">{item.table}</h2>
                    <span className="inline-flex text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-sans mt-0.5">
                      {item.station}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.elapsedSec >= 240
                      ? 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400 animate-pulse'
                      : 'bg-green-50 text-green-650 dark:bg-green-950/40 dark:text-green-400'
                  }`}>
                    Ready: {item.readySince}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-750 dark:text-slate-200 font-sans">{item.item}</span>
                  <span className="text-xs font-black bg-white dark:bg-slate-850 text-dine-orange border border-slate-200 rounded-lg px-2.5 py-1">
                    Qty: {item.qty}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => markServed(item.id)}
                  className="flex-1 bg-green-500 hover:bg-green-650 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-md shadow-green-500/10 transition-all"
                >
                  Served to Guest
                </button>
                <Link
                  to="/staff/orders"
                  className="border border-slate-100 hover:border-dine-orange text-slate-600 dark:text-slate-350 hover:text-dine-orange font-bold text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-center"
                  title="View Order Details"
                >
                  Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-slate-300">check_circle</span>
            <p className="text-sm font-bold text-slate-500 mt-2 font-sans">All food ready is served!</p>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Kitchen is currently preparing active orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
