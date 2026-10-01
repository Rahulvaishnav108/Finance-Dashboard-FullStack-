import React, { useState } from 'react';
import { ANALYTICS_DATA } from '../store/kitchenData';
import { useAuth } from '../../../auth/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function KitchenAnalyticsPage() {
  const { user } = useAuth();

  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | 'weekly'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_analytics_time_range');
      if (stored === 'today' || stored === 'yesterday' || stored === 'weekly') {
        return stored;
      }
    }
    return 'today';
  });

  if (user?.internal_role === 'CHEF') {
    return <Navigate to="/kitchen" replace />;
  }

  const handleTimeRangeChange = (range: 'today' | 'yesterday' | 'weekly') => {
    setTimeRange(range);
    localStorage.setItem('kitchen_analytics_time_range', range);
  };

  const { metrics, chartData, popularItems, stationEfficiency } = ANALYTICS_DATA[timeRange];

  // Max value for scaling SVG chart bars
  const maxHourlyOrders = Math.max(...chartData.map(d => d.orders));

  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kitchen Analytics</h2>
          <p className="text-sm text-slate-500 font-medium">Review order performance metrics, hourly peaks, and preparation speeds</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shrink-0 self-start sm:self-auto">
          {(['today', 'yesterday', 'weekly'] as const).map(range => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeRange === range
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {metrics.map((metric, idx) => {
          const isPositive = metric.change >= 0;
          const changeText = isPositive ? `+${metric.change}` : `${metric.change}`;
          const isPrepTime = metric.label.includes('Prep');
          // prep time decrease is good, so negative is green. Otherwise positive is green.
          const isGoodChange = isPrepTime ? !isPositive : isPositive;

          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{metric.label}</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-slate-800">
                  {metric.unit === '₹' ? '₹' : ''}
                  {metric.value.toLocaleString()}
                  {metric.unit !== '₹' ? metric.unit : ''}
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    isGoodChange ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {changeText}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">vs. yesterday&apos;s average</span>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hourly Orders Trend (SVG Bar Chart) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-800">
                {timeRange === 'weekly' ? 'Daily Order Volume' : 'Hourly Order Volume'}
              </h3>
              <p className="text-xs text-slate-400">
                {timeRange === 'weekly'
                  ? 'Daily order loads throughout the week'
                  : 'Peak times and order loads throughout the shift'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">Live Feed</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full h-60 flex items-end justify-between px-2 pt-6">
            {chartData.map((d, index) => {
              // Scale height relative to maximum value, height constraint max 180px
              const barHeight = maxHourlyOrders > 0 ? (d.orders / maxHourlyOrders) * 160 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end px-1">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.orders} Orders
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[28px] bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-md group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 relative cursor-pointer"
                    style={{ height: `${barHeight}px` }}
                  />
                  {/* Label */}
                  <span className="text-[10px] font-semibold text-slate-400 mt-2 rotate-0 sm:rotate-0">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Dishes (Progress bars) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-800">Top Prep Dishes</h3>
            <p className="text-xs text-slate-400">Most requested menu items in kitchen</p>
          </div>
          <div className="space-y-4">
            {popularItems.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-orange-600 font-bold">{item.count} items</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stations Efficiency & Load */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-base text-slate-800">Station Preparation Efficiencies</h3>
          <p className="text-xs text-slate-400">Order completion rate & speed score per cooking counter</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stationEfficiency.map((station, idx) => (
            <div key={idx} className="border border-slate-100 p-4 rounded-xl text-center hover:bg-slate-50/50 transition-colors">
              <span className="text-xs font-bold text-slate-500 block">{station.station} Station</span>
              <div className="my-3 flex justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#F1F5F9"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#EA580C"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - station.efficiency / 100)}
                  />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-slate-800">{station.efficiency}%</span>
              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded block mt-1">
                Optimal
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
