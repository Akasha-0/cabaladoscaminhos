'use client';

/**
 * AttendanceClient — Wave 22.2 Zelador Attendance UI (Visceral)
 *
 * Componente raiz do fluxo `/atendimento`. Monta o layout:
 *
 *   Desktop (≥ 768px):
 *     ┌────────────────────────────────────────────────┐
 *     │  Top bar — Cliente + Zelador + estado atual    │
 *     ├──────────────────┬─────────────────────────────┤
 *     │  Chat Mentor     │  Insights IA                │
 *     │  (stream)        │  (Discovery cards)          │
 *     │                  │                             │
 *     ├──────────────────┴─────────────────────────────┤
 *     │  ActionBar (Salvar | Citar | 👍 | 👎 | input) │
 *     └────────────────────────────────────────────────┘
 *
 *   Mobile (≤ 480px):
 *     - Top bar (sempre)
 *     - 1 coluna, com tabs no topo: Cliente | Insights | Chat
 *     - ActionBar sticky no bottom (chat input prioritário)
 *
 * Por que client island:
 *   - `useEmotionalState` lê localStorage (Wave 9.1).
 *   - Chat Mentor usa streaming (Wave 10.4) — fetch + ReadableStream.
 *   - ActionBar faz POST /api/feedback (Wave 13.5 + Wave 22.1).
 *   - Layout muda via window.matchMedia (CSS) — não precisa JS.
 *
 * Estado emocional rápido (Wave 9.1):
 *   - 4 toggles no top bar permitem trocar o estado do cliente SEM
 *     re-passar pelo StatePicker cheio (1-click, sem modal).
 *
 * Universalista + visceral (ADR-013):
 *   - Sem texto místico-desnecessário; fala direto.
 *   - Insights sempre vêm com `source` (qual Pilar) e `symbolRef`
 *     (qual glifo/hexagrama/odú concreto) — sem floating abstractions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from '@/i18n';
import {
  type EmotionalState,
  useEmotionalState,
} from '@/lib/state/emotional-state';

import { ActionBar } from './components/ActionBar';
import { ClientCard } from './components/ClientCard';
import { DiscoveryCard } from './components/DiscoveryCard';
import { EmotionalStateToggle } from './components/EmotionalStateToggle';
import type {
  AttendanceClient as AttendanceClientData,
  AttendanceDiscovery,
  AttendanceTab,
} from './shared';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface AttendanceClientProps {
  /** Locale atual (pt-BR | en). */
  locale: string;
  /** Nome do Zelador (extraído do JWT no server component). */
  zeladorName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────────────────────────────
//
// Em produção, esses dois arrays virão de:
//   - client: /api/attendance/active (último consulente em sessão)
//   - discoveries: /api/discoveries/recent?userId=...
//
// Para a Wave 22.2 (UI visceral), mockamos dados plausíveis que seguem
// o mesmo shape do backend. Substituímos por fetch real na Wave 22.3.
//

const DEMO_CLIENT: AttendanceClientData = {
  id: 'consulente_demo_001',
  fullName: 'João Silva',
  age: 34,
  sunSign: 'Escorpião',
  birthCity: 'Salvador, BA',
  emotionalState: 'ansioso',
};

const DEMO_DISCOVERIES: AttendanceDiscovery[] = [
  {
    id: 'disc_a1b2',
    source: 'cabala',
    title: 'Propósito é direção',
    excerpt:
      'Caminho de Vida 11 — O Iluminador. Quando a ansiedade paralisa, o propósito realinha: espiritualidade intensa, idealismo prático.',
    symbolRef: 'Iluminador · 11',
    rankScore: 0.92,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'disc_c3d4',
    source: 'iching',
    title: 'Hexagrama 29 — O Abismo',
    excerpt:
      'Água sobre água: repetição carrega, mas também afoga. Quando o consulente sente que repete padrões, é hora de cessar e ouvir.',
    symbolRef: 'Hexagrama 29 · Kan',
    rankScore: 0.81,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'disc_e5f6',
    source: 'astrologia',
    title: 'Trígono Sol-Lua natal',
    excerpt:
      'Aspecto de fluidez emocional. Mesmo em ansiedade, o consulente acessa rapidamente o centro — basta nomear o que sente.',
    symbolRef: 'Sol em Escorpião ☌ Lua em Peixes',
    rankScore: 0.74,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AttendanceClient({ locale, zeladorName }: AttendanceClientProps) {
  const { t } = useTranslation();

  // Cliente ativo (mock até a Wave 22.3).
  const [client, setClient] = useState<AttendanceClientData>(DEMO_CLIENT);

  // Insights gerados na sessão (mock inicial, podem crescer ao longo do tempo).
  const [discoveries, setDiscoveries] = useState<AttendanceDiscovery[]>(DEMO_DISCOVERIES);

  // Chat Mentor — estado local mínimo (input + mensagens). A integração real
  // com /api/mentor/ask acontece via MentorChat abaixo.
  const [chatInput, setChatInput] = useState('');

  // Tab ativo no mobile.
  const [activeTab, setActiveTab] = useState<AttendanceTab>('cliente');

  // Rating/commit por discovery — track localmente para feedback optimista.
  const [ratedDiscoveries, setRatedDiscoveries] = useState<
    Record<string, 'up' | 'down'>
  >({});

  // Estado emocional do cliente (Wave 9.1) — toggle rápido.
  // NOTA: aqui sobrescrevemos o estado emocional do Zelador com o do cliente.
  // Em produção, o estado do cliente virá do próprio User (consulente).
  const emotional = useEmotionalState();

  // Sincroniza o estado emocional inicial do mock com o hook.
  useEffect(() => {
    if (emotional.hydrated && emotional.state !== client.emotionalState) {
      setClient((c) => ({ ...c, emotionalState: emotional.state ?? c.emotionalState }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotional.hydrated]);

  const handleEmotionalChange = useCallback(
    (next: EmotionalState) => {
      emotional.setState(next);
      setClient((c) => ({ ...c, emotionalState: next }));
    },
    [emotional]
  );

  // ─── Action handlers ─────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    // POST /api/attendance/:id/save — fora do escopo W22.2.
    // Aqui só disparamos um toast visual (alert) para confirmar o flow.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-alert
      window.alert(t('atendimento.actionBar.saveToast'));
    }
  }, [t]);

  const handleCite = useCallback(
    (discoveryId: string) => {
      // POST /api/attendance/:id/cite — fora do escopo W22.2.
      // Marcamos visualmente como citado (estado local).
      setDiscoveries((ds) =>
        ds.map((d) =>
          d.id === discoveryId ? { ...d, rankScore: Math.min(1, d.rankScore + 0.1) } : d
        )
      );
    },
    []
  );

  const handleRate = useCallback(
    (discoveryId: string, rating: 'up' | 'down') => {
      // Optimistic UI — atualiza imediatamente.
      setRatedDiscoveries((prev) => ({ ...prev, [discoveryId]: rating }));

      // POST /api/feedback/discoveries (Wave 22.1 — ainda sendo mergeado em paralelo).
      // Não bloqueamos o flow se o endpoint não estiver disponível — o feedback
      // local fica salvo em localStorage como fallback.
      if (typeof window !== 'undefined') {
        fetch('/api/feedback/discoveries', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ discoveryId, rating }),
        }).catch(() => {
          // Silencioso — fallback localStorage é responsabilidade de outra camada.
        });
      }
    },
    []
  );

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    // A integração real com /api/mentor/ask acontece via MentorChat (Wave 10.4).
    // Aqui só limpamos o input — o componente MentorChat consome o input via prop.
    // Para Wave 22.2 UI, mantemos o input local + placeholder.
    setChatInput('');
  }, [chatInput]);

  // ─── Counts para ActionBar ───────────────────────────────────────────────
  const counts = useMemo(() => {
    const total = discoveries.length;
    const cited = discoveries.filter((d) => d.rankScore > 0.85).length;
    const rated = Object.keys(ratedDiscoveries).length;
    return { total, cited, rated };
  }, [discoveries, ratedDiscoveries]);

  // ─── i18n labels (resolvidos uma vez, passados como props) ────────────────
  const labels = useMemo(
    () => ({
      topBar: {
        greeting: t('atendimento.topBar.greeting', { zelador: zeladorName }),
        clientSummary: t('atendimento.topBar.clientSummary', {
          name: client.fullName.split(' ')[0],
          age: client.age,
          sign: client.sunSign,
        }),
        sessionTag: t('atendimento.topBar.sessionTag'),
      },
      tabs: {
        cliente: t('atendimento.tabs.cliente'),
        insights: t('atendimento.tabs.insights', { count: counts.total }),
        chat: t('atendimento.tabs.chat'),
      },
      empty: {
        insightsTitle: t('atendimento.empty.insightsTitle'),
        insightsBody: t('atendimento.empty.insightsBody'),
        chatTitle: t('atendimento.empty.chatTitle'),
        chatBody: t('atendimento.empty.chatBody'),
      },
      actionBar: {
        saveLabel: t('atendimento.actionBar.save'),
        citeLabel: t('atendimento.actionBar.cite'),
        upvoteLabel: t('atendimento.actionBar.upvote'),
        downvoteLabel: t('atendimento.actionBar.downvote'),
        saveAriaLabel: t('atendimento.actionBar.saveAriaLabel'),
        citeAriaLabel: t('atendimento.actionBar.citeAriaLabel'),
        chatPlaceholder: t('atendimento.actionBar.chatPlaceholder'),
        sendAriaLabel: t('atendimento.actionBar.sendAriaLabel'),
        cited: t('atendimento.actionBar.cited'),
        rated: t('atendimento.actionBar.rated'),
      },
      emotional: {
        centrado: t('atendimento.emotional.centrado'),
        ansioso: t('atendimento.emotional.ansioso'),
        perdido: t('atendimento.emotional.perdido'),
        curioso: t('atendimento.emotional.curioso'),
      },
      discovery: {
        pillarLabel: t('atendimento.discovery.pillarLabel'),
        cited: t('atendimento.discovery.cited'),
        upvoted: t('atendimento.discovery.upvoted'),
        downvoted: t('atendimento.discovery.downvoted'),
      },
    }),
    [t, zeladorName, client, counts]
  );

  return (
    <main
      className="bg-ak-bg-cosmic-gradient min-h-[calc(100vh-56px)] px-0 py-0"
      data-testid="attendance-hub"
    >
      <div className="max-w-[var(--ak-container-wide)] mx-auto flex flex-col gap-3 md:gap-4">
        {/* ─── Top bar: Zelador + cliente + estado emocional ─────────────── */}
        <header
          className="flex flex-col gap-3 px-4 pt-4 md:px-6 md:pt-6"
          data-testid="attendance-top-bar"
        >
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <p className="text-xs text-ak-text-subtle uppercase tracking-[0.2em] m-0">
              {labels.topBar.greeting}
            </p>
            <span
              className="text-[10px] uppercase tracking-[0.15em] text-ak-accent-aurora/80 px-2 py-0.5 rounded-full border border-ak-accent-aurora/30"
              data-testid="attendance-session-tag"
            >
              {labels.topBar.sessionTag}
            </span>
          </div>

          <ClientCard client={client} locale={locale} />

          {emotional.hydrated && (
            <EmotionalStateToggle
              value={client.emotionalState}
              onChange={handleEmotionalChange}
              labels={labels.emotional}
            />
          )}
        </header>

        {/* ─── Mobile tabs (≤ 480px) ────────────────────────────────────── */}
        <nav
          className="flex md:hidden gap-1 px-4 border-b border-white/10"
          role="tablist"
          aria-label={t('atendimento.tabs.ariaLabel')}
          data-testid="attendance-mobile-tabs"
        >
          {(['cliente', 'insights', 'chat'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm transition-colors border-b-2 ${
                  isActive
                    ? 'text-ak-text-primary border-ak-accent-aurora'
                    : 'text-ak-text-subtle border-transparent hover:text-white/70'
                }`}
                data-testid={`attendance-tab-${tab}`}
              >
                {tab === 'cliente'
                  ? labels.tabs.cliente
                  : tab === 'insights'
                    ? labels.tabs.insights
                    : labels.tabs.chat}
              </button>
            );
          })}
        </nav>

        {/* ─── Layout principal: 2 colunas (desktop) / stack (mobile) ───── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-32 md:pb-28 md:px-6"
          data-testid="attendance-layout"
        >
          {/* Mobile-only: tab "cliente" mostra emotional toggle + client card
              (já renderizados no top bar). Aqui só escondemos/mostramos
              dependendo do tab. Usamos CSS `md:` para layout. */}
          <section
            className={`md:block ${activeTab === 'cliente' ? 'block' : 'hidden'}`}
            data-testid="attendance-cliente-section"
            aria-labelledby="attendance-cliente-heading"
          >
            <h2
              id="attendance-cliente-heading"
              className="sr-only"
            >
              {labels.tabs.cliente}
            </h2>
            {/* Mobile-only: mostra um card-resumo do consulente aqui,
                já que o emotional toggle aparece no top bar. */}
            <div className="md:hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm text-ak-text-primary m-0">
                {labels.topBar.clientSummary}
              </p>
            </div>
          </section>

          {/* Insights IA — coluna direita (desktop) / tab "insights" (mobile) */}
          <section
            className={`flex flex-col gap-3 md:order-2 ${
              activeTab === 'insights' ? 'block' : 'hidden md:flex'
            }`}
            data-testid="attendance-insights-section"
            aria-labelledby="attendance-insights-heading"
          >
            <h2
              id="attendance-insights-heading"
              className="text-xs uppercase tracking-[0.2em] text-ak-text-subtle m-0 px-1"
            >
              {labels.tabs.insights}
            </h2>

            {discoveries.length === 0 ? (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center"
                data-testid="attendance-insights-empty"
              >
                <p className="text-sm text-ak-text-primary font-medium m-0 mb-1">
                  {labels.empty.insightsTitle}
                </p>
                <p className="text-xs text-ak-text-subtle m-0">
                  {labels.empty.insightsBody}
                </p>
              </div>
            ) : (
              discoveries.map((d) => (
                <DiscoveryCard
                  key={d.id}
                  discovery={d}
                  locale={locale}
                  currentRating={ratedDiscoveries[d.id]}
                  labels={labels.discovery}
                  onCite={handleCite}
                  onRate={handleRate}
                />
              ))
            )}
          </section>

          {/* Chat Mentor — coluna esquerda (desktop) / tab "chat" (mobile) */}
          <section
            className={`flex flex-col gap-2 md:order-1 ${
              activeTab === 'chat' ? 'block' : 'hidden md:flex'
            }`}
            data-testid="attendance-chat-section"
            aria-labelledby="attendance-chat-heading"
          >
            <h2
              id="attendance-chat-heading"
              className="text-xs uppercase tracking-[0.2em] text-ak-text-subtle m-0 px-1"
            >
              {labels.tabs.chat}
            </h2>

            <div
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 min-h-[120px] flex flex-col gap-2"
              data-testid="attendance-chat-empty"
            >
              <p className="text-sm text-ak-text-primary font-medium m-0">
                {labels.empty.chatTitle}
              </p>
              <p className="text-xs text-ak-text-subtle m-0">
                {labels.empty.chatBody}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ─── ActionBar sticky (bottom) ─────────────────────────────────── */}
      <ActionBar
        inputValue={chatInput}
        onInputChange={setChatInput}
        onSend={handleSendChat}
        onSave={handleSave}
        onCite={
          discoveries.length > 0
            ? () => handleCite(discoveries[0].id)
            : undefined
        }
        counts={counts}
        labels={labels.actionBar}
      />
    </main>
  );
}

export default AttendanceClient;
