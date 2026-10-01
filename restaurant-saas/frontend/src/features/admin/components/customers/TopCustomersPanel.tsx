import React, { useState } from 'react';
import { ChevronDown, X, Trophy, TrendingUp } from 'lucide-react';
import { useCustomersStore } from '../../store/customers.store';

const AVATAR_COLORS: Record<string, string> = {
  JS: 'bg-orange-500', MB: 'bg-green-500',  SJ: 'bg-blue-500',
  DW: 'bg-teal-500',   JT: 'bg-amber-500',  ED: 'bg-pink-500',
  LA: 'bg-indigo-500', OM: 'bg-purple-500', RG: 'bg-cyan-500',
  JL: 'bg-rose-500',   AH: 'bg-yellow-500',
};

const PERIOD_OPTIONS = ['This Month', 'Last Month', 'This Year', 'All Time'];
const RANK_ICON: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function TopCustomersPanel() {
  const { topCustomers, customers } = useCustomersStore();
  const [showViewAll, setShowViewAll]     = useState(false);
  const [period, setPeriod]               = useState('This Month');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const ranked = [...customers]
    .sort((a, b) => b.totalSpentRaw - a.totalSpentRaw)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Customers</h3>

          {/* Period selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodMenu((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {period}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPeriodMenu && (
              <>
                <button
                  type="button"
                  aria-label="Close"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setShowPeriodMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 w-32">
                  {PERIOD_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPeriod(p); setShowPeriodMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        period === p
                          ? 'text-orange-500 font-semibold bg-orange-50 dark:bg-orange-950/40'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {topCustomers.map((c) => {
            const bg = AVATAR_COLORS[c.avatar] ?? 'bg-gray-500';
            return (
              <div key={c.rank} className="flex items-center gap-2.5 sm:gap-3">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4 text-center">
                  {RANK_ICON[c.rank] ?? c.rank}
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {c.avatar}
                </div>
                <p className="flex-1 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {c.name}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {c.spent}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowViewAll(true)}
          className="w-full mt-3 sm:mt-4 py-2 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 border border-orange-100 dark:border-orange-900/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
        >
          View All
        </button>
      </div>

      {/* ─── View All Modal ─── */}
      {showViewAll && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 w-full h-full cursor-default"
            onClick={() => setShowViewAll(false)}
          />

          <div
            className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full sm:max-w-md sm:mx-4 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="top-customers-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <div>
                  <h2
                    id="top-customers-title"
                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-white"
                  >
                    Top Customers
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ranked by total spend</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViewAll(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
              {[
                { label: 'Total Customers', value: String(ranked.length) },
                { label: 'Top Spend',       value: ranked[0]?.totalSpent ?? '₹0' },
                {
                  label: 'Avg Spend',
                  value:
                    '₹' +
                    Math.round(
                      ranked.reduce((s, c) => s + c.totalSpentRaw, 0) / (ranked.length || 1),
                    ).toLocaleString('en-IN'),
                },
              ].map(({ label, value }) => (
                <div key={label} className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Ranked list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              {ranked.map((c) => {
                const bg = AVATAR_COLORS[c.avatar] ?? 'bg-gray-500';
                const tierColors: Record<string, string> = {
                  Gold:   'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400',
                  Silver: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                  Bronze: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
                };
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      c.rank <= 3
                        ? 'bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-sm font-bold w-6 text-center text-gray-400 dark:text-gray-500">
                      {RANK_ICON[c.rank] ?? `#${c.rank}`}
                    </span>
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                    >
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tierColors[c.loyaltyTier]}`}
                        >
                          {c.loyaltyTier}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {c.totalVisits} visits
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {c.totalSpent}
                      </p>
                      {c.rank <= 3 && (
                        <p className="text-[10px] text-orange-500 font-medium flex items-center justify-end gap-0.5 mt-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> Top spender
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <button
                type="button"
                onClick={() => setShowViewAll(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}