import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../config/logger';

class SocketService {
  private io: SocketIOServer | null = null;

  /**
   * Set the Socket.io server instance and initialize events
   */
  public setIO(io: SocketIOServer): void {
    this.io = io;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Socket connected with verified identity: ${socket.id}`);

      // Auto-join rooms based on authenticated context to ensure realtime updates work
      if (socket.data.user && socket.data.user.restaurantId) {
        const restaurantId = socket.data.user.restaurantId.toString();
        socket.join(`restaurant:${restaurantId}`);
        logger.info(`👤 Auto-joined Socket ${socket.id} to restaurant room: ${restaurantId}`);
      }

      if (socket.data.session && socket.data.session._id) {
        const sessionId = socket.data.session._id.toString();
        socket.join(`session:${sessionId}`);
        logger.info(`👤 Auto-joined Socket ${socket.id} to session room: ${sessionId}`);
      }

      // Join room based on restaurantId (for staff/kitchen and customers)
      socket.on('join:restaurant', (restaurantId: string) => {
        const isStaff = socket.data.user && socket.data.user.restaurantId?.toString() === restaurantId;
        const isCustomer = socket.data.session && socket.data.session.restaurantId?.toString() === restaurantId;

        if (isStaff || isCustomer) {
          socket.join(`restaurant:${restaurantId}`);
          logger.info(`👤 Socket ${socket.id} joined restaurant room: ${restaurantId}`);
        } else {
          logger.warn(`🚫 Unauthorized join:restaurant attempt by socket ${socket.id} for restaurant ${restaurantId}`);
          socket.emit('error', { code: 'TENANT_VIOLATION', message: 'Unauthorized room subscription' });
        }
      });

      // Join room based on sessionId (for customer updates)
      socket.on('join:session', (sessionId: string) => {
        const isCustomer = socket.data.session && socket.data.session._id.toString() === sessionId;
        const isStaff = socket.data.user && socket.data.user.restaurantId; // Staff can view any session in their restaurant

        if (isCustomer || isStaff) {
          socket.join(`session:${sessionId}`);
          logger.info(`👤 Socket ${socket.id} joined session room: ${sessionId}`);
        } else {
          logger.warn(`🚫 Unauthorized join:session attempt by socket ${socket.id} for session ${sessionId}`);
          socket.emit('error', { code: 'TENANT_VIOLATION', message: 'Unauthorized room subscription' });
        }
      });

      // Join room based on role (for specific staff role updates)
      socket.on('join:role', ({ restaurantId, role }: { restaurantId: string; role: string }) => {
        if (
          restaurantId && role &&
          socket.data.user &&
          socket.data.user.restaurantId?.toString() === restaurantId &&
          socket.data.user.role === role
        ) {
          socket.join(`restaurant:${restaurantId}:role:${role}`);
          logger.info(`👤 Socket ${socket.id} joined role room: restaurant:${restaurantId}:role:${role}`);
        } else {
          logger.warn(`🚫 Unauthorized join:role attempt by socket ${socket.id} for role ${role}`);
          socket.emit('error', { code: 'TENANT_VIOLATION', message: 'Unauthorized room subscription' });
        }
      });

      // Join room based on userId (for direct user updates)
      socket.on('join:user', (userId: string) => {
        if (userId && socket.data.user && socket.data.user._id.toString() === userId) {
          socket.join(`user:${userId}`);
          logger.info(`👤 Socket ${socket.id} joined user room: user:${userId}`);
        } else {
          logger.warn(`🚫 Unauthorized join:user attempt by socket ${socket.id} for user ${userId}`);
          socket.emit('error', { code: 'TENANT_VIOLATION', message: 'Unauthorized room subscription' });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    logger.info('📡 Secure Socket.io events initialized');
  }

  /**
   * Emit event to a specific restaurant (staff/kitchen)
   */
  public emitToRestaurant(restaurantId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`restaurant:${restaurantId}`).emit(event, data);
  }

  /**
   * Emit event to a specific customer session
   */
  public emitToSession(sessionId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`session:${sessionId}`).emit(event, data);
  }

  /**
   * Emit event to a specific role in a restaurant
   */
  public emitToRole(restaurantId: string, role: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`restaurant:${restaurantId}:role:${role}`).emit(event, data);
  }

  /**
   * Emit event to a specific user
   */
  public emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

export const socketService = new SocketService();
