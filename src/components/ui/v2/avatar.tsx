"use client"

/**
 * Avatar v2 — Polished avatar with status indicator + ring
 *
 * Inspired by: Linear (subtle ring), GitHub (status dot), Discord (group stack)
 *
 * Features:
 *   - 5 sizes (xs/sm/md/lg/xl) — touch-friendly
 *   - Status indicator (online/offline/away/busy) — bottom-right dot
 *   - Optional spiritual ring (gold/violet glow)
 *   - Auto initials fallback (deterministic gradient by name)
 *   - Lazy image loading
 *   - Stacking support via negative margin (group avatar)
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 overflow-hidden rounded-full",
    "bg-gradient-to-br from-[var(--spiritual-gold)] to-[var(--spiritual-violet)]",
    "transition-all duration-[var(--duration-fast)]",
  ].join(" "),
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-lg",
      },
      ring: {
        none: "",
        gold: "ring-2 ring-[var(--spiritual-gold)] ring-offset-2 ring-offset-[var(--background)]",
        violet: "ring-2 ring-[var(--spiritual-violet)] ring-offset-2 ring-offset-[var(--background)]",
        primary: "ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]",
      },
    },
    defaultVariants: {
      size: "md",
      ring: "none",
    },
  }
)

const statusVariants = {
  online: "bg-[var(--success)]",
  offline: "bg-[var(--muted-foreground)]",
  away: "bg-[var(--warning)]",
  busy: "bg-[var(--destructive)]",
}

const statusSizeMap = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
}

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  status?: keyof typeof statusVariants
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = "md", ring, status, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="avatar"
      className={cn(avatarVariants({ size, ring }), className)}
      {...props}
    >
      {children}
      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-[var(--background)]",
            statusVariants[status],
            statusSizeMap[size ?? "md"]
          )}
        />
      )}
    </span>
  )
)
Avatar.displayName = "Avatar"

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // placeholder para satisfazer no-empty-object-type — sem members adicionais
  readonly __brand?: never;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, src, ...props }, ref) => {
    if (!src) return null
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt ?? ""}
        className={cn("aspect-square size-full object-cover", className)}
        loading="lazy"
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string
}

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, name = "", children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex size-full items-center justify-center rounded-full font-medium text-white",
        className
      )}
      {...props}
    >
      {children ?? getInitials(name)}
    </span>
  )
)
AvatarFallback.displayName = "AvatarFallback"