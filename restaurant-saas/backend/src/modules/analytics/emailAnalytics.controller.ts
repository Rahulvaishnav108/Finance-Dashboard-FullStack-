import { Request, Response } from 'express';
import { EmailLogModel } from '../notifications/emailLog.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendPaginated } from '../../utils/response';

export const getEmailSummary = asyncHandler(async (req: Request, res: Response) => {
  const query: any = {};
  if (req.user?.restaurantId) {
    query.restaurantId = req.user.restaurantId;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSent,
    totalFailed,
    emailsToday,
    emailsThisWeek,
    emailsThisMonth
  ] = await Promise.all([
    EmailLogModel.countDocuments({ ...query, status: 'SENT' }),
    EmailLogModel.countDocuments({ ...query, status: 'FAILED' }),
    EmailLogModel.countDocuments({ ...query, sentAt: { $gte: startOfDay } }),
    EmailLogModel.countDocuments({ ...query, sentAt: { $gte: startOfWeek } }),
    EmailLogModel.countDocuments({ ...query, sentAt: { $gte: startOfMonth } }),
  ]);

  const total = totalSent + totalFailed;
  const successRate = total > 0 ? (totalSent / total) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      totalSent,
      totalFailed,
      successRate: Math.round(successRate * 100) / 100,
      emailsToday,
      emailsThisWeek,
      emailsThisMonth
    }
  });
});

export const getRecentEmails = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  if (req.user?.restaurantId) {
    query.restaurantId = req.user.restaurantId;
  }

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

export const getEmailTypes = asyncHandler(async (req: Request, res: Response) => {
  const query: any = {};
  if (req.user?.restaurantId) {
    query.restaurantId = req.user.restaurantId; // Assuming restaurantId is populated or available
  }

  const types = await EmailLogModel.aggregate([
    { $match: query },
    { $group: { _id: '$emailType', count: { $sum: 1 } } },
    { $project: { type: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: types
  });
});