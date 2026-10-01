import React from 'react';
import { Users, Clock, IndianRupee, CalendarClock } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import { TableStatusBadge } from './TableStatusBadge';

export function TableGrid(): JSX.Element {
  const { tables, selectedTableId, filter, selectTable } = useTablesStore();

  const filtered = tables.filter((t) => {
    if (filter.section !== 'All' && t.section !== filter.section) return false;
    if (filter.status  !== 'All' && t.status  !== filter.status)  return false;
    if (filter.floor   !== 'All' && t.floor   !== filter.floor)   return false;
    if (filter.search && !t.label.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
      {filtered.map((table) => {
        const isSelected = table.id === selectedTableId;
        return (
          <button
            type="button"
            key={table.id}
            onClick={() => selectTable(isSelected ? null : table.id)}
            className={`relative bg-white dark:bg-gray-900 rounded-2xl border text-left p-3 sm:p-4 flex flex-col gap-2 transition-all hover:shadow-md ${
              isSelected
                ? 'border-orange-400 dark:border-orange-500 shadow-md ring-2 ring-orange-100 dark:ring-orange-900/40'
                : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 truncate">
                {table.label}
              </span>
              <TableStatusBadge status={table.status} size="sm" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{table.seats} seats</span>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span className="truncate">{table.shape}</span>
            </div>

            <div className="text-[11px] text-gray-400 truncate">
              {table.section} · Floor {table.floor}
            </div>

            {table.currentOrder && (
              <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-[11px] text-orange-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {table.currentOrder.time}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">
                  <IndianRupee className="w-3 h-3" />
                  {table.currentOrder.amount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {table.reservedFor && !table.currentOrder && (
              <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400">
                <CalendarClock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{table.reservedFor}</span>
              </div>
            )}
          </button>
        );
      })}

      {filtered.length === 0 && (
        <div className="col-span-full py-16 text-center text-gray-400 text-sm">
          No tables match the current filters.
        </div>
      )}
    </div>
  );
}