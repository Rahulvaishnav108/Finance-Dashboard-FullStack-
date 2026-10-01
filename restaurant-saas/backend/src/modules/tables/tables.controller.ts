import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { TableModel } from './tables.model';
import type { UpdateTableStatusInput } from './tables.schema';
import * as tablesService from './tables.service';
import { generateQrPng, generateQrSvg, generateTablesPdf } from '../../services/qr.service';
import { env } from '../../config/env';
import { logAudit } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { socketService } from '../../sockets/socket.service';
import { SocketEvent } from '../../constants/events';

function resolveRestaurantId(
  req: Request,
  options: { allowBody?: boolean; allowParams?: boolean } = {}
): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (options.allowBody && typeof req.body?.restaurantId === 'string' && req.body.restaurantId.trim()) {
    return req.body.restaurantId;
  }

  if (options.allowParams && typeof req.params.restaurantId === 'string' && req.params.restaurantId.trim()) {
    return req.params.restaurantId;
  }

  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

export async function findByQrCodeController(req: Request, res: Response, next: NextFunction) {
  try {
    const { qrCode } = req.params;
    const table = await tablesService.findByQrCode(qrCode);
    ok(res, { table });
  } catch (error) {
    next(error);
  }
}

export async function updateTableStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body as UpdateTableStatusInput;
    const table = await tablesService.updateTableStatus(id, status, resolveRestaurantId(req));
    ok(res, { table });
  } catch (error) {
    next(error);
  }
}

function getRestaurantId(req: Request): string {
  return resolveRestaurantId(req, { allowBody: true, allowParams: true });
}

function getOwnedRestaurantId(req: Request, candidateRestaurantId?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (typeof candidateRestaurantId === 'string' && candidateRestaurantId.trim()) {
    return candidateRestaurantId.trim();
  }

  return resolveRestaurantId(req, { allowBody: true, allowParams: true });
}

export async function createTableController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await tablesService.createTable({
      restaurantId: getOwnedRestaurantId(req, req.body.restaurantId),
      tableNumber: String(req.body.tableNumber ?? req.body.number ?? req.body.name ?? 'Table'),
      capacity: Number(req.body.capacity),
      floor: req.body.floor !== undefined ? Number(req.body.floor) : undefined,
      section: req.body.section,
      assignedStaffId: req.body.assignedStaffId ?? null,
      qrCode: req.body.qrCode,
    });

    ok(res, { table }, 201);
  } catch (error) {
    next(error);
  }
}

export async function bulkCreateTablesController(req: Request, res: Response, next: NextFunction) {
  try {
    const tables = await Promise.all(
      req.body.tables.map((payload: Request['body']) =>
        tablesService.createTable({
          restaurantId: getOwnedRestaurantId(req, payload.restaurantId),
          tableNumber: String(payload.tableNumber ?? payload.number ?? payload.name ?? 'Table'),
          capacity: Number(payload.capacity),
          floor: payload.floor !== undefined ? Number(payload.floor) : undefined,
          section: payload.section,
          assignedStaffId: payload.assignedStaffId ?? null,
          qrCode: payload.qrCode,
        }),
      ),
    );

    ok(res, { tables }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listTablesController(req: Request, res: Response, next: NextFunction) {
  try {
    const tables = await tablesService.getTablesByRestaurant(getRestaurantId(req));
    ok(res, {
      tables,
      meta: {
        count: tables.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTableController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOne({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { table });
  } catch (error) {
    next(error);
  }
}

export async function updateTableController(req: Request, res: Response, next: NextFunction) {
  try {
    const updateDoc: any = {};
    if (req.body.tableNumber !== undefined) updateDoc.tableNumber = req.body.tableNumber;
    else if (req.body.number !== undefined) updateDoc.tableNumber = String(req.body.number);

    if (req.body.capacity !== undefined) updateDoc.capacity = Number(req.body.capacity);
    if (req.body.floor !== undefined) updateDoc.floor = Number(req.body.floor);
    if (req.body.section !== undefined) updateDoc.section = req.body.section;
    if (req.body.assignedStaffId !== undefined) updateDoc.assignedStaffId = req.body.assignedStaffId;
    if (req.body.isActive !== undefined) updateDoc.isActive = req.body.isActive;

    const table = await TableModel.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId: getRestaurantId(req),
      },
      updateDoc,
      { new: true, runValidators: true },
    );

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { table });
  } catch (error) {
    next(error);
  }
}

export async function deleteTableController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOneAndDelete({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { deletedTableId: table._id.toString() });
  } catch (error) {
    next(error);
  }
}

export async function regenerateTableQrController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOne({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    const previousToken = table.qrToken;
    table.qrToken = crypto.randomBytes(16).toString('hex');
    table.qrLastRegeneratedAt = new Date();
    await table.save();

    void logAudit(req, {
      entityType: AuditEntity.QR,
      entityId: table._id.toString(),
      action: AuditAction.QR_REGENERATED,
      metadata: {
        tableId: table._id,
        tableNumber: table.tableNumber,
        previousToken,
      },
    });

    // Emit qr.regenerated event
    socketService.emitToRestaurant(table.restaurantId.toString(), SocketEvent.QR_REGENERATED, {
      tableId: table._id.toString(),
      tableNumber: table.tableNumber,
      qrToken: table.qrToken,
      qrLastRegeneratedAt: table.qrLastRegeneratedAt,
    });

    ok(res, {
      tableId: table._id.toString(),
      qrToken: table.qrToken,
      qrLastRegeneratedAt: table.qrLastRegeneratedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTableQrPngController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOne({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    const scanUrl = `${env.CLIENT_URL}/customer/home?qr_token=${table.qrToken}`;
    const pngBuffer = await generateQrPng(scanUrl);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="table-${table.tableNumber}-qr.png"`);
    res.send(pngBuffer);
  } catch (error) {
    next(error);
  }
}

export async function getTableQrSvgController(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOne({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    const scanUrl = `${env.CLIENT_URL}/customer/home?qr_token=${table.qrToken}`;
    const svgString = await generateQrSvg(scanUrl);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `inline; filename="table-${table.tableNumber}-qr.svg"`);
    res.send(svgString);
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantTablesPdfController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = req.params.restaurantId || getRestaurantId(req);
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404, ErrorCode.NOT_FOUND);
    }

    const tables = await TableModel.find({ restaurantId, isActive: true }).sort({ tableNumber: 1 });
    if (tables.length === 0) {
      throw new AppError('No active tables found to export', 404, ErrorCode.NOT_FOUND);
    }

    const pdfBuffer = await generateTablesPdf(
      tables.map((t) => ({
        tableNumber: t.tableNumber,
        section: t.section,
        qrToken: t.qrToken,
        floor: t.floor,
      })),
      restaurant.name
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${restaurant.name.replace(/\s+/g, '-')}-qr-codes.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function getTableQrControllerLegacy(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await TableModel.findOne({
      _id: req.params.id,
      restaurantId: getRestaurantId(req),
    });

    if (!table) {
      throw new AppError('Table not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, {
      tableId: table._id.toString(),
      qrToken: table.qrToken,
    });
  } catch (error) {
    next(error);
  }
}
