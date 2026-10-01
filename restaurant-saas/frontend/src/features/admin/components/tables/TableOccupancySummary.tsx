import React from 'react';
import { useTablesStore } from '../../store/tables.store';

const STATUS_COLORS = {
  Available: '#22c55e',
  Occupied:  '#f97316',
  Reserved:  '#3b82f6',
  Cleaning:  '#eab308',
  Blocked:   '#9ca3af',
};

export function TableOccupancySummary(): JSX.Element {
  const { stats } = useTablesStore();

  const segments = [
    { label: 'Available', count: stats.available, color: STATUS_COLORS.Available },
    { label: 'Occupied',  count: stats.occupied,  color: STATUS_COLORS.Occupied  },
    { label: 'Reserved',  count: stats.reserved,  color: STATUS_COLORS.Reserved  },
    { label: 'Cleaning',  count: stats.cleaning,  color: STATUS_COLORS.Cleaning  },
    { label: 'Blocked',   count: stats.blocked,   color: STATUS_COLORS.Blocked   },
  ].filter((s) => s.count > 0);

  const total = stats.total;

  const R = 48, cx = 64, cy = 64, stroke = 14;
  const circumference = 2 * Math.PI * R;

  let cumulativePct = 0;
  const arcs = segments.map((seg) => {
    const pct    = seg.count / total;
    const dash   = pct * circumference;
    const gap    = circumference - dash;
    const offset = circumference - cumulativePct * circumference;
    cumulativePct += pct;
    return { ...seg, dash, gap, offset, pct };
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Occupancy Summary</h3>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width={128} height={128}>
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={stroke}
              className="dark:stroke-gray-800"
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={cx} cy={cy} r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            ))}
            <text
              x={cx} y={cy - 6}
              textAnchor="middle"
              className="fill-gray-900 dark:fill-white"
              fontSize={22}
              fontWeight="800"
            >
              {stats.occupied}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400" fontSize={10}>
              occupied
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{seg.count}</span>
                <span className="text-[10px] text-gray-400 w-8 text-right">
                  {Math.round((seg.count / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}