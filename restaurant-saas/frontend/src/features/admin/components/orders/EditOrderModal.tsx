import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useOrdersStore, type Order, type OrderStatus, type PaymentMethod } from '../../store/orders.store';
import { AVATAR_COLORS } from './orders.constants';

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
}

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Preparing', 'Completed', 'Served', 'Cancelled'];
const PAYMENT_OPTIONS: PaymentMethod[] = ['Paid', 'Online', 'Card', 'Cash'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:   'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  Preparing: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800',
  Completed: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800',
  Served:    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  Cancelled: 'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400    border-red-200    dark:border-red-800',
};

export function EditOrderModal({ order, onClose }: EditOrderModalProps) {
  const { updateOrder } = useOrdersStore();
  const customerBg = AVATAR_COLORS[order.customerAvatar] ?? 'bg-gray-400';

  const [status,  setStatus]  = useState<OrderStatus>(order.status);
  const [table,   setTable]   = useState(order.table);
  const [payment, setPayment] = useState<PaymentMethod>(order.payment);
  const [notes,   setNotes]   = useState(order.notes ?? '');
  const [saving,  setSaving]  = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      updateOrder(order.id, { status, table, payment, notes: notes.trim() || undefined });
      setSaving(false);
      onClose();
    }, 400);
  }

  const fieldClass = "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 dark:focus:border-orange-700 text-gray-800 dark:text-gray-100 transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Order</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Customer info (read-only) */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
            <div className={`w-9 h-9 rounded-full ${customerBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {order.customerAvatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{order.customer}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{order.items} items · {order.amount}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <span className={labelClass}>Status</span>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    status === s
                      ? STATUS_COLORS[s]
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div>
            <label htmlFor="edit-table" className={labelClass}>Table</label>
            <input
              id="edit-table"
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className={fieldClass}
              placeholder="e.g. T-05"
            />
          </div>

          {/* Payment */}
          <div>
            <span className={labelClass}>Payment Method</span>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    payment === p
                      ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="edit-notes" className={labelClass}>Notes</label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Special instructions, allergies, preferences..."
              className={`${fieldClass} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}