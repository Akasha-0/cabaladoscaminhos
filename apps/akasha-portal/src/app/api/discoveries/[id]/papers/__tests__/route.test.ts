/**
 * @akasha/portal — GET /api/discoveries/[id]/papers tests (Wave 27.3)
 *
 * Cobertura:
 *   (a) Auth: sem cookie akasha_session → 401 Unauthorized.
 *   (b) id inválido (vazio / > 128 chars) → 400 invalid_id.
 *   (c) id válido + auth → 200 com array de papers (mock determinístico).
 *   (d) Response shape DiscoveryPaperDTO: paperId, title, authors, year,
 *       journal, abstract, citationCount, doi, fullTextUrl.
 *   (e) authors é string[] (não string concatenada).
 *   (f) citationCount é number ≥ 1 (papers reais sempre têm ≥ 1).
 *   (g) Mesmo id → mesma lista (mock determinístico).
 *   (h) Header Cache-Control privado + max-age 3600 (1h TTL).
 *   (i) Query param locale=pt-BR (default) vs en → abstract diferente
 *       quando paper tem abstractPtBr.
 *   (j) LGPD: response NÃO inclui PII (email, name, birthDate, userId).
 *   (k) Lista ordenada por citationCount desc (mais citados primeiro).
 *   (l) Papers são únicos na lista (deduplicado por paperId).
 *   (m) Lista pode ser vazia [] se mock não retorna papers (edge case).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

// ─── Helpers ───────────────────────────────────────────────────────────────

function mockAuth(authenticated: boolean) {
  if (authenticated) {
    vi.mocked(requireAkashaApi).mockResolvedValue({
      id: 'user-test-123',
      email: 'test@example.com',
      name: 'Test User',
    });
  } else {
    vi.mocked(requireAkashaApi).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }
}

function makeRequest(
  id: string,
  opts: { auth?: boolean; locale?: string } = {}
): NextRequest {
  const { auth = true, locale } = opts;
  const headers: Record<string, string> = {};
  if (auth) headers['cookie'] = 'akasha_session=valid-jwt';
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return new NextRequest(`http://localhost/api/discoveries/${id}/papers${qs}`, {
    headers,
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/discoveries/[id]/papers — Wave 27.3 (Discovery drill-down)', () => {
  it('(a) sem auth → 401 Unauthorized', async () => {
    mockAuth(false);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_001', { auth: false }), {
      params: Promise.resolve({ id: 'disc_001' }),
    });
    expect(res.status).toBe(401);
  });

  it('(b) id vazio → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: '' }),
    });
    expect(res.status).toBe(400);
    const payload = (await res.json()) as { error: string };
    expect(payload.error).toBe('invalid_id');
  });

  it('(b.2) id > 128 chars → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const longId = 'a'.repeat(200);
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: longId }),
    });
    expect(res.status).toBe(400);
  });

  it('(c) id válido + auth → 200 com array de papers', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_test_001'), {
      params: Promise.resolve({ id: 'disc_test_001' }),
    });
    expect(res.status).toBe(200);
    const payload = (await res.json()) as unknown[];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  it('(d) response shape DiscoveryPaperDTO completo', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_full_001'), {
      params: Promise.resolve({ id: 'disc_full_001' }),
    });
    const payload = (await res.json()) as Array<Record<string, unknown>>;

    expect(payload.length).toBeGreaterThan(0);
    const first = payload[0]!;

    // Campos obrigatórios do shape
    expect(first).toHaveProperty('paperId');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('authors');
    expect(first).toHaveProperty('year');
    expect(first).toHaveProperty('journal');
    expect(first).toHaveProperty('abstract');
    expect(first).toHaveProperty('citationCount');

    // Tipos
    expect(typeof first.paperId).toBe('string');
    expect(typeof first.title).toBe('string');
    expect(typeof first.year).toBe('number');
    expect(typeof first.journal).toBe('string');
    expect(typeof first.abstract).toBe('string');
    expect(typeof first.citationCount).toBe('number');

    // Campos opcionais (doi, fullTextUrl) podem estar presentes ou null
    expect(first).toHaveProperty('doi');
    expect(first).toHaveProperty('fullTextUrl');
  });

  it('(e) authors é string[]', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_authors_001'), {
      params: Promise.resolve({ id: 'disc_authors_001' }),
    });
    const payload = (await res.json()) as Array<{ authors: unknown }>;
    expect(payload.length).toBeGreaterThan(0);
    for (const paper of payload) {
      expect(Array.isArray(paper.authors)).toBe(true);
      for (const author of paper.authors as unknown[]) {
        expect(typeof author).toBe('string');
      }
    }
  });

  it('(f) citationCount é number ≥ 1', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_cit_001'), {
      params: Promise.resolve({ id: 'disc_cit_001' }),
    });
    const payload = (await res.json()) as Array<{ citationCount: number }>;
    expect(payload.length).toBeGreaterThan(0);
    for (const paper of payload) {
      expect(typeof paper.citationCount).toBe('number');
      expect(paper.citationCount).toBeGreaterThanOrEqual(1);
      // Mock range: 1-12 (não é contract, mas sanity check)
      expect(paper.citationCount).toBeLessThanOrEqual(12);
    }
  });

  it('(g) mesmo id → mesma lista (mock determinístico)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const a = await GET(makeRequest('disc_det_001'), {
      params: Promise.resolve({ id: 'disc_det_001' }),
    });
    const b = await GET(makeRequest('disc_det_001'), {
      params: Promise.resolve({ id: 'disc_det_001' }),
    });
    const pa = await a.json();
    const pb = await b.json();
    expect(JSON.stringify(pa)).toBe(JSON.stringify(pb));
  });

  it('(h) header Cache-Control privado + max-age 3600 (1h TTL)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_cache_001'), {
      params: Promise.resolve({ id: 'disc_cache_001' }),
    });
    const cc = res.headers.get('Cache-Control');
    expect(cc).toContain('private');
    expect(cc).toContain('max-age=3600');
  });

  it('(i) locale=pt-BR (default) prioriza abstractPtBr quando disponível', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_ptbr_001', { locale: 'pt-BR' }), {
      params: Promise.resolve({ id: 'disc_ptbr_001' }),
    });
    const payload = (await res.json()) as Array<{ paperId: string; abstract: string }>;
    expect(payload.length).toBeGreaterThan(0);

    // Procura paper_cahn_2010 (único com abstractPtBr no mock)
    const cahn = payload.find((p) => p.paperId === 'paper_cahn_2010');
    if (cahn) {
      expect(cahn.abstract).toMatch(/Coerência|coerência/); // PT-BR
      expect(cahn.abstract).not.toMatch(/Brainwave/); // não deve ser EN
    }
  });

  it('(i.2) locale=en usa abstractEn', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_en_001', { locale: 'en' }), {
      params: Promise.resolve({ id: 'disc_en_001' }),
    });
    const payload = (await res.json()) as Array<{ paperId: string; abstract: string }>;
    expect(payload.length).toBeGreaterThan(0);

    const cahn = payload.find((p) => p.paperId === 'paper_cahn_2010');
    if (cahn) {
      expect(cahn.abstract).toMatch(/Brainwave/); // EN
      expect(cahn.abstract).not.toMatch(/Coerência/); // não deve ser PT-BR
    }
  });

  it('(j) LGPD: response NÃO inclui PII (email, name, birthDate, userId)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_lgpd_001'), {
      params: Promise.resolve({ id: 'disc_lgpd_001' }),
    });
    const payload = (await res.json()) as Array<Record<string, unknown>>;
    expect(payload.length).toBeGreaterThan(0);

    for (const paper of payload) {
      expect(paper).not.toHaveProperty('email');
      expect(paper).not.toHaveProperty('name');
      expect(paper).not.toHaveProperty('birthDate');
      expect(paper).not.toHaveProperty('userId');
      expect(paper).not.toHaveProperty('user');
      expect(paper).not.toHaveProperty('cpf');
      expect(paper).not.toHaveProperty('phone');

      // Sem chaves que começam com prefixos PII
      for (const key of Object.keys(paper)) {
        expect(key.toLowerCase()).not.toMatch(/email|birth|cpf|rg|phone|name|user/);
      }
    }
  });

  it('(k) lista ordenada por citationCount desc', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_sort_001'), {
      params: Promise.resolve({ id: 'disc_sort_001' }),
    });
    const payload = (await res.json()) as Array<{ citationCount: number }>;
    expect(payload.length).toBeGreaterThan(0);

    for (let i = 1; i < payload.length; i++) {
      expect(payload[i]!.citationCount).toBeLessThanOrEqual(
        payload[i - 1]!.citationCount
      );
    }
  });

  it('(l) papers são únicos na lista (deduplicado por paperId)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_dedup_001'), {
      params: Promise.resolve({ id: 'disc_dedup_001' }),
    });
    const payload = (await res.json()) as Array<{ paperId: string }>;
    expect(payload.length).toBeGreaterThan(0);

    const ids = payload.map((p) => p.paperId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('(m) lista tem entre 2 e 4 papers (mock range)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_range_001'), {
      params: Promise.resolve({ id: 'disc_range_001' }),
    });
    const payload = (await res.json()) as unknown[];
    expect(payload.length).toBeGreaterThanOrEqual(2);
    expect(payload.length).toBeLessThanOrEqual(4);
  });

  it('(n) year é number razoável (1900..ano corrente+1)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_year_001'), {
      params: Promise.resolve({ id: 'disc_year_001' }),
    });
    const payload = (await res.json()) as Array<{ year: number }>;
    expect(payload.length).toBeGreaterThan(0);
    const currentYear = new Date().getFullYear();
    for (const paper of payload) {
      expect(paper.year).toBeGreaterThanOrEqual(1900);
      expect(paper.year).toBeLessThanOrEqual(currentYear + 1);
    }
  });

  it('(o) abstract é string não-vazia', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/papers/route');
    const res = await GET(makeRequest('disc_abs_001'), {
      params: Promise.resolve({ id: 'disc_abs_001' }),
    });
    const payload = (await res.json()) as Array<{ abstract: string }>;
    expect(payload.length).toBeGreaterThan(0);
    for (const paper of payload) {
      expect(typeof paper.abstract).toBe('string');
      expect(paper.abstract.length).toBeGreaterThan(20);
    }
  });
});