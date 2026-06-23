'use client';
import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { describeArc, PARTICLES, toXY } from '@/components/akasha/mandala-geometry';
import { buildAstroSegments } from '@/components/akasha/mandala-layers';
import { longitudeToSvgAngle } from '@/lib/shared/zodiac';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { PlanetDot, TooltipKey } from '@/components/akasha/mandala-layers';

const ASTRO_SEGMENTS = buildAstroSegments();

interface Layer4Props {
  planetDots: PlanetDot[];
  tooltipByLayer: Record<Layer, TooltipKey>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
  ringPaused: boolean;
  reducedMotion?: boolean;
}

/** Layer 4 — Movimento Celeste (Astrology).
 * 12 zodiac sign segments + 12 house lines + 10 planet glyphs on ecliptic.
 * Rotation: CSS animation (NOT requestAnimationFrame). The zodiac ring uses
 * the `ring-rotate` keyframe (120s period, mandala-css.ts) applied via
 * className='ring-astrological' on the <g> element. Two reduced-motion
 * mechanisms:
 *   1. Component-level: reducedMotion=true or ringPaused=true → class switches
 *      to 'ring-astrological-paused' → `animation: none` (instant stop)
 *   2. Global fallback: `@media (prefers-reduced-motion: reduce) { * { animation:
 *      none !important } }` in mandala-css.ts MANDALA_STYLES string.
 * RAF is NOT used — CHANGELOG claim of "RAF-driven rotation" is incorrect.
 * Phase 1 extracted from MandalaChart.tsx.
 * Keyboard accessible: Enter/Space to activate. */
const Layer4Astrology = memo(function Layer4Astrology({
  planetDots,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
  ringPaused,
  reducedMotion = false,
}: Layer4Props) {
  const { t } = useTranslation();
  const tip4 = tooltipByLayer[4];
  const ariaLabel = t(tip4.key, { ...tip4.params } as Record<string, string>);
  const ringClass = ringPaused || reducedMotion
    ? 'ring-astrological-paused'
    : 'ring-astrological';

  return (
    <g
      opacity={opacity(4)}
      onClick={() => onLayerToggle(4)}
      onMouseEnter={() => onLayerHover(4)}
      onMouseLeave={() => onLayerHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLayerToggle(4);
        }
      }}
      style={{ cursor: 'pointer' }}
      className={ringClass}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Outer decorative rings */}
      <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />
      <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />

      {/* 12 zodiac sign segments at r=183 — ASTRO_SEGMENTS matches current inline code */}
      {ASTRO_SEGMENTS.map(({ startDeg, endDeg, sym, labelPos }, i) => (
        <g key={`seg-${i}`}>
          <path
            d={describeArc(200, 200, 170, startDeg, endDeg)}
            fill="none"
            stroke="rgba(124,92,255,0.25)"
            strokeWidth="13"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="rgba(124,92,255,0.7)"
            style={{ userSelect: 'none' }}
          >
            {sym}
          </text>
        </g>
      ))}

      {/* 12 house lines + number labels (Mandala Fase 3) */}
      {Array.from({ length: 12 }, (_, h) => {
        const start = h * 30;
        const end = start + 30;
        const midAngle = start + 15;
        const labelRadius = 155;
        const labelPos = toXY(200, 200, labelRadius, midAngle);
        return (
          <g key={`house-${h}`}>
            <line
              x1="200"
              y1="200"
              x2={toXY(200, 200, 196, midAngle).x}
              y2={toXY(200, 200, 196, midAngle).y}
              stroke="rgba(124,92,255,0.15)"
              strokeWidth="0.5"
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="rgba(124,92,255,0.5)"
              style={{ userSelect: 'none' }}
            >
              {h + 1}
            </text>
          </g>
        );
      })}

      {/* Planet glyphs — p.pos already computed by buildPlanetDots */}
      {planetDots.map((p, i) => (
        <g key={`planet-${p.name}-${i}`} filter="url(#glow-akasha)">
          <circle cx={p.pos.x} cy={p.pos.y} r="8" fill={p.color} opacity="0.9" />
          <text
            x={p.pos.x}
            y={p.pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#FFFFFF"
            fontWeight="700"
            style={{ userSelect: 'none' }}
          >
            {p.glyph}
          </text>
        </g>
      ))}

      {/* Particle dots — r=1.5 white, matches current inline */}
      {PARTICLES.map((pt, i) => (
        <circle
          key={`particle-${i}`}
          cx={pt.x}
          cy={pt.y}
          r="1.5"
          fill="rgba(255,255,255,0.3)"
          className="particle-blink"
        />
      ))}

      {/* Layer label */}
      <text
        x="200"
        y="12"
        textAnchor="middle"
        fontSize="9"
        fill="rgba(124,92,255,0.6)"
        letterSpacing="1.5"
        style={{ userSelect: 'none' }}
      >
        MOVIMENTO CELESTE
      </text>
    </g>
  );
});
export { Layer4Astrology };

export default Layer4Astrology;
