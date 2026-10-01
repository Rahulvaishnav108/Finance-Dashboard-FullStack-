import { createServer } from 'http';
import app from './app';
import { connectToDatabase, disconnectFromDatabase } from './config/db';
import { env } from './config/env';
import { initializeCollections } from './config/initDB';
import { seedDevelopmentData } from './config/seed';
import { logger } from './config/logger';
import { createSocketServer } from './sockets';
import { startBackgroundJobs } from './jobs';
import { verifySmtpConnection } from './services/mail.service';


const server = createServer(app);
createSocketServer(server);

let isDatabaseConnected = false;
let shutdownStarted = false;

async function bootstrap(): Promise<void> {
  try {
    try {
      await connectToDatabase();
      isDatabaseConnected = true;
      await initializeCollections();
      if (env.seedOnStartup) {
        await seedDevelopmentData();
      }
      startBackgroundJobs();
      await verifySmtpConnection();
    } catch (error) {
      if (!env.allowNoDb) {
        throw error;
      }

      logger.warn('Database connection failed, continuing in no-db development mode', {
        error,
        mongoUri: env.MONGODB_URI,
      });
    }

    server.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`, {
        apiPrefix: env.API_PREFIX,
        databaseConnected: isDatabaseConnected,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (shutdownStarted) {
    return;
  }

  shutdownStarted = true;
  logger.warn(`Received ${signal}. Starting graceful shutdown.`);

  server.close(async () => {
    if (isDatabaseConnected) {
      await disconnectFromDatabase();
    }

    logger.info('HTTP server closed');
    process.exit(0);
  });
}

void bootstrap();

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { error: reason });
  void shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  void shutdown('uncaughtException');
});