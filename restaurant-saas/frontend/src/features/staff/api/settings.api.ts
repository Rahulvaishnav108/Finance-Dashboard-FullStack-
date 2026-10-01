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

const SETTINGS_STORAGE_KEY = 'graphura.staff.settings';

export const defaultSettings: SettingsData = {
  restaurantName: 'Smart Dining Restaurant',
  restaurantLocation: 'Midtown',
  dateFormat: 'MM/DD/YYYY',
  timezone: '(GMT-05:00) Eastern Time (US & Canada)',
  language: 'English',
  timeFormat: '24h',
  notifications: [
    {
      id: 'shift-changes',
      title: 'Shift Changes',
      description: 'Get notified about shift changes',
      enabled: true,
      icon: 'calendar',
    },
    {
      id: 'critical-alerts',
      title: 'Critical Alerts',
      description: 'Get notified for critical and urgent alerts',
      enabled: true,
      icon: 'alert',
    },
    {
      id: 'email-notifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      enabled: false,
      icon: 'mail',
    },
    {
      id: 'push-notifications',
      title: 'Push Notifications',
      description: 'Receive push notifications in app',
      enabled: true,
      icon: 'bell',
    },
  ],
  cleaningRules: [],
  staffSettings: [
    { id: 'break-duration', label: 'Break Duration', value: '30 min' },
    { id: 'consecutive-tasks', label: 'Max Consecutive Tasks', value: '5 tasks' },
    { id: 'shift-length', label: 'Max Shift Length', value: '8 hours' },
    { id: 'staff-required', label: 'Minimum Staff Required', value: '4 staff' },
  ],
  manualAssignment: true,
  dispatchOptions: [],
  inventoryAlerts: [],
  twoFactorAuthentication: true,
  sessionTimeout: 'Auto logout after 30 minutes',
  loginHistoryEnabled: true,
  integrations: [
    {
      id: 'pos-system',
      name: 'POS System',
      description: 'Connected and syncing',
      status: 'connected',
    },
    {
      id: 'task-management',
      name: 'Task Management',
      description: 'Connected',
      status: 'connected',
    },
    {
      id: 'attendance-system',
      name: 'Attendance System',
      description: 'Sync error detected',
      status: 'error',
    },
  ],
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
