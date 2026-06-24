/**
 * Integration tests for /api/akasha/tratamento/calcular.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(async () => ({ id: 'zelador-1', email: 'a@b.c', name: 'Test' })),
}));

vi.mock('@/lib/application/akasha/tratamento-logger', () => ({
  logSintetizarRequest: vi.fn(),
}));

const mockSintetizar = vi.fn(async () => ({
  versao: 'v1',
  disclaimer: 'Este conteúdo é orientativo...',
  camadas: {
    'camada-1-diagnostico': {
      id: 'camada-1-diagnostico',
      titulo: 'Diagnóstico Imediato',
      conteudo: 'Pessoa com orí quente.',
      fontes: [],
      requires_professional_review: false,
    },
    'camada-2-praticas-imediatas': { id: 'camada-2-praticas-imediatas', titulo: 'Práticas', conteudo: null, fontes: [], requires_professional_review: false },
    'camada-3-tratamento-por-area': { id: 'camada-3-tratamento-por-area', titulo: 'Tratamento', conteudo: null, fontes: [], requires_professional_review: false },
    'camada-4-quisilas': { id: 'camada-4-quisilas', titulo: 'Quisilas', conteudo: null, fontes: [], requires_professional_review: false },
    'camada-5-alinhamento-energetico': { id: 'camada-5-alinhamento-energetico', titulo: 'Alinhamento', conteudo: null, fontes: [], requires_professional_review: false },
    'camada-6-psicanalise': { id: 'camada-6-psicanalise', titulo: 'Psicanálise', conteudo: null, fontes: [], requires_professional_review: true },
    'camada-7-coaching': { id: 'camada-7-coaching', titulo: 'Coaching', conteudo: null, fontes: [], requires_professional_review: true },
  },
  cadeia_pensamento: [],
}));

vi.mock('@akasha/tratamento', () => ({
  sintetizar: mockSintetizar,
}));

describe('POST /api/akasha/tratamento/calcular', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    zeladorId: 'cl1234567890abcdefghij',
    caminhadaId: 'cl1234567890abcdefghij',
    consulenteNome: 'João',
    dataNascimento: '1990-01-01',
    horaNascimento: '12:00',
    localNascimento: 'São Paulo, Brasil',
  };

  it('returns 200 with 7 camadas on valid body', async () => {
    const { POST } = await import('../../../../../apps/akasha-portal/src/app/api/akasha/tratamento/calcular/route');
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json', cookie: 'akasha_session=token' },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.output.camadas).toBeDefined();
    expect(Object.keys(json.output.camadas)).toHaveLength(7);
  });

  it('returns 400 on invalid body', async () => {
    const { POST } = await import('../../../../../apps/akasha-portal/src/app/api/akasha/tratamento/calcular/route');
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify({ zeladorId: 'x' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_input');
  });

  it('flags cvv188 when crisis text detected', async () => {
    const { POST } = await import('../../../../../apps/akasha-portal/src/app/api/akasha/tratamento/calcular/route');
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, consulenteNome: 'Paciente quer morrer' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(json.cvv188).toBe(true);
  });

  it('does not flag cvv188 on normal text', async () => {
    const { POST } = await import('../../../../../apps/akasha-portal/src/app/api/akasha/tratamento/calcular/route');
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(json.cvv188).toBe(false);
  });

  it('returns 500 when engine throws', async () => {
    mockSintetizar.mockRejectedValueOnce(new Error('engine crashed'));
    const { POST } = await import('../../../../../apps/akasha-portal/src/app/api/akasha/tratamento/calcular/route');
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
