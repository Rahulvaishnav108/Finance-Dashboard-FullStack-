import React from 'react';
import { NavLink } from 'react-router-dom';
import { useKitchenStore } from '../../store/kitchen.store';
import { useAuth } from '../../../../auth/AuthProvider';

const NAV_ITEMS = [
  { to: '/kitchen', icon: 'dashboard', label: 'Overview', end: true },
  { to: '/kitchen/orders', icon: 'shopping_bag', label: 'Orders', badge: 24 },
  { to: '/kitchen/batch-cooking', icon: 'inventory_2', label: 'Batch Cooking' },
  { to: '/kitchen/inventory', icon: 'package_2', label: 'Inventory' },
  { to: '/kitchen/stations', icon: 'view_column', label: 'Kitchen Stations' },
  { to: '/kitchen/staff', icon: 'group', label: 'Staff' },
  { to: '/kitchen/analytics', icon: 'bar_chart', label: 'Analytics' },
  { to: '/kitchen/reports', icon: 'description', label: 'Reports' },
  { to: '/kitchen/settings', icon: 'settings', label: 'Settings' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
  onProfileClick: () => void;
}

export default function KitchenSidebar({ collapsed, onToggle, onItemClick, onProfileClick }: Props) {
  const { profile } = useKitchenStore();
  const { user } = useAuth();
  const internalRole = user?.internal_role;

  const filteredNavItems = NAV_ITEMS.filter(({ to }) => {
    if (internalRole === 'CHEF' && (to === '/kitchen/staff' || to === '/kitchen/analytics')) {
      return false;
    }
    return true;
  });

  const getInitials = (fullName: string) => {
    if (!fullName) return 'CH';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={`flex flex-col h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64 shadow-xl lg:shadow-none'
      }`}
    >
      {/* Header */}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-4 px-2' : 'items-center justify-between px-6'} py-5 border-b border-slate-100 shrink-0`}>
        <div className={collapsed ? 'flex flex-col items-center justify-center' : 'flex items-center gap-3'}>
          <div className="bg-orange-500 dark:bg-orange-600 p-2.5 rounded-full shrink-0 text-white shadow-sm shadow-orange-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg text-slate-800 leading-tight font-sans dark:text-white">Flavoroast</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans">Kitchen Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu_open' : 'menu'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {filteredNavItems.map(({ to, icon, label, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center transition-all duration-200 font-sans text-sm font-semibold group ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              } ${
                collapsed
                  ? 'justify-center w-11 h-11 rounded-full p-0 mx-auto'
                  : 'justify-between px-4 py-3 rounded-xl'
              }`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                {collapsed ? (
                  <span
                    className="material-symbols-outlined text-[20px] block"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {icon}
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {icon}
                      </span>
                      <span>{label}</span>
                    </div>
                    {badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
                      }`}>{badge}</span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Kitchen Status Widget */}
      {!collapsed && (
        <div className="mx-3 mb-3 space-y-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 font-sans">Kitchen Status</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-orange-500">🔥</span>
              <span className="font-bold text-orange-600 text-sm font-sans dark:text-orange-400">Medium Load</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">All stations operational</p>
          </div>
        </div>
      )}

      {/* Chef Profile */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3">
        <button
          onClick={onProfileClick}
          className={`w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-all text-left outline-none focus:ring-2 focus:ring-orange-500/20 ${collapsed ? 'p-2 justify-center' : 'p-3'}`}
        >
          <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-950/50 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-orange-500/10 shadow-sm">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-orange-700 dark:text-orange-400 font-bold text-sm">
                {getInitials(profile.name)}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate font-sans text-slate-800 dark:text-slate-200">{profile.name}</p>
              <p className="text-[10px] text-slate-400 font-sans">{profile.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  profile.status === 'on-duty' ? 'bg-green-500' :
                  profile.status === 'on-break' ? 'bg-yellow-500' : 'bg-slate-400'
                }`} />
                <span className="text-[9px] font-bold text-slate-650 dark:text-slate-400 uppercase font-sans">
                  {profile.status === 'on-duty' ? 'On Duty' :
                   profile.status === 'on-break' ? 'On Break' : 'Off Duty'}
                </span>
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
