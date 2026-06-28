'use client';

// ============================================================================
// AKASHA PORTAL — Search Page (Wave 18)
// ============================================================================
// Integração completa com /api/search e /api/search/suggestions.
//
// Features Wave 18:
//   - Debounce 300ms nas suggestions (useDebounce hook)
//   - Filtros: tradition, level (articles), format (articles),
//     dateFrom/dateTo, hasAudio/hasVideo, sort (relevância|recente|popular)
//   - Sidebar de filtros em desktop / accordion em mobile
//   - Highlight via <mark> no preview (já retornado pela API via ts_headline)
//   - Empty state com sugestões "Tente X ou Y"
//   - Result count + sort options
// ============================================================================

import * as React from 'react';
import Link from 'next/link';
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  ChevronDown as ChevronDownIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  Sliders as SlidersIcon,
} from 'lucide-react';

import { ApiError, EmptyResults } from '@/components/design-system/error-states';
import { ArticleCardSkeleton } from '@/components/design-system/skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

// ============================================================================
// Types — espelham a API
// ============================================================================

type SearchType = 'all' | 'posts' | 'articles' | 'users' | 'groups' | 'tags';
type SearchSort = 'relevance' | 'recent' | 'popular';
type EvidenceLevel = 'ANECDOTAL' | 'LOW' | 'MEDIUM' | 'HIGH';
type ArticleFormat =
  | 'SCIENTIFIC_PAPER'
  | 'MAGAZINE_ARTICLE'
  | 'BOOK'
  | 'VIDEO'
  | 'PODCAST'
  | 'ESSAY';

interface SearchHitBase {
  type: string;
  id: string;
  preview: string;
  score: number;
  url: string;
  createdAt: string;
}

interface PostHit extends SearchHitBase {
  type: 'post';
  authorName: string;
  tradition: string | null;
  topic: string | null;
  groupName: string | null;
  likesCount: number;
  commentsCount: number;
}

interface ArticleHit extends SearchHitBase {
  type: 'article';
  slug: string;
  title: string;
  summary: string;
  authors: string[];
  year: number;
  tradition: string | null;
  evidenceLevel: EvidenceLevel;
  viewCount: number;
  bookmarkCount: number;
  citations: number;
}

interface GroupHit extends SearchHitBase {
  type: 'group';
  slug: string;
  name: string;
  tradition: string;
  membersCount: number;
  postsCount: number;
}

interface UserHit extends SearchHitBase {
  type: 'user';
  displayName: string;
  signoSolar: string | null;
  oduNascimento: string | null;
  orixaRegente: string | null;
  caminhoDeVida: number | null;
}

interface TagHit extends SearchHitBase {
  type: 'tag';
  tag: string;
  kind: 'tradition' | 'topic' | 'article_tag';
  count: number;
}

type SearchHit = PostHit | ArticleHit | GroupHit | UserHit | TagHit;

interface SearchResults {
  query: string;
  type: SearchType;
  hits: SearchHit[];
  facets: { posts: number; articles: number; groups: number; users: number; tags: number; total: number };
  nextCursor: string | null;
  took_ms: number;
}

interface Suggestion {
  type: 'post' | 'article' | 'group' | 'user' | 'tag';
  id: string;
  label: string;
  sublabel?: string;
  url: string;
}

// ============================================================================
// Opções dos filtros
// ============================================================================

const TRADITIONS: { slug: string; label: string }[] = [
  { slug: 'cabala', label: 'Cabala' },
  { slug: 'ifa', label: 'Ifá' },
  { slug: 'candomble', label: 'Candomblé' },
  { slug: 'umbanda', label: 'Umbanda' },
  { slug: 'tantra', label: 'Tantra' },
  { slug: 'meditacao', label: 'Meditação' },
  { slug: 'xamanismo', label: 'Xamanismo' },
  { slug: 'reiki', label: 'Reiki' },
  { slug: 'astrologia', label: 'Astrologia' },
  { slug: 'numerologia', label: 'Numerologia' },
  { slug: 'tarot', label: 'Tarot' },
  { slug: 'espiritismo', label: 'Espiritismo' },
];

const LEVELS: { slug: EvidenceLevel; label: string; hint: string }[] = [
  { slug: 'HIGH', label: 'Alta', hint: 'Meta-análise' },
  { slug: 'MEDIUM', label: 'Média', hint: 'RCT individual' },
  { slug: 'LOW', label: 'Baixa', hint: 'Observacional' },
  { slug: 'ANECDOTAL', label: 'Anecdótico', hint: 'Tradição/Ensaio' },
];

const FORMATS: { slug: ArticleFormat; label: string }[] = [
  { slug: 'SCIENTIFIC_PAPER', label: 'Paper científico' },
  { slug: 'BOOK', label: 'Livro' },
  { slug: 'VIDEO', label: 'Vídeo' },
  { slug: 'PODCAST', label: 'Podcast' },
  { slug: 'ESSAY', label: 'Ensaio' },
  { slug: 'MAGAZINE_ARTICLE', label: 'Artigo de revista' },
];

const SORTS: { slug: SearchSort; label: string }[] = [
  { slug: 'relevance', label: 'Relevância' },
  { slug: 'recent', label: 'Mais recente' },
  { slug: 'popular', label: 'Mais popular' },
];

const EMPTY_TIPS = [
  'Verifique a grafia — experimentamos tolerância a typos',
  'Use termos mais genéricos (ex.: "meditação" em vez do nome de uma técnica)',
  'Tente palavras-chave diferentes',
  'Remova filtros para ampliar a busca',
];

// ============================================================================
// Helpers
// ============================================================================

function buildApiUrl(q: string, filters: ActiveFilters, cursor?: string): string {
  const params = new URLSearchParams();
  params.set('q', q);
  if (filters.type && filters.type !== 'all') params.set('type', filters.type);
  if (filters.tradition) params.set('tradition', filters.tradition);
  if (filters.level) params.set('level', filters.level);
  if (filters.format) params.set('format', filters.format);
  if (filters.hasAudio) params.set('hasAudio', 'true');
  if (filters.hasVideo) params.set('hasVideo', 'true');
  if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
  if (cursor) params.set('cursor', cursor);
  return `/api/search?${params.toString()}`;
}

function buildSuggestionsUrl(q: string): string {
  return `/api/search/suggestions?q=${encodeURIComponent(q)}&limit=8`;
}

interface ActiveFilters {
  type: SearchType;
  tradition: string | null;
  level: EvidenceLevel | null;
  format: ArticleFormat | null;
  hasAudio: boolean;
  hasVideo: boolean;
  sort: SearchSort;
}

const DEFAULT_FILTERS: ActiveFilters = {
  type: 'all',
  tradition: null,
  level: null,
  format: null,
  hasAudio: false,
  hasVideo: false,
  sort: 'relevance',
};

// ============================================================================
// Highlight renderer
// ============================================================================

/**
 * Renderiza preview com `<mark>` colorido (Wave 18).
 * Estratégia:
 *   - Divide o preview nos marcadores <mark>...</mark>
 *   - Renderiza cada parte: texto cru OU <mark> com cor amber
 *   - Sanitiza HTML para evitar XSS (preview vem do ts_headline, que é confiável,
 *     mas adicionamos escape em texto cru para garantir)
 */
function HighlightedPreview({ html }: { html: string }) {
  // Quebra em torno de <mark>...</mark>
  const parts = html.split(/(<mark>[^<]*<\/mark>)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^<mark>([^<]*)<\/mark>$/);
        if (m) {
          return (
            <mark
              key={i}
              className="rounded bg-amber-500/25 px-0.5 font-medium text-amber-200"
            >
              {m[1]}
            </mark>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

// ============================================================================
// SearchBar (com debounce + suggestions)
// ============================================================================

function SearchBar({
  query,
  onQueryChange,
  onSubmit,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
}) {
  const debouncedQ = useDebounce(query, 300);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (debouncedQ.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    fetch(buildSuggestionsUrl(debouncedQ))
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const list: Suggestion[] = json?.data?.suggestions ?? [];
        setSuggestions(list);
        setOpen(list.length > 0);
      })
      .catch(() => {
        if (cancelled) return;
        setSuggestions([]);
        setOpen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  return (
    <div className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
          setOpen(false);
        }}
        className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/30"
      >
        <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar artigos, práticas, tradições…"
          aria-label="Buscar no portal"
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              setSuggestions([]);
              setOpen(false);
            }}
            aria-label="Limpar busca"
            className="rounded p-1 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur"
        >
          {suggestions.map((s) => (
            <li key={`${s.type}-${s.id}`} role="option">
              <Link
                href={s.url}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-800/60"
                onClick={() => setOpen(false)}
              >
                <span className="rounded-md border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {s.sublabel ?? s.type}
                </span>
                <span className="flex-1 truncate text-slate-200">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// Filters Sidebar (desktop) + Accordion (mobile)
// ============================================================================

function FiltersPanel({
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  filters: ActiveFilters;
  onChange: (next: Partial<ActiveFilters>) => void;
  onReset: () => void;
  resultCount: number | null;
}) {
  const activeCount =
    (filters.tradition ? 1 : 0) +
    (filters.level ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.hasAudio ? 1 : 0) +
    (filters.hasVideo ? 1 : 0);

  return (
    <aside
      aria-label="Filtros de busca"
      className="space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <SlidersIcon className="h-4 w-4 text-amber-400" aria-hidden />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 underline-offset-2 hover:text-amber-300 hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Tradição */}
      <FilterSection title="Tradição" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {TRADITIONS.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() =>
                onChange({ tradition: filters.tradition === t.slug ? null : t.slug })
              }
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                filters.tradition === t.slug
                  ? 'border-amber-500/60 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Nível de evidência */}
      <FilterSection title="Nível de evidência">
        <ul className="space-y-1.5">
          {LEVELS.map((l) => (
            <li key={l.slug}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-800/40">
                <input
                  type="radio"
                  name="level"
                  checked={filters.level === l.slug}
                  onChange={() => onChange({ level: filters.level === l.slug ? null : l.slug })}
                  className="h-3.5 w-3.5 accent-amber-500"
                />
                <span className="font-medium text-slate-200">{l.label}</span>
                <span className="text-slate-500">— {l.hint}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Formato */}
      <FilterSection title="Formato">
        <ul className="space-y-1.5">
          {FORMATS.map((f) => (
            <li key={f.slug}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-800/40">
                <input
                  type="radio"
                  name="format"
                  checked={filters.format === f.slug}
                  onChange={() => onChange({ format: filters.format === f.slug ? null : f.slug })}
                  className="h-3.5 w-3.5 accent-amber-500"
                />
                <span className="text-slate-200">{f.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Extras (áudio/vídeo) */}
      <FilterSection title="Mídia">
        <ul className="space-y-1.5">
          <li>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-800/40">
              <input
                type="checkbox"
                checked={filters.hasAudio}
                onChange={(e) => onChange({ hasAudio: e.target.checked })}
                className="h-3.5 w-3.5 accent-amber-500"
              />
              <span className="text-slate-200">Com áudio</span>
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-800/40">
              <input
                type="checkbox"
                checked={filters.hasVideo}
                onChange={(e) => onChange({ hasVideo: e.target.checked })}
                className="h-3.5 w-3.5 accent-amber-500"
              />
              <span className="text-slate-200">Com vídeo</span>
            </label>
          </li>
        </ul>
      </FilterSection>

      {resultCount !== null && (
        <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400">
          <span className="font-semibold text-amber-300">{resultCount}</span>{' '}
          {resultCount === 1 ? 'resultado' : 'resultados'} encontrado{resultCount === 1 ? '' : 's'}
        </p>
      )}
    </aside>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 text-slate-500 transition-transform',
            open && 'rotate-180 text-amber-400',
          )}
          aria-hidden
        />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// ============================================================================
// Mobile Filters (accordion drawer)
// ============================================================================

function MobileFiltersDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: ActiveFilters;
  onChange: (next: Partial<ActiveFilters>) => void;
  onReset: () => void;
  resultCount: number | null;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de busca"
      className="fixed inset-0 z-40 lg:hidden"
    >
      <button
        type="button"
        aria-label="Fechar filtros"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-2xl border-t border-slate-800 bg-slate-950 p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-700" aria-hidden />
        <FiltersPanel
          filters={filters}
          onChange={onChange}
          onReset={onReset}
          resultCount={resultCount}
        />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Hit cards
// ============================================================================

function HitCard({ hit }: { hit: SearchHit }) {
  if (hit.type === 'post') {
    return (
      <Link
        href={hit.url}
        className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {hit.tradition && (
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-300">
              {hit.tradition}
            </span>
          )}
          {hit.groupName && (
            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-slate-300">
              {hit.groupName}
            </span>
          )}
          <span className="text-slate-500">por {hit.authorName}</span>
        </div>
        <p className="mb-2 text-sm leading-relaxed text-slate-300">
          <HighlightedPreview html={hit.preview} />
        </p>
        <div className="text-xs text-slate-500">
          ❤ {hit.likesCount} · 💬 {hit.commentsCount}
        </div>
      </Link>
    );
  }

  if (hit.type === 'article') {
    return (
      <Link
        href={hit.url}
        className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {hit.tradition && (
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-300">
              {hit.tradition}
            </span>
          )}
          <span
            className={cn(
              'rounded-full border px-2 py-0.5',
              hit.evidenceLevel === 'HIGH' || hit.evidenceLevel === 'MEDIUM'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : hit.evidenceLevel === 'LOW'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                : 'border-slate-700 bg-slate-800/60 text-slate-400',
            )}
          >
            {hit.evidenceLevel}
          </span>
          <span className="text-slate-500">
            {hit.authors.slice(0, 2).join(', ')}
            {hit.authors.length > 2 ? ' et al.' : ''} · {hit.year}
          </span>
        </div>
        <h3 className="mb-2 text-base font-semibold text-slate-100 transition-colors group-hover:text-amber-300">
          {hit.title}
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-slate-400">
          <HighlightedPreview html={hit.preview} />
        </p>
        <div className="text-xs text-slate-500">
          👁 {hit.viewCount} · 🔖 {hit.bookmarkCount} · 📑 {hit.citations}
        </div>
      </Link>
    );
  }

  if (hit.type === 'group') {
    return (
      <Link
        href={hit.url}
        className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
      >
        <div className="mb-2 text-xs">
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-300">
            {hit.tradition}
          </span>
        </div>
        <h3 className="mb-2 text-base font-semibold text-slate-100 transition-colors group-hover:text-amber-300">
          {hit.name}
        </h3>
        <p className="text-sm leading-relaxed text-slate-400">
          <HighlightedPreview html={hit.preview} />
        </p>
        <div className="mt-2 text-xs text-slate-500">
          👥 {hit.membersCount} membros · 📝 {hit.postsCount} posts
        </div>
      </Link>
    );
  }

  if (hit.type === 'user') {
    return (
      <Link
        href={hit.url}
        className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
      >
        <h3 className="mb-2 text-base font-semibold text-slate-100 transition-colors group-hover:text-amber-300">
          {hit.displayName}
        </h3>
        <p className="text-sm leading-relaxed text-slate-400">
          <HighlightedPreview html={hit.preview} />
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
          {hit.signoSolar && <span>♈ {hit.signoSolar}</span>}
          {hit.oduNascimento && <span>· Odu {hit.oduNascimento}</span>}
          {hit.orixaRegente && <span>· {hit.orixaRegente}</span>}
          {hit.caminhoDeVida && <span>· Caminho {hit.caminhoDeVida}</span>}
        </div>
      </Link>
    );
  }

  // tag
  return (
    <Link
      href={hit.url}
      className="group block rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-all hover:border-amber-500/30"
    >
      <div className="mb-2 text-xs">
        <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-slate-400">
          {hit.kind === 'article_tag' ? 'tag' : hit.kind}
        </span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-amber-300 transition-colors group-hover:text-amber-200">
        #{hit.tag}
      </h3>
      <div className="text-xs text-slate-500">
        {hit.count} {hit.count === 1 ? 'resultado' : 'resultados'}
      </div>
    </Link>
  );
}

// ============================================================================
// Empty State rico (Wave 18)
// ============================================================================

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="mb-2 text-lg font-semibold text-slate-100">
        Nada encontrado para "{query}"
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-400">
        Talvez uma destas sugestões te ajude:
      </p>
      <ul className="mb-6 max-w-md space-y-1.5 text-left text-sm text-slate-300">
        {EMPTY_TIPS.map((tip, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-amber-400" aria-hidden>
              ✦
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:bg-slate-800/60"
        >
          Limpar busca
        </button>
        <Link
          href="/library"
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-amber-400"
        >
          Explorar biblioteca
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Página principal
// ============================================================================

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [submittedQuery, setSubmittedQuery] = React.useState('');
  const [filters, setFilters] = React.useState<ActiveFilters>(DEFAULT_FILTERS);
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [state, setState] = React.useState<FetchState>('idle');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Fetch quando submittedQuery ou filters mudarem
  React.useEffect(() => {
    if (!submittedQuery.trim()) {
      setResults(null);
      setState('idle');
      return;
    }
    let cancelled = false;
    setState('loading');
    fetch(buildApiUrl(submittedQuery, filters))
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok || !json?.data) {
          throw new Error(json?.error?.message ?? 'Erro na busca');
        }
        return json.data as SearchResults;
      })
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setState(data.hits.length === 0 ? 'empty' : 'success');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err?.message ?? 'Erro desconhecido');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [submittedQuery, filters]);

  const submit = React.useCallback(() => {
    setSubmittedQuery(query.trim());
  }, [query]);

  const updateFilter = (next: Partial<ActiveFilters>) => {
    setFilters((f) => ({ ...f, ...next }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFiltersCount =
    (filters.tradition ? 1 : 0) +
    (filters.level ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.hasAudio ? 1 : 0) +
    (filters.hasVideo ? 1 : 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-3">Buscar</h1>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSubmit={submit}
          />

          {/* Mobile: button para abrir filtros */}
          <div className="mt-3 flex items-center justify-between gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/60"
            >
              <FilterIcon className="h-3.5 w-3.5" aria-hidden />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort (mobile) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Ordenar:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter({ sort: e.target.value as SearchSort })}
                className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-xs text-slate-200 focus:border-amber-500/60 focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar desktop */}
          <div className="hidden lg:block">
            <FiltersPanel
              filters={filters}
              onChange={updateFilter}
              onReset={resetFilters}
              resultCount={state === 'success' ? results?.facets.total ?? 0 : null}
            />
          </div>

          {/* Mobile drawer */}
          <MobileFiltersDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            resultCount={state === 'success' ? results?.facets.total ?? 0 : null}
          />

          {/* Results */}
          <section aria-label="Resultados">
            {/* Sort + count (desktop) */}
            {state === 'success' && (
              <div className="mb-4 hidden items-center justify-between lg:flex">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-amber-300">
                    {results?.facets.total ?? 0}
                  </span>{' '}
                  {(results?.facets.total ?? 0) === 1 ? 'resultado' : 'resultados'}{' '}
                  <span className="text-slate-500">em {results?.took_ms ?? 0}ms</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Ordenar por:</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter({ sort: e.target.value as SearchSort })}
                    className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-xs text-slate-200 focus:border-amber-500/60 focus:outline-none"
                  >
                    {SORTS.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {state === 'idle' && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
                <p className="text-sm text-slate-400">
                  Comece digitando para explorar artigos, práticas e tradições.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  {['Cabala', 'Ifá', 'Tantra', 'Chakras', 'Numerologia'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setQuery(s);
                        setSubmittedQuery(s);
                      }}
                      className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state === 'loading' && (
              <div className="grid grid-cols-1 gap-4">
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </div>
            )}

            {state === 'success' && results && (
              <div className="grid grid-cols-1 gap-4">
                {results.hits.map((hit) => (
                  <HitCard key={`${hit.type}-${hit.id}`} hit={hit} />
                ))}
              </div>
            )}

            {state === 'empty' && (
              <EmptyState
                query={submittedQuery}
                onClear={() => {
                  setQuery('');
                  setSubmittedQuery('');
                  setResults(null);
                }}
              />
            )}

            {state === 'error' && (
              <ApiError
                title="A busca falhou"
                description="Não conseguimos concluir a busca. Tente novamente."
                onRetry={() => submit()}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
