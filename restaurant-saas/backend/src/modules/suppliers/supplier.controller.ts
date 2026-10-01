import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { SupplierService } from './supplier.service';

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

function getActor(req: Request) {
  return req.user ? { id: req.user.id, role: req.user.role } : { id: 'system', role: 'system' };
}

export async function createSupplierController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);
    const supplier = await SupplierService.createSupplier(restaurantId, req.body, getActor(req));

    ok(res, { supplier }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listSuppliersController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const active = typeof req.query.active === 'boolean' ? req.query.active : undefined;

    const suppliers = await SupplierService.listSuppliers(restaurantId, search, active);

    ok(res, {
      suppliers,
      meta: {
        count: suppliers.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSupplierController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    const supplier = await SupplierService.updateSupplier(restaurantId, req.params.id, req.body, getActor(req));

    ok(res, { supplier });
  } catch (error) {
    next(error);
  }
}

export async function deleteSupplierController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    await SupplierService.deleteSupplier(restaurantId, req.params.id, getActor(req));

    ok(res, { message: 'Supplier successfully deleted' });
  } catch (error) {
    next(error);
  }
}
