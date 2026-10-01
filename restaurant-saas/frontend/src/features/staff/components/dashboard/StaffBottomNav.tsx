import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/staff', icon: 'dashboard', label: 'Overview', end: true },
  { to: '/staff/tables', icon: 'table_restaurant', label: 'Tables' },
  { to: '/staff/orders', icon: 'receipt_long', label: 'Orders' },
  { to: '/staff/food-ready', icon: 'restaurant', label: 'Food Ready' },
  { to: '/staff/settings', icon: 'settings', label: 'More' },
];

export default function StaffBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 pb-[env(safe-area-inset-bottom)] bg-white dark:bg-sd-surface-container border-t border-slate-200 dark:border-sd-outline-variant/40 shadow-lg z-40">
      {NAV.map(({ to, icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 ${
              isActive ? 'text-dine-orange' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'bg-orange-50 dark:bg-orange-950/40 rounded-full px-4 py-1' : ''}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-semibold font-sans">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
