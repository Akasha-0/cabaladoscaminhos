/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrevisaoMensal, LunarPhase, KeyDate, MonthTheme, PrevisaoMensal } from '@/hooks/usePrevisaoMensal';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockApiResponse = {
  mes: 5,
  ano: 2026,
  signosFavoraveis: ['Áries', 'Leão', 'Sagitário'],
  desafios: ['Impaciência', 'Arrogância'],
  oportunidades: ['Novos projetos', 'Crescimento espiritual'],
};

describe('usePrevisaoMensal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  it('returns object with required properties', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('refetch');
    expect(result.current).toHaveProperty('fasesLua');
    expect(result.current).toHaveProperty('datasChave');
    expect(result.current).toHaveProperty('temas');
  });

  it('has refetch as function', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(typeof result.current.refetch).toBe('function');
  });

  it('has loading as boolean', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('has error as string or null', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });

  it('has fasesLua as array', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(Array.isArray(result.current.fasesLua)).toBe(true);
  });

  it('has datasChave as array', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(Array.isArray(result.current.datasChave)).toBe(true);
  });

  it('has temas as object or null', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current.temas === null || typeof result.current.temas === 'object').toBe(true);
  });

  it('fasesLua items have correct structure', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    const fasesLua: LunarPhase[] = result.current.fasesLua;
    const validFases = ['nova', 'crescente', 'cheia', 'minguante'];

    fasesLua.forEach((fase) => {
      expect(fase).toHaveProperty('fase');
      expect(fase).toHaveProperty('data');
      expect(fase).toHaveProperty('energia');
      expect(fase).toHaveProperty('recomendacao');
      expect(validFases).toContain(fase.fase);
      expect(typeof fase.data).toBe('string');
      expect(typeof fase.energia).toBe('string');
      expect(typeof fase.recomendacao).toBe('string');
    });
  });

  it('datasChave items have correct structure when present', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    const datasChave: KeyDate[] = result.current.datasChave;
    const validTipos = ['ritual', 'astrologico', 'sazonal', 'espiritual'];

    datasChave.forEach((data) => {
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('tipo');
      expect(data).toHaveProperty('titulo');
      expect(data).toHaveProperty('descricao');
      expect(data).toHaveProperty('energia');
      expect(validTipos).toContain(data.tipo);
      expect(typeof data.data).toBe('string');
      expect(typeof data.titulo).toBe('string');
      expect(typeof data.descricao).toBe('string');
      expect(typeof data.energia).toBe('string');
    });
  });

  it('temas have correct structure when present', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    const temas: MonthTheme | null = result.current.temas;

    if (temas) {
      expect(temas).toHaveProperty('titulo');
      expect(temas).toHaveProperty('foco');
      expect(temas).toHaveProperty('mensagens');
      expect(typeof temas.titulo).toBe('string');
      expect(Array.isArray(temas.foco)).toBe(true);
      expect(Array.isArray(temas.mensagens)).toBe(true);
    }
  });

  it('refetch is callable without throwing', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(() => result.current.refetch()).not.toThrow();
  });

  it('calls fetch with correct endpoint', () => {
    renderHook(() => usePrevisaoMensal());
    expect(mockFetch).toHaveBeenCalledWith('/api/astrologia/previsao-mensal');
  });

  it('fasesLua array is defined and accessible', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current.fasesLua).toBeDefined();
    expect(Array.isArray(result.current.fasesLua)).toBe(true);
  });

  it('datasChave array is defined and accessible', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current.datasChave).toBeDefined();
    expect(Array.isArray(result.current.datasChave)).toBe(true);
  });

  it('temas is defined and accessible', () => {
    const { result } = renderHook(() => usePrevisaoMensal());
    expect(result.current.temas).toBeDefined();
  });
});
