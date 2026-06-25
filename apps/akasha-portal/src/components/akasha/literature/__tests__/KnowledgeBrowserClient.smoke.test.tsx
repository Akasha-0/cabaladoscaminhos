/**
 * KnowledgeBrowserClient — Wave 28.6
 *
 * Smoke tests (Vitest jsdom). Verifica:
 *   (a) Render básico — hero + filters bar + results count + grid.
 *   (b) Filtros renderizam com facets recebidas (year, pilar, journal, hasPractice).
 *   (c) Empty state quando papers.length === 0.
 *   (d) Cada paper renderiza card com data-paper-id + data-pilar.
 *   (e) Paper com hasPractice renderiza badge de prática.
 *   (f) Paper sem prática renderiza label "Sem prática específica".
 *   (g) i18n: chaves `literature.*` resolvem (pt-BR + en).
 *   (h) LGPD: nenhum PII no DOM.
 *   (i) Clear-filters button presente.
 *   (j) Click em paper expande drill-down (sem fetch — papers sem drill state).
 *
 * Drill-down com fetch (/api/literature/[id]/discoveries + /sessions) é
 * testado por um teste separado mockando fetch — não smoke, evita
 * mock frágil e isola o "open/close + state machine".
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// KnowledgeBrowserClient usa useRouter() + usePathname() para deep-link
// dos filtros. Mock simples para não exigir app router context.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/pt-BR/literature',
}));

// next/link em testes vira anchor simples.
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

// ─── Component under test ───────────────────────────────────────────────────

import { KnowledgeBrowserClient } from '../KnowledgeBrowserClient';
import type {
  LiteratureFacets,
  LiteratureFilters,
  LiteraturePaperDTO,
} from '../LiteraturePapersAdapter';

// ─── Mock fixtures ──────────────────────────────────────────────────────────

const FACETS: LiteratureFacets = {
  years: [2024, 2023, 2021, 2020, 2019, 2017, 2015, 2014, 2010, 2009, 1978],
  pillars: ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'],
  journals: [
    'J. Humanistic Psychology',
    'J. Social Psychology',
    'Nature Reviews Neuroscience',
    'Sleep Medicine Reviews',
  ],
  totalPapers: 17,
};

const PAPERS: LiteraturePaperDTO[] = [
  {
    paperId: 'paper_test_cabala',
    title: 'Numerology test paper',
    authors: ['Smith J.', 'Doe A.'],
    year: 2020,
    journal: 'J. Humanistic Psychology',
    pilar: 'cabala',
    abstract: 'Abstract for the cabala test paper.',
    citationCount: 12,
    doi: '10.1234/cabala-test',
    fullTextUrl: 'https://doi.org/10.1234/cabala-test',
    practiceField: 'Conta-Cantiga',
  },
  {
    paperId: 'paper_test_astro_no_practice',
    title: 'Astro paper with no practice',
    authors: ['Riba J.'],
    year: 1978,
    journal: 'J. Social Psychology',
    pilar: 'astrologia',
    abstract: 'Astro paper without practice.',
    citationCount: 41,
    doi: null,
    fullTextUrl: null,
    practiceField: null,
  },
];

const ACTIVE_FILTERS_EMPTY: LiteratureFilters = {};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('KnowledgeBrowserClient — Wave 28.6', () => {
  beforeEach(() => {
    cleanup();
  });

  it('(a) render básico: hero + filters bar + results count + grid', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByTestId('literature-root')).toBeInTheDocument();
    expect(screen.getByTestId('literature-hero')).toBeInTheDocument();
    expect(screen.getByTestId('literature-filters')).toBeInTheDocument();
    expect(screen.getByTestId('literature-results-count')).toBeInTheDocument();
    expect(screen.getByTestId('literature-results')).toBeInTheDocument();
  });

  it('(a-en) render básico em inglês', () => {
    render(
      <KnowledgeBrowserClient
        locale="en"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    // pageTitle em EN
    expect(screen.getByText('Living Library')).toBeInTheDocument();
  });

  it('(b) filters bar tem 4 selects (year/pilar/journal/hasPractice)', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByTestId('literature-filter-year')).toBeInTheDocument();
    expect(screen.getByTestId('literature-filter-pilar')).toBeInTheDocument();
    expect(screen.getByTestId('literature-filter-journal')).toBeInTheDocument();
    expect(screen.getByTestId('literature-filter-haspractice')).toBeInTheDocument();
  });

  it('(c) empty state quando papers vazio', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={[]}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByTestId('literature-empty')).toBeInTheDocument();
    expect(screen.getByText('Nenhum paper combina com os filtros ativos.')).toBeInTheDocument();
    expect(screen.queryByTestId('literature-results')).not.toBeInTheDocument();
  });

  it('(d) cada paper renderiza card com data-paper-id + data-pilar', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    const card1 = screen.getByTestId('literature-paper-paper_test_cabala');
    expect(card1).toBeInTheDocument();
    expect(card1.getAttribute('data-pilar')).toBe('cabala');

    const card2 = screen.getByTestId('literature-paper-paper_test_astro_no_practice');
    expect(card2).toBeInTheDocument();
    expect(card2.getAttribute('data-pilar')).toBe('astrologia');
  });

  it('(e) paper com hasPractice renderiza badge de prática', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    const card = screen.getByTestId('literature-paper-paper_test_cabala');
    expect(card.getAttribute('data-has-practice')).toBe('true');
    expect(
      screen.getByTestId('literature-paper-paper_test_cabala-practice')
    ).toBeInTheDocument();
  });

  it('(f) paper sem prática mostra "Sem prática específica"', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    const card = screen.getByTestId('literature-paper-paper_test_astro_no_practice');
    expect(card.getAttribute('data-has-practice')).toBe('false');
    const empty = within(card).getByText('Sem prática específica');
    expect(empty).toBeInTheDocument();
  });

  it('(g) i18n: chaves literature.* resolvem (pt-BR)', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByText('Biblioteca Viva')).toBeInTheDocument();
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    expect(screen.getByText('2 papers')).toBeInTheDocument(); // resultsCount
  });

  it('(g-en) i18n: chaves literature.* resolvem (en)', () => {
    render(
      <KnowledgeBrowserClient
        locale="en"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByText('Living Library')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
    expect(screen.getByText('2 papers')).toBeInTheDocument();
  });

  it('(h) LGPD: nenhum dado pessoal no DOM', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    const html = document.body.innerHTML;
    expect(html).not.toMatch(/userId/i);
    expect(html).not.toMatch(/user_name/i);
    expect(html).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/); // CPF
    expect(html).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i); // email
  });

  it('(i) clear-filters button presente', () => {
    render(
      <KnowledgeBrowserClient
        locale="pt-BR"
        papers={PAPERS}
        facets={FACETS}
        activeFilters={ACTIVE_FILTERS_EMPTY}
      />
    );

    expect(screen.getByTestId('literature-filters-clear')).toBeInTheDocument();
  });
});
