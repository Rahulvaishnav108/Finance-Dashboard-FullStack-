import React from 'react';
import { Package, IndianRupee, AlertTriangle, PackageX, CalendarClock, type LucideIcon } from 'lucide-react';
import { useInventoryStore } from '../../store/inventory.store';

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className={`text-xs mt-0.5 truncate ${subColor ?? 'text-gray-400 dark:text-gray-500'}`}>{sub}</p>
      </div>
    </div>
  );
}

export function InventoryStatCards() {
  const { stats } = useInventoryStore();

  const cards: StatCardProps[] = [
    {
      icon: Package,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      iconColor: 'text-orange-500',
      label: 'Total Items',
      value: stats.totalItems.toLocaleString('en-IN'),
      sub: `↑ ${stats.totalItemsChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: IndianRupee,
      iconBg: 'bg-green-50 dark:bg-green-950/40',
      iconColor: 'text-green-500',
      label: 'Total Inventory Value',
      value: stats.totalValue,
      sub: `↑ ${stats.totalValueChange} vs last month`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-500',
      label: 'Low Stock Items',
      value: String(stats.lowStockItems),
      sub: `${stats.lowStockChange} vs last month`,
      subColor: 'text-red-500 dark:text-red-400 text-xs font-medium',
    },
    {
      icon: PackageX,
      iconBg: 'bg-red-50 dark:bg-red-950/40',
      iconColor: 'text-red-500',
      label: 'Out of Stock Items',
      value: String(stats.outOfStockItems),
      sub: `${stats.outOfStockChange} vs last month`,
      subColor: 'text-red-500 dark:text-red-400 text-xs font-medium',
    },
    {
      icon: CalendarClock,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-purple-500',
      label: 'Expiring Soon',
      value: String(stats.expiringSoon),
      sub: 'Within 7 days',
      subColor: 'text-amber-500 dark:text-amber-400 text-xs',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}