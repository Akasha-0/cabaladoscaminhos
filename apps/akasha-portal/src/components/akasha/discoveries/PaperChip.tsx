'use client';

/**
 * PaperChip — Wave 23.2 (UI Cadeia Viva).
 *
 * Chip visual de um LiteraturePaper citado pela síntese da Discovery
 * (Wave 21.1). Aparece no Step 3 ("Papers cited") do ThoughtChainView.
 *
 * Mobile-first: linha única (título · ano) com botão "ver abstract"
 * que expande inline. Em desktop, vira card com abstract preview.
 *
 * Universalista+visceral (ADR-013):
 *   - Mostra DOI/journal — concreta, não abstrata.
 *   - Sem "ResearchGate™" branding — link vai direto pro open-access URL
 *     (PMC / arXiv / DOI.org fallback).
 *
 * Convenção Wave 21.1: papers SÃO open-access (`openAccess=true`). Se
 * algum dia vier um paper fechado, o chip mostra "🔒" + label restrito.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, FileText, Lock } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import type { ThoughtChainPaper } from './shared';

export interface PaperChipProps {
  paper: ThoughtChainPaper;
  /** Locale for abstract preview fallback (pt-BR → abstractPtBr, else abstractEn). */
  locale?: string;
  /** Optional className for layout integration. */
  className?: string;
}

const ABSTRACT_PREVIEW_MAX_CHARS = 200;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function buildHref(paper: ThoughtChainPaper): string {
  if (paper.fullTextUrl) return paper.fullTextUrl;
  if (paper.doi) return `https://doi.org/${paper.doi}`;
  return '#';
}

export function PaperChip({ paper, locale = 'pt-BR', className }: PaperChipProps) {
  const [expanded, setExpanded] = useState(false);
  const isPtBr = locale === 'pt-BR';
  const abstract = paper.abstractPtBr ?? paper.abstractEn;
  const preview = truncate(abstract, ABSTRACT_PREVIEW_MAX_CHARS);
  const href = buildHref(paper);
  const isOpenAccess = !!paper.fullTextUrl || !!paper.doi;

  return (
    <article
      data-testid="paper-chip"
      data-paper-id={paper.id}
      className={cn(
        'rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5',
        'transition-colors hover:border-slate-700 hover:bg-slate-900',
        className
      )}
    >
      <header className="flex items-start gap-2">
        {isOpenAccess ? (
          <FileText
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        ) : (
          <Lock
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium leading-tight text-slate-100">
            {paper.authors[0] ?? 'Autor'} {paper.year}
            <span className="mx-1 text-slate-500">—</span>
            <span className="text-slate-300">{paper.title}</span>
          </h4>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {paper.journal}
            {paper.doi ? (
              <>
                <span className="mx-1">·</span>
                <span className="font-mono">DOI: {paper.doi}</span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls={`paper-abstract-${paper.id}`}
        className={cn(
          'mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-400',
          'hover:text-slate-200 focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-slate-500 rounded-sm'
        )}
      >
        {expanded ? (
          <ChevronUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        )}
        {isPtBr ? 'ver abstract' : 'see abstract'}
      </button>

      {expanded ? (
        <p
          id={`paper-abstract-${paper.id}`}
          className="mt-2 text-xs leading-relaxed text-slate-300"
        >
          {abstract}
        </p>
      ) : (
        <p className="mt-1 text-xs italic leading-relaxed text-slate-400">
          {preview}
        </p>
      )}

      <footer className="mt-2 flex items-center justify-end">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            isPtBr
              ? `Abrir ${paper.title} (${paper.year}) em nova aba`
              : `Open ${paper.title} (${paper.year}) in new tab`
          }
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            'text-violet-400 hover:text-violet-300',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-sm'
          )}
        >
          {isPtBr ? 'abrir' : 'open'}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </footer>
    </article>
  );
}