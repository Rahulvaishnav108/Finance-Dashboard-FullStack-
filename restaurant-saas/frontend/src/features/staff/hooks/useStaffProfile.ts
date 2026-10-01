// src/features/staff/hooks/useStaffProfile.ts

import { useState, useEffect } from 'react';
import { staffStore, type WaiterProfile } from '../store/staff.store';

export function useStaffProfile() {
  const [profile, setProfile] = useState(() => staffStore.profile);

  useEffect(() => {
    const unsubscribe = staffStore.subscribe(() => {
      setProfile(staffStore.profile);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    profile,
    updateProfile: (updated: Partial<WaiterProfile>) => staffStore.updateProfile(updated)
  };
}
