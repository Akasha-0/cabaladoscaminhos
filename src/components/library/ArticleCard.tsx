// ============================================================================
// ArticleCard — Card de artigo na listagem da Biblioteca (Wave 29)
// ============================================================================
// Mobile-first, 44px touch targets. Mostra:
//   - Tipo (TypeBadge) + Nível de evidência (EvidenceBadge)
//   - Título + summary truncada
//   - Autores · ano · métricas (views, citations)
//   - Botão de bookmark (toggle via useArticleBookmark)
//
// Visual: gradiente slate + glow dourado sutil nas bordas em hover.
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Quote, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  EvidenceBadge,
  TypeBadge,
  type EvidenceLevelValue,
  type ArticleTypeValue,
} from './EvidenceBadge';
import { useArticleBookmark } from '@/hooks/use-articles';

// ============================================================================
// Types
// ============================================================================

export interface ArticleCardProps {
  slug: string;
  title: string;
  summary: string;
  type: ArticleTypeValue | string;
  evidenceLevel: EvidenceLevelValue | string;
  tradition: string | null;
  tags: string[];
  authors: string[];
  year: number;
  viewCount: number;
  bookmarkCount: number;
  citations: number;
  doi?: string | null;
  readingTimeMinutes?: number;
  /** Locale de fallback para i18n */
  locale?: string;
  /** Bookmark inicial (do batch fetch do parent) */
  initialBookmarked?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ArticleCard({
  slug,
  title,
  summary,
  type,
  evidenceLevel,
  tradition,
  tags,
  authors,
  year,
  viewCount,
  bookmarkCount,
  citations,
  doi,
  readingTimeMinutes,
  locale = 'pt-BR',
  initialBookmarked = false,
}: ArticleCardProps) {
  const { bookmarked, toggle, loading: bookmarkLoading } = useArticleBookmark(
    slug,
    initialBookmarked
  );

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggle();
  };

  const articleHref = `/library/${slug}`;
  const authorLabel =
    authors.length === 0
      ? '—'
      : authors.length === 1
      ? authors[0]
      : authors.length <= 3
      ? authors.join(', ')
      : `${authors.slice(0, 2).join(', ')} et al.`;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'bg-gradient-to-br from-slate-900/90 to-slate-950/90',
        'backdrop-blur-sm border-slate-800/50',
        'hover:border-amber-500/40 hover:shadow-[0_0_30px_-5px] hover:shadow-amber-500/20',
        'transition-all duration-300'
      )}
    >
      {/* Glow accent — canto superior direito */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"
        aria-hidden={true}
      />

      <CardContent className="pt-5 pb-5 relative">
        <article className="flex items-start gap-3">
          {/* Bookmark — fixo à direita, alinhado ao topo */}
          <button
            type="button"
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-all',
              'min-h-[44px] min-w-[44px] flex items-center justify-center',
              bookmarked
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent',
              bookmarkLoading && 'opacity-60'
            )}
            aria-label={
              bookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'
            }
            aria-pressed={bookmarked}
          >
            <Bookmark
              className={cn('w-4 h-4', bookmarked && 'fill-current')}
              aria-hidden={true}
            />
          </button>

          <Link
            href={articleHref}
            className="flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-md"
            aria-label={`Abrir artigo: ${title}`}
          >
            <div className="space-y-2.5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <TypeBadge type={type} size="sm" />
                <EvidenceBadge level={evidenceLevel} size="sm" />
                {tradition && (
                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-300 font-medium">
                    {tradition}
                  </span>
                )}
                {readingTimeMinutes !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 ml-auto">
                    <Sparkles className="w-2.5 h-2.5" aria-hidden={true} />
                    {readingTimeMinutes} min
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-slate-100 group-hover:text-amber-200 transition-colors leading-snug">
                {title}
              </h3>

              {/* Summary */}
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {summary}
              </p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[10px] text-slate-600">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Meta footer */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-slate-500">
                <span className="italic">{authorLabel}</span>
                <span aria-hidden={true}>·</span>
                <span>{year}</span>
                <span aria-hidden={true}>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" aria-hidden={true} />
                  <span>{viewCount.toLocaleString(locale)}</span>
                </span>
                {citations > 0 && (
                  <>
                    <span aria-hidden={true}>·</span>
                    <span
                      className="flex items-center gap-1"
                      title={`${citations} citações externas`}
                    >
                      <Quote className="w-3 h-3" aria-hidden={true} />
                      {citations}
                    </span>
                  </>
                )}
                <span aria-hidden={true}>·</span>
                <span
                  className="flex items-center gap-1"
                  title={`${bookmarkCount} salvaram`}
                >
                  <Bookmark className="w-3 h-3" aria-hidden={true} />
                  {bookmarkCount}
                </span>
                {doi && (
                  <a
                    href={`https://doi.org/${doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 ml-auto"
                    aria-label={`Abrir DOI: ${doi}`}
                  >
                    <ExternalLink className="w-3 h-3" aria-hidden={true} />
                    DOI
                  </a>
                )}
              </div>
            </div>
          </Link>
        </article>
      </CardContent>
    </Card>
  );
}