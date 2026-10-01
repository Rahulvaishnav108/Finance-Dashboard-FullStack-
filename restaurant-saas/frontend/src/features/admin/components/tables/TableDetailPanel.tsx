import React from 'react';
import {
  X,
  Users,
  Clock,
  IndianRupee,
  ClipboardList,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Ban,
  CalendarClock,
} from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import type { TableStatus } from '../../store/tables.store';
import { TableStatusBadge } from './TableStatusBadge';
import { TableQRCode } from './TableQRCode';

const statusActions: {
  status: TableStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    status: 'Available',
    label: 'Mark Available',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40',
  },
  {
    status: 'Occupied',
    label: 'Mark Occupied',
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40',
  },
  {
    status: 'Reserved',
    label: 'Mark Reserved',
    icon: CalendarClock,
    color: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
  {
    status: 'Cleaning',
    label: 'Send to Cleaning',
    icon: Sparkles,
    color: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
  },
  {
    status: 'Blocked',
    label: 'Block Table',
    icon: Ban,
    color: 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
  },
];

export function TableDetailPanel(): JSX.Element | null {
  const {
    tables,
    selectedTableId,
    selectTable,
    updateTableStatus,
    deleteTable,
    setShowEditModal,
  } = useTablesStore();

  if (selectedTableId === null) return null;
  const table = tables.find((t) => t.id === selectedTableId);
  if (!table) return null;

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
            {table.section}
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{table.label}</h3>
          <TableStatusBadge status={table.status} />
        </div>
        <button
          onClick={() => selectTable(null)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: Users,         label: 'Seats',   val: table.seats },
          { icon: ClipboardList, label: 'Shape',   val: table.shape },
          { icon: ClipboardList, label: 'Floor',   val: `Floor ${table.floor}` },
          { icon: ClipboardList, label: 'Section', val: table.section },
        ].map(({ icon: Icon, label, val }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2"
          >
            <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active order */}
      {table.currentOrder && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">Active Order</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-600 dark:text-orange-400 font-mono">
              {table.currentOrder.id}
            </span>
            <span className="text-xs text-orange-500">{table.currentOrder.items} items</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <Clock className="w-3 h-3" />
              {table.currentOrder.time}
            </span>
            <span className="flex items-center gap-0.5 text-sm font-bold text-orange-700 dark:text-orange-300">
              <IndianRupee className="w-3.5 h-3.5" />
              {table.currentOrder.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Reservation */}
      {table.reservedFor && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Reserved For</p>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{table.reservedFor}</p>
          {table.reservedAt && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">at {table.reservedAt}</p>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
          TABLE QR CODE
        </p>
        <div className="flex flex-col items-center">
          <TableQRCode
            tableId={table.id}
            tableLabel={table.label}
            floor={table.floor}
            section={table.section}
            qrToken={table.qr_token}
          />
          <div className="mt-2 text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{table.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {table.section} • Floor {table.floor}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {table.notes && (
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-semibold text-gray-400 mb-1">NOTES</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{table.notes}</p>
        </div>
      )}

      {/* Status actions */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Change Status
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-1">
          {statusActions
            .filter((a) => a.status !== table.status)
            .map(({ status, label, icon: Icon, color }) => (
              <button
                key={status}
                onClick={() => updateTableStatus(table.id, status)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${color}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
        </div>
      </div>

      {/* Edit / Delete */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setShowEditModal(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Table
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this table?')) deleteTable(table.id);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: fixed bottom sheet */}
      <div className="xl:hidden fixed inset-x-0 bottom-0 z-40">
        <button
          type="button"
          className="absolute inset-0 -top-screen bg-black/30"
          style={{ top: '-100vh' }}
          onClick={() => selectTable(null)}
          aria-label="Close panel"
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl border-t border-gray-200 dark:border-gray-700 shadow-2xl p-5 max-h-[80vh] overflow-y-auto">
          {panelContent}
        </div>
      </div>

      {/* Desktop: sidebar card */}
      <div className="hidden xl:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-fit">
        {panelContent}
      </div>
    </>
  );
}