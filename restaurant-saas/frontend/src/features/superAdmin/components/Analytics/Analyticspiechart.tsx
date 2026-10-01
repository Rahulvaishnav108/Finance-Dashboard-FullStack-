// src/features/superAdmin/components/Analytics/Analyticspiechart.tsx
import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { DistributionItem } from "../../store/Analytics";

interface AnalyticsPieChartProps {
  darkMode: boolean;
  data: DistributionItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  darkMode: boolean;
}

function CustomTooltip({ active, payload, darkMode }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  // Cast payload item to any to bypass strict readonly array checks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = payload as any;

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs shadow-xl ${
        darkMode
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item?.payload?.Hex }}
        />
        <span className="font-bold">{item?.name}</span>
      </div>
      <p className={`mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Allocation:{" "}
        <span className="font-semibold text-current">{item?.value}%</span>
      </p>
    </div>
  );
}

export default function AnalyticsPieChart({
  darkMode,
  data,
}: AnalyticsPieChartProps) {
  return (
    <div
      className={[
        "rounded-xl p-4 sm:p-5 border flex flex-col",
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/70 shadow-sm",
      ].join(" ")}
    >
      {/* Header */}
      <div className="mb-3">
        <h3
          className={`text-sm font-bold flex items-center gap-2 ${
            darkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          <span
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
              darkMode
                ? "bg-purple-500/10 text-purple-400"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            <PieIcon size={14} />
          </span>
          Deployment Architecture
        </h3>
        <p
          className={`text-[12px] mt-0.5 ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Core allocation mapping by channel
        </p>
      </div>

      {/* Donut chart */}
      <div className="relative h-[180px] sm:h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={58}
              outerRadius={78}
              paddingAngle={4}
              dataKey="allocation"
              nameKey="division"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.Hex} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} darkMode={darkMode} />
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold tracking-tight">100%</span>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Configured
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-2.5">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.Hex }}
              />
              <span
                className={`truncate ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item.division}
              </span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 ml-2">
              {/* Progress bar */}
              <div
                className={`hidden sm:block w-16 h-1 rounded-full overflow-hidden ${
                  darkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.allocation}%`,
                    backgroundColor: item.Hex,
                  }}
                />
              </div>
              <span className="font-bold text-[11px]">{item.allocation}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}