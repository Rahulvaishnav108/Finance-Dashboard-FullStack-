import React from 'react';
import { LayoutGrid, Users, TrendingUp, IndianRupee } from 'lucide-react';
import { useTablesStore } from '../../store/tables.store';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5 truncate">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>
        )}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
              trendUp
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function TableStatCards(): JSX.Element {
  const { stats } = useTablesStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Total Tables"
        value={stats.total}
        sub={`${stats.available} available now`}
        icon={LayoutGrid}
        iconBg="bg-blue-50 dark:bg-blue-950/40"
        iconColor="text-blue-500"
      />
      <StatCard
        label="Occupancy Rate"
        value={stats.occupancyRate}
        sub={`${stats.occupied} occupied`}
        icon={TrendingUp}
        iconBg="bg-orange-50 dark:bg-orange-950/40"
        iconColor="text-orange-500"
        trend="+5% vs yesterday"
        trendUp
      />
      <StatCard
        label="Revenue Today"
        value={stats.revenueToday}
        sub={`${stats.coversTodday} covers served`}
        icon={IndianRupee}
        iconBg="bg-green-50 dark:bg-green-950/40"
        iconColor="text-green-500"
        trend="+₹4,200 vs yesterday"
        trendUp
      />
      <StatCard
        label="Avg. Turnover"
        value={stats.avgTurnover}
        sub={`${stats.reserved} reserved upcoming`}
        icon={Users}
        iconBg="bg-purple-50 dark:bg-purple-950/40"
        iconColor="text-purple-500"
      />
    </div>
  );
}