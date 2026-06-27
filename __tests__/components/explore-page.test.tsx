// ============================================================================
// Explore Page — Tests (Onda 12, 2026-06-27)
// ============================================================================
// Testa a página refatorada: tabs, filtros, search, estados de loading/empty/erro.
// Usa Suspense + mock de useSearchParams.
// ============================================================================

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// Mocks
// ============================================================================

const pushMock = vi.fn();
const replaceMock = vi.fn();

let mockSearchParams = new URLSearchParams('');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => mockSearchParams,
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

// Import dinâmico
const ExplorePage = (await import('@/app/(community)/explore/page')).default;

// ============================================================================
// Helpers
// ============================================================================

function mockSearchResponse(hits: Array<Record<string, unknown>> = [], facets = {
  posts: 0, articles: 0, groups: 0, users: 0, tags: 0, total: 0,
}, nextCursor: string | null = null) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        query: 'cabala',
        type: 'all',
        hits,
        facets,
        nextCursor,
        took_ms: 23,
      },
      meta: { timestamp: new Date().toISOString() },
    }),
  });
}

function renderExplore() {
  // Explore usa Suspense por causa de useSearchParams
  return render(<ExplorePage />);
}

// ============================================================================
// Tests
// ============================================================================

describe('<ExplorePage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    mockSearchParams = new URLSearchParams('');
  });

  it('renderiza SearchBar e tabs', async () => {
    renderExplore();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tudo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /posts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /artigos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pessoas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /grupos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tags/i })).toBeInTheDocument();
  });

  it('mostra EmptyState quando query vazia', () => {
    renderExplore();
    expect(screen.getByText(/comece a explorar/i)).toBeInTheDocument();
    // Sugestões de busca
    expect(screen.getByText('cabala')).toBeInTheDocument();
  });

  it('faz fetch ao digitar query no SearchBar', async () => {
    mockSearchResponse(
      [
        {
          type: 'post',
          id: 'p1',
          preview: '<mark>cabal</mark> e meditação',
          authorName: 'Membro 1234',
          tradition: 'cabala',
          topic: null,
          groupSlug: null,
          groupName: null,
          likesCount: 5,
          commentsCount: 2,
          createdAt: new Date().toISOString(),
          url: '/post/p1',
        },
      ],
      { posts: 1, articles: 0, groups: 0, users: 0, tags: 0, total: 1 },
    );

    renderExplore();

    // Sem query inicial
    expect(fetchMock).not.toHaveBeenCalled();

    // Digita no SearchBar
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'cabal');

    // Espera debounce + fetch
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalled();
      },
      { timeout: 1500 },
    );

    // Verifica que o hit aparece (com highlight <mark>)
    await waitFor(() => {
      expect(screen.getByText(/Membro 1234/)).toBeInTheDocument();
    });
  });

  it('mostra LoadingState durante fetch', async () => {
    // Mock que demora
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: async () => ({
                data: {
                  query: 'test',
                  type: 'all',
                  hits: [],
                  facets: { posts: 0, articles: 0, groups: 0, users: 0, tags: 0, total: 0 },
                  nextCursor: null,
                  took_ms: 0,
                },
              }),
            });
          }, 100);
        }),
    );

    renderExplore();
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'a');

    // Loading skeletons aparecem
    await waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    }, { timeout: 1500 });
  });

  it('mostra NoResultsState quando 0 hits', async () => {
    mockSearchResponse([], {
      posts: 0, articles: 0, groups: 0, users: 0, tags: 0, total: 0,
    });

    renderExplore();
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'xyzzz123');

    await waitFor(() => {
      expect(screen.getByText(/nada encontrado/i)).toBeInTheDocument();
    });
  });

  it('mostra erro quando fetch falha', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: { code: 5000, message: 'Erro interno do servidor' },
      }),
    });

    renderExplore();
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText(/erro interno/i)).toBeInTheDocument();
    });
  });

  it('clicar em tab muda type e faz refetch', async () => {
    mockSearchResponse(
      [
        {
          type: 'article',
          id: 'a1',
          slug: 'cabal-artigo',
          title: 'Cabal e Numerologia',
          preview: '<mark>Cabal</mark>',
          summary: '',
          authors: ['Autor 1'],
          year: 2024,
          doi: null,
          tags: ['cabala'],
          tradition: 'cabala',
          evidenceLevel: 'MEDIUM',
          viewCount: 100,
          bookmarkCount: 5,
          citations: 3,
          createdAt: new Date().toISOString(),
          url: '/library/cabal-artigo',
          score: 0.9,
        },
      ],
      { posts: 0, articles: 1, groups: 0, users: 0, tags: 0, total: 1 },
    );

    renderExplore();
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'cabal');

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Clica na tab "Artigos"
    const artigosTab = screen.getByRole('tab', { name: /artigos/i });
    fireEvent.click(artigosTab);

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const lastCall = calls[calls.length - 1];
      const url = String(lastCall[0]);
      expect(url).toContain('type=articles');
    });
  });

  it('renderiza filtro de tradição na sidebar', () => {
    renderExplore();
    // Header de filtro
    expect(screen.getByText(/tradição/i)).toBeInTheDocument();
    // Lista de tradições
    expect(screen.getByText(/meditação/i)).toBeInTheDocument();
    expect(screen.getByText(/reiki/i)).toBeInTheDocument();
  });

  it('botão "Carregar mais" aparece quando há nextCursor', async () => {
    mockSearchResponse(
      [
        {
          type: 'post', id: 'p1', preview: 'resultado 1',
          authorName: 'M1', tradition: null, topic: null,
          groupSlug: null, groupName: null,
          likesCount: 0, commentsCount: 0, createdAt: new Date().toISOString(),
          url: '/post/p1', score: 0.9,
        },
      ],
      { posts: 1, articles: 0, groups: 0, users: 0, tags: 0, total: 1 },
      'cursor-abc',
    );

    renderExplore();
    const input = screen.getByPlaceholderText(/buscar/i);
    await userEvent.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText(/carregar mais/i)).toBeInTheDocument();
    });
  });

  it('sincroniza estado com URL params iniciais', () => {
    mockSearchParams = new URLSearchParams('q=cabala&type=posts&tradition=cabala');
    renderExplore();

    const input = screen.getByPlaceholderText(/buscar/i) as HTMLInputElement;
    expect(input.value).toBe('cabala');

    const postsTab = screen.getByRole('tab', { name: /posts/i });
    expect(postsTab.getAttribute('aria-selected')).toBe('true');
  });
});
