import type { NextRequest } from 'next/server';
import {
  API_RATE_LIMIT_CONFIG,
  API_RATE_LIMIT_KEY_PREFIX,
  checkMemoryRateLimit,
  type RateLimitResult,
} from '@/lib/infrastructure/rate-limit';

export function extractIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const userId = request.headers.get('x-user-id') || ip;
  return userId;
}

export function checkApiRateLimit(request: NextRequest): RateLimitResult {
  const identifier = extractIdentifier(request);
  return checkMemoryRateLimit(`${API_RATE_LIMIT_KEY_PREFIX}:${identifier}`, API_RATE_LIMIT_CONFIG);
}
