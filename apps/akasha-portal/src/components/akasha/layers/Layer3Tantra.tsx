'use client';
import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { TantricNode, TooltipKey } from '@/components/akasha/mandala-layers';

interface Layer3Props {
  tantricNodes: TantricNode[];
  tooltipByLayer: Record<Layer, TooltipKey>;
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
  const { t } = useTranslation();
  const tip3 = tooltipByLayer[3];
  const ariaLabel = t(tip3.key, { ...tip3.params } as Record<string, string>);
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
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Layer 3 ring at r=138 */}
      <circle
        cx="200"
        cy="200"
        r="138"
        fill="none"
        stroke="rgba(45,212,191,0.1)"
        strokeWidth="0.75"
        strokeDasharray="1 4"
      />

      {/* Web lines between adjacent tantric nodes */}
      {tantricNodes.map(({ pos }, i) => {
        const next = tantricNodes[(i + 1) % tantricNodes.length];
        return (
          <line
            key={`web-${i}`}
            x1={pos.x}
            y1={pos.y}
            x2={next.pos.x}
            y2={next.pos.y}
            stroke="rgba(45,212,191,0.12)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Tantric body nodes */}
      {tantricNodes.map(({ pos, active, label }, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="8"
            fill={active ? 'rgba(45,212,191,0.6)' : 'rgba(251,87,129,0.5)'}
            stroke={active ? '#2DD4BF' : '#FB5781'}
            strokeWidth="1.2"
            filter={active ? 'url(#glow-akasha)' : undefined}
          />
          <text
            x={pos.x}
            y={pos.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill={active ? '#FFFFFF' : '#A7AECF'}
            fontWeight={active ? '700' : '400'}
            style={{ userSelect: 'none' }}
          >
            {label}
          </text>
        </g>
      ))}
    </g>
  );
});

export { Layer3Tantra };
