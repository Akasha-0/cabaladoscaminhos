import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export function rateLimitMiddleware(
  identifier: string,
  windowMs: number = 60000,
  maxRequests: number = 10
) {
  const result = checkRateLimit(identifier, {
    windowMs,
    maxRequests
  });

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit excedido',
        retryAfter: Math.ceil(result.resetIn / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
          'X-RateLimit-Remaining': result.remaining.toString()
        }
      }
    );
  }

  return null;
}

export function extractIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userId = request.headers.get('x-user-id') || ip;
  return userId;
}