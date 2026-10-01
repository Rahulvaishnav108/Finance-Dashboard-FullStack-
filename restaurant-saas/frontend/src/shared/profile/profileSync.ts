import type { ProfileData } from '../../features/staff/api/profile.api';

export const profileSyncEventName = 'restaurant-automation:profile-sync';

export type ProfileSyncPayload = {
  previousName?: string;
  roleContext?: 'staff' | 'cleaning' | 'kitchen' | 'admin' | 'super-admin' | 'customer';
  profile: ProfileData;
};

export function dispatchProfileSync(payload: ProfileSyncPayload): void {
  window.dispatchEvent(new CustomEvent<ProfileSyncPayload>(profileSyncEventName, { detail: payload }));
}
