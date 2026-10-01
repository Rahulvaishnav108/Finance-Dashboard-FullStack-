import React, { useState, useEffect } from 'react';
import { ORDERS, POPULAR_ITEMS, type KitchenOrder } from '../store/kitchenData';
import OrderCard from '../components/dashboard/OrderCard';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';

export default function KitchenOverviewPage() {
  const { query } = useKitchenSearch();

  // Load and save orders state
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

  // Load and save active tab state
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_overview_active_tab');
      if (stored) return stored;
    }
    return 'NEW ORDERS';
  });

  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    localStorage.setItem('kitchen_overview_active_tab', tabName);
  };

  const toggleColumnExpand = (columnTitle: string) => {
    setExpandedColumns(prev => ({ ...prev, [columnTitle]: !prev[columnTitle] }));
  };

  const filterByQuery = (o: KitchenOrder) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.table.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q));
  };

  const newOrders = orders.filter(o => o.status === 'new' && filterByQuery(o));
  const preparing = orders.filter(o => o.status === 'preparing' && filterByQuery(o));
  const ready = orders.filter(o => o.status === 'ready' && filterByQuery(o));
  const delayed = orders.filter(o => o.status === 'delayed' && filterByQuery(o));

  const handleAccept = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'preparing' as const, progress: 10 } : o));
  const handleReject = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));
  const handleMarkReady = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready' as const } : o));
  const handleDelay = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'delayed' as const, delayMins: 5 } : o));
  const handlePickup = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' as const } : o));
  const handleRush = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'preparing' as const, progress: 50 } : o));
  const handleAcceptAll = () => setOrders(prev => prev.map(o => o.status === 'new' ? { ...o, status: 'preparing' as const, progress: 10 } : o));
  const handleRefreshFeed = () => {
    setOrders(ORDERS);
    localStorage.setItem('kitchen_orders', JSON.stringify(ORDERS));
  };

  const columns = [
    { title: 'NEW ORDERS', icon: 'assignment', count: newOrders.length, color: 'blue', items: newOrders },
    { title: 'PREPARING', icon: 'menu_book', count: preparing.length, color: 'orange', items: preparing },
    { title: 'READY', icon: 'check_circle', count: ready.length, color: 'green', items: ready },
    { title: 'DELAYED', icon: 'schedule', count: delayed.length, color: 'red', items: delayed },
  ];

  const mobileTabs = [
    { title: 'CONTROLS', icon: 'tune', color: 'slate' },
    { title: 'NEW ORDERS', icon: 'assignment', color: 'blue' },
    { title: 'PREPARING', icon: 'menu_book', color: 'orange' },
    { title: 'READY', icon: 'check_circle', color: 'green' },
    { title: 'DELAYED', icon: 'schedule', color: 'red' },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    green: { bg: 'bg-green-100', text: 'text-green-600', iconBg: 'bg-green-100' },
    red: { bg: 'bg-red-100', text: 'text-red-600', iconBg: 'bg-red-100' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600', iconBg: 'bg-slate-100' },
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 overflow-hidden h-full">
      {/* Mobile/Tablet Column Selector Tabs */}
      <div className="flex lg:hidden overflow-x-auto bg-white border border-slate-100 rounded-2xl p-1.5 shrink-0 gap-1.5 mb-2 scrollbar-none">
        {mobileTabs.map(({ title, icon, color }) => {
          const c = colorMap[color];
          const isActive = activeTab === title;
          const column = columns.find(col => col.title === title);
          const count = column ? column.count : null;

          return (
            <button
              key={title}
              onClick={() => handleTabChange(title)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? `${c.bg} ${c.text} shadow-sm`
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
              <span>{title.split(' ')[0]}</span>
              {count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/50' : 'bg-slate-100 text-slate-600'}`}>
                  {String(count).padStart(2, '0')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Order Columns Grid */}
      <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 overflow-hidden ${activeTab === 'CONTROLS' ? 'hidden lg:grid' : 'grid'}`}>
        {columns.map(({ title, icon, count, color, items }) => {
          const c = colorMap[color];
          const isTabActive = activeTab === title;
          return (
            <div key={title} className={`flex-col gap-4 min-h-0 ${isTabActive ? 'flex' : 'hidden lg:flex'}`}>
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 ${c.iconBg} rounded ${c.text}`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <h3 className={`font-bold ${c.text} text-sm tracking-wide font-sans`}>{title}</h3>
                </div>
                <span className={`${c.text} font-bold text-sm font-sans`}>{String(count).padStart(2, '0')}</span>
              </div>
              {/* Cards */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {(expandedColumns[title] ? items : items.slice(0, 3)).map(order => (
                  <OrderCard key={order.id} order={order} onAccept={handleAccept} onReject={handleReject} onMarkReady={handleMarkReady} onDelay={handleDelay} onPickup={handlePickup} onRush={handleRush} />
                ))}
                {items.length > 3 && (
                  <button onClick={() => toggleColumnExpand(title)} className={`w-full text-center py-2 ${c.text} font-bold text-xs font-sans bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors`}>
                    {expandedColumns[title] ? 'Show Less' : `+ ${items.length - 3} More Orders`}
                  </button>
                )}
                {items.length === 0 && (
                  <div className="text-center text-slate-400 text-xs font-sans py-8">No orders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Sidebar */}
      <div
        className={`w-full lg:w-72 xl:w-80 shrink-0 ${
          activeTab === 'CONTROLS' ? 'block' : 'hidden lg:block'
        } overflow-y-auto lg:max-h-[calc(100vh-140px)]`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pb-6 lg:pb-0">
          {/* Quick Chef Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-red-500 text-sm">⚡</span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 font-sans">Quick Chef Controls</h3>
            </div>
            <div className="space-y-3">
              <button onClick={handleAcceptAll} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-100 font-sans hover:bg-red-600 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                Accept All New Orders
              </button>
              <button className="w-full py-3 border border-orange-200 text-orange-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 font-sans transition-colors">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Delay All Preparing Orders
              </button>
              <button onClick={handleRefreshFeed} className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 font-sans transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Refresh Feed
              </button>
            </div>
          </div>

          {/* Kitchen Pressure Gauge */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center gap-2 mb-6">
              <span className="text-orange-500 text-sm">🔥</span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 font-sans">Kitchen Pressure</h3>
            </div>
            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#F1F5F9" strokeWidth="12" strokeLinecap="round" transform="rotate(-90 90 90)" />
                <circle cx="90" cy="90" r="70" fill="none" stroke="#F97316" strokeWidth="12" strokeLinecap="round" transform="rotate(-90 90 90)" strokeDasharray="439.8" strokeDashoffset="96.7" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800 font-sans">78%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-sans">Medium Load</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-y-3 gap-x-4">
              {[
                { color: 'bg-green-500', label: 'Low', range: '0-40%' },
                { color: 'bg-orange-400', label: 'Medium', range: '41-80%' },
                { color: 'bg-red-500', label: 'High', range: '81-100%' },
                { color: 'bg-red-900', label: 'Critical', range: '100%+' },
              ].map(({ color, label, range }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-slate-600 font-medium font-sans">{label}</span>
                  <span className="text-[10px] text-slate-400 ml-auto font-sans">{range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-slate-800 text-[16px]">trending_up</span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 font-sans">Popular Items Today</h3>
            </div>
            <div className="space-y-4">
              {POPULAR_ITEMS.map(({ name, count, pct }) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 font-sans">
                    <span>{name}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full">
                    <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 text-blue-600 font-bold text-xs hover:underline font-sans">View All Items</button>
          </div>
        </div>
      </div>
    </div>
  );
}
