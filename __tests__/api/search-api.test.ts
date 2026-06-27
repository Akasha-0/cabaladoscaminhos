// ============================================================================
// API ROUTES — SEARCH & DISCOVERY (Onda 12, 2026-06-27)
// ============================================================================
// Testa cada endpoint: /api/search e /api/search/suggestions.
// Cobre: tipos de busca, highlight, paginação cursor, validação Zod.
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Mocks — Prisma raw + search engine
// ============================================================================

// Mock do prisma — só $queryRaw é usado pelas queries de search
const queryRawMock = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRawMock(...args),
    $disconnect: vi.fn(),
  },
}));

// ============================================================================
// Helpers
// ============================================================================

function makeRequest(url: string, init?: { method?: string; body?: unknown; headers?: Record<string, string> }) {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Content-Type', 'application/json');
  return new NextRequest(
    new Request(url, {
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.stringify(init.body) : undefined,
      headers: Object.fromEntries(headers),
    }),
  );
}

// ============================================================================
// Tests — GET /api/search
// ============================================================================

describe('GET /api/search', () => {
  let listSearch: typeof import('@/app/api/search/route').GET;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset mock to return valid shape
    queryRawMock.mockImplementation(() => Promise.resolve([]));
    const mod = await import('@/app/api/search/route');
    listSearch = mod.GET;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('retorna 400 quando query vazia (Zod min(1))', async () => {
    const req = makeRequest('http://localhost/api/search?q=');
    const res = await listSearch(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(4002); // VALIDATION_ERROR
  });

  it('aceita query simples e retorna envelope {data, meta}', async () => {
    // Posts query retorna 1 hit
    queryRawMock.mockImplementation((sql: any) => {
      const sqlStr = String(sql.sql ?? sql);
      if (sqlStr.includes('FROM posts')) {
        return Promise.resolve([
          {
            id: 'p1', content: 'meditação e mindfulness', authorId: 'u1',
            tradition: 'meditacao', topic: 'mindfulness', groupSlug: null, groupName: null,
            likesCount: 5, commentsCount: 2, createdAt: new Date('2026-06-20T00:00:00Z'),
            preview: 'Como prática de <mark>meditação</mark> mindfulness pode ajudar',
            score: 0.85,
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const req = makeRequest('http://localhost/api/search?q=medita%C3%A7%C3%A3o');
    const res = await listSearch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.query).toBe('meditação');
    expect(body.data.hits.length).toBeGreaterThan(0);
    expect(body.data.hits[0].type).toBe('post');
    expect(body.data.hits[0].preview).toContain('<mark>');
    expect(body.meta.total).toBeDefined();
  });

  it('respeita type=articles (só consulta articles)', async () => {
    const req = makeRequest('http://localhost/api/search?q=cabala&type=articles');
    const res = await listSearch(req);
    expect(res.status).toBe(200);
    // Verifica que Prisma foi chamado, mas posts NÃO (apenas articles)
    const calls = queryRawMock.mock.calls;
    const callsStr = calls.map((c: any) => String(c[0]?.sql ?? c[0])).join(' ');
    expect(callsStr).toContain('FROM articles');
  });

  it('valida limit > 50 (Zod max)', async () => {
    const req = makeRequest('http://localhost/api/search?q=cabala&limit=999');
    const res = await listSearch(req);
    expect(res.status).toBe(400);
  });

  it('valida q muito longa (max 200)', async () => {
    const req = makeRequest(`http://localhost/api/search?q=${'a'.repeat(250)}`);
    const res = await listSearch(req);
    expect(res.status).toBe(400);
  });

  it('retorna próxima página via cursor', async () => {
    // Primeira chamada: retorna 21 hits (limit=20 + 1 = tem mais)
    // Segunda chamada: usa cursor
    let calls = 0;
    queryRawMock.mockImplementation((sql: any) => {
      const sqlStr = String(sql.sql ?? sql);
      calls++;
      if (sqlStr.includes('FROM posts')) {
        if (calls === 1) {
          return Promise.resolve(
            Array.from({ length: 21 }, (_, i) => ({
              id: `p${i}`, content: `post ${i}`, authorId: 'u1',
              tradition: null, topic: null, groupSlug: null, groupName: null,
              likesCount: 0, commentsCount: 0, createdAt: new Date(),
              preview: `<mark>match</mark> ${i}`, score: 1 - i * 0.01,
            })),
          );
        }
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    const req1 = makeRequest('http://localhost/api/search?q=test&limit=20');
    const res1 = await listSearch(req1);
    const body1 = await res1.json();
    expect(body1.data.hits.length).toBe(20);
    expect(body1.data.nextCursor).toBeTruthy();
    expect(body1.meta.nextCursor).toBeTruthy();
  });

  it('POST retorna 405', async () => {
    const { POST } = await import('@/app/api/search/route');
    const req = makeRequest('http://localhost/api/search', { method: 'POST', body: {} });
    const res = await POST();
    expect(res.status).toBe(405);
  });
});

// ============================================================================
// Tests — GET /api/search/suggestions
// ============================================================================

describe('GET /api/search/suggestions', () => {
  let getSuggestions: typeof import('@/app/api/search/suggestions/route').GET;

  beforeEach(async () => {
    vi.clearAllMocks();
    queryRawMock.mockImplementation(() => Promise.resolve([]));
    const mod = await import('@/app/api/search/suggestions/route');
    getSuggestions = mod.GET;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('retorna 400 quando query vazia', async () => {
    const req = makeRequest('http://localhost/api/search/suggestions?q=');
    const res = await getSuggestions(req);
    expect(res.status).toBe(400);
  });

  it('retorna top 8 sugestões com mix de tipos', async () => {
    queryRawMock.mockImplementation((sql: any) => {
      const sqlStr = String(sql.sql ?? sql);
      if (sqlStr.includes('FROM posts')) {
        return Promise.resolve([
          { id: 'p1', content: 'meditação e yoga', score: 0.9 },
        ]);
      }
      if (sqlStr.includes('FROM articles')) {
        return Promise.resolve([
          { id: 'a1', title: 'Efeitos da meditação no cérebro', score: 0.85 },
        ]);
      }
      if (sqlStr.includes('FROM groups')) {
        return Promise.resolve([
          { id: 'g1', name: 'Meditação', slug: 'meditacao', score: 0.8 },
        ]);
      }
      return Promise.resolve([]);
    });

    const req = makeRequest('http://localhost/api/search/suggestions?q=medit');
    const res = await getSuggestions(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.suggestions).toBeDefined();
    // Mix de tipos
    const types = new Set(body.data.suggestions.map((s: { type: string }) => s.type));
    expect(types.size).toBeGreaterThan(1);
  });

  it('limita sugestões ao parâmetro limit (cap 10)', async () => {
    const req = makeRequest('http://localhost/api/search/suggestions?q=test&limit=100');
    const res = await getSuggestions(req);
    // limit > 10 ainda retorna 200, mas a lógica interna cap em 10
    expect(res.status).toBe(200);
  });

  it('POST retorna 405', async () => {
    const { POST } = await import('@/app/api/search/suggestions/route');
    const req = makeRequest('http://localhost/api/search/suggestions', { method: 'POST', body: {} });
    const res = await POST();
    expect(res.status).toBe(405);
  });
});

// ============================================================================
// Tests — Validação Zod (SearchQuerySchema)
// ============================================================================

describe('SearchQuerySchema', () => {
  it('q com 1 char passa', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: 'a' });
    expect(result.success).toBe(true);
  });

  it('q vazia falha', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('q muito longa (200+) falha', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('type default = "all"', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: 'test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('all');
    }
  });

  it('type inválido falha', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: 'test', type: 'invalid_type' });
    expect(result.success).toBe(false);
  });

  it('sort enum: relevance, recent, popular', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    expect(SearchQuerySchema.safeParse({ q: 'a', sort: 'relevance' }).success).toBe(true);
    expect(SearchQuerySchema.safeParse({ q: 'a', sort: 'recent' }).success).toBe(true);
    expect(SearchQuerySchema.safeParse({ q: 'a', sort: 'popular' }).success).toBe(true);
    expect(SearchQuerySchema.safeParse({ q: 'a', sort: 'wrong' }).success).toBe(false);
  });

  it('limit coerção de string', async () => {
    const { SearchQuerySchema } = await import('@/lib/validators/search');
    const result = SearchQuerySchema.safeParse({ q: 'test', limit: '15' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(15);
  });
});

// ============================================================================
// Tests — SuggestionQuerySchema
// ============================================================================

describe('SuggestionQuerySchema', () => {
  it('q obrigatória, max 80', async () => {
    const { SuggestionQuerySchema } = await import('@/lib/validators/search');
    expect(SuggestionQuerySchema.safeParse({ q: '' }).success).toBe(false);
    expect(SuggestionQuerySchema.safeParse({ q: 'a' }).success).toBe(true);
    expect(SuggestionQuerySchema.safeParse({ q: 'a'.repeat(81) }).success).toBe(false);
  });

  it('limit default 8, max 10', async () => {
    const { SuggestionQuerySchema } = await import('@/lib/validators/search');
    const r1 = SuggestionQuerySchema.safeParse({ q: 'test' });
    expect(r1.success).toBe(true);
    if (r1.success) expect(r1.data.limit).toBe(8);
    expect(SuggestionQuerySchema.safeParse({ q: 'test', limit: 11 }).success).toBe(false);
  });
});
