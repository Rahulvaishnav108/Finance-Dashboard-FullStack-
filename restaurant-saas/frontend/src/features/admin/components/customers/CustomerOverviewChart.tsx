import React from 'react';
import { useCustomersStore } from '../../store/customers.store';

export function CustomerOverviewChart() {
  const { customerOverview } = useCustomersStore();
  const { active, inactive, new: newC, total } = customerOverview;

  const activePct   = Math.round((active   / total) * 100);
  const inactivePct = Math.round((inactive / total) * 100);
  const newPct      = 100 - activePct - inactivePct;

  const cx = 60, cy = 60, r = 44, strokeW = 16;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: activePct,   color: '#f97316', label: 'Active',   count: active.toLocaleString('en-IN')   },
    { value: inactivePct, color: '#d1d5db', label: 'Inactive', count: inactive.toLocaleString('en-IN') },
    { value: newPct,      color: '#93c5fd', label: 'New',      count: newC.toLocaleString('en-IN')     },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash   = (seg.value / 100) * circ;
    const gap    = circ - dash;
    const rotate = (offset / 100) * 360 - 90;
    offset += seg.value;
    return { ...seg, dash, gap, rotate };
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Customer Overview</h3>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 120 120" className="sm:w-[120px] sm:h-[120px]">
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={cx}
                cy={cy}
                r={r}
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
        </div>

        {/* Legend */}
        <div className="space-y-1.5 sm:space-y-2 flex-1">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {seg.value}%
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 ml-1">
                  ({seg.count})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Total Customers</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}