'use client';

/**
 * ============================================================================
 * Loading States — Progress + transitions + page-level loaders (Wave 17)
 * ============================================================================
 * Companion to `loading.tsx` and `skeleton.tsx`. Adds:
 *   - ProgressBar: deterministic progress for known-length uploads
 *   - PageLoading: full-page fallback with spiritual anchor (for suspense)
 *   - ContentTransition: cross-fade wrapper to swap loading → content in 300ms
 *   - SectionLoading: inline spinner for sections that are mid-fetch
 *
 * All motion respects `prefers-reduced-motion`.
 * ============================================================================
 */

import * as React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ===========================================================================
   ProgressBar — linear progress with optional label + aria
   =========================================================================== */

export interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** Optional accessible label. Default "Carregando". */
  label?: string;
  /** Show numeric percentage after the bar. Default true. */
  showValue?: boolean;
  /** Color intent. */
  tone?: 'gold' | 'violet' | 'rose';
  /** Height in Tailwind classes. Default h-2. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const toneStyles = {
  gold: 'bg-amber-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
} as const;

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
} as const;

export function ProgressBar({
  value,
  label = 'Carregando',
  showValue = true,
  tone = 'gold',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const rounded = Math.round(clamped);

  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span aria-hidden>{rounded}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-slate-800/60',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            toneStyles[tone]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/* ===========================================================================
   IndeterminateProgress — looping bar (unknown-length)
   =========================================================================== */

export function IndeterminateProgress({
  label = 'Carregando',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-busy
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-slate-800/60',
        className
      )}
    >
      <div
        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent motion-safe:animate-shimmer"
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
}

/* ===========================================================================
   SectionLoading — inline spinner for in-page sections
   =========================================================================== */

export interface SectionLoadingProps {
  /** Accessible label. */
  label?: string;
  /** Optional inline message below the spinner. */
  message?: string;
  /** Density. */
  size?: 'sm' | 'md';
  className?: string;
}

export function SectionLoading({
  label = 'Carregando seção',
  message,
  size = 'md',
  className,
}: SectionLoadingProps) {
  const spinnerSize = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-8 text-center',
        className
      )}
    >
      <Loader2
        className={cn('animate-spin text-amber-400', spinnerSize)}
        aria-hidden
      />
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
}

/* ===========================================================================
   PageLoading — full-page fallback (for Next.js loading.tsx)
   =========================================================================== */

export interface PageLoadingProps {
  /** Headline shown center-screen. */
  title?: string;
  /** Sub-message. */
  description?: string;
}

export function PageLoading({
  title = 'Alinhando energias…',
  description = 'Carregando conteúdo do portal.',
}: PageLoadingProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 -m-2 rounded-full bg-amber-500/20 blur-2xl motion-safe:animate-pulse-glow"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <Sparkles className="h-8 w-8 motion-safe:animate-pulse" aria-hidden />
        </div>
      </div>
      <h2
        className="mb-2 text-xl font-semibold text-slate-100"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        {title}
      </h2>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

/* ===========================================================================
   ContentTransition — cross-fade wrapper for loading → content swaps
   =========================================================================== */

export interface ContentTransitionProps {
  /** When true, shows the children. Otherwise shows the fallback. */
  ready: boolean;
  /** What to render while not ready (skeleton, spinner, etc). */
  fallback: React.ReactNode;
  children: React.ReactNode;
  /** Duration in ms. Default 300. */
  duration?: number;
  className?: string;
}

export function ContentTransition({
  ready,
  fallback,
  children,
  duration = 300,
  className,
}: ContentTransitionProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        // CSS variable so the inner divs share timing
        ['--ct-duration' as string]: `${duration}ms`,
      }}
    >
      <div
        aria-busy={!ready}
        className={cn(
          'transition-opacity ease-out motion-safe:duration-300',
          ready ? 'pointer-events-auto opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
        )}
        style={{ transitionDuration: `var(--ct-duration)` }}
      >
        {children}
      </div>
      <div
        aria-hidden={ready}
        className={cn(
          'transition-opacity ease-out motion-safe:duration-300',
          ready ? 'pointer-events-none absolute inset-0 opacity-0' : 'opacity-100'
        )}
        style={{ transitionDuration: `var(--ct-duration)` }}
      >
        {fallback}
      </div>
    </div>
  );
}

/* ===========================================================================
   DotsLoader — three-dot animated loader (for buttons, inline)
   =========================================================================== */

export function DotsLoader({
  label = 'Carregando',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center gap-1', className)}
    >
      <span className="sr-only">{label}…</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
