// components/TransactionTable.tsx

import React, { useState } from "react";
import {
  ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, AlertCircle,
  XCircle, RefreshCw, CreditCard, ChevronRight, MapPin, ShoppingBag,
} from "lucide-react";
import type { Transaction, SortField, SortOrder } from "./Transactiontypes";
import { formatCurrency } from "../../utils/transactionUtils";

interface TransactionTableProps {
  transactions: Transaction[];
  darkMode: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

const STATUS_META = {
  Completed: {
    icon: <CheckCircle2 size={12} />,
    className: "bg-emerald-500/10 text-emerald-500",
  },
  Pending: {
    icon: <AlertCircle size={12} />,
    className: "bg-amber-500/10 text-amber-500",
  },
  Failed: {
    icon: <XCircle size={12} />,
    className: "bg-rose-500/10 text-rose-500",
  },
  Refunded: {
    icon: <RefreshCw size={12} />,
    className: "bg-slate-500/10 text-slate-400",
  },
};

const PAYMENT_ICONS: Record<string, string> = {
  "Credit Card": "💳",
  "UPI / Wallet": "📱",
  "Net Banking": "🏦",
  "Cash": "💵",
  "Crypto": "₿",
};

function SortIcon({ _field, active, order }: { _field: SortField; active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />;
  return order === "asc" ? <ArrowUp size={12} className="text-orange-500" /> : <ArrowDown size={12} className="text-orange-500" />;
}

// ─── Mobile card for a single transaction ───────────────────────────────────
function MobileTransactionCard({ tx, darkMode }: { tx: Transaction; darkMode: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[tx.status];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm"
      }`}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: restaurant + city */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {tx.restaurant}
            </p>
            <p className={`flex items-center gap-1 text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              <MapPin size={10} />
              {tx.city}
            </p>
          </div>

          {/* Right: amount + status badge */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`font-extrabold text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {formatCurrency(tx.amount)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.className}`}>
              {meta.icon}
              {tx.status}
            </span>
          </div>
        </div>

        {/* Mid row: order ID + timestamp */}
        <div className="flex items-center justify-between mt-2.5">
          <span className={`font-mono text-[10px] font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {tx.id}
          </span>
          <span className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {tx.timestamp}
          </span>
        </div>

        {/* Bottom row: commission + payment + expand indicator */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-orange-500">
              {formatCurrency(tx.commission)}{" "}
              <span className={`font-normal text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                ({tx.commissionRate}%)
              </span>
            </span>
            <span className={`text-[11px] flex items-center gap-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {PAYMENT_ICONS[tx.paymentMethod] ?? <CreditCard size={11} />}
              {tx.paymentMethod}
            </span>
          </div>
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            } ${darkMode ? "text-slate-600" : "text-slate-300"}`}
          />
        </div>
      </button>

      {/* Expanded detail section */}
      {expanded && (
        <div className={`px-4 pb-4 pt-1 border-t text-xs grid grid-cols-2 gap-x-4 gap-y-3 ${
          darkMode ? "border-slate-800/60 bg-slate-900/60" : "border-slate-100 bg-slate-50/60"
        }`}>
          <div>
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Restaurant ID
            </span>
            <span className={`font-mono font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              {tx.restaurantId}
            </span>
          </div>
          <div>
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Orders in Batch
            </span>
            <span className={`font-semibold flex items-center gap-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              <ShoppingBag size={12} className="text-orange-500" />
              {tx.ordersCount} orders
            </span>
          </div>
          <div>
            <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Avg per Order
            </span>
            <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              {formatCurrency(tx.amount / tx.ordersCount)}
            </span>
          </div>
          {tx.note && (
            <div className="col-span-2">
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Note
              </span>
              <span className={`italic ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {tx.note}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Desktop table row ───────────────────────────────────────────────────────
function DesktopRow({
  tx,
  darkMode,
}: {
  tx: Transaction;
  darkMode: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = STATUS_META[tx.status];

  return (
    <React.Fragment>
      <tr
        onClick={() => setIsExpanded((v) => !v)}
        className={`transition-colors cursor-pointer ${
          isExpanded
            ? darkMode ? "bg-slate-800/30" : "bg-orange-50/40"
            : darkMode ? "hover:bg-slate-800/20" : "hover:bg-slate-50/60"
        }`}
      >
        {/* Expand toggle */}
        <td className="py-3.5 px-3 text-center">
          <span className={`transition-transform inline-block ${isExpanded ? "rotate-90" : ""} ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            <ChevronRight size={14} />
          </span>
        </td>

        {/* Order ID */}
        <td className="py-3.5 px-5">
          <span className={`font-mono text-[11px] font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{tx.id}</span>
        </td>

        {/* Restaurant */}
        <td className="py-3.5 px-5">
          <div className={`font-semibold text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{tx.restaurant}</div>
          <div className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            <MapPin size={10} />{tx.city}
          </div>
        </td>

        {/* Amount */}
        <td className={`py-3.5 px-5 font-extrabold text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
          {formatCurrency(tx.amount)}
        </td>

        {/* Commission */}
        <td className="py-3.5 px-5">
          <span className="font-bold text-orange-500">{formatCurrency(tx.commission)}</span>
          <span className={`ml-1.5 text-[10px] font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{tx.commissionRate}%</span>
        </td>

        {/* Payment */}
        <td className="py-3.5 px-5">
          <div className={`flex items-center gap-1.5 font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            <span>{PAYMENT_ICONS[tx.paymentMethod] ?? <CreditCard size={13} />}</span>
            <span>{tx.paymentMethod}</span>
          </div>
        </td>

        {/* Status */}
        <td className="py-3.5 px-5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${meta.className}`}>
            {meta.icon}
            {tx.status}
          </span>
        </td>

        {/* Timestamp */}
        <td className={`py-3.5 px-5 text-right font-medium whitespace-nowrap ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          {tx.timestamp}
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className={darkMode ? "bg-slate-900/60" : "bg-orange-50/30"}>
          <td />
          <td colSpan={7} className="px-5 py-3">
            <div className="flex flex-wrap gap-6 text-xs">
              <div>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Restaurant ID</span>
                <span className={`font-mono font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{tx.restaurantId}</span>
              </div>
              <div>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Orders in Batch</span>
                <span className={`font-semibold flex items-center gap-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <ShoppingBag size={12} className="text-orange-500" />
                  {tx.ordersCount} orders
                </span>
              </div>
              <div>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Avg per Order</span>
                <span className={`font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  {formatCurrency(tx.amount / tx.ordersCount)}
                </span>
              </div>
              {tx.note && (
                <div>
                  <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Note</span>
                  <span className={`italic ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{tx.note}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function TransactionTable({
  transactions,
  darkMode,
  sortField,
  sortOrder,
  onSort,
}: TransactionTableProps) {
  const thBase = `py-3.5 px-5 text-[11px] font-bold uppercase tracking-wider select-none`;
  const thSort = `cursor-pointer hover:opacity-80 transition-opacity`;

  const emptyState = (
    <div className={`flex flex-col items-center justify-center py-16 gap-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
      <ShoppingBag size={28} className="opacity-30" />
      <span className="text-sm font-semibold">No transactions match your filters.</span>
      <span className="text-xs opacity-70">Try adjusting the search or status filter.</span>
    </div>
  );

  return (
    <div>
      {/* ── MOBILE: stacked cards (hidden on lg+) ─────────────────────── */}
      <div className="flex flex-col gap-3 lg:hidden">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <MobileTransactionCard key={tx.id} tx={tx} darkMode={darkMode} />
          ))
        ) : (
          <div className={`rounded-xl border p-6 ${darkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white border-slate-200/60 shadow-sm"}`}>
            {emptyState}
          </div>
        )}
      </div>

      {/* ── DESKTOP: full table (hidden below lg) ─────────────────────── */}
      <div className={`hidden lg:block rounded-xl border overflow-hidden ${
        darkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white border-slate-200/60 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`border-b border-inherit ${
                darkMode ? "bg-slate-950/60 text-slate-400" : "bg-slate-50 text-slate-500"
              }`}>
                <th className={`${thBase} w-10`} />
                <th className={thBase}>Order ID</th>
                <th className={`${thBase} ${thSort}`} onClick={() => onSort("restaurant")}>
                  <div className="flex items-center gap-1">Restaurant <SortIcon _field="restaurant" active={sortField === "restaurant"} order={sortOrder} /></div>
                </th>
                <th className={`${thBase} ${thSort}`} onClick={() => onSort("amount")}>
                  <div className="flex items-center gap-1">Amount <SortIcon _field="amount" active={sortField === "amount"} order={sortOrder} /></div>
                </th>
                <th className={`${thBase} ${thSort}`} onClick={() => onSort("commission")}>
                  <div className="flex items-center gap-1">Commission <SortIcon _field="commission" active={sortField === "commission"} order={sortOrder} /></div>
                </th>
                <th className={thBase}>Payment</th>
                <th className={thBase}>Status</th>
                <th className={`${thBase} ${thSort} text-right`} onClick={() => onSort("timestamp")}>
                  <div className="flex items-center justify-end gap-1">Timestamp <SortIcon _field="timestamp" active={sortField === "timestamp"} order={sortOrder} /></div>
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y ${darkMode ? "divide-slate-800/40" : "divide-slate-100"}`}>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <DesktopRow key={tx.id} tx={tx} darkMode={darkMode} />
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    {emptyState}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}