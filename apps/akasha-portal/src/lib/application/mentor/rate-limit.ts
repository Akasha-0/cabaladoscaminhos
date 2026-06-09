/**
 * Rate limiting for Mentor API using Redis
 */

import { getRedisClient } from '@/lib/infrastructure/redis';

const RATE_LIMIT = 10; // 10 msg/min
const WINDOW_SECONDS = 60;

export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  const redis = await getRedisClient();
  const key = `rate:mentor:${userId}`;

  try {
    // Increment counter
    const count = await redis.incr(key);
    
    // Set expiry on first request (count == 1)
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    return {
      allowed: count <= RATE_LIMIT,
      remaining: Math.max(0, RATE_LIMIT - count),
      resetIn: WINDOW_SECONDS,
    };
  } catch {
    // Fallback to allow on Redis errors
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetIn: WINDOW_SECONDS,
    };
  }
}

export function rateLimitErrorMessage(_resetIn: number): string {
  return `Você atingiu o limite de ${RATE_LIMIT} mensagens por minuto. Aguarde alguns segundos.`;
}
