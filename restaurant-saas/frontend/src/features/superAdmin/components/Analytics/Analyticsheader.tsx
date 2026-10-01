// src/features/superAdmin/components/Analytics/Analyticsheader.tsx
import React from "react";
import { RefreshCw, Download, PlusCircle, Activity } from "lucide-react";

interface AnalyticsHeaderProps {
  darkMode: boolean;
  isRefreshing: boolean;
  onSync: () => void;
  onExport: () => void;
  onOnboard: () => void;
}

export default function AnalyticsHeader({
  darkMode,
  isRefreshing,
  onSync,
  onExport,
  onOnboard,
}: AnalyticsHeaderProps) {
  const ghostBtn = [
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
    darkMode
      ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm",
  ].join(" ");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-1">
      {/* Left: title + subtitle */}
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            darkMode
              ? "bg-orange-500/10 text-orange-400"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          <Activity size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight truncate">
            System Core Matrix
          </h2>
          <p
            className={`text-xs mt-0.5 leading-relaxed ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Telemetry routing, resource allocation matrices &amp; cluster state
            logs.
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <button onClick={onSync} type="button" className={ghostBtn}>
          <RefreshCw
            size={13}
            className={
              isRefreshing ? "animate-spin text-orange-500" : ""
            }
          />
          <span className="hidden xs:inline">
            {isRefreshing ? "Syncing…" : "Sync"}
          </span>
          <span className="xs:hidden">
            {isRefreshing ? "…" : "Sync"}
          </span>
        </button>

        <button onClick={onExport} type="button" className={ghostBtn}>
          <Download size={13} className="text-blue-500" />
          <span>Export</span>
        </button>

        <button
          onClick={onOnboard}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <PlusCircle size={13} />
          <span>Onboard Franchise</span>
        </button>
      </div>
    </div>
  );
}