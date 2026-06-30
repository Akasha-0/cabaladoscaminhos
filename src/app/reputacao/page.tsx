/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTAÇÃO DEMO PAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * Página demo mostrando:
 *   - Card de reputação da pessoa (ReputationCard)
 *   - Radar 5 eixos (AxisRadar)
 *   - Histórico de atribuições recebidas (público, sem reporterId)
 *   - Breakdown por contexto (consulta / peer / mentoria / comunidade / estudo)
 *   - Breakdown por tradição × eixo (25 cells, não-comparativo)
 *
 * Server component (default Next.js 14). Cards interativos via filhos 'use client'.
 *
 * Universalista: pessoa pode ser consulente OU consulente-consulente. Os 5
 * eixos funcionam igual pra ambos.
 *
 * LGPD: snapshot já vem sem PII. Histórico já vem stripado.
 */

import * as React from 'react';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import {
  ReputationCard,
} from '@/components/reputation/ReputationCard';
import { AxisRadar } from '@/components/reputation/AxisRadar';
import {
  AXIS_LABELS_PT_BR,
  TRADITION_LABELS_PT_BR,
} from '@/lib/w93/reputation-engine';
import {
  InMemoryReputationStorage,
} from '@/lib/w93/reputation-storage';
import {
  REPUTATION_AXES,
  TRADITIONS,
  asPersonId,
  type AttributionContext,
  type ReputationAxis,
  type ReputationSnapshot,
  type TraditionId,
} from '@/lib/w93/reputation-types';

// ════════════════════════════════════════════════════════════════════════════
// METADATA
// ════════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Reputação Universalista · Akasha',
  description:
    'Sistema de reputação multi-eixo, universalista e LGPD-first. 5 eixos (acolhimento, conhecimento, presença, contribuição, escuta) sem número único, sem ranking entre tradições.',
  robots: { index: false }, // página demo, não indexar
};

// ════════════════════════════════════════════════════════════════════════════
// DEMO DATA FACTORY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Cria dados de demonstração determinísticos — funciona offline, sem DB.
 * Seed usado: pessoa focal + 4 consulentes/pares dando feedback em várias
 * combinações de tradição × eixo × contexto.
 */
function makeDemoStorage(): InMemoryReputationStorage {
  const storage = new InMemoryReputationStorage({
    now: () => 1700000000000 + 90 * 24 * 60 * 60 * 1000, // agora "recente" (90 dias atrás + 90 = hoje)
  });

  const focal = asPersonId('person_focal_demo');

  // Opt-in explícito da pessoa focal
  storage.setConsent(focal, 'opted-in');

  // 4 pessoas diferentes dão feedback em diferentes combinações
  const peer1 = asPersonId('peer_aurea');
  const peer2 = asPersonId('peer_bruno');
  const peer3 = asPersonId('peer_camila');
  const peer4 = asPersonId('peer_davi');

  // Aurea — Candomblé, foco em acolhimento + presença
  storage.recordAttribution({
    fromPersonId: peer1,
    toPersonId: focal,
    axis: 'acolhimento',
    score: 5,
    tradition: 'Candomblé',
    context: 'consulta',
    consentGiven: true,
    note: 'Acolhimento genuíno, senti axé',
  });
  storage.recordAttribution({
    fromPersonId: peer1,
    toPersonId: focal,
    axis: 'presenca',
    score: 4,
    tradition: 'Candomblé',
    context: 'consulta',
    consentGiven: true,
  });

  // Bruno — Umbanda, foco em escuta + acolhimento
  storage.recordAttribution({
    fromPersonId: peer2,
    toPersonId: focal,
    axis: 'escuta',
    score: 5,
    tradition: 'Umbanda',
    context: 'peer',
    consentGiven: true,
  });
  storage.recordAttribution({
    fromPersonId: peer2,
    toPersonId: focal,
    axis: 'acolhimento',
    score: 4,
    tradition: 'Umbanda',
    context: 'comunidade',
    consentGiven: true,
  });

  // Camila — Ifá, foco em conhecimento + escuta
  storage.recordAttribution({
    fromPersonId: peer3,
    toPersonId: focal,
    axis: 'conhecimento',
    score: 5,
    tradition: 'Ifá',
    context: 'estudo',
    consentGiven: true,
    note: 'Domínio dos Odus impressiona',
  });
  storage.recordAttribution({
    fromPersonId: peer3,
    toPersonId: focal,
    axis: 'escuta',
    score: 4,
    tradition: 'Ifá',
    context: 'estudo',
    consentGiven: true,
  });

  // Davi — Astrologia, foco em conhecimento + contribuição
  storage.recordAttribution({
    fromPersonId: peer4,
    toPersonId: focal,
    axis: 'conhecimento',
    score: 4,
    tradition: 'Astrologia',
    context: 'mentoria',
    consentGiven: true,
  });
  storage.recordAttribution({
    fromPersonId: peer4,
    toPersonId: focal,
    axis: 'contribuicao',
    score: 5,
    tradition: 'Astrologia',
    context: 'comunidade',
    consentGiven: true,
  });

  // Mais uma camada: avaliação mista Cabala para mostrar multi-tradição
  storage.recordAttribution({
    fromPersonId: peer1,
    toPersonId: focal,
    axis: 'conhecimento',
    score: 3,
    tradition: 'Cabala',
    context: 'consulta',
    consentGiven: true,
  });
  storage.recordAttribution({
    fromPersonId: peer3,
    toPersonId: focal,
    axis: 'presenca',
    score: 4,
    tradition: 'Cabala',
    context: 'estudo',
    consentGiven: true,
  });

  return storage;
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE
// ════════════════════════════════════════════════════════════════════════════

export default function ReputacaoPage(): React.ReactElement {
  // Demo: storage in-memory com seed determinístico
  const storage = makeDemoStorage();
  const focalId = asPersonId('person_focal_demo');
  const snapshot = storage.getSnapshot(focalId) as ReputationSnapshot;
  const received = storage.listReceivedPublic(focalId);

  // Breakdown trad × eixo (25 cells)
  const tradByAxis: Record<TraditionId, Record<ReputationAxis, number>> = {} as Record<
    TraditionId,
    Record<ReputationAxis, number>
  >;
  for (const t of TRADITIONS) {
    const inner: Record<ReputationAxis, number> = {} as Record<ReputationAxis, number>;
    for (const ax of REPUTATION_AXES) {
      inner[ax] = 0;
    }
    tradByAxis[t] = inner;
  }
  for (const cell of snapshot.byTradition) {
    const row = tradByAxis[cell.tradition];
    if (row) {
      row[cell.axis] = Math.round(cell.score);
    }
  }

  // Contexto breakdown — labels pt-BR
  const CONTEXT_LABELS: Record<AttributionContext, string> = {
    consulta: 'Consulta',
    peer: 'Par a par',
    mentoria: 'Mentoria',
    comunidade: 'Comunidade',
    estudo: 'Estudo',
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950 px-4 py-8 sm:py-12"
      data-testid="reputacao-page"
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero / Manifesto */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            Reputação Universalista
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Cinco eixos vivos, sem número único. Candomblé, Umbanda, Ifá,
            Astrologia e Cabala coexistem sem hierarquia. Avaliação é opt-in,
            opt-out a qualquer momento, sem PII exposto.
          </p>
        </header>

        {/* Grid: card + radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ReputationCard
            snapshot={snapshot}
            showConsentControls
            compact={false}
          />
          <div className="flex items-center justify-center">
            <AxisRadar axes={snapshot.axes} size={360} />
          </div>
        </div>

        {/* Tradition × Axis breakdown */}
        <section
          className="mb-8 rounded-2xl border border-violet-500/20 bg-slate-900/60 p-4 sm:p-6"
          aria-labelledby="trad-axis-title"
        >
          <h2
            id="trad-axis-title"
            className="text-lg font-semibold text-violet-200 mb-1"
          >
            Tradição × Eixo
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Scores por tradição (não-comparativo — cada célula é independente).
            Valores 0–100.
          </p>
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              role="table"
              aria-label="Score por tradição e eixo"
              data-testid="trad-axis-table"
            >
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">
                    Tradição
                  </th>
                  {REPUTATION_AXES.map((ax) => (
                    <th
                      key={ax}
                      className="text-center py-2 px-2 text-slate-300 font-medium"
                    >
                      {AXIS_LABELS_PT_BR[ax]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRADITIONS.map((t: TraditionId) => (
                  <tr
                    key={t}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30"
                  >
                    <th
                      scope="row"
                      className="text-left py-3 px-2 text-violet-200 font-medium"
                    >
                      {TRADITION_LABELS_PT_BR[t]}
                    </th>
                    {REPUTATION_AXES.map((ax: ReputationAxis) => {
                      const value = tradByAxis[t]?.[ax] ?? 0;
                      return (
                        <td
                          key={ax}
                          className="text-center py-3 px-2 tabular-nums text-slate-300"
                        >
                          <span
                            className={cn(
                              'inline-flex items-center justify-center min-w-[3rem] rounded-md px-2 py-1',
                              value >= 60
                                ? 'bg-emerald-500/15 text-emerald-200'
                                : value >= 30
                                  ? 'bg-amber-500/15 text-amber-200'
                                  : 'bg-slate-700/40 text-slate-400',
                            )}
                          >
                            {value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Two-column: history + context breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Public history (no reporterId) */}
          <section
            className="rounded-2xl border border-violet-500/20 bg-slate-900/60 p-4 sm:p-6"
            aria-labelledby="history-title"
          >
            <h2
              id="history-title"
              className="text-lg font-semibold text-violet-200 mb-1"
            >
              Histórico público
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Atribuições recebidas (reporterId removido — LGPD layer 1).
            </p>
            <ul role="list" className="space-y-2" data-testid="history-list">
              {received.length === 0 ? (
                <li className="text-sm text-slate-500">
                  Nenhuma atribuição visível.
                </li>
              ) : (
                received.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 text-sm"
                    data-testid="history-item"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg" aria-hidden="true">
                        {a.score >= 4 ? '✨' : a.score <= 2 ? '⚠️' : '○'}
                      </span>
                      <span className="font-medium text-violet-100">
                        {AXIS_LABELS_PT_BR[a.axis]}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">
                        {TRADITION_LABELS_PT_BR[a.tradition]}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{a.context}</span>
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      Score {a.score}/5 ·{' '}
                      {new Date(a.createdAt).toISOString().split('T')[0]}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Context breakdown */}
          <section
            className="rounded-2xl border border-violet-500/20 bg-slate-900/60 p-4 sm:p-6"
            aria-labelledby="context-title"
          >
            <h2
              id="context-title"
              className="text-lg font-semibold text-violet-200 mb-1"
            >
              Por contexto
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Distribuição das atribuições por tipo de interação.
            </p>
            <ul role="list" className="space-y-2" data-testid="context-list">
              {(Object.keys(snapshot.contextBreakdown) as AttributionContext[]).map(
                (ctx: AttributionContext) => {
                  const count = snapshot.contextBreakdown[ctx] ?? 0;
                  const max = Math.max(
                    1,
                    ...Object.values(snapshot.contextBreakdown),
                  );
                  const pct = (count / max) * 100;
                  return (
                    <li
                      key={ctx}
                      className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-violet-100">
                          {CONTEXT_LABELS[ctx]}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full bg-slate-700/60 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemin={0}
                        aria-valuemax={max}
                        aria-label={`${CONTEXT_LABELS[ctx]}: ${count} atribuições`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          </section>
        </div>

        {/* Footer manifesto */}
        <footer className="mt-8 text-center text-xs text-slate-500 max-w-3xl mx-auto">
          <p>
            Esta página é uma demonstração do sistema de reputação universalista.
            Todos os dados são sintéticos. Nenhuma informação pessoal identificável
            é exibida. Termos sagrados preservados conforme GOAL.md: orixás, axé,
            Iemanjá, Odu, Odus, entidades.
          </p>
        </footer>
      </div>
    </main>
  );
}