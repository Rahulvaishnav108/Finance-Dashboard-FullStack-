import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import QRScannerModal from './QRScannerModal';
import { useCustomerStore } from '../../store/customer.store';
import { useAuth } from '../../../../auth/AuthProvider';

const NAV_ITEMS = [
  { to: '/customer/home', icon: 'home', label: 'Home' },
  { to: '/customer/menu', icon: 'restaurant_menu', label: 'Menu' },
  { to: '/customer/orders', icon: 'receipt_long', label: 'Orders' },
  { to: '/customer/reservations', icon: 'event_seat', label: 'Reservations' },
  { to: '/customer/feedback', icon: 'rate_review', label: 'Feedback' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function CustomerSidebar({ collapsed, onToggle }: Props) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { profile, diningSession } = useCustomerStore();
  const { isAuthenticated } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-sd-surface-container-low border-r border-sd-surface-variant z-50 transition-all duration-300 group ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className={`flex flex-col ${collapsed ? 'items-center px-2' : 'px-4'} py-5 border-b border-sd-surface-variant/50 shrink-0`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-sd-primary-container w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
            </div>
            {!collapsed && (
              <h1 className="text-lg font-extrabold text-sd-primary font-sans whitespace-nowrap tracking-tight">Smart Dining</h1>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 text-sd-on-surface-variant hover:bg-sd-surface-container rounded-lg transition-all duration-200"
              title="Collapse sidebar"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          )}
        </div>

        {/* Below the logo (when not collapsed) */}
        {!collapsed && (
          <div className="mt-3 pl-1 space-y-1.5 animate-fadeIn">
            {/* Location (icon first + text) */}
            <div className="flex items-center gap-2 text-xs text-sd-on-surface-variant font-sans">
              <span className="material-symbols-outlined text-[16px] text-sd-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="font-semibold">{diningSession?.restaurantName || 'Scan QR Code'}</span>
            </div>
            {/* Table Number */}
            <div className="flex items-center gap-2 text-xs text-sd-on-surface-variant font-sans">
              <span className="material-symbols-outlined text-[16px] text-sd-secondary dark:text-sd-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>table_restaurant</span>
              <span className="font-medium bg-sd-secondary-container/10 dark:bg-sd-secondary-container/20 px-2 py-0.5 rounded-md text-sd-secondary dark:text-sd-secondary-container">Table {diningSession?.tableNumber || '...'}</span>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={onToggle}
            className="mt-4 p-1.5 text-sd-on-surface-variant hover:bg-sd-surface-container rounded-lg transition-all duration-200"
            title="Expand sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">menu_open</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto sd-custom-scrollbar">
        {/* Render first two items: Home, Menu */}
        {NAV_ITEMS.slice(0, 2).map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-sans text-sm font-semibold group ${
                isActive
                  ? 'bg-sd-primary-container text-white shadow-md'
                  : 'text-sd-on-surface-variant hover:bg-sd-surface-container'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Center/Middle: Scan QR Action button */}
        {!diningSession && (
          <button
            onClick={() => setScannerOpen(true)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-sans text-sm font-semibold text-sd-on-surface-variant hover:bg-sd-surface-container w-full ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Scan QR' : undefined}
          >
            <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            {!collapsed && <span>Scan QR</span>}
          </button>
        )}

        {/* Render remaining items: Orders, Reservations, Feedback */}
        {NAV_ITEMS.slice(2).map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-sans text-sm font-semibold group ${
                isActive
                  ? 'bg-sd-primary-container text-white shadow-md'
                  : 'text-sd-on-surface-variant hover:bg-sd-surface-container'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Promo Card */}
      {!collapsed && (
        <div className="mx-3 mb-3">
          <div className="bg-sd-primary-container/10 rounded-xl p-4 border border-sd-primary/20 relative overflow-hidden">
            <p className="text-sd-primary font-bold text-sm font-sans mb-1">Get 20% OFF</p>
            <p className="text-sd-on-surface-variant text-xs font-sans mb-3">on your first order</p>
            <NavLink
              to="/customer/menu"
              className="inline-block bg-sd-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity font-sans"
            >
              Order Now
            </NavLink>
            <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-sd-primary/10 text-6xl rotate-12">
              celebration
            </span>
          </div>
        </div>
      )}

      {/* Profile */}
      {isAuthenticated && (
        <div className="border-t border-sd-surface-variant/50 px-2 py-2">
          <NavLink
            to="/customer/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-sans text-sm font-semibold ${
                isActive
                  ? 'bg-sd-primary-container text-white'
                  : 'text-sd-on-surface-variant hover:bg-sd-surface-container'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? 'Profile' : undefined}
          >
            {profile.avatar && (profile.avatar.startsWith('data:image') || profile.avatar.startsWith('http')) ? (
              <div className="w-[22px] h-[22px] rounded-full overflow-hidden shrink-0 border border-sd-outline-variant">
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <span className="material-symbols-outlined">{profile.avatar || 'person'}</span>
            )}
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </div>
      )}

      {/* QR Scanner Modal Overlay */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(tableId) => {
          setScannerOpen(false);
          setToastMsg(`✅ Connected to Table ${tableId}!`);
          setTimeout(() => setToastMsg(''), 3000);
        }}
      />

      {/* Local Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sd-inverse-surface text-white px-6 py-3 rounded-2xl shadow-xl z-[100] animate-fadeIn font-sans text-sm font-semibold">
          {toastMsg}
        </div>
      )}
    </aside>
  );
}
