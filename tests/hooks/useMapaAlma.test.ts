import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapaAlma } from '@/hooks/useMapaAlma';
import type { BirthProfile, MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockProfile: BirthProfile = {
  nomeCompleto: 'Maria Silva',
  dataNascimento: '1990-06-15',
  hora: '14:30',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'Brasil',
};

const mockMapaAlma: MapaAlmaCompleto = {
  perfil: {
    nomeCompleto: 'Maria Silva',
    dataNascimento: '1990-06-15',
    hora: '14:30',
    cidade: 'São Paulo',
    estado: 'SP',
    pais: 'Brasil',
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
    regente: {
      nome: 'Ogbe',
      numero: 1,
      significado: 'O começo',
      orixaRegente: 'Oxalá',
      elementos: 'Terra',
      opeCima: { id: 1, nome: 'Ogbe', simbolo: '☰', linhas: [true, true, true], significado: 'Caminho aberto', natureza: 'Yang' as const },
      opeBaixo: { id: 1, nome: 'Ogbe', simbolo: '☰', linhas: [true, true, true], significado: 'Caminho aberto', natureza: 'Yang' as const },
    },
    secundario: null,
    orixas: ['Oxum', 'Iemanjá'],
    quizilas: ['Não comer frutos do mar', 'Evitar lugares escuros'],
    preceitos: ['Caminhe sempre com gratidão'],
    ebos: ['Água doce', 'Flores amarelas'],
    elemento: 'Água',
    arcanoTarot: 1,
    caminhoSephirah: 'Kether',
  },
  astrologia: {
    ascendente: 'leao',
    sol: { signo: 'escorpio', grauNoSigno: 15, planeta: 'sol', longitude: 195, latitude: 0, distancia: 1.0, velocidade: 1.0, casa: 1 },
    lua: { signo: 'cancer', grauNoSigno: 22, planeta: 'lua', longitude: 112, latitude: 0, distancia: 0.0, velocidade: 14.0, casa: 4 },
    mercurio: { signo: 'escorpio', grauNoSigno: 10, planeta: 'mercurio', longitude: 190, latitude: 0, distancia: 1.2, velocidade: 2.0, casa: 1 },
    venus: { signo: 'libra', grauNoSigno: 5, planeta: 'venus', longitude: 225, latitude: 0, distancia: 0.7, velocidade: 1.2, casa: 7 },
    marte: { signo: 'capricornio', grauNoSigno: 3, planeta: 'marte', longitude: 273, latitude: 0, distancia: 2.0, velocidade: 1.5, casa: 1 },
    jupiter: { signo: 'touro', grauNoSigno: 18, planeta: 'jupiter', longitude: 48, latitude: 0, distancia: 5.5, velocidade: 0.2, casa: 2 },
    saturno: { signo: 'virgem', grauNoSigno: 12, planeta: 'saturno', longitude: 168, latitude: 0, distancia: 10.0, velocidade: 0.1, casa: 9 },
    urano: { signo: 'escorpio', grauNoSigno: 27, planeta: 'urano', longitude: 227, latitude: 0, distancia: 19.0, velocidade: 0.05, casa: 10 },
    netuno: { signo: 'sagitario', grauNoSigno: 8, planeta: 'netuno', longitude: 278, latitude: 0, distancia: 30.0, velocidade: 0.03, casa: 11 },
    plutao: { signo: 'libra', grauNoSigno: 4, planeta: 'plutao', longitude: 184, latitude: 0, distancia: 34.0, velocidade: 0.02, casa: 8 },
    casas: [],
    aspectos: [],
  },
  tarot: {
    cartaNascimento: 1,
    cartaAnoPessoal: 15,
    cartaAlma: 7,
    interpretacao: { name: 'O Mago', upright: 'Manifestação, habilidade, poder', reversed: 'Manipulação, habilidades não usadas' },
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
  convergencias: [],
  orixasDominantes: ['Oxum', 'Iemanjá'],
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
    const updatedMapa = { ...mockMapaAlma, numerologia: { ...mockMapaAlma.numerologia, vida: 8 } };
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

    expect(result.current.data!.numerologia.vida).toBe(7);
    expect(result.current.data!.numerologia.expressao).toBe(5);
    expect(result.current.data!.numerologia.motivacao).toBe(3);
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

    expect(result.current.data!.odu.regente.nome).toBe('Ogbe');
    expect(result.current.data!.odu.regente.numero).toBe(1);
    expect(result.current.data!.odu.orixas).toContain('Oxum');
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

    expect(result.current.data!.astrologia.ascendente).toBe('leao');
    expect(result.current.data!.astrologia.sol.signo).toBe('escorpio');
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

    expect(result.current.data!.tarot.cartaNascimento).toBe(1);
    expect(result.current.data!.tarot.cartaAnoPessoal).toBe(15);
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

    expect(result.current.data!.chakras.chakras).toHaveLength(7);
    expect(result.current.data!.chakras.dominante).toBe('Ajna');
    expect(result.current.data!.chakras.bloqueado).toBe('Muladhara');
    expect(result.current.data!.chakras.equilibrio).toBe(81);
  });

  it('handles null profile gracefully', async () => {
    const { result } = renderHook(() => useMapaAlma(null as unknown as BirthProfile));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
