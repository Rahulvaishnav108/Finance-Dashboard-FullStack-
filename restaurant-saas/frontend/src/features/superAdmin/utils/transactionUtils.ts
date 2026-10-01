// utils/transactionUtils.ts

import type { Transaction, MetricSummary, DateRange } from "../components/Transactions/Transactiontypes";

export function filterByDateRange(transactions: Transaction[], range: DateRange): Transaction[] {
  if (range === "all") return transactions;

  const now = new Date("2026-05-19T23:59:59"); // pinned to demo data window
  const msMap: Record<string, number> = {
    today: 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const daysAgo = msMap[range] ?? 999;
  const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  return transactions.filter((tx) => new Date(tx.timestamp) >= cutoff);
}

export function computeMetrics(transactions: Transaction[]): MetricSummary {
  const completed = transactions.filter((t) => t.status === "Completed");
  const failed = transactions.filter((t) => t.status === "Failed");
  const pending = transactions.filter((t) => t.status === "Pending");
  const refunded = transactions.filter((t) => t.status === "Refunded");

  const totalRevenue = completed.reduce((s, t) => s + t.amount, 0);
  const totalCommission = completed.reduce((s, t) => s + t.commission, 0);
  const avgOrderValue = completed.length ? totalRevenue / completed.length : 0;
  const avgCommissionRate =
    transactions.length
      ? transactions.reduce((s, t) => s + t.commissionRate, 0) / transactions.length
      : 0;

  return {
    totalRevenue,
    totalCommission,
    completedCount: completed.length,
    failedCount: failed.length,
    pendingCount: pending.length,
    refundedCount: refunded.length,
    successRate: transactions.length
      ? Math.round((completed.length / transactions.length) * 100)
      : 0,
    avgOrderValue,
    avgCommissionRate,
    totalTransactions: transactions.length,
  };
}

export function exportToCSV(transactions: Transaction[], filename = "transactions.csv") {
  const headers = [
    "Order ID", "Restaurant", "City", "Amount", "Commission",
    "Commission Rate", "Payment Method", "Status", "Timestamp", "Note"
  ];
  const rows = transactions.map((t) => [
    t.id, t.restaurant, t.city, t.amount, t.commission,
    `${t.commissionRate}%`, t.paymentMethod, t.status, t.timestamp, t.note ?? ""
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}