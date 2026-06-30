/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — AXIS RADAR · SVG 5-EIXO ACCESSIBLE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * Radar SVG puro (sem libs externas) mostrando os 5 eixos como pentágono.
 *
 * Acessibilidade:
 *   - role="img" + aria-label descritivo (lê axes + scores + trends)
 *   - Cada vértice tem <title> SVG (tooltip acessível)
 *   - reduced-motion: animações desabilitadas
 *   - contrast AA: usa tokens do design-system
 *   - Não interativo (decorativo de leitura) — evita overload cognitivo
 *
 * NÃO é ranking. NÃO é comparação. É apenas visualização dos 5 scores
 * individuais, que existem INDEPENDENTE um do outro.
 *
 * Universalista: cores idênticas para todas as tradições — tradição não
 * tem cor diferenciada no radar (seria hierarquização visual).
 *
 * Durable lessons applied:
 *   - 5 eixos sempre (nunca reduzir)
 *   - 'use client' (interatividade opcional futura)
 *   - ARIA rico (cycle 92 lesson #11)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AXIS_LABELS_PT_BR, AXIS_GLYPHS, TREND_LABELS_PT_BR } from '@/lib/w93/reputation-engine';
import type { ReputationAxis, AxisScore } from '@/lib/w93/reputation-types';

// ════════════════════════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════════════════════════

export interface AxisRadarProps {
  /** 5 eixos do snapshot. */
  readonly axes: ReadonlyArray<AxisScore>;
  /** Tamanho do SVG em px. Default: 320 (mobile-first). */
  readonly size?: number;
  /** Mostrar labels pt-BR. Default: true. */
  readonly showLabels?: boolean;
  /** Mostrar glyph emoji nos vértices. Default: true. */
  readonly showGlyphs?: boolean;
  /** Classe adicional. */
  readonly className?: string;
  /** Locale para descrição aria-label. Default: pt-BR. */
  readonly locale?: 'pt-BR' | 'en';
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS — geometry helpers
// ════════════════════════════════════════════════════════════════════════════

const RINGS = [20, 40, 60, 80, 100] as const; // 5 anéis concêntricos
const ANIMATION_DURATION_MS = 600;
const DEFAULT_SIZE = 320;
const PADDING = 56; // espaço para labels externos

/** Calcula posição (x, y) de um vértice no pentágono regular. */
function vertexAt(
  angleRad: number,
  radiusPx: number,
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  // -PI/2 para começar no topo (eixo 0 = acolhimento)
  return {
    x: centerX + radiusPx * Math.cos(angleRad - Math.PI / 2),
    y: centerY + radiusPx * Math.sin(angleRad - Math.PI / 2),
  };
}

function axisColor(trend: AxisScore['trend']): string {
  // Cores acessíveis (AA contrast) por trend
  switch (trend) {
    case 'rising':
      return '#34d399'; // emerald-400
    case 'falling':
      return '#fb7185'; // rose-400
    case 'new':
      return '#fbbf24'; // amber-400
    case 'stable':
    default:
      return '#a78bfa'; // violet-400
  }
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export function AxisRadar({
  axes,
  size = DEFAULT_SIZE,
  showLabels = true,
  showGlyphs = true,
  className,
  locale = 'pt-BR',
}: AxisRadarProps): React.ReactElement {
  // Garantir 5 eixos — fallback se vier menos
  const safeAxes: AxisScore[] = React.useMemo(() => {
    const map = new Map<ReputationAxis, AxisScore>();
    for (const a of axes) map.set(a.axis, a);
    const order: ReputationAxis[] = [
      'acolhimento',
      'conhecimento',
      'presenca',
      'contribuicao',
      'escuta',
    ];
    return order.map(
      (axis) =>
        map.get(axis) ?? {
          axis,
          rawScore: 0,
          count: 0,
          lastAttributionAt: 0,
          trend: 'new' as const,
        },
    );
  }, [axes]);

  const center = size / 2;
  const maxRadius = size / 2 - PADDING;
  const angleStep = (2 * Math.PI) / safeAxes.length; // 5 eixos = 72° cada

  // Compute path dos scores
  const scorePoints = safeAxes.map((a, i) => {
    const score = Math.max(0, Math.min(100, a.rawScore));
    const r = (score / 100) * maxRadius;
    return vertexAt(i * angleStep, r, center, center);
  });

  const scorePathD =
    scorePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') +
    ' Z';

  // Path do pentágono externo
  const outerPoints = safeAxes.map((_, i) =>
    vertexAt(i * angleStep, maxRadius, center, center),
  );
  const outerPathD =
    outerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') +
    ' Z';

  // aria-label descritivo
  const ariaLabel = React.useMemo(() => {
    if (locale === 'en') {
      return `Reputation radar with ${safeAxes.length} axes. ${safeAxes
        .map(
          (a) =>
            `${a.axis}: ${Math.round(a.rawScore)} out of 100, trend ${TREND_LABELS_PT_BR[a.trend]}`,
        )
        .join('; ')}.`;
    }
    return `Radar de reputação com ${safeAxes.length} eixos. ${safeAxes
      .map(
        (a) =>
          `${AXIS_LABELS_PT_BR[a.axis]}: ${Math.round(a.rawScore)} de 100, tendência ${TREND_LABELS_PT_BR[a.trend]}`,
      )
      .join('; ')}.`;
  }, [safeAxes, locale]);

  return (
    <figure
      className={cn(
        'inline-flex flex-col items-center gap-3',
        'rounded-2xl border border-violet-500/20 bg-slate-900/40',
        'p-4',
        className,
      )}
      data-testid="axis-radar"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
        className="motion-reduce:animate-none"
      >
        <title>{ariaLabel}</title>

        {/* Anéis concêntricos */}
        <g aria-hidden="true">
          {RINGS.map((pct) => {
            const r = (pct / 100) * maxRadius;
            const ringPoints = safeAxes
              .map((_, i) => vertexAt(i * angleStep, r, center, center))
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
              .join(' ') + ' Z';
            return (
              <path
                key={`ring-${pct}`}
                d={ringPoints}
                fill="none"
                stroke="rgba(167, 139, 250, 0.15)"
                strokeWidth={1}
                strokeDasharray={pct === 100 ? '0' : '2 4'}
              />
            );
          })}
        </g>

        {/* Eixos (linhas do centro ao vértice) */}
        <g aria-hidden="true" stroke="rgba(167, 139, 250, 0.25)" strokeWidth={1}>
          {outerPoints.map((p, i) => (
            <line key={`axis-line-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} />
          ))}
        </g>

        {/* Pentágono externo */}
        <path
          d={outerPathD}
          fill="none"
          stroke="rgba(167, 139, 250, 0.5)"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        {/* Área de score (preenchimento) */}
        <path
          d={scorePathD}
          fill="rgba(167, 139, 250, 0.25)"
          stroke="rgba(167, 139, 250, 0.8)"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            transition: `d ${ANIMATION_DURATION_MS}ms ease-out`,
          }}
          data-testid="radar-fill"
        />

        {/* Vértices — pontos + glyphs + labels */}
        {safeAxes.map((a, i) => {
          const p = scorePoints[i]!;
          const labelPos = vertexAt(i * angleStep, maxRadius + 28, center, center);
          const fillColor = axisColor(a.trend);
          return (
            <g key={`vertex-${a.axis}`}>
              {/* Ponto do score */}
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill={fillColor}
                stroke="white"
                strokeWidth={1.5}
              >
                <title>
                  {AXIS_LABELS_PT_BR[a.axis]}: {Math.round(a.rawScore)} / 100 ·{' '}
                  {TREND_LABELS_PT_BR[a.trend]}
                </title>
              </circle>

              {/* Glyph (emoji) — fora do pentágono */}
              {showGlyphs && (
                <text
                  x={labelPos.x}
                  y={labelPos.y - 8}
                  textAnchor="middle"
                  fontSize={20}
                  aria-hidden="true"
                >
                  {AXIS_GLYPHS[a.axis]}
                </text>
              )}

              {/* Label (pt-BR) */}
              {showLabels && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={500}
                  fill="#cbd5e1"
                  aria-hidden="true"
                >
                  {AXIS_LABELS_PT_BR[a.axis]}
                </text>
              )}
              <text
                x={labelPos.x}
                y={labelPos.y + 26}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
                aria-hidden="true"
              >
                {Math.round(a.rawScore)}/100
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="sr-only">{ariaLabel}</figcaption>
    </figure>
  );
}