"use client"

/**
 * Card v2 — Premium card with elevation + interactive hover
 *
 * Inspired by: Vercel (subtle borders + hover lift), Linear (depth + glow)
 *
 * Features:
 *   - 3 elevation levels (flat / raised / floating)
 *   - Optional hover lift (interactive mode)
 *   - Compound API: Card + Header/Title/Description/Content/Footer
 *   - Spiritual variants (gold/violet gradient border)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    "group/card relative flex flex-col gap-4 overflow-hidden",
    // W28 — radius suave base lg (16px), conforme padrão de cards modernos.
    // Usa --radius-lg para alinhar com tokens.ts.
    "rounded-[var(--radius-lg)] bg-[var(--card)] text-[var(--card-foreground)]",
    "transition-[border-radius,box-shadow,transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out)]",
  ].join(" "),
  {
    variants: {
      elevation: {
        flat: "ring-1 ring-[var(--border)]",
        raised: "shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]",
        floating: "shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)]",
      },
      interactive: {
        // W28 — hover lift com radius ainda maior (lg → xl = 16 → 24px)
        true: "cursor-pointer hover:-translate-y-0.5 hover:rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-xl)] hover:ring-[var(--ring)]/30 active:translate-y-0 active:shadow-[var(--shadow-md)]",
        false: "",
      },
      variant: {
        default: "",
        gold: "ring-1 ring-[var(--spiritual-gold)]/40 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--spiritual-gold-muted)]/30 hover:shadow-[var(--shadow-glow-amber)]",
        violet: "ring-1 ring-[var(--spiritual-violet)]/40 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--spiritual-violet)]/10 hover:shadow-[var(--shadow-glow-violet)]",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      elevation: "raised",
      interactive: false,
      variant: "default",
      padding: "md",
    },
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, interactive, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(cardVariants({ elevation, interactive, variant, padding, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-4 pt-4 first:pt-0", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn("text-base font-semibold leading-tight tracking-tight text-[var(--foreground)]", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn("text-sm text-[var(--muted-foreground)] leading-relaxed", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-content" className={cn("px-4", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between gap-2 px-4 pt-4 pb-4 border-t border-[var(--border)]",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }