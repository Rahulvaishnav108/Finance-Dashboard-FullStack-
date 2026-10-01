import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../services/jwt.service';
import { validateSession } from '../modules/tableSessions/tableSessions.service';
import { socketService } from './socket.service';

let io: Server | null = null;

export function createSocketServer(server: HttpServer): Server {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const sessionToken = socket.handshake.auth?.sessionToken;

      if (token) {
        const decoded = verifyAccessToken(token);
        socket.data.user = decoded;
        return next();
      }

      if (sessionToken) {
        const session = await validateSession(sessionToken);
        socket.data.session = session;
        return next();
      }

      next(new Error('Authentication error'));
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket client connected', { socketId: socket.id });

    socket.on('disconnect', (reason) => {
      logger.info('Socket client disconnected', { socketId: socket.id, reason });
    });
  });

  socketService.setIO(io);

  return io;
}
