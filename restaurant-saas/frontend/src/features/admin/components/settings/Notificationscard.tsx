import React from 'react';
import { Bell } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

export function NotificationsCard(): JSX.Element {
  const { notifications, toggleNotification } = useSettingsStore();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0">
          <Bell className="w-[18px] h-[18px] text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Notification Preferences</h3>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{n.description}</p>
            </div>
            <Toggle enabled={n.enabled} onChange={() => toggleNotification(n.id)} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
          Manage Notifications
        </button>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-checked={enabled}
      role="switch"
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 ${
        enabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}