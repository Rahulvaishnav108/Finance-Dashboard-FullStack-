import type { RouteObject } from 'react-router-dom';
import KitchenLayout from '../layouts/KitchenLayout';
import KitchenOverviewPage from '../features/kitchen/pages/KitchenOverviewPage';
import KitchenOrdersPage from '../features/kitchen/pages/KitchenOrdersPage';
import BatchCookingPage from '../features/kitchen/pages/BatchCookingPage';
import KitchenInventoryPage from '../features/kitchen/pages/KitchenInventoryPage';
import KitchenStationsPage from '../features/kitchen/pages/KitchenStationsPage';
import KitchenStaffPage from '../features/kitchen/pages/KitchenStaffPage';
import KitchenAnalyticsPage from '../features/kitchen/pages/KitchenAnalyticsPage';
import KitchenReportsPage from '../features/kitchen/pages/KitchenReportsPage';
import KitchenSettingsPage from '../features/kitchen/pages/KitchenSettingsPage';

export const kitchenRoutes: RouteObject[] = [
  {
    path: '/kitchen',
    element: <KitchenLayout />,
    children: [
      { index: true, element: <KitchenOverviewPage /> },
      { path: 'orders', element: <KitchenOrdersPage /> },
      { path: 'batch-cooking', element: <BatchCookingPage /> },
      { path: 'inventory', element: <KitchenInventoryPage /> },
      { path: 'stations', element: <KitchenStationsPage /> },
      { path: 'staff', element: <KitchenStaffPage /> },
      { path: 'analytics', element: <KitchenAnalyticsPage /> },
      { path: 'reports', element: <KitchenReportsPage /> },
      { path: 'settings', element: <KitchenSettingsPage /> },
    ],
  },
];
