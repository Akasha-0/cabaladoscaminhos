/**
 * DiscoveryDetailClient tests — Wave 27.2
 *
 * Cobertura:
 *   (a) Renderiza header com title + subtitle + discoveryId
 *   (b) Renderiza ConvergenceView com verdadeUniversal (Wave 25.2)
 *   (c) Renderiza 5 chips de inputs (pilares)
 *   (d) Renderiza reasoning no bloco chain-of-thought
 *   (e) Renderiza papers (PaperChip por paper)
 *   (f) Renderiza related discoveries (cap 5)
 *   (g) Renderiza action bar com 3 botões (Cite | Save | Share)
 *   (h) Click em "Salvar" persiste no localStorage
 *   (i) Click em "Citar" emite CustomEvent akasha:cite-discovery
 *   (j) Locale=en mostra chrome em inglês (não pt-BR)
 *   (k) Empty papers → mostra placeholder "—"
 *   (l) Zero PII no view-model (sem email/name/birthDate/userId)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { DiscoverySource } from './sources';
import type {
  ThoughtChainPaper,
  ThoughtChainRelatedDiscovery,
  ThoughtChainViewModel,
} from './shared';

// Mock i18n — structural (returns key) for stable assertions
vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildModel(
  overrides: Partial<{
    discoveryId: string;
    papers: ThoughtChainPaper[];
    relatedDiscoveries: ThoughtChainRelatedDiscovery[];
  }> = {}
): ThoughtChainViewModel {
  const pilares: DiscoverySource[] = ['cabala', 'astrologia', 'tantra', 'odu', 'iching'];
  return {
    discoveryId: overrides.discoveryId ?? 'disc_test_001',
    verdadeUniversal: 'Propósito é direção, não destino.',
    headline: 'Direção > destino',
    inputs: {
      pilares,
      transits: ['Sol em Escorpião', 'Hexagrama 50'],
      relatedChainIds: ['disc_rel_001'],
      historicoCliente: ['ansioso recorrente'],
    },
    reasoning:
      'Os 5 pilares convergem em direção > destino. Cabala 11 ilumina, Tantra corpo 1 ancora.',
    papers: overrides.papers ?? [
      {
        id: 'paper_a',
        title: 'Ayahuasca pharmacology',
        authors: ['Riba J.'],
        year: 2003,
        journal: 'J. Psychopharmacology',
        doi: '10.1177/0269881103170500',
        fullTextUrl: 'https://pubmed.ncbi.nlm.nih.gov/12618548/',
        abstractEn: 'Ayahuasca acute and subacute psychological effects...',
        abstractPtBr: null,
      },
      {
        id: 'paper_b',
        title: 'I Ching and synchronicity',
        authors: ['Selby J.'],
        year: 2014,
        journal: 'J. Humanistic Psychology',
        doi: null,
        fullTextUrl: null,
        abstractEn: 'Pattern language for non-causal events.',
        abstractPtBr: null,
      },
    ],
    relatedDiscoveries: overrides.relatedDiscoveries ?? [
      {
        id: 'rel_1',
        verdadeUniversal: 'Iluminador — direção pelo medo.',
        akashaType: 'O Iluminador',
        feedback: 'up',
        createdAt: '2026-06-20T09:00:00Z',
      },
      {
        id: 'rel_2',
        verdadeUniversal: 'Propósito emerge na travessia.',
        akashaType: 'O Arquiteto',
        feedback: 'neutral',
        createdAt: '2026-06-22T11:00:00Z',
      },
    ],
    confidence: 0.85,
    createdAt: '2026-06-25T09:00:00Z',
    locale: 'pt-BR',
  };
}

describe('DiscoveryDetailClient (Wave 27.2)', () => {
  beforeEach(() => {
    // Reset localStorage between tests
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // (a) Header
  it('(a) renders header with title, subtitle, and discoveryId', () => {
    render(
      <DiscoveryDetailClient
        model={buildModel({ discoveryId: 'disc_xyz_42' })}
        locale="pt-BR"
      />
    );
    expect(
      screen.getByTestId('discovery-detail-title')
    ).toBeInTheDocument();
    // discoveryId appears in the small mono <p> below the title — match by data-discovery-id on root.
    const root = screen.getByTestId('discovery-detail');
    expect(root.getAttribute('data-discovery-id')).toBe('disc_xyz_42');
    // Subtitle is the real PT-BR translation (component uses real getTranslations
    // when locale is passed — not the mocked useTranslation hook).
    expect(
      screen.getByText(/Cadeia de pensamento completa, papers/)
    ).toBeInTheDocument();
  });

  // (b) ConvergenceView (Wave 25.2 component) renders truth
  it('(b) renders ConvergenceView with verdadeUniversal', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    const truthCard = screen.getByTestId('convergence-truth-card');
    expect(truthCard).toBeInTheDocument();
    expect(
      within(truthCard).getByText(/Propósito é direção/)
    ).toBeInTheDocument();
  });

  // (c) Inputs chips — 5 pilares
  it('(c) renders 5 pilar chips for inputs', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    const inputs = screen.getByTestId('discovery-inputs');
    expect(inputs).toBeInTheDocument();
    const chips = within(inputs).getAllByTestId('discovery-input-pilar');
    expect(chips).toHaveLength(5);
    expect(chips.map((c) => c.getAttribute('data-pilar'))).toEqual([
      'cabala',
      'astrologia',
      'tantra',
      'odu',
      'iching',
    ]);
  });

  // (d) Reasoning section
  it('(d) renders reasoning text in chain-of-thought section', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    const reasoning = screen.getByTestId('discovery-reasoning');
    expect(reasoning).toBeInTheDocument();
    expect(
      within(reasoning).getByText(/Os 5 pilares convergem/)
    ).toBeInTheDocument();
  });

  // (e) Papers
  it('(e) renders papers with PaperChip per entry', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    const papers = screen.getByTestId('discovery-papers');
    expect(papers).toBeInTheDocument();
    const chips = within(papers).getAllByTestId('paper-chip');
    expect(chips).toHaveLength(2);
  });

  // (f) Related discoveries
  it('(f) renders related discoveries (cap 5)', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    const related = screen.getByTestId('discovery-related');
    expect(related).toBeInTheDocument();
    const items = within(related).getAllByTestId('discovery-related-item');
    expect(items).toHaveLength(2);
  });

  // (g) Actions bar with 3 buttons
  it('(g) renders actions bar with Cite | Save | Share', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="pt-BR" />
    );
    expect(screen.getByTestId('discovery-actions-bar')).toBeInTheDocument();
    expect(screen.getByTestId('discovery-action-cite')).toBeInTheDocument();
    expect(screen.getByTestId('discovery-action-save')).toBeInTheDocument();
    expect(screen.getByTestId('discovery-action-share')).toBeInTheDocument();
  });

  // (h) Save persists to localStorage
  it('(h) clicking Save persists discoveryId to localStorage', () => {
    render(
      <DiscoveryDetailClient
        model={buildModel({ discoveryId: 'disc_persist_01' })}
        locale="pt-BR"
      />
    );
    const saveBtn = screen.getByTestId('discovery-action-save');
    fireEvent.click(saveBtn);
    const raw = window.localStorage.getItem('akasha.savedDiscoveries');
    expect(raw).toBeTruthy();
    const arr = JSON.parse(raw!);
    expect(arr).toContain('disc_persist_01');
    // Toast feedback
    expect(screen.getByTestId('discovery-action-toast')).toBeInTheDocument();
  });

  // (i) Cite emits CustomEvent
  it('(i) clicking Cite dispatches akasha:cite-discovery CustomEvent', () => {
    let received: unknown = null;
    const handler = (e: Event) => {
      received = (e as CustomEvent).detail;
    };
    window.addEventListener('akasha:cite-discovery', handler);
    render(
      <DiscoveryDetailClient
        model={buildModel({ discoveryId: 'disc_cite_42' })}
        locale="pt-BR"
      />
    );
    fireEvent.click(screen.getByTestId('discovery-action-cite'));
    window.removeEventListener('akasha:cite-discovery', handler);
    expect(received).toEqual({ discoveryId: 'disc_cite_42' });
  });

  // (j) Locale=en routes via real getTranslations('en') — chrome appears
  // in English (verifying the `if (localeProp)` branch is taken and the
  // hardcoded-locale bug is bypassed per Wave 25.2 fix).
  it('(j) locale=en shows EN chrome via real getTranslations', () => {
    render(
      <DiscoveryDetailClient model={buildModel()} locale="en" />
    );
    expect(screen.getByTestId('discovery-detail')).toBeInTheDocument();
    // The ConvergenceView's voicesLabel in EN locale is "The 5 voices converge:"
    expect(
      screen.getByText(/The 5 voices converge:/)
    ).toBeInTheDocument();
    // The action labels in EN locale are "Cite in chat", "Save", "Share"
    expect(screen.getByText('Cite in chat')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  // (k) Empty papers → placeholder
  it('(k) empty papers shows placeholder instead of section', () => {
    render(
      <DiscoveryDetailClient
        model={buildModel({ papers: [] })}
        locale="pt-BR"
      />
    );
    const empty = screen.getByTestId('discovery-papers-empty');
    expect(empty).toBeInTheDocument();
    expect(screen.queryByTestId('discovery-papers')).not.toBeInTheDocument();
  });

  // (l) LGPD: view-model has zero PII
  it('(l) view-model has zero PII fields (LGPD invariant)', () => {
    const model = buildModel();
    const forbidden = ['email', 'name', 'birthDate', 'userId', 'password'];
    for (const key of forbidden) {
      expect(model).not.toHaveProperty(key);
    }
    // Also confirm nested
    const json = JSON.stringify(model);
    expect(json).not.toMatch(/@/); // no email-like substring
    expect(json).not.toMatch(/password|email|userId/i);
  });

  // (m) Related cap = 5 (when more passed, only 5 shown)
  it('(m) related discoveries cap at 5', () => {
    const manyRelated: ThoughtChainRelatedDiscovery[] = Array.from(
      { length: 8 },
      (_, i) => ({
        id: `rel_${i}`,
        verdadeUniversal: `Truth ${i}`,
        akashaType: `Type ${i}`,
        feedback: 'neutral' as const,
        createdAt: '2026-06-25T09:00:00Z',
      })
    );
    render(
      <DiscoveryDetailClient
        model={buildModel({ relatedDiscoveries: manyRelated })}
        locale="pt-BR"
      />
    );
    const items = within(
      screen.getByTestId('discovery-related')
    ).getAllByTestId('discovery-related-item');
    expect(items).toHaveLength(5);
  });
});

// Import the component after vi.mock so the mock applies
import { DiscoveryDetailClient } from './DiscoveryDetailClient';
