/**
 * @akasha/portal — GET /api/admin/feedback/analytics tests (Wave 18.3)
 *
 * Cobertura:
 *   (a) Auth: sem auth → 401.
 *   (b) Auth: autenticado mas não-ADMIN → 403.
 *   (c) ADMIN happy path: retorna avgRating, totalFeedback, trend (size = days),
 *       topDownMessages (≤5) e byPilar.
 *   (d) `days` clamping: <1 → 1, >365 → 365, inválido → 30 (default).
 *   (e) Snippet LGPD: truncado a 100 chars + ellipsis.
 *   (f) byPilar derivation: prefixo `cabala:` vai pro bucket cabala;
 *       sem prefixo → bucket `global`.
 *   (g) Zero votos: avgRating = 0/0, totalFeedback = 0, topDown vazio,
 *       trend tudo 0.
 *   (h) DB error → 500 db_error.
 *
 * Estratégia: mockar `requireAkashaAdmin` e `prisma.feedbackEntry`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaAdmin: vi.fn(),
}));

const countMock = vi.fn();
const groupByMock = vi.fn();
const findManyMock = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    feedbackEntry: {
      count: (...args: unknown[]) => countMock(...args),
      groupBy: (...args: unknown[]) => groupByMock(...args),
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(query: Record<string, string> = {}, opts: { auth?: boolean } = {}): NextRequest {
  const { auth = true } = opts;
  const url = new URL('http://localhost/api/admin/feedback/analytics');
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const headers: Record<string, string> = {};
  if (auth) headers['cookie'] = 'akasha_session=valid';
  return new NextRequest(url, { headers });
}

function mockAdmin(allowed: boolean) {
  if (allowed) {
    vi.mocked(requireAkashaAdmin).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@akasha.app',
      name: 'Admin',
      role: 'ADMIN',
    });
  } else if (allowed === false) {
    // Não-ADMIN → 403
    vi.mocked(requireAkashaAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Acesso restrito a ADMIN' }, { status: 403 })
    );
  } else {
    // Sem auth → 401
    vi.mocked(requireAkashaAdmin).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }
}

function resetMocks() {
  countMock.mockReset();
  groupByMock.mockReset();
  findManyMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

beforeEach(() => {
  resetMocks();
});

// ─── Default mocks para o happy path ───────────────────────────────────────

function setupEmptyMock() {
  // avgRating counts
  countMock
    .mockResolvedValueOnce(0) // up
    .mockResolvedValueOnce(0); // down
  // trend groupBy (up + down)
  groupByMock
    .mockResolvedValueOnce([]) // upByDay
    .mockResolvedValueOnce([]); // downByDay
  // topDown groupBy (vazio)
  groupByMock.mockResolvedValueOnce([]);
  // byPilar findMany (vazio)
  findManyMock.mockResolvedValueOnce([]);
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/admin/feedback/analytics — Wave 18.3', () => {
  it('(a) sem auth → 401 Unauthorized', async () => {
    mockAdmin(undefined as unknown as boolean); // sem auth
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({}, { auth: false }));
    expect(res.status).toBe(401);
  });

  it('(b) autenticado mas não-ADMIN → 403', async () => {
    mockAdmin(false);
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it('(c) ADMIN happy path — shape completa', async () => {
    mockAdmin(true);
    // counts
    countMock.mockResolvedValueOnce(85).mockResolvedValueOnce(15);
    // trend (upByDay / downByDay)
    groupByMock
      .mockResolvedValueOnce([
        { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), _count: { _all: 10 } },
      ])
      .mockResolvedValueOnce([
        { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), _count: { _all: 2 } },
      ])
      // topDown
      .mockResolvedValueOnce([
        {
          messageId: 'cabala:msg-1',
          _count: { _all: 5 },
          _max: { createdAt: new Date() },
        },
      ]);
    // snippet fetch
    findManyMock.mockResolvedValueOnce([
      {
        messageId: 'cabala:msg-1',
        comment: 'Comentário curto',
        createdAt: new Date(),
      },
    ]);
    // byPilar
    findManyMock.mockResolvedValueOnce([
      { messageId: 'cabala:msg-1', rating: 'up' },
      { messageId: 'cabala:msg-2', rating: 'down' },
      { messageId: 'astrologia:msg-3', rating: 'up' },
      { messageId: 'random-id', rating: 'up' },
    ]);

    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({ days: '30' }));
    expect(res.status).toBe(200);

    const payload = (await res.json()) as {
      avgRating: { up: number; down: number };
      totalFeedback: number;
      trendLast30Days: Array<{ date: string; upCount: number; downCount: number; ratio: number }>;
      topDownMessages: Array<{ messageId: string; downCount: number; snippet: string }>;
      byPilar: Record<string, number>;
    };

    expect(payload.totalFeedback).toBe(100);
    expect(payload.avgRating.up).toBeCloseTo(0.85, 5);
    expect(payload.avgRating.down).toBeCloseTo(0.15, 5);
    expect(payload.trendLast30Days).toHaveLength(30);
    expect(payload.topDownMessages).toHaveLength(1);
    expect(payload.topDownMessages[0]?.messageId).toBe('cabala:msg-1');
    expect(payload.topDownMessages[0]?.downCount).toBe(5);
    expect(payload.topDownMessages[0]?.snippet).toBe('Comentário curto');
    expect(payload.byPilar.cabala).toBeCloseTo(0.5, 5); // 1up / 2total
    expect(payload.byPilar.astrologia).toBe(1); // 1up / 1total
    expect(payload.byPilar.global).toBe(1); // 1up / 1total
  });

  it('(d1) days < 1 → clampado a 1 (trend tem 1 entry)', async () => {
    mockAdmin(true);
    setupEmptyMock();
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({ days: '0' }));
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { trendLast30Days: unknown[] };
    expect(payload.trendLast30Days).toHaveLength(1);
  });

  it('(d2) days > 365 → clampado a 365', async () => {
    mockAdmin(true);
    setupEmptyMock();
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({ days: '99999' }));
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { trendLast30Days: unknown[] };
    expect(payload.trendLast30Days).toHaveLength(365);
  });

  it('(d3) days inválido (não-número) → default 30', async () => {
    mockAdmin(true);
    setupEmptyMock();
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({ days: 'abc' }));
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { trendLast30Days: unknown[] };
    expect(payload.trendLast30Days).toHaveLength(30);
  });

  it('(e) snippet LGPD: truncado a 100 chars + ellipsis', async () => {
    mockAdmin(true);
    const longComment = 'a'.repeat(250);
    countMock.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    groupByMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { messageId: 'msg-x', _count: { _all: 1 }, _max: { createdAt: new Date() } },
      ]);
    findManyMock
      .mockResolvedValueOnce([
        { messageId: 'msg-x', comment: longComment, createdAt: new Date() },
      ])
      .mockResolvedValueOnce([]);
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { topDownMessages: Array<{ snippet: string }> };
    expect(payload.topDownMessages[0]?.snippet).toHaveLength(101); // 100 + ellipsis
    expect(payload.topDownMessages[0]?.snippet.endsWith('…')).toBe(true);
  });

  it('(e2) snippet null → string vazia (sem erro)', async () => {
    mockAdmin(true);
    countMock.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    groupByMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { messageId: 'msg-y', _count: { _all: 1 }, _max: { createdAt: new Date() } },
      ]);
    findManyMock
      .mockResolvedValueOnce([
        { messageId: 'msg-y', comment: null, createdAt: new Date() },
      ])
      .mockResolvedValueOnce([]);
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { topDownMessages: Array<{ snippet: string }> };
    expect(payload.topDownMessages[0]?.snippet).toBe('');
  });

  it('(f) byPilar: prefixo "cabala:" → bucket cabala, sem prefixo → global', async () => {
    mockAdmin(true);
    countMock.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    groupByMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    findManyMock
      .mockResolvedValueOnce([
        { messageId: 'cabala:a', rating: 'up' },
        { messageId: 'cabala:b', rating: 'up' },
        { messageId: 'astrologia:c', rating: 'up' },
        { messageId: 'no-prefix', rating: 'down' },
      ]);
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { byPilar: Record<string, number> };
    expect(payload.byPilar.cabala).toBe(1); // 2up / 2total
    expect(payload.byPilar.astrologia).toBe(1); // 1up / 1total
    expect(payload.byPilar.global).toBe(0); // 0up / 1total
    // Pilares sem votos → 0
    expect(payload.byPilar.numerologia).toBe(0);
    expect(payload.byPilar.tantrica).toBe(0);
    expect(payload.byPilar.odu).toBe(0);
    expect(payload.byPilar.iching).toBe(0);
  });

  it('(g) zero votos: avgRating=0/0, totalFeedback=0, top vazio', async () => {
    mockAdmin(true);
    setupEmptyMock();
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const payload = (await res.json()) as {
      avgRating: { up: number; down: number };
      totalFeedback: number;
      trendLast30Days: Array<{ ratio: number }>;
      topDownMessages: unknown[];
    };
    expect(payload.totalFeedback).toBe(0);
    expect(payload.avgRating.up).toBe(0);
    expect(payload.avgRating.down).toBe(0);
    expect(payload.trendLast30Days).toHaveLength(30);
    // Dias sem votos → ratio 0
    for (const d of payload.trendLast30Days) {
      expect(d.ratio).toBe(0);
    }
    expect(payload.topDownMessages).toHaveLength(0);
  });

  it('(h) DB error → 500 db_error', async () => {
    mockAdmin(true);
    countMock.mockRejectedValueOnce(new Error('connection timeout'));
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const payload = (await res.json()) as { error: string; details?: string };
    expect(payload.error).toBe('db_error');
    expect(payload.details).toContain('connection timeout');
  });

  it('(i) ratio do trend: dia com up=10/down=2 → ratio=10/12', async () => {
    mockAdmin(true);
    countMock.mockResolvedValueOnce(10).mockResolvedValueOnce(2);
    const day = new Date();
    groupByMock
      .mockResolvedValueOnce([{ createdAt: day, _count: { _all: 10 } }])
      .mockResolvedValueOnce([{ createdAt: day, _count: { _all: 2 } }])
      .mockResolvedValueOnce([]);
    findManyMock.mockResolvedValueOnce([]);
    const { GET } = await import('@/app/api/admin/feedback/analytics/route');
    const res = await GET(makeRequest({ days: '1' }));
    expect(res.status).toBe(200);
    const payload = (await res.json()) as {
      trendLast30Days: Array<{ upCount: number; downCount: number; ratio: number }>;
    };
    expect(payload.trendLast30Days).toHaveLength(1);
    expect(payload.trendLast30Days[0]?.upCount).toBe(10);
    expect(payload.trendLast30Days[0]?.downCount).toBe(2);
    expect(payload.trendLast30Days[0]?.ratio).toBeCloseTo(10 / 12, 5);
  });
});