// ============================================================================
// /wiki/[slug] — Página de artigo da wiki (Wave 36)
// ============================================================================
// Renderiza markdown do artigo + upvote + propose edit + edit history.
//
// LGPD Art. 37 — toda interação (upvote, proposta) logada em AuditLog.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  WIKI_ARTICLES,
  WIKI_CATEGORIES,
  getWikiBySlug,
} from '@/lib/help/wiki-data';
import { MarkdownRender } from './MarkdownRender';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 120;

export async function generateStaticParams() {
  return WIKI_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getWikiBySlug(slug);
  if (!a) return { title: 'Artigo não encontrado' };
  return {
    title: `${a.title} · Wiki`,
    description: a.excerpt,
    alternates: { canonical: `/wiki/${a.slug}` },
    authors: [{ name: a.authorName }],
  };
}

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getWikiBySlug(slug);
  if (!a) notFound();

  const cat = WIKI_CATEGORIES.find((c) => c.slug === a.category);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-400" aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/wiki" className="hover:text-violet-300">Wiki</Link></li>
          {cat && (
            <>
              <li aria-hidden>/</li>
              <li><Link href={`/wiki?category=${cat.slug}`} className="hover:text-violet-300">{cat.label}</Link></li>
            </>
          )}
        </ol>
      </nav>

      {/* Status banner */}
      {a.status !== 'published' && (
        <div className="mb-6 rounded-lg border border-amber-700/50 bg-amber-950/30 p-3 text-sm text-amber-200">
          ⚠️ Este artigo está em status <strong>{a.status}</strong>. Conteúdo pode mudar.
        </div>
      )}

      <article>
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            {cat && (
              <span className="rounded-full bg-violet-900/30 px-2 py-1 text-violet-200 ring-1 ring-violet-700/50">
                {cat.label}
              </span>
            )}
            {a.authorTradition && (
              <span className="rounded-full bg-emerald-900/30 px-2 py-1 text-emerald-200 ring-1 ring-emerald-700/50">
                {a.authorTradition}
              </span>
            )}
            <span className="text-slate-400">v{a.version}</span>
            <span className="text-slate-400">Publicado {a.publishedAt}</span>
            <span className="text-slate-400">Última edição {a.lastUpdated}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">{a.title}</h1>
          <p className="mt-3 text-lg text-slate-300">{a.excerpt}</p>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" aria-hidden />
            <div>
              <div className="font-medium text-slate-100">{a.authorName}</div>
              <div className="text-xs text-slate-500">
                {a.authorTradition && `Praticante de ${a.authorTradition}`}
                {a.views && ` · ${a.views.toLocaleString('pt-BR')} visualizações`}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {a.tags.map((t) => (
              <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                #{t}
              </span>
            ))}
          </div>
        </header>

        {/* Body */}
        <MarkdownRender source={a.contentMarkdown} />

        {/* Editorial review note */}
        {a.reviewNote && (
          <div className="mt-8 rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-4 text-sm text-emerald-100">
            <span className="font-semibold">Nota editorial Iyá:</span> {a.reviewNote}
          </div>
        )}

        {/* Actions */}
        <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
          <form action="/api/wiki/upvote" method="post" className="inline-flex items-center gap-2">
            <input type="hidden" name="slug" value={a.slug} />
            <button
              type="submit"
              className="rounded-lg bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-200 ring-1 ring-emerald-700/50 hover:bg-emerald-900/50"
            >
              👍 Útil ({a.upvotes})
            </button>
          </form>
          <Link
            href={`/wiki/${a.slug}/propose`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            ✏️ Propor edição
          </Link>
          <Link
            href={`/feedback?type=CONTENT&category=WIKI&id=${a.slug}`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            ⚠️ Reportar
          </Link>
        </div>

        {/* Edit history */}
        {a.editHistory.length > 0 && (
          <details className="mt-8 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-300">
              📜 Histórico de edições ({a.editHistory.length})
            </summary>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              {a.editHistory.map((h) => (
                <li key={h.version} className="border-l-2 border-slate-700 pl-3">
                  <strong className="text-slate-200">v{h.version}</strong> · {h.date} · <em>{h.authorName}</em>: {h.note}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Pending proposals */}
        {a.proposals.filter((p) => p.status === 'pending').length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-100">📝 Propostas pendentes</h2>
            <ul className="mt-3 space-y-3">
              {a.proposals
                .filter((p) => p.status === 'pending')
                .map((p) => (
                  <li key={p.id} className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-200">{p.id}</span>
                      <span className="text-amber-200">·</span>
                      <span className="text-xs text-amber-300">{p.authorName}</span>
                      <span className="text-amber-200">·</span>
                      <span className="text-xs text-amber-300">{p.date}</span>
                    </div>
                    <p className="mt-1 text-slate-200">{p.summary}</p>
                    <pre className="mt-2 overflow-x-auto rounded bg-slate-950/60 p-2 text-xs text-slate-300">
                      {p.diff}
                    </pre>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
