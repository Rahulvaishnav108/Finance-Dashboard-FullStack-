/**
 * usestaff.ts
 * Location: src/features/staff/hooks/usestaff.ts
 *
 * ── Merged version ──
 * - All types imported from staff.api.ts (never redefined here)
 * - Placeholder data so dashboard never shows blank while backend is down
 * - CacheManager for reducing unnecessary API calls
 * - useStaff()             → main dashboard hook (used by StaffDashboard.tsx)
 * - useStaffList()         → paginated staff list with search
 * - useAnalytics()         → charts and analytics data
 * - useNotifications()     → notification panel
 * - useUserProfile()       → profile panel + logout
 *
 * When Atharva's backend is ready:
 * 1. Uncomment the TODO fetchAPI lines in staff.api.ts
 * 2. Nothing in this file needs to change
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  tableAPI,
  requestsAPI,
  ordersAPI,
  staffAPI,
  analyticsAPI,
  userAPI,
} from '../api/staff.api';

// ── Re-export all types so consumers only need one import source ──
export type {
  TableStatus,
  Table,
  CustomerRequest,
  FoodAlert,
  StaffMember,
  StaffStats,
  AttendanceData,
  PayrollData,
  PerformanceData,
  RolesData,
  ScheduleItem,
  BirthdayItem,
  ApiResponse,
} from '../api/staff.api';

// ── Local type imports for use inside this file ──
import type {
  TableStatus,
  Table,
  CustomerRequest,
  FoodAlert,
  StaffMember,
  StaffStats,
  AttendanceData,
  PayrollData,
  PerformanceData,
  RolesData,
  ScheduleItem,
  BirthdayItem,
} from '../api/staff.api';

// ═══════════════════════════════════════════════════════════════
// ─── Cache Manager
// ═══════════════════════════════════════════════════════════════

class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(pattern?: string) {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(k => k.includes(pattern))
        .forEach(k => this.cache.delete(k));
    } else {
      this.cache.clear();
    }
  }
}

// Single shared instance — all hooks share the same cache
const cache = new CacheManager();

// ═══════════════════════════════════════════════════════════════
// ─── Placeholder Data
// ─── Shown while backend is not available — dashboard never blank
// ═══════════════════════════════════════════════════════════════

const PH_TABLES: Table[] = [
  { id: 1,  tableNumber: 'T01', status: 'available',      section: 'Indoor'                 },
  { id: 2,  tableNumber: 'T02', status: 'occupied',       section: 'Indoor',  guestCount: 4 },
  { id: 3,  tableNumber: 'T03', status: 'food_ready',     section: 'Outdoor', guestCount: 2 },
  { id: 4,  tableNumber: 'T04', status: 'needs_cleaning', section: 'Indoor'                 },
  { id: 5,  tableNumber: 'T05', status: 'order_placed',   section: 'Indoor',  guestCount: 3 },
  { id: 6,  tableNumber: 'T07', status: 'served',         section: 'Outdoor', guestCount: 5 },
  { id: 7,  tableNumber: 'T07', status: 'available',      section: 'Indoor'                 },
  { id: 8,  tableNumber: 'T08', status: 'occupied',       section: 'Indoor',  guestCount: 2 },
  { id: 9,  tableNumber: 'T09', status: 'order_placed',   section: 'Outdoor', guestCount: 6 },
  { id: 10, tableNumber: 'T10', status: 'available',      section: 'Indoor'                 },
];

const PH_REQUESTS: CustomerRequest[] = [
  { id: 1, tableNumber: 'T03', type: 'water_refill',  time: '2 mins ago' },
  { id: 2, tableNumber: 'T05', type: 'call_waiter',   time: '5 mins ago' },
  { id: 3, tableNumber: 'T02', type: 'extra_cutlery', time: '1 min ago'  },
];

const PH_FOOD_ALERTS: FoodAlert[] = [
  { id: 1, tableNumber: 'T03', items: ['Paneer Butter Masala', 'Naan x2'], readyAt: '3 mins ago' },
  { id: 2, tableNumber: 'T07', items: ['Dal Tadka', 'Jeera Rice'],         readyAt: '1 min ago'  },
];

const PH_STAFF: StaffMember[] = [
  { id: 1, name: 'John Smith',    email: 'john.smith@email.com', role: 'Manager',   department: 'Management', phone: '+1 (555) 123-4567', status: 'active',   hireDate: 'Jan 15, 2023', initials: 'JS', avatarColor: '#f97316' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com',    role: 'Server',    department: 'Service',    phone: '+1 (555) 234-5678', status: 'active',   hireDate: 'Feb 10, 2023', initials: 'SJ', avatarColor: '#22c55e' },
  { id: 3, name: 'Michael Brown', email: 'michael.b@email.com',  role: 'Chef',      department: 'Kitchen',    phone: '+1 (555) 345-6789', status: 'active',   hireDate: 'Mar 5, 2023',  initials: 'MB', avatarColor: '#3b82f6' },
  { id: 4, name: 'Emily Davis',   email: 'emily.d@email.com',    role: 'Bartender', department: 'Bar',        phone: '+1 (555) 456-7890', status: 'active',   hireDate: 'Mar 20, 2023', initials: 'ED', avatarColor: '#8b5cf6' },
  { id: 5, name: 'David Wilson',  email: 'david.w@email.com',    role: 'Server',    department: 'Service',    phone: '+1 (555) 567-8901', status: 'on_leave', hireDate: 'Apr 8, 2023',  initials: 'DW', avatarColor: '#f59e0b' },
];

const PH_STAFF_STATS: StaffStats = {
  totalStaff: 48, activeToday: 32, onLeave: 4,
  totalPayroll:      '$18,750',
  avgPerformance:    '4.6 / 5.0',
  totalPayrollTrend: '↓ 5.4% vs last month',
  totalStaffTrend:   '↑ 12.5% vs last month',
  avgPerfTrend:      '↑ 0.3 vs last month',
};

const PH_ATTENDANCE: AttendanceData = {
  present: 441, absent: 23, late: 14,
  leaves: 18,    // field is `leaves` — matches AttendanceData interface in staff.api.ts
  overall: '92%',
};

const PH_PAYROLL: PayrollData = {
  total:       '$18,750.00',
  trend:       '↓ 5.4% vs last month',
  regularPay:  '$14,250.00',
  overtimePay: '$3,250.00',
  deductions:  '-$750.00',
  bonuses:     '+$1,250.00',
};

const PH_PERFORMANCE: PerformanceData = {
  avgRating:    '4.6 / 5.0',
  trend:        '↑ 0.3 vs last month',
  distribution: [2, 6, 18, 32, 42], // index 0 = 1-star … index 4 = 5-star
};

const PH_ROLES: RolesData = {
  managers: 5, chefs: 8, servers: 20, bartenders: 7, others: 8,
  total: 48,
};

const PH_SCHEDULE: ScheduleItem[] = [
  { time: '09:00 AM – 05:00 PM', label: 'Morning Shift', staff: 12, dot: '#22c55e', avatars: ['JS', 'SJ', 'MB'], extra: 7  },
  { time: '05:00 PM – 01:00 AM', label: 'Evening Shift', staff: 15, dot: '#3b82f6', avatars: ['ED', 'DW', 'RK'], extra: 10 },
  { time: '01:00 AM – 09:00 AM', label: 'Night Shift',   staff: 5,  dot: '#8b5cf6', avatars: ['PK', 'LM'],       extra: 2  },
];

const PH_BIRTHDAYS: BirthdayItem[] = [
  { name: 'Sarah Johnson', role: 'Server · Service',  date: 'May 24', initials: 'SJ', color: '#22c55e' },
  { name: 'Michael Brown', role: 'Chef · Kitchen',    date: 'May 26', initials: 'MB', color: '#3b82f6' },
  { name: 'Emily Davis',   role: 'Bartender · Bar',   date: 'May 28', initials: 'ED', color: '#8b5cf6' },
];

// ═══════════════════════════════════════════════════════════════
// ─── useStaff  (used by StaffDashboard.tsx)
// ═══════════════════════════════════════════════════════════════

export function useStaff() {
  // State initialised with placeholder data — UI is never blank
  const [tables,      setTables]      = useState<Table[]>(PH_TABLES);
  const [requests,    setRequests]    = useState<CustomerRequest[]>(PH_REQUESTS);
  const [foodAlerts,  setFoodAlerts]  = useState<FoodAlert[]>(PH_FOOD_ALERTS);
  const [staffList,   setStaffList]   = useState<StaffMember[]>(PH_STAFF);
  const [staffStats,  setStaffStats]  = useState<StaffStats>(PH_STAFF_STATS);
  const [attendance,  setAttendance]  = useState<AttendanceData>(PH_ATTENDANCE);
  const [payroll,     setPayroll]     = useState<PayrollData>(PH_PAYROLL);
  const [performance, setPerformance] = useState<PerformanceData>(PH_PERFORMANCE);
  const [roles,       setRoles]       = useState<RolesData>(PH_ROLES);
  const [schedule,    setSchedule]    = useState<ScheduleItem[]>(PH_SCHEDULE);
  const [birthdays,   setBirthdays]   = useState<BirthdayItem[]>(PH_BIRTHDAYS);

  // loading = true only while the initial fetch is in-flight
  // After that, optimistic updates keep UI snappy with no loading flash
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Initial data load ──
  // All fetches run in parallel. If any endpoint is not up yet,
  // placeholder state stays intact for that slice — no crash, no blank screen.
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        tablesRes, requestsRes, alertsRes,
        staffRes,  statsRes,
        attendanceRes, payrollRes, perfRes, rolesRes,
        scheduleRes, birthdaysRes,
      ] = await Promise.all([
        tableAPI.getTables(),
        requestsAPI.getPending(),
        ordersAPI.getReadyOrders(),
        staffAPI.getAll(),
        staffAPI.getStats(),
        analyticsAPI.getAttendance(),
        analyticsAPI.getPayroll(),
        analyticsAPI.getPerformance(),
        analyticsAPI.getRoles(),
        analyticsAPI.getSchedule(),
        analyticsAPI.getBirthdays(),
      ]);

      if (!isMounted.current) return;

      // Only replace placeholder when backend actually returned data
      if (tablesRes.success     && tablesRes.data?.length)     setTables(tablesRes.data);
      if (requestsRes.success   && requestsRes.data?.length)   setRequests(requestsRes.data);
      if (alertsRes.success     && alertsRes.data?.length)     setFoodAlerts(alertsRes.data);
      if (staffRes.success      && staffRes.data?.length)      setStaffList(staffRes.data);
      if (statsRes.success      && statsRes.data && Object.keys(statsRes.data).length > 0)              setStaffStats(statsRes.data);
      if (attendanceRes.success && attendanceRes.data && Object.keys(attendanceRes.data).length > 0)         setAttendance(attendanceRes.data);
      if (payrollRes.success    && payrollRes.data && Object.keys(payrollRes.data).length > 0)            setPayroll(payrollRes.data);
      if (perfRes.success       && perfRes.data && Object.keys(perfRes.data).length > 0)               setPerformance(perfRes.data);
      if (rolesRes.success      && rolesRes.data && Object.keys(rolesRes.data).length > 0)              setRoles(rolesRes.data);
      if (scheduleRes.success   && scheduleRes.data?.length)   setSchedule(scheduleRes.data);
      if (birthdaysRes.success  && birthdaysRes.data?.length)  setBirthdays(birthdaysRes.data);

      cache.clear(); // clear stale cache after a successful full refresh
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(fetchDashboardData); }, [fetchDashboardData]);

  // ── Mutations ──
  // All three are optimistic: state updates instantly, API fires in background.
  // If the API fails it only console.errors (via staff.api.ts fetchAPI helper).
  // No rollback for now — add if Om requires it.

  const handleStatusChange = useCallback(async (id: number, newStatus: TableStatus) => {
    // Optimistic update first
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    cache.clear('tables');
    await tableAPI.updateStatus(id, newStatus);
  }, []);

  const handleResolveRequest = useCallback(async (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    cache.clear('requests');
    await requestsAPI.resolve(id);
  }, []);

  const handleFoodAction = useCallback(async (
    id: number,
    action: 'picked_up' | 'served' = 'served'
  ) => {
    setFoodAlerts(prev => prev.filter(a => a.id !== id));
    cache.clear('foodAlerts');
    if (action === 'picked_up') {
      await ordersAPI.pickOrder(id);
    } else {
      await ordersAPI.serveOrder(id);
    }
  }, []);

  const handleAddStaff = useCallback(async (staff: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...staff,
      id: Date.now(),
    };

    setStaffList(prev => [newStaff, ...prev]);
    setStaffStats(prev => ({
      ...prev,
      totalStaff: prev.totalStaff + 1,
      activeToday: prev.activeToday + (newStaff.status === 'active' ? 1 : 0),
    }));
    cache.clear('staff');

    await staffAPI.create({
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      department: newStaff.department,
      phone: newStaff.phone,
      status: newStaff.status,
      hireDate: newStaff.hireDate,
      initials: newStaff.initials,
      avatarColor: newStaff.avatarColor,
    });
  }, []);

  const handleUpdateStaff = useCallback(async (id: number, updates: Partial<StaffMember>) => {
    setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, ...updates } : staff));
    cache.clear('staff');
    await staffAPI.update(id, updates);
  }, []);

  const handleDeleteStaff = useCallback(async (id: number) => {
    setStaffList(prev => {
      const removed = prev.find(item => item.id === id);
      if (removed) {
        setStaffStats(prevStats => ({
          ...prevStats,
          totalStaff: Math.max(0, prevStats.totalStaff - 1),
          activeToday: Math.max(0, prevStats.activeToday - (removed.status === 'active' ? 1 : 0)),
        }));
      }
      return prev.filter(item => item.id !== id);
    });
    cache.clear('staff');
    await staffAPI.delete(id);
  }, []);

  const handleExportStaff = useCallback(() => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Hire Date'];
    const rows = staffList.map(({ name, email, role, department, phone, status, hireDate }) =>
      [name, email, role, department, phone, status, hireDate].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `staff-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [staffList]);

  // ── Derived floor stats (computed, not fetched) ──
  const floorStats = {
    totalTables: tables.length,
    occupied:    tables.filter(t => t.status !== 'available').length,
    foodReady:   tables.filter(t => t.status === 'food_ready').length,
    pendingReqs: requests.length,
  };

  return {
    // Data
    tables, requests, foodAlerts,
    staffList, staffStats,
    attendance, payroll, performance, roles,
    schedule, birthdays, floorStats,
    // Meta
    loading, error,
    // Actions
    handleStatusChange,
    handleResolveRequest,
    handleFoodAction,
    handleAddStaff,
    handleUpdateStaff,
    handleDeleteStaff,
    handleExportStaff,
    fetchDashboardData, // expose so dashboard can add a manual refresh button later
  };
}

// ═══════════════════════════════════════════════════════════════
// ─── useStaffList  (paginated staff table with search)
// ═══════════════════════════════════════════════════════════════

export function useStaffList(page = 1, limit = 50) {
  const [staffList, setStaffList] = useState<StaffMember[]>(PH_STAFF);
  const [total,     setTotal]     = useState(PH_STAFF.length);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    const cacheKey = `staff-list-${page}-${limit}`;
    const cached = cache.get<{ staff: StaffMember[]; total: number }>(cacheKey);
    if (cached) { setStaffList(cached.staff); setTotal(cached.total); return; }

    try {
      setLoading(true);
      const res = await staffAPI.getAll();
      if (res.success && res.data?.length) {
        cache.set(cacheKey, { staff: res.data, total: res.data.length });
        setStaffList(res.data);
        setTotal(res.data.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const searchStaff = useCallback(async (query: string) => {
    if (!query.trim()) { fetchStaff(); return; }
    try {
      setLoading(true);
      // Filter client-side from current list until Atharva adds a search endpoint
      setStaffList(
        PH_STAFF.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()) ||
          s.department.toLowerCase().includes(query.toLowerCase())
        )
      );
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  useEffect(() => { Promise.resolve().then(fetchStaff); }, [fetchStaff]);

  return { staffList, total, loading, error, fetchStaff, searchStaff };
}

// ═══════════════════════════════════════════════════════════════
// ─── useAnalytics  (charts data — separate from main dashboard)
// ═══════════════════════════════════════════════════════════════

export function useAnalytics() {
  const [attendance,  setAttendance]  = useState<AttendanceData>(PH_ATTENDANCE);
  const [performance, setPerformance] = useState<PerformanceData>(PH_PERFORMANCE);
  const [roles,       setRoles]       = useState<RolesData>(PH_ROLES);
  const [payroll,     setPayroll]     = useState<PayrollData>(PH_PAYROLL);
  const [schedule,    setSchedule]    = useState<ScheduleItem[]>(PH_SCHEDULE);
  const [birthdays,   setBirthdays]   = useState<BirthdayItem[]>(PH_BIRTHDAYS);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [attendanceRes, perfRes, rolesRes, payrollRes, scheduleRes, bdayRes] =
          await Promise.all([
            analyticsAPI.getAttendance(),
            analyticsAPI.getPerformance(),
            analyticsAPI.getRoles(),
            analyticsAPI.getPayroll(),
            analyticsAPI.getSchedule(),
            analyticsAPI.getBirthdays(),
          ]);

        if (attendanceRes.success  && attendanceRes.data && Object.keys(attendanceRes.data).length > 0)        setAttendance(attendanceRes.data);
        if (perfRes.success        && perfRes.data && Object.keys(perfRes.data).length > 0)              setPerformance(perfRes.data);
        if (rolesRes.success       && rolesRes.data && Object.keys(rolesRes.data).length > 0)             setRoles(rolesRes.data);
        if (payrollRes.success     && payrollRes.data && Object.keys(payrollRes.data).length > 0)           setPayroll(payrollRes.data);
        if (scheduleRes.success    && scheduleRes.data?.length)  setSchedule(scheduleRes.data);
        if (bdayRes.success        && bdayRes.data?.length)      setBirthdays(bdayRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { attendance, performance, roles, payroll, schedule, birthdays, loading, error };
}

// ═══════════════════════════════════════════════════════════════
// ─── useNotifications
// ═══════════════════════════════════════════════════════════════

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications(_limit = 10) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // notificationsAPI not yet wired — returns [] from staff.api.ts stub
      // When Atharva adds the endpoint, this will just work
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // TODO: await notificationsAPI.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    // TODO: await notificationsAPI.markAllAsRead();
  }, []);

  useEffect(() => { Promise.resolve().then(fetchNotifications); }, [fetchNotifications]);

  return { notifications, unreadCount, loading, error, markAsRead, markAllAsRead };
}

// ═══════════════════════════════════════════════════════════════
// ─── useUserProfile
// ═══════════════════════════════════════════════════════════════

export function useUserProfile() {
  // Default profile is first placeholder staff member until auth is wired
  const [profile,  setProfile]  = useState<StaffMember | null>(PH_STAFF[0]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        // Only replace if backend returned a real profile (has id + name)
        if (res.success && res.data?.id && res.data?.name) {
          setProfile(res.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<StaffMember>) => {
    try {
      const res = await userAPI.updateProfile(updates);
      if (res.success && res.data) setProfile(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await userAPI.logout();
      setProfile(null);
      cache.clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  }, []);

  return { profile, loading, error, updateProfile, logout };
}