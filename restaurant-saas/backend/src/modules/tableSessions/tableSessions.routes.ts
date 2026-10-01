// src/modules/tableSessions/tableSessions.routes.ts
// Table session route definitions

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { requireSession } from '../../middleware/requireSession';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { sessionLimiter } from '../../middleware/rateLimiters';
import { UserRole } from '../../constants/roles';
import { startSessionSchema } from './tableSessions.schema';
import * as sessionController from './tableSessions.controller';

const router = Router();

// ── Public — QR scan session start (rate-limited) ────────────────────
router.post(
  '/start',
  sessionLimiter,
  validate({ body: startSessionSchema }),
  sessionController.startSession
);

// ── Public — Session recovery from stored token ──────────────────────
router.get('/recover', sessionController.recoverSession);

// ── Session-protected — current session info ─────────────────────────
router.get('/current', requireSession, sessionController.getCurrentSession);

// ── Staff-protected — session management ─────────────────────────────
router.post(
  '/:sessionId/end',
  requireAuth,
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  sessionController.endSession
);

router.get(
  '/:sessionId',
  requireAuth,
  roleGuard(UserRole.SERVICE_STAFF, UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN),
  sessionController.getSession
);

export default router;
