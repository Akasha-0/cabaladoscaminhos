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

  // Importa a rota via alias @ (mapeado para apps/akasha-portal/src/ em
  // vitest.config.ts). Mantém paridade com o padrão usado em outros tests/api/**.
  const routeImportPath = '@/app/api/akasha/tratamento/calcular/route';

  it('returns 200 with 7 camadas on valid body', async () => {
    const { POST } = await import(/* @vite-ignore */ routeImportPath);
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
    const { POST } = await import(/* @vite-ignore */ routeImportPath);
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
    const { POST } = await import(/* @vite-ignore */ routeImportPath);
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
    const { POST } = await import(/* @vite-ignore */ routeImportPath);
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
    const { POST } = await import(/* @vite-ignore */ routeImportPath);
    const req = new Request('http://test/api/akasha/tratamento/calcular', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });

  /**
   * A.3 — Wave 7.4: 503 path coverage.
   *
   * A rota faz dynamic import do @akasha/tratamento com .catch que devolve
   * `{ sintetizar: null }`. Quando o engine está indisponível (sintetizar falsy),
   * a rota responde 503 + body { error: 'engine_unavailable' }.
   *
   * Estratégia: importar o módulo mockado e setar `sintetizar = null` para
   * forçar o branch `if (!sintetizar)`. Como o `vi.mock` é hoisted e o
   * dynamic import dentro da rota resolve para o mesmo module record, a
   * mutação afeta tanto o teste quanto a execução do POST handler.
   */
  it('A.3: returns 503 with engine_unavailable when @akasha/tratamento is unavailable', async () => {
    // 1. Força o engine indisponível: sintetizar = null
    const tratamentoModule = await import('@akasha/tratamento');
    const originalSintetizar = tratamentoModule.sintetizar;
    Object.defineProperty(tratamentoModule, 'sintetizar', {
      value: null,
      configurable: true,
      writable: true,
    });

    try {
      // 2. Importa a rota (mesmo module record)
      const { POST } = await import(/* @vite-ignore */ routeImportPath);

      // 3. Dispara o POST com body válido
      const req = new Request('http://test/api/akasha/tratamento/calcular', {
        method: 'POST',
        body: JSON.stringify(validBody),
        headers: { 'content-type': 'application/json' },
      });

      // 4. Verifica status 503 + body { error: 'engine_unavailable' }
      const res = await POST(req as never);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json).toEqual({ error: 'engine_unavailable' });

      // 5. Engine NÃO deve ter sido invocado (sintetizar é null)
      expect(mockSintetizar).not.toHaveBeenCalled();
    } finally {
      // 6. Restaura o mock para não vazar estado entre testes
      Object.defineProperty(tratamentoModule, 'sintetizar', {
        value: originalSintetizar,
        configurable: true,
        writable: true,
      });
    }
  });
});
