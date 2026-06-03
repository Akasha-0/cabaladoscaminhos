// ============================================================
// THEME SYSTEM - Dark/Light Mode with System Preference
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

// Detect system preference
function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Listen for system preference changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    // Re-render component that uses systemTheme to reflect changes
    window.dispatchEvent(new CustomEvent('system-theme-change'));
  });
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getSystemTheme(),
      setTheme: (theme: ThemeMode) => set({ theme }),
    }),
    {
      name: 'theme-preference',
    }
  )
);

// Export individual functions for direct use
const theme = useThemeStore.getState().theme;
const setTheme = (mode: ThemeMode) => useThemeStore.getState().setTheme(mode);
const toggleTheme = () => {
  const current = useThemeStore.getState().theme;
  useThemeStore.getState().setTheme(current === 'dark' ? 'light' : 'dark');
};
const systemTheme = getSystemTheme();

// Hook for React components
export function useTheme() {
  return {
    theme: useThemeStore((s) => s.theme),
    setTheme: useThemeStore((s) => s.setTheme),
    toggleTheme,
    systemTheme,
    isDark: useThemeStore((s) => s.theme === 'dark'),
  };
}