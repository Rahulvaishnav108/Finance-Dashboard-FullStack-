import React from 'react';
import type { RouteObject } from 'react-router-dom';
import StaffLayout from '../layouts/StaffLayout';
import StaffDashboard from '../features/staff/pages/StaffDashboard';
import StaffOrdersPage from '../features/staff/pages/StaffOrdersPage';
import StaffTablesPage from '../features/staff/pages/StaffTablesPage';
import StaffFoodReadyPage from '../features/staff/pages/StaffFoodReadyPage';
import StaffRequestsPage from '../features/staff/pages/StaffRequestsPage';
import StaffReservationsPage from '../features/staff/pages/StaffReservationsPage';
import StaffTableTurnoverPage from '../features/staff/pages/StaffTableTurnoverPage';
import StaffMenuPage from '../features/staff/pages/StaffMenuPage';
import StaffReportsPage from '../features/staff/pages/StaffReportsPage';
import StaffAlertsPage from '../features/staff/pages/StaffAlertsPage';
import StaffProfilePage from '../features/staff/pages/StaffProfilePage';
import StaffSettingsPage from '../features/staff/pages/StaffSettingsPage';

export const staffRoutes: RouteObject[] = [
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <StaffDashboard />,
      },
      {
        path: 'orders',
        element: <StaffOrdersPage />,
      },
      {
        path: 'tables',
        element: <StaffTablesPage />,
      },
      {
        path: 'food-ready',
        element: <StaffFoodReadyPage />,
      },
      {
        path: 'requests',
        element: <StaffRequestsPage />,
      },
      {
        path: 'reservations',
        element: <StaffReservationsPage />,
      },
      {
        path: 'table-turnover',
        element: <StaffTableTurnoverPage />,
      },
      {
        path: 'menu',
        element: <StaffMenuPage />,
      },
      {
        path: 'reports',
        element: <StaffReportsPage />,
      },
      {
        path: 'alerts',
        element: <StaffAlertsPage />,
      },
      {
        path: 'profile',
        element: <StaffProfilePage />,
      },
      {
        path: 'settings',
        element: <StaffSettingsPage />,
      },
    ],
  },
];