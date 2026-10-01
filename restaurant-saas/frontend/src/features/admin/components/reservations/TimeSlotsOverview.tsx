import React from 'react';
import { useReservationsStore, type TimeSlotBusyness } from '../../store/reservations.store';

const busynessStyle: Record<TimeSlotBusyness, { badge: string; dot: string }> = {
  Available: {
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  Busy: {
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
  'Very Busy': {
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

export function TimeSlotsOverview(): JSX.Element {
  const { timeSlots } = useReservationsStore();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
        Time Slots Overview
      </h3>
      {/* 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {timeSlots.map((slot) => {
          const style = busynessStyle[slot.busyness];
          return (
            <div
              key={slot.time}
              className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60"
            >
              <p className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                {slot.time}
              </p>
              <span className={`text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${style.badge}`}>
                {slot.busyness}
              </span>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{slot.tableCount} Tables</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}