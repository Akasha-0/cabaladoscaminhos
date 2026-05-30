/**
 * Rate Limiting Middleware Tests
 * 
 * Testa a lógica de rate limiting do middleware.
 * Rate limit: 100 requests per minute per IP
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// Configuration (matches middleware.ts)
// ============================================

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
};

const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];

// ============================================
// Simulated Rate Limit Store (matches lib/rate-limit.ts behavior)
// ============================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function resetRateLimitStore() {
  rateLimitStore.clear();
}

function checkRateLimitSimulated(
  identifier: string,
  config: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  };
}

// ============================================
// Simulated Middleware Logic
// ============================================

interface MockResponse extends NextResponse {
  _body?: object;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  skipped?: boolean;
  reason?: string;
}

function simulateRateLimitMiddleware(
  pathname: string,
  clientIp: string = '127.0.0.1'
): { response: MockResponse | null; rateLimitInfo: RateLimitResult } {
  const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];
  
  // Skip rate limiting for excluded paths
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return {
      response: null,
      rateLimitInfo: { skipped: true, reason: 'excluded_path', allowed: true, remaining: 100, resetIn: 60000 }
    };
  }

  // Get identifier from request
  const forwardedFor = clientIp;
  const identifier = forwardedFor || 'unknown';

  // Check rate limit
  const result = checkRateLimitSimulated(identifier, RATE_LIMIT_CONFIG);

  if (!result.allowed) {
    const errorBody = {
      error: 'Rate limit excedido',
      retryAfter: Math.ceil(result.resetIn / 1000)
    };
    const response = NextResponse.json(errorBody, {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil((Date.now() + result.resetIn) / 1000).toString()
      }
    }) as MockResponse;
    response._body = errorBody;
    return { response, rateLimitInfo: { ...result, skipped: false, reason: undefined } };
  }

  // Create response with rate limit headers
  const response = NextResponse.next() as MockResponse;
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil((Date.now() + result.resetIn) / 1000).toString());

  return { response, rateLimitInfo: { ...result, skipped: false, reason: undefined } };
}

// ============================================
// Tests
// ============================================

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  describe('Requests within limit', () => {
    it('should allow requests when under the rate limit', () => {
      const { response, rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(rateLimitInfo.allowed).toBe(true);
      expect(rateLimitInfo.remaining).toBe(99);
    });

    it('should allow multiple sequential requests within limit', () => {
      for (let i = 0; i < 50; i++) {
        const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
        expect(rateLimitInfo.allowed).toBe(true);
      }
      
      const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      expect(rateLimitInfo.remaining).toBe(49);
    });

    it('should include X-RateLimit headers in successful responses', () => {
      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response).toBeDefined();
      expect(response!.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response!.headers.get('X-RateLimit-Remaining')).toBe('99');
      expect(response!.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Requests exceeding limit', () => {
    it('should return 429 when 101st request is made in a minute', () => {
      // Make 100 requests (the limit)
      for (let i = 0; i < 100; i++) {
        const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
        if (i < 99) {
          expect(rateLimitInfo.allowed).toBe(true);
        }
      }

      // The 101st request should be blocked
      const { response, rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(rateLimitInfo.allowed).toBe(false);
      expect(response).toBeDefined();
      expect(response!.status).toBe(429);
      expect(response!.headers.get('Retry-After')).toBeDefined();
    });

    it('should include correct error message in 429 response', () => {
      // Exhaust the rate limit
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.status).toBe(429);
      
      // Check JSON body
      const body = response!._body as { error: string };
      expect(body.error).toBe('Rate limit excedido');
    });

    it('should show remaining as 0 when limit is exhausted', () => {
      // Exhaust the rate limit
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('Different IPs are isolated', () => {
    it('should not affect other IPs when one IP hits the limit', () => {
      // Exhaust limit for IP1
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // IP2 should still be able to make requests
      const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.2');
      
      expect(rateLimitInfo.allowed).toBe(true);
      expect(rateLimitInfo.remaining).toBe(99);
    });

    it('should track rate limits independently for each IP', () => {
      // Make some requests from IP1
      for (let i = 0; i < 50; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // Make some requests from IP2
      for (let i = 0; i < 30; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.2');
      }

      // IP1 should have 50 remaining
      let { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      expect(rateLimitInfo.remaining).toBe(49);

      // IP2 should have 70 remaining
      ({ rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.2'));
      expect(rateLimitInfo.remaining).toBe(69);
    });

    it('should allow different IPs to each reach their own limit', () => {
      // Exhaust IP1
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // Exhaust IP2
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.2');
      }

      // IP1 should be blocked
      const { response: response1 } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      expect(response1!.status).toBe(429);

      // IP2 should be blocked
      const { response: response2 } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.2');
      expect(response2!.status).toBe(429);
    });
  });

  describe('Rate limit window reset', () => {
    it('should allow requests after the window expires', () => {
      // Make some requests
      for (let i = 0; i < 50; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // Fast-forward time by mocking Date.now
      const originalDateNow = Date.now;
      const fakeNow = originalDateNow() + 60000; // 60 seconds later
      
      Date.now = vi.fn(() => fakeNow);

      // Should have fresh rate limit window
      const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(rateLimitInfo.allowed).toBe(true);
      expect(rateLimitInfo.remaining).toBe(99);

      // Restore
      Date.now = originalDateNow;
    });

    it('should reset remaining count after window expires', () => {
      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // Verify blocked
      let { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      expect(rateLimitInfo.allowed).toBe(false);

      // Fast-forward time
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + 60000);

      // Should be allowed again
      ({ rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1'));
      expect(rateLimitInfo.allowed).toBe(true);
      expect(rateLimitInfo.remaining).toBe(99);

      Date.now = originalDateNow;
    });
  });

  describe('Excluded paths', () => {
    it('should exclude /api/health from rate limiting', () => {
      const { response, rateLimitInfo } = simulateRateLimitMiddleware('/api/health');
      
      expect(rateLimitInfo.skipped).toBe(true);
      expect(rateLimitInfo.reason).toBe('excluded_path');
      expect(response).toBeNull();
    });

    it('should allow unlimited requests to /api/health', () => {
      // Make many requests to excluded path
      for (let i = 0; i < 500; i++) {
        const { rateLimitInfo } = simulateRateLimitMiddleware('/api/health', '192.168.1.1');
        expect(rateLimitInfo.skipped).toBe(true);
      }
    });

    it('should exclude /_next paths from rate limiting', () => {
      const { response, rateLimitInfo } = simulateRateLimitMiddleware('/_next/static/test.js');
      
      expect(rateLimitInfo.skipped).toBe(true);
      expect(response).toBeNull();
    });

    it('should exclude /favicon.ico from rate limiting', () => {
      const { response, rateLimitInfo } = simulateRateLimitMiddleware('/favicon.ico');
      
      expect(rateLimitInfo.skipped).toBe(true);
      expect(response).toBeNull();
    });

    it('should still apply rate limiting to other /api routes', () => {
      // These should NOT be excluded
      const paths = ['/api/mapa', '/api/oraculo', '/api/creditos'];
      
      for (const path of paths) {
        const { rateLimitInfo } = simulateRateLimitMiddleware(path);
        expect(rateLimitInfo.allowed).toBe(true);
        expect(rateLimitInfo.skipped || false).toBe(false);
      }
    });
  });

  describe('Rate limit headers', () => {
    it('should include X-RateLimit-Limit header', () => {
      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.headers.get('X-RateLimit-Limit')).toBe('100');
    });

    it('should include X-RateLimit-Remaining header', () => {
      // Make 10 requests to deplete by 10
      for (let i = 0; i < 10; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.headers.get('X-RateLimit-Remaining')).toBe('89');
    });

    it('should include X-RateLimit-Reset header', () => {
      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      const resetHeader = response!.headers.get('X-RateLimit-Reset');
      expect(resetHeader).toBeDefined();
      expect(Number(resetHeader)).toBeGreaterThan(0);
    });

    it('should include Retry-After header in 429 responses', () => {
      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.status).toBe(429);
      expect(response!.headers.get('Retry-After')).toBeDefined();
      expect(Number(response!.headers.get('Retry-After'))).toBeGreaterThan(0);
    });

    it('should include all X-RateLimit headers in 429 response', () => {
      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      const { response } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(response!.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response!.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response!.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Concurrent requests simulation', () => {
    it('should handle rapid sequential requests correctly', () => {
      const results: Array<{ allowed: boolean; remaining: number }> = [];
      
      // Simulate rapid requests
      for (let i = 0; i < 110; i++) {
        const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
        results.push(rateLimitInfo as { allowed: boolean; remaining: number });
      }

      // First 100 should be allowed
      for (let i = 0; i < 100; i++) {
        expect(results[i].allowed).toBe(true);
      }

      // Last 10 should be blocked
      for (let i = 100; i < 110; i++) {
        expect(results[i].allowed).toBe(false);
      }
    });

    it('should handle multiple concurrent IP streams', () => {
      const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];
      const results = ips.map(() => [] as Array<{ allowed: boolean }>);

      // Make 50 requests per IP
      for (let round = 0; round < 50; round++) {
        for (let ipIndex = 0; ipIndex < ips.length; ipIndex++) {
          const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', ips[ipIndex]);
          results[ipIndex].push(rateLimitInfo as { allowed: boolean });
        }
      }

      // All should be allowed (not at limit)
      for (const ipResults of results) {
        for (const result of ipResults) {
          expect(result.allowed).toBe(true);
        }
      }
    });

    it('should track remaining correctly under load', () => {
      // Make 75 requests
      for (let i = 0; i < 75; i++) {
        simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      }

      // Next request should show 24 remaining (100 - 76 = 24)
      const { rateLimitInfo } = simulateRateLimitMiddleware('/api/mapa', '192.168.1.1');
      
      expect(rateLimitInfo.allowed).toBe(true);
      expect(rateLimitInfo.remaining).toBe(24);
    });
  });
});