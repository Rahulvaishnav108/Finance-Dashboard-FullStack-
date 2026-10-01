import { startExpireSessionsJob } from './expireSessions.job';
import { startDailySalesReportJob } from './dailySalesReport.job';
import { startReservationReminderJob } from './reservationReminder.job';
import { startSubscriptionsLifecycleJob } from './subscriptionsLifecycle.job';
import { startSubscriptionUsageAggregationJob } from './subscriptionUsageAggregation.job';
import { logger } from '../config/logger';

/**
 * Orchestrates and starts all background jobs for the SaaS backend cleanly.
 * Called once during server boot.
 */
export function startBackgroundJobs(): void {
  try {
    startExpireSessionsJob();
    startDailySalesReportJob();
    startReservationReminderJob();
    startSubscriptionsLifecycleJob();
    startSubscriptionUsageAggregationJob();
    logger.info('All background cron jobs successfully initialized');
  } catch (error) {
    logger.error('Failed to initialize background cron jobs', { error });
  }
}
