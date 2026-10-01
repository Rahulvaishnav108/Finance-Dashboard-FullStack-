import { Types } from 'mongoose';
import { z } from 'zod';
import { STAFF_ROLES, UserRole, KitchenRole, StaffInternalRole, CleaningRole } from '../../constants/roles';
import { Priority, TableStatus } from '../../constants/statuses';

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const nullableObjectIdSchema = z.union([objectIdSchema, z.null()]);

export const entityIdParamsSchema = z.object({
  id: objectIdSchema,
});

export const staffTablesQuerySchema = z.object({
  status: z.nativeEnum(TableStatus).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  section: z.string().trim().min(1).optional(),
});

export const assignTableBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const reserveTableBodySchema = z.object({
  reservationId: nullableObjectIdSchema.optional(),
});

export const occupyTableBodySchema = z.object({
  sessionId: nullableObjectIdSchema.optional(),
  staffId: nullableObjectIdSchema.optional(),
});

export const queuePriorityBodySchema = z.object({
  priority: z.nativeEnum(Priority),
});

export const reservationCheckInBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const requestAcceptBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const requestCompleteBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
});

export const issueEscalationBodySchema = z.object({
  staffId: nullableObjectIdSchema.optional(),
  entityId: objectIdSchema,
  entityType: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().min(1).max(500).optional(),
});

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

const staffRoleSchema = z
  .nativeEnum(UserRole)
  .refine((value) => (STAFF_ROLES as readonly UserRole[]).includes(value), {
    message: 'Role must be a staff role',
  });

export const adminStaffQuerySchema = z.object({
  role: staffRoleSchema.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED']).optional(),
  q: z.string().trim().min(1).optional(),
  restaurantId: objectIdSchema.optional(),
});

export const createStaffBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  mobile: z.string().trim().min(10).max(15),
  password: passwordSchema.optional(),
  role: staffRoleSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED']).optional(),
  kitchen_role: z.nativeEnum(KitchenRole).optional(),
  staff_role: z.nativeEnum(StaffInternalRole).optional(),
  cleaning_role: z.nativeEnum(CleaningRole).optional(),
});

export const updateStaffBodySchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
    mobile: z.string().trim().min(10).max(15).optional(),
    password: passwordSchema.optional(),
    role: staffRoleSchema.optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED']).optional(),
    kitchen_role: z.nativeEnum(KitchenRole).optional().nullable(),
    staff_role: z.nativeEnum(StaffInternalRole).optional().nullable(),
    cleaning_role: z.nativeEnum(CleaningRole).optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const assignStaffShiftBodySchema = z.object({
  restaurantId: objectIdSchema.optional(),
  staffId: objectIdSchema,
  name: z.string().trim().min(2).max(100),
  startTime: z.string().trim().min(1).max(20),
  endTime: z.string().trim().min(1).max(20),
  days: z.array(z.string().trim().min(2).max(20)).min(1).max(7),
  notes: z.string().trim().max(500).optional(),
  active: z.boolean().optional(),
});