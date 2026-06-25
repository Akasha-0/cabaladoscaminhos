/** @vitest-environment node */
/**
 * /api/account/privacy route tests — Wave 19.3.
 *
 * Cobre:
 *   - GET retorna state (4 tipos) + history (vazio se user novo)
 *   - GET retorna state com defaults quando user sem rows
 *   - GET retorna state que reflete a última decisão por tipo
 *   - GET retorna history ordenado DESC
 *   - PATCH append-only: cria nova row (NÃO atualiza)
 *   - PATCH atualiza o `state` retornado
 *   - PATCH rejeita type inválido (400)
 *   - PATCH rejeita granted não-boolean (400)
 *   - PATCH rejeita body malformado (400)
 *   - Auth: 401 quando requireAkashaApi retorna erro
 *
 * Audit trail (LGPD Art. 37) é testado em `consent.test.ts` (helper).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

// getClientIpInfo + ip-hash: usamos defaults determinísticos para tests
vi.mock('@/lib/infrastructure/security/ip-hash', () => ({
  getClientIpInfo: vi.fn(() => ({ ip: '127.0.0.1', hash: 'test-ip-hash' })),
}));

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockFindFirst = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    privacyConsent: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import { GET, PATCH } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import type { PrivacyConsentType } from '@prisma/client';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

function makeRequest(method: 'GET' | 'PATCH', body?: unknown): NextRequest {
  const init: ConstructorParameters<typeof NextRequest>[1] = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  // User-Agent para LGPD context
  if (!init.headers) init.headers = {};
  (init.headers as Record<string, string>)['user-agent'] =
    'vitest/1.0 (test)';
  return new NextRequest('http://localhost/api/account/privacy', init);
}

const fakeUser = { id: 'user-1', email: 'u@akasha.app', name: 'User' };

beforeEach(() => {
  mockFindMany.mockReset();
  mockCreate.mockReset();
  mockFindFirst.mockReset();
  mockRequireAkashaApi.mockReset();
  mockRequireAkashaApi.mockResolvedValue(fakeUser);
});

// ─── GET ─────────────────────────────────────────────────────────────
describe('GET /api/account/privacy', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('returns 4 consents (one per type) when user has no rows (defaults)', async () => {
    // history: empty
    mockFindMany.mockResolvedValueOnce([]);
    // state: empty → defaults aplicados
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.consents).toHaveLength(4);
    // Defaults: MARKETING=false, ANALYTICS=true, AI_TRAINING=false, THIRD_PARTY_SHARING=false
    const byType = new Map(data.consents.map((c: { type: string; granted: boolean }) => [c.type, c.granted]));
    expect(byType.get('MARKETING')).toBe(false);
    expect(byType.get('ANALYTICS')).toBe(true);
    expect(byType.get('AI_TRAINING')).toBe(false);
    expect(byType.get('THIRD_PARTY_SHARING')).toBe(false);
    expect(data.history).toEqual([]);
  });

  it('returns state reflecting latest decision per type', async () => {
    // state query: returns rows ordered DESC; we want "latest per type" simulation
    mockFindMany.mockResolvedValueOnce([
      {
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T12:00:00Z'),
      },
      {
        type: 'ANALYTICS' as PrivacyConsentType,
        granted: false,
        grantedAt: new Date('2026-06-25T11:00:00Z'),
      },
      {
        type: 'AI_TRAINING' as PrivacyConsentType,
        granted: false,
        grantedAt: new Date('2026-06-25T10:00:00Z'),
      },
      {
        type: 'THIRD_PARTY_SHARING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T09:00:00Z'),
      },
    ]);
    // history query
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json();
    const byType = new Map(data.consents.map((c: { type: string; granted: boolean }) => [c.type, c.granted]));
    expect(byType.get('MARKETING')).toBe(true);
    expect(byType.get('ANALYTICS')).toBe(false);
    expect(byType.get('AI_TRAINING')).toBe(false);
    expect(byType.get('THIRD_PARTY_SHARING')).toBe(true);
  });

  it('returns history array with id/type/granted/decidedAt', async () => {
    // state query
    mockFindMany.mockResolvedValueOnce([]);
    // history query
    mockFindMany.mockResolvedValueOnce([
      {
        id: 'pc-1',
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T12:00:00Z'),
      },
      {
        id: 'pc-2',
        type: 'ANALYTICS' as PrivacyConsentType,
        granted: false,
        grantedAt: new Date('2026-06-24T10:00:00Z'),
      },
    ]);
    const res = await GET(makeRequest('GET'));
    const data = await res.json();
    expect(data.history).toHaveLength(2);
    expect(data.history[0]).toMatchObject({
      id: 'pc-1',
      type: 'MARKETING',
      granted: true,
    });
    expect(data.history[0].decidedAt).toBe('2026-06-25T12:00:00.000Z');
  });
});

// ─── PATCH ────────────────────────────────────────────────────────────
describe('PATCH /api/account/privacy', () => {
  it('returns 401 when unauthenticated', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await PATCH(
      makeRequest('PATCH', { type: 'MARKETING', granted: true })
    );
    expect(res.status).toBe(401);
  });

  it('rejects malformed JSON body', async () => {
    const init: ConstructorParameters<typeof NextRequest>[1] = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'user-agent': 'vitest' },
      body: '{not-json',
    };
    const req = new NextRequest('http://localhost/api/account/privacy', init);
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('rejects body without type', async () => {
    const res = await PATCH(makeRequest('PATCH', { granted: true }));
    expect(res.status).toBe(400);
  });

  it('rejects invalid type', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { type: 'BOGUS', granted: true })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/type/);
  });

  it('rejects non-boolean granted', async () => {
    const res = await PATCH(
      makeRequest('PATCH', { type: 'MARKETING', granted: 'yes' })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/granted/);
  });

  it('creates new row (append-only) — never updates', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pc-new',
      type: 'MARKETING' as PrivacyConsentType,
      granted: true,
      grantedAt: new Date('2026-06-25T15:00:00Z'),
    });
    // second findMany for state refresh after PATCH
    mockFindMany.mockResolvedValueOnce([]);

    const res = await PATCH(
      makeRequest('PATCH', { type: 'MARKETING', granted: true })
    );
    expect(res.status).toBe(200);

    // ASSERT: append-only — must use `create`, NEVER `update` or `upsert`
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const createCall = mockCreate.mock.calls[0]?.[0] as {
      data: {
        userId: string;
        type: string;
        granted: boolean;
        ipHash: string;
        userAgent: string;
      };
    };
    expect(createCall.data).toMatchObject({
      userId: 'user-1',
      type: 'MARKETING',
      granted: true,
      ipHash: 'test-ip-hash', // mocked
      userAgent: 'vitest/1.0 (test)',
    });
    // Verify it's create with data, not update
    expect(createCall.data).not.toHaveProperty('where');
  });

  it('accepts each of the 4 canonical types', async () => {
    const types = ['MARKETING', 'ANALYTICS', 'AI_TRAINING', 'THIRD_PARTY_SHARING'];
    for (const t of types) {
      mockCreate.mockResolvedValueOnce({
        id: `pc-${t}`,
        type: t as PrivacyConsentType,
        granted: true,
        grantedAt: new Date(),
      });
      // state refresh
      mockFindMany.mockResolvedValueOnce([]);
      const res = await PATCH(
        makeRequest('PATCH', { type: t, granted: true })
      );
      expect(res.status).toBe(200);
    }
  });

  it('records IP hash + user agent (LGPD Art. 37)', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pc-1',
      type: 'ANALYTICS' as PrivacyConsentType,
      granted: false,
      grantedAt: new Date(),
    });
    mockFindMany.mockResolvedValueOnce([]);

    const res = await PATCH(
      makeRequest('PATCH', { type: 'ANALYTICS', granted: false })
    );
    expect(res.status).toBe(200);
    const createCall = mockCreate.mock.calls[0]?.[0] as {
      data: { ipHash: string; userAgent: string };
    };
    expect(createCall.data.ipHash).toBeTruthy();
    expect(createCall.data.userAgent).toBeTruthy();
    expect(createCall.data.userAgent).not.toBe('unknown');
  });

  it('returns updated state in response', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pc-new',
      type: 'MARKETING' as PrivacyConsentType,
      granted: true,
      grantedAt: new Date('2026-06-25T16:00:00Z'),
    });
    // state refresh after PATCH
    mockFindMany.mockResolvedValueOnce([
      {
        type: 'MARKETING' as PrivacyConsentType,
        granted: true,
        grantedAt: new Date('2026-06-25T16:00:00Z'),
      },
    ]);

    const res = await PATCH(
      makeRequest('PATCH', { type: 'MARKETING', granted: true })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.consent).toMatchObject({
      id: 'pc-new',
      type: 'MARKETING',
      granted: true,
    });
    expect(data.state).toHaveLength(4); // 4 tipos sempre retornados
  });
});