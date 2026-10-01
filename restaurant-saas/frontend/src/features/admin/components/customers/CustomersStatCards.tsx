import React from 'react';
import { Users, Star, Activity, IndianRupee, type LucideIcon } from 'lucide-react';
import { useCustomersStore } from '../../store/customers.store';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className={`text-[11px] sm:text-xs mt-0.5 truncate ${subColor ?? 'text-gray-400 dark:text-gray-500'}`}>
          {sub}
        </p>
      </div>
    </div>
  );
}

export function CustomersStatCards() {
  const { stats } = useCustomersStore();

  const cards: StatCardProps[] = [
    {
      icon: Users,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      iconColor: 'text-orange-500',
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      sub: `↑ ${stats.totalCustomersChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: Star,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-500',
      label: 'Loyal Customers',
      value: stats.loyalCustomers.toLocaleString('en-IN'),
      sub: `↑ ${stats.loyalCustomersChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: Activity,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-500',
      label: 'Total Visits',
      value: stats.totalVisits.toLocaleString('en-IN'),
      sub: `↑ ${stats.totalVisitsChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: IndianRupee,
      iconBg: 'bg-green-50 dark:bg-green-950/40',
      iconColor: 'text-green-500',
      label: 'Total Spent',
      value: stats.totalSpent,
      sub: `↑ ${stats.totalSpentChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}