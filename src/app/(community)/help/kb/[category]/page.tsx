// ============================================================================
// /help/kb/[category] — Índice de uma categoria da Knowledge Base
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KB_CATEGORIES, KB_ARTICLES, getKbByCategory } from '@/lib/help/kb-data';
import { articleSlugForArticle, categorySlugForArticle } from '../_helpers';

interface Props {
  params: Promise<{ category: string }>;
}

export const revalidate = 600;

export async function generateStaticParams() {
  return KB_CATEGORIES.map((c) => ({ category: c.slug.split('/')[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = KB_CATEGORIES.find((c) => c.slug === category || c.slug.startsWith(`${category}/`));
  if (!cat) return { title: 'Categoria não encontrada' };
  return {
    title: `${cat.label} · KB`,
    description: cat.description,
    alternates: { canonical: `/help/kb/${category}` },
  };
}

export default async function KbCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = KB_CATEGORIES.find((c) => c.slug === category || c.slug.startsWith(`${category}/`));
  if (!cat) notFound();

  const articles = getKbByCategory(category);
  const subcategories = KB_CATEGORIES.filter(
    (c) => c.parent && (c.parent === category || c.slug.startsWith(`${category}/`)),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <nav className="mb-6 text-sm text-slate-400" aria-label="breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link href="/help" className="hover:text-violet-300">Ajuda</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/help/kb" className="hover:text-violet-300">KB</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-200">{cat.label}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-3xl">{iconFor(cat.icon)}</span>
          <div>
            <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">{cat.label}</h1>
            <p className="mt-1 text-base text-slate-300">{cat.description}</p>
          </div>
        </div>
      </header>

      {/* Subcategorias (se houver) */}
      {subcategories.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/help/kb/${sub.slug.split('/')[0]}`}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition hover:border-violet-700 hover:bg-slate-900/70"
            >
              <div className="text-sm font-semibold text-slate-100">{sub.label}</div>
              <div className="mt-1 text-xs text-slate-400">{sub.description}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Articles list */}
      <div className="space-y-3">
        {articles.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 text-slate-400">
            Nenhum artigo nesta categoria ainda.
          </div>
        ) : (
          articles.map((article) => (
            <Link
              key={article.slug}
              href={`/help/kb/${categorySlugForArticle(article)}/${articleSlugForArticle(article)}`}
              className="group block rounded-lg border border-slate-800 bg-slate-900/30 p-5 transition hover:border-violet-700 hover:bg-slate-900/60"
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-100 group-hover:text-violet-200">
                  {article.title}
                </h2>
                <span className="text-xs text-slate-500">~{article.readingMinutes} min</span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-2">{article.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>v{article.version}</span>
                <span aria-hidden>·</span>
                <span>{article.author}</span>
                <span aria-hidden>·</span>
                <span>Atualizado {article.updatedAt}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function iconFor(iconName: string): string {
  const map: Record<string, string> = {
    rocket: '🚀',
    leaf: '🌿',
    star: '⭐',
    sun: '☀️',
    moon: '🌙',
    infinity: '∞',
    circle: '⭕',
    compass: '🧭',
    mountain: '⛰️',
    flame: '🔥',
    zap: '⚡',
    sparkles: '✨',
    store: '🏪',
    users: '👥',
    shield: '🛡️',
    lock: '🔒',
  };
  return map[iconName] ?? '📄';
}
