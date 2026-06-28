"use client"

/**
 * Badge v2 — Thematic badges for spiritual context
 *
 * 10 thematic variants: default, secondary, outline, success, warning, danger,
 *                       cabala, ifa, reiki, astrologia
 *
 * Inspired by: GitHub (subtle pill), Linear (categorical colors)
 *
 * Use case: tag chips, status indicators, thematic markers
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
    "text-xs font-medium leading-none whitespace-nowrap",
    "transition-colors duration-[var(--duration-fast)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--foreground)]",
        success:
          "border-transparent bg-[var(--success)]/15 text-[var(--success)]",
        warning:
          "border-transparent bg-[var(--warning)]/15 text-[var(--warning)]",
        danger:
          "border-transparent bg-[var(--destructive)]/15 text-[var(--destructive)]",
        info:
          "border-transparent bg-[var(--info)]/15 text-[var(--info)]",
        // Spiritual themes
        cabala:
          "border-transparent bg-[var(--spiritual-violet)]/15 text-[var(--spiritual-violet)]",
        ifa:
          "border-transparent bg-[var(--chakra-crown)]/15 text-[var(--chakra-crown)]",
        reiki:
          "border-transparent bg-[var(--success)]/15 text-[var(--success)]",
        astrologia:
          "border-transparent bg-[var(--info)]/15 text-[var(--info)]",
        cigano:
          "border-transparent bg-[var(--spiritual-gold-muted)] text-[var(--spiritual-gold-dark)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="inline-flex [&_svg]:size-3">{icon}</span>}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }