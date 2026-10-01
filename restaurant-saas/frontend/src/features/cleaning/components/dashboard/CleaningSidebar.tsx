import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/cleaning', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/cleaning/tables', icon: 'table_restaurant', label: 'Tables' },
  { to: '/cleaning/requests', icon: 'notification_important', label: 'Requests' },
  { to: '/cleaning/tasks', icon: 'assignment', label: 'Tasks' },
  { to: '/cleaning/profile', icon: 'person', label: 'Profile' },
  { to: '/cleaning/settings', icon: 'settings', label: 'Settings' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}

export default function CleaningSidebar({ collapsed, onToggle, onItemClick }: Props) {
  return (
    <aside
      className={`flex flex-col h-screen fixed left-0 top-0 bg-white dark:bg-sd-surface-container border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-60 shadow-xl lg:shadow-none'
      }`}
    >
      {/* Header */}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-3 px-2' : 'items-center justify-between px-5'} py-5 border-b border-slate-100 dark:border-slate-800 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl shrink-0 text-white shadow-sm shadow-orange-500/20">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-base text-orange-500 dark:text-white leading-tight font-sans">CleanServe</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans">Staff Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu_open' : 'menu'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-1 px-3 py-4 overflow-y-auto sd-no-scrollbar">
        {NAV_ITEMS.map(({ to, icon, label, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center transition-all duration-200 font-sans text-sm font-semibold group ${
                isActive
                  ? 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              } ${
                collapsed
                  ? 'w-10 h-10 justify-center p-0 rounded-full mx-auto'
                  : 'justify-between px-4 py-2.5 rounded-xl'
              }`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <div className={collapsed ? 'flex items-center justify-center' : 'flex items-center gap-3'}>
                  <span
                    className={`material-symbols-outlined text-[20px] ${isActive ? 'text-orange-500 dark:text-white' : ''}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {icon}
                  </span>
                  <span className={isActive ? 'text-orange-500 dark:text-white' : ''}>{!collapsed && label}</span>
                </div>
                {!collapsed && badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-error text-on-error'
                  }`}>{badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Need Help Card (Hidden when collapsed) */}
      {!collapsed && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mx-3 mb-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-orange-500 dark:text-white">support_agent</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Need Help?</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-tight">
            Contact support for assistance.
          </p>
          <button className="w-full py-1.5 bg-white border border-slate-200 dark:border-slate-700 text-orange-500 font-bold rounded-lg text-xs hover:bg-orange-500/10 transition-all active:scale-95 cursor-pointer">
            Contact Support
          </button>
        </div>
      )}
    </aside>
  );
}