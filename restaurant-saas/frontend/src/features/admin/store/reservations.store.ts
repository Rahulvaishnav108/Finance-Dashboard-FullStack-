import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

export type ReservationStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Walk-in';
export type TableStatus = 'Available' | 'Occupied' | 'Reserved';
export type TimeSlotBusyness = 'Available' | 'Busy' | 'Very Busy';

export interface Reservation {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  time: string;
  guests: number;
  tableId: number;
  status: ReservationStatus;
  date: string;
  specialRequest?: string;
  phone: string;
  email: string;
  occasion?: string;
}

export interface TableSlot {
  id: number;
  status: TableStatus;
  seats: number;
}

export interface TimeSlot {
  time: string;
  busyness: TimeSlotBusyness;
  tableCount: number;
}

export interface ReservationStats {
  total: number;
  totalChange: string;
  confirmed: number;
  confirmedPercent: string;
  pending: number;
  pendingPercent: string;
  cancelled: number;
  cancelledPercent: string;
  walkIns: number;
  walkInsPercent: string;
}

export interface ReservationAnalytics {
  noShowRate: string;
  noShowChange: string;
  avgPartySize: string;
  avgPartySizeChange: string;
  tableTurnover: string;
  tableTurnoverChange: string;
  peakTime: string;
  occupancyRate: string;
  occupancyChange: string;
}

export interface ReservationsState {
  stats: ReservationStats;
  upcomingReservations: Reservation[];
  allReservations: Reservation[];
  tables: TableSlot[];
  timeSlots: TimeSlot[];
  analytics: ReservationAnalytics;
  selectedDate: string;
  calendarView: 'Day' | 'Week' | 'Month';
  selectedGuest: Reservation | null;
  filterStatus: ReservationStatus | 'All';
  filterTime: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const ALL_RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    name: 'Rahul Sharma',
    avatar: 'RS',
    avatarColor: 'bg-orange-500',
    time: '07:00 PM',
    guests: 2,
    tableId: 7,
    status: 'Confirmed',
    date: '2026-06-24',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    specialRequest: 'Prefer quiet corner table',
    occasion: 'Anniversary Dinner',
  },
  {
    id: 'r2',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    avatarColor: 'bg-purple-500',
    time: '07:30 PM',
    guests: 2,
    tableId: 12,
    status: 'Pending',
    date: 'May 20, 2025',
    phone: '+91 87654 32109',
    email: 'sarah.j@email.com',
  },
  {
    id: 'r3',
    name: 'Michael Brown',
    avatar: 'MB',
    avatarColor: 'bg-green-500',
    time: '08:00 PM',
    guests: 6,
    tableId: 3,
    status: 'Confirmed',
    date: 'May 20, 2025',
    phone: '+91 76543 21098',
    email: 'mbrown@email.com',
    specialRequest: 'High chair needed',
  },
  {
    id: 'r4',
    name: 'Emily Davis',
    avatar: 'ED',
    avatarColor: 'bg-pink-500',
    time: '08:30 PM',
    guests: 3,
    tableId: 9,
    status: 'Confirmed',
    date: 'May 20, 2025',
    phone: '+91 65432 10987',
    email: 'emily.d@email.com',
  },
  {
    id: 'r5',
    name: 'David Wilson',
    avatar: 'DW',
    avatarColor: 'bg-orange-500',
    time: '09:00 PM',
    guests: 5,
    tableId: 11,
    status: 'Pending',
    date: 'May 20, 2025',
    phone: '+91 54321 09876',
    email: 'dwilson@email.com',
    specialRequest: 'Birthday celebration',
    occasion: 'Birthday',
  },
  {
    id: 'r6',
    name: 'Priya Sharma',
    avatar: 'PS',
    avatarColor: 'bg-teal-500',
    time: '06:00 PM',
    guests: 2,
    tableId: 2,
    status: 'Confirmed',
    date: 'May 20, 2025',
    phone: '+91 43210 98765',
    email: 'priya.sharma@email.com',
    occasion: 'Date Night',
  },
  {
    id: 'r7',
    name: 'Rahul Gupta',
    avatar: 'RG',
    avatarColor: 'bg-indigo-500',
    time: '01:00 PM',
    guests: 4,
    tableId: 6,
    status: 'Walk-in',
    date: 'May 20, 2025',
    phone: '+91 32109 87654',
    email: 'rahul.g@email.com',
  },
  {
    id: 'r8',
    name: 'Ananya Patel',
    avatar: 'AP',
    avatarColor: 'bg-rose-500',
    time: '02:30 PM',
    guests: 3,
    tableId: 4,
    status: 'Cancelled',
    date: 'May 20, 2025',
    phone: '+91 21098 76543',
    email: 'ananya.p@email.com',
    specialRequest: 'Window seat preferred',
  },
  {
    id: 'r9',
    name: 'Vikram Nair',
    avatar: 'VN',
    avatarColor: 'bg-cyan-500',
    time: '07:45 PM',
    guests: 7,
    tableId: 1,
    status: 'Confirmed',
    date: 'May 20, 2025',
    phone: '+91 10987 65432',
    email: 'vikram.n@email.com',
    specialRequest: 'Corporate dinner – quiet area',
  },
  {
    id: 'r10',
    name: 'Meera Iyer',
    avatar: 'MI',
    avatarColor: 'bg-amber-500',
    time: '08:15 PM',
    guests: 2,
    tableId: 8,
    status: 'Pending',
    date: 'May 20, 2025',
    phone: '+91 09876 54321',
    email: 'meera.iyer@email.com',
    occasion: 'Engagement',
  },
];

const initialState: ReservationsState = {
  stats: {
    total: 48,
    totalChange: '+12.5% vs Yesterday',
    confirmed: 36,
    confirmedPercent: '75% of total',
    pending: 8,
    pendingPercent: '16.7% of total',
    cancelled: 4,
    cancelledPercent: '8.3% of total',
    walkIns: 12,
    walkInsPercent: '25% of total',
  },

  upcomingReservations: ALL_RESERVATIONS.slice(0, 5),
  allReservations: ALL_RESERVATIONS,

  tables: [
    { id: 1, status: 'Occupied', seats: 4 },
    { id: 2, status: 'Available', seats: 2 },
    { id: 3, status: 'Occupied', seats: 6 },
    { id: 4, status: 'Reserved', seats: 4 },
    { id: 5, status: 'Occupied', seats: 4 },
    { id: 6, status: 'Available', seats: 8 },
    { id: 7, status: 'Reserved', seats: 2 },
    { id: 8, status: 'Available', seats: 4 },
    { id: 9, status: 'Reserved', seats: 6 },
    { id: 10, status: 'Occupied', seats: 4 },
    { id: 11, status: 'Occupied', seats: 2 },
    { id: 12, status: 'Available', seats: 4 },
  ],

  timeSlots: [
    { time: '11:00 AM', busyness: 'Available', tableCount: 12 },
    { time: '01:00 PM', busyness: 'Busy', tableCount: 4 },
    { time: '07:00 PM', busyness: 'Very Busy', tableCount: 3 },
    { time: '09:00 PM', busyness: 'Available', tableCount: 8 },
  ],

  analytics: {
    noShowRate: '2.5%',
    noShowChange: '↓ 0.6% vs last month',
    avgPartySize: '3.6',
    avgPartySizeChange: '↑ 0.3 vs last month',
    tableTurnover: '4.2',
    tableTurnoverChange: '↓ 0.6 vs last month',
    peakTime: '07:00 PM – 09:00 PM',
    occupancyRate: '78%',
    occupancyChange: '↑ 8% vs last month',
  },

  selectedDate: 'Today, May 20',
  calendarView: 'Month',
  selectedGuest: null,
  filterStatus: 'All',
  filterTime: '',
};

// ── Store ──────────────────────────────────────────────────────────────────

interface ReservationsStore extends ReservationsState {
  setSelectedGuest: (reservation: Reservation | null) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  setCalendarView: (view: 'Day' | 'Week' | 'Month') => void;
  setSelectedDate: (date: string) => void;
  setFilterStatus: (status: ReservationStatus | 'All') => void;
  setFilterTime: (time: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
}

export const useReservationsStore = create<ReservationsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedGuest: (reservation) =>
        set({ selectedGuest: reservation }),

      updateReservationStatus: (id, status) =>
        set((state) => ({
          upcomingReservations: state.upcomingReservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
          allReservations: state.allReservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        })),

      setCalendarView: (view) => set({ calendarView: view }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setFilterStatus: (filterStatus) => set({ filterStatus }),

      setFilterTime: (filterTime) => set({ filterTime }),

      addReservation: (reservation) =>
        set((state) => {
          const newRes: Reservation = {
            ...reservation,
            id: `r${Date.now()}`,
          };
          return {
            upcomingReservations: [newRes, ...state.upcomingReservations],
            allReservations: [newRes, ...state.allReservations],
            stats: {
              ...state.stats,
              total: state.stats.total + 1,
              pending: state.stats.pending + 1,
            },
          };
        }),

      updateReservation: (id, updates) =>
        set((state) => ({
          upcomingReservations: state.upcomingReservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          allReservations: state.allReservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          selectedGuest:
            state.selectedGuest?.id === id
              ? { ...state.selectedGuest, ...updates }
              : state.selectedGuest,
        })),
    }),
    {
      name: 'admin-reservations-store',
    }
  )
);