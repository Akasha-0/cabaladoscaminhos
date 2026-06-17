import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockQueryRaw = vi.fn();
const mockGrimoireFindMany = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
    grimoireEntry: {
      findMany: (...args: unknown[]) => mockGrimoireFindMany(...args),
    },
  },
}));

const originalFetch = global.fetch;
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockQueryRaw.mockReset();
  mockGrimoireFindMany.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  process.env.OLLAMA_URL = 'http://localhost:11434/api/embeddings';
  // Por padrão Ollama offline — testa caminhos sem embedding
  mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
});

afterEach(() => {
  global.fetch = originalFetch;
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('searchGrimoireHybrid (Camada 2 — JSONB + pgvector)', () => {
  it('filtra por JSONB containment e retorna resultados', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      {
        id: 'g1',
        slug: 'erva-001-camomila',
        categoria: 'Botânica',
        biblioteca: 'botanica',
        conteudo: 'Camomila: calmante, fogo lunar, signo de Câncer.',
        metadata: { elemento: 'Agua', corpos_tantricos_alvo: [2] },
        distance: 0,
      },
    ]);

    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: { elemento: 'Agua', corpos_tantricos_alvo: [2] },
      query: 'calmante para mente negativa',
      limit: 5,
    });

    expect(results.entries).toHaveLength(1);
    expect(results.entries[0].slug).toBe('erva-001-camomila');
    expect(results.entries[0].metadata.elemento).toBe('Agua');
  });

  it('retorna [] quando filtro composto nao acha nada (sem fallback se nao ha elemento)', async () => {
    mockQueryRaw.mockResolvedValueOnce([]); // composeto: 0 results
    mockGrimoireFindMany.mockResolvedValueOnce([]); // fallback final tambem vazio

    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: { signo: 'Escorpiao', corpo_alvo: 99 },
      query: 'ritual especifico',
      limit: 5,
    });

    expect(results.entries).toEqual([]);
  });

  it('faz fallback para elemento apenas quando filtro composto retorna 0', async () => {
    mockQueryRaw.mockResolvedValueOnce([]); // composeto: 0
    mockGrimoireFindMany.mockResolvedValueOnce([
      {
        id: 'g2',
        slug: 'erva-009-alface',
        categoria: 'Botânica',
        biblioteca: 'botanica',
        conteudo: 'Alface: refrescância, água, calmante suave.',
        metadata: { elemento: 'Agua' },
        distance: 0,
      },
    ]);
    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: { elemento: 'Agua', corpos_tantricos_alvo: [99] },
      query: 'qualquer',
      limit: 5,
    });

    expect(results.entries).toHaveLength(1);
    expect(results.entries[0].slug).toBe('erva-009-alface');
  });

  it('degrada graciosamente sem embedding (Ollama offline) — usa so JSONB', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      {
        id: 'g3',
        slug: 'odu-01-ogbe',
        categoria: 'Odus',
        biblioteca: 'ancestral',
        conteudo: 'Ogbe: princípio da luz, criação, signo de Áries.',
        metadata: { oduId: 'ogbe' },
      },
    ]);

    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: { oduId: 'ogbe' },
      query: 'principio da luz',
      limit: 5,
    });

    expect(results.entries).toHaveLength(1);
  });

  it('respeita o limite de resultados', async () => {
    mockQueryRaw.mockResolvedValueOnce([
      { id: '1', slug: 'a', categoria: 'A', biblioteca: 'b', conteudo: 'x', metadata: {}, distance: 0.1 },
      { id: '2', slug: 'b', categoria: 'B', biblioteca: 'b', conteudo: 'y', metadata: {}, distance: 0.2 },
    ]);

    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: {},
      query: 'q',
      limit: 2,
    });

    expect(results.entries).toHaveLength(2);
  });

  it('gera embedding via Ollama e ordena por distancia quando online', async () => {
    // 1ª chamada: composeto, com embedding
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ embedding: new Array(768).fill(0.1) }),
    });
    mockQueryRaw.mockResolvedValueOnce([
      {
        id: 'g4',
        slug: 'erva-002-arruda',
        categoria: 'Botânica',
        biblioteca: 'botanica',
        conteudo: 'Arruda: proteção, Marte, signo de Áries.',
        metadata: { elemento: 'Fogo' },
        distance: 0.05,
      },
      {
        id: 'g5',
        slug: 'erva-003-lavanda',
        categoria: 'Botânica',
        biblioteca: 'botanica',
        conteudo: 'Lavanda: paz, Mercúrio, signo de Gêmeos.',
        metadata: { elemento: 'Ar' },
        distance: 0.3,
      },
    ]);

    const { searchGrimoireHybrid } = await import('@/lib/grimoire/search');
    const results = await searchGrimoireHybrid({
      tags: { categoria: 'Botânica' },
      query: 'proteção espiritual',
      limit: 5,
    });

    expect(results.entries).toHaveLength(2);
    expect(results.entries[0].distance).toBeLessThan(results.entries[1].distance); // ordenado por similaridade composite
  });
});
