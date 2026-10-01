import React from 'react';
import { TrendingUp, ShoppingBag, Users, Clock } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TableOverview } from '../components/dashboard/TableOverview';
import { TopMenuItems } from '../components/dashboard/TopMenuItems';

const AdminDashboard = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{"Welcome back, Debesh! Here's what's happening today."}</p>
      </div>

      {/* Stat cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Revenue"     value="₹48,200" change="+12% from yesterday" changeType="increase" icon={TrendingUp} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <StatCard title="Orders Today"      value="142"     change="+8 in last hour"     changeType="increase" icon={ShoppingBag} iconBg="bg-blue-50"   iconColor="text-blue-500"   />
        <StatCard title="Active Customers"  value="67"      change="12 tables occupied"  changeType="neutral"  icon={Users}      iconBg="bg-green-50"  iconColor="text-green-500"  />
        <StatCard title="Avg Order Time"    value="18 min"  change="-2 min vs last week" changeType="increase" icon={Clock}      iconBg="bg-purple-50" iconColor="text-purple-500" />
      </div>

      {/* Revenue chart + Activity feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="xl:col-span-2"><RevenueChart /></div>
        <div><ActivityFeed /></div>
      </div>

      <TableOverview />

      {/* Recent orders + Top items */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="xl:col-span-2"><RecentOrdersTable /></div>
        <div><TopMenuItems /></div>
      </div>
    </div>
  );
};

export default AdminDashboard;