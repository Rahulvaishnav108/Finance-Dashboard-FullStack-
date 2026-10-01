import React from 'react';
import {
  User, Store, CreditCard, Users, Bell,
  Plug, Shield, HardDrive, Settings2,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';

const sections = [
  { id: 'profile',        label: 'Profile Settings',        icon: User },
  { id: 'restaurant',     label: 'Restaurant Information',  icon: Store },
  { id: 'billing',        label: 'Billing & Subscription',  icon: CreditCard },
  { id: 'team',           label: 'Team & Permissions',      icon: Users },
  { id: 'notifications',  label: 'Notification Preferences',icon: Bell },
  { id: 'integrations',   label: 'Integrations',            icon: Plug },
  { id: 'security',       label: 'Security',                icon: Shield },
  { id: 'backup',         label: 'Backup & Export',         icon: HardDrive },
  { id: 'system',         label: 'System Preferences',      icon: Settings2 },
];

export function SettingsSidebar(): JSX.Element {
  const { activeSection, setActiveSection } = useSettingsStore();

  return (
    <nav className="w-full lg:w-56 flex-shrink-0">
      <ul className="flex lg:flex-col gap-1 lg:gap-0.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <li key={id} className="flex-shrink-0 lg:flex-shrink lg:w-full">
              <button
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:w-full lg:whitespace-normal ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                <span className="lg:truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Help */}
      <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Need help?</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Visit our help center or contact support.
        </p>
        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 flex items-center gap-1 transition-colors">
          Go to Help Center →
        </button>
      </div>
    </nav>
  );
}