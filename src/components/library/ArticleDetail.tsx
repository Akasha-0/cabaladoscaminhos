// ============================================================================
// ArticleDetail — Visualização completa do artigo (Wave 29)
// ============================================================================
// Mostra o artigo com:
//   - Header (badges, título, autores, ano, journal)
//   - Métricas + bookmark + share
//   - Conteúdo markdown renderizado (sanitizado via DOMPurify-like regex;
//     alternativa simples — sem libs novas)
//   - Referências bibliográficas
//   - Artigos relacionados
//
// Mobile-first, com TOC lateral em desktop (md+).
// ============================================================================

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Quote,
  Calendar,
  Users,
  ExternalLink,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  EvidenceBadge,
  TypeBadge,
  type EvidenceLevelValue,
  type ArticleTypeValue,
} from './EvidenceBadge';
import { CitationList } from './CitationList';
import { useArticleBookmark, type ArticleDetail as ArticleDetailType } from '@/hooks/use-articles';

// ============================================================================
// Markdown → HTML minimal renderer (sem deps)
// ============================================================================

/**
 * Renderiza markdown mínimo (parágrafos, headings, listas, ênfase, links).
 * Para Wave 29 mantemos conservador — sem libs externas. Quando o sanitizer
 * oficial do projeto estiver pronto, esta função é substituída.
 *
 * IMPORTANTE: escapa HTML antes de aplicar transforms para evitar XSS.
 */
function renderMarkdown(md: string): string {
  // 1. Escape HTML
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  let inOl = false;
  let inP = false;

  const closeP = () => {
    if (inP) {
      out.push('</p>');
      inP = false;
    }
  };
  const closeList = () => {
    if (inList) {
      out.push(inOl ? '</ol>' : '</ul>');
      inList = false;
      inOl = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.length === 0) {
      closeP();
      closeList();
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      closeP();
      closeList();
      const level = h[1].length;
      const text = inlineFmt(h[2]);
      out.push(`<h${level} class="font-cinzel text-${4 - Math.min(level, 3)}xl text-amber-200 mt-8 mb-3">${text}</h${level}>`);
      continue;
    }

    // Unordered list
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      closeP();
      if (!inList || inOl) {
        closeList();
        out.push('<ul class="list-disc list-inside space-y-1 my-3 text-slate-300">');
        inList = true;
        inOl = false;
      }
      out.push(`<li>${inlineFmt(ul[1])}</li>`);
      continue;
    }

    // Ordered list
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      closeP();
      if (!inList || !inOl) {
        closeList();
        out.push('<ol class="list-decimal list-inside space-y-1 my-3 text-slate-300">');
        inList = true;
        inOl = true;
      }
      out.push(`<li>${inlineFmt(ol[1])}</li>`);
      continue;
    }

    // Blockquote
    const bq = line.match(/^>\s+(.+)$/);
    if (bq) {
      closeP();
      closeList();
      out.push(
        `<blockquote class="border-l-2 border-amber-500/40 pl-4 my-3 italic text-slate-400">${inlineFmt(bq[1])}</blockquote>`
      );
      continue;
    }

    // Paragraph
    if (!inP) {
      out.push('<p class="text-slate-300 leading-relaxed my-3">');
      inP = true;
    } else {
      out.push('<br/>');
    }
    out.push(inlineFmt(line));
  }

  closeP();
  closeList();

  return out.join('\n');

  // Inline: **bold**, *italic*, `code`, [text](url)
  function inlineFmt(s: string): string {
    const esc = escape(s);
    return esc
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-100 font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-amber-200/90">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-amber-300 text-sm font-mono">$1</code>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30">$1 <span class="inline-block align-middle">↗</span></a>'
      );
  }
}

// ============================================================================
// Component
// ============================================================================

export interface ArticleDetailProps {
  article: ArticleDetailType;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const { bookmarked, toggle, loading: bookmarkLoading } = useArticleBookmark(
    article.slug,
    false
  );

  const html = useMemo(
    () => renderMarkdown(article.content ?? ''),
    [article.content]
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/library/${article.slug}`;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url,
        });
      } catch {
        // usuário cancelou — sem erro
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // ignora
      }
    }
  };

  const authorLine =
    article.authors.length === 0
      ? 'Autor desconhecido'
      : article.authors.length === 1
      ? article.authors[0]
      : article.authors.length <= 4
      ? article.authors.join(', ')
      : `${article.authors.slice(0, 3).join(', ')} et al.`;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* Back */}
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden={true} />
          Voltar para a biblioteca
        </Link>

        {/* Header card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6 md:pt-8 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={article.type as ArticleTypeValue} size="md" />
              <EvidenceBadge
                level={article.evidenceLevel as EvidenceLevelValue}
                size="md"
              />
              {article.tradition && (
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-200 font-medium">
                  {article.tradition}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-cinzel text-2xl md:text-3xl lg:text-4xl text-amber-100 leading-tight">
              {article.title}
            </h1>

            {/* Summary */}
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              {article.summary}
            </p>

            {/* Authors + meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" aria-hidden={true} />
                <span className="italic">{authorLine}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden={true} />
                {article.year}
              </span>
              {article.journal && (
                <span className="text-slate-500">· {article.journal}</span>
              )}
              {article.readingTimeMinutes > 0 && (
                <span className="flex items-center gap-1.5 ml-auto text-slate-500">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden={true} />
                  {article.readingTimeMinutes} min de leitura
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                onClick={() => void toggle()}
                disabled={bookmarkLoading}
                variant={bookmarked ? 'default' : 'outline'}
                className={cn(
                  'min-h-[44px]',
                  bookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30'
                    : 'border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-200'
                )}
                aria-pressed={bookmarked}
                aria-label={
                  bookmarked ? 'Remover dos favoritos' : 'Salvar nos favoritos'
                }
              >
                <Bookmark
                  className={cn('w-4 h-4 mr-2', bookmarked && 'fill-current')}
                  aria-hidden={true}
                />
                {bookmarked ? 'Salvo' : 'Salvar'}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="min-h-[44px] border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-200"
                aria-label="Compartilhar artigo"
              >
                <Share2 className="w-4 h-4 mr-2" aria-hidden={true} />
                Compartilhar
              </Button>
              {article.doi && (
                <Button
                  asChild
                  variant="outline"
                  className="min-h-[44px] border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" aria-hidden={true} />
                    DOI
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="bg-slate-900/50 border-slate-800/40 backdrop-blur-sm">
          <CardContent className="pt-6 md:pt-8">
            <article
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card className="bg-slate-900/40 border-slate-800/40">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-around gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Eye className="w-4 h-4 text-amber-400" aria-hidden={true} />
                <div>
                  <p className="text-xs text-slate-500">Visualizações</p>
                  <p className="font-mono text-amber-200">
                    {article.viewCount.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Bookmark
                  className="w-4 h-4 text-amber-400"
                  aria-hidden={true}
                />
                <div>
                  <p className="text-xs text-slate-500">Salvos</p>
                  <p className="font-mono text-amber-200">
                    {article.bookmarkCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Quote className="w-4 h-4 text-amber-400" aria-hidden={true} />
                <div>
                  <p className="text-xs text-slate-500">Citações</p>
                  <p className="font-mono text-amber-200">
                    {article.citations}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <section
          aria-labelledby="references-heading"
          className="space-y-3"
        >
          <h2
            id="references-heading"
            className="font-cinzel text-xl text-amber-200 flex items-center gap-2"
          >
            <Quote className="w-5 h-5" aria-hidden={true} />
            Referências
          </h2>
          <Card className="bg-slate-900/40 border-slate-800/40">
            <CardContent className="pt-5 pb-5">
              <CitationList references={article.references} />
            </CardContent>
          </Card>
        </section>

        {/* Related */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-3">
            <h2
              id="related-heading"
              className="font-cinzel text-xl text-amber-200"
            >
              Artigos relacionados
            </h2>
            <ul className="space-y-2">
              {article.relatedArticles.map((rel) => (
                <li key={rel.id}>
                  <Link
                    href={`/library/${rel.slug}`}
                    className="block p-4 rounded-lg border border-slate-800/40 bg-slate-900/30 hover:bg-slate-800/40 hover:border-amber-500/30 transition-all min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-100 line-clamp-2">
                          {rel.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {rel.authors.slice(0, 2).join(', ')} · {rel.year}
                        </p>
                      </div>
                      <EvidenceBadge
                        level={rel.evidenceLevel as EvidenceLevelValue}
                        size="sm"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}