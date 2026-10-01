// src/lib/socket.ts
// Socket.IO client — connects to the backend for real-time events

import { io, Socket } from 'socket.io-client';
import { env } from './env';
import { getAccessToken, type Panel } from '../auth/tokenStore';
import { getSessionToken } from '../shared/services/apiClient';

const ACTIVE_PANEL_KEY = 'ra/active-panel';

let socket: Socket | null = null;

function getActivePanel(): Panel {
  return (localStorage.getItem(ACTIVE_PANEL_KEY) as Panel) ?? 'customer';
}

/**
 * Connect or reconnect the Socket.IO client.
 * Attaches the current JWT and session token for authentication.
 */
export function connectSocket(): void {
  if (socket?.connected) return;

  const panel = getActivePanel();
  const token = getAccessToken(panel);
  const sessionToken = getSessionToken();

  socket = io(env.socketUrl, {
    autoConnect: true,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: token ?? undefined,
      sessionToken: sessionToken ?? undefined,
    },
  });

  socket.on('connect', () => {
    if (env.debug) {
      console.log('[Socket] Connected:', socket?.id);
    }
  });

  socket.on('disconnect', (reason) => {
    if (env.debug) {
      console.log('[Socket] Disconnected:', reason);
    }
  });

  socket.on('connect_error', (error) => {
    if (env.debug) {
      console.error('[Socket] Connection error:', error.message);
    }
  });
}

/**
 * Disconnect the Socket.IO client.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket;
}
