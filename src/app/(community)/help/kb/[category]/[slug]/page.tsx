// ============================================================================
// /help/kb/[category]/[slug] — Artigo da Knowledge Base (Wave 36)
// ============================================================================
// Renderiza artigo markdown-like estruturado (sem libs externas).
// LGPD: artigos não contêm PII; exemplos são fictícios.
//
// Hierarquia: /help/kb/getting-started/onboarding, /help/kb/traditions/cabala, etc.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  KB_ARTICLES,
  getKbByCategory,
  getKbBySlug,
  getKbSiblings,
  KB_CATEGORIES,
} from '@/lib/help/kb-data';

// Force-static + ISR
export const revalidate = 600;

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return KB_ARTICLES.map((a) => {
    const parts = a.slug.split('/');
    return {
      category: parts[0] === 'traditions' || parts[0] === 'features' ? parts[1] : parts[0],
      slug: parts[parts.length - 1],
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findByAnySlug(slug);
  if (!article) return { title: 'Artigo não encontrado' };
  return {
    title: `${article.title} · KB`,
    description: article.excerpt,
    alternates: { canonical: `/help/kb/${categorySlugForArticle(article)}/${articleSlugForArticle(article)}` },
  };
}

export default async function KbArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = findByAnySlug(slug);
  if (!article) notFound();

  const siblings = getKbSiblings(article.slug);
  const category = KB_CATEGORIES.find((c) =>
    article.category === c.slug || article.category.startsWith(`${c.slug}/`),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-400" aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/help" className="hover:text-violet-300">Ajuda</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/help/kb" className="hover:text-violet-300">KB</Link></li>
          {category && (
            <>
              <li aria-hidden>/</li>
              <li><Link href={`/help/kb/${category.slug}`} className="hover:text-violet-300">{category.label}</Link></li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
        {/* Article body */}
        <article className="min-w-0">
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              {category && (
                <span className="rounded-full bg-violet-900/30 px-2 py-1 text-violet-200 ring-1 ring-violet-700/50">
                  {category.label}
                </span>
              )}
              <span className="text-slate-400">~{article.readingMinutes} min</span>
              <span className="text-slate-400">v{article.version}</span>
              <span className="text-slate-400">Atualizado {article.updatedAt}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 text-lg text-slate-300">{article.excerpt}</p>
            <div className="mt-4 text-sm text-slate-400">
              Por <strong className="text-slate-200">{article.author}</strong>
            </div>
          </header>

          {/* Body sections */}
          <div className="prose prose-invert max-w-none">
            {article.body.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-slate-300">
                <p className="font-semibold">Artigo em construção.</p>
                <p className="mt-2 text-sm">
                  Esta é uma página de stub. Conteúdo completo será adicionado pela curadoria editorial
                  conforme demanda dos beta users.
                </p>
                {siblings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase text-slate-500">Relacionados:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {siblings.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/help/kb/${categorySlugForArticle(s)}/${articleSlugForArticle(s)}`} className="text-violet-300 hover:text-violet-200">
                            → {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              article.body.map((section, i) => <SectionRender key={i} section={section} />)
            )}
          </div>

          {/* Edit history */}
          {article.editHistory.length > 0 && (
            <details className="mt-12 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-300">
                📜 Histórico de edições ({article.editHistory.length})
              </summary>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                {article.editHistory.map((h, i) => (
                  <li key={i} className="border-l-2 border-slate-700 pl-3">
                    <strong className="text-slate-200">{h.date}</strong> — <em>{h.author}</em>: {h.note}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Suggest improvement */}
          <footer className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-400">
            <p>Achou um erro ou falta algo? <Link href={`/feedback?type=CONTENT&category=KB&id=${article.slug}`} className="text-violet-300 hover:text-violet-200">Sugerir melhoria →</Link></p>
            <p className="mt-2">Última revisão editorial: {article.updatedAt}</p>
          </footer>
        </article>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          {article.toc.length > 0 && (
            <div className="sticky top-6 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Nesta página</h2>
              <nav className="space-y-1 text-sm">
                {article.toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="block py-1 pl-2 text-slate-400 hover:text-violet-300">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
          {/* Related */}
          {article.relatedSlugs.length > 0 && (
            <div className="mt-6 rounded-lg border border-violet-700/40 bg-violet-950/30 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Veja também</h2>
              <nav className="space-y-1 text-sm">
                {article.relatedSlugs.map((s) => (
                  <Link key={s} href={`/help/kb/${s.split('/').slice(0, -1).join('/')}`} className="block py-1 text-violet-300 hover:text-violet-200">
                    → {s.split('/').pop()}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION RENDERER (minimal markdown)
// ============================================================================

function SectionRender({ section }: { section: import('@/lib/help/kb-data').KbArticleSection }) {
  switch (section.kind) {
    case 'h2':
      return (
        <h2 id={section.id} className="mt-10 mb-3 scroll-mt-6 text-2xl font-bold text-slate-50 first:mt-0">
          {section.text}
        </h2>
      );
    case 'p':
      return <p className="my-3 text-base leading-relaxed text-slate-200">{section.text}</p>;
    case 'list':
      if (section.ordered) {
        return (
          <ol className="my-4 list-decimal space-y-1 pl-6 text-slate-200">
            {section.items.map((item, i) => <li key={i}>{item}</li>)}
          </ol>
        );
      }
      return (
        <ul className="my-4 list-disc space-y-1 pl-6 text-slate-200">
          {section.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    case 'code':
      return (
        <pre className="my-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm">
          <code className={`language-${section.lang} text-slate-200`}>{section.code}</code>
        </pre>
      );
    case 'callout':
      return (
        <aside
          className={`my-5 rounded-lg border p-4 ${
            section.tone === 'lgpd'
              ? 'border-emerald-700/50 bg-emerald-950/30'
              : section.tone === 'warn'
              ? 'border-amber-700/50 bg-amber-950/30'
              : section.tone === 'tradition'
              ? 'border-violet-700/50 bg-violet-950/30'
              : 'border-blue-700/50 bg-blue-950/30'
          }`}
        >
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            {section.tone === 'lgpd' && '🛡️'}
            {section.tone === 'warn' && '⚠️'}
            {section.tone === 'tradition' && '🌿'}
            {section.tone === 'info' && 'ℹ️'}
            <span>{section.title}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">{section.body}</p>
        </aside>
      );
    case 'table':
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-slate-300">
              <tr>
                {section.headers.map((h, i) => <th key={i} className="border-b border-slate-800 px-3 py-2 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr key={i} className="odd:bg-slate-950/50">
                  {row.map((cell, j) => <td key={j} className="border-b border-slate-800/50 px-3 py-2 text-slate-200">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

// ============================================================================
// HELPERS (parameter resolution / fallback)
// ============================================================================

function findByAnySlug(slug: string) {
  // The [slug] param alone — try matching the last segment or full slug
  let article = getKbBySlug(slug);
  if (article) return article;
  const byLastSegment = KB_ARTICLES.find((a) => a.slug.split('/').pop() === slug);
  if (byLastSegment) return byLastSegment;
  return undefined;
}

function categorySlugForArticle(a: import('@/lib/help/kb-data').KbArticleFull): string {
  return a.category.includes('/') ? a.category.split('/')[0] : a.category;
}

function articleSlugForArticle(a: import('@/lib/help/kb-data').KbArticleFull): string {
  return a.slug.split('/').pop() ?? a.slug;
}
