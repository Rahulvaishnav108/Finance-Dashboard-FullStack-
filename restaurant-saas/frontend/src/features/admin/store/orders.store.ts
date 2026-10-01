import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus   = 'Pending' | 'Preparing' | 'Completed' | 'Cancelled' | 'Served';
export type PaymentMethod = 'Paid' | 'Online' | 'Card' | 'Cash';
export type OrderSortBy   = 'default' | 'time';
export type DateFilter    = 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

export interface Order {
  id: string;
  customer: string;
  customerAvatar: string;
  items: number;
  itemNames: string[];
  table: string;
  amount: string;
  amountRaw: number;
  payment: PaymentMethod;
  status: OrderStatus;
  assignedStaff: string;
  staffAvatar: string;
  time: string;
  timeRaw: number; // minutes ago — used for sort
  date: string;    // e.g. "2025-05-20"
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalOrdersChange: string;
  pending: number;
  completed: number;
  totalRevenue: string;
  totalRevenueChange: string;
  avgOrderValue: string;
  avgOrderValueChange: string;
}

interface OrdersStore {
  stats: OrderStats;
  orders: Order[];
  activeTab: OrderStatus | 'All';
  searchQuery: string;
  currentPage: number;
  perPage: number;
  sortBy: OrderSortBy;
  dateFilter: DateFilter;
  paymentFilter: PaymentMethod | 'All';
  minAmount: string;
  maxAmount: string;

  setActiveTab:     (tab: OrderStatus | 'All') => void;
  setSearchQuery:   (q: string) => void;
  setCurrentPage:   (p: number) => void;
  setPerPage:       (n: number) => void;
  setSortBy:        (s: OrderSortBy) => void;
  setDateFilter:    (d: DateFilter) => void;
  setPaymentFilter: (p: PaymentMethod | 'All') => void;
  setMinAmount:     (v: string) => void;
  setMaxAmount:     (v: string) => void;
  resetFilters:     () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrder:       (id: string, patch: Partial<Order>) => void;
  addOrder:          (order: Order) => void;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const seedOrders: Order[] = [
  {
    id: '#ORD-00124', customer: 'Smith Jonith', customerAvatar: 'SJ', items: 4,
    itemNames: ['Pasta Carbonara', 'Garlic Bread', 'Red Wine', 'Tiramisu'],
    table: 'T-05', amount: '₹1,245', amountRaw: 1245, payment: 'Paid',
    status: 'Pending', assignedStaff: 'Jessica', staffAvatar: 'JE',
    time: '2 mins ago', timeRaw: 2, date: '2025-05-20',
    notes: 'Extra spicy, no onions.',
  },
  {
    id: '#ORD-00123', customer: 'Sarah Johnson', customerAvatar: 'SA', items: 3,
    itemNames: ['Grilled Salmon', 'Caesar Salad', 'Fresh Lime Soda'],
    table: 'T-12', amount: '₹2,840', amountRaw: 2840, payment: 'Paid',
    status: 'Preparing', assignedStaff: 'Michael', staffAvatar: 'MI',
    time: '15 mins ago', timeRaw: 15, date: '2025-05-20',
  },
  {
    id: '#ORD-00122', customer: 'Michael Brown', customerAvatar: 'MB', items: 5,
    itemNames: ['Butter Chicken', 'Naan x2', 'Dal Makhani', 'Raita', 'Lassi'],
    table: 'T-03', amount: '₹3,610', amountRaw: 3610, payment: 'Online',
    status: 'Pending', assignedStaff: 'David', staffAvatar: 'DA',
    time: '25 mins ago', timeRaw: 25, date: '2025-05-20',
  },
  {
    id: '#ORD-00121', customer: 'Emily Davis', customerAvatar: 'ED', items: 2,
    itemNames: ['Margherita Pizza', 'Coke'],
    table: 'T-08', amount: '₹1,530', amountRaw: 1530, payment: 'Paid',
    status: 'Completed', assignedStaff: 'Jessica', staffAvatar: 'JE',
    time: '35 mins ago', timeRaw: 35, date: '2025-05-20',
  },
  {
    id: '#ORD-00120', customer: 'David Wilson', customerAvatar: 'DW', items: 6,
    itemNames: ['Lamb Chops', 'Mashed Potato', 'Mushroom Sauce', 'Bread Roll', 'Red Wine x2'],
    table: 'T-15', amount: '₹5,920', amountRaw: 5920, payment: 'Card',
    status: 'Completed', assignedStaff: 'Michael', staffAvatar: 'MI',
    time: '45 mins ago', timeRaw: 45, date: '2025-05-20',
    notes: 'Medium-rare steak.',
  },
  {
    id: '#ORD-00119', customer: 'Sophia Martinez', customerAvatar: 'SM', items: 4,
    itemNames: ['Veg Biryani', 'Paneer Tikka', 'Gulab Jamun', 'Masala Chai'],
    table: 'T-11', amount: '₹2,460', amountRaw: 2460, payment: 'Cash',
    status: 'Cancelled', assignedStaff: 'David', staffAvatar: 'DA',
    time: '1 hour ago', timeRaw: 60, date: '2025-05-20',
    notes: 'Customer left.',
  },
  {
    id: '#ORD-00118', customer: 'James Wilson', customerAvatar: 'JW', items: 3,
    itemNames: ['Fish & Chips', 'Coleslaw', 'Lemonade'],
    table: 'T-02', amount: '₹1,850', amountRaw: 1850, payment: 'Paid',
    status: 'Preparing', assignedStaff: 'Jessica', staffAvatar: 'JE',
    time: '1 hour ago', timeRaw: 65, date: '2025-05-19',
  },
  {
    id: '#ORD-00117', customer: 'Lisa Martinez', customerAvatar: 'LM', items: 7,
    itemNames: ['Sushi Platter', 'Miso Soup', 'Edamame', 'Sake', 'Tempura', 'Green Tea', 'Ice Cream'],
    table: 'T-09', amount: '₹8,240', amountRaw: 8240, payment: 'Card',
    status: 'Completed', assignedStaff: 'Michael', staffAvatar: 'MI',
    time: '2 hours ago', timeRaw: 120, date: '2025-05-19',
  },
  {
    id: '#ORD-00116', customer: 'Robert Taylor', customerAvatar: 'RT', items: 2,
    itemNames: ['Club Sandwich', 'Fresh Juice'],
    table: 'T-06', amount: '₹890', amountRaw: 890, payment: 'Cash',
    status: 'Served', assignedStaff: 'David', staffAvatar: 'DA',
    time: '2 hours ago', timeRaw: 125, date: '2025-05-19',
  },
  {
    id: '#ORD-00115', customer: 'Amanda White', customerAvatar: 'AW', items: 5,
    itemNames: ['Pasta Arrabiata', 'Bruschetta', 'Tiramisu', 'White Wine', 'Espresso'],
    table: 'T-14', amount: '₹4,650', amountRaw: 4650, payment: 'Online',
    status: 'Completed', assignedStaff: 'Jessica', staffAvatar: 'JE',
    time: '3 hours ago', timeRaw: 180, date: '2025-05-18',
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      stats: {
        totalOrders: 156,
        totalOrdersChange: '+12.5%',
        pending: 27,
        completed: 102,
        totalRevenue: '₹12,450.80',
        totalRevenueChange: '+15.6%',
        avgOrderValue: '₹79.81',
        avgOrderValueChange: '+6.4%',
      },
      orders: seedOrders,
      activeTab: 'All',
      searchQuery: '',
      currentPage: 1,
      perPage: 10,
      sortBy: 'default',
      dateFilter: 'today',
      paymentFilter: 'All',
      minAmount: '',
      maxAmount: '',

      setActiveTab:     (tab) => set({ activeTab: tab, currentPage: 1 }),
      setSearchQuery:   (q)   => set({ searchQuery: q, currentPage: 1 }),
      setCurrentPage:   (p)   => set({ currentPage: p }),
      setPerPage:       (n)   => set({ perPage: n, currentPage: 1 }),
      setSortBy:        (s)   => set({ sortBy: s, currentPage: 1 }),
      setDateFilter:    (d)   => set({ dateFilter: d, currentPage: 1 }),
      setPaymentFilter: (p)   => set({ paymentFilter: p, currentPage: 1 }),
      setMinAmount:     (v)   => set({ minAmount: v, currentPage: 1 }),
      setMaxAmount:     (v)   => set({ maxAmount: v, currentPage: 1 }),
      resetFilters: () => set({
        activeTab: 'All', searchQuery: '', dateFilter: 'today',
        paymentFilter: 'All', minAmount: '', maxAmount: '',
        sortBy: 'default', currentPage: 1,
      }),

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      updateOrder: (id, patch) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),

      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
    }),
    {
      name: 'admin-orders-store',
    }
  )
);
