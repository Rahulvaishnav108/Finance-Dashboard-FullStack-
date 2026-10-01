import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { revenueData } from "../../store/Superadmindashboard";

interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  darkMode: boolean;
}

// Custom tooltip for cleaner look
const CustomTooltip = ({
  active,
  payload,
  label,
  darkMode,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  darkMode: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl border p-3 text-xs shadow-xl ${
        darkMode
          ? "bg-slate-900 border-slate-700 text-slate-200"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <p className="font-bold mb-1.5 text-orange-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
            {entry.name}:
          </span>
          <span className="font-semibold">
            {entry.name.includes("Revenue")
              ? `$${entry.value.toLocaleString()}`
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart({ darkMode }: RevenueChartProps) {
  return (
    <div
      className={`lg:col-span-2 rounded-xl p-4 sm:p-5 border ${
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm shadow-slate-100/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight">
            Revenue &amp; Orders Trend
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            6-month performance trajectory
          </p>
        </div>
        {/* Mini legend badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-500">
            <span className="w-3 h-0.5 rounded-full bg-orange-500 inline-block" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400">
            <span className="w-3 h-0.5 rounded-full bg-blue-400 inline-block" />
            Orders
          </span>
        </div>
      </div>

      {/* Chart — taller on desktop, compact on mobile */}
      <div className="h-[200px] sm:h-[280px] lg:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData as RevenueDataPoint[]}
            margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#1e293b" : "#e2e8f0"}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "10px", fontWeight: 500 }}
              stroke={darkMode ? "#64748b" : "#94a3b8"}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              style={{ fontSize: "10px", fontWeight: 500 }}
              stroke={darkMode ? "#64748b" : "#94a3b8"}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
              }
            />
            <Tooltip
              content={<CustomTooltip darkMode={darkMode} />}
              cursor={{
                stroke: darkMode ? "#334155" : "#e2e8f0",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Legend wrapperStyle={{ display: "none" }} />
            <Line
              type="monotone"
              name="Revenue ($)"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#f97316" }}
            />
            <Line
              type="monotone"
              name="Orders"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}