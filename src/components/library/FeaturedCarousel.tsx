// ============================================================================
// FeaturedCarousel — Carrossel de artigos em destaque (Wave 29)
// ============================================================================
// Mostra artigos do /api/articles/featured com 3 reasons:
//   - 'editorial' (curadoria humana) → label dourado
//   - 'evidence' (HIGH evidence + recente) → label prata
//   - 'trending' (mix de métricas) → label violeta
//
// Mobile-first: swipe horizontal nativo (overflow-x-auto + snap).
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  TrendingUp,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  EvidenceBadge,
  TypeBadge,
  type EvidenceLevelValue,
  type ArticleTypeValue,
} from './EvidenceBadge';
import type { FeaturedArticle } from '@/hooks/use-articles';

// ============================================================================
// Reason labels
// ============================================================================

const REASON_META: Record<
  FeaturedArticle['featuredReason'],
  {
    label: string;
    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    classes: string;
    ariaLabel: string;
  }
> = {
  editorial: {
    label: 'Curadoria',
    Icon: Sparkles,
    classes:
      'text-amber-200 border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/10',
    ariaLabel: 'Artigo selecionado pela curadoria',
  },
  evidence: {
    label: 'Evidência alta',
    Icon: Star,
    classes: 'text-slate-100 border-slate-300/40 bg-slate-200/10',
    ariaLabel: 'Artigo com alto nível de evidência científica',
  },
  trending: {
    label: 'Em alta',
    Icon: TrendingUp,
    classes: 'text-violet-200 border-violet-500/40 bg-violet-500/10',
    ariaLabel: 'Artigo em alta entre os leitores',
  },
};

// ============================================================================
// Component
// ============================================================================

export interface FeaturedCarouselProps {
  articles: FeaturedArticle[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export function FeaturedCarousel({
  articles,
  loading = false,
  error = null,
  title = 'Em destaque na Biblioteca',
}: FeaturedCarouselProps) {
  if (loading) {
    return (
      <section aria-label="Artigos em destaque" className="space-y-3">
        <h2 className="font-cinzel text-lg text-amber-200">{title}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-40 rounded-lg bg-slate-800/30 animate-pulse"
              aria-hidden={true}
            />
          ))}
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return null;
  }

  return (
    <section aria-label="Artigos em destaque" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-cinzel text-lg text-amber-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" aria-hidden={true} />
          {title}
        </h2>
        <Link
          href="/library"
          className="text-xs text-slate-400 hover:text-amber-300 transition-colors min-h-[44px] inline-flex items-center"
        >
          Ver todos
          <ChevronRight className="w-3 h-3 ml-1" aria-hidden={true} />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-6 md:px-6 snap-x snap-mandatory scrollbar-thin"
        role="list"
      >
        {articles.map((a) => {
          const reasonMeta = REASON_META[a.featuredReason];
          const { Icon: ReasonIcon } = reasonMeta;
          return (
            <Card
              key={a.id}
              role="listitem"
              className="flex-shrink-0 w-72 md:w-80 snap-start bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-800/50 hover:border-amber-500/40 transition-all"
            >
              <CardContent className="pt-5 pb-5 space-y-3">
                {/* Reason badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] gap-1 px-2 py-0.5 font-medium',
                    reasonMeta.classes
                  )}
                  aria-label={reasonMeta.ariaLabel}
                  title={reasonMeta.ariaLabel}
                >
                  <ReasonIcon className="w-2.5 h-2.5" aria-hidden={true} />
                  {reasonMeta.label}
                </Badge>

                {/* Type + evidence */}
                <div className="flex flex-wrap gap-1.5">
                  <TypeBadge type={a.type as ArticleTypeValue} size="sm" />
                  <EvidenceBadge
                    level={a.evidenceLevel as EvidenceLevelValue}
                    size="sm"
                    showLabel={false}
                  />
                  {a.tradition && (
                    <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-300">
                      {a.tradition}
                    </span>
                  )}
                </div>

                <Link
                  href={`/library/${a.slug}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-md"
                  aria-label={`Abrir destaque: ${a.title}`}
                >
                  <h3 className="font-semibold text-slate-100 hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {a.summary}
                  </p>
                </Link>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" aria-hidden={true} />
                    {a.viewCount.toLocaleString('pt-BR')}
                  </span>
                  <span className="italic truncate">
                    {a.authors[0] ?? '—'} · {a.year}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}