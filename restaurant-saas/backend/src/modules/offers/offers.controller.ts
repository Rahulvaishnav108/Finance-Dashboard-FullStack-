import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { AppError } from '../../utils/AppError';
import { ok } from '../../utils/responses';
import { OfferModel } from './offers.model';
import { assertFeatureAccess, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

export async function createOfferController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);
    await assertFeatureAccess(restaurantId, 'dynamicDiscountEngine', 'Dynamic discount engine');

    const existing = await OfferModel.exists({
      restaurantId,
      code: req.body.code,
    });

    if (existing) {
      throw new AppError('Offer code already exists', 409, ErrorCode.CONFLICT);
    }

    const offer = await OfferModel.create({
      restaurantId,
      name: req.body.name,
      code: req.body.code,
      discountPercent: req.body.discountPercent,
      active: req.body.active ?? true,
    });

    const discountUsage = await OfferModel.countDocuments({ restaurantId });
    await recordSubscriptionUsage(restaurantId, 'discountUsage', discountUsage);

    ok(res, { offer }, 201);
  } catch (error) {
    next(error);
  }
}

export async function listOffersController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const filter: Record<string, unknown> = {
      restaurantId,
    };

    if (typeof req.query.active === 'boolean') {
      filter.active = req.query.active;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
      ];
    }

    const offers = await OfferModel.find(filter).sort({ createdAt: -1 }).lean();

    ok(res, {
      offers,
      meta: {
        count: offers.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOfferByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const offer = await OfferModel.findOne({
      _id: req.params.id,
      restaurantId,
    }).lean();

    if (!offer) {
      throw new AppError('Offer not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { offer });
  } catch (error) {
    next(error);
  }
}

export async function updateOfferController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);

    if (req.body.code) {
      const existing = await OfferModel.exists({
        _id: { $ne: req.params.id },
        restaurantId,
        code: req.body.code,
      });

      if (existing) {
        throw new AppError('Offer code already exists', 409, ErrorCode.CONFLICT);
      }
    }

    const offer = await OfferModel.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId,
      },
      {
        name: req.body.name,
        code: req.body.code,
        discountPercent: req.body.discountPercent,
        active: req.body.active,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!offer) {
      throw new AppError('Offer not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { offer });
  } catch (error) {
    next(error);
  }
}

export async function deleteOfferController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const offer = await OfferModel.findOneAndDelete({
      _id: req.params.id,
      restaurantId,
    }).lean();

    if (!offer) {
      throw new AppError('Offer not found', 404, ErrorCode.NOT_FOUND);
    }

    ok(res, { offer });
  } catch (error) {
    next(error);
  }
}
