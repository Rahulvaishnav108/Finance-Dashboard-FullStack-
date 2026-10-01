import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useReportsStore } from '../../store/reports.store';

// ── Daily Summary Table ───────────────────────────────────────────────────

export function DailySummary(): JSX.Element {
  const { getDailySummary, globalRange } = useReportsStore();
  const dailySummary = getDailySummary();

  const periodLabel =
    globalRange === 'Daily'  ? 'Daily Summary'   :
    globalRange === 'Weekly' ? 'Weekly Summary'  :
    'Monthly Summary';

  const cols = [
    globalRange === 'Daily'  ? 'Date'  :
    globalRange === 'Weekly' ? 'Week'  : 'Month',
    'Revenue', 'Orders', 'Customers', 'Avg. Order Value', 'Repeat Customers', 'Net Profit',
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{periodLabel}</h3>
        <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
          {globalRange} view
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 sm:px-4 py-2.5 whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dailySummary.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-3 sm:px-4 py-3 text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{row.date}</td>
                <td className="px-3 sm:px-4 py-3 text-xs font-bold text-gray-900 dark:text-gray-100">{row.revenue}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{row.orders.toLocaleString()}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{row.customers.toLocaleString()}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{row.avgOrderValue}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{row.repeatCustomers.toLocaleString()}</td>
                <td className="px-3 sm:px-4 py-3 text-xs font-semibold text-green-600 dark:text-green-400">{row.netProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Insights Panel ────────────────────────────────────────────────────────

export function InsightsPanel(): JSX.Element {
  const { insights } = useReportsStore();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">✨</span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Insights</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins) => (
          <div key={ins.id} className={`flex items-start gap-3 p-3 rounded-xl border ${ins.color}`}>
            <span className="text-xl flex-shrink-0 mt-0.5">{ins.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug">{ins.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ins.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Report Shortcuts (sidebar) ────────────────────────────────────────────

const ALL_REPORTS = [
  { id: 'r1', label: 'Sales Summary',      icon: '📊', desc: 'Revenue, orders & profit overview' },
  { id: 'r2', label: 'Orders Report',       icon: '📦', desc: 'Order volume, status & trends' },
  { id: 'r3', label: 'Menu Performance',    icon: '🍽️',  desc: 'Best & worst performing items' },
  { id: 'r4', label: 'Inventory Report',    icon: '🗄️',  desc: 'Stock levels & reorder alerts' },
  { id: 'r5', label: 'Staff Performance',   icon: '👥', desc: 'Hours, efficiency & tips' },
  { id: 'r6', label: 'Customer Analytics',  icon: '🧑‍🤝‍🧑', desc: 'Loyalty, retention & demographics' },
  { id: 'r7', label: 'Revenue by Table',    icon: '🪑', desc: 'Per-table revenue & turnover' },
  { id: 'r8', label: 'Channel Performance', icon: '📡', desc: 'Dine-in, delivery & online breakdown' },
];

export function ReportShortcuts(): JSX.Element {
  const { shortcuts } = useReportsStore();
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">📋</span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Report Shortcuts</h3>
      </div>

      {!showAll ? (
        <>
          <div className="space-y-1">
            {shortcuts.map((s) => (
              <button
                key={s.id}
                className="w-full text-left text-xs text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 px-2 rounded-lg hover:bg-orange-100/60 dark:hover:bg-orange-900/30 transition-colors font-medium"
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="w-full flex items-center gap-1 text-xs text-orange-500 font-semibold mt-2 px-2 py-1.5 hover:text-orange-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            View All Reports
          </button>
        </>
      ) : (
        <AllReportsModal onClose={() => setShowAll(false)} />
      )}
    </div>
  );
}

// ── All Reports Modal Overlay ─────────────────────────────────────────────

function AllReportsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">All Reports</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="p-3 grid grid-cols-1 gap-1 max-h-80 sm:max-h-96 overflow-y-auto">
          {ALL_REPORTS.map((rep) => (
            <button
              key={rep.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors group"
            >
              <span className="text-xl w-8 text-center flex-shrink-0">{rep.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {rep.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{rep.desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}