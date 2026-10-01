import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';
import {
  LoyaltyWalletModel,
  LoyaltyRuleModel,
  LoyaltyTier,
} from './loyalty.model';
import { OfferModel } from '../offers/offers.model';
import { TableSessionModel } from '../tableSessions/tableSessions.model';
import { IOrder } from '../orders/orders.schema';

// tier calculation based on lifetime points:
function calculateTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 2500) {
    return LoyaltyTier.PLATINUM;
  }

  if (lifetimePoints >= 1000) {
    return LoyaltyTier.GOLD;
  }

  if (lifetimePoints >= 500) {
    return LoyaltyTier.SILVER;
  }

  return LoyaltyTier.BRONZE;
}

// get wallet by mobile number, if not exists return default values:
export async function getWallet(
  restaurantId: string,
  mobile: string,
) {
  const wallet = await LoyaltyWalletModel.findOne({
    restaurantId,
    mobile,
  });

  if (!wallet) {
    return {
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: LoyaltyTier.BRONZE,
    };
  }

  return wallet;
}

// rules are created by restaurant, but can be applied to any order from that restaurant, so we only need restaurantId and rule details to create a rule:
export async function createRule(
  restaurantId: string,
  payload: {
    name: string;
    pointsPerAmount: number;
    minimumOrderAmount: number;
  },
) {
  return LoyaltyRuleModel.create({
    restaurantId,
    ...payload,
  });
}

export async function getRules(
  restaurantId: string,
) {
  return LoyaltyRuleModel.find({
    restaurantId,
  }).sort({ createdAt: -1 });
}

//get offers for a restaurant, only active offers should be returned:
export async function getOffers(
  restaurantId: string,
) {
  return OfferModel.find({
    restaurantId,
    active: true,
  }).lean();
}

//get eligibility of a wallet for all offers of a restaurant:
//requiredpoints is a field in offer, pointsbalance is a field in wallet, if pointsbalance >= requiredpoints then eligible is true else false, we return offer details along with eligibility status for each offer:
export async function getEligibility(
  restaurantId: string,
  mobile: string,
) {
  const wallet = await LoyaltyWalletModel.findOne({
    restaurantId,
    mobile,
  });

  const points = wallet?.pointsBalance ?? 0;

  const offers = await OfferModel.find({
    restaurantId,
    active: true,
  }).lean();

  return offers.map((offer: any) => ({
    offerId: offer._id,
    name: offer.name,
    code: offer.code,
    requiredPoints: offer.requiredPoints ?? 0,
    eligible: points >= (offer.requiredPoints ?? 0),
  }));
}


//redeem an offer for a wallet, we need to check if wallet has enough points to redeem the offer,
// if yes then we deduct the required points from wallet and return success response along with remaining points and offer details, if not then we return error response with insufficient points message:
export async function redeemOffer(
  restaurantId: string,
  mobile: string,
  offerId: string,
) {
  const wallet = await LoyaltyWalletModel.findOne({
    restaurantId,
    mobile,
  });

  if (!wallet) {
    throw new AppError(
      'Loyalty wallet not found',
      404,
      ErrorCode.NOT_FOUND,
    );
  }

  const offer: any = await OfferModel.findOne({
    _id: offerId,
    restaurantId,
    active: true,
  });

  if (!offer) {
    throw new AppError(
      'Offer not found',
      404,
      ErrorCode.NOT_FOUND,
    );
  }

  const requiredPoints = offer.requiredPoints ?? 0;

  if (wallet.pointsBalance < requiredPoints) {
    throw new AppError(
      'Insufficient loyalty points',
      400,
      ErrorCode.INVALID_REQUEST,
    );
  }

  wallet.pointsBalance -= requiredPoints;

  await wallet.save();

  return {
    success: true,
    remainingPoints: wallet.pointsBalance,
    offer,
  };
}


//credit points to wallet based on order amount and loyalty rules, we need to find active loyalty rule for the restaurant,
// if no active rule then we do not credit any points,
// if active rule exists then we calculate points based on order final amount and points per amount defined in the rule, we also need to check if order final amount meets minimum order amount defined in the rule,
// if not then we do not credit any points, if all conditions are met then we find or create a wallet for the customer based on mobile number from table session,
// we then add calculated points to wallet balance and lifetime points, we also need to update tier based on new lifetime points, finally we save the wallet and return updated wallet details:
export async function creditPoints(
  order: IOrder,
) {
  const rule = await LoyaltyRuleModel.findOne({
    restaurantId: order.restaurantId,
    active: true,
  });

  if (!rule) {
    return null;
  }

  if (order.finalAmount < rule.minimumOrderAmount) {
    return null;
  }

  if (!order.sessionId) {
    return null;
  }

  const session = await TableSessionModel.findById(
    order.sessionId,
  );

  if (!session) {
    return null;
  }

  const points = Math.floor(
    order.finalAmount / rule.pointsPerAmount,
  );

  if (points <= 0) {
    return null;
  }

  let wallet = await LoyaltyWalletModel.findOne({
    restaurantId: order.restaurantId,
    mobile: session.mobile,
  });

  if (!wallet) {
    wallet = await LoyaltyWalletModel.create({
      restaurantId: order.restaurantId,
      mobile: session.mobile,
      customerName: session.customerName,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: LoyaltyTier.BRONZE,
    });
  }

  wallet.pointsBalance += points;
  wallet.lifetimePoints += points;

  wallet.tier = calculateTier(
    wallet.lifetimePoints,
  );

  await wallet.save();

  return wallet;
}
