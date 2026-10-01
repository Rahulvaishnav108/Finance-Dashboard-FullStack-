import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';

export interface AdminNotification {
  id: string;
  message: string;
  time: string;
  icon: string;
  read: boolean;
}

interface AdminNotificationsContextValue {
  notifications: AdminNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<AdminNotification, 'id' | 'read'>) => void;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(null);

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  { id: '1', message: 'New order #1042 received from Table 5', time: '2 min ago', icon: '🛒', read: false },
  { id: '2', message: 'Low stock alert: Tomatoes below threshold', time: '15 min ago', icon: '⚠️', read: false },
  { id: '3', message: 'Reservation confirmed for 7 guests at 8 PM', time: '1 hr ago', icon: '📅', read: false },
  { id: '4', message: 'Staff member Rahul checked in', time: '2 hr ago', icon: '👤', read: true },
  { id: '5', message: "Daily revenue target ₹50,000 achieved!", time: '3 hr ago', icon: '🎯', read: true },
];

export function AdminNotificationsProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function addNotification(n: Omit<AdminNotification, 'id' | 'read'>) {
    setNotifications((prev) => [
      { ...n, id: String(Date.now()), read: false },
      ...prev,
    ]);
  }

  return (
    <AdminNotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications(): AdminNotificationsContextValue {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
  return ctx;
}