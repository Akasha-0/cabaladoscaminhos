// ============================================================================
// TrendingSidebar — FAQs em destaque + métricas + atalhos rápidos
// ============================================================================

import Link from 'next/link';
import type { FaqEntry } from '@/lib/help/faq-data';

interface Props {
  entries: FaqEntry[];
  trendingCount: number;
  total: number;
}

export function TrendingSidebar({ entries, trendingCount, total }: Props) {
  const trending = entries
    .filter((e) => e.trending)
    .sort((a, b) => b.helpCount - a.helpCount)
    .slice(0, 10);

  return (
    <div className="sticky top-6 space-y-6">
      {/* Quick stats */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Métricas
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-slate-400">Total artigos</dt>
            <dd className="font-mono text-slate-100">{total}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-slate-400">Em destaque</dt>
            <dd className="font-mono text-amber-300">{trendingCount}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-slate-400">Idiomas</dt>
            <dd className="font-mono text-slate-100">2</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-slate-400">Categorias</dt>
            <dd className="font-mono text-slate-100">12</dd>
          </div>
        </dl>
      </div>

      {/* Trending list */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-100">
          🔥 Mais úteis da semana
        </h2>
        <ol className="space-y-3 text-sm">
          {trending.map((e, idx) => (
            <li key={e.id} className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
              <a
                href={`#entry-${e.id}`}
                className="group block text-slate-300 hover:text-violet-300"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs text-slate-500">{idx + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 group-hover:underline">{e.question}</div>
                    <div className="mt-1 text-xs text-slate-500">👍 {e.helpCount}</div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/40 to-slate-900 p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-100">Atalhos</h2>
        <nav className="space-y-2 text-sm">
          <Link href="/help/search" className="flex items-center gap-2 text-violet-300 hover:text-violet-200">
            🔍 Busca avançada
          </Link>
          <Link href="/help/kb/getting-started" className="flex items-center gap-2 text-violet-300 hover:text-violet-200">
            🚀 Primeiros passos
          </Link>
          <Link href="/help/videos" className="flex items-center gap-2 text-violet-300 hover:text-violet-200">
            🎬 Vídeos tutoriais
          </Link>
          <Link href="/wiki" className="flex items-center gap-2 text-violet-300 hover:text-violet-200">
            📖 Wiki da comunidade
          </Link>
        </nav>
      </div>
    </div>
  );
}
