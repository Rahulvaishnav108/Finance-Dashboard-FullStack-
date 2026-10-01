// components/TransactionMetrics.tsx

import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Percent,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import type { MetricSummary } from "./Transactiontypes";
import { formatCurrency } from "../../utils/transactionUtils";

interface TransactionMetricsProps {
  metrics: MetricSummary;
  darkMode: boolean;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  subPositive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  darkMode: boolean;
  accent?: string;
  // Optional progress bar for visual richness
  progress?: number;
  progressColor?: string;
}

function KpiCard({ label, value, sub, subPositive, icon, iconBg, darkMode, accent, progress, progressColor }: KpiCardProps) {
  return (
    <div
      className={`relative rounded-xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-lg group overflow-hidden ${
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm"
      }`}
    >
      {/* Subtle background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
        darkMode ? "bg-white/[0.02]" : "bg-slate-50/60"
      }`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            {label}
          </p>
          <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-none ${accent ?? (darkMode ? "text-slate-100" : "text-slate-900")}`}>
            {value}
          </h3>
          <div className={`flex items-center gap-1 text-[11px] font-semibold pt-0.5 ${
            subPositive === true ? "text-emerald-500" : subPositive === false ? "text-rose-500" : darkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            {subPositive === true && <TrendingUp size={11} />}
            {subPositive === false && <TrendingDown size={11} />}
            <span className="truncate">{sub}</span>
          </div>
        </div>
        <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Optional thin progress bar at the bottom of the card */}
      {progress !== undefined && (
        <div className={`mt-3.5 h-1 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor ?? "bg-orange-500"}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function TransactionMetrics({ metrics, darkMode }: TransactionMetricsProps) {
  return (
    // 2 cols on mobile, 4 on desktop — clean and breathable
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
      <KpiCard
        label="Total Revenue"
        value={formatCurrency(metrics.totalRevenue)}
        sub="+24.5% from last period"
        subPositive={true}
        icon={<IndianRupee size={18} />}
        iconBg={darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}
        darkMode={darkMode}
        accent="text-blue-500"
        progress={74}
        progressColor="bg-blue-500"
      />

      <KpiCard
        label="Commission Earned"
        value={formatCurrency(metrics.totalCommission)}
        sub={`Avg rate: ${metrics.avgCommissionRate.toFixed(1)}%`}
        icon={<Percent size={18} />}
        iconBg={darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}
        darkMode={darkMode}
        accent="text-orange-500"
        progress={metrics.avgCommissionRate * 10}
        progressColor="bg-orange-500"
      />

      <KpiCard
        label="Success Rate"
        value={`${metrics.successRate}%`}
        sub={`${metrics.completedCount} of ${metrics.totalTransactions} completed`}
        subPositive={metrics.successRate >= 70}
        icon={<CheckCircle2 size={18} />}
        iconBg={darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}
        darkMode={darkMode}
        accent="text-emerald-500"
        progress={metrics.successRate}
        progressColor="bg-emerald-500"
      />

      <KpiCard
        label="Avg Order Value"
        value={formatCurrency(metrics.avgOrderValue)}
        sub={`${metrics.pendingCount} pending · ${metrics.failedCount} failed`}
        icon={<RefreshCw size={18} />}
        iconBg={darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}
        darkMode={darkMode}
        accent={darkMode ? "text-slate-100" : "text-slate-900"}
      />
    </div>
  );
}