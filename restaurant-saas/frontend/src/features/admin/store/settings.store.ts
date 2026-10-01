import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarSeed: string;
}

export interface RestaurantInfo {
  name: string;
  type: string;
  cuisine: string;
  phone: string;
  address: string;
}

export interface BillingInfo {
  plan: string;
  cycle: string;
  nextBillingDate: string;
  amount: string;
  paymentMethod: string;
  cardLast4: string;
}

export interface TeamPermissions {
  totalMembers: number;
  administrators: number;
  managers: number;
  staffMembers: number;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'Connected' | 'Not Connected';
  icon: string;
  color: string;
}

export interface SettingsState {
  profile: ProfileSettings;
  restaurant: RestaurantInfo;
  billing: BillingInfo;
  team: TeamPermissions;
  notifications: NotificationPreference[];
  integrations: Integration[];
  activeSection: string;
  editingProfile: boolean;
  editingRestaurant: boolean;
}

// ── Initial Data ──────────────────────────────────────────────────────────

const initialState: SettingsState = {
  activeSection: 'profile',
  editingProfile: false,
  editingRestaurant: false,

  profile: {
    fullName: 'David Brown',
    email: 'david.brown@restohub.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    avatarSeed: 'Debesh',
  },

  restaurant: {
    name: 'The Gourmet Kitchen',
    type: 'Fine Dining',
    cuisine: 'Multi-cuisine',
    phone: '+1 (555) 987-6543',
    address: '123 Culinary Street, Foodville, CA 90210, USA',
  },

  billing: {
    plan: 'Premium Plan',
    cycle: 'Monthly',
    nextBillingDate: 'Jun 18, 2025',
    amount: '₹14,900',
    paymentMethod: 'VISA',
    cardLast4: '4242',
  },

  team: {
    totalMembers: 12,
    administrators: 3,
    managers: 4,
    staffMembers: 5,
  },

  notifications: [
    {
      id: 'orders',
      label: 'Order Notifications',
      description: 'Receive notifications for new orders',
      enabled: true,
    },
    {
      id: 'reservations',
      label: 'Reservation Alerts',
      description: 'Receive alerts for new reservations',
      enabled: true,
    },
    {
      id: 'lowStock',
      label: 'Low Stock Alerts',
      description: 'Get notified for low inventory items',
      enabled: true,
    },
    {
      id: 'systemUpdates',
      label: 'System Updates',
      description: 'Important system updates and announcements',
      enabled: false,
    },
  ],

  integrations: [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment Processing',
      status: 'Connected',
      icon: '💳',
      color: '#635bff',
    },
    {
      id: 'square',
      name: 'Square',
      description: 'POS Integration',
      status: 'Connected',
      icon: '⬛',
      color: '#3e4348',
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email Marketing',
      status: 'Not Connected',
      icon: '🐒',
      color: '#ffe01b',
    },
    {
      id: 'googleAnalytics',
      name: 'Google Analytics',
      description: 'Analytics & Reporting',
      status: 'Connected',
      icon: '📊',
      color: '#e37400',
    },
  ],
};

// ── Store ──────────────────────────────────────────────────────────────────

interface SettingsStore extends SettingsState {
  setActiveSection: (section: string) => void;
  setEditingProfile: (v: boolean) => void;
  setEditingRestaurant: (v: boolean) => void;
  updateProfile: (data: Partial<ProfileSettings>) => void;
  updateRestaurant: (data: Partial<RestaurantInfo>) => void;
  toggleNotification: (id: string) => void;
  toggleIntegration: (id: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setActiveSection: (section) => set({ activeSection: section }),
      setEditingProfile: (v) => set({ editingProfile: v }),
      setEditingRestaurant: (v) => set({ editingRestaurant: v }),

      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      updateRestaurant: (data) =>
        set((state) => ({ restaurant: { ...state.restaurant, ...data } })),

      toggleNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, enabled: !n.enabled } : n
          ),
        })),

      toggleIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id
              ? { ...i, status: i.status === 'Connected' ? 'Not Connected' : 'Connected' }
              : i
          ) as Integration[],
        })),
    }),
    {
      name: 'admin-settings-store',
    }
  )
);