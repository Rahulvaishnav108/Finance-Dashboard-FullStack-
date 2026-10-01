import React from 'react';
import { useTheme, ThemeMode } from '../../../app/providers/ThemeProvider';

export default function StaffSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Settings</h1>
        <p className="text-sm text-slate-550 mt-0.5">Customize preferences, theme, and profile settings.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Toggles (Stitch style 3-way) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-805 dark:text-slate-200 font-sans mb-1">Display Theme</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mb-4 leading-relaxed font-sans">
            Choose light or dark mode, or match your device&apos;s system appearance.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light Mode', icon: 'light_mode' },
              { id: 'dark', label: 'Dark Mode', icon: 'dark_mode' },
              { id: 'system', label: 'System Theme', icon: 'desktop_windows' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as ThemeMode)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border font-sans text-xs font-bold transition-all gap-2 hover:shadow-soft ${
                  theme === item.id
                    ? 'border-dine-orange bg-dine-light-orange/30 text-dine-orange dark:bg-orange-950/20'
                    : 'border-slate-100 text-slate-500 hover:text-slate-700 bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 font-sans mb-4">Notification Preferences</h2>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Customer Assistance Calls</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Vibrate or sound when a guest calls the waiter.</p>
              </div>
              <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-dine-orange">
                <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out translate-x-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Food Ready Notifications</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Alert immediately when food items are ready at stations.</p>
              </div>
              <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-dine-orange">
                <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out translate-x-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">System Warnings & Alerts</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Receive shift reassignments or high delay warnings.</p>
              </div>
              <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-dine-orange">
                <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out translate-x-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-805 dark:text-slate-200 font-sans mb-4">Preferred Language</h2>
          <select className="w-full md:w-64 text-xs font-sans p-2.5 border border-slate-100 rounded-xl bg-slate-50">
            <option value="en">English (US)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="es">Spanish (Español)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
