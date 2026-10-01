import cron from 'node-cron';
import { TableSessionModel } from '../modules/tableSessions/tableSessions.model';
import { expireSession } from '../modules/tableSessions/tableSessions.service';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { SessionStatus } from '../constants/statuses';

/**
 * Scans for and cleanly expires any table sessions that have passed
 * their hard expiry limit or exceeded the idle timeout threshold.
 */
export async function runSessionCleanup(): Promise<void> {
  const startTime = Date.now();
  let scannedCount = 0;
  let expiredCount = 0;
  let failedCount = 0;
  const errors: any[] = [];

  try {
    const now = new Date();
    const idleTimeoutMs = env.SESSION_IDLE_TIMEOUT_MINUTES * 60_000;
    const idleThreshold = new Date(Date.now() - idleTimeoutMs);

    // Query active sessions exceeding limits, batched at 100 to prevent memory pressure
    const sessions = await TableSessionModel.find({
      status: SessionStatus.ACTIVE,
      $or: [
        { expiresAt: { $lt: now } },
        { lastActivityAt: { $lt: idleThreshold } },
      ],
    }).limit(100);

    scannedCount = sessions.length;

    for (const session of sessions) {
      try {
        // Isolated try/catch: one failure won't halt the entire batch cleanup
        await expireSession(session._id.toString());
        expiredCount++;
      } catch (error) {
        failedCount++;
        errors.push({ sessionId: session._id, error });
        logger.error(`Failed to cleanly expire session ${session._id}`, { error });
      }
    }
  } catch (error) {
    logger.error('CRITICAL: Failed to execute background session cleanup job', { error });
  } finally {
    const duration = Date.now() - startTime;
    if (scannedCount > 0) {
      logger.info('🧹 Background session cleanup completed', {
        scannedSessions: scannedCount,
        expiredSessions: expiredCount,
        failedExpirations: failedCount,
        cleanupDurationMs: duration,
        ...(errors.length > 0 && { failedErrors: errors }),
      });
    }
  }
}

/**
 * Initializes and schedules the session cleanup job to run every 1 minute.
 */
export function startExpireSessionsJob(): cron.ScheduledTask {
  // Run every minute
  const task = cron.schedule('* * * * *', async () => {
    logger.debug('Running scheduled session cleanup job...');
    await runSessionCleanup();
  });

  logger.info('⏰ Session cleanup cron job scheduled (every 1 minute)');
  return task;
}
