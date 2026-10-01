// components/TransactionControls.tsx

import { useState } from "react";
import { Search, Download, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { StatusFilter, DateRange } from "./Transactiontypes";
import { STATUS_FILTERS, DATE_RANGES, PAYMENT_METHODS } from "../../store/Transactions";

interface TransactionControlsProps {
  searchTerm: string;
  statusFilter: StatusFilter;
  paymentFilter: string;
  dateRange: DateRange;
  darkMode: boolean;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: StatusFilter) => void;
  onPaymentChange: (v: string) => void;
  onDateRangeChange: (v: DateRange) => void;
  onExport: () => void;
  onResetAll: () => void;
}

export default function TransactionControls({
  searchTerm,
  statusFilter,
  paymentFilter,
  dateRange,
  darkMode,
  totalCount,
  filteredCount,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
  onDateRangeChange,
  onExport,
  onResetAll,
}: TransactionControlsProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const isFiltered =
    statusFilter !== "All" || paymentFilter !== "All" || dateRange !== "all" || searchTerm !== "";

  const pill = `rounded-lg border text-xs font-semibold px-3 py-1.5 transition-all whitespace-nowrap`;
  const activePill = `bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20`;
  const inactivePill = darkMode
    ? `bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700`
    : `bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50`;

  const selectCls = `text-xs font-semibold rounded-lg border px-2.5 py-1.5 outline-none transition-all cursor-pointer w-full`;
  const selectActive = activePill;
  const selectInactive = darkMode
    ? `bg-slate-900/30 border-slate-800 text-slate-400`
    : `bg-white border-slate-200 text-slate-600`;

  const sectionLabel = `text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
    darkMode ? "text-slate-500" : "text-slate-400"
  }`;

  const divider = (
    <div className={`h-px w-full ${darkMode ? "bg-slate-800/60" : "bg-slate-100"}`} />
  );

  // How many active filter groups for the mobile badge
  const activeFilterCount = [
    statusFilter !== "All",
    paymentFilter !== "All",
    dateRange !== "all",
  ].filter(Boolean).length;

  return (
    <div
      className={`rounded-xl border mb-5 overflow-hidden ${
        darkMode
          ? "bg-slate-900/30 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm"
      }`}
    >
      {/* ── Search row ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-inherit">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
            size={14}
          />
          <input
            type="text"
            placeholder="Search orders, restaurants, cities…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-8 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border outline-none transition-all focus:ring-2 ${
              darkMode
                ? "bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-orange-500/50 focus:ring-orange-500/10"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500/50 focus:ring-orange-500/10"
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active filter reset — visible when any filter is on */}
          {isFiltered && (
            <button
              onClick={onResetAll}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                darkMode
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
                  : "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
              }`}
              title="Clear all filters"
            >
              <SlidersHorizontal size={12} />
              <span className="hidden sm:inline">
                {filteredCount} / {totalCount}
              </span>
              <X size={11} />
            </button>
          )}

          {/* Export — icon-only on xs, labeled on sm+ */}
          <button
            onClick={onExport}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              darkMode
                ? "bg-slate-900/50 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Mobile filter toggle — only shows below lg */}
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className={`lg:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors relative ${
              mobileFiltersOpen
                ? darkMode
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-orange-50 border-orange-300 text-orange-600"
                : darkMode
                ? "bg-slate-900/50 border-slate-800 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
            }`}
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal size={14} />
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${mobileFiltersOpen ? "rotate-180" : ""}`}
            />
            {/* Badge showing active filter count */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE filter panel (collapsible, hidden on lg+) ────────────── */}
      {mobileFiltersOpen && (
        <div className="lg:hidden border-b border-inherit">
          <div className="p-4 flex flex-col gap-4">
            {/* Status */}
            <div>
              <p className={sectionLabel}>Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s as StatusFilter)}
                    className={`${pill} ${statusFilter === s ? activePill : inactivePill}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {divider}

            {/* Payment + Date side by side on sm, stacked on xs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={sectionLabel}>Payment Method</p>
                <select
                  value={paymentFilter}
                  onChange={(e) => onPaymentChange(e.target.value)}
                  className={`${selectCls} ${paymentFilter !== "All" ? selectActive : selectInactive}`}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m === "All" ? "All Methods" : m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className={sectionLabel}>Date Range</p>
                <select
                  value={dateRange}
                  onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
                  className={`${selectCls} ${dateRange !== "all" ? selectActive : selectInactive}`}
                >
                  {DATE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP filter bar (hidden below lg) ────────────────────────── */}
      <div className="hidden lg:flex flex-wrap items-center gap-2 px-4 py-3">
        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s as StatusFilter)}
              className={`${pill} ${statusFilter === s ? activePill : inactivePill}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={`h-5 w-px mx-1 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />

        {/* Payment method */}
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentChange(e.target.value)}
          className={`${selectCls} w-auto ${paymentFilter !== "All" ? selectActive : selectInactive}`}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m === "All" ? "All Methods" : m}
            </option>
          ))}
        </select>

        <div className={`h-5 w-px mx-1 ${darkMode ? "bg-slate-800" : "bg-slate-200"}`} />

        {/* Date range pills */}
        <div className="flex items-center gap-1.5">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => onDateRangeChange(r.value as DateRange)}
              className={`${pill} ${dateRange === r.value ? activePill : inactivePill}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}