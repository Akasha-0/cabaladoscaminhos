// ============================================================================
// src/components/akasha/sacred-tag-pill.tsx
// ============================================================================
// Renders a parsed sacred tag (orixa, arcano, chakra, sephirah, odu,
// numero, cigano) as a small, calm pill. No emoji — color alone signals
// the kind. Master numbers and 'fria/quente' energies get a subtle ring.
//
// Color palette is intentionally muted (slate background, kind-specific
// accent border) — the goal is "instrument panel", not "carnival".
// ============================================================================

'use client';

import React from 'react';
import type { SacredTag, SacredTagKind } from '@/lib/akasha-ui/types.ts';

export interface SacredTagPillProps {
  tag: SacredTag;
  /** Onclick handler (e.g. for filter-by-tag). */
  onClick?: (tag: SacredTag) => void;
  /** Optional CSS class for the outer span. */
  className?: string;
}

const KIND_PALETTE: Record<SacredTagKind, { ring: string; bg: string; text: string; label: string }> = {
  orixa:    { ring: 'ring-amber-400/50',   bg: 'bg-amber-900/30',   text: 'text-amber-100',  label: 'Orixá' },
  cigano:   { ring: 'ring-rose-400/50',    bg: 'bg-rose-900/30',    text: 'text-rose-100',   label: 'Cigano' },
  arcano:   { ring: 'ring-violet-400/50',  bg: 'bg-violet-900/30',  text: 'text-violet-100', label: 'Arcano' },
  chakra:   { ring: 'ring-emerald-400/50', bg: 'bg-emerald-900/30', text: 'text-emerald-100',label: 'Chakra' },
  sephirah: { ring: 'ring-cyan-400/50',    bg: 'bg-cyan-900/30',    text: 'text-cyan-100',   label: 'Sephirah' },
  odu:      { ring: 'ring-orange-400/50',  bg: 'bg-orange-900/30',  text: 'text-orange-100', label: 'Odu' },
  numero:   { ring: 'ring-sky-400/50',     bg: 'bg-sky-900/30',     text: 'text-sky-100',    label: 'Número' },
};

export function SacredTagPill({
  tag,
  onClick,
  className = '',
}: SacredTagPillProps): React.ReactElement {
  const palette = KIND_PALETTE[tag.kind];
  const isMaster = tag.meta?.isMaster === true;
  const isInteractive = Boolean(onClick);
  const Component = isInteractive ? 'button' : 'span';

  return (
    <Component
      type={isInteractive ? 'button' : undefined}
      onClick={isInteractive ? () => onClick?.(tag) : undefined}
      data-tag-kind={tag.kind}
      data-tag-raw={tag.raw}
      title={`${palette.label}: ${tag.label}`}
      aria-label={`${palette.label} ${tag.label}`}
      className={[
        'mx-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle',
        'text-[11px] font-medium ring-1',
        'transition focus:outline-none focus-visible:ring-2',
        palette.ring,
        palette.bg,
        palette.text,
        isInteractive ? 'cursor-pointer hover:ring-2' : '',
        isMaster ? 'ring-2 ring-yellow-300/70' : '',
        className,
      ].join(' ')}
    >
      <span className="opacity-60" aria-hidden>
        {palette.label}
      </span>
      <span className="font-semibold">{tag.label}</span>
    </Component>
  );
}

export default SacredTagPill;
