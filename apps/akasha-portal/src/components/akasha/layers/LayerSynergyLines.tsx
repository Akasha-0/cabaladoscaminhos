// LayerSynergyLines — toroidal synergy lines from each TantricNode to center.
// Dash-flow animation via CSS classes (synergy-active / synergy-alert).
// nth-child stagger for animationDelay is handled by mandala-animations.css.

import React, { memo } from 'react';
import { type TantricNode } from '@/components/akasha/mandala-layers';

interface Props {
  tantricNodes: TantricNode[];
  reducedMotion?: boolean;
}

export const LayerSynergyLines = memo(function LayerSynergyLines({
  tantricNodes,
  reducedMotion = false,
}: Props) {
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
          strokeDashoffset="0"
          className={active ? 'synergy-active' : 'synergy-alert'}
          style={reducedMotion ? { animation: 'none' } : undefined}
        />
      ))}
    </>
  );
});
