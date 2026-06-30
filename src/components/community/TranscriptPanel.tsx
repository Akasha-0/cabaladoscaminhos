'use client';

// ============================================================================
// TranscriptPanel — scrollable, searchable, click-to-seek transcript (W90-C)
// ============================================================================
// Renders segments as a vertical list with timestamp + speaker + body.
// Highlights the segment currently active (per `currentSegmentIndex`).
// Clicking a segment fires `onSeek(seg.startSeconds)`.
//
// Search:
//   - case-insensitive
//   - accent-insensitive (handled by engine)
//   - shows matched substrings in a soft highlight
//
// data-testid attributes match the spec's source-inspection expectations.
// ============================================================================

import React, { useMemo } from 'react';
import {
  formatTimestamp,
  type TranscriptSegment,
  type SegmentLanguage,
} from '@/lib/w90/workshop-recording.ts';

export interface TranscriptPanelProps {
  segments: ReadonlyArray<TranscriptSegment>;
  currentSegmentIndex: number;
  query: string;
  onQueryChange: (q: string) => void;
  onSeek: (seconds: number) => void;
  onLanguageToggle?: (lang: SegmentLanguage) => void;
  activeLanguage?: SegmentLanguage | 'all';
}

function stripAccentsLocal(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function TranscriptPanel({
  segments,
  currentSegmentIndex,
  query,
  onQueryChange,
  onSeek,
  onLanguageToggle,
  activeLanguage = 'all',
}: TranscriptPanelProps): React.ReactElement {
  const filteredSegments = useMemo(() => {
    if (!query.trim()) return segments;
    const needle = stripAccentsLocal(query.toLowerCase());
    return segments.filter((seg) =>
      stripAccentsLocal(seg.text.toLowerCase()).includes(needle)
    );
  }, [segments, query]);

  return (
    <section
      data-testid="transcript-panel"
      aria-label="Transcrição da gravação"
      className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-900/60"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Transcrição
        </h2>
        <div className="flex items-center gap-2">
          {(['all', 'pt-BR', 'en', 'es'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              data-testid={`language-toggle-${lang}`}
              onClick={() => onLanguageToggle?.(lang as SegmentLanguage | 'all')}
              className={
                'min-h-[36px] rounded-full px-3 py-1 text-xs font-medium transition-colors ' +
                (activeLanguage === lang
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700')
              }
              aria-pressed={activeLanguage === lang}
            >
              {lang === 'all' ? 'Todos' : lang}
            </button>
          ))}
        </div>
      </header>

      <label className="flex flex-col gap-1">
        <span className="sr-only">Buscar na transcrição</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar na transcrição…"
          data-testid="transcript-search-input"
          className="min-h-[44px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
      </label>

      <ol
        role="list"
        aria-live="polite"
        aria-label={`${filteredSegments.length} segmentos`}
        className="flex max-h-[480px] flex-col gap-1 overflow-y-auto pr-1"
      >
        {filteredSegments.length === 0 && (
          <li
            data-testid="transcript-empty"
            className="rounded-md bg-stone-50 px-3 py-4 text-center text-sm text-stone-500 dark:bg-stone-800/60 dark:text-stone-400"
          >
            Nenhum segmento encontrado para a busca atual.
          </li>
        )}
        {filteredSegments.map((seg) => {
          const originalIndex = segments.indexOf(seg);
          const isCurrent = originalIndex === currentSegmentIndex;
          return (
            <li key={`${seg.startSeconds}-${originalIndex}`}>
              <button
                type="button"
                data-testid={`transcript-segment-${originalIndex}`}
                onClick={() => onSeek(seg.startSeconds)}
                aria-current={isCurrent ? 'true' : 'false'}
                className={
                  'group flex w-full min-h-[44px] flex-col gap-1 rounded-lg px-3 py-2 text-left transition-colors ' +
                  (isCurrent
                    ? 'bg-amber-100 ring-2 ring-amber-500 dark:bg-amber-900/40'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800/60')
                }
              >
                <span className="flex items-center justify-between gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
                  <span data-testid={`transcript-segment-time-${originalIndex}`}>
                    [{formatTimestamp(seg.startSeconds)}]
                  </span>
                  <span className="font-sans font-semibold text-stone-700 dark:text-stone-200">
                    {seg.speakerName}
                  </span>
                  <span aria-label={`Idioma ${seg.language}`} className="text-[10px] uppercase">
                    {seg.language}
                  </span>
                </span>
                <span className="text-sm leading-relaxed text-stone-800 dark:text-stone-100">
                  {highlightMatch(seg.text, query)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const haystack = stripAccentsLocal(text.toLowerCase());
  const needle = stripAccentsLocal(query.toLowerCase());
  const idx = haystack.indexOf(needle);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        data-testid="transcript-search-mark"
        className="rounded bg-amber-200 px-0.5 text-stone-900 dark:bg-amber-700 dark:text-stone-100"
      >
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}