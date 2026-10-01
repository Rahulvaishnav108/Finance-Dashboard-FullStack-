import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/kitchen', icon: 'dashboard', label: 'Overview', end: true },
  { to: '/kitchen/orders', icon: 'shopping_bag', label: 'Orders' },
  { to: '/kitchen/stations', icon: 'view_column', label: 'Stations' },
  { to: '/kitchen/inventory', icon: 'package_2', label: 'Inventory' },
  { to: '/kitchen/settings', icon: 'settings', label: 'More' },
];

export default function KitchenBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 pb-[env(safe-area-inset-bottom)] bg-white border-t border-slate-200 shadow-lg z-40">
      {NAV.map(({ to, icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 ${
              isActive ? 'text-orange-600' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'bg-orange-50 rounded-full px-4 py-1' : ''}`}
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
