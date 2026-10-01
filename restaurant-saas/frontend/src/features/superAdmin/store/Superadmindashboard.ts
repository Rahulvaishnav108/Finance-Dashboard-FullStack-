import { Utensils, IndianRupee, ShoppingBag, Percent } from "lucide-react";

export const revenueData = [
  { month: "Jan", revenue: 42000, orders: 45000 },
  { month: "Feb", revenue: 50000, orders: 52000 },
  { month: "Mar", revenue: 46000, orders: 47000 },
  { month: "Apr", revenue: 60000, orders: 62000 },
  { month: "May", revenue: 54000, orders: 55000 },
  { month: "Jun", revenue: 68000, orders: 70000 },
];

export const pieData = [
  { name: "Active", value: 72, color: "#10B981" },
  { name: "Trial", value: 20, color: "#F97316" },
  { name: "Inactive", value: 6, color: "#64748B" },
  { name: "Blocked", value: 2, color: "#EF4444" },
];

export const restaurants = [
  {
    name: "Burger House",
    orders: 1240,
    revenue: "₹12,400",
    growth: "+12%",
  },
  {
    name: "Pizza Hub",
    orders: 980,
    revenue: "₹9,200",
    growth: "+9%",
  },
  {
    name: "Food Point",
    orders: 870,
    revenue: "₹8,100",
    growth: "+7%",
  },
];

export const stats = [
  {
    title: "Total Restaurants",
    value: "216",
    growth: "+12.5%",
    icon: Utensils,
    lightColor: "text-emerald-600 bg-emerald-500/10",
    darkColor: "text-emerald-400 bg-emerald-500/10",
  },
  {
    title: "Monthly Revenue",
    value: "₹67,000",
    growth: "+21.8%",
    icon: IndianRupee,
    lightColor: "text-amber-600 bg-amber-500/10",
    darkColor: "text-amber-400 bg-amber-500/10",
  },
  {
    title: "Total Orders",
    value: "8,970",
    growth: "+15.3%",
    icon: ShoppingBag,
    lightColor: "text-blue-600 bg-blue-500/10",
    darkColor: "text-blue-400 bg-blue-500/10",
  },
  {
    title: "Commission Earned",
    value: "₹6,700",
    growth: "+18.4%",
    icon: Percent,
    lightColor: "text-indigo-600 bg-indigo-500/10",
    darkColor: "text-indigo-400 bg-indigo-500/10",
  },
];