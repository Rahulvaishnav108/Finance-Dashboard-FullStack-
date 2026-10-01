// src/constants/statuses.ts
// Status enums for all domain entities

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  ORDERING = 'ORDERING',
  BILL_PENDING = 'BILL_PENDING',
  PAID = 'PAID',
  DIRTY = 'NEEDS_CLEANING',
  CLEANING = 'CLEANING_IN_PROGRESS',
  MAINTENANCE = 'MAINTENANCE',

  // Backward compatibility aliases
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  /* eslint-disable @typescript-eslint/no-duplicate-enum-values */
  NEEDS_CLEANING = 'NEEDS_CLEANING',
  CLEANING_IN_PROGRESS = 'CLEANING_IN_PROGRESS',
  /* eslint-enable @typescript-eslint/no-duplicate-enum-values */
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  DELAYED = 'DELAYED',
  READY = 'READY',
  PICKED = 'PICKED',
  SERVED = 'SERVED',
  BILLED = 'BILLED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum CleaningStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export enum QueueStatus {
  WAITING = 'WAITING',
  NOTIFIED = 'NOTIFIED',
  SEATED = 'SEATED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RequestType {
  WAITER = 'WAITER',
  WATER = 'WATER',
  CUTLERY = 'CUTLERY',
  CLEANING = 'CLEANING',
  HELP = 'HELP',
}

export enum RestaurantStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum BillStatus {
  OPEN = 'OPEN',
  REQUESTED = 'REQUESTED',
  FINALIZED = 'FINALIZED',
  PAID = 'PAID',
}

export enum BatchStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
