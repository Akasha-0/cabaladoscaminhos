import { getAffirmations } from './library';

const STORAGE_KEY = 'affirmations_sync';
const SYNC_TIMESTAMP_KEY = 'affirmations_sync_timestamp';

interface SyncData {
  affirmations: Awaited<ReturnType<typeof getAffirmations>>;
  syncedAt: string;
}

/**
 * Syncs affirmations to LocalStorage.
 * Stores the full affirmations data with a timestamp.
 */
export async function syncAffirmations(): Promise<SyncData> {
  const affirmations = getAffirmations();
  const syncData: SyncData = {
    affirmations,
    syncedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syncData));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, syncData.syncedAt);
  }

  return syncData;
}

/**
 * Retrieves synced affirmations from LocalStorage.
 */
export function getSyncedAffirmations(): SyncData | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SyncData;
  } catch {
    return null;
  }
}

/**
 * Returns the timestamp of the last sync, or null if never synced.
 */
export function getLastSyncTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_TIMESTAMP_KEY);
}
