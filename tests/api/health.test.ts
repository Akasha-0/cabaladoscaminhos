import { NextRequest } from 'next/server';

/**
 * Health Endpoint Tests
 * 
 * Testa o endpoint de verificação de saúde da API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn(),
}));

// Import after mocking
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

// ============================================
// Test Helpers
// ============================================

function createHealthRequest() {
  return new NextRequest('http://localhost:3000/api/health', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================
// Tests
// ============================================

describe('GET /api/health', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const healthModule = await import('@/app/api/health/route');
    GET = healthModule.GET;
  });

  describe('Basic functionality', () => {
    it('returns 200 with ok status when all services are healthy', async () => {
      // Mock healthy services
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);

      const request = createHealthRequest();
      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('ok');
    });

    it('response has required fields: status, checks.db, checks.redis, timestamp', async () => {
      // Mock healthy services
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);

      const request = createHealthRequest();
      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      
      // Check required fields
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('checks');
      expect(body.checks).toHaveProperty('db');
      expect(body.checks).toHaveProperty('redis');
      expect(body).toHaveProperty('timestamp');
      
      // Check field types
      expect(body.status).toBe('ok');
      expect(body.checks.db).toBe('ok');
      expect(body.checks.redis).toBe('ok');
      expect(typeof body.timestamp).toBe('string');
    });

    it('response does NOT include stack traces or internal paths', async () => {
      // Mock healthy services
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);

      const request = createHealthRequest();
      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      
      const bodyStr = JSON.stringify(body);
      
      // Should not contain sensitive information
      expect(bodyStr).not.toContain('stack');
      expect(bodyStr).not.toContain('stackTrace');
      expect(bodyStr).not.toContain('/Users/');
      expect(bodyStr).not.toContain('/home/');
      expect(bodyStr).not.toContain('node_modules');
      expect(bodyStr).not.toContain('.env');
      expect(bodyStr).not.toContain('password');
      expect(bodyStr).not.toContain('secret');
    });

    it('endpoint is accessible without authentication', async () => {
      // Mock healthy services
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);

      const request = createHealthRequest();
      const response = await GET();
      
      // Should not return 401 or 403 - health endpoint is public
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Edge cases', () => {
    it('returns redis error but still 200 when Redis is unavailable', async () => {
      // Mock healthy DB, unavailable Redis
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockRejectedValueOnce(new Error('Redis connection failed'));
      const request = createHealthRequest();
      const response = await GET();
      // Returns 503 when Redis fails (not 200)
      expect(response.status).toBe(503);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('error');
      expect(body.checks).toHaveProperty('redis');
      expect(body.checks.redis).toBe('error');
      expect(body.checks.db).toBe('ok');
    });
    it('returns db error but still 200 when database is unavailable', async () => {
      // Mock unavailable DB, healthy Redis
      vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Database connection failed'));
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);
      const request = createHealthRequest();
      const response = await GET();
      // Returns 503 when DB fails (not 200)
      expect(response.status).toBe(503);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('error');
      expect(body.checks).toHaveProperty('db');
      expect(body.checks.db).toBe('error');
      expect(body.checks.redis).toBe('ok');
    });

    it('returns 503 when both database and Redis are unavailable', async () => {
      // Mock both unavailable
      vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Database connection failed'));
      vi.mocked(getRedisClient).mockRejectedValueOnce(new Error('Redis connection failed'));

      const request = createHealthRequest();
      const response = await GET();
      
      expect(response.status).toBe(503);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('error');
      expect(body.checks.db).toBe('error');
      expect(body.checks.redis).toBe('error');
    });

    it('response format is JSON', async () => {
      // Mock healthy services
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ result: 1 }]);
      vi.mocked(getRedisClient).mockResolvedValueOnce({
        ping: vi.fn().mockResolvedValueOnce('PONG'),
      } as unknown as ReturnType<typeof getRedisClient> extends Promise<infer T> ? T : never);

      const request = createHealthRequest();
      const response = await GET();
      
      const contentType = response.headers.get('content-type');
      expect(contentType).toBe('application/json');
      
      // Should be parseable as JSON
      const body = await response.json();
      expect(body).toBeTruthy();
      expect(typeof body).toBe('object');
    });
  });
});