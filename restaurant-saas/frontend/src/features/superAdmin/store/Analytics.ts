// src/features/superAdmin/store/Analytics.ts
import {
  BarChart3,
  Utensils,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MetricItem {
  label: string;
  current: string;
  shift: string;
  icon: LucideIcon;
  darkBg: string;
  lightBg: string;
}

export interface BarSeriesItem {
  period: string;
  load: number;
  capacity: number;
}

export interface DistributionItem {
  division: string;
  allocation: number;
  Hex: string;
}

export type OrderStatus = "Settled" | "Processing" | "Disputed";

export interface PlatformOrder {
  id: string;
  restaurant: string;
  type: string;
  grossAmount: number;
  commission: number;
  status: OrderStatus;
  timestamp: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

export const metricsData: MetricItem[] = [
  {
    label: "Active Clusters",
    current: "142",
    shift: "+12 this week",
    icon: BarChart3,
    darkBg: "bg-blue-500/10 text-blue-400",
    lightBg: "bg-blue-50 text-blue-600",
  },
  {
    label: "Total Restaurants",
    current: "3,894",
    shift: "+54 onboarded",
    icon: Utensils,
    darkBg: "bg-orange-500/10 text-orange-400",
    lightBg: "bg-orange-50 text-orange-600",
  },
  {
    label: "Revenue Today",
    current: "₹48,230",
    shift: "+8.2% vs yesterday",
    icon: IndianRupee,
    darkBg: "bg-emerald-500/10 text-emerald-400",
    lightBg: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Uptime",
    current: "99.97%",
    shift: "+0.02% SLA",
    icon: TrendingUp,
    darkBg: "bg-purple-500/10 text-purple-400",
    lightBg: "bg-purple-50 text-purple-600",
  },
];

export const barSeries: BarSeriesItem[] = [
  { period: "Mon", load: 65, capacity: 80 },
  { period: "Tue", load: 78, capacity: 90 },
  { period: "Wed", load: 92, capacity: 85 },
  { period: "Thu", load: 55, capacity: 75 },
  { period: "Fri", load: 88, capacity: 95 },
  { period: "Sat", load: 70, capacity: 88 },
  { period: "Sun", load: 45, capacity: 60 },
];

export const distributionSeries: DistributionItem[] = [
  { division: "Delivery", allocation: 42, Hex: "#f97316" },
  { division: "Dine-In",  allocation: 28, Hex: "#3b82f6" },
  { division: "Pickup",   allocation: 18, Hex: "#8b5cf6" },
  { division: "Catering", allocation: 12, Hex: "#10b981" },
];

export const mockPlatformOrders: PlatformOrder[] = [
  { id: "#A1F2C", restaurant: "Taste of India",  type: "Delivery", grossAmount: 4200, commission: 420, status: "Settled",    timestamp: "Today, 10:30 AM" },
  { id: "#B3D9E", restaurant: "Urban Bites",      type: "Pickup",   grossAmount: 2850, commission: 285, status: "Processing", timestamp: "Today, 09:45 AM" },
  { id: "#C7H1K", restaurant: "Ocean Delights",   type: "Dine-In",  grossAmount: 6100, commission: 610, status: "Settled",    timestamp: "Yesterday, 07:20 PM" },
  { id: "#D4J8M", restaurant: "Green Garden",     type: "Catering", grossAmount: 9500, commission: 950, status: "Disputed",   timestamp: "Yesterday, 03:10 PM" },
  { id: "#E2N5P", restaurant: "Burger Corner",    type: "Delivery", grossAmount: 1980, commission: 198, status: "Settled",    timestamp: "Jun 11, 12:55 PM" },
  { id: "#F6Q3R", restaurant: "Spicy Wok",        type: "Pickup",   grossAmount: 3300, commission: 330, status: "Processing", timestamp: "Jun 11, 11:40 AM" },
  { id: "#G8S7T", restaurant: "Pizza Palace",     type: "Delivery", grossAmount: 5600, commission: 560, status: "Settled",    timestamp: "Jun 10, 08:15 PM" },
];