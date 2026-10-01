import React from 'react';
import { Users } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function TeamCard(): JSX.Element {
  const { team } = useSettingsStore();

  const rows = [
    { label: 'Total Team Members', value: team.totalMembers, bold: true },
    { label: 'Administrators',     value: team.administrators },
    { label: 'Managers',           value: team.managers },
    { label: 'Staff Members',      value: team.staffMembers },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5">Team &amp; Permissions</h3>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-amber-500 dark:text-amber-400" />
        </div>

        {/* Stats */}
        <div className="flex-1 w-full space-y-2.5">
          {rows.map(({ label, value, bold }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className={`text-sm ${bold ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                {label}
              </span>
              <span className={`text-sm ${bold ? 'font-bold text-gray-900 dark:text-gray-50' : 'text-gray-700 dark:text-gray-300'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
          Manage Team
        </button>
      </div>
    </div>
  );
}