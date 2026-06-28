'use client';

/**
 * ============================================================================
 * Skeleton — Shimmering placeholder primitives (Wave 17)
 * ============================================================================
 * Companion to `loading.tsx` — these are the building blocks you compose
 * inside feed/library/profile skeletons. Pairs with the global `.skeleton`
 * CSS class defined in `globals.css` (1.5s ease-in-out shimmer loop).
 *
 * Reduced motion: the CSS animation already respects `prefers-reduced-motion`
 * — the placeholder becomes a flat surface (still readable, not animated).
 *
 * Usage:
 *   <div className="space-y-3">
 *     <Skeleton variant="avatar" />
 *     <Skeleton variant="text" lines={3} />
 *     <Skeleton variant="card" />
 *   </div>
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type Variant =
  | 'text'
  | 'avatar'
  | 'circle'
  | 'rect'
  | 'card'
  | 'image'
  | 'button'
  | 'badge';

export type Size = 'sm' | 'md' | 'lg';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape / meaning of the placeholder. */
  variant?: Variant;
  /** Default size (only meaningful for text/avatar/badge/button). */
  size?: Size;
  /** Number of text lines to stack (only `variant="text"`). */
  lines?: number;
  /** Width override (any CSS length). */
  width?: string;
  /** Height override (any CSS length). */
  height?: string;
  /** Border radius override (any CSS length). */
  radius?: string;
}

const variantStyles: Record<Variant, string> = {
  text: 'skeleton h-3 w-full rounded',
  avatar: 'skeleton h-10 w-10 rounded-full',
  circle: 'skeleton h-10 w-10 rounded-full',
  rect: 'skeleton w-full h-24 rounded-md',
  card: 'skeleton w-full h-40 rounded-xl',
  image: 'skeleton w-full aspect-video rounded-lg',
  button: 'skeleton h-10 w-28 rounded-md',
  badge: 'skeleton h-5 w-16 rounded-full',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-2 w-20',
  md: 'h-3 w-32',
  lg: 'h-4 w-48',
};

function Skeleton({
  variant = 'rect',
  size = 'md',
  lines = 1,
  width,
  height,
  radius,
  className,
  style,
  ...props
}: SkeletonProps) {
  const inlineStyle: React.CSSProperties = {
    ...(width ? { width } : null),
    ...(height ? { height } : null),
    ...(radius ? { borderRadius: radius } : null),
    ...style,
  };

  // Text variant stacks multiple lines; last line is shorter for natural rhythm.
  if (variant === 'text') {
    return (
      <div
        role="status"
        aria-label="Carregando conteúdo"
        aria-live="polite"
        className={cn('flex w-full flex-col gap-2', className)}
        {...props}
      >
        {Array.from({ length: Math.max(1, lines) }).map((_, i) => {
          const isLast = i === lines - 1;
          return (
            <div
              key={i}
              className={cn(
                'skeleton rounded',
                sizeStyles[size],
                isLast && lines > 1 ? 'w-2/3' : 'w-full'
              )}
              style={inlineStyle}
            />
          );
        })}
        <span className="sr-only">Carregando…</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Carregando"
      aria-live="polite"
      className={cn(variantStyles[variant], className)}
      style={inlineStyle}
      {...props}
    >
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

/**
 * Pre-composed skeletons for common layouts. Drop these into list pages
 * while data is loading so the layout doesn't jump.
 */
export function PostCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" size="md" />
          <Skeleton variant="text" size="sm" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} size="md" />
      <div className="flex gap-4 pt-2">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" />
        <Skeleton variant="badge" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2">
        <Skeleton variant="badge" />
        <Skeleton variant="text" size="sm" width="3rem" />
      </div>
      <Skeleton variant="text" size="lg" />
      <Skeleton variant="text" lines={2} size="md" />
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-2">
      <Skeleton variant="avatar" size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" size="sm" width="6rem" />
        <Skeleton variant="text" lines={2} size="sm" />
      </div>
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-900/40 p-4">
      <Skeleton variant="rect" className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" size="md" />
        <Skeleton variant="text" size="sm" />
      </div>
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4">
      <Skeleton variant="circle" className="h-9 w-9 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" size="md" />
        <Skeleton variant="text" lines={2} size="sm" />
      </div>
    </div>
  );
}

export { Skeleton };
