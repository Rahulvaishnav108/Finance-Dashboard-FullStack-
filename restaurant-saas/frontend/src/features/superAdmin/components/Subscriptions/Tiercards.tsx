// src/features/superAdmin/components/Analytics/Tiercards.tsx
import React from "react";
import { Package, Zap, Crown, Building2, ArrowUpRight } from "lucide-react";
import type { TierFilter, TierMetrics } from "./Subcriptiontypes";
import { PLAN_PRICES } from "../../store/Subscriptions";

interface TierCardsProps {
  metrics: TierMetrics;
  tierFilter: TierFilter;
  darkMode: boolean;
  onTierChange: (tier: TierFilter) => void;
}

interface TierCardProps {
  tier: "Basic" | "Standard" | "Premium" | "Enterprise";
  label: string;
  price: string;
  icon: React.ReactNode;
  accentRing: string;
  accentBg: string;
  accentText: string;
  iconBg: string;
  count: number;
  formattedRevenue: string;
  activeCount: number;
  trialCount: number;
  isActive: boolean;
  darkMode: boolean;
  onClick: () => void;
}

function TierCard({
  label, price, icon, accentRing, accentBg, accentText, iconBg,
  count, formattedRevenue, activeCount, trialCount,
  isActive, darkMode, onClick
}: TierCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`
        cursor-pointer group relative rounded-2xl p-3 sm:p-5 border transition-all duration-200
        hover:scale-[1.015] focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex flex-col justify-between
        ${isActive ? `${accentRing} ring-2 ${accentBg}` : ""}
        ${darkMode
          ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
          : "bg-white border-slate-200/80 hover:shadow-lg"
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 rounded-xl sm:p-2.5 ${iconBg}`}>{icon}</div>
        <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 transition-all duration-150 ${accentText}
          ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isActive ? "Filtering" : "Filter"} <ArrowUpRight size={12} />
        </span>
      </div>

      {/* Plan name + price */}
      <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-0.5 mb-3 sm:mt-1 sm:mb-4 flex-wrap">
        <span className={`text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{price}</span>
        <span className={`text-[10px] sm:text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>/mo</span>
      </div>

      {/* Divider */}
      <div className={`h-px mb-2.5 sm:h-px sm:mb-3.5 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />

      {/* Stats */}
      <div className="space-y-1 text-[10px] sm:space-y-1.5 sm:text-[11px]">
        <div className="flex justify-between">
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Subscribers</span>
          <span className={`font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{count}</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Revenue</span>
          <span className="font-bold text-emerald-500 truncate pl-1">{formattedRevenue}</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Active / Trial</span>
          <span className={`font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            <span className="text-emerald-500">{activeCount}</span>
            <span className={darkMode ? "text-slate-700" : "text-slate-300"}> / </span>
            <span className="text-amber-500">{trialCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TierCards({ metrics, tierFilter, darkMode, onTierChange }: TierCardsProps) {
  const tiers = [
    {
      tier: "Basic" as const,
      label: "Basic Plan",
      price: `₹${PLAN_PRICES.Basic}`,
      icon: <Package size={18} />,
      accentRing: "ring-orange-500",
      accentBg: "bg-orange-500/5",
      accentText: "text-orange-400",
      iconBg: darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600",
      data: metrics.basic,
    },
    {
      tier: "Standard" as const,
      label: "Standard Plan",
      price: `₹${PLAN_PRICES.Standard}`,
      icon: <Zap size={18} />,
      accentRing: "ring-blue-500",
      accentBg: "bg-blue-500/5",
      accentText: "text-blue-400",
      iconBg: darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600",
      data: metrics.standard,
    },
    {
      tier: "Premium" as const,
      label: "Premium Plan",
      price: `₹${PLAN_PRICES.Premium}`,
      icon: <Crown size={18} />,
      accentRing: "ring-purple-500",
      accentBg: "bg-purple-500/5",
      accentText: "text-purple-400",
      iconBg: darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600",
      data: metrics.premium,
    },
    {
      tier: "Enterprise" as const,
      label: "Enterprise Plan",
      price: `₹${PLAN_PRICES.Enterprise}`,
      icon: <Building2 size={18} />,
      accentRing: "ring-emerald-500",
      accentBg: "bg-emerald-500/5",
      accentText: "text-emerald-400",
      iconBg: darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600",
      data: metrics.enterprise,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {tiers.map((t) => (
        <TierCard
          key={t.tier}
          tier={t.tier}
          label={t.label}
          price={t.price}
          icon={t.icon}
          accentRing={t.accentRing}
          accentBg={t.accentBg}
          accentText={t.accentText}
          iconBg={t.iconBg}
          count={t.data.count}
          formattedRevenue={t.data.formattedRevenue}
          activeCount={t.data.activeCount}
          trialCount={t.data.trialCount}
          isActive={tierFilter === t.tier}
          darkMode={darkMode}
          onClick={() => onTierChange(tierFilter === t.tier ? "All" : t.tier)}
        />
      ))}
    </div>
  );
}