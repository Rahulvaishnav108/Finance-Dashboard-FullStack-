// hooks/useTheme.ts
import { useState, useEffect } from 'react';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.darkMode !== undefined) setDarkMode(custom.detail.darkMode);
    };
    window.addEventListener('sync-app-theme', handleThemeSync);
    return () => window.removeEventListener('sync-app-theme', handleThemeSync);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return { darkMode, toggleTheme };
}