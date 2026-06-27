// ============================================================================
// FeedbackBoard — testes do board de feature requests
// ============================================================================
// Smoke tests: renderização, filtros, lista, upvote optimistic, submit.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const pushMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

const trackEventMock = vi.fn();
vi.mock('@/lib/analytics/events', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

// ─── Imports (após mocks) ──────────────────────────────────────────────────

import { FeedbackBoard } from '@/app/(community)/feedback/FeedbackBoard';
import type { FeatureRequestRow } from '@/app/(community)/feedback/page';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const SAMPLE_REQUESTS: FeatureRequestRow[] = [
  {
    id: 'r1',
    title: 'Notificação quando alguém cita meu post',
    description: 'Seria útil receber aviso em tempo real quando alguém me citar.',
    status: 'proposed',
    category: 'notifications',
    upvotes: 12,
    author_handle: 'marina-caminhos',
    author_display: 'Marina dos Caminhos',
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'r2',
    title: 'Modo escuro completo para mobile',
    description: 'Algumas telas ainda usam fundo claro no celular.',
    status: 'planned',
    category: 'accessibility',
    upvotes: 5,
    author_handle: 'akasha-curador',
    author_display: 'Akasha Curador',
    created_at: '2026-06-22T14:30:00Z',
  },
];

describe('FeedbackBoard', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    refreshMock.mockClear();
    trackEventMock.mockClear();
    vi.restoreAllMocks();
  });

  it('renderiza titulo de cada request da lista', () => {
    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId={null}
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    expect(screen.getByText(/Notificação quando alguém cita meu post/i)).toBeTruthy();
    expect(screen.getByText(/Modo escuro completo para mobile/i)).toBeTruthy();
  });

  it('mostra contagem de upvotes em cada request', () => {
    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId="u1"
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renderiza os 5 filtros de status como tabs', () => {
    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId="u1"
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    const tablist = screen.getByRole('tablist', { name: 'Filtrar por status' });
    expect(tablist).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Todos' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Propostas' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Planejadas' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Em andamento' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Entregues' })).toBeTruthy();
  });

  it('muda filtro de status e atualiza URL via router.replace', async () => {
    const user = userEvent.setup();
    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId="u1"
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    await user.click(screen.getByRole('tab', { name: 'Propostas' }));
    expect(replaceMock).toHaveBeenCalledWith('/feedback?status=proposed');
  });

  it('mostra estado vazio quando nao ha requests', () => {
    render(
      <FeedbackBoard
        initialRequests={[]}
        currentUserId="u1"
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    expect(screen.getByText(/Nenhum pedido por aqui ainda/i)).toBeTruthy();
  });

  it('desabilita botao de upvote quando usuario deslogado', () => {
    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId={null}
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    const upvoteButtons = screen.getAllByRole('button', { name: /Apoiar este pedido/ });
    expect(upvoteButtons.length).toBe(2);
    upvoteButtons.forEach((btn) => {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('faz upvote otimista quando logado e nao havia voto', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <FeedbackBoard
        initialRequests={SAMPLE_REQUESTS}
        currentUserId="u1"
        myUpvotes={[]}
        initialStatus="all"
        initialCategory="all"
      />
    );
    const upvoteButton = screen.getAllByRole('button', { name: /Apoiar este pedido/ })[0];
    await user.click(upvoteButton);

    // Optimistic: contagem local vai pra 13 imediatamente
    expect(screen.getByText('13')).toBeTruthy();

    // E o fetch é disparado
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/feedback',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('feature_upvote'),
        })
      );
    });

    vi.unstubAllGlobals();
  });
});
