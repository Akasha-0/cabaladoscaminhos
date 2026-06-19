'use client';
import { memo } from 'react';
import type { Layer } from '@/components/akasha/mandala-geometry';
import { PILAR_COLORS } from '@/components/akasha/mandala-geometry';
import type { KabVert } from '@/components/akasha/mandala-layers';
import type { MandalaData } from '@/components/akasha/MandalaChart';

interface Layer2Props {
  data: MandalaData;
  kabVerts: KabVert[];
  trianglePath: string;
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}

/** Layer 2 — Número de Vida (Kabala triangle: Vida / Expressão / Motivação).
 * Keyboard accessible: Enter/Space to activate. */
export const Layer2Kabala = memo(function Layer2Kabala({
  kabVerts,
  trianglePath,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
}: Layer2Props) {
  return (
    <g
      opacity={opacity(2)}
      onClick={() => onLayerToggle(2)}
      onMouseEnter={() => onLayerHover(2)}
      onMouseLeave={() => onLayerHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLayerToggle(2);
        }
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={tooltipByLayer[2]}
    >
      <title>{tooltipByLayer[2]}</title>

      {/* Outer ring */}
      <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(92,124,255,0.2)" strokeWidth="1" strokeDasharray="2 3" />

      {/* Triangle fill + stroke */}
      <path
        d={trianglePath}
        fill="rgba(92,124,255,0.05)"
        stroke={PILAR_COLORS[2]}
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* 3 vertices: Vida, Expressão, Motivação */}
      {kabVerts.map(({ pos, value, master }, i) => (
        <g key={i}>
          {master && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r="14"
              fill="none"
              stroke="#7D9BFF"
              strokeWidth="0.75"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          )}
          <circle
            cx={pos.x}
            cy={pos.y}
            r="11"
            fill="rgba(92,124,255,0.18)"
            stroke={PILAR_COLORS[2]}
            strokeWidth="1.2"
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#F4F5FF"
            fontWeight="700"
          >
            {value ?? '?'}
          </text>
        </g>
      ))}
    </g>
  );
});
