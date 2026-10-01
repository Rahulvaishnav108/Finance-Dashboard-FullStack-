// ── Panel-aware token store ──────────────────────────────────────────
// Each panel gets its own localStorage keys so sessions never collide.

export type Panel = 'customer' | 'kitchen' | 'staff' | 'cleaning' | 'admin' | 'superadmin';

const ALL_PANELS: Panel[] = ['customer', 'kitchen', 'staff', 'cleaning', 'admin', 'superadmin'];

function accessTokenKey(panel: Panel) {
  return `ra/${panel}/access-token`;
}

function userKey(panel: Panel) {
  return `ra/${panel}/user`;
}

function roleKey(panel: Panel) {
  return `ra/${panel}/role`;
}

// ── Legacy keys (kept for migration / backwards compat) ──────────────
const LEGACY_ACCESS_TOKEN_KEY = 'restaurant-automation/access-token';
const LEGACY_ROLE_KEY = 'restaurant-automation/demo-role';
const LEGACY_USER_KEY = 'restaurant-automation/user';

// ── Panel-scoped access token ─────────────────────────────────────────

export function getAccessToken(panel: Panel): string | null {
  return localStorage.getItem(accessTokenKey(panel));
}

export function setAccessToken(panel: Panel, token: string | null): void {
  if (!token) {
    localStorage.removeItem(accessTokenKey(panel));
    return;
  }
  localStorage.setItem(accessTokenKey(panel), token);
}

// ── Panel-scoped role ─────────────────────────────────────────────────

export function getStoredRole(panel: Panel): string | null {
  return localStorage.getItem(roleKey(panel));
}

export function setStoredRole(panel: Panel, role: string | null): void {
  if (!role) {
    localStorage.removeItem(roleKey(panel));
    return;
  }
  localStorage.setItem(roleKey(panel), role);
}

// ── Panel-scoped user ─────────────────────────────────────────────────

export type StoredAuthUser = {
  id: string;
  name: string;
  role: string;
  panel?: Panel;
  internal_role?: string;
  restaurantId?: string;
  restaurantName?: string;
  email?: string;
  mobile?: string;
};

export function getStoredUser(panel: Panel): StoredAuthUser | null {
  const raw = localStorage.getItem(userKey(panel));
  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as StoredAuthUser;
    if (user && user.name === 'Neha Admin') {
      user.name = 'Admin';
      localStorage.setItem(userKey(panel), JSON.stringify(user));
    }
    return user;
  } catch {
    localStorage.removeItem(userKey(panel));
    return null;
  }
}

export function setStoredUser(panel: Panel, user: StoredAuthUser | null): void {
  if (!user) {
    localStorage.removeItem(userKey(panel));
    return;
  }
  localStorage.setItem(userKey(panel), JSON.stringify(user));
}

// ── Clear a single panel's session ────────────────────────────────────

export function clearPanelSession(panel: Panel): void {
  localStorage.removeItem(accessTokenKey(panel));
  localStorage.removeItem(roleKey(panel));
  localStorage.removeItem(userKey(panel));
  localStorage.removeItem('otpExpiresAt');
  localStorage.removeItem('customerOtpExpiresAt');
}

// ── Clear ALL panel sessions ──────────────────────────────────────────

export function clearAllSessions(): void {
  for (const p of ALL_PANELS) {
    clearPanelSession(p);
  }
  // Also clean up legacy keys
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ROLE_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem('otpExpiresAt');
  localStorage.removeItem('customerOtpExpiresAt');
}

// ── Migrate legacy session to a panel ─────────────────────────────────

export function migrateLegacySession(panel: Panel): void {
  const legacyToken = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  const legacyRole = localStorage.getItem(LEGACY_ROLE_KEY);

  if (legacyToken && !localStorage.getItem(accessTokenKey(panel))) {
    localStorage.setItem(accessTokenKey(panel), legacyToken);
  }
  if (legacyUser && !localStorage.getItem(userKey(panel))) {
    localStorage.setItem(userKey(panel), legacyUser);
  }
  if (legacyRole && !localStorage.getItem(roleKey(panel))) {
    localStorage.setItem(roleKey(panel), legacyRole);
  }

  // Remove legacy keys after migration
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_ROLE_KEY);
}