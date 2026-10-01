import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';

import { requireAuth } from '../../middleware/requireAuth';
import { requireSession } from '../../middleware/requireSession';
import { validate } from '../../middleware/validate';

import {
  createLoyaltyRuleSchema,
  redeemOfferParamsSchema,
} from './loyalty.schema';

const router = Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER LOYALTY
|--------------------------------------------------------------------------
*/

router.get(
  '/customer/loyalty',
  requireSession,
  LoyaltyController.getWallet,
);

router.get(
  '/customer/offers',
  requireSession,
  LoyaltyController.getOffers,
);

router.get(
  '/customer/offers/eligibility',
  requireSession,
  LoyaltyController.getEligibility,
);

router.post(
  '/customer/offers/:offerId/redeem',
  requireSession,
  validate({
    params: redeemOfferParamsSchema,
  }),
  LoyaltyController.redeemOffer,
);

/*
|--------------------------------------------------------------------------
| ADMIN LOYALTY
|--------------------------------------------------------------------------
*/

router.get(
  '/admin/loyalty/rules',
  requireAuth,
  LoyaltyController.getRules,
);

router.post(
  '/admin/loyalty/rules',
  requireAuth,
  validate({
    body: createLoyaltyRuleSchema,
  }),
  LoyaltyController.createRule,
);

export default router;
