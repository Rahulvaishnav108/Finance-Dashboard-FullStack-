import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';

function formatINR(val: number): string {
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

interface ChartProps {
  valueOverTime: { label: string; value: number }[];
  W: number;
  H: number;
  PAD: { top: number; right: number; bottom: number; left: number };
}

function Chart({ valueOverTime, W, H, PAD }: ChartProps) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const vals = valueOverTime.map((d) => d.value);
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals) - 2000;

  const toX = (i: number) => PAD.left + (i / (vals.length - 1)) * innerW;
  const toY = (v: number) => PAD.top + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const pts = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPath =
    `M${toX(0)},${toY(vals[0])} ` +
    vals.slice(1).map((v, i) => `L${toX(i + 1)},${toY(v)}`).join(' ') +
    ` L${toX(vals.length - 1)},${H - PAD.bottom} L${toX(0)},${H - PAD.bottom} Z`;

  const yTicks = [
    Math.round(minV / 1000) * 1000,
    Math.round((minV + (maxV - minV) / 2) / 1000) * 1000,
    maxV,
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {yTicks.map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3"
              className="text-gray-100 dark:text-gray-800"
            />
            <text
              x={PAD.left - 4} y={y + 3} textAnchor="end"
              className="fill-gray-400 dark:fill-gray-600"
              style={{ fontSize: W > 300 ? 8 : 7 }}
            >
              {formatINR(t)}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {vals.map((v, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="3.5" fill="white" stroke="#f97316" strokeWidth="2" />
          <text
            x={toX(i)} y={H - PAD.bottom + 12} textAnchor="middle"
            className="fill-gray-400 dark:fill-gray-500"
            style={{ fontSize: 8 }}
          >
            {valueOverTime[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ValueChartModal() {
  const { valueOverTime, showValueChartModal, setShowValueChartModal } = useInventoryStore();
  if (!showValueChartModal) return null;

  const latest = valueOverTime[valueOverTime.length - 1]?.value ?? 0;
  const prev   = valueOverTime[valueOverTime.length - 2]?.value ?? latest;
  const pct    = prev ? (((latest - prev) / prev) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={() => setShowValueChartModal(false)}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Inventory Value Over Time</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowValueChartModal(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(latest)}</p>
          <span className={`text-sm font-semibold ${Number(pct) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(pct) >= 0 ? '↑' : '↓'} {Math.abs(Number(pct))}%
          </span>
        </div>

        <Chart valueOverTime={valueOverTime} W={480} H={180} PAD={{ top: 16, right: 20, bottom: 32, left: 52 }} />

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {valueOverTime.map((d) => (
            <div key={d.label} className="text-center">
              <p className="text-xs font-bold text-gray-800 dark:text-white">{formatINR(d.value)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InventoryValueChart() {
  const { valueOverTime, setShowValueChartModal } = useInventoryStore();

  const W = 320, H = 100;
  const PAD = { top: 12, right: 12, bottom: 24, left: 44 };
  const latest = valueOverTime[valueOverTime.length - 1]?.value ?? 0;

  return (
    <>
      <ValueChartModal />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inventory Value Over Time</h3>
          <button
            type="button"
            onClick={() => setShowValueChartModal(true)}
            className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{formatINR(latest)}</p>

        <Chart valueOverTime={valueOverTime} W={W} H={H} PAD={PAD} />
      </div>
    </>
  );
}