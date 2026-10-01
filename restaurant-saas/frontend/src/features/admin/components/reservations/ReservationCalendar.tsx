import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReservationsStore } from '../../store/reservations.store';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const reservationDates: Record<number, 'confirmed' | 'pending' | 'cancelled' | 'walkin'> = {
  2: 'confirmed', 3: 'walkin', 7: 'pending', 10: 'confirmed',
  12: 'confirmed', 14: 'cancelled', 17: 'confirmed', 19: 'pending',
  20: 'confirmed', 21: 'confirmed', 25: 'pending', 27: 'walkin', 31: 'confirmed',
};

export function ReservationCalendar(): JSX.Element {
  const { calendarView, setCalendarView } = useReservationsStore();
  const [month, setMonth] = useState(4);
  const [year, setYear] = useState(2025);
  const [selectedDay, setSelectedDay] = useState(20);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number; current: boolean }> = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });
  }

  const dotColor: Record<string, string> = {
    confirmed: 'bg-green-500',
    pending: 'bg-amber-400',
    cancelled: 'bg-red-400',
    walkin: 'bg-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">Reservation Calendar</h3>
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['Day', 'Week', 'Month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setCalendarView(v)}
              className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-all ${
                calendarView === v
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={() => {
            if (month === 0) { setMonth(11); setYear((y) => y - 1); }
            else setMonth((m) => m - 1);
          }}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => {
            if (month === 11) { setMonth(0); setYear((y) => y + 1); }
            else setMonth((m) => m + 1);
          }}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-[11px] font-medium text-gray-400 dark:text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          const dot = cell.current ? reservationDates[cell.day] : undefined;
          const isSelected = cell.current && cell.day === selectedDay;
          const isToday = cell.current && cell.day === 20 && month === 4;
          return (
            <button
              key={i}
              onClick={() => cell.current && setSelectedDay(cell.day)}
              className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-xl text-[11px] sm:text-xs transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white font-bold'
                  : isToday
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                  : cell.current
                  ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  : 'text-gray-300 dark:text-gray-700'
              }`}
            >
              {cell.day}
              {dot && !isSelected && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${dotColor[dot]}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
        {[
          { label: 'Confirmed', color: 'bg-green-500' },
          { label: 'Pending', color: 'bg-amber-400' },
          { label: 'Cancelled', color: 'bg-red-400' },
          { label: 'Walk-in', color: 'bg-purple-400' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}