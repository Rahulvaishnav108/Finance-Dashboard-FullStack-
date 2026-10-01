// hooks/useAlerts.ts
import { useState, useMemo, useCallback } from 'react';
import { Alert, AlertStatus, FilterType, SortOrder } from '../components/Alerts/index';
import { INITIAL_ALERTS } from '../store/Alerts';
import { useRestaurantRequestsStore } from '../store/RestaurantRequests';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const requests = useRestaurantRequestsStore((state) => state.requests);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [baseTime] = useState(() => Date.now());

  const linkedAlerts = useMemo<Alert[]>(() => {
    const existingEntities = new Set(
      alerts.map((alert) => alert.entity?.toLowerCase()).filter(Boolean)
    );

    const requestAlerts = requests
      .filter((request) => !existingEntities.has(request.name.toLowerCase()))
      .map<Alert>((request, index) => ({
        id: `request-${request.id}`,
        title: 'New Restaurant Signup',
        description: `${request.name} requested ${request.plan} onboarding. Review this request from the Super Admin dashboard.`,
        type: 'info',
        status: 'new',
        entity: request.name,
        entityType: 'restaurant',
        timestamp: new Date(baseTime - index * 60_000).toISOString(),
        actionLabel: 'Review Request',
        actionHref: '/superadmin?requests=new',
        tags: ['onboarding', 'new-request', 'placeholder'],
      }));

    return [...requestAlerts, ...alerts];
  }, [alerts, requests, baseTime]);

  const stats = useMemo(() => ({
    total: linkedAlerts.length,
    new: linkedAlerts.filter(a => a.status === 'new').length,
    critical: linkedAlerts.filter(a => a.type === 'critical').length,
    warning: linkedAlerts.filter(a => a.type === 'warning').length,
    info: linkedAlerts.filter(a => a.type === 'info').length,
    resolved: linkedAlerts.filter(a => a.status === 'resolved').length,
  }), [linkedAlerts]);

  const filteredAlerts = useMemo(() => {
    let result = [...linkedAlerts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.entity?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'new') result = result.filter(a => a.status === 'new');
      else if (activeFilter === 'critical' || activeFilter === 'warning' || activeFilter === 'info')
        result = result.filter(a => a.type === activeFilter);
      else if (activeFilter === 'acknowledged' || activeFilter === 'resolved')
        result = result.filter(a => a.status === activeFilter);
    }

    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortOrder === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      // severity: critical > warning > info
      const severity = { critical: 3, warning: 2, info: 1 };
      return (severity[b.type] ?? 0) - (severity[a.type] ?? 0);
    });

    return result;
  }, [linkedAlerts, activeFilter, sortOrder, searchQuery]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as AlertStatus } : a));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() } : a
    ));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => a.status === 'new' ? { ...a, status: 'read' as AlertStatus } : a));
  }, []);

  const dismissAll = useCallback(() => {
    if (activeFilter === 'all') setAlerts([]);
    else setAlerts(prev => prev.filter(a => {
      if (activeFilter === 'new') return a.status !== 'new';
      if (activeFilter === 'critical' || activeFilter === 'warning' || activeFilter === 'info') return a.type !== activeFilter;
      return true;
    }));
  }, [activeFilter]);

  return {
    alerts: linkedAlerts,
    filteredAlerts,
    stats,
    activeFilter,
    setActiveFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    dismissAlert,
    acknowledgeAlert,
    resolveAlert,
    markAllRead,
    dismissAll,
  };
}
