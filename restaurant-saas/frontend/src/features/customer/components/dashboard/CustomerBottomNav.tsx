import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import QRScannerModal from './QRScannerModal';
import { useCustomerStore } from '../../store/customer.store';

export default function CustomerBottomNav() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { diningSession } = useCustomerStore();

  const handleScanSuccess = (tableId: string) => {
    setScannerOpen(false);
    setToastMsg(`✅ Connected to Table ${tableId}!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const leftNav = [
    { to: '/customer/home', icon: 'home', label: 'Home' },
    { to: '/customer/menu', icon: 'restaurant_menu', label: 'Menu' },
  ];

  const rightNav = [
    { to: '/customer/orders', icon: 'receipt_long', label: 'Orders' },
    { to: '/customer/reservations', icon: 'event_seat', label: 'Reservations' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex items-center h-16 px-2 pb-[env(safe-area-inset-bottom)] bg-sd-surface border-t border-sd-surface-variant shadow-lg z-40 overflow-visible">
        {/* Left Nav Items */}
        {leftNav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 ${
                isActive
                  ? 'text-sd-primary'
                  : 'text-sd-on-surface-variant'
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

        {/* Center: Scan QR Button (Elevated) */}
        {!diningSession && (
          <div className="flex-1 flex flex-col items-center justify-center relative -top-3.5 z-50">
            <button
              onClick={() => setScannerOpen(true)}
              className="w-14 h-14 bg-sd-primary-container text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(255,92,0,0.35)] hover:scale-105 active:scale-95 transition-all border-[4px] border-white dark:border-sd-surface shrink-0"
              title="Scan QR"
            >
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </button>
            <span className="text-[10px] font-bold font-sans text-sd-primary mt-1 shrink-0">Scan QR</span>
          </div>
        )}

        {/* Right Nav Items */}
        {rightNav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 ${
                isActive
                  ? 'text-sd-primary'
                  : 'text-sd-on-surface-variant'
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

      {/* QR Scanner Modal Overlay */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Local Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-sd-inverse-surface text-white px-6 py-3 rounded-2xl shadow-xl z-[100] animate-fadeIn font-sans text-sm font-semibold">
          {toastMsg}
        </div>
      )}
    </>
  );
}
