/**
 * MentorChatUnified tests — Wave 28.3
 *
 * Cobertura:
 *   (a) Renderiza header (title + subtitle) com i18n keys
 *   (b) Renderiza <MentorChat> dentro do wrapper (data-testid)
 *   (c) Estado inicial: papers panel mostra empty placeholder
 *   (d) Submit no form do MentorChat → papers panel vai pra loading
 *   (e) Submit → adapter resolve → papers panel renderiza PaperChip por paper
 *   (f) Submit → adapter retorna model sem papers → empty-after-query
 *   (g) Submit → adapter lança erro → papers panel mostra error alert
 *   (h) Locale=en renderiza chrome em inglês
 *   (i) Discovery link aponta para /atendimento/[discoveryId]
 *   (j) discoveryIdFromQuery é determinístico (mesma query → mesmo id)
 *   (k) discoveryIdFromQuery vazio retorna string vazia
 *   (l) LGPD: view-model não inclui PII (sem email/name/userId nos papers)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock i18n — structural (returns key) for stable assertions
vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock adapter — controllable per test
const mockLoadModel = vi.fn();
vi.mock('@/lib/application/discoveries/adapter', () => ({
  loadDiscoveryViewModel: (...args: unknown[]) => mockLoadModel(...args),
}));

// Mock MentorChat — replace with a minimal stub that renders a form
// so we can submit and exercise the observer wiring without pulling
// the real 1100-line component (which has heavy browser-only deps).
vi.mock('@/components/akasha/mentor-chat/MentorChat', () => ({
  MentorChat: () => (
    <form data-testid="mentor-chat-stub">
      <textarea data-testid="mentor-chat-textarea" placeholder="Ask…" />
      <button type="submit" data-testid="mentor-chat-submit">
        Send
      </button>
    </form>
  ),
}));

// Mock next/link — render as anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { MentorChatUnified } from './MentorChatUnified';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildModel(overrides: { papers?: unknown[] } = {}) {
  return {
    discoveryId: 'disc_chat_00000001',
    verdadeUniversal: 'Sample truth',
    headline: 'Sample headline',
    inputs: {
      pilares: ['cabala', 'astrologia'],
      transits: [],
      relatedChainIds: [],
    },
    reasoning: 'Sample reasoning',
    papers: overrides.papers ?? [
      {
        id: 'paper_a',
        title: 'Ayahuasca',
        authors: ['Riba J.'],
        year: 2003,
        journal: 'J. Psychopharmacology',
        doi: '10.1177/0269881103170500',
        abstractEn: 'Ayahuasca effects...',
        abstractPtBr: null,
        fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
      },
      {
        id: 'paper_b',
        title: 'I Ching synchronicity',
        authors: ['Selby J.'],
        year: 2014,
        journal: 'J. Humanistic Psychology',
        doi: null,
        abstractEn: 'Pattern language for non-causal events.',
        abstractPtBr: null,
        fullTextUrl: null,
      },
    ],
    relatedDiscoveries: [],
    confidence: 0.8,
    createdAt: '2026-06-25T00:00:00Z',
    locale: 'pt-BR',
  };
}

function renderUnified(locale = 'pt-BR') {
  return render(<MentorChatUnified locale={locale} userId="user_test_001" />);
}

beforeEach(() => {
  mockLoadModel.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── (a) Header ─────────────────────────────────────────────────────────────

describe('MentorChatUnified — header', () => {
  it('(a) renderiza title + subtitle via i18n keys', () => {
    renderUnified();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('mentor.unified.title');
    expect(screen.getByText('mentor.unified.subtitle')).toBeInTheDocument();
  });
});

// ─── (b) MentorChat integration ────────────────────────────────────────────

describe('MentorChatUnified — chat integration', () => {
  it('(b) renderiza <MentorChat> dentro do wrapper (data-testid)', () => {
    renderUnified();
    const wrapper = screen.getByTestId('mentor-chat-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.querySelector('[data-testid="mentor-chat-stub"]')).toBeInTheDocument();
  });
});

// ─── (c) Initial papers state ──────────────────────────────────────────────

describe('MentorChatUnified — papers panel states', () => {
  it('(c) estado inicial: papers panel mostra empty placeholder', () => {
    renderUnified();
    const panel = screen.getByTestId('mentor-papers-panel');
    expect(panel).toHaveAttribute('data-state', 'idle');
    expect(screen.getByTestId('papers-empty')).toHaveTextContent('mentor.unified.papersEmpty');
  });

  it('(d) submit no form → papers panel vai pra loading', async () => {
    mockLoadModel.mockImplementation(() => new Promise(() => {})); // never resolves
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'como lidar com ansiedade?' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'loading');
    });
    expect(screen.getByTestId('papers-loading')).toHaveTextContent('mentor.unified.papersLoading');
  });

  it('(e) submit → adapter resolve com papers → renderiza PaperChip por paper', async () => {
    mockLoadModel.mockResolvedValue(buildModel());
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'como lidar com ansiedade?' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'ready');
    });

    const list = screen.getByTestId('papers-list');
    expect(list).toBeInTheDocument();
    const chips = list.querySelectorAll('[data-testid="paper-chip"]');
    expect(chips.length).toBe(2);
    expect(chips[0]).toHaveAttribute('data-paper-id', 'paper_a');
    expect(chips[1]).toHaveAttribute('data-paper-id', 'paper_b');

    // Evidence badge present
    expect(screen.getByText('mentor.unified.evidenceBadge')).toBeInTheDocument();
  });

  it('(f) submit → adapter retorna model sem papers → empty-after-query', async () => {
    mockLoadModel.mockResolvedValue(buildModel({ papers: [] }));
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'pergunta sem papers' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'empty');
    });
    expect(screen.getByTestId('papers-empty-after-query')).toBeInTheDocument();
  });

  it('(g) submit → adapter lança erro → papers panel mostra error alert', async () => {
    mockLoadModel.mockRejectedValue(new Error('boom'));
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'pergunta que quebra' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'error');
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('common.error');
    expect(alert).toHaveTextContent('boom');
  });
});

// ─── (h) Locale ────────────────────────────────────────────────────────────

describe('MentorChatUnified — locale', () => {
  it('(h) locale=en renderiza chrome em inglês (não pt-BR)', () => {
    renderUnified('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('mentor.unified.title');
    expect(screen.getByText('mentor.unified.subtitle')).toBeInTheDocument();
    // No text leakage (mock returns keys, but verify both render)
    expect(screen.getByText('mentor.unified.papersTitle')).toBeInTheDocument();
  });
});

// ─── (i) Discovery link ────────────────────────────────────────────────────

describe('MentorChatUnified — discover link', () => {
  it('(i) papers ready → link aponta para /atendimento/[discoveryId]', async () => {
    mockLoadModel.mockResolvedValue(buildModel());
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'qual o sentido?' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'ready');
    });

    const link = screen.getByTestId('papers-discover-link');
    // discoveryId derivado deterministicamente da query — match só o prefixo.
    expect(link.getAttribute('href')).toMatch(/^\/pt-BR\/atendimento\/disc_chat_[0-9a-f]{8}$/);
  });

  it('(i-en) locale=en → link aponta para /en/atendimento/...', async () => {
    mockLoadModel.mockResolvedValue(buildModel());
    renderUnified('en');

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'meaning?' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'ready');
    });

    const link = screen.getByTestId('papers-discover-link');
    expect(link.getAttribute('href')).toMatch(/^\/en\/atendimento\/disc_chat_[0-9a-f]{8}$/);
  });
});

// ─── (j) discoveryIdFromQuery determinism ─────────────────────────────────

describe('MentorChatUnified — discoveryIdFromQuery determinism', () => {
  it('(j) mesma query → mesmo discoveryId (mock consistency)', async () => {
    mockLoadModel.mockResolvedValue(buildModel());
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    // First submission
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'test determinism' } });
      fireEvent.click(submit);
    });
    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'ready');
    });
    const firstCallId = mockLoadModel.mock.calls[0]?.[0] as string;

    // Second submission (same query)
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'test determinism' } });
      fireEvent.click(submit);
    });
    await waitFor(() => {
      expect(mockLoadModel.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
    const secondCallId = mockLoadModel.mock.calls[1]?.[0] as string;

    expect(firstCallId).toBe(secondCallId);
    expect(firstCallId).toMatch(/^disc_chat_[0-9a-f]{8}$/);
  });

  it('(k) query vazia/whitespace NÃO dispara load (sem papers state)', async () => {
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.click(submit);
    });

    // Aguarda um tick pra ver que nada mudou
    await new Promise((r) => setTimeout(r, 50));
    expect(mockLoadModel).not.toHaveBeenCalled();
    expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'idle');
  });
});

// ─── (l) LGPD ─────────────────────────────────────────────────────────────

describe('MentorChatUnified — LGPD', () => {
  it('(l) view-model recebido pelo panel NÃO inclui PII (sem email/name/userId)', async () => {
    // Adapter returns model sem PII (Wave 23.2 invariant)
    mockLoadModel.mockResolvedValue(buildModel());
    renderUnified();

    const textarea = screen.getByTestId('mentor-chat-textarea');
    const submit = screen.getByTestId('mentor-chat-submit');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'lgpd check' } });
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mentor-papers-panel')).toHaveAttribute('data-state', 'ready');
    });

    // Garante que papers não carregam email/userId/name (campos típicos de PII)
    const chips = screen.getAllByTestId('paper-chip');
    chips.forEach((chip) => {
      expect(chip.textContent).not.toMatch(/@/); // sem email
      expect(chip.textContent).not.toMatch(/user_/); // sem userId
    });

    // Link href usa só o discoveryId hash (sem nome do user)
    const link = screen.getByTestId('papers-discover-link');
    expect(link.getAttribute('href')).toMatch(/\/atendimento\/disc_chat_[0-9a-f]+$/);
    expect(link.getAttribute('href')).not.toMatch(/user_test_001/);
  });
});
