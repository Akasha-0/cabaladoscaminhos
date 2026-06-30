"use client"

/**
 * LuminousCard v2 — Card com aura cromática + shine aurora
 *
 * Inspiração: aura de meditação, liturgia solar, scrolar mystical UIs.
 *
 * Princípios de design (Lina — designer):
 *   - Luz vem DE DENTRO (gradient inset) + halo emanado (shadow externo)
 *   - Hover: glow intensifica + leve scale (1.02) sem perder leitura
 *   - Shine sweep: gradiente diagonal varre o card em 6s (aurora boreal)
 *   - prefers-reduced-motion honrado via .animate-shine (já bloqueado no global)
 *
 * Variantes cromáticas (4): amber, violet, emerald, cyan
 *   Cada variante define:
 *     --luminous-glow : shadow externo (respiração em pulse mode)
 *     --luminous-tint : gradient interno (12% saturation, nunca dominante)
 *
 * elevation: flat | raised | floating (3 níveis de sombra base neutra)
 * pulse:     true = breathe animation (use com moderação, ≤3 por viewport)
 *
 * Performance:
 *   - 1 box-shadow ativo no default, 1 no hover (CSS swap, sem reflow)
 *   - shine é background-image animado (não box-shadow — compositado na GPU)
 *   - Não usar pulse em listas com 10+ itens (preferir pulse=false + hover)
 *
 * Uso:
 *   <LuminousCard variant="amber" elevation="raised">
 *     <LuminousCardHeader>Consciência</LuminousCardHeader>
 *     <LuminousCardContent>Sua leitura de hoje...</LuminousCardContent>
 *   </LuminousCard>
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const luminousCardVariants = cva(
  [
    "group/luminous relative isolate overflow-hidden rounded-[var(--radius-xl)]",
    "bg-[var(--card)] text-[var(--card-foreground)]",
    "border border-[var(--border)]",
    // W28 — transição refinada (radius + glow + scale), 240ms ease-out-expo
    "transition-[border-radius,box-shadow,transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
    "will-change-transform",
    // W28 — hover lift radius: xl → 2xl (24→32px) + scale + glow
    "hover:rounded-[var(--radius-2xl)] hover:scale-[1.02] hover:shadow-[var(--luminous-glow)]",
    "hover:border-transparent",
  ].join(" "),
  {
    variants: {
      variant: {
        amber:
          "[--luminous-glow:var(--shadow-glow-amber)] [--luminous-tint:oklch(0.70_0.18_80_/_0.12)]",
        violet:
          "[--luminous-glow:var(--shadow-glow-violet)] [--luminous-tint:oklch(0.65_0.22_285_/_0.12)]",
        emerald:
          "[--luminous-glow:var(--shadow-glow-emerald)] [--luminous-tint:oklch(0.65_0.17_160_/_0.12)]",
        cyan:
          "[--luminous-glow:var(--shadow-glow-cyan)] [--luminous-tint:oklch(0.65_0.20_220_/_0.12)]",
      },
      elevation: {
        flat: "shadow-[var(--shadow-sm)]",
        raised: "shadow-[var(--shadow-md)]",
        floating: "shadow-[var(--shadow-lg)]",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "amber", pulse: true, class: "animate-glow-amber" },
      { variant: "violet", pulse: true, class: "animate-glow-violet" },
      { variant: "emerald", pulse: true, class: "animate-glow-emerald" },
      { variant: "cyan", pulse: true, class: "animate-glow-cyan" },
    ],
    defaultVariants: {
      variant: "amber",
      elevation: "raised",
      pulse: false,
    },
  }
)

export interface LuminousCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof luminousCardVariants> {
  /** Disable the diagonal shine sweep (default: true). Useful for static contexts. */
  disableShine?: boolean
}

const LuminousCard = React.forwardRef<HTMLDivElement, LuminousCardProps>(
  (
    { className, variant, elevation, pulse, disableShine = false, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="luminous-card"
        data-variant={variant}
        className={cn(luminousCardVariants({ variant, elevation, pulse, className }))}
        {...props}
      >
        {/* Gradient interno — luz inscrita vinda de dentro (12% tint, nunca dominante) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, var(--luminous-tint) 0%, transparent 60%)",
          }}
        />
        {/* Shine sweep — varredura diagonal luminosa (6s aurora) */}
        {!disableShine && (
          <div
            aria-hidden
            className="animate-shine pointer-events-none absolute inset-0 -z-10"
          />
        )}
        {children}
      </div>
    )
  }
)
LuminousCard.displayName = "LuminousCard"

const LuminousCardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="luminous-card-header"
      className={cn("flex flex-col gap-1.5 px-5 pt-5", className)}
      {...props}
    />
  )
)
LuminousCardHeader.displayName = "LuminousCardHeader"

const LuminousCardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="luminous-card-title"
      className={cn(
        "text-base font-semibold leading-tight tracking-tight text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  )
)
LuminousCardTitle.displayName = "LuminousCardTitle"

const LuminousCardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="luminous-card-description"
      className={cn("text-sm text-[var(--muted-foreground)] leading-relaxed", className)}
      {...props}
    />
  )
)
LuminousCardDescription.displayName = "LuminousCardDescription"

const LuminousCardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="luminous-card-content"
      className={cn("px-5", className)}
      {...props}
    />
  )
)
LuminousCardContent.displayName = "LuminousCardContent"

const LuminousCardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="luminous-card-footer"
      className={cn(
        "flex items-center justify-between gap-2 px-5 pt-4 pb-5 border-t border-[var(--border)]",
        className
      )}
      {...props}
    />
  )
)
LuminousCardFooter.displayName = "LuminousCardFooter"

export {
  LuminousCard,
  LuminousCardHeader,
  LuminousCardTitle,
  LuminousCardDescription,
  LuminousCardContent,
  LuminousCardFooter,
  luminousCardVariants,
}