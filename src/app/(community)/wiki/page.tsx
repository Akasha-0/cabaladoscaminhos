// ============================================================================
// /wiki — Índice geral da community wiki (Wave 36)
// ============================================================================
// Featured + recent + popular. NO anonymous edits — só autenticados.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  WIKI_ARTICLES,
  WIKI_CATEGORIES,
  getFeaturedWiki,
  getRecentWiki,
  getPopularWiki,
  totalWikiCount,
  getWikiByCategory,
} from '@/lib/help/wiki-data';

export const metadata: Metadata = {
  title: 'Wiki da comunidade · Cabala dos Caminhos',
  description: 'Artigos curados pela comunidade Akasha — práticas, tradições, livros, experiências.',
  alternates: { canonical: '/wiki' },
};

export const revalidate = 120;

export default function WikiIndexPage() {
  const featured = getFeaturedWiki();
  const recent = getRecentWiki(8);
  const popular = getPopularWiki(8);
  const total = totalWikiCount();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-700/50">
          <span aria-hidden>📖</span>
          <span>Wiki da comunidade · {total} artigos publicados</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-50 sm:text-4xl">
          Wiki da comunidade
        </h1>
        <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
          Artigos escritos por usuários e curados por Iyá (curadora editorial).
          Você pode contribuir com novos artigos ou propor edições em artigos existentes.
          <strong className="text-slate-100"> Não aceitamos edits anônimos</strong> — só usuários autenticados.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/wiki/new"
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            ✍️ Criar artigo
          </Link>
          <Link
            href="/wiki/proposals"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            📝 Propostas pendentes
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total artigos" value={total} />
        <Stat label="Editores ativos" value="34" />
        <Stat label="Propostas pendentes" value="3" />
        <Stat label="Categorias" value={WIKI_CATEGORIES.length} />
      </div>

      {/* Categorias */}
      <section aria-labelledby="cats-h" className="mb-12">
        <h2 id="cats-h" className="mb-4 text-xl font-bold text-slate-100">Categorias</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {WIKI_CATEGORIES.map((c) => {
            const count = getWikiByCategory(c.slug).length;
            return (
              <Link
                key={c.slug}
                href={`/wiki?category=${c.slug}`}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-violet-700 hover:bg-slate-900/70"
              >
                <div className="text-sm font-semibold text-slate-100">{c.label}</div>
                <div className="mt-1 text-xs text-slate-400 line-clamp-2">{c.description}</div>
                <div className="mt-2 text-xs text-slate-500">{count} artigos</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section aria-labelledby="feat-h" className="mb-12">
          <h2 id="feat-h" className="mb-4 text-xl font-bold text-slate-100">⭐ Em destaque</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => (
              <WikiCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Recent + Popular */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-100">🕒 Recentes</h2>
          <ul className="space-y-2">
            {recent.map((a) => (
              <li key={a.slug}>
                <WikiRow article={a} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-100">🔥 Populares</h2>
          <ul className="space-y-2">
            {popular.map((a) => (
              <li key={a.slug}>
                <WikiRow article={a} showUpvotes />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function WikiCard({ article }: { article: import('@/lib/help/wiki-data').WikiArticle }) {
  return (
    <Link
      href={`/wiki/${article.slug}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-violet-700 hover:bg-slate-900/70"
    >
      <h3 className="line-clamp-2 text-base font-bold text-slate-100 group-hover:text-violet-200">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-400">{article.excerpt}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-violet-900/30 px-2 py-0.5 text-violet-200">
          {article.category}
        </span>
        <span>{article.authorName}</span>
        <span aria-hidden>·</span>
        <span>{article.views} views</span>
      </div>
    </Link>
  );
}

function WikiRow({
  article,
  showUpvotes,
}: {
  article: import('@/lib/help/wiki-data').WikiArticle;
  showUpvotes?: boolean;
}) {
  return (
    <Link
      href={`/wiki/${article.slug}`}
      className="block rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3 hover:border-violet-700 hover:bg-slate-900/60"
    >
      <div className="font-medium text-slate-100 line-clamp-1">{article.title}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
        <span>{article.authorName}</span>
        <span aria-hidden>·</span>
        <span>{article.lastUpdated}</span>
        {showUpvotes && (
          <>
            <span aria-hidden>·</span>
            <span>👍 {article.upvotes}</span>
          </>
        )}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="mt-1 text-xs uppercase text-slate-500">{label}</div>
    </div>
  );
}
