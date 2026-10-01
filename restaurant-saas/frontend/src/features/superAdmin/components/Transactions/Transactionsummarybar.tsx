// components/TransactionSummaryBar.tsx

import type { MetricSummary } from "./Transactiontypes";
import { formatCurrency } from "../../utils/transactionUtils";

interface TransactionSummaryBarProps {
  metrics: MetricSummary;
  darkMode: boolean;
  filteredCount: number;
}

export default function TransactionSummaryBar({ metrics, darkMode, filteredCount }: TransactionSummaryBarProps) {
  const divider = (
    <div className={`hidden sm:block h-4 w-px shrink-0 ${darkMode ? "bg-slate-800" : "bg-slate-300"}`} />
  );

  return (
    <div className={`mt-4 rounded-xl border px-4 sm:px-5 py-3 sm:py-3.5 ${
      darkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-slate-50/60 border-slate-200/60"
    }`}>
      {/*
        Mobile: 2-column grid so everything fits without wrapping chaos.
        sm+: single flex row with dividers, matching original design.
      */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:hidden text-xs">
        <div className={`font-semibold col-span-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Summary
          <span className={`ml-2 font-normal ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
            — <span className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{filteredCount}</span> transactions shown
          </span>
        </div>

        <div>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Status</span>
          <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
            <span className="font-bold text-emerald-500">{metrics.completedCount}</span> done ·{" "}
            <span className="font-bold text-amber-500">{metrics.pendingCount}</span> pending ·{" "}
            <span className="font-bold text-rose-500">{metrics.failedCount}</span> failed
          </span>
        </div>

        <div>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Revenue</span>
          <span className="font-bold text-blue-500">{formatCurrency(metrics.totalRevenue)}</span>
        </div>

        <div>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Commission</span>
          <span className="font-bold text-orange-500">{formatCurrency(metrics.totalCommission)}</span>
        </div>

        <div>
          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Refunded</span>
          <span className={`font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{metrics.refundedCount}</span>
        </div>
      </div>

      {/* sm+ row layout — identical to original, just hidden on mobile */}
      <div className="hidden sm:flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className={`font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Summary:
        </span>

        <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
          <span className={`font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{filteredCount}</span>
          {" "}transactions shown
        </span>

        {divider}

        <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
          <span className="font-bold text-emerald-500">{metrics.completedCount}</span> completed ·{" "}
          <span className="font-bold text-amber-500">{metrics.pendingCount}</span> pending ·{" "}
          <span className="font-bold text-rose-500">{metrics.failedCount}</span> failed ·{" "}
          <span className={`font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{metrics.refundedCount}</span> refunded
        </span>

        {divider}

        <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
          Total revenue: <span className="font-bold text-blue-500">{formatCurrency(metrics.totalRevenue)}</span>
        </span>

        <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
          Commission: <span className="font-bold text-orange-500">{formatCurrency(metrics.totalCommission)}</span>
        </span>
      </div>
    </div>
  );
}