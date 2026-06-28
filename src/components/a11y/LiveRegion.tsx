'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ============================================================================
 * LiveRegion — politE live region para anúncios não-críticos (W24 a11y)
 * ----------------------------------------------------------------------------
 * Wrapper de `<div role="status" aria-live="polite" aria-atomic="true">`.
 * Screen readers (NVDA, JAWS, VoiceOver) anunciam mudanças no conteúdo sem
 * interromper a navegação atual. WCAG 4.1.3 Status Messages (Level AA).
 *
 * Quando usar:
 *   - Sucesso de form (post salvo, mensagem enviada, login completou)
 *   - Atualizações de contador (3 novos comentários)
 *   - Estados que NÃO exigem ação imediata
 *
 * Quando NÃO usar:
 *   - Erros → use role="alert" (interrompe, urgente)
 *   - Veja `FormErrorBanner` em error-states.tsx
 *
 * `sr-only` por padrão — o conteúdo é anunciado, mas não visível.
 * Para feedback visual visível também, passe `visible`.
 * ============================================================================
 */

export interface LiveRegionProps {
  /** Mensagem a ser anunciada. Falsy → não renderiza nada. */
  message?: string | null;
  /** Conteúdo custom (ao invés de texto simples). */
  children?: React.ReactNode;
  /** ID opcional para teste (data-testid). */
  testId?: string;
  /** Se true, exibe visualmente também (alinhado à esquerda). */
  visible?: boolean;
  className?: string;
}

export function LiveRegion({
  message,
  children,
  testId,
  visible = false,
  className,
}: LiveRegionProps) {
  // Se não há conteúdo, não renderiza (evita live regions vazias que
  // confundem screen readers com "blank" announcements).
  const content = children ?? message;
  if (!content) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid={testId}
      className={cn(
        visible
          ? 'mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200'
          : 'sr-only',
        className,
      )}
    >
      {content}
    </div>
  );
}

/**
 * ============================================================================
 * AssertiveLiveRegion — live region ASSERTIVE (interrompe o screen reader)
 * ----------------------------------------------------------------------------
 * Use APENAS para mudanças críticas que exigem atenção imediata:
 *   - Conexão perdida durante sessão
 *   - Sessão expirando em <60s
 *   - Erro de validação que bloqueia progresso
 *
 * Para erros de form comuns, prefira `FormErrorBanner` (já tem role="alert").
 * ============================================================================
 */

export interface AssertiveLiveRegionProps {
  message?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function AssertiveLiveRegion({
  message,
  className,
  children,
}: AssertiveLiveRegionProps) {
  const content = children ?? message;
  if (!content) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {content}
    </div>
  );
}