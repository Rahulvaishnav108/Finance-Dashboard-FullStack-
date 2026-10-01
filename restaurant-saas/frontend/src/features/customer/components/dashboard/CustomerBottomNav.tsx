import React from 'react';
import { NavLink } from 'react-router-dom';

export default function CustomerBottomNav() {
  const navItems = [
    { to: '/customer/home', icon: 'home', label: 'Home' },
    { to: '/customer/menu', icon: 'restaurant_menu', label: 'Menu' },
    { to: '/customer/reservations', icon: 'event_seat', label: 'Book' },
    { to: '/customer/orders', icon: 'receipt_long', label: 'Orders' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex items-center h-16 px-2 pb-[env(safe-area-inset-bottom)] bg-sd-surface border-t border-sd-surface-variant shadow-lg z-40">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 ${
              isActive ? 'text-sd-primary' : 'text-sd-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                isActive ? 'bg-sd-primary-container/10' : 'bg-transparent'
              }`}>
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
              </div>
              <span className="text-[10px] font-semibold font-sans">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
