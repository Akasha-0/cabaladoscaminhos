'use client';

// ============================================================================
// ConfirmCheck — animated SVG checkmark (Wave 24)
// ============================================================================
// Microinteração para ações de confirmação (bookmark salvo, comentário
// enviado, follow aceito). Desenha o tick com stroke-dasharray +
// stroke-dashoffset transitioning de 1 → 0.
//
// Self-contained: zero JS por frame depois da mount.
// Reduced-motion: aparece instantaneamente sem o draw.
// ============================================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ConfirmCheckProps {
  /** Trigger — when true, plays the draw animation. */
  active: boolean;
  /** Diameter in px (default 18). */
  size?: number;
  /** Stroke color (default currentColor). */
  color?: string;
  /** Stroke width in px (default 2.2). */
  strokeWidth?: number;
  /** Aria-label override. */
  label?: string;
  className?: string;
}

export function ConfirmCheck({
  active,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2.2,
  label = 'Confirmado',
  className,
}: ConfirmCheckProps) {
  // Reduced-motion: show solid check instantly
  const reducedMotion = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // SVG path total length ≈ 22 for the check shape below
  const TOTAL_LENGTH = 22;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={active ? label : undefined}
      className={cn('inline-block', className)}
    >
      <path
        d="M5 12.5 L10 17.5 L19 7.5"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: TOTAL_LENGTH,
          strokeDashoffset: active ? 0 : TOTAL_LENGTH,
          transition: reducedMotion.current
            ? 'none'
            : 'stroke-dashoffset 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </svg>
  );
}

export default ConfirmCheck;
