// fallow-ignore-file unused-file
// ============================================================
// SYNC DATA - CABALA DOS CAMINHOS
// ============================================================
// Centralized data synchronization management
// Stores application state in LocalStorage for offline access
// ============================================================

const STORAGE_KEY = 'app_sync_data';
const SYNC_TIMESTAMP_KEY = 'app_sync_timestamp';
const SYNC_VERSION_KEY = 'app_sync_version';

const CURRENT_VERSION = 1;

export interface SyncMetadata {
  version: number;
  syncedAt: string;
  lastModified: string | null;
}

export interface SyncData<T = unknown> {
  data: T;
  metadata: SyncMetadata;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
}

let currentSyncState: SyncState = {
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
};

/**
 * Retrieves the current synchronization state.
 */
export function getSyncState(): Readonly<SyncState> {
  return { ...currentSyncState };
}

/**
 * Returns the sync metadata for stored data.
 */
export function getSyncMetadata(): SyncMetadata | null {
  if (typeof window === 'undefined') return null;

  const timestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY);
  if (!timestamp) return null;

  const versionStr = localStorage.getItem(SYNC_VERSION_KEY);
  const version = versionStr ? parseInt(versionStr, 10) : 1;

  return {
    version: version || CURRENT_VERSION,
    syncedAt: timestamp,
    lastModified: null,
  };
}

/**
 * Retrieves synced data from LocalStorage.
 */
export function getSyncData<T = unknown>(): SyncData<T> | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed as SyncData<T>;
  } catch {
    return null;
  }
}

/**
 * Stores data to LocalStorage with sync metadata.
 */
export function setSyncData<T>(data: T): SyncData<T> {
  const now = new Date().toISOString();

  const syncData: SyncData<T> = {
    data,
    metadata: {
      version: CURRENT_VERSION,
      syncedAt: now,
      lastModified: now,
    },
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syncData));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, now);
    localStorage.setItem(SYNC_VERSION_KEY, String(CURRENT_VERSION));

    currentSyncState = {
      ...currentSyncState,
      lastSyncAt: now,
      syncError: null,
    };
  }

  return syncData;
}

/**
 * Merges partial data into existing synced data.
 */
export function mergeSyncData<T extends Record<string, unknown>>(partial: Partial<T>): SyncData<T> | null {
  const existing = getSyncData<T>();
  if (!existing) return null;

  const merged: SyncData<T> = {
    data: { ...existing.data, ...partial } as T,
    metadata: {
      ...existing.metadata,
      lastModified: new Date().toISOString(),
    },
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, merged.metadata.syncedAt);
  }

  return merged;
}

/**
 * Clears all synced data from LocalStorage.
 */
export function clearSyncData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SYNC_TIMESTAMP_KEY);
  localStorage.removeItem(SYNC_VERSION_KEY);

  currentSyncState = {
    isSyncing: false,
    lastSyncAt: null,
    syncError: null,
  };
}

/**
 * Checks if synced data exists and is valid.
 */
export function hasSyncData(): boolean {
  return getSyncData() !== null;
}