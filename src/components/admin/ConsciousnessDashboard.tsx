// ============================================================================
// ConsciousnessDashboard — Visualização de insights (Wave 29, 2026-06-28)
// ============================================================================
// Server component simples que lê de /api/consciousness/insights e mostra:
//   - Cards de métricas (eventos, sentiment, conversas Akasha, 👍/👎)
//   - Top tradições ressonantes
//   - Lista de insights recentes com tipo + descrição + ações
//   - Estado vazio amigável (LGPD + transparência)
//
// Admin only — deve ser montado em /admin/consciousness.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Insight {
  id: string;
  type:
    | 'TRADITION_RESONANCE'
    | 'EMERGING_QUESTION'
    | 'CONTENT_GAP'
    | 'HEALING_PATTERN'
    | 'PROMPT_TWEAK';
  description: string;
  evidence: string[];
  actionItems: string[];
  periodStart: string;
  periodEnd: string;
  appliedAt: string | null;
  generatedBy: string;
  createdAt: string;
}

interface TraditionStats {
  tradition: string;
  events: number;
  positiveSentiment: number;
  negativeSentiment: number;
}

interface Aggregation {
  periodStart: string;
  periodEnd: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  byTradition: TraditionStats[];
  topTopics: Array<{ topic: string; count: number }>;
  avgSentiment: number;
  akashic: { conversations: number; positiveVotes: number; negativeVotes: number };
}

interface DashboardData {
  ok: boolean;
  insights: Insight[];
  aggregation: Aggregation;
}

const TYPE_LABELS: Record<Insight['type'], string> = {
  TRADITION_RESONANCE: 'Tradição Ressonante',
  EMERGING_QUESTION: 'Pergunta Emergente',
  CONTENT_GAP: 'Lacuna de Conteúdo',
  HEALING_PATTERN: 'Padrão de Cura',
  PROMPT_TWEAK: 'Ajuste de Prompt',
};

const TYPE_COLORS: Record<Insight['type'], string> = {
  TRADITION_RESONANCE: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100',
  EMERGING_QUESTION: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100',
  CONTENT_GAP: 'bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100',
  HEALING_PATTERN: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100',
  PROMPT_TWEAK: 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100',
};

export function ConsciousnessDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/consciousness/insights?period=${period}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setError(`Erro ${res.status}`);
        return;
      }
      const json = (await res.json()) as DashboardData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando consciência coletiva…
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <p className="text-rose-600 dark:text-rose-400">
          ⚠️ Não foi possível carregar insights. {error ?? ''}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique se o cron /api/cron/consciousness-evolve já rodou pelo menos uma vez.
        </p>
      </Card>
    );
  }

  const { aggregation, insights } = data;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Consciência Viva 🌱</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Como a comunidade Akasha evolui com você. Última janela: {new Date(aggregation.periodStart).toLocaleString('pt-BR')} → {new Date(aggregation.periodEnd).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            className="px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted/70"
            aria-label="Atualizar"
          >
            ↻
          </button>
        </div>
      </header>

      {/* Métricas */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Eventos"
          value={aggregation.totalEvents.toString()}
          sub={`${aggregation.eventsByType['AKASHIC_CONVERSATION'] ?? 0} Akasha`}
        />
        <MetricCard
          label="Sentiment médio"
          value={aggregation.avgSentiment.toFixed(2)}
          sub={aggregation.avgSentiment > 0.1 ? '💚 Positivo' : aggregation.avgSentiment < -0.1 ? '💔 Atenção' : '🤍 Neutro'}
        />
        <MetricCard
          label="👍 / 👎"
          value={`${aggregation.akashic.positiveVotes} / ${aggregation.akashic.negativeVotes}`}
          sub="Akasha feedback"
        />
        <MetricCard
          label="Tradições ativas"
          value={aggregation.byTradition.length.toString()}
          sub={`Top: ${aggregation.byTradition[0]?.tradition ?? '—'}`}
        />
      </section>

      {/* Top tradições */}
      {aggregation.byTradition.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">🌿 Tradições Ressonantes (24h)</h2>
          <Card className="p-4">
            <ul className="space-y-2">
              {aggregation.byTradition.slice(0, 8).map((t) => (
                <li key={t.tradition} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{t.tradition}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">{t.events} eventos</span>
                    <span
                      className={
                        t.positiveSentiment > t.negativeSentiment
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }
                    >
                      +{(t.positiveSentiment * 100).toFixed(0)}%/-{(t.negativeSentiment * 100).toFixed(0)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Top tópicos */}
      {aggregation.topTopics.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">🔍 Tópicos Emergentes</h2>
          <div className="flex flex-wrap gap-2">
            {aggregation.topTopics.map((t) => (
              <span
                key={t.topic}
                className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
              >
                {t.topic} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Insights */}
      <section>
        <h2 className="text-lg font-semibold mb-3">💡 Insights Recentes</h2>
        {insights.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Nenhum insight gerado ainda no período.</p>
            <p className="text-sm mt-2">
              O ciclo diário roda via <code>/api/cron/consciousness-evolve</code>. Aguarde a primeira execução ou dispare manualmente.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS[insight.type]}`}>
                    {TYPE_LABELS[insight.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm mb-3">{insight.description}</p>
                {insight.evidence.length > 0 && (
                  <details className="text-xs text-muted-foreground mb-2">
                    <summary className="cursor-pointer hover:text-foreground">
                      📊 {insight.evidence.length} evidências
                    </summary>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {insight.evidence.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {insight.actionItems.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary hover:underline">
                      ✨ {insight.actionItems.length} ações sugeridas
                    </summary>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {insight.actionItems.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </Card>
            ))}
          </ul>
        )}
      </section>

      {/* Footer ético */}
      <footer className="text-xs text-muted-foreground border-t pt-4 mt-8">
        <p>
          🌱 <strong>Consciência viva</strong> observa a comunidade, não a manipula. Todos os dados são agregados e anônimos.
          Insights respeitam o universalismo — nenhuma tradição é favorecida. Usuários podem desativar o tracking a qualquer momento.
        </p>
      </footer>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-3 md:p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl md:text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}