"use client"

/**
 * Button v2 — Premium button system
 *
 * Inspired by: Linear (subtle hover), Stripe (clear hierarchy), Vercel (sharp focus)
 *
 * Variants: primary | secondary | ghost | outline | danger | link | gold | violet
 * Sizes:    sm | md | lg | icon
 *
 * Features:
 *   - Touch target ≥ 44px on lg (mobile a11y)
 *   - Visible focus ring (3px ring-300 with offset)
 *   - active:scale-[0.97] press feedback
 *   - Loading state with spinner
 *   - Icon support (left/right)
 *   - asChild via base-ui (polymorphic)
 */

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-md font-medium whitespace-nowrap select-none",
    "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--primary)]/90 hover:shadow-[var(--shadow-md)]",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)] hover:bg-[var(--secondary)]/80",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        outline:
          "bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] hover:border-[var(--border)]/80",
        danger:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--destructive)]/90",
        link: "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline px-0",
        // Spiritual variants
        gold:
          "bg-gradient-to-br from-[var(--spiritual-gold-dark)] via-[var(--spiritual-gold)] to-[var(--spiritual-gold-light)] text-[var(--accent-foreground)] font-semibold shadow-[var(--shadow-gold)] hover:shadow-[var(--shadow-md)] hover:brightness-110",
        violet:
          "bg-gradient-to-br from-[var(--spiritual-violet-dark)] via-[var(--spiritual-violet)] to-[var(--spiritual-violet-light)] text-white font-semibold shadow-[var(--shadow-violet)] hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base rounded-lg [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          leftIcon && <span className="inline-flex">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </ButtonPrimitive>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }