import React from 'react';
import { UserX, Users, RefreshCw, Clock, Percent } from 'lucide-react';
import { useReservationsStore } from '../../store/reservations.store';

export function ReservationAnalyticsBar(): JSX.Element {
  const { analytics } = useReservationsStore();

  const items = [
    {
      icon: <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
      iconBg: 'bg-red-50 dark:bg-red-950/40',
      label: 'No Show Rate',
      value: analytics.noShowRate,
      change: analytics.noShowChange,
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      label: 'Avg. Party Size',
      value: analytics.avgPartySize,
      change: analytics.avgPartySizeChange,
      changeColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      label: 'Table Turnover',
      value: analytics.tableTurnover,
      change: analytics.tableTurnoverChange,
      changeColor: 'text-red-500',
    },
    {
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      label: 'Peak Time',
      value: analytics.peakTime,
      change: 'Most reservations',
      changeColor: 'text-gray-400 dark:text-gray-500',
    },
    {
      icon: <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
      iconBg: 'bg-green-50 dark:bg-green-950/40',
      label: 'Occupancy Rate',
      value: analytics.occupancyRate,
      change: analytics.occupancyChange,
      changeColor: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
        Reservation Analytics
      </h3>
      {/* 2 cols on mobile, 3 on sm, 5 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map(({ icon, iconBg, label, value, change, changeColor }) => (
          <div key={label} className="flex items-start gap-2.5 sm:gap-3">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
              <p className={`text-[10px] sm:text-xs ${changeColor} mt-0.5`}>{change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}