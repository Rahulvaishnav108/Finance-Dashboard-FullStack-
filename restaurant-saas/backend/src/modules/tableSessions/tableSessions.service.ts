// src/modules/tableSessions/tableSessions.service.ts
// Table session business logic — lifecycle management for QR-based dining sessions

import crypto from 'crypto';
import mongoose from 'mongoose';
import { env } from '../../config/env';
import { TableSessionModel, ITableSession } from './tableSessions.model';
import { TableModel } from '../tables/tables.model';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import { SessionStatus, TableStatus, RestaurantStatus } from '../../constants/statuses';
import { emitSessionEvent } from '../../services/sessionEvents';
import { SocketEvent } from '../../constants/events';
import { updateTableStatus } from '../tables/tables.service';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import type { StartSessionInput } from './tableSessions.schema';

// ── Helper: generate a cryptographically secure session token ────────
function generateSessionToken(): string {
  return crypto.randomBytes(env.TABLE_SESSION_TOKEN_LENGTH).toString('hex');
}

// ── Start a brand-new session (classic flow) ─────────────────────────
export async function startSession(
  input: StartSessionInput,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<{ session: ITableSession; sessionToken: string }> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + env.QR_SESSION_EXPIRES_IN_MINUTES * 60_000);

  const session = await TableSessionModel.create({
    restaurantId: input.restaurantId,
    tableId: input.tableId,
    customerName: input.customerName,
    mobile: input.mobile,
    sessionToken,
    sessionStart: new Date(),
    expiresAt,
    lastActivityAt: new Date(),
    status: SessionStatus.ACTIVE,
    ipAddress: meta.ipAddress ?? null,
    userAgent: meta.userAgent ?? null,
    reservationId: input.reservationId ?? null,
  });

  // Mark table as OCCUPIED
  await updateTableStatus(input.tableId.toString(), TableStatus.OCCUPIED, input.restaurantId);
  await TableModel.findByIdAndUpdate(input.tableId, { currentSessionId: session._id });

  // Emit real-time event
  emitSessionEvent(input.restaurantId, SocketEvent.SESSION_STARTED, {
    sessionId: session._id,
    tableId: input.tableId,
    customerName: input.customerName,
  });

  return { session, sessionToken };
}

// ── Validate an existing session token ───────────────────────────────
export async function validateSession(token: string): Promise<ITableSession> {
  const session = await TableSessionModel.findOne({ sessionToken: token }).select('+sessionToken');
  if (!session) {
    throw new AppError('Invalid session token', 401, ErrorCode.SESSION_INVALID);
  }

  // Check status
  if (session.status !== SessionStatus.ACTIVE) {
    throw new AppError('Session is no longer active', 401, ErrorCode.SESSION_INVALID);
  }

  // Hard expiry check
  if (session.expiresAt.getTime() < Date.now()) {
    session.status = SessionStatus.EXPIRED;
    await session.save();
    await updateTableStatus(session.tableId.toString(), TableStatus.NEEDS_CLEANING, session.restaurantId.toString());
    await TableModel.findByIdAndUpdate(session.tableId, { currentSessionId: null });
    throw new AppError('Session has expired', 401, ErrorCode.TABLE_SESSION_EXPIRED);
  }

  // Idle timeout check
  const idleLimit = env.SESSION_IDLE_TIMEOUT_MINUTES * 60_000;
  if (Date.now() - session.lastActivityAt.getTime() > idleLimit) {
    session.status = SessionStatus.EXPIRED;
    await session.save();
    await updateTableStatus(session.tableId.toString(), TableStatus.NEEDS_CLEANING, session.restaurantId.toString());
    await TableModel.findByIdAndUpdate(session.tableId, { currentSessionId: null });
    throw new AppError('Session idle timeout exceeded', 401, ErrorCode.SESSION_IDLE_TIMEOUT);
  }

  return session;
}

// ── Touch activity timestamp ─────────────────────────────────────────
export async function touchActivity(sessionId: string): Promise<void> {
  await TableSessionModel.findByIdAndUpdate(sessionId, {
    lastActivityAt: new Date(),
  });
}

// ── Recover a session from a stored token ────────────────────────────
export async function recoverSession(token: string): Promise<ITableSession> {
  const session = await validateSession(token);
  return session;
}

// ── End a session (staff or customer) ────────────────────────────────
export async function endSession(
  sessionId: string,
  restaurantId: string,
  reason: string,
): Promise<ITableSession> {
  const session = await TableSessionModel.findOne({ _id: sessionId, restaurantId });
  if (!session) {
    throw new AppError('Session not found', 404, ErrorCode.NOT_FOUND);
  }

  session.status = SessionStatus.CLOSED;
  await session.save();

  // Mark table for cleaning
  await updateTableStatus(session.tableId.toString(), TableStatus.NEEDS_CLEANING, restaurantId);
  await TableModel.findByIdAndUpdate(session.tableId, { currentSessionId: null });

  emitSessionEvent(restaurantId, SocketEvent.SESSION_CLOSED, {
    sessionId: session._id,
    tableId: session.tableId,
    reason,
  });

  return session;
}

// ── Expire a session (background job) ────────────────────────────────
export async function expireSession(sessionId: string): Promise<ITableSession> {
  const session = await TableSessionModel.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404, ErrorCode.NOT_FOUND);
  }

  if (session.status !== SessionStatus.ACTIVE) {
    return session; // Already handled
  }

  session.status = SessionStatus.EXPIRED;
  await session.save();

  // Mark table for cleaning
  await updateTableStatus(session.tableId.toString(), TableStatus.NEEDS_CLEANING, session.restaurantId.toString());
  await TableModel.findByIdAndUpdate(session.tableId, { currentSessionId: null });

  emitSessionEvent(session.restaurantId.toString(), SocketEvent.SESSION_EXPIRED, {
    sessionId: session._id,
    tableId: session.tableId,
    reason: 'expired',
  });

  return session;
}

// ── Get session by ID ────────────────────────────────────────────────
export async function getSessionById(sessionId: string, restaurantId: string): Promise<ITableSession> {
  const session = await TableSessionModel.findOne({ _id: sessionId, restaurantId });
  if (!session) {
    throw new AppError('Session not found', 404, ErrorCode.NOT_FOUND);
  }
  return session;
}

// ── Init table session from QR token (secure flow) ───────────────────
// Used by the public endpoint: POST /api/v1/public/table-session/init
export async function initTableSession(
  qrToken: string,
  details?: { name?: string; mobile?: string },
  meta?: { ipAddress?: string; userAgent?: string },
  clientSessionToken?: string,
): Promise<{ session: ITableSession; sessionToken: string; tableNumber: string }> {
  // 1. Look up table by qrToken (consistently camelCase)
  let table = await TableModel.findOne({ qrToken });
  if (!table && mongoose.Types.ObjectId.isValid(qrToken)) {
    table = await TableModel.findOne({ _id: qrToken });
  }
  if (!table) {
    // Log invalid QR attempt
    void logAuditRaw({
      actorId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
      actorRole: 'CUSTOMER',
      entityType: AuditEntity.QR,
      entityId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
      action: AuditAction.INVALID_QR_ATTEMPT,
      metadata: { qrToken, reason: 'invalid_token' },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AppError('Invalid or regenerated QR code', 404, ErrorCode.SESSION_INVALID);
  }

  // 2. Check if table is active
  if (!table.isActive) {
    void logAuditRaw({
      actorId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
      actorRole: 'CUSTOMER',
      restaurantId: table.restaurantId.toString(),
      entityType: AuditEntity.QR,
      entityId: table._id.toString(),
      action: AuditAction.INVALID_QR_ATTEMPT,
      metadata: { qrToken, tableId: table._id, reason: 'table_inactive' },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AppError('Table is blocked/disabled. Please contact staff.', 400, ErrorCode.TABLE_INACTIVE);
  }

  // 3. Check if restaurant is active
  const restaurant = await RestaurantModel.findById(table.restaurantId);
  if (!restaurant || restaurant.status !== RestaurantStatus.ACTIVE) {
    void logAuditRaw({
      actorId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
      actorRole: 'CUSTOMER',
      restaurantId: table.restaurantId.toString(),
      entityType: AuditEntity.QR,
      entityId: table._id.toString(),
      action: AuditAction.INVALID_QR_ATTEMPT,
      metadata: { qrToken, tableId: table._id, reason: 'restaurant_inactive' },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AppError('Restaurant is disabled', 400, ErrorCode.FORBIDDEN);
  }

  // 4. Check if there is already an active session for this table
  const existingSession = await TableSessionModel.findOne({
    tableId: table._id,
    restaurantId: table.restaurantId,
    status: SessionStatus.ACTIVE,
  }).select('+sessionToken');

  if (existingSession) {
    // Check if the existing session is expired or idle timed out
    const isHardExpired = existingSession.expiresAt.getTime() < Date.now();
    const idleLimit = env.SESSION_IDLE_TIMEOUT_MINUTES * 60_000;
    const isIdleExpired = Date.now() - existingSession.lastActivityAt.getTime() > idleLimit;

    if (isHardExpired || isIdleExpired) {
      // Mark session as EXPIRED
      existingSession.status = SessionStatus.EXPIRED;
      await existingSession.save();

      // Mark table as Needs Cleaning (DIRTY)
      table.status = TableStatus.NEEDS_CLEANING;
      table.currentSessionId = null;
      await table.save();

      void logAuditRaw({
        actorId: existingSession._id.toString(),
        actorRole: 'CUSTOMER',
        restaurantId: table.restaurantId.toString(),
        entityType: AuditEntity.TABLE_SESSION,
        entityId: existingSession._id.toString(),
        action: AuditAction.SESSION_EXPIRED,
        metadata: {
          tableId: table._id,
          reason: isHardExpired ? 'hard_expiry' : 'idle_timeout',
        },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      throw new AppError('Dining session has expired. Please rescan.', 401, ErrorCode.TABLE_SESSION_EXPIRED);
    }

    // Determine ownership to allow rejoining
    let isOwner = false;
    if (clientSessionToken && existingSession.sessionToken === clientSessionToken) {
      isOwner = true;
    }
    if (details?.mobile && details.mobile !== '0000000000' && existingSession.mobile === details.mobile) {
      isOwner = true;
    }

    if (!isOwner) {
      void logAuditRaw({
        actorId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
        actorRole: 'CUSTOMER',
        restaurantId: table.restaurantId.toString(),
        entityType: AuditEntity.QR,
        entityId: table._id.toString(),
        action: AuditAction.INVALID_QR_ATTEMPT,
        metadata: { qrToken, tableId: table._id, status: table.status, reason: 'table_occupied_by_other' },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new AppError(`Table ${table.tableNumber} is already occupied by another customer`, 400, ErrorCode.TABLE_ALREADY_OCCUPIED);
    }

    // Return existing session for rejoining
    return {
      session: existingSession,
      sessionToken: existingSession.sessionToken,
      tableNumber: table.tableNumber,
    };
  }

  // 5. If table is not available (e.g. Needs Cleaning, Cleaning, Reserved, Paid, Blocked), throw specific errors
  const statusStr = table.status as string;
  if (statusStr === TableStatus.RESERVED) {
    throw new AppError('This table is reserved. Please contact staff.', 400, ErrorCode.TABLE_ALREADY_OCCUPIED);
  }
  if (
    statusStr === TableStatus.DIRTY ||
    statusStr === TableStatus.NEEDS_CLEANING ||
    statusStr === TableStatus.CLEANING ||
    statusStr === TableStatus.CLEANING_IN_PROGRESS
  ) {
    throw new AppError('This table is currently being cleaned. Please wait or choose another table.', 400, ErrorCode.TABLE_ALREADY_OCCUPIED);
  }
  if (
    statusStr !== TableStatus.AVAILABLE &&
    statusStr !== TableStatus.OCCUPIED
  ) {
    void logAuditRaw({
      actorId: new mongoose.Types.ObjectId('000000000000000000000000').toString(),
      actorRole: 'CUSTOMER',
      restaurantId: table.restaurantId.toString(),
      entityType: AuditEntity.QR,
      entityId: table._id.toString(),
      action: AuditAction.INVALID_QR_ATTEMPT,
      metadata: { qrToken, tableId: table._id, status: table.status, reason: 'table_occupied' },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });
    throw new AppError(`Table ${table.tableNumber} is not available for seating.`, 400, ErrorCode.TABLE_ALREADY_OCCUPIED);
  }

  // 6. Create a brand new session
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + env.QR_SESSION_EXPIRES_IN_MINUTES * 60_000);

  const session = await TableSessionModel.create({
    restaurantId: table.restaurantId,
    tableId: table._id,
    customerName: details?.name ?? 'Guest',
    mobile: details?.mobile ?? '0000000000',
    sessionToken,
    sessionStart: new Date(),
    expiresAt,
    lastActivityAt: new Date(),
    status: SessionStatus.ACTIVE,
    ipAddress: meta?.ipAddress ?? null,
    userAgent: meta?.userAgent ?? null,
  });

  // Mark table as OCCUPIED
  table.status = TableStatus.OCCUPIED;
  table.currentSessionId = session._id;
  await table.save();

  emitSessionEvent(table.restaurantId.toString(), SocketEvent.SESSION_STARTED, {
    sessionId: session._id,
    tableId: table._id,
    tableNumber: table.tableNumber,
  });

  return { session, sessionToken, tableNumber: table.tableNumber };
}
