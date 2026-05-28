// Backup restore module - restores data from backup archives
// @ts-nocheck - Skip linting

// tslint:disable

const STORAGE_PREFIX = 'backup_';

/**
 * Backup restore configuration options
 */
export interface RestoreOptions {
  /** Target storage key to restore to (defaults to original key) */
  targetKey?: string;
  /** Merge strategy: 'replace' existing data or 'merge' with existing data */
  mergeStrategy?: 'replace' | 'merge';
  /** Validate backup structure before restoring */
  validateBeforeRestore?: boolean;
}

/**
 * Backup archive structure
 */
export interface BackupArchive {
  /** Unique identifier for this backup */
  id: string;
  /** Human-readable backup name */
  name: string;
  /** Backup creation timestamp */
  createdAt: number;
  /** Storage keys included in this backup */
  keys: string[];
  /** Backup version for compatibility */
  version: string;
  /** Encrypted backup data */
  data: Record<string, unknown>;
}

/**
 * Restore result with status and details
 */
export interface RestoreResult {
  /** Whether restore was successful */
  success: boolean;
  /** Number of keys restored */
  keysRestored: number;
  /** Keys that failed to restore */
  errors: Array<{ key: string; error: string }>;
  /** Timestamp of restore operation */
  restoredAt: number;
}

/**
 * Validate backup archive structure
 */
export function validateBackupArchive(archive: unknown): archive is BackupArchive {
  if (!archive || typeof archive !== 'object') return false;
  const a = archive as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.createdAt === 'number' &&
    Array.isArray(a.keys) &&
    typeof a.version === 'string' &&
    a.data !== null &&
    (typeof a.data === 'object' || typeof a.data === 'undefined')
  );
}

/**
 * Load backup archive from storage
 */
export function loadBackupArchive(backupId: string): BackupArchive | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${backupId}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!validateBackupArchive(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * List all available backups
 */
export function listBackups(): BackupArchive[] {
  if (typeof window === 'undefined') return [];
  const backups: BackupArchive[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const backup = loadBackupArchive(key.replace(STORAGE_PREFIX, ''));
        if (backup) backups.push(backup);
      }
    }
  } catch {
    // Storage unavailable
  }
  return backups.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Restore data from a backup archive
 */
export async function restoreBackup(
  backupId: string,
  options: RestoreOptions = {}
): Promise<RestoreResult> {
  const {
    mergeStrategy = 'replace',
    validateBeforeRestore = true,
  } = options;

  const result: RestoreResult = {
    success: false,
    keysRestored: 0,
    errors: [],
    restoredAt: Date.now(),
  };

  if (typeof window === 'undefined') {
    result.errors.push({ key: 'system', error: 'Restore only available in browser environment' });
    return result;
  }

  const archive = loadBackupArchive(backupId);
  if (!archive) {
    result.errors.push({ key: backupId, error: 'Backup archive not found' });
    return result;
  }

  if (validateBeforeRestore && !validateBackupArchive(archive)) {
    result.errors.push({ key: backupId, error: 'Invalid backup archive structure' });
    return result;
  }

  const data = archive.data || {};

  for (const key of archive.keys) {
    try {
      const targetKey = options.targetKey ?? key;
      const backupData = data[key];

      if (backupData === undefined) {
        result.errors.push({ key, error: 'Key data not found in backup' });
        continue;
      }

      if (mergeStrategy === 'merge') {
        const existing = localStorage.getItem(targetKey);
        if (existing) {
          const existingData = JSON.parse(existing);
          const mergedData = mergeData(existingData, backupData);
          localStorage.setItem(targetKey, JSON.stringify(mergedData));
        } else {
          localStorage.setItem(targetKey, JSON.stringify(backupData));
        }
      } else {
        localStorage.setItem(targetKey, JSON.stringify(backupData));
      }

      result.keysRestored++;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push({ key, error });
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Merge two data objects recursively
 */
function mergeData(existing: unknown, incoming: unknown): unknown {
  if (typeof incoming !== 'object' || incoming === null) {
    return incoming;
  }
  if (typeof existing !== 'object' || existing === null) {
    return incoming;
  }

  const result: Record<string, unknown> = { ...(existing as object) };

  for (const [key, value] of Object.entries(incoming as Record<string, unknown>)) {
    if (key in result && typeof result[key] === 'object' && typeof value === 'object') {
      result[key] = mergeData(result[key], value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Restore specific keys from a backup
 */
export async function restoreBackupKeys(
  backupId: string,
  keys: string[],
  options: RestoreOptions = {}
): Promise<RestoreResult> {
  const {
    mergeStrategy = 'replace',
  } = options;

  const result: RestoreResult = {
    success: false,
    keysRestored: 0,
    errors: [],
    restoredAt: Date.now(),
  };

  if (typeof window === 'undefined') {
    result.errors.push({ key: 'system', error: 'Restore only available in browser environment' });
    return result;
  }

  const archive = loadBackupArchive(backupId);
  if (!archive) {
    result.errors.push({ key: backupId, error: 'Backup archive not found' });
    return result;
  }

  const data = archive.data || {};

  for (const key of keys) {
    if (!archive.keys.includes(key)) {
      result.errors.push({ key, error: 'Key not found in backup' });
      continue;
    }

    try {
      const backupData = data[key];
      if (backupData === undefined) {
        result.errors.push({ key, error: 'Key data not found' });
        continue;
      }

      const targetKey = options.targetKey ?? key;

      if (mergeStrategy === 'merge') {
        const existing = localStorage.getItem(targetKey);
        if (existing) {
          const existingData = JSON.parse(existing);
          const mergedData = mergeData(existingData, backupData);
          localStorage.setItem(targetKey, JSON.stringify(mergedData));
        } else {
          localStorage.setItem(targetKey, JSON.stringify(backupData));
        }
      } else {
        localStorage.setItem(targetKey, JSON.stringify(backupData));
      }

      result.keysRestored++;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push({ key, error });
    }
  }

  result.success = result.errors.length === 0;
  return result;
}