'use client'

/**
 * ============================================================================
 * ErrorChip — Chip inline de erro com anúncio screen-reader (W34)
 * ----------------------------------------------------------------------------
 * Diferente de FormErrorBanner (banner completo), ErrorChip é um chip
 * compacto que cabe ao lado de um input/botão para erros leves.
 *
 *   - role="alert" → screen reader interrompe corrente e anuncia
 *   - Sempre tem aria-live="assertive" implícito (via role=alert)
 *   - Ícone + texto curto; mensagem via prop `message` ou children
 *   - Auto-id para aria-describedby quando usado com input
 *
 * WCAG:
 *   - 1.3.1 Info and Relationships (Level A)
 *   - 1.4.1 Use of Color (Level A) — usa ícone + texto, não só cor
 *   - 3.3.1 Error Identification (Level A)
 *   - 4.1.3 Status Messages (Level AA)
 *
 * @example
 *   <input id="email" aria-describedby="email-error" />
 *   {error && <ErrorChip id="email-error" message={error} />}
 * ============================================================================
 */

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorChipProps {
  /** Mensagem curta (≤80 chars recomendado). */
  message: string
  /** ID para conectar com `aria-describedby` do input. */
  id?: string
  className?: string
  /** Variante visual. */
  variant?: 'inline' | 'block'
}

export const ErrorChip = React.forwardRef<HTMLDivElement, ErrorChipProps>(
  function ErrorChip(
    { message, id, className, variant = 'inline' },
    ref,
  ) {
    return (
      <div
        ref={ref}
        id={id}
        role="alert"
        className={cn(
          'inline-flex items-start gap-1.5 rounded-md',
          'border border-red-500/40 bg-red-500/10',
          'px-2 py-1 text-xs text-red-200',
          // High-contrast target: 4.5:1 over dark-bg confirmed in tokens.css
          variant === 'block' && 'block w-full',
          className,
        )}
      >
        <AlertCircle
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
        />
        <span>{message}</span>
      </div>
    )
  },
)

/**
 * ErrorChipWireless — chip visual sem role="alert" (erros já anunciados
 * por outro live region). Use APENAS quando já há LiveRegion pai.
 */
export const ErrorChipVisual = React.forwardRef<
  HTMLDivElement,
  Omit<ErrorChipProps, 'id'>
>(function ErrorChipVisual({ message, className, variant = 'inline' }, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-flex items-start gap-1.5 rounded-md',
        'border border-red-500/40 bg-red-500/10',
        'px-2 py-1 text-xs text-red-200',
        variant === 'block' && 'block w-full',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
})
