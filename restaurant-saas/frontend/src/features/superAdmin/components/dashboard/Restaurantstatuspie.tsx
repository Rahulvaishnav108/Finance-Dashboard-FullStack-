import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { pieData } from "../../store/Superadmindashboard";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface RestaurantStatusPieProps {
  darkMode: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  darkMode,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: PieDataItem }[];
  darkMode: boolean;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      className={`rounded-xl border p-3 text-xs shadow-xl ${
        darkMode
          ? "bg-slate-900 border-slate-700 text-slate-200"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="font-bold">{item.name}</span>
      </div>
      <p className={`mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Share:{" "}
        <span className="font-semibold text-white">{item.value}%</span>
      </p>
    </div>
  );
};

export default function RestaurantStatusPie({ darkMode }: RestaurantStatusPieProps) {
  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border ${
        darkMode
          ? "bg-slate-900/40 border-slate-800/80"
          : "bg-white border-slate-200/60 shadow-sm shadow-slate-100/40"
      }`}
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm sm:text-base font-bold tracking-tight">
          Restaurant Status
        </h3>
        <p
          className={`text-xs mt-0.5 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Live venue health distribution
        </p>
      </div>

      {/* Donut chart */}
      <div className="h-[200px] sm:h-[230px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData as PieDataItem[]}
              innerRadius="58%"
              outerRadius="80%"
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              startAngle={90}
              endAngle={-270}
            >
              {(pieData as PieDataItem[]).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="outline-none focus:outline-none"
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight">
            216
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Total Venues
          </span>
        </div>
      </div>

      {/* Legend grid — 2-col on all sizes */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {(pieData as PieDataItem[]).map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0">
              <span
                className={`text-[11px] font-medium truncate block ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item.name}
              </span>
              <span
                className={`text-[10px] ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}