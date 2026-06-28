// ============================================================
// THEME SYSTEM - Dark/Light Mode with System Preference
// ============================================================
// Persiste em localStorage (via zustand persist) E em cookie (theme=...)
// pra permitir SSR detection em middleware e Edge runtime.
// Aplica a classe `dark` no <html> imediatamente pra evitar FOUC.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';
const COOKIE_NAME = 'theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggle: () => void;
}

// --- helpers SSR-safe ---

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^|; )' + name + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[2] ?? '') : null;
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Atualiza meta theme-color pra combinar com status bar
  const themeColor = theme === 'dark' ? '#020617' : '#FAFBFC';
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((m) => m.setAttribute('content', themeColor));
}

// --- listen system change ---
if (typeof window !== 'undefined') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', () => {
    // dispara evento pra componentes que queiram reagir
    window.dispatchEvent(new CustomEvent('system-theme-change'));
  });
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        applyThemeClass(theme);
        setCookie(COOKIE_NAME, theme, COOKIE_MAX_AGE);
      },
      toggle: () => {
        const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyThemeClass(next);
        setCookie(COOKIE_NAME, next, COOKIE_MAX_AGE);
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Após hidratar, aplica classe e cookie
        if (state?.theme) {
          applyThemeClass(state.theme);
          setCookie(COOKIE_NAME, state.theme, COOKIE_MAX_AGE);
        }
      },
    },
  ),
);

// --- exports diretos (não-React) ---
export const systemTheme = getSystemTheme();

/** Função utilitária para ler o cookie em SSR (middleware, RSC). */
export function readThemeCookie(): ThemeMode | null {
  const c = readCookie(COOKIE_NAME);
  if (c === 'dark' || c === 'light') return c;
  return null;
}

/** Função utilitária: ler o tema atual do store (sem hook). */
export function getCurrentTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return useThemeStore.getState().theme;
}

/** Função utilitária: alternar tema sem hook (uso em event listeners globais). */
export function toggleTheme() {
  useThemeStore.getState().toggle();
}

/** Sincroniza com a preferência do sistema operacional. */
export function syncWithSystem() {
  const sys = getSystemTheme();
  useThemeStore.getState().setTheme(sys);
}

// --- React hook ---

export function useTheme() {
  return {
    theme: useThemeStore((s) => s.theme),
    setTheme: useThemeStore((s) => s.setTheme),
    toggle: useThemeStore((s) => s.toggle),
    toggleTheme,
    systemTheme,
    isDark: useThemeStore((s) => s.theme === 'dark'),
  };
}