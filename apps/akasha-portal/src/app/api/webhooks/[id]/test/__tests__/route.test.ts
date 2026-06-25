/** @vitest-environment node */
/**
 * /api/webhooks/[id]/test route tests — D-049 (Wave 19.1).
 *
 * Cobre:
 *   - 401 quando não autenticado
 *   - 404 quando webhook não existe OU não pertence ao user
 *   - 400 quando isActive=false
 *   - 200 ok=true quando receiver responde 2xx
 *   - 200 ok=false quando receiver retorna 5xx
 *   - LGPD: filtra por (id, userId) antes de qualquer fetch
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockFindFirst = vi.fn();
const mockDispatchTestEvent = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    webhook: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

vi.mock('@/lib/application/webhooks/dispatcher', () => ({
  dispatchTestEvent: (...args: unknown[]) => mockDispatchTestEvent(...args),
}));

import { POST } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/wh-1/test', { method: 'POST' });
}

const ctx = { params: Promise.resolve({ id: 'wh-1' }) };
const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };
const fakeWebhookRow = {
  id: 'wh-1',
  url: 'https://example.com/hook',
  secret: 'a'.repeat(64),
  isActive: true,
};

beforeEach(() => {
  mockFindFirst.mockReset();
  mockDispatchTestEvent.mockReset();
  mockRequireAkashaApi.mockReset();
  mockRequireAkashaApi.mockResolvedValue(fakeUser);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Auth ────────────────────────────────────────────────────────────
describe('POST /api/webhooks/[id]/test — auth', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(401);
  });
});

// ─── Lookup ──────────────────────────────────────────────────────────
describe('POST /api/webhooks/[id]/test — lookup', () => {
  it('returns 404 when webhook not found', async () => {
    mockFindFirst.mockResolvedValueOnce(null as never);
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(404);
  });

  it('passes (id, userId) to findFirst — LGPD filter', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeWebhookRow as never);
    mockDispatchTestEvent.mockResolvedValueOnce({ ok: true });
    await POST(makeRequest(), ctx);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wh-1', userId: 'user-1' },
      })
    );
  });
});

// ─── Inactive ────────────────────────────────────────────────────────
describe('POST /api/webhooks/[id]/test — inactive', () => {
  it('returns 400 when isActive=false', async () => {
    mockFindFirst.mockResolvedValueOnce({ ...fakeWebhookRow, isActive: false } as never);
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('webhook_inactive');
  });
});

// ─── Dispatch ────────────────────────────────────────────────────────
describe('POST /api/webhooks/[id]/test — dispatch', () => {
  it('returns 200 ok=true on 2xx receiver', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeWebhookRow as never);
    mockDispatchTestEvent.mockResolvedValueOnce({ ok: true, status: 200 });
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.status).toBe(200);
  });

  it('returns 200 ok=false on 5xx receiver', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeWebhookRow as never);
    mockDispatchTestEvent.mockResolvedValueOnce({ ok: false, status: 500, error: 'HTTP 500' });
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.status).toBe(500);
    expect(data.error).toBe('HTTP 500');
  });

  it('returns 200 ok=false on timeout', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeWebhookRow as never);
    mockDispatchTestEvent.mockResolvedValueOnce({ ok: false, error: 'timeout' });
    const res = await POST(makeRequest(), ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe('timeout');
  });

  it('passes (userId, id, url, secret) to dispatchTestEvent', async () => {
    mockFindFirst.mockResolvedValueOnce(fakeWebhookRow as never);
    mockDispatchTestEvent.mockResolvedValueOnce({ ok: true });
    await POST(makeRequest(), ctx);
    expect(mockDispatchTestEvent).toHaveBeenCalledWith(
      'user-1',
      'wh-1',
      'https://example.com/hook',
      'a'.repeat(64)
    );
  });
});
