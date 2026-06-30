// ============================================================================
// src/components/akasha/chat-stream.tsx
// ============================================================================
// The main streaming chat component for the Akasha IA UI (Wave 72 — Worker C).
//
// This component is a *client-side orchestrator* — it owns the SSE
// connection, accumulates tokens/citations/tags into a single in-flight
// assistant message, and renders the conversation. It does NOT need a
// server-rendered counterpart: the chat page imports it as a client
// component (with `'use client'`).
//
// SSE contract (single-line JSON events, simple protocol):
//
//     data: {"type":"token","payload":{"content":"Hello"}}\n\n
//     data: {"type":"citation","payload":{...}}\n\n
//     data: {"type":"tag","payload":{"raw":"...","tag":{...}}}\n\n
//     data: {"type":"done","payload":{"tokens":42,"took_ms":1234}}\n\n
//     data: {"type":"error","payload":{"code":"...","message":"..."}}\n\n
//
// Why fetch + ReadableStream (not EventSource):
//   - EventSource only supports GET. The Akasha endpoint takes POST
//     because it sends a payload (message + filter + history).
//   - We get the same incremental token-by-token UX with no extra dep.
//
// A11y:
//   - `aria-live="polite"` on the message list region
//   - Ctrl+Enter to send, Esc to abort
//   - Input regains focus after send
//   - Scroll region uses `scroll-behavior: smooth` (CSS) on programmatic
//     scroll-to-bottom.
// ============================================================================

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Send, Loader2, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MessageBubble } from './message-bubble.tsx';
import { TraditionFilter } from './tradition-filter.tsx';
import { TypingCursor } from './typing-cursor.tsx';
import type {
  AkashaMessage,
  Citation,
  SacredTag,
  StreamEvent,
  Tradition,
} from '@/lib/akasha-ui/types.ts';

// ─── Props ──────────────────────────────────────────────────────────────────

export interface ChatStreamProps {
  /** API endpoint that emits the SSE protocol above. */
  endpoint?: string;
  /** Pre-selected tradition filter (chips). */
  initialFilter?: Tradition[];
  /** Optional placeholder for the composer. */
  placeholder?: string;
  /** Optional callback when a citation is clicked. */
  onCitationClick?: (citation: Citation) => void;
  /** Optional callback when a sacred tag is clicked. */
  onTagClick?: (tag: SacredTag) => void;
}

// ─── Hook-local state ───────────────────────────────────────────────────────

type Status = 'idle' | 'connecting' | 'streaming' | 'done' | 'error' | 'aborted';

interface ChatState {
  status: Status;
  /** Persisted, finalized messages. The "in-flight" assistant turn lives
   *  in `streamingDraft` and is replaced when the stream ends. */
  messages: AkashaMessage[];
  /** Live token accumulator for the in-flight assistant message. */
  streamingDraft: AkashaMessage | null;
  error: { code: string; message: string } | null;
}

const INITIAL_STATE: ChatState = {
  status: 'idle',
  messages: [],
  streamingDraft: null,
  error: null,
};

// ─── SSE parser ─────────────────────────────────────────────────────────────

/**
 * Splits the raw byte buffer into complete SSE events. Standard
 * Server-Sent Events: each event is `data: <json>\n\n`.
 *
 * Returns complete events and the leftover (incomplete) buffer for the
 * next chunk.
 */
function splitSseEvents(buffer: string): { events: string[]; rest: string } {
  const events: string[] = [];
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    // Find all `data:` lines and concatenate.
    const dataLines: string[] = [];
    for (const line of trimmed.split('\n')) {
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    }
    if (dataLines.length > 0) {
      events.push(dataLines.join('\n'));
    }
  }
  return { events, rest };
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ChatStream({
  endpoint = '/api/akashic/chat/stream',
  initialFilter = [],
  placeholder = 'Pergunte à Akasha… (ela cita papers, nunca prescreve)',
  onCitationClick,
  onTagClick,
}: ChatStreamProps): React.ReactElement {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<Tradition[]>(initialFilter);

  // Refs that survive re-renders without triggering them.
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
      inFlightRef.current = false;
    };
  }, []);

  // Auto-scroll to bottom when messages or streaming draft change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.streamingDraft?.content]);

  // Focus the input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ─── Stream a single user prompt ──────────────────────────────────────
  const runStream = useCallback(
    async (prompt: string) => {
      if (inFlightRef.current) return;
      const controller = new AbortController();
      abortRef.current = controller;
      inFlightRef.current = true;

      // Build the user message + a fresh assistant draft.
      const userMsg: AkashaMessage = {
        id: makeId('user'),
        role: 'user',
        content: prompt,
      };
      const draftId = makeId('assistant');
      const draft: AkashaMessage = {
        id: draftId,
        role: 'assistant',
        content: '',
        citations: [],
        tags: [],
      };

      if (!mountedRef.current) {
        controller.abort();
        inFlightRef.current = false;
        return;
      }

      setState((prev) => ({
        status: 'connecting',
        messages: [...prev.messages, userMsg],
        streamingDraft: draft,
        error: null,
      }));

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            traditions: filter,
            history: state.messages
              .filter((m) => !m.error && m.content)
              .slice(-20)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errBody: { error?: { code?: string; message?: string } } = {};
          try {
            errBody = await res.json();
          } catch {
            /* not JSON */
          }
          if (!mountedRef.current) return;
          setState((prev) => ({
            ...prev,
            status: 'error',
            streamingDraft: null,
            error: {
              code: errBody.error?.code ?? `HTTP_${res.status}`,
              message: errBody.error?.message ?? `Erro ${res.status}`,
            },
          }));
          return;
        }

        if (!res.body) {
          if (!mountedRef.current) return;
          setState((prev) => ({
            ...prev,
            status: 'error',
            streamingDraft: null,
            error: { code: 'EMPTY_STREAM', message: 'Resposta sem corpo' },
          }));
          return;
        }

        reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (mountedRef.current) {
          setState((prev) => ({ ...prev, status: 'streaming' }));
        }

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = splitSseEvents(buffer);
          buffer = rest;

          for (const data of events) {
            let ev: StreamEvent;
            try {
              ev = JSON.parse(data) as StreamEvent;
            } catch {
              continue;
            }
            if (!mountedRef.current) return;

            setState((prev) => {
              const draft = prev.streamingDraft;
              if (!draft) return prev;
              switch (ev.type) {
                case 'token': {
                  return {
                    ...prev,
                    streamingDraft: {
                      ...draft,
                      content: draft.content + ev.payload.content,
                    },
                  };
                }
                case 'citation': {
                  const next = [...(draft.citations ?? []), ev.payload];
                  return {
                    ...prev,
                    streamingDraft: { ...draft, citations: next },
                  };
                }
                case 'tag': {
                  const next = [...(draft.tags ?? []), ev.payload.tag];
                  return {
                    ...prev,
                    streamingDraft: { ...draft, tags: next },
                  };
                }
                case 'done': {
                  return {
                    ...prev,
                    status: 'done',
                    messages: [...prev.messages, { ...draft, meta: {
                      model: 'gpt-4o',
                      took_ms: ev.payload.took_ms,
                    } }],
                    streamingDraft: null,
                  };
                }
                case 'error': {
                  return {
                    ...prev,
                    status: 'error',
                    error: { code: ev.payload.code, message: ev.payload.message },
                    streamingDraft: null,
                  };
                }
                default: {
                  return prev;
                }
              }
            });
          }
        }

        // Stream ended without a `done` event — flush whatever we have.
        if (!mountedRef.current) return;
        setState((prev) => {
          if (prev.status === 'error' || prev.status === 'done' || prev.status === 'aborted') {
            return prev;
          }
          if (!prev.streamingDraft || prev.streamingDraft.content === '') {
            return {
              ...prev,
              status: 'error',
              error: { code: 'NO_TOKENS', message: 'A Akasha não retornou conteúdo.' },
              streamingDraft: null,
            };
          }
          return {
            ...prev,
            status: 'done',
            messages: [...prev.messages, prev.streamingDraft],
            streamingDraft: null,
          };
        });
      } catch (err) {
        if (!mountedRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            status: 'aborted',
            streamingDraft: null,
          }));
          return;
        }
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: { code: 'NETWORK_ERROR', message },
          streamingDraft: null,
        }));
      } finally {
        if (reader) {
          try { reader.releaseLock(); } catch { /* released */ }
        }
        inFlightRef.current = false;
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        // Return focus to the input.
        inputRef.current?.focus();
      }
    },
    [endpoint, filter, state.messages],
  );

  // ─── Public actions ──────────────────────────────────────────────────

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || inFlightRef.current) return;
    setInput('');
    void runStream(trimmed);
  }, [input, runStream]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    if (mountedRef.current) {
      setState((prev) => ({
        ...prev,
        status: 'aborted',
        streamingDraft: null,
      }));
    }
  }, []);

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setState(INITIAL_STATE);
    inputRef.current?.focus();
  }, []);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        send();
        return;
      }
      if (e.key === 'Escape') {
        if (inFlightRef.current) {
          e.preventDefault();
          abort();
        }
      }
    },
    [send, abort],
  );

  // ─── Render ──────────────────────────────────────────────────────────
  const isStreaming = state.status === 'connecting' || state.status === 'streaming';

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/20 ring-1 ring-amber-400/30"
              aria-hidden
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-slate-50">
                Akasha IA
              </h1>
              <p className="text-xs text-slate-400">
                Curadora — cita papers, nunca prescreve
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetConversation}
            disabled={state.messages.length === 0 && !state.streamingDraft}
            aria-label="Reiniciar conversa"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Nova conversa</span>
          </Button>
        </div>
        <div className="mt-3">
          <TraditionFilter
            selected={filter}
            onChange={setFilter}
            disabled={isStreaming}
          />
        </div>
      </header>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        aria-live="polite"
        aria-label="Mensagens do chat"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {state.messages.length === 0 && !state.streamingDraft && (
            <EmptyState onPick={(s) => setInput(s)} />
          )}
          {state.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onTagClick={onTagClick}
              onCitationClick={onCitationClick}
            />
          ))}
          {state.streamingDraft && (
            <MessageBubble
              key={state.streamingDraft.id}
              message={state.streamingDraft}
              isStreaming
              onTagClick={onTagClick}
              onCitationClick={onCitationClick}
            />
          )}
          {state.status === 'connecting' && state.streamingDraft?.content === '' && (
            <div
              className="flex items-center gap-2 self-start rounded-2xl bg-slate-800/60 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700/50"
              aria-label="Akasha está pensando"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              <span>Pensando…</span>
              <TypingCursor visible={false} />
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {state.error && (
        <div
          className="flex items-center justify-between gap-3 border-t border-amber-800/50 bg-amber-950/30 px-4 py-2 text-xs text-amber-200"
          role="alert"
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            <span>
              {state.error.code === 'RATE_LIMIT_EXCEEDED'
                ? 'Muitas requisições — aguarde um instante.'
                : state.error.message}
            </span>
          </div>
          <button
            type="button"
            onClick={send}
            className="rounded-full border border-amber-700/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200 hover:bg-amber-900/40"
            aria-label="Tentar novamente"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mx-auto flex max-w-3xl gap-2"
        >
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            aria-label="Mensagem para Akasha"
            className="min-h-[44px] flex-1 bg-slate-800/60 text-base text-slate-100 placeholder:text-slate-500"
            maxLength={2000}
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={abort}
              className="min-h-[44px] min-w-[44px] px-4"
              aria-label="Parar streaming (Esc)"
              title="Parar (Esc)"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="ml-1.5 hidden sm:inline">Parar</span>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="golden"
              size="default"
              disabled={!input.trim()}
              className="min-h-[44px] min-w-[44px] px-4"
              aria-label="Enviar mensagem (Ctrl+Enter)"
              title="Enviar (Ctrl+Enter)"
            >
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-slate-500">
          Ctrl+Enter para enviar · Esc para parar · Akasha cita papers, respeita tradições, nunca prescreve.
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Empty state ────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'O que o Tarot diz sobre meu próximo mês?',
  'Como a Cabala cruza com o Orixá Oxalá?',
  'O que é o Odu Oyeku-Meji?',
  'Mostre um paralelo entre Tantra e Astrologia.',
];

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center"
      aria-label="Sugestões iniciais"
    >
      <Sparkles className="h-8 w-8 text-amber-300" aria-hidden />
      <p className="text-sm text-slate-300">
        Olá. Eu sou a Akasha — curadora, não prescritora. Posso citar
        papers, cruzar tradições e respeitar cada uma.
      </p>
      <div className="flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className={cn(
              'rounded-full bg-slate-800/60 px-4 py-2 text-xs text-slate-200 ring-1 ring-slate-700/50',
              'transition hover:ring-amber-400/40 focus:outline-none focus-visible:ring-2',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatStream;
