import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStaffSearch } from '../components/dashboard/StaffSearchContext';

interface Table {
  id: number;
  name: string;
  section: 'Zone A' | 'Zone B' | 'Outdoor';
  capacity: number;
  guests: number;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning';
  currentBill?: number;
}

export default function StaffTablesPage() {
  const { query } = useStaffSearch();
  const [selectedSection, setSelectedSection] = useState<'All' | 'Zone A' | 'Zone B' | 'Outdoor'>('All');
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: 'Table 1', section: 'Zone A', capacity: 2, guests: 2, status: 'Occupied', currentBill: 1240 },
    { id: 2, name: 'Table 2', section: 'Zone A', capacity: 4, guests: 4, status: 'Occupied', currentBill: 3450 },
    { id: 3, name: 'Table 3', section: 'Zone A', capacity: 4, guests: 3, status: 'Occupied', currentBill: 2100 },
    { id: 4, name: 'Table 4', section: 'Zone A', capacity: 2, guests: 0, status: 'Cleaning' },
    { id: 5, name: 'Table 5', section: 'Zone B', capacity: 6, guests: 5, status: 'Occupied', currentBill: 4800 },
    { id: 6, name: 'Table 6', section: 'Zone B', capacity: 4, guests: 0, status: 'Reserved' },
    { id: 7, name: 'Table 7', section: 'Zone B', capacity: 2, guests: 0, status: 'Available' },
    { id: 8, name: 'Table 8', section: 'Zone B', capacity: 4, guests: 0, status: 'Available' },
    { id: 9, name: 'Table 9', section: 'Outdoor', capacity: 4, guests: 4, status: 'Occupied', currentBill: 1950 },
    { id: 10, name: 'Table 10', section: 'Outdoor', capacity: 2, guests: 0, status: 'Available' },
  ]);

  const updateTableStatus = (id: number, status: Table['status']) => {
    setTables(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          guests: status === 'Occupied' ? t.capacity - 1 : 0,
          currentBill: status === 'Occupied' ? 150 : undefined
        };
      }
      return t;
    }));
  };

  const filteredBySection = tables.filter(t =>
    selectedSection === 'All' ? true : t.section === selectedSection
  );

  const searchedTables = filteredBySection.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.status.toLowerCase().includes(query.toLowerCase())
  );

  // Status stats calculation
  const statusStats = {
    total: tables.length,
    occupied: tables.filter(t => t.status === 'Occupied').length,
    available: tables.filter(t => t.status === 'Available').length,
    reserved: tables.filter(t => t.status === 'Reserved').length,
    cleaning: tables.filter(t => t.status === 'Cleaning').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Table Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time table occupancy and service status.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['All', 'Zone A', 'Zone B', 'Outdoor'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${
                selectedSection === sec
                  ? 'bg-dine-orange text-white border-dine-orange shadow-sm'
                  : 'bg-white text-slate-605 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tables', count: statusStats.total, color: 'border-l-4 border-l-slate-400', valColor: 'text-slate-850 dark:text-slate-200' },
          { label: 'Occupied', count: statusStats.occupied, color: 'border-l-4 border-l-blue-500', valColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Available', count: statusStats.available, color: 'border-l-4 border-l-green-500', valColor: 'text-green-600 dark:text-green-455' },
          { label: 'Reserved', count: statusStats.reserved, color: 'border-l-4 border-l-orange-500', valColor: 'text-dine-orange' },
          { label: 'Cleaning', count: statusStats.cleaning, color: 'border-l-4 border-l-purple-500', valColor: 'text-purple-600 dark:text-purple-400' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white border border-slate-100 rounded-xl p-4 shadow-sm ${stat.color}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase font-sans">{stat.label}</p>
            <p className={`text-xl font-black font-sans mt-1 ${stat.valColor}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {searchedTables.length > 0 ? (
          searchedTables.map((table) => (
            <div
              key={table.id}
              className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-soft transition-all flex flex-col justify-between h-48`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-sans">{table.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-sans bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {table.section}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${
                    table.status === 'Available' ? 'bg-green-500' :
                    table.status === 'Reserved' ? 'bg-orange-500' :
                    table.status === 'Occupied' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-350 font-sans">{table.status}</span>
                </div>
                <div className="text-[11px] text-slate-450 dark:text-slate-405 mt-4 space-y-1 font-sans">
                  <p>Capacity: {table.capacity} Pax</p>
                  {table.status === 'Occupied' && (
                    <>
                      <p>Guests: {table.guests} Pax</p>
                      <p className="font-bold text-dine-orange">Bill: ₹{table.currentBill}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-100 pt-3 flex gap-2">
                {table.status === 'Available' && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'Occupied')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all"
                  >
                    Seat Guests
                  </button>
                )}
                {table.status === 'Cleaning' && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'Available')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all"
                  >
                    Available
                  </button>
                )}
                {table.status === 'Occupied' && (
                  <Link
                    to="/staff/orders"
                    className="flex-1 bg-dine-orange hover:bg-dine-orange/90 text-white text-center font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all flex items-center justify-center"
                  >
                    Orders
                  </Link>
                )}
                {table.status === 'Reserved' && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'Occupied')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all"
                  >
                    Arrived
                  </button>
                )}
                <button
                  onClick={() => {
                    const statuses: Table['status'][] = ['Available', 'Reserved', 'Occupied', 'Cleaning'];
                    const nextIndex = (statuses.indexOf(table.status) + 1) % statuses.length;
                    updateTableStatus(table.id, statuses[nextIndex]);
                  }}
                  className="border border-slate-100 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-all flex items-center justify-center"
                  title="Cycle Status"
                >
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No matching tables found.
          </div>
        )}
      </div>
    </div>
  );
}
