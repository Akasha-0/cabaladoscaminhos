/**
 * Mapa API Integration Tests
 * Tests POST /api/mapa route with Redis caching, validation, and error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================
// MOCKS
// ============================================================

// Mock Redis client
const mockRedisGet = vi.fn<() => Promise<string | null>>();
const mockRedisSet = vi.fn<() => Promise<unknown>>();

vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn(() =>
    Promise.resolve({
      get: mockRedisGet,
      set: mockRedisSet,
      incr: vi.fn(),
      expire: vi.fn(),
      ping: vi.fn(() => Promise.resolve('PONG')),
      quit: vi.fn(),
      disconnect: vi.fn(),
    })
  ),
  useMemory: false,
  inMemoryStore: new Map(),
}));

// Mock spiritual engine
const mockMapaResult = {
  perfil: {
    nomeCompleto: 'Test User',
    dataNascimento: '1985-03-15',
    hora: '14:30',
    cidade: 'São Paulo',
    estado: 'SP',
    pais: 'BR',
  },
  numerologia: {
    vida: 7,
    expressao: 5,
    motivacao: 3,
    impressao: 2,
    destino: 9,
    cicloAtual: 8,
    anoPessoal: 3,
    metodoUsado: 'pitagorica',
  },
  odu: {
    regente: { numero: 8, nome: 'Ogbe', opeCima: '—', opeBaixo: '—', elementos: '', orixaRegente: 'Oxalá', significado: '' },
    secundario: null,
    orixas: ['Ogum'],
    quizilas: ['Xê'],
    preceitos: ['Não mentir'],
    ebos: ['Ebó de Oxalá'],
    elemento: 'Ar',
    arcanoTarot: 8,
    caminhoSephirah: 'Hod',
  },
  astrologia: {
    ascendente: 'leao',
    sol: { planeta: 'sol', longitude: 15, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 15 },
    lua: { planeta: 'lua', longitude: 90, latitude: 0, distancia: 1, velocidade: 0, signo: 'cancer', casa: 4, grauNoSigno: 1 },
    mercurio: { planeta: 'mercurio', longitude: 30, latitude: 0, distancia: 1, velocidade: 0, signo: 'gemeos', casa: 3, grauNoSigno: 1 },
    venus: { planeta: 'venus', longitude: 60, latitude: 0, distancia: 1, velocidade: 0, signo: 'touro', casa: 2, grauNoSigno: 1 },
    marte: { planeta: 'marte', longitude: 120, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries', casa: 1, grauNoSigno: 1 },
    jupiter: { planeta: 'jupiter', longitude: 150, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario', casa: 9, grauNoSigno: 1 },
    saturno: { planeta: 'saturno', longitude: 180, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio', casa: 10, grauNoSigno: 1 },
    urano: { planeta: 'urano', longitude: 210, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario', casa: 11, grauNoSigno: 1 },
    netuno: { planeta: 'netuno', longitude: 240, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes', casa: 12, grauNoSigno: 1 },
    plutao: { planeta: 'plutao', longitude: 270, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio', casa: 8, grauNoSigno: 1 },
    casas: [],
    aspectos: [],
  },
  tarot: {
    cartaNascimento: 7,
    cartaAnoPessoal: 12,
    cartaAlma: 19,
    interpretacao: { name: 'O Eremita', upright: 'Introspecção', reversed: '' },
    cartasAdicionais: [],
  },
  chakras: {
    chakras: [],
    dominante: 'Plexo Solar',
    bloqueado: 'Raiz',
    equilibrio: 70,
  },
  convergencias: [
    { sistemas: ['numerologia', 'odu'], energia: 'ogum', forca: 'forte', descricao: 'Caminho de Vida 7 alinha-se com Ogbe.' },
  ],
  orixasDominantes: ['Ogum', 'Oxalá'],
  dataCalculo: '2025-01-15T10:00:00.000Z',
  versao: '1.0.0',
};

const mockGerarMapaAlmaCompleto = vi.fn(() => Promise.resolve(mockMapaResult));

vi.mock('@/lib/engines/spiritual-engine', () => ({
  gerarMapaAlmaCompleto: mockGerarMapaAlmaCompleto,
  detectarConvergencias: vi.fn(() => []),
}));

// ============================================================
// HELPERS
// ============================================================

function createMapaRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/mapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ============================================================
// TEST SUITE
// ============================================================

describe('POST /api/mapa', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const mapaModule = await import('@/app/api/mapa/route');
    POST = mapaModule.POST;
    vi.clearAllMocks();
    mockRedisGet.mockResolvedValue(null);
    mockRedisSet.mockResolvedValue('OK');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // HAPPY PATH TESTS
  // ============================================================

  describe('Happy Path', () => {
    it('returns 200 with MapaAlmaCompleto structure', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      const body = await response.json() as Record<string, unknown>;

      expect(body).toHaveProperty('perfil');
      expect(body).toHaveProperty('numerologia');
      expect(body).toHaveProperty('odu');
      expect(body).toHaveProperty('astrologia');
      expect(body).toHaveProperty('tarot');
      expect(body).toHaveProperty('chakras');
      expect(body).toHaveProperty('convergencias');
      expect(body).toHaveProperty('orixasDominantes');
      expect(body).toHaveProperty('dataCalculo');
      expect(body).toHaveProperty('versao');
    });

    it('contains perfil with correct fields', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'João Silva',
        dataNascimento: '1990-06-15',
        hora: '10:30',
        cidade: 'Rio de Janeiro',
      });

      const response = await POST(request);
      const body = await response.json() as { perfil: Record<string, unknown> };

      expect(body.perfil).toHaveProperty('nomeCompleto');
      expect(body.perfil).toHaveProperty('dataNascimento');
      expect(body.perfil).toHaveProperty('hora');
      expect(body.perfil).toHaveProperty('cidade');
      expect(typeof body.perfil.nomeCompleto).toBe('string');
      expect(typeof body.perfil.dataNascimento).toBe('string');
    });

    it('contains numerologia with vida number in valid range', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Ana Costa',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const body = await response.json() as { numerologia: { vida: number } };

      expect(body.numerologia).toBeDefined();
      expect(typeof body.numerologia.vida).toBe('number');
      expect(body.numerologia.vida).toBeGreaterThanOrEqual(1);
      expect(body.numerologia.vida).toBeLessThanOrEqual(33);
    });

    it('contains odu with regente information', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1990-06-15',
      });

      const response = await POST(request);
      const body = await response.json() as { odu: { regente: { nome: string }; orixas: string[] } };

      expect(body.odu).toBeDefined();
      expect(body.odu.regente).toBeDefined();
      expect(typeof body.odu.regente.nome).toBe('string');
      expect(Array.isArray(body.odu.orixas)).toBe(true);
      expect(body.odu.orixas.length).toBeGreaterThan(0);
    });

    it('contains astrologia with planet positions', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '2000-01-01',
      });

      const response = await POST(request);
      const body = await response.json() as { astrologia: Record<string, unknown> };

      expect(body.astrologia).toBeDefined();
      expect(body.astrologia).toHaveProperty('sol');
      expect(body.astrologia).toHaveProperty('lua');
      expect(body.astrologia).toHaveProperty('ascendente');
    });

    it('contains tarot with birth card in range 0-21', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Maria Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const body = await response.json() as { tarot: { cartaNascimento: number } };

      expect(body.tarot).toBeDefined();
      expect(body.tarot.cartaNascimento).toBeGreaterThanOrEqual(0);
      expect(body.tarot.cartaNascimento).toBeLessThanOrEqual(21);
    });

    it('contains chakras with balance information', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const body = await response.json() as { chakras: { dominante: string; equilibrio: number } };

      expect(body.chakras).toBeDefined();
      expect(typeof body.chakras.dominante).toBe('string');
      expect(typeof body.chakras.equilibrio).toBe('number');
    });

    it('contains convergencias array', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Carlos Santos',
        dataNascimento: '1970-01-01',
      });

      const response = await POST(request);
      const body = await response.json() as { convergencias: unknown[] };

      expect(Array.isArray(body.convergencias)).toBe(true);
    });

    it('contains orixasDominantes array', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const body = await response.json() as { orixasDominantes: string[] };

      expect(Array.isArray(body.orixasDominantes)).toBe(true);
      expect(body.orixasDominantes.length).toBeGreaterThan(0);
    });

    it('contains dataCalculo in ISO format', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);
      const body = await response.json() as { dataCalculo: string; versao: string };

      expect(typeof body.dataCalculo).toBe('string');
      expect(body.dataCalculo).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.versao).toBe('1.0.0');
    });

    it('accepts optional hora field', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Ana Costa',
        dataNascimento: '1985-03-15',
        hora: '14:30',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('accepts optional cidade field', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Ana Costa',
        dataNascimento: '1985-03-15',
        cidade: 'São Paulo',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('accepts optional estado and pais fields', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Ana Costa',
        dataNascimento: '1985-03-15',
        estado: 'SP',
        pais: 'BR',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  // ============================================================
  // VALIDATION ERROR TESTS
  // ============================================================

  describe('Validation Errors', () => {
    it('returns 400 when nomeCompleto is missing', async () => {
      const request = createMapaRequest({
        dataNascimento: '1990-01-01',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const body = await response.json() as { error: string };
      expect(body.error).toBe('Dados inválidos');
    });

    it('returns 400 when nomeCompleto is too short (min 2 chars)', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'A',
        dataNascimento: '1990-01-01',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 when dataNascimento is missing', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const body = await response.json() as { error: string };
      expect(body.error).toBe('Dados inválidos');
    });

    it('returns 400 when dataNascimento has invalid format', async () => {
      const invalidDates = [
        '01-01-1990',
        '1990/01/01',
        '1990-1-1',
        '90-01-01',
        'invalid',
      ];

      for (const invalidDate of invalidDates) {
        const request = createMapaRequest({
          nomeCompleto: 'Test User',
          dataNascimento: invalidDate,
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      }
    });

    it('accepts empty cidade string (optional field)', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1990-01-01',
        cidade: '',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('accepts optional hora field with any format', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Test User',
        dataNascimento: '1990-01-01',
        hora: '12345',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('returns proper error structure on validation failure', async () => {
      const request = createMapaRequest({
        dataNascimento: 'invalid-date',
      });

      const response = await POST(request);
      const body = await response.json() as { error: string; details: unknown };

      expect(response.status).toBe(400);
      expect(body.error).toBe('Dados inválidos');
      expect(body.details).toBeDefined();
    });
  });

  // ============================================================
  // CACHE TESTS
  // ============================================================

  describe('Cache Behavior', () => {
    it('does not call spiritual engine on cache hit', async () => {
      const cachedData = JSON.stringify(mockMapaResult);
      mockRedisGet.mockResolvedValue(cachedData);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGerarMapaAlmaCompleto).not.toHaveBeenCalled();
    });

    it('calls spiritual engine on cache miss', async () => {
      mockRedisGet.mockResolvedValue(null);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request);

      expect(mockGerarMapaAlmaCompleto).toHaveBeenCalled();
    });

    it('stores result in cache after calculation', async () => {
      mockRedisGet.mockResolvedValue(null);
      mockRedisSet.mockResolvedValue('OK');

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request);

      expect(mockRedisSet).toHaveBeenCalledWith(
        expect.stringContaining('mapa:'),
        expect.any(String),
        'EX',
        expect.any(Number)
      );
    });

    it('second call with same data uses cache', async () => {
      mockRedisGet.mockResolvedValue(null);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request);
      expect(mockGerarMapaAlmaCompleto).toHaveBeenCalledTimes(1);

      mockRedisGet.mockResolvedValue(JSON.stringify(mockMapaResult));
      vi.clearAllMocks();

      await POST(request);
      expect(mockGerarMapaAlmaCompleto).not.toHaveBeenCalled();
    });

    it('uses SHA-256 hash for cache key based on nome+dataNascimento', async () => {
      mockRedisGet.mockResolvedValue(null);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request);

      const setCall = mockRedisSet.mock.calls[0];
      const cacheKey = setCall[0] as string;

      expect(cacheKey).toMatch(/^mapa:[a-f0-9]{64}$/);
    });

    it('different nome produces different cache key', async () => {
      mockRedisGet.mockResolvedValue(null);
      mockRedisSet.mockClear();

      const request1 = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request1);
      const key1 = mockRedisSet.mock.calls[0][0] as string;

      const request2 = createMapaRequest({
        nomeCompleto: 'João Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request2);
      const key2 = mockRedisSet.mock.calls[1][0] as string;

      expect(key1).not.toBe(key2);
    });

    it('different dataNascimento produces different cache key', async () => {
      mockRedisGet.mockResolvedValue(null);
      mockRedisSet.mockClear();

      const request1 = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request1);
      const key1 = mockRedisSet.mock.calls[0][0] as string;

      const request2 = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1990-01-01',
      });

      await POST(request2);
      const key2 = mockRedisSet.mock.calls[1][0] as string;

      expect(key1).not.toBe(key2);
    });

    it('cache TTL is 24 hours (86400 seconds)', async () => {
      mockRedisGet.mockResolvedValue(null);
      mockRedisSet.mockResolvedValue('OK');

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      await POST(request);

      const setCall = mockRedisSet.mock.calls[0];
      expect(setCall[2]).toBe('EX');
      expect(setCall[3]).toBe(86400);
    });

    it('returns cached response on cache hit', async () => {
      const cachedData = {
        ...mockMapaResult,
        perfil: { nomeCompleto: 'Cached User', dataNascimento: '1990-01-01', hora: '', cidade: '', estado: '', pais: '' },
      };
      mockRedisGet.mockResolvedValue(JSON.stringify(cachedData));

      const request = createMapaRequest({
        nomeCompleto: 'Cached User',
        dataNascimento: '1990-01-01',
      });

      const response = await POST(request);
      const body = await response.json() as { perfil: { nomeCompleto: string } };

      expect(body.perfil.nomeCompleto).toBe('Cached User');
    });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  describe('Error Handling', () => {
    it('returns 500 with generic message on server error', async () => {
      mockGerarMapaAlmaCompleto.mockRejectedValueOnce(new Error('Internal error'));
      mockRedisGet.mockResolvedValue(null);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const body = await response.json() as { error: string };
      expect(body.error).toBe('Erro interno ao gerar Mapa da Alma');
    });

    it('does not expose stack trace in production error response', async () => {
      mockGerarMapaAlmaCompleto.mockRejectedValueOnce(
        new Error('Database connection failed: too many connections')
      );
      mockRedisGet.mockResolvedValue(null);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const bodyText = await response.text();
      expect(bodyText).not.toContain('stack');
      expect(bodyText).not.toContain('Error:');
      expect(bodyText).not.toContain('at ');
    });

    it('handles JSON parse errors gracefully', async () => {
      const badRequest = new NextRequest('http://localhost:3000/api/mapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      });

      const response = await POST(badRequest);

      expect(response.status).toBe(500);
    });

    it('returns 200 when Redis set fails (cache is non-fatal)', async () => {
      mockRedisGet.mockResolvedValue(null);
      mockRedisSet.mockRejectedValue(new Error('Redis unavailable'));
      mockGerarMapaAlmaCompleto.mockResolvedValue(mockMapaResult);

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('falls through to calculation when Redis get fails', async () => {
      mockRedisGet.mockRejectedValue(new Error('Redis unavailable'));

      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGerarMapaAlmaCompleto).toHaveBeenCalled();
    });
  });

  // ============================================================
  // RESPONSE STRUCTURE VERIFICATION
  // ============================================================

  describe('MapaAlmaCompleto Response Structure', () => {
    it('matches expected type structure', async () => {
      const request = createMapaRequest({
        nomeCompleto: 'Maria da Silva',
        dataNascimento: '1985-03-15',
        hora: '14:30',
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'BR',
      });

      const response = await POST(request);
      const body = await response.json() as {
        perfil: {
          nomeCompleto: string;
          dataNascimento: string;
          hora?: string;
          cidade: string;
        };
        numerologia: {
          vida: number;
          expressao: number;
          motivacao: number;
          impressao: number;
          destino: number;
          cicloAtual: number;
          anoPessoal: number;
          metodoUsado: string;
        };
        odu: {
          regente: { numero: number; nome: string };
          secundario: unknown;
          orixas: string[];
          quizilas: string[];
          preceitos: string[];
          ebos: string[];
          elemento: string;
          arcanoTarot: number;
          caminhoSephirah: string;
        };
        astrologia: {
          ascendente: string;
          sol: unknown;
          lua: unknown;
          casas: unknown[];
          aspectos: unknown[];
        };
        tarot: {
          cartaNascimento: number;
          cartaAnoPessoal: number;
          cartaAlma: number;
          interpretacao: { name: string; upright: string; reversed: string };
          cartasAdicionais: unknown[];
        };
        chakras: {
          chakras: unknown[];
          dominante: string;
          bloqueado: string;
          equilibrio: number;
        };
        convergencias: unknown[];
        orixasDominantes: string[];
        dataCalculo: string;
        versao: string;
      };

      expect(body.perfil).toHaveProperty('nomeCompleto');
      expect(typeof body.numerologia.vida).toBe('number');
      expect(typeof body.odu.regente.numero).toBe('number');
      expect(typeof body.astrologia.ascendente).toBe('string');
      expect(typeof body.tarot.cartaNascimento).toBe('number');
      expect(typeof body.chakras.equilibrio).toBe('number');
      expect(Array.isArray(body.convergencias)).toBe(true);
      expect(Array.isArray(body.orixasDominantes)).toBe(true);
      expect(body.versao).toBe('1.0.0');
    });
  });
});