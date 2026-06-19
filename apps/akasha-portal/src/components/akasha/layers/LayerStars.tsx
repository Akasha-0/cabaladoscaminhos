// LayerStars — 30 background star circles with CSS nth-child stagger.
// No inline styles for animationDelay — stagger is handled by
// mandala-animations.css .star-twinkle:nth-child(N) rules.

import React, { memo } from 'react';
import { STARS } from '@/components/akasha/mandala-geometry';

export const LayerStars = memo(function LayerStars() {
  return (
    <>
      {STARS.map((s, i) => (
        <circle
          key={`star-${i}`}
          cx={s.x}
          cy={s.y}
          r="1"
          fill="white"
          opacity={s.opacity}
          className="star-twinkle"
        />
      ))}
    </>
  );
});
