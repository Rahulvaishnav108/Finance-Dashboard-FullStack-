import axios from 'axios';
import { env } from '../../lib/env';
import { getAccessToken, clearPanelSession, type Panel } from '../../auth/tokenStore';

const ACTIVE_PANEL_KEY = 'ra/active-panel';

function getActivePanel(): Panel {
  return (localStorage.getItem(ACTIVE_PANEL_KEY) as Panel) ?? 'customer';
}

function getPanelFromUrl(url: string | undefined): Panel | null {
  if (!url) return null;

  // Remove baseURL, protocol, domain, and API prefix if present
  const cleanPath = url
    .replace(/^(https?:\/\/[^/]+)?/, '') // remove http://host
    .replace(/^\/?api\/v\d+/, '')         // remove /api/v1 or api/v1
    .replace(/^\/?api/, '');              // remove /api or api

  if (cleanPath.startsWith('/admin') || cleanPath.startsWith('admin')) return 'admin';
  if (cleanPath.startsWith('/superadmin') || cleanPath.startsWith('superadmin') || cleanPath.startsWith('/super-admin') || cleanPath.startsWith('super-admin')) return 'superadmin';
  if (cleanPath.startsWith('/kitchen') || cleanPath.startsWith('kitchen')) return 'kitchen';
  if (cleanPath.startsWith('/staff') || cleanPath.startsWith('staff')) return 'staff';
  if (cleanPath.startsWith('/cleaning') || cleanPath.startsWith('cleaning')) return 'cleaning';
  if (cleanPath.startsWith('/customer') || cleanPath.startsWith('customer')) return 'customer';

  return null;
}

export function getSessionToken(): string | null {
  return localStorage.getItem('x-session-token');
}

export function setSessionToken(token: string): void {
  localStorage.setItem('x-session-token', token);
}

export function removeSessionToken(): void {
  localStorage.removeItem('x-session-token');
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // Resolve the access token from the URL prefix or the currently active panel
  const panel = getPanelFromUrl(config.url) || getActivePanel();
  const token = getAccessToken(panel);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const sessionToken = getSessionToken();
  if (sessionToken) {
    config.headers['x-session-token'] = sessionToken;
  }

  return config;
});

// Response interceptor to handle token expiration (401 with code TOKEN_EXPIRED, TOKEN_INVALID, UNAUTHORIZED)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorCode = data?.error?.code;

      if (
        status === 401 &&
        (errorCode === 'TOKEN_EXPIRED' ||
          errorCode === 'TOKEN_INVALID' ||
          errorCode === 'UNAUTHORIZED')
      ) {
        const panel = getPanelFromUrl(error.config?.url) || getActivePanel();
        clearPanelSession(panel);

        // Redirect to login page for that panel
        const loginPath = panel === 'customer' ? '/auth/customer' : `/auth/${panel}`;
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);
