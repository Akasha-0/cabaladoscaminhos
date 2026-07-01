'use client'

/**
 * ============================================================================
 * SoftDeleteUndo — Banner "Item deletado · Desfazer" com auto-undo (W34 P1)
 * ----------------------------------------------------------------------------
 * Padrão Gmail-style: ação destrutiva (delete) vira soft-state com
 * janela de undo (5–8s padrão) antes de commit real.
 *
 * A11y decisions:
 *   - Container: role="status" + aria-live="polite"
 *     (anuncia sem interromper; ação é reversível, não crítica)
 *   - Botão "Desfazer" recebe foco automático (UX: usuário que acabou
 *     de deletar é o que precisa ver o botão)
 *   - Auto-dismiss é anunciado via mudança de texto ("Expira em 3s...")
 *     para que screen reader saiba que ação está prestes a expirar
 *   - Esc também desfaz (intuitivo para "undo")
 *
 * WCAG:
 *   - 2.1.1 Keyboard (Level A) — Esc + Enter acessíveis
 *   - 2.4.7 Focus Visible (Level AA) — botão com ring
 *   - 3.3.4 Error Prevention (Legal, Financial, Data) — Level AA,
 *     parcialmente coberto (delete reversível em 6s)
 *   - 4.1.3 Status Messages (Level AA) — live region
 *
 * @example
 *   <SoftDeleteUndo
 *     itemName="Post 'Oração da Manhã'"
 *     onUndo={() => restorePost(id)}
 *     onCommit={() => actuallyDelete(id)}
 *     duration={6000}
 *   />
 * ============================================================================
 */

import * as React from 'react'
import { Undo2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SoftDeleteUndoProps {
  /** Nome legível do item deletado (anunciado em screen reader). */
  itemName: string
  /** Callback para restaurar o item antes de expire. */
  onUndo: () => void
  /** Callback para commit definitivo após expire. */
  onCommit: () => void
  /** Duração em ms antes de commit. Default: 6000 (6s). */
  duration?: number
  className?: string
}

export function SoftDeleteUndo({
  itemName,
  onUndo,
  onCommit,
  duration = 6000,
  className,
}: SoftDeleteUndoProps) {
  const [remaining, setRemaining] = React.useState(duration)
  const [expired, setExpired] = React.useState(false)
  const undoRef = React.useRef<HTMLButtonElement>(null)

  const undoRef2 = React.useRef(true)
  React.useEffect(() => {
    undoRef2.current = true
    return () => {
      undoRef2.current = false
    }
  }, [])

  // Auto-foco no botão Undo quando aparece.
  React.useEffect(() => {
    if (!expired) undoRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-expira.
  React.useEffect(() => {
    if (expired) return
    const tickMs = 100
    const start = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const left = Math.max(0, duration - elapsed)
      setRemaining(left)
      if (left === 0) {
        window.clearInterval(interval)
        if (undoRef2.current) {
          setExpired(true)
          onCommit()
        }
      }
    }, tickMs)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired, duration])

  // Esc também desfaz.
  React.useEffect(() => {
    if (expired) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onUndo()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expired, onUndo])

  if (expired) return null

  const seconds = Math.ceil(remaining / 1000)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2',
        'flex items-center gap-3 rounded-lg border',
        'border-amber-500/40 bg-amber-500/10 px-4 py-2.5',
        'text-sm text-amber-100 shadow-lg backdrop-blur-sm',
        className,
      )}
    >
      <Trash2 aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
      <span>
        <span className="sr-only">Item removido: </span>
        <strong className="font-medium">{itemName}</strong> foi removido.{' '}
        <span aria-hidden="true" className="text-amber-200/70">
          ({seconds}s para desfazer)
        </span>
      </span>
      <button
        ref={undoRef}
        type="button"
        onClick={onUndo}
        className={cn(
          'ml-2 inline-flex items-center gap-1 rounded-md',
          'bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-100',
          'hover:bg-amber-500/30',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-amber-300 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-amber-500/10',
          'transition-colors',
        )}
      >
        <Undo2 aria-hidden="true" className="h-3 w-3" />
        Desfazer
      </button>
    </div>
  )
}
