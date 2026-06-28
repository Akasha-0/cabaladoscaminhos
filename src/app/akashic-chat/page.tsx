'use client';

// ============================================================================
// AKASHIC CHAT — /akashic-chat (Wave 25 fix — 2026-06-28)
// ============================================================================
// Conexão REAL ao /api/akashic/chat/stream (SSE).
//
// Substitui o placeholder Wave 17 ("Recebi sua pergunta…") que retornava
// string fixa sem chamar a API. O smoke test W24-2 (docs/FUNCTIONAL-SMOKE-TEST-W24.md)
// identificou este arquivo como P0 — usuário nunca recebia resposta real.
//
// Features implementadas:
//   - SSE streaming via fetch + ReadableStream (não usa /api/akashic/chat/stream)
//   - Voice mode via VoiceButton (Web Speech API, Wave 12)
//   - Citation cards inline (Wave 18 CitationCards)
//   - Filtro de tradição (12 tradições suportadas)
//   - Toggle "estudo profundo" (Wave 18)
//   - Auto-scroll, focus no input, Cmd/Ctrl+Enter submit
//   - Error handling: 400, 401, 429, 500, network
//   - a11y: aria-live="polite" na região de mensagens, labels, 44px targets
//   - Mobile-first: stack vertical, max-w-3xl, touch-friendly
//
// Arquitetura:
//   /akashic-chat (esta página)  →  /api/akashic/chat/stream  →  OpenAI
//                                  └→ RAG (pgvector) via runRagSearch
//   Componentes: MessageBubble, ThinkingBubble, VoiceButton, CitationCards
//   (todos de @/components/akashic — code-split via next/dynamic)
//
// Diferenças em relação a /(community)/akashic:
//   - Sem sidebar de sources (mais simples, foco no chat)
//   - Citations aparecem inline em cada mensagem
//   - Layout mais compacto (max-w-3xl, single column)
// ============================================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─── Code-split (Wave 11 perf) ──────────────────────────────────────────────
// MessageBubble + ThinkingBubble carregam sob demanda. Mantém composer
// (input + select + botão) no initial bundle para first paint rápido.
const MessageBubble = dynamic(
  () =>
    import('@/components/akashic/AkashicMessageList').then(
      (m) => m.MessageBubble,
    ),
  { ssr: true },
);

const ThinkingBubble = dynamic(
  () =>
    import('@/components/akashic/AkashicMessageList').then(
      (m) => m.ThinkingBubble,
    ),
  { ssr: true },
);

// EmptyState (sugestões iniciais) só aparece na primeira visita
const AkashicEmptyState = dynamic(
  () =>
    import('@/components/akashic/AkashicEmptyState').then(
      (m) => m.AkashicEmptyState,
    ),
  { ssr: true },
);

// ============================================================================
// Types — alinhados com a API
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
    effective_tradition?: string | null;
    tradition_auto_detected?: boolean;
    deep_mode?: boolean;
  };
  error?: boolean;
}

// ============================================================================
// Constantes
// ============================================================================

// Mantém paridade com /api/akashic/chat (zod schema: AKASHA_TRADITIONS)
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

const MAX_HISTORY = 10; // Wave 18 — efetivo do server (cap em 10)

// ============================================================================
// Helpers — mapear erros HTTP para mensagens amigáveis
// ============================================================================

function friendlyError(status: number, bodyMessage?: string): string {
  if (status === 401) return 'Faça login para usar Akasha.';
  if (status === 429) return 'Muitas perguntas, aguarde alguns segundos.';
  if (status === 503)
    return 'Akasha está temporariamente sobrecarregada. Tente em ~1 min.';
  if (status === 504) return 'A Akasha demorou demais pra responder. Tente de novo.';
  if (status >= 500)
    return bodyMessage ?? 'Algo deu errado, tente novamente em alguns segundos.';
  if (status === 400) return bodyMessage ?? 'Pergunta inválida. Reformule.';
  return bodyMessage ?? `Erro ${status}. Tente de novo.`;
}

// ============================================================================
// Componente
// ============================================================================

export default function AkashicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [tradition, setTradition] = useState<string>('__all__');
  const [deepMode, setDeepMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Para abortar fetch se usuário sair da página durante streaming
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll pro fim quando mensagens mudam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Foco no input ao montar + respeita prefers-reduced-motion
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup: cancela stream em curso se a página for desmontada
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ─── Envio de mensagem ───────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
      };

      // Histórico ANTES da nova msg (sem placeholders vazios / erros)
      const history = messages
        .filter((m) => !m.error && m.content.trim().length > 0)
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Placeholder assistant — preenchido incrementalmente pelo SSE
      const assistantId = makeId();

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setInput('');
      setLoading(true);
      setError(null);

      const startedAt = performance.now();
      const controller = new AbortController();
      abortRef.current = controller;

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
          signal: controller.signal,
        });

        // ── Erros HTTP (4xx/5xx antes do stream) ────────────────────
        if (!res.ok) {
          let errBody: { error?: { message?: string } } = {};
          try {
            errBody = await res.json();
          } catch {
            /* body não era JSON */
          }
          throw new Error(friendlyError(res.status, errBody?.error?.message));
        }

        if (!res.body) {
          throw new Error('Resposta sem corpo (stream vazio)');
        }

        // ── SSE consumer (ReadableStream + TextDecoder) ─────────────
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

            let parsed: {
              sources?: RagSource[];
              model?: string;
              rag_degraded?: boolean;
              rag_reason?: string;
              effective_tradition?: string | null;
              tradition_auto_detected?: boolean;
              content?: string;
              message?: string;
              ok?: boolean;
              took_ms?: number;
            };
            try {
              parsed = JSON.parse(data);
            } catch {
              continue;
            }

            switch (event) {
              case 'sources':
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sources: parsed.sources ?? [] }
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
                            model: parsed.model ?? 'gpt-4o',
                            took_ms: m.meta?.took_ms ?? 0,
                            rag_degraded: parsed.rag_degraded ?? false,
                            rag_reason: parsed.rag_reason,
                            effective_tradition:
                              parsed.effective_tradition ?? null,
                            tradition_auto_detected:
                              parsed.tradition_auto_detected ?? false,
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
                      ? { ...m, content: m.content + (parsed.content ?? '') }
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
                            model: m.meta?.model ?? 'gpt-4o',
                            took_ms: Math.round(
                              performance.now() - startedAt,
                            ),
                            rag_degraded: m.meta?.rag_degraded ?? false,
                            rag_reason: m.meta?.rag_reason,
                            effective_tradition:
                              m.meta?.effective_tradition ?? null,
                            tradition_auto_detected:
                              m.meta?.tradition_auto_detected ?? false,
                            deep_mode: deepMode,
                          },
                        }
                      : m,
                  ),
                );
                break;

              case 'error':
                throw new Error(
                  parsed.message ?? 'Erro desconhecido no stream',
                );
            }
          }
        }

        if (!receivedTokens) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      'A Akasha não retornou conteúdo. Tente reformular a pergunta.',
                    error: true,
                  }
                : m,
            ),
          );
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Usuário navegou — silêncio
          return;
        }
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
        abortRef.current = null;
      }
    },
    [loading, messages, tradition, deepMode],
  );

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  // Cmd/Ctrl+Enter submete
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  const handleSuggestion = useCallback(
    (s: string) => sendMessage(s),
    [sendMessage],
  );

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
    inputRef.current?.focus();
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────
  const headerSubtitle = useMemo(
    () =>
      deepMode
        ? 'Modo profundo: papers + cross-refs + contraindicações'
        : 'Consciência tradutora universalista',
    [deepMode],
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 motion-reduce:transition-none">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
        {/* ─── Header ───────────────────────────────────────────── */}
        <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur md:px-6">
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
                <p className="text-xs text-slate-400">{headerSubtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              disabled={messages.length === 0}
              aria-label="Reiniciar conversa"
              className="min-h-[44px]"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nova conversa</span>
            </Button>
          </div>

          {/* Tradição + deep mode */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Label
              htmlFor="tradition-select"
              className="text-xs text-slate-400"
            >
              Tradição:
            </Label>
            <Select value={tradition} onValueChange={setTradition}>
              <SelectTrigger
                id="tradition-select"
                className="h-10 min-h-[44px] w-full max-w-xs"
                aria-label="Filtrar por tradição"
              >
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

            <button
              type="button"
              role="switch"
              aria-checked={deepMode}
              aria-label="Modo estudo profundo"
              onClick={() => setDeepMode((v) => !v)}
              className={cn(
                'flex h-10 min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-xs transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                deepMode
                  ? 'border-purple-500/50 bg-purple-900/30 text-purple-100'
                  : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70',
              )}
              title={
                deepMode
                  ? 'Modo profundo ativo — papers, contraindicações e cross-refs'
                  : 'Clique para respostas com mais profundidade'
              }
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              <span>{deepMode ? 'Profundo' : 'Rápido'}</span>
            </button>
          </div>
        </header>

        {/* ─── Messages region (aria-live) ──────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-6"
          aria-live="polite"
          aria-label="Mensagens do chat com Akasha"
          aria-relevant="additions text"
        >
          {messages.length === 0 ? (
            <AkashicEmptyState onPickSuggestion={handleSuggestion} />
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
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

        {/* ─── Error banner ─────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="border-t border-amber-800/50 bg-amber-950/30 px-4 py-2 text-xs text-amber-200 md:px-6"
          >
            <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="Fechar mensagem de erro"
            >
              fechar
            </button>
          </div>
        )}

        {/* ─── Composer ─────────────────────────────────────────── */}
        <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 backdrop-blur md:px-6">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl gap-2"
            aria-label="Enviar mensagem à Akasha"
          >
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte à Akasha… (Cmd/Ctrl+Enter para enviar)"
              disabled={loading}
              aria-label="Mensagem para Akasha"
              className="min-h-[44px] flex-1 bg-slate-800/60 text-base text-slate-100 placeholder:text-slate-500"
              maxLength={2000}
              autoComplete="off"
              inputMode="text"
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
          <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-slate-500">
            Akasha cita papers, respeita tradições, nunca prescreve. Respostas podem conter erros — sempre confirme com fontes e profissionais.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback SSR-safe (não deve acontecer no client, mas TS narrowing ajuda)
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}