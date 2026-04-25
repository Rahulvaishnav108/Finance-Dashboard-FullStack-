'use strict';

const app    = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { getDb, closeDb } = require('./config/database');

// Initialise DB on startup
try {
  getDb();
  logger.info('Database initialised successfully');
} catch (err) {
  logger.error('Database initialisation failed', { error: err.message });
  process.exit(1);
}

const server = app.listen(config.port, () => {
  logger.info(`Finance API running`, {
    port: config.port,
    env:  config.env,
    pid:  process.pid,
  });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown…`);

  server.close(err => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }
    closeDb();
    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force-kill after 10s if something hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  shutdown('uncaughtException');
});

module.exports = server;
