import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type AppRole } from '../../auth/AuthProvider';
import type { Panel } from '../../auth/tokenStore';
import { appRoutes } from '../../shared/constants/routes';

type RoleGuardProps = {
  /** The primary roles allowed to access this route. */
  roles: AppRole[];
  /** Optional: specific panel to check. If omitted, uses the active panel user. */
  panel?: Panel;
};

/**
 * Panel-aware RoleGuard.
 *
 * Checks the user's AppRole against the allowed list. When a `panel`
 * prop is provided, it checks the user stored for *that specific panel*
 * rather than the globally "active" user.
 */
export function RoleGuard({ roles, panel }: RoleGuardProps): JSX.Element {
  const { user, getPanelUser } = useAuth();
  const effectiveUser = panel ? getPanelUser(panel) : user;

  if (!effectiveUser) {
    return <Navigate replace to={appRoutes.home} />;
  }

  if (!roles.includes(effectiveUser.role)) {
    const fallback = effectiveUser.role === 'super-admin' ? appRoutes.superAdmin : `/${effectiveUser.role}`;
    return <Navigate replace to={fallback} />;
  }

  return <Outlet />;
}
