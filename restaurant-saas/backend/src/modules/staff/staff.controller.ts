import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../../constants/errors';
import { STAFF_ROLES } from '../../constants/roles';
import { OrderStatus, UserStatus } from '../../constants/statuses';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../../utils/crypto';
import { ok } from '../../utils/responses';
import { CleaningTaskModel } from '../cleaning/cleaning.model';
import { OrderModel } from '../orders/orders.model';
import { StaffRequestModel } from './staffRequest.model';
import { UserModel } from '../users/users.model';
import { StaffShiftAssignmentModel } from './staff.model';
import { logAudit } from '../auditLogs/auditLogs.helper';
import { AuditAction, AuditEntity } from '../auditLogs/auditLogs.types';
import { RestaurantModel } from '../restaurants/restaurants.model';
import { sendStaffInvitationEmail } from '../../services/mail.service';
import { env } from '../../config/env';
import logger from '../../config/logger';
import crypto from 'crypto';
import { assertPlanLimit, recordSubscriptionUsage } from '../subscriptions/subscriptionEnforcement.service';

type StaffRole = (typeof STAFF_ROLES)[number];

type StaffMetrics = {
  serviceOrders: number;
  completedServiceOrders: number;
  kitchenOrders: number;
  readyKitchenOrders: number;
  totalKitchenMinutes: number;
  measuredKitchenOrders: number;
  acceptedRequests: number;
  completedRequests: number;
  startedCleaningTasks: number;
  completedCleaningTasks: number;
  verifiedCleaningTasks: number;
};

const completedServiceStatuses = [OrderStatus.SERVED, OrderStatus.COMPLETED];
const completedKitchenStatuses = [OrderStatus.READY, OrderStatus.SERVED, OrderStatus.COMPLETED, OrderStatus.REJECTED];

function resolveRestaurantId(req: Request, candidate?: unknown): string {
  if (req.user?.restaurantId) {
    return req.user.restaurantId;
  }

  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }

  throw new AppError('Restaurant context required', 403, ErrorCode.FORBIDDEN);
}

function ensureStaffRole(role: string): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

function buildStaffFilter(restaurantId: string, query: Request['query']): Record<string, unknown> {
  const search = typeof query.q === 'string' ? query.q.trim() : '';
  const role = typeof query.role === 'string' && ensureStaffRole(query.role) ? query.role : undefined;
  const status = typeof query.status === 'string' ? query.status : undefined;

  const filter: Record<string, unknown> = {
    restaurantId,
    role: role ?? { $in: STAFF_ROLES },
  };

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

async function ensureStaffRecord(restaurantId: string, staffId: string) {
  const staff = await UserModel.findOne({
    _id: staffId,
    restaurantId,
    role: { $in: STAFF_ROLES },
  }).lean();

  if (!staff) {
    throw new AppError('Staff member not found', 404, ErrorCode.NOT_FOUND);
  }

  return staff;
}

async function getActiveShiftMap(restaurantId: string, staffIds: string[]) {
  const activeShifts = await StaffShiftAssignmentModel.find({
    restaurantId,
    staffId: { $in: staffIds },
    active: true,
  })
    .sort({ updatedAt: -1 })
    .lean();

  const shiftMap = new Map<string, any>();

  activeShifts.forEach((shift) => {
    const key = String(shift.staffId);
    if (!shiftMap.has(key)) {
      shiftMap.set(key, shift);
    }
  });

  return shiftMap;
}

function parseShiftTimeToMinutes(value?: string): number | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getTodayLabels(now = new Date()): string[] {
  const full = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const short = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  return [full, short];
}

function isShiftScheduledToday(shift: any, now = new Date()): boolean {
  if (!shift?.days?.length) {
    return false;
  }

  const labels = getTodayLabels(now);
  return shift.days.some((day: string) => labels.includes(day.trim().toLowerCase()));
}

function isShiftActiveNow(shift: any, now = new Date()): boolean {
  if (!shift || !isShiftScheduledToday(shift, now)) {
    return false;
  }

  const startMinutes = parseShiftTimeToMinutes(shift.startTime);
  const endMinutes = parseShiftTimeToMinutes(shift.endTime);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (endMinutes >= startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

function getMetricBucket(map: Map<string, StaffMetrics>, staffId: string): StaffMetrics {
  const existing = map.get(staffId);
  if (existing) {
    return existing;
  }

  const created: StaffMetrics = {
    serviceOrders: 0,
    completedServiceOrders: 0,
    kitchenOrders: 0,
    readyKitchenOrders: 0,
    totalKitchenMinutes: 0,
    measuredKitchenOrders: 0,
    acceptedRequests: 0,
    completedRequests: 0,
    startedCleaningTasks: 0,
    completedCleaningTasks: 0,
    verifiedCleaningTasks: 0,
  };

  map.set(staffId, created);
  return created;
}

export async function createStaffController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);
    const currentStaff = await UserModel.countDocuments({ restaurantId, role: { $in: STAFF_ROLES } });
    await assertPlanLimit(restaurantId, 'staffLimit', currentStaff + 1, 'staff members');

    const [emailConflict, mobileConflict] = await Promise.all([
      UserModel.exists({ email: req.body.email }),
      UserModel.exists({ mobile: req.body.mobile }),
    ]);

    if (emailConflict) {
      throw new AppError('Email is already in use', 409, ErrorCode.CONFLICT);
    }

    if (mobileConflict) {
      throw new AppError('Mobile is already in use', 409, ErrorCode.CONFLICT);
    }

    // Generate secure temporary password if not provided
    const temporaryPassword = req.body.password || crypto.randomBytes(4).toString('hex');

    const created = await UserModel.create({
      restaurantId,
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      role: req.body.role,
      status: req.body.status ?? UserStatus.ACTIVE,
      kitchen_role: req.body.kitchen_role ?? null,
      staff_role: req.body.staff_role ?? null,
      cleaning_role: req.body.cleaning_role ?? null,
      isEmailVerified: true,
      isMobileVerified: true,
    });

    const staff = await UserModel.findById(created._id).lean();
    await recordSubscriptionUsage(restaurantId, 'staffCount', currentStaff + 1);

    ok(res, { staff }, 201);

    // Async task: Send invitation email
    (async () => {
      try {
        const restaurant = await RestaurantModel.findById(restaurantId).lean();
        const restaurantName = restaurant?.name || 'our restaurant';
        const loginUrl = `${env.CLIENT_URL}/login`;

        await sendStaffInvitationEmail(
          req.body.email,
          req.body.name,
          temporaryPassword,
          loginUrl,
          restaurantName
        );
      } catch (err) {
        logger.error('Failed to send staff invitation email', { error: err, email: req.body.email });
      }
    })();

    void logAudit(req, {
      entityType:   AuditEntity.STAFF,
      entityId:     created._id.toString(),
      action:       AuditAction.ADMIN_STAFF_CREATED,
      restaurantId: restaurantId,
      metadata: {
        name:  req.body.name,
        email: req.body.email,
        role:  req.body.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listStaffController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const filter = buildStaffFilter(restaurantId, req.query);

    const staff = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    const shiftMap = await getActiveShiftMap(
      restaurantId,
      staff.map((member) => String(member._id)),
    );

    ok(res, {
      staff: staff.map((member) => ({
        ...member,
        activeShift: shiftMap.get(String(member._id)) ?? null,
      })),
      meta: {
        count: staff.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffAttendanceController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const filter = buildStaffFilter(restaurantId, req.query);
    const staff = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    const shiftMap = await getActiveShiftMap(
      restaurantId,
      staff.map((member) => String(member._id)),
    );

    const attendance = staff.map((member) => {
      const activeShift = shiftMap.get(String(member._id)) ?? null;
      const scheduledToday = isShiftScheduledToday(activeShift);
      const onShiftNow = isShiftActiveNow(activeShift);

      return {
        staffId: member._id,
        name: member.name,
        role: member.role,
        status: member.status,
        activeShift,
        scheduledToday,
        onShiftNow,
        attendanceStatus: onShiftNow ? 'ON_SHIFT' : scheduledToday ? 'OFF_SHIFT' : 'NO_SHIFT',
      };
    });

    ok(res, {
      attendance,
      meta: {
        count: attendance.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffPerformanceController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const filter = buildStaffFilter(restaurantId, req.query);
    const staff = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    const staffIds = staff.map((member) => String(member._id));
    const shiftMap = await getActiveShiftMap(restaurantId, staffIds);

    const [orders, requests, cleaningTasks] = await Promise.all([
      OrderModel.find({
        restaurantId,
        $or: [{ serviceStaffId: { $in: staffIds } }, { kitchenStaffId: { $in: staffIds } }],
      })
        .select('serviceStaffId kitchenStaffId status acceptedAt readyAt rejectedAt')
        .lean(),
      StaffRequestModel.find({
        restaurantId,
        $or: [{ acceptedBy: { $in: staffIds } }, { completedBy: { $in: staffIds } }],
      })
        .select('acceptedBy completedBy')
        .lean(),
      CleaningTaskModel.find({
        restaurantId,
        $or: [{ startedBy: { $in: staffIds } }, { completedBy: { $in: staffIds } }, { verifiedBy: { $in: staffIds } }],
      })
        .select('startedBy completedBy verifiedBy')
        .lean(),
    ]);

    const metrics = new Map<string, StaffMetrics>();

    orders.forEach((order: any) => {
      if (order.serviceStaffId) {
        const bucket = getMetricBucket(metrics, String(order.serviceStaffId));
        bucket.serviceOrders += 1;
        if (completedServiceStatuses.includes(order.status)) {
          bucket.completedServiceOrders += 1;
        }
      }

      if (order.kitchenStaffId) {
        const bucket = getMetricBucket(metrics, String(order.kitchenStaffId));
        bucket.kitchenOrders += 1;
        if (completedKitchenStatuses.includes(order.status)) {
          bucket.readyKitchenOrders += 1;
        }

        const finishedAt = order.readyAt ?? order.rejectedAt ?? null;
        if (order.acceptedAt && finishedAt) {
          const durationMinutes = Math.max(
            0,
            Math.round((new Date(finishedAt).getTime() - new Date(order.acceptedAt).getTime()) / 60000),
          );
          bucket.totalKitchenMinutes += durationMinutes;
          bucket.measuredKitchenOrders += 1;
        }
      }
    });

    requests.forEach((request: any) => {
      if (request.acceptedBy) {
        getMetricBucket(metrics, String(request.acceptedBy)).acceptedRequests += 1;
      }
      if (request.completedBy) {
        getMetricBucket(metrics, String(request.completedBy)).completedRequests += 1;
      }
    });

    cleaningTasks.forEach((task: any) => {
      if (task.startedBy) {
        getMetricBucket(metrics, String(task.startedBy)).startedCleaningTasks += 1;
      }
      if (task.completedBy) {
        getMetricBucket(metrics, String(task.completedBy)).completedCleaningTasks += 1;
      }
      if (task.verifiedBy) {
        getMetricBucket(metrics, String(task.verifiedBy)).verifiedCleaningTasks += 1;
      }
    });

    const performance = staff.map((member) => {
      const bucket = getMetricBucket(metrics, String(member._id));

      return {
        staffId: member._id,
        name: member.name,
        role: member.role,
        status: member.status,
        activeShift: shiftMap.get(String(member._id)) ?? null,
        serviceOrders: bucket.serviceOrders,
        completedServiceOrders: bucket.completedServiceOrders,
        serviceCompletionRate:
          bucket.serviceOrders > 0 ? Number((bucket.completedServiceOrders / bucket.serviceOrders).toFixed(2)) : 0,
        kitchenOrders: bucket.kitchenOrders,
        readyKitchenOrders: bucket.readyKitchenOrders,
        kitchenCompletionRate:
          bucket.kitchenOrders > 0 ? Number((bucket.readyKitchenOrders / bucket.kitchenOrders).toFixed(2)) : 0,
        avgKitchenMinutes:
          bucket.measuredKitchenOrders > 0 ? Math.round(bucket.totalKitchenMinutes / bucket.measuredKitchenOrders) : 0,
        acceptedRequests: bucket.acceptedRequests,
        completedRequests: bucket.completedRequests,
        startedCleaningTasks: bucket.startedCleaningTasks,
        completedCleaningTasks: bucket.completedCleaningTasks,
        verifiedCleaningTasks: bucket.verifiedCleaningTasks,
      };
    });

    ok(res, {
      performance,
      meta: {
        count: performance.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const staff = await ensureStaffRecord(restaurantId, req.params.id);
    const activeShift = await StaffShiftAssignmentModel.findOne({
      restaurantId,
      staffId: req.params.id,
      active: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    ok(res, { staff: { ...staff, activeShift: activeShift ?? null } });
  } catch (error) {
    next(error);
  }
}

export async function updateStaffController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId ?? req.query.restaurantId);
    await ensureStaffRecord(restaurantId, req.params.id);

    if (req.body.email) {
      const existingEmail = await UserModel.exists({
        _id: { $ne: req.params.id },
        email: req.body.email,
      });

      if (existingEmail) {
        throw new AppError('Email is already in use', 409, ErrorCode.CONFLICT);
      }
    }

    if (req.body.mobile) {
      const existingMobile = await UserModel.exists({
        _id: { $ne: req.params.id },
        mobile: req.body.mobile,
      });

      if (existingMobile) {
        throw new AppError('Mobile is already in use', 409, ErrorCode.CONFLICT);
      }
    }

    const update: Record<string, unknown> = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      role: req.body.role,
      status: req.body.status,
      kitchen_role: req.body.kitchen_role,
      staff_role: req.body.staff_role,
      cleaning_role: req.body.cleaning_role,
    };

    if (req.body.password) {
      update.password = await hashPassword(req.body.password);
      update.refreshTokens = [];
    }

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const staff = await UserModel.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId,
        role: { $in: STAFF_ROLES },
      },
      update,
      { new: true, runValidators: true },
    ).lean();

    if (!staff) {
      throw new AppError('Staff member not found', 404, ErrorCode.NOT_FOUND);
    }

    const activeShift = await StaffShiftAssignmentModel.findOne({
      restaurantId,
      staffId: req.params.id,
      active: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    ok(res, { staff: { ...staff, activeShift: activeShift ?? null } });
    void logAudit(req, {
      entityType:   AuditEntity.STAFF,
      entityId:     req.params.id,
      action:       AuditAction.ADMIN_STAFF_UPDATED,
      restaurantId: restaurantId,
      metadata: {
        updatedFields: Object.keys(update),
        role:          req.body.role,
        status:        req.body.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStaffController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.query.restaurantId);
    const staff = await UserModel.findOneAndUpdate(
      {
        _id: req.params.id,
        restaurantId,
        role: { $in: STAFF_ROLES },
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${req.params.id}@deleted.com`,
        mobile: `deleted_${Date.now()}_${req.params.id}`,
        refreshTokens: [],
      },
      { new: true },
    ).lean();

    if (!staff) {
      throw new AppError('Staff member not found', 404, ErrorCode.NOT_FOUND);
    }

    await StaffShiftAssignmentModel.updateMany(
      {
        restaurantId,
        staffId: req.params.id,
        active: true,
      },
      {
        active: false,
      },
    );

    ok(res, { staff });
    void logAudit(req, {
      entityType:   AuditEntity.STAFF,
      entityId:     req.params.id,
      action:       AuditAction.ADMIN_STAFF_DELETED,
      restaurantId: restaurantId,
      metadata: {
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function assignStaffShiftController(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurantId = resolveRestaurantId(req, req.body.restaurantId);
    await ensureStaffRecord(restaurantId, req.body.staffId);

    const shouldActivate = req.body.active ?? true;

    if (shouldActivate) {
      await StaffShiftAssignmentModel.updateMany(
        {
          restaurantId,
          staffId: req.body.staffId,
          active: true,
        },
        {
          active: false,
        },
      );
    }

    const shift = await StaffShiftAssignmentModel.create({
      restaurantId,
      staffId: req.body.staffId,
      name: req.body.name,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      days: req.body.days,
      notes: req.body.notes,
      active: shouldActivate,
      assignedBy: req.user?.id ?? null,
    });

    ok(res, { shift }, 201);
  } catch (error) {
    next(error);
  }
}
