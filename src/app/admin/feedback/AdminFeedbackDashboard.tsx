/**
 * AdminFeedbackDashboard — Client component for the admin feedback page
 * -----------------------------------------------------------------------------
 * Receives server-loaded data and provides:
 *  - Inline status editing for feature requests (calls Server Action)
 *  - Inline status editing for bug reports
 *  - Quick filters and search
 *
 * @see docs/FEEDBACK-LOOP.md §7
 */

'use client'

import { useState, useTransition, useMemo } from 'react'
import { updateFeatureRequestStatus, updateBugReportStatus } from './actions'

// ─── Types ──────────────────────────────────────────────────────────────────

interface NpsStats {
  total_responses: number
  nps_score: number
  promoter_pct: number
  passive_pct: number
  detractor_pct: number
  trend_30d: number
  recent_comments: Array<{
    score: number
    comment: string
    submitted_at: string
  }>
}

interface FeatureRequestRow {
  id: string
  title: string
  description: string
  category: string
  status: string
  upvotes: number
  created_at: string
  author_display: string
}

interface BugReportRow {
  id: string
  title: string
  description: string
  severity: string
  category: string
  status: string
  created_at: string
  reporter_display: string
}

interface AdminData {
  nps: NpsStats
  feature_requests: FeatureRequestRow[]
  bug_reports: BugReportRow[]
}

// ─── Status options ─────────────────────────────────────────────────────────

const FEATURE_STATUSES = ['proposed', 'planned', 'in-progress', 'done', 'declined'] as const
const BUG_STATUSES = ['open', 'triaged', 'in-progress', 'resolved', 'wont-fix'] as const
const BUG_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const

const FEATURE_STATUS_LABEL: Record<(typeof FEATURE_STATUSES)[number], string> = {
  proposed: 'Proposta',
  planned: 'Planejada',
  'in-progress': 'Em andamento',
  done: 'Entregue',
  declined: 'Recusada',
}

const BUG_STATUS_LABEL: Record<(typeof BUG_STATUSES)[number], string> = {
  open: 'Aberto',
  triaged: 'Triado',
  'in-progress': 'Em andamento',
  resolved: 'Resolvido',
  'wont-fix': 'Não vou corrigir',
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AdminFeedbackDashboard({ initial }: { initial: AdminData }) {
  const [features, setFeatures] = useState(initial.feature_requests)
  const [bugs, setBugs] = useState(initial.bug_reports)
  const [featureFilter, setFeatureFilter] = useState<string>('all')
  const [bugFilter, setBugFilter] = useState<string>('open')
  const [featureSearch, setFeatureSearch] = useState('')
  const [, startTransition] = useTransition()

  // ─── Feature filtering ──────────────────────────────────────────────────

  const filteredFeatures = useMemo(() => {
    let list = features
    if (featureFilter !== 'all') {
      list = list.filter((f) => f.status === featureFilter)
    }
    if (featureSearch.trim()) {
      const q = featureSearch.toLowerCase()
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.author_display.toLowerCase().includes(q),
      )
    }
    return list
  }, [features, featureFilter, featureSearch])

  const filteredBugs = useMemo(() => {
    if (bugFilter === 'all') return bugs
    if (bugFilter === 'open') return bugs.filter((b) => b.status === 'open')
    return bugs.filter((b) => b.status === bugFilter)
  }, [bugs, bugFilter])

  // ─── Status change handlers ────────────────────────────────────────────

  async function onFeatureStatusChange(id: string, newStatus: string) {
    const prev = features.find((f) => f.id === id)?.status
    // Optimistic
    setFeatures((list) =>
      list.map((f) => (f.id === id ? { ...f, status: newStatus } : f)),
    )
    try {
      await updateFeatureRequestStatus(id, newStatus)
    } catch {
      // Roll back
      setFeatures((list) =>
        list.map((f) => (f.id === id && prev ? { ...f, status: prev } : f)),
      )
    }
  }

  async function onBugStatusChange(id: string, newStatus: string) {
    const prev = bugs.find((b) => b.id === id)?.status
    setBugs((list) => list.map((b) => (b.id === id ? { ...b, status: newStatus } : b)))
    try {
      await updateBugReportStatus(id, newStatus)
    } catch {
      setBugs((list) =>
        list.map((b) => (b.id === id && prev ? { ...b, status: prev } : b)),
      )
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10">
      {/* ─── NPS ─── */}
      <section aria-labelledby="nps-h">
        <h2 id="nps-h" className="mb-3 text-xl font-serif text-amber-100">
          NPS (últimos 30 dias)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Score</p>
            <p
              className={`mt-1 text-4xl font-serif ${
                initial.nps.nps_score >= 50
                  ? 'text-emerald-300'
                  : initial.nps.nps_score >= 0
                    ? 'text-amber-300'
                    : 'text-red-300'
              }`}
            >
              {initial.nps.nps_score > 0 ? '+' : ''}
              {initial.nps.nps_score}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Tendência 30d: {initial.nps.trend_30d > 0 ? '+' : ''}
              {initial.nps.trend_30d}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Promotores</p>
            <p className="mt-1 text-2xl text-emerald-300">{initial.nps.promoter_pct}%</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Neutros</p>
            <p className="mt-1 text-2xl text-amber-300">{initial.nps.passive_pct}%</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Detratores</p>
            <p className="mt-1 text-2xl text-red-300">{initial.nps.detractor_pct}%</p>
          </div>
        </div>

        {/* Bar (visual approximation of distribution) */}
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="bg-emerald-500"
            style={{ width: `${initial.nps.promoter_pct}%` }}
            title={`Promotores: ${initial.nps.promoter_pct}%`}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${initial.nps.passive_pct}%` }}
            title={`Neutros: ${initial.nps.passive_pct}%`}
          />
          <div
            className="bg-red-500"
            style={{ width: `${initial.nps.detractor_pct}%` }}
            title={`Detratores: ${initial.nps.detractor_pct}%`}
          />
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Total de respostas: {initial.nps.total_responses.toLocaleString('pt-BR')}
        </p>

        {/* Recent detractor/passive comments */}
        {initial.nps.recent_comments.filter((c) => c.score <= 6).length > 0 && (
          <details className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <summary className="cursor-pointer text-sm text-amber-200">
              💬 Comentários recentes de detratores ({initial.nps.recent_comments.filter((c) => c.score <= 6).length})
            </summary>
            <ul className="mt-3 space-y-3">
              {initial.nps.recent_comments
                .filter((c) => c.score <= 6)
                .slice(0, 10)
                .map((c, i) => (
                  <li key={i} className="border-l-2 border-red-500/40 pl-3">
                    <p className="text-xs text-red-300">
                      Nota {c.score} ·{' '}
                      <time dateTime={c.submitted_at}>
                        {new Date(c.submitted_at).toLocaleDateString('pt-BR')}
                      </time>
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">"{c.comment}"</p>
                  </li>
                ))}
            </ul>
          </details>
        )}
      </section>

      {/* ─── Feature Requests ─── */}
      <section aria-labelledby="fr-h">
        <h2 id="fr-h" className="mb-3 text-xl font-serif text-amber-100">
          Pedidos da Comunidade
        </h2>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={featureSearch}
            onChange={(e) => setFeatureSearch(e.target.value)}
            placeholder="Buscar por título, descrição, autor…"
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <div className="flex flex-wrap gap-2">
            {['all', ...FEATURE_STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFeatureFilter(s)}
                className={`rounded-full px-3 py-1 text-xs ${
                  featureFilter === s
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {s === 'all' ? 'Todos' : FEATURE_STATUS_LABEL[s as keyof typeof FEATURE_STATUS_LABEL]}
              </button>
            ))}
          </div>
        </div>
        <ul className="space-y-2">
          {filteredFeatures.length === 0 && (
            <li className="rounded-md border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
              Nenhum pedido corresponde ao filtro.
            </li>
          )}
          {filteredFeatures.map((f) => (
            <li
              key={f.id}
              className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-amber-200">
                    ▲ {f.upvotes}
                  </span>
                  <span className="font-medium text-amber-100">{f.title}</span>
                  <span className="text-xs text-zinc-500">
                    {f.category} · {f.author_display} ·{' '}
                    {new Date(f.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{f.description}</p>
              </div>
              <select
                value={f.status}
                onChange={(e) => onFeatureStatusChange(f.id, e.target.value)}
                aria-label={`Status de ${f.title}`}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-200"
              >
                {FEATURE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FEATURE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Bug Reports ─── */}
      <section aria-labelledby="bug-h">
        <h2 id="bug-h" className="mb-3 text-xl font-serif text-amber-100">
          Bug Reports
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {['open', 'all', ...BUG_STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setBugFilter(s)}
              className={`rounded-full px-3 py-1 text-xs ${
                bugFilter === s
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {s === 'open'
                ? 'Abertos'
                : s === 'all'
                  ? 'Todos'
                  : BUG_STATUS_LABEL[s as keyof typeof BUG_STATUS_LABEL]}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {filteredBugs.length === 0 && (
            <li className="rounded-md border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
              Nenhum bug report por aqui. ✨
            </li>
          )}
          {filteredBugs.map((b) => {
            const sevColor =
              b.severity === 'critical'
                ? 'bg-red-500/20 text-red-300'
                : b.severity === 'high'
                  ? 'bg-orange-500/20 text-orange-300'
                  : b.severity === 'medium'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-700 text-zinc-300'
            return (
              <li
                key={b.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs uppercase ${sevColor}`}>
                      {b.severity}
                    </span>
                    <span className="font-medium text-amber-100">{b.title}</span>
                    <span className="text-xs text-zinc-500">
                      {b.category} · {b.reporter_display} ·{' '}
                      {new Date(b.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{b.description}</p>
                </div>
                <select
                  value={b.status}
                  onChange={(e) => onBugStatusChange(b.id, e.target.value)}
                  aria-label={`Status de ${b.title}`}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-200"
                >
                  {BUG_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {BUG_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="text-center text-xs text-zinc-500">
        {filteredFeatures.length} pedido(s) · {filteredBugs.length} bug(s) visíveis ·
        clique em qualquer status pra mudar.
      </p>
    </div>
  )
}
