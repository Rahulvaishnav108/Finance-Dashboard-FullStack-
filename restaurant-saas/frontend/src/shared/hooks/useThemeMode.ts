import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'graphura.ui.theme';
const THEME_CHANGED_EVENT = 'graphura:theme-changed';

type ThemeMode = 'light' | 'dark';

const readThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
};

export function useThemeMode() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readThemeMode);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: mode }));
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeMode>;
      setThemeModeState(customEvent.detail ?? readThemeMode());
    };

    const syncStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemeModeState(readThemeMode());
      }
    };

    window.addEventListener(THEME_CHANGED_EVENT, syncTheme);
    window.addEventListener('storage', syncStorage);

    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, syncTheme);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  return {
    themeMode,
    isDark: themeMode === 'dark',
    setThemeMode,
    toggleThemeMode,
  };
}
