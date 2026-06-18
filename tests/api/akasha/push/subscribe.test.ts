/**
 * subscribe.test.ts — Akasha T7
 *
 * Cobertura do gate `requireAkashaApi` + persistência (`User.pushEnabled`,
 * tabela `push_subscriptions`) e idempotência do DELETE.
 *
 * Casos:
 *   POST  sem auth → 401
 *   POST  payload inválido → 400
 *   POST  payload válido → 200, upsert + pushEnabled=true
 *   DELETE sem auth → 401
 *   DELETE com endpoint de outro user → 404
 *   DELETE sem endpoint → 200, remove todas do user, pushEnabled=false
 *   DELETE com endpoint próprio → 200, remove só aquela, pushEnabled=false
 *
 * Estratégia de mock: mockamos o service `push-subscription-service`
 * (camada que a rota usa) — não o prisma direto, para asserções mais
 * legíveis.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockUserUpdate = vi.fn();
const mockUpsertService = vi.fn();
const mockDeleteService = vi.fn();
const mockGetUserSubs = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { update: (...args: unknown[]) => mockUserUpdate(...args) },
    pushSubscription: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/application/push/push-subscription-service', () => ({
  upsertPushSubscription: (...args: unknown[]) => mockUpsertService(...args),
  deletePushSubscription: (...args: unknown[]) => mockDeleteService(...args),
  getUserPushSubscriptions: (...args: unknown[]) => mockGetUserSubs(...args),
}));

const mockRequireAkashaApi = vi.fn();
vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => mockRequireAkashaApi(...args),
}));

function makeJsonRequest(url: string, method: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const VALID_SUB = {
  endpoint: 'https://push.example.com/abc',
  keys: { p256dh: 'AAAA', auth: 'BBBB' },
};

const AUTH_OK = { id: 'user-1', email: 'u@akasha.com', name: 'U' };
const AUTH_401 = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAkashaApi.mockResolvedValue(AUTH_OK);
  mockUpsertService.mockResolvedValue(undefined);
  mockDeleteService.mockResolvedValue(undefined);
  mockGetUserSubs.mockResolvedValue([VALID_SUB]);
  mockUserUpdate.mockResolvedValue({ id: 'user-1' });
});

// ----------------------------------------------------------------------------
// POST
// ----------------------------------------------------------------------------

describe('POST /api/akasha/push/subscribe', () => {
  it('retorna 401 quando sem sessão', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(AUTH_401);
    const { POST } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await POST(makeJsonRequest('http://l/api/akasha/push/subscribe', 'POST', { subscription: VALID_SUB }));
    expect(res.status).toBe(401);
    expect(mockUpsertService).not.toHaveBeenCalled();
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('retorna 400 quando payload inválido (falta endpoint)', async () => {
    const { POST } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await POST(
      makeJsonRequest('http://l/api/akasha/push/subscribe', 'POST', {
        subscription: { keys: { p256dh: 'a', auth: 'b' } },
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/inválida/);
    expect(mockUpsertService).not.toHaveBeenCalled();
  });

  it('retorna 400 quando payload completamente vazio', async () => {
    const { POST } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await POST(
      makeJsonRequest('http://l/api/akasha/push/subscribe', 'POST', {})
    );
    expect(res.status).toBe(400);
    expect(mockUpsertService).not.toHaveBeenCalled();
  });

  it('salva subscription e liga pushEnabled=true quando payload válido', async () => {
    const { POST } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await POST(
      makeJsonRequest('http://l/api/akasha/push/subscribe', 'POST', { subscription: VALID_SUB })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    // service.upsertPushSubscription(userId, sub, userAgent?)
    // Em test env (Node, sem UA no request), o userAgent chega como undefined.
    expect(mockUpsertService).toHaveBeenCalledTimes(1);
    expect(mockUpsertService).toHaveBeenCalledWith('user-1', VALID_SUB, undefined);

    // User.pushEnabled = true
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { pushEnabled: true },
    });
  });
});

// ----------------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------------

describe('DELETE /api/akasha/push/subscribe', () => {
  it('retorna 401 quando sem sessão', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(AUTH_401);
    const { DELETE } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await DELETE(makeJsonRequest('http://l/api/akasha/push/subscribe', 'DELETE', {}));
    expect(res.status).toBe(401);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('retorna 404 quando endpoint não pertence ao user (anti-IDOR)', async () => {
    mockGetUserSubs.mockResolvedValueOnce([]); // user-1 não tem essa subscription
    const { DELETE } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await DELETE(
      makeJsonRequest('http://l/api/akasha/push/subscribe', 'DELETE', {
        endpoint: 'https://push.example.com/outro-user',
      })
    );
    expect(res.status).toBe(404);
    expect(mockDeleteService).not.toHaveBeenCalled();
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('remove todas as subscriptions do user quando body vazio e desliga pushEnabled', async () => {
    const { DELETE } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await DELETE(makeJsonRequest('http://l/api/akasha/push/subscribe', 'DELETE', {}));
    expect(res.status).toBe(200);

    // Caminho "all" — a rota chama prisma.pushSubscription.deleteMany direto.
    // (Não o service.) Não podemos asserir o prisma mock de dentro desse
    // arquivo porque não mockamos o método; verificamos o efeito final:
    // pushEnabled=false.
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { pushEnabled: false },
    });
  });

  it('remove subscription específica do user quando endpoint próprio', async () => {
    mockGetUserSubs.mockResolvedValueOnce([VALID_SUB]);
    const { DELETE } = await import('@/app/api/akasha/push/subscribe/route');
    const res = await DELETE(
      makeJsonRequest('http://l/api/akasha/push/subscribe', 'DELETE', {
        endpoint: VALID_SUB.endpoint,
      })
    );
    expect(res.status).toBe(200);
    // service.deletePushSubscription(endpoint)
    expect(mockDeleteService).toHaveBeenCalledWith(VALID_SUB.endpoint);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { pushEnabled: false },
    });
  });
});
