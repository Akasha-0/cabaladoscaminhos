// ============================================================================
// src/components/akasha/typing-cursor.tsx
// ============================================================================
// A minimal, calm blinking caret. No emoji, no glow — sacred-tech respect
// for the cursor as the "threshold" between human and machine.
//
// The cursor is rendered as a single 2px-wide bar that pulses at 1.1s
// (slower than the typical 0.5s of chat UIs — we want calm, not anxious).
// ============================================================================

'use client';

import React from 'react';

export interface TypingCursorProps {
  /** Color of the bar. Default = amber-300 (matches the page palette). */
  className?: string;
  /** Slow = 1.1s, fast = 0.6s. Default 'slow'. */
  speed?: 'slow' | 'fast';
  /** Show or hide. (Faded out when no stream is in flight.) */
  visible?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

export function TypingCursor({
  className = 'bg-amber-300/80',
  speed = 'slow',
  visible = true,
  ariaLabel = 'Akasha está digitando',
}: TypingCursorProps): React.ReactElement {
  if (!visible) return <></>;
  const duration = speed === 'fast' ? 'duration-600' : 'duration-1100';
  return (
    <span
      className={`ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse align-middle ${className} ${duration}`}
      aria-label={ariaLabel}
      aria-live="polite"
      role="status"
    />
  );
}

export default TypingCursor;
