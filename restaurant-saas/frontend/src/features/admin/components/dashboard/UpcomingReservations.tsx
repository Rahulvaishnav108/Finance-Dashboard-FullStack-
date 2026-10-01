import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore, type ReservationStatus } from '../../store/dashboard.store';

const statusStyle: Record<ReservationStatus, string> = {
  Confirmed: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
};

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

export function UpcomingReservations() {
  const { upcomingReservations } = useDashboardStore();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Upcoming Reservations</h3>
        <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {upcomingReservations.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {r.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{r.time}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[r.status]}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}