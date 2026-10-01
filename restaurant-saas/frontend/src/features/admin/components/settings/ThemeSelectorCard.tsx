import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../../../app/providers/ThemeProvider';

export function ThemeSelectorCard(): JSX.Element {
  const { theme, setTheme } = useTheme();

  const options: { value: ThemeMode; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      value: 'light',
      label: 'Light Mode',
      description: 'Clean light background with high contrast text.',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      description: 'Charcoal and black colors that reduce eye strain.',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System Theme',
      description: 'Automatically matches your device preferences.',
      icon: Monitor,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 w-full">
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2">Theme Preferences</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Select your preferred application display mode. This setting will be stored in your browser local storage.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map(({ value, label, description, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all outline-none ${
                isActive
                  ? 'border-orange-500 bg-orange-50/20 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm ${
                isActive ? 'bg-orange-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold mb-1">{label}</span>
              <span className="text-[11px] leading-tight opacity-75">{description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
