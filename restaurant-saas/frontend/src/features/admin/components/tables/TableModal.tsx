import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';
import type { Table, TableShape, TableSection, TableStatus } from '../../store/tables.store';

interface Props {
  mode: 'add' | 'edit';
  onClose: () => void;
}

const shapes:   TableShape[]   = ['Round', 'Square', 'Rectangle'];
const sections: TableSection[] = ['Indoor', 'Outdoor', 'Bar', 'Private'];
const statuses: TableStatus[]  = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked'];

export function TableModal({ mode, onClose }: Props): JSX.Element {
  const { tables, selectedTableId, addTable, updateTable } = useTablesStore();
  const existing = tables.find(t => t.id === selectedTableId);

  const [form, setForm] = useState({
    label:   existing?.label   ?? '',
    shape:   existing?.shape   ?? 'Square' as TableShape,
    section: existing?.section ?? 'Indoor' as TableSection,
    status:  existing?.status  ?? 'Available' as TableStatus,
    seats:   existing?.seats   ?? 4,
    floor:   existing?.floor   ?? 1,
    x:       existing?.x       ?? 20,
    y:       existing?.y       ?? 20,
    notes:   existing?.notes   ?? '',
  });

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  const handleSubmit = () => {
    if (!form.label.trim()) return;
    if (mode === 'add') {
      addTable(form as Omit<Table, 'id'>);
    } else if (existing) {
      updateTable(existing.id, form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-modal-title"
        className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="table-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add New Table' : `Edit ${existing?.label}`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Label */}
          <div>
            <label htmlFor="table-label" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Table Label *</label>
            <input
              id="table-label"
              value={form.label}
              onChange={e => update({ label: e.target.value })}
              placeholder="e.g. T-15 or B-05"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 text-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Section */}
            <div>
              <label htmlFor="table-section" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Section</label>
              <select
                id="table-section"
                value={form.section}
                onChange={e => update({ section: e.target.value as TableSection })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-100"
              >
                {sections.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Shape */}
            <div>
              <label htmlFor="table-shape" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Shape</label>
              <select
                id="table-shape"
                value={form.shape}
                onChange={e => update({ shape: e.target.value as TableShape })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-100"
              >
                {shapes.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Seats */}
            <div>
              <label htmlFor="table-seats" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Seats</label>
              <input
                id="table-seats"
                type="number" min={1} max={20}
                value={form.seats}
                onChange={e => update({ seats: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="table-floor" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Floor</label>
              <select
                id="table-floor"
                value={form.floor}
                onChange={e => update({ floor: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-100"
              >
                <option value={1}>Floor 1</option>
                <option value={2}>Floor 2</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="table-status" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Initial Status</label>
            <select
              id="table-status"
              value={form.status}
              onChange={e => update({ status: e.target.value as TableStatus })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-800 dark:text-gray-100"
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="table-notes" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes</label>
            <textarea
              id="table-notes"
              rows={2}
              value={form.notes}
              onChange={e => update({ notes: e.target.value })}
              placeholder="VIP, window-facing, accessible…"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            {mode === 'add' ? 'Add Table' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}