import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ title, value, change, icon: Icon, iconBg, iconColor }: StatCardProps) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-snug">{title}</p>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{value}</p>
      <div className="flex items-center gap-1">
        <TrendingUp className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
        <span className={`text-[11px] sm:text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{change}</span>
      </div>
    </div>
  );
}