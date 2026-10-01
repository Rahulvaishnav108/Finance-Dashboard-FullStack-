import { Request, Response } from 'express';
import { EmailLogModel } from '../notifications/emailLog.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendPaginated } from '../../utils/response';

/**
 * GET /api/v1/admin/email-logs
 * List all email logs for the current restaurant (or globally if super admin)
 */
export const listEmailLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '50', type, status, recipient } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};

  // If normal admin, scope to their restaurant
  if (req.user?.restaurantId) {
    query.restaurantId = req.user.restaurantId;
  }

  if (type) query.emailType = type;
  if (status) query.status = status;
  if (recipient) query.recipient = { $regex: recipient, $options: 'i' };

  const logs = await EmailLogModel.find(query)
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await EmailLogModel.countDocuments(query);

  sendPaginated(res, logs, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});