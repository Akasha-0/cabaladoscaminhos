'use client';

/**
 * EmptyState — Wave 10.2 Design System
 *
 * Componente reutilizável para estados vazios:
 *  - "Sem dados" / "Você ainda não tem nada aqui"
 *  - "Sem créditos" / "Sem conexões" / "Sem histórico"
 *  - "Erro genérico" / "Nada para mostrar"
 *
 * Princípios de design (Wave 10 §"Princípios"):
 *  - Mobile-first (touch targets ≥ 48px)
 *  - Texto curto: copy < 12 palavras
 *  - PT-BR primário (strings já em PT, i18n via messages/)
 *  - Dark theme primário (#06070F) — usa tokens semânticos
 *  - Acessível: role/aria, prefers-reduced-motion respeitado via CSS global
 *
 * @example
 *   <EmptyState
 *     icon={<Sparkles size={28} />}
 *     title="Sem conexões ainda"
 *     description="Quando alguém compartilhar um mapa com você, vai aparecer aqui."
 *     action={<Button onClick={...}>Convidar alguém</Button>}
 *   />
 */
import * as React from 'react';
import { cn } from '@/lib/shared/utils';

export interface EmptyStateProps {
  /** Ícone opcional (ex: lucide-react). Tamanho recomendado: 24-32px. */
  icon?: React.ReactNode;
  /** Título curto, obrigatório. ≤ 8 palavras recomendado. */
  title: string;
  /** Descrição opcional, ≤ 20 palavras. */
  description?: string;
  /** CTA principal — botão ou link. */
  action?: React.ReactNode;
  /** Tom visual — controla cor do anel do ícone. */
  tone?: 'default' | 'muted' | 'accent' | 'alert';
  /** Variant do card container. */
  variant?: 'card' | 'plain';
  /** Conteúdo extra opcional (lista, link secundário, etc). */
  children?: React.ReactNode;
  className?: string;
}

const toneClasses: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  default: 'text-ak-text-primary',
  muted: 'text-ak-text-muted',
  accent: 'text-ak-accent-primary',
  alert: 'text-ak-accent-alert',
};

const toneRing: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  default: 'border-ak-border-default',
  muted: 'border-ak-border-subtle',
  accent: 'border-ak-border-accent',
  alert: 'border-red-500/30',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'muted',
  variant = 'card',
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4',
        'px-6 py-12 min-h-[200px]',
        variant === 'card' &&
          'rounded-2xl border bg-ak-bg-elevated/40 backdrop-blur-sm',
        variant === 'card' && toneRing[tone],
        className
      )}
    >
      {icon && (
        <div
          aria-hidden
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full border',
            toneRing[tone]
          )}
        >
          <div className={toneClasses[tone]}>{icon}</div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3
          className={cn(
            'font-medium leading-snug',
            'text-base md:text-lg',
            toneClasses[tone]
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-ak-text-muted leading-relaxed">{description}</p>
        )}
      </div>

      {action && (
        <div className="mt-2 flex items-center gap-2">{action}</div>
      )}

      {children && <div className="mt-2 w-full">{children}</div>}
    </div>
  );
}

export default EmptyState;