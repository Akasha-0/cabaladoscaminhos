import type { User } from '@supabase/supabase-js';

// ============================================================
// UNIFIED STORE - CABALA DOS CAMINHOS
// ============================================================
// Centralized state management using Zustand
// Follows atomic design: small stores composed into larger ones
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// AUTH STORE - User Authentication State
// ============================================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// ============================================================
// CREDITS STORE - User Credits with Optimistic Updates
// ============================================================

export interface CreditsState {
  saldo: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  setSaldo: (saldo: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic updates
  debit: (amount: number) => boolean;
  credit: (amount: number) => void;
  reset: () => void;
}

export const useCreditsStore = create<CreditsState>()((set, get) => ({
  saldo: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,

  setSaldo: (saldo) => set({ 
    saldo, 
    lastUpdated: Date.now(),
    error: null 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  debit: (amount) => {
    const { saldo } = get();
    if (saldo < amount) return false;
    set({ saldo: saldo - amount, lastUpdated: Date.now() });
    return true;
  },

  credit: (amount) => {
    const { saldo } = get();
    set({ saldo: saldo + amount, lastUpdated: Date.now() });
  },

  reset: () => set({ saldo: 0, error: null, lastUpdated: null }),
}));

// ============================================================
// UI STORE - Global UI State (Theme, Modals, etc.)
// ============================================================

export type Theme = 'mystical' | 'minimal' | 'cosmic';

   export interface UIState {
     theme: Theme;
     sidebarOpen: boolean;
     activeModal: string | null;
     notifications: Notification[];
     notificationsEnabled: boolean;
     // Actions
     setTheme: (theme: Theme) => void;
     toggleSidebar: () => void;
     openModal: (modalId: string) => void;
     closeModal: () => void;
     setNotifications: (enabled: boolean) => void;
     addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
     removeNotification: (id: string) => void;
   }

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'mystical',
      sidebarOpen: true,
      activeModal: null,
      notifications: [],
      notificationsEnabled: true,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
      setNotifications: (enabled) => set({ notificationsEnabled: enabled }),

      addNotification: (notification) => 
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'ui-preferences',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// ============================================================
// API CACHE STORE - Prevent Redundant API Calls
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheState {
  cache: Record<string, CacheEntry<unknown>>;
  
  // Actions
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttlMs?: number) => void;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: string) => void;
  clear: () => void;
}

export const useCacheStore = create<CacheState>()((set, get) => ({
  cache: {},

  get: <T>(key: string) => {
    const entry = get().cache[key];
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      set((state) => {
        const { [key]: _, ...rest } = state.cache;
        return { cache: rest };
      });
      return null;
    }
    
    return entry.data as T;
  },

  set: <T>(key: string, data: T, ttlMs = 5 * 60 * 1000) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttlMs,
        },
      },
    }));
  },

  invalidate: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.cache;
      return { cache: rest };
    }),

  invalidatePattern: (pattern) =>
    set((state) => {
      const regex = new RegExp(pattern);
      const newCache: Record<string, CacheEntry<unknown>> = {};
      
      for (const [key, value] of Object.entries(state.cache)) {
        if (!regex.test(key)) {
          newCache[key] = value;
        }
      }
      
      return { cache: newCache };
    }),

  clear: () => set({ cache: {} }),
}));

// ============================================================
// COMPOSED HOOKS - Convenience hooks combining stores
// ============================================================

export function useUser() {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();
  return { user, isAuthenticated, isLoading, setUser, logout };
}

export function useCredits() {
  const { saldo, isLoading, error, debit, credit, setSaldo } = useCreditsStore();
  return { saldo, isLoading, error, debit, credit, setSaldo };
}

export function useTheme() {
  const { theme, setTheme } = useUIStore();
  return { theme, setTheme };
}

// ============================================================
// STORE HYDRATION HELPERS
// ============================================================

export async function hydrateAuthFromSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return null;
    
    const { user } = await response.json();
    if (user) {
      useAuthStore.getState().setUser(user);
    }
    return user;
  } catch {
    return null;
  }
}

export async function hydrateCredits(): Promise<void> {
  try {
    useCreditsStore.getState().setLoading(true);
    const response = await fetch('/api/creditos');
    if (!response.ok) throw new Error('Failed to fetch credits');
    
    const { saldo } = await response.json();
    useCreditsStore.getState().setSaldo(saldo);
  } catch (error) {
    useCreditsStore.getState().setError(
      error instanceof Error ? error.message : 'Erro ao carregar créditos'
    );
  }
}
