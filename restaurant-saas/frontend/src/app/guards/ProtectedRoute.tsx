import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import type { Panel } from '../../auth/tokenStore';

// ── Path-to-panel mapping ─────────────────────────────────────────────

const PATH_PANEL_MAP: Array<{ prefix: string; panel: Panel; loginPath: string }> = [
  { prefix: '/customer', panel: 'customer', loginPath: '/auth/customer' },
  { prefix: '/kitchen', panel: 'kitchen', loginPath: '/auth/kitchen' },
  { prefix: '/staff', panel: 'staff', loginPath: '/auth/staff' },
  { prefix: '/cleaning', panel: 'cleaning', loginPath: '/auth/cleaning' },
  { prefix: '/admin', panel: 'admin', loginPath: '/auth/admin' },
  { prefix: '/superadmin', panel: 'superadmin', loginPath: '/auth/superadmin' },
];

/**
 * Panel-aware ProtectedRoute.
 *
 * Instead of checking a single global `isAuthenticated`, this guard
 * determines which panel the user is trying to access (from the URL
 * prefix) and checks whether *that specific panel* has a valid session.
 *
 * This allows a user to be logged into /kitchen and /admin at the same
 * time without one session blocking or overwriting the other.
 */
export function ProtectedRoute(): JSX.Element {
  const { isPanelAuthenticated, switchPanel, signInAs } = useAuth();
  const location = useLocation();

  // Find the matching panel config for the current path
  const matched = PATH_PANEL_MAP.find(({ prefix }) => location.pathname.startsWith(prefix));

  const searchParams = new URLSearchParams(location.search);
  const qrToken = searchParams.get('qr_token');
  const isBypassed = matched?.panel === 'customer' && !!qrToken;

  useEffect(() => {
    if (matched && isPanelAuthenticated(matched.panel)) {
      switchPanel(matched.panel);
    }
  }, [location.pathname, matched, isPanelAuthenticated, switchPanel]);

  if (!matched) {
    return <Navigate replace state={{ from: location }} to="/auth/restaurant" />;
  }

  if (!isPanelAuthenticated(matched.panel) && !isBypassed) {
    return <Navigate replace state={{ from: location }} to={matched.loginPath} />;
  }

  // To prevent rendering children with the wrong/stale user context during
  // the transition, only render Outlet after the active panel has switched.
  const activePanel = localStorage.getItem('ra/active-panel') || 'customer';
  if (activePanel !== matched.panel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return <Outlet />;
}
