'use client';

/**
 * ============================================================================
 * Loading — Spinner, skeleton, and full-page loading states
 * ============================================================================
 * Three variants:
 *   - `spinner`: animated circle (default)
 *   - `skeleton`: shimmering placeholder block
 *   - `overlay`: full-viewport modal-style loader with optional message
 * Respects `prefers-reduced-motion` (already enforced globally in globals.css).
 * ============================================================================
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type Variant = 'spinner' | 'skeleton' | 'overlay';
type Size = 'sm' | 'md' | 'lg';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual treatment. */
  variant?: Variant;
  /** Size for spinner / text scale. */
  size?: Size;
  /** Accessible label for screen readers. */
  label?: string;
  /** Optional inline message below the spinner. */
  message?: string;
  /** Skeleton: number of placeholder lines (only when variant="skeleton"). */
  lines?: number;
  /** Override default color (CSS var or hex). */
  color?: string;
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const messageSizeStyles: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function Spinner({ size, color }: { size: Size; color?: string }) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeStyles[size])}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}

function SkeletonLines({ lines = 3, size }: { lines: number; size: Size }) {
  // Last line is shorter for visual rhythm.
  return (
    <div className="flex w-full flex-col gap-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton rounded-md',
            size === 'sm' && 'h-2',
            size === 'md' && 'h-3',
            size === 'lg' && 'h-4',
            i === lines - 1 && 'w-2/3'
          )}
        />
      ))}
    </div>
  );
}

function Loading({
  variant = 'spinner',
  size = 'md',
  label = 'Carregando',
  message,
  lines = 3,
  color,
  className,
  ...props
}: LoadingProps) {
  const messageNode = message && (
    <p
      className={cn(
        'text-muted-foreground',
        messageSizeStyles[size]
      )}
    >
      {message}
    </p>
  );

  if (variant === 'overlay') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(
          'modal-overlay flex items-center justify-center',
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card px-6 py-5 shadow-modal">
          <Spinner size={size} color={color} />
          {messageNode}
        </div>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        role="status"
        aria-label={label}
        aria-live="polite"
        className={cn('flex w-full flex-col gap-2', className)}
        {...props}
      >
        <SkeletonLines lines={lines} size={size} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  // spinner (default)
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
      {...props}
    >
      <Spinner size={size} color={color} />
      {messageNode}
    </div>
  );
}

export { Loading };
export type { LoadingProps, Variant as LoadingVariant, Size as LoadingSize };
