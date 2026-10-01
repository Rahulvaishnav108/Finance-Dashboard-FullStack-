// components/Restaurants/MetricCards.tsx
// Responsive metric cards with improved mobile layout

import { useEffect, useState } from "react";
import { SlidersHorizontal, TrendingUp } from "lucide-react";
import type { StatusFilter } from "./Restauranttypes";

interface Metrics {
  total: number;
  active: number;
  trial: number;
  branches: number;
}

interface MetricCardsProps {
  metrics: Metrics;
  statusFilter: StatusFilter;
  darkMode: boolean;
  onFilterChange: (filter: StatusFilter) => void;
}

const cardClasses = (isActive: boolean, color: string, darkMode: boolean) => {
  const baseClasses = `text-left rounded-xl p-4 sm:p-5 border transition-all duration-200 group relative overflow-hidden cursor-pointer`;

  if (isActive) {
    return `${baseClasses} border-${color}-500 ring-2 ring-${color}-500/20 bg-${color}-500/5 shadow-lg`;
  }

  return `${baseClasses} ${
    darkMode
      ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
      : "bg-white border-slate-200/80 hover:shadow-md"
  }`;
};

interface CardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: React.ElementType;
  filter: StatusFilter;
  color: string;
  isActive: boolean;
  darkMode: boolean;
  onFilterChange: (filter: StatusFilter) => void;
}

function Card({
  title,
  value,
  subtitle,
  icon: Icon,
  filter,
  color,
  isActive,
  darkMode,
  onFilterChange,
}: CardProps) {
  return (
    <button
      type="button"
      onClick={() => onFilterChange(filter)}
      className={cardClasses(isActive, color, darkMode)}
    >
      <p
        className={`text-xs font-semibold ${
          darkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {title}
      </p>
      <h3
        className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 ${
          isActive
            ? `text-${color}-500`
            : darkMode
            ? "text-slate-100"
            : "text-slate-900"
        }`}
      >
        {value}
      </h3>
      {subtitle && (
        <span
          className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${
            isActive
              ? `text-${color}-500/80`
              : darkMode
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          {Icon && <Icon size={12} />}
          {subtitle}
        </span>
      )}
      {Icon && !subtitle && (
        <div
          className={`absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <Icon size={40} />
        </div>
      )}
    </button>
  );
}

export default function MetricCards({
  metrics,
  statusFilter,
  darkMode,
  onFilterChange,
}: MetricCardsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile layout - 2 columns
  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card
          title="Total"
          value={metrics.total}
          filter="All"
          color="orange"
          isActive={statusFilter === "All"}
          icon={SlidersHorizontal}
          darkMode={darkMode}
          onFilterChange={onFilterChange}
        />
        <Card
          title="Active"
          value={metrics.active}
          subtitle="Live"
          filter="Active"
          color="emerald"
          isActive={statusFilter === "Active"}
          icon={TrendingUp}
          darkMode={darkMode}
          onFilterChange={onFilterChange}
        />
        <Card
          title="Trial"
          value={metrics.trial}
          subtitle="Convert"
          filter="Trial"
          color="orange"
          isActive={statusFilter === "Trial"}
          darkMode={darkMode}
          onFilterChange={onFilterChange}
        />
        <Card
          title="Branches"
          value={metrics.branches}
          subtitle="Regional"
          filter="All"
          color="blue"
          isActive={false}
          darkMode={darkMode}
          onFilterChange={onFilterChange}
        />
      </div>
    );
  }

  // Desktop layout - 4 columns
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <Card
        title="Total Restaurants"
        value={metrics.total}
        filter="All"
        color="orange"
        isActive={statusFilter === "All"}
        icon={SlidersHorizontal}
        darkMode={darkMode}
        onFilterChange={onFilterChange}
      />
      <Card
        title="Active Status"
        value={metrics.active}
        subtitle="Live Processing"
        filter="Active"
        color="emerald"
        isActive={statusFilter === "Active"}
        icon={TrendingUp}
        darkMode={darkMode}
        onFilterChange={onFilterChange}
      />
      <Card
        title="Trial Mode Window"
        value={metrics.trial}
        subtitle="Requires conversion pipeline"
        filter="Trial"
        color="orange"
        isActive={statusFilter === "Trial"}
        darkMode={darkMode}
        onFilterChange={onFilterChange}
      />
      <div
        className={`rounded-xl p-5 border transition-all ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200/80"
        }`}
      >
        <p
          className={`text-xs font-semibold ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Aggregated Branches
        </p>
        <h3 className="text-3xl font-extrabold tracking-tight mt-2 text-blue-500">
          {metrics.branches}
        </h3>
        <span
          className={`text-[10px] font-medium block mt-1 ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Cross-regional footprint
        </span>
      </div>
    </div>
  );
}