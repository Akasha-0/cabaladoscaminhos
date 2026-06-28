"use client"

/**
 * Sheet v2 — Mobile-first bottom sheet pattern
 *
 * Inspired by: Apple HIG (bottom sheet on iOS), Linear (slide-in panel)
 *
 * Features:
 *   - 4 sides (top / right / bottom / left)
 *   - Mobile-first: default = bottom (sheet)
 *   - Drag handle affordance on bottom
 *   - Backdrop with blur
 *   - Escape key closes
 *   - Body scroll lock when open
 *   - Portal-based (no z-index wars)
 *
 * Use case: mobile filters, share sheets, quick actions
 */

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type Side = "top" | "right" | "bottom" | "left"

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheet() {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error("Sheet components must be used inside <Sheet>")
  return ctx
}

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onOpenChange])

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetContentProps extends React.ComponentProps<"div"> {
  side?: Side
  /** Hide the close button (mobile bottom sheet usually omits it; drag handle suffices) */
  hideClose?: boolean
}

const sideStyles: Record<Side, string> = {
  top: "inset-x-0 top-0 border-b border-[var(--border)] data-[state=open]:slide-in-from-top",
  right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-[var(--border)] data-[state=open]:slide-in-from-right",
  bottom:
    "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl border-t border-[var(--border)] data-[state=open]:slide-in-from-bottom pb-[env(safe-area-inset-bottom)]",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-[var(--border)] data-[state=open]:slide-in-from-left",
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "bottom", hideClose = false, children, ...props }, ref) => {
    const { open, onOpenChange } = useSheet()
    if (!open) return null

    return (
      <div data-slot="sheet-portal" className="fixed inset-0 z-[var(--z-modal)]">
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => onOpenChange(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-[var(--duration-normal)]"
        />
        {/* Panel */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? "open" : "closed"}
          data-side={side}
          data-slot="sheet-content"
          className={cn(
            "absolute bg-[var(--background)] shadow-[var(--shadow-2xl)]",
            "animate-in duration-[var(--duration-normal)] ease-[var(--ease-out)]",
            sideStyles[side],
            className
          )}
          {...props}
        >
          {/* Drag handle (mobile bottom sheet affordance) */}
          {side === "bottom" && (
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1.5 w-10 rounded-full bg-[var(--muted-foreground)]/40" />
            </div>
          )}
          {!hideClose && side !== "bottom" && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 inline-flex items-center justify-center size-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
          {children}
        </div>
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6 pb-3", className)}
      {...props}
    />
  )
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<"h2">>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      data-slot="sheet-title"
      className={cn("text-lg font-semibold tracking-tight text-[var(--foreground)]", className)}
      {...props}
    />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="sheet-description"
      className={cn("text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  )
)
SheetDescription.displayName = "SheetDescription"

const SheetBody = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-body"
      className={cn("flex-1 overflow-y-auto p-6 pt-2", className)}
      {...props}
    />
  )
)
SheetBody.displayName = "SheetBody"

const SheetFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn(
        "flex items-center justify-end gap-2 border-t border-[var(--border)] p-4",
        className
      )}
      {...props}
    />
  )
)
SheetFooter.displayName = "SheetFooter"

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  type Side,
}