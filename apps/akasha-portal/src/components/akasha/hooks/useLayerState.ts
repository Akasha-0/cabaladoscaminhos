'use client';
import { useState, useCallback, memo } from 'react';
import type { Layer } from '@/components/akasha/mandala-geometry';

/** Phase 1 hook — extracts layer selection state + derived opacity logic.
 * Replaces inline useState + inline opacity() arrow in MandalaChart.
 * Memoised setActiveLayer/setHoveredLayer prevent full SVG re-renders. */
export function useLayerState() {
  const [activeLayer, setActiveLayer] = useState<null | Layer>(null);
  const [hoveredLayer, setHoveredLayer] = useState<null | Layer>(null);

  /** Pause the astrological ring rotation when Layer 4 is active. */
  const ringPaused = activeLayer === 4;

  /** Opacity for a given layer:
   *  - Active layer → 1
   *  - Null active (all dimmed) → 1
   *  - Non-active, non-hovered → 0.3
   *  - Hovered (even if another is active) → 1 */
  const opacity = useCallback(
    (layer: Layer): number => {
      if (activeLayer === null) return 1;
      if (activeLayer === layer) return 1;
      if (hoveredLayer !== null && hoveredLayer !== layer) return 0.3;
      return 1;
    },
    [activeLayer, hoveredLayer]
  );

  const handleSetActiveLayer = useCallback((layer: Layer) => {
    setActiveLayer((prev) => (prev === layer ? null : layer));
  }, []);

  const handleSetHoveredLayer = useCallback((layer: Layer | null) => {
    setHoveredLayer(layer);
  }, []);

  return {
    activeLayer,
    hoveredLayer,
    ringPaused,
    opacity,
    setActiveLayer: handleSetActiveLayer,
    setHoveredLayer: handleSetHoveredLayer,
  };
}
