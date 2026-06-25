/**
 * Wave 13.2 — SearchPalette (Cmd+K) component tests
 *
 * Validates:
 *   1. Renders nothing by default (palette closed).
 *   2. Opens on Cmd+K (Meta+K) and Ctrl+K.
 *   3. Opens on "/" key (when not typing in an input).
 *   4. Does NOT open on "/" when typing in another input.
 *   5. Input is autofocused on open.
 *   6. Debounced fetch: only fires after 300ms with ≥ 2 chars.
 *   7. Empty state shown when query.length < 2.
 *   8. Loading state during fetch.
 *   9. Results list rendered after fetch.
 *  10. ArrowDown/ArrowUp move the active result; Enter navigates.
 *  11. Esc closes the palette.
 *  12. Click outside (on overlay backdrop) closes the palette.
 *  13. Mobile height: full viewport (h-[100dvh]) — class assertion.
 *  14. Result click navigates via router.push.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Router mock ────────────────────────────────────────────────────────────

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

// ─── Fetch mock ─────────────────────────────────────────────────────────────

const fetchMock = vi.fn();
let fetchResponse: { ok: boolean; status: number; json: () => unknown } = {
  ok: true,
  status: 200,
  json: () => ({ results: [], tookMs: 5, query: '', types: [] }),
};
beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => Promise.resolve(fetchResponse));
  vi.stubGlobal('fetch', fetchMock);
});

// ─── Component import (after mocks) ──────────────────────────────────────────

import { SearchPalette } from '../SearchPalette';

const LOCALE = 'pt-BR' as const;

function renderPalette() {
  return render(<SearchPalette locale={LOCALE} />);
}

function fireKey(target: Element | Window | Document, key: string, opts: KeyboardEventInit = {}) {
  fireEvent.keyDown(target, { key, ...opts });
}

beforeEach(() => {
  pushMock.mockReset();
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('SearchPalette', () => {
  it('renders nothing when closed (no Cmd+K pressed)', () => {
    renderPalette();
    expect(screen.queryByTestId('search-palette')).toBeNull();
  });

  it('opens on Cmd+K (Meta+K)', () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    expect(screen.getByTestId('search-palette')).toBeInTheDocument();
  });

  it('opens on Ctrl+K', () => {
    renderPalette();
    fireKey(window, 'k', { ctrlKey: true });
    expect(screen.getByTestId('search-palette')).toBeInTheDocument();
  });

  it('opens on "/" key when no input is focused', () => {
    renderPalette();
    fireKey(window, '/');
    expect(screen.getByTestId('search-palette')).toBeInTheDocument();
  });

  it('does NOT open on "/" when an input is focused', () => {
    renderPalette();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fireKey(input, '/');
    expect(screen.queryByTestId('search-palette')).toBeNull();
  });

  it('autofocuses the input on open', async () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('search-input'));
    });
  });

  it('shows the empty hint when query length is < 2 chars', async () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'a' } });
    expect(screen.getByTestId('search-empty-hint')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('debounces the fetch (does not call immediately)', async () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cabala' },
    });
    // Should NOT have fetched yet — debounce is 300ms.
    expect(fetchMock).not.toHaveBeenCalled();
    // After debounce elapses — fetch.
    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).toHaveBeenCalled();
  });

  it('calls /api/akasha/search after the debounce window with a valid query', async () => {
    // Use real timers + a manual wait past the 300ms debounce so we don't
    // fight vi.useFakeTimers() / React 19 act() interactions in jsdom.
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'cabala' } });
    // Before debounce elapses — no fetch yet.
    expect(fetchMock).not.toHaveBeenCalled();
    // Wait > 300ms debounce + microtask flush.
    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).toHaveBeenCalled();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/akasha/search?q=cabala');
  });

  it('shows the loading state during fetch', async () => {
    fetchMock.mockImplementation(
      () => new Promise(() => {}) // never resolves — keeps loading
    );
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cabala' },
    });
    await waitFor(
      () => expect(screen.queryByTestId('search-loading')).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('shows the results list after a successful fetch', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              type: 'chat',
              id: 'msg-1',
              title: 'Conversa — Cabala',
              snippet: 'fale sobre cabala',
              score: 80,
              href: '/pt-BR/oraculo?consultationId=c1',
              createdAt: '2026-06-24T12:00:00Z',
            },
            {
              type: 'diario',
              id: 'd-1',
              title: 'Diário de 23/06/2026',
              snippet: 'clima: cabala ativa',
              score: 60,
              href: '/pt-BR/diario?data=2026-06-23',
              createdAt: '2026-06-23T12:00:00Z',
            },
          ],
          tookMs: 12,
          query: 'cabala',
          types: ['chat', 'diario'],
        }),
    };
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cabala' },
    });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-result-0')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getByTestId('search-result-1')).toBeInTheDocument();
    // Type badge PT-BR.
    expect(screen.getByText('Conversa')).toBeInTheDocument();
    expect(screen.getByText('Diário')).toBeInTheDocument();
  });

  it('shows the no-results state when API returns empty', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ results: [], tookMs: 1, query: 'xpto', types: ['chat'] }),
    };
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'xpto' },
    });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-no-results')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('shows an error message when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cabala' },
    });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-error')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('ArrowDown moves the active result; Enter navigates', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              type: 'chat',
              id: 'a',
              title: 'A',
              snippet: 'a',
              score: 90,
              href: '/pt-BR/a',
              createdAt: '2026-06-24T12:00:00Z',
            },
            {
              type: 'chat',
              id: 'b',
              title: 'B',
              snippet: 'b',
              score: 80,
              href: '/pt-BR/b',
              createdAt: '2026-06-23T12:00:00Z',
            },
          ],
          tookMs: 1,
          query: 'q',
          types: ['chat'],
        }),
    };
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'query' },
    });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-result-1')).toBeInTheDocument(),
      { timeout: 3000 }
    );

    const input = screen.getByTestId('search-input');
    fireKey(input, 'ArrowDown');
    // aria-selected should now be on result 1
    expect(screen.getByTestId('search-result-1')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    fireKey(input, 'Enter');
    expect(pushMock).toHaveBeenCalledWith('/pt-BR/b');
  });

  it('ArrowUp clamps to 0 (does not go below first result)', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              type: 'chat',
              id: 'a',
              title: 'A',
              snippet: 'a',
              score: 90,
              href: '/pt-BR/a',
              createdAt: '2026-06-24T12:00:00Z',
            },
          ],
          tookMs: 1,
          query: 'q',
          types: ['chat'],
        }),
    };
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'query' },
    });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-result-0')).toBeInTheDocument(),
      { timeout: 3000 }
    );

    const input = screen.getByTestId('search-input');
    fireKey(input, 'ArrowUp');
    expect(screen.getByTestId('search-result-0')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('Esc closes the palette', () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    expect(screen.getByTestId('search-palette')).toBeInTheDocument();
    fireKey(screen.getByTestId('search-input'), 'Escape');
    expect(screen.queryByTestId('search-palette')).toBeNull();
  });

  it('click on the overlay backdrop closes the palette', () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const overlay = screen.getByTestId('search-palette');
    fireEvent.click(overlay, { target: overlay });
    // After click, palette closes.
    // (Note: in jsdom, click on the overlay element with target=overlay
    //  simulates clicking the backdrop, not a child.)
    expect(screen.queryByTestId('search-palette')).toBeNull();
  });

  it('clicking a result navigates via router.push', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              type: 'chat',
              id: 'm',
              title: 'Match',
              snippet: 'match',
              score: 90,
              href: '/pt-BR/oraculo?consultationId=c#msg-m',
              createdAt: '2026-06-24T12:00:00Z',
            },
          ],
          tookMs: 1,
          query: 'q',
          types: ['chat'],
        }),
    };
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const input = screen.getByTestId('search-input');
    // Use fireEvent.change (deterministic single update) instead of user.type
    // (which simulates per-char keystrokes and complicates debounce timing).
    fireEvent.change(input, { target: { value: 'query' } });
    // Wait > 300ms debounce + microtask + render.
    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).toHaveBeenCalled();
    await waitFor(
      () => expect(screen.queryByTestId('search-result-0')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    fireEvent.click(screen.getByTestId('search-result-0').querySelector('button')!);
    expect(pushMock).toHaveBeenCalledWith(
      '/pt-BR/oraculo?consultationId=c#msg-m'
    );
  });

  it('mobile-first: panel uses full viewport height on small screens', () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const panel = screen.getByTestId('search-palette-panel');
    // h-[100dvh] is a Tailwind arbitrary class — assert it appears in className.
    expect(panel.className).toContain('h-[100dvh]');
    // And on md+ it caps to max-h-[70vh].
    expect(panel.className).toContain('md:max-h-[70vh]');
  });

  it('clears state when palette is reopened', async () => {
    renderPalette();
    // First open + type.
    fireKey(window, 'k', { metaKey: true });
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cabala' },
    });
    await new Promise((r) => setTimeout(r, 50)); // not enough to debounce
    // Close.
    fireKey(screen.getByTestId('search-input'), 'Escape');
    expect(screen.queryByTestId('search-palette')).toBeNull();
    // Reopen — query should be cleared, empty hint visible.
    fireKey(window, 'k', { metaKey: true });
    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue('');
    expect(screen.getByTestId('search-empty-hint')).toBeInTheDocument();
  });

  it('EN locale renders English placeholders + type labels', async () => {
    fetchResponse = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              type: 'chat',
              id: 'a',
              title: 'A',
              snippet: 'a',
              score: 90,
              href: '/en/oraculo',
              createdAt: '2026-06-24T12:00:00Z',
            },
          ],
          tookMs: 1,
          query: 'q',
          types: ['chat'],
        }),
    };
    render(<SearchPalette locale="en" />);
    fireKey(window, 'k', { metaKey: true });
    expect(screen.getByTestId('search-input').getAttribute('placeholder')).toMatch(
      /Search Akasha/
    );
    // Type a longer string to trigger the result render (MIN_QUERY_LEN = 2).
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'qa' } });
    await new Promise((r) => setTimeout(r, 400));
    await waitFor(
      () => expect(screen.queryByTestId('search-result-0')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('fetch URL encodes the query (handles accents + special chars)', async () => {
    renderPalette();
    fireKey(window, 'k', { metaKey: true });
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'cabalá árvore' } });
    // Wait > 300ms debounce.
    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).toHaveBeenCalled();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('q=cabal%C3%A1%20%C3%A1rvore');
  });
});