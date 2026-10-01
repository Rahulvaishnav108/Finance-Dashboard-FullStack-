import React, { useState, useEffect } from 'react';
import { STATIONS, type KitchenStation } from '../store/kitchenData';
import { useKitchenSearch } from '../components/dashboard/KitchenSearchContext';

export default function KitchenStationsPage() {
  const { query } = useKitchenSearch();

  const [stations, setStations] = useState<KitchenStation[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_stations');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse kitchen stations", e);
        }
      }
    }
    return STATIONS;
  });

  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [newChefName, setNewChefName] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('kitchen_stations', JSON.stringify(stations));
  }, [stations]);

  const filteredStations = stations.filter(station => {
    if (query) {
      const q = query.toLowerCase();
      return (
        station.name.toLowerCase().includes(q) ||
        station.chef.toLowerCase().includes(q) ||
        station.type.toLowerCase().includes(q) ||
        station.currentItems.some(i => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (id: string, status: 'active' | 'idle' | 'maintenance') => {
    setStations(prev =>
      prev.map(st => {
        if (st.id === id) {
          const loadVal = status === 'active' ? Math.floor(Math.random() * 40) + 40 : 0;
          return {
            ...st,
            status,
            load: loadVal,
            activeOrders: status === 'active' ? Math.floor(Math.random() * 4) + 1 : 0,
            chef: status === 'maintenance' ? '-' : st.chef === '-' ? 'Chef Arjun' : st.chef,
          };
        }
        return st;
      })
    );
  };

  const handleAssignChefSubmit = (id: string) => {
    setStations(prev =>
      prev.map(st => {
        if (st.id === id) {
          return {
            ...st,
            chef: newChefName || '-',
          };
        }
        return st;
      })
    );
    setEditingStationId(null);
    setNewChefName('');
  };

  // Stats calculation
  const totalStations = stations.length;
  const activeCount = stations.filter(s => s.status === 'active').length;
  const idleCount = stations.filter(s => s.status === 'idle').length;
  const maintenanceCount = stations.filter(s => s.status === 'maintenance').length;
  const avgLoad = Math.round(
    stations.reduce((acc, curr) => acc + curr.load, 0) / (stations.filter(s => s.status === 'active').length || 1)
  );

  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-amber-500',
    maintenance: 'bg-red-500',
  };

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kitchen Stations Monitor</h2>
          <p className="text-sm text-slate-500 font-medium">Track operational load, assign chefs, and manage prep stations</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
          <span className="text-orange-600 font-bold text-sm">Average Active Load: {avgLoad}%</span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stations</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{totalStations}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
          <p className="text-xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Idle</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{idleCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance</p>
          <p className="text-xl font-bold text-red-600 mt-1">{maintenanceCount}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStations.map(station => {
          // Color coding load bars
          let loadColor = 'bg-green-500';
          if (station.load > 85) loadColor = 'bg-red-500';
          else if (station.load > 60) loadColor = 'bg-amber-500';

          return (
            <div
              key={station.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800">{station.name}</h3>
                  <span className="text-[10px] font-semibold text-slate-400">{station.type}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase select-none">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColors[station.status]}`} />
                  <span className="text-slate-600">{station.status}</span>
                </div>
              </div>

              {/* Load Meter */}
              {station.status === 'active' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Operational Load</span>
                    <span className="text-slate-700">{station.load}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${loadColor}`}
                      style={{ width: `${station.load}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Station Info */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <p className="text-slate-400 font-semibold">Assigned Chef</p>
                  {editingStationId === station.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        defaultValue={station.chef === '-' ? '' : station.chef}
                        onChange={e => setNewChefName(e.target.value)}
                        placeholder="Chef Name"
                        className="px-2 py-1 border border-slate-200 rounded text-xs w-full focus:outline-orange-500"
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                      />
                      <button
                        onClick={() => handleAssignChefSubmit(station.id)}
                        className="px-2 py-1 bg-orange-600 text-white rounded text-[10px] font-bold"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-700">{station.chef}</span>
                      {station.status !== 'maintenance' && (
                        <button
                          onClick={() => {
                            setEditingStationId(station.id);
                            setNewChefName(station.chef);
                          }}
                          className="text-orange-500 hover:text-orange-600 text-[10px] font-bold"
                        >
                          [Edit]
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Active Orders</p>
                  <p className="font-bold text-slate-700 mt-0.5">{station.activeOrders} Orders</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Avg Prep Time</p>
                  <p className="font-bold text-slate-700 mt-0.5">{station.avgPrepTime}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Station ID</p>
                  <p className="font-bold text-slate-400 mt-0.5">{station.id}</p>
                </div>
              </div>

              {/* Current cooking items list */}
              {station.status === 'active' && station.currentItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Current Items</p>
                  <div className="flex flex-wrap gap-1">
                    {station.currentItems.map(item => (
                      <span
                        key={item}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-semibold text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-50 pt-4 flex gap-1.5">
                <button
                  onClick={() => handleStatusChange(station.id, 'active')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    station.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange(station.id, 'idle')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    station.status === 'idle'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Idle
                </button>
                <button
                  onClick={() => handleStatusChange(station.id, 'maintenance')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    station.status === 'maintenance'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Repair
                </button>
              </div>
            </div>
          );
        })}
        {filteredStations.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium">
            No kitchen stations match your search.
          </div>
        )}
      </div>
    </div>
  );
}
