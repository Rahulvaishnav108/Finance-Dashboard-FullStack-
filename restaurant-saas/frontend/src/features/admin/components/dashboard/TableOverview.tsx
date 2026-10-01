import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import type { TableStatus } from '../../store/tables.store';

const STATUS_OPTIONS: TableStatus[] = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked'];

const STATUS_CONFIG: Record<TableStatus, { card: string; dot: string; text: string }> = {
  Available: {
    card: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    dot:  'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
  },
  Occupied: {
    card: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
    dot:  'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
  },
  Reserved: {
    card: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    dot:  'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
  Cleaning: {
    card: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    dot:  'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  Blocked: {
    card: 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700',
    dot:  'bg-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
  },
};

const DROPDOWN_STYLES: Record<TableStatus, string> = {
  Available: 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40',
  Occupied:  'text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40',
  Reserved:  'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  Cleaning:  'text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
  Blocked:   'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
};

function TableCard({ tableId, label, seats, status }: {
  tableId: string;
  label: string;
  seats: number;
  status: TableStatus;
}) {
  const { updateTableStatus } = useTablesStore();
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`${label} — ${status} — ${seats} seats`}
        className={`w-full border rounded-xl p-2.5 flex flex-col items-center gap-1 transition-all hover:shadow-md hover:scale-105 active:scale-100 ${cfg.card}`}
      >
        <span className={`text-[11px] font-bold ${cfg.text}`}>{label}</span>
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`text-[9px] font-medium ${cfg.text} opacity-70`}>{seats}p</span>
        <ChevronDown className={`w-2.5 h-2.5 ${cfg.text} opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-1 w-36">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 pt-1.5 pb-1">
            Set status
          </p>
          {STATUS_OPTIONS.filter((s) => s !== status).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                updateTableStatus(tableId, s);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors ${DROPDOWN_STYLES[s]}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[s].dot}`} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TableOverview(): JSX.Element {
  const { tables } = useTablesStore();

  // Show floor 1 tables only (all sections) — max 18 to keep widget compact
  const floor1 = tables.filter((t) => t.floor === 1).slice(0, 18);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = floor1.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<TableStatus, number>);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Table Status</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Click a table to change its status</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {([
            ['Occupied',  'bg-orange-400'],
            ['Available', 'bg-green-500'],
            ['Reserved',  'bg-blue-400'],
            ['Cleaning',  'bg-yellow-400'],
            ['Blocked',   'bg-gray-400'],
          ] as const).map(([s, dot]) => counts[s as TableStatus] > 0 && (
            <span key={s} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
              {counts[s as TableStatus]} {s}
            </span>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-6 gap-2">
        {floor1.map((table) => (
          <TableCard
            key={table.id}
            tableId={table.id}
            label={table.label}
            seats={table.seats}
            status={table.status}
          />
        ))}
      </div>
    </div>
  );
}