import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export type DateRange = 'Daily' | 'Weekly' | 'Monthly';
export type SalesChannel = 'Dine-in' | 'Takeaway' | 'Delivery' | 'Online';
export type PeakHoursRange = 'Daily' | 'Weekly' | 'Monthly';

export interface DateRangeSelection {
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface ReportStats {
  totalRevenue: string;
  totalRevenueChange: string;
  totalOrders: number;
  totalOrdersChange: string;
  avgOrderValue: string;
  avgOrderValueChange: string;
  totalCustomers: number;
  totalCustomersChange: string;
  repeatCustomers: number;
  repeatCustomersChange: string;
  netProfit: string;
  netProfitChange: string;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface OrdersTrendPoint {
  date: string;
  orders: number;
}

export interface SalesByChannel {
  channel: SalesChannel;
  pct: number;
  amount: string;
  color: string;
}

export interface TopSellingItem {
  id: string;
  name: string;
  emoji: string;
  orders: number;
  revenue: string;
}

export interface RevenueByCategory {
  name: string;
  pct: number;
  amount: string;
  color: string;
}

export interface PeakHourCell {
  day: string;
  hour: string;
  intensity: number;
}

export interface DailySummaryRow {
  date: string;
  revenue: string;
  orders: number;
  customers: number;
  avgOrderValue: string;
  repeatCustomers: number;
  netProfit: string;
}

export interface Insight {
  id: string;
  emoji: string;
  color: string;
  title: string;
  body: string;
}

export interface ReportShortcut {
  id: string;
  label: string;
}

// ── Multi-range seed data ──────────────────────────────────────────────────

const REVENUE_DATA: Record<DateRange, RevenuePoint[]> = {
  Daily: [
    { date: '12 May', revenue: 15000 },
    { date: '13 May', revenue: 17500 },
    { date: '14 May', revenue: 16200 },
    { date: '15 May', revenue: 19800 },
    { date: '16 May', revenue: 21000 },
    { date: '17 May', revenue: 22400 },
    { date: '18 May', revenue: 24680 },
  ],
  Weekly: [
    { date: 'Week 1', revenue: 82000 },
    { date: 'Week 2', revenue: 91500 },
    { date: 'Week 3', revenue: 87200 },
    { date: 'Week 4', revenue: 105800 },
  ],
  Monthly: [
    { date: 'Jan', revenue: 320000 },
    { date: 'Feb', revenue: 298000 },
    { date: 'Mar', revenue: 354000 },
    { date: 'Apr', revenue: 381000 },
    { date: 'May', revenue: 412000 },
    { date: 'Jun', revenue: 395000 },
  ],
};

const ORDERS_DATA: Record<DateRange, OrdersTrendPoint[]> = {
  Daily: [
    { date: '12 May', orders: 300 },
    { date: '13 May', orders: 340 },
    { date: '14 May', orders: 310 },
    { date: '15 May', orders: 380 },
    { date: '16 May', orders: 395 },
    { date: '17 May', orders: 410 },
    { date: '18 May', orders: 430 },
  ],
  Weekly: [
    { date: 'Week 1', orders: 1950 },
    { date: 'Week 2', orders: 2140 },
    { date: 'Week 3', orders: 2080 },
    { date: 'Week 4', orders: 2340 },
  ],
  Monthly: [
    { date: 'Jan', orders: 7800 },
    { date: 'Feb', orders: 7200 },
    { date: 'Mar', orders: 8600 },
    { date: 'Apr', orders: 9100 },
    { date: 'May', orders: 9800 },
    { date: 'Jun', orders: 9400 },
  ],
};

const TOP_ITEMS_DATA: Record<DateRange, TopSellingItem[]> = {
  Daily: [
    { id: 't1', name: 'Margherita Pizza',  emoji: '🍕', orders: 65,  revenue: '₹3,250' },
    { id: 't2', name: 'Chicken Burger',    emoji: '🍔', orders: 58,  revenue: '₹2,610' },
    { id: 't3', name: 'Caesar Salad',      emoji: '🥗', orders: 47,  revenue: '₹2,115' },
    { id: 't4', name: 'Pasta Alfredo',     emoji: '🍝', orders: 41,  revenue: '₹1,845' },
    { id: 't5', name: 'BBQ Chicken Pizza', emoji: '🍕', orders: 38,  revenue: '₹1,710' },
  ],
  Weekly: [
    { id: 't1', name: 'Margherita Pizza',  emoji: '🍕', orders: 425, revenue: '₹21,250' },
    { id: 't2', name: 'Chicken Burger',    emoji: '🍔', orders: 380, revenue: '₹17,100' },
    { id: 't3', name: 'Caesar Salad',      emoji: '🥗', orders: 310, revenue: '₹13,950' },
    { id: 't4', name: 'Pasta Alfredo',     emoji: '🍝', orders: 275, revenue: '₹12,375' },
    { id: 't5', name: 'BBQ Chicken Pizza', emoji: '🍕', orders: 250, revenue: '₹11,250' },
  ],
  Monthly: [
    { id: 't1', name: 'Margherita Pizza',  emoji: '🍕', orders: 1820, revenue: '₹91,000' },
    { id: 't2', name: 'Chicken Burger',    emoji: '🍔', orders: 1640, revenue: '₹73,800' },
    { id: 't3', name: 'Caesar Salad',      emoji: '🥗', orders: 1320, revenue: '₹59,400' },
    { id: 't4', name: 'Pasta Alfredo',     emoji: '🍝', orders: 1180, revenue: '₹53,100' },
    { id: 't5', name: 'BBQ Chicken Pizza', emoji: '🍕', orders: 1050, revenue: '₹47,250' },
  ],
};

const REV_BY_CAT_DATA: Record<DateRange, RevenueByCategory[]> = {
  Daily: [
    { name: 'Food',      pct: 68, amount: '₹16,782', color: '#f97316' },
    { name: 'Beverages', pct: 22, amount: '₹5,430',  color: '#3b82f6' },
    { name: 'Desserts',  pct: 10, amount: '₹2,468',  color: '#22c55e' },
  ],
  Weekly: [
    { name: 'Food',      pct: 70, amount: '₹1,14,380', color: '#f97316' },
    { name: 'Beverages', pct: 20, amount: '₹32,680',   color: '#3b82f6' },
    { name: 'Desserts',  pct: 10, amount: '₹16,340',   color: '#22c55e' },
  ],
  Monthly: [
    { name: 'Food',      pct: 71, amount: '₹4,60,500', color: '#f97316' },
    { name: 'Beverages', pct: 19, amount: '₹1,23,200', color: '#3b82f6' },
    { name: 'Desserts',  pct: 10, amount: '₹64,900',   color: '#22c55e' },
  ],
};

const PEAK_HOUR_CELLS_DATA: Record<PeakHoursRange, PeakHourCell[]> = (() => {
  const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'];

  function buildCells(patterns: Record<string, number>): PeakHourCell[] {
    const cells: PeakHourCell[] = [];
    days.forEach((day) => {
      hours.forEach((hour) => {
        const base   = patterns[hour] ?? 0.3;
        const jitter = (Math.sin(day.charCodeAt(0) + hour.charCodeAt(0)) * 0.5) * 0.2;
        cells.push({ day, hour, intensity: Math.max(0.05, Math.min(1, base + jitter)) });
      });
    });
    return cells;
  }

  return {
    Daily:   buildCells({ '6 AM': 0.1, '9 AM': 0.45, '12 PM': 0.85, '3 PM': 0.55, '6 PM': 0.95, '9 PM': 0.75, '12 AM': 0.15 }),
    Weekly:  buildCells({ '6 AM': 0.15, '9 AM': 0.5,  '12 PM': 0.8,  '3 PM': 0.65, '6 PM': 0.9,  '9 PM': 0.7,  '12 AM': 0.2  }),
    Monthly: buildCells({ '6 AM': 0.2,  '9 AM': 0.55, '12 PM': 0.75, '3 PM': 0.7,  '6 PM': 0.85, '9 PM': 0.65, '12 AM': 0.25 }),
  };
})();

const STATS_DATA: Record<DateRange, ReportStats> = {
  Daily: {
    totalRevenue: '₹24,680',
    totalRevenueChange: '↑ 12.5% vs yesterday',
    totalOrders: 430,
    totalOrdersChange: '↑ 5.0% vs yesterday',
    avgOrderValue: '₹573',
    avgOrderValueChange: '↑ 7.2% vs yesterday',
    totalCustomers: 318,
    totalCustomersChange: '↑ 9.4% vs yesterday',
    repeatCustomers: 98,
    repeatCustomersChange: '↑ 6.1% vs yesterday',
    netProfit: '₹8,245',
    netProfitChange: '↑ 14.3% vs yesterday',
  },
  Weekly: {
    totalRevenue: '₹1,63,400',
    totalRevenueChange: '↑ 8.3% vs last week',
    totalOrders: 2565,
    totalOrdersChange: '↑ 6.7% vs last week',
    avgOrderValue: '₹637',
    avgOrderValueChange: '↑ 4.8% vs last week',
    totalCustomers: 1842,
    totalCustomersChange: '↑ 10.2% vs last week',
    repeatCustomers: 684,
    repeatCustomersChange: '↑ 7.8% vs last week',
    netProfit: '₹56,210',
    netProfitChange: '↑ 11.5% vs last week',
  },
  Monthly: {
    totalRevenue: '₹6,48,500',
    totalRevenueChange: '↑ 15.2% vs last month',
    totalOrders: 9800,
    totalOrdersChange: '↑ 9.1% vs last month',
    avgOrderValue: '₹662',
    avgOrderValueChange: '↑ 5.6% vs last month',
    totalCustomers: 7240,
    totalCustomersChange: '↑ 12.5% vs last month',
    repeatCustomers: 2680,
    repeatCustomersChange: '↑ 8.9% vs last month',
    netProfit: '₹2,24,350',
    netProfitChange: '↑ 17.8% vs last month',
  },
};

const DAILY_SUMMARY_DATA: Record<DateRange, DailySummaryRow[]> = {
  Daily: [
    { date: 'Today — 18 May',     revenue: '₹24,680', orders: 430,  customers: 318, avgOrderValue: '₹573', repeatCustomers: 98,  netProfit: '₹8,245'  },
    { date: 'Yesterday — 17 May', revenue: '₹22,400', orders: 410,  customers: 305, avgOrderValue: '₹546', repeatCustomers: 92,  netProfit: '₹7,680'  },
    { date: '16 May',             revenue: '₹21,000', orders: 395,  customers: 289, avgOrderValue: '₹531', repeatCustomers: 86,  netProfit: '₹7,100'  },
  ],
  Weekly: [
    { date: 'Week 18 (Current)',  revenue: '₹1,63,400', orders: 2565, customers: 1842, avgOrderValue: '₹637', repeatCustomers: 684, netProfit: '₹56,210' },
    { date: 'Week 17',            revenue: '₹1,50,800', orders: 2402, customers: 1710, avgOrderValue: '₹628', repeatCustomers: 631, netProfit: '₹50,420' },
    { date: 'Week 16',            revenue: '₹1,44,200', orders: 2280, customers: 1648, avgOrderValue: '₹632', repeatCustomers: 594, netProfit: '₹48,100' },
  ],
  Monthly: [
    { date: 'May 2025',  revenue: '₹6,48,500', orders: 9800, customers: 7240, avgOrderValue: '₹662', repeatCustomers: 2680, netProfit: '₹2,24,350' },
    { date: 'April 2025',revenue: '₹5,63,200', orders: 8950, customers: 6620, avgOrderValue: '₹629', repeatCustomers: 2380, netProfit: '₹1,90,100' },
    { date: 'March 2025',revenue: '₹5,28,400', orders: 8600, customers: 6310, avgOrderValue: '₹614', repeatCustomers: 2180, netProfit: '₹1,75,400' },
  ],
};

// ── Store ──────────────────────────────────────────────────────────────────

interface ReportsState {
  // Global range (affects stats + daily summary)
  globalRange: DateRange;

  // Per-widget ranges
  revenueRange: DateRange;
  ordersRange: DateRange;
  topItemsRange: DateRange;
  revByCatRange: DateRange;
  peakHoursRange: PeakHoursRange;

  // Calendar / date picker
  dateRangeSelection: DateRangeSelection;
  isCalendarOpen: boolean;

  // Static data
  salesByChannel: SalesByChannel[];
  insights: Insight[];
  shortcuts: ReportShortcut[];

  // Derived (computed getters via selectors)
  getStats: () => ReportStats;
  getDateLabel: () => string;
  getRevenueTrend: () => RevenuePoint[];
  getOrdersTrend: () => OrdersTrendPoint[];
  getTopSellingItems: () => TopSellingItem[];
  getRevenueByCategory: () => RevenueByCategory[];
  getPeakHourCells: () => PeakHourCell[];
  getDailySummary: () => DailySummaryRow[];

  // Actions
  setGlobalRange: (r: DateRange) => void;
  setRevenueRange: (r: DateRange) => void;
  setOrdersRange: (r: DateRange) => void;
  setTopItemsRange: (r: DateRange) => void;
  setRevByCatRange: (r: DateRange) => void;
  setPeakHoursRange: (r: PeakHoursRange) => void;
  setDateRangeSelection: (sel: DateRangeSelection) => void;
  setIsCalendarOpen: (open: boolean) => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  globalRange:  'Weekly',
  revenueRange: 'Daily',
  ordersRange:  'Daily',
  topItemsRange:'Weekly',
  revByCatRange:'Weekly',
  peakHoursRange: 'Daily',

  dateRangeSelection: {
    startDate: new Date(2025, 4, 12),
    endDate:   new Date(2025, 4, 18),
    label:     'May 12 – May 18, 2025',
  },
  isCalendarOpen: false,

  salesByChannel: [
    { channel: 'Dine-in',  pct: 45, amount: '₹73,575', color: '#f97316' },
    { channel: 'Takeaway', pct: 30, amount: '₹49,020', color: '#3b82f6' },
    { channel: 'Delivery', pct: 20, amount: '₹32,680', color: '#22c55e' },
    { channel: 'Online',   pct:  5, amount: '₹8,170',  color: '#a855f7' },
  ],

  insights: [
    { id: 'i1', emoji: '📈', color: 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/40',   title: 'Revenue is up 8.3% compared to last week.', body: 'Great job! Your business is growing steadily.' },
    { id: 'i2', emoji: '🕕', color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40',      title: 'Friday & Saturday are your busiest days.', body: 'Consider scheduling more staff during these peak times.' },
    { id: 'i3', emoji: '⭐', color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40',  title: 'Margherita Pizza is your top selling item.', body: 'It contributed 17% of total sales this week.' },
  ],

  shortcuts: [
    { id: 'sc1', label: 'Sales Summary'     },
    { id: 'sc2', label: 'Orders Report'     },
    { id: 'sc3', label: 'Menu Performance'  },
    { id: 'sc4', label: 'Inventory Report'  },
    { id: 'sc5', label: 'Staff Performance' },
  ],

  // Selectors
  getStats:            () => STATS_DATA[get().globalRange],
  getDateLabel:        () => get().dateRangeSelection.label,
  getRevenueTrend:     () => REVENUE_DATA[get().revenueRange],
  getOrdersTrend:      () => ORDERS_DATA[get().ordersRange],
  getTopSellingItems:  () => TOP_ITEMS_DATA[get().topItemsRange],
  getRevenueByCategory:() => REV_BY_CAT_DATA[get().revByCatRange],
  getPeakHourCells:    () => PEAK_HOUR_CELLS_DATA[get().peakHoursRange],
  getDailySummary:     () => DAILY_SUMMARY_DATA[get().globalRange],

  // Actions
  setGlobalRange:       (r) => set({ globalRange: r }),
  setRevenueRange:      (r) => set({ revenueRange: r }),
  setOrdersRange:       (r) => set({ ordersRange: r }),
  setTopItemsRange:     (r) => set({ topItemsRange: r }),
  setRevByCatRange:     (r) => set({ revByCatRange: r }),
  setPeakHoursRange:    (r) => set({ peakHoursRange: r }),
  setDateRangeSelection:(sel) => set({ dateRangeSelection: sel, isCalendarOpen: false }),
  setIsCalendarOpen:    (open) => set({ isCalendarOpen: open }),
}));

// ── Export helpers ─────────────────────────────────────────────────────────

export function exportReportsAsCSV(store: ReturnType<typeof useReportsStore.getState>): void {
  const stats   = store.getStats();
  const summary = store.getDailySummary();
  const topItems= store.getTopSellingItems();
  const revCat  = store.getRevenueByCategory();

  const sections: string[] = [];

  // Stats section
  sections.push('=== SUMMARY ===');
  sections.push('Metric,Value,Change');
  sections.push(`Total Revenue,${stats.totalRevenue},${stats.totalRevenueChange}`);
  sections.push(`Total Orders,${stats.totalOrders},${stats.totalOrdersChange}`);
  sections.push(`Avg Order Value,${stats.avgOrderValue},${stats.avgOrderValueChange}`);
  sections.push(`Total Customers,${stats.totalCustomers},${stats.totalCustomersChange}`);
  sections.push(`Repeat Customers,${stats.repeatCustomers},${stats.repeatCustomersChange}`);
  sections.push(`Net Profit,${stats.netProfit},${stats.netProfitChange}`);
  sections.push('');

  // Daily summary
  sections.push('=== PERIOD SUMMARY ===');
  sections.push('Date,Revenue,Orders,Customers,Avg Order Value,Repeat Customers,Net Profit');
  summary.forEach((r) => {
    sections.push(`${r.date},${r.revenue},${r.orders},${r.customers},${r.avgOrderValue},${r.repeatCustomers},${r.netProfit}`);
  });
  sections.push('');

  // Top items
  sections.push('=== TOP SELLING ITEMS ===');
  sections.push('Item,Orders,Revenue');
  topItems.forEach((i) => {
    sections.push(`${i.name},${i.orders},${i.revenue}`);
  });
  sections.push('');

  // Revenue by category
  sections.push('=== REVENUE BY CATEGORY ===');
  sections.push('Category,Percentage,Amount');
  revCat.forEach((c) => {
    sections.push(`${c.name},${c.pct}%,${c.amount}`);
  });

  const csv  = sections.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `report_${store.dateRangeSelection.label.replace(/[^a-z0-9]/gi, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}