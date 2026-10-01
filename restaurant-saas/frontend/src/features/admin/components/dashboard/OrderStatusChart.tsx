import React from 'react';
import { useDashboardStore } from '../../store/dashboard.store';

export function OrderStatusChart() {
  const { orderStatusBreakdown, totalOrders } = useDashboardStore();

  // Build SVG donut
  const R = 52;
  const cx = 70;
  const cy = 70;
  const strokeW = 18;

  const circumference = 2 * Math.PI * R;

  const segments = orderStatusBreakdown.map((item, index) => {
    const pct = item.count / totalOrders;
    const dash = pct * circumference;
    const gap = circumference - dash;

    const offset = orderStatusBreakdown
      .slice(0, index)
      .reduce((sum, current) => {
        return (
          sum +
          (current.count / totalOrders) * circumference
        );
      }, 0);

    return {
      ...item,
      dash,
      gap,
      offset,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Order Status Overview
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">

            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeW}
              className="dark:stroke-gray-800"
            />

            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeW}
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}

            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill="currentColor"
              className="fill-gray-900 dark:fill-white"
            >
              {totalOrders}
            </text>

            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              Total Orders
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {orderStatusBreakdown.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.count}
                </span>

                <span className="text-gray-400 dark:text-gray-500 w-12 text-right">
                  ({item.percentage})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}