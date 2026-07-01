'use client'

/**
 * ============================================================================
 * GlossaryTooltip — Tooltip acessível para termos técnicos (W34 P1)
 * ----------------------------------------------------------------------------
 * Tooltip com vocabulário espiritual (orixás, pemba, Odu, etc.). O padrão
 * WAI-ARIA 1.2 para tooltip é:
 *
 *   - Trigger: tabindex="0" + aria-describedby (ou aria-labelledby para
 *     definition tooltips)
 *   - Tooltip: role="tooltip" + id único
 *   - Aparece em :hover, :focus, keydown (não click — teclado fica preso)
 *   - Esc fecha
 *   - Não é dismissível por tab — foco vai para o próximo elemento
 *
 * Diferenças para popovers:
 *   - Tooltip = dica curta, sem interatividade interna
 *   - Popover = conteúdo rico, links, botões
 *
 * WCAG:
 *   - 1.3.1 Info and Relationships
 *   - 1.4.13 Content on Hover or Focus (Level AA, WCAG 1.4.13)
 *     → hoverable (não), persistent até Esc/blur, dismissible
 *   - 2.1.1 Keyboard (Level A)
 *   - 4.1.2 Name, Role, Value (Level A)
 *
 * @example
 *   <p>
 *     Energia de <GlossaryTooltip term="axé" definition="Força vital...">axé</GlossaryTooltip>
 *     no terreiro.
 *   </p>
 * ============================================================================
 */

import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GlossaryTooltipProps {
  /** Termo a destacar (texto visível). */
  term: string
  /** Definição / tooltip content. */
  definition: string
  /** Se true, mostra ícone ℹ️ além do texto. */
  showIcon?: boolean
  className?: string
}

/**
 * Gera ID único estável por sessão para evitar drift entre SSR/CSR
 * (useId já existe em React 18+, mas usamos uma versão determinística
 * para suporte a testes que precisam de snapshot estável).
 */
let _seq = 0
function useStableId(prefix: string): string {
  const idRef = React.useRef<string | null>(null)
  if (idRef.current === null && typeof window !== 'undefined') {
    _seq += 1
    idRef.current = `${prefix}-${_seq}`
  }
  // SSR fallback: usa Math.random uma vez (não vai casar com client,
  // mas evita erro de hidratação porque atributo é aria-only).
  if (idRef.current === null) {
    idRef.current = `${prefix}-${Math.random().toString(36).slice(2, 8)}`
  }
  return idRef.current
}

export function GlossaryTooltip({
  term,
  definition,
  showIcon = false,
  className,
}: GlossaryTooltipProps) {
  const [open, setOpen] = React.useState(false)
  const id = useStableId('glossary')

  const show = React.useCallback(() => setOpen(true), [])
  const hide = React.useCallback(() => setOpen(false), [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      hide()
    }
  }

  return (
    <span
      className={cn('inline-flex items-baseline gap-0.5', className)}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn(
          'cursor-help rounded-sm border-b border-dotted',
          'border-[var(--spiritual-gold,#d4af37)]/60',
          'bg-transparent px-0.5 py-0 align-baseline text-inherit',
          'hover:bg-[var(--spiritual-gold,#d4af37)]/10',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--spiritual-gold-light,#f4cf68)]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        {showIcon && (
          <Info
            aria-hidden="true"
            className="mr-0.5 inline h-3 w-3 align-text-bottom"
          />
        )}
        <span>{term}</span>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 mt-6 max-w-xs rounded-md border',
            'border-[var(--spiritual-gold,#d4af37)]/40',
            'bg-popover px-3 py-2 text-xs leading-snug text-popover-foreground',
            'shadow-lg',
          )}
          // Posicionamento fixo seria com Floating UI; aqui usamos
          // absolute dentro de <span> relativo — simplificado.
          style={{ position: 'absolute' }}
        >
          {definition}
        </span>
      )}
    </span>
  )
}

/**
 * Helper de composição para textos com múltiplos termos. Não ancora
 * automaticamente; caller decide quais termos destacar.
 *
 * @example
 *   const TERM_MAP = { axé: 'Força vital...', Odu: '...', pemba: '...' }
 *   <AnnotatedText text="O axé do Odu" map={TERM_MAP} />
 */
export function AnnotatedText({
  text,
  map,
}: {
  text: string
  map: Record<string, string>
}) {
  // Pattern simples: split por keys ordenadas por tamanho desc.
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  if (keys.length === 0) return <>{text}</>

  const re = new RegExp(`\\b(${keys.map(escapeRegex).join('|')})\\b`, 'g')
  const parts = text.split(re)
  return (
    <>
      {parts.map((p, i) => {
        const def = map[p]
        if (def) return <GlossaryTooltip key={i} term={p} definition={def} />
        return <React.Fragment key={i}>{p}</React.Fragment>
      })}
    </>
  )
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
