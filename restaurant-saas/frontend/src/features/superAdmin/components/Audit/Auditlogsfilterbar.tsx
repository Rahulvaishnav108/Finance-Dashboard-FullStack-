import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { LogType } from "../../store/AuditLogs";
const FILTER_OPTIONS = ['All', 'Admin', 'Restaurant', 'Subscription'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

interface AuditLogsFilterBarProps {
  darkMode: boolean;
  searchTerm: string;
  selectedType: LogType | 'All';
  onSearchChange: (value: string) => void;
  onTypeChange: (type: LogType | 'All') => void;
}

export default function AuditLogsFilterBar({
  darkMode,
  searchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
}: AuditLogsFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 items-stretch sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search logs by action, user, or entity..."
          className={`w-full pl-12 pr-10 py-3 rounded-2xl border shadow-sm outline-none text-sm transition-colors ${
            darkMode
              ? 'bg-slate-900 border-slate-800 focus:ring-orange-500/20 focus:border-orange-500 text-slate-100'
              : 'bg-white border-slate-200/80 focus:ring-orange-500/20 focus:border-orange-500'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Type Filter Buttons */}
      <div
        className={`flex p-1.5 rounded-2xl border gap-1 h-12 sm:h-14 items-center overflow-x-auto ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5 text-slate-400 ml-2 mr-1 shrink-0" />
        <div className="flex gap-1">
          {FILTER_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type as FilterOption)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                selectedType === type
                  ? darkMode
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-slate-100 text-slate-800 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}