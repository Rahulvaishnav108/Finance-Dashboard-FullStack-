import mongoose from 'mongoose';
import { env } from '../../config/env';
import {
  getReadinessSnapshot,
  getVersionSnapshot,
  isApplicationReady,
} from '../../modules/health/health.service';

describe('health service', () => {
  const originalAllowNoDb = env.allowNoDb;
  const originalReadyStateDescriptor = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');

  afterEach(() => {
    env.allowNoDb = originalAllowNoDb;

    if (originalReadyStateDescriptor) {
      Object.defineProperty(mongoose.connection, 'readyState', originalReadyStateDescriptor);
      return;
    }

    delete (mongoose.connection as { readyState?: number }).readyState;
  });

  it('marks the app as not ready when the database is disconnected and ALLOW_NO_DB is false', () => {
    env.allowNoDb = false;
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });

    expect(isApplicationReady()).toBe(false);
    expect(getReadinessSnapshot()).toMatchObject({
      status: 'not_ready',
      checks: {
        database: {
          status: 'disconnected',
          readyState: 0,
          required: true,
        },
      },
    });
  });

  it('marks the app as ready when ALLOW_NO_DB is enabled even if the database is disconnected', () => {
    env.allowNoDb = true;
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });

    expect(isApplicationReady()).toBe(true);
    expect(getReadinessSnapshot()).toMatchObject({
      status: 'ready',
      checks: {
        database: {
          status: 'skipped',
          readyState: 0,
          required: false,
        },
      },
    });
  });

  it('returns the updated API document in the version snapshot', () => {
    expect(getVersionSnapshot()).toEqual({
      version: 'v1',
      service: 'restaurant-automation-backend',
      releaseDate: '2026-06-07',
      contract: 'restaurant_automation_api_documentation_updated.pdf',
    });
  });
});
