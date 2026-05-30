/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMapaInsights } from '@/hooks/useMapaInsights';
import { mockFetch, setupFetchMock, clearFetchMock } from '../mocks/handlers';

// Helper to create mock InsightData matching the InsightData interface
const mockInsightData = (overrides = {}) => ({
  titulo: 'Mapa da Alma de João Silva',
  overview: 'Regência de Oxé (5)',
  proposito: 'Alinhar-se com a energia de Oxé',
  resumo: 'Mapa da Alma de João Silva — Regência de Oxé (5) com Número de Vida 5.',
  dons: [
    { titulo: 'Don da Comunicação', descricao: 'Habilidade natural de se expressar.', sistema: 'Ifá', forca: 'Forte' },
  ],
  desafios: [
    { titulo: 'Desafio da Impatiência', descricao: 'Lidar com a pressa excessiva.', sistema: 'Ifá', forca: 'Moderado' },
  ],
  preceitos: [
    { odu: 'Oxé', quizilas: ['Evitar ovos'], preceitos: ['Cuidar da autoestima'], ebos: ['Banho de mel'] },
  ],
  orixas: [
    { nome: 'Oxum', caminho: 'Tiphereth', saudacao: 'Ora Yê Yê Ô!', cores: ['Rosa'], dia: 'Sábado', pratica: 'Banho de mel', conexao: '' },
  ],
  ciclos: [
    { tipo: 'Mensal', valor: 5, descricao: 'Ciclo de transformação', sephirah: 'Geburah' },
  ],
  mensagemSemanal: 'Você é um ser em evolução contínua.',
  coração: { tema: 'Oxé', descricao: 'Conexão com a energia de Oxé.', sistemas: ['Ifá'] },
  mente: { tema: 'Transformação', descricao: 'Processo mental de autoconhecimento.', sistemas: ['Ifá', 'Cabala'] },
  corpo: { tema: 'Sagrado', descricao: 'Corpo como templo sagrado.', sistemas: ['Ifá'], ritual: 'Banho de ervas', cores: ['Azul'], ervas: ['Alecrim'] },
  caminho: { tema: 'Destino', descricao: 'Caminho de vida traçado.', sistemas: ['Cabala'], orixasProtegentes: ['Oxum'] },
  retorno: { tema: 'Lições', descricao: 'Lições espirituais do ciclo.', sistemas: ['Ifá'] },
  convergencias: {
    triplices: [
      { sistemas: ['Ifá', 'Cabala', 'Tarot'], energia: 'Transformação', forca: 'Forte', descricao: 'Alinhamento triple.' },
    ],
    duplas: [
      { sistemas: ['Ifá', 'Cabala'], energia: 'Luz', forca: 'Moderada', descricao: 'Conexão dual.' },
    ],
  },
  sephirotAlinhadas: ['Tiphereth', 'Geburah'],
  cicloAtual: 'Transformação',
  temaGeral: 'Evolução espiritual',
  ...overrides,
});

const mockProfile = {
  nomeCompleto: 'João Silva',
  dataNascimento: '1990-01-15',
  hora: '14:30',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'BR',
};

describe('useMapaInsights', () => {
  beforeEach(() => {
    setupFetchMock();
    clearFetchMock();
    // Clear localStorage mock
    vi.spyOn(Storage.prototype, 'getItem').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve iniciar com estado inicial correto (sem localStorage)', () => {
    // Mock empty localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);

    const { result } = renderHook(() => useMapaInsights());

    // When no profile in localStorage: insight=null, loading=false, error=null
    expect(result.current.insight).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve retornar erro quando JSON do localStorage é inválido', async () => {
    // Mock invalid JSON in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 'not-valid-json{');

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Perfil de nascimento inválido');
    expect(result.current.insight).toBeNull();
  });

  it('deve carregar insights corretamente quando API retorna 200', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    // Mock successful API response
    const insightsData = mockInsightData();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(insightsData)
    );

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.insight).not.toBeNull();
    expect(result.current.insight?.titulo).toBe('Mapa da Alma de João Silva');
    expect(result.current.insight?.overview).toBe('Regência de Oxé (5)');
    expect(result.current.error).toBeNull();
  });

  it('deve retornar erro quando API retorna erro (non-ok)', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    // Mock error response from API
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Erro interno do servidor' }),
      }) as Promise<Response>
    );

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Erro interno do servidor');
    expect(result.current.insight).toBeNull();
  });

  it('deve retornar erro quando perfil não existe no localStorage', async () => {
    // Mock undefined/null profile
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // No profile = null insight, no error
    expect(result.current.insight).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('deve permitir refetch chamando fetchInsights novamente', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const insightsData1 = mockInsightData({ titulo: 'Primeira Chamada' });
    const insightsData2 = mockInsightData({ titulo: 'Segunda Chamada' });

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockFetch(insightsData1))
      .mockResolvedValueOnce(mockFetch(insightsData2));

    const { result } = renderHook(() => useMapaInsights());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.insight?.titulo).toBe('Primeira Chamada');

    // Call refetch
    result.current.refetch();

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.insight?.titulo).toBe('Segunda Chamada');
  });

  it('deve passar usarCache=true por padrão', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const insightsData = mockInsightData();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(insightsData)
    );

    renderHook(() => useMapaInsights());

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify that usarCache was passed in the request body
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.usarCache).toBe(true);
  });

  it('deve permitir desabilitar com options.enabled=false', () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const { result } = renderHook(() => useMapaInsights({ enabled: false }));

    // When disabled, no fetch is made - initial state
    expect(result.current.insight).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deve fazer nova chamada quando usarCache=false', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const insightsData = mockInsightData();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(insightsData)
    );

    renderHook(() => useMapaInsights({ usarCache: false }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify usarCache=false in request
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.usarCache).toBe(false);
  });

  it('deve extrair campos corretamente do InsightData retornado', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const insightsData = mockInsightData({
      dons: [
        { titulo: 'Don da Intuição', descricao: 'Capacidade de sentir energies.', sistema: 'Ifá', forca: 'Forte' },
      ],
      orixas: [
        { nome: 'Oxalá', caminho: 'Kether', saudacao: 'Olorum', cores: ['Branco'], dia: 'Sexta-feira', pratica: 'Oração', conexao: '' },
      ],
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(insightsData)
    );

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.insight?.dons).toHaveLength(1);
    expect(result.current.insight?.dons?.[0].titulo).toBe('Don da Intuição');
    expect(result.current.insight?.orixas).toHaveLength(1);
    expect(result.current.insight?.orixas?.[0].nome).toBe('Oxalá');
    expect(result.current.insight?.cicloAtual).toBe('Transformação');
  });

  it('deve lidar com erro de rede (fetch rejeita)', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.insight).toBeNull();
  });

  it('deve chamar API com dados corretos do perfil', async () => {
    // Mock valid profile in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => JSON.stringify(mockProfile));

    const insightsData = mockInsightData();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch(insightsData)
    );

    renderHook(() => useMapaInsights());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mapa/insights',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.nomeCompleto).toBe('João Silva');
    expect(requestBody.dataNascimento).toBe('1990-01-15');
    expect(requestBody.hora).toBe('14:30');
    expect(requestBody.cidade).toBe('São Paulo');
    expect(requestBody.estado).toBe('SP');
    expect(requestBody.pais).toBe('BR');
  });
});
