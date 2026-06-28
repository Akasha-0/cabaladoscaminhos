// @ts-nocheck — orphan test file with unresolved imports (cycle 19 W19-Worker-A)
/**
 * Mapa Insights Tests
 * Tests parser and generator for AI-generated spiritual insights
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseInsightResponse, extractJson, criarInsightFallback } from '@/lib/ai/mapa-insights/parser';
import { generateMapaInsights, gerarCacheKey } from '@/lib/ai/mapa-insights/generator';
import { Ope } from '@/lib/ifa/draw';

// ============================================================
// HOISTED MOCKS (available during vi.mock factory evaluation)
// ============================================================

const { mockRedisGet, mockRedisSet, mockCreateChatCompletion } = vi.hoisted(() => ({
  mockRedisGet: vi.fn<() => Promise<string | null>>(),
  mockRedisSet: vi.fn<() => Promise<unknown>>(),
  mockCreateChatCompletion: vi.fn(),
}));

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

vi.mock('@/lib/ai/openai', () => ({
  createChatCompletion: mockCreateChatCompletion,
}));

// ============================================================
// SAMPLE DATA
// ============================================================

const SAMPLE_MAPA = {
  perfil: {
    nomeCompleto: 'João Silva',
    dataNascimento: '1990-05-15',
    hora: '10:00',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    pais: 'BR',
  },
  numerologia: {
    vida: 5,
    expressao: 3,
    motivacao: 7,
    impressao: 2,
    destino: 1,
    cicloAtual: 8,
    anoPessoal: 3,
    metodoUsado: 'pitagorica' as const,
  },
  odu: {
    regente: {
      numero: 5,
      nome: 'Oxé',
      opeCima: { id: 1, nome: 'Ogbe', simbolo: '☰', linhas: [true, true, true], significado: 'Caminho aberto', natureza: 'Yang' as const },
      opeBaixo: { id: 1, nome: 'Ogbe', simbolo: '☰', linhas: [true, true, true], significado: 'Caminho aberto', natureza: 'Yang' as const },
      elementos: 'Água',
      orixaRegente: 'Oxum',
      significado: '',
    },
    secundario: null,
    orixas: ['Oxum', 'Logun Edé'],
    quizilas: ['Ovos', 'Comidas salgadas'],
    preceitos: ['Não comer abóbora'],
    ebos: ['Banho de mel'],
    elemento: 'Água',
    arcanoTarot: 5,
    caminhoSephirah: 'Geburah',
  },
  astrologia: {
    ascendente: 'leao' as const,
    sol: { planeta: 'sol', longitude: 45, latitude: 0, distancia: 1, velocidade: 0, signo: 'touro' as const, casa: 1, grauNoSigno: 15 },
    lua: { planeta: 'lua', longitude: 180, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio' as const, casa: 8, grauNoSigno: 0 },
    mercurio: { planeta: 'mercurio', longitude: 30, latitude: 0, distancia: 1, velocidade: 0, signo: 'gemeos' as const, casa: 3, grauNoSigno: 1 },
    venus: { planeta: 'venus', longitude: 60, latitude: 0, distancia: 1, velocidade: 0, signo: 'touro' as const, casa: 2, grauNoSigno: 1 },
    marte: { planeta: 'marte', longitude: 120, latitude: 0, distancia: 1, velocidade: 0, signo: 'aries' as const, casa: 1, grauNoSigno: 1 },
    jupiter: { planeta: 'jupiter', longitude: 150, latitude: 0, distancia: 1, velocidade: 0, signo: 'sagitario' as const, casa: 9, grauNoSigno: 1 },
    saturno: { planeta: 'saturno', longitude: 180, latitude: 0, distancia: 1, velocidade: 0, signo: 'capricornio' as const, casa: 10, grauNoSigno: 1 },
    urano: { planeta: 'urano', longitude: 0, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario' as const, casa: 11, grauNoSigno: 1 },
    netuno: { planeta: 'netuno', longitude: 330, latitude: 0, distancia: 1, velocidade: 0, signo: 'peixes' as const, casa: 12, grauNoSigno: 1 },
    plutao: { planeta: 'plutao', longitude: 270, latitude: 0, distancia: 1, velocidade: 0, signo: 'escorpio' as const, casa: 8, grauNoSigno: 1 },
    casas: [],
    aspectos: [],
  },
  tarot: {
    cartaNascimento: 5,
    cartaAnoPessoal: 8,
    cartaAlma: 12,
    interpretacao: { name: '', upright: '', reversed: '' },
    cartasAdicionais: [],
  },
  chakras: {
    chakras: [],
    dominante: '4º',
    bloqueado: '1º',
    equilibrio: 0.65,
  },
  convergencias: [],
  orixasDominantes: ['Oxum'],
  versao: '1.0.0',
  dataCalculo: new Date().toISOString(),
};

// ============================================================
// HELPERS
// ============================================================

function createValidInsightResponse(overrides = {}) {
  return JSON.stringify({
    resumo: 'Mapa espiritual completo para João Silva',
    proposito: 'Alinhar-se com a energia de Oxum',
    dons: [
      { titulo: 'Intuição', descricao: 'Capacidade de perceber além do visível', sistema: 'astrologia', forca: 'dupla' as const },
    ],
    desafios: [
      { titulo: 'Impaciência', descricao: 'Tendência a agir antes de reflexão', sistema: 'numerologia', forca: 'simples' as const },
    ],
    preceitos: [],
    praticas: [],
    orixas: [],
    ciclos: [],
    mensagemSemanal: 'Permita que a intuição guie seus passos',
    ...overrides,
  });
}

// ============================================================
// GROUP 1: PARSER TESTS (15 tests)
// ============================================================

describe('parser', () => {

  describe('parseInsightResponse', () => {

    it('1. valid JSON with all required fields → returns InsightData', () => {
      const response = createValidInsightResponse();
      const result = parseInsightResponse(response);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('dataGeracao');
      expect(result.resumo).toBe('Mapa espiritual completo para João Silva');
      expect(result.proposito).toBe('Alinhar-se com a energia de Oxum');
      expect(result.dons).toHaveLength(1);
      expect(result.desafios).toHaveLength(1);
    });

    it('2. JSON with markdown code block wrapper → extracts and parses', () => {
      const markdown = '```json\n' + createValidInsightResponse() + '\n```';
      const result = parseInsightResponse(markdown);

      expect(result.resumo).toBe('Mapa espiritual completo para João Silva');
      expect(result.proposito).toBe('Alinhar-se com a energia de Oxum');
    });

    it('3. missing resumo field → throws', () => {
      const response = JSON.stringify({
        proposito: 'Test',
        dons: [],
        desafios: [],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Test',
      });

      expect(() => parseInsightResponse(response)).toThrow('Missing required field: resumo');
    });

    it('4. missing proposito field → throws', () => {
      const response = JSON.stringify({
        resumo: 'Test',
        dons: [],
        desafios: [],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Test',
      });

      expect(() => parseInsightResponse(response)).toThrow('Missing required field: proposito');
    });

    it('5. missing dons field → throws', () => {
      const response = JSON.stringify({
        resumo: 'Test',
        proposito: 'Test',
        desafios: [],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Test',
      });

      expect(() => parseInsightResponse(response)).toThrow('Missing required field: dons');
    });

    it('6. missing desafios field → throws', () => {
      const response = JSON.stringify({
        resumo: 'Test',
        proposito: 'Test',
        dons: [],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Test',
      });

      expect(() => parseInsightResponse(response)).toThrow('Missing required field: desafios');
    });

    it('7. all required fields present but some optional missing → partial parse, no throw', () => {
      const response = JSON.stringify({
        resumo: 'Test summary',
        proposito: 'Test purpose',
        dons: [],
        desafios: [],
        // preceitos, praticas, orixas, ciclos, mensagemSemanal all missing
      });
      const result = parseInsightResponse(response);
      expect(result.resumo).toBe('Test summary');
      expect(result.proposito).toBe('Test purpose');
      // Missing optional fields default to empty arrays/empty string per parser defaulting
      expect(Array.isArray(result.preceitos)).toBe(true);
      expect(Array.isArray(result.praticas)).toBe(true);
      expect(Array.isArray(result.orixas)).toBe(true);
      expect(Array.isArray(result.ciclos)).toBe(true);
    });
  });

  describe('extractJson', () => {

    it('8. direct JSON → returns as-is', () => {
      const json = '{"test": true, "value": 123}';
      const result = extractJson(json);

      expect(result).toBe('{"test": true, "value": 123}');
    });

    it('9. markdown code block ```json ... ``` → extracts inner', () => {
      const codeBlock = '```json\n{"key": "value"}\n```';
      const result = extractJson(codeBlock);

      expect(result).toBe('{"key": "value"}');
    });

    it('10. plain text with JSON object inside → uses regex', () => {
      const text = 'Here is the response: {"name": "João", "age": 35} - thank you!';
      const result = extractJson(text);

      expect(result).toBe('{"name": "João", "age": 35}');
    });

    it('11. non-JSON text → returns trimmed', () => {
      const text = 'This is plain text without JSON at all.';
      const result = extractJson(text);

      expect(result).toBe('This is plain text without JSON at all.');
    });

  });

  describe('criarInsightFallback', () => {

    it('12. derives all fields from MapaAlmaCompleto', () => {
      const result = criarInsightFallback(SAMPLE_MAPA as any);

      expect(result.id).toBeDefined();
      expect(result.dataGeracao).toBeDefined();
      expect(result.resumo).toContain('João Silva');
      expect(result.resumo).toContain('Oxé');
      expect(result.resumo).toContain('Número de Vida 5');
      expect(result.proposito).toContain('Oxé');
      expect(result.dons).toEqual([]);
      expect(result.desafios).toEqual([]);
    });

    it('13. includes odu.regente.nome, quizilas, preceitos, ebós', () => {
      const result = criarInsightFallback(SAMPLE_MAPA as any);

      expect(result.preceitos).toHaveLength(1);
      const preceitosItem = result.preceitos![0];
      expect(preceitosItem.odu).toBe('Oxé');
      expect(preceitosItem.quizilas).toEqual(['Ovos', 'Comidas salgadas']);
      expect(preceitosItem.preceitos).toEqual(['Não comer abóbora']);
      expect(preceitosItem.ebos).toEqual(['Banho de mel']);
    });

    it('14. generates id and dataGeracao', () => {
      const result = criarInsightFallback(SAMPLE_MAPA as any);

      // UUID format check
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      // ISO date format
      expect(result.dataGeracao).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('15. maps orixasDominantes to orixas array', () => {
      const result = criarInsightFallback(SAMPLE_MAPA as any);

      expect(result.orixas!).toHaveLength(1);
      const orixaItem = result.orixas![0];
      expect(orixaItem.nome).toBe('Oxum');
      expect(orixaItem.caminho).toBe('Geburah');
      expect(orixaItem.saudacao).toBe('');
      expect(orixaItem.cores).toEqual([]);
    });

  });

});

// ============================================================
// GROUP 2: GENERATOR TESTS (10 tests)
// ============================================================

describe('generator', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('gerarCacheKey', () => {

    it('1. same profile → same hash', () => {
      const key1 = gerarCacheKey(SAMPLE_MAPA as any);
      const key2 = gerarCacheKey(SAMPLE_MAPA as any);

      expect(key1).toBe(key2);
    });

    it('2. different nome → different hash', () => {
      const mapa2 = {
        ...SAMPLE_MAPA,
        perfil: { ...SAMPLE_MAPA.perfil, nomeCompleto: 'Maria Santos' },
      };

      const key1 = gerarCacheKey(SAMPLE_MAPA as any);
      const key2 = gerarCacheKey(mapa2 as any);

      expect(key1).not.toBe(key2);
    });

    it('3. different dataNascimento → different hash', () => {
      const mapa2 = {
        ...SAMPLE_MAPA,
        perfil: { ...SAMPLE_MAPA.perfil, dataNascimento: '1985-01-01' },
      };

      const key1 = gerarCacheKey(SAMPLE_MAPA as any);
      const key2 = gerarCacheKey(mapa2 as any);

      expect(key1).not.toBe(key2);
    });

    it('10. empty optional fields in profile still produces valid hash', () => {
      const mapaEmpty = {
        ...SAMPLE_MAPA,
        perfil: {
          nomeCompleto: 'Test User',
          dataNascimento: '2000-01-01',
          hora: '',
          cidade: '',
          estado: '',
          pais: '',
        },
      };

      const key = gerarCacheKey(mapaEmpty as any);

      expect(key).toMatch(/^insights:[a-f0-9]{64}$/);
    });

  });

  describe('generateMapaInsights', () => {

    it('4. with mock OpenAI → returns insight with fromCache false', async () => {
      const apiResponse = createValidInsightResponse();
      mockCreateChatCompletion.mockResolvedValueOnce({
        content: apiResponse,
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'gpt-4o',
      });
      mockRedisGet.mockResolvedValueOnce(null);
      mockRedisSet.mockResolvedValueOnce('OK');

      const result = await generateMapaInsights(SAMPLE_MAPA as any);

      expect(result.fromCache).toBe(false);
      expect(result.insight.resumo).toBe('Mapa espiritual completo para João Silva');
      expect(result.retries).toBe(0);
    });

    it('5. with Redis cache hit → returns fromCache true', async () => {
      const cachedInsight = {
        id: 'cached-id-123',
        dataGeracao: '2025-01-15T10:00:00.000Z',
        resumo: 'Cached insight',
        proposito: 'Cached purpose',
        dons: [],
        desafios: [],
        preceitos: [],
        praticas: [],
        orixas: [],
        ciclos: [],
        mensagemSemanal: 'Cached message',
      };

      mockRedisGet.mockResolvedValueOnce(JSON.stringify(cachedInsight));

      const result = await generateMapaInsights(SAMPLE_MAPA as any);

      expect(result.fromCache).toBe(true);
      expect(result.insight.resumo).toBe('Cached insight');
    });

    it('6. API error → falls back to criarInsightFallback', async () => {
      mockCreateChatCompletion.mockRejectedValueOnce(new Error('API Error'));
      mockRedisGet.mockResolvedValueOnce(null);

      const result = await generateMapaInsights(SAMPLE_MAPA as any);

      // Should use fallback, not throw
      expect(result.fromCache).toBe(false);
      expect(result.insight.resumo).toContain('João Silva');
    });

    it('7. forcar=true ignores cache', async () => {
      mockRedisGet.mockResolvedValueOnce(null);
      mockCreateChatCompletion.mockResolvedValueOnce({
        content: createValidInsightResponse({ resumo: 'Fresh from API' }),
        usage: undefined,
        model: 'gpt-4o',
      });
      mockRedisSet.mockResolvedValueOnce('OK');

      const result = await generateMapaInsights(SAMPLE_MAPA as any, { forcar: true });

      expect(result.fromCache).toBe(false);
      expect(result.insight.resumo).toBe('Fresh from API');
    });

    it('8. returns correct InsightData structure', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({
        content: createValidInsightResponse(),
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'gpt-4o',
      });
      mockRedisGet.mockResolvedValueOnce(null);
      mockRedisSet.mockResolvedValueOnce('OK');

      const result = await generateMapaInsights(SAMPLE_MAPA as any);

      expect(result).toHaveProperty('insight');
      expect(result).toHaveProperty('fromCache');
      expect(result).toHaveProperty('retries');
      expect(result).toHaveProperty('cacheKey');
      expect(result.insight).toHaveProperty('id');
      expect(result.insight).toHaveProperty('dataGeracao');
      expect(result.insight).toHaveProperty('resumo');
      expect(result.insight).toHaveProperty('proposito');
      expect(result.insight).toHaveProperty('dons');
      expect(result.insight).toHaveProperty('desafios');
    });

    it('9. cache key format is insights:{hash}', async () => {
      mockCreateChatCompletion.mockResolvedValueOnce({
        content: createValidInsightResponse(),
        usage: undefined,
        model: 'gpt-4o',
      });
      mockRedisGet.mockResolvedValueOnce(null);
      mockRedisSet.mockResolvedValueOnce('OK');

      const result = await generateMapaInsights(SAMPLE_MAPA as any);

      expect(result.cacheKey).toMatch(/^insights:[a-f0-9]{64}$/);
    });

  });

});