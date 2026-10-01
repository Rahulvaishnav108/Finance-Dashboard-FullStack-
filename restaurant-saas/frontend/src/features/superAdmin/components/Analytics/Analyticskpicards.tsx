// src/features/superAdmin/components/Analytics/Analyticskpicards.tsx
import React from "react";
import { TrendingUp, IndianRupee, Utensils, Percent } from "lucide-react";
import { MetricItem } from "../../store/Analytics";

interface AnalyticsKPICardsProps {
  darkMode: boolean;
  metrics: MetricItem[];
  totalVolume: number;
  totalCommission: number;
  averageOrderValue: number;
}

interface StatCardProps {
  darkMode: boolean;
  label: string;
  value: string;
  badge: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ darkMode, label, value, badge, icon, iconBg }: StatCardProps) {
  return (
    <div
      className={[
        "rounded-xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-lg group",
        darkMode
          ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60"
          : "bg-white border-slate-200/70 shadow-sm hover:shadow-slate-200/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Text content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={`text-[10px] font-bold tracking-widest uppercase truncate ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {label}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
            {value}
          </h3>
          <div className="pt-1">{badge}</div>
        </div>

        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsKPICards({
  darkMode,
  metrics,
  totalVolume,
  totalCommission,
  averageOrderValue,
}: AnalyticsKPICardsProps) {
  const trendBadge = (text: string) => (
    <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-semibold">
      <TrendingUp size={11} />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Dynamic metric cards */}
      {metrics.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="col-span-1">
            <StatCard
              darkMode={darkMode}
              label={item.label}
              value={item.current}
              badge={trendBadge(item.shift)}
              icon={<Icon size={17} />}
              iconBg={darkMode ? item.darkBg : item.lightBg}
            />
          </div>
        );
      })}

      {/* Gross Terminal GMV */}
      <div className="col-span-1">
        <StatCard
          darkMode={darkMode}
          label="Gross Terminal GMV"
          value={`₹${totalVolume.toLocaleString()}`}
          badge={trendBadge("+18.4% premium")}
          icon={<IndianRupee size={17} />}
          iconBg={
            darkMode
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-emerald-50 text-emerald-600"
          }
        />
      </div>

      {/* AOV / Revenue Cut */}
      <div className="col-span-1">
        <StatCard
          darkMode={darkMode}
          label="AOV / Revenue Cut"
          value={`₹${averageOrderValue} AOV`}
          badge={
            <div className="flex items-center gap-1 text-amber-500 text-[11px] font-semibold">
               <Percent size={11} />
               <span>Comm: ₹${totalCommission.toLocaleString()}</span>
            </div>
          }
          icon={<Utensils size={17} />}
          iconBg={
            darkMode
              ? "bg-orange-500/10 text-orange-500"
              : "bg-orange-50 text-orange-600"
          }
        />
      </div>
    </div>
  );
}