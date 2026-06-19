'use client';
import { memo } from 'react';
import { STARS } from '@/components/akasha/mandala-geometry';

/** LayerStars — 30 deterministic background stars (golden-angle seed).
 * Phase 1 extracted from MandalaChart.tsx SVG body. */
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
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </>
  );
});
