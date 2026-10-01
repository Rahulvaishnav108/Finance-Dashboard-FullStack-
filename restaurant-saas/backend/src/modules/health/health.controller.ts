import type { Request, Response } from 'express';
import { fail, ok } from '../../utils/responses';
import {
  getLivenessSnapshot,
  getReadinessSnapshot,
  getVersionSnapshot,
  isApplicationReady,
} from './health.service';

export function getHealth(_req: Request, res: Response): void {
  ok(res, getLivenessSnapshot());
}

export function getReady(_req: Request, res: Response): void {
  const snapshot = getReadinessSnapshot();

  if (!isApplicationReady()) {
    fail(res, 'SERVICE_UNAVAILABLE', 'Database not ready', 503, {
      checks: snapshot.checks,
      status: snapshot.status,
    });
    return;
  }

  ok(res, snapshot);
}

export function getVersion(_req: Request, res: Response): void {
  ok(res, getVersionSnapshot());
}
