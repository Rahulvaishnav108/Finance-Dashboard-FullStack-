import React from 'react';
import { Users, Clock, IndianRupee, MoreVertical } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import type { TableStatus } from '../../store/tables.store';
import { TableStatusBadge } from './TableStatusBadge';
import { TableQRCode } from './TableQRCode';

export function TableList(): JSX.Element {
  const { tables, filter, selectTable, selectedTableId, updateTableStatus } = useTablesStore();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const filtered = tables.filter((t) => {
    if (filter.section !== 'All' && t.section !== filter.section) return false;
    if (filter.status  !== 'All' && t.status  !== filter.status)  return false;
    if (filter.floor   !== 'All' && t.floor   !== filter.floor)   return false;
    if (filter.search && !t.label.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const statusOptions: TableStatus[] = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <th className="text-left px-4 sm:px-5 py-3 font-semibold">Table</th>
              <th className="text-left px-4 py-3 font-semibold">Section</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Seats</th>
              <th className="text-left px-4 py-3 font-semibold">Current Order</th>
              <th className="text-left px-4 py-3 font-semibold">Reserved For</th>
              <th className="text-center px-4 py-3 font-semibold">QR Code</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((table) => (
              <tr
                key={table.id}
                onClick={() => selectTable(table.id === selectedTableId ? null : table.id)}
                className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                  table.id === selectedTableId ? 'bg-orange-50/60 dark:bg-orange-950/20' : ''
                }`}
              >
                <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  <span className="font-bold text-gray-800 dark:text-gray-100">{table.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{table.shape}</span>
                </td>

                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {table.section}
                </td>

                <td className="px-4 py-3.5">
                  <TableStatusBadge status={table.status} size="sm" />
                </td>

                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {table.seats}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  {table.currentOrder ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{table.currentOrder.id}</span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                        <IndianRupee className="w-3 h-3" />
                        {table.currentOrder.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {table.currentOrder.time}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>

                <td className="px-4 py-3.5 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  {table.reservedFor || (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <TableQRCode
                    tableId={table.id}
                    tableLabel={table.label}
                    floor={table.floor}
                    qrToken={table.qr_token}
                  />
                </td>

                <td className="px-4 py-3.5 relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === table.id ? null : table.id);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenu === table.id && (
                    <div className="absolute right-4 top-full mt-1 z-30 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 w-44">
                      {statusOptions
                        .filter((s) => s !== table.status)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              updateTableStatus(table.id, s);
                              setOpenMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            → {s}
                          </button>
                        ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                  No tables match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}