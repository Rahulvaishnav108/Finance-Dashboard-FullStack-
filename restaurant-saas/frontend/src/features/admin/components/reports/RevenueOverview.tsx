import React from 'react';
import { useReportsStore } from '../../store/reports.store';
import type { DateRange } from '../../store/reports.store';

const RANGES: DateRange[] = ['Daily', 'Weekly', 'Monthly'];

export function RevenueOverview(): JSX.Element {
  const { getRevenueTrend, getStats, revenueRange, setRevenueRange } = useReportsStore();

  const revenueTrend = getRevenueTrend();
  const stats        = getStats();

  const W = 520, H = 180, PAD = { t: 20, r: 16, b: 36, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const maxVal = Math.max(...revenueTrend.map((d) => d.revenue));
  const minVal = Math.min(...revenueTrend.map((d) => d.revenue));
  const range  = maxVal - minVal || 1;

  const pts = revenueTrend.map((d, i) => ({
    x: PAD.l + (i / Math.max(revenueTrend.length - 1, 1)) * chartW,
    y: PAD.t + (1 - (d.revenue - minVal) / range) * chartH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + chartH} L${pts[0].x},${PAD.t + chartH} Z`;

  const yLabels = [maxVal, (maxVal + minVal) / 2, minVal].map((v) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}K` : `₹${Math.round(v)}`
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-w-0 w-full">
      <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Revenue Overview</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 truncate">
              {stats.totalRevenue}
            </span>
            <span className="text-xs text-green-500 font-semibold flex-shrink-0">
              {stats.totalRevenueChange}
            </span>
          </div>
        </div>
        <div className="flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRevenueRange(r)}
              className={`text-xs px-2.5 py-1.5 font-medium transition-colors ${
                revenueRange === r
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-2">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"    />
          </linearGradient>
        </defs>
        {yLabels.map((label, i) => {
          const y = PAD.t + (i / (yLabels.length - 1)) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y}
                stroke="#f3f4f6" strokeWidth="1" className="dark:stroke-gray-800"
              />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{label}</text>
            </g>
          );
        })}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.date}</text>
        ))}
        <path d={areaPath} fill="url(#revGrad)" />
        <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#f97316" stroke="white" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}