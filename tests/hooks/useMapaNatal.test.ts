/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { useMapaNatal } from '@/hooks/useMapaNatal';
import { mockFetch, setupFetchMock, clearFetchMock } from '../mocks/handlers';

const mockMapaNatalResponse = {
  mapaNatal: {
    planeta: {
      sol: { signo: 'leao', casa: 1 },
      lua: { signo: 'cancer', casa: 4 },
      mercurio: { signo: 'virgem', casa: 2 },
    },
    ascendente: 12,
    casas: [
      { numero: 1, signo: 'leao', grauNoSigno: 25 },
      { numero: 4, signo: 'escorpio', grauNoSigno: 10 },
    ],
  },
  aspectos: [
    { planeta1: 'sol', planeta2: 'lua', tipo: 'trino', orb: 5 },
  ],
  interpretacao: 'Mapa natal interpretado com sucesso.',
};

describe('useMapaNatal', () => {
  beforeEach(() => {
    setupFetchMock();
    clearFetchMock();
  });

  it('deve iniciar com estado de loading', () => {
    const { result } = renderHook(() => useMapaNatal());
    expect(result.current.loading).toBe(true);
  });

  it('deve carregar dados do mapa natal corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(mockMapaNatalResponse)
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ transitos: [] })
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.solSigno).toBe('leao');
    expect(result.current.data?.luaSigno).toBe('cancer');
    expect(result.current.data?.ascendente).toBe('aries');
    expect(result.current.error).toBeNull();
  });

  it('deve carregar trânsitos corretamente', async () => {
    const transitosMock = {
      transitos: [
        {
          planeta: 'saturno',
          aspecto: 'oposto',
          planetaNatal: 'sol',
          impacto: 'alto',
          descricao: 'Saturno oposto ao Sol indica desafios de autoexpressão.',
        },
      ],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(mockMapaNatalResponse)
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(transitosMock)
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transitos).toHaveLength(1);
    expect(result.current.transitos[0].planeta).toBe('saturno');
    expect(result.current.transitos[0].impacto).toBe('alto');
  });

  it('deve mostrar erro quando dados incompletos (status 400)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Dados incompletos' }),
      }) as Promise<Response>
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Dados incompletos. Complete seu perfil primeiro.');
    expect(result.current.data).toBeNull();
  });

  it('deve mostrar erro quando fetch falha', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Erro de rede')
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ transitos: [] })
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro de rede');
  });

  it('deve permitir refetch via refetch function', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(mockMapaNatalResponse)
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ transitos: [] })
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('deve extrair planetas corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(mockMapaNatalResponse)
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ transitos: [] })
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.planetas).toHaveProperty('sol');
    expect(result.current.data?.planetas.sol.signo).toBe('leao');
    expect(result.current.data?.planetas.sol.casa).toBe(1);
    expect(result.current.data?.planetas.lua.signo).toBe('cancer');
  });

  it('deve extrair aspectos corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(mockMapaNatalResponse)
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ transitos: [] })
    );

    const { result } = renderHook(() => useMapaNatal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.aspectos).toHaveLength(1);
    expect(result.current.data?.aspectos[0].planeta1).toBe('sol');
    expect(result.current.data?.aspectos[0].tipo).toBe('trino');
  });
});