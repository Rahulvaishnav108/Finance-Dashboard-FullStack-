// ── Kitchen Mock Data Store ──────────────────────────────────

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delayed' | 'completed' | 'cancelled';
export type OrderType = 'dine-in' | 'take-away' | 'delivery';

export interface OrderItem {
  name: string;
  qty: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  items: OrderItem[];
  table: string;
  type: OrderType;
  status: OrderStatus;
  time: string;
  timeAgo: string;
  progress?: number;
  delayMins?: number;
  priority?: 'normal' | 'high' | 'vip';
  chef?: string;
}

export const ORDERS: KitchenOrder[] = [
  // NEW
  { id: 'ORD-12585', items: [{ name: 'Veg Biryani', qty: 1 }, { name: 'Paneer Tikka', qty: 1 }], table: 'T07', type: 'dine-in', status: 'new', time: '10:40 AM', timeAgo: '2 mins ago', priority: 'normal' },
  { id: 'ORD-12586', items: [{ name: 'Chicken Burger', qty: 2 }, { name: 'French Fries', qty: 1 }], table: 'T12', type: 'dine-in', status: 'new', time: '10:39 AM', timeAgo: '3 mins ago' },
  { id: 'ORD-12587', items: [{ name: 'Margherita Pizza', qty: 1 }, { name: 'Cold Coffee', qty: 1 }], table: 'T03', type: 'take-away', status: 'new', time: '10:37 AM', timeAgo: '5 mins ago' },
  { id: 'ORD-12588', items: [{ name: 'Dal Makhani', qty: 1 }, { name: 'Butter Naan', qty: 3 }], table: 'T15', type: 'dine-in', status: 'new', time: '10:36 AM', timeAgo: '6 mins ago' },
  { id: 'ORD-12589', items: [{ name: 'Pasta Alfredo', qty: 2 }], table: 'T08', type: 'delivery', status: 'new', time: '10:35 AM', timeAgo: '7 mins ago' },
  { id: 'ORD-12590', items: [{ name: 'Tandoori Chicken', qty: 1 }, { name: 'Rumali Roti', qty: 4 }], table: 'T10', type: 'dine-in', status: 'new', time: '10:34 AM', timeAgo: '8 mins ago' },
  // PREPARING
  { id: 'ORD-12581', items: [{ name: 'Butter Chicken', qty: 1 }, { name: 'Garlic Naan', qty: 2 }], table: 'T02', type: 'dine-in', status: 'preparing', time: '08:35 AM', timeAgo: '2h ago', progress: 60, chef: 'Chef Meena' },
  { id: 'ORD-12582', items: [{ name: 'Veg Fried Rice', qty: 1 }, { name: 'Honey Chilli Potato', qty: 1 }], table: 'T09', type: 'take-away', status: 'preparing', time: '08:33 AM', timeAgo: '2h ago', progress: 40, chef: 'Chef Ravi' },
  { id: 'ORD-12583', items: [{ name: 'Chicken Biryani', qty: 3 }, { name: 'Raita', qty: 1 }], table: 'T01', type: 'dine-in', status: 'preparing', time: '08:30 AM', timeAgo: '2h ago', progress: 75, priority: 'vip', chef: 'Chef Arjun' },
  { id: 'ORD-12584', items: [{ name: 'Fish Curry', qty: 1 }, { name: 'Steamed Rice', qty: 2 }], table: 'T07', type: 'dine-in', status: 'preparing', time: '08:28 AM', timeAgo: '2h ago', progress: 85, chef: 'Chef Priya' },
  { id: 'ORD-12580', items: [{ name: 'Chole Bhature', qty: 2 }], table: 'T13', type: 'dine-in', status: 'preparing', time: '08:25 AM', timeAgo: '2h ago', progress: 30, chef: 'Chef Meena' },
  { id: 'ORD-12579', items: [{ name: 'Egg Biryani', qty: 1 }, { name: 'Mirchi Ka Salan', qty: 1 }], table: 'T04', type: 'take-away', status: 'preparing', time: '08:22 AM', timeAgo: '2h ago', progress: 50, chef: 'Chef Ravi' },
  { id: 'ORD-12575', items: [{ name: 'Paneer Lababdar', qty: 1 }, { name: 'Jeera Rice', qty: 1 }], table: 'T11', type: 'dine-in', status: 'preparing', time: '08:18 AM', timeAgo: '2h ago', progress: 90, chef: 'Chef Arjun' },
  { id: 'ORD-12574', items: [{ name: 'Kadai Paneer', qty: 1 }, { name: 'Laccha Paratha', qty: 2 }], table: 'T14', type: 'delivery', status: 'preparing', time: '08:15 AM', timeAgo: '2h ago', progress: 20, chef: 'Chef Priya' },
  // READY
  { id: 'ORD-12576', items: [{ name: 'Paneer Butter Masala', qty: 1 }, { name: 'Tandoori Roti', qty: 2 }], table: 'T05', type: 'dine-in', status: 'ready', time: '08:28 AM', timeAgo: '2h ago' },
  { id: 'ORD-12577', items: [{ name: 'Veg Noodles', qty: 1 }, { name: 'Manchurian', qty: 1 }], table: 'T11', type: 'take-away', status: 'ready', time: '08:27 AM', timeAgo: '2h ago' },
  { id: 'ORD-12578', items: [{ name: 'Masala Dosa', qty: 2 }, { name: 'Filter Coffee', qty: 2 }], table: 'T04', type: 'dine-in', status: 'ready', time: '08:26 AM', timeAgo: '2h ago' },
  { id: 'ORD-12573', items: [{ name: 'Samosa', qty: 4 }, { name: 'Green Chutney', qty: 1 }], table: 'T16', type: 'dine-in', status: 'ready', time: '08:24 AM', timeAgo: '2h ago' },
  { id: 'ORD-12572', items: [{ name: 'Aloo Paratha', qty: 2 }, { name: 'Curd', qty: 1 }], table: 'T07', type: 'take-away', status: 'ready', time: '08:22 AM', timeAgo: '2h ago' },
  // DELAYED
  { id: 'ORD-12570', items: [{ name: 'Mutton Rogan Josh', qty: 1 }, { name: 'Jeera Rice', qty: 2 }], table: 'T07', type: 'dine-in', status: 'delayed', time: '08:15 AM', timeAgo: '2h ago', delayMins: 10 },
  { id: 'ORD-12571', items: [{ name: 'Chicken Curry', qty: 1 }, { name: 'Paratha', qty: 2 }], table: 'T14', type: 'dine-in', status: 'delayed', time: '08:10 AM', timeAgo: '2h ago', delayMins: 15 },
  { id: 'ORD-12569', items: [{ name: 'Lamb Kebab', qty: 2 }], table: 'T03', type: 'delivery', status: 'delayed', time: '08:05 AM', timeAgo: '2h ago', delayMins: 20 },
  // COMPLETED
  { id: 'ORD-12560', items: [{ name: 'Veg Thali', qty: 2 }], table: 'T01', type: 'dine-in', status: 'completed', time: '07:45 AM', timeAgo: '3h ago' },
  { id: 'ORD-12561', items: [{ name: 'Chicken Momos', qty: 3 }], table: 'T08', type: 'take-away', status: 'completed', time: '07:30 AM', timeAgo: '3h ago' },
];

// ── Kitchen Stations ──────────────────────────────────────────
export interface KitchenStation {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'maintenance';
  chef: string;
  activeOrders: number;
  load: number;
  currentItems: string[];
  avgPrepTime: string;
}

export const STATIONS: KitchenStation[] = [
  { id: 'STN-01', name: 'Grill Station', type: 'Grilling', status: 'active', chef: 'Chef Arjun', activeOrders: 4, load: 85, currentItems: ['Tandoori Chicken', 'Paneer Tikka', 'Seekh Kebab'], avgPrepTime: '12 min' },
  { id: 'STN-02', name: 'Curry Station', type: 'Indian Main', status: 'active', chef: 'Chef Meena', activeOrders: 6, load: 92, currentItems: ['Butter Chicken', 'Dal Makhani', 'Paneer Butter Masala'], avgPrepTime: '18 min' },
  { id: 'STN-03', name: 'Fry Station', type: 'Frying & Snacks', status: 'active', chef: 'Chef Ravi', activeOrders: 3, load: 60, currentItems: ['French Fries', 'Samosa', 'Pakora'], avgPrepTime: '8 min' },
  { id: 'STN-04', name: 'Biryani Station', type: 'Rice & Biryani', status: 'active', chef: 'Chef Priya', activeOrders: 5, load: 78, currentItems: ['Chicken Biryani', 'Veg Biryani', 'Jeera Rice'], avgPrepTime: '25 min' },
  { id: 'STN-05', name: 'Dessert Counter', type: 'Desserts', status: 'idle', chef: 'Chef Sana', activeOrders: 0, load: 0, currentItems: [], avgPrepTime: '10 min' },
  { id: 'STN-06', name: 'Beverage Station', type: 'Drinks', status: 'active', chef: 'Asst. Karan', activeOrders: 2, load: 35, currentItems: ['Cold Coffee', 'Filter Coffee'], avgPrepTime: '5 min' },
  { id: 'STN-07', name: 'Prep Station', type: 'Chopping & Prep', status: 'active', chef: 'Asst. Deepa', activeOrders: 0, load: 50, currentItems: ['Onion prep', 'Garlic paste', 'Marination'], avgPrepTime: '-' },
  { id: 'STN-08', name: 'Tandoor Station', type: 'Tandoor', status: 'maintenance', chef: '-', activeOrders: 0, load: 0, currentItems: [], avgPrepTime: '15 min' },
];

// ── Kitchen Staff ─────────────────────────────────────────────
export interface KitchenStaff {
  id: string;
  name: string;
  role: string;
  status: 'on-duty' | 'off-duty' | 'on-break';
  station: string;
  shift: string;
  ordersCompleted: number;
  avgPrepTime: string;
  rating: number;
  avatar: string;
  phone?: string;
  email?: string;
}

export const STAFF: KitchenStaff[] = [
  { id: 'STF-01', name: 'Chef Arjun', role: 'Executive Chef', status: 'on-duty', station: 'Grill Station', shift: '6:00 AM - 2:00 PM', ordersCompleted: 48, avgPrepTime: '12 min', rating: 4.8, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmbmbzz4OJ7IsEkEHmNZJz11jLymeZ8GiEKeOnWQmoOE5Q_HuXkjmZXYQQnxukQmYSukcHmGlDaE2DekU_XTxx94qss_9SynPU_qRxjig9w5vwaSPK0QOJ19bP2nDTKH0okSa-V_RlIcQtcPnyw0GO46oo69eT4L-oy_NlsShqVsJ53F8vs3K8QuVkaIozpaP67AMr8YinHpVrCmjqhBE2XnqtFhZ4QaLUR6pKjqn9OeT0fUi28Ah4z0Az_h_TwjcYiaHG7j24-Qs' },
  { id: 'STF-02', name: 'Chef Meena', role: 'Senior Chef', status: 'on-duty', station: 'Curry Station', shift: '6:00 AM - 2:00 PM', ordersCompleted: 52, avgPrepTime: '16 min', rating: 4.9, avatar: '' },
  { id: 'STF-03', name: 'Chef Ravi', role: 'Line Cook', status: 'on-duty', station: 'Fry Station', shift: '6:00 AM - 2:00 PM', ordersCompleted: 35, avgPrepTime: '8 min', rating: 4.5, avatar: '' },
  { id: 'STF-04', name: 'Chef Priya', role: 'Sous Chef', status: 'on-duty', station: 'Biryani Station', shift: '6:00 AM - 2:00 PM', ordersCompleted: 42, avgPrepTime: '22 min', rating: 4.7, avatar: '' },
  { id: 'STF-05', name: 'Chef Sana', role: 'Pastry Chef', status: 'on-break', station: 'Dessert Counter', shift: '10:00 AM - 6:00 PM', ordersCompleted: 15, avgPrepTime: '10 min', rating: 4.6, avatar: '' },
  { id: 'STF-06', name: 'Asst. Karan', role: 'Kitchen Assistant', status: 'on-duty', station: 'Beverage Station', shift: '6:00 AM - 2:00 PM', ordersCompleted: 28, avgPrepTime: '4 min', rating: 4.3, avatar: '' },
  { id: 'STF-07', name: 'Asst. Deepa', role: 'Prep Cook', status: 'on-duty', station: 'Prep Station', shift: '5:00 AM - 1:00 PM', ordersCompleted: 0, avgPrepTime: '-', rating: 4.4, avatar: '' },
  { id: 'STF-08', name: 'Chef Vikram', role: 'Line Cook', status: 'off-duty', station: '-', shift: '2:00 PM - 10:00 PM', ordersCompleted: 0, avgPrepTime: '-', rating: 4.2, avatar: '' },
];

// ── Inventory ─────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  lastRestocked: string;
  status: 'ok' | 'low' | 'critical';
  dailyUsage: number;
}

export const INVENTORY: InventoryItem[] = [
  { id: 'INV-01', name: 'Basmati Rice', category: 'Grains', stock: 45, unit: 'kg', minStock: 20, lastRestocked: '2 days ago', status: 'ok', dailyUsage: 12 },
  { id: 'INV-02', name: 'Chicken Breast', category: 'Protein', stock: 8, unit: 'kg', minStock: 10, lastRestocked: '1 day ago', status: 'low', dailyUsage: 15 },
  { id: 'INV-03', name: 'Paneer', category: 'Dairy', stock: 3, unit: 'kg', minStock: 5, lastRestocked: '3 days ago', status: 'critical', dailyUsage: 6 },
  { id: 'INV-04', name: 'Cooking Oil', category: 'Oil', stock: 20, unit: 'L', minStock: 10, lastRestocked: '4 days ago', status: 'ok', dailyUsage: 4 },
  { id: 'INV-05', name: 'Onions', category: 'Vegetables', stock: 30, unit: 'kg', minStock: 15, lastRestocked: '1 day ago', status: 'ok', dailyUsage: 10 },
  { id: 'INV-06', name: 'Tomatoes', category: 'Vegetables', stock: 12, unit: 'kg', minStock: 10, lastRestocked: '1 day ago', status: 'ok', dailyUsage: 8 },
  { id: 'INV-07', name: 'Butter', category: 'Dairy', stock: 4, unit: 'kg', minStock: 5, lastRestocked: '2 days ago', status: 'low', dailyUsage: 3 },
  { id: 'INV-08', name: 'All-Purpose Flour', category: 'Grains', stock: 25, unit: 'kg', minStock: 10, lastRestocked: '5 days ago', status: 'ok', dailyUsage: 5 },
  { id: 'INV-09', name: 'Mutton', category: 'Protein', stock: 2, unit: 'kg', minStock: 5, lastRestocked: '2 days ago', status: 'critical', dailyUsage: 4 },
  { id: 'INV-10', name: 'Fresh Cream', category: 'Dairy', stock: 6, unit: 'L', minStock: 3, lastRestocked: '1 day ago', status: 'ok', dailyUsage: 2 },
  { id: 'INV-11', name: 'Garlic', category: 'Vegetables', stock: 5, unit: 'kg', minStock: 3, lastRestocked: '3 days ago', status: 'ok', dailyUsage: 2 },
  { id: 'INV-12', name: 'Ginger', category: 'Vegetables', stock: 4, unit: 'kg', minStock: 2, lastRestocked: '2 days ago', status: 'ok', dailyUsage: 1.5 },
];

// ── Batch Cooking ─────────────────────────────────────────────
export interface CookingBatch {
  id: string;
  name: string;
  items: string[];
  servings: number;
  progress: number;
  status: 'active' | 'scheduled' | 'completed';
  startTime: string;
  estComplete: string;
  chef: string;
  station: string;
}

export const BATCHES: CookingBatch[] = [
  { id: 'BCH-01', name: 'Lunch Biryani Batch', items: ['Chicken Biryani', 'Veg Biryani', 'Egg Biryani'], servings: 50, progress: 65, status: 'active', startTime: '09:00 AM', estComplete: '11:30 AM', chef: 'Chef Priya', station: 'Biryani Station' },
  { id: 'BCH-02', name: 'Gravy Prep Batch', items: ['Butter Chicken Gravy', 'Dal Makhani', 'Paneer Gravy Base'], servings: 40, progress: 80, status: 'active', startTime: '08:30 AM', estComplete: '10:30 AM', chef: 'Chef Meena', station: 'Curry Station' },
  { id: 'BCH-03', name: 'Naan & Roti Batch', items: ['Garlic Naan', 'Butter Naan', 'Tandoori Roti'], servings: 100, progress: 45, status: 'active', startTime: '09:30 AM', estComplete: '12:00 PM', chef: 'Chef Arjun', station: 'Tandoor Station' },
  { id: 'BCH-04', name: 'Evening Snacks Batch', items: ['Samosa', 'Pakora', 'Spring Roll'], servings: 60, progress: 0, status: 'scheduled', startTime: '03:00 PM', estComplete: '04:30 PM', chef: 'Chef Ravi', station: 'Fry Station' },
  { id: 'BCH-05', name: 'Dessert Batch', items: ['Gulab Jamun', 'Ras Malai'], servings: 30, progress: 0, status: 'scheduled', startTime: '02:00 PM', estComplete: '03:30 PM', chef: 'Chef Sana', station: 'Dessert Counter' },
  { id: 'BCH-06', name: 'Morning Rice Batch', items: ['Steamed Rice', 'Jeera Rice'], servings: 40, progress: 100, status: 'completed', startTime: '06:00 AM', estComplete: '07:30 AM', chef: 'Chef Priya', station: 'Biryani Station' },
];

// ── Analytics ─────────────────────────────────────────────────
export interface DailyMetric {
  label: string;
  value: number;
  change: number;
  unit: string;
}

export interface AnalyticsTimeframeData {
  metrics: DailyMetric[];
  chartData: { label: string; orders: number }[];
  popularItems: { name: string; count: number; pct: number }[];
  stationEfficiency: { station: string; efficiency: number }[];
}

export const ANALYTICS_DATA: Record<'today' | 'yesterday' | 'weekly', AnalyticsTimeframeData> = {
  today: {
    metrics: [
      { label: 'Total Orders', value: 186, change: 12, unit: '' },
      { label: 'Avg. Prep Time', value: 14, change: -2, unit: 'min' },
      { label: 'Completion Rate', value: 96.5, change: 1.2, unit: '%' },
    ],
    chartData: [
      { label: '6AM', orders: 5 }, { label: '7AM', orders: 12 }, { label: '8AM', orders: 22 },
      { label: '9AM', orders: 35 }, { label: '10AM', orders: 28 }, { label: '11AM', orders: 42 },
      { label: '12PM', orders: 55 }, { label: '1PM', orders: 48 }, { label: '2PM', orders: 30 },
      { label: '3PM', orders: 18 }, { label: '4PM', orders: 15 }, { label: '5PM', orders: 20 },
    ],
    popularItems: [
      { name: 'Veg Biryani', count: 32, pct: 85 },
      { name: 'Paneer Tikka', count: 28, pct: 75 },
      { name: 'Butter Chicken', count: 24, pct: 65 },
      { name: 'Chicken Burger', count: 18, pct: 50 },
      { name: 'Masala Dosa', count: 16, pct: 45 },
    ],
    stationEfficiency: [
      { station: 'Grill', efficiency: 92 },
      { station: 'Curry', efficiency: 88 },
      { station: 'Fry', efficiency: 95 },
      { station: 'Biryani', efficiency: 82 },
      { station: 'Dessert', efficiency: 90 },
      { station: 'Beverage', efficiency: 97 },
    ]
  },
  yesterday: {
    metrics: [
      { label: 'Total Orders', value: 165, change: -5, unit: '' },
      { label: 'Avg. Prep Time', value: 16, change: 5, unit: 'min' },
      { label: 'Completion Rate', value: 94.2, change: -0.8, unit: '%' },
    ],
    chartData: [
      { label: '6AM', orders: 3 }, { label: '7AM', orders: 10 }, { label: '8AM', orders: 18 },
      { label: '9AM', orders: 30 }, { label: '10AM', orders: 25 }, { label: '11AM', orders: 38 },
      { label: '12PM', orders: 50 }, { label: '1PM', orders: 42 }, { label: '2PM', orders: 28 },
      { label: '3PM', orders: 15 }, { label: '4PM', orders: 12 }, { label: '5PM', orders: 18 },
    ],
    popularItems: [
      { name: 'Butter Chicken', count: 30, pct: 80 },
      { name: 'Veg Biryani', count: 25, pct: 68 },
      { name: 'Paneer Tikka', count: 22, pct: 60 },
      { name: 'Masala Dosa', count: 20, pct: 54 },
      { name: 'Chicken Burger', count: 15, pct: 40 },
    ],
    stationEfficiency: [
      { station: 'Grill', efficiency: 88 },
      { station: 'Curry', efficiency: 85 },
      { station: 'Fry', efficiency: 92 },
      { station: 'Biryani', efficiency: 80 },
      { station: 'Dessert', efficiency: 85 },
      { station: 'Beverage', efficiency: 94 },
    ]
  },
  weekly: {
    metrics: [
      { label: 'Total Orders', value: 1120, change: 15, unit: '' },
      { label: 'Avg. Prep Time', value: 15, change: -1, unit: 'min' },
      { label: 'Completion Rate', value: 95.8, change: 0.5, unit: '%' },
    ],
    chartData: [
      { label: 'Mon', orders: 140 }, { label: 'Tue', orders: 155 }, { label: 'Wed', orders: 160 },
      { label: 'Thu', orders: 145 }, { label: 'Fri', orders: 180 }, { label: 'Sat', orders: 210 },
      { label: 'Sun', orders: 130 }
    ],
    popularItems: [
      { name: 'Veg Biryani', count: 210, pct: 90 },
      { name: 'Butter Chicken', count: 180, pct: 77 },
      { name: 'Paneer Tikka', count: 165, pct: 70 },
      { name: 'Chicken Burger', count: 130, pct: 55 },
      { name: 'Masala Dosa', count: 110, pct: 47 },
    ],
    stationEfficiency: [
      { station: 'Grill', efficiency: 90 },
      { station: 'Curry', efficiency: 86 },
      { station: 'Fry', efficiency: 94 },
      { station: 'Biryani', efficiency: 81 },
      { station: 'Dessert', efficiency: 88 },
      { station: 'Beverage', efficiency: 95 },
    ]
  }
};

export const DAILY_METRICS = ANALYTICS_DATA.today.metrics;
export const HOURLY_ORDERS = ANALYTICS_DATA.today.chartData;
export const POPULAR_ITEMS = ANALYTICS_DATA.today.popularItems;
export const STATION_EFFICIENCY = ANALYTICS_DATA.today.stationEfficiency;

// ── Reports ───────────────────────────────────────────────────
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
  frequency: string;
  icon: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'RPT-01', name: 'Daily Kitchen Summary', description: 'Orders processed, prep times, waste, and revenue summary', lastGenerated: 'Today, 6:00 AM', frequency: 'Daily', icon: '📊' },
  { id: 'RPT-02', name: 'Weekly Performance', description: 'Staff performance, station efficiency, and order trends', lastGenerated: 'Mon, Jun 9', frequency: 'Weekly', icon: '📈' },
  { id: 'RPT-03', name: 'Inventory Consumption', description: 'Stock usage, wastage, and reorder recommendations', lastGenerated: 'Yesterday', frequency: 'Daily', icon: '📦' },
  { id: 'RPT-04', name: 'Staff Shift Report', description: 'Individual chef output, punctuality, and ratings', lastGenerated: 'Today, 2:00 PM', frequency: 'Per Shift', icon: '👨‍🍳' },
  { id: 'RPT-05', name: 'Monthly Analytics', description: 'Comprehensive monthly KPIs, revenue breakdown, and forecasts', lastGenerated: 'Jun 1, 2024', frequency: 'Monthly', icon: '📋' },
  { id: 'RPT-06', name: 'Food Cost Analysis', description: 'Cost per dish, ingredient costs, and margin analysis', lastGenerated: 'Jun 8, 2024', frequency: 'Weekly', icon: '💰' },
];

// ── Live Alerts ───────────────────────────────────────────────
export interface LiveAlert {
  id: string;
  icon: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
}

export const LIVE_ALERTS: LiveAlert[] = [
  { id: 'ALT-01', icon: '🚨', message: 'Table T07 order delayed by 10 mins', time: '2 mins ago', type: 'critical' },
  { id: 'ALT-02', icon: '⭐', message: 'VIP Order from Table T01', time: '5 mins ago', type: 'warning' },
  { id: 'ALT-03', icon: '🚩', message: 'High priority order from Table T03', time: '8 mins ago', type: 'critical' },
  { id: 'ALT-04', icon: '📦', message: 'Paneer stock critically low — 3 kg remaining', time: '12 mins ago', type: 'critical' },
  { id: 'ALT-05', icon: '🔧', message: 'Tandoor Station under maintenance', time: '20 mins ago', type: 'info' },
];

// ── Settings Config ───────────────────────────────────────────
export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'general', title: 'General & Preferences', description: 'Kitchen name, timezone, theme and language preferences', icon: '⚙️' },
  { id: 'stations', title: 'Station Setup', description: 'Add, edit, or remove kitchen stations', icon: '🍳' },
  { id: 'notifications', title: 'Notifications', description: 'Alert preferences, sound, auto-dismiss settings', icon: '🔔' },
  { id: 'display', title: 'Display & KDS', description: 'Order card size, column layout, color coding', icon: '🖥️' },
  { id: 'auto-rules', title: 'Auto-Accept Rules', description: 'Auto-accept orders based on type or table', icon: '🤖' },
  { id: 'prep-times', title: 'Prep Time Defaults', description: 'Set default preparation times per dish category', icon: '⏱️' },
  { id: 'integrations', title: 'Integrations', description: 'POS sync, printer setup, delivery partners', icon: '🔗' },
  { id: 'team', title: 'Team & Access', description: 'Manage who can access the kitchen dashboard', icon: '👥' },
];
