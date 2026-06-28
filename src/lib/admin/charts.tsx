// ============================================================================
// SVG Chart Primitives — Lightweight inline charts (Wave 20)
// ============================================================================
// Wave 20 (2026-06-28) — Admin Dashboard.
//
// Por que SVG inline em vez de Recharts?
//   - Recharts adiciona ~80KB gzipped. SVG inline = 0KB.
//   - Admin dashboard é interno; não precisa de interatividade fancy.
//   - Mobile-first: SVG respeita viewBox e fica 100% responsivo.
//   - Server-renderable (sem hydration mismatch).
//
// Cada chart é um Client Component mínimo (precisa de useState para tooltip).
// ============================================================================

'use client';

import { useMemo, useState } from 'react';

// ============================================================================
// Tipos compartilhados
// ============================================================================

export interface SeriesPoint {
  /** ISO date string (yyyy-mm-dd) — usado para eixo X */
  date: string;
  /** Valor numérico */
  value: number;
}

export interface Series {
  /** Rótulo exibido na legenda */
  label: string;
  /** Cor (CSS) */
  color: string;
  /** Pontos ordenados cronologicamente */
  data: SeriesPoint[];
}

export interface MultiSeriesPoint {
  date: string;
  values: Record<string, number>;
}

// ============================================================================
// Helpers
// ============================================================================

/** Largura mínima para tooltip não estourar em mobile */
const TOOLTIP_MIN_WIDTH = 140;

function formatDate(iso: string): string {
  // Espera "2026-06-28" ou ISO completo — extrai yyyy-mm-dd
  const d = iso.length >= 10 ? iso.slice(0, 10) : iso;
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

// ============================================================================
// 1. LineChart — séries temporais (User Growth)
// ============================================================================

export interface LineChartProps {
  series: Series[];
  height?: number;
  yLabel?: string;
}

export function LineChart({ series, height = 220, yLabel }: LineChartProps) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    point: SeriesPoint;
    seriesLabel: string;
    seriesColor: string;
  } | null>(null);

  // Coletar todos os pontos ordenados (eixo X compartilhado)
  const { points, yMax, padding } = useMemo(() => {
    const allDates = new Set<string>();
    series.forEach((s) => s.data.forEach((p) => allDates.add(p.date)));
    const sortedDates = Array.from(allDates).sort();

    let max = 0;
    series.forEach((s) => s.data.forEach((p) => {
      if (p.value > max) max = p.value;
    }));
    if (max === 0) max = 1;

    // Map: date -> [y value per series]
    const pts = sortedDates.map((date) => {
      const values = series.map((s) => {
        const found = s.data.find((p) => p.date === date);
        return { date, value: found?.value ?? 0 };
      });
      return { date, values };
    });

    return {
      points: pts,
      yMax: max,
      padding: { top: 16, right: 16, bottom: 28, left: 36 },
    };
  }, [series]);

  // Render dentro de SVG com viewBox 100% — width via container
  const W = 600;
  const H = height;
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const xStep = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const yScale = (v: number) => innerH - (v / yMax) * innerH;

  function pathFor(seriesIdx: number): string {
    const s = series[seriesIdx];
    if (!s) return '';
    return s.data
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p, i) => {
        const idx = points.findIndex((pt) => pt.date === p.date);
        const x = padding.left + idx * xStep;
        const y = padding.top + yScale(p.value);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  // Y-axis ticks (4 níveis)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Line chart"
      >
        {/* Y-axis grid */}
        {yTicks.map((tick, i) => {
          const y = padding.top + yScale(tick);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={W - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray={i === 0 ? '' : '2 4'}
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                fillOpacity={0.6}
              >
                {formatNumber(tick)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels (a cada N pontos para não poluir) */}
        {points.map((p, i) => {
          const showEvery = Math.max(1, Math.ceil(points.length / 6));
          if (i % showEvery !== 0 && i !== points.length - 1) return null;
          const x = padding.left + i * xStep;
          return (
            <text
              key={p.date}
              x={x}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {formatDate(p.date)}
            </text>
          );
        })}

        {/* Y-axis label */}
        {yLabel && (
          <text
            x={4}
            y={padding.top - 4}
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.6}
          >
            {yLabel}
          </text>
        )}

        {/* Series paths */}
        {series.map((s, i) => (
          <path
            key={s.label}
            d={pathFor(i)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Hover targets (invisíveis, capturam mouse) */}
        {points.map((p, i) => {
          const x = padding.left + i * xStep;
          return (
            <g key={p.date}>
              {p.values.map((v, vi) => {
                const s = series[vi];
                if (!s) return null;
                const y = padding.top + yScale(v.value);
                return (
                  <circle
                    key={`${p.date}-${vi}`}
                    cx={x}
                    cy={y}
                    r={3}
                    fill={s.color}
                    onMouseEnter={() =>
                      setHover({
                        x,
                        y,
                        point: { date: p.date, value: v.value },
                        seriesLabel: s.label,
                        seriesColor: s.color,
                      })
                    }
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            minWidth: TOOLTIP_MIN_WIDTH,
          }}
        >
          <div className="font-medium" style={{ color: hover.seriesColor }}>
            {hover.seriesLabel}
          </div>
          <div className="text-muted-foreground">{formatDate(hover.point.date)}</div>
          <div className="font-mono font-semibold">{formatNumber(hover.point.value)}</div>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. BarChart — multi-série diária (Engagement)
// ============================================================================

export interface BarChartProps {
  /** Cada entrada: { date, values: { [seriesKey]: number } } */
  data: MultiSeriesPoint[];
  series: { key: string; label: string; color: string }[];
  height?: number;
}

export function BarChart({ data, series, height = 220 }: BarChartProps) {
  const [hover, setHover] = useState<{
    point: MultiSeriesPoint;
    x: number;
  } | null>(null);

  const { yMax, padding } = useMemo(() => {
    let max = 0;
    data.forEach((p) =>
      series.forEach((s) => {
        if ((p.values[s.key] ?? 0) > max) max = p.values[s.key] ?? 0;
      })
    );
    if (max === 0) max = 1;
    return {
      yMax: max,
      padding: { top: 16, right: 12, bottom: 28, left: 36 },
    };
  }, [data, series]);

  const W = 600;
  const H = height;
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  const groupWidth = data.length > 0 ? innerW / data.length : 0;
  const barWidth = Math.max(2, (groupWidth - 2) / series.length);
  const yScale = (v: number) => innerH - (v / yMax) * innerH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Bar chart"
      >
        {/* Grid */}
        {yTicks.map((tick, i) => {
          const y = padding.top + yScale(tick);
          return (
            <line
              key={i}
              x1={padding.left}
              x2={W - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray={i === 0 ? '' : '2 4'}
            />
          );
        })}
        {yTicks.map((tick, i) => {
          const y = padding.top + yScale(tick);
          return (
            <text
              key={`t-${i}`}
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {formatNumber(tick)}
            </text>
          );
        })}

        {/* Bars */}
        {data.map((p, i) => {
          const groupX = padding.left + i * groupWidth + 1;
          return (
            <g key={p.date}>
              {series.map((s, si) => {
                const v = p.values[s.key] ?? 0;
                const h = (v / yMax) * innerH;
                const x = groupX + si * barWidth;
                const y = padding.top + (innerH - h);
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={y}
                    width={barWidth - 1}
                    height={h}
                    fill={s.color}
                    rx={1}
                    onMouseEnter={() =>
                      setHover({ point: p, x: groupX + groupWidth / 2 })
                    }
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })}
              {/* X label a cada N */}
              {(() => {
                const showEvery = Math.max(1, Math.ceil(data.length / 6));
                if (i % showEvery !== 0 && i !== data.length - 1) return null;
                return (
                  <text
                    x={groupX + groupWidth / 2}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {formatDate(p.date)}
                  </text>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: '20%',
            transform: 'translate(-50%, -50%)',
            minWidth: TOOLTIP_MIN_WIDTH,
          }}
        >
          <div className="font-medium">{formatDate(hover.point.date)}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="font-mono">
                {formatNumber(hover.point.values[s.key] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 3. Heatmap — Cohort Retention
// ============================================================================

export interface HeatmapProps {
  /** Linhas: cohort (ex: "Sem 22" = semana 22 de 2026) */
  cohorts: string[];
  /** Colunas: "W0" | "W1" | ... | "W6" */
  weeks: string[];
  /** cells[cohortIdx][weekIdx] = retention % (0..100). null = sem dado. */
  cells: (number | null)[][];
  height?: number;
}

export function Heatmap({ cohorts, weeks, cells, height = 280 }: HeatmapProps) {
  const [hover, setHover] = useState<{
    cohort: string;
    week: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  const cellH = Math.max(16, Math.min(28, (height - 32) / Math.max(cohorts.length, 1)));
  const labelW = 56;
  const W = 520;
  const H = cellH * cohorts.length + 32;
  const innerW = W - labelW - 8;
  const cellW = innerW / weeks.length;

  function cellColor(v: number | null): string {
    if (v === null) return 'rgba(120,120,120,0.05)';
    // 0% = transparente, 100% = verde saturado. Usar HSL.
    const lightness = 90 - v * 0.6; // 90% -> 30%
    return `hsl(140, 60%, ${lightness}%)`;
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 'auto', maxHeight: height }}
        role="img"
        aria-label="Retention cohort heatmap"
      >
        {/* Week headers (top) */}
        {weeks.map((w, i) => (
          <text
            key={w}
            x={labelW + i * cellW + cellW / 2}
            y={14}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.7}
          >
            {w}
          </text>
        ))}

        {/* Cohort rows */}
        {cohorts.map((c, ci) => (
          <g key={c}>
            <text
              x={labelW - 6}
              y={32 + ci * cellH + cellH / 2 + 3}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.7}
            >
              {c}
            </text>
            {weeks.map((w, wi) => {
              const v = cells[ci]?.[wi] ?? null;
              const x = labelW + wi * cellW;
              const y = 24 + ci * cellH;
              return (
                <rect
                  key={`${c}-${w}`}
                  x={x + 1}
                  y={y}
                  width={cellW - 2}
                  height={cellH - 2}
                  fill={cellColor(v)}
                  stroke="rgba(255,255,255,0.05)"
                  rx={2}
                  onMouseEnter={() =>
                    setHover({ cohort: c, week: w, value: v, x: x + cellW / 2, y })
                  }
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </g>
        ))}

        {/* Values (somente quando há espaço) */}
        {cohorts.map((c, ci) =>
          weeks.map((w, wi) => {
            const v = cells[ci]?.[wi];
            if (v === null || v === undefined) return null;
            if (cellW < 30) return null;
            return (
              <text
                key={`${c}-${w}-v`}
                x={labelW + wi * cellW + cellW / 2}
                y={32 + ci * cellH + cellH / 2 + 3}
                textAnchor="middle"
                fontSize={9}
                fill={v > 60 ? 'white' : 'currentColor'}
                fillOpacity={v > 60 ? 0.95 : 0.7}
                pointerEvents="none"
              >
                {Math.round(v)}%
              </text>
            );
          })
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            minWidth: TOOLTIP_MIN_WIDTH,
          }}
        >
          <div className="font-medium">{hover.cohort} · {hover.week}</div>
          <div className="font-mono">
            {hover.value === null ? 'sem dados' : `${hover.value.toFixed(1)}%`}
          </div>
        </div>
      )}
    </div>
  );
}
