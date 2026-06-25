'use client';

/**
 * MentorChatUnified — Wave 28.3 Mentor Chat UX Unificado
 *
 * Client island raiz de `/chat`. Combina Wave 10.4 MentorChat (chat
 * streaming + typewriter) com Wave 23.2/27.2 papers inline ("Papers que
 * sustentam isso").
 *
 * Layout:
 *   Mobile (< 768px) — stack vertical:
 *     ┌─────────────────────────────────────┐
 *     │  Header: title + subtitle            │
 *     ├─────────────────────────────────────┤
 *     │  MentorChat (full width, existing)   │
 *     ├─────────────────────────────────────┤
 *     │  Papers panel (abaixo do chat)       │
 *     └─────────────────────────────────────┘
 *
 *   Desktop (≥ 768px) — grid 2 colunas:
 *     ┌─────────────────────┬───────────────┐
 *     │ MentorChat (60%)    │ Papers (40%)  │
 *     │                     │               │
 *     └─────────────────────┴───────────────┘
 *
 * Filosofia (ADR-013 — universalista + visceral):
 *   - 5 Pilares convergem no chat; papers são as evidências científicas.
 *   - Copy direto, sem floreio: "Papers que sustentam isso" fala o que faz.
 *   - Sem reinventar paleta — re-usa <PaperChip> (Wave 23.2) para consistência.
 *
 * Detecção de "user enviou mensagem → Mentor respondeu":
 *   - NÃO modificamos MentorChat (Wave 10.4 untouched, ADR-014).
 *   - Em vez disso, escutamos o evento submit do form via DOM observer
 *     no wrapper do <MentorChat>. Quando detecta novo user message,
 *     dispara fetch de papers para a query (id derivado deterministicamente).
 *
 * LGPD:
 *   - View-model carregado via adapter filtra PII (Wave 23.2 invariant).
 *   - userId vem do server component (cookie JWT). Nunca enviado ao cliente
 *     em cleartext — fica em cookie httpOnly.
 *
 * Constraint compliance:
 *   - NÃO toca em /api/mentor/ask (read-only).
 *   - NÃO toca em packages/mentor/src/*.
 *   - 1 client island, ~280 linhas, simples de testar.
 */

import { BookOpen, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MentorChat } from '@/components/akasha/mentor-chat/MentorChat';
import { PaperChip } from '@/components/akasha/discoveries/PaperChip';
import type { ThoughtChainPaper, ThoughtChainViewModel } from '@/components/akasha/discoveries/shared';
import { loadDiscoveryViewModel } from '@/lib/application/discoveries/adapter';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/shared/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MentorChatUnifiedProps {
  /** Locale (pt-BR | en) — required para hydration parity. */
  locale: string;
  /** User ID do JWT (server extraído). Não exposto cleartext no client. */
  userId: string;
  /** Optional className para layout integration. */
  className?: string;
}

type PapersState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'ready'; query: string; papers: ThoughtChainPaper[]; discoveryId: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deriva um discoveryId determinístico a partir da query do user.
 *
 * Mesmo input → mesmo id (stable hash FNV-1a). Garante que papers do
 * adapter mock (Wave 23.2, hoje `USE_REAL_DB=false`) sejam consistentes
 * entre re-renders e SSR. Quando Wave 20.2/21.1/21.2 mergearem, esse
 * id vira o id real do `prisma.discoveryChain` retornado pelo backend.
 *
 * NÃO é PII — é só hash hex da query. Mesmo que a query contenha nome
 * do user, o id só carrega o hash (LGPD-safe).
 */
function discoveryIdFromQuery(query: string): string {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return '';
  let h = 2166136261;
  for (let i = 0; i < trimmed.length; i++) {
    h ^= trimmed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 8 hex chars — mesmo formato que discoveryId real (Wave 23.2).
  return `disc_chat_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Hook que observa o textarea do MentorChat e detecta quando o user
 * submete uma mensagem (Enter ou botão Send). Retorna a última query
 * enviada pelo user + um callback para resetar.
 *
 * Por que observer e não prop drilling: MentorChat é untouched (Wave
 * 10.4, 1100+ linhas). Não vamos mexer na API pública dele só pra
 * adicionar um callback. Observer é o contrato menos invasivo.
 *
 * Estratégia:
 *   1. Localiza o <form> dentro do wrapper (data-testid estável).
 *   2. Escuta 'submit' no form → captura textarea value antes do submit.
 *   3. Notifica o parent via callback.
 */
function useMentorSubmitObserver(
  wrapperRef: React.RefObject<HTMLElement | null>,
  onSubmit: (query: string) => void
): void {
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    function handleSubmit(ev: Event) {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const form = target.closest('form');
      if (!form || !root.contains(form)) return;
      const textarea = form.querySelector('textarea');
      const value = textarea?.value?.trim();
      if (value) onSubmit(value);
    }

    root.addEventListener('submit', handleSubmit, true);
    return () => root.removeEventListener('submit', handleSubmit, true);
  }, [wrapperRef, onSubmit]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MentorChatUnified({ locale, userId: _userId, className }: MentorChatUnifiedProps) {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [papersState, setPapersState] = useState<PapersState>({ status: 'idle' });

  /**
   * Chamado quando o user envia uma pergunta ao Mentor. Carrega papers
   * que sustentam aquela query via adapter (mock determinístico Wave
   * 23.2 — quando Wave 20.2/21.1 mergearem, vira Prisma real sem mudar UI).
   */
  const handleUserSubmit = useCallback(
    async (query: string) => {
      const discoveryId = discoveryIdFromQuery(query);
      if (!discoveryId) return;
      setPapersState({ status: 'loading', query });
      try {
        const model: ThoughtChainViewModel | null = await loadDiscoveryViewModel(
          discoveryId,
          locale
        );
        if (!model) {
          setPapersState({ status: 'empty', query });
          return;
        }
        if (!model.papers || model.papers.length === 0) {
          setPapersState({ status: 'empty', query });
          return;
        }
        setPapersState({
          status: 'ready',
          query,
          papers: model.papers,
          discoveryId,
        });
      } catch (err) {
        setPapersState({
          status: 'error',
          query,
          message: err instanceof Error ? err.message : 'unknown',
        });
      }
    },
    [locale]
  );

  useMentorSubmitObserver(wrapperRef, handleUserSubmit);

  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6',
        'md:grid md:grid-cols-[3fr_2fr] md:items-start md:gap-6',
        className
      )}
      aria-labelledby="mentor-chat-unified-title"
    >
      {/* Header — full width, both columns */}
      <header className="flex flex-col gap-1 md:col-span-2">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-amber-300" />
          <h1
            id="mentor-chat-unified-title"
            className="text-xl font-semibold text-slate-50 sm:text-2xl"
          >
            {t('mentor.unified.title')}
          </h1>
        </div>
        <p className="text-sm text-slate-400">{t('mentor.unified.subtitle')}</p>
      </header>

      {/* Chat panel — left column (desktop) / top (mobile) */}
      <section
        ref={wrapperRef}
        aria-label={t('mentor.unified.title')}
        className="flex min-h-[60vh] flex-col"
        data-testid="mentor-chat-wrapper"
      >
        <MentorChat locale={locale} />
      </section>

      {/* Papers panel — right column (desktop) / bottom (mobile) */}
      <aside
        aria-label={t('mentor.unified.papersTitle')}
        className="flex flex-col gap-3"
        data-testid="mentor-papers-panel"
        data-state={papersState.status}
      >
        <div className="flex items-center gap-2">
          <BookOpen aria-hidden="true" className="size-4 text-emerald-300" />
          <h2 className="text-sm font-semibold text-slate-100">
            {t('mentor.unified.papersTitle')}
          </h2>
        </div>
        <p className="text-xs text-slate-500">{t('mentor.unified.papersDesc')}</p>
        <PapersPanelBody state={papersState} locale={locale} t={t} />
      </aside>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Papers panel body — switch on state.status
// ─────────────────────────────────────────────────────────────────────────────

interface PapersPanelBodyProps {
  state: PapersState;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function PapersPanelBody({ state, locale, t }: PapersPanelBodyProps) {
  if (state.status === 'idle') {
    return (
      <div
        data-testid="papers-empty"
        className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-500"
      >
        {t('mentor.unified.papersEmpty')}
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div
        data-testid="papers-loading"
        className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400"
        aria-live="polite"
      >
        <FileText aria-hidden="true" className="size-3.5 animate-pulse" />
        <span>{t('mentor.unified.papersLoading')}</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        data-testid="papers-error"
        role="alert"
        className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300"
      >
        {t('common.error')}: {state.message}
      </div>
    );
  }

  if (state.status === 'empty') {
    return (
      <div
        data-testid="papers-empty-after-query"
        className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-500"
      >
        {t('mentor.unified.papersEmpty')}
      </div>
    );
  }

  // ready
  return (
    <div data-testid="papers-ready" className="flex flex-col gap-2">
      <span
        className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300"
        aria-label={t('mentor.unified.evidenceBadge')}
      >
        <FileText aria-hidden="true" className="size-3" />
        {t('mentor.unified.evidenceBadge')}
      </span>
      <ol className="flex flex-col gap-2" data-testid="papers-list">
        {state.papers.map((paper) => (
          <li key={paper.id}>
            <PaperChip paper={paper} locale={locale} />
          </li>
        ))}
      </ol>
      <Link
        href={`/${locale}/atendimento/${state.discoveryId}`}
        className="mt-1 text-xs text-sky-400 hover:text-sky-300"
        data-testid="papers-discover-link"
      >
        {t('mentor.unified.discoverLink')} →
      </Link>
    </div>
  );
}
