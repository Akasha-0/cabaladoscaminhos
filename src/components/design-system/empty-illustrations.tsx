'use client';

/**
 * ============================================================================
 * Empty Illustrations — 8 custom inline SVGs (Wave 17)
 * ============================================================================
 * Hand-rolled minimalist line illustrations. Each is ~700-1200 bytes
 * uncompressed (inline-able without runtime fetch). Color uses
 * `currentColor` so consumers control tone via the wrapper's text color.
 *
 * Style: thin-stroke contemplative line art. No faces, no mascots, no
 * stereotypes. Empty space is intentional — the illustration is a
 * breathing anchor, not a billboard.
 *
 * Usage:
 *   <EmptyIllustration variant="feed" className="h-32 w-32 text-amber-300" />
 * ============================================================================
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export type EmptyVariant =
  | 'feed'
  | 'library'
  | 'notifications'
  | 'search'
  | 'groups'
  | 'messages'
  | 'events'
  | 'bookmarks';

interface EmptyIllustrationProps extends React.SVGProps<SVGSVGElement> {
  variant: EmptyVariant;
  /** Total size in px (preserves aspect). Default 128. */
  size?: number;
  /** Forwarded className (color via `text-*` works because stroke uses currentColor). */
  className?: string;
  /** Decorative — hides from screen readers. Default true. */
  decorative?: boolean;
}

const baseProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 128 128',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  xmlns: 'http://www.w3.org/2000/svg',
});

function EmptyIllustration({
  variant,
  size = 128,
  className,
  decorative = true,
  ...props
}: EmptyIllustrationProps) {
  const aria = decorative
    ? { 'aria-hidden': true, focusable: false as const }
    : { role: 'img', 'aria-label': `${variant} illustration` };

  return (
    <svg
      {...baseProps(size)}
      className={cn('shrink-0', className)}
      {...aria}
      {...props}
    >
      {renderVariant(variant)}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variant renderers — each is a self-contained <g> with stroke-only paths   */
/* -------------------------------------------------------------------------- */

function renderVariant(variant: EmptyVariant) {
  switch (variant) {
    case 'feed':
      return (
        <g>
          {/* Three post cards stacked with offset (depth) */}
          <rect x="20" y="32" width="68" height="56" rx="8" opacity="0.25" />
          <rect x="28" y="40" width="72" height="60" rx="10" />
          <circle cx="44" cy="58" r="6" />
          <line x1="56" y1="56" x2="86" y2="56" />
          <line x1="56" y1="64" x2="78" y2="64" opacity="0.5" />
          <line x1="38" y1="80" x2="92" y2="80" opacity="0.5" />
          <line x1="38" y1="88" x2="78" y2="88" opacity="0.3" />
          {/* small floating spark */}
          <circle cx="100" cy="28" r="2" fill="currentColor" />
          <circle cx="20" cy="100" r="1.5" fill="currentColor" opacity="0.6" />
        </g>
      );

    case 'library':
      return (
        <g>
          {/* Open book with pages */}
          <path d="M16 44 L60 32 L60 96 L16 88 Z" />
          <path d="M60 32 L104 44 L104 88 L60 96 Z" />
          <path d="M60 32 L60 96" />
          {/* text lines on left page */}
          <line x1="26" y1="56" x2="50" y2="50" opacity="0.5" />
          <line x1="26" y1="64" x2="50" y2="58" opacity="0.5" />
          <line x1="26" y1="72" x2="44" y2="67" opacity="0.5" />
          {/* text lines on right page */}
          <line x1="70" y1="50" x2="94" y2="56" opacity="0.5" />
          <line x1="70" y1="58" x2="94" y2="64" opacity="0.5" />
          <line x1="70" y1="66" x2="88" y2="71" opacity="0.5" />
          {/* small star above */}
          <path d="M64 18 L66 22 L70 22 L67 25 L68 29 L64 27 L60 29 L61 25 L58 22 L62 22 Z" opacity="0.6" />
        </g>
      );

    case 'notifications':
      return (
        <g>
          {/* Bell with gentle ripple */}
          <path d="M48 56 C48 44 56 36 64 36 C72 36 80 44 80 56 L80 70 L86 80 L42 80 L48 70 Z" />
          <path d="M58 84 C58 88 61 91 64 91 C67 91 70 88 70 84" />
          {/* ripples — calm */}
          <path d="M30 44 C28 44 26 46 26 48" opacity="0.4" />
          <path d="M98 44 C100 44 102 46 102 48" opacity="0.4" />
          <path d="M24 32 C20 32 18 36 18 40" opacity="0.3" />
          <path d="M104 32 C108 32 110 36 110 40" opacity="0.3" />
        </g>
      );

    case 'search':
      return (
        <g>
          {/* Magnifying glass with cosmic horizon */}
          <circle cx="56" cy="56" r="28" />
          <line x1="76" y1="76" x2="100" y2="100" />
          {/* cosmic dots inside lens */}
          <circle cx="46" cy="46" r="1.2" fill="currentColor" opacity="0.6" />
          <circle cx="60" cy="42" r="1" fill="currentColor" opacity="0.5" />
          <circle cx="68" cy="58" r="1.4" fill="currentColor" opacity="0.7" />
          <circle cx="44" cy="64" r="1" fill="currentColor" opacity="0.5" />
          <circle cx="58" cy="68" r="0.8" fill="currentColor" opacity="0.4" />
          <circle cx="50" cy="56" r="0.8" fill="currentColor" opacity="0.4" />
        </g>
      );

    case 'groups':
      return (
        <g>
          {/* Three figures forming a circle — community */}
          <circle cx="64" cy="34" r="10" />
          <circle cx="34" cy="84" r="10" />
          <circle cx="94" cy="84" r="10" />
          {/* connecting arcs */}
          <path d="M52 42 C44 56 40 70 40 78" opacity="0.4" />
          <path d="M76 42 C84 56 88 70 88 78" opacity="0.4" />
          <path d="M44 88 C54 90 74 90 84 88" opacity="0.4" />
        </g>
      );

    case 'messages':
      return (
        <g>
          {/* Two overlapping speech bubbles */}
          <path d="M22 36 L78 36 C82 36 86 40 86 44 L86 68 C86 72 82 76 78 76 L42 76 L30 88 L32 76 L26 76 C22 76 18 72 18 68 L18 44 C18 40 22 36 22 36 Z" />
          <path d="M50 56 L106 56 C110 56 114 60 114 64 L114 80 C114 84 110 88 106 88 L80 88 L92 100 L78 88 L54 88 C50 88 46 84 46 80 L46 64 C46 60 50 56 50 56 Z" opacity="0.5" />
        </g>
      );

    case 'events':
      return (
        <g>
          {/* Calendar with circle (ritual) mark */}
          <rect x="22" y="32" width="84" height="72" rx="6" />
          <line x1="22" y1="50" x2="106" y2="50" />
          <line x1="40" y1="22" x2="40" y2="42" />
          <line x1="88" y1="22" x2="88" y2="42" />
          {/* ritual circle in middle cell */}
          <circle cx="64" cy="76" r="12" opacity="0.7" />
          <circle cx="64" cy="76" r="6" />
          {/* small grid dots */}
          <circle cx="36" cy="62" r="1" fill="currentColor" opacity="0.4" />
          <circle cx="50" cy="62" r="1" fill="currentColor" opacity="0.4" />
          <circle cx="78" cy="62" r="1" fill="currentColor" opacity="0.4" />
          <circle cx="92" cy="62" r="1" fill="currentColor" opacity="0.4" />
        </g>
      );

    case 'bookmarks':
      return (
        <g>
          {/* Ribbon bookmark — saved/for later */}
          <path d="M40 24 L88 24 L88 104 L64 88 L40 104 Z" />
          <line x1="48" y1="44" x2="80" y2="44" opacity="0.5" />
          <line x1="48" y1="56" x2="80" y2="56" opacity="0.5" />
          <line x1="48" y1="68" x2="72" y2="68" opacity="0.3" />
          {/* sparkle */}
          <path d="M96 30 L98 34 L102 36 L98 38 L96 42 L94 38 L90 36 L94 34 Z" opacity="0.6" />
        </g>
      );

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Pre-composed EmptyScreen — wraps illustration + copy + actions            */
/* -------------------------------------------------------------------------- */

export interface EmptyScreenProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant: EmptyVariant;
  /** Headline (always required). */
  title: string;
  /** Supporting copy. */
  description?: string;
  /** Primary CTA label. */
  primaryLabel?: string;
  primaryHref?: string;
  onPrimary?: () => void;
  /** Secondary CTA label. */
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondary?: () => void;
  /** Illustration size. Default 128. */
  illustrationSize?: number;
}

export function EmptyScreen({
  variant,
  title,
  description,
  primaryLabel,
  primaryHref,
  onPrimary,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  illustrationSize = 128,
  className,
  ...props
}: EmptyScreenProps) {
  const Primary = primaryLabel ? (
    primaryHref ? (
      <a
        href={primaryHref}
        className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {primaryLabel}
      </a>
    ) : (
      <button
        type="button"
        onClick={onPrimary}
        className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {primaryLabel}
      </button>
    )
  ) : null;

  const Secondary = secondaryLabel ? (
    secondaryHref ? (
      <a
        href={secondaryHref}
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {secondaryLabel}
      </a>
    ) : (
      <button
        type="button"
        onClick={onSecondary}
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {secondaryLabel}
      </button>
    )
  ) : null;

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className
      )}
      {...props}
    >
      <EmptyIllustration
        variant={variant}
        size={illustrationSize}
        className="mb-6 text-amber-300/70"
      />
      <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      )}
      {(Primary || Secondary) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {Primary}
          {Secondary}
        </div>
      )}
    </div>
  );
}

export { EmptyIllustration };
export type { EmptyIllustrationProps };
