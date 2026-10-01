// src/config/initDB.ts
// Creates all collections defined in the PRD so they appear in MongoDB Compass.
// Collections are created empty if they don't already exist.

import mongoose from 'mongoose';
import logger from './logger';

/**
 * All collections from PRD Section 20 — MongoDB Collections
 */
const COLLECTIONS = [
  'users',
  'restaurants',
  'tables',
  'tableSessions',
  'reservations',
  'queues',
  'menuCategories',
  'menuItems',
  'carts',
  'orders',
  'kitchenBatches',
  'payments',
  'offers',
  'inventoryItems',
  'feedback',
  'notifications',
  'staffRequests',
  'staffShiftAssignments',
  'cleaningTasks',
  'auditLogs',
  'plans',
  'featureFlags',
] as const;

/**
 * Initialize database collections.
 * Creates collections that don't exist yet — idempotent (safe to call multiple times).
 */
export async function initializeCollections(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    logger.warn('Cannot initialize collections — no active database connection');
    return;
  }

  try {
    // Get list of existing collections
    const existing = await db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));

    let created = 0;
    for (const name of COLLECTIONS) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        created++;
      }
    }

    if (created > 0) {
      logger.info(`📂 Created ${created} new collection(s) in database`);
    } else {
      logger.info('📂 All collections already exist');
    }
  } catch (error) {
    logger.error('Failed to initialize collections:', { error });
    // Non-fatal — app can still run without pre-created collections
  }
}
