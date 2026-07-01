'use client';

// ============================================================================
// FeedbackDashboardClient — UI admin de feedback (Wave 33)
// ============================================================================
// Lista paginada com filtros client-side (delegando pra URL params),
// botões para atualizar status/priority, export CSV via ?format=csv.
// ============================================================================

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type FeedbackType =
  | 'BUG' | 'FEATURE' | 'CONTENT' | 'USABILITY' | 'COMMUNITY' | 'OTHER';
type FeedbackStatus =
  | 'NEW' | 'IN_REVIEW' | 'PLANNED' | 'DONE' | 'WONT_FIX';

interface FeedbackRow {
  id: string;
  userId: string | null;
  type: FeedbackType;
  category: string | null;
  rating: number | null;
  nps: number | null;
  message: string;
  status: FeedbackStatus;
  priority: number;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface NpsBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
}

interface FeedbackSummary {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  avgRating: number | null;
  avgNps: number | null;
  npsBreakdown: NpsBreakdown;
  openCount: number;
  resolvedLast7d: number;
}

interface Props {
  initialRows: FeedbackRow[];
  total: number;
  summary: FeedbackSummary;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: '🆕 Novo',
  IN_REVIEW: '🔍 Em revisão',
  PLANNED: '📅 Planejado',
  DONE: '✅ Concluído',
  WONT_FIX: '🚫 Não vou fazer',
};

const TYPE_LABELS: Record<FeedbackType, string> = {
  BUG: '🐛 Bug',
  FEATURE: '💡 Ideia',
  CONTENT: '📜 Conteúdo',
  USABILITY: '🎨 Usabilidade',
  COMMUNITY: '🤝 Comunidade',
  OTHER: '✨ Outro',
};

export function FeedbackDashboardClient({ initialRows, total, summary }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [rows] = useState<FeedbackRow[]>(initialRows);
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') ?? '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') ?? '');

  function applyFilters() {
    const sp = new URLSearchParams(searchParams.toString());
    if (typeFilter) sp.set('type', typeFilter); else sp.delete('type');
    if (statusFilter) sp.set('status', statusFilter); else sp.delete('status');
    sp.delete('page');
    startTransition(() => router.push(`/admin/feedback?${sp.toString()}`));
  }

  function exportCsv() {
    const sp = new URLSearchParams({
      format: 'csv',
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    });
    window.open(`/api/admin/feedback?${sp.toString()}`, '_blank');
  }

  async function updateRow(id: string, patch: Partial<Pick<FeedbackRow, 'status' | 'priority' | 'reviewNote'>>) {
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      alert('Erro ao atualizar feedback.');
      return;
    }
    startTransition(() => router.refresh());
  }

  const npsPct =
    summary.npsBreakdown.promoters +
      summary.npsBreakdown.passives +
      summary.npsBreakdown.detractors === 0
      ? null
      : Math.round(
          ((summary.npsBreakdown.promoters - summary.npsBreakdown.detractors) /
            (summary.npsBreakdown.promoters +
              summary.npsBreakdown.passives +
              summary.npsBreakdown.detractors)) *
            100,
        );

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <section
        aria-label="Resumo"
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <SummaryCard label="Total" value={total.toString()} />
        <SummaryCard
          label="NPS"
          value={npsPct === null ? '—' : `${npsPct > 0 ? '+' : ''}${npsPct}`}
          hint={
            npsPct === null
              ? 'Sem dados ainda'
              : `${summary.npsBreakdown.promoters}P · ${summary.npsBreakdown.passives}Pa · ${summary.npsBreakdown.detractors}D`
          }
        />
        <SummaryCard
          label="Abertos"
          value={summary.openCount.toString()}
          hint="NEW + IN_REVIEW + PLANNED"
        />
        <SummaryCard
          label="Resolvidos 7d"
          value={summary.resolvedLast7d.toString()}
          hint="DONE + WONT_FIX"
        />
      </section>

      {/* Filters + export */}
      <section
        aria-label="Filtros"
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
      >
        <div>
          <label htmlFor="filter-type" className="mb-1 block text-xs font-semibold uppercase tracking-wide">
            Tipo
          </label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {(Object.entries(TYPE_LABELS) as Array<[FeedbackType, string]>).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1 block text-xs font-semibold uppercase tracking-wide">
            Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {(Object.entries(STATUS_LABELS) as Array<[FeedbackStatus, string]>).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-md bg-spiritual-gold px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Exportar CSV
        </button>
      </section>

      {/* List */}
      <section aria-label="Submissões" className="space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum feedback corresponde aos filtros. ✨
          </p>
        ) : (
          rows.map((row) => (
            <article
              key={row.id}
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{TYPE_LABELS[row.type]}</span>
                  {row.category && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {row.category}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">·</span>
                  <time className="text-xs text-muted-foreground" dateTime={row.createdAt}>
                    {new Date(row.createdAt).toLocaleString('pt-BR')}
                  </time>
                  {row.priority > 0 && (
                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
                      {row.priority === 2 ? '🔥 Urgente' : '⚠️ Alta'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {STATUS_LABELS[row.status]}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm text-foreground">{row.message}</p>

              {(row.rating !== null || row.nps !== null) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {row.rating !== null && <>⭐ {row.rating}/5 </>}
                  {row.nps !== null && (
                    <>
                      · NPS {row.nps}/10
                      {row.nps >= 9 ? ' 😊' : row.nps >= 7 ? ' 😐' : ' 😟'}
                    </>
                  )}
                </p>
              )}

              {row.reviewNote && (
                <p className="mt-2 rounded-md bg-muted p-2 text-xs italic text-muted-foreground">
                  💬 Resposta: {row.reviewNote}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
                <div>
                  <label
                    htmlFor={`status-${row.id}`}
                    className="mb-1 block text-xs text-muted-foreground"
                  >
                    Mover status
                  </label>
                  <select
                    id={`status-${row.id}`}
                    defaultValue={row.status}
                    onChange={(e) =>
                      updateRow(row.id, { status: e.target.value as FeedbackStatus })
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    {(Object.entries(STATUS_LABELS) as Array<[FeedbackStatus, string]>).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`priority-${row.id}`}
                    className="mb-1 block text-xs text-muted-foreground"
                  >
                    Prioridade
                  </label>
                  <select
                    id={`priority-${row.id}`}
                    defaultValue={row.priority.toString()}
                    onChange={(e) =>
                      updateRow(row.id, { priority: parseInt(e.target.value, 10) })
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="0">Normal</option>
                    <option value="1">Alta</option>
                    <option value="2">Urgente</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const note = prompt('Nota visível ao usuário (deixe vazio para limpar):');
                    if (note !== null) updateRow(row.id, { reviewNote: note || null });
                  }}
                  className="rounded-md border border-border px-3 py-1 text-xs hover:bg-muted"
                >
                  Adicionar resposta
                </button>
                <span className="ml-auto text-xs text-muted-foreground">
                  id <code className="font-mono">{row.id.slice(0, 8)}</code>
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
