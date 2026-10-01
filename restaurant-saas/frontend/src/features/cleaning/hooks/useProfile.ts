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

const fallbackCleaningMetrics: ProfileMetric[] = [
  { label: 'Tables Cleaned', value: '318', delta: '+24% vs last week', tone: 'green' },
  { label: 'Checklist Completion', value: '99.2%', delta: '+1.5% vs yesterday', tone: 'purple' },
  { label: 'Avg Cleaning Time', value: '5.4 min', delta: '-0.8 min vs yesterday', tone: 'blue' },
  { label: 'Sanitation Score', value: '96/100', delta: 'Grade A', tone: 'amber' },
];

const fallbackPerformance: ProfilePerformanceItem[] = [
  { label: 'Completed', value: '92%', tone: 'green' },
  { label: 'Pending', value: '6%', tone: 'amber' },
  { label: 'Overdue', value: '2%', tone: 'red' },
];

const fallbackCleaningAreas: ProfileArea[] = [
  { label: 'All Floor Tables', tone: 'purple' },
  { label: 'Restrooms Area A & B', tone: 'pink' },
  { label: 'Kitchen Sanitizing Stations', tone: 'amber' },
  { label: 'Store Room', tone: 'orange' },
];

const fallbackCleaningActivity: ProfileActivityItem[] = [
  { time: '09:20 AM', action: 'Completed Table T04 checkout cleaning checklist', badge: 'Cleaning', tone: 'green' },
  { time: '09:43 AM', action: 'Completed deep cleaning for Kitchen Sanitizing B', badge: 'Sanitation', tone: 'teal' },
  { time: '10:10 AM', action: 'Resolved urgent cleanup request for Restroom A', badge: 'Alert', tone: 'red' },
  { time: '11:15 AM', action: 'Restocked supplies in Main Washroom storage', badge: 'Supply', tone: 'slate' },
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
    { label: 'Role', value: 'Cleaning Lead' },
    { label: 'Status', value: 'Active', tone: 'success' },
    { label: 'Since', value: '09:00 AM' },
  ];

  return {
    id: Number(user?.id?.replace(/\D/g, '')) || 1,
    name: user?.name || 'John Cleaner',
    email: user?.email || 'john.cleaner@restaurant.com',
    role: 'Cleaning Lead',
    department: 'Housekeeping',
    phone: user?.mobile || '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    employeeId: `CLN-1001`,
    avatarUrl: null,
    metrics: fallbackCleaningMetrics,
    areas: fallbackCleaningAreas,
    shift,
    performance: fallbackPerformance,
    activity: fallbackCleaningActivity,
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
