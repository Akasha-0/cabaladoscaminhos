'use client';

// ============================================================================
// CountBounce — animated number tick (Wave 24)
// ============================================================================
// Quando o número muda, faz um scale pulse (1.18 → 1) + opacity
// (0.6 → 1) para feedback visual.
//
// Reduced-motion: change instantâneo sem pulse.
// ============================================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CountBounceProps {
  /** Value to display. Re-keys the inner span to retrigger animation. */
  value: number;
  /** Tailwind classes pass-through. */
  className?: string;
  /** Format function — defaults to identity. */
  format?: (n: number) => string;
}

export function CountBounce({ value, className, format }: CountBounceProps) {
  const reducedMotion = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <span
      key={value}
      className={cn(
        !reducedMotion.current && 'inline-block animate-count-bounce',
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {format ? format(value) : value}
    </span>
  );
}

export default CountBounce;
