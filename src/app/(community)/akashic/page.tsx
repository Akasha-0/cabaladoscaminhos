'use client';

// ============================================================================
// AKASHIC CHAT — /akashic (Wave 10 — 2026-06-27)
// ============================================================================
// Interface de chat com a Akasha IA. Consome /api/akashic/chat (non-streaming)
// com fallback automático para streaming via /api/akashic/chat/stream quando
// disponível.
//
// Features:
//   - Lista de mensagens com distinção user / assistant
//   - Painel lateral de sources (citações) com similaridade
//   - Filtro de tradição (select)
//   - Estado de loading + erro
//   - Mobile-first (stack vertical, sources colapsáveis)
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  BookOpen,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface ChatResponse {
  reply: string;
  sources: RagSource[];
  meta: {
    took_ms: number;
    rag_took_ms: number;
    model: string;
    tradition: string | null;
    rag_degraded: boolean;
    rag_reason?: string;
    tokens?: { prompt: number; completion: number; total: number };
  };
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

const SUGGESTIONS = [
  'O que a ciência diz sobre meditação Vipassana?',
  'Quais práticas podem ajudar com ansiedade? (sem prescrever)',
  'Como Cabala e Ifá se correlacionam nos 4 mapas?',
  'Qual a evidência sobre Reiki?',
  'Posso praticar ayahuasca se tomo SSRI?',
  'Explique o Odu Alafia em termos simples',
];

// ============================================================================
// Page
// ============================================================================

export default function AkashicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [tradition, setTradition] = useState<string>('__all__');
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

      // Monta histórico a partir do estado atual (sem a nova msg do user)
      const history = messages
        .filter((m) => !m.error)
        .slice(-20) // cap
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/akashic/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            tradition: tradition === '__all__' ? null : tradition,
            history,
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

        const data: ChatResponse = await res.json();

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          sources: data.sources,
          meta: {
            model: data.meta.model,
            took_ms: data.meta.took_ms,
            rag_degraded: data.meta.rag_degraded,
            rag_reason: data.meta.rag_reason,
          },
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Desculpa, tive um problema técnico: ${msg}\n\nVocê pode tentar de novo ou reformular a pergunta.`,
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, tradition],
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

            {/* Tradition filter */}
            <div className="mt-3 flex items-center gap-2">
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
              <EmptyState onPickSuggestion={handleSuggestion} />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
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

        {/* ─── Sidebar: sources ─────────────────────────────────────── */}
        <aside
          className={cn(
            'border-t border-slate-800 bg-slate-900/40 md:w-80 md:border-l md:border-t-0',
            'overflow-y-auto',
          )}
          aria-label="Fontes citadas pela Akasha"
        >
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800/30 md:cursor-default md:hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-300" aria-hidden />
              <h2 className="font-heading text-sm font-semibold text-slate-100">
                Fontes citadas
              </h2>
              {latestSources.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {latestSources.length}
                </Badge>
              )}
            </div>
            <span className="md:hidden">
              {showSources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {showSources && (
            <div className="space-y-2 px-4 pb-4">
              {latestSources.length === 0 ? (
                <p className="text-xs text-slate-500">
                  As fontes que a Akasha citar vão aparecer aqui. Por padrão, até 5 artigos por resposta.
                </p>
              ) : (
                latestSources.map((s, i) => (
                  <SourceCard key={s.id} source={s} index={i + 1} />
                ))
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function EmptyState({ onPickSuggestion }: { onPickSuggestion: (s: string) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/20 ring-1 ring-amber-400/30">
        <Sparkles className="h-8 w-8 text-amber-300" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-100">
          Olá, eu sou a Akasha
        </h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          Posso ajudar a conectar tradições, citar papers e traduzir conceitos. Sempre com humildade epistêmica — quando não sei, admito.
        </p>
      </div>
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60">
        <CardContent className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Comece com uma pergunta:
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPickSuggestion(s)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-amber-400/40 hover:bg-slate-800/40"
            >
              <MessageSquare className="mr-2 inline h-3.5 w-3.5 text-amber-300" />
              {s}
            </button>
          ))}
        </CardContent>
      </Card>
      <p className="text-[10px] text-slate-500">
        Lembrete: Akasha não substitui profissionais, não promete cura, e sempre recomenda consultar praticantes da tradição.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <article
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base',
          isUser
            ? 'bg-amber-500/15 text-slate-50 ring-1 ring-amber-400/30'
            : message.error
              ? 'bg-red-950/30 text-red-100 ring-1 ring-red-800/40'
              : 'bg-slate-800/60 text-slate-100 ring-1 ring-slate-700/50',
        )}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        {!isUser && !message.error && message.meta && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-slate-900/50 px-2 py-0.5">
              {message.meta.model}
            </span>
            <span>·</span>
            <span>{message.meta.took_ms}ms</span>
            {message.meta.rag_degraded && (
              <>
                <span>·</span>
                <span
                  className="rounded-full bg-amber-900/40 px-2 py-0.5 text-amber-200"
                  title={message.meta.rag_reason ?? 'RAG degradado'}
                >
                  RAG off
                </span>
              </>
            )}
            {message.sources && message.sources.length > 0 && (
              <>
                <span>·</span>
                <span>{message.sources.length} fontes</span>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-800/60 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700/50">
        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
        <span>Akasha está buscando na biblioteca e pensando…</span>
      </div>
    </div>
  );
}

function SourceCard({ source, index }: { source: RagSource; index: number }) {
  const simPct = (source.similarity * 100).toFixed(0);
  return (
    <a
      href={`/library/${source.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-amber-400/40 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-xs font-medium leading-snug text-slate-100">
          <span className="mr-1 text-amber-300">[{index}]</span>
          {source.title}
        </h3>
        <ExternalLink className="h-3 w-3 shrink-0 text-slate-500" />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        <Badge variant="outline" className="border-amber-400/30 text-amber-300">
          {simPct}% match
        </Badge>
        {source.tradition && (
          <Badge variant="secondary" className="text-[10px]">
            {source.tradition}
          </Badge>
        )}
      </div>
      {source.excerpt && (
        <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-slate-400">
          {source.excerpt}
        </p>
      )}
    </a>
  );
}