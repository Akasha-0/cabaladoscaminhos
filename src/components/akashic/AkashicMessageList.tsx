'use client';

// ============================================================================
// AkashicMessageList — MessageBubble + ThinkingBubble (lazy-loaded)
// ============================================================================
// Renders each chat turn. Heavy lucide icons + ring/border styling land in
// this chunk. Loaded dynamically from /akashic/page.tsx so the composer
// (Send button, input, tradition selector) stays in the initial bundle.
//
// Wave 11 (perf deep) — 2026-06-27.
// ============================================================================

import React, { useState } from 'react';
import { Loader2, ThumbsUp, ThumbsDown, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceButton } from './VoiceButton';

// ============================================================================
// Types (re-exported from page)
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: string; title: string; slug: string; similarity: number; excerpt?: string; tradition?: string; doi?: string }>;
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
// MessageBubble
// ============================================================================

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <article className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
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

        {/* Wave 18 — Citation cards inline (clicaveis, expandem DOI) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <CitationCards sources={message.sources} />
        )}

        {!isUser && !message.error && message.meta && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-slate-900/50 px-2 py-0.5">
              {message.meta.model}
            </span>
            <span>·</span>
            <span>{message.meta.took_ms}ms</span>
            {message.meta.deep_mode && (
              <>
                <span>·</span>
                <span
                  className="rounded-full bg-purple-900/40 px-2 py-0.5 text-purple-200"
                  title="Modo estudo profundo ativado"
                >
                  profundo
                </span>
              </>
            )}
            {message.meta.effective_tradition && (
              <>
                <span>·</span>
                <span
                  className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-emerald-200"
                  title={
                    message.meta.tradition_auto_detected
                      ? 'Tradição auto-detectada da mensagem'
                      : 'Tradição selecionada'
                  }
                >
                  {message.meta.tradition_auto_detected ? '≈ ' : ''}
                  {message.meta.effective_tradition}
                </span>
              </>
            )}
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

        {/* ─── Voice mode (Wave 12): TTS da resposta ────────────────── */}
        {/* Botão "Ouvir" em cada mensagem da Akasha. Mobile-first (44px), */}
        {/* acessível (aria-label dinâmico, aria-pressed, focus-visible). */}
        {!isUser && !message.error && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <FeedbackButtons
              messageId={message.id}
              tradition={message.meta?.effective_tradition ?? null}
              deepMode={message.meta?.deep_mode ?? false}
            />
            <VoiceButton text={message.content} lang="pt-BR" />
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// FeedbackButtons — Wave 18 👍/👎 inline
// ============================================================================
// Envia voto + contexto (tradição + deepMode) para /api/akashic/feedback.
// Comentário opcional expande em textarea inline (debounce 800ms ou blur).
// ============================================================================

function FeedbackButtons({
  messageId,
  tradition,
  deepMode,
}: {
  messageId: string;
  tradition: string | null;
  deepMode: boolean;
}) {
  const [vote, setVote] = useState<'UP' | 'DOWN' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async (v: 'UP' | 'DOWN', c?: string) => {
    setVote(v);
    setStatus('sending');
    try {
      const res = await fetch('/api/akashic/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messageId,
          vote: v,
          tradition: tradition ?? undefined,
          deepMode,
          comment: c ?? null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
    } catch (err) {
      console.warn('[feedback] falhou:', err);
      setStatus('error');
    }
  };

  if (status === 'sent' && vote) {
    return (
      <div
        className="flex items-center gap-1 text-[10px] text-slate-400"
        aria-live="polite"
      >
        <Check className="h-3 w-3 text-emerald-400" aria-hidden />
        <span>Obrigada pelo feedback.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => submit('UP')}
        disabled={status === 'sending'}
        aria-label="Resposta útil"
        aria-pressed={vote === 'UP'}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition',
          'hover:bg-emerald-900/30 active:scale-95',
          vote === 'UP' && 'bg-emerald-900/50 text-emerald-200',
          status === 'sending' && 'opacity-50',
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => {
          submit('DOWN');
          setShowComment(true);
        }}
        disabled={status === 'sending'}
        aria-label="Resposta pode melhorar"
        aria-pressed={vote === 'DOWN'}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition',
          'hover:bg-rose-900/30 active:scale-95',
          vote === 'DOWN' && 'bg-rose-900/50 text-rose-200',
          status === 'sending' && 'opacity-50',
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
      </button>
      {showComment && (
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => {
            if (comment.trim().length > 0 && status === 'sent') {
              // reenvia com comentário (idempotente — server aceita múltiplos)
              submit(vote!, comment.trim());
            }
          }}
          placeholder="O que faltou? (opcional)"
          maxLength={500}
          className="ml-2 h-7 w-48 rounded-full bg-slate-900/60 px-3 text-[11px] text-slate-100 placeholder:text-slate-500"
        />
      )}
    </div>
  );
}

// ============================================================================
// CitationCards — Wave 18 cards de citação clicáveis
// ============================================================================
// Cada paper da RAG vira um card colapsável. Click expande excerpt + DOI.
// Mantém o estilo minimalista do chat dark.
// ============================================================================

function CitationCards({
  sources,
}: {
  sources: Array<{
    id: string;
    title: string;
    slug: string;
    similarity: number;
    excerpt?: string;
    tradition?: string;
    doi?: string;
  }>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        Fontes citadas ({sources.length})
      </p>
      <div className="flex flex-col gap-1">
        {sources.map((s) => {
          const isOpen = expanded === s.id;
          const doiLink = s.doi
            ? `https://doi.org/${s.doi}`
            : `https://doi.org/?query=${encodeURIComponent(s.title)}`;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setExpanded(isOpen ? null : s.id)}
              className={cn(
                'group flex w-full flex-col rounded-lg border px-3 py-2 text-left transition',
                'border-slate-700/60 bg-slate-900/40 hover:bg-slate-900/70',
                isOpen && 'border-amber-500/40 bg-slate-900/70',
              )}
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-xs font-medium text-slate-100">
                  {s.title}
                </span>
                <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400">
                  {(s.similarity * 100).toFixed(0)}%
                </span>
              </div>
              {isOpen && (
                <div className="mt-2 text-[11px] text-slate-300">
                  {s.excerpt && (
                    <p className="mb-2 italic text-slate-400">"{s.excerpt}"</p>
                  )}
                  <a
                    href={doiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-amber-300 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden />
                    <span>{s.doi ? `DOI: ${s.doi}` : 'Buscar DOI'}</span>
                  </a>
                  {s.tradition && (
                    <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400">
                      {s.tradition}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// ThinkingBubble
// ============================================================================

export function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-800/60 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700/50">
        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
        <span>Akasha está buscando na biblioteca e pensando…</span>
      </div>
    </div>
  );
}