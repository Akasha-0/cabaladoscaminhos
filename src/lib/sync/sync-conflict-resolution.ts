// fallow-ignore-file unused-file
// Sync conflict resolution - skipped linting and formatting

export type ConflictStrategy = 'local-wins' | 'remote-wins' | 'latest-wins' | 'merge';

export interface SyncConflict<T> {
  local: T;
  remote: T;
  localTimestamp: number;
  remoteTimestamp: number;
}

export interface ConflictResolution<T> {
  resolved: T;
  strategy: ConflictStrategy;
  resolvedAt: number;
}

/**
 * Resolves a sync conflict using the specified strategy.
 *
 * @param conflict - The conflicting local and remote data with timestamps
 * @param strategy - Resolution strategy to apply
 * @returns The resolved data with strategy metadata
 */
export function resolveConflict<T>(
  conflict: SyncConflict<T>,
  strategy: ConflictStrategy
): ConflictResolution<T> {
  const now = Date.now();

  switch (strategy) {
    case 'local-wins':
      return {
        resolved: conflict.local,
        strategy,
        resolvedAt: now,
      };

    case 'remote-wins':
      return {
        resolved: conflict.remote,
        strategy,
        resolvedAt: now,
      };

    case 'latest-wins':
      return {
        resolved:
          conflict.localTimestamp >= conflict.remoteTimestamp
            ? conflict.local
            : conflict.remote,
        strategy,
        resolvedAt: now,
      };

    case 'merge':
      return {
        resolved: mergeValues(conflict.local, conflict.remote),
        strategy,
        resolvedAt: now,
      };
  }
}

/**
 * Deep merges two values, preferring non-null/undefined remote values.
 */
// fallow-ignore-next-line complexity
function mergeValues<T>(local: T, remote: T): T {
  if (local === null || local === undefined) return remote;
  if (remote === null || remote === undefined) return local;

  if (isPlainObject(local) && isPlainObject(remote)) {
    const merged: Record<string, unknown> = { ...local };
    for (const key in remote) {
      if (Object.prototype.hasOwnProperty.call(remote, key)) {
        merged[key] = mergeValues(
          (local as Record<string, unknown>)[key],
          (remote as Record<string, unknown>)[key]
        );
      }
    }
    return merged as unknown as T;
  }

  if (Array.isArray(local) && Array.isArray(remote)) {
    return [...new Set([...local, ...remote])] as unknown as T;
  }

  return remote;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Detects if two values have a conflict.
 */
export function hasConflict<T>(local: T, remote: T): boolean {
  if (typeof local !== typeof remote) return true;
  if (typeof local !== 'object' || local === null) {
    return local !== remote;
  }
  if (Array.isArray(local) !== Array.isArray(remote)) return true;
  return JSON.stringify(local) !== JSON.stringify(remote);
}

/**
 * Applies auto-resolution based on timestamps when strategy not specified.
 */
export function autoResolve<T>(conflict: SyncConflict<T>): ConflictResolution<T> {
  return resolveConflict(conflict, 'latest-wins');
}
