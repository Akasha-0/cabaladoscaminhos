// ============================================================================
// CitationList — Lista de citações/referências (Wave 29)
// ============================================================================
// Renderiza o array `references` (Json no Prisma) que artigos carregam.
// Shape esperado:
//   [{ title: string, url?: string, doi?: string, year?: number, source?: string }]
// ou
//   string[]  (fallback — lista simples de strings)
//
// Mobile-first, 44px touch targets em qualquer link.
// ============================================================================

'use client';

import React from 'react';
import { ExternalLink, BookMarked, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CitationItem {
  title: string;
  url?: string | null;
  doi?: string | null;
  year?: number | null;
  source?: string | null;
  authors?: string[] | null;
}

export interface CitationListProps {
  references: unknown;
  className?: string;
  emptyMessage?: string;
}

// ============================================================================
// Normalização
// ============================================================================

function isCitationItem(x: unknown): x is CitationItem {
  return (
    typeof x === 'object' &&
    x !== null &&
    'title' in x &&
    typeof (x as Record<string, unknown>).title === 'string'
  );
}

function isStringArray(x: unknown): x is string[] {
  return (
    Array.isArray(x) && x.every((item) => typeof item === 'string')
  );
}

function normalizeReferences(refs: unknown): CitationItem[] {
  if (!refs) return [];
  if (isStringArray(refs)) {
    return refs.map((s) => ({ title: s }));
  }
  if (Array.isArray(refs)) {
    return refs.filter(isCitationItem).map((r) => ({
      title: r.title,
      url: r.url ?? null,
      doi: r.doi ?? null,
      year: r.year ?? null,
      source: r.source ?? null,
      authors: r.authors ?? null,
    }));
  }
  return [];
}

function doiToUrl(doi: string): string {
  if (doi.startsWith('http')) return doi;
  return `https://doi.org/${doi}`;
}

// ============================================================================
// Component
// ============================================================================

export function CitationList({
  references,
  className,
  emptyMessage = 'Sem referências listadas.',
}: CitationListProps) {
  const items = normalizeReferences(references);

  if (items.length === 0) {
    return (
      <p
        className={cn(
          'text-sm text-slate-500 italic flex items-center gap-2',
          className
        )}
      >
        <Quote className="w-3.5 h-3.5" aria-hidden={true} />
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol
      className={cn('space-y-3', className)}
      aria-label="Referências bibliográficas"
    >
      {items.map((cite, idx) => {
        const linkHref = cite.doi
          ? doiToUrl(cite.doi)
          : cite.url ?? null;

        return (
          <li
            key={`${cite.title}-${idx}`}
            className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed"
          >
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-center mt-0.5"
              aria-hidden={true}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 break-words">
                {cite.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                {cite.authors && cite.authors.length > 0 && (
                  <span className="italic">
                    {cite.authors.slice(0, 3).join(', ')}
                    {cite.authors.length > 3 ? ' et al.' : ''}
                  </span>
                )}
                {cite.year !== null && cite.year !== undefined && (
                  <span>· {cite.year}</span>
                )}
                {cite.source && (
                  <span className="text-slate-600">· {cite.source}</span>
                )}
              </div>
              {linkHref && (
                <a
                  href={linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1.5 mt-2 text-xs',
                    'text-emerald-400 hover:text-emerald-300',
                    'min-h-[44px] py-2', // touch target
                    'transition-colors'
                  )}
                  aria-label={`Abrir referência: ${cite.title}`}
                >
                  {cite.doi ? (
                    <>
                      <BookMarked className="w-3 h-3" aria-hidden={true} />
                      DOI
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3 h-3" aria-hidden={true} />
                      Abrir
                    </>
                  )}
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}