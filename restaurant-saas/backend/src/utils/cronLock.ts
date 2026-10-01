import mongoose, { Schema, Document } from 'mongoose';
import logger from '../config/logger';

interface ICronLock extends Document {
  jobName: string;
  lockedAt: Date;
  expiresAt: Date;
}

const CronLockSchema = new Schema<ICronLock>({
  jobName: { type: String, required: true, unique: true },
  lockedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

// Avoid recompiling model if already exists
export const CronLockModel = mongoose.models.CronLock || mongoose.model<ICronLock>('CronLock', CronLockSchema);

export async function acquireLock(jobName: string, durationSeconds: number): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

  try {
    const result = await CronLockModel.findOneAndUpdate(
      { jobName, $or: [{ expiresAt: { $lte: now } }, { lockedAt: { $exists: false } }] },
      { $set: { lockedAt: now, expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return !!result;
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error means another instance just acquired the lock
      return false;
    }
    logger.error(`Error acquiring cron lock for ${jobName}`, error);
    return false;
  }
}

export async function releaseLock(jobName: string): Promise<void> {
  try {
    await CronLockModel.deleteOne({ jobName });
  } catch (error) {
    logger.error(`Error releasing cron lock for ${jobName}`, error);
  }
}

export async function withLock<T>(jobName: string, durationSeconds: number, fn: () => Promise<T>): Promise<T | void> {
  const acquired = await acquireLock(jobName, durationSeconds);
  if (!acquired) {
    logger.info(`Job ${jobName} is already running on another instance. Skipping.`);
    return;
  }

  try {
    return await fn();
  } finally {
    await releaseLock(jobName);
  }
}
