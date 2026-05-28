'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SyncQueueItem {
  id: string;
  type: 'credit' | 'chat' | 'insight';
  data: unknown;
  timestamp: number;
  retries: number;
}

interface PWAState {
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  serviceWorkerReady: boolean;
  updateAvailable: boolean;
  pendingSyncs: number;
  lastSyncAt: Date | null;
}

interface SyncStatus {
  pending: SyncQueueItem[];
  lastSync: Date | null;
  syncing: boolean;
  error: string | null;
}

const SYNC_STORAGE_KEY = 'cabala_pending_syncs';
const MAX_RETRIES = 3;

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isOnline: true,
    isStandalone: false,
    canInstall: false,
    installPrompt: null,
    serviceWorkerReady: false,
    updateAvailable: false,
    pendingSyncs: 0,
    lastSyncAt: null,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: [],
    lastSync: null,
    syncing: false,
    error: null,
  });

  // Load pending syncs from storage
  const loadPendingSyncs = useCallback((): SyncQueueItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(SYNC_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save pending syncs to storage
  const savePendingSyncs = useCallback((items: SyncQueueItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(items));
      setState(s => ({ ...s, pendingSyncs: items.length }));
    } catch (e) {
      console.error('Failed to save pending syncs:', e);
    }
  }, []);

  // Add item to sync queue
  const queueSync = useCallback((
    type: SyncQueueItem['type'],
    data: unknown
  ): string => {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const item: SyncQueueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    const pending = loadPendingSyncs();
    pending.push(item);
    savePendingSyncs(pending);

    // Try to sync immediately if online
    if (state.isOnline && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_REQUESTED',
        payload: { id, type, data },
      });
    }

    return id;
  }, [loadPendingSyncs, savePendingSyncs, state.isOnline]);

  // Process sync queue
  const processSync = useCallback(async () => {
    if (!state.isOnline || syncStatus.syncing) return;

    const pending = loadPendingSyncs();
    if (pending.length === 0) return;

    setSyncStatus(s => ({ ...s, syncing: true, error: null }));

    // Sync helper defined inline to access current state via closure
    const syncItem = async (item: SyncQueueItem): Promise<void> => {
      const baseUrl = '/api';
      switch (item.type) {
        case 'credit':
          await fetch(`${baseUrl}/creditos/debitar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          });
          break;
        case 'chat':
          await fetch(`${baseUrl}/chat/mensagem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          });
          break;
        case 'insight':
          break;
      }
    };

    const failed: SyncQueueItem[] = [];

    for (const item of pending) {
      try {
        await syncItem(item);
      } catch (e) {
        item.retries++;
        if (item.retries < MAX_RETRIES) {
          failed.push(item);
        } else {
          console.error(`Sync item ${item.id} failed permanently:`, e);
        }
      }
    }

    savePendingSyncs(failed);
    setSyncStatus({
      pending: failed,
      lastSync: new Date(),
      syncing: false,
      error: null,
    });
    setState(s => ({ ...s, lastSyncAt: new Date() }));
  }, [state.isOnline, syncStatus.syncing, loadPendingSyncs, savePendingSyncs]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState(s => ({ ...s, isOnline: true }));
      // Trigger sync when coming back online
      processSync();
    };
    const handleOffline = () => setState(s => ({ ...s, isOnline: false }));
    const checkStandalone = () => {
      setState(s => ({
        ...s,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
          'standalone' in window.navigator && window.navigator.standalone === true,
      }));
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(s => ({
        ...s,
        canInstall: true,
        installPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    const handleAppInstalled = () => {
      setState(s => ({
        ...s,
        canInstall: false,
        installPrompt: null,
        isStandalone: true,
      }));
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        processSync();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    standaloneMedia.addEventListener('change', checkStandalone);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    checkStandalone();
    setState(s => ({ ...s, isOnline: navigator.onLine }));

    // Register service worker
    let swRegistration: ServiceWorkerRegistration | null = null;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        swRegistration = registration;
        setState(s => ({ ...s, serviceWorkerReady: true }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(s => ({ ...s, updateAvailable: true }));
              }
            });
          }
        });
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }

    // Load pending syncs
    const pending = loadPendingSyncs();
    setState(s => ({ ...s, pendingSyncs: pending.length }));
    setSyncStatus(s => ({ ...s, pending }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      standaloneMedia.removeEventListener('change', checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      if (swRegistration) {
        swRegistration.update();
      }
    };
  }, [loadPendingSyncs, processSync]);

  // Auto-sync every 30 seconds when online
  useEffect(() => {
    if (!state.isOnline) return;

    const interval = setInterval(() => {
      processSync();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isOnline, processSync]);

  const installApp = async () => {
    if (!state.installPrompt) return;

    await state.installPrompt.prompt();
    const { outcome } = await state.installPrompt.userChoice;

    if (outcome === 'accepted') {
      setState(s => ({ ...s, canInstall: false, installPrompt: null }));
    }
  };

  const updateApp = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const reloadForUpdate = () => {
    window.location.reload();
  };

  const clearSyncQueue = () => {
    savePendingSyncs([]);
    setSyncStatus({
      pending: [],
      lastSync: syncStatus.lastSync,
      syncing: false,
      error: null,
    });
  };

  return {
    // State
    ...state,
    syncStatus,

    // Actions
    installApp,
    updateApp,
    reloadForUpdate,
    queueSync,
    processSync,
    clearSyncQueue,

    // Computed
    hasPendingSyncs: state.pendingSyncs > 0,
    status: state.isOnline
      ? (state.updateAvailable ? 'update-available' : 'ready')
      : 'offline',
  };
}

// Hook for caching data with offline support
export function useOfflineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    enabled?: boolean;
  }
) {
  const { isOnline, queueSync } = usePWA();
  const { ttl = 5 * 60 * 1000, enabled = true } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const cacheKey = `cache_${key}`;

  // Load from cache
  const loadFromCache = useCallback((): { data: T; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  }, [cacheKey]);

  // Save to cache
  const saveToCache = useCallback((data: T) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch {
      // Storage full or unavailable
    }
  }, [cacheKey]);

  useEffect(() => {
    if (!enabled) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      // Try cache first
      const cached = loadFromCache();
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        setFromCache(true);
        setLoading(false);
        return;
      }

      // If offline, use stale cache
      if (!isOnline) {
        if (cached) {
          setData(cached.data);
          setFromCache(true);
          setLoading(false);
          return;
        }
        setError(new Error('Sem conexão e sem dados em cache'));
        setLoading(false);
        return;
      }

      // Fetch fresh data
      try {
        const freshData = await fetcher();
        setData(freshData);
        setFromCache(false);
        saveToCache(freshData);
      } catch (e) {
        // On error, try cache as fallback
        if (cached) {
          setData(cached.data);
          setFromCache(true);
        } else {
          setError(e as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key, enabled, isOnline, fetcher, ttl, loadFromCache, saveToCache]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(cacheKey);
    setData(null);
    setFromCache(false);
  }, [cacheKey]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!isOnline) {
      queueSync('insight', { key, action: 'refresh' });
      return;
    }

    setLoading(true);
    try {
      const freshData = await fetcher();
      setData(freshData);
      setFromCache(false);
      saveToCache(freshData);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [isOnline, fetcher, saveToCache, queueSync, key]);

  return {
    data,
    loading,
    error,
    fromCache,
    invalidate,
    refresh,
  };
}