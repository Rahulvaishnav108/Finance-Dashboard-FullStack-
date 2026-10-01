import type { RouteObject } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import CustomerAuth from '../auth/pages/CustomerAuth';
import RestaurantAuth from '../auth/pages/RestaurantAuth';
import SuperAdminAuth from '../auth/pages/SuperAdminAuth';

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'customer',
        element: <CustomerAuth />,
      },
      {
        path: 'restaurant',
        element: <RestaurantAuth />,
      },
      {
        path: 'kitchen',
        element: <RestaurantAuth />,
      },
      {
        path: 'staff',
        element: <RestaurantAuth />,
      },
      {
        path: 'cleaning',
        element: <RestaurantAuth />,
      },
      {
        path: 'admin',
        element: <RestaurantAuth />,
      },
      {
        path: 'super-admin',
        element: <SuperAdminAuth />,
      },
      {
        path: 'superadmin',
        element: <SuperAdminAuth />,
      },
    ],
  },
];
