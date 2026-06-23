'use client';
import { memo } from 'react';
import type { TantricNode } from '@/components/akasha/mandala-layers';

interface LayerSynergyLinesProps {
  tantricNodes: TantricNode[];
  reducedMotion: boolean;
}

/** LayerSynergyLines — 11 dashed lines from Layer 3 tantric nodes to center (200,200).
 * Solid teal when active, pink when inactive.
 * Phase 1 extracted from MandalaChart.tsx.
 * Render BEFORE Layer2 so it appears behind Layer 2 (SVG painter's model). */
export const LayerSynergyLines = memo(function LayerSynergyLines({
  tantricNodes,
  reducedMotion,
}: LayerSynergyLinesProps) {
  return (
    <>
      {tantricNodes.map(({ pos, active }, i) => (
        <line
          key={`synergy-${i}`}
          x1={pos.x}
          y1={pos.y}
          x2={200}
          y2={200}
          stroke={active ? '#2DD4BF' : '#FB5781'}
          strokeWidth="0.6"
          strokeDasharray="4 6"
          opacity={active ? 0.35 : 0.25}
          className={reducedMotion ? undefined : active ? 'synergy-active' : 'synergy-alert'}
          style={{ animationDelay: reducedMotion ? undefined : `${(i * 0.27) % 2}s` }}
        />
      ))}
    </>
  );
});
