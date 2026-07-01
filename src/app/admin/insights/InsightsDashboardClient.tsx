// ============================================================================
// InsightsDashboardClient — UI interativa (Wave 34)
// ============================================================================
// Recebe PageData (gerada pelo server) e renderiza:
//   - Top insights prioritizados
//   - Recomendações
//   - Metric trends (sparklines)
//   - Cohort heatmap
//   - Funnel waterfall
//   - Anomaly alerts
//   - Export CSV
// ============================================================================

'use client';

import { useMemo, useState } from 'react';
import type {
  InsightsBundle,
  InsightCard,
  InsightType,
} from '@/lib/analytics/insights';
import type { CohortMatrix } from '@/lib/analytics/cohorts';
import type { FunnelResult, FunnelDelta } from '@/lib/analytics/funnels';

interface PageData {
  bundle: InsightsBundle;
  cohortMatrix: CohortMatrix | null;
  funnels: Array<{ id: string; result: FunnelResult; deltas: FunnelDelta[] | null }>;
  cohortHeatmap: Array<{ cohort: string; cells: Array<{ label: string; value: number; intensity: number }> }>;
  generatedAt: string;
  isDemoMode: boolean;
}

const TYPE_LABELS: Record<InsightType, string> = {
  ANOMALY: 'Anomalia',
  CHURN_RISK: 'Risco de Churn',
  POWER_USER: 'Power User',
  FUNNEL_DROP: 'Queda de Funil',
  COHORT_SHIFT: 'Mudança de Cohort',
  CONVERSION_OPP: 'Oportunidade de Conversão',
  RECOMMENDATION: 'Recomendação',
};

const TYPE_COLORS: Record<InsightType, string> = {
  ANOMALY: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100',
  CHURN_RISK: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
  POWER_USER: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
  FUNNEL_DROP: 'bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
  COHORT_SHIFT: 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
  CONVERSION_OPP: 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100',
  RECOMMENDATION: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-red-500/80 text-white',
  medium: 'bg-yellow-500/80 text-slate-900',
  low: 'bg-blue-500/80 text-white',
  info: 'bg-slate-500/80 text-white',
};

export function InsightsDashboardClient({ data }: { data: PageData }) {
  const [filter, setFilter] = useState<InsightType | 'ALL'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    if (filter === 'ALL') return data.bundle.cards;
    return data.bundle.cards.filter((c) => c.type === filter);
  }, [data.bundle.cards, filter]);

  return (
    <div className="space-y-8">
      {/* SECTION 1 — Summary stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Insights ativos" value={data.bundle.meta.totalCards} accent="text-slate-100" />
        <SummaryCard label="Severidade alta" value={data.bundle.meta.highSeverity} accent="text-amber-300" />
        <SummaryCard label="Críticos" value={data.bundle.meta.criticalSeverity} accent="text-red-300" />
        <SummaryCard label="Suprimidos (<priority)" value={data.bundle.meta.suppressedBelow} accent="text-slate-400" />
      </section>

      {/* SECTION 2 — Filter + Top Insights */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Top insights (priorizados)</h2>
          <div className="flex flex-wrap gap-1">
            <FilterPill label="Todos" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
            {(Object.keys(TYPE_LABELS) as InsightType[]).map((t) => (
              <FilterPill key={t} label={TYPE_LABELS[t]} active={filter === t} onClick={() => setFilter(t)} />
            ))}
          </div>
        </header>

        {filteredCards.length === 0 ? (
          <EmptyState message="Nenhum insight ativo. Tudo dentro do esperado." />
        ) : (
          <ul className="space-y-3">
            {filteredCards.map((card) => (
              <InsightCardItem key={card.id} card={card} expanded={expanded === card.id} onToggle={() => setExpanded(expanded === card.id ? null : card.id)} />
            ))}
          </ul>
        )}
      </section>

      {/* SECTION 3 — Cohort heatmap */}
      {data.cohortHeatmap.length > 0 && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Cohort heatmap (D1 / D7 / D30)</h2>
            <p className="text-xs text-slate-400">
              Retenção por cohort semanal signup. Cores: verde = alta, vermelho = baixa. Cohorts com &lt;5 users suprimidos.
            </p>
          </header>
          <CohortHeatmap data={data.cohortHeatmap} />
        </section>
      )}

      {/* SECTION 4 — Funnel waterfall */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Funis (waterfall)</h2>
          <p className="text-xs text-slate-400">Conversion em cada etapa + delta vs período anterior.</p>
        </header>
        <div className="space-y-6">
          {data.funnels.map((f) => (
            <FunnelWaterfall key={f.id} funnelId={f.id} result={f.result} deltas={f.deltas} />
          ))}
        </div>
      </section>

      {/* SECTION 5 — Recommendations */}
      <RecommendationsSection cards={data.bundle.cards.filter((c) => c.type === 'RECOMMENDATION' || c.type === 'CONVERSION_OPP')} />

      {/* SECTION 6 — Anomaly alerts */}
      <AnomalyAlertsSection cards={data.bundle.cards.filter((c) => c.type === 'ANOMALY')} />

      {/* SECTION 7 — Export CSV */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Exportar dados</h2>
          <p className="text-xs text-slate-400">Baixe insights e métricas em CSV para análise externa.</p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCSV('insights.csv', toCsv(data.bundle.cards))}
            className="rounded bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-500"
          >
            Export insights CSV ({data.bundle.cards.length})
          </button>
          {data.cohortMatrix && (
            <button
              type="button"
              onClick={() => downloadCSV('cohorts.csv', cohortCsv(data.cohortMatrix))}
              className="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600"
            >
              Export cohorts CSV ({data.cohortMatrix.rows.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadCSV('funnels.csv', funnelsCsv(data.funnels))}
            className="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600"
          >
            Export funnels CSV ({data.funnels.length})
          </button>
        </div>
      </section>

      <footer className="text-xs text-slate-500">
        Gerado em {new Date(data.generatedAt).toLocaleString('pt-BR')}. k-anonymity threshold = 5.
        {data.isDemoMode && ' Modo demo ativo.'}
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function InsightCardItem({ card, expanded, onToggle }: { card: InsightCard; expanded: boolean; onToggle: () => void }) {
  return (
    <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[card.type]}`}>
          {TYPE_LABELS[card.type]}
        </span>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase ${SEVERITY_COLORS[card.severity]}`}>
          {card.severity}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-slate-100">{card.title}</span>
          <span className="block text-xs text-slate-400">{card.description}</span>
        </span>
        <span className="shrink-0 text-xs text-slate-500">score {card.priorityScore}</span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
          {card.evidence.length > 0 && (
            <div>
              <p className="font-semibold text-slate-200">Evidências</p>
              <ul className="mt-1 list-disc pl-5">
                {card.evidence.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {card.actionItems.length > 0 && (
            <div>
              <p className="font-semibold text-slate-200">Ações</p>
              <ul className="mt-1 list-disc pl-5">
                {card.actionItems.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {card.estimatedImpact && (
            <p className="text-slate-400"><strong className="text-slate-200">Impacto estimado:</strong> {card.estimatedImpact}</p>
          )}
        </div>
      )}
    </li>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function CohortHeatmap({ data }: { data: PageData['cohortHeatmap'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-slate-800 bg-slate-950 px-2 py-1 text-left text-slate-400">Cohort</th>
            <th className="border border-slate-800 bg-slate-950 px-2 py-1 text-center text-slate-400">D1</th>
            <th className="border border-slate-800 bg-slate-950 px-2 py-1 text-center text-slate-400">D7</th>
            <th className="border border-slate-800 bg-slate-950 px-2 py-1 text-center text-slate-400">D30</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.cohort}>
              <td className="border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-slate-200">{row.cohort}</td>
              {row.cells.map((cell) => (
                <td
                  key={cell.label}
                  className="border border-slate-800 px-2 py-1 text-center font-medium"
                  style={{
                    backgroundColor: heatmapColor(cell.intensity),
                    color: cell.intensity > 0.5 ? '#fff' : '#0f172a',
                  }}
                  title={`${cell.label}: ${(cell.value * 100).toFixed(1)}%`}
                >
                  {(cell.value * 100).toFixed(0)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function heatmapColor(intensity: number): string {
  // 0..1 → red→yellow→green
  const x = Math.max(0, Math.min(1, intensity));
  if (x < 0.5) {
    const r = 239 - (239 - 234) * (x / 0.5);
    const g = 68 + (179 - 68) * (x / 0.5);
    const b = 68 + (8 - 68) * (x / 0.5);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const y = (x - 0.5) / 0.5;
  const r = 234 - (234 - 34) * y;
  const g = 179 + (197 - 179) * y;
  const b = 8 + (94 - 8) * y;
  return `rgb(${r}, ${g}, ${b})`;
}

function FunnelWaterfall({ funnelId, result, deltas }: { funnelId: string; result: FunnelResult; deltas: FunnelDelta[] | null }) {
  const topUsers = result.rows[0]?.users ?? 0;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-200">{funnelId}</h3>
      <div className="space-y-1">
        {result.rows.map((row, i) => {
          const widthPct = topUsers > 0 ? Math.max(2, (row.users / topUsers) * 100) : 0;
          const delta = deltas?.[i]?.diff ?? null;
          return (
            <div key={row.step.order} className="flex items-center gap-3 text-xs text-slate-300">
              <span className="w-40 truncate text-slate-400">{row.step.order}. {row.step.name}</span>
              <div className="relative h-6 flex-1 rounded bg-slate-800">
                <div
                  className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-cyan-500 to-cyan-300"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="absolute inset-y-0 left-2 flex items-center text-xs font-bold text-slate-900 mix-blend-difference">
                  {row.users}
                </span>
              </div>
              <span className="w-16 text-right font-mono">{(row.conversionFromPrev * 100).toFixed(1)}%</span>
              <span className="w-16 text-right">
                {delta !== null && (
                  <span className={delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-red-300' : 'text-slate-400'}>
                    {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}pp
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Overall: {(result.summary.overallConversion * 100).toFixed(1)}% | worst step:{' '}
        {result.summary.worstStep ? `${result.summary.worstStep.order} (−${result.summary.worstStep.dropFromPrev} users)` : 'n/a'}
      </p>
    </div>
  );
}

function RecommendationsSection({ cards }: { cards: InsightCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-slate-100">Recomendações e oportunidades</h2>
        <p className="text-xs text-slate-400">Ações priorizadas com impacto estimado.</p>
      </header>
      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.id} className="rounded border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-sm font-semibold text-slate-100">{c.title}</p>
            <p className="text-xs text-slate-400">{c.description}</p>
            <p className="mt-1 text-xs text-cyan-300">Impacto: {c.estimatedImpact ?? '—'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AnomalyAlertsSection({ cards }: { cards: InsightCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <header className="mb-3">
        <h2 className="text-lg font-semibold text-slate-100">Alertas de anomalia</h2>
        <p className="text-xs text-slate-400">Z-score &gt;= 2.5 em séries diárias. Requer investigação.</p>
      </header>
      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded border border-yellow-700/30 bg-yellow-900/10 p-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-xs text-slate-200">
              <p className="font-semibold">{c.title}</p>
              <p className="text-slate-400">{c.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ============================================================================
// CSV helpers
// ============================================================================

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(cards: InsightCard[]): string {
  const headers = ['id', 'type', 'severity', 'priorityScore', 'title', 'description', 'evidenceCount', 'actionCount', 'impact'];
  const rows = cards.map((c) => [
    c.id,
    c.type,
    c.severity,
    String(c.priorityScore),
    csvEscape(c.title),
    csvEscape(c.description),
    String(c.evidence.length),
    String(c.actionItems.length),
    csvEscape(c.estimatedImpact ?? ''),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function cohortCsv(matrix: CohortMatrix): string {
  const headers = ['cohort', 'totalUsers', 'isSmall', 'retentionD1', 'retentionD7', 'retentionD30', 'medianSessions'];
  const rows = matrix.rows.map((r) => [
    r.cohort,
    r.isSmall ? 'k-<5' : String(r.totalUsers),
    String(r.isSmall),
    r.retention.D1.toFixed(4),
    r.retention.D7.toFixed(4),
    r.retention.D30.toFixed(4),
    r.medianSessions?.toFixed(1) ?? '',
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function funnelsCsv(funnels: PageData['funnels']): string {
  const headers = ['funnelId', 'step', 'name', 'users', 'conversionFromPrev', 'conversionFromTop'];
  const rows: string[][] = [];
  for (const f of funnels) {
    for (const row of f.result.rows) {
      rows.push([
        f.id,
        String(row.step.order),
        csvEscape(row.step.name),
        String(row.users),
        row.conversionFromPrev.toFixed(4),
        row.conversionFromTop.toFixed(4),
      ]);
    }
  }
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
