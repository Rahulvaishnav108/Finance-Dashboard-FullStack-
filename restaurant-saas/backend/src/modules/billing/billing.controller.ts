import { Request, Response, NextFunction } from "express";
import { BillingService } from "./billing.service";
import { AppError } from "../../utils/AppError";
import { ErrorCode } from "../../constants/errors";
import { ReceiptService } from "../../services/receipt.service";
import { BillingModel } from "./billing.model";

export class BillingController {
  static async getLiveBill(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getLiveBill(session.restaurantId.toString(), session._id.toString());
      return res.status(200).json({
        success: true,
        message: "Live bill fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReceiptJson(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bill = await BillingModel.findById(id).lean();
      if (!bill) throw new AppError("Bill not found", 404, ErrorCode.NOT_FOUND);

      const receipt = await ReceiptService.generateReceiptJson(bill as any);

      // Track that it was viewed (non-blocking)
      BillingModel.updateOne({ _id: id }, { receiptViewedAt: new Date() }).catch(() => {});

      return res.status(200).json({
        success: true,
        data: receipt
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReceiptPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bill = await BillingModel.findById(id).lean();
      if (!bill) throw new AppError("Bill not found", 404, ErrorCode.NOT_FOUND);

      const pdfBuffer = await ReceiptService.generateReceiptPdf(bill as any);

      // Track that it was downloaded (non-blocking)
      BillingModel.updateOne({ _id: id }, { receiptDownloadedAt: new Date() }).catch(() => {});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Receipt-${bill.invoiceNumber || id}.pdf"`);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async shareReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bill = await BillingModel.findById(id).lean();
      if (!bill) throw new AppError("Bill not found", 404, ErrorCode.NOT_FOUND);

      const receiptUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/receipts/${id}`;
      const pdfUrl = `${process.env.API_URL || 'http://localhost:8080/api/v1'}/customer/bill/${id}/receipt/pdf`;
      const shareText = `Here is your receipt from ${bill.customerName ? bill.customerName + "'s visit" : "your recent visit"}.`;

      // Track that it was shared (non-blocking)
      BillingModel.updateOne({ _id: id }, { receiptSharedAt: new Date() }).catch(() => {});

      return res.status(200).json({
        success: true,
        data: {
          receiptUrl,
          pdfUrl,
          shareText
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestFinalBill(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      let customerEmail = req.body.customerEmail as string | undefined;
      if (customerEmail) {
        customerEmail = customerEmail.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
          throw new AppError("Invalid email format", 400, ErrorCode.VALIDATION_ERROR);
        }
      }

      const wantsReceipt = Boolean(req.body.wantsReceipt);

      const data = await BillingService.requestFinalBill(
        session.restaurantId.toString(),
        session._id.toString(),
        customerEmail,
        wantsReceipt
      );


      return res.status(200).json({
        success: true,
        message: "Final bill requested successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async applyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const couponCode = req.body.couponCode || req.body.code;
      if (!couponCode) throw new AppError("Coupon code is required", 400, ErrorCode.VALIDATION_ERROR);

      const data = await BillingService.applyCoupon(session.restaurantId.toString(), session._id.toString(), couponCode);

      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const { couponId } = req.params; // Using couponCode mapped from params for simplicity in MVP
      const data = await BillingService.removeCoupon(session.restaurantId.toString(), session._id.toString(), couponId);

      return res.status(200).json({
        success: true,
        message: "Coupon removed successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const paymentMethod = req.body.paymentMethod || req.body.method;
      if (!paymentMethod) throw new AppError("Payment method is required", 400, ErrorCode.VALIDATION_ERROR);

      let customerEmail = req.body.customerEmail as string | undefined;
      if (customerEmail) {
        customerEmail = customerEmail.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
          throw new AppError("Invalid email format", 400, ErrorCode.VALIDATION_ERROR);
        }
      }

      const data = await BillingService.createPayment(session.restaurantId.toString(), session._id.toString(), paymentMethod, customerEmail);

      return res.status(201).json({
        success: true,
        message: "Payment created successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const { paymentId, simulateStatus } = req.body;
      if (!paymentId) throw new AppError("Payment ID is required", 400, ErrorCode.VALIDATION_ERROR);

      const data = await BillingService.verifyPayment(session.restaurantId.toString(), session._id.toString(), paymentId, simulateStatus);

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const session = req.tableSession;
      if (!session) throw new AppError("Session required", 401, ErrorCode.UNAUTHORIZED);

      const { paymentId } = req.params;
      const data = await BillingService.getPaymentStatus(session.restaurantId.toString(), session._id.toString(), paymentId);
      return res.status(200).json({
        success: true,
        message: "Payment status fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getRevenueReport(restaurantId.toString());
      return res.status(200).json({
        success: true,
        message: "Revenue report fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaxReport(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getTaxReport(restaurantId.toString());
      return res.status(200).json({
        success: true,
        message: "Tax report fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderBillingReport(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getOrderBillingReport(restaurantId.toString());
      return res.status(200).json({
        success: true,
        message: "Order billing report fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDiscountReport(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getDiscountReport(restaurantId.toString());
      return res.status(200).json({
        success: true,
        message: "Discount report fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurantId = req.user?.restaurantId;
      if (!restaurantId) throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);

      const data = await BillingService.getPaymentReport(restaurantId.toString());
      return res.status(200).json({
        success: true,
        message: "Payment report fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}