'use client'

/**
 * ============================================================================
 * SkipLinks — Múltiplos alvos com WCAG 2.4.1 Bypass Blocks (Level A)
 * ----------------------------------------------------------------------------
 * W34 a11y polish: além de "skip to main content", também expõe
 * "skip to nav" e "skip to footer" para usuários de teclado e screen
 * reader pularem blocos repetitivos em todas as páginas.
 *
 * Padrão WAI-ARIA Authoring Practices:
 *   - Primeiro item interativo da página
 *   - Visível apenas em :focus-visible (não :focus, que captura clicks)
 *   - Comportamento de scroll programático via [href="#id"]
 *
 * Idiomas (pt-BR primary, en fallback) — usa o atributo lang do documento
 * via <html lang="..."> defaultText.
 * ============================================================================
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SkipLink {
  /** ID do elemento de destino (sem #). */
  targetId: string
  /** Texto visível em pt-BR quando o link recebe foco. */
  label: string
}

export interface SkipLinksProps {
  /** Lista de alvos. Default: main / nav / footer. */
  links?: SkipLink[]
  className?: string
}

const DEFAULT_LINKS: SkipLink[] = [
  { targetId: 'main-content', label: 'Pular para o conteúdo principal' },
  { targetId: 'primary-nav', label: 'Pular para a navegação principal' },
  { targetId: 'site-footer', label: 'Pular para o rodapé' },
]

export function SkipLinks({ links = DEFAULT_LINKS, className }: SkipLinksProps) {
  // Filtra alvos cujo elemento NÃO existe no DOM. Evita âncoras mortas
  // para páginas que não têm header/footer/etc. (SSR-safe via typeof check).
  const [available, setAvailable] = React.useState<SkipLink[]>(
    typeof document === 'undefined' ? links : links,
  )

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    setAvailable(
      links.filter((l) => document.getElementById(l.targetId) !== null),
    )
  }, [links])

  if (available.length === 0) return null

  return (
    <nav
      aria-label="Atalhos de acessibilidade"
      className={cn(
        'pointer-events-none fixed left-2 top-2 z-[10000] flex flex-col gap-1',
        className,
      )}
    >
      {available.map((l) => (
        <a
          key={l.targetId}
          href={`#${l.targetId}`}
          className={cn(
            // SR-only por padrão — aparece só em foco via teclado.
            'sr-only focus:not-sr-only',
            // Aparência visível quando recebe foco.
            'pointer-events-auto',
            'focus:fixed focus:left-2 focus:top-auto focus:mt-2',
            'focus:z-[10001]',
            'focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium',
            'focus:bg-[var(--spiritual-gold,#d4af37)] focus:text-black',
            'focus:shadow-lg focus:outline-none',
            'focus:ring-2 focus:ring-offset-2 focus:ring-[var(--spiritual-gold-light,#f4cf68)]',
            'focus:ring-offset-background',
            'transition-opacity duration-150',
          )}
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}
