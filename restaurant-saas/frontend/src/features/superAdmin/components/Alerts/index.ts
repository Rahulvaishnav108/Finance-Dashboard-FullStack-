// types/index.ts

export type AlertType = 'critical' | 'warning' | 'info';
export type AlertStatus = 'new' | 'read' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  status: AlertStatus;
  entity?: string;
  entityType?: 'restaurant' | 'user' | 'system' | 'payment';
  timestamp: string;
  resolvedAt?: string;
  actionLabel?: string;
  actionHref?: string;
  tags?: string[];
}

export type FilterType = 'all' | 'new' | AlertType | AlertStatus;
export type SortOrder = 'newest' | 'oldest' | 'severity';