// ============================================================================
// SearchResults — Renderiza resultados de busca da /help/search
// ============================================================================

import Link from 'next/link';
import type { HelpSearchResults, HelpResultType } from '@/lib/help/search-data';

interface Props {
  query: string;
  results: HelpSearchResults;
  activeType?: HelpResultType;
  activeCategory?: string;
}

const TYPES: Array<{ slug: HelpResultType; label: string; icon: string }> = [
  { slug: 'faq', label: 'FAQ', icon: '📚' },
  { slug: 'kb', label: 'Knowledge Base', icon: '📖' },
  { slug: 'wiki', label: 'Wiki', icon: '📜' },
  { slug: 'video', label: 'Vídeos', icon: '🎬' },
];

const CATEGORIES = [
  'conceito', 'akasha-ia', 'tradicoes', 'marketplace',
  'mentorship', 'seguranca', 'lgpd', 'onboarding',
];

export function SearchResults({ query, results, activeType, activeCategory }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">
          🔍 {results.total} resultado{results.total !== 1 ? 's' : ''} para &quot;{query}&quot;
        </h1>
        <div className="mt-2 text-sm text-slate-400">
          {results.took_ms}ms · busca em FAQ + KB + Wiki + Vídeos
        </div>
      </header>

      {/* Filtros por tipo */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip href={`/help/search?q=${encodeURIComponent(query)}`} active={!activeType}>
          Todos ({results.total})
        </FilterChip>
        {TYPES.map((t) => {
          const count = results.facets.by_type[t.slug];
          return (
            <FilterChip
              key={t.slug}
              href={`/help/search?q=${encodeURIComponent(query)}&type=${t.slug}`}
              active={activeType === t.slug}
            >
              {t.icon} {t.label} ({count})
            </FilterChip>
          );
        })}
      </div>

      {/* Filtros por categoria */}
      {results.facets.by_category && Object.keys(results.facets.by_category).length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500">Categoria:</span>
          <FilterChipSmall href={`/help/search?q=${encodeURIComponent(query)}${activeType ? `&type=${activeType}` : ''}`} active={!activeCategory}>
            Todas
          </FilterChipSmall>
          {Object.entries(results.facets.by_category).slice(0, 10).map(([cat, count]) => (
            <FilterChipSmall
              key={cat}
              href={`/help/search?q=${encodeURIComponent(query)}&category=${cat}${activeType ? `&type=${activeType}` : ''}`}
              active={activeCategory === cat}
            >
              {cat} ({count})
            </FilterChipSmall>
          ))}
        </div>
      )}

      {/* Lista de resultados */}
      {results.results.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
          <div className="text-3xl">🤔</div>
          <p className="mt-3 text-slate-300">Nada encontrado. Tente termos mais curtos ou explore:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/help/faq" className="rounded bg-slate-800 px-3 py-1 text-violet-300 hover:bg-slate-700">📚 FAQ</Link>
            <Link href="/help/kb" className="rounded bg-slate-800 px-3 py-1 text-violet-300 hover:bg-slate-700">📖 KB</Link>
            <Link href="/help/videos" className="rounded bg-slate-800 px-3 py-1 text-violet-300 hover:bg-slate-700">🎬 Vídeos</Link>
            <Link href="/akashic" className="rounded bg-slate-800 px-3 py-1 text-violet-300 hover:bg-slate-700">✨ Akasha IA</Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.results.map((r) => (
            <li key={`${r.type}-${r.id}`}>
              <Link
                href={r.url}
                className="block rounded-lg border border-slate-800 bg-slate-900/30 p-4 hover:border-violet-700 hover:bg-slate-900/60"
              >
                <div className="mb-1 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-violet-900/30 px-2 py-0.5 text-violet-200">
                    {labelFor(r.type)}
                  </span>
                  {r.category && (
                    <span className="text-slate-400">{r.category}</span>
                  )}
                  <span className="ml-auto text-slate-500">score {r.score.toFixed(1)}</span>
                </div>
                <h2 className="text-base font-semibold text-slate-100">{r.title}</h2>
                <p className="mt-1 text-sm text-slate-400 line-clamp-2">{r.excerpt}</p>
                <div className="mt-1 text-xs text-violet-300">{r.url}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Buscas relacionadas */}
      {results.relatedSearches.length > 0 && (
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-slate-300">Buscas relacionadas</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {results.relatedSearches.map((s) => (
              <Link
                key={s}
                href={`/help/search?q=${encodeURIComponent(s)}`}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-violet-200 hover:bg-slate-700"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-violet-700 text-white shadow'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </Link>
  );
}

function FilterChipSmall({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded px-2 py-1 text-xs transition ${
        active
          ? 'bg-emerald-700 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </Link>
  );
}

function labelFor(t: HelpResultType): string {
  return TYPES.find((x) => x.slug === t)?.label ?? t;
}
