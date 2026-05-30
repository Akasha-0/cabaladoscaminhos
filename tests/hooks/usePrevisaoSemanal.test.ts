import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrevisaoSemanal } from '@/hooks/usePrevisaoSemanal';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPrevisaoSemanalData = {
  semana: '2024-W01',
  temaGeral: 'Transformação e Renovação',
  mensagemInspiracional: 'A semana traz oportunidades de crescimento espiritual',
  previsoes: [
    {
      dia: 'Segunda-feira',
      data: '2024-01-01',
      energia: 'alta' as const,
      tema: 'Novo Início',
      orientacaoEspiritual: 'Conecte-se com sua essência',
      planetasInfluentes: ['Lua', 'Saturno'],
      conselho: 'Comece com gratidão',
    },
    {
      dia: 'Terça-feira',
      data: '2024-01-02',
      energia: 'media' as const,
      tema: 'Ação e Movimento',
      orientacaoEspiritual: 'Coloque seus planos em prática',
      planetasInfluentes: ['Marte', 'Plutão'],
      conselho: 'Mantenha o foco',
    },
    {
      dia: 'Quarta-feira',
      data: '2024-01-03',
      energia: 'alta' as const,
      tema: 'Comunicação',
      orientacaoEspiritual: 'Expresse sua verdade',
      planetasInfluentes: ['Mercúrio'],
      conselho: 'Seja claro em suas palavras',
    },
    {
      dia: 'Quinta-feira',
      data: '2024-01-04',
      energia: 'alta' as const,
      tema: 'Expansão',
      orientacaoEspiritual: 'Busque conhecimento',
      planetasInfluentes: ['Júpiter'],
      conselho: 'Abrace novas perspectivas',
    },
    {
      dia: 'Sexta-feira',
      data: '2024-01-05',
      energia: 'media' as const,
      tema: 'Harmonia',
      orientacaoEspiritual: 'Cultive o amor próprio',
      planetasInfluentes: ['Vênus'],
      conselho: 'Pratique a gratidão',
    },
    {
      dia: 'Sábado',
      data: '2024-01-06',
      energia: 'baixa' as const,
      tema: 'Introspecção',
      orientacaoEspiritual: 'Reserve tempo para meditar',
      planetasInfluentes: ['Saturno', 'Urano'],
      conselho: 'Ouça sua intuição',
    },
    {
      dia: 'Domingo',
      data: '2024-01-07',
      energia: 'alta' as const,
      tema: 'Vitalidade',
      orientacaoEspiritual: 'Celebre a vida',
      planetasInfluentes: ['Sol'],
      conselho: 'Irradie sua luz interior',
    },
  ],
};

describe('usePrevisaoSemanal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns initial loading state as true', () => {
    const { result } = renderHook(() => usePrevisaoSemanal());
    
    expect(result.current.loading).toBe(true);
  });

  it('returns null data initially', () => {
    const { result } = renderHook(() => usePrevisaoSemanal());
    
    expect(result.current.data).toBeNull();
  });

  it('returns null error initially', () => {
    const { result } = renderHook(() => usePrevisaoSemanal());
    
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockPrevisaoSemanalData);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao carregar previsão semanal');
    expect(result.current.data).toBeNull();
  });

  it('sets error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });
  it('has refetch function', () => {
    const { result } = renderHook(() => usePrevisaoSemanal());
    
    expect(typeof result.current.refetch).toBe('function');
  });

  it('refetch calls API again', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    await result.current.refetch();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns correct data structure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.semana).toBeDefined();
    expect(result.current.data?.previsoes).toBeDefined();
    expect(Array.isArray(result.current.data?.previsoes)).toBe(true);
    expect(result.current.data?.temaGeral).toBeDefined();
    expect(result.current.data?.mensagemInspiracional).toBeDefined();
  });

  it('has 7 daily predictions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.previsoes).toHaveLength(7);
  });

  it('each prediction has required fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    const { result } = renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    result.current.data?.previsoes.forEach((previsao) => {
      expect(previsao.dia).toBeDefined();
      expect(previsao.data).toBeDefined();
      expect(previsao.energia).toBeDefined();
      expect(['alta', 'media', 'baixa']).toContain(previsao.energia);
      expect(previsao.tema).toBeDefined();
      expect(previsao.orientacaoEspiritual).toBeDefined();
      expect(Array.isArray(previsao.planetasInfluentes)).toBe(true);
      expect(previsao.conselho).toBeDefined();
    });
  });

  it('calls the correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrevisaoSemanalData,
    });

    renderHook(() => usePrevisaoSemanal());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/astrologia/previsao-semanal');
    });
  });
});
