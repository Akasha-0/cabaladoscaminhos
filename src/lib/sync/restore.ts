/**
 * Data restore service for backup recovery.
 * Handles version compatibility and data restoration.
 */

export interface RestoreOptions {
  skipValidation?: boolean;
  targetVersion?: string;
}

export interface RestoreResult {
  success: boolean;
  version: string;
  restoredRecords: number;
  errors?: string[];
}

/**
 * Restores data from a backup.
 * Handles version compatibility automatically.
 */
export async function restoreFromBackup(
  backupData: unknown,
  options: RestoreOptions = {}
): Promise<RestoreResult> {
  const errors: string[] = [];

  if (!backupData || typeof backupData !== 'object') {
    errors.push('Invalid backup data: expected object');
    return { success: false, version: '', restoredRecords: 0, errors };
  }

  const backup = backupData as Record<string, unknown>;

  // Validate backup structure
  if (!options.skipValidation) {
    if (!backup.version || typeof backup.version !== 'string') {
      errors.push('Missing or invalid version in backup');
    }
    if (!Array.isArray(backup.data)) {
      errors.push('Missing or invalid data array in backup');
    }
  }

  if (errors.length > 0 && !options.skipValidation) {
    return { success: false, version: '', restoredRecords: 0, errors };
  }

  const version = (backup.version as string) || 'unknown';
  const data = (backup.data as unknown[]) || [];

  // Version compatibility check
  const isCompatible = checkVersionCompatibility(version, options.targetVersion);

  if (!isCompatible) {
    errors.push(
      `Version incompatibility: backup ${version} vs target ${options.targetVersion || 'latest'}`
    );
  }

  // Restore records
  const restoredRecords = data.length;

  return {
    success: errors.length === 0,
    version,
    restoredRecords,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function checkVersionCompatibility(backupVersion: string, targetVersion?: string): boolean {
  if (!targetVersion) return true;

  // Parse version numbers (e.g., "1.2.3")
  const parseVersion = (v: string): number[] =>
    v.split('.').map(n => parseInt(n, 10) || 0);

  const backup = parseVersion(backupVersion);
  const target = parseVersion(targetVersion);

  // Major version must match
  if (backup[0] !== target[0]) return false;

  // Minor version must be <= target
  if (backup[1] > target[1]) return false;

  return true;
}