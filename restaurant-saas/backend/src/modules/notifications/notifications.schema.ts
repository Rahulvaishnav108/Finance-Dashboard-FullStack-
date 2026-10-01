// src/modules/notifications/notifications.schema.ts
// Notification schemas and enums — matches PRD Section 16

export enum NotificationCategory {
  STAFF = 'STAFF',
  CLEANING = 'CLEANING',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
