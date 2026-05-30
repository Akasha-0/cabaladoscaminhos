import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapaAlma } from '@/hooks/useMapaAlma';
import type { BirthProfile, MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockProfile: BirthProfile = {
  nome: 'Maria Silva',
  dataNascimento: '1990-06-15',
  horaNascimento: '14:30',
  localNascimento: 'São Paulo, Brasil',
};

const mockMapaAlma: MapaAlmaCompleto = {
  numerologia: {
    numeroVida: 7,
    numeroDestino: 3,
    numeroAlma: 5,
    numeroPersonalidade: 9,
    numeroExpressao: 4,
    numeroMotivacao: 6,
    caminhoVida: 'O caminho da sabedoria interior',
  },
  odu: {
    nome: 'Ogbe',
    numero: 1,
    orixas: ['Oxum', 'Iemanjá'],
    quizilas: ['Não comer frutos do mar', 'Evitar lugares escuros'],
    preceitos: 'Caminhe sempre com gratidão',
    ebos: ['Água doce', 'Flores amarelas'],
    cores: ['Azul', 'Branco'],
    diasFavoraveis: ['Segunda', 'Sexta'],
  },
  astrologia: {
    signo: 'Escorpião',
    ascendente: 'Leão',
    planetas: {
      Sol: 'Escorpião',
      Lua: 'Câncer',
      Marte: 'Escorpião',
    },
  },
  tarot: {
    cartaNascimento: 1,
    cartaAnoPessoal: 15,
    cartaAlma: 7,
  },
  chakras: {
    chakras: [
      { numero: 1, nome: 'Muladhara', estado: 'equilibrado', intensidade: 75 },
      { numero: 2, nome: 'Svadhisthana', estado: 'equilibrado', intensidade: 80 },
      { numero: 3, nome: 'Manipura', estado: 'equilibrado', intensidade: 70 },
      { numero: 4, nome: 'Anahata', estado: 'equilibrado', intensidade: 85 },
      { numero: 5, nome: 'Vishuddha', estado: 'equilibrado', intensidade: 78 },
      { numero: 6, nome: 'Ajna', estado: 'equilibrado', intensidade: 90 },
      { numero: 7, nome: 'Sahasrara', estado: 'equilibrado', intensidade: 88 },
    ],
    dominante: 'Ajna',
    bloqueado: 'Muladhara',
    equilibrio: 81,
  },
  orixasDominantes: ['Oxum', 'Iemanjá'],
  sefirot: ['Chokhmah', 'Binah', 'Daat'],
  dataCalculo: '2024-01-15T10:00:00Z',
  versao: '1.0.0',
};

describe('useMapaAlma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('returns null data when profile is null', async () => {
    const { result } = renderHook(() => useMapaAlma(null));

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches mapa data when profile is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockMapaAlma);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro ao gerar Mapa da Alma');
    expect(result.current.data).toBeNull();
  });

  it('sets error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('calls refetch to refresh data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockMapaAlma);

    // Change the response for refetch
    const updatedMapa = { ...mockMapaAlma, numerologia: { ...mockMapaAlma.numerologia, numeroVida: 8 } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedMapa,
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('respects enabled option', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile, { enabled: false }));

    // When enabled is false, fetch should not be called
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('returns correct numerologia data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.numerologia.numeroVida).toBe(7);
    expect(result.current.data?.numerologia.numeroDestino).toBe(3);
    expect(result.current.data?.numerologia.numeroAlma).toBe(5);
  });

  it('returns correct odu data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.odu.nome).toBe('Ogbe');
    expect(result.current.data?.odu.numero).toBe(1);
    expect(result.current.data?.odu.orixas).toContain('Oxum');
  });

  it('returns correct astrologia data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.astrologia.signo).toBe('Escorpião');
    expect(result.current.data?.astrologia.ascendente).toBe('Leão');
  });

  it('returns correct tarot data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.tarot.cartaNascimento).toBe(1);
    expect(result.current.data?.tarot.cartaAnoPessoal).toBe(15);
  });

  it('returns correct chakras data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMapaAlma,
    });

    const { result } = renderHook(() => useMapaAlma(mockProfile));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    expect(result.current.data?.chakras.chakras).toHaveLength(7);
    expect(result.current.data?.chakras.dominante).toBe('Ajna');
    expect(result.current.data?.chakras.bloqueado).toBe('Muladhara');
    expect(result.current.data?.chakras.equilibrio).toBe(81);
  });

  it('handles null profile gracefully', async () => {
    const { result } = renderHook(() => useMapaAlma(null as unknown as BirthProfile));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
