import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import * as tablesService from '../tables/tables.service';
import type { StartSessionInput } from './tableSessions.schema';
import * as sessionService from './tableSessions.service';
import { logAuditRaw } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { UserModel } from '../users/users.model';
import { TableSessionModel } from './tableSessions.model';

export async function startSession(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as StartSessionInput;
    const meta = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const { session, sessionToken } = await sessionService.startSession(input, meta);

    ok(
      res,
      {
        session: {
          ...session.toObject(),
          token: sessionToken,
        },
        sessionId: session._id,
        restaurantId: session.restaurantId,
        tableId: session.tableId,
        customerName: session.customerName,
        sessionToken,
        expiresAt: session.expiresAt,
        status: session.status,
      },
      201,
    );
    void logAuditRaw({
      actorId:      session._id.toString(),
      actorRole:    'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType:   AuditEntity.TABLE_SESSION,
      entityId:     session._id.toString(),
      action:       AuditAction.SESSION_CREATED,
      metadata: {
        tableId:      session.tableId,
        customerName: session.customerName,
        expiresAt:    session.expiresAt,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    next(error);
  }
}

export async function validateTableSessionController(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await sessionService.validateSession(req.body.token);
    ok(res, { session });
  } catch (error) {
    next(error);
  }
}

export async function createTableSessionController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await tablesService.findByQrToken(req.body.token);
    const { session, sessionToken } = await sessionService.startSession(
      {
        restaurantId: table.restaurantId.toString(),
        tableId: table._id.toString(),
        customerName: req.body.customerName,
        mobile: req.body.mobile ?? '0000000000',
      },
      {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    );

    ok(
      res,
      {
        session: {
          ...session.toObject(),
          token: sessionToken,
        },
        sessionId: session._id,
        restaurantId: session.restaurantId,
        tableId: session.tableId,
        sessionToken,
        expiresAt: session.expiresAt,
        status: session.status,
      },
      201,
    );
    void logAuditRaw({
      actorId:      session._id.toString(),
      actorRole:    'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType:   AuditEntity.TABLE_SESSION,
      entityId:     session._id.toString(),
      action:       AuditAction.SESSION_CREATED,
      metadata: {
        tableId:   session.tableId,
        expiresAt: session.expiresAt,
        source:    'qr_scan',          // distinguishes QR scan vs direct startSession
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentSession(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { session: req.tableSession });
  } catch (error) {
    next(error);
  }
}

export async function recoverSession(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['x-session-token'] as string;
    if (!token) {
      throw new AppError('x-session-token header is required', 400, ErrorCode.INVALID_REQUEST);
    }

    const session = await sessionService.recoverSession(token);

    const populatedSession = await TableSessionModel.findById(session._id)
      .populate('tableId')
      .populate('restaurantId');

    if (!populatedSession) {
      throw new AppError('Failed to populate session', 500, ErrorCode.INTERNAL_ERROR);
    }

    const tableObj = populatedSession.tableId as any;
    const restaurantObj = populatedSession.restaurantId as any;

    const responsePayload = {
      sessionToken: token,
      session: {
        session_id: populatedSession._id.toString(),
        sessionId: populatedSession._id.toString(),
        _id: populatedSession._id.toString(),
        id: populatedSession._id.toString(),
        expires_at: populatedSession.expiresAt.toISOString(),
        table: {
          id: tableObj?._id?.toString() ?? '',
          _id: tableObj?._id?.toString() ?? '',
          table_no: tableObj?.tableNumber ?? 'Unknown',
          section: tableObj?.section ?? 'Main',
          capacity: tableObj?.capacity ?? 4,
        },
        restaurant: {
          id: restaurantObj?._id?.toString() ?? '',
          _id: restaurantObj?._id?.toString() ?? '',
          name: restaurantObj?.name ?? 'Restaurant',
        },
      },
    };

    return res.status(200).json({
      success: true,
      ...responsePayload,
      data: responsePayload,
    });
  } catch (error) {
    next(error);
  }
}

export async function endSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    // req.user is guaranteed by roleGuard
    const session = await sessionService.endSession(sessionId, req.user!.restaurantId!.toString(), 'staff_closed');

    ok(res, { session });
     void logAuditRaw({
      actorId:      sessionId,
      actorRole:    req.user?.role ?? 'STAFF',
      restaurantId: session.restaurantId?.toString(),
      entityType:   AuditEntity.TABLE_SESSION,
      entityId:     sessionId,
      action:       AuditAction.SESSION_ENDED,
      metadata: {
        tableId:   session.tableId,
        closedBy:  req.user?.id ?? 'staff',
        reason:    'staff_closed',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    next(error);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.getSessionById(sessionId, req.user!.restaurantId!.toString());
    ok(res, { session });
  } catch (error) {
    next(error);
  }
}

export async function initTableSessionController(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Token is required', 400, ErrorCode.INVALID_REQUEST);
    }

    const meta = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    let details: { name?: string; mobile?: string } | undefined = undefined;
    if (req.user) {
      const dbUser = await UserModel.findById(req.user.id);
      if (dbUser) {
        details = { name: dbUser.name, mobile: dbUser.mobile };
      }
    }

    const clientSessionToken = req.headers['x-session-token'] as string | undefined;

    const { session, sessionToken, tableNumber } = await sessionService.initTableSession(token, details, meta, clientSessionToken);

    const populatedSession = await TableSessionModel.findById(session._id)
      .populate('tableId')
      .populate('restaurantId');

    if (!populatedSession) {
      throw new AppError('Failed to populate session', 500, ErrorCode.INTERNAL_ERROR);
    }

    const tableObj = populatedSession.tableId as any;
    const restaurantObj = populatedSession.restaurantId as any;

    // Log SESSION_CREATED
    void logAuditRaw({
      actorId: session._id.toString(),
      actorRole: 'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType: AuditEntity.TABLE_SESSION,
      entityId: session._id.toString(),
      action: AuditAction.SESSION_CREATED,
      metadata: {
        tableId: session.tableId,
        tableNumber,
        expiresAt: session.expiresAt,
        source: 'qr_init',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Log QR_SCANNED
    void logAuditRaw({
      actorId: session._id.toString(),
      actorRole: 'CUSTOMER',
      restaurantId: session.restaurantId.toString(),
      entityType: AuditEntity.QR,
      entityId: tableObj?._id?.toString() ?? session.tableId.toString(),
      action: AuditAction.QR_SCANNED,
      metadata: {
        tableId: session.tableId,
        tableNumber,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return res.status(200).json({
      success: true,
      sessionToken,
      session: {
        session_id: populatedSession._id.toString(),
        expires_at: populatedSession.expiresAt.toISOString(),
        table: {
          id: tableObj?._id?.toString() ?? '',
          _id: tableObj?._id?.toString() ?? '',
          table_no: tableObj?.tableNumber ?? 'Unknown',
          section: tableObj?.section ?? 'Main',
          capacity: tableObj?.capacity ?? 4,
        },
        restaurant: {
          id: restaurantObj?._id?.toString() ?? '',
          _id: restaurantObj?._id?.toString() ?? '',
          name: restaurantObj?.name ?? 'Restaurant',
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
