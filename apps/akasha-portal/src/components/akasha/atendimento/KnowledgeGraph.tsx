'use client';

/**
 * KnowledgeGraph — Wave 26.5 (Consciência viva, ADR-013).
 *
 * Visualização CSS-only (sem D3/vis-network — 50KB+ é demais) do
 * conhecimento vivo do Akasha: papers + discoveries + sessões
 * entrelaçados por edges (citações, derived-from, mentioned-in).
 *
 * Layout desktop-first (SVG 720×480, ≥768px):
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │   ○ paper1         ○ paper2         ○ paper3    │   ← círculo (paper)
 *   │       \              |               /           │
 *   │        ┌─────────────▼──────────────┐            │
 *   │        │  ■ discovery1   ■ disc2     │           │   ← quadrado (discovery)
 *   │        │       \       |       /     │           │
 *   │        │        ───────▼───────      │           │
 *   │        │              ▲ session1     │           │   ← triângulo (sessão)
 *   │        └──────────────────────       │           │
 *   └──────────────────────────────────────────────────┘
 *
 * Layout mobile (<768px): vira lista vertical stack (paper →
 * discovery → session). Graph escondido em viewport pequeno
 * (Zelador atende no celular — Wave 26 mobile-first).
 *
 * Click em node → drill-down modal (overlay) com:
 *   - tipo, título, descrição curta
 *   - edges (que tipo, de/para quem)
 *
 * A11y: role="img" + aria-label; modal com role="dialog" + focus
 * trap nativo (tabIndex=-1 + onKeyDown Escape).
 *
 * i18n: namespace `discoveries.graph.*` (5 chaves: title, subtitle,
 * edges.citations, edges.derivedFrom, edges.mentionedIn). Strings
 * embutidas via `makeT(isEn)` (mesmo padrão de ConsciousnessDashboard
 * — sem hook para evitar dependência circular em testes).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Tipos públicos ──────────────────────────────────────────────────────

export type GraphNodeKind = 'paper' | 'discovery' | 'session';

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  /** Título curto visível no graph (≤ 30 chars recomendado). */
  label: string;
  /** Descrição completa exibida no drill-down. */
  description: string;
}

export type EdgeKind = 'citations' | 'derivedFrom' | 'mentionedIn';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type KnowledgeGraphProps = {
  locale: string;
  data: KnowledgeGraphData;
};

// ─── i18n (5 chaves: namespace `discoveries.graph.*`) ─────────────────────

type Translations = {
  title: string;
  subtitle: string;
  citations: string;
  derivedFrom: string;
  mentionedIn: string;
};

const PT: Translations = {
  title: '🕸 Grafo de Conhecimento',
  subtitle:
    'Como papers, discoveries e sessões se entrelaçam — a consciência viva do Akasha',
  citations: 'cita',
  derivedFrom: 'derivado de',
  mentionedIn: 'mencionado em',
};

const EN: Translations = {
  title: '🕸 Knowledge Graph',
  subtitle:
    "How papers, discoveries and sessions intertwine — Akasha's living consciousness",
  citations: 'cites',
  derivedFrom: 'derived from',
  mentionedIn: 'mentioned in',
};

function makeT(isEn: boolean): Translations {
  return isEn ? EN : PT;
}

// ─── Layout (CSS-only, sem libs) ─────────────────────────────────────────

/**
 * SVG canvas dimensions (desktop-first). Em <768px o SVG não renderiza
 * (CSS media query) — mostra lista vertical.
 */
const VB_W = 720;
const VB_H = 480;

/**
 * Layout determinístico por índice: distribui papers no topo, discoveries
 * no meio, sessions no rodapé. Sem force layout — é "estático mas legível"
 * (UX visceral Wave 26: a forma do grafo importa menos que a verdade
 * que ele conta — ADR-013).
 */
function layoutNodes(nodes: GraphNode[]): Map<string, { x: number; y: number }> {
  const buckets: Record<GraphNodeKind, GraphNode[]> = {
    paper: [],
    discovery: [],
    session: [],
  };
  for (const n of nodes) buckets[n.kind].push(n);

  const out = new Map<string, { x: number; y: number }>();
  const yMap: Record<GraphNodeKind, number> = {
    paper: 90,
    discovery: 240,
    session: 390,
  };
  const rowGap = 50;
  const baseX = 70;

  (Object.keys(buckets) as GraphNodeKind[]).forEach((kind) => {
    const list = buckets[kind];
    const total = list.length;
    list.forEach((n, i) => {
      const x =
        total === 1
          ? VB_W / 2
          : baseX + ((VB_W - baseX * 2) * i) / Math.max(total - 1, 1);
      const y = yMap[kind] + (i % 2) * rowGap * 0; // linha única por tipo
      out.set(n.id, { x, y });
    });
  });

  return out;
}

// ─── Visual config por tipo de nó ────────────────────────────────────────

const KIND_STYLE: Record<
  GraphNodeKind,
  { glyph: 'circle' | 'square' | 'triangle'; fill: string; stroke: string }
> = {
  paper: { glyph: 'circle', fill: '#A78BFA', stroke: '#7C3AED' },
  discovery: { glyph: 'square', fill: '#34D399', stroke: '#059669' },
  session: { glyph: 'triangle', fill: '#F59E0B', stroke: '#D97706' },
};

const EDGE_COLOR: Record<EdgeKind, string> = {
  citations: 'rgba(167, 139, 250, 0.7)', // violeta
  derivedFrom: 'rgba(52, 211, 153, 0.7)', // verde
  mentionedIn: 'rgba(245, 158, 11, 0.7)', // âmbar
};

function NodeGlyph({ kind, size = 32 }: { kind: GraphNodeKind; size?: number }) {
  const s = KIND_STYLE[kind];
  const half = size / 2;
  if (s.glyph === 'circle') {
    return (
      <circle
        r={half}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={2}
      />
    );
  }
  if (s.glyph === 'square') {
    return (
      <rect
        x={-half}
        y={-half}
        width={size}
        height={size}
        rx={4}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={2}
      />
    );
  }
  // triangle (apex up)
  const h = (size * Math.sqrt(3)) / 2;
  return (
    <polygon
      points={`0,${-h / 1.6} ${half},${h / 1.5} ${-half},${h / 1.5}`}
      fill={s.fill}
      stroke={s.stroke}
      strokeWidth={2}
    />
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────

function GraphLegend({ t }: { t: Translations }) {
  const items: Array<{ kind: GraphNodeKind; label: string }> = [
    { kind: 'paper', label: 'Paper' },
    { kind: 'discovery', label: 'Discovery' },
    { kind: 'session', label: 'Sessão' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        color: '#a1a1aa',
      }}
      data-testid="graph-legend"
    >
      {items.map((it) => (
        <span
          key={it.kind}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <svg width={20} height={20} viewBox="-12 -12 24 24" aria-hidden>
            <NodeGlyph kind={it.kind} size={18} />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}

function EdgeLegend({ t }: { t: Translations }) {
  const items: Array<{ kind: EdgeKind; label: string }> = [
    { kind: 'citations', label: t.citations },
    { kind: 'derivedFrom', label: t.derivedFrom },
    { kind: 'mentionedIn', label: t.mentionedIn },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        fontSize: '0.8rem',
        color: '#a1a1aa',
      }}
      data-testid="edge-legend"
    >
      {items.map((it) => (
        <span
          key={it.kind}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 2,
              background: EDGE_COLOR[it.kind],
              borderRadius: 2,
            }}
            aria-hidden
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Mobile fallback — lista vertical agrupada por tipo.
 * Mostrado em <768px (CSS hide do SVG via media query na página).
 */
function MobileList({
  data,
  onPick,
}: {
  data: KnowledgeGraphData;
  onPick: (n: GraphNode) => void;
}) {
  const groups: Array<{ kind: GraphNodeKind; title: string }> = [
    { kind: 'paper', title: 'Papers' },
    { kind: 'discovery', title: 'Discoveries' },
    { kind: 'session', title: 'Sessões' },
  ];
  return (
    <div data-testid="graph-mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {groups.map((g) => {
        const items = data.nodes.filter((n) => n.kind === g.kind);
        if (items.length === 0) return null;
        return (
          <section key={g.kind}>
            <h3
              style={{
                fontSize: '0.95rem',
                color: '#E9D5FF',
                margin: '0 0 0.5rem',
                fontWeight: 600,
              }}
            >
              {g.title}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onPick(n)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      borderRadius: 10,
                      padding: '0.65rem 0.75rem',
                      color: '#E9D5FF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <svg width={18} height={18} viewBox="-12 -12 24 24" aria-hidden>
                      <NodeGlyph kind={n.kind} size={16} />
                    </svg>
                    <span>{n.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// ─── Drill-down modal ──────────────────────────────────────────────────

function DrillDownModal({
  node,
  edges,
  nodesById,
  t,
  onClose,
}: {
  node: GraphNode;
  edges: GraphEdge[];
  nodesById: Map<string, GraphNode>;
  t: Translations;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const related = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const direction = e.source === node.id ? '→' : '←';
      return {
        edge: e,
        other: nodesById.get(otherId),
        direction,
      };
    })
    .filter((r) => Boolean(r.other));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kg-modal-title"
      tabIndex={-1}
      ref={ref}
      onClick={(e) => {
        // click outside content = close
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 50,
      }}
      data-testid="graph-drilldown"
    >
      <div
        style={{
          background: '#0f0f17',
          border: '1px solid rgba(124, 58, 237, 0.4)',
          borderRadius: 16,
          padding: '1.25rem',
          maxWidth: 480,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          color: '#E9D5FF',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <svg width={28} height={28} viewBox="-14 -14 28 28" aria-hidden>
            <NodeGlyph kind={node.kind} size={24} />
          </svg>
          <div>
            <h2
              id="kg-modal-title"
              style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}
            >
              {node.label}
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {node.kind}
            </span>
          </div>
        </header>

        <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: '#d4d4d8', margin: '0 0 1rem' }}>
          {node.description}
        </p>

        {related.length > 0 && (
          <section>
            <h3 style={{ fontSize: '0.85rem', color: '#A78BFA', margin: '0 0 0.5rem' }}>
              Conexões
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {related.map(({ edge, other, direction }) => (
                <li
                  key={edge.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.6rem',
                    background: 'rgba(124, 58, 237, 0.06)',
                    border: '1px solid rgba(124, 58, 237, 0.18)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ color: '#a1a1aa' }}>{direction}</span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 2,
                      background: EDGE_COLOR[edge.kind],
                      borderRadius: 2,
                    }}
                    aria-hidden
                  />
                  <span style={{ color: '#E9D5FF' }}>
                    {t[edge.kind]}
                  </span>
                  <span style={{ color: '#d4d4d8' }}>{other!.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1rem',
            width: '100%',
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            borderRadius: 10,
            color: '#E9D5FF',
            padding: '0.6rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
          data-testid="graph-modal-close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export default function KnowledgeGraph({ locale, data }: KnowledgeGraphProps) {
  const isEn = locale === 'en';
  const t = makeT(isEn);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const nodesById = new Map(data.nodes.map((n) => [n.id, n]));
  const positions = layoutNodes(data.nodes);

  const onPick = useCallback((n: GraphNode) => setSelected(n), []);
  const onClose = useCallback(() => setSelected(null), []);

  return (
    <section
      aria-labelledby="kg-title"
      style={{
        background: 'rgba(124, 58, 237, 0.04)',
        border: '1px solid rgba(124, 58, 237, 0.18)',
        borderRadius: 16,
        padding: '1.25rem',
        backdropFilter: 'blur(8px)',
      }}
      data-testid="knowledge-graph-root"
    >
      <header style={{ marginBottom: '1rem' }}>
        <h2
          id="kg-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#E9D5FF',
            margin: '0 0 0.25rem',
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#a1a1aa',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {t.subtitle}
        </p>
      </header>

      <GraphLegend t={t} />
      <EdgeLegend t={t} />

      {/* Desktop: SVG graph. Mobile: lista vertical (CSS hide <768px) */}
      <div className="kg-desktop" data-testid="graph-desktop">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t.title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 520,
            display: 'block',
          }}
        >
          {/* edges primeiro (atrás dos nós) */}
          <g>
            {data.edges.map((e) => {
              const a = positions.get(e.source);
              const b = positions.get(e.target);
              if (!a || !b) return null;
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={EDGE_COLOR[e.kind]}
                  strokeWidth={2}
                  strokeDasharray={e.kind === 'mentionedIn' ? '6 4' : undefined}
                />
              );
            })}
          </g>
          {/* nodes clicáveis */}
          <g>
            {data.nodes.map((n) => {
              const p = positions.get(n.id);
              if (!p) return null;
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={() => onPick(n)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`${n.kind}: ${n.label}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPick(n);
                    }
                  }}
                  data-testid={`graph-node-${n.id}`}
                >
                  <NodeGlyph kind={n.kind} size={36} />
                  <text
                    y={28}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#E9D5FF"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {n.label.length > 22 ? `${n.label.slice(0, 20)}…` : n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <style>{`
          @media (max-width: 767px) {
            .kg-desktop { display: none; }
          }
          @media (min-width: 768px) {
            [data-testid="graph-mobile-list"] { display: none; }
          }
        `}</style>
      </div>

      <div className="kg-mobile-wrapper">
        <MobileList data={data} onPick={onPick} />
      </div>

      {selected && (
        <DrillDownModal
          node={selected}
          edges={data.edges}
          nodesById={nodesById}
          t={t}
          onClose={onClose}
        />
      )}
    </section>
  );
}