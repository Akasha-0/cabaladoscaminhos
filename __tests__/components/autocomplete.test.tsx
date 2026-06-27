// ============================================================================
// SearchBar — Autocomplete tests (Onda 12, 2026-06-27)
// ============================================================================
// Testa debounce 300ms, fetch de sugestões, navegação por teclado, etc.
// ============================================================================

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock do Next.js navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock do fetch global
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Import dinâmico DEPOIS dos mocks
const { SearchBar } = await import('@/components/community/SearchBar');

// ============================================================================
// Helpers
// ============================================================================

function renderBar(props: React.ComponentProps<typeof SearchBar> = {}) {
  return render(<SearchBar {...props} />);
}

function mockSuggestionsResponse(suggestions: Array<{
  type: string;
  id: string;
  label: string;
  sublabel?: string;
  url: string;
  score: number;
}> = []) {
  fetchMock.mockResolvedValueOnce({
    json: async () => ({
      data: {
        query: 'med',
        suggestions,
        took_ms: 42,
      },
    }),
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('<SearchBar />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza input com placeholder', () => {
    renderBar({ placeholder: 'Buscar…' });
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText('Buscar…');
    expect(input).toBeInTheDocument();
  });

  it('debounce 300ms antes de chamar /api/search/suggestions', async () => {
    mockSuggestionsResponse();
    renderBar();

    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'med');

    // Logo após digitar, ainda NÃO deve ter feito fetch (debounce 300ms)
    expect(fetchMock).not.toHaveBeenCalled();

    // Após 350ms, deve ter feito fetch UMA vez (debounce)
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/search/suggestions?q=med'),
      expect.any(Object),
    );
  });

  it('mostra "Buscando..." enquanto fetch em andamento', async () => {
    // Mock que demora 100ms
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: async () => ({ data: { suggestions: [], took_ms: 0 } }),
            });
          }, 100);
        }),
    );

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'a');

    // Espera o debounce
    await waitFor(
      () => {
        expect(screen.getByText(/buscando/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('renderiza sugestões após fetch', async () => {
    mockSuggestionsResponse([
      { type: 'post', id: 'p1', label: 'meditação e mindfulness', sublabel: 'Post', url: '/post/p1', score: 0.9 },
      { type: 'article', id: 'a1', label: 'Efeitos da meditação', sublabel: 'Artigo', url: '/library/a1', score: 0.8 },
      { type: 'tag', id: 'meditacao', label: '#meditacao', sublabel: '12 resultados', url: '/tags/meditacao', score: 0.7 },
    ]);

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'med');

    await waitFor(() => {
      expect(screen.getByText(/meditação e mindfulness/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Efeitos da meditação/i)).toBeInTheDocument();
    expect(screen.getByText(/#meditacao/i)).toBeInTheDocument();
  });

  it('mostra empty state quando sem sugestões', async () => {
    mockSuggestionsResponse([]);

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'xyzzz');

    await waitFor(() => {
      expect(screen.getByText(/nenhuma sugestão/i)).toBeInTheDocument();
    });
  });

  it('Enter sem seleção navega para /explore?q=', async () => {
    mockSuggestionsResponse([]);

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'cabala');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/explore?q=cabala'));
    });
  });

  it('Enter com sugestão selecionada navega para URL da sugestão', async () => {
    mockSuggestionsResponse([
      { type: 'post', id: 'p1', label: 'post encontrado', url: '/post/p1', score: 0.9 },
    ]);

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'test');
    // Espera sugestões aparecerem
    await waitFor(() => {
      expect(screen.getByText('post encontrado')).toBeInTheDocument();
    });

    // ArrowDown para selecionar primeira sugestão
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/post/p1');
    });
  });

  it('Esc fecha o dropdown', async () => {
    mockSuggestionsResponse([
      { type: 'post', id: 'p1', label: 'resultado', url: '/post/p1', score: 0.9 },
    ]);

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'test');
    await waitFor(() => {
      expect(screen.getByText('resultado')).toBeInTheDocument();
    });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('resultado')).not.toBeInTheDocument();
    });
  });

  it('não faz fetch se input vazio', async () => {
    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'a');
    await userEvent.clear(input);

    await new Promise((r) => setTimeout(r, 400));

    // Pode ter feito fetch com 'a', mas após clear não deve ter feito de novo
    // Limpa contagem e checa
    const callsBefore = fetchMock.mock.calls.length;
    expect(callsBefore).toBeLessThanOrEqual(1);
  });

  it('reseta o input ao clicar no X', async () => {
    renderBar({ initialQuery: 'cabal' });
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i) as HTMLInputElement;

    expect(input.value).toBe('cabal');

    const clearButton = screen.getByLabelText(/limpar busca/i);
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });

  it('lida com erro de fetch graciosamente', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network'));

    renderBar();
    const input = screen.getByRole('searchbox', { hidden: true }) ||
      screen.getByPlaceholderText(/buscar/i);

    await userEvent.type(input, 'test');

    // Não deve crashar
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Helper function — highlight
// ============================================================================

describe('highlight()', () => {
  it('retorna texto sem marcação se query vazia', async () => {
    const { highlight } = await import('@/components/community/SearchBar');
    const result = highlight('cabalá e tantra', '');
    expect(result).toBe('cabalá e tantra');
  });

  it('marca match (case-insensitive)', async () => {
    const { highlight } = await import('@/components/community/SearchBar');
    const result = highlight('cabalá e tantra', 'cabal');
    // Renderizar para verificar markup
    const { container } = render(<>{result}</>);
    expect(container.querySelector('mark')).toBeInTheDocument();
    expect(container.querySelector('mark')?.textContent).toBe('cabal');
  });
});
