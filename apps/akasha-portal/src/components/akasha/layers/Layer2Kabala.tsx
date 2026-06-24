'use client';
import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { Layer } from '@/components/akasha/mandala-geometry';
import type { SefiraTree, SefiraName, TooltipKey } from '@/components/akasha/mandala-layers';
import type { MandalaData } from '@/components/akasha/MandalaChart';

interface Layer2Props {
  data: MandalaData;
  sefiraTree: SefiraTree;
  tooltipByLayer: Record<Layer, TooltipKey>;
  opacity: (layer: Layer) => number;
  onLayerToggle: (layer: Layer) => void;
  onLayerHover: (layer: Layer | null) => void;
}

const SEFIRA_COLORS: Record<SefiraName, string> = {
  Keter:    '#9B7FD4',
  Chokhmah: '#4FC3F7',
  Binah:    '#1565C0',
  Chesed:   '#42A5F5',
  Gevurah:  '#EF5350',
  Tiferet:  '#FFD700',
  Netzach:  '#4CAF50',
  Hod:      '#FFA726',
  Yesod:    '#AB47BC',
  Malkuth:  '#8D6E63',
};

/** Layer 2 — Número de Vida (Kabala Sefirot Tree of Life).
 * Keyboard accessible: Enter/Space to activate. */
export const Layer2Kabala = memo(function Layer2Kabala({
  sefiraTree,
  tooltipByLayer,
  opacity,
  onLayerToggle,
  onLayerHover,
}: Layer2Props) {
  const { nodes, paths } = sefiraTree;
  const { t } = useTranslation();
  const tip2 = tooltipByLayer[2];
  const ariaLabel = t(tip2.key, { ...tip2.params } as Record<string, string>);

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
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Outer decorative ring */}
      <circle
        cx="200"
        cy="200"
        r="168"
        fill="none"
        stroke="rgba(155,127,212,0.12)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* 22 paths — inactive at 20% opacity, active at full */}
      {paths.map((p) => (
        <line
          key={p.pathNumber}
          x1={p.sefiraA === 'Keter'    ? 200
             : p.sefiraA === 'Chokhmah' ? 245
             : p.sefiraA === 'Binah'    ? 155
             : p.sefiraA === 'Chesed'   ? 245
             : p.sefiraA === 'Gevurah'  ? 155
             : p.sefiraA === 'Tiferet'  ? 200
             : p.sefiraA === 'Netzach'  ? 245
             : p.sefiraA === 'Hod'      ? 155
             : p.sefiraA === 'Yesod'    ? 200
             : 200}
          y1={p.sefiraA === 'Keter'    ? 35
             : p.sefiraA === 'Chokhmah' ? 110
             : p.sefiraA === 'Binah'    ? 110
             : p.sefiraA === 'Chesed'   ? 155
             : p.sefiraA === 'Gevurah'  ? 155
             : p.sefiraA === 'Tiferet'  ? 180
             : p.sefiraA === 'Netzach'  ? 240
             : p.sefiraA === 'Hod'      ? 240
             : p.sefiraA === 'Yesod'    ? 275
             : 320}
          x2={p.sefiraB === 'Keter'    ? 200
             : p.sefiraB === 'Chokhmah' ? 245
             : p.sefiraB === 'Binah'    ? 155
             : p.sefiraB === 'Chesed'   ? 245
             : p.sefiraB === 'Gevurah'  ? 155
             : p.sefiraB === 'Tiferet'  ? 200
             : p.sefiraB === 'Netzach'  ? 245
             : p.sefiraB === 'Hod'      ? 155
             : p.sefiraB === 'Yesod'    ? 200
             : 200}
          y2={p.sefiraB === 'Keter'    ? 35
             : p.sefiraB === 'Chokhmah' ? 110
             : p.sefiraB === 'Binah'    ? 110
             : p.sefiraB === 'Chesed'   ? 155
             : p.sefiraB === 'Gevurah'  ? 155
             : p.sefiraB === 'Tiferet'  ? 180
             : p.sefiraB === 'Netzach'  ? 240
             : p.sefiraB === 'Hod'      ? 240
             : p.sefiraB === 'Yesod'    ? 275
             : 320}
          stroke={SEFIRA_COLORS[p.sefiraA]}
          strokeWidth="1.5"
          opacity={p.active ? 0.85 : 0.2}
        />
      ))}

      {/* 10 sefira nodes */}
      {nodes.map((node) => {
        const color = SEFIRA_COLORS[node.name];
        const isActive = node.active;
        return (
          <g key={node.name}>
            {/* Active glow ring */}
            {isActive && (
              <circle
                cx={node.pos.x}
                cy={node.pos.y}
                r="18"
                fill="none"
                stroke={color}
                strokeWidth="0.75"
                opacity="0.35"
              />
            )}
            {/* Outer ring */}
            <circle
              cx={node.pos.x}
              cy={node.pos.y}
              r="13"
              fill={isActive ? `${color}33` : 'rgba(92,124,255,0.06)'}
              stroke={isActive ? color : 'rgba(92,124,255,0.3)'}
              strokeWidth={isActive ? '1.5' : '0.75'}
            />
            {/* Hebrew letter */}
            <text
              x={node.pos.x}
              y={node.pos.y - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill={isActive ? color : 'rgba(92,124,255,0.4)'}
              fontFamily="serif"
            >
              {node.hebrewLetter ?? ''}
            </text>
            {/* Number */}
            <text
              x={node.pos.x}
              y={node.pos.y + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fontWeight="700"
              fill={isActive ? '#F4F5FF' : 'rgba(92,124,255,0.4)'}
            >
              {node.number ?? '?'}
            </text>
          </g>
        );
      })}
    </g>
  );
});
