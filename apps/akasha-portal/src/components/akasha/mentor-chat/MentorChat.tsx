'use client';

/**
 * MentorChat — Wave 10.4 Mentor Chat UX
 *
 * Redesigned conversational surface for the Akasha Mentor. Replaces the
 * old form-like UX (textarea + send) with:
 *
 *   - Streaming response with **typewriter effect** (per-chunk reveal
 *     + blinking caret).
 *   - **Tool indicator chips** showing which Akasha tools fired (the
 *     client mirrors the Wave 9.3 emotion → tools map locally so the
 *     user sees what was queried before the LLM responds).
 *   - **Suggestion chips** keyed off the user's emotional state
 *     (Wave 9.1 `useEmotionalState` hook) — the chips swap when the
 *     user changes their state.
 *   - **Credit counter** pill in the header — fetched from
 *     `/api/akasha/credits` on mount and decremented optimistically
 *     after each successful response.
 *   - **Empty state** with 4 starter questions when the conversation
 *     is fresh — Gabriel's "vou ter que ficar procurando" frustration.
 *   - **Error state** with retry that distinguishes 402 (no credits),
 *     429 (rate limit) and 5xx/network failures.
 *
 * Backend untouched: still POSTs to `/api/mentor/ask` with `text/event-stream`
 * and streams chunks. We just present them better.
 *
 * Mobile-first: viewport-filling layout, sticky bottom input, safe-area
 * insets via env(safe-area-inset-bottom), auto-scroll on stream.
 *
 * Constraint compliance (Wave 10 plan):
 *   - NÃO toca em /api/mentor/ask (read-only consumer).
 *   - NÃO toca em packages/mentor/src/intent-detector.ts ou tool-dispatcher.ts
 *     — apenas importa EMOTION_TOOLS para mostrar ao usuário.
 *   - Usa framer-motion (já instalado, mesmo padrão de StatePicker).
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  AlertCircle,
  Coins,
  RotateCcw,
  Square,
  Wand2,
  Wind,
  Compass,
  Sprout,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { useTranslation } from '@/i18n';
import {
  EMOTION_TOOLS,
} from '@akasha/mentor/tool-dispatcher';
import { useEmotionalState } from '@/lib/state/emotional-state';
import {
  MessageRating,
  type FeedbackRating as RatingValue,
} from './MessageRating';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MentorChatProps {
  /** Locale used for translations (defaults to pt-BR via useTranslation). */
  locale?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  /** When the mentor message was first started streaming (ms epoch). */
  startedAt?: number;
  /** When the streaming completed (ms epoch). */
  completedAt?: number;
  /** Tools that the backend was expected to dispatch for this turn. */
  toolsDispatched?: string[];
}

type StreamStatus = 'idle' | 'streaming' | 'error';

interface ErrorInfo {
  kind: 'no-credits' | 'rate-limit' | 'network' | 'generic';
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tools surfaced to the user when their emotional state matches.
 * The backend uses the same EMOTION_TOOLS map (Wave 9.3 commit 2); we
 * mirror it client-side purely for UX feedback. We do NOT modify the
 * dispatcher — we just read its public export.
 */
const TOOL_DISPLAY: Record<string, { icon: typeof Sparkles; labelKey: string }> = {
  'akasha.calculate_code_of_day': { icon: Sparkles, labelKey: 'toolIndicator.calculating' },
  'akasha.build_ritual': { icon: Wand2, labelKey: 'toolIndicator.ritual' },
  'akasha.find_correlations': { icon: Compass, labelKey: 'toolIndicator.correlations' },
  'akasha.interpretar_vida': { icon: Sprout, labelKey: 'toolIndicator.interpretando' },
  'mentor.list_tools': { icon: Wind, labelKey: 'toolIndicator.tools' },
};

/** Characters per second for the typewriter reveal. Server typically
 * yields chunks of 1-4 chars; we treat each chunk as one "tick". */
const TYPEWRITER_TICK_MS = 18;

/** Credits below this count trigger a warning style on the counter. */
const LOW_CREDIT_THRESHOLD = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Plurals helper — {count} crédito | {count} créditos
// Mirrors the i18n pipe `|` separator used in messages JSON.
// ─────────────────────────────────────────────────────────────────────────────

function pluralize(template: string, count: number): string {
  const [singular, plural] = template.split('|').map((s) => s.trim());
  return count === 1 ? singular : plural;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MentorChat({ locale: _locale }: MentorChatProps) {
  const { t } = useTranslation();
  const { state: emotion, hydrated } = useEmotionalState();

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  // Wave 13.5 — Feedback toast (transient, auto-dismiss em 3s).
  // Diferente do errorInfo (que é banner inline de erro de streaming),
  // este toast é para confirmação de feedback enviado ou erro do POST
  // /api/feedback (roll-back do widget).
  const [feedbackToast, setFeedbackToast] = useState<
    { kind: 'success' | 'error'; message: string; key: number } | null
  >(null);
  const feedbackToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Credit counter
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoaded, setCreditsLoaded] = useState(false);

  // Auto-scroll ref
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  // Abort controller so we can stop a stream in-flight (Stop button).
  const abortRef = useRef<AbortController | null>(null);

  // ─── Fetch credit balance on mount + after every successful turn ───
  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/akasha/credits', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { balance?: number };
        if (typeof data.balance === 'number') {
          setCredits(data.balance);
        }
      }
    } catch {
      // Non-fatal: counter just stays in last-known state.
    } finally {
      setCreditsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // ─── Auto-scroll to bottom when messages change ───
  useEffect(() => {
    const node = scrollAnchorRef.current;
    if (!node) return;
    // Defer to next frame so the DOM has the new content.
    const id = requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, status]);

  // ─── Derived ───
  const noCredits = credits !== null && credits <= 0;
  const lowCredits = credits !== null && credits > 0 && credits <= LOW_CREDIT_THRESHOLD;
  const toolsForEmotion: string[] = useMemo(
    () => (emotion ? [...EMOTION_TOOLS[emotion]] : []),
    [emotion]
  );

  // ─── Send / Stop handlers ───
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  const handleSend = useCallback(
    async (questionOverride?: string) => {
      const question = (questionOverride ?? input).trim();
      if (!question || status === 'streaming' || noCredits) return;

      setErrorInfo(null);
      setInput('');

      // Optimistic append: user message + placeholder mentor message.
      const userMsgId = `user-${Date.now()}`;
      const mentorMsgId = `mentor-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: question,
        startedAt: Date.now(),
      };
      const mentorMsg: ChatMessage = {
        id: mentorMsgId,
        role: 'mentor',
        content: '',
        startedAt: Date.now(),
        toolsDispatched: toolsForEmotion,
      };
      setMessages((prev) => [...prev, userMsg, mentorMsg]);
      setStatus('streaming');

      // Abort controller for this turn
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/mentor/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Wave 9.3 commit 3 — pass emotional state via header as
            // fallback for clients that don't include it in the body.
            ...(emotion ? { 'x-akasha-state': emotion } : {}),
          },
          body: JSON.stringify({
            question,
            sessionHistory: messages
              .filter((m) => m.content.length > 0)
              .map((m) => ({ role: m.role, content: m.content })),
            ...(emotion ? { emotionalState: emotion } : {}),
          }),
          signal: controller.signal,
        });

        // ── Error handling ────────────────────────────────────────────
        if (!res.ok) {
          if (res.status === 402) {
            setErrorInfo({
              kind: 'no-credits',
              message: t('mentor.chat.error.noCredits'),
            });
            setCredits(0);
          } else if (res.status === 429) {
            setErrorInfo({
              kind: 'rate-limit',
              message: t('mentor.chat.error.rateLimit'),
            });
          } else if (res.status >= 500) {
            setErrorInfo({
              kind: 'generic',
              message: t('mentor.chat.error.generic'),
            });
          } else {
            // 4xx other than 402/429 — try to read the error payload.
            const payload = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            setErrorInfo({
              kind: 'generic',
              message:
                payload.error ?? t('mentor.chat.error.generic'),
            });
          }
          // Roll back the placeholder mentor message on error so the
          // user doesn't see an empty bubble.
          setMessages((prev) => prev.filter((m) => m.id !== mentorMsgId));
          setStatus('idle');
          return;
        }

        // ── Streaming read ────────────────────────────────────────────
        if (!res.body) {
          throw new Error('No response body');
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        // Buffer chunk by chunk; each yield from the backend is already
        // a small text fragment so we just append.
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          // Reveal character-by-character via a microtask, with a blink
          // caret driven by CSS in TypewriterText.
          setMessages((prev) =>
            prev.map((m) =>
              m.id === mentorMsgId ? { ...m, content: accumulated } : m
            )
          );
        }

        // ── Done: mark complete + refresh credits ─────────────────────
        setMessages((prev) =>
          prev.map((m) =>
            m.id === mentorMsgId
              ? { ...m, completedAt: Date.now(), content: accumulated }
              : m
          )
        );
        setStatus('idle');
        fetchCredits();
      } catch (err) {
        if (controller.signal.aborted) {
          // User clicked Stop — keep whatever was streamed so far.
          setMessages((prev) =>
            prev.map((m) =>
              m.id === mentorMsgId
                ? { ...m, completedAt: Date.now() }
                : m
            )
          );
          setStatus('idle');
          return;
        }
        const message =
          err instanceof TypeError
            ? t('mentor.chat.error.network')
            : t('mentor.chat.error.generic');
        setErrorInfo({ kind: 'network', message });
        setMessages((prev) => prev.filter((m) => m.id !== mentorMsgId));
        setStatus('idle');
      } finally {
        abortRef.current = null;
      }
    },
    [input, status, noCredits, emotion, messages, toolsForEmotion, t, fetchCredits]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSend();
  };

  // ─── Retry last failed send ───
  const handleRetry = useCallback(() => {
    setErrorInfo(null);
    // Re-send the most recent user message.
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      // Pop the user message and re-send it.
      setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
      void handleSend(lastUser.content);
    }
  }, [messages, handleSend]);

  // ─── Wave 13.5 — Feedback handlers (toast feedback) ───
  // Auto-dismiss após 3s. O timer é resetado se um novo toast chegar
  // (key monotonic).
  const handleFeedbackThanks = useCallback(
    (_rating: RatingValue) => {
      if (feedbackToastTimerRef.current) {
        clearTimeout(feedbackToastTimerRef.current);
      }
      setFeedbackToast({
        kind: 'success',
        message: t('feedback.thanks'),
        key: Date.now(),
      });
      feedbackToastTimerRef.current = setTimeout(() => {
        setFeedbackToast(null);
        feedbackToastTimerRef.current = null;
      }, 3000);
    },
    [t]
  );

  const handleFeedbackError = useCallback(
    (errMsg: string) => {
      if (feedbackToastTimerRef.current) {
        clearTimeout(feedbackToastTimerRef.current);
      }
      setFeedbackToast({
        kind: 'error',
        message: `${t('feedback.error')}: ${errMsg}`,
        key: Date.now(),
      });
      feedbackToastTimerRef.current = setTimeout(() => {
        setFeedbackToast(null);
        feedbackToastTimerRef.current = null;
      }, 4000);
    },
    [t]
  );

  // Cleanup do timer no unmount.
  useEffect(() => {
    return () => {
      if (feedbackToastTimerRef.current) {
        clearTimeout(feedbackToastTimerRef.current);
      }
    };
  }, []);

  // ─── Render ───
  const isEmpty = messages.length === 0 && status === 'idle';

  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #06070F 0%, #0B0E1C 100%)',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
      data-testid="mentor-chat"
    >
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-md"
        style={{ background: 'rgba(6,7,15,0.85)' }}
        data-testid="mentor-chat-header"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  'linear-gradient(135deg, rgba(124,92,255,0.35) 0%, rgba(167,139,250,0.18) 100%)',
                border: '1px solid rgba(167,139,250,0.4)',
                boxShadow: '0 0 18px -6px rgba(167,139,250,0.55)',
              }}
            >
              <Sparkles size={16} className="text-violet-200" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white leading-tight m-0">
                {t('mentor.chat.title')}
              </h1>
              <p className="truncate text-[11px] text-white/55 leading-tight m-0">
                {t('mentor.chat.subtitle')}
              </p>
            </div>
          </div>

          {/* Credit counter pill */}
          <CreditPill
            credits={credits}
            loaded={creditsLoaded}
            low={lowCredits}
            empty={noCredits}
          />
        </div>
      </header>

      {/* ─── Conversation surface ───────────────────────────────── */}
      <section
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        data-testid="mentor-chat-conversation"
      >
        {/* Pre-hydration skeleton — same height pattern as MeuDiaHub */}
        {!hydrated && (
          <div
            className="rounded-3xl border border-white/10 bg-white/[0.02] animate-pulse"
            style={{ height: 280 }}
            data-testid="mentor-chat-skeleton"
          />
        )}

        {hydrated && isEmpty && (
          <EmptyState
            t={t}
            onSelect={(q) => {
              void handleSend(q);
            }}
          />
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              t={t}
              isStreaming={
                msg.role === 'mentor' &&
                status === 'streaming' &&
                !msg.completedAt
              }
              onFeedbackThanks={handleFeedbackThanks}
              onFeedbackError={handleFeedbackError}
            />
          ))}
        </AnimatePresence>

        {/* Error banner */}
        {errorInfo && (
          <ErrorBanner info={errorInfo} onRetry={handleRetry} t={t} />
        )}

        {/* Suggestion chips — only once conversation has started and we
            know the user's emotional state. Empty state covers the
            pre-first-send case with starter questions. */}
        {!isEmpty && emotion && (
          <SuggestionChips
            emotion={emotion}
            t={t}
            disabled={status === 'streaming' || noCredits}
            onSelect={(q) => {
              void handleSend(q);
            }}
          />
        )}

        {/* Anchor for auto-scroll */}
        <div ref={scrollAnchorRef} aria-hidden style={{ height: 1 }} />
      </section>

      {/* ─── Sticky input bar ───────────────────────────────────── */}
      <footer
        className="sticky bottom-0 z-20 border-t border-white/10 backdrop-blur-md"
        style={{
          background: 'rgba(6,7,15,0.92)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        data-testid="mentor-chat-inputbar"
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-2xl items-end gap-2 px-4 py-3"
        >
          <label htmlFor="mentor-input" className="sr-only">
            {noCredits
              ? t('mentor.chat.inputPlaceholderNoCredits')
              : t('mentor.chat.inputPlaceholder')}
          </label>
          <textarea
            id="mentor-input"
            data-testid="mentor-chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              noCredits
                ? t('mentor.chat.inputPlaceholderNoCredits')
                : t('mentor.chat.inputPlaceholder')
            }
            disabled={noCredits || status === 'streaming'}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            className="flex-1 resize-none rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50"
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          {status === 'streaming' ? (
            <button
              type="button"
              onClick={handleStop}
              aria-label={t('mentor.chat.stop')}
              data-testid="mentor-chat-stop"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition"
            >
              <Square size={14} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label={t('mentor.chat.send')}
              disabled={noCredits || input.trim().length === 0}
              data-testid="mentor-chat-send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
              style={{
                background:
                  'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
                boxShadow:
                  '0 0 18px -4px rgba(167,139,250,0.7), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <Send size={15} aria-hidden />
            </button>
          )}
        </form>
      </footer>

      {/* ─── Wave 13.5 — Feedback toast (transient) ─────────────── */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            key={feedbackToast.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role={feedbackToast.kind === 'error' ? 'alert' : 'status'}
            aria-live={feedbackToast.kind === 'error' ? 'assertive' : 'polite'}
            data-testid="mentor-chat-feedback-toast"
            data-toast-kind={feedbackToast.kind}
            className="pointer-events-none fixed inset-x-0 z-30 flex justify-center"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
            }}
          >
            <div
              className={[
                'pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md',
                'text-xs font-semibold shadow-lg',
                feedbackToast.kind === 'success'
                  ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                  : 'border border-rose-400/40 bg-rose-500/15 text-rose-100',
              ].join(' ')}
            >
              {feedbackToast.kind === 'success' ? (
                <CheckCircle2 size={14} aria-hidden />
              ) : (
                <XCircle size={14} aria-hidden />
              )}
              <span>{feedbackToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default MentorChat;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface CreditPillProps {
  credits: number | null;
  loaded: boolean;
  low: boolean;
  empty: boolean;
}

function CreditPill({ credits, loaded, low, empty }: CreditPillProps) {
  const { t } = useTranslation();
  const label = useMemo(() => {
    if (!loaded) return '—';
    if (credits === null) return '—';
    if (credits <= 0) return t('mentor.chat.creditCounterZero');
    if (low) {
      return pluralize(t('mentor.chat.creditLowWarning'), credits).replace(
        '{count}',
        String(credits)
      );
    }
    return pluralize(t('mentor.chat.creditCounter'), credits).replace(
      '{count}',
      String(credits)
    );
  }, [credits, loaded, low, t]);

  const tone = empty
    ? 'rgba(239,68,68,0.18)' // red
    : low
      ? 'rgba(251,191,36,0.18)' // amber
      : 'rgba(124,92,255,0.18)'; // violet

  const border = empty
    ? 'rgba(239,68,68,0.4)'
    : low
      ? 'rgba(251,191,36,0.4)'
      : 'rgba(124,92,255,0.4)';

  const text = empty
    ? 'rgb(252,165,165)'
    : low
      ? 'rgb(252,211,77)'
      : 'rgb(196,181,253)';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid="mentor-chat-credit-pill"
      className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tabular-nums"
      style={{
        background: tone,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      <Coins size={12} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  t: (key: string) => string;
  onSelect: (question: string) => void;
}

function EmptyState({ t, onSelect }: EmptyStateProps) {
  const starters = useMemo<string[]>(() => {
    const raw = t('mentor.chat.starterQuestions');
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === 'string');
      }
    } catch {
      // not JSON → falls through to empty list (the JSON has the real strings)
    }
    return [];
  }, [t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 p-6 text-center"
      style={{
        background:
          'linear-gradient(145deg, rgba(28,28,30,0.85) 0%, rgba(20,20,22,0.92) 100%)',
      }}
      data-testid="mentor-chat-empty"
    >
      <div
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.3) 0%, rgba(167,139,250,0.15) 100%)',
          border: '1px solid rgba(167,139,250,0.4)',
          boxShadow: '0 0 24px -8px rgba(167,139,250,0.6)',
        }}
      >
        <Sparkles size={24} className="text-violet-200" />
      </div>
      <div>
        <h2 className="text-base font-bold text-white m-0">
          {t('mentor.chat.emptyHeading')}
        </h2>
        <p className="mt-1 text-xs text-white/55 m-0">
          {t('mentor.chat.emptySubheading')}
        </p>
      </div>
      <ul className="flex w-full flex-col gap-2 list-none p-0 m-0">
        {starters.map((q, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(q)}
              data-testid={`mentor-chat-starter-${i}`}
              className="w-full rounded-2xl border border-violet-400/20 bg-violet-400/5 px-4 py-3 text-left text-sm text-white/85 transition hover:border-violet-400/45 hover:bg-violet-400/10 active:scale-[0.99]"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  t: (key: string) => string;
  isStreaming: boolean;
  /** Wave 13.5 — feedback widget callbacks (only used for mentor messages). */
  onFeedbackThanks?: (rating: RatingValue) => void;
  onFeedbackError?: (message: string) => void;
}

function MessageBubble({
  message,
  t,
  isStreaming,
  onFeedbackThanks,
  onFeedbackError,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Tool indicator is shown only for mentor messages that haven't
  // finished streaming yet (i.e. dispatch is in flight).
  const showToolIndicator =
    !isUser &&
    isStreaming &&
    Array.isArray(message.toolsDispatched) &&
    message.toolsDispatched.length > 0;

  // Wave 13.5 — feedback widget aparece somente DEPOIS que a mensagem
  // do mentor terminou de streamar. Antes disso o usuário ainda está
  // lendo e não deve avaliar. Não aparece em mensagens do user.
  const showFeedbackWidget = !isUser && Boolean(message.completedAt);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
      data-testid={`mentor-chat-bubble-${message.role}`}
      data-message-id={message.id}
    >
      {showToolIndicator && (
        <ToolIndicator tools={message.toolsDispatched ?? []} t={t} />
      )}
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-2xl rounded-br-md bg-violet-500/20 text-white border border-violet-400/30'
            : 'rounded-2xl rounded-bl-md bg-white/[0.06] text-white/95 border border-white/10'
        }`}
        style={isUser ? { fontFamily: 'inherit' } : undefined}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <TypewriterText content={message.content} active={isStreaming} />
        )}
        {/* Screen reader companion: full text in a polite live region.
            The visible typewriter is decorative (aria-hidden) — the
            live region carries the canonical, untruncated content.
            aria-atomic=false so SRs announce only the diff between
            updates, not the whole buffer (which would be cacophony
            during streaming). aria-relevant="additions" tells AT
            that only new text needs announcing. */}
        {!isUser && (
          <span
            className="sr-only"
            aria-live="polite"
            aria-atomic="false"
            aria-relevant="additions"
            data-testid="mentor-chat-sr-stream"
          >
            {message.content}
          </span>
        )}
      </div>
      {showFeedbackWidget && (
        <MessageRating
          messageId={message.id}
          labels={{
            up: t('feedback.up'),
            down: t('feedback.down'),
            submitting: t('feedback.submitting'),
          }}
          onThanks={onFeedbackThanks}
          onError={onFeedbackError}
        />
      )}
    </motion.article>
  );
}

/**
 * TypewriterText — reveals `content` character-by-character with a
 * blinking caret at the end while `active` is true.
 *
 * Design notes:
 *   - We re-reveal whenever `content` grows (a new chunk arrived from
 *     the server). Once `active` flips to false we render the full text
 *     without animation so users can copy/paste and search.
 *   - Animation is implemented with a CSS keyframe (caret blink) +
 *     a useEffect-driven setTimeout per reveal step. Skipped via
 *     prefers-reduced-motion.
 *   - Yields to the event loop every tick so the UI thread stays
 *     responsive even on long responses.
 */
function TypewriterText({
  content,
  active,
}: {
  content: string;
  active: boolean;
}) {
  const [revealed, setRevealed] = useState(active ? '' : content);

  useEffect(() => {
    if (!active) {
      setRevealed(content);
      return;
    }
    // Honor reduced-motion: reveal instantly.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setRevealed(content);
      return;
    }
    setRevealed('');
    let cancelled = false;
    let i = 0;
    const step = () => {
      if (cancelled) return;
      i += 1;
      setRevealed(content.slice(0, i));
      if (i < content.length) {
        setTimeout(step, TYPEWRITER_TICK_MS);
      }
    };
    setTimeout(step, TYPEWRITER_TICK_MS);
    return () => {
      cancelled = true;
    };
  }, [content, active]);

  return (
    <span data-testid="mentor-chat-typewriter" aria-hidden="true">
      {revealed}
      {active && content.length > revealed.length && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-violet-300"
          style={{
            animation: 'akasha-caret 0.9s steps(2,start) infinite',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
      {/* Caret blink keyframes — injected once at module level */}
      <style>{caretKeyframes}</style>
    </span>
  );
}

const caretKeyframes = `@keyframes akasha-caret{0%,100%{opacity:1}50%{opacity:0}}`;

interface ToolIndicatorProps {
  tools: string[];
  t: (key: string) => string;
}

function ToolIndicator({ tools, t }: ToolIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-wrap items-center gap-1.5 px-1"
      role="status"
      aria-live="polite"
      data-testid="mentor-chat-tool-indicator"
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">
        {t('mentor.chat.toolIndicator.label')}
      </span>
      {tools.map((tool) => {
        const meta = TOOL_DISPLAY[tool];
        if (!meta) {
          return (
            <span
              key={tool}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/70"
            >
              {tool}
            </span>
          );
        }
        const Icon = meta.icon;
        return (
          <span
            key={tool}
            className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[10px] text-violet-100"
            data-tool={tool}
          >
            <Icon size={10} aria-hidden />
            <span>{t(`mentor.chat.${meta.labelKey}`)}</span>
          </span>
        );
      })}
    </motion.div>
  );
}

interface ErrorBannerProps {
  info: ErrorInfo;
  onRetry: () => void;
  t: (key: string) => string;
}

function ErrorBanner({ info, onRetry, t }: ErrorBannerProps) {
  const tone =
    info.kind === 'no-credits'
      ? { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.4)', text: 'rgb(252,165,165)' }
      : info.kind === 'rate-limit'
        ? { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.4)', text: 'rgb(252,211,77)' }
        : { bg: 'rgba(124,92,255,0.08)', border: 'rgba(124,92,255,0.4)', text: 'rgb(196,181,253)' };

  const retryable =
    info.kind === 'rate-limit' ||
    info.kind === 'network' ||
    info.kind === 'generic';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role="alert"
      className="flex items-start gap-3 rounded-2xl border px-4 py-3"
      style={{ background: tone.bg, borderColor: tone.border }}
      data-testid="mentor-chat-error"
      data-error-kind={info.kind}
    >
      <AlertCircle size={16} aria-hidden style={{ color: tone.text, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold m-0" style={{ color: tone.text }}>
          {t('mentor.chat.error.title')}
        </p>
        <p className="text-xs text-white/75 mt-0.5 m-0">{info.message}</p>
      </div>
      {retryable && (
        <button
          type="button"
          onClick={onRetry}
          aria-label={t('common.retry')}
          data-testid="mentor-chat-retry"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/[0.12] active:scale-95 transition"
        >
          <RotateCcw size={12} aria-hidden />
          {t('common.retry')}
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuggestionChips — context-aware quick prompts keyed off the user's
// emotional state (Wave 9.1).
//
// Reads `mentor.chat.suggestionChips.<emotion>` from i18n (array of
// strings). Falls back to a hardcoded PT-BR list if i18n returns the key
// itself or invalid JSON — keeps the surface functional even with a
// missing translation.
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionChipsProps {
  emotion: string;
  t: (key: string) => string;
  disabled: boolean;
  onSelect: (q: string) => void;
}

function SuggestionChips({ emotion, t, disabled, onSelect }: SuggestionChipsProps) {
  const chips = useMemo<string[]>(() => {
    const raw = t(`mentor.chat.suggestionChips.${emotion}`);
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((x): x is string => typeof x === 'string');
        if (filtered.length > 0) return filtered;
      }
    } catch {
      // not JSON → empty list (the JSON has the real chips)
    }
    return [];
  }, [emotion, t]);

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={t('mentor.chat.suggestionsAriaLabel')}
      data-testid="mentor-chat-suggestion-chips"
      data-emotion={emotion}
    >
      {chips.map((chip, i) => (
        <button
          key={`${emotion}-${i}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          data-testid={`mentor-chat-chip-${i}`}
          className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/85 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          {chip}
        </button>
      ))}
    </motion.div>
  );
}
