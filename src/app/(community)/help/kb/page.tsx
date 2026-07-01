// ============================================================================
// /help/kb — Índice geral da Knowledge Base (Wave 36)
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { KB_CATEGORIES, KB_ARTICLES, getKbByCategory, totalKbCount } from '@/lib/help/kb-data';

export const metadata: Metadata = {
  title: 'Knowledge Base · Cabala dos Caminhos',
  description:
    'Base de conhecimento com 50+ artigos aprofundados sobre tradições, funcionalidades, marketplace, mentoria, admin e segurança.',
  alternates: { canonical: '/help/kb' },
};

export const revalidate = 600;

export default function KbIndexPage() {
  const total = totalKbCount();
  const topLevelCategories = KB_CATEGORIES.filter((c) => !c.parent && !c.slug.includes('/'));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-700/50">
          <span aria-hidden>📖</span>
          <span>Knowledge Base · {total} artigos</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-50 sm:text-4xl">Knowledge Base</h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Artigos aprofundados sobre todas as funcionalidades, tradições, e processos da Cabala dos Caminhos.
          Conteúdo curado por Iyá (curadora editorial) + PM Tomás.
        </p>
      </header>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Artigos" value={total} />
        <Stat label="Categorias" value={topLevelCategories.length} />
        <Stat label="Tradições" value={KB_ARTICLES.filter((a) => a.category.startsWith('traditions/')).length} />
        <Stat label="Última atualização" value="2026-06-30" />
      </div>

      {/* Top categories grid */}
      <section aria-labelledby="cats-h" className="mb-12">
        <h2 id="cats-h" className="mb-4 text-xl font-bold text-slate-100">Categorias</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topLevelCategories.map((cat) => {
            const count = getKbByCategory(cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/help/kb/${cat.slug}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-violet-700 hover:bg-slate-900/70"
              >
                <div className="mb-3 text-3xl" aria-hidden>
                  {iconFor(cat.icon)}
                </div>
                <h3 className="mb-1 text-base font-bold text-slate-100 group-hover:text-violet-200">
                  {cat.label}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">{cat.description}</p>
                <div className="mt-3 text-xs text-slate-500">
                  {count} {count === 1 ? 'artigo' : 'artigos'}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently updated */}
      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="mb-4 text-xl font-bold text-slate-100">Atualizados recentemente</h2>
        <div className="space-y-2">
          {KB_ARTICLES.slice()
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 10)
            .map((a) => (
              <Link
                key={a.slug}
                href={`/help/kb/${a.category.includes('/') ? a.category.split('/')[0] : a.category}/${a.slug.split('/').pop()}`}
                className="flex items-start justify-between gap-4 rounded border border-slate-800 bg-slate-900/30 px-4 py-3 hover:border-violet-700 hover:bg-slate-900/60"
              >
                <div className="min-w-0">
                  <div className="font-medium text-slate-100 line-clamp-1">{a.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {a.category} · ~{a.readingMinutes} min · v{a.version}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-slate-400">{a.updatedAt}</div>
              </Link>
            ))}
        </div>
      </section>
    </div>
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
