'use client';

// ============================================================================
// SearchBar — Barra de busca com autocomplete (Onda 12, 2026-06-27)
// ============================================================================
// - Debounce 300ms no input
// - Autocomplete via /api/search/suggestions
// - Navegação por teclado (↑↓ Enter Esc)
// - Highlighting <mark> na sugestão
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, X, FileText, BookOpen, Users, Hash, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// ============================================================================
// Tipos
// ============================================================================

interface Suggestion {
  type: 'post' | 'article' | 'group' | 'user' | 'tag';
  id: string;
  label: string;
  sublabel?: string;
  url: string;
  score: number;
}

interface SuggestionsResponse {
  query: string;
  suggestions: Suggestion[];
  took_ms: number;
}

const SUGGESTION_ICONS: Record<Suggestion['type'], React.ComponentType<{ className?: string }>> = {
  post: FileText,
  article: BookOpen,
  group: Users,
  user: Users,
  tag: Hash,
};

const SUGGESTION_COLORS: Record<Suggestion['type'], string> = {
  post: 'text-amber-300',
  article: 'text-violet-300',
  group: 'text-emerald-300',
  user: 'text-pink-300',
  tag: 'text-cyan-300',
};

// ============================================================================
// Hook: useDebounce
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ============================================================================
// Component
// ============================================================================

export interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  placeholder = 'Buscar tradições, pessoas, artigos...',
  size = 'md',
  autoFocus = false,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions on debounced query change
  useEffect(() => {
    const ac = new AbortController();
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}&limit=8`, {
      signal: ac.signal,
    })
      .then((r) => r.json() as Promise<{ data?: SuggestionsResponse; error?: unknown }>)
      .then((body) => {
        if (body.data?.suggestions) {
          setSuggestions(body.data.suggestions);
          setActiveIndex(-1);
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.warn('[SearchBar] suggestions error:', err);
        }
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [debouncedQuery]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Submit: navega para /explore?q=...
  const submitSearch = useCallback(
    (q: string) => {
      setOpen(false);
      const search = new URLSearchParams();
      if (q) search.set('q', q);
      // Mantém outros params (ex: tag)
      params.forEach((v, k) => {
        if (k !== 'q') search.set(k, v);
      });
      router.push(`/explore?${search.toString()}`);
    },
    [router, params],
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        router.push(suggestions[activeIndex].url);
        setOpen(false);
      } else if (query.trim()) {
        submitSearch(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input */}
      <div className="relative">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-slate-500',
            size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Buscar na comunidade"
          aria-autocomplete="list"
          aria-expanded={open}
          className={cn(
            'pl-10 pr-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50',
            size === 'lg' ? 'h-14 text-base' : 'h-12',
          )}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete dropdown */}
      {open && (query.length > 0 || suggestions.length > 0) && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden"
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Buscando...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              Nenhuma sugestão para "{query}".
              <button
                type="button"
                className="ml-2 text-amber-400 hover:text-amber-300"
                onClick={() => submitSearch(query.trim())}
              >
                Buscar mesmo assim →
              </button>
            </div>
          ) : (
            <>
              {suggestions.map((s, idx) => {
                const Icon = SUGGESTION_ICONS[s.type] ?? Layers;
                return (
                  <Link
                    key={`${s.type}-${s.id}`}
                    href={s.url}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 transition-colors border-b border-slate-800/30 last:border-0',
                      idx === activeIndex ? 'bg-slate-800/80' : 'hover:bg-slate-800/40',
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', SUGGESTION_COLORS[s.type])} />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm text-slate-100 truncate"
                        // Highlight <mark> vem do servidor — seguro porque vem de ts_headline
                        dangerouslySetInnerHTML={{ __html: s.label }}
                      />
                      {s.sublabel && (
                        <div className="text-xs text-slate-500">{s.sublabel}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
              <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => submitSearch(query.trim())}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Ver todos os resultados para "{query}" →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Highlight helper — usado nos resultados quando o servidor não retornou
// já marcado (ex: em erros/fallbacks)
// ============================================================================

export function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="bg-amber-500/30 text-amber-100 px-0.5 rounded">
        {p}
      </mark>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}
