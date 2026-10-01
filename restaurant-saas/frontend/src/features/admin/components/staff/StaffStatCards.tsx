import React from 'react';
import { Users, UserCheck, UserMinus, Wallet, Star } from 'lucide-react';
import { useStaffStore } from '../../store/staff.store';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  right?: React.ReactNode;
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  subColor = 'text-green-500',
  right,
}: StatCardProps) {
  return (
    <div className="flex-1 min-w-[190px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4">
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {value}
        </p>
        {sub && (
          <p className={`text-xs font-medium mt-0.5 truncate ${subColor}`}>{sub}</p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

export function StaffStatCards(): JSX.Element {
  const { stats, attendanceBreakdown } = useStaffStore();

  const r = 30;
  const cx = 40;
  const cy = 40;
  const circumference = 2 * Math.PI * r;
  const filledDash = (stats.attendancePct / 100) * circumference;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3">
      {/* Total Staff */}
      <StatCard
        icon={<Users className="w-5 h-5 text-orange-500" />}
        iconBg="bg-orange-50 dark:bg-orange-950/50"
        label="Total Staff"
        value={stats.totalStaff}
        sub={`↑ ${stats.totalStaffChange} vs last month`}
        subColor="text-green-500"
      />

      {/* Active Today */}
      <StatCard
        icon={<UserCheck className="w-5 h-5 text-green-500" />}
        iconBg="bg-green-50 dark:bg-green-950/40"
        label="Active Today"
        value={stats.activeToday}
        sub={stats.activeTodayPct}
        subColor="text-gray-500 dark:text-gray-400"
      />

      {/* On Leave */}
      <StatCard
        icon={<UserMinus className="w-5 h-5 text-purple-500" />}
        iconBg="bg-purple-50 dark:bg-purple-950/40"
        label="On Leave"
        value={stats.onLeave}
        sub={stats.onLeavePct}
        subColor="text-gray-500 dark:text-gray-400"
      />

      {/* Total Payroll */}
      <StatCard
        icon={<Wallet className="w-5 h-5 text-blue-500" />}
        iconBg="bg-blue-50 dark:bg-blue-950/40"
        label="Total Payroll (May)"
        value={stats.totalPayroll}
        sub={stats.totalPayrollChange}
        subColor="text-red-500"
      />

      {/* Avg Performance */}
      <StatCard
        icon={<Star className="w-5 h-5 text-amber-500" />}
        iconBg="bg-amber-50 dark:bg-amber-950/40"
        label="Avg. Performance"
        value={stats.avgPerformance}
        sub={stats.avgPerformanceChange}
        subColor="text-green-500"
      />

      {/* Attendance Donut */}
      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 lg:flex-shrink-0 lg:min-w-[250px]">
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray={`${filledDash} ${circumference}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#111827"
              className="dark:fill-gray-100"
            >
              {stats.attendancePct}%
            </text>
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
            This Month Attendance
          </p>
          <div className="space-y-0.5">
            {attendanceBreakdown.map((ab) => (
              <div
                key={ab.label}
                className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: ab.color }}
                />
                <span className="truncate">{ab.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 ml-auto pl-2">
                  {ab.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}