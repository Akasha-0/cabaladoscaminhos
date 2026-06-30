// ============================================================================
// src/components/akasha/citation-chip.tsx
// ============================================================================
// Compact clickable card for a single citation. Used in the chat bubble
// and in the side panel. Similarity is shown as a soft progress ring
// (color: emerald-200 for >0.8, amber-200 for >0.5, slate for the rest).
// ============================================================================

'use client';

import React, { useState } from 'react';
import type { Citation } from '@/lib/akasha-ui/types.ts';

export interface CitationChipProps {
  citation: Citation;
  /** When true, expand the excerpt inline. Default = hover/click toggle. */
  initiallyExpanded?: boolean;
  /** Click handler — typically deep-link navigation. */
  onClick?: (citation: Citation) => void;
}

function similarityTone(sim: number): string {
  if (sim >= 0.8) return 'bg-emerald-900/40 text-emerald-200 ring-emerald-400/40';
  if (sim >= 0.5) return 'bg-amber-900/30 text-amber-100 ring-amber-400/40';
  return 'bg-slate-800/60 text-slate-300 ring-slate-600/40';
}

function formatSimilarity(sim: number): string {
  return `${Math.round(sim * 100)}%`;
}

export function CitationChip({
  citation,
  initiallyExpanded = false,
  onClick,
}: CitationChipProps): React.ReactElement {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const tone = similarityTone(citation.similarity);
  const hasExcerpt = Boolean(citation.excerpt);
  const interactive = Boolean(onClick) || hasExcerpt;

  return (
    <button
      type="button"
      onClick={() => {
        setExpanded((v) => !v);
        if (onClick) onClick(citation);
      }}
      data-citation-id={citation.id}
      className={[
        'group block w-full rounded-lg px-3 py-2 text-left text-xs ring-1',
        'transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60',
        tone,
        interactive ? 'cursor-pointer hover:ring-2' : '',
      ].join(' ')}
      aria-expanded={hasExcerpt ? expanded : undefined}
      aria-label={`Citação: ${citation.title} (similaridade ${formatSimilarity(citation.similarity)})`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">
          {citation.tradition && (
            <span className="mr-1.5 opacity-60 uppercase tracking-wide">
              {citation.tradition}
            </span>
          )}
          {citation.title}
        </span>
        <span className="shrink-0 rounded-full bg-slate-950/50 px-2 py-0.5 text-[10px] tabular-nums">
          {formatSimilarity(citation.similarity)}
        </span>
      </div>
      {hasExcerpt && expanded && (
        <p className="mt-2 border-t border-slate-700/40 pt-2 text-[11px] leading-relaxed text-slate-200/90">
          {citation.excerpt}
        </p>
      )}
      {citation.doi && (
        <span className="mt-1 block truncate text-[10px] opacity-50" aria-hidden>
          doi:{citation.doi}
        </span>
      )}
    </button>
  );
}

export default CitationChip;
