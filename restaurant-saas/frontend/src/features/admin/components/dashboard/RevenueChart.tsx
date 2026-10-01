import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDashboardStore } from '../../store/dashboard.store';

export function RevenueChart() {
  const { revenueData } = useDashboardStore();

  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // ── Hover state ──────────────────────────────────────────────────────────
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ── Chart dimensions ─────────────────────────────────────────────────────
  const W = 580, H = 200, pad = { top: 28, right: 20, bottom: 28, left: 48 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const xStep = revenueData.length > 1 ? chartW / (revenueData.length - 1) : chartW;

  const max = Math.max(...revenueData.flatMap((d) => [d.thisWeek, d.lastWeek]), 1);
  const yMax = Math.ceil(max / 3000) * 3000;
  const yScale = (v: number) => chartH - (v / yMax) * chartH;

  const makePath = (key: 'thisWeek' | 'lastWeek') =>
    revenueData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${pad.left + i * xStep},${pad.top + yScale(d[key])}`)
      .join(' ');

  const makeArea = (key: 'thisWeek' | 'lastWeek') => {
    const pts = revenueData.map((d, i) => `${pad.left + i * xStep},${pad.top + yScale(d[key])}`).join(' L ');
    const last = revenueData.length - 1;
    return `M ${pad.left},${pad.top + chartH} L ${pts} L ${pad.left + last * xStep},${pad.top + chartH} Z`;
  };

  const yLabelCount = 5;
  const yLabels = Array.from({ length: yLabelCount + 1 }, (_, i) =>
    Math.round((yMax / yLabelCount) * i)
  );

  // ── Mouse tracking: find nearest data point ───────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const relX = mouseX - pad.left;
    const idx = Math.round(relX / xStep);
    if (idx >= 0 && idx < revenueData.length) {
      setHoveredIdx(idx);
    } else {
      setHoveredIdx(null);
    }
  }, [xStep, revenueData.length, pad.left]);

  const handleMouseLeave = useCallback(() => setHoveredIdx(null), []);

  // ── Tooltip position ──────────────────────────────────────────────────────
  const tooltipW = 148, tooltipH = 62;
  const hovered = hoveredIdx !== null ? revenueData[hoveredIdx] : null;
  const hoverX = hoveredIdx !== null ? pad.left + hoveredIdx * xStep : 0;
  const tooltipX = Math.min(Math.max(hoverX - tooltipW / 2, pad.left), W - pad.right - tooltipW);
  const tooltipBg = dark ? '#1f2937' : '#ffffff';
  const tooltipBorder = dark ? '#374151' : '#e5e7eb';
  const tooltipText = dark ? '#f3f4f6' : '#111827';
  const tooltipSub = dark ? '#9ca3af' : '#6b7280';

  const gridColor = dark ? '#1f2937' : '#f3f4f6';
  const labelColor = dark ? '#6b7280' : '#9ca3af';

  // ── Stroke-dashoffset animation ───────────────────────────────────────────
  // We measure path length on mount and animate via CSS
  const thisWeekRef = useRef<SVGPathElement>(null);
  const lastWeekRef = useRef<SVGPathElement>(null);
  const [animated, setAnimated] = useState(false);
  const [thisLen, setThisLen] = useState(0);
  const [lastLen, setLastLen] = useState(0);

  useEffect(() => {
    if (thisWeekRef.current && lastWeekRef.current) {
      setThisLen(thisWeekRef.current.getTotalLength());
      setLastLen(lastWeekRef.current.getTotalLength());
      // Trigger animation on next frame
      requestAnimationFrame(() => setAnimated(true));
    }
  }, [revenueData]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Revenue Overview</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">This week vs last week</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            This Week
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
            Last Week
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="rc-orangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rc-grayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity="0" />
            </linearGradient>
            <clipPath id="rc-clip">
              <rect x={pad.left} y={pad.top} width={chartW} height={chartH} />
            </clipPath>
          </defs>

          {/* Y grid lines + labels */}
          {yLabels.map((v) => {
            const y = pad.top + yScale(v);
            return (
              <g key={v}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={gridColor} strokeWidth="1" />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill={labelColor}>
                  ₹{v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                </text>
              </g>
            );
          })}

          {/* Areas — fade in */}
          <g style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}>
            <path d={makeArea('lastWeek')} fill="url(#rc-grayGrad)" clipPath="url(#rc-clip)" />
            <path d={makeArea('thisWeek')} fill="url(#rc-orangeGrad)" clipPath="url(#rc-clip)" />
          </g>

          {/* Lines — draw-on animation via stroke-dashoffset */}
          <path
            ref={lastWeekRef}
            d={makePath('lastWeek')}
            fill="none"
            stroke={dark ? '#4b5563' : '#d1d5db'}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeDashoffset={animated ? 0 : lastLen}
            style={{ transition: `stroke-dashoffset 1s ease` }}
          />
          <path
            ref={thisWeekRef}
            d={makePath('thisWeek')}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={thisLen || 9999}
            strokeDashoffset={animated ? 0 : thisLen}
            style={{ transition: `stroke-dashoffset 1s ease` }}
          />

          {/* Dots — pop in with delay per index */}
          {revenueData.map((d, i) => {
            const cx = pad.left + i * xStep;
            const cy = pad.top + yScale(d.thisWeek);
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={i}
                cx={cx} cy={cy}
                r={isHovered ? 5 : 3}
                fill="#f97316"
                stroke={dark ? '#111827' : 'white'}
                strokeWidth="1.5"
                style={{
                  transition: 'r 0.15s ease, opacity 0.3s ease',
                  opacity: animated ? 1 : 0,
                  transitionDelay: animated ? `${i * 0.08 + 0.6}s` : '0s',
                }}
              />
            );
          })}

          {/* Hover vertical line */}
          {hoveredIdx !== null && (
            <line
              x1={hoverX} y1={pad.top}
              x2={hoverX} y2={pad.top + chartH}
              stroke={dark ? '#4b5563' : '#e5e7eb'}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Hover dots on lastWeek line */}
          {hoveredIdx !== null && hovered && (
            <circle
              cx={hoverX}
              cy={pad.top + yScale(hovered.lastWeek)}
              r="4"
              fill={dark ? '#4b5563' : '#d1d5db'}
              stroke={dark ? '#111827' : 'white'}
              strokeWidth="1.5"
            />
          )}

          {/* Tooltip */}
          {hoveredIdx !== null && hovered && (
            <g>
              {/* Shadow */}
              <rect
                x={tooltipX + 2} y={pad.top - 2}
                width={tooltipW} height={tooltipH}
                rx="6" fill="rgba(0,0,0,0.08)"
              />
              {/* Box */}
              <rect
                x={tooltipX} y={pad.top - 4}
                width={tooltipW} height={tooltipH}
                rx="6"
                fill={tooltipBg}
                stroke={tooltipBorder}
                strokeWidth="1"
              />
              {/* Day label */}
              <text
                x={tooltipX + 10} y={pad.top + 12}
                fontSize="9" fontWeight="700"
                fill={tooltipSub}
                letterSpacing="0.5"
              >
                {hovered.day.toUpperCase()}
              </text>
              {/* This week */}
              <circle cx={tooltipX + 10} cy={pad.top + 26} r="3.5" fill="#f97316" />
              <text x={tooltipX + 18} y={pad.top + 30} fontSize="9" fill={tooltipSub}>This week</text>
              <text
                x={tooltipX + tooltipW - 8} y={pad.top + 30}
                fontSize="10" fontWeight="700"
                fill={tooltipText} textAnchor="end"
              >
                ₹{hovered.thisWeek.toLocaleString('en-IN')}
              </text>
              {/* Divider */}
              <line
                x1={tooltipX + 8} y1={pad.top + 37}
                x2={tooltipX + tooltipW - 8} y2={pad.top + 37}
                stroke={tooltipBorder} strokeWidth="0.5"
              />
              {/* Last week */}
              <circle cx={tooltipX + 10} cy={pad.top + 48} r="3.5" fill={dark ? '#4b5563' : '#d1d5db'} />
              <text x={tooltipX + 18} y={pad.top + 52} fontSize="9" fill={tooltipSub}>Last week</text>
              <text
                x={tooltipX + tooltipW - 8} y={pad.top + 52}
                fontSize="10" fontWeight="700"
                fill={tooltipText} textAnchor="end"
              >
                ₹{hovered.lastWeek.toLocaleString('en-IN')}
              </text>
            </g>
          )}

          {/* X labels */}
          {revenueData.map((d, i) => (
            <text
              key={i}
              x={pad.left + i * xStep} y={H - 6}
              textAnchor="middle" fontSize="9"
              fill={hoveredIdx === i ? '#f97316' : labelColor}
              fontWeight={hoveredIdx === i ? '700' : '400'}
              style={{ transition: 'fill 0.15s ease' }}
            >
              {d.day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}