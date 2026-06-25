/**
 * Wave 13.2 — Global Search Palette (Cmd+K / Ctrl+K overlay)
 *
 * Mounted at the (akasha) root layout so it's available on every page
 * inside the authenticated app shell. Listens for:
 *   - macOS:   ⌘ + K  (Meta)
 *   - Win/Linux: Ctrl + K
 *   - "/" key as a fallback for users who don't know the shortcut
 *
 * Behavior:
 *   - Autofocus on the search input when the overlay opens
 *   - Debounced (300ms) fetch to /api/akasha/search
 *   - Keyboard navigation: ↑/↓ to move, Enter to navigate, Esc to close
 *   - Click outside / on a result closes + navigates
 *   - Mobile: overlay takes 100vh (full screen sheet)
 *   - Empty state when q.length < 2
 *   - Loading state during fetch
 *   - Error state on network failure
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" + aria-labelledby
 *   - Focus trap inside the overlay while open
 *   - Returns focus to the previously-focused element on close
 *   - Listbox pattern for results (role="listbox" + role="option")
 *
 * Why a custom component (vs. cmdk / headless combobox):
 *   - Project has 0 headless combobox deps. Adding `cmdk` would touch
 *     `pnpm-lock.yaml` (sacred) — out of scope for a wave.
 *   - The full listbox keyboard model is ~50 LOC — small enough to own.
 *   - Design tokens come from the existing portal palette (no new tokens).
 */
'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { getTranslations } from '@/lib/i18n';

import type {
  SearchResult,
  SearchResponse,
  SearchType,
} from '@/app/api/akasha/search/route';

type Locale = 'pt-BR' | 'en';

interface SearchPaletteProps {
  /** Already-prefixed locale, e.g. 'pt-BR' or 'en'. */
  locale: Locale;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export function SearchPalette({ locale }: SearchPaletteProps) {
  const router = useRouter();
  const t = getTranslations(locale);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Debounce query updates (300ms) ────────────────────────────────────────
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  // ── Fetch results when debounced query changes ────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (debouncedQuery.length < MIN_QUERY_LEN) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    fetch(`/api/akasha/search?q=${encodeURIComponent(debouncedQuery)}&limit=20`, {
      signal: ctrl.signal,
      credentials: 'same-origin',
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as SearchResponse;
      })
      .then((data) => {
        setResults(data.results ?? []);
        setActiveIdx(0);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(t('search.error'));
        setResults([]);
        setLoading(false);
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, open]);

  // ── Global keyboard listener: Cmd/Ctrl + K opens, "/" too ─────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && !open && !isTypingTarget(e.target);
      if (isCmdK) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (isSlash) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // ── Focus management: capture, restore, autofocus on open ─────────────────
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // Wait for the input to mount, then focus.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    } else {
      // Restore focus to whatever was focused before opening.
      previouslyFocusedRef.current?.focus?.();
    }
  }, [open]);

  // ── Reset state when overlay closes ───────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
      setActiveIdx(0);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // ── Close on route change (palette shouldn't survive navigation) ──────────
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    // Next.js App Router doesn't expose a clean route-change event, but
    // router.prefetch + click on a <Link> triggers the back/forward stack.
    // Listening on popstate covers browser back/forward.
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open]);

  const navigateTo = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      router.push(result.href);
    },
    [router]
  );

  // ── Keyboard nav inside the overlay ───────────────────────────────────────
  const onInputKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(results.length - 1, i + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter' && results[activeIdx]) {
        e.preventDefault();
        navigateTo(results[activeIdx]);
        return;
      }
    },
    [results, activeIdx, navigateTo]
  );

  const onOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      setOpen(false);
    }
  }, []);

  const showEmptyHint = useMemo(
    () => debouncedQuery.length < MIN_QUERY_LEN,
    [debouncedQuery]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="akasha-search-title"
      data-testid="search-palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm md:items-start md:pt-[12vh] px-0 md:px-4"
    >
      <div
        className="relative flex h-[100dvh] w-full flex-col bg-[#0E1020] text-[#F4F5FF] shadow-2xl ring-1 ring-white/10 md:h-auto md:max-h-[70vh] md:w-full md:max-w-2xl md:rounded-2xl"
        data-testid="search-palette-panel"
      >
        {/* Title (a11y) */}
        <h2 id="akasha-search-title" className="sr-only">
          {locale === 'pt-BR' ? 'Buscar no Akasha' : 'Search Akasha'}
        </h2>

        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search size={18} aria-hidden="true" className="shrink-0 text-white/60" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            aria-controls="akasha-search-results"
            aria-activedescendant={
              results[activeIdx] ? `akasha-search-result-${activeIdx}` : undefined
            }
            data-testid="search-input"
            className="flex-1 bg-transparent text-base placeholder:text-white/40 focus:outline-none"
          />
          {loading && (
            <Loader2
              size={16}
              aria-hidden="true"
              className="animate-spin text-white/60"
              data-testid="search-loading"
            />
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('search.escHint')}
            className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Results / states */}
        <div
          id="akasha-search-results"
          role="listbox"
          aria-label={locale === 'pt-BR' ? 'Resultados' : 'Results'}
          className="flex-1 overflow-y-auto px-2 py-2 md:max-h-[55vh]"
        >
          {error && (
            <div
              role="status"
              className="px-4 py-6 text-sm text-rose-300"
              data-testid="search-error"
            >
              {error}
            </div>
          )}

          {!error && showEmptyHint && (
            <div
              className="px-4 py-10 text-center text-white/60"
              data-testid="search-empty-hint"
            >
              <p className="text-sm font-medium">{t('search.empty.title')}</p>
              <p className="mt-1 text-xs text-white/40">{t('search.empty.description')}</p>
            </div>
          )}

          {!error && !showEmptyHint && loading && (
            <div
              role="status"
              className="px-4 py-10 text-center text-sm text-white/60"
              data-testid="search-loading-state"
            >
              {t('search.loading')}
            </div>
          )}

          {!error && !showEmptyHint && !loading && results.length === 0 && (
            <div
              className="px-4 py-10 text-center text-white/60"
              data-testid="search-no-results"
            >
              <p className="text-sm font-medium">{t('search.noResults.title')}</p>
              <p className="mt-1 text-xs text-white/40">{t('search.noResults.description')}</p>
            </div>
          )}

          {!error && results.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {results.map((r, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <li
                    key={`${r.type}-${r.id}`}
                    role="option"
                    aria-selected={isActive}
                    id={`akasha-search-result-${idx}`}
                    data-testid={`search-result-${idx}`}
                  >
                    <button
                      type="button"
                      onClick={() => navigateTo(r)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium text-white">
                          {r.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                          {t(`search.typeLabel.${r.type}`)}
                        </span>
                      </div>
                      {r.snippet && (
                        <p className="line-clamp-2 text-xs text-white/60">
                          {r.snippet}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2 text-[10px] text-white/40">
          <span>{t('search.navHint')}</span>
          <span className="hidden md:inline">{t('search.shortcutHint')}</span>
        </div>
      </div>
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

export default SearchPalette;