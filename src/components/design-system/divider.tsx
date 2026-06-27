'use client';

/**
 * ============================================================================
 * Divider — Visual separator between content blocks
 * ============================================================================
 * Horizontal or vertical line with optional label and spiritual glow.
 * Built on semantic tokens (--border, --spiritual-gold).
 * ============================================================================
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

type Orientation = 'horizontal' | 'vertical';
type Variant = 'default' | 'subtle' | 'spiritual' | 'glow';
type Thickness = 'thin' | 'medium' | 'thick';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout axis. Horizontal = full-width line; vertical = full-height line. */
  orientation?: Orientation;
  /** Visual flavor. `spiritual` uses gold; `glow` adds a soft outer halo. */
  variant?: Variant;
  /** Line thickness. Tailwind-aligned. */
  thickness?: Thickness;
  /** Optional inline label. Renders centered with horizontal divider. */
  label?: React.ReactNode;
  /** Override default color (CSS var or hex). */
  color?: string;
}

const orientationStyles: Record<Orientation, string> = {
  horizontal: 'w-full',
  vertical: 'h-full inline-flex w-px self-stretch',
};

const variantStyles: Record<Variant, string> = {
  default: 'bg-border',
  subtle: 'bg-border/50',
  spiritual:
    'bg-gradient-to-r from-transparent via-[var(--spiritual-gold)]/60 to-transparent',
  glow: 'bg-border shadow-[0_0_12px_var(--spiritual-gold-muted)]',
};

const thicknessStyles: Record<Orientation, Record<Thickness, string>> = {
  horizontal: {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1',
  },
  vertical: {
    thin: 'w-px',
    medium: 'w-0.5',
    thick: 'w-1',
  },
};

function Divider({
  orientation = 'horizontal',
  variant = 'default',
  thickness = 'thin',
  label,
  color,
  className,
  ...props
}: DividerProps) {
  // Label only makes sense for horizontal dividers.
  if (label && orientation === 'horizontal') {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'flex w-full items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'flex-1',
            thicknessStyles.horizontal[thickness],
            color ? '' : variantStyles[variant]
          )}
          style={color ? { backgroundColor: color } : undefined}
          aria-hidden
        />
        <span className="shrink-0 font-medium">{label}</span>
        <span
          className={cn(
            'flex-1',
            thicknessStyles.horizontal[thickness],
            color ? '' : variantStyles[variant]
          )}
          style={color ? { backgroundColor: color } : undefined}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientationStyles[orientation],
        thicknessStyles[orientation][thickness],
        color ? '' : variantStyles[variant],
        className
      )}
      style={color ? { backgroundColor: color } : undefined}
      {...props}
    />
  );
}

export { Divider };
export type { DividerProps, Orientation, Variant, Thickness };
