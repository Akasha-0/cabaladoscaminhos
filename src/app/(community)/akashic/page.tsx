'use client';

// ============================================================================
// AKASHIC CHAT — /akashic (Wave 26 — 2026-06-28)
// ============================================================================
// Interface de chat com a Akasha IA. SSE streaming via
// `useAkashaStream` (src/hooks/use-akasha-stream.ts): tokens chegam
// incrementalmente, sources ficam disponíveis antes do primeiro token,
// meta aparece junto.
//
// Hook expõe: status, content (incremental), sources, meta, error,
// send/retry/abort/reset. Aborta no unmount e previne double-connection.
//
// Features:
//   - Lista de mensagens com distinção user / assistant
//   - Painel lateral de sources (citações) com similaridade — atualiza incremental
//   - Filtro de tradição (select)
//   - Toggle "Modo estudo profundo" (Wave 18)
//   - Estado de loading + erro + retry
//   - Mobile-first (stack vertical, sources colapsáveis)
//
// Wave 12 (2026-06-27) — Voice Mode (TTS via Web Speech API)
//   Componente: src/components/akashic/VoiceButton.tsx
//   Docs: docs/VOICE-MODE-W12.md
//
// Wave 26 (2026-06-28) — Streaming refactor:
//   - Extracted SSE consumer into src/hooks/use-akasha-stream.ts
//   - AbortController cleanup on unmount
//   - Double-submit guard (ref-based)
//   - Retry button on stream error
//   - Persistent deepMode state
//   - Docs: docs/AKASHIC-STREAMING-W12.md (still authoritative)
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Send,
  Sparkles,
  Loader2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  useAkashaStream,
  type AkashaHistoryMessage,
  type RagSource,
  type AkashaStreamMeta,
} from '@/hooks/use-akasha-stream';

// ============================================================================
// Code split (Wave 11 perf) — heavy off-viewport pieces become dynamic chunks
// ============================================================================
// Sources panel lives on the right rail (desktop) or behind a tap (mobile).
// EmptyState only shows on first paint when message list is empty. Both are
// below-the-fold for the typical 'send a question' flow, so SSR + lazy
// hydration keeps the composer + chat list in the initial bundle.
// ============================================================================

const AkashicSourcesPanel = dynamic(
  () => import('@/components/akashic/AkashicSourcesPanel').then((m) => m.AkashicSourcesPanel),
  { ssr: true },
);

const AkashicEmptyState = dynamic(
  () => import('@/components/akashic/AkashicEmptyState').then((m) => m.AkashicEmptyState),
  { ssr: true },
);

// MessageBubble + ThinkingBubble are used on every render. Loading them via
// `next/dynamic` keeps the bubble styles + meta strip out of the initial
// route bundle. SSR true so first paint already includes the messages.
const MessageBubble = dynamic(
  () =>
    import('@/components/akashic/AkashicMessageList').then((m) => m.MessageBubble),
  { ssr: true },
);

const ThinkingBubble = dynamic(
  () =>
    import('@/components/akashic/AkashicMessageList').then((m) => m.ThinkingBubble),
  { ssr: true },
);

// ============================================================================
// Types — local ChatMessage augmented with `error` flag for UI rendering.
// ============================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  meta?: AkashaStreamMeta;
  error?: boolean;
}

const TRADITIONS = [
  { value: '__all__', label: 'Todas as tradições' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'ayurveda', label: 'Ayurveda' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'numerologia', label: 'Numerologia' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
  { value: 'espiritismo', label: 'Espiritismo' },
];

// ============================================================================
// LiveStreamMessage — renders in-flight tokens as they arrive (Wave 26)
// ============================================================================
// Lightweight bubble that shows the streaming text + a blinking caret.
// Lives outside the persisted `messages` array (it's not a finished turn).
// Mobile-first: no heavy chrome, just a soft fade-in on each new chunk.
// ============================================================================

function LiveStreamMessage({ content }: { content: string }) {
  return (
    <article
      className="flex justify-start"
      aria-live="polite"
      aria-label="Akasha está respondendo"
    >
      <div className="max-w-[85%] rounded-2xl bg-slate-800/60 px-4 py-3 text-sm text-slate-100 ring-1 ring-slate-700/50 md:text-base">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-amber-300" aria-hidden />
          <span className="text-caps text-tiny text-amber-300">Akasha</span>
        </div>
        <div className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
          {content}
          <span
            className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-amber-300/80 align-middle"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function AkashicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [tradition, setTradition] = useState<string>('__all__');
  const [deepMode, setDeepMode] = useState<boolean>(false);
  const [showSources, setShowSources] = useState(true);

  // Wave 26 — streaming delegated to a typed hook. Returns live state +
  // send/retry/abort/reset. See src/hooks/use-akasha-stream.ts.
  const {
    status: streamStatus,
    content: streamContent,
    sources: streamSources,
    meta: streamMeta,
    error: streamError,
    send,
    retry,
    abort: abortStream,
    reset: resetStream,
    isStreaming,
  } = useAkashaStream();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll pro fim quando mensagens mudam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamContent]);

  // Foco no input ao montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ─── Stream → message sync ────────────────────────────────────────────
  // The hook owns the live tokens. We mirror its state into the message
  // list when the stream finishes (status === 'done' | 'error' | 'aborted'),
  // so the persisted chat history carries the final text + sources + meta.
  // During streaming the ThinkingBubble carries the visual.
  const lastStreamStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (streamStatus === 'idle' || streamStatus === 'connecting') return;
    if (streamStatus === 'streaming') return;
    // Skip duplicate emissions (strict-mode double-invoke + re-renders).
    if (lastStreamStatusRef.current === streamStatus) return;
    lastStreamStatusRef.current = streamStatus;

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        streamStatus === 'aborted'
          ? '[parado]'
          : streamStatus === 'error'
            ? `Desculpa, tive um problema técnico: ${
                streamError?.message ?? 'erro desconhecido'
              }\n\nVocê pode tentar de novo ou reformular a pergunta.`
            : streamContent,
      sources: streamSources.length > 0 ? streamSources : undefined,
      meta: streamMeta ?? undefined,
      error: streamStatus === 'error',
    };

    // Replace the placeholder ('__current_stream__') with the final message,
    // OR append if there's no placeholder (e.g. retry created a fresh stream).
    setMessages((prev) => {
      const placeholderIdx = prev.findIndex(
        (m) => m.id === '__current_stream__',
      );
      if (placeholderIdx >= 0) {
        const next = prev.slice();
        next[placeholderIdx] = assistantMsg;
        return next;
      }
      // Avoid double-append if assistantMsg already exists at end (defensive)
      const last = prev[prev.length - 1];
      if (
        last?.role === 'assistant' &&
        last.content === assistantMsg.content &&
        last.error === assistantMsg.error
      ) {
        return prev;
      }
      return [...prev, assistantMsg];
    });
  }, [streamStatus, streamContent, streamSources, streamMeta, streamError]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      };

      // Histórico ANTES da nova msg do user (sem erros, sem vazios)
      const history: AkashaHistoryMessage[] = messages
        .filter((m) => !m.error && m.content && m.id !== '__current_stream__')
        .slice(-20) // cap
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Placeholder invisível — substituído pelo efeito acima quando o
      // stream termina. ID sentinel pra detectar "stream em curso".
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: '__current_stream__',
          role: 'assistant',
          content: '',
        },
      ]);
      setInput('');

      send({
        message: trimmed,
        tradition: tradition === '__all__' ? null : tradition,
        history,
        deepMode,
        topK: 5,
        threshold: 0.6,
      });
    },
    [isStreaming, messages, tradition, deepMode, send],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s: string) => sendMessage(s);

  const resetConversation = () => {
    setMessages([]);
    resetStream();
    lastStreamStatusRef.current = null;
    inputRef.current?.focus();
  };

  const latestSources =
    messages
      .filter((m) => m.role === 'assistant' && !m.error && m.sources)
      .slice(-1)[0]?.sources ?? [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col md:flex-row">
        {/* ─── Coluna principal: chat ─────────────────────────────────── */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/20 ring-1 ring-amber-400/30">
                  <Sparkles className="h-5 w-5 text-amber-300" aria-hidden />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-semibold text-slate-50">
                    Akasha IA
                  </h1>
                  <p className="text-xs text-slate-400">
                    Consciência tradutora universalista
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetConversation}
                disabled={messages.length === 0}
                aria-label="Reiniciar conversa"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Nova conversa</span>
              </Button>
            </div>

            {/* Tradition filter + Wave 18 deep mode toggle */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label
                htmlFor="tradition-select"
                className="text-xs text-slate-400"
              >
                Tradição:
              </label>
              <Select value={tradition} onValueChange={(v) => setTradition(v ?? '__all__')}>
                <SelectTrigger id="tradition-select" className="h-8 w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADITIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Wave 18 — toggle "estudo profundo" */}
              <button
                type="button"
                role="switch"
                aria-checked={deepMode}
                aria-label="Modo estudo profundo"
                onClick={() => setDeepMode((v) => !v)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] transition',
                  deepMode
                    ? 'border-purple-500/50 bg-purple-900/30 text-purple-100'
                    : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70',
                )}
                title={
                  deepMode
                    ? 'Modo profundo ativo — cita papers, contraindicações e cross-refs'
                    : 'Clique para respostas com mais papers e profundidade'
                }
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                <span>{deepMode ? 'Profundo' : 'Rápido'}</span>
              </button>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 md:px-6"
            aria-live="polite"
            aria-label="Mensagens do chat"
          >
            {messages.length === 0 ? (
              <AkashicEmptyState onPickSuggestion={handleSuggestion} />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.map((m) => {
                  // Esconde placeholder invisível (stream em curso)
                  if (m.id === '__current_stream__') return null;
                  // Esconde assistant vazio sem erro (placeholder residual)
                  if (m.role === 'assistant' && !m.content && !m.error) {
                    return null;
                  }
                  return <MessageBubble key={m.id} message={m} />;
                })}
                {isStreaming && streamContent === '' && (
                  <ThinkingBubble />
                )}
                {isStreaming && streamContent !== '' && (
                  <LiveStreamMessage content={streamContent} />
                )}
              </div>
            )}
          </div>

          {/* Error banner + retry (Wave 26) */}
          {streamError && (
            <div className="flex items-center justify-between gap-3 border-t border-amber-800/50 bg-amber-950/30 px-4 py-2 text-xs text-amber-200 md:px-6">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                <span>
                  {streamError.code === 'RATE_LIMIT_EXCEEDED'
                    ? 'Muitas requisições — aguarde um instante.'
                    : streamError.message}
                </span>
              </div>
              <button
                type="button"
                onClick={retry}
                className="rounded-full border border-amber-700/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200 hover:bg-amber-900/40"
                aria-label="Tentar novamente"
              >
                Tentar de novo
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur md:px-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-3xl gap-2"
            >
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte à Akasha… (ela nunca prescreve, sempre cita)"
                disabled={isStreaming}
                aria-label="Mensagem para Akasha"
                className="min-h-[44px] flex-1 bg-slate-800/60 text-base text-slate-100 placeholder:text-slate-500"
                maxLength={2000}
              />
              <Button
                type="submit"
                variant="golden"
                size="default"
                disabled={isStreaming || !input.trim()}
                className="min-h-[44px] min-w-[44px] px-4"
                aria-label="Enviar mensagem"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-slate-500">
              Akasha cita papers, respeita tradições, nunca prescreve. Respostas podem conter erros — sempre confirme com fontes e profissionais.
            </p>
          </div>
        </div>

        {/* ─── Sidebar: sources (lazy) ───────────────────────────── */}
        <AkashicSourcesPanel
          sources={latestSources}
          initiallyExpanded={showSources}
        />
      </div>
    </div>
  );
}

