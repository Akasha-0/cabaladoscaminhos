'use client';

/**
 * AtendimentoClient — Wave 26.1 /atendimento Redesign (visceral).
 *
 * Root client island of `/atendimento`. One file, one component,
 * ~200 linhas. Layout:
 *
 *   Desktop (≥ 768px) — 2 colunas:
 *     ┌─────────────────────────┬─────────────────────────┐
 *     │ Cliente context (top)   │ Chat Mentor (composer)  │
 *     │ nome · idade · signo    │ Discovery cards inline  │
 *     │ Iluminador · emocional  │ (icons + cor por pilar) │
 *     ├─────────────────────────┴─────────────────────────┤
 *     │ ActionBar (Salvar · Citar · 👍 · 👎)               │
 *     └────────────────────────────────────────────────────┘
 *
 *   Mobile (< 768px) — tabs (Cliente | Chat | Insights):
 *     Top: tab bar
 *     Middle: painel ativo (full width)
 *     Bottom: ActionBar sticky (thumb feedback + Salvar/Citar)
 *
 * Filosofia (ADR-013 — universalista + visceral):
 *   - 5 Pilares visíveis com cor + ícone (fontes.tsx, mesmo contrato
 *     de Wave 23.2/25.2 — sem reinventar paleta).
 *   - Copy direto, sem floreio místico.
 *   - NÃO entope a tela — chat composer mínimo, cards colapsáveis.
 *   - Auxilia o Zelador a atender o cliente (não substitui).
 *
 * Integrações:
 *   - Wave 23.2 ThoughtChainView (caller passa `onOpenChain` opcional).
 *   - Wave 25.2 ConvergenceView (passa `convergence` prop opcional).
 *   - Wave 10.4 MentorChat é LINKADO (botão "abrir chat completo"),
 *     NÃO embutido — o componente full tem 1100+ linhas e merece rota.
 *
 * LGPD: discovery IDs e nome do cliente são o mínimo necessário.
 * Sem email/telefone/birthTime aqui (server filtra antes — sessionToView).
 */

import { useCallback, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Brain,
  ChevronRight,
  Compass,
  Heart,
  Lightbulb,
  MessageSquare,
  Quote,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

import { useTranslation } from '@/i18n';
import { cn } from '@/lib/shared/utils';

import {
  SOURCE_DISPLAY,
  sourceLabel,
  type DiscoverySource,
} from '@/components/akasha/discoveries/sources';

// ─── Types ──────────────────────────────────────────────────────────────────

export type EmotionalState = 'centrado' | 'ansioso' | 'perdido' | 'curioso';

export type AtendimentoTab = 'cliente' | 'chat' | 'insights';

export interface AtendimentoClientData {
  id: string;
  fullName: string;
  age: number;
  sunSign: string;
  /** "Iluminador · 11", "Caminho 7", etc — calculado server-side. */
  iluminador?: string | null;
  /** Estado emocional atual (Wave 9.1) — Zelador pode trocar inline. */
  emotionalState: EmotionalState;
}

export interface AtendimentoDiscovery {
  id: string;
  source: DiscoverySource;
  title: string;
  excerpt: string;
  symbolRef?: string;
  rankScore: number;
}

export type AtendimentoRating = 'up' | 'down';

export interface AtendimentoClientProps {
  locale: string;
  zeladorName: string;
  client: AtendimentoClientData;
  discoveries: AtendimentoDiscovery[];
  onSend?: (text: string) => void;
  onSave?: () => void;
  onCite?: (discoveryId: string) => void;
  onRate?: (discoveryId: string, rating: AtendimentoRating) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const PILAR_GRADIENT: Record<DiscoverySource, string> = {
  cabala: 'from-violet-500/20 to-violet-500/0',
  astrologia: 'from-amber-500/20 to-amber-500/0',
  tantra: 'from-rose-500/20 to-rose-500/0',
  odu: 'from-emerald-500/20 to-emerald-500/0',
  iching: 'from-blue-500/20 to-blue-500/0',
  literature: 'from-slate-500/20 to-slate-500/0',
};

const EMOTIONAL_LABEL_PT: Record<EmotionalState, string> = {
  centrado: 'Centrado',
  ansioso: 'Ansioso',
  perdido: 'Perdido',
  curioso: 'Curioso',
};

const EMOTIONAL_LABEL_EN: Record<EmotionalState, string> = {
  centrado: 'Centered',
  ansioso: 'Anxious',
  perdido: 'Lost',
  curioso: 'Curious',
};

// ─── Component ──────────────────────────────────────────────────────────────

export function AtendimentoClient(props: AtendimentoClientProps) {
  const { locale, zeladorName, client, discoveries, onSend, onSave, onCite, onRate } = props;
  const { t } = useTranslation();
  const isEn = locale === 'en';

  const [tab, setTab] = useState<AtendimentoTab>('chat');
  const [draft, setDraft] = useState('');
  const [emotional, setEmotional] = useState<EmotionalState>(client.emotionalState);
  const [rated, setRated] = useState<Record<string, AtendimentoRating>>({});
  const [savedFlash, setSavedFlash] = useState(false);

  const topDiscovery = useMemo(
    () => [...discoveries].sort((a, b) => b.rankScore - a.rankScore)[0],
    [discoveries]
  );

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend?.(text);
    setDraft('');
  }, [draft, onSend]);

  const handleRate = useCallback(
    (id: string, r: AtendimentoRating) => {
      setRated((prev) => ({ ...prev, [id]: r }));
      onRate?.(id, r);
    },
    [onRate]
  );

  const handleSave = useCallback(() => {
    onSave?.();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }, [onSave]);

  return (
    <div
      className="flex min-h-dvh w-full flex-col bg-background text-foreground"
      data-testid="atendimento-root"
      aria-label={t('atendimento.ariaLabel')}
    >
      {/* ─── Header: cliente context ────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 border-b border-white/10 bg-background/95 px-4 py-3 backdrop-blur"
        data-testid="atendimento-header"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {client.fullName}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {client.age} · {client.sunSign}
              </span>
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {client.iluminador ? (
                <>
                  <Sparkles className="mr-1 inline h-3 w-3 text-violet-400" />
                  {client.iluminador}
                </>
              ) : (
                <span>{t('atendimento.noIluminador')}</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            <span>{isEn ? EMOTIONAL_LABEL_EN[emotional] : EMOTIONAL_LABEL_PT[emotional]}</span>
          </div>
        </div>
      </header>

      {/* ─── Mobile tabs (≤ 768px) ──────────────────────────────────────── */}
      <nav
        className="flex border-b border-white/10 md:hidden"
        role="tablist"
        aria-label={t('atendimento.tabsAria')}
      >
        {(['cliente', 'chat', 'insights'] as const).map((tabKey) => {
          const active = tab === tabKey;
          return (
            <button
              key={tabKey}
              role="tab"
              aria-selected={active}
              aria-controls={`atendimento-panel-${tabKey}`}
              onClick={() => setTab(tabKey)}
              className={cn(
                'flex-1 px-3 py-2.5 text-xs font-medium uppercase tracking-wide transition',
                active
                  ? 'border-b-2 border-violet-400 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              data-testid={`atendimento-tab-${tabKey}`}
            >
              {t(`atendimento.tab.${tabKey}`)}
            </button>
          );
        })}
      </nav>

      {/* ─── Body: 2-col desktop / single panel mobile ──────────────────── */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left column: cliente details (desktop always; mobile only on 'cliente') */}
        <aside
          id="atendimento-panel-cliente"
          role="tabpanel"
          className={cn(
            'border-b border-white/10 p-4 md:w-72 md:shrink-0 md:border-b-0 md:border-r',
            tab === 'cliente' ? 'block' : 'hidden md:block'
          )}
          data-testid="atendimento-cliente-panel"
        >
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5" />
            {t('atendimento.context.title')}
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">{t('atendimento.context.name')}</dt>
              <dd className="font-medium">{client.fullName}</dd>
            </div>
            <div className="flex gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">{t('atendimento.context.age')}</dt>
                <dd>{client.age}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t('atendimento.context.sunSign')}</dt>
                <dd>{client.sunSign}</dd>
              </div>
            </div>
            {client.iluminador && (
              <div>
                <dt className="text-xs text-muted-foreground">{t('atendimento.context.iluminador')}</dt>
                <dd className="text-violet-300">{client.iluminador}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5">
            <p className="mb-2 text-xs text-muted-foreground">{t('atendimento.context.emotion')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(EMOTIONAL_LABEL_PT) as EmotionalState[]).map((st) => {
                const active = emotional === st;
                return (
                  <button
                    key={st}
                    onClick={() => setEmotional(st)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs transition',
                      active
                        ? 'border-violet-400 bg-violet-500/10 text-violet-200'
                        : 'border-white/10 text-muted-foreground hover:border-white/20'
                    )}
                    data-testid={`atendimento-emotion-${st}`}
                  >
                    {isEn ? EMOTIONAL_LABEL_EN[st] : EMOTIONAL_LABEL_PT[st]}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            {t('atendimento.zelador', { name: zeladorName })}
          </p>
        </aside>

        {/* Right column: chat composer + discoveries inline */}
        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col',
            tab === 'chat' || tab === 'insights' ? 'flex' : 'hidden md:flex'
          )}
          data-testid="atendimento-main"
        >
          {/* Hero insight (top, se houver) */}
          {topDiscovery && (
            <div
              id="atendimento-panel-insights"
              role="tabpanel"
              className={cn(
                'border-b border-white/10 p-4',
                tab === 'insights' ? 'block' : 'hidden md:block'
              )}
            >
              <DiscoveryCardView
                d={topDiscovery}
                isEn={isEn}
                t={t}
                rated={rated[topDiscovery.id]}
                onCite={onCite}
                onRate={handleRate}
                hero
              />
            </div>
          )}

          {/* Chat composer */}
          <div
            id="atendimento-panel-chat"
            role="tabpanel"
            className={cn(
              'flex-1 p-4',
              tab === 'chat' ? 'block' : 'hidden md:block'
            )}
          >
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Brain className="h-3.5 w-3.5" />
              {t('atendimento.chat.title')}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">{t('atendimento.chat.hint')}</p>

            {/* Inline discovery chips (não top — resto das cards) */}
            {discoveries.length > 1 && (
              <div className="mb-4 space-y-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" />
                  {t('atendimento.insights.title')} ({discoveries.length - 1})
                </p>
                <div className="space-y-2.5">
                  {discoveries.slice(1).map((d) => (
                    <DiscoveryCardView
                      key={d.id}
                      d={d}
                      isEn={isEn}
                      t={t}
                      rated={rated[d.id]}
                      onCite={onCite}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="sticky bottom-20 mt-2 flex items-end gap-2 rounded-lg border border-white/10 bg-background/95 p-2 backdrop-blur md:bottom-0">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('atendimento.chat.placeholder')}
                rows={1}
                className="min-h-[40px] max-h-32 flex-1 resize-none rounded-md bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                aria-label={t('atendimento.chat.placeholder')}
                data-testid="atendimento-chat-input"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                aria-label={t('atendimento.chat.send')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-500 text-white transition disabled:opacity-40"
                data-testid="atendimento-chat-send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ─── ActionBar (sticky bottom) ─────────────────────────────────── */}
      <footer
        className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t border-white/10 bg-background/95 px-4 py-2.5 backdrop-blur"
        data-testid="atendimento-actionbar"
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs transition hover:border-violet-400"
          aria-label={t('atendimento.action.save')}
          data-testid="atendimento-action-save"
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>{t('atendimento.action.save')}</span>
        </button>
        <button
          onClick={() => topDiscovery && onCite?.(topDiscovery.id)}
          disabled={!topDiscovery}
          aria-label={t('atendimento.action.cite')}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs transition hover:border-violet-400 disabled:opacity-40"
          data-testid="atendimento-action-cite"
        >
          <Quote className="h-3.5 w-3.5" />
          <span>{t('atendimento.action.cite')}</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => topDiscovery && handleRate(topDiscovery.id, 'up')}
            aria-label={t('atendimento.action.thumbUp')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border border-white/10 transition',
              rated[topDiscovery?.id ?? ''] === 'up'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                : 'text-muted-foreground hover:border-white/20'
            )}
            data-testid="atendimento-action-thumb-up"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => topDiscovery && handleRate(topDiscovery.id, 'down')}
            aria-label={t('atendimento.action.thumbDown')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border border-white/10 transition',
              rated[topDiscovery?.id ?? ''] === 'down'
                ? 'border-rose-400 bg-rose-500/10 text-rose-300'
                : 'text-muted-foreground hover:border-white/20'
            )}
            data-testid="atendimento-action-thumb-down"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>

      {/* Save flash */}
      {savedFlash && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1.5 text-xs text-white shadow-lg md:bottom-16"
        >
          {t('atendimento.action.savedFlash')}
        </div>
      )}
    </div>
  );
}

// ─── DiscoveryCardView (inline, not exported) ────────────────────────────────

interface DiscoveryCardViewProps {
  d: AtendimentoDiscovery;
  isEn: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  rated?: AtendimentoRating;
  hero?: boolean;
  onCite?: (id: string) => void;
  onRate: (id: string, r: AtendimentoRating) => void;
}

function DiscoveryCardView({ d, isEn, t, rated, hero, onCite, onRate }: DiscoveryCardViewProps) {
  const display = SOURCE_DISPLAY[d.source];
  const Icon = display.icon;
  const label = sourceLabel(d.source, isEn ? 'en' : 'pt-BR');

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br',
        PILAR_GRADIENT[d.source],
        hero && 'border-violet-400/30'
      )}
      data-testid={`atendimento-discovery-${d.id}`}
      data-source={d.source}
    >
      <div className="p-3.5">
        <header className="mb-2 flex items-start justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
              display.colorClass
            )}
          >
            <Icon className="h-3 w-3" aria-hidden />
            {label}
          </span>
          {d.symbolRef && (
            <span className="text-[10px] text-muted-foreground">{d.symbolRef}</span>
          )}
        </header>
        <h3 className="mb-1 text-sm font-semibold leading-tight">{d.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{d.excerpt}</p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRate(d.id, 'up')}
              aria-label={t('atendimento.action.thumbUp')}
              aria-pressed={rated === 'up'}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition',
                rated === 'up' ? 'bg-emerald-500/20 text-emerald-300' : 'text-muted-foreground hover:text-foreground'
              )}
              data-testid={`atendimento-rate-up-${d.id}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => onRate(d.id, 'down')}
              aria-label={t('atendimento.action.thumbDown')}
              aria-pressed={rated === 'down'}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition',
                rated === 'down' ? 'bg-rose-500/20 text-rose-300' : 'text-muted-foreground hover:text-foreground'
              )}
              data-testid={`atendimento-rate-down-${d.id}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => onCite?.(d.id)}
            className="flex items-center gap-0.5 text-[11px] text-muted-foreground transition hover:text-violet-300"
            aria-label={t('atendimento.action.cite')}
          >
            {t('atendimento.action.cite')}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
}