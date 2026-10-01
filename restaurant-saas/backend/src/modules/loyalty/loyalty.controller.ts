import { Request, Response, NextFunction } from 'express';
import * as LoyaltyService from './loyalty.service';
import { ok } from '../../utils/responses';

export class LoyaltyController {
  // GET /customer/loyalty
  static async getWallet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const session = req.tableSession!;

      const wallet = await LoyaltyService.getWallet(
        session.restaurantId.toString(),
        session.mobile,
      );

      ok(res, { wallet });
    } catch (error) {
      next(error);
    }
  }

  // GET /customer/offers
  static async getOffers(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const session = req.tableSession!;

      const offers = await LoyaltyService.getOffers(
        session.restaurantId.toString(),
      );

      ok(res, { offers });
    } catch (error) {
      next(error);
    }
  }

  // GET /customer/offers/eligibility
  static async getEligibility(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const session = req.tableSession!;

      const eligibility =
        await LoyaltyService.getEligibility(
          session.restaurantId.toString(),
          session.mobile,
        );

      ok(res, { eligibility });
    } catch (error) {
      next(error);
    }
  }

  // POST /customer/offers/:offerId/redeem
  static async redeemOffer(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const session = req.tableSession!;

      const result =
        await LoyaltyService.redeemOffer(
          session.restaurantId.toString(),
          session.mobile,
          req.params.offerId,
        );

      ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/loyalty/rules
  static async getRules(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.restaurantId) {
  throw new Error('Restaurant context not found');
    }
      const rules =
        await LoyaltyService.getRules(
          req.user!.restaurantId.toString(),
        );

      ok(res, { rules });
    } catch (error) {
      next(error);
    }
  }

  // POST /admin/loyalty/rules
  static async createRule(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {

    try {

      if (!req.user?.restaurantId) {
  throw new Error('Restaurant context not found');
  }
  console.log('REQ USER =>', req.user);
      const rule =
        await LoyaltyService.createRule(
          req.user!.restaurantId.toString(),
          req.body,
        );

      ok(res, { rule }, 201);
    } catch (error) {
      next(error);
    }
  }
}
