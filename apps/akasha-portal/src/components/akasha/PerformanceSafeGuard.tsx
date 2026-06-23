'use client';

import { useEffect } from 'react';

/**
 * Patching `performance.measure` to prevent crashes from Next.js + Turbopack
 * performance timing race conditions in development mode.
 *
 * Next.js 16 (Turbopack) uses the Performance API internally to track page
 * rendering metrics. During hot-reload cycles, a race condition can cause
 * `performance.measure(name)` to be called before the corresponding
 * `performance.mark()` is recorded, throwing:
 *
 *   Failed to execute 'measure' on 'Performance': '…' cannot have a negative time stamp.
 *
 * This component wraps the native `performance.measure` with a try-catch so
 * that transient timing races degrade gracefully instead of crashing the page.
 */
export function PerformanceSafeGuard() {
  useEffect(() => {
    if (typeof performance === 'undefined') return;

    const original = performance.measure.bind(performance);

    // eslint-disable-next-line no-extend-native
    performance.measure = (measureName, startMark, endMark) => {
      try {
        return original(measureName, startMark, endMark);
      } catch {
        // Swallow: Next.js internal timing race, not actionable.
        return undefined as unknown as PerformanceMeasure;
      }
    };

    return () => {
      // Restore on unmount (should never happen for a root-level component).
      performance.measure = original;
    };
  }, []);

  return null;
}
