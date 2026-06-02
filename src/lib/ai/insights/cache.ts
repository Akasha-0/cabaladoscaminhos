// fallow-ignore-file unused-file
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000;

export function getCacheKey(userId: string, data?: string): string {
  const dataAtual = data || new Date().toISOString().split('T')[0];
  return `insight:${userId}:${dataAtual}`;
}

export function getFromCache<T>(userId: string, data?: string): T | null {
  const key = getCacheKey(userId, data);
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCache<T>(userId: string, data: T, ttlMs?: number): void {
  const key = getCacheKey(userId);
  const ttl = ttlMs || DEFAULT_TTL_MS;

  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

export function clearCache(userId?: string): void {
  if (!userId) {
    cache.clear();
    return;
  }

  const pattern = `insight:${userId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}
