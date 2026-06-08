/**
 * Liveness Endpoint Tests (AD-22.8)
 *
 * Testa o endpoint de liveness que verifica se o processo está vivo.
 * NÃO testa dependências (DB, Redis) - apenas se o processo responde.
 */

import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GET /api/health/live', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const healthModule = await import('@/app/api/health/live/route');
    GET = healthModule.GET;
  });

  describe('Liveness check', () => {
    it('returns 200 with ok status', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      expect(response.status).toBe(200);
    });

    it('response has status ok', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('ok');
    });

    it('response has timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      const body = await response.json() as Record<string, unknown>;
      expect(body).toHaveProperty('timestamp');
      expect(typeof body.timestamp).toBe('string');

      // Should be valid ISO date
      expect(new Date(body.timestamp as string).toISOString()).toBe(body.timestamp);
    });

    it('response has uptime', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      const body = await response.json() as Record<string, unknown>;
      expect(body).toHaveProperty('uptime');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('does NOT include db or redis checks', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      const body = await response.json() as Record<string, unknown>;
      expect(body).not.toHaveProperty('checks');
      expect(body).not.toHaveProperty('db');
      expect(body).not.toHaveProperty('redis');
    });

    it('does NOT require db or redis to be healthy', async () => {
      // No mocks needed - liveness should not check any dependencies
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('ok');
    });

    it('response does NOT include sensitive information', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      const body = await response.json() as Record<string, unknown>;
      const bodyStr = JSON.stringify(body);

      expect(bodyStr).not.toContain('stack');
      expect(bodyStr).not.toContain('stackTrace');
      expect(bodyStr).not.toContain('/Users/');
      expect(bodyStr).not.toContain('/home/');
      expect(bodyStr).not.toContain('node_modules');
      expect(bodyStr).not.toContain('.env');
    });

    it('is accessible without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/live');
      const response = await GET();

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });
});
