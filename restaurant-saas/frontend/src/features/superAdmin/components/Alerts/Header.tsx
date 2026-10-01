// components/Header.tsx
import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { cx } from '../../utils/Alertutils';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  newCount: number;
}

export default function Header({ darkMode, toggleTheme, newCount }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-none">
            Alerts
          </h1>
          {newCount > 0 && (
            <span className="bg-[#ff5a1f] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md shadow-orange-500/30 animate-pulse">
              {newCount} new
            </span>
          )}
        </div>
        <p className={cx('text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500')}>
          Monitor system alerts and performance issues
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className={cx(
            'w-10 h-10 rounded-xl flex items-center justify-center border transition-all',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
          )}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="flex items-center gap-2 bg-[#ff5a1f] hover:bg-[#e04d1a] shadow-lg shadow-orange-500/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0">
          <Bell className="w-4 h-4" />
          Configure Alerts
        </button>
      </div>
    </div>
  );
}