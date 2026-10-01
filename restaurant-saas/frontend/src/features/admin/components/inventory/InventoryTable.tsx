import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { InventoryItem } from '../../store/inventory.store';
import { useInventoryStore } from '../../store/inventory.store';
import { InventoryStatusBadge } from './InventoryStatusBadge';

interface InventoryTableProps {
  items: InventoryItem[];
}

const COLUMNS = [
  'Item Name',
  'Category',
  'Unit',
  'Current Stock',
  'Par Level',
  'Status',
  'Last Updated',
  'Actions',
];

function StockValue({ item }: { item: InventoryItem }) {
  const isLow = item.status === 'Low Stock';
  const isOut = item.status === 'Out of Stock';
  const color = isOut
    ? 'text-red-500 dark:text-red-400'
    : isLow
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-800 dark:text-gray-100';
  return <span className={`text-sm font-semibold ${color}`}>{item.currentStock.toFixed(2)}</span>;
}

function ActionMenu({ item }: { item: InventoryItem }) {
  const { deleteItem } = useInventoryStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1 w-36">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-400" />
            Edit Item
          </button>
          <button
            type="button"
            onClick={() => { deleteItem(item.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={9} className="py-16 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-sm">No items found</p>
        <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">Try adjusting your search or filters</p>
      </td>
    </tr>
  );
}

/** Mobile card for a single inventory item */
function MobileItemCard({ item }: { item: InventoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const { deleteItem } = useInventoryStore();

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Always-visible row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          className="rounded border-gray-300 dark:border-gray-600 accent-orange-500 flex-shrink-0"
        />
        <span className="text-xl leading-none flex-shrink-0">{item.imageEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.category}</p>
        </div>
        <InventoryStatusBadge status={item.status} />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 bg-gray-50/60 dark:bg-gray-800/30">
          <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Unit</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.unit}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Stock</p>
              <StockValue item={item} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Par Level</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.parLevel.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">Updated: {item.lastUpdated}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <>
      {/* ── Mobile: card list (< md) ── */}
      <div className="md:hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 dark:text-gray-600 text-sm">No items found</p>
            <p className="text-gray-300 dark:text-gray-700 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          items.map((item) => <MobileItemCard key={item.id} item={item} />)
        )}
      </div>

      {/* ── Desktop: scrollable table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              <th className="w-8 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 accent-orange-500"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 px-3 py-3 uppercase tracking-wide whitespace-nowrap last:pr-5"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyState />
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 accent-orange-500"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{item.imageEmoji}</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.unit}</span>
                  </td>
                  <td className="px-3 py-3">
                    <StockValue item={item} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.parLevel.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <InventoryStatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.lastUpdated}</span>
                  </td>
                  <td className="px-3 py-3 last:pr-5">
                    <ActionMenu item={item} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}