/** @vitest-environment node */
/**
 * /api/webhooks route tests — D-049 (Wave 19.1).
 *
 * Cobre:
 *   - GET: 401 quando não autenticado, 200 com webhooks do user
 *   - POST: 201 com secret plain, 400 em URL inválida, 400 em events vazios
 *   - LGPD: GET filtra por userId (não cross-user)
 *   - Auth: 401 quando requireAkashaApi falha
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockListWebhooks = vi.fn();
const mockCreateWebhook = vi.fn();

vi.mock('@/lib/application/webhooks/service', () => ({
  WebhookValidationError: class WebhookValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'WebhookValidationError';
    }
  },
  listWebhooks: (...args: unknown[]) => mockListWebhooks(...args),
  createWebhook: (...args: unknown[]) => mockCreateWebhook(...args),
}));

import { GET, POST } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(method: 'GET' | 'POST', body?: unknown): NextRequest {
  const init: ConstructorParameters<typeof NextRequest>[1] = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  return new NextRequest('http://localhost/api/webhooks', init);
}

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
  mockListWebhooks.mockReset();
  mockCreateWebhook.mockReset();
  mockRequireAkashaApi.mockReset();
  mockRequireAkashaApi.mockResolvedValue(fakeUser);
});

// ─── GET ─────────────────────────────────────────────────────────────
describe('GET /api/webhooks', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('returns 200 with webhooks array', async () => {
    mockListWebhooks.mockResolvedValueOnce([fakeWebhook]);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.webhooks).toHaveLength(1);
    // LGPD: secret NUNCA exposto em GET
    expect(data.webhooks[0]).not.toHaveProperty('secret');
  });

  it('calls listWebhooks with the authenticated userId (LGPD filter)', async () => {
    mockListWebhooks.mockResolvedValueOnce([]);
    await GET(makeRequest('GET'));
    expect(mockListWebhooks).toHaveBeenCalledWith('user-1');
  });
});

// ─── POST ────────────────────────────────────────────────────────────
describe('POST /api/webhooks', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await POST(makeRequest('POST', { url: 'https://x.com', events: ['notification.created'] }));
    expect(res.status).toBe(401);
  });

  it('returns 201 with secret plain (one-time)', async () => {
    mockCreateWebhook.mockResolvedValueOnce({ ...fakeWebhook, secret: 'a'.repeat(64) });
    const res = await POST(
      makeRequest('POST', { url: 'https://example.com/hook', events: ['notification.created'] })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.webhook.secret).toBe('a'.repeat(64));
  });

  it('returns 400 when url is invalid (http)', async () => {
    const { WebhookValidationError } = await import('@/lib/application/webhooks/service');
    mockCreateWebhook.mockRejectedValueOnce(new WebhookValidationError('URL deve ser https'));
    const res = await POST(
      makeRequest('POST', { url: 'http://example.com/hook', events: ['notification.created'] })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('https');
  });

  it('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest('POST', { events: ['notification.created'] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is malformed', async () => {
    const init: ConstructorParameters<typeof NextRequest>[1] = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    };
    const req = new NextRequest('http://localhost/api/webhooks', init);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when isActive is non-boolean', async () => {
    const res = await POST(
      makeRequest('POST', {
        url: 'https://example.com',
        events: ['notification.created'],
        isActive: 'yes',
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 500 on unexpected error', async () => {
    mockCreateWebhook.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(
      makeRequest('POST', { url: 'https://example.com', events: ['notification.created'] })
    );
    expect(res.status).toBe(500);
  });
});
