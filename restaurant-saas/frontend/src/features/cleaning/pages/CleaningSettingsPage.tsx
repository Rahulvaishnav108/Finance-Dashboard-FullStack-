import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../../../app/providers/ThemeProvider';

export default function CleaningSettingsPage() {
  const { theme, setTheme } = useTheme();

  // Notification toggles context controllers
  const [urgentAlerts, setUrgentAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-settings-urgentAlerts');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [taskReminders, setTaskReminders] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-settings-taskReminders');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [shiftAlerts, setShiftAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-settings-shiftAlerts');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Custom Language Dropdown layout trackers
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cleanserve-settings-language');
      return saved !== null ? saved : 'en';
    }
    return 'en';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('cleanserve-settings-urgentAlerts', String(urgentAlerts));
  }, [urgentAlerts]);

  useEffect(() => {
    localStorage.setItem('cleanserve-settings-taskReminders', String(taskReminders));
  }, [taskReminders]);

  useEffect(() => {
    localStorage.setItem('cleanserve-settings-shiftAlerts', String(shiftAlerts));
  }, [shiftAlerts]);

  useEffect(() => {
    localStorage.setItem('cleanserve-settings-language', selectedLanguage);
  }, [selectedLanguage]);

  const languages = [
    { code: 'en', label: 'English (US)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'es', label: 'Spanish (Español)' }
  ];

  const currentLanguageLabel = languages.find(l => l.code === selectedLanguage)?.label || 'English (US)';

  // Close custom dropdown node when clicking outside target boundaries safely
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn cleaning-panel">
      <div className="space-y-6">
        {/* Theme Toggles (Stitch style 3-way layout block) */}
        <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-150 font-sans mb-1">Display Theme</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 mb-4 leading-relaxed font-sans font-semibold">
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
                type="button"
                onClick={() => setTheme(item.id as ThemeMode)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border font-sans text-xs font-bold transition-all gap-2 hover:shadow-soft cursor-pointer ${
                  theme === item.id
                    ? 'border-orange-500 bg-orange-500/10 text-orange-500 dark:bg-slate-850 dark:text-white dark:border-slate-600'
                    : 'border-slate-105 dark:border-slate-700 text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800/40 dark:text-slate-405'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Settings Preferences */}
        <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-855 dark:text-slate-150 font-sans mb-4">Notification Preferences</h2>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Urgent Cleaning Tickets</p>
                <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-0.5">Vibrate or play audio alert when high priority requests are raised.</p>
              </div>
              <button
                type="button"
                onClick={() => setUrgentAlerts(!urgentAlerts)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  urgentAlerts ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  urgentAlerts ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Routine Task Reminders</p>
                <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-0.5">Alert immediately when routine sanitization checks are near schedule due times.</p>
              </div>
              <button
                type="button"
                onClick={() => setTaskReminders(!taskReminders)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  taskReminders ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  taskReminders ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Shift Assignments & Announcements</p>
                <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-0.5">Receive shift changes, zoning assignment notices or supervisor announcements.</p>
              </div>
              <button
                type="button"
                onClick={() => setShiftAlerts(!shiftAlerts)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  shiftAlerts ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  shiftAlerts ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selection Custom Options Dropdown */}
        <div className="bg-white dark:bg-sd-surface-container border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-150 font-sans mb-4">Preferred Language</h2>

          <div className="relative w-full md:w-64" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full text-xs font-sans font-bold p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-250 flex items-center justify-between outline-none transition-all cursor-pointer ${
                isDropdownOpen ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-500/40 dark:border-slate-700'
              }`}
            >
              <span>{currentLanguageLabel}</span>
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'}`}>
                keyboard_arrow_down
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-full bg-white dark:bg-slate-800 border border-orange-500/30 rounded-xl shadow-lg z-50 overflow-hidden font-sans text-xs animate-fadeIn">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 transition-colors font-bold flex items-center justify-between cursor-pointer ${
                      selectedLanguage === lang.code
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-orange-500/10 hover:text-orange-500 dark:hover:bg-orange-500/20 dark:hover:text-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {selectedLanguage === lang.code && (
                      <span className="material-symbols-outlined text-sm text-white">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}