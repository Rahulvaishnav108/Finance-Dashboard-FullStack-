export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SettingsSection =
  | 'general'
  | 'notifications'
  | 'cleaningRules'
  | 'staffSettings'
  | 'dispatchAutomation'
  | 'inventoryAlerts'
  | 'security'
  | 'integrations';

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: 'sparkles' | 'calendar' | 'alert' | 'mail' | 'package' | 'bell';
}

export interface CleaningRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  interval: string;
}

export interface StaffSetting {
  id: string;
  label: string;
  value: string;
}

export interface DispatchOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface InventoryAlertSetting {
  id: string;
  label: string;
  threshold: number;
  description: string;
}

export interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'setup' | 'error';
}

export interface SettingsData {
  restaurantName: string;
  restaurantLocation: string;
  dateFormat: string;
  timezone: string;
  language: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationSetting[];
  cleaningRules: CleaningRule[];
  staffSettings: StaffSetting[];
  manualAssignment: boolean;
  dispatchOptions: DispatchOption[];
  inventoryAlerts: InventoryAlertSetting[];
  twoFactorAuthentication: boolean;
  sessionTimeout: string;
  loginHistoryEnabled: boolean;
  integrations: IntegrationSetting[];
  updatedAt: string;
}

const SETTINGS_STORAGE_KEY = 'graphura.cleaning.settings';

export const defaultSettings: SettingsData = {
  restaurantName: 'Smart Dining Restaurant',
  restaurantLocation: 'Midtown',
  dateFormat: 'MM/DD/YYYY',
  timezone: '(GMT-05:00) Eastern Time (US & Canada)',
  language: 'English',
  timeFormat: '24h',
  notifications: [
    {
      id: 'cleaning-requests',
      title: 'Cleaning Requests',
      description: 'Get notified for new cleaning requests',
      enabled: true,
      icon: 'sparkles',
    },
    {
      id: 'critical-alerts',
      title: 'Critical Alerts',
      description: 'Get notified for critical and urgent alerts',
      enabled: true,
      icon: 'alert',
    },
    {
      id: 'supply-shortages',
      title: 'Supply Shortages',
      description: 'Get notified when supplies are low',
      enabled: true,
      icon: 'package',
    },
    {
      id: 'push-notifications',
      title: 'Push Notifications',
      description: 'Receive push notifications in app',
      enabled: true,
      icon: 'bell',
    },
  ],
  cleaningRules: [
    {
      id: 'auto-create',
      title: 'Auto-create task when table vacant',
      description: 'Automatically create cleaning task when table becomes vacant',
      enabled: true,
      interval: '2 min',
    },
    {
      id: 'washroom-inspection',
      title: 'Washroom inspection',
      description: 'Create inspection logs every 30 minutes',
      enabled: true,
      interval: '30 min',
    },
    {
      id: 'kitchen-sanitation',
      title: 'Kitchen sanitation',
      description: 'Create sanitation task every 2 hours',
      enabled: true,
      interval: '2 hours',
    },
    {
      id: 'auto-escalate',
      title: 'Auto-escalate requests',
      description: 'Escalate unassigned requests after time limit',
      enabled: true,
      interval: '10 min',
    },
  ],
  staffSettings: [],
  manualAssignment: true,
  dispatchOptions: [
    {
      id: 'closest-staff',
      title: 'Closest Available Staff',
      description: 'Assign to the nearest available staff',
      enabled: true,
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing',
      description: 'Assign based on current workload',
      enabled: true,
    },
    {
      id: 'priority-first',
      title: 'Priority First',
      description: 'Prioritize urgent and high-priority tasks',
      enabled: true,
    },
    {
      id: 'experience-based',
      title: 'Experience Based Routing',
      description: 'Assign based on staff experience and skills',
      enabled: true,
    },
  ],
  inventoryAlerts: [
    {
      id: 'sanitizer',
      label: 'Sanitizer',
      threshold: 20,
      description: 'Alert when stock below 20%',
    },
    {
      id: 'gloves',
      label: 'Gloves',
      threshold: 15,
      description: 'Alert when stock below 15%',
    },
    {
      id: 'trash-bags',
      label: 'Trash Bags',
      threshold: 10,
      description: 'Alert when stock below 10%',
    },
    {
      id: 'cleaning-chemicals',
      label: 'Cleaning Chemicals',
      threshold: 30,
      description: 'Alert when stock below 30%',
    },
  ],
  twoFactorAuthentication: true,
  sessionTimeout: 'Auto logout after 30 minutes',
  loginHistoryEnabled: true,
  integrations: [],
  updatedAt: new Date().toISOString(),
};

const cloneSettings = (settings: SettingsData): SettingsData => JSON.parse(JSON.stringify(settings)) as SettingsData;

const readLocalSettings = (): SettingsData => {
  if (typeof window === 'undefined') return cloneSettings(defaultSettings);

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return cloneSettings(defaultSettings);
    return { ...cloneSettings(defaultSettings), ...(JSON.parse(stored) as Partial<SettingsData>) };
  } catch {
    return cloneSettings(defaultSettings);
  }
};

const writeLocalSettings = (settings: SettingsData): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 180));

export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<SettingsData>> => {
    await wait();
    return { success: true, data: readLocalSettings() };
  },

  updateSettings: async (updates: Partial<SettingsData>): Promise<ApiResponse<SettingsData>> => {
    await wait();
    const nextSettings = {
      ...readLocalSettings(),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeLocalSettings(nextSettings);
    return { success: true, data: nextSettings };
  },

  resetSettings: async (): Promise<ApiResponse<SettingsData>> => {
    await wait();
    const nextSettings = { ...cloneSettings(defaultSettings), updatedAt: new Date().toISOString() };
    writeLocalSettings(nextSettings);
    return { success: true, data: nextSettings };
  },
};
