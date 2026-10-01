import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useReportsStore } from '../../store/reports.store';
import type { DateRangeSelection } from '../../store/reports.store';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const PRESETS: { label: string; getRange: () => DateRangeSelection }[] = [
  {
    label: 'Today',
    getRange: () => {
      const d = new Date(); d.setHours(0,0,0,0);
      return { startDate: d, endDate: d, label: fmt(d) };
    },
  },
  {
    label: 'Yesterday',
    getRange: () => {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - 1);
      return { startDate: d, endDate: d, label: fmt(d) };
    },
  },
  {
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date(); end.setHours(0,0,0,0);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: end, label: `${fmt(start)} – ${fmt(end)}` };
    },
  },
  {
    label: 'This Week',
    getRange: () => {
      const now   = new Date(); now.setHours(0,0,0,0);
      const start = new Date(now); start.setDate(now.getDate() - now.getDay());
      const end   = new Date(start); end.setDate(start.getDate() + 6);
      return { startDate: start, endDate: end, label: `${fmt(start)} – ${fmt(end)}` };
    },
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date(); end.setHours(0,0,0,0);
      const start = new Date(end); start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: end, label: `${fmt(start)} – ${fmt(end)}` };
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const now   = new Date(); now.setHours(0,0,0,0);
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: start, endDate: end, label: `${MONTHS[now.getMonth()]} ${now.getFullYear()}` };
    },
  },
  {
    label: 'Last Month',
    getRange: () => {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end   = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start, endDate: end, label: `${MONTHS[start.getMonth()]} ${start.getFullYear()}` };
    },
  },
];

function fmt(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isBetween(d: Date, start: Date, end: Date) {
  return d >= start && d <= end;
}

interface CalendarMonthProps {
  year: number;
  month: number;
  selecting: Date | null;
  hoverDate: Date | null;
  finalStart: Date | null;
  finalEnd: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
}

function CalendarMonth({
  year, month, selecting, hoverDate, finalStart, finalEnd, onDayClick, onDayHover,
}: CalendarMonthProps) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previewStart = selecting
    ? (hoverDate && hoverDate < selecting ? hoverDate : selecting)
    : finalStart;
  const previewEnd = selecting
    ? (hoverDate && hoverDate > selecting ? hoverDate : selecting)
    : finalEnd;

  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  return (
    <div className="w-56 sm:w-64">
      <div className="text-center text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-semibold text-gray-400 py-1">{wd}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = previewStart ? sameDay(d, previewStart) : false;
          const isEnd   = previewEnd   ? sameDay(d, previewEnd)   : false;
          const inRange = previewStart && previewEnd
            ? isBetween(d, previewStart, previewEnd)
            : false;

          return (
            <button
              key={i}
              onClick={() => onDayClick(d)}
              onMouseEnter={() => onDayHover(d)}
              className={[
                'h-7 sm:h-8 text-xs font-medium transition-colors relative',
                (isStart || isEnd)
                  ? 'bg-orange-500 text-white rounded-full z-10'
                  : inRange
                    ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarPanel(): JSX.Element {
  const { dateRangeSelection, setDateRangeSelection, setIsCalendarOpen } = useReportsStore();
  const ref = useRef<HTMLDivElement>(null);

  const [leftYear,  setLeftYear]  = useState(2025);
  const [leftMonth, setLeftMonth] = useState(4); // May 2025
  const rightMonth = leftMonth === 11 ? 0           : leftMonth + 1;
  const rightYear  = leftMonth === 11 ? leftYear + 1 : leftYear;

  const [selecting,  setSelecting]  = useState<Date | null>(null);
  const [hoverDate,  setHoverDate]  = useState<Date | null>(null);
  const [finalStart, setFinalStart] = useState<Date | null>(dateRangeSelection.startDate);
  const [finalEnd,   setFinalEnd]   = useState<Date | null>(dateRangeSelection.endDate);

  // Detect mobile (< 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [setIsCalendarOpen]);

  function handleDayClick(d: Date) {
    if (!selecting) {
      setSelecting(d);
      setFinalStart(d);
      setFinalEnd(null);
    } else {
      const start = d < selecting ? d : selecting;
      const end   = d < selecting ? selecting : d;
      setFinalStart(start);
      setFinalEnd(end);
      setSelecting(null);
      setHoverDate(null);
    }
  }

  function handleApply() {
    if (!finalStart) return;
    const start = finalStart;
    const end   = finalEnd ?? finalStart;
    const label = sameDay(start, end)
      ? fmt(start)
      : `${fmt(start)} – ${fmt(end)}`;
    setDateRangeSelection({ startDate: start, endDate: end, label });
    setIsCalendarOpen(false);
  }

  function prevMonth() {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear((y) => y - 1); }
    else setLeftMonth((m) => m - 1);
  }

  function nextMonth() {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear((y) => y + 1); }
    else setLeftMonth((m) => m + 1);
  }

  // On mobile render as a fixed bottom sheet; on desktop as a dropdown
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <button
          type="button"
          className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full cursor-default"
          onClick={() => setIsCalendarOpen(false)}
          aria-label="Close calendar"
        />
        <div
          ref={ref}
          className="relative w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl p-4 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Select Date Range</p>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Quick select */}
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const sel = p.getRange();
                  setFinalStart(sel.startDate);
                  setFinalEnd(sel.endDate);
                  setDateRangeSelection(sel);
                  setIsCalendarOpen(false);
                }}
                className="text-center text-xs px-2 py-2 rounded-xl text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Single month calendar on mobile */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <CalendarMonth
              year={leftYear} month={leftMonth}
              selecting={selecting} hoverDate={hoverDate}
              finalStart={finalStart} finalEnd={finalEnd}
              onDayClick={handleDayClick} onDayHover={setHoverDate}
            />
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
            <span className="text-xs text-gray-500 truncate max-w-[160px]">
              {finalStart && finalEnd && !sameDay(finalStart, finalEnd)
                ? `${fmt(finalStart)} – ${fmt(finalEnd)}`
                : finalStart
                  ? fmt(finalStart)
                  : 'Select a date range'}
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!finalStart}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop dropdown
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 flex gap-4"
      style={{ minWidth: 580 }}
    >
      {/* Presets */}
      <div className="flex flex-col gap-1 w-28 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 pr-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Quick Select</p>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              const sel = p.getRange();
              setFinalStart(sel.startDate);
              setFinalEnd(sel.endDate);
              setDateRangeSelection(sel);
            }}
            className="text-left text-xs px-2 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendars */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex gap-6">
            <CalendarMonth
              year={leftYear} month={leftMonth}
              selecting={selecting} hoverDate={hoverDate}
              finalStart={finalStart} finalEnd={finalEnd}
              onDayClick={handleDayClick} onDayHover={setHoverDate}
            />
            <CalendarMonth
              year={rightYear} month={rightMonth}
              selecting={selecting} hoverDate={hoverDate}
              finalStart={finalStart} finalEnd={finalEnd}
              onDayClick={handleDayClick} onDayHover={setHoverDate}
            />
          </div>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500">
            {finalStart && finalEnd && !sameDay(finalStart, finalEnd)
              ? `${fmt(finalStart)} – ${fmt(finalEnd)}`
              : finalStart
                ? fmt(finalStart)
                : 'Select a date range'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!finalStart}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}