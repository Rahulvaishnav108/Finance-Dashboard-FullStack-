import mongoose from 'mongoose';
import { env } from '../../config/env';
import {
  HEALTH_CONTRACT_DOCUMENT,
  HEALTH_RELEASE_DATE,
  HEALTH_SERVICE_NAME,
} from './health.constants';

const DATABASE_STATE_LABELS: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

function getApiVersion(): string {
  return env.API_PREFIX.split('/').filter(Boolean).at(-1) ?? 'v1';
}

function getUptimeSeconds(): number {
  return Math.round(process.uptime());
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function getDatabaseStateLabel(): string {
  return DATABASE_STATE_LABELS[mongoose.connection.readyState] ?? 'unknown';
}

export function isApplicationReady(): boolean {
  return mongoose.connection.readyState === 1 || env.allowNoDb;
}

export function getLivenessSnapshot() {
  return {
    status: 'ok',
    service: HEALTH_SERVICE_NAME,
    version: getApiVersion(),
    timestamp: getTimestamp(),
    environment: env.NODE_ENV,
    uptimeSeconds: getUptimeSeconds(),
  };
}

export function getReadinessSnapshot() {
  const connected = mongoose.connection.readyState === 1;
  const databaseStatus = connected ? 'connected' : env.allowNoDb ? 'skipped' : getDatabaseStateLabel();

  return {
    status: isApplicationReady() ? 'ready' : 'not_ready',
    service: HEALTH_SERVICE_NAME,
    version: getApiVersion(),
    timestamp: getTimestamp(),
    uptimeSeconds: getUptimeSeconds(),
    checks: {
      database: {
        status: databaseStatus,
        readyState: mongoose.connection.readyState,
        required: !env.allowNoDb,
      },
    },
  };
}

export function getVersionSnapshot() {
  return {
    version: getApiVersion(),
    service: HEALTH_SERVICE_NAME,
    releaseDate: HEALTH_RELEASE_DATE,
    contract: HEALTH_CONTRACT_DOCUMENT,
  };
}
