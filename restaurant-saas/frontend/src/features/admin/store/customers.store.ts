import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────────────────

export type CustomerStatus = 'Active' | 'Inactive';
export type LoyaltyTier    = 'Gold' | 'Silver' | 'Bronze';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  loyaltyTier: LoyaltyTier;
  totalVisits: number;
  totalSpent: string;
  totalSpentRaw: number;
  lastOrder: string;
  lastOrderId: string;
  status: CustomerStatus;
}

export interface CustomerStats {
  totalCustomers: number;
  totalCustomersChange: string;
  loyalCustomers: number;
  loyalCustomersChange: string;
  totalVisits: number;
  totalVisitsChange: string;
  totalSpent: string;
  totalSpentChange: string;
}

export interface TopCustomer {
  rank: number;
  name: string;
  avatar: string;
  spent: string;
  spentRaw: number;
  id: string;
}

export interface LoyaltyDistribution {
  gold: number;
  silver: number;
  bronze: number;
  goldPct: number;
  silverPct: number;
  bronzePct: number;
}

interface CustomersStore {
  stats: CustomerStats;
  customers: Customer[];
  topCustomers: TopCustomer[];
  loyaltyDistribution: LoyaltyDistribution;
  customerOverview: { active: number; inactive: number; new: number; total: number };

  activeStatusFilter: CustomerStatus | 'All';
  activeTierFilter: LoyaltyTier | 'All';
  searchQuery: string;
  currentPage: number;
  perPage: number;

  setStatusFilter: (s: CustomerStatus | 'All') => void;
  setTierFilter: (t: LoyaltyTier | 'All') => void;
  setSearchQuery: (q: string) => void;
  setCurrentPage: (p: number) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalVisits' | 'totalSpent' | 'totalSpentRaw' | 'lastOrder' | 'lastOrderId'>) => void;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const seedCustomers: Customer[] = [
  { id: 'C001', name: 'John Smith',      email: 'john.smith@email.com',  phone: '+91 98765 43210', avatar: 'JS', loyaltyTier: 'Gold',   totalVisits: 24, totalSpent: '₹1,250.50', totalSpentRaw: 1250.50, lastOrder: 'May 19, 2025', lastOrderId: 'Order #1234', status: 'Active'   },
  { id: 'C002', name: 'Sarah Johnson',   email: 'sarah.j@email.com',     phone: '+91 87654 32109', avatar: 'SJ', loyaltyTier: 'Silver', totalVisits: 16, totalSpent: '₹890.00',   totalSpentRaw: 890.00,   lastOrder: 'May 18, 2025', lastOrderId: 'Order #1233', status: 'Active'   },
  { id: 'C003', name: 'Michael Brown',   email: 'michael.b@email.com',   phone: '+91 76543 21098', avatar: 'MB', loyaltyTier: 'Gold',   totalVisits: 31, totalSpent: '₹2,340.75', totalSpentRaw: 2340.75, lastOrder: 'May 17, 2025', lastOrderId: 'Order #1232', status: 'Active'   },
  { id: 'C004', name: 'Emily Davis',     email: 'emily.d@email.com',     phone: '+91 65432 10987', avatar: 'ED', loyaltyTier: 'Bronze', totalVisits:  8, totalSpent: '₹320.40',   totalSpentRaw: 320.40,   lastOrder: 'May 15, 2025', lastOrderId: 'Order #1231', status: 'Inactive' },
  { id: 'C005', name: 'David Wilson',    email: 'david.w@email.com',     phone: '+91 54321 09876', avatar: 'DW', loyaltyTier: 'Silver', totalVisits: 19, totalSpent: '₹1,120.30', totalSpentRaw: 1120.30, lastOrder: 'May 14, 2025', lastOrderId: 'Order #1230', status: 'Active'   },
  { id: 'C006', name: 'Lisa Anderson',   email: 'lisa.a@email.com',      phone: '+91 43210 98765', avatar: 'LA', loyaltyTier: 'Bronze', totalVisits:  5, totalSpent: '₹210.00',   totalSpentRaw: 210.00,   lastOrder: 'May 12, 2025', lastOrderId: 'Order #1229', status: 'Inactive' },
  { id: 'C007', name: 'James Taylor',    email: 'james.t@email.com',     phone: '+91 32109 87654', avatar: 'JT', loyaltyTier: 'Gold',   totalVisits: 27, totalSpent: '₹1,890.60', totalSpentRaw: 1890.60, lastOrder: 'May 11, 2025', lastOrderId: 'Order #1228', status: 'Active'   },
  { id: 'C008', name: 'Olivia Martinez', email: 'olivia.m@email.com',    phone: '+91 21098 76543', avatar: 'OM', loyaltyTier: 'Silver', totalVisits: 14, totalSpent: '₹645.80',   totalSpentRaw: 645.80,   lastOrder: 'May 10, 2025', lastOrderId: 'Order #1227', status: 'Active'   },
  { id: 'C009', name: 'Robert Garcia',   email: 'robert.g@email.com',    phone: '+91 10987 65432', avatar: 'RG', loyaltyTier: 'Bronze', totalVisits:  3, totalSpent: '₹145.20',   totalSpentRaw: 145.20,   lastOrder: 'May 9, 2025',  lastOrderId: 'Order #1226', status: 'Active'   },
  { id: 'C010', name: 'Jennifer Lee',    email: 'jennifer.l@email.com',  phone: '+91 09876 54321', avatar: 'JL', loyaltyTier: 'Gold',   totalVisits: 22, totalSpent: '₹1,580.90', totalSpentRaw: 1580.90, lastOrder: 'May 8, 2025',  lastOrderId: 'Order #1225', status: 'Active'   },
  { id: 'C011', name: 'Daniel White',    email: 'daniel.w@email.com',    phone: '+91 19876 54320', avatar: 'DW', loyaltyTier: 'Silver', totalVisits: 11, totalSpent: '₹430.10',   totalSpentRaw: 430.10,   lastOrder: 'May 7, 2025',  lastOrderId: 'Order #1224', status: 'Inactive' },
  { id: 'C012', name: 'Amanda Harris',   email: 'amanda.h@email.com',    phone: '+91 28765 43219', avatar: 'AH', loyaltyTier: 'Bronze', totalVisits:  7, totalSpent: '₹275.60',   totalSpentRaw: 275.60,   lastOrder: 'May 6, 2025',  lastOrderId: 'Order #1223', status: 'Active'   },
];

function makeTopCustomers(customers: Customer[]): TopCustomer[] {
  return [...customers]
    .sort((a, b) => b.totalSpentRaw - a.totalSpentRaw)
    .slice(0, 5)
    .map((c, i) => ({
      rank: i + 1,
      name: c.name,
      avatar: c.avatar,
      spent: c.totalSpent,
      spentRaw: c.totalSpentRaw,
      id: c.id,
    }));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCustomersStore = create<CustomersStore>()(
  persist(
    (set) => ({
      stats: {
        totalCustomers: 1248,
        totalCustomersChange: '+12.5%',
        loyalCustomers: 342,
        loyalCustomersChange: '+8.3%',
        totalVisits: 3856,
        totalVisitsChange: '+15.2%',
        totalSpent: '₹24,860',
        totalSpentChange: '+18.7%',
      },

      customers: seedCustomers,

      topCustomers: makeTopCustomers(seedCustomers),

      loyaltyDistribution: {
        gold: 349, silver: 399, bronze: 500,
        goldPct: 28, silverPct: 32, bronzePct: 40,
      },

      customerOverview: { active: 936, inactive: 187, new: 125, total: 1248 },

      activeStatusFilter: 'All',
      activeTierFilter: 'All',
      searchQuery: '',
      currentPage: 1,
      perPage: 8,

      setStatusFilter: (s) => set({ activeStatusFilter: s, currentPage: 1 }),
      setTierFilter: (t) => set({ activeTierFilter: t, currentPage: 1 }),
      setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
      setCurrentPage: (p) => set({ currentPage: p }),

      addCustomer: (newCustomer) =>
        set((state) => {
          const id = `C${String(state.customers.length + 1).padStart(3, '0')}`;
          const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
          const customer: Customer = {
            ...newCustomer,
            id,
            totalVisits: 0,
            totalSpent: '₹0',
            totalSpentRaw: 0,
            lastOrder: today,
            lastOrderId: `Order #${1234 + state.customers.length + 1}`,
          };
          const updatedCustomers = [customer, ...state.customers];
          return {
            customers: updatedCustomers,
            topCustomers: makeTopCustomers(updatedCustomers),
            stats: {
              ...state.stats,
              totalCustomers: state.stats.totalCustomers + 1,
            },
          };
        }),
    }),
    {
      name: 'admin-customers-store',
    }
  )
);