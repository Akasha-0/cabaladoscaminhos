'use client';

// ============================================================================
// ViewerCount — live viewer count badge (W90s-A)
//
// Pure presentational. Receives a `count` and `peakCount` prop, renders the
// count in pt-BR locale with a pulsing dot when count > 0.
//
// aria-live="polite" so screen readers announce changes without interrupting.
//
// data-testid:
//   - viewer-count (root)
//   - viewer-count-number
//   - viewer-count-peak
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

export interface ViewerCountProps {
  readonly count: number;
  readonly peakCount?: number;
  /** Show the "pico X" suffix when peakCount > count. Default true. */
  readonly showPeak?: boolean;
  /** Accessible label override. */
  readonly label?: string;
  readonly className?: string;
}

function formatPtBr(n: number): string {
  try {
    return n.toLocaleString('pt-BR');
  } catch {
    return String(n);
  }
}

export function ViewerCount({
  count,
  peakCount,
  showPeak = true,
  label,
  className,
}: ViewerCountProps) {
  const safeCount = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
  const safePeakRaw = peakCount ?? safeCount;
  const safePeak =
    Number.isFinite(safePeakRaw) && safePeakRaw >= 0 ? Math.floor(safePeakRaw) : safeCount;
  const showPeakSuffix = showPeak && safePeak > safeCount;

  const accessibleLabel =
    label ??
    `${safeCount} ${safeCount === 1 ? 'pessoa assistindo' : 'pessoas assistindo'} agora`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={accessibleLabel}
      data-testid="viewer-count"
      className={cn(
        'inline-flex items-center gap-2',
        'rounded-full border border-border bg-card',
        'px-3 py-1.5 text-sm font-medium',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-2 rounded-full',
          safeCount > 0 ? 'bg-red-500 motion-safe:animate-pulse' : 'bg-muted-foreground',
        )}
      />
      <span data-testid="viewer-count-number">{formatPtBr(safeCount)}</span>
      <span className="text-muted-foreground">assistindo</span>
      {showPeakSuffix && (
        <span
          data-testid="viewer-count-peak"
          className="text-muted-foreground text-xs ml-1"
        >
          · pico {formatPtBr(safePeak)}
        </span>
      )}
    </div>
  );
}

export default ViewerCount;