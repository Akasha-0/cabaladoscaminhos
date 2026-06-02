// fallow-ignore-file unused-file
// Stub for @/lib/store/index
// Module does not exist - stub implementation for test compatibility

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));

// Credits Store
interface CreditsState {
  saldo: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  setSaldo: (saldo: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  debit: (amount: number) => boolean;
  credit: (amount: number) => void;
  reset: () => void;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  saldo: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  setSaldo: (saldo) => set({ saldo, lastUpdated: Date.now(), error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  debit: (amount) => {
    if (get().saldo >= amount) {
      set({ saldo: get().saldo - amount, lastUpdated: Date.now() });
      return true;
    }
    return false;
  },
  credit: (amount) => set({ saldo: get().saldo + amount, lastUpdated: Date.now() }),
  reset: () => set({ saldo: 0, isLoading: false, error: null, lastUpdated: null }),
}));

// UI Store
interface UIState {
  theme: string;
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: unknown[];
  notificationsEnabled: boolean;
  setTheme: (theme: string) => void;
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'mystical',
  sidebarOpen: true,
  activeModal: null,
  notifications: [],
  notificationsEnabled: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
}));

// Cache Store
interface CacheState {
  cache: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown | undefined;
  clear: () => void;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: {},
  set: (key, value) => set({ cache: { ...get().cache, [key]: value } }),
  get: (key) => get().cache[key],
  clear: () => set({ cache: {} }),
}));

// Composed hooks
export const useUser = () => {
  const { user } = useAuthStore();
  return { user };
};

export const useCredits = () => {
  const { saldo, debit, credit } = useCreditsStore();
  return { saldo, debit, credit };
};

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();
  return { theme, setTheme };
};

// Hydration helpers
export async function hydrateAuthFromSession(_session: unknown): Promise<void> {
  // Stub - no-op
}

export async function hydrateCredits(_userId: string): Promise<void> {
  // Stub - no-op
}