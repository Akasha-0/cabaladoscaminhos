/** @vitest-environment jsdom */
/**
 * ThoughtChainView — Wave 23.2 (UI Cadeia Viva) tests.
 *
 * Cobertura:
 *   1. Render: 5 steps visíveis + conectores entre eles.
 *   2. Render: mostra pillar chips (5 Pilares + literature).
 *   3. Render: mostra PaperChip para cada paper (abstract preview).
 *   4. Render: related discoveries ordenadas (limit 5).
 *   5. Render: ConvergenceBadge com verdadeUniversal + confidence.
 *   6. Render: headline do discovery no header.
 *   7. i18n: usa 'discoveries.chain.*' namespace.
 *   8. Empty states: inputs/papers/related ausentes não quebram.
 *   9. Locale EN troca labels visíveis (Convergência → Convergence).
 *  10. SSR: modo `model` prop renderiza sem fetch.
 *  11. Fetch mode: GET /api/discoveries/[id] chamado com discoveryId.
 *  12. Fetch mode: estado de loading acessível (role=status).
 *  13. Fetch mode: estado de error acessível (role=alert).
 *  14. A11y: tem aria-labelledby apontando pro title.
 *  15. Mobile-first: container não tem largura fixa (responsivo).
 *  16. ADR-013 universalista: mostra TODOS os pilares que contribuíram.
 *  17. Cap em related: > 5 items mostra só os 5 primeiros.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

import { ThoughtChainView } from './ThoughtChainView';
import type { ThoughtChainViewModel } from './shared';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_PAPER_RIBA = {
  id: 'paper_riba_2003',
  title: 'Ayahuasca pharmacology and personality profiles',
  authors: ['Riba J.', 'Rodriguez-Fornells A.', 'et al'],
  year: 2003,
  journal: 'J. Psychopharmacology',
  doi: '10.1177/0269881103170500',
  abstractEn:
    'Ayahuasca is a South American hallucinogenic brew traditionally used for divinative and religious purposes. The present study investigated the acute and subacute psychological effects of ayahuasca in a double-blind, placebo-controlled study.',
  abstractPtBr: null,
  fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
};

const MOCK_PAPER_SELBY = {
  id: 'paper_selby_2014',
  title: 'I Ching and synchronicity in clinical practice',
  authors: ['Selby J.'],
  year: 2014,
  journal: 'J. Humanistic Psychology',
  doi: null,
  abstractEn:
    'The I Ching offers a pattern language for non-causal events. This paper explores how clinicians can use the hexagrams as a mirror for what is emerging in the therapeutic field.',
  abstractPtBr: null,
  fullTextUrl: 'https://example.com/selby-2014',
};

const MOCK_PAPER_CAHN = {
  id: 'paper_cahn_2010',
  title: 'Meditation and brainwave coherence',
  authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
  year: 2010,
  journal: 'Consciousness and Cognition',
  doi: '10.1016/j.concog.2010.01.007',
  abstractEn: 'Brainwave coherence during meditation is associated with attentional stability and self-referential processing.',
  abstractPtBr: null,
  fullTextUrl: 'https://doi.org/10.1016/j.concog.2010.01.007',
};

const MOCK_VIEW_MODEL: ThoughtChainViewModel = {
  discoveryId: 'disc_test_001',
  verdadeUniversal: 'Propósito é direção, não destino — vá onde o corpo sente medo.',
  headline: 'Direção > destino',
  inputs: {
    pilares: ['cabala', 'astrologia', 'tantra', 'odu', 'iching'],
    transits: ['Sol em Escorpião', 'Hexagrama 50'],
    relatedChainIds: ['disc_abc', 'disc_def'],
    historicoCliente: ['ansioso recorrente', 'tende a Cabala'],
  },
  reasoning:
    'Os 5 pilares convergem em "direção > destino". Nodo Norte ativa medo, hexagrama 50 fala de oferecer. Tantra corpo 1 ancora no presente, Cabala 11 ilumina, Odu Owarin confirma que a travessia já começou.',
  papers: [MOCK_PAPER_RIBA, MOCK_PAPER_SELBY, MOCK_PAPER_CAHN],
  relatedDiscoveries: [
    {
      id: 'disc_abc',
      verdadeUniversal: 'Iluminador — direção pelo medo.',
      akashaType: 'O Iluminador',
      feedback: 'up',
      createdAt: '2026-06-20T09:00:00Z',
    },
    {
      id: 'disc_def',
      verdadeUniversal: 'Propósito emerge na travessia, não no plano.',
      akashaType: 'O Arquiteto',
      feedback: 'neutral',
      createdAt: '2026-06-22T11:00:00Z',
    },
  ],
  confidence: 0.87,
  createdAt: '2026-06-25T10:00:00Z',
  locale: 'pt-BR',
};

// ─── Mocks ──────────────────────────────────────────────────────────────────

// next/link stub — renderiza <a> direto
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ThoughtChainView — Wave 23.2 (UI Cadeia Viva)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    (globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders 5 distinct steps + connectors when given model', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    expect(screen.getByTestId('chain-step-inputs')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-reasoning')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-papers')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-related')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-convergence')).toBeInTheDocument();

    // 4 connectors (entre 5 steps)
    const connectors = screen.getAllByTestId('step-connector');
    expect(connectors.length).toBe(4);
  });

  it('renders pillar chips for all 5 Pilares + literature when included', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    for (const pillar of ['cabala', 'astrologia', 'tantra', 'odu', 'iching']) {
      expect(screen.getByTestId(`pillar-chip-${pillar}`)).toBeInTheDocument();
    }
  });

  it('renders PaperChip per paper with abstract preview', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    const chips = screen.getAllByTestId('paper-chip');
    expect(chips).toHaveLength(3);

    // Headline info dos papers visível
    expect(screen.getByText(/Riba J\. 2003/)).toBeInTheDocument();
    expect(screen.getByText(/Selby J\. 2014/)).toBeInTheDocument();
    expect(screen.getByText(/Cahn B\.R\. 2010/)).toBeInTheDocument();

    // Abstract preview (não truncado, ≤ 200 chars)
    expect(screen.getByText(/Ayahuasca is a South American/)).toBeInTheDocument();
  });

  it('renders related discoveries as chips with link', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    const rows = screen.getAllByTestId('related-discovery-row');
    expect(rows).toHaveLength(2);
    // Verdade universal renderizada
    expect(screen.getByText(/Iluminador — direção pelo medo/)).toBeInTheDocument();
    expect(screen.getByText(/Propósito emerge na travessia/)).toBeInTheDocument();
  });

  it('renders ConvergenceBadge with verdadeUniversal + confidence label', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    const badge = screen.getByTestId('convergence-badge');
    expect(badge).toBeInTheDocument();

    // Verdade universal no Step 5
    const truthEl = screen.getByTestId('convergence-truth');
    expect(truthEl.textContent).toContain(
      'Propósito é direção, não destino — vá onde o corpo sente medo.'
    );

    // Confidence 87% — label pt-BR
    expect(screen.getByText('confiança 87%')).toBeInTheDocument();
  });

  it('renders headline in header', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);
    expect(screen.getByText('Direção > destino')).toBeInTheDocument();
  });

  it('uses discoveries.chain.* i18n namespace for step titles', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    // Com as chaves registradas em i18n pt-BR, os títulos aparecem traduzidos.
    // Step 1 → "① Inputs"; Step 2 → "② Raciocínio"; Step 5 → "⑤ Convergência".
    const inputsStep = screen.getByTestId('chain-step-inputs');
    expect(inputsStep.textContent).toContain('① Inputs');
    expect(inputsStep.textContent).toContain(
      'Os pilares, trânsitos e chains anteriores que alimentaram esta síntese.'
    );

    const reasoningStep = screen.getByTestId('chain-step-reasoning');
    expect(reasoningStep.textContent).toContain('② Raciocínio');

    const convergenceStep = screen.getByTestId('chain-step-convergence');
    // Step 5 mostra badge "5" + "Convergência" (header do step)
    expect(convergenceStep.textContent).toContain('Convergência');
  });

  it('handles empty inputs/papers/related gracefully', () => {
    const emptyModel: ThoughtChainViewModel = {
      ...MOCK_VIEW_MODEL,
      inputs: { pilares: [] },
      papers: [],
      relatedDiscoveries: [],
    };
    render(<ThoughtChainView discoveryId="empty_001" model={emptyModel} />);

    // Steps ainda renderizam
    expect(screen.getByTestId('chain-step-inputs')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-papers')).toBeInTheDocument();
    expect(screen.getByTestId('chain-step-related')).toBeInTheDocument();

    // Não há paper-chip
    expect(screen.queryAllByTestId('paper-chip')).toHaveLength(0);
    // Não há related-row
    expect(screen.queryAllByTestId('related-discovery-row')).toHaveLength(0);
  });

  it('locale=en swaps labels (Convergência → Convergence, confiança → confidence)', () => {
    render(
      <ThoughtChainView
        discoveryId={MOCK_VIEW_MODEL.discoveryId}
        model={MOCK_VIEW_MODEL}
        locale="en"
      />
    );

    // "Convergence" aparece em header do Step 5
    expect(screen.getAllByText(/Convergence/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('confidence 87%')).toBeInTheDocument();
  });

  it('SSR mode (model prop) renders without fetch', () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => null });
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    // Sem loading state (model já veio)
    expect(screen.queryByRole('status', { name: /carregando|loading/i })).toBeNull();
    // Conteúdo já renderizado
    expect(screen.getByTestId('thought-chain-view')).toBeInTheDocument();
  });

  it('fetch mode hits /api/discoveries/[id] with discoveryId', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => MOCK_VIEW_MODEL,
    });

    render(<ThoughtChainView discoveryId="disc_xyz" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/discoveries/disc_xyz');
    });

    // Após resolve, view renderiza
    await waitFor(() => {
      expect(screen.getByTestId('thought-chain-view')).toBeInTheDocument();
    });
  });

  it('loading state is announced via role=status', () => {
    // fetch que nunca resolve — mantém loading
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<ThoughtChainView discoveryId="disc_loading" />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('error state is announced via role=alert', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(<ThoughtChainView discoveryId="disc_err" />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-testid', 'chain-error');
    });
  });

  it('has aria-labelledby pointing to title', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);

    const root = screen.getByTestId('thought-chain-view');
    const titleId = root.getAttribute('aria-labelledby');
    expect(titleId).toBe('thought-chain-view-title');

    const title = document.getElementById(titleId!);
    expect(title).not.toBeNull();
    expect(title?.tagName.toLowerCase()).toBe('h2');
  });

  it('container has no fixed width (mobile-first responsive)', () => {
    render(<ThoughtChainView discoveryId={MOCK_VIEW_MODEL.discoveryId} model={MOCK_VIEW_MODEL} />);
    const root = screen.getByTestId('thought-chain-view');
    // Não tem width/height fixo — só padding/borda
    expect(root.className).not.toMatch(/\bw-(?:screen|full|\[)|h-(?:screen|full|\[)/);
  });

  it('ADR-013 universalista: renderiza TODOS os pilares que contribuíram (sem filtro)', () => {
    const mixedPillars: ThoughtChainViewModel = {
      ...MOCK_VIEW_MODEL,
      inputs: {
        pilares: ['cabala', 'astrologia', 'tantra', 'odu', 'iching', 'literature'],
      },
    };
    render(<ThoughtChainView discoveryId="mixed" model={mixedPillars} />);

    for (const p of ['cabala', 'astrologia', 'tantra', 'odu', 'iching', 'literature']) {
      expect(screen.getByTestId(`pillar-chip-${p}`)).toBeInTheDocument();
    }
  });

  it('caps related discoveries at 5 (Wave 20.2 retrieval limit)', () => {
    const manyRelated: ThoughtChainViewModel = {
      ...MOCK_VIEW_MODEL,
      relatedDiscoveries: Array.from({ length: 8 }, (_, i) => ({
        id: `disc_${i.toString().padStart(2, '0')}`,
        verdadeUniversal: `Verdade ${i}`,
        akashaType: null,
        feedback: 'neutral' as const,
        createdAt: '2026-06-25T10:00:00Z',
      })),
    };
    render(<ThoughtChainView discoveryId="many" model={manyRelated} />);

    const rows = screen.getAllByTestId('related-discovery-row');
    expect(rows).toHaveLength(5);
  });

  it('cleanup: cancela fetch em unmount (não atualiza state após unmount)', async () => {
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => MOCK_VIEW_MODEL,
              }),
            50
          );
        })
    );

    const { unmount } = render(<ThoughtChainView discoveryId="disc_unmount" />);
    unmount();

    // Após unmount, deixar o setTimeout rodar; não deve lançar erro.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });
    // Sem erro = pass
  });
});