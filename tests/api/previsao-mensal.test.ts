import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
// Mock any external dependencies if needed
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue(null),
}));
// Simple handler wrapper for testing
function createMockRequest(url = 'http://localhost/api/astrologia/previsao-mensal') {
  return new NextRequest(url);
}
async function handleGetRequest() {
  const { GET } = await import('@/app/api/astrologia/previsao-mensal/route');
  return GET(createMockRequest());
}

describe('GET /api/astrologia/previsao-mensal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 200 com dados válidos', async () => {
    const response = await handleGetRequest();
    expect(response.status).toBe(200);
  });
  it('deve retornar objeto com mes e ano', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    expect(data.success).toBe(true);
    expect(previsao).toHaveProperty('mes');
    expect(previsao).toHaveProperty('ano');
    expect(typeof previsao.mes).toBe('number');
    expect(typeof previsao.ano).toBe('number');
  });

  it('deve retornar mes entre 1 e 12', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    expect(previsao.mes).toBeGreaterThanOrEqual(1);
    expect(previsao.mes).toBeLessThanOrEqual(12);
  });
  it('deve retornar ano válido', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    const currentYear = new Date().getFullYear();
    expect(previsao.ano).toBe(currentYear);
  });
  it('deve incluir signosFavoraveis como array', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    expect(previsao).toHaveProperty('signosFavoraveis');
    expect(Array.isArray(previsao.signosFavoraveis)).toBe(true);
    expect(previsao.signosFavoraveis.length).toBeGreaterThan(0);
  });
  it('deve incluir desafios como array', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    expect(previsao).toHaveProperty('desafios');
    expect(Array.isArray(previsao.desafios)).toBe(true);
    expect(previsao.desafios.length).toBeGreaterThan(0);
  });
  it('deve incluir oportunidades como array', async () => {
    const response = await handleGetRequest();
    const data = await response.json();
    const previsao = data.previsao;
    expect(previsao).toHaveProperty('oportunidades');
    expect(Array.isArray(previsao.oportunidades)).toBe(true);
    expect(previsao.oportunidades.length).toBeGreaterThan(0);
  });
    expect(data).toHaveProperty('signosFavoraveis');
    expect(Array.isArray(data.signosFavoraveis)).toBe(true);
    expect(data.signosFavoraveis.length).toBeGreaterThan(0);
  });

  it('deve incluir desafios como array', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data).toHaveProperty('desafios');
    expect(Array.isArray(data.desafios)).toBe(true);
    expect(data.desafios.length).toBeGreaterThan(0);
  });

  it('deve incluir oportunidades como array', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data).toHaveProperty('oportunidades');
    expect(Array.isArray(data.oportunidades)).toBe(true);
    expect(data.oportunidades.length).toBeGreaterThan(0);
  });

  it('deve retornar signosFavoraveis como array de strings', async () => {
    const response = await handleGetRequest();
    const data = await response.json() as { signosFavoraveis: string[] };

    data.signosFavoraveis.forEach((signo) => {
      expect(typeof signo).toBe('string');
      expect(signo.length).toBeGreaterThan(0);
    });
  });

  it('deve retornar desafios como array de strings', async () => {
    const response = await handleGetRequest();
    const data = await response.json() as { desafios: string[] };

    data.desafios.forEach((desafio) => {
      expect(typeof desafio).toBe('string');
      expect(desafio.length).toBeGreaterThan(0);
    });
  });

  it('deve retornar oportunidades como array de strings', async () => {
    const response = await handleGetRequest();
    const data = await response.json() as { oportunidades: string[] };

    data.oportunidades.forEach((oportunidade) => {
      expect(typeof oportunidade).toBe('string');
      expect(oportunidade.length).toBeGreaterThan(0);
    });
  });

  it('deve conter estrutura completa do schema', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data).toEqual(
      expect.objectContaining({
        mes: expect.any(Number),
        ano: expect.any(Number),
        signosFavoraveis: expect.any(Array),
        desafios: expect.any(Array),
        oportunidades: expect.any(Array),
      })
    );
  });

  it('deve retornar mes correto para dados atuais', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    const currentMonth = new Date().getMonth() + 1;
    expect(data.mes).toBe(currentMonth);
  });

  it('deve retornar array com exatamente 3 signos favoraveis', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data.signosFavoraveis.length).toBe(3);
  });

  it('deve retornar array com exatamente 2 desafios', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data.desafios.length).toBe(2);
  });

  it('deve retornar array com exatamente 2 oportunidades', async () => {
    const response = await handleGetRequest();
    const data = await response.json();

    expect(data.oportunidades.length).toBe(2);
  });

  it('deve retornar conteúdo Content-Type application/json', async () => {
    const response = await handleGetRequest();

    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('deve responder em tempo razoável', async () => {
    const startTime = Date.now();
    await handleGetRequest();
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000);
  });
});