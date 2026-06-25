/**
 * @akasha/portal — GET /api/admin/insights/jobs tests (Wave 24.1)
 *
 * Cobertura:
 *   (a) Auth: sem cookie akasha_session → 401 Unauthorized.
 *   (b) Auth: com cookie válido → 200 OK.
 *   (c) Query params: jobName filter respeitado.
 *   (d) Query params: status filter respeitado.
 *   (e) Query params: limit clamping (default 20, max 100).
 *   (f) Graceful: tabela InsightJob não existe → retorna [] com nota.
 *   (g) Response shape: cada row inclui jobName, startedAt ISO, status, contadores.
 *   (h) LGPD: rows não contêm PII.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ─── Mocks ────────────────────────────────────────────────────────────────

const requireAkashaApiMock = vi.fn();
vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => requireAkashaApiMock(...args),
}));

const insightJobFindManyMock = vi.fn();
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    insightJob: {
      findMany: (...args: unknown[]) => insightJobFindManyMock(...args),
    },
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeRequest(opts: { auth?: boolean; query?: string } = {}): NextRequest {
  const { auth = true, query = '' } = opts;
  const headers = new Headers();
  if (auth) headers.set('cookie', 'akasha_session=valid-jwt');
  return new NextRequest(`http://localhost/api/admin/insights/jobs${query}`, {
    method: 'GET',
    headers,
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  requireAkashaApiMock.mockReset();
  insightJobFindManyMock.mockReset();

  // Default: auth OK + retorna rows mockadas
  requireAkashaApiMock.mockResolvedValue({ id: 'admin_user_123', role: 'ADMIN' });
  insightJobFindManyMock.mockResolvedValue([
    {
      id: 'job_1',
      jobName: 'discoveries-cron',
      startedAt: new Date('2026-06-25T03:00:00Z'),
      finishedAt: new Date('2026-06-25T03:01:23Z'),
      status: 'SUCCESS',
      insightsGenerated: 7,
      papersCited: 12,
      errors: { items: [] },
      windowSpec: { papersWindowDays: 7 },
    },
  ]);
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('GET /api/admin/insights/jobs', () => {
  it('retorna 401 quando auth falhar', async () => {
    const guardResponse = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    requireAkashaApiMock.mockResolvedValueOnce(guardResponse);

    const { GET } = await import('../route');
    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('retorna 200 com rows quando auth OK', async () => {
    const { GET } = await import('../route');
    const req = makeRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.count).toBe(1);
    expect(body.rows).toHaveLength(1);
  });

  it('cada row tem shape correto (ISO dates, contadores)', async () => {
    const { GET } = await import('../route');
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();
    const row = body.rows[0];

    expect(row).toEqual({
      id: 'job_1',
      jobName: 'discoveries-cron',
      startedAt: '2026-06-25T03:00:00.000Z',
      finishedAt: '2026-06-25T03:01:23.000Z',
      status: 'SUCCESS',
      insightsGenerated: 7,
      papersCited: 12,
      errors: { items: [] },
      windowSpec: { papersWindowDays: 7 },
    });
  });

  it('passa jobName filter quando presente', async () => {
    const { GET } = await import('../route');
    const req = makeRequest({ query: '?jobName=custom-job' });
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobName: 'custom-job' }),
      })
    );
  });

  it('passa status filter quando presente', async () => {
    const { GET } = await import('../route');
    const req = makeRequest({ query: '?status=FAILED' });
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'FAILED' }),
      })
    );
  });

  it('aplica limit default de 20', async () => {
    const { GET } = await import('../route');
    const req = makeRequest();
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });

  it('honra limit customizado', async () => {
    const { GET } = await import('../route');
    const req = makeRequest({ query: '?limit=50' });
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it('clamp limit a 100 (não permite mais)', async () => {
    const { GET } = await import('../route');
    const req = makeRequest({ query: '?limit=99999' });
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('clamp limit mínimo a 1', async () => {
    const { GET } = await import('../route');
    const req = makeRequest({ query: '?limit=-5' });
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    );
  });

  it('graceful: InsightJob não existe → 200 com rows=[] + note', async () => {
    insightJobFindManyMock.mockRejectedValueOnce(
      new Error('relation "insight_jobs" does not exist')
    );

    const { GET } = await import('../route');
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.count).toBe(0);
    expect(body.rows).toEqual([]);
    expect(body.note).toContain('D-053');
  });

  it('LGPD: rows não contêm PII', async () => {
    const { GET } = await import('../route');
    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    for (const row of body.rows) {
      expect(row).not.toHaveProperty('userId');
      expect(row).not.toHaveProperty('user');
      expect(row).not.toHaveProperty('email');
      expect(row).not.toHaveProperty('ip');
      expect(row.errors).toEqual({ items: [] }); // sem stack traces com PII
    }
  });

  it('rows ordenados por startedAt desc (mais recente primeiro)', async () => {
    const { GET } = await import('../route');
    const req = makeRequest();
    await GET(req);

    expect(insightJobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { startedAt: 'desc' } })
    );
  });
});
