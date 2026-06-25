/** @vitest-environment jsdom */
/**
 * KnowledgeGraph — Wave 26.5 (Consciência viva, ADR-013) tests.
 *
 * Cobertura:
 *   1. Render: mostra title + subtitle no header.
 *   2. Render: mostra legenda de 3 tipos de nó (paper/discovery/session).
 *   3. Render: mostra legenda de 3 tipos de edge (citations/derivedFrom/mentionedIn).
 *   4. Render: SVG contém 1 <circle> por paper, 1 <rect> por discovery, 1 <polygon> por session.
 *   5. Render: edges renderizam como <line> com cor por kind.
 *   6. i18n: usa namespace `discoveries.graph.*` (5 chaves).
 *   7. i18n: locale EN troca title visível.
 *   8. Click em node → abre drill-down modal com node.label + description.
 *   9. Modal: mostra conexões relacionadas (edges in/out).
 *  10. Modal: click em close button → fecha modal.
 *  11. Mobile list: agrupa nodes por kind (paper/discovery/session).
 *  12. Mobile list: click em item → abre modal.
 *  13. Empty state: data.nodes=[] → não quebra; mostra legend mas SVG sem nodes.
 *  14. A11y: modal tem role=dialog, aria-modal=true, tabIndex=-1.
 *  15. A11y: nodes SVG tem role=button e aria-label composto.
 *  16. Keyboard: Enter em node focado abre modal.
 *  17. Layout determinístico: nodes do mesmo kind ficam em Y próximo (paper
 *      no topo, discovery no meio, session no rodapé).
 *  18. data-testid root presente para analytics.
 */

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import KnowledgeGraph, {
  type KnowledgeGraphData,
  type GraphNode,
} from './KnowledgeGraph';

// ─── Mock data ──────────────────────────────────────────────────────────

const MOCK_NODES: GraphNode[] = [
  { id: 'p1', kind: 'paper', label: 'Paper A', description: 'Desc paper A' },
  { id: 'p2', kind: 'paper', label: 'Paper B', description: 'Desc paper B' },
  { id: 'd1', kind: 'discovery', label: 'Disc X', description: 'Disc X desc' },
  { id: 'd2', kind: 'discovery', label: 'Disc Y', description: 'Disc Y desc' },
  { id: 's1', kind: 'session', label: 'Sess Z', description: 'Sess Z desc' },
];

const MOCK_DATA: KnowledgeGraphData = {
  nodes: MOCK_NODES,
  edges: [
    { id: 'e1', source: 'p1', target: 'd1', kind: 'citations' },
    { id: 'e2', source: 'p2', target: 'd2', kind: 'citations' },
    { id: 'e3', source: 'd1', target: 'd2', kind: 'derivedFrom' },
    { id: 'e4', source: 's1', target: 'd1', kind: 'mentionedIn' },
  ],
};

// jsdom não tem matchMedia — alguns components que dependem de CSS
// media queries podem ter problemas. Definir stub mínimo.
beforeAll(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

// ─── Tests ───────────────────────────────────────────────────────────────

describe('KnowledgeGraph — Wave 26.5 (Consciência viva)', () => {
  afterEach(() => cleanup());

  it('renders title + subtitle in header', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Grafo de Conhecimento/);
    expect(screen.getByText(/consciência viva do Akasha/)).toBeInTheDocument();
  });

  it('renders node legend with 3 kinds (paper, discovery, session)', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const legend = screen.getByTestId('graph-legend');
    expect(legend).toBeInTheDocument();
    expect(within(legend).getByText('Paper')).toBeInTheDocument();
    expect(within(legend).getByText('Discovery')).toBeInTheDocument();
    expect(within(legend).getByText('Sessão')).toBeInTheDocument();
  });

  it('renders edge legend with 3 kinds (citations, derivedFrom, mentionedIn)', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const edgeLegend = screen.getByTestId('edge-legend');
    expect(edgeLegend).toBeInTheDocument();
    expect(within(edgeLegend).getByText('cita')).toBeInTheDocument();
    expect(within(edgeLegend).getByText('derivado de')).toBeInTheDocument();
    expect(within(edgeLegend).getByText('mencionado em')).toBeInTheDocument();
  });

  it('renders SVG with correct glyph per node kind', () => {
    const { container } = render(
      <KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />
    );
    const desktop = screen.getByTestId('graph-desktop');
    const svg = desktop.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // 2 papers → 2 circles
    expect(svg!.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
    // 2 discoveries → 2 rects
    expect(svg!.querySelectorAll('rect').length).toBeGreaterThanOrEqual(2);
    // 1 session → 1 polygon
    expect(svg!.querySelectorAll('polygon').length).toBeGreaterThanOrEqual(1);
  });

  it('renders edges as <line> elements with kind colors', () => {
    const { container } = render(
      <KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />
    );
    const lines = container.querySelectorAll('line');
    // 4 edges → 4 lines
    expect(lines.length).toBe(4);
    // MentionedIn tem stroke-dasharray
    const mentionedInLine = Array.from(lines).find((l) =>
      l.getAttribute('stroke-dasharray')
    );
    expect(mentionedInLine).toBeTruthy();
  });

  it('uses discoverY.graph.* i18n namespace (5 chaves)', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    // title
    expect(screen.getByText(/Grafo de Conhecimento/)).toBeInTheDocument();
    // subtitle (parcial)
    expect(screen.getByText(/consciência viva do Akasha/)).toBeInTheDocument();
    // edges.* (3 chaves)
    expect(screen.getByText('cita')).toBeInTheDocument();
    expect(screen.getByText('derivado de')).toBeInTheDocument();
    expect(screen.getByText('mencionado em')).toBeInTheDocument();
  });

  it('locale EN swaps visible labels (verdade → truth, cita → cites)', () => {
    render(<KnowledgeGraph locale="en" data={MOCK_DATA} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Knowledge Graph/);
    expect(screen.getByText('cites')).toBeInTheDocument();
    expect(screen.getByText('derived from')).toBeInTheDocument();
    expect(screen.getByText('mentioned in')).toBeInTheDocument();
  });

  it('click on SVG node opens drill-down modal with label + description', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const node = screen.getByTestId('graph-node-p1');
    fireEvent.click(node);
    const modal = screen.getByTestId('graph-drilldown');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText('Paper A')).toBeInTheDocument();
    expect(within(modal).getByText('Desc paper A')).toBeInTheDocument();
  });

  it('drill-down modal lists related edges (in + out)', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    // d1 tem edge e1 (de p1 → d1: citations) e e3 (d1 → d2: derivedFrom)
    // e e4 (s1 → d1: mentionedIn) — então d1 aparece como target em 3 edges
    fireEvent.click(screen.getByTestId('graph-node-d1'));
    const modal = screen.getByTestId('graph-drilldown');
    // "cita" aparece (edge e1: p1 → d1)
    expect(within(modal).getAllByText('cita').length).toBeGreaterThanOrEqual(1);
    // "derivado de" aparece (edge e3: d1 → d2)
    expect(within(modal).getAllByText('derivado de').length).toBeGreaterThanOrEqual(1);
    // "mencionado em" aparece (edge e4: s1 → d1)
    expect(within(modal).getAllByText('mencionado em').length).toBeGreaterThanOrEqual(1);
  });

  it('modal close button dismisses the drill-down', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    fireEvent.click(screen.getByTestId('graph-node-p1'));
    expect(screen.getByTestId('graph-drilldown')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('graph-modal-close'));
    expect(screen.queryByTestId('graph-drilldown')).toBeNull();
  });

  it('mobile list groups nodes by kind and shows all items', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const list = screen.getByTestId('graph-mobile-list');
    expect(list).toBeInTheDocument();
    expect(within(list).getByText('Paper A')).toBeInTheDocument();
    expect(within(list).getByText('Disc X')).toBeInTheDocument();
    expect(within(list).getByText('Sess Z')).toBeInTheDocument();
  });

  it('mobile list item click opens drill-down modal', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const list = screen.getByTestId('graph-mobile-list');
    const sessButton = within(list).getByText('Sess Z').closest('button');
    expect(sessButton).toBeTruthy();
    fireEvent.click(sessButton!);
    expect(screen.getByTestId('graph-drilldown')).toBeInTheDocument();
    expect(within(screen.getByTestId('graph-drilldown')).getByText('Sess Z desc')).toBeInTheDocument();
  });

  it('empty state (no nodes) does not crash', () => {
    const empty: KnowledgeGraphData = { nodes: [], edges: [] };
    render(<KnowledgeGraph locale="pt-BR" data={empty} />);
    // Legend ainda renderiza
    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();
    // Mobile list presente mas vazio
    expect(screen.getByTestId('graph-mobile-list')).toBeInTheDocument();
  });

  it('drill-down modal has a11y: role=dialog, aria-modal=true, tabIndex=-1', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    fireEvent.click(screen.getByTestId('graph-node-p1'));
    const modal = screen.getByTestId('graph-drilldown');
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(modal.getAttribute('tabindex')).toBe('-1');
  });

  it('SVG nodes have role=button and aria-label combining kind + label', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const node = screen.getByTestId('graph-node-d1');
    expect(node.getAttribute('role')).toBe('button');
    expect(node.getAttribute('aria-label')).toContain('discovery');
    expect(node.getAttribute('aria-label')).toContain('Disc X');
  });

  it('keyboard Enter on focused node opens modal', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    const node = screen.getByTestId('graph-node-p2');
    node.focus();
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(screen.getByTestId('graph-drilldown')).toBeInTheDocument();
  });

  it('layout deterministic: papers Y < discoveries Y < sessions Y', () => {
    const { container } = render(
      <KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />
    );
    const svg = container.querySelector('[data-testid="graph-desktop"] svg');
    expect(svg).toBeInTheDocument();
    // Não conseguimos medir Y exato via jsdom sem viewBox getBBox,
    // mas sabemos que paper fica em y=90, discovery em y=240, session em y=390.
    // Conferimos via text positions: text Y é +28 do node Y.
    const groups = svg!.querySelectorAll('g[transform]');
    const ys: number[] = [];
    groups.forEach((g) => {
      const t = g.getAttribute('transform') || '';
      const m = t.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (m) ys.push(Number(m[2]));
    });
    // Esperamos pelo menos 1 paper (≤90), 1 discovery (~240), 1 session (~390)
    const hasPaper = ys.some((y) => y <= 100);
    const hasDiscovery = ys.some((y) => y > 200 && y < 300);
    const hasSession = ys.some((y) => y >= 380);
    expect(hasPaper).toBe(true);
    expect(hasDiscovery).toBe(true);
    expect(hasSession).toBe(true);
  });

  it('data-testid root present for analytics', () => {
    render(<KnowledgeGraph locale="pt-BR" data={MOCK_DATA} />);
    expect(screen.getByTestId('knowledge-graph-root')).toBeInTheDocument();
  });
});