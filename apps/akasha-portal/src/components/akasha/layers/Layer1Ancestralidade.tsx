'use client';
import { memo } from 'react';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { MandalaData } from '@/components/akasha/MandalaChart';

interface Layer1Props {
  data: MandalaData;
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}

/** Layer 1 — Ancestralidade (Odu/Ifá system).
 * Animated gold glow rings + Odu name + Orixá regência.
 * Phase 1 extracted from MandalaChart.tsx. */
export const Layer1Ancestralidade = memo(function Layer1Ancestralidade({
  data,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
}: Layer1Props) {
  return (
    <g
      opacity={opacity(1)}
      onClick={() => onLayerToggle(1)}
      onMouseEnter={() => onLayerHover(1)}
      onMouseLeave={() => onLayerHover(null)}
      style={{ cursor: 'pointer' }}
    >
      <title>{tooltipByLayer[1]}</title>

      {/* Animated glow rings — 3 concentric, phase-offset */}
      <circle cx="200" cy="200" r="50" fill="none" stroke="#F0B429" strokeWidth="0.5" opacity="0.15" className="mandala-pulse-3" />
      <circle cx="200" cy="200" r="44" fill="none" stroke="#F0B429" strokeWidth="0.75" opacity="0.2" className="mandala-pulse-2" />
      <circle cx="200" cy="200" r="40" fill="url(#oriGlow)" className="mandala-pulse" />
      <circle
        cx="200"
        cy="200"
        r="34"
        fill="rgba(240,180,41,0.08)"
        stroke="#F0B429"
        strokeWidth="1.5"
        className="mandala-pulse"
      />

      {/* Core dot */}
      <circle cx="200" cy="200" r="7" fill="#F0B429" filter="url(#glow-akasha)" />

      {/* Odu name — truncated at 14 chars */}
      <text
        x="200"
        y="216"
        textAnchor="middle"
        fontSize="10"
        fill="#F0B429"
        fontWeight="600"
        style={{ textShadow: '0 0 8px #F0B429' }}
      >
        {data.odus.oduName.length > 14
          ? data.odus.oduName.slice(0, 14) + '…'
          : data.odus.oduName}
      </text>

      {/* Orixá regência (primeiro da lista) */}
      {data.odus.orixaRegency[0] && (
        <text
          x="200"
          y="226"
          textAnchor="middle"
          fontSize="10"
          fill="#F0B429"
          style={{ textShadow: '0 0 8px #F0B429' }}
        >
          {data.odus.orixaRegency[0]}
        </text>
      )}
    </g>
  );
});
