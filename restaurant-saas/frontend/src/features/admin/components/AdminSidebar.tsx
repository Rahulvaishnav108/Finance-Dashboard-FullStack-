import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, CalendarDays,
  Users, Package, UserCog, BarChart3, Settings,
  ArrowRight, Crown, LayoutGrid, Wallet, X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',           icon: LayoutDashboard, to: '/admin' },
  { label: 'Orders',              icon: ShoppingBag,     to: '/admin/orders' },
  { label: 'Menu Management',     icon: UtensilsCrossed, to: '/admin/menu' },
  { label: 'Reservations',        icon: CalendarDays,    to: '/admin/reservations' },
  { label: 'Customers',           icon: Users,           to: '/admin/customers' },
  { label: 'Inventory',           icon: Package,         to: '/admin/inventory' },
  { label: 'Staff Management',    icon: UserCog,         to: '/admin/staff' },
  { label: 'Reports & Analytics', icon: BarChart3,       to: '/admin/reports' },
  { label: 'Table Management',    icon: LayoutGrid,      to: '/admin/tables' },
  { label: 'Finance Dashboard',   icon: Wallet,          to: '/admin/finance' },
  { label: 'Settings',            icon: Settings,        to: '/admin/settings' },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}

export function AdminSidebar({ collapsed, onToggle, onItemClick }: AdminSidebarProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnameRef = useRef(location.pathname);

  // Close mobile drawer on route change
  useEffect(() => {
    if (pathnameRef.current === location.pathname) return;
    pathnameRef.current = location.pathname;
    onItemClick?.();
  }, [location.pathname, onItemClick]);

  // Close mobile drawer on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onItemClick?.();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onItemClick]);

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 flex flex-col bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        transition-all duration-300 h-screen
        ${collapsed ? 'w-[72px]' : 'w-64 shadow-xl lg:shadow-none'}
      `}
    >
      {/* Header */}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-3 px-2' : 'items-center justify-between px-4'} py-4 border-b border-gray-100 dark:border-gray-800 shrink-0`}>
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => {
            navigate('/admin');
            onItemClick?.();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin')}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-extrabold text-lg text-primary tracking-tight">RestoHub</span>}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hidden lg:flex items-center justify-center cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu_open' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile close button (visible only when expanded on mobile) */}
      {!collapsed && (
        <button
          onClick={onToggle}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      )}



      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => {
          const isActive = to === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-amber-50 dark:from-primary/20 dark:to-amber-950/30 border border-primary/15 dark:border-primary/30">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-2 shadow">
            <Crown className="w-[18px] h-[18px] text-white" />
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-0.5">Upgrade to Pro</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-snug">Unlock advanced features and grow your restaurant business.</p>
          <button
            onClick={() => {
              navigate('/admin/settings');
              onItemClick?.();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Upgrade Now <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </aside>
  );
}