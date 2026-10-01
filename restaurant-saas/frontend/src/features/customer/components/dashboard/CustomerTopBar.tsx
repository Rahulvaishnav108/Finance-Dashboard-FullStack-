import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { useSearch } from './SearchContext';
import { useCustomerStore } from '../../store/customer.store';
import { useAuth } from '../../../../auth/AuthProvider';

interface Props {
  onToggleCart: () => void;
}

export default function CustomerTopBar({ onToggleCart }: Props) {
  const { itemCount } = useCart();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname.includes('/checkout');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Notification dropdown state and actions
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    profile,
    tableCode,
    diningSession,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
  } = useCustomerStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // If mobile search overlay is active, show the full-width search bar
  if (mobileSearchOpen) {
    return (
      <header className="h-16 flex items-center px-4 bg-sd-surface border-b border-sd-surface-variant sticky top-0 z-30 shrink-0 animate-fadeIn">
        <div className="flex items-center gap-3 w-full">
          {/* Back Button */}
          <button
            onClick={() => {
              setMobileSearchOpen(false);
              setQuery(''); // Reset search text when closing mobile search
            }}
            className="p-2 text-sd-on-surface-variant hover:bg-sd-surface-container rounded-full transition-colors shrink-0"
            title="Back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>

          {/* Search Input container */}
          <div className="flex-1 flex items-center bg-sd-surface-container-low border border-sd-outline-variant rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-sd-primary-container focus-within:border-sd-primary-container transition-all">
            <span className="material-symbols-outlined text-sd-on-surface-variant mr-2 text-[20px]">search</span>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full p-0 font-sans text-sd-on-surface placeholder:text-sd-on-surface-variant/50"
              placeholder="Search for dishes, cuisines..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-sd-on-surface-variant hover:text-sd-primary p-0.5"
                title="Clear"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-sd-surface border-b border-sd-surface-variant sticky top-0 z-30 shrink-0">
      {/* Left: Brand Logo (mobile-only) or Search Bar (desktop-only) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Mobile Logo */}
        <div className="flex sm:hidden flex-col shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="bg-sd-primary-container w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
            </div>
            <span className="text-sm font-bold text-sd-primary font-sans whitespace-nowrap">Smart Dining</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-sd-on-surface-variant font-sans mt-0.5">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px] text-sd-primary">location_on</span>
              <span>{diningSession?.restaurantName || 'Indiranagar'}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-sd-secondary dark:text-sd-secondary-container bg-sd-secondary-container/10 dark:bg-sd-secondary-container/20 px-1.5 py-0.2 rounded">{diningSession?.tableNumber || tableCode}</span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden sm:flex items-center bg-sd-surface-container-low border border-sd-outline-variant rounded-full px-4 py-2 w-full focus-within:ring-2 focus-within:ring-sd-primary-container focus-within:border-sd-primary-container transition-all">
          <span className="material-symbols-outlined text-sd-on-surface-variant mr-2 text-[20px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full p-0 font-sans text-sd-on-surface placeholder:text-sd-on-surface-variant/50"
            placeholder="Search for dishes, cuisines..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-sd-on-surface-variant hover:text-sd-primary" title="Clear">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Icons — Search (mobile-only), Profile, Cart, Notifications */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="flex sm:hidden p-2.5 bg-white border border-sd-outline-variant rounded-full text-sd-on-surface-variant hover:bg-sd-surface-container-low transition-colors"
          title="Search"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {!isCheckoutPage && (
          <button
            onClick={onToggleCart}
            className="w-10 h-10 bg-white border border-sd-outline-variant rounded-full text-sd-on-surface-variant hover:bg-sd-surface-container-low transition-colors relative flex items-center justify-center shrink-0"
            title="Cart"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sd-primary-container text-white text-[10px] flex items-center justify-center rounded-full border-2 border-sd-surface font-bold">
                {itemCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Icon with Interactive Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 bg-white border border-sd-outline-variant rounded-full text-sd-on-surface-variant hover:bg-sd-surface-container-low transition-colors relative flex items-center justify-center shrink-0"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sd-primary-container text-white text-[10px] flex items-center justify-center rounded-full border-2 border-sd-surface font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <>
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-sd-surface-variant rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-sd-surface-variant bg-sd-surface-container-low flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-sd-on-surface font-sans">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-sd-primary-container/10 text-sd-primary px-2 py-0.5 rounded-full font-sans">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead()}
                        className="text-xs text-sd-primary font-bold hover:underline font-sans"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-xs text-red-500 font-bold hover:underline font-sans"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto sd-custom-scrollbar max-h-96">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-sd-surface-container-low flex items-center justify-center text-sd-on-surface-variant/40 mb-3">
                        <span className="material-symbols-outlined text-2xl">notifications_off</span>
                      </div>
                      <p className="text-sm font-bold text-sd-on-surface font-sans">All caught up!</p>
                      <p className="text-xs text-sd-on-surface-variant font-sans mt-0.5">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-sd-surface-variant/50">
                      {notifications.map((n) => {
                        let iconColor = 'bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400';
                        let iconName = 'info';

                        if (n.type === 'order') {
                          iconColor = 'bg-orange-50 text-orange-500 dark:bg-orange-950/20 dark:text-orange-400';
                          iconName = 'shopping_bag';
                        } else if (n.type === 'offer') {
                          iconColor = 'bg-purple-50 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400';
                          iconName = 'sell';
                        }

                        const handleNotificationClick = () => {
                          markNotificationRead(n.id);
                          setNotificationsOpen(false);

                          let targetPath = '';
                          if (n.redirectTo) {
                            targetPath = n.redirectTo;
                          } else if (n.title.toLowerCase().includes('reservation')) {
                            targetPath = '/customer/reservations';
                          } else if (n.title.toLowerCase().includes('order') || n.title.toLowerCase().includes('reorder')) {
                            targetPath = '/customer/orders';
                          } else if (n.title.toLowerCase().includes('support') || n.title.toLowerCase().includes('feedback')) {
                            targetPath = '/customer/feedback';
                          } else if (n.type === 'offer') {
                            targetPath = '/customer/profile';
                          }

                          if (targetPath) {
                            navigate(targetPath);
                          }
                        };

                        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                        return <div
                          key={n.id}
                          onClick={handleNotificationClick}
                          className={`p-3.5 flex gap-3 hover:bg-sd-surface-container-low/50 transition-colors relative group cursor-pointer ${
                            !n.read ? 'bg-sd-primary-container/[0.03]' : ''
                          }`}
                        >
                          <div className={`w-8.5 h-8.5 rounded-full ${iconColor} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                          </div>
                          <div className="flex-1 min-w-0 pr-16">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs font-sans truncate ${!n.read ? 'font-bold text-sd-on-surface' : 'text-sd-on-surface-variant'}`}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sd-primary shrink-0 animate-ping" />
                              )}
                            </div>
                            <p className="text-[11px] text-sd-on-surface-variant font-sans mt-0.5 break-words">
                              {n.message}
                            </p>
                            <p className="text-[9px] text-sd-on-surface-variant/60 font-sans mt-1">
                              {n.timestamp}
                            </p>
                          </div>

                          {/* Action buttons on hover (and readable on mobile layout) */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            {!n.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationRead(n.id);
                                }}
                                className="w-7 h-7 bg-white dark:bg-sd-surface border border-sd-surface-variant hover:border-sd-primary text-sd-on-surface-variant hover:text-sd-primary rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
                                title="Mark as read"
                              >
                                <span className="material-symbols-outlined text-[14px]">done</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                              className="w-7 h-7 bg-white dark:bg-sd-surface border border-sd-surface-variant hover:border-red-500 text-sd-on-surface-variant hover:text-red-500 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={() => navigate('/customer/profile')}
            className="w-10 h-10 bg-white border border-sd-outline-variant rounded-full overflow-hidden flex items-center justify-center text-sd-on-surface-variant hover:bg-sd-surface-container-low transition-colors shrink-0"
            title="Profile"
          >
            {profile.avatar && (profile.avatar.startsWith('data:image') || profile.avatar.startsWith('http')) ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                {profile.avatar || 'account_circle'}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
