import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Filter, Calendar, X, Check } from 'lucide-react';
import { useOrdersStore, type DateFilter, type PaymentMethod } from '../../store/orders.store';
import { NewOrderModal } from './NewOrderModal';

const DATE_OPTIONS: { label: string; value: DateFilter }[] = [
  { label: 'Today',        value: 'today'     },
  { label: 'Yesterday',    value: 'yesterday' },
  { label: 'Last 7 days',  value: 'last7'     },
  { label: 'Last 30 days', value: 'last30'    },
];

function DatePickerDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { dateFilter, setDateFilter } = useOrdersStore();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const currentLabel = DATE_OPTIONS.find((o) => o.value === dateFilter)?.label ?? 'Today';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-xl transition-colors ${
          open
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 overflow-hidden">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setDateFilter(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              {opt.label}
              {dateFilter === opt.value && <Check className="w-3.5 h-3.5 text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAYMENT_OPTIONS: (PaymentMethod | 'All')[] = ['All', 'Paid', 'Online', 'Card', 'Cash'];

function FilterDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { paymentFilter, setPaymentFilter, minAmount, maxAmount, setMinAmount, setMaxAmount, resetFilters } = useOrdersStore();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const hasActiveFilters = paymentFilter !== 'All' || minAmount !== '' || maxAmount !== '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-xl transition-colors ${
          hasActiveFilters
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
            : open
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="hidden sm:inline">Filter</span>
        {hasActiveFilters && (
          <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">!</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        /* On mobile: anchor to left to avoid clipping off-screen right edge */
        <div className="absolute left-0 sm:right-0 sm:left-auto top-10 z-50 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPaymentFilter(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    paymentFilter === p
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
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Amount Range (₹)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-orange-300 dark:focus:border-orange-700 text-gray-800 dark:text-gray-100"
              />
              <span className="text-gray-400 text-xs flex-shrink-0">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-orange-300 dark:focus:border-orange-700 text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { resetFilters(); setOpen(false); }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" /> Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OrdersHeader() {
  const [showNewOrder, setShowNewOrder] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track and manage all customer orders in real-time
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DatePickerDropdown />
          <FilterDropdown />
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">New Order</span>
          </button>
        </div>
      </div>

      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} />}
    </>
  );
}