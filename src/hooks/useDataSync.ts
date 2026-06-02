import { useState, useEffect, useCallback, useRef } from 'react';
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
  onConflict?: (conflict: SyncConflict) => 'local' | 'cloud' | 'merged' | null | Promise<'local' | 'cloud' | 'merged' | null>;
}
const DEFAULT_OPTIONS: DataSyncOptions = {
  storageKey: 'spiritual_data',
  cloudEndpoint: '/api/sync/data',
  autoSync: false,
  syncInterval: 60000,
};
// Helper to merge local and cloud values
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
// ─── Pure helpers: sync logic extracted from performSync ──────────────────────
// Load both storages safely
function loadSyncData(storageKey: string): { local: Record<string, unknown> | null; cloud: Record<string, unknown> | null } {
  try {
    const localRaw = localStorage.getItem(storageKey);
    const cloudRaw = localStorage.getItem(`${storageKey}_cloud`);
    return {
      local: localRaw ? JSON.parse(localRaw) : null,
      cloud: cloudRaw ? JSON.parse(cloudRaw) : null,
    };
  } catch {
    return { local: null, cloud: null };
  }
}
// Read pending keys from storage
function loadPending(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(`${storageKey}_pending`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
// Detect conflicts between local and cloud for pending keys
export function detectConflicts(
  localData: Record<string, unknown> | null,
  cloudData: Record<string, unknown> | null,
  pending: string[],
): SyncConflict[] {
  if (!localData || !cloudData) return [];
  const conflicts: SyncConflict[] = [];
  for (const key of pending) {
    if (localData[key] && cloudData[key]) {
      conflicts.push({ key, localValue: localData[key], cloudValue: cloudData[key], resolution: null });
    }
  }
  return conflicts;
}
// Apply conflict resolutions to build final merged data
function applyConflictResolutions(
  conflicts: SyncConflict[],
  cloudData: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = { ...cloudData };
  for (const c of conflicts) {
    if (c.resolution === 'local') resolved[c.key] = c.localValue;
    else if (c.resolution === 'cloud') resolved[c.key] = c.cloudValue;
    else if (c.resolution === 'merged') resolved[c.key] = mergeValues(c.localValue, c.cloudValue);
  }
  return resolved;
}
// Persist synced data and clear pending
function persistSync(storageKey: string, data: Record<string, unknown>): void {
  localStorage.setItem(storageKey, JSON.stringify(data));
  localStorage.setItem(`${storageKey}_cloud`, JSON.stringify(data));
  localStorage.removeItem(`${storageKey}_pending`);
}
// ─── Hook starts here ─────────────────────────────────────────────────────────
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
      const current = localStorage.getItem(opts.storageKey ?? 'spiritual_data');
      const currentData = current ? JSON.parse(current) : {};

      for (const key of pending) {
        if (key in currentData) {
          const cloudData = localStorage.getItem(`${opts.storageKey ?? 'spiritual_data'}_cloud`);
          const cloud = cloudData ? JSON.parse(cloudData) : {};

          if (JSON.stringify(currentData[key]) !== JSON.stringify(cloud[key])) {
            localStorage.setItem(`${opts.storageKey ?? 'spiritual_data'}_conflicts`, JSON.stringify([
              ...JSON.parse(localStorage.getItem(`${opts.storageKey ?? 'spiritual_data'}_conflicts`) || '[]'),
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
    const response = await fetch(opts.cloudEndpoint ?? '/api/sync/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    await response.json();
  }, [opts.cloudEndpoint]);

  const _syncFromCloud = useCallback(async (): Promise<unknown> => {
    const response = await fetch(opts.cloudEndpoint ?? '/api/sync/data', {
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
      const storageKey = opts.storageKey ?? 'spiritual_data';
      const { local: localData, cloud: cloudData } = loadSyncData(storageKey);
      // Nothing to sync
      if (!localData && !cloudData) {
        setStatus(s => ({ ...s, syncing: false, lastSync: new Date().toISOString() }));
        return;
      }
      // Push-only: local exists, no cloud
      if (!cloudData && localData) {
        await syncToCloud(localData);
        persistSync(storageKey, localData);
        finishSync();
        return;
      }
      // Merge: both local and cloud exist
      if (localData && cloudData) {
        const pending = loadPending(storageKey);
        const conflicts = detectConflicts(localData, cloudData, pending);
        if (conflicts.length > 0 && opts.onConflict) {
          const resolved = await resolveConflictsWithCallback(conflicts, opts.onConflict);
          setConflicts(resolved);
          const resolvedData = applyConflictResolutions(resolved, cloudData);
          await syncToCloud(resolvedData);
          persistSync(storageKey, resolvedData);
        } else {
          // No conflicts: deep-merge local into cloud
          const merged = mergeValues(cloudData, localData) as Record<string, unknown>;
          await syncToCloud(merged);
          persistSync(storageKey, merged);
        }
      }
      finishSync();
    } catch (err) {
      setStatus(s => ({
        ...s,
        syncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [opts, status.syncing, syncToCloud]);
// ─── Inline helpers scoped to performSync ────────────────────────────────────
async function resolveConflictsWithCallback(
  conflicts: SyncConflict[],
  onConflict: NonNullable<DataSyncOptions['onConflict']>,
): Promise<SyncConflict[]> {
  const resolved: SyncConflict[] = [];
  for (const conflict of conflicts) {
    const resolution = await onConflict(conflict);
    resolved.push({ ...conflict, resolution: resolution ?? null });
  }
  return resolved;
}
function finishSync(): void {
  lastSyncRef.current = new Date().toISOString();
  setStatus(s => ({ ...s, syncing: false, lastSync: lastSyncRef.current, pending: 0 }));
}

  const resolveConflict = useCallback(async (
    key: string,
    resolution: 'local' | 'cloud' | 'merged'
  ): Promise<void> => {
    const cloudRaw = localStorage.getItem(`${opts.storageKey ?? 'spiritual_data'}_cloud`);
    const localRaw = localStorage.getItem(opts.storageKey ?? 'spiritual_data');
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
      localStorage.setItem(`${opts.storageKey ?? 'spiritual_data'}_cloud`, JSON.stringify(updatedCloud));
      localStorage.setItem(opts.storageKey ?? 'spiritual_data', JSON.stringify(updatedLocal));

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
        localStorage.setItem(`${opts.storageKey ?? 'spiritual_data'}_pending`, JSON.stringify(pending));
      }

      const currentRaw = localStorage.getItem(opts.storageKey ?? 'spiritual_data');
      const current: Record<string, unknown> = currentRaw ? JSON.parse(currentRaw) : {};
      current[key] = value;
      localStorage.setItem(opts.storageKey ?? 'spiritual_data', JSON.stringify(current));

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

      if (!lastSync || now - lastSync >= (opts.syncInterval ?? 60000)) {
        performSync();
      }

      const interval = setInterval(() => {
        const currentLastSync = lastSyncRef.current
          ? new Date(lastSyncRef.current).getTime()
          : 0;
        if (Date.now() - currentLastSync >= (opts.syncInterval ?? 60000)) {
          performSync();
        }
      }, opts.syncInterval ?? 60000);

      return () => clearInterval(interval);
    }
  }, [opts.autoSync, opts.syncInterval, performSync, countPending]);

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