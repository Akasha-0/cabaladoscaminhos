'use client';
import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { TooltipKey } from '@/components/akasha/mandala-layers';
import type { MandalaData } from '@/components/akasha/MandalaChart';

interface Layer5Props {
  data: MandalaData;
  tooltipByLayer: Record<Layer, TooltipKey>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}

/** Layer 5 — Mutação do Caminho (I Ching hexagram).
 * Single hexagram node at top (200, 110).
 * Phase 1 extracted from MandalaChart.tsx.
 * Keyboard accessible: Enter/Space to activate. */
const Layer5Iching = memo(function Layer5Iching({
  data,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
}: Layer5Props) {
  const { t } = useTranslation();
  const tip5 = tooltipByLayer[5];
  const ariaLabel = t(tip5.key, { ...tip5.params } as Record<string, string>);
  return (
    <g
      opacity={opacity(5)}
      onClick={() => onLayerToggle(5)}
      onMouseEnter={() => onLayerHover(5)}
      onMouseLeave={() => onLayerHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLayerToggle(5);
        }
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Dashed outer ring */}
      <circle
        cx="200"
        cy="200"
        r="110"
        fill="none"
        stroke="rgba(160,118,58,0.2)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* I-Ching node at top (200, 110) */}
      <g>
        <circle cx="200" cy="110" r="20" fill="rgba(160,118,58,0.12)" />
        <circle
          cx="200"
          cy="110"
          r="13"
          fill={data.iching.available ? '#A0763A' : 'rgba(160,118,58,0.35)'}
          opacity={data.iching.available ? 0.9 : 0.6}
          filter="url(#glow-akasha)"
        >
          <title>
            {data.iching.available
              ? `Hexagrama ${data.iching.hexagramNumber} — ${data.iching.hexagramName} (${data.iching.hexagramChineseName})`
              : 'Hexagrama do Ori ainda não calculado'}
          </title>
        </circle>
        <text
          x="200"
          y="110"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#F4F5FF"
          fontWeight="700"
        >
          {data.iching.hexagramNumber ?? '?'}
        </text>
        <text
          x="200"
          y="86"
          textAnchor="middle"
          fontSize="10"
          fill="#A0763A"
          letterSpacing="1.5"
          style={{ textShadow: '0 0 8px #A0763A' }}
        >
          MUTAÇÃO DO CAMINHO
        </text>
      </g>
    </g>
  );
});
export { Layer5Iching };
