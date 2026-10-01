import { useEffect, useMemo, useState } from 'react';
import type { SettingsData } from '../api/settings.api';
import { defaultSettings, settingsAPI } from '../api/settings.api';

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await settingsAPI.getSettings();
    if (res.success && res.data) {
      setSettings(res.data);
    } else {
      setError(res.error ?? 'Unable to fetch settings');
    }
    setLoading(false);
  };

  const saveSettings = async (updates: Partial<SettingsData>) => {
    setSaving(true);
    setError(null);
    const res = await settingsAPI.updateSettings(updates);
    if (res.success && res.data) {
      setSettings(res.data);
    } else {
      setError(res.error ?? 'Unable to save settings');
    }
    setSaving(false);
    return res.success;
  };

  const updateDraft = (updates: Partial<SettingsData>) => {
    setSettings((current) => ({ ...current, ...updates }));
  };

  const toggleNotification = (id: string) => {
    setSettings((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const updateStaffSetting = (id: string, value: string) => {
    setSettings((current) => ({
      ...current,
      staffSettings: current.staffSettings.map((item) =>
        item.id === id ? { ...item, value } : item
      ),
    }));
  };

  const toggleIntegration = (id: string) => {
    setSettings((current) => ({
      ...current,
      integrations: current.integrations.map((item) => {
        if (item.id !== id) return item;
        const isConnected = item.status === 'connected';
        return {
          ...item,
          status: isConnected ? 'setup' : 'connected',
          description: isConnected ? 'Setup recommended' : 'Connected and syncing',
        };
      }),
    }));
  };

  const resetSettings = async () => {
    setSaving(true);
    setError(null);
    const res = await settingsAPI.resetSettings();
    if (res.success && res.data) {
      setSettings(res.data);
    } else {
      setError(res.error ?? 'Unable to reset settings');
    }
    setSaving(false);
    return res.success;
  };

  const hasNotificationsEnabled = useMemo(
    () => settings.notifications.some((item) => item.enabled),
    [settings.notifications]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount, setState is post-await
    void refresh();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    hasNotificationsEnabled,
    refresh,
    saveSettings,
    updateDraft,
    toggleNotification,
    updateStaffSetting,
    toggleIntegration,
    resetSettings,
  };
}
