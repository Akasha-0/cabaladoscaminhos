/**
 * @akasha/portal — GET /api/literature/[id]/sessions tests (Wave 27.5)
 *
 * Cobertura:
 *   (a) Auth: sem cookie akasha_session → 401 Unauthorized.
 *   (b) id inválido (vazio / > 128 chars) → 400 invalid_id.
 *   (c) id válido + auth → 200 com envelope { paperId, total, sessions }.
 *   (d) sessions tem shape PaperSessionRef (id, caminhanteLabel, tipo,
 *       status, abertoEm, fechadoEm, excerpt).
 *   (e) Mesmo id → mesma lista (mock determinístico).
 *   (f) Header Cache-Control privado + max-age 30s.
 *   (g) tipo ∈ { Apresentacao, Leitura, Ritual, Aconselhamento, Integracao }.
 *   (h) status ∈ { aberta, fechada }.
 *   (i) fechadoEm é null OU ISO date válida.
 *   (j) LGPD: response NÃO inclui PII do caminhante (nomeCompleto, contato).
 *   (k) caminhanateLabel é label público (#N), nunca nome real.
 *   (l) total === sessions.length.
 *   (m) excerpt ≤ 120 chars.
 *   (n) sessions "fechada" sempre tem fechadoEm definido.
 *   (o) sessions "aberta" sempre tem fechadoEm === null.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ─── Mocks ────────────────────────────────────────────────────────────────

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

// ─── Helpers ─────────────────────────────────────────────────────────────

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

function makeRequest(paperId: string, opts: { auth?: boolean } = {}): NextRequest {
  const { auth = true } = opts;
  const headers: Record<string, string> = {};
  if (auth) headers['cookie'] = 'akasha_session=valid-jwt';
  return new NextRequest(
    `http://localhost/api/literature/${encodeURIComponent(paperId)}/sessions`,
    { headers }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Tests ───────────────────────────────────────────────────────────────

describe('GET /api/literature/[id]/sessions — Wave 27.5 (Literature XRef)', () => {
  it('(a) sem auth → 401 Unauthorized', async () => {
    mockAuth(false);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('paper_x', { auth: false }), {
      params: Promise.resolve({ id: 'paper_x' }),
    });
    expect(res.status).toBe(401);
  });

  it('(b) id vazio → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: '' }),
    });
    expect(res.status).toBe(400);
    const payload = (await res.json()) as { error: string };
    expect(payload.error).toBe('invalid_id');
  });

  it('(b.2) id > 128 chars → 400 invalid_id', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const longId = 'a'.repeat(200);
    const res = await GET(makeRequest('placeholder', {}), {
      params: Promise.resolve({ id: longId }),
    });
    expect(res.status).toBe(400);
  });

  it('(c) id válido + auth → 200 com envelope { paperId, total, sessions }', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('paper_riba_2003'), {
      params: Promise.resolve({ id: 'paper_riba_2003' }),
    });
    expect(res.status).toBe(200);
    const payload = (await res.json()) as Record<string, unknown>;
    expect(payload.paperId).toBe('paper_riba_2003');
    expect(typeof payload.total).toBe('number');
    expect(Array.isArray(payload.sessions)).toBe(true);
  });

  it('(d) sessions tem shape PaperSessionRef completo', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('paper_test_shape'), {
      params: Promise.resolve({ id: 'paper_test_shape' }),
    });
    const payload = (await res.json()) as { sessions: Array<Record<string, unknown>> };

    if (payload.sessions.length > 0) {
      const first = payload.sessions[0]!;
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('caminhanteLabel');
      expect(first).toHaveProperty('tipo');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('abertoEm');
      expect(first).toHaveProperty('fechadoEm');
      expect(first).toHaveProperty('excerpt');

      expect(typeof first.id).toBe('string');
      expect(typeof first.caminhanteLabel).toBe('string');
      expect(typeof first.tipo).toBe('string');
      expect(typeof first.status).toBe('string');
      expect(typeof first.abertoEm).toBe('string');
      expect(typeof first.excerpt).toBe('string');
    }
  });

  it('(e) mesmo id → mesma lista (mock determinístico)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const a = await GET(makeRequest('paper_det_001'), {
      params: Promise.resolve({ id: 'paper_det_001' }),
    });
    const b = await GET(makeRequest('paper_det_001'), {
      params: Promise.resolve({ id: 'paper_det_001' }),
    });
    const pa = (await a.json()) as {
      total: number;
      sessions: Array<{ id: string; tipo: string; abertoEm: string }>;
    };
    const pb = (await b.json()) as {
      total: number;
      sessions: Array<{ id: string; tipo: string; abertoEm: string }>;
    };
    expect(pa.total).toBe(pb.total);
    expect(pa.sessions.length).toBe(pb.sessions.length);
    for (let i = 0; i < pa.sessions.length; i++) {
      expect(pa.sessions[i]!.id).toBe(pb.sessions[i]!.id);
      expect(pa.sessions[i]!.tipo).toBe(pb.sessions[i]!.tipo);
      expect(pa.sessions[i]!.abertoEm).toBe(pb.sessions[i]!.abertoEm);
    }
  });

  it('(f) header Cache-Control privado + max-age 30s', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('paper_cache_001'), {
      params: Promise.resolve({ id: 'paper_cache_001' }),
    });
    const cc = res.headers.get('Cache-Control');
    expect(cc).toContain('private');
    expect(cc).toContain('max-age=30');
  });

  it('(g) tipo ∈ { Apresentacao, Leitura, Ritual, Aconselhamento, Integracao }', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const validTipos = new Set([
      'Apresentacao', 'Leitura', 'Ritual', 'Aconselhamento', 'Integracao',
    ]);
    for (const id of [
      'paper_tipo_001', 'paper_tipo_002', 'paper_tipo_003', 'paper_tipo_004',
      'paper_tipo_005', 'paper_tipo_006',
    ]) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ tipo: string }>;
      };
      for (const s of payload.sessions) {
        expect(validTipos.has(s.tipo)).toBe(true);
      }
    }
  });

  it('(h) status ∈ { aberta, fechada }', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    for (const id of [
      'paper_st_001', 'paper_st_002', 'paper_st_003', 'paper_st_004',
    ]) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ status: string }>;
      };
      for (const s of payload.sessions) {
        expect(['aberta', 'fechada']).toContain(s.status);
      }
    }
  });

  it('(i) fechadoEm é null OU ISO date válida', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    for (const id of ['paper_fm_001', 'paper_fm_002', 'paper_fm_003']) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ fechadoEm: string | null }>;
      };
      for (const s of payload.sessions) {
        if (s.fechadoEm !== null) {
          expect(s.fechadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
          expect(Number.isFinite(Date.parse(s.fechadoEm))).toBe(true);
        }
      }
    }
  });

  it('(j) LGPD: response NÃO inclui PII do caminhante', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const res = await GET(makeRequest('paper_lgpd_001'), {
      params: Promise.resolve({ id: 'paper_lgpd_001' }),
    });
    const payload = (await res.json()) as Record<string, unknown>;

    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('name');
    expect(payload).not.toHaveProperty('birthDate');
    expect(payload).not.toHaveProperty('userId');
    expect(payload).not.toHaveProperty('user');

    for (const key of Object.keys(payload)) {
      expect(key.toLowerCase()).not.toMatch(/email|birth|cpf|rg|phone|name/);
    }

    // Nenhuma session tem campos PII direta
    const sessions = payload.sessions as Array<Record<string, unknown>>;
    for (const s of sessions) {
      expect(s).not.toHaveProperty('nomeCompleto');
      expect(s).not.toHaveProperty('contato');
      expect(s).not.toHaveProperty('saudeRelevante');
      expect(s).not.toHaveProperty('caminhante');
      expect(s).not.toHaveProperty('caminhanteId');
      for (const key of Object.keys(s)) {
        // Apenas campos públicos permitidos
        expect([
          'id',
          'caminhanteLabel',
          'tipo',
          'status',
          'abertoEm',
          'fechadoEm',
          'excerpt',
        ]).toContain(key);
      }
    }
  });

  it('(k) caminhanteLabel é label público (#N), nunca nome real', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    for (const id of ['paper_lbl_001', 'paper_lbl_002', 'paper_lbl_003']) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ caminhanteLabel: string }>;
      };
      for (const s of payload.sessions) {
        // Formato "Caminhante #N" — anonimizado
        expect(s.caminhanteLabel).toMatch(/^Caminhante #\d+$/);
      }
    }
  });

  it('(l) total === sessions.length (invariante do envelope)', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    for (const id of ['paper_inv_001', 'paper_inv_002', 'paper_inv_003']) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        total: number;
        sessions: unknown[];
      };
      expect(payload.total).toBe(payload.sessions.length);
    }
  });

  it('(m) excerpt ≤ 120 chars', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    for (const id of ['paper_exc_001', 'paper_exc_002', 'paper_exc_003']) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ excerpt: string }>;
      };
      for (const s of payload.sessions) {
        expect(s.excerpt.length).toBeLessThanOrEqual(120);
      }
    }
  });

  it('(n) sessions "fechada" sempre tem fechadoEm definido', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    // Itera até achar uma sessão fechada
    const ids = [
      'paper_n1', 'paper_n2', 'paper_n3', 'paper_n4', 'paper_n5',
      'paper_n6', 'paper_n7', 'paper_n8', 'paper_n9', 'paper_n10',
    ];
    let foundFechada = false;
    for (const id of ids) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ status: string; fechadoEm: string | null }>;
      };
      for (const s of payload.sessions) {
        if (s.status === 'fechada') {
          expect(s.fechadoEm).not.toBeNull();
          foundFechada = true;
        }
      }
    }
    expect(foundFechada).toBe(true);
  });

  it('(o) sessions "aberta" sempre tem fechadoEm === null', async () => {
    mockAuth(true);
    const { GET } = await import('@/app/api/literature/[id]/sessions/route');
    const ids = [
      'paper_o1', 'paper_o2', 'paper_o3', 'paper_o4', 'paper_o5',
      'paper_o6', 'paper_o7', 'paper_o8',
    ];
    let foundAberta = false;
    for (const id of ids) {
      const res = await GET(makeRequest(id), {
        params: Promise.resolve({ id }),
      });
      const payload = (await res.json()) as {
        sessions: Array<{ status: string; fechadoEm: string | null }>;
      };
      for (const s of payload.sessions) {
        if (s.status === 'aberta') {
          expect(s.fechadoEm).toBeNull();
          foundAberta = true;
        }
      }
    }
    expect(foundAberta).toBe(true);
  });
});
