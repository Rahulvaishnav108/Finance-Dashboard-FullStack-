// utils/subscriptionUtils.ts

import type { RestaurantNode, TierMetrics, TierMetric } from "../components/Subscriptions/Subcriptiontypes";

export function parseRevenue(raw: string): number {
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildTierMetric(nodes: RestaurantNode[]): TierMetric {
  const revenue = nodes.reduce((acc, r) => acc + parseRevenue(r.revenue), 0);
  return {
    count: nodes.length,
    revenue,
    formattedRevenue: formatCurrency(revenue),
    activeCount: nodes.filter((r) => r.status === "Active").length,
    trialCount: nodes.filter((r) => r.status === "Trial").length,
  };
}

export function computeTierMetrics(restaurants: RestaurantNode[]): TierMetrics {
  const basic      = restaurants.filter((r) => r.plan === "Basic");
  const standard   = restaurants.filter((r) => r.plan === "Standard");
  const premium    = restaurants.filter((r) => r.plan === "Premium");
  const enterprise = restaurants.filter((r) => r.plan === "Enterprise");
  const totalRevenue = restaurants.reduce((acc, r) => acc + parseRevenue(r.revenue), 0);

  return {
    basic:      buildTierMetric(basic),
    standard:   buildTierMetric(standard),
    premium:    buildTierMetric(premium),
    enterprise: buildTierMetric(enterprise),
    totalRevenue,
    totalNodes: restaurants.length,
  };
}

export function exportToCSV(restaurants: RestaurantNode[], filename = "subscriptions.csv") {
  const headers = [
    "ID", "Name", "Owner", "Email", "Phone", "Location",
    "Plan", "Status", "Revenue", "Branches", "Joined Date", "Last Active", "Tags"
  ];
  const rows = restaurants.map((r) => [
    r.id, r.name, r.owner, r.email, r.phone, r.location,
    r.plan, r.status, r.revenue, r.branches, r.joinedDate, r.lastActive,
    (r.tags ?? []).join("; ")
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

export function generateId(): string {
  return `RST-${Math.floor(1000 + Math.random() * 9000)}`;
}