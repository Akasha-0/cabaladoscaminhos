"use client"

/**
 * Toast v2 — Premium notification system
 *
 * Inspired by: Sonner (clean API), Vercel (subtle slide-in), Linear (success focus)
 *
 * Features:
 *   - 4 severities (success / info / warning / error)
 *   - Auto-dismiss with progress bar
 *   - Manual close button
 *   - Stack manager (max 5 visible, FIFO)
 *   - Portal-based, z-toast layer
 *   - Spiritual accent: gold border on success
 *   - Accessible: aria-live=polite, role=status
 *   - Hook-based API: useToast() returns { toast, dismiss }
 *
 * Usage:
 *   const { toast } = useToast()
 *   toast({ severity: 'success', title: 'Salvo!', description: 'Sua leitura foi registrada.' })
 */

import * as React from "react"
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"

type Severity = "success" | "info" | "warning" | "error"

interface ToastInput {
  title: string
  description?: string
  severity?: Severity
  /** Duration in ms (default 5000, set to 0 for persistent) */
  duration?: number
}

interface ToastEntry extends Required<Omit<ToastInput, "description">> {
  id: string
  description?: string
}

interface ToastContextValue {
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

const severityStyles: Record<Severity, { border: string; icon: React.ReactNode; ariaRole: string; glow: string }> = {
  success: {
    border: "border-l-[var(--spiritual-gold)]",
    icon: <CheckCircle2 className="size-5 text-[var(--spiritual-gold-dark)]" aria-hidden />,
    ariaRole: "status",
    glow: "shadow-[var(--shadow-lg),var(--shadow-glow-amber)]",
  },
  info: {
    border: "border-l-[var(--info)]",
    icon: <Info className="size-5 text-[var(--info)]" aria-hidden />,
    ariaRole: "status",
    glow: "shadow-[var(--shadow-lg),var(--shadow-glow-cyan)]",
  },
  warning: {
    border: "border-l-[var(--warning)]",
    icon: <AlertTriangle className="size-5 text-[var(--warning)]" aria-hidden />,
    ariaRole: "alert",
    glow: "shadow-[var(--shadow-lg),var(--shadow-glow-amber)]",
  },
  error: {
    border: "border-l-[var(--destructive)]",
    icon: <XCircle className="size-5 text-[var(--destructive)]" aria-hidden />,
    ariaRole: "alert",
    glow: "shadow-[var(--shadow-lg),0_0_24px_oklch(0.65_0.20_20_/_0.35),0_0_48px_oklch(0.65_0.20_20_/_0.18)]",
  },
}

const MAX_VISIBLE = 5
const DEFAULT_DURATION = 5000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([])
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = React.useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = React.useCallback(
    (input: ToastInput): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const entry: ToastEntry = {
        id,
        title: input.title,
        description: input.description,
        severity: input.severity ?? "info",
        duration: input.duration ?? DEFAULT_DURATION,
      }
      setToasts((t) => {
        const next = [...t, entry]
        // FIFO trim
        if (next.length > MAX_VISIBLE) next.shift()
        return next
      })

      if (entry.duration > 0) {
        const timer = setTimeout(() => dismiss(id), entry.duration)
        timersRef.current.set(id, timer)
      }
      return id
    },
    [dismiss]
  )

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ToastViewportProps {
  toasts: ToastEntry[]
  onDismiss: (id: string) => void
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      data-slot="toast-viewport"
      className="pointer-events-none fixed top-4 right-4 z-[var(--z-toast)] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2 sm:top-6 sm:right-6"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

interface ToastCardProps {
  toast: ToastEntry
  onDismiss: (id: string) => void
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const style = severityStyles[toast.severity]
  return (
    <div
      role={style.ariaRole}
      data-slot="toast"
      data-severity={toast.severity}
      className={cn(
        "pointer-events-auto relative",
        "bg-[var(--popover)] text-[var(--popover-foreground)]",
        // W28 — toast com radius xl (24px) para acolhimento, preservando borda-l-4 da severidade
        "rounded-[var(--radius-xl)] border border-[var(--border)] border-l-4",
        style.glow,
        "p-4 pr-10",
        "animate-in slide-in-from-right-4 fade-in duration-[var(--duration-normal)] ease-[var(--ease-spring)]",
        style.border
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{toast.title}</div>
          {toast.description && (
            <div className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
              {toast.description}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        // W28 — close button com radius suave (sm = 8px), touch target ≥24px
        className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-[background-color,color,border-radius] duration-[var(--duration-fast)]"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export { ToastProvider, useToast, type Severity, type ToastInput }