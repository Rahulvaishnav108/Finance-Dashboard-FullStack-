// src/modules/notifications/notifications.service.ts
// Service layer for notifications — handles creation, deduplication, real-time broadcasts, and reads

import { Notification, INotification } from './notifications.model';
import { socketService } from '../../sockets/socket.service';
import { SocketEvent } from '../../constants/events';
import { UserRole } from '../../constants/roles';
import { NotificationCategory, NotificationPriority } from './notifications.schema';
import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants/errors';

type NotificationFilters = {
  requestedRecipientRole?: UserRole;
  isRead?: boolean;
};

type NotificationQuery = Record<string, unknown>;

function isPrivilegedRole(role: UserRole): boolean {
  return role === UserRole.RESTAURANT_ADMIN || role === UserRole.SUPER_ADMIN;
}

function getReadByObjectId(userId: mongoose.Types.ObjectId | string): mongoose.Types.ObjectId | null {
  const normalizedId = userId.toString();
  return mongoose.Types.ObjectId.isValid(normalizedId) ? new mongoose.Types.ObjectId(normalizedId) : null;
}

export class NotificationsService {
  /**
   * Create a notification.
   * Enforces a 60-second sliding window deduplication based on restaurantId, tableSessionId, and type.
   * If a duplicate is found, the existing active notification is returned and socket broadcast is suppressed.
   */
  public static async createNotification(data: {
    restaurantId: mongoose.Types.ObjectId | string;
    tableSessionId?: mongoose.Types.ObjectId | string;
    recipientRole: UserRole;
    title: string;
    message: string;
    type: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    expiresAt: Date;
    metadata?: Record<string, any>;
  }): Promise<INotification> {
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);

    // Sliding window check: match exact restaurant, tableSession, type, created in last 60s
    const existing = await Notification.findOne({
      restaurantId: data.restaurantId,
      tableSessionId: data.tableSessionId || null,
      type: data.type,
      createdAt: { $gte: sixtySecondsAgo },
    });

    if (existing) {
      return existing;
    }

    // Create the new notification
    const notification = await Notification.create({
      ...data,
      tableSessionId: data.tableSessionId || null,
    });

    const restaurantIdStr = data.restaurantId.toString();
    const sessionIdStr = data.tableSessionId ? data.tableSessionId.toString() : null;

    // Real-time Socket.io transmissions
    // 1. Emit to specific role in the restaurant
    socketService.emitToRole(
      restaurantIdStr,
      data.recipientRole,
      SocketEvent.NOTIFICATION_NEW,
      notification
    );

    // 2. Emit to specific active customer session (if associated)
    if (sessionIdStr) {
      socketService.emitToSession(
        sessionIdStr,
        SocketEvent.NOTIFICATION_NEW,
        notification
      );
    }

    // 3. Emit to general restaurant room
    socketService.emitToRestaurant(
      restaurantIdStr,
      SocketEvent.NOTIFICATION_NEW,
      notification
    );

    return notification;
  }

  public static getScopedRecipientRole(
    actorRole: UserRole,
    requestedRecipientRole?: UserRole
  ): UserRole | undefined {
    if (isPrivilegedRole(actorRole)) {
      return requestedRecipientRole;
    }

    if (requestedRecipientRole && requestedRecipientRole !== actorRole) {
      throw new AppError('Forbidden', 403, ErrorCode.FORBIDDEN);
    }

    return actorRole;
  }

  private static buildScopedQuery(
    restaurantId: mongoose.Types.ObjectId | string,
    actorRole: UserRole,
    filters: NotificationFilters = {},
    options: { activeOnly?: boolean; unreadOnly?: boolean } = {}
  ): NotificationQuery {
    const query: NotificationQuery = {
      restaurantId,
    };

    if (options.activeOnly) {
      query.expiresAt = { $gt: new Date() };
    }

    if (options.unreadOnly) {
      query.isRead = false;
    } else if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const scopedRecipientRole = this.getScopedRecipientRole(actorRole, filters.requestedRecipientRole);
    if (scopedRecipientRole) {
      query.recipientRole = scopedRecipientRole;
    }

    return query;
  }

  /**
   * Get active (unexpired) notifications for a restaurant, with optional filters.
   */
  public static async getActiveNotifications(
    restaurantId: mongoose.Types.ObjectId | string,
    actorRole: UserRole,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const query = this.buildScopedQuery(restaurantId, actorRole, filters, { activeOnly: true });
    const unreadQuery = this.buildScopedQuery(
      restaurantId,
      actorRole,
      { requestedRecipientRole: filters.requestedRecipientRole },
      { activeOnly: true, unreadOnly: true }
    );

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }),
      Notification.countDocuments(unreadQuery),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark a single notification as read.
   */
  public static async markAsRead(
    notificationId: mongoose.Types.ObjectId | string,
    restaurantId: mongoose.Types.ObjectId | string,
    actorRole: UserRole,
    userId: mongoose.Types.ObjectId | string
  ): Promise<INotification | null> {
    const query = this.buildScopedQuery(restaurantId, actorRole, undefined, { activeOnly: true });
    query._id = notificationId;

    const notification = await Notification.findOne(query);

    if (!notification) {
      return null;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      notification.readBy = getReadByObjectId(userId);
      await notification.save();
    }

    return notification;
  }

  /**
   * Mark all notifications of a specific role (or all roles if none specified) in a restaurant as read.
   */
  public static async markAllAsRead(
    restaurantId: mongoose.Types.ObjectId | string,
    actorRole: UserRole,
    recipientRole: UserRole | undefined,
    userId: mongoose.Types.ObjectId | string
  ): Promise<number> {
    const query = this.buildScopedQuery(
      restaurantId,
      actorRole,
      { requestedRecipientRole: recipientRole },
      { activeOnly: true, unreadOnly: true }
    );
    const readBy = getReadByObjectId(userId);

    const result = await Notification.updateMany(query, {
      $set: {
        isRead: true,
        readAt: new Date(),
        readBy,
      },
    });

    return result.modifiedCount ?? 0;
  }
}
