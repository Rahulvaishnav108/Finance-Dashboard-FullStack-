import React, { useState, useEffect } from 'react';
import { useKitchenSearch } from './KitchenSearchContext';
import { useNavigate } from 'react-router-dom';
import { useKitchenStore } from '../../store/kitchen.store';

interface Props {
  onProfileClick?: () => void;
}


export interface KitchenNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  route: string;
  type: 'order' | 'inventory' | 'station' | 'staff' | 'analytics';
}

const DEFAULT_NOTIFICATIONS: KitchenNotification[] = [
  { id: 'nt-01', message: 'New order #ORD-12585 received at Table T07', time: '2 mins ago', read: false, route: '/kitchen', type: 'order' },
  { id: 'nt-02', message: 'Paneer stock critically low - 3 kg remaining', time: '12 mins ago', read: false, route: '/kitchen/inventory', type: 'inventory' },
  { id: 'nt-03', message: 'Tandoor Station is under maintenance', time: '20 mins ago', read: false, route: '/kitchen/stations', type: 'station' },
  { id: 'nt-04', message: 'Chef Arjun completed 48 orders in this shift', time: '1 hour ago', read: true, route: '/kitchen/staff', type: 'staff' },
  { id: 'nt-05', message: 'Analytics report generated for yesterday', time: '2 hours ago', read: true, route: '/kitchen/analytics', type: 'analytics' },
];

export default function KitchenTopBar({ onProfileClick }: Props) {
  const { profile } = useKitchenStore();
  const { query, setQuery } = useKitchenSearch();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [time, setTime] = useState(new Date());
  const [activeOrders, setActiveOrders] = useState(24);
  const [avgPrepTime, setAvgPrepTime] = useState({ mins: 14, secs: 32 });
  const [kitchenLoad, setKitchenLoad] = useState(78);
  const [barHeights, setBarHeights] = useState([40, 55, 35, 70, 80, 100, 85, 60]);

  // Load and save notifications state
  const [notifications, setNotifications] = useState<KitchenNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_notifications');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse notifications", e);
        }
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('kitchen_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync notifications across tabs/pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kitchen_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    // 1. Clock timer (every second)
    const clockTimer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // 2. Metrics fluctuate timer (every 5 seconds)
    const metricsTimer = setInterval(() => {
      setActiveOrders(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;

        // Occasionally trigger a new order notification when orders count increases
        if (next > prev && Math.random() > 0.3) {
          const newId = `ORD-${Math.floor(Math.random() * 9000) + 12600}`;
          const newTable = `T${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`;
          const newNotif: KitchenNotification = {
            id: `nt-${Date.now()}`,
            message: `New order #${newId} received at Table ${newTable}`,
            time: 'Just now',
            read: false,
            route: '/kitchen',
            type: 'order'
          };
          setNotifications(prevNotifs => [newNotif, ...prevNotifs]);
        }

        return next >= 20 && next <= 28 ? next : prev;
      });

      setAvgPrepTime(prev => {
        let totalSecs = prev.mins * 60 + prev.secs;
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5 seconds
        totalSecs = Math.max(720, Math.min(1080, totalSecs + change));
        return {
          mins: Math.floor(totalSecs / 60),
          secs: totalSecs % 60
        };
      });

      setKitchenLoad(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2%
        const next = prev + change;
        return next >= 70 && next <= 85 ? next : prev;
      });

      setBarHeights(prev =>
        prev.map(h => {
          const change = Math.floor(Math.random() * 15) - 7;
          return Math.max(20, Math.min(100, h + change));
        })
      );
    }, 5000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(metricsTimer);
    };
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = formatDate(time);
  const avgPrepTimeStr = `${String(avgPrepTime.mins).padStart(2, '0')}:${String(avgPrepTime.secs).padStart(2, '0')}`;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotifClick = (notif: KitchenNotification) => {
    handleMarkAsRead(notif.id);
    setNotificationsOpen(false);
    navigate(notif.route);
  };

  const iconMap = {
    order: { icon: 'shopping_bag', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    inventory: { icon: 'warning', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    station: { icon: 'build', color: 'text-orange-600 bg-orange-50 border-orange-100' },
    staff: { icon: 'group', color: 'text-green-600 bg-green-50 border-green-100' },
    analytics: { icon: 'bar_chart', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  };

  if (mobileSearchOpen) {
    return (
      <header className="h-16 flex items-center px-4 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => { setMobileSearchOpen(false); setQuery(''); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-slate-400 mr-2 text-[18px]">search</span>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full font-sans text-slate-800 placeholder:text-slate-400"
              placeholder="Search orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[16px]">close</span></button>}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
      {/* Left: Stats */}
      <div className="hidden md:flex gap-8 lg:gap-12 items-center">
        <div>
          <p className="text-[10px] text-slate-400 font-sans mb-0.5">Time</p>
          <p className="text-lg font-bold text-orange-600 font-sans">{timeStr}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-sans mb-0.5">Date</p>
          <p className="text-lg font-bold text-slate-800 font-sans">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-xs border border-green-100 font-sans">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </div>
        </div>
        <div className="hidden xl:flex gap-8">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5 font-sans">Active Orders</p>
            <p className="text-xl font-bold text-orange-600 font-sans">{activeOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mb-0.5 font-sans">Avg. Prep Time</p>
            <p className="text-xl font-bold text-blue-600 font-sans">{avgPrepTimeStr}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5 font-sans">Kitchen Load</p>
            <div className="flex items-end gap-3">
              <p className="text-xl font-bold text-green-600 font-sans">{kitchenLoad}%</p>
              <div className="flex items-end gap-0.5 h-6">
                {barHeights.map((h, i) => (
                  <div key={i} className={`w-1 rounded-t-sm ${i >= 4 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Brand */}
      <div className="flex md:hidden items-center gap-2">
        <div className="bg-orange-100 p-1.5 rounded-lg">
          <span className="material-symbols-outlined text-orange-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
        <span className="font-bold text-sm text-slate-800 font-sans">Flavoroast</span>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 w-48 font-sans"
            placeholder="Search orders..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Mobile Search Button */}
        <button onClick={() => setMobileSearchOpen(true)} className="flex md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-full">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Backdrop to close notifications */}
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 bg-transparent border-none outline-none cursor-default"
                onClick={() => setNotificationsOpen(false)}
              />

              {/* Dropdown panel */}
              <div className="absolute right-0 mt-2 w-80 sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-fadeIn max-h-[500px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 font-sans">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-sans">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 items-center text-xs">
                    <button onClick={handleMarkAllAsRead} className="text-orange-600 hover:text-orange-700 font-bold font-sans">
                      Mark all read
                    </button>
                    <span className="text-slate-200">|</span>
                    <button onClick={handleClearAll} className="text-slate-400 hover:text-slate-600 font-bold font-sans">
                      Clear all
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[380px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <span className="material-symbols-outlined text-slate-300 text-[44px] mb-2">notifications_off</span>
                      <p className="text-xs text-slate-500 font-bold font-sans">All caught up!</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">No new notifications here.</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const itemConfig = iconMap[notif.type] || { icon: 'notifications', color: 'text-slate-600 bg-slate-50 border-slate-100' };
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-all relative group ${
                            !notif.read ? 'bg-orange-50/10' : ''
                          }`}
                        >
                          {/* Indicator dot */}
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 absolute left-2 top-[22px]" />
                          )}

                          {/* Left Icon */}
                          <div className={`p-2 rounded-xl shrink-0 border ${itemConfig.color}`}>
                            <span className="material-symbols-outlined text-[18px] block">{itemConfig.icon}</span>
                          </div>

                          {/* Content */}
                          <button
                            type="button"
                            className="flex-1 min-w-0 text-left block focus:outline-none"
                            onClick={() => handleNotifClick(notif)}
                          >
                            <p className={`text-xs ${!notif.read ? 'font-bold text-slate-800 font-sans' : 'text-slate-600 font-sans'} leading-normal break-words`}>
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1 font-sans">{notif.time}</span>
                          </button>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {/* Toggle Read */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRead(notif.id);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
                              title={notif.read ? "Mark as unread" : "Mark as read"}
                            >
                              <span className="material-symbols-outlined text-[16px] block">
                                {notif.read ? 'mark_email_unread' : 'mark_email_read'}
                              </span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notif.id);
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <span className="material-symbols-outlined text-[16px] block">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-orange-200 dark:bg-orange-950/50 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-orange-500/10 hover:ring-orange-300 transition-all cursor-pointer outline-none"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-orange-700 dark:text-orange-400 font-bold text-xs font-sans">
              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CH'}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
