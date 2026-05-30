'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
export interface SyncStatus {
  lastSync: string | null;
  pending: number;
  syncing: boolean;
  error: string | null;
}
export interface SyncConflict {
  key: string;
  localValue: unknown;
  cloudValue: unknown;
  resolution: 'local' | 'cloud' | 'merged' | null;
}
export interface DataSyncOptions {
  storageKey?: string;
  cloudEndpoint?: string;
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: (status: SyncStatus) => void;
  onConflict?: (conflict: SyncConflict) => void;
}
const DEFAULT_OPTIONS: DataSyncOptions = {
  storageKey: 'spiritual_data',
  cloudEndpoint: '/api/sync/data',
  autoSync: false,
  syncInterval: 60000,
};
export function useDataSync(options: DataSyncOptions = {}) {
  // Use useMemo to stabilize opts object
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const lastSyncRef = useRef<string | null>(null);
function mergeValues(local: unknown, cloud: unknown): unknown {
  if (typeof local !== 'object' || local === null || typeof cloud !== 'object' || cloud === null) {
    return cloud;
  }
  const merged: Record<string, unknown> = { ...(cloud as Record<string, unknown>) };
  const localObj = local as Record<string, unknown>;

  for (const key of Object.keys(localObj)) {
    if (!(key in merged)) {
      merged[key] = localObj[key];
    } else if (typeof localObj[key] === 'object' && localObj[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
      merged[key] = mergeValues(localObj[key], merged[key]);
    } else if (new Date(localObj[key] as string).getTime() > new Date(merged[key] as string).getTime()) {
      merged[key] = localObj[key];
    }
  }

  return merged;
}

export function useDataSync(options: DataSyncOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lastSyncRef = useRef<string | null>(null);

  const [status, setStatus] = useState<SyncStatus>({
    lastSync: null,
    pending: 0,
    syncing: false,
    error: null,
  });

  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const countPending = useCallback((): number => {
    try {
      const pendingRaw = localStorage.getItem(`${opts.storageKey}_pending`);
      return pendingRaw ? JSON.parse(pendingRaw).length : 0;
    } catch {
      return 0;
    }
  }, [opts.storageKey]);

  const pushLocal = useCallback((): void => {
    try {
      const pendingRaw = localStorage.getItem(`${opts.storageKey}_pending`);
      if (!pendingRaw) return;

      const pending = JSON.parse(pendingRaw);
      const current = localStorage.getItem(opts.storageKey);
      const currentData = current ? JSON.parse(current) : {};

      for (const key of pending) {
        if (key in currentData) {
          const cloudData = localStorage.getItem(`${opts.storageKey}_cloud`);
          const cloud = cloudData ? JSON.parse(cloudData) : {};

          if (JSON.stringify(currentData[key]) !== JSON.stringify(cloud[key])) {
            localStorage.setItem(`${opts.storageKey}_conflicts`, JSON.stringify([
              ...JSON.parse(localStorage.getItem(`${opts.storageKey}_conflicts`) || '[]'),
              { key, localValue: currentData[key], cloudValue: cloud[key], resolution: null },
            ]));
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [opts.storageKey]);

  const syncToCloud = useCallback(async (data: unknown): Promise<void> => {
    const response = await fetch(opts.cloudEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    return response.json();
  }, [opts.cloudEndpoint]);

  const syncFromCloud = useCallback(async (): Promise<unknown> => {
    const response = await fetch(opts.cloudEndpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    return response.json();
  }, [opts.cloudEndpoint]);

  const performSync = useCallback(async (): Promise<void> => {
    if (status.syncing) return;

    setStatus(s => ({ ...s, syncing: true, error: null }));

    try {
      const localRaw = localStorage.getItem(opts.storageKey);
      const localData = localRaw ? JSON.parse(localRaw) : null;

      const cloudRaw = localStorage.getItem(`${opts.storageKey}_cloud`);
      const cloudData = cloudRaw ? JSON.parse(cloudRaw) : null;

      if (!localData && !cloudData) {
        setStatus(s => ({ ...s, syncing: false, lastSync: new Date().toISOString() }));
        return;
      }

      if (!cloudData && localData) {
        await syncToCloud(localData);
        localStorage.setItem(`${opts.storageKey}_cloud`, JSON.stringify(localData));
        localStorage.removeItem(`${opts.storageKey}_pending`);
      } else if (localData && cloudData) {
        const pendingRaw = localStorage.getItem(`${opts.storageKey}_pending`);
        const pending: string[] = pendingRaw ? JSON.parse(pendingRaw) : [];

        const newConflicts: SyncConflict[] = [];

        for (const key of pending) {
          if (localData[key] && cloudData[key]) {
            newConflicts.push({
              key,
              localValue: localData[key],
              cloudValue: cloudData[key],
              resolution: null,
            });
          }
        }

        if (newConflicts.length > 0 && opts.onConflict) {
          const resolved: SyncConflict[] = [];

          for (const conflict of newConflicts) {
            const resolution = await opts.onConflict(conflict);
            resolved.push({ ...conflict, resolution });
          }

          setConflicts(resolved);

          const resolvedData: Record<string, unknown> = { ...cloudData };

          for (const conflict of resolved) {
            if (conflict.resolution === 'local') {
              resolvedData[conflict.key] = conflict.localValue;
            } else if (conflict.resolution === 'cloud') {
              resolvedData[conflict.key] = conflict.cloudValue;
            } else if (conflict.resolution === 'merged') {
              resolvedData[conflict.key] = mergeValues(conflict.localValue, conflict.cloudValue);
            }
          }

          await syncToCloud(resolvedData);
          localStorage.setItem(opts.storageKey, JSON.stringify(resolvedData));
          localStorage.setItem(`${opts.storageKey}_cloud`, JSON.stringify(resolvedData));
          localStorage.removeItem(`${opts.storageKey}_pending`);
        } else if (newConflicts.length === 0) {
          const merged = mergeValues(cloudData, localData);
          await syncToCloud(merged);
          localStorage.setItem(`${opts.storageKey}_cloud`, JSON.stringify(merged));
          localStorage.removeItem(`${opts.storageKey}_pending`);
        }
      }

      lastSyncRef.current = new Date().toISOString();
      setStatus(s => ({ ...s, syncing: false, lastSync: lastSyncRef.current, pending: 0 }));
    } catch (err) {
      setStatus(s => ({
        ...s,
        syncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [opts, status.syncing, syncToCloud]);

  const resolveConflict = useCallback(async (
    key: string,
    resolution: 'local' | 'cloud' | 'merged'
  ): Promise<void> => {
    const cloudRaw = localStorage.getItem(`${opts.storageKey}_cloud`);
    const localRaw = localStorage.getItem(opts.storageKey);
    const cloudData = cloudRaw ? JSON.parse(cloudRaw) : {};
    const localData = localRaw ? JSON.parse(localRaw) : {};

    let resolved: unknown;

    if (resolution === 'local') {
      resolved = localData[key];
    } else if (resolution === 'cloud') {
      resolved = cloudData[key];
    } else {
      resolved = mergeValues(localData[key], cloudData[key]);
    }

    const updatedCloud = { ...cloudData, [key]: resolved };
    const updatedLocal = { ...localData, [key]: resolved };

    try {
      await syncToCloud(updatedCloud);
      localStorage.setItem(`${opts.storageKey}_cloud`, JSON.stringify(updatedCloud));
      localStorage.setItem(opts.storageKey, JSON.stringify(updatedLocal));

      setConflicts(prev => prev.filter(c => c.key !== key));
    } catch {
      setStatus(s => ({ ...s, error: 'Failed to resolve conflict' }));
    }
  }, [opts.storageKey, syncToCloud]);

  const markPending = useCallback((key: string, value: unknown): void => {
    try {
      const pendingRaw = localStorage.getItem(`${opts.storageKey}_pending`);
      const pending: string[] = pendingRaw ? JSON.parse(pendingRaw) : [];

      if (!pending.includes(key)) {
        pending.push(key);
        localStorage.setItem(`${opts.storageKey}_pending`, JSON.stringify(pending));
      }

      const currentRaw = localStorage.getItem(opts.storageKey);
      const current: Record<string, unknown> = currentRaw ? JSON.parse(currentRaw) : {};
      current[key] = value;
      localStorage.setItem(opts.storageKey, JSON.stringify(current));

      setStatus(s => ({ ...s, pending: countPending() }));
    } catch {
      // Ignore storage errors
    }
  }, [opts.storageKey, countPending]);

  useEffect(() => {
    const initialPending = countPending();
    setStatus(s => ({ ...s, pending: initialPending }));

    if (opts.autoSync) {
      const lastSyncRaw = localStorage.getItem(`${opts.storageKey}_last_sync`);
      const lastSync = lastSyncRaw ? new Date(lastSyncRaw).getTime() : 0;
      const now = Date.now();

      if (!lastSync || now - lastSync >= opts.syncIntervalMs) {
        performSync();
      }

      const interval = setInterval(() => {
        const currentLastSync = lastSyncRef.current
          ? new Date(lastSyncRef.current).getTime()
          : 0;
        if (Date.now() - currentLastSync >= opts.syncIntervalMs) {
          performSync();
        }
      }, opts.syncIntervalMs);

      return () => clearInterval(interval);
    }
  }, [opts.autoSync, opts.syncIntervalMs, performSync, countPending]);

  useEffect(() => {
    if (status.lastSync) {
      localStorage.setItem(`${opts.storageKey}_last_sync`, status.lastSync);
    }
  }, [status.lastSync, opts.storageKey]);

  return {
    status,
    conflicts,
    sync: performSync,
    resolveConflict,
    markPending,
    pushLocal,
  };
}