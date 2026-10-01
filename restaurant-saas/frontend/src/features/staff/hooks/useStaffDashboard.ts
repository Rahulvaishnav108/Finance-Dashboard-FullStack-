// src/features/staff/hooks/useStaffDashboard.ts

import { useState, useEffect } from 'react';
import { staffStore, type Order, type ReadyItem, type RequestItem, type AlertItem } from '../store/staff.store';

export function useStaffDashboard() {
  const [orders, setOrdersState] = useState(() => staffStore.orders);
  const [readyItems, setReadyItemsState] = useState(() => staffStore.readyItems);
  const [requests, setRequestsState] = useState(() => staffStore.requests);
  const [alerts, setAlertsState] = useState(() => staffStore.alerts);

  useEffect(() => {
    const unsubscribe = staffStore.subscribe(() => {
      setOrdersState(staffStore.orders);
      setReadyItemsState(staffStore.readyItems);
      setRequestsState(staffStore.requests);
      setAlertsState(staffStore.alerts);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    orders,
    readyItems,
    requests,
    alerts,
    setOrders: (newOrders: Order[] | ((prev: Order[]) => Order[])) => staffStore.setOrders(newOrders),
    setReadyItems: (newReadyItems: ReadyItem[] | ((prev: ReadyItem[]) => ReadyItem[])) => staffStore.setReadyItems(newReadyItems),
    setRequests: (newRequests: RequestItem[] | ((prev: RequestItem[]) => RequestItem[])) => staffStore.setRequests(newRequests),
    setAlerts: (newAlerts: AlertItem[] | ((prev: AlertItem[]) => AlertItem[])) => staffStore.setAlerts(newAlerts),
  };
}
