// src/app/router.tsx
// Central application router — assembles all role-based route modules

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import RootErrorBoundary from './RootErrorBoundary';
import { ProtectedRoute } from './guards/ProtectedRoute';

// Route modules
import { authRoutes } from '../routes/auth.routes';
import { adminRoutes } from '../routes/admin.routes';
import { staffRoutes } from '../routes/staff.routes';
import { kitchenRoutes } from '../routes/kitchen.routes';
import { cleaningRoutes } from '../routes/cleaning.routes';
import { customerRoutes } from '../routes/customer.routes';
import { superAdminRoutes } from '../routes/superAdmin.routes';

// Pages
import LandingPage from '../features/customer/pages/LandingPage';
import RestaurantsPage from '../features/customer/pages/RestaurantsPage';
import OffersPage from '../features/customer/pages/OffersPage';
import { lazy, Suspense } from 'react';

// Lazy-loaded table session page (QR scan entry)
const TableSessionPage = lazy(
  () => import('../features/customer/pages/TableSessionPage')
);

const router = createBrowserRouter([
  // ── Public landing ─────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <RootErrorBoundary />,
  },

  // ── Public restaurants page ────────────────────────────────────────
  {
    path: '/customer/restaurants',
    element: <RestaurantsPage />,
    errorElement: <RootErrorBoundary />,
  },

  // ── Public offers page ─────────────────────────────────────────────
  {
    path: '/customer/offers',
    element: <OffersPage />,
    errorElement: <RootErrorBoundary />,
  },

  // ── QR scan → table session init ───────────────────────────────────
  {
    path: '/table',
    element: (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        }
      >
        <TableSessionPage />
      </Suspense>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // ── Auth routes ────────────────────────────────────────────────────
  {
    path: '/auth',
    children: authRoutes,
    errorElement: <RootErrorBoundary />,
  },

  // ── Protected role-based routes ────────────────────────────────────
  {
    element: <ProtectedRoute />,
    errorElement: <RootErrorBoundary />,
    children: [
      ...adminRoutes,
      ...staffRoutes,
      ...kitchenRoutes,
      ...cleaningRoutes,
      ...customerRoutes,
      ...superAdminRoutes,
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}