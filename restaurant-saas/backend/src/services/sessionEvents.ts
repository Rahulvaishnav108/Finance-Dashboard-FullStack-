// src/services/sessionEvents.ts
// Socket.IO event emission helper with no-op fallback
// Plugs into any Socket.IO server once initialized

import { Server as SocketServer } from 'socket.io';
import logger from '../config/logger';

let io: SocketServer | null = null;

/**
 * Initialize the event emitter with a Socket.IO server instance.
 * Call this once during server startup after Socket.IO is configured.
 */
export function initSessionEvents(socketServer: SocketServer): void {
  io = socketServer;
  logger.info('Session event emitter initialized with Socket.IO server');
}

/**
 * Emit a session/table lifecycle event to a restaurant's room.
 * No-op if Socket.IO server has not been initialized yet.
 *
 * @param restaurantId - The restaurant room to emit to
 * @param event - The event name from SocketEvent constants
 * @param data - The event payload
 */
export function emitSessionEvent(restaurantId: string, event: string, data: any): void {
  if (!io) {
    // No-op — Socket.IO server not yet initialized
    // This is expected during testing or before server setup
    return;
  }

  try {
    io.to(`restaurant:${restaurantId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`Failed to emit event ${event}`, err);
  }
}
