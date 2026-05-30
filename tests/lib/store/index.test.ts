import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import {
  useAuthStore,
  useCreditsStore,
  useUIStore,
  useCacheStore,
  useUser,
  useCredits,
  useTheme,
  hydrateAuthFromSession,
  hydrateCredits,
} from '@/lib/store/index';

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-1234';
vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => mockUUID),
});

// Reset stores by calling their reset actions
const resetStores = () => {
  // Reset AuthStore
  useAuthStore.getState().logout?.();
  useAuthStore.setState?.({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: true 
  });
  
  // Reset CreditsStore
  useCreditsStore.getState().reset?.();
  useCreditsStore.setState?.({
    saldo: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });
  
  // Reset UIStore - use partialize reset
  useUIStore.setState?.({
    theme: 'mystical',
    sidebarOpen: true,
    activeModal: null,
    notifications: [],
    notificationsEnabled: true,
  });
  
  // Reset CacheStore
  useCacheStore.getState().clear?.();
  useCacheStore.setState?.({ cache: {} });
};

beforeEach(() => {
  vi.clearAllMocks();
  resetStores();
});

describe('AuthStore', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('setUser updates user and authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: 'user-1', email: 'test@example.com', aud: 'authenticated' } as User;

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('setUser with null clears user', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: 'user-1', email: 'test@example.com', aud: 'authenticated' } as User;

    act(() => {
      result.current.setUser(mockUser);
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setLoading updates loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('logout resets all auth state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: 'user-1', email: 'test@example.com', aud: 'authenticated' } as User;

    act(() => {
      result.current.setUser(mockUser);
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('CreditsStore', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCreditsStore());

    expect(result.current.saldo).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('setSaldo updates balance and metadata', () => {
    const { result } = renderHook(() => useCreditsStore());
    const beforeUpdate = result.current.lastUpdated;

    act(() => {
      result.current.setSaldo(100);
    });

    expect(result.current.saldo).toBe(100);
    expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate ?? 0);
    expect(result.current.error).toBeNull();
  });

  it('setLoading updates loading state', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('setError updates error and clears loading', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setError('Network error');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('debit reduces balance when sufficient funds', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setSaldo(100);
    });

    act(() => {
      result.current.debit(30);
    });

    expect(result.current.saldo).toBe(70);
  });

  it('debit returns false when insufficient funds', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setSaldo(10);
    });

    let success = false;
    act(() => {
      success = result.current.debit(30);
    });

    expect(success).toBe(false);
    expect(result.current.saldo).toBe(10); // unchanged
  });

  it('credit increases balance', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setSaldo(50);
    });
    act(() => {
      result.current.credit(25);
    });

    expect(result.current.saldo).toBe(75);
  });

  it('reset clears all state', () => {
    const { result } = renderHook(() => useCreditsStore());

    act(() => {
      result.current.setSaldo(100);
      result.current.setError('Some error');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.saldo).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });
});

describe('UIStore', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.theme).toBe('mystical');
    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.activeModal).toBeNull();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notificationsEnabled).toBe(true);
  });

  it('setTheme updates theme', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setTheme('cosmic');
    });

    expect(result.current.theme).toBe('cosmic');

    act(() => {
      result.current.setTheme('minimal');
    });

    expect(result.current.theme).toBe('minimal');
  });

  it('toggleSidebar toggles sidebar state', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('openModal sets active modal', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.openModal('settings');
    });

    expect(result.current.activeModal).toBe('settings');

    act(() => {
      result.current.openModal('profile');
    });

    expect(result.current.activeModal).toBe('profile');
  });

  it('closeModal clears active modal', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.openModal('settings');
    });
    expect(result.current.activeModal).toBe('settings');

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.activeModal).toBeNull();
  });

  it('setNotifications updates notificationsEnabled', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setNotifications(false);
    });

    expect(result.current.notificationsEnabled).toBe(false);
  });

  it('addNotification adds notification with id and timestamp', () => {
    const { result } = renderHook(() => useUIStore());
    const beforeAdd = Date.now();

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test Notification',
        message: 'Test message',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test Notification');
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].message).toBe('Test message');
    expect(result.current.notifications[0].id).toBe(mockUUID);
    expect(result.current.notifications[0].timestamp).toBeGreaterThanOrEqual(beforeAdd);
  });

  it('addNotification appends to existing notifications', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.addNotification({ type: 'info', title: 'First' });
    });
    act(() => {
      result.current.addNotification({ type: 'error', title: 'Second' });
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].title).toBe('First');
    expect(result.current.notifications[1].title).toBe('Second');
  });

  it('removeNotification removes notification by id', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.addNotification({ type: 'info', title: 'First' });
      result.current.addNotification({ type: 'info', title: 'Second' });
    });

    expect(result.current.notifications).toHaveLength(2);
    const firstId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(firstId);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Second');
  });
});

describe('CacheStore', () => {
  it('initializes with empty cache', () => {
    const { result } = renderHook(() => useCacheStore());
    expect(result.current.cache).toEqual({});
  });

  it('set adds cache entry with default TTL', () => {
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('key1', { data: 'value1' });
    });

    expect(result.current.cache['key1']).toBeDefined();
    expect(result.current.cache['key1'].data).toEqual({ data: 'value1' });
    expect(result.current.cache['key1'].expiresAt).toBeGreaterThan(Date.now());
  });

  it('set adds cache entry with custom TTL', () => {
    const { result } = renderHook(() => useCacheStore());
    const customTTL = 1000; // 1 second

    act(() => {
      result.current.set('key1', { data: 'value1' }, customTTL);
    });

    const expectedExpiry = Date.now() + customTTL;
    expect(result.current.cache['key1'].expiresAt).toBeLessThanOrEqual(expectedExpiry + 10);
    expect(result.current.cache['key1'].expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 10);
  });

  it('get retrieves cached data', () => {
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('key1', { data: 'value1' });
    });

    let retrieved: unknown;
    act(() => {
      retrieved = result.current.get('key1');
    });

    expect(retrieved).toEqual({ data: 'value1' });
  });

  it('get returns null for non-existent key', () => {
    const { result } = renderHook(() => useCacheStore());

    let retrieved: unknown;
    act(() => {
      retrieved = result.current.get('nonexistent');
    });

    expect(retrieved).toBeNull();
  });

  it('get returns null for expired entry', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('key1', { data: 'value1' }, 1000);
    });

    vi.advanceTimersByTime(2000);

    let retrieved: unknown;
    act(() => {
      retrieved = result.current.get('key1');
    });

    expect(retrieved).toBeNull();
    vi.useRealTimers();
  });

  it('invalidate removes specific key', () => {
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('key1', { data: 'value1' });
      result.current.set('key2', { data: 'value2' });
    });

    act(() => {
      result.current.invalidate('key1');
    });

    expect(result.current.cache['key1']).toBeUndefined();
    expect(result.current.cache['key2']).toBeDefined();
  });

  it('invalidatePattern removes matching keys', () => {
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('user-1', { data: 'user1' });
      result.current.set('user-2', { data: 'user2' });
      result.current.set('post-1', { data: 'post1' });
    });

    act(() => {
      result.current.invalidatePattern('^user-');
    });

    expect(result.current.cache['user-1']).toBeUndefined();
    expect(result.current.cache['user-2']).toBeUndefined();
    expect(result.current.cache['post-1']).toBeDefined();
  });

  it('clear removes all cache entries', () => {
    const { result } = renderHook(() => useCacheStore());

    act(() => {
      result.current.set('key1', { data: 'value1' });
      result.current.set('key2', { data: 'value2' });
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.cache).toEqual({});
  });
});

describe('Composed Hooks', () => {
  describe('useUser', () => {
    it('returns auth store state and actions', () => {
      const { result } = renderHook(() => useUser());
      const mockUser = { id: 'user-1', email: 'test@example.com', aud: 'authenticated' } as User;

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.logout).toBe('function');

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('useCredits', () => {
    it('returns credits store state and actions', () => {
      const { result } = renderHook(() => useCredits());

      expect(result.current.saldo).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.debit).toBe('function');
      expect(typeof result.current.credit).toBe('function');
      expect(typeof result.current.setSaldo).toBe('function');

      act(() => {
        result.current.setSaldo(100);
      });

      expect(result.current.saldo).toBe(100);
    });
  });

  describe('useTheme', () => {
    it('returns theme state and setTheme action', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('mystical');
      expect(typeof result.current.setTheme).toBe('function');

      act(() => {
        result.current.setTheme('cosmic');
      });

      expect(result.current.theme).toBe('cosmic');
    });
  });
});

describe('Hydration Helpers', () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  beforeEach(() => {
    fetchMock.mockReset();
    resetStores();
  });

  describe('hydrateAuthFromSession', () => {
    it('returns user when session fetch succeeds', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', aud: 'authenticated' } as User;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });

      const user = await hydrateAuthFromSession();

      expect(user).toEqual(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('returns null when fetch fails', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });

      const user = await hydrateAuthFromSession();

      expect(user).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const user = await hydrateAuthFromSession();

      expect(user).toBeNull();
    });

    it('returns null when user is not in response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      });

      const user = await hydrateAuthFromSession();

      expect(user).toBeNull();
    });
  });

  describe('hydrateCredits', () => {
    it('sets saldo on successful fetch', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ saldo: 250 }),
      });

      await hydrateCredits();

      expect(useCreditsStore.getState().saldo).toBe(250);
      expect(useCreditsStore.getState().error).toBeNull();
    });

    it('sets error on fetch failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });

      await hydrateCredits();

      expect(useCreditsStore.getState().error).toBe('Failed to fetch credits');
    });

    it('sets error message on fetch exception', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Connection refused'));

      await hydrateCredits();

      expect(useCreditsStore.getState().error).toBe('Connection refused');
    });

    it('sets generic error message for non-Error exceptions', async () => {
      fetchMock.mockRejectedValueOnce('string error');

      await hydrateCredits();

      expect(useCreditsStore.getState().error).toBe('Erro ao carregar créditos');
    });
  });
});
