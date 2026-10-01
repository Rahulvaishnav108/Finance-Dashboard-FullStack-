import React from 'react';
import { Calendar, CheckCircle2, Clock, X, Users } from 'lucide-react';
import { useReservationsStore } from '../../store/reservations.store';

interface StatItemProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  barColor: string;
  barWidth: string;
  change?: string;
  changeColor?: string;
}

function StatItem({ title, value, subtitle, icon, iconBg, barColor, barWidth, change, changeColor }: StatItemProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      {change && (
        <p className={`text-[11px] sm:text-xs font-semibold ${changeColor}`}>{change}</p>
      )}
      <div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: barWidth }} />
        </div>
        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function ReservationStatCards(): JSX.Element {
  const { stats } = useReservationsStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatItem
        title="Total Reservations"
        value={stats.total}
        subtitle={stats.totalChange}
        icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />}
        iconBg="bg-orange-50 dark:bg-orange-950/40"
        barColor="bg-orange-400"
        barWidth="100%"
        changeColor="text-green-600 dark:text-green-400"
      />
      <StatItem
        title="Confirmed"
        value={stats.confirmed}
        subtitle={stats.confirmedPercent}
        icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
        iconBg="bg-green-50 dark:bg-green-950/40"
        barColor="bg-green-500"
        barWidth="75%"
      />
      <StatItem
        title="Pending"
        value={stats.pending}
        subtitle={stats.pendingPercent}
        icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
        iconBg="bg-amber-50 dark:bg-amber-950/40"
        barColor="bg-amber-400"
        barWidth="16.7%"
      />
      <StatItem
        title="Cancelled"
        value={stats.cancelled}
        subtitle={stats.cancelledPercent}
        icon={<X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
        iconBg="bg-red-50 dark:bg-red-950/40"
        barColor="bg-red-400"
        barWidth="8.3%"
      />
      <StatItem
        title="Walk-ins"
        value={stats.walkIns}
        subtitle={stats.walkInsPercent}
        icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />}
        iconBg="bg-purple-50 dark:bg-purple-950/40"
        barColor="bg-purple-400"
        barWidth="25%"
      />
    </div>
  );
}