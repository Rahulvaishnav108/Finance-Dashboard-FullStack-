import React, { useState, useEffect } from 'react';
import { BATCHES, type CookingBatch } from '../store/kitchenData';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';

export default function BatchCookingPage() {
  const { query } = useKitchenSearch();

  const [batches, setBatches] = useState<CookingBatch[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_batches');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse kitchen batches", e);
        }
      }
    }
    return BATCHES;
  });

  const [tab, setTab] = useState<'active' | 'scheduled' | 'completed'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_batches_tab');
      if (stored === 'active' || stored === 'scheduled' || stored === 'completed') {
        return stored;
      }
    }
    return 'active';
  });

  useEffect(() => {
    localStorage.setItem('kitchen_batches', JSON.stringify(batches));
  }, [batches]);

  const handleTabChange = (t: 'active' | 'scheduled' | 'completed') => {
    setTab(t);
    localStorage.setItem('kitchen_batches_tab', t);
  };

  const filtered = batches.filter(b => {
    if (b.status !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.items.some(i => i.toLowerCase().includes(q)) || b.chef.toLowerCase().includes(q);
    }
    return true;
  });

  const handleComplete = (id: string) => setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' as const, progress: 100 } : b));

  const TABS = [
    { label: 'Active', value: 'active' as const, count: batches.filter(b => b.status === 'active').length },
    { label: 'Scheduled', value: 'scheduled' as const, count: batches.filter(b => b.status === 'scheduled').length },
    { label: 'Completed', value: 'completed' as const, count: batches.filter(b => b.status === 'completed').length },
  ];

  const statusColor = { active: 'text-orange-600 bg-orange-100', scheduled: 'text-blue-600 bg-blue-100', completed: 'text-green-600 bg-green-100' };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-sans">Batch Cooking</h2>
          <p className="text-sm text-slate-500 font-sans">Manage cooking batches and schedules</p>
        </div>
        <button className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-100 font-sans flex items-center gap-2 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Batch
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {TABS.map(({ label, value, count }) => (
          <button key={value} onClick={() => handleTabChange(value)}
            className={`px-4 py-2 rounded-lg text-sm font-bold font-sans transition-colors flex items-center gap-2 ${tab === value ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
            {label}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tab === value ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(batch => (
          <div key={batch.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            {/* Batch Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 font-sans">{batch.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold font-sans">{batch.id}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor[batch.status]}`}>
                {batch.status}
              </span>
            </div>

            {/* Items */}
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 font-sans">Items</p>
              <div className="flex flex-wrap gap-1.5">
                {batch.items.map(item => (
                  <span key={item} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg font-medium font-sans border border-slate-100">{item}</span>
                ))}
              </div>
            </div>

            {/* Progress (active) */}
            {batch.status === 'active' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5 font-sans">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-orange-600">{batch.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${batch.progress}%` }} />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans mb-4">
              <div>
                <p className="text-slate-400">Servings</p>
                <p className="font-bold text-slate-700">{batch.servings}</p>
              </div>
              <div>
                <p className="text-slate-400">Chef</p>
                <p className="font-bold text-slate-700">{batch.chef}</p>
              </div>
              <div>
                <p className="text-slate-400">Start Time</p>
                <p className="font-bold text-slate-700">{batch.startTime}</p>
              </div>
              <div>
                <p className="text-slate-400">Est. Complete</p>
                <p className="font-bold text-slate-700">{batch.estComplete}</p>
              </div>
            </div>

            {/* Station */}
            <div className="flex items-center gap-2 text-[11px] font-sans mb-4">
              <span className="material-symbols-outlined text-[14px] text-orange-500">location_on</span>
              <span className="text-slate-500">{batch.station}</span>
            </div>

            {/* Actions */}
            {batch.status === 'active' && (
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-orange-200 text-orange-500 rounded-xl text-xs font-bold font-sans hover:bg-orange-50 transition-colors">Pause</button>
                <button onClick={() => handleComplete(batch.id)} className="flex-1 py-2 bg-green-600 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-green-100 hover:bg-green-700 transition-colors">Complete</button>
              </div>
            )}
            {batch.status === 'scheduled' && (
              <button className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors">Start Batch</button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-slate-400 font-sans py-12">No batches found</div>
        )}
      </div>
    </div>
  );
}
