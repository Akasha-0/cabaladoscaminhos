'use client';

/**
 * Button — Wave 10.2 Design System (refined)
 *
 * Compatível com o API shadcn-style existente
 * (data-slot="button", cva variants). Refinamentos:
 *  - min-h-12 (48px touch target) no size `default` e `lg`
 *  - uso de tokens semânticos (`--ak-*`) em vez de hex hardcoded
 *  - novos variants: `success`, `destructive-subtle`
 *  - respeita prefers-reduced-motion via CSS global (tokens.css)
 *
 * CONTRATO: consumidores existentes continuam funcionando —
 * Button.tsx mantém export `Button` com mesma assinatura.
 */
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/shared/utils';

const buttonVariants = cva(
  // Base: touch-target ≥ 48px via min-h-12 quando size=default/lg
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ak-accent-primary focus-visible:ring-3 focus-visible:ring-ak-accent-primary/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
        golden:
          'bg-gradient-to-r from-[var(--spiritual-gold-dark)] via-[var(--spiritual-gold)] to-[var(--spiritual-gold-light)] text-black font-semibold shadow-[var(--shadow-glow-gold)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:brightness-110 transition-all duration-300',
        // Alias semântico de `golden` para contextos de UI espiritual
        // (form de login, CTA de "ativação", etc.). Mesmo styling.
        spiritual:
          'bg-gradient-to-r from-[var(--spiritual-amber-dark)] via-[var(--spiritual-amber)] to-[var(--spiritual-amber-light)] text-black font-semibold shadow-[var(--shadow-glow-amber)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:brightness-110 transition-all duration-300',
        'golden-outline':
          'border border-spiritual-gold/50 text-spiritual-gold bg-spiritual-gold-muted/30 hover:bg-spiritual-gold/20 hover:border-spiritual-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]',
        // ── Wave 10.2 novos variants (semanticos) ───────────────
        // Usam tokens CSS (`bg-ak-*`) — Tailwind mapeia via
        // @theme block em globals.css. Mantém compat com
        // consumers que usam `variant="primary"`.
        primary:
          'bg-ak-accent-primary text-ak-text-on-accent hover:bg-ak-accent-primary-dim shadow-ak-shadow-sm',
        success:
          'bg-[var(--ak-color-success-bg)] text-[var(--ak-color-success-text)] border border-[var(--ak-color-success-border)] hover:bg-[var(--ak-color-success)]/15',
        'destructive-subtle':
          'bg-[var(--ak-color-error-bg)] text-[var(--ak-color-error-text)] border border-[var(--ak-color-error-border)] hover:bg-red-500/20',
      },
      size: {
        default:
          'h-12 min-h-12 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3', // 48px touch target
        xs: "h-8 min-h-8 gap-1 rounded-[min(var(--ak-radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 min-h-10 gap-1 rounded-[min(var(--ak-radius-md),12px)] px-3 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-12 min-h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4', // 48px touch target
        icon: 'size-12', // 48px touch target (era size-8)
        'icon-xs':
          "size-8 rounded-[min(var(--ak-radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-10 rounded-[min(var(--ak-radius-md),12px)] in-data-[slot=button-group]:rounded-lg', // 40px
        'icon-lg': 'size-12', // 48px
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };