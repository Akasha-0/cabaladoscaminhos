// Layer4Astrology — Movimento Celeste (Layer 4).
// Zodiac ring (12 arcs), 12 house lines + numbers, planet glyphs.
// When active and prefers-reduced-motion is false, RAF drives ring rotation.

import React, { memo, useRef, useEffect } from 'react';
import {
  describeArc,
  PARTICLES,
  toXY,
  type Layer,
} from '@/components/akasha/mandala-geometry';
import { type PlanetDot } from '@/components/akasha/mandala-layers';
import type { MandalaData } from '@/components/akasha/MandalaChart';
import { longitudeToSvgAngle } from '@/lib/shared/zodiac';

interface Props {
  data: MandalaData;
  planetDots: PlanetDot[];
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
  ringPaused?: boolean;
  reducedMotion?: boolean;
}

const ASTRO_SEGMENTS = [
  { sym: '♈', name: 'Áries' },
  { sym: '♉', name: 'Touro' },
  { sym: '♊', name: 'Gêmeos' },
  { sym: '♋', name: 'Câncer' },
  { sym: '♌', name: 'Leão' },
  { sym: '♍', name: 'Virgem' },
  { sym: '♎', name: 'Libra' },
  { sym: '♏', name: 'Escorpião' },
  { sym: '♐', name: 'Sagitário' },
  { sym: '♑', name: 'Capricórnio' },
  { sym: '♒', name: 'Aquário' },
  { sym: '♓', name: 'Peixes' },
];

export const Layer4Astrology = memo(function Layer4Astrology({
  data,
  planetDots,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
  ringPaused = false,
  reducedMotion = false,
}: Props) {
  // RAF rotation ref — stores the animation frame id so we can cancel it.
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Only animate when ring is NOT paused AND motion is allowed.
    if (ringPaused || reducedMotion) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let angle = 0;
    const animate = () => {
      angle = (angle + 0.04) % 360;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [ringPaused, reducedMotion]);

  return (
    <g
      opacity={opacity(4)}
      onClick={() => onLayerToggle(4)}
      onMouseEnter={() => onLayerHover(4)}
      onMouseLeave={() => onLayerHover(null)}
      style={{ cursor: 'pointer' }}
      className={ringPaused ? 'ring-astrological-paused' : 'ring-astrological'}
    >
      <title>{tooltipByLayer[4]}</title>
      <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />
      <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />

      {/* Zodiac arcs + symbols */}
      {ASTRO_SEGMENTS.map(({ sym }, i) => {
        const startDeg = i * 30;
        const endDeg = (i + 1) * 30;
        const midDeg = startDeg + 15;
        const labelPos = toXY(midDeg, 190);
        return (
          <g key={i}>
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
        );
      })}

      {/* 12 house lines + numbers */}
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

      {/* Planet glyphs */}
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

      {/* Ring label */}
      <text x="200" y="14" textAnchor="middle" fontSize="10" fill="rgba(124,92,255,0.7)" letterSpacing="2">
        MOVIMENTO CELESTE
      </text>

      {/* Particle dots on outer edge */}
      {PARTICLES.map((pt, i) => (
        <circle
          key={`particle-${i}`}
          cx={pt.x}
          cy={pt.y}
          r="1.5"
          fill="white"
          className="particle-blink"
        />
      ))}
    </g>
  );
});
