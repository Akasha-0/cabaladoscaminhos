/** @vitest-environment node */
/**
 * /api/webhooks/[id] route tests — D-049 (Wave 19.1).
 *
 * Cobre:
 *   - GET: 401, 200, 404 (IDOR)
 *   - PATCH: 200, 400 (validation), 404 (IDOR)
 *   - DELETE: 204, 404 (IDOR)
 *   - LGPD: userId filter em todas as operações
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockGetWebhook = vi.fn();
const mockUpdateWebhook = vi.fn();
const mockDeleteWebhook = vi.fn();

vi.mock('@/lib/application/webhooks/service', () => ({
  WebhookValidationError: class WebhookValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'WebhookValidationError';
    }
  },
  getWebhook: (...args: unknown[]) => mockGetWebhook(...args),
  updateWebhook: (...args: unknown[]) => mockUpdateWebhook(...args),
  deleteWebhook: (...args: unknown[]) => mockDeleteWebhook(...args),
}));

import { DELETE, GET, PATCH } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(method: 'GET' | 'PATCH' | 'DELETE', body?: unknown): NextRequest {
  const init: ConstructorParameters<typeof NextRequest>[1] = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return new NextRequest('http://localhost/api/webhooks/wh-1', init);
}

const ctx = { params: Promise.resolve({ id: 'wh-1' }) };
const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };
const fakeWebhook = {
  id: 'wh-1',
  url: 'https://example.com/hook',
  events: ['notification.created'],
  secretFingerprint: 'fp-123456',
  isActive: true,
  lastCalledAt: null,
  lastError: null,
  createdAt: '2026-06-25T00:00:00.000Z',
  updatedAt: '2026-06-25T00:00:00.000Z',
};

beforeEach(() => {
  mockGetWebhook.mockReset();
  mockUpdateWebhook.mockReset();
  mockDeleteWebhook.mockReset();
  mockRequireAkashaApi.mockReset();
  mockRequireAkashaApi.mockResolvedValue(fakeUser);
});

// ─── GET ─────────────────────────────────────────────────────────────
describe('GET /api/webhooks/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await GET(makeRequest('GET'), ctx);
    expect(res.status).toBe(401);
  });

  it('returns 200 with webhook (no secret)', async () => {
    mockGetWebhook.mockResolvedValueOnce(fakeWebhook);
    const res = await GET(makeRequest('GET'), ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.webhook.id).toBe('wh-1');
    expect(data.webhook).not.toHaveProperty('secret');
  });

  it('returns 404 when not found (IDOR-safe)', async () => {
    mockGetWebhook.mockResolvedValueOnce(null);
    const res = await GET(makeRequest('GET'), ctx);
    expect(res.status).toBe(404);
  });

  it('passes (userId, id) — LGPD filter', async () => {
    mockGetWebhook.mockResolvedValueOnce(fakeWebhook);
    await GET(makeRequest('GET'), ctx);
    expect(mockGetWebhook).toHaveBeenCalledWith('user-1', 'wh-1');
  });
});

// ─── PATCH ───────────────────────────────────────────────────────────
describe('PATCH /api/webhooks/[id]', () => {
  it('returns 200 with updated webhook', async () => {
    mockUpdateWebhook.mockResolvedValueOnce({ ...fakeWebhook, isActive: false });
    const res = await PATCH(makeRequest('PATCH', { isActive: false }), ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.webhook.isActive).toBe(false);
  });

  it('returns 404 when IDOR (updateWebhook returns null)', async () => {
    mockUpdateWebhook.mockResolvedValueOnce(null);
    const res = await PATCH(makeRequest('PATCH', { isActive: false }), ctx);
    expect(res.status).toBe(404);
  });

  it('returns 400 when body is empty', async () => {
    const res = await PATCH(makeRequest('PATCH', {}), ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is non-string', async () => {
    const res = await PATCH(makeRequest('PATCH', { url: 123 }), ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when events is non-array', async () => {
    const res = await PATCH(makeRequest('PATCH', { events: 'notification.created' }), ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when isActive is non-boolean', async () => {
    const res = await PATCH(makeRequest('PATCH', { isActive: 'yes' }), ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 on WebhookValidationError from service', async () => {
    const { WebhookValidationError } = await import('@/lib/application/webhooks/service');
    mockUpdateWebhook.mockRejectedValueOnce(new WebhookValidationError('URL inválida'));
    const res = await PATCH(makeRequest('PATCH', { url: 'http://bad.com' }), ctx);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('URL inválida');
  });

  it('returns 500 on unexpected error', async () => {
    mockUpdateWebhook.mockRejectedValueOnce(new Error('db down'));
    const res = await PATCH(makeRequest('PATCH', { isActive: false }), ctx);
    expect(res.status).toBe(500);
  });

  it('passes (userId, id, patch) — LGPD filter', async () => {
    mockUpdateWebhook.mockResolvedValueOnce(fakeWebhook);
    await PATCH(makeRequest('PATCH', { isActive: false }), ctx);
    expect(mockUpdateWebhook).toHaveBeenCalledWith('user-1', 'wh-1', { isActive: false });
  });
});

// ─── DELETE ──────────────────────────────────────────────────────────
describe('DELETE /api/webhooks/[id]', () => {
  it('returns 204 on success', async () => {
    mockDeleteWebhook.mockResolvedValueOnce(true);
    const res = await DELETE(makeRequest('DELETE'), ctx);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found (IDOR-safe)', async () => {
    mockDeleteWebhook.mockResolvedValueOnce(false);
    const res = await DELETE(makeRequest('DELETE'), ctx);
    expect(res.status).toBe(404);
  });

  it('passes (userId, id) — LGPD filter', async () => {
    mockDeleteWebhook.mockResolvedValueOnce(true);
    await DELETE(makeRequest('DELETE'), ctx);
    expect(mockDeleteWebhook).toHaveBeenCalledWith('user-1', 'wh-1');
  });
});
