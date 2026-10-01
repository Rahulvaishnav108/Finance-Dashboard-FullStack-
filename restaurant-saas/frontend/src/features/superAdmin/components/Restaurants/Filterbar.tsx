// components/Restaurants/FilterBar.tsx
// Responsive filter bar that adapts to mobile and desktop screens

import { useState, useEffect } from "react";
import { Search, X, RefreshCcw, Plus } from "lucide-react";
import type { StatusFilter } from "./Restauranttypes";

interface FilterBarProps {
  searchQuery: string;
  statusFilter: StatusFilter;
  darkMode: boolean;
  onSearchChange: (value: string) => void;
  onResetFilter: () => void;
  onAddClick: () => void;
}

export default function FilterBar({
  searchQuery,
  statusFilter,
  darkMode,
  onSearchChange,
  onResetFilter,
  onAddClick,
}: FilterBarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile layout - stacked
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 mb-6">
        {/* Search input */}
        <div className="relative w-full">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search restaurants..."
            className={`w-full h-10 pl-11 pr-10 rounded-lg text-sm outline-none border transition-all ${
              darkMode
                ? "bg-slate-900/50 border-slate-800 text-slate-100 focus:border-orange-500 placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-800 focus:border-orange-500 placeholder:text-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter badge and buttons */}
        <div className="flex gap-2 items-center">
          {statusFilter && statusFilter !== "All" && (
            <button
              type="button"
              onClick={onResetFilter}
              className="flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors whitespace-nowrap"
            >
              <span>{statusFilter}</span>
              <RefreshCcw size={11} />
            </button>
          )}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 h-10 px-3 text-xs font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10 flex-1 ml-auto"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout - horizontal
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex flex-1 items-center gap-4 w-full max-w-lg">
        <div className="relative w-full">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Live search by typing keywords..."
            className={`w-full h-11 pl-11 pr-10 rounded-xl text-sm outline-none border transition-all ${
              darkMode
                ? "bg-slate-900/50 border-slate-800 text-slate-100 focus:border-orange-500 placeholder:text-slate-500"
                : "bg-white border-slate-200 text-slate-800 focus:border-orange-500 placeholder:text-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {statusFilter && statusFilter !== "All" && (
          <button
            type="button"
            onClick={onResetFilter}
            className="flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors"
          >
            <span>Showing state: {statusFilter}</span>
            <RefreshCcw size={12} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center justify-center gap-2 h-11 px-5 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10 w-full sm:w-auto"
      >
        <Plus size={16} />
        <span>Add Restaurant</span>
      </button>
    </div>
  );
}