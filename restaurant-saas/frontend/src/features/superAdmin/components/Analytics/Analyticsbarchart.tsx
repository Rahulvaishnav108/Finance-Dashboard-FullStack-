// src/features/superAdmin/components/Analytics/Analyticsbarchart.tsx
import React from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { BarSeriesItem } from "../../store/Analytics";

interface AnalyticsBarChartProps {
  darkMode: boolean;
  data: BarSeriesItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  darkMode: boolean;
}

function CustomTooltip({ active, payload, label, darkMode }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs shadow-xl ${
        darkMode
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <p className="font-bold mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
            {p.name}:
          </span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsBarChart({
  darkMode,
  data,
}: AnalyticsBarChartProps) {
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";
  const axisColor = darkMode ? "#475569" : "#94a3b8";

  return (
    <div
      className={[
        "lg:col-span-2 rounded-xl p-4 sm:p-5 border flex flex-col",
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/70 shadow-sm",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="min-w-0">
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              darkMode ? "text-slate-100" : "text-slate-800"
            }`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                darkMode
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <BarChart3 size={14} />
            </span>
            Cluster Operations Load
          </h3>
          <p
            className={`text-[12px] mt-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Throughput balance configurations — weekly view
          </p>
        </div>

        {/* Mini legend badges */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
            <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />
            Active
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-500">
            <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
            Staging
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 h-[240px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: axisColor }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: axisColor }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} darkMode={darkMode} />
              )}
              cursor={{
                fill: darkMode
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.03)",
              }}
            />
            <Bar
              name="Active Clusters"
              dataKey="load"
              fill="#f97316"
            />
            <Bar
              name="Staging Subnets"
              dataKey="capacity"
              fill="#3b82f6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}