import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationsAPI, type NotificationItem } from '../api/notifications.api';

const initialStaffNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Table T03 order ready',
    message: 'Order for Table T03 (Paneer Butter Masala) is ready in the kitchen.',
    time: '2 min ago',
    tone: 'urgent',
    read: false,
  },
  {
    id: 2,
    title: 'New customer request',
    message: 'Table T05 has requested extra cutlery.',
    time: '5 min ago',
    tone: 'cleaning',
    read: false,
  },
  {
    id: 3,
    title: 'Staff attendance summary',
    message: '32 active staff members are checked in for today\'s shift.',
    time: '15 min ago',
    tone: 'info',
    read: true,
  },
  {
    id: 4,
    title: 'Table status updated',
    message: 'Table T02 is now marked as served.',
    time: '30 min ago',
    tone: 'success',
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialStaffNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsAPI.getNotifications();
      if (res.success && res.data && res.data.length > 0) {
        setNotifications(res.data);
      } else {
        setNotifications(initialStaffNotifications);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications(initialStaffNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    void notificationsAPI.markAsRead(id);
  }, []);

  const toggleRead = useCallback(async (id: number) => {
    let targetState = false;
    setNotifications((current) =>
      current.map((item) => {
        if (item.id === id) {
          targetState = !item.read;
          return { ...item, read: targetState };
        }
        return item;
      })
    );
    if (targetState) {
      void notificationsAPI.markAsRead(id);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    void notificationsAPI.markAllAsRead();
  }, []);

  const clearRead = useCallback(() => {
    setNotifications((current) => current.filter((item) => !item.read));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount, setState is post-await
    void fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    toggleRead,
    markAllAsRead,
    clearRead,
    refresh: fetchNotifications,
  };
}
