import { getRedisClient, resetMemoryStore } from '@/lib/infrastructure/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  resetAt: Date;
  limit: number;
}

interface MemoryRateLimitEntry {
  count: number;
  resetTime: number;
}

export const API_RATE_LIMIT_KEY_PREFIX = 'rate:api';
export const MENTOR_RATE_LIMIT_KEY_PREFIX = 'rate:mentor';

export const API_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};

export const MENTOR_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 10,
};

const memoryStore = new Map<string, MemoryRateLimitEntry>();

function buildResult(
  allowed: boolean,
  count: number,
  resetIn: number,
  config: RateLimitConfig
): RateLimitResult {
  const normalizedResetIn = Math.max(0, resetIn);

  return {
    allowed,
    remaining: allowed ? Math.max(0, config.maxRequests - count) : 0,
    resetIn: normalizedResetIn,
    resetAt: new Date(Date.now() + normalizedResetIn),
    limit: config.maxRequests,
  };
}

export function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return buildResult(true, 1, config.windowMs, config);
  }

  if (entry.count >= config.maxRequests) {
    return buildResult(false, entry.count, entry.resetTime - now, config);
  }

  entry.count += 1;
  return buildResult(true, entry.count, entry.resetTime - now, config);
}

export async function checkRedisRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const config: RateLimitConfig = {
    windowMs: windowSeconds * 1000,
    maxRequests,
  };

  try {
    const redis = await getRedisClient();
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttlSeconds = count === 1 ? windowSeconds : await redis.ttl(key);
    const resetIn = ttlSeconds > 0 ? ttlSeconds * 1000 : config.windowMs;

    return buildResult(count <= maxRequests, count, resetIn, config);
  } catch {
    return checkMemoryRateLimit(key, config);
  }
}

export function formatMentorRateLimitError(): string {
  return 'Você atingiu o limite de 10 mensagens por minuto. Aguarde alguns segundos.';
}

export function resetRateLimitState(): void {
  memoryStore.clear();
  resetMemoryStore();
}

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

cleanupInterval.unref?.();
