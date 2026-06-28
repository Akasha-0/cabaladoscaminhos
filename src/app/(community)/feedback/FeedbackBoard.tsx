/**
 * FeedbackBoard — interactive list + form for /(community)/feedback
 * -----------------------------------------------------------------------------
 * Client component (separate from page.tsx for cleaner server/client split).
 *
 * @see docs/FEEDBACK-LOOP.md §6
 */

'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics/events'
import type { FeatureRequestRow, FeatureRequestStatus } from './page'

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<{ value: 'all' | FeatureRequestStatus; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'proposed', label: 'Propostas' },
  { value: 'planned', label: 'Planejadas' },
  { value: 'in-progress', label: 'Em andamento' },
  { value: 'done', label: 'Entregues' },
]

const CATEGORY_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todas categorias' },
  { value: 'content', label: 'Conteúdo' },
  { value: 'ai', label: 'Akasha IA' },
  { value: 'community', label: 'Comunidade' },
  { value: 'profile', label: 'Perfil' },
  { value: 'notifications', label: 'Notificações' },
  { value: 'accessibility', label: 'Acessibilidade' },
  { value: 'other', label: 'Outros' },
]

const STATUS_BADGE: Record<FeatureRequestStatus, { label: string; className: string }> = {
  proposed: { label: 'Proposta', className: 'bg-zinc-700 text-zinc-200' },
  planned: { label: 'Planejada', className: 'bg-blue-900/50 text-blue-200' },
  'in-progress': { label: 'Em andamento', className: 'bg-amber-900/50 text-amber-200' },
  done: { label: 'Entregue ✓', className: 'bg-emerald-900/50 text-emerald-200' },
  declined: { label: 'Recusada', className: 'bg-red-900/50 text-red-200' },
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FeedbackBoardProps {
  initialRequests: FeatureRequestRow[]
  currentUserId: string | null
  myUpvotes: string[] // request ids already upvoted by me
  initialStatus: string
  initialCategory: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FeedbackBoard({
  initialRequests,
  currentUserId,
  myUpvotes,
  initialStatus,
  initialCategory,
}: FeedbackBoardProps) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [myUpvoteSet, setMyUpvoteSet] = useState<Set<string>>(new Set(myUpvotes))
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ─── Form state ──────────────────────────────────────────────────────────

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('content')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature_request',
          title: title.trim(),
          description: description.trim(),
          category,
        }),
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      // Reset + refresh server data.
      setTitle('')
      setDescription('')
      setShowForm(false)
      startTransition(() => router.refresh())
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao enviar pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpvote(requestId: string) {
    if (!currentUserId) {
      router.push('/login?next=/feedback')
      return
    }
    if (myUpvoteSet.has(requestId)) return // already upvoted — UI should disable
    // Optimistic
    setMyUpvoteSet((s) => new Set(s).add(requestId))
    setRequests((rs) =>
      rs.map((r) => (r.id === requestId ? { ...r, upvotes: r.upvotes + 1 } : r)),
    )
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feature_upvote', request_id: requestId }),
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      trackEvent({ name: 'feedback_feature_request_upvoted', properties: { request_id: requestId } })
    } catch {
      // Roll back optimistic update
      setMyUpvoteSet((s) => {
        const next = new Set(s)
        next.delete(requestId)
        return next
      })
      setRequests((rs) =>
        rs.map((r) => (r.id === requestId ? { ...r, upvotes: Math.max(0, r.upvotes - 1) } : r)),
      )
    }
  }

  // ─── Filter handling (URL params via router.replace) ─────────────────────

  function handleFilterChange(next: { status?: string; category?: string }) {
    const newStatus = next.status ?? statusFilter
    const newCategory = next.category ?? categoryFilter
    setStatusFilter(newStatus)
    setCategoryFilter(newCategory)
    const qs = new URLSearchParams()
    if (newStatus !== 'all') qs.set('status', newStatus)
    if (newCategory !== 'all') qs.set('category', newCategory)
    startTransition(() => router.replace(`/feedback${qs.toString() ? `?${qs}` : ''}`))
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === s.value}
              onClick={() => handleFilterChange({ status: s.value })}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                statusFilter === s.value
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => handleFilterChange({ category: e.target.value })}
          aria-label="Filtrar por categoria"
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200"
        >
          {CATEGORY_FILTERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* New request CTA + form */}
      <div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-200 transition-colors hover:bg-amber-500/10"
          >
            ✦ Sugerir nova funcionalidade
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
            aria-label="Formulário de nova sugestão"
          >
            <h2 className="text-base font-semibold text-amber-100">Nova sugestão</h2>
            <div>
              <label htmlFor="fr-title" className="block text-xs text-zinc-400">
                Título (curto)
              </label>
              <input
                id="fr-title"
                type="text"
                required
                minLength={5}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="Ex.: Notificação quando alguém cita meu post"
              />
            </div>
            <div>
              <label htmlFor="fr-desc" className="block text-xs text-zinc-400">
                Descrição (por quê importa)
              </label>
              <textarea
                id="fr-desc"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="Conte o contexto, o problema que resolve, casos de uso…"
              />
            </div>
            <div>
              <label htmlFor="fr-cat" className="block text-xs text-zinc-400">
                Categoria
              </label>
              <select
                id="fr-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                {CATEGORY_FILTERS.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {submitError && (
              <p role="alert" className="text-sm text-red-400">
                {submitError}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="text-sm text-zinc-400 underline-offset-2 hover:underline disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting ? 'Enviando…' : 'Enviar sugestão'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isPending && <p className="text-xs text-zinc-500">Atualizando…</p>}
        {requests.length === 0 && !isPending && (
          <p className="rounded-md border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            Nenhum pedido por aqui ainda. Que tal ser o primeiro?
          </p>
        )}
        {requests.map((r) => {
          const badge = STATUS_BADGE[r.status]
          const alreadyUpvoted = myUpvoteSet.has(r.id)
          return (
            <article
              key={r.id}
              className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60"
            >
              <button
                type="button"
                onClick={() => handleUpvote(r.id)}
                disabled={!currentUserId || alreadyUpvoted}
                aria-label={
                  alreadyUpvoted ? 'Você já votou' : 'Apoiar este pedido'
                }
                aria-pressed={alreadyUpvoted}
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border text-center transition-colors ${
                  alreadyUpvoted
                    ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-amber-500 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50'
                }`}
              >
                <span className="text-lg font-semibold leading-none">{r.upvotes}</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wide">apoios</span>
              </button>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-medium text-amber-100">{r.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {CATEGORY_FILTERS.find((c) => c.value === r.category)?.label ?? r.category}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-zinc-400">{r.description}</p>
                <p className="text-xs text-zinc-500">
                  por {r.author_display} ·{' '}
                  <time dateTime={r.created_at}>
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </time>
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
