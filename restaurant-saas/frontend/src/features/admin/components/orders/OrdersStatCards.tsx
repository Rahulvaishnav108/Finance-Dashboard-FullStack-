import React from 'react';
import { ShoppingBag, Clock, CheckCircle, IndianRupee, TrendingUp, LucideIcon } from 'lucide-react';
import { useOrdersStore } from '../../store/orders.store';

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4">
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

export function OrdersStatCards() {
  const { stats } = useOrdersStore();

  const cards: StatCardProps[] = [
    {
      icon: ShoppingBag,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      iconColor: 'text-orange-500',
      label: 'Total Orders',
      value: String(stats.totalOrders),
      sub: `↑ ${stats.totalOrdersChange} vs yesterday`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: Clock,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-500',
      label: 'Pending',
      value: String(stats.pending),
      sub: 'Needs attention',
      subColor: 'text-orange-500 dark:text-orange-400 text-xs',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-green-50 dark:bg-green-950/40',
      iconColor: 'text-green-500',
      label: 'Completed',
      value: String(stats.completed),
      sub: '↑ 8.3% vs yesterday',
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: IndianRupee,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-purple-500',
      label: 'Total Revenue',
      value: stats.totalRevenue,
      sub: `↑ ${stats.totalRevenueChange} vs yesterday`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-500',
      label: 'Avg. Order Value',
      value: stats.avgOrderValue,
      sub: `↑ ${stats.avgOrderValueChange} vs yesterday`,
      subColor: 'text-green-600 dark:text-green-400 text-xs font-medium',
    },
  ];

  return (
    /* 2 cols on mobile → 3 on md → 5 on xl */
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {/* Last card spans 2 cols on mobile so it doesn't sit alone */}
      {cards.map((card, i) => (
        <div key={card.label} className={i === 4 ? 'col-span-2 md:col-span-1' : ''}>
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
}