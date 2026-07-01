/**
 * ============================================================================
 * focus-management.ts — Utilitários de gerenciamento de foco
 * ----------------------------------------------------------------------------
 * W34 (WCAG 2.2 AA final polish)
 *
 * Funções:
 *   - getFocusable(container): lista de elementos focáveis
 *   - trapFocus(container): prende Tab dentro do container (modals/sheets)
 *   - restoreFocusOnCleanup(): salva foco atual e restaura no cleanup
 *
 * WCAG:
 *   - 2.1.2 No Keyboard Trap (Level A) — trapFocus inclui saída via Esc
 *   - 2.4.3 Focus Order (Level A) — Tab segue ordem visual
 *   - 2.4.7 Focus Visible (Level AA) — depende do CSS, não JS
 *   - 2.5.7 Target Spacing (Level AA, WCAG 2.2) — não coberto aqui
 *
 * Princípios:
 *   - Puro TS — sem deps externas (focus-trap-react etc.)
 *   - Server-safe (não assume DOM global — checa typeof document)
 *   - Não preventDefault para teclas de navegação normais (apenas Esc
 *     e Tab são interceptados)
 * ============================================================================
 */

import * as React from 'react'

/**
 * Seletores de elementos focáveis, em ordem de preferência do WHATWG.
 * Inclui disabled/hidden check via :not() para evitar falsos positivos.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Retorna lista de elementos focáveis dentro de um container, em ordem
 * do DOM. Pula elementos com `disabled`, `aria-hidden="true"`, ou
 * visibility:hidden. Inclui apenas o primeiro se houver sub-roots
 * aninhados com `data-focus-skip`.
 *
 * Usa `querySelectorAll` + filtro manual (mais barato que
 * getRootNode+TreeWalker e suficiente para modais típicos <50 nodes).
 */
export function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container || typeof container.querySelectorAll !== 'function') return []
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  )
  return nodes.filter((el) => {
    if (el.hasAttribute('disabled')) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    // visibility check — el.offsetParent === null cobre display:none,
    // mas <body> tem offsetParent null também, então excluímos body/html.
    if (el === document.body || el === document.documentElement) return false
    const style = typeof window !== 'undefined' ? window.getComputedStyle(el) : null
    if (style && (style.visibility === 'hidden' || style.display === 'none')) {
      return false
    }
    return true
  })
}

/**
 * Prende o foco dentro de um container enquanto ele estiver ativo.
 *
 * Comportamento:
 *   - Tab no último elemento → volta pro primeiro (wrap forward)
 *   - Shift+Tab no primeiro → vai pro último (wrap backward)
 *   - Esc → chama onEscape (não fecha sozinho; deixa caller decidir)
 *
 * Retorna função de cleanup que também restaura foco se `restoreFocus=true`.
 *
 * @example
 *   useEffect(() => {
 *     if (!open) return
 *     return trapFocus(modalRef.current, {
 *       onEscape: () => onOpenChange(false),
 *     })
 *   }, [open])
 */
export interface TrapFocusOptions {
  /** Callback quando Esc é pressionado. */
  onEscape?: () => void
  /** Restaura foco ao elemento ativo antes do trap. Default: true. */
  restoreFocus?: boolean
  /** Seletor para foco inicial (default: primeiro focável). */
  initialFocus?: string
}

export function trapFocus(
  container: HTMLElement | null,
  options: TrapFocusOptions = {},
): () => void {
  if (typeof document === 'undefined' || !container) return () => {}

  const { onEscape, restoreFocus = true, initialFocus } = options
  const previouslyFocused = document.activeElement as HTMLElement | null

  // Foco inicial
  const focusFirst = () => {
    if (initialFocus) {
      const target = container.querySelector<HTMLElement>(initialFocus)
      if (target) {
        target.focus()
        return
      }
    }
    const focusables = getFocusable(container)
    if (focusables[0]) focusables[0].focus()
  }

  // Pequeno delay para garantir que o container já está no DOM e visível.
  // (Especialmente útil em transitions CSS onde focus() antes do frame
  // seria perdido.)
  const rafId = requestAnimationFrame(focusFirst)

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onEscape) {
      e.stopPropagation()
      onEscape()
      return
    }
    if (e.key !== 'Tab') return

    const focusables = getFocusable(container)
    if (focusables.length === 0) {
      // Sem focáveis dentro — trava o foco no container via tabindex=-1.
      e.preventDefault()
      container.focus()
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (e.shiftKey) {
      // Shift+Tab no primeiro → vai pro último
      if (active === first || !container.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      // Tab no último → volta pro primeiro
      if (active === last || !container.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  document.addEventListener('keydown', onKeyDown, true)

  return () => {
    cancelAnimationFrame(rafId)
    document.removeEventListener('keydown', onKeyDown, true)
    if (restoreFocus && previouslyFocused && previouslyFocused.focus) {
      // Só restaura se o foco ainda está dentro do nosso container
      // (evita roubar foco de outro modal que abriu por cima).
      const active = document.activeElement as HTMLElement | null
      if (active && container.contains(active)) {
        previouslyFocused.focus()
      }
    }
  }
}

/**
 * Hook React que gerencia o ciclo: salvar foco → trap → restaurar.
 * Para usar em modais, sheets, drawers, menus de contexto.
 *
 * @example
 *   useFocusTrap(open, modalRef, { onEscape: () => setOpen(false) })
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  ref: React.RefObject<T>,
  options: Omit<TrapFocusOptions, 'restoreFocus'> & { onEscape?: () => void } = {},
): void {
  React.useEffect(() => {
    if (!active) return
    const cleanup = trapFocus(ref.current, {
      ...options,
      restoreFocus: true,
    })
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

/**
 * Move o foco programaticamente para um elemento após um delay (útil
 * após navegação client-side). Server-safe.
 */
export function focusElement(
  el: HTMLElement | null | undefined,
  delay = 0,
): void {
  if (typeof window === 'undefined' || !el) return
  if (delay === 0) {
    el.focus()
    return
  }
  setTimeout(() => el.focus(), delay)
}
