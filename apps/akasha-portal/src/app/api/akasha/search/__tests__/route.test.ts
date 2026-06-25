/**
 * Wave 13.2 — /api/search route tests (unit, node env).
 *
 * Mocks: prisma, auth guard. We test:
 *   1. Auth required (401 if no user)
 *   2. Query validation (q length 2-200)
 *   3. type=all → 4 Prisma calls (chat, diario, manifesto, mapa)
 *   4. type=chat → only ChatMessage query (with `contains` + `mode: insensitive`)
 *   5. type=diario → DailyReading query with OR(climate, alert)
 *   6. type=manifesto → Manifesto query, filters by stringified content
 *   7. type=mapa → BirthChart query, filters by stringified pilar JSON
 *   8. Results sorted by score desc, createdAt desc
 *   9. Limit is enforced (we slice to limit)
 *  10. Cross-tenant isolation: never exposes results without `userId` filter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock auth — default returns a valid user.
vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn().mockResolvedValue({ id: 'user-123', email: 't@x.com', name: 'T' }),
}));

// Mock prisma with chainable findMany returning controlled results.
const prismaFindMany = vi.fn();
const prismaChatFindMany = vi.fn();
const prismaDiarioFindMany = vi.fn();
const prismaManifestoFindMany = vi.fn();
const prismaBirthChartFindMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    chatMessage: { findMany: (...a: unknown[]) => prismaChatFindMany(...a) },
    dailyReading: { findMany: (...a: unknown[]) => prismaDiarioFindMany(...a) },
    manifesto: { findMany: (...a: unknown[]) => prismaManifestoFindMany(...a) },
    birthChart: { findMany: (...a: unknown[]) => prismaBirthChartFindMany(...a) },
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import { GET } from '../route';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeReq(qs: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/search');
  for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

const NOW = new Date('2026-06-24T12:00:00Z');

beforeEach(() => {
  prismaChatFindMany.mockReset();
  prismaDiarioFindMany.mockReset();
  prismaManifestoFindMany.mockReset();
  prismaBirthChartFindMany.mockReset();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/search', () => {
  it('rejects when q is too short (1 char)', async () => {
    const res = await GET(makeReq({ q: 'a' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/ao menos 2/);
  });

  it('rejects when q is too long (>200 chars)', async () => {
    const res = await GET(makeReq({ q: 'a'.repeat(201) }));
    expect(res.status).toBe(400);
  });

  it('returns 401 when requireAkashaApi returns a NextResponse', async () => {
    const { NextResponse: NR } = await import('next/server');
    const { requireAkashaApi } = await import('@/lib/application/auth/akasha-guard');
    vi.mocked(requireAkashaApi).mockResolvedValueOnce(
      NR.json({ error: 'Unauthorized' }, { status: 401 }) as never
    );
    const res = await GET(makeReq({ q: 'cabala' }));
    expect(res.status).toBe(401);
  });

  it('runs 4 queries in parallel when type=all', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    prismaDiarioFindMany.mockResolvedValue([]);
    prismaManifestoFindMany.mockResolvedValue([]);
    prismaBirthChartFindMany.mockResolvedValue([]);

    const res = await GET(makeReq({ q: 'cabala' }));
    expect(res.status).toBe(200);
    expect(prismaChatFindMany).toHaveBeenCalledTimes(1);
    expect(prismaDiarioFindMany).toHaveBeenCalledTimes(1);
    expect(prismaManifestoFindMany).toHaveBeenCalledTimes(1);
    expect(prismaBirthChartFindMany).toHaveBeenCalledTimes(1);
  });

  it('runs only chat query when type=chat', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    const res = await GET(makeReq({ q: 'cabala', type: 'chat' }));
    expect(res.status).toBe(200);
    expect(prismaChatFindMany).toHaveBeenCalledTimes(1);
    expect(prismaDiarioFindMany).not.toHaveBeenCalled();
    expect(prismaManifestoFindMany).not.toHaveBeenCalled();
    expect(prismaBirthChartFindMany).not.toHaveBeenCalled();
  });

  it('passes userId from auth context to ChatMessage query (cross-tenant guard)', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    await GET(makeReq({ q: 'cabala', type: 'chat' }));
    const arg = prismaChatFindMany.mock.calls[0][0] as {
      where: { consultation: { userId: string }; content: { contains: string; mode: string } };
      take: number;
    };
    expect(arg.where.consultation.userId).toBe('user-123');
    expect(arg.where.content.contains).toBe('cabala');
    expect(arg.where.content.mode).toBe('insensitive');
    expect(arg.take).toBe(20); // default limit
  });

  it('passes userId filter to DailyReading query', async () => {
    prismaDiarioFindMany.mockResolvedValue([]);
    await GET(makeReq({ q: 'cabala', type: 'diario' }));
    const arg = prismaDiarioFindMany.mock.calls[0][0] as {
      where: { userId: string; OR: unknown[] };
    };
    expect(arg.where.userId).toBe('user-123');
    expect(arg.where.OR).toHaveLength(2);
  });

  it('does NOT pass userId from query string (security: query-only tenant scope)', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    // Try to inject another user's id via q (should be ignored by the route).
    await GET(makeReq({ q: 'cabala userId=other-user', type: 'chat' }));
    const arg = prismaChatFindMany.mock.calls[0][0] as {
      where: { consultation: { userId: string } };
    };
    expect(arg.where.consultation.userId).toBe('user-123');
  });

  it('shapes ChatMessage results with type=chat, href to /oraculo', async () => {
    prismaChatFindMany.mockResolvedValue([
      {
        id: 'msg-1',
        content: 'Fale sobre cabala e a árvore da vida',
        role: 'USER',
        createdAt: NOW,
        consultation: { id: 'cons-1', title: 'Primeira consulta' },
      },
      {
        id: 'msg-2',
        content: 'Cabala é a tradição mística judaica',
        role: 'ORACLE',
        createdAt: new Date(NOW.getTime() - 1000),
        consultation: { id: 'cons-1', title: null },
      },
    ]);
    const res = await GET(makeReq({ q: 'cabala', type: 'chat' }));
    const body = await res.json();
    expect(body.results).toHaveLength(2);
    // msg-2 ("Cabala é...") scores higher than msg-1 (longer content) due
    // to the lengthFactor in scoreMatch; that's why msg-2 wins.
    // msg-2's consultation has no title → fallback "Conversa com o Mentor — ..."
    expect(body.results[0]).toMatchObject({
      type: 'chat',
      id: 'msg-2',
      href: '/pt-BR/oraculo?consultationId=cons-1#msg-msg-2',
      meta: { role: 'ORACLE', consultationId: 'cons-1' },
    });
    expect(body.results[0].title).toMatch(/Conversa com o Mentor/); // fallback (msg-2's title is null)
    // msg-1 has title "Primeira consulta" → wins for the title assertion.
    expect(body.results[1].title).toBe('Primeira consulta');
    expect(body.results[1].snippet).toContain('cabala');
  });

  it('sorts by score desc then createdAt desc', async () => {
    // Two chat messages — second one has shorter content (higher score).
    prismaChatFindMany.mockResolvedValue([
      {
        id: 'msg-long',
        content: ' '.repeat(3500) + 'cabala',
        role: 'USER',
        createdAt: new Date(NOW.getTime() - 10000),
        consultation: { id: 'c', title: 'long' },
      },
      {
        id: 'msg-short',
        content: 'cabala',
        role: 'USER',
        createdAt: NOW,
        consultation: { id: 'c', title: 'short' },
      },
    ]);
    const res = await GET(makeReq({ q: 'cabala', type: 'chat' }));
    const body = await res.json();
    expect(body.results[0].id).toBe('msg-short'); // higher score
    expect(body.results[1].id).toBe('msg-long');
  });

  it('enforces `limit` cap on final results', async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      id: `msg-${i}`,
      content: `cabala msg ${i}`,
      role: 'USER',
      createdAt: new Date(NOW.getTime() - i),
      consultation: { id: 'c', title: 't' },
    }));
    prismaChatFindMany.mockResolvedValue(many);
    const res = await GET(makeReq({ q: 'cabala', type: 'chat', limit: '5' }));
    const body = await res.json();
    expect(body.results).toHaveLength(5);
  });

  it('Manifesto: filters by stringified content match', async () => {
    prismaManifestoFindMany.mockResolvedValue([
      {
        id: 'm-1',
        content: { title: 'Meu Manifesto', text: 'palavra cabala aparece aqui' },
        tokensUsed: 123,
        createdAt: NOW,
      },
      {
        id: 'm-2',
        content: { title: 'Outro', text: 'nada a ver com isso' },
        tokensUsed: 0,
        createdAt: NOW,
      },
    ]);
    const res = await GET(makeReq({ q: 'cabala', type: 'manifesto' }));
    const body = await res.json();
    // Only the first one matches.
    expect(body.results.map((r: { id: string }) => r.id)).toEqual(['m-1']);
    expect(body.results[0].href).toBe('/pt-BR/conta/manifesto');
  });

  it('BirthChart/mapa: identifies which pilar matched', async () => {
    prismaBirthChartFindMany.mockResolvedValue([
      {
        id: 'bc-1',
        astrologyMap: { sun: 'cabala' },
        kabalisticMap: { tree: 'Sephirot' },
        tantricMap: {},
        oduBirth: {},
        ichingMap: {},
        incomplete: false,
        updatedAt: NOW,
      },
    ]);
    const res = await GET(makeReq({ q: 'cabala', type: 'mapa' }));
    const body = await res.json();
    expect(body.results).toHaveLength(1);
    expect(body.results[0].title).toBe('Mapa Akáshico — Astrologia');
    expect(body.results[0].meta?.pilar).toBe('Astrologia');
  });

  it('BirthChart/mapa: skips rows that do NOT match any pilar', async () => {
    prismaBirthChartFindMany.mockResolvedValue([
      {
        id: 'bc-1',
        astrologyMap: { sun: 'leo' },
        kabalisticMap: { path: 11 },
        tantricMap: { soul: 7 },
        oduBirth: {},
        ichingMap: {},
        incomplete: false,
        updatedAt: NOW,
      },
    ]);
    const res = await GET(makeReq({ q: 'no-existe', type: 'mapa' }));
    const body = await res.json();
    expect(body.results).toHaveLength(0);
  });

  it('returns tookMs + query + types metadata', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    const res = await GET(makeReq({ q: 'cabala', type: 'chat' }));
    const body = await res.json();
    expect(body.tookMs).toBeTypeOf('number');
    expect(body.query).toBe('cabala');
    expect(body.types).toEqual(['chat']);
  });

  it('handles prisma errors as 500', async () => {
    prismaChatFindMany.mockRejectedValue(new Error('DB down'));
    const res = await GET(makeReq({ q: 'cabala', type: 'chat' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Erro ao buscar');
  });

  it('defaults to type=all when type missing', async () => {
    prismaChatFindMany.mockResolvedValue([]);
    prismaDiarioFindMany.mockResolvedValue([]);
    prismaManifestoFindMany.mockResolvedValue([]);
    prismaBirthChartFindMany.mockResolvedValue([]);
    const res = await GET(makeReq({ q: 'cabala' }));
    const body = await res.json();
    expect(body.types).toEqual(['chat', 'diario', 'manifesto', 'mapa']);
  });
});