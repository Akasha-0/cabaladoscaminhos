'use client';

/**
 * Card — Wave 10.2 Design System (refined)
 *
 * Compatível com API shadcn-style existente
 * (data-slot="card", CardHeader/Title/Description/Content/Footer).
 * Refinamentos:
 *  - `variant` semântico: 'default' | 'elevated' | 'interactive'
 *  - uso de tokens (`--ak-*`) em vez de cores Tailwind fixas
 *  - `interactive` ganha hover/active feedback (touch + desktop)
 *  - respeita prefers-reduced-motion (CSS global)
 *
 * CONTRATO: consumidores existentes continuam funcionando —
 * Card mantém export com mesma assinatura.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/shared/utils';

const cardVariants = cva(
  'group/card flex flex-col gap-4 overflow-hidden rounded-xl ring-1 text-card-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
  {
    variants: {
      variant: {
        default:
          'bg-card ring-foreground/10', // shadcn default — usa globals.css @theme
        elevated:
          'bg-ak-bg-elevated/80 backdrop-blur-sm ring-ak-border-default shadow-ak-shadow-md',
        interactive:
          'bg-ak-bg-elevated/60 backdrop-blur-sm ring-ak-border-subtle hover:ring-ak-border-accent hover:bg-ak-bg-elevated active:scale-[0.99] transition-all cursor-pointer',
        glass:
          'bg-ak-surface-glass ring-ak-border-subtle backdrop-blur-md shadow-ak-shadow-sm',
      },
      size: {
        default: 'gap-4 py-4',
        sm: 'gap-3 py-3',
        lg: 'gap-6 py-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Card({
  className,
  variant,
  size = 'default',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant ?? 'default'}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};