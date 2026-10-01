import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';
import { apiClient } from '../shared/services/apiClient';
import {
  getAccessToken,
  getStoredRole,
  getStoredUser,
  setAccessToken,
  setStoredRole,
  setStoredUser,
  clearPanelSession,
  clearAllSessions,
  type StoredAuthUser,
  type Panel,
} from './tokenStore';

export type AppRole = 'customer' | 'staff' | 'kitchen' | 'cleaning' | 'admin' | 'super-admin';

export type AuthUser = {
  id: string;
  name: string;
  role: AppRole;
  panel: Panel;
  internal_role?: string;
  restaurantName: string;
  restaurantId?: string;
  email?: string;
  mobile?: string;
};

type AuthContextValue = {
  /** Currently active panel user (whichever panel was most recently signed in). */
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  /** Get the stored user for a specific panel (may be null if that panel is not signed in). */
  getPanelUser: (panel: Panel) => AuthUser | null;
  /** Get the access token for a specific panel. */
  getPanelToken: (panel: Panel) => string | null;
  /** Check whether a specific panel is currently authenticated. */
  isPanelAuthenticated: (panel: Panel) => boolean;

  /** Sign in to a specific panel via the backend. */
  signIn: (input: { email?: string; mobile?: string; password: string; deviceLabel?: string }) => Promise<AuthUser>;
  /** Quick demo sign-in (no backend call). */
  signInAs: (role: AppRole) => void;
  /** Sign out from a specific panel only. Other panels remain authenticated. */
  signOut: (panel?: Panel) => void;
  /** Sign out from ALL panels. */
  signOutAll: () => void;
  /** Switch the "active" panel context (changes which user/token are returned by user/accessToken). */
  switchPanel: (panel: Panel) => void;

  setUser: (user: AuthUser | null) => void;
  setAccessTokenState: (token: string | null) => void;
};

type LoginResponse = {
  success: true;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      mobile: string;
      role: string;
      restaurantId?: string;
      restaurantName?: string;
      internal_role?: string;
    };
    accessToken: string;
    refreshToken: string;
    panel: Panel;
  };
};

// ── Mapping helpers ───────────────────────────────────────────────────

const APP_ROLE_TO_PANEL: Record<AppRole, Panel> = {
  customer: 'customer',
  kitchen: 'kitchen',
  staff: 'staff',
  cleaning: 'cleaning',
  admin: 'admin',
  'super-admin': 'superadmin',
};

function mapBackendRoleToAppRole(role: string): AppRole {
  switch (role) {
    case 'staff':
    case 'service-staff':
      return 'staff';
    case 'kitchen':
    case 'kitchen-staff':
      return 'kitchen';
    case 'cleaning':
    case 'cleaning-staff':
      return 'cleaning';
    case 'admin':
    case 'restaurant-admin':
      return 'admin';
    case 'super-admin':
      return 'super-admin';
    case 'customer':
      return 'customer';
    default:
      return 'customer';
  }
}

function appRoleToPanel(role: AppRole): Panel {
  return APP_ROLE_TO_PANEL[role];
}

function toAuthUser(user: StoredAuthUser, panelOverride?: Panel): AuthUser {
  const appRole = mapBackendRoleToAppRole(user.role);
  return {
    id: user.id,
    name: user.name,
    role: appRole,
    panel: panelOverride ?? user.panel ?? appRoleToPanel(appRole),
    internal_role: user.internal_role,
    restaurantId: user.restaurantId,
    restaurantName: user.restaurantName ?? 'Restaurant',
    email: user.email,
    mobile: user.mobile,
  };
}

// ── Demo profiles ─────────────────────────────────────────────────────

const roleProfiles: Record<AppRole, AuthUser> = {
  customer: { id: 'demo-customer', name: 'Guest Diner', role: 'customer', panel: 'customer', restaurantName: 'Amber Table' },
  staff: { id: 'demo-staff', name: 'Service Captain', role: 'staff', panel: 'staff', internal_role: 'FLOOR_SUPERVISOR', restaurantName: 'Amber Table' },
  kitchen: { id: 'demo-kitchen', name: 'Kitchen Lead', role: 'kitchen', panel: 'kitchen', internal_role: 'HEAD_CHEF', restaurantName: 'Amber Table' },
  cleaning: { id: 'demo-cleaning', name: 'Cleaning Lead', role: 'cleaning', panel: 'cleaning', internal_role: 'CLEANING_SUPERVISOR', restaurantName: 'Amber Table' },
  admin: { id: 'demo-admin', name: 'Restaurant Admin', role: 'admin', panel: 'admin', restaurantName: 'Amber Table' },
  'super-admin': { id: 'demo-super-admin', name: 'Platform Operator', role: 'super-admin', panel: 'superadmin', restaurantName: 'Graphura Cloud' },
};

// ── Active panel key ──────────────────────────────────────────────────

const ACTIVE_PANEL_KEY = 'ra/active-panel';

function getActivePanel(): Panel {
  return (localStorage.getItem(ACTIVE_PANEL_KEY) as Panel) ?? 'customer';
}

function setActivePanel(panel: Panel): void {
  localStorage.setItem(ACTIVE_PANEL_KEY, panel);
}

// ── Provider ──────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [activePanel, setActivePanelState] = useState<Panel>(() => getActivePanel());
  const [accessTokenState, setAccessTokenStateRaw] = useState<string | null>(() => getAccessToken(getActivePanel()));
  const [userState, setUserState] = useState<AuthUser | null>(() => {
    const storedUser = getStoredUser(getActivePanel());
    if (storedUser) return toAuthUser(storedUser);

    const storedRole = getStoredRole(getActivePanel()) as AppRole | null;
    return storedRole ? roleProfiles[storedRole] ?? null : null;
  });

  // ── Panel introspection ───────────────────────────────────────────

  const getPanelUser = useCallback((panel: Panel): AuthUser | null => {
    const stored = getStoredUser(panel);
    return stored ? toAuthUser(stored, panel) : null;
  }, []);

  const getPanelToken = useCallback((panel: Panel): string | null => {
    return getAccessToken(panel);
  }, []);

  const isPanelAuthenticated = useCallback((panel: Panel): boolean => {
    return Boolean(getAccessToken(panel) && getStoredUser(panel));
  }, []);

  // ── Panel switching ───────────────────────────────────────────────

  const switchPanel = useCallback((panel: Panel) => {
    setActivePanel(panel);
    setActivePanelState(panel);

    const token = getAccessToken(panel);
    const stored = getStoredUser(panel);

    setAccessTokenStateRaw(token);
    setUserState(stored ? toAuthUser(stored, panel) : null);
  }, []);

  // ── Sign-in ───────────────────────────────────────────────────────

  const signIn = useCallback(async (input: { email?: string; mobile?: string; password: string; deviceLabel?: string }): Promise<AuthUser> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', input);
    const payload = response.data.data;
    const panel = payload.panel;
    const nextUser = toAuthUser({ ...payload.user, panel }, panel);

    // Store panel-scoped credentials
    setStoredRole(panel, nextUser.role);
    setStoredUser(panel, { ...payload.user, panel });
    setAccessToken(panel, payload.accessToken);

    // Switch active context to this panel
    setActivePanel(panel);
    setActivePanelState(panel);
    setUserState(nextUser);
    setAccessTokenStateRaw(payload.accessToken);

    return nextUser;
  }, []);

  // ── Demo sign-in ──────────────────────────────────────────────────

  const signInAs = useCallback((role: AppRole) => {
    const panel = appRoleToPanel(role);
    const nextToken = `demo-token-${role}`;
    const profile = roleProfiles[role];

    setStoredRole(panel, role);
    setStoredUser(panel, {
      id: profile.id,
      name: profile.name,
      role,
      panel,
      internal_role: profile.internal_role,
      restaurantId: profile.restaurantId,
      restaurantName: profile.restaurantName,
    });
    setAccessToken(panel, nextToken);

    setActivePanel(panel);
    setActivePanelState(panel);
    setUserState(profile);
    setAccessTokenStateRaw(nextToken);
  }, []);

  // ── Sign-out ──────────────────────────────────────────────────────

  const signOut = useCallback((panel?: Panel) => {
    const targetPanel = panel ?? activePanel;
    clearPanelSession(targetPanel);

    // If signing out from the active panel, clear state
    if (targetPanel === activePanel) {
      setUserState(null);
      setAccessTokenStateRaw(null);
    }
  }, [activePanel]);

  const signOutAll = useCallback(() => {
    clearAllSessions();
    setUserState(null);
    setAccessTokenStateRaw(null);
  }, []);

  // ── Context value ─────────────────────────────────────────────────

  const value: AuthContextValue = {
    user: userState,
    accessToken: accessTokenState,
    isAuthenticated: Boolean(userState && accessTokenState),

    getPanelUser,
    getPanelToken,
    isPanelAuthenticated,

    signIn,
    signInAs,
    signOut,
    signOutAll,
    switchPanel,

    setUser: setUserState,
    setAccessTokenState: setAccessTokenStateRaw,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
