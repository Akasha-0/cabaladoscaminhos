'use client';

// ============================================================================
// CohortsClient — Cohort analysis interactive UI (Wave 38)
// ============================================================================
// Fetches /api/admin/cohorts with filters; renders heatmap, retention
// line chart, churn risk panel.
// ============================================================================

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CohortMatrix } from '@/lib/analytics/cohorts';

interface CohortsResponse {
  matrix: CohortMatrix;
  summary: {
    totalCohorts: number;
    avgRetentionD1: number;
    avgRetentionD7: number;
    avgRetentionD30: number;
    avgSessionsPerWeek: number;
    totalUsers: number;
    churnRiskCount: number;
  };
  filters: Record<string, string | undefined>;
}

interface Facets {
  traditions: string[];
  regions: string[];
  ageRanges: string[];
}

export function CohortsClient({
  filters,
  facets,
}: {
  filters: { week?: string; tradition?: string; region?: string; ageRange?: string };
  facets: Facets;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CohortsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      if (filters.week) sp.set('week', filters.week);
      if (filters.tradition) sp.set('tradition', filters.tradition);
      if (filters.region) sp.set('region', filters.region);
      if (filters.ageRange) sp.set('ageRange', filters.ageRange);
      const qs = sp.toString();
      const res = await fetch(`/api/admin/cohorts${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
      if (!res.ok) {
        setError(`Erro ${res.status}`);
        return;
      }
      const json = (await res.json()) as { ok: boolean; data: CohortsResponse };
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters.week, filters.tradition, filters.region, filters.ageRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateFilter = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/cohorts?${next.toString()}`);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Carregando cohorts…</div>;
  }
  if (error || !data) {
    return (
      <div className="rounded border border-rose-700 bg-rose-900/20 p-4 text-rose-200">
        ⚠️ Não foi possível carregar cohorts. {error ?? ''}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Filters */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Filtros</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <FilterSelect
            label="Cohort week"
            value={filters.week}
            options={generateWeekOptions()}
            onChange={(v) => updateFilter('week', v)}
            placeholder="Todas"
          />
          <FilterSelect
            label="Tradição"
            value={filters.tradition}
            options={facets.traditions}
            onChange={(v) => updateFilter('tradition', v)}
            placeholder="Todas"
          />
          <FilterSelect
            label="Região"
            value={filters.region}
            options={facets.regions}
            onChange={(v) => updateFilter('region', v)}
            placeholder="Todas"
          />
          <FilterSelect
            label="Faixa etária"
            value={filters.ageRange}
            options={facets.ageRanges}
            onChange={(v) => updateFilter('ageRange', v)}
            placeholder="Todas"
          />
        </div>
      </section>

      {/* SECTION 2 — Summary stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryStat label="Cohorts" value={data.summary.totalCohorts} accent="text-slate-100" />
        <SummaryStat label="Users (k≥5)" value={data.summary.totalUsers} accent="text-cyan-300" />
        <SummaryStat
          label="D7 retention"
          value={`${(data.summary.avgRetentionD7 * 100).toFixed(1)}%`}
          accent="text-emerald-300"
        />
        <SummaryStat
          label="Churn risk"
          value={data.summary.churnRiskCount}
          accent="text-amber-300"
        />
      </section>

      {/* SECTION 3 — Retention heatmap */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Heatmap de retenção</h2>
          <p className="text-xs text-slate-400">
            Cores: vermelho = baixa, verde = alta. Cohorts com &lt;5 users ocultos.
          </p>
        </header>
        <CohortHeatmap matrix={data.matrix} />
      </section>

      {/* SECTION 4 — Retention line chart */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Curva de retenção</h2>
          <p className="text-xs text-slate-400">D1 → D7 → D30 por cohort.</p>
        </header>
        <RetentionLineChart matrix={data.matrix} />
      </section>

      {/* SECTION 5 — Detailed cohort table */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Tabela detalhada</h2>
          <button
            type="button"
            onClick={() => downloadCsv(data.matrix, 'cohorts.csv')}
            className="rounded bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-500"
          >
            Exportar CSV
          </button>
        </header>
        <CohortTable matrix={data.matrix} />
      </section>

      <footer className="text-xs text-slate-500">
        Gerado em {new Date(data.matrix.meta.generatedAt).toLocaleString('pt-BR')}.
        k-anonymity: {data.matrix.meta.kAnonThreshold}. Suprimidos: {data.matrix.meta.suppressedCohorts.length}.
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (v: string | undefined) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function CohortHeatmap({ matrix }: { matrix: CohortMatrix }) {
  if (matrix.rows.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum cohort disponível.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-left text-slate-300">Cohort</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">Users</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-center text-slate-300">D1</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-center text-slate-300">D7</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-center text-slate-300">D30</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-center text-slate-300">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.cohort}>
              <td className="border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-slate-200">
                {row.cohort}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right text-slate-300">
                {row.isSmall ? '< 5' : row.totalUsers}
              </td>
              <td
                className="border border-slate-800 px-3 py-2 text-center font-mono"
                style={cellStyle(row.retention.D1, row.isSmall)}
              >
                {(row.retention.D1 * 100).toFixed(0)}%
              </td>
              <td
                className="border border-slate-800 px-3 py-2 text-center font-mono"
                style={cellStyle(row.retention.D7, row.isSmall)}
              >
                {(row.retention.D7 * 100).toFixed(0)}%
              </td>
              <td
                className="border border-slate-800 px-3 py-2 text-center font-mono"
                style={cellStyle(row.retention.D30, row.isSmall)}
              >
                {(row.retention.D30 * 100).toFixed(0)}%
              </td>
              <td className="border border-slate-800 px-3 py-2 text-center font-mono text-slate-300">
                {row.medianSessions?.toFixed(1) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cellStyle(intensity: number, isSmall: boolean): React.CSSProperties {
  if (isSmall) return { backgroundColor: '#1e293b', color: '#475569' };
  const x = Math.max(0, Math.min(1, intensity));
  if (x < 0.5) {
    const r = 239 - (239 - 234) * (x / 0.5);
    const g = 68 + (179 - 68) * (x / 0.5);
    const b = 68 + (8 - 68) * (x / 0.5);
    return { backgroundColor: `rgb(${r}, ${g}, ${b})`, color: '#0f172a' };
  }
  const y = (x - 0.5) / 0.5;
  const r = 234 - (234 - 34) * y;
  const g = 179 + (197 - 179) * y;
  const b = 8 + (94 - 8) * y;
  return { backgroundColor: `rgb(${r}, ${g}, ${b})`, color: '#0f172a' };
}

function RetentionLineChart({ matrix }: { matrix: CohortMatrix }) {
  const cohorts = matrix.rows.filter((r) => !r.isSmall);
  if (cohorts.length === 0) {
    return <p className="text-sm text-slate-400">Sem cohorts suficientes para visualizar.</p>;
  }
  const width = 600;
  const height = 200;
  const padding = 30;
  const xs = [0, 1, 2]; // D1, D7, D30
  const colors = ['#06b6d4', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#84cc16'];

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Y axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((y) => (
          <g key={y}>
            <line
              x1={padding}
              y1={height - padding - y * (height - padding * 2)}
              x2={width - padding}
              y2={height - padding - y * (height - padding * 2)}
              stroke="#1e293b"
              strokeDasharray="2,4"
            />
            <text x={padding - 6} y={height - padding - y * (height - padding * 2) + 3} fontSize="9" fill="#64748b" textAnchor="end">
              {(y * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {/* Lines */}
        {cohorts.map((row, i) => {
          const color = colors[i % colors.length];
          const points = xs.map((xi) => {
            const x = padding + xi * ((width - padding * 2) / 2);
            const yVal = [row.retention.D1, row.retention.D7, row.retention.D30][xi];
            const y = height - padding - yVal * (height - padding * 2);
            return `${x},${y}`;
          });
          return (
            <g key={row.cohort}>
              <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" />
              {xs.map((xi, idx) => {
                const x = padding + xi * ((width - padding * 2) / 2);
                const yVal = [row.retention.D1, row.retention.D7, row.retention.D30][xi];
                const y = height - padding - yVal * (height - padding * 2);
                return <circle key={idx} cx={x} cy={y} r="3" fill={color} />;
              })}
              <text x={width - padding + 4} y={height - padding - row.retention.D30 * (height - padding * 2) + 3} fontSize="9" fill={color}>
                {row.cohort}
              </text>
            </g>
          );
        })}
        {/* X axis labels */}
        {['D1', 'D7', 'D30'].map((label, i) => (
          <text
            key={label}
            x={padding + i * ((width - padding * 2) / 2)}
            y={height - padding + 14}
            fontSize="10"
            fill="#cbd5e1"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function CohortTable({ matrix }: { matrix: CohortMatrix }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-left text-slate-300">Cohort</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">Users</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">D1</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">D7</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">D30</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-right text-slate-300">Sessions (median)</th>
            <th className="border border-slate-800 bg-slate-950 px-3 py-2 text-center text-slate-300">LTV (median cents)</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.cohort} className="hover:bg-slate-900/50">
              <td className="border border-slate-800 px-3 py-2 font-mono text-slate-200">{row.cohort}</td>
              <td className="border border-slate-800 px-3 py-2 text-right text-slate-300">
                {row.isSmall ? '< 5' : row.totalUsers}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right font-mono text-slate-300">
                {row.retention.D1.toFixed(3)}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right font-mono text-slate-300">
                {row.retention.D7.toFixed(3)}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right font-mono text-slate-300">
                {row.retention.D30.toFixed(3)}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right font-mono text-slate-300">
                {row.medianSessions?.toFixed(1) ?? '—'}
              </td>
              <td className="border border-slate-800 px-3 py-2 text-right font-mono text-slate-300">
                {row.medianLtvCents ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function generateWeekOptions(): string[] {
  const weeks: string[] = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(isoWeekMinus(i));
  }
  return weeks;
}

function isoWeekMinus(weeksAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function downloadCsv(matrix: CohortMatrix, filename: string) {
  const headers = ['cohort', 'totalUsers', 'isSmall', 'D1', 'D7', 'D30', 'medianSessions', 'medianLtvCents'];
  const rows = matrix.rows.map((r) => [
    r.cohort,
    r.isSmall ? 'k-<5' : String(r.totalUsers),
    String(r.isSmall),
    r.retention.D1.toFixed(4),
    r.retention.D7.toFixed(4),
    r.retention.D30.toFixed(4),
    r.medianSessions?.toFixed(1) ?? '',
    r.medianLtvCents?.toString() ?? '',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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