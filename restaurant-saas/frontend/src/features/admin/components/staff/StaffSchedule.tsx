import React, { useState } from 'react';
import { X, Clock, Users, Cake } from 'lucide-react';
import { useStaffStore } from '../../store/staff.store';
import type { Shift, UpcomingBirthday } from '../../store/staff.store';

function AvatarStack({ avatars, extra }: { avatars: string[]; extra: number }) {
  return (
    <div className="flex items-center">
      {avatars.map((av, i) => (
        <div
          key={i}
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: avatars.length - i }}
          className="relative w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[9px] font-bold"
        >
          {av}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{ marginLeft: -8, zIndex: 0 }}
          className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] font-bold text-gray-500 dark:text-gray-400"
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

const SHIFT_COLORS = ['#f97316', '#3b82f6', '#a855f7'];

// ── Schedule Detail Modal ──────────────────────────────────────────────────

function ScheduleModal({ shifts, onClose }: { shifts: Shift[]; onClose: () => void }): JSX.Element {
  const FULL_COLORS = [
    { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600 dark:text-orange-400', bar: '#f97316' },
    { bg: 'bg-blue-50 dark:bg-blue-950/20',     border: 'border-blue-200 dark:border-blue-800',     text: 'text-blue-600 dark:text-blue-400',     bar: '#3b82f6' },
    { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', bar: '#a855f7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Today&apos;s Full Schedule</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {shifts.reduce((a, s) => a + s.staffCount, 0)} staff members on duty today
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {shifts.map((sh, i) => {
            const c = FULL_COLORS[i % FULL_COLORS.length];
            return (
              <div key={sh.id} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-bold ${c.text}`}>{sh.label}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sh.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{sh.staffCount} Staff</span>
                  </div>
                </div>
                <AvatarStack avatars={sh.staffAvatars} extra={sh.extra} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Birthdays Detail Modal ─────────────────────────────────────────────────

function BirthdaysModal({ birthdays, onClose }: { birthdays: UpcomingBirthday[]; onClose: () => void }): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upcoming Birthdays</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{birthdays.length} birthdays coming up</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {birthdays.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {b.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{b.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Cake className="w-3 h-3 text-pink-400" />
                  <p className="text-xs text-pink-500 dark:text-pink-400 font-medium">{b.date}</p>
                </div>
              </div>
              {i === 0 && (
                <span className="text-xs font-semibold px-2 py-1 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-full flex-shrink-0">Soon</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── TodaysSchedule ─────────────────────────────────────────────────────────

export function TodaysSchedule(): JSX.Element {
  const { shifts } = useStaffStore();
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Today&apos;s Schedule</h3>
          <button onClick={() => setShowAll(true)} className="text-xs font-semibold text-orange-500 hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {shifts.map((sh, i) => (
            <div key={sh.id} className="flex items-center gap-3">
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: SHIFT_COLORS[i] }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{sh.time}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sh.label} • {sh.staffCount} Staff</p>
              </div>
              <AvatarStack avatars={sh.staffAvatars} extra={sh.extra} />
            </div>
          ))}
        </div>
      </div>
      {showAll && <ScheduleModal shifts={shifts} onClose={() => setShowAll(false)} />}
    </>
  );
}

// ── UpcomingBirthdays ──────────────────────────────────────────────────────

export function UpcomingBirthdays(): JSX.Element {
  const { birthdays } = useStaffStore();
  const [showAll, setShowAll] = useState(false);
  const visible = birthdays.slice(0, 3);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Upcoming Birthdays</h3>
          <button onClick={() => setShowAll(true)} className="text-xs font-semibold text-orange-500 hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {visible.map((b) => (
            <div key={b.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {b.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{b.name}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{b.date}</span>
            </div>
          ))}
          {birthdays.length > 3 && (
            <button onClick={() => setShowAll(true)} className="w-full text-xs text-gray-400 hover:text-orange-500 transition-colors pt-1">
              +{birthdays.length - 3} more birthdays →
            </button>
          )}
        </div>
      </div>
      {showAll && <BirthdaysModal birthdays={birthdays} onClose={() => setShowAll(false)} />}
    </>
  );
}