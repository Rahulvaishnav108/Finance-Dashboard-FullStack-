import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useOrdersStore, type OrderStatus, type PaymentMethod } from '../../store/orders.store';

interface NewOrderModalProps {
  onClose: () => void;
}

const MENU_ITEMS = [
  { name: 'Butter Chicken',    price: 480 },
  { name: 'Margherita Pizza',  price: 350 },
  { name: 'Grilled Salmon',    price: 650 },
  { name: 'Caesar Salad',      price: 280 },
  { name: 'Pasta Carbonara',   price: 420 },
  { name: 'Paneer Tikka',      price: 320 },
  { name: 'Chicken Burger',    price: 290 },
  { name: 'Veg Biryani',       price: 360 },
  { name: 'Fish & Chips',      price: 390 },
  { name: 'Tiramisu',          price: 220 },
  { name: 'Garlic Bread',      price: 120 },
  { name: 'Fresh Lime Soda',   price: 80  },
];

const TABLES = ['T-01','T-02','T-03','T-04','T-05','T-06','T-07','T-08','T-09','T-10','T-11','T-12','T-13','T-14','T-15'];
const PAYMENT_OPTIONS: PaymentMethod[] = ['Paid', 'Online', 'Card', 'Cash'];
const STAFF_OPTIONS = [
  { name: 'Jessica', avatar: 'JE' },
  { name: 'Michael', avatar: 'MI' },
  { name: 'David',   avatar: 'DA' },
];

type CartItem = { name: string; price: number; qty: number };

export function NewOrderModal({ onClose }: NewOrderModalProps) {
  const { addOrder, orders } = useOrdersStore();

  const [customerName, setCustomerName] = useState('');
  const [table,        setTable]        = useState('T-01');
  const [payment,      setPayment]      = useState<PaymentMethod>('Cash');
  const [staff,        setStaff]        = useState(STAFF_OPTIONS[0]);
  const [notes,        setNotes]        = useState('');
  const [cart,         setCart]         = useState<CartItem[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [step,         setStep]         = useState<'details' | 'items'>('details');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addItem(item: { name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) return prev.map((c) => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeItem(name: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === name);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((c) => c.name !== name);
      return prev.map((c) => c.name === name ? { ...c, qty: c.qty - 1 } : c);
    });
  }

  function qtyOf(name: string) {
    return cart.find((c) => c.name === name)?.qty ?? 0;
  }

  function handleCreate() {
    if (!customerName.trim() || cart.length === 0) return;
    setSaving(true);
    setTimeout(() => {
      const initials = customerName.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
      const newId = `#ORD-${String(Number(orders[0]?.id.replace('#ORD-', '') ?? '00124') + 1).padStart(5, '0')}`;
      addOrder({
        id: newId,
        customer: customerName.trim(),
        customerAvatar: initials,
        items: cart.reduce((s, i) => s + i.qty, 0),
        itemNames: cart.flatMap((c) => Array(c.qty).fill(c.name)),
        table,
        amount: `₹${total.toLocaleString('en-IN')}`,
        amountRaw: total,
        payment,
        status: 'Pending' as OrderStatus,
        assignedStaff: staff.name,
        staffAvatar: staff.avatar,
        time: 'just now',
        timeRaw: 0,
        date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });
      setSaving(false);
      onClose();
    }, 400);
  }

  const fieldClass = "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-300 dark:focus:border-orange-700 text-gray-800 dark:text-gray-100 transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5";
  const canNext = customerName.trim().length > 0;
  const canCreate = canNext && cart.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">New Order</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Step {step === 'details' ? '1' : '2'} of 2 — {step === 'details' ? 'Order details' : 'Select items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="customer-name" className={labelClass}>Customer Name *</label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="table-select" className={labelClass}>Table</label>
                <select id="table-select" value={table} onChange={(e) => setTable(e.target.value)} className={fieldClass}>
                  {TABLES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <span className={labelClass}>Assigned Staff</span>
                <div className="grid grid-cols-3 gap-2">
                  {STAFF_OPTIONS.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setStaff(s)}
                      className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
                        staff.name === s.name
                          ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

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

              <div>
                <label htmlFor="order-notes" className={labelClass}>Notes (optional)</label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Special instructions..."
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>
          )}

          {step === 'items' && (
            <div className="space-y-4">
              {/* Cart summary */}
              {cart.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 rounded-xl p-3">
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2">
                    Cart ({cart.reduce((s, i) => s + i.qty, 0)} items) · ₹{total.toLocaleString('en-IN')}
                  </p>
                  <div className="space-y-1">
                    {cart.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{c.name} ×{c.qty}</span>
                        <span className="text-gray-500 dark:text-gray-400">₹{(c.price * c.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu grid */}
              <div className="grid grid-cols-1 gap-2">
                {MENU_ITEMS.map((item) => {
                  const qty = qtyOf(item.name);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <>
                            <button
                              onClick={() => removeItem(item.name)}
                              className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-gray-800 dark:text-gray-100">{qty}</span>
                          </>
                        ) : (
                          <span className="w-5 text-center" />
                        )}
                        <button
                          onClick={() => addItem(item)}
                          className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {step === 'details' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('items')}
                disabled={!canNext}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Add Items →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('details')}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {saving ? 'Creating…' : `Create Order · ₹${total.toLocaleString('en-IN')}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}