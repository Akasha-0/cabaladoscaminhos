'use client';

/**
 * SkipToContent — link de acessibilidade pra pular pro conteudo principal.
 * ----------------------------------------------------------------------------
 * Aparece quando usuario usa Tab (focus-visible).
 * Escondido visualmente por padrao, visivel so no focus.
 *
 * WCAG 2.4.1 (Bypass Blocks — Level A).
 */

import { cn } from '@/lib/utils';

export interface SkipToContentProps {
  /** ID do elemento de destino (main content). */
  targetId?: string;
  /** Texto visivel quando recebe focus. */
  label?: string;
  className?: string;
}

export function SkipToContent({
  targetId = 'main-content',
  label = 'Pular para o conteudo principal',
  className,
}: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Escondido por padrao
        'sr-only',
        // Visivel quando recebe foco via teclado
        'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:px-4 focus:py-2 focus:rounded-md',
        'focus:bg-[var(--spiritual-gold)] focus:text-black',
        'focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold-light)]',
        'transition-all duration-150',
        className,
      )}
    >
      {label}
    </a>
  );
}