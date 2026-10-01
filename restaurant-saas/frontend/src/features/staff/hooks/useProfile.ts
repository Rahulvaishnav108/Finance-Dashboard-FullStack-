import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import type {
  ProfileActivityItem,
  ProfileArea,
  ProfileData,
  ProfileMetric,
  ProfilePerformanceItem,
  ProfileShiftItem,
} from '../api/profile.api';
import { profileAPI } from '../api/profile.api';

const fallbackStaffMetrics: ProfileMetric[] = [
  { label: 'Orders Served', value: '142', delta: '+15% vs last week', tone: 'green' },
  { label: 'Guest Rating', value: '4.8/5.0', delta: '+0.2 vs last month', tone: 'purple' },
  { label: 'Avg Table Turnover', value: '42 min', delta: '-4 min vs yesterday', tone: 'blue' },
  { label: 'Shift Attendance', value: '98%', delta: 'On track', tone: 'amber' },
];

const fallbackPerformance: ProfilePerformanceItem[] = [
  { label: 'Completed', value: '92%', tone: 'green' },
  { label: 'Pending', value: '6%', tone: 'amber' },
  { label: 'Overdue', value: '2%', tone: 'red' },
];

const fallbackStaffAreas: ProfileArea[] = [
  { label: 'Dining Area Section A', tone: 'purple' },
  { label: 'Dining Area Section B', tone: 'pink' },
  { label: 'VIP Lounge', tone: 'amber' },
  { label: 'Bar Counter', tone: 'orange' },
];

const fallbackStaffActivity: ProfileActivityItem[] = [
  { time: '02:15 PM', action: 'Served Table T03 order (Dal Tadka, Rice)', badge: 'Order Served', tone: 'green' },
  { time: '02:40 PM', action: 'Resolved Table T05 water refill request', badge: 'Request', tone: 'teal' },
  { time: '03:10 PM', action: 'Checked in Reservation John Doe (4 guests)', badge: 'Check-In', tone: 'slate' },
  { time: '04:15 PM', action: 'Assigned Table T08 to guest party', badge: 'Table Assign', tone: 'slate' },
];

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  mobile?: string;
}

function buildFallbackProfile(user: AuthUser | null | undefined): ProfileData {
  const shift: ProfileShiftItem[] = [
    { label: 'Shift Time', value: '09:00 AM - 05:00 PM' },
    { label: 'Role', value: 'Service Captain' },
    { label: 'Status', value: 'Active', tone: 'success' },
    { label: 'Since', value: '09:00 AM' },
  ];

  return {
    id: Number(user?.id?.replace(/\D/g, '')) || 1,
    name: user?.name || 'John Staff',
    email: user?.email || 'john.staff@restaurant.com',
    role: 'Service Captain',
    department: 'Service',
    phone: user?.mobile || '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    employeeId: `STF-1001`,
    avatarUrl: null,
    metrics: fallbackStaffMetrics,
    areas: fallbackStaffAreas,
    shift,
    performance: fallbackPerformance,
    activity: fallbackStaffActivity,
  };
}

function mergeProfileData(base: ProfileData, incoming?: Partial<ProfileData> | null): ProfileData {
  if (!incoming) {
    return base;
  }

  return {
    ...base,
    ...incoming,
    joinDate: incoming.joinDate || base.joinDate,
    employeeId: incoming.employeeId || base.employeeId,
    avatarUrl: incoming.avatarUrl ?? base.avatarUrl ?? null,
    metrics: incoming.metrics?.length ? incoming.metrics : base.metrics,
    areas: incoming.areas?.length ? incoming.areas : base.areas,
    shift: incoming.shift?.length ? incoming.shift : base.shift,
    performance: incoming.performance?.length ? incoming.performance : base.performance,
    activity: incoming.activity?.length ? incoming.activity : base.activity,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(() => {
    return user ? buildFallbackProfile(user) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const fallback = buildFallbackProfile(user);
    setLoading(true);
    setError(null);
    const res = await profileAPI.getProfile();
    if (res.success) {
      setProfile(mergeProfileData(fallback, res.data ?? null));
    } else {
      setError(res.error ?? 'Unable to fetch profile');
      setProfile(fallback);
    }
    setLoading(false);
  }, [user]);

  const saveProfile = async (updates: Partial<ProfileData>) => {
    const fallback = profile ?? buildFallbackProfile(user);
    setLoading(true);
    setError(null);
    const res = await profileAPI.updateProfile(updates);
    if (res.success) {
      setProfile(mergeProfileData(mergeProfileData(fallback, updates), res.data ?? null));
    } else {
      setError(res.error ?? 'Unable to save profile');
      setProfile(mergeProfileData(fallback, updates));
    }
    setLoading(false);
    return res.success;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount, setState is post-await
    void refresh();
  }, [refresh]);

  return {
    profile,
    loading,
    error,
    refresh,
    saveProfile,
  };
}
