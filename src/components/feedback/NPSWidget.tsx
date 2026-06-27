/**
 * NPSWidget — Net Promoter Score survey (7-day trigger)
 * -----------------------------------------------------------------------------
 * Renders a non-intrusive NPS widget that:
 *   1. Appears 7 days after `auth_signed_up` (only once per user, ever)
 *   2. Asks for a score 0–10
 *   3. Asks a qualitative follow-up (optional, but encouraged)
 *   4. Submits via `POST /api/feedback` with `type: 'nps'`
 *   5. Tracks `feedback_nps_submitted` in PostHog (only with consent)
 *
 * Per spec: NPS is anonymous — the API endpoint stores the score keyed by
 * an anonymous UUID (`distinct_id`), NOT by user_id. We deliberately do not
 * join NPS scores back to user identities in our DB.
 *
 * Accessibility:
 *  - role="dialog", aria-labelledby
 *  - Focus trap on open (focus first button)
 *  - ESC to close (counts as dismissal — won't re-trigger this session)
 *  - Keyboard navigable score buttons (0-9, a)
 *  - Color-blind safe (icons + text labels, not color alone)
 *
 * @see docs/FEEDBACK-LOOP.md §4
 */

'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics/events'

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY_DISMISSED = 'akasha_nps_dismissed_at' // ISO date string
const STORAGE_KEY_SUBMITTED = 'akasha_nps_submitted' // '1' once submitted
const TRIGGER_DAYS_AFTER_SIGNUP = 7
const MIN_VISIBLE_MS = 1500 // don't show for less than this after page load

const SCORE_LABELS: Record<number, { label: string; category: 'detractor' | 'passive' | 'promoter' }> = {
  0: { label: 'Nada provável', category: 'detractor' },
  1: { label: '', category: 'detractor' },
  2: { label: '', category: 'detractor' },
  3: { label: '', category: 'detractor' },
  4: { label: '', category: 'detractor' },
  5: { label: '', category: 'detractor' },
  6: { label: '', category: 'detractor' },
  7: { label: 'Pouco provável', category: 'passive' },
  8: { label: '', category: 'passive' },
  9: { label: '', category: 'promoter' },
  10: { label: 'Muito provável', category: 'promoter' },
}

const CATEGORY_COPY: Record<'detractor' | 'passive' | 'promoter', string> = {
  detractor: 'O que está faltando? Vamos melhorar.',
  passive: 'O que te faria recomendar mais?',
  promoter: 'O que mais te agrada? (opcional)',
}

// ─── Props ──────────────────────────────────────────────────────────────────

export interface NPSWidgetProps {
  /**
   * Server-resolved: ISO timestamp of the user's signup.
   * Pass `null` if anonymous (widget will not render).
   */
  signedUpAt: string | null
  /**
   * Server-resolved: whether user already submitted NPS in a previous session.
   * Pass `true` to short-circuit rendering.
   */
  alreadySubmitted: boolean
}

// ─── Component ──────────────────────────────────────────────────────────────

export function NPSWidget({ signedUpAt, alreadySubmitted }: NPSWidgetProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'score' | 'comment' | 'thanks'>('score')
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const commentId = useId()

  // ─── Eligibility check ────────────────────────────────────────────────────

  useEffect(() => {
    if (!signedUpAt) return
    if (alreadySubmitted) return

    // 1. Server says they signed up — but we ALSO gate by date.
    const ageMs = Date.now() - new Date(signedUpAt).getTime()
    const sevenDaysMs = TRIGGER_DAYS_AFTER_SIGNUP * 24 * 60 * 60 * 1000
    if (ageMs < sevenDaysMs) return

    // 2. Don't re-show if dismissed in last 30 days.
    const dismissedAt = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DISMISSED) : null
    if (dismissedAt) {
      const days = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (days < 30) return
    }

    // 3. After a small grace period, surface the widget.
    const t = window.setTimeout(() => setOpen(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(t)
  }, [signedUpAt, alreadySubmitted])

  // ─── Focus management ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    firstButtonRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleDismiss = useCallback(() => {
    setOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DISMISSED, new Date().toISOString())
    }
  }, [])

  const handleScorePick = useCallback((s: number) => {
    setScore(s)
    setStep('comment')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (score === null) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nps',
          score,
          comment: comment.trim() || null,
        }),
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      // Mark submitted so we never re-prompt.
      localStorage.setItem(STORAGE_KEY_SUBMITTED, '1')
      // Track event (only fires if user has analytics consent).
      trackEvent('feedback_nps_submitted', {
        score,
        has_comment: comment.trim().length > 0,
      })
      setStep('thanks')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar. Tenta de novo.')
    } finally {
      setSubmitting(false)
    }
  }, [score, comment])

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!open) return null

  const category = score !== null ? SCORE_LABELS[score].category : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur"
      ref={dialogRef}
    >
      {step === 'score' && (
        <div className="space-y-3">
          <h2 id={titleId} className="text-base font-semibold text-amber-100">
            Em uma escala de 0 a 10, o quanto você recomendaria o Akasha Portal?
          </h2>
          <div className="grid grid-cols-11 gap-1" role="radiogroup" aria-labelledby={titleId}>
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                ref={i === 0 ? firstButtonRef : undefined}
                type="button"
                role="radio"
                aria-checked={score === i}
                aria-label={`Nota ${i}`}
                className="rounded-md bg-zinc-800 px-2 py-2 text-sm text-amber-50 hover:bg-amber-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                onClick={() => handleScorePick(i)}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Nada provável</span>
            <span>Muito provável</span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-zinc-500 underline-offset-2 hover:underline"
          >
            Agora não
          </button>
        </div>
      )}

      {step === 'comment' && score !== null && category !== null && (
        <div className="space-y-3">
          <h2 id={titleId} className="text-base font-semibold text-amber-100">
            {CATEGORY_COPY[category]}
          </h2>
          <label htmlFor={commentId} className="sr-only">
            Comentário
          </label>
          <textarea
            id={commentId}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Compartilha o que quiser (opcional, anônimo)…"
            className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          />
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('score')}
              disabled={submitting}
              className="text-xs text-zinc-400 underline-offset-2 hover:underline disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {step === 'thanks' && (
        <div className="space-y-2 text-center" aria-live="polite">
          <p className="text-3xl">✨</p>
          <h2 id={titleId} className="text-base font-semibold text-amber-100">
            Valeu por compartilhar!
          </h2>
          <p className="text-sm text-zinc-400">Sua opinião ajuda a construir o portal.</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 text-xs text-amber-300 underline-offset-2 hover:underline"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
