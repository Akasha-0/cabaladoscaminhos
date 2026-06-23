'use client';
import { memo } from 'react';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { TantricNode } from '@/components/akasha/mandala-layers';

interface Layer3Props {
  tantricNodes: TantricNode[];
  tooltipByLayer: Record<Layer, string>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}

/** Layer 3 — Corpo e Energia (Tantric Bodies).
 * 11 nodes distributed evenly on r=138; web lines between adjacent nodes.
 * Active = teal, inactive = pink.
 * Keyboard accessible: Enter/Space to activate. */
const Layer3Tantra = memo(function Layer3Tantra({
  tantricNodes,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
}: Layer3Props) {
  return (
    <g
      opacity={opacity(3)}
      onClick={() => onLayerToggle(3)}
      onMouseEnter={() => onLayerHover(3)}
      onMouseLeave={() => onLayerHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLayerToggle(3);
        }
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={tooltipByLayer[3]}
    >
      <title>{tooltipByLayer[3]}</title>

      {/* Layer 3 ring at r=138 */}
      <circle
        cx="200"
        cy="200"
        r="138"
        fill="none"
        stroke="rgba(45,212,191,0.15)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Web lines between adjacent tantric nodes */}
      {tantricNodes.map(({ pos }, i) => {
        const next = tantricNodes[(i + 1) % 11];
        return (
          <line
            key={`web-${i}`}
            x1={pos.x}
            y1={pos.y}
            x2={next.pos.x}
            y2={next.pos.y}
            stroke="rgba(45,212,191,0.1)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Tantric body nodes */}
      {tantricNodes.map(({ pos, active, label }, i) => (
        <g key={`node-${i}`}>
          {!active && (
            <circle cx={pos.x} cy={pos.y} r="10" fill="rgba(251,87,129,0.35)" />
          )}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={active ? 6 : 7}
            fill={active ? '#2DD4BF' : '#FB5781'}
            opacity={active ? 0.9 : 0.75}
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#F4F5FF"
            fontWeight="bold"
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  );
});

export { Layer3Tantra };
