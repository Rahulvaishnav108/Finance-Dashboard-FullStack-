import React from 'react';
import { useReservationsStore } from '../../store/reservations.store';
import type { TableStatus } from '../../store/reservations.store';

const statusConfig: Record<TableStatus, { color: string; label: string; dot: string }> = {
  Available: {
    color:
      'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/60',
    label: 'Available',
    dot: 'bg-green-500',
  },
  Occupied: {
    color:
      'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/60',
    label: 'Occupied',
    dot: 'bg-orange-500',
  },
  Reserved: {
    color:
      'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60',
    label: 'Reserved',
    dot: 'bg-blue-500',
  },
};

function TableIcon({ status }: { status: TableStatus }) {
  const colors: Record<TableStatus, string> = {
    Available: '#22c55e',
    Occupied: '#f97316',
    Reserved: '#3b82f6',
  };
  return (
    <svg width="24" height="18" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="20" height="8" rx="2" fill={colors[status]} opacity="0.3" />
      <rect x="4" y="6" width="20" height="8" rx="2" stroke={colors[status]} strokeWidth="1.5" />
      <line x1="8" y1="6" x2="8" y2="18" stroke={colors[status]} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="6" x2="20" y2="18" stroke={colors[status]} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="2" x2="12" y2="6" stroke={colors[status]} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={colors[status]} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TableAvailabilityGrid(): JSX.Element {
  const { tables } = useReservationsStore();

  const available = tables.filter((t) => t.status === 'Available').length;
  const occupied  = tables.filter((t) => t.status === 'Occupied').length;
  const reserved  = tables.filter((t) => t.status === 'Reserved').length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Table Availability</h3>
      </div>

      {/* Legend with counts */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
        {[
          { label: 'Available', dot: 'bg-green-500', count: available },
          { label: 'Occupied',  dot: 'bg-orange-500', count: occupied },
          { label: 'Reserved',  dot: 'bg-blue-500',   count: reserved },
        ].map(({ label, dot, count }) => (
          <span key={label} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dot}`} />
            {label}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{count}</span>
          </span>
        ))}
      </div>

      {/* Table grid — 4 cols on all sizes */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {tables.map((table) => {
          const cfg = statusConfig[table.status];
          return (
            <button
              key={table.id}
              className={`border rounded-xl p-2 sm:p-2.5 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-all ${cfg.color}`}
              title={`Table ${table.id} — ${cfg.label} (${table.seats} seats)`}
            >
              <TableIcon status={table.status} />
              <span className="text-[10px] sm:text-[11px] font-bold">
                {String(table.id).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}