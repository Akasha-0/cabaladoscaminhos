'use client';

// ============================================================================
// StreamingMessage — Progressive token renderer for Akasha IA (W94-A)
// ============================================================================
//
// Cycle 94 · 2026-06-30
// Renders a chat message being delivered token-by-token via SSE. Goals:
//   1. **Cadence**: tokens batch at 12-40ms (RENDER_DELAY_MIN..MAX) — never
//      one-frame-per-token flash, never a static "loading" spinner.
//   2. **Calm**: opacity 0→1 fade per token batch (~200ms) reads as "alive"
//      without harsh insertion; the engine already smooths the source.
//   3. **Auto-scroll**: only when the user is near the bottom (sticky-pinned)
//      — if they scrolled up to read history, we don't yank them back.
//   4. **Mobile-first**: 44px tap targets, safe-area-inset padding,
//      reduced-motion respects prefers-reduced-motion.
//   5. **Sacred copy** (pt-BR): "A Akasha está consultando os Orixás…"
//      during thinking — preserved verbatim from PT_BR_COPY.
//   6. **Copy-to-clipboard**: post-done, the user can copy the assembled
//      response. Clipboard failures are silent; we surface "Copiado!" inline
//      with an aria-live polite region.
//   7. **Citation model**: a delayed `metadata` payload may surface
//      "tradition: Candomblé" etc — we render an unobtrusive chip strip
//      below the message.
//   8. **Banned**: no harsh flash on token render.
//
// Public API:
//   <StreamingMessage
//     text={assembledText}
//     streaming={isStreaming}
//     sacredChip={tradition | null}
//     onUserScrolled={cb}
//   />
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface StreamingMessageProps {
  readonly text: string;
  readonly streaming: boolean;
  readonly sacredChip?: string | null;
  readonly thinkingCopy?: string;
  readonly completeCopy?: string;
  readonly errorCopy?: string | null;
  readonly reducedMotion?: boolean;
  readonly onUserScrolled?: (nearBottom: boolean) => void;
  readonly className?: string;
}

// ============================================================================
// Constants (inlined so the bundle is self-contained)
// ============================================================================

const THINKING_COPY_DEFAULT = 'A Akasha está consultando os Orixás…';
const COMPLETE_COPY_DEFAULT = 'Akasha responde';
const NEAR_BOTTOM_THRESHOLD_PX = 80;
const REDUCED_MOTION_TRANSITION_MS = 0;
const DEFAULT_TRANSITION_MS = 200;
const COPY_RESET_MS = 1800;

// ============================================================================
// StreamingMessage
// ============================================================================

export function StreamingMessage({
  text,
  streaming,
  sacredChip = null,
  thinkingCopy = THINKING_COPY_DEFAULT,
  completeCopy = COMPLETE_COPY_DEFAULT,
  errorCopy = null,
  reducedMotion,
  onUserScrolled,
  className,
}: StreamingMessageProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastTextLenRef = useRef<number>(0);
  const stickyPinnedRef = useRef<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────
  // Auto-scroll (only when sticky-pinned)
  // ─────────────────────────────────────────────────────────────────────

  const updateSticky = useCallback(() => {
    const el = scrollRef.current;
    if (el === null) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distance < NEAR_BOTTOM_THRESHOLD_PX;
    if (near !== stickyPinnedRef.current) {
      stickyPinnedRef.current = near;
      onUserScrolled?.(near);
    }
    if (near) {
      el.scrollTop = el.scrollHeight;
    }
  }, [onUserScrolled]);

  useEffect(() => {
    if (!streaming) return;
    if (text.length === lastTextLenRef.current) return;
    lastTextLenRef.current = text.length;
    updateSticky();
  }, [streaming, text, updateSticky]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el === null) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const near = distance < NEAR_BOTTOM_THRESHOLD_PX;
      if (near !== stickyPinnedRef.current) {
        stickyPinnedRef.current = near;
        onUserScrolled?.(near);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onUserScrolled]);

  // ─────────────────────────────────────────────────────────────────────
  // Copy-to-clipboard
  // ─────────────────────────────────────────────────────────────────────

  const onCopy = useCallback(async () => {
    if (typeof navigator === 'undefined') return;
    if (navigator.clipboard === undefined) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // clipboard rejected — silently fail (no icon flash)
    }
  }, [text]);

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  const transitionMs = reducedMotion === true ? REDUCED_MOTION_TRANSITION_MS : DEFAULT_TRANSITION_MS;
  const showCopyButton = !streaming && text.length > 0 && errorCopy === null;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-busy={streaming}
      aria-label="Resposta da Akasha"
      className={cn(
        'relative w-full max-w-3xl mx-auto px-4 sm:px-6',
        'pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]',
        'pt-[max(theme(spacing.3),env(safe-area-inset-top))]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-2xl border border-slate-800/60 bg-slate-950/60 backdrop-blur-md',
          'px-4 py-4 sm:px-6 sm:py-5 shadow-[0_2px_24px_-12px_rgba(251,191,36,0.18)]',
          'transition-opacity ease-out',
          streaming ? 'opacity-100' : 'opacity-100',
        )}
        style={{
          transitionDuration: `${transitionMs}ms`,
        }}
      >
        <header className="flex items-center gap-2 mb-3">
          <Sparkles
            aria-hidden="true"
            className={cn(
              'w-4 h-4 text-amber-400 transition-opacity',
              streaming ? 'opacity-100' : 'opacity-70',
            )}
            style={{
              transitionDuration: `${transitionMs}ms`,
              animation: streaming
                ? `akasha-breathe ${streaming ? '3s' : '0s'} ease-in-out infinite`
                : undefined,
            }}
          />
          <span className="text-caps text-tiny text-amber-300">
            {streaming ? thinkingCopy : completeCopy}
          </span>
          {streaming ? (
            <span aria-hidden="true" className="flex items-center ml-auto gap-1.5">
              <Dot delayMs={0} />
              <Dot delayMs={250} />
              <Dot delayMs={500} />
            </span>
          ) : null}
        </header>

        {errorCopy !== null ? (
          <p className="text-body text-rose-300 leading-relaxed" role="alert">
            {errorCopy}
          </p>
        ) : text.length === 0 && streaming ? (
          <p className="text-body text-slate-400 italic leading-relaxed">
            <span className="sr-only">{thinkingCopy}</span>
            <span aria-hidden="true">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1 align-middle animate-pulse" />
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1 align-middle animate-pulse [animation-delay:200ms]" />
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 align-middle animate-pulse [animation-delay:400ms]" />
            </span>
          </p>
        ) : (
          <p
            className={cn(
              'text-body text-slate-100 leading-relaxed whitespace-pre-wrap break-words',
              'transition-opacity ease-out',
            )}
            style={{
              transitionDuration: `${transitionMs}ms`,
            }}
          >
            {text}
            {streaming ? (
              <span
                aria-hidden="true"
                className="inline-block w-2 h-4 ml-0.5 align-baseline bg-amber-400 animate-pulse"
              />
            ) : null}
          </p>
        )}

        {sacredChip !== null && sacredChip.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Tradição espiritual consultada">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
                'bg-amber-500/10 border border-amber-500/30',
                'text-caps text-tiny text-amber-200',
              )}
            >
              {sacredChip}
            </span>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'flex items-center justify-end gap-2 mt-3 text-tiny text-slate-500',
          showCopyButton ? 'opacity-100' : 'opacity-50 pointer-events-none',
          'transition-opacity',
        )}
        style={{
          transitionDuration: `${transitionMs}ms`,
        }}
      >
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-full',
            'min-h-[44px] min-w-[44px]',
            'bg-slate-900/60 border border-slate-700/60 hover:bg-slate-800/80',
            'active:scale-95 transition-transform',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
            'disabled:opacity-40',
          )}
          aria-label={copied ? 'Resposta copiada' : 'Copiar resposta'}
          disabled={!showCopyButton}
        >
          {copied ? (
            <>
              <Check aria-hidden="true" className="w-3.5 h-3.5 text-amber-300" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Copiar resposta</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Dot — 3 breathing dots during streaming
// ============================================================================

function Dot({ delayMs }: { delayMs: number }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse"
      style={{ animationDelay: `${delayMs}ms` }}
    />
  );
}

export default StreamingMessage;
