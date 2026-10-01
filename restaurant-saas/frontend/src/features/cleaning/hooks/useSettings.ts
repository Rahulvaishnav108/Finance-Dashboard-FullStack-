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

  const toggleCleaningRule = (id: string) => {
    setSettings((current) => ({
      ...current,
      cleaningRules: current.cleaningRules.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const updateCleaningRuleInterval = (id: string, interval: string) => {
    setSettings((current) => ({
      ...current,
      cleaningRules: current.cleaningRules.map((item) =>
        item.id === id ? { ...item, interval } : item
      ),
    }));
  };

  const toggleDispatchOption = (id: string) => {
    setSettings((current) => ({
      ...current,
      dispatchOptions: current.dispatchOptions.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const updateInventoryThreshold = (id: string, threshold: number) => {
    setSettings((current) => ({
      ...current,
      inventoryAlerts: current.inventoryAlerts.map((item) =>
        item.id === id ? { ...item, threshold } : item
      ),
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
    toggleCleaningRule,
    updateCleaningRuleInterval,
    toggleDispatchOption,
    updateInventoryThreshold,
    resetSettings,
  };
}
