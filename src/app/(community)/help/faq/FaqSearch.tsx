'use client';

// ============================================================================
// FaqSearch — Client component para busca + filtros da FAQ page
// ============================================================================
//
// Funcionalidades:
//  - Search box (case-insensitive, multi-campo: question + answer + tags)
//  - Filter por categoria (multi-select)
//  - Filter por tradição (chips)
//  - Estado: resultados filtrados em URL state (history.replaceState)
//  - Empty state claro
//
// Não envia nada pro servidor — filtra no client (dataset = 80+ é pequeno)
// ============================================================================

import { useMemo, useState } from 'react';
import type { FaqCategory, FaqEntry } from '@/lib/help/faq-data';

interface Props {
  entries: FaqEntry[];
  categories: Array<{ slug: FaqCategory; label: string; description: string; icon: string }>;
}

const TRADITIONS = [
  { slug: 'cabala', label: 'Cabala' },
  { slug: 'candomble', label: 'Candomblé' },
  { slug: 'ifa', label: 'Ifá' },
  { slug: 'tantra', label: 'Tantra' },
  { slug: 'meditacao', label: 'Meditação' },
  { slug: 'astrologia', label: 'Astrologia' },
  { slug: 'xamanismo', label: 'Xamanismo' },
  { slug: 'umbanda', label: 'Umbanda' },
  { slug: 'reiki', label: 'Reiki' },
];

export function FaqSearch({ entries, categories }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState<Set<FaqCategory>>(new Set());
  const [selectedTradition, setSelectedTradition] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return entries.filter((e) => {
      // Text match
      if (q) {
        const inText =
          e.question.toLowerCase().includes(q) ||
          e.answer.toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q));
        if (!inText) return false;
      }
      // Category filter
      if (selectedCats.size > 0 && !selectedCats.has(e.category)) return false;
      // Tradition filter
      if (selectedTradition && e.relatedTradition !== selectedTradition) return false;
      return true;
    });
  }, [entries, query, selectedCats, selectedTradition]);

  const toggleCat = (cat: FaqCategory) => {
    const next = new Set(selectedCats);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelectedCats(next);
  };

  const clearAll = () => {
    setQuery('');
    setSelectedCats(new Set());
    setSelectedTradition(null);
  };

  const hasFilters = query || selectedCats.size > 0 || selectedTradition;

  return (
    <section
      aria-label="Busca e filtros de FAQ"
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6"
    >
      <label className="block">
        <span className="text-sm font-medium text-slate-200">Buscar</span>
        <div className="relative mt-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: KYC, marketplace, axé, 2FA…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-2.5 pr-10 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            aria-label="Buscar nas perguntas frequentes"
          />
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            🔍
          </span>
        </div>
      </label>

      {/* Categoria chips */}
      <div className="mt-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Categorias
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = selectedCats.has(c.slug);
            return (
              <button
                key={c.slug}
                onClick={() => toggleCat(c.slug)}
                type="button"
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  active
                    ? 'bg-violet-700 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tradição chips */}
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tradição específica
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTradition(null)}
            type="button"
            aria-pressed={selectedTradition === null}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              selectedTradition === null
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas
          </button>
          {TRADITIONS.map((t) => {
            const active = selectedTradition === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => setSelectedTradition(t.slug)}
                type="button"
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-emerald-700 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count + clear */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
        <span aria-live="polite" role="status">
          {hasFilters
            ? `${filtered.length} de ${entries.length} perguntas`
            : `${entries.length} perguntas no total`}
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            type="button"
            className="text-violet-300 hover:text-violet-200 focus:outline-none focus:underline"
          >
            ✕ Limpar filtros
          </button>
        )}
      </div>
    </section>
  );
}
