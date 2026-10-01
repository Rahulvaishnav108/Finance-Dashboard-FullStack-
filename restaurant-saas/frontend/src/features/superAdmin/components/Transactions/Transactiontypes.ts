// types/TransactionTypes.ts

export type TxStatus = "Completed" | "Pending" | "Failed" | "Refunded";
export type PaymentMethod = "Credit Card" | "UPI / Wallet" | "Net Banking" | "Cash" | "Crypto";
export type SortField = "amount" | "commission" | "timestamp" | "restaurant";
export type SortOrder = "asc" | "desc";
export type StatusFilter = "All" | TxStatus;
export type DateRange = "today" | "7d" | "30d" | "90d" | "all";

export interface Transaction {
  id: string;
  restaurant: string;
  restaurantId: string;
  amount: number;
  commission: number;
  commissionRate: number;
  paymentMethod: PaymentMethod;
  status: TxStatus;
  timestamp: string;
  city: string;
  ordersCount: number;
  note?: string;
}

export interface MetricSummary {
  totalRevenue: number;
  totalCommission: number;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  refundedCount: number;
  successRate: number;
  avgOrderValue: number;
  avgCommissionRate: number;
  totalTransactions: number;
}