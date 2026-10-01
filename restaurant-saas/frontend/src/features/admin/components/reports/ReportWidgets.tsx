import React from 'react';
import { useReportsStore } from '../../store/reports.store';
import type { DateRange, PeakHoursRange } from '../../store/reports.store';

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'];

const WEEK_RANGES: DateRange[] = ['Daily', 'Weekly', 'Monthly'];

// ── Reusable Range Button Group ────────────────────────────────────────────

function RangeButtons<T extends string>({
  ranges,
  current,
  onChange,
}: {
  ranges: T[];
  current: T;
  onChange: (r: T) => void;
}) {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex-shrink-0">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`text-xs px-2 sm:px-2.5 py-1.5 font-medium transition-colors ${
            current === r
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ── Peak Hours Heatmap ────────────────────────────────────────────────────

export function PeakHours(): JSX.Element {
  const { getPeakHourCells, peakHoursRange, setPeakHoursRange } = useReportsStore();
  const peakHourCells = getPeakHourCells();

  function getColor(intensity: number) {
    const alpha = 0.1 + intensity * 0.9;
    return `rgba(249,115,22,${alpha})`;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-w-0 w-full">
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Peak Hours</h3>
          <p className="text-[11px] text-gray-400">Busiest times based on orders</p>
        </div>
        <RangeButtons
          ranges={WEEK_RANGES as PeakHoursRange[]}
          current={peakHoursRange}
          onChange={setPeakHoursRange}
        />
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div style={{ minWidth: 300 }}>
          {/* Hour headers */}
          <div className="flex mb-1 ml-9">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-[9px] text-gray-400 font-medium">{h}</div>
            ))}
          </div>
          {/* Rows */}
          {DAYS.map((day) => (
            <div key={day} className="flex items-center mb-1">
              <span className="w-9 text-[10px] text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">{day}</span>
              {HOURS.map((hour) => {
                const cell = peakHourCells.find((c) => c.day === day && c.hour === hour);
                return (
                  <div
                    key={hour}
                    className="flex-1 mx-0.5 h-6 sm:h-7 rounded cursor-default"
                    style={{ background: getColor(cell?.intensity ?? 0.1) }}
                    title={`${day} ${hour}: ${Math.round((cell?.intensity ?? 0) * 100)}% activity`}
                  />
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 ml-9">
            <span className="text-[9px] text-gray-400">Low</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-6 h-3 rounded-sm" style={{ background: getColor(v) }} />
            ))}
            <span className="text-[9px] text-gray-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Top Selling Items ─────────────────────────────────────────────────────

export function TopSellingItems(): JSX.Element {
  const { getTopSellingItems, topItemsRange, setTopItemsRange } = useReportsStore();
  const topSellingItems = getTopSellingItems();
  const maxOrders = Math.max(...topSellingItems.map((i) => i.orders));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-w-0 w-full">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Top Selling Items</h3>
        <RangeButtons
          ranges={WEEK_RANGES}
          current={topItemsRange}
          onChange={setTopItemsRange}
        />
      </div>
      <div className="space-y-3">
        {topSellingItems.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 text-center flex-shrink-0">
              <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {item.orders.toLocaleString()} orders
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 dark:bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(item.orders / maxOrders) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 w-20 sm:w-24 text-right">
              {item.revenue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue By Category ───────────────────────────────────────────────────

export function RevenueByCategory(): JSX.Element {
  const { getRevenueByCategory, getStats, revByCatRange, setRevByCatRange } = useReportsStore();
  const revenueByCategory = getRevenueByCategory();
  const stats = getStats();

  const r = 52, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
  const segments = revenueByCategory.reduce<
    Array<(typeof revenueByCategory)[number] & { dash: number; offset: number }>
  >((acc, cat) => {
    const prev   = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    const dash   = (cat.pct / 100) * circumference;
    acc.push({ ...cat, dash, offset });
    return acc;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 min-w-0 w-full">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Revenue by Category</h3>
        <RangeButtons
          ranges={WEEK_RANGES}
          current={revByCatRange}
          onChange={setRevByCatRange}
        />
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#111827" className="dark:fill-gray-100">
              {stats.totalRevenue}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" fill="#9ca3af">Total Revenue</text>
          </svg>
        </div>
        <div className="space-y-3 flex-1 min-w-0 w-full">
          {revenueByCategory.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-gray-600 dark:text-gray-400 font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200 flex-shrink-0 ml-2">{cat.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.pct}%`, background: cat.color }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{cat.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}