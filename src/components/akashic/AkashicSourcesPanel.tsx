'use client';

// ============================================================================
// AkashicSourcesPanel — Right-rail sources panel (lazy-loaded)
// ============================================================================
// Extracted from /akashic page to enable code splitting. The panel renders
// book citations alongside each IA reply. It's:
//   - Off-screen on mobile (collapsed behind a tap)
//   - Off the initial viewport on desktop (right rail, ~30% width)
//
// Splitting it out keeps the chat composer + message list in the initial
// bundle. The 280-line panel + its lucide icons + Card components land in
// a separate chunk loaded after first paint.
//
// Wave 11 (perf deep) — 2026-06-27.
// ============================================================================

import React from 'react';
import {
  BookOpen, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface RagSource {
  id: string;
  title: string;
  slug: string;
  similarity: number;
  excerpt?: string;
  tradition?: string;
}

interface AkashicSourcesPanelProps {
  sources: RagSource[];
  initiallyExpanded?: boolean;
}

// ============================================================================
// Main
// ============================================================================

export function AkashicSourcesPanel({ sources, initiallyExpanded = true }: AkashicSourcesPanelProps) {
  const [showSources, setShowSources] = React.useState(initiallyExpanded);

  return (
    <aside
      className={cn(
        'border-t border-slate-800 bg-slate-900/40 md:w-80 md:border-l md:border-t-0',
        'overflow-y-auto',
      )}
      aria-label="Fontes citadas pela Akasha"
    >
      <button
        type="button"
        onClick={() => setShowSources((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800/30 md:cursor-default md:hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-300" aria-hidden />
          <h2 className="font-heading text-sm font-semibold text-slate-100">
            Fontes citadas
          </h2>
          {sources.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {sources.length}
            </Badge>
          )}
        </div>
        <span className="md:hidden">
          {showSources ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {showSources && (
        <div className="space-y-2 px-4 pb-4">
          {sources.length === 0 ? (
            <p className="text-xs text-slate-500">
              As fontes que a Akasha citar vão aparecer aqui. Por padrão, até 5 artigos por resposta.
            </p>
          ) : (
            sources.map((s, i) => <SourceCard key={s.id} source={s} index={i + 1} />)
          )}
        </div>
      )}
    </aside>
  );
}

// ============================================================================
// Sub-component
// ============================================================================

function SourceCard({ source, index }: { source: RagSource; index: number }) {
  const simPct = (source.similarity * 100).toFixed(0);
  return (
    <a
      href={`/library/${source.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-amber-400/40 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-xs font-medium leading-snug text-slate-100">
          <span className="mr-1 text-amber-300">[{index}]</span>
          {source.title}
        </h3>
        <ExternalLink className="h-3 w-3 shrink-0 text-slate-500" />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        <Badge variant="outline" className="border-amber-400/30 text-amber-300">
          {simPct}% match
        </Badge>
        {source.tradition && (
          <Badge variant="secondary" className="text-[10px]">
            {source.tradition}
          </Badge>
        )}
      </div>
      {source.excerpt && (
        <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-slate-400">
          {source.excerpt}
        </p>
      )}
    </a>
  );
}