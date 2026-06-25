/**
 * @akasha/portal — GET /api/discoveries/[id] tests (Wave 23.2)
 *
 * Cobertura:
 *   (a) Auth: sem cookie akasha_session → 401 Unauthorized.
 *   (b) id inválido (vazio / > 128 chars) → 400 invalid_id.
 *   (c) id válido + auth → 200 com view-model (mock determinístico).
 *   (d) View-model tem shape ThoughtChainViewModel (verdadeUniversal,
 *       reasoning, papers, relatedDiscoveries, etc).
 *   (e) Mesmo id → mesmo model (mock determinístico).
 *   (f) Header Cache-Control privado + max-age 30s.
 *   (g) Query param locale=alterna locale do view-model.
 *   (h) LGPD: response NÃO inclui birthDate, email, name do user.
 *   (i) Response é JSON parseável com `data.discoveryId === id`.
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

function makeRequest(id: string, opts: { auth?: boolean; locale?: string } = {}): NextRequest {
  const { auth = true, locale } = opts;
  const headers: Record<string, string> = {};
  if (auth) headers['cookie'] = 'akasha_session=valid-jwt';
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return new NextRequest(`http://localhost/api/discoveries/${id}${qs}`, { headers });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/discoveries/[id] — Wave 23.2 (UI Cadeia Viva)', () => {
  it('(a) sem auth → 401 Unauthorized', async () => {
    mockAuth(false);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_001', { auth: false }), {
      params: Promise.resolve({ id: 'disc_001' }),
    });
    expect(res.status).toBe(401);
  });

  it('(b) id vazio → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    // Edge: id = '' é pego pelo handler
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: '' }),
    });
    expect(res.status).toBe(400);
    const payload = (await res.json()) as { error: string };
    expect(payload.error).toBe('invalid_id');
  });

  it('(b.2) id > 128 chars → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const longId = 'a'.repeat(200);
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: longId }),
    });
    expect(res.status).toBe(400);
  });

  it('(c) id válido + auth → 200 com view-model', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_test_001'), {
      params: Promise.resolve({ id: 'disc_test_001' }),
    });
    expect(res.status).toBe(200);
    const payload = (await res.json()) as Record<string, unknown>;
    expect(payload.discoveryId).toBe('disc_test_001');
  });

  it('(d) view-model tem shape ThoughtChainViewModel completo', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_full_001'), {
      params: Promise.resolve({ id: 'disc_full_001' }),
    });
    const payload = (await res.json()) as Record<string, unknown>;

    // Campos obrigatórios
    expect(payload).toHaveProperty('discoveryId');
    expect(payload).toHaveProperty('verdadeUniversal');
    expect(payload).toHaveProperty('headline');
    expect(payload).toHaveProperty('inputs');
    expect(payload).toHaveProperty('reasoning');
    expect(payload).toHaveProperty('papers');
    expect(payload).toHaveProperty('relatedDiscoveries');
    expect(payload).toHaveProperty('confidence');
    expect(payload).toHaveProperty('createdAt');
    expect(payload).toHaveProperty('locale');

    // Tipos
    expect(typeof payload.verdadeUniversal).toBe('string');
    expect(typeof payload.reasoning).toBe('string');
    expect(Array.isArray(payload.papers)).toBe(true);
    expect(Array.isArray(payload.relatedDiscoveries)).toBe(true);
    expect(typeof payload.confidence).toBe('number');
    expect(payload.confidence).toBeGreaterThanOrEqual(0);
    expect(payload.confidence).toBeLessThanOrEqual(1);

    // Inputs tem sub-shape
    const inputs = payload.inputs as Record<string, unknown>;
    expect(inputs).toHaveProperty('pilares');
    expect(Array.isArray(inputs.pilares)).toBe(true);

    // Confidence no range 0.7..0.95 (mock atual)
    expect(payload.confidence).toBeGreaterThanOrEqual(0.7);
    expect(payload.confidence).toBeLessThanOrEqual(0.95);
  });

  it('(e) mesmo id → mesmo model (mock determinístico)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const a = await GET(makeRequest('disc_det_001'), {
      params: Promise.resolve({ id: 'disc_det_001' }),
    });
    const b = await GET(makeRequest('disc_det_001'), {
      params: Promise.resolve({ id: 'disc_det_001' }),
    });
    const pa = await a.json();
    const pb = await b.json();
    expect(pa.verdadeUniversal).toBe(pb.verdadeUniversal);
    expect(pa.reasoning).toBe(pb.reasoning);
    expect(pa.headline).toBe(pb.headline);
    expect(pa.confidence).toBe(pb.confidence);
  });

  it('(f) header Cache-Control privado + max-age 30s', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_cache_001'), {
      params: Promise.resolve({ id: 'disc_cache_001' }),
    });
    const cc = res.headers.get('Cache-Control');
    expect(cc).toContain('private');
    expect(cc).toContain('max-age=30');
  });

  it('(g) query param locale=alterna locale do view-model', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_locale_001', { locale: 'en' }), {
      params: Promise.resolve({ id: 'disc_locale_001' }),
    });
    const payload = (await res.json()) as Record<string, unknown>;
    expect(payload.locale).toBe('en');
  });

  it('(h) LGPD: response NÃO inclui PII (email, name, birthDate)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_lgpd_001'), {
      params: Promise.resolve({ id: 'disc_lgpd_001' }),
    });
    const payload = (await res.json()) as Record<string, unknown>;

    // Nenhum PII direto
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('birthDate');
    expect(payload).not.toHaveProperty('userId');
    expect(payload).not.toHaveProperty('user');

    // Sem chaves que começam com prefixos PII
    for (const key of Object.keys(payload)) {
      expect(key.toLowerCase()).not.toMatch(/email|birth|cpf|rg|phone|name/);
    }
  });

  it('(i) papers tem shape ThoughtChainPaper com abstract preview', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_papers_001'), {
      params: Promise.resolve({ id: 'disc_papers_001' }),
    });
    const payload = (await res.json()) as { papers: Array<Record<string, unknown>> };
    expect(payload.papers.length).toBeGreaterThan(0);

    const first = payload.papers[0]!;
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('authors');
    expect(first).toHaveProperty('year');
    expect(first).toHaveProperty('journal');
    expect(first).toHaveProperty('abstractEn');
    expect(typeof first.authors).toBe('object');
    expect(Array.isArray(first.authors)).toBe(true);
  });

  it('(j) relatedDiscoveries tem ≤ 5 items (Wave 20.2 retrieval cap)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/discoveries/[id]/route');
    const res = await GET(makeRequest('disc_rel_cap'), {
      params: Promise.resolve({ id: 'disc_rel_cap' }),
    });
    const payload = (await res.json()) as { relatedDiscoveries: unknown[] };
    expect(payload.relatedDiscoveries.length).toBeLessThanOrEqual(5);
  });
});