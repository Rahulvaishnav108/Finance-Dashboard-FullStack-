import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStaffProfile } from '../../hooks/useStaffProfile';
import { useStaffDashboard } from '../../hooks/useStaffDashboard';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}

export default function StaffSidebar({ collapsed, onToggle, onItemClick }: Props) {
  const { profile } = useStaffProfile();
  const { orders, readyItems, requests, alerts } = useStaffDashboard();

  const activeOrdersCount = orders.filter(o => ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)).length;
  const readyCount = readyItems.length;
  const requestsCount = requests.filter(r => r.status !== 'Resolved').length;
  const alertsCount = alerts.length;

  const navItems = [
    { to: '/staff', icon: 'dashboard', label: 'Dashboard', end: true },
    { to: '/staff/tables', icon: 'table_restaurant', label: 'Tables' },
    { to: '/staff/orders', icon: 'receipt_long', label: 'Orders', badge: activeOrdersCount },
    { to: '/staff/food-ready', icon: 'restaurant', label: 'Food Ready', badge: readyCount },
    { to: '/staff/requests', icon: 'notifications_active', label: 'Requests', badge: requestsCount },
    { to: '/staff/reservations', icon: 'book_online', label: 'Reservations & Queue' },
    { to: '/staff/table-turnover', icon: 'hourglass_empty', label: 'Table Turnover' },
    { to: '/staff/menu', icon: 'menu_book', label: 'Menu' },
    { to: '/staff/reports', icon: 'bar_chart', label: 'Reports' },
    { to: '/staff/alerts', icon: 'warning', label: 'Alerts', badge: alertsCount },
    { to: '/staff/profile', icon: 'person', label: 'Profile' },
    { to: '/staff/settings', icon: 'settings', label: 'Settings' },
  ];
  return (
    <aside
      className={`flex flex-col h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64 shadow-xl lg:shadow-none'
      }`}
    >
      {/* Header */}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-3 px-2' : 'items-center justify-between px-6'} py-5 border-b border-slate-100 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="bg-dine-orange p-2 rounded-xl shrink-0 text-white shadow-sm shadow-dine-orange/20">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg text-slate-800 leading-tight font-sans dark:text-white">DineEase</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans">Staff Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-sd-surface-variant rounded-lg transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu_open' : 'menu'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto sd-no-scrollbar">
        {navItems.map(({ to, icon, label, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center transition-all duration-200 font-sans text-sm font-semibold group ${
                isActive
                  ? 'bg-dine-light-orange dark:bg-dine-orange/20 text-dine-orange'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              } ${
                collapsed
                  ? 'w-10 h-10 justify-center p-0 rounded-full mx-auto'
                  : 'justify-between px-4 py-2.5 rounded-xl' + (isActive ? ' border-r-[3px] border-dine-orange !rounded-r-none' : '')
              }`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <div className={collapsed ? 'flex items-center justify-center' : 'flex items-center gap-3'}>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {icon}
                  </span>
                  {!collapsed && <span>{label}</span>}
                </div>
                {!collapsed && badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                    isActive
                      ? 'bg-dine-orange text-white'
                      : 'bg-orange-100 text-dine-orange dark:bg-orange-950/40 dark:text-orange-400'
                  }`}>{badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Current Shift Section */}
      {!collapsed && (
        <div className="mx-3 mb-2 space-y-3">
          <div className="bg-slate-50 dark:bg-sd-surface-container border border-slate-100 dark:border-sd-outline-variant/40 p-3 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 font-sans">Active Section</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs font-sans dark:text-slate-350">Zone A (Tables 1-8)</span>
              <span className="text-[10px] bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 px-2 py-0.5 rounded-full font-bold font-sans">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile Card */}
      <div className="border-t border-slate-100 dark:border-sd-outline-variant/40 px-3 py-3 shrink-0">
        <div className={`bg-slate-50 dark:bg-sd-surface-container rounded-2xl border border-slate-100 dark:border-sd-outline-variant/40 flex items-center gap-3 ${collapsed ? 'p-2 justify-center' : 'p-3'}`}>
          <div className="w-10 h-10 rounded-full bg-dine-orange/15 flex items-center justify-center shrink-0 text-dine-orange font-bold text-sm overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate font-sans text-slate-800 dark:text-slate-200">{profile.name}</p>
              <p className="text-[10px] text-slate-400 font-sans">{profile.role}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase font-sans">{profile.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
