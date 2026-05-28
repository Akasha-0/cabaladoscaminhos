// In-memory cache with TTL support

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

function isExpired(entry: CacheEntry<unknown>): boolean {
  return Date.now() > entry.expiresAt;
}

export const cache = {
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  get<T>(key: string): T | undefined {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (isExpired(entry)) {
      store.delete(key);
      return undefined;
    }
    return entry.data;
  },

  delete(key: string): boolean {
    return store.delete(key);
  },

  clear(): void {
    store.clear();
  },

  keys(): string[] {
    return Array.from(store.keys());
  },
};

export function getCached<T>(key: string, ttlMs?: number, fetchFn?: () => T | Promise<T>): T | undefined | Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) return cached;

  if (fetchFn) {
    const result = fetchFn();
    if (result instanceof Promise) {
      return result.then((data) => {
        cache.set(key, data, ttlMs ?? 5 * 60 * 1000);
        return data;
      });
    } else {
      cache.set(key, result, ttlMs ?? 5 * 60 * 1000);
      return result;
    }
  }

  return undefined;
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}