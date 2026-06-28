/**
 * Design System v2 — Barrel Export
 *
 * Additive layer over `src/components/ui/` (v1). v2 introduces:
 *   - OKLCH-based color tokens (perceptually uniform)
 *   - Mobile-first touch targets (≥44px on lg sizes)
 *   - Spiritual accents (gold/violet gradients)
 *   - Reduced-motion respect (via tokens.css)
 *   - Type-safe CVA variants
 *
 * Migration: v1 components are NOT deprecated. Use v2 for new work.
 */

export { Button, buttonVariants } from "./button"
export type { ButtonProps } from "./button"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from "./card"

export { Badge, badgeVariants } from "./badge"
export type { BadgeProps } from "./badge"

export { Input } from "./input"
export type { InputProps } from "./input"

export { Avatar, AvatarImage, AvatarFallback } from "./avatar"

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "./sheet"
export type { Side } from "./sheet"

export { Command } from "./command"
export type { CommandItem } from "./command"

export { ToastProvider, useToast } from "./toast"
export type { Severity, ToastInput } from "./toast"