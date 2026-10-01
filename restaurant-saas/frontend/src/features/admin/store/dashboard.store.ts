import { create } from 'zustand';

// ── Types ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'Completed' | 'Preparing' | 'Served' | 'Pending' | 'Cancelled';
export type StaffStatus = 'On Duty' | 'Off Duty';
export type ReservationStatus = 'Confirmed' | 'Pending' | 'Cancelled';
export type StockStatus = 'Low Stock' | 'Running Low' | 'In Stock';

export interface StatData {
  totalRevenue: string;
  totalRevenueChange: string;
  orders: number;
  ordersChange: string;
  customers: number;
  customersChange: string;
  avgOrderValue: string;
  avgOrderValueChange: string;
}

export interface RevenuePoint {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  image: string;
  count: number;
  maxCount: number;
}

export interface Reservation {
  id: string;
  name: string;
  avatar: string;
  time: string;
  guests: number;
  status: ReservationStatus;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  time: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: StaffStatus;
}

export interface OrderStatusBreakdown {
  label: OrderStatus;
  count: number;
  percentage: string;
  color: string;
}

export interface StockAlert {
  id: string;
  name: string;
  stock: string;
  status: StockStatus;
  image: string;
}

export interface DashboardState {
  stats: StatData;
  revenueData: RevenuePoint[];
  topSellingItems: TopSellingItem[];
  upcomingReservations: Reservation[];
  recentOrders: RecentOrder[];
  staffMembers: StaffMember[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  stockAlerts: StockAlert[];
  totalOrders: number;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const initialState: DashboardState = {
  stats: {
    totalRevenue: '₹12,450.80',
    totalRevenueChange: '+12.5%',
    orders: 156,
    ordersChange: '+8.2%',
    customers: 128,
    customersChange: '+6.1%',
    avgOrderValue: '₹79.81',
    avgOrderValueChange: '+4.3%',
  },

  revenueData: [
    { day: 'Mon', thisWeek: 6200,  lastWeek: 5100 },
    { day: 'Tue', thisWeek: 7800,  lastWeek: 6400 },
    { day: 'Wed', thisWeek: 7200,  lastWeek: 7900 },
    { day: 'Thu', thisWeek: 9100,  lastWeek: 6800 },
    { day: 'Fri', thisWeek: 12450, lastWeek: 10200 },
    { day: 'Sat', thisWeek: 11800, lastWeek: 9600 },
    { day: 'Sun', thisWeek: 10500, lastWeek: 8300 },
  ],

  topSellingItems: [
    { id: '1', name: 'Margherita Pizza', image: '🍕', count: 245, maxCount: 245 },
    { id: '2', name: 'Cheesy Burger',    image: '🍔', count: 189, maxCount: 245 },
    { id: '3', name: 'Grilled Chicken',  image: '🍗', count: 147, maxCount: 245 },
    { id: '4', name: 'Pasta Alfredo',    image: '🍝', count: 128, maxCount: 245 },
    { id: '5', name: 'Caesar Salad',     image: '🥗', count: 102, maxCount: 245 },
  ],

  upcomingReservations: [
    { id: 'r1', name: 'John Smith',    avatar: 'JS', time: '7:00 PM • 4 Guests', guests: 4, status: 'Confirmed' },
    { id: 'r2', name: 'Sarah Johnson', avatar: 'SJ', time: '7:30 PM • 2 Guests', guests: 2, status: 'Confirmed' },
    { id: 'r3', name: 'Michael Brown', avatar: 'MB', time: '8:00 PM • 6 Guests', guests: 6, status: 'Pending'   },
    { id: 'r4', name: 'Emily Davis',   avatar: 'ED', time: '8:30 PM • 3 Guests', guests: 3, status: 'Confirmed' },
  ],

  recentOrders: [
    { id: '#ORD-00124', customer: 'Sarah Johnson', amount: '₹45.80', time: '3 mins ago'  },
    { id: '#ORD-00123', customer: 'Sarah Johnson', amount: '₹78.40', time: '15 mins ago' },
    { id: '#ORD-00122', customer: 'Michael Brown', amount: '₹62.10', time: '28 mins ago' },
    { id: '#ORD-00121', customer: 'Emily Davis',   amount: '₹25.30', time: '35 mins ago' },
    { id: '#ORD-00120', customer: 'David Wilson',  amount: '₹90.20', time: '41 mins ago' },
  ],

  staffMembers: [
    { id: 's1', name: 'James Wilson',  role: 'Chef',    avatar: 'JW', status: 'On Duty'  },
    { id: 's2', name: 'Lisa Martinez', role: 'Server',  avatar: 'LM', status: 'On Duty'  },
    { id: 's3', name: 'Robert Taylor', role: 'Manager', avatar: 'RT', status: 'On Duty'  },
    { id: 's4', name: 'Amanda White',  role: 'Host',    avatar: 'AW', status: 'Off Duty' },
  ],

  orderStatusBreakdown: [
    { label: 'Completed', count: 85,  percentage: '54.5%', color: '#22c55e' },
    { label: 'Preparing', count: 35,  percentage: '22.4%', color: '#f97316' },
    { label: 'Served',    count: 20,  percentage: '12.8%', color: '#3b82f6' },
    { label: 'Pending',   count: 10,  percentage: '6.4%',  color: '#a855f7' },
    { label: 'Cancelled', count: 6,   percentage: '3.8%',  color: '#ef4444' },
  ],

  totalOrders: 156,

  stockAlerts: [
    { id: 'st1', name: 'Tomato Sauce',     stock: 'Stock: 2.5 kg', status: 'Low Stock',    image: '🍅' },
    { id: 'st2', name: 'Mozzarella Cheese',stock: 'Stock: 1.2 kg', status: 'Low Stock',    image: '🧀' },
    { id: 'st3', name: 'Chicken Breast',   stock: 'Stock: 3.0 kg', status: 'Running Low',  image: '🍗' },
  ],
};

// ── Store ──────────────────────────────────────────────────────────────────

interface DashboardStore extends DashboardState {
  updateStat: (key: keyof StatData, value: string | number) => void;
  updateStockStatus: (id: string, status: StockStatus) => void;
  updateStaffStatus: (id: string, status: StaffStatus) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  ...initialState,

  updateStat: (key, value) =>
    set((state) => ({ stats: { ...state.stats, [key]: value } })),

  updateStockStatus: (id, status) =>
    set((state) => ({
      stockAlerts: state.stockAlerts.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    })),

  updateStaffStatus: (id, status) =>
    set((state) => ({
      staffMembers: state.staffMembers.map((m) =>
        m.id === id ? { ...m, status } : m
      ),
    })),

  updateReservationStatus: (id, status) =>
    set((state) => ({
      upcomingReservations: state.upcomingReservations.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),
}));