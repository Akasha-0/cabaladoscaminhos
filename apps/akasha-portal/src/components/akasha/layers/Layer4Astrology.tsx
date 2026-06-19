'use client';
import { memo } from 'react';
import { describeArc, PARTICLES, toXY } from '@/components/akasha/mandala-geometry';
import { buildAstroSegments } from '@/components/akasha/mandala-layers';
import { longitudeToSvgAngle } from '@/lib/shared/zodiac';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { MandalaData } from '@/components/akasha/MandalaChart';
import type { PlanetDot } from '@/components/akasha/mandala-layers';

const ASTRO_SEGMENTS = buildAstroSegments();

interface Layer4Props {
  planetDots: PlanetDot[];
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
  ringPaused: boolean;
  reducedMotion?: boolean;
}

/** Layer 4 — Movimento Celeste (Astrology).
 * 12 zodiac sign segments + 12 house lines + 10 planet glyphs on ecliptic.
 * Rotates via CSS; pauses when Layer 4 is active (ringPaused=true).
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
      aria-label={tooltipByLayer[4]}
    >
      <title>{tooltipByLayer[4]}</title>

      {/* Outer decorative rings */}
      <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />
      <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />

      {/* 12 zodiac sign segments at r=183 — ASTRO_SEGMENTS matches current inline code */}
      {ASTRO_SEGMENTS.map(({ startDeg, endDeg, sym, labelPos }, i) => (
        <g key={`seg-${i}`}>
          <path
            d={describeArc(200, 200, 183, startDeg, endDeg)}
            fill="none"
            stroke="rgba(38,48,79,0.7)"
            strokeWidth="1"
          />
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#8A9BC0"
          >
            {sym}
          </text>
        </g>
      ))}

      {/* 12 house lines + number labels (Mandala Fase 3) */}
      {Array.from({ length: 12 }, (_, h) => {
        const houseLong = h * 30;
        const angle = longitudeToSvgAngle(houseLong);
        const innerPos = toXY(angle, 152);
        const outerPos = toXY(angle, 168);
        return (
          <g key={`house-${h + 1}`}>
            <line
              x1={innerPos.x}
              y1={innerPos.y}
              x2={outerPos.x}
              y2={outerPos.y}
              stroke="rgba(255,255,255,0.20)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <text
              x={toXY(angle, 145).x}
              y={toXY(angle, 145).y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fill="rgba(255,255,255,1.0)"
              fontWeight="500"
            >
              {h + 1}
            </text>
          </g>
        );
      })}

      {/* Planet glyphs — p.pos already computed by buildPlanetDots */}
      {planetDots.map((p, i) => (
        <g key={`planet-${p.name}-${i}`} filter="url(#glow-akasha)">
          <text
            x={p.pos.x}
            y={p.pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fontWeight="600"
            fill={p.color}
            opacity="0.95"
            role="img"
            aria-label={`${p.name} em ${p.sign} casa ${p.house}${p.retrograde ? ' retrógrado' : ''}`}
          >
            {p.glyph}
            {p.retrograde ? '℞' : ''}
            <title>
              {p.name}: {p.sign} casa {p.house}
            </title>
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
          fill="white"
          className="particle-blink"
          style={{ animationDelay: `${pt.delay}s` }}
        />
      ))}

      {/* Layer label */}
      <text
        x="200"
        y="14"
        textAnchor="middle"
        fontSize="10"
        fill="rgba(124,92,255,0.7)"
        letterSpacing="2"
      >
        MOVIMENTO CELESTE
      </text>
    </g>
  );
});
export { Layer4Astrology };

export default Layer4Astrology;
