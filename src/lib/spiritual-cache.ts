'use client';

/**
 * SpiritualDataCache - In-memory cache for spiritual data correlations
 * 
 * Reduces redundant calculations for expensive correlation lookups.
 */
export class SpiritualDataCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs = 60000) {
    this.ttl = ttlMs;
  }

  private generateKey(...args: any[]): string {
    return JSON.stringify(args);
  }

  get(...args: any[]): T | null {
    const key = this.generateKey(...args);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(data: T, ...args: any[]): void {
    const key = this.generateKey(...args);
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Pre-configured caches for different correlation types
export const sephirotOrixaCache = new SpiritualDataCache(300000); // 5 min
export const chakraSephirotCache = new SpiritualDataCache(300000); // 5 min
export const oduChakraCache = new SpiritualDataCache(300000); // 5 min
export const orixaChakraCache = new SpiritualDataCache(300000); // 5 min

/**
 * cachedCorrelation - Decorator-like function for caching correlation lookups
 */
export function cachedCorrelation<C>(cache: SpiritualDataCache<C>) {
  return function <T>(
    key: string,
    lookupFn: () => T
  ): T {
    const cached = cache.get(key);
    if (cached !== null) return cached as T;
    
    const result = lookupFn();
    cache.set(result, key);
    return result;
  };
}

/**
 * clearAllCaches - Utility to clear all spiritual caches
 */
export function clearAllCaches(): void {
  sephirotOrixaCache.clear();
  chakraSephirotCache.clear();
  oduChakraCache.clear();
  orixaChakraCache.clear();
}

/**
 * getCacheStats - Debug utility for cache performance
 */
export function getCacheStats(): Record<string, number> {
  return {
    sephirotOrixa: sephirotOrixaCache.size(),
    chakraSephirot: chakraSephirotCache.size(),
    oduChakra: oduChakraCache.size(),
    orixaChakra: orixaChakraCache.size(),
    total: sephirotOrixaCache.size() + chakraSephirotCache.size() + oduChakraCache.size() + orixaChakraCache.size(),
  };
}