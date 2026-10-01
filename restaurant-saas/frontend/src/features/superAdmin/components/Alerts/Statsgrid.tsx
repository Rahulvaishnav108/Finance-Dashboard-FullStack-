// components/StatsGrid.tsx
import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cx } from '../../utils/Alertutils';
interface StatItem {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
  bgDark: string;
  bgLight: string;
  pulse?: boolean;
}

interface StatsGridProps {
  stats: {
    total: number;
    new: number;
    critical: number;
    warning: number;
    info: number;
    resolved: number;
  };
  darkMode: boolean;
}

export default function StatsGrid({ stats, darkMode }: StatsGridProps) {
  const items: StatItem[] = [
    {
      label: 'Total',
      count: stats.total,
      icon: Bell,
      color: darkMode ? 'text-slate-300' : 'text-slate-600',
      bgDark: 'bg-slate-800/60',
      bgLight: 'bg-slate-100',
    },
    {
      label: 'New',
      count: stats.new,
      icon: Bell,
      color: 'text-orange-500',
      bgDark: 'bg-orange-500/15',
      bgLight: 'bg-orange-50',
      pulse: stats.new > 0,
    },
    {
      label: 'Critical',
      count: stats.critical,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgDark: 'bg-red-500/15',
      bgLight: 'bg-red-50',
    },
    {
      label: 'Warnings',
      count: stats.warning,
      icon: AlertCircle,
      color: 'text-amber-500',
      bgDark: 'bg-amber-500/15',
      bgLight: 'bg-amber-50',
    },
    {
      label: 'Info',
      count: stats.info,
      icon: Info,
      color: 'text-blue-500',
      bgDark: 'bg-blue-500/15',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Resolved',
      count: stats.resolved,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgDark: 'bg-green-500/15',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={cx(
              'relative p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5',
              darkMode
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/60'
                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            )}
          >
            {item.pulse && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
            <div className={cx(
              'w-8 h-8 rounded-xl flex items-center justify-center mb-3',
              darkMode ? item.bgDark : item.bgLight
            )}>
              <Icon className={cx('w-4 h-4', item.color)} />
            </div>
            <p className={cx(
              'text-2xl font-black tabular-nums leading-none mb-1',
              item.color
            )}>
              {item.count}
            </p>
            <p className={cx(
              'text-[10px] font-semibold uppercase tracking-widest',
              darkMode ? 'text-slate-500' : 'text-gray-400'
            )}>
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}