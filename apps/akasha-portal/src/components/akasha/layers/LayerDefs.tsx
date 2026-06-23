'use client';
import { memo } from 'react';

/** LayerDefs — all SVG <defs> for the Mandala.
 * Extracted into its own component so the <defs> block lives
 * inside the <svg> element without cluttering MandalaChart.
 * Must be rendered BEFORE any element that references these definitions. */
export const LayerDefs = memo(function LayerDefs() {
  return (
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0B0E1C" />
        <stop offset="100%" stopColor="#06070F" />
      </radialGradient>
      <radialGradient id="oriGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F0B429" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#F0B429" stopOpacity="0" />
      </radialGradient>
      <filter id="glow-akasha">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
});
