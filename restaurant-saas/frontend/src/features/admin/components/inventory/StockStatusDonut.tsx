import React from 'react';
import { X, PieChart } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';

interface StatusDist {
  inStock: number;
  inStockPct: number;
  lowStock: number;
  lowStockPct: number;
  outOfStock: number;
  outOfStockPct: number;
  expiringSoon: number;
  expiringSoonPct: number;
}

interface ArcSegment {
  label: string;
  value: number;
  count: number;
  color: string;
  dash: number;
  gap: number;
  rotate: number;
  cx: number;
  cy: number;
  r: number;
  strokeW: number;
}

function buildArcs(d: StatusDist): ArcSegment[] {
  const cx = 60, cy = 60, r = 44, strokeW = 16;
  const circ = 2 * Math.PI * r;
  const segments = [
    { label: 'In Stock',      value: d.inStockPct,      count: d.inStock,      color: '#22c55e' },
    { label: 'Low Stock',     value: d.lowStockPct,     count: d.lowStock,     color: '#f59e0b' },
    { label: 'Out of Stock',  value: d.outOfStockPct,   count: d.outOfStock,   color: '#ef4444' },
    { label: 'Expiring Soon', value: d.expiringSoonPct, count: d.expiringSoon, color: '#a855f7' },
  ];
  let offset = 0;
  return segments.map((seg) => {
    const dash   = (seg.value / 100) * circ;
    const gap    = circ - dash;
    const rotate = (offset / 100) * 360 - 90;
    offset += seg.value;
    return { ...seg, dash, gap, rotate, cx, cy, r, strokeW };
  });
}

function DonutSVG({ size = 120 }: { size?: number }) {
  const { statusDistribution: d } = useInventoryStore();
  const arcs = buildArcs(d);
  const { cx, cy, r, strokeW } = arcs[0];

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeW}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={0}
          transform={`rotate(${arc.rotate} ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

function DonutModal() {
  const { statusDistribution: d, showDonutModal, setShowDonutModal } = useInventoryStore();
  const arcs = buildArcs(d);
  const total = d.inStock + d.lowStock + d.outOfStock + d.expiringSoon;
  if (!showDonutModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 w-full h-full cursor-default"
        onClick={() => setShowDonutModal(false)}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Stock Status Distribution</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowDonutModal(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <DonutSVG size={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-xs text-gray-400">Total Items</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {arcs.map((seg) => (
            <div key={seg.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{seg.label}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {seg.count}{' '}
                  <span className="text-xs font-normal text-gray-400">({seg.value}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StockStatusDonut() {
  const { statusDistribution: d, setShowDonutModal } = useInventoryStore();
  const arcs = buildArcs(d);

  return (
    <>
      <DonutModal />
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Stock Status Distribution</h3>
          <button
            type="button"
            onClick={() => setShowDonutModal(true)}
            className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-medium transition-colors"
          >
            View all
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <DonutSVG size={100} />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            {arcs.map((seg) => (
              <div key={seg.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-1 truncate">{seg.label}</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {seg.count}{' '}
                  <span className="text-gray-400 dark:text-gray-500">({seg.value}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}