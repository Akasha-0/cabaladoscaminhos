import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ============================================================================
 * MainContent — wrapper semântico `<main id="main-content">` reutilizável
 * ----------------------------------------------------------------------------
 * Centraliza o target do SkipToContent (WCAG 2.4.1 Bypass Blocks — Level A).
 * Substitui `<main className="...">` em layouts que não usam CommunityShell.
 *
 * Por que `tabIndex={-1}`?
 *   O href="#main-content" do SkipToContent move o foco programaticamente
 *   para este elemento. Sem `tabIndex={-1}`, o foco NÃO fica em `<main>` —
 *   ele fica no `body`. Isso quebra o "skip" (o próximo Tab pula pra fora
 *   do main em vez de começar pelo primeiro item focado dentro do main).
 *
 * Por que `focus:outline-none`?
 *   O outline de foco só faz sentido em elementos interativos. Em `<main>`
 *   ele é puramente visual e polui a UI sem benefício. Removemos para que
 *   o skip funcione sem ruído.
 *
 * Por que existe um componente (não só prop) centralizado?
 *   - Garante que `id="main-content"` seja EXATAMENTE igual ao esperado
 *     pelo SkipToContent (que tem `targetId = 'main-content'` como default).
 *   - Permite trocar o id globalmente em um lugar se a estratégia mudar.
 *   - Evita drift entre layouts (cada dev que adiciona uma rota nova teria
 *     que lembrar do id manualmente).
 * ============================================================================
 */

export interface MainContentProps extends React.ComponentPropsWithoutRef<'main'> {
  /** Class extra (alinhamento, padding etc.). */
  className?: string;
  children: React.ReactNode;
}

export const MainContent = React.forwardRef<HTMLElement, MainContentProps>(
  function MainContent({ className, children, ...rest }, ref) {
    return (
      <main
        ref={ref as React.Ref<HTMLDivElement>}
        id="main-content"
        tabIndex={-1}
        className={cn('focus:outline-none', className)}
        {...rest}
      >
        {children}
      </main>
    );
  },
);