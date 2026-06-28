'use client';

// ============================================================================
// AKASHIC CHAT — /akashic (Wave 12 — 2026-06-27)
// ============================================================================
// Interface de chat com a Akasha IA. Consome /api/akashic/chat/stream via
// Server-Sent Events (SSE): tokens chegam incrementalmente, sources ficam
// disponíveis antes do primeiro token, meta aparece junto.
//
// Eventos SSE consumidos:
//   sources  → { sources: RagSource[] }     (antes do primeiro token)
//   meta     → { model, rag_degraded }      (antes do stream)
//   token    → { content: "..." }           (chunks de texto, typing effect)
//   done     → { ok: true }                 (fim do stream)
//   error    → { code, message }            (se algo falhar)
//
// Features:
//   - Lista de mensagens com distinção user / assistant
//   - Painel lateral de sources (citações) com similaridade — atualiza incremental
//   - Filtro de tradição (select)
//   - Estado de loading + erro
//   - Mobile-first (stack vertical, sources colapsáveis)
//
// Wave 12 (2026-06-27) — Voice Mode + SSE streaming:
//   - Voice Mode: botão "Ouvir" em cada resposta (TTS via Web Speech API).
//     Componente: src/components/akashic/VoiceButton.tsx
//   - SSE streaming: consome /api/akashic/chat/stream (ReadableStream).
//     Tokens chegam incrementalmente (typing effect natural).
//     Sources chegam ANTES do primeiro token (sidebar atualiza cedo).
//   - Docs: docs/VOICE-MODE-W12.md, docs/AKASHIC-STREAMING-W12.md
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
// Types
// ============================================================================

interface RagSource {
  id: string;
  title: string;
  slug: string;
  similarity: number;
  excerpt?: string;
  tradition?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  meta?: {
    model: string;
    took_ms: number;
    rag_degraded?: boolean;
    rag_reason?: string;
  };
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
// Page
// ============================================================================

export default function AkashicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [tradition, setTradition] = useState<string>('__all__');
  const [deepMode, setDeepMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll pro fim quando mensagens mudam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Foco no input ao montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      };

      // Histórico ANTES da nova msg do user (sem placeholders vazios)
      const history = messages
        .filter((m) => !m.error && m.content)
        .slice(-20) // cap
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Placeholder assistant — vai ser preenchido incrementalmente pelo stream
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setInput('');
      setLoading(true);
      setError(null);

      const startedAt = performance.now();

      try {
        const res = await fetch('/api/akashic/chat/stream', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            tradition: tradition === '__all__' ? null : tradition,
            history,
            deepMode,
            topK: 5,
            threshold: 0.6,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const errMsg =
            errBody?.error?.message ??
            `Erro ${res.status}: não foi possível obter resposta`;
          throw new Error(errMsg);
        }

        if (!res.body) {
          throw new Error('Resposta sem corpo (stream vazio)');
        }

        // ── SSE consumer (ReadableStream + TextDecoder) ───────────────
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedTokens = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events separados por linha em branco
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? ''; // guarda parcial

          for (const part of parts) {
            if (!part.trim()) continue;

            let event = 'message';
            let data = '';
            for (const line of part.split('\n')) {
              if (line.startsWith('event:')) {
                event = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                data += line.slice(5).trim();
              }
            }
            if (!data) continue;

            let parsed: unknown;
            try {
              parsed = JSON.parse(data);
            } catch {
              continue;
            }
            const p = parsed as {
              sources?: RagSource[];
              model?: string;
              rag_degraded?: boolean;
              rag_reason?: string;
              effective_tradition?: string | null;
              tradition_auto_detected?: boolean;
              content?: string;
              message?: string;
              ok?: boolean;
            };

            switch (event) {
              case 'sources':
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sources: p.sources ?? [] }
                      : m,
                  ),
                );
                break;
              case 'meta':
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          meta: {
                            model: p.model ?? 'gpt-4o',
                            took_ms: m.meta?.took_ms ?? 0,
                            rag_degraded: p.rag_degraded ?? false,
                            rag_reason: p.rag_reason,
                            effective_tradition: p.effective_tradition ?? null,
                            tradition_auto_detected:
                              p.tradition_auto_detected ?? false,
                            deep_mode: deepMode,
                          },
                        }
                      : m,
                  ),
                );
                break;
              case 'token':
                receivedTokens = true;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + (p.content ?? '') }
                      : m,
                  ),
                );
                break;
              case 'done':
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          meta: {
                            ...m.meta,
                            took_ms: Math.round(performance.now() - startedAt),
                          },
                        }
                      : m,
                  ),
                );
                break;
              case 'error':
                throw new Error(p.message ?? 'Erro no stream');
            }
          }
        }

        if (!receivedTokens) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: 'A Akasha não retornou conteúdo.',
                    error: true,
                  }
                : m,
            ),
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `Desculpa, tive um problema técnico: ${msg}\n\nVocê pode tentar de novo ou reformular a pergunta.`,
                  error: true,
                }
              : m,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, tradition, deepMode],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s: string) => sendMessage(s);

  const resetConversation = () => {
    setMessages([]);
    setError(null);
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
              <Select value={tradition} onValueChange={setTradition}>
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
                  // Esconde placeholder assistant vazio até o primeiro token chegar
                  if (m.role === 'assistant' && !m.content && !m.error) {
                    return null;
                  }
                  return <MessageBubble key={m.id} message={m} />;
                })}
                {loading && <ThinkingBubble />}
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="border-t border-amber-800/50 bg-amber-950/30 px-4 py-2 text-xs text-amber-200 md:px-6">
              <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
              {error}
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
                disabled={loading}
                aria-label="Mensagem para Akasha"
                className="min-h-[44px] flex-1 bg-slate-800/60 text-base text-slate-100 placeholder:text-slate-500"
                maxLength={2000}
              />
              <Button
                type="submit"
                variant="golden"
                size="default"
                disabled={loading || !input.trim()}
                className="min-h-[44px] min-w-[44px] px-4"
                aria-label="Enviar mensagem"
              >
                {loading ? (
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

