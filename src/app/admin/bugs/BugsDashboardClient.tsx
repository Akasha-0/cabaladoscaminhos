'use client';

// ============================================================================
// BugsDashboardClient — bug list + filters + actions (Wave 36)
// ============================================================================
// Renders severity matrix, status filters, links to Sentry fingerprints and
// patch ids. Mutations go to /api/admin/bugs/[id].
// ============================================================================

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type BugStatus = 'NEW' | 'INVESTIGATING' | 'IN_PROGRESS' | 'FIXED' | 'CLOSED';
type BugSeverity = 'P0' | 'P1' | 'P2' | 'P3';
type BugReproducibility = 'ALWAYS' | 'INTERMITTENT' | 'ONCE' | 'UNKNOWN';

interface BugRow {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  severity: BugSeverity;
  affectedUserCount: number;
  affectedUsers: number;
  affectedScreens: string[];
  reproducibility: BugReproducibility;
  sentryFingerprint: string | null;
  patchId: string | null;
  introducedIn: string | null;
  fixedIn: string | null;
  fixVersion: string | null;
  reportedBy: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

interface BugSummary {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openCount: number;
  fixedLast7d: number;
  medianTimeToFixHours: number | null;
}

interface Props {
  initialBugs: BugRow[];
  summary: BugSummary;
}

const STATUS_LABELS: Record<BugStatus, string> = {
  NEW: '🆕 Novo',
  INVESTIGATING: '🔍 Investigando',
  IN_PROGRESS: '⚙️ Em progresso',
  FIXED: '✅ Corrigido',
  CLOSED: '📁 Fechado',
};

const SEVERITY_LABELS: Record<BugSeverity, string> = {
  P0: '🔴 P0 — page on-call',
  P1: '🟠 P1 — esta wave',
  P2: '🟡 P2 — próxima wave',
  P3: '⚪ P3 — backlog',
};

const SEVERITY_COLOR: Record<BugSeverity, string> = {
  P0: 'bg-red-500/15 text-red-300 border-red-500/40',
  P1: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
  P2: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
  P3: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
};

const REPRO_LABELS: Record<BugReproducibility, string> = {
  ALWAYS: 'sempre',
  INTERMITTENT: 'intermitente',
  ONCE: 'uma vez',
  UNKNOWN: '?',
};

export function BugsDashboardClient({ initialBugs, summary }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [bugs] = useState<BugRow[]>(initialBugs);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') ?? '');
  const [severityFilter, setSeverityFilter] = useState<string>(searchParams.get('severity') ?? '');

  function applyFilters() {
    const sp = new URLSearchParams(searchParams.toString());
    if (statusFilter) sp.set('status', statusFilter); else sp.delete('status');
    if (severityFilter) sp.set('severity', severityFilter); else sp.delete('severity');
    startTransition(() => router.push(`/admin/bugs?${sp.toString()}`));
  }

  async function updateRow(id: string, patch: Partial<Pick<BugRow, 'status' | 'severity' | 'assignedTo'>>) {
    const res = await fetch(`/api/admin/bugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      alert('Erro ao atualizar bug.');
      return;
    }
    startTransition(() => router.refresh());
  }

  const filtered = bugs.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (severityFilter && b.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Severity matrix */}
      <section aria-label="Matriz de severidade" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['P0', 'P1', 'P2', 'P3'] as BugSeverity[]).map((sev) => (
          <div key={sev} className={`rounded-lg border px-4 py-3 ${SEVERITY_COLOR[sev]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">{sev}</p>
            <p className="mt-1 font-mono text-2xl">{summary.bySeverity[sev] ?? 0}</p>
            <p className="mt-1 text-xs opacity-80">{SEVERITY_LABELS[sev].split('—')[1]?.trim() ?? ''}</p>
          </div>
        ))}
      </section>

      {/* Status summary */}
      <section aria-label="Status" className="flex flex-wrap gap-3 rounded-lg border border-border p-4 text-sm">
        <span>Total: <strong>{summary.total}</strong></span>
        <span>· Abertos: <strong>{summary.openCount}</strong></span>
        <span>· 7d: <strong>{summary.fixedLast7d}</strong></span>
        {summary.medianTimeToFixHours !== null && (
          <span>· Median TTF: <strong>{summary.medianTimeToFixHours}h</strong></span>
        )}
      </section>

      {/* Filters */}
      <section aria-label="Filtros" className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4">
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
            {(Object.entries(STATUS_LABELS) as Array<[BugStatus, string]>).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-severity" className="mb-1 block text-xs font-semibold uppercase tracking-wide">
            Severidade
          </label>
          <select
            id="filter-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {(Object.entries(SEVERITY_LABELS) as Array<[BugSeverity, string]>).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
        >
          Aplicar
        </button>
      </section>

      {/* Bug list */}
      <section aria-label="Bugs" className="space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum bug corresponde aos filtros.
          </p>
        ) : (
          filtered.map((b) => (
            <article
              key={b.id}
              className="rounded-lg border border-border bg-card/30 p-4 space-y-2"
              aria-labelledby={`bug-${b.id}-title`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded border px-2 py-0.5 text-xs font-bold ${SEVERITY_COLOR[b.severity]}`}>
                  {b.severity}
                </span>
                <select
                  value={b.status}
                  onChange={(e) => updateRow(b.id, { status: e.target.value as BugStatus })}
                  className="rounded border border-border bg-background px-2 py-1 text-xs"
                  aria-label="Status"
                >
                  {(Object.entries(STATUS_LABELS) as Array<[BugStatus, string]>).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  👥 {b.affectedUserCount} · 🖼️ {b.affectedScreens.length} telas
                </span>
                <span className="text-xs text-muted-foreground">
                  🎲 repro: {REPRO_LABELS[b.reproducibility]}
                </span>
                {b.sentryFingerprint && (
                  <a
                    href={`https://sentry.io/discover/?query=${encodeURIComponent(b.sentryFingerprint)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-purple-600/20 px-2 py-0.5 text-xs text-purple-200 hover:bg-purple-600/30"
                  >
                    🔗 Sentry
                  </a>
                )}
                {b.patchId && (
                  <span className="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-200">
                    🩹 patch {b.patchId.slice(0, 14)}…
                  </span>
                )}
                {b.fixedIn && (
                  <span className="rounded bg-amber-600/20 px-2 py-0.5 text-xs text-amber-200">
                    ✅ {b.fixedIn}{b.fixVersion ? ` · ${b.fixVersion}` : ''}
                  </span>
                )}
              </div>
              <h3 id={`bug-${b.id}-title`} className="font-serif text-base font-semibold">
                {b.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
              {b.affectedScreens.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {b.affectedScreens.map((s) => (
                    <span key={s} className="rounded bg-slate-700/40 px-2 py-0.5 text-xs font-mono text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>id: <code className="font-mono">{b.id}</code></span>
                <span>criado: {new Date(b.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}