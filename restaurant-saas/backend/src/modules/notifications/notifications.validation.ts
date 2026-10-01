import { z } from 'zod';
import { UserRole } from '../../constants/roles';

const booleanQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true');

export const notificationsListQuerySchema = z.object({
  recipientRole: z.nativeEnum(UserRole).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isRead: booleanQuerySchema.optional(),
  read: booleanQuerySchema.optional(),
});

export const markAllNotificationsQuerySchema = z.object({
  recipientRole: z.nativeEnum(UserRole).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid notification id format'),
});

export type NotificationsListQuery = z.infer<typeof notificationsListQuerySchema>;
export type MarkAllNotificationsQuery = z.infer<typeof markAllNotificationsQuerySchema>;
