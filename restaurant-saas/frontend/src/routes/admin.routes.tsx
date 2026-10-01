import React from 'react';
import type { RouteObject } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import { MenuManagementPage } from '../features/admin/pages/MenuManagementPage';
import OrdersPage from '../features/admin/pages/OrdersPage';
import ReservationsPage from '../features/admin/pages/ReservationsPage';
import { CustomersPage }  from '../features/admin/pages/CustomersPage';
import { InventoryPage }  from '../features/admin/pages/InventoryPage';
import  StaffManagementPage  from '../features/admin/pages/StaffManagementPage';
import  ReportsPage  from '../features/admin/pages/ReportsPage';
import { TableManagementPage } from '../features/admin/pages/TableManagementPage';
import  SettingsPage from '../features/admin/pages/SettingsPage';
import FinanceDashboardPage from '../features/admin/pages/FinanceDashboardPage';
import {
} from '../features/admin/pages/StubPages';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,          element: <AdminDashboard /> },
      { path: 'menu',         element: <MenuManagementPage /> },
      { path: 'orders',       element: <OrdersPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'customers',    element: <CustomersPage /> },
      { path: 'inventory',    element: <InventoryPage /> },
      { path: 'staff',        element: <StaffManagementPage /> },
      { path: 'reports',      element: <ReportsPage /> },
      { path: 'tables',       element: <TableManagementPage /> },
      { path: 'finance',      element: <FinanceDashboardPage /> },
      { path: 'settings',     element: <SettingsPage /> },
    ],
  },
];
