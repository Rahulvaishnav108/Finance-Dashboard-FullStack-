import { Router } from "express";
import { BillingController } from "./billing.controller";
import { requireSession } from "../../middleware/requireSession";
import { requireAuth } from "../../middleware/requireAuth";
import { roleGuard } from "../../middleware/roleGuard";
import { UserRole } from "../../constants/roles";

const router = Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER BILL APIs
|--------------------------------------------------------------------------
*/

router.get("/customer/bill", requireSession, BillingController.getLiveBill);

router.get("/customer/bill/:id/receipt", BillingController.getReceiptJson);

router.get("/customer/bill/:id/receipt/pdf", BillingController.getReceiptPdf);

router.get("/customer/bill/:id/share", BillingController.shareReceipt);

router.post("/customer/bill/request", requireSession, BillingController.requestFinalBill);

router.post("/customer/bill/coupon", requireSession, BillingController.applyCoupon);

router.delete(
  "/customer/bill/coupon/:couponId",
  requireSession,
  BillingController.removeCoupon
);

/*
|--------------------------------------------------------------------------
| PAYMENT APIs
|--------------------------------------------------------------------------
*/

router.post(
  "/customer/payments/create",
  requireSession,
  BillingController.createPayment
);

router.post(
  "/customer/payments/verify",
  requireSession,
  BillingController.verifyPayment
);

router.get(
  "/customer/payments/:paymentId/status",
  requireSession,
  BillingController.getPaymentStatus
);

/*
|--------------------------------------------------------------------------
| ADMIN BILLING APIs
|--------------------------------------------------------------------------
*/

const adminRoles = [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN];

router.get(
  "/admin/billing/revenue",
  requireAuth,
  roleGuard(...adminRoles),
  BillingController.getRevenueReport
);

router.get(
  "/admin/billing/tax",
  requireAuth,
  roleGuard(...adminRoles),
  BillingController.getTaxReport
);

router.get(
  "/admin/billing/orders",
  requireAuth,
  roleGuard(...adminRoles),
  BillingController.getOrderBillingReport
);

router.get(
  "/admin/billing/discounts",
  requireAuth,
  roleGuard(...adminRoles),
  BillingController.getDiscountReport
);

router.get(
  "/admin/billing/payments",
  requireAuth,
  roleGuard(...adminRoles),
  BillingController.getPaymentReport
);

export default router;