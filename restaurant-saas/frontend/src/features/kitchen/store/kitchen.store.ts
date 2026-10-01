import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KitchenProfile {
  id: string;
  name: string;
  role: string;
  status: 'on-duty' | 'off-duty' | 'on-break';
  station: string;
  shift: string;
  phone: string;
  email: string;
  avatar: string;
}

interface KitchenStore {
  profile: KitchenProfile;
  updateProfile: (newProfile: Partial<KitchenProfile>) => void;
}

const DEFAULT_PROFILE: KitchenProfile = {
  id: 'STF-01',
  name: 'Chef Arjun',
  role: 'Executive Chef',
  status: 'on-duty',
  station: 'Grill Station',
  shift: '6:00 AM - 2:00 PM',
  phone: '+91 98765 43210',
  email: 'arjun.chef@flavoroast.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmbmbzz4OJ7IsEkEHmNZJz11jLymeZ8GiEKeOnWQmoOE5Q_HuXkjmZXYQQnxukQmYSukcHmGlDaE2DekU_XTxx94qss_9SynPU_qRxjig9w5vwaSPK0QOJ19bP2nDTKH0okSa-V_RlIcQtcPnyw0GO46oo69eT4L-oy_NlsShqVsJ53F8vs3K8QuVkaIozpaP67AMr8YinHpVrCmjqhBE2XnqtFhZ4QaLUR6pKjqn9OeT0fUi28Ah4z0Az_h_TwjcYiaHG7j24-Qs',
};

export const useKitchenStore = create<KitchenStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (newProfile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...newProfile,
          },
        })),
    }),
    {
      name: 'kitchen-profile-store',
    }
  )
);
