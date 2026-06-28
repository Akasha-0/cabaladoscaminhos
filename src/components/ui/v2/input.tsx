"use client"

/**
 * Input v2 — Form input with error state + helper text
 *
 * Inspired by: Stripe (clean borders), Vercel (focused ring), Linear (subtle hover)
 *
 * Features:
 *   - Error state with red ring + icon
 *   - Helper text below
 *   - Optional left/right icon
 *   - Touch target ≥ 44px (mobile a11y)
 *   - WCAG AA contrast (text + border)
 *   - Disabled state preserved
 *   - aria-invalid / aria-describedby wired
 */

import * as React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Error message — sets aria-invalid=true + shows icon */
  error?: string
  /** Helper text below the input */
  helperText?: string
  /** Success state — shows checkmark */
  success?: boolean
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon (overrides default error/success icon) */
  rightIcon?: React.ReactNode
  /** Wrapper className for layout control */
  wrapperClassName?: string
  inputSize?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-11 px-3.5 text-sm rounded-md",
  lg: "h-12 px-4 text-base rounded-lg",
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      inputSize = "md",
      type = "text",
      error,
      helperText,
      success,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const reactId = React.useId()
    const inputId = id ?? `input-${reactId}`
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    const hasError = Boolean(error)

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", wrapperClassName)}>
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 inline-flex text-[var(--muted-foreground)] pointer-events-none [&_svg]:size-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            data-slot="input"
            className={cn(
              "peer w-full bg-[var(--background)] text-[var(--foreground)]",
              "border border-[var(--border)]",
              "placeholder:text-[var(--muted-foreground)]",
              "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",
              "outline-none",
              "hover:border-[var(--border)]/80",
              "focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--muted)]",
              "aria-[invalid=true]:border-[var(--destructive)] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[var(--destructive)]/20",
              sizeMap[inputSize],
              leftIcon && "pl-10",
              (hasError || success || rightIcon) && "pr-10",
              className
            )}
            {...props}
          />
          {(hasError || success || rightIcon) && (
            <span className="absolute right-3 inline-flex text-[var(--muted-foreground)] pointer-events-none [&_svg]:size-4">
              {hasError ? (
                <AlertCircle className="text-[var(--destructive)]" aria-hidden />
              ) : success ? (
                <CheckCircle2 className="text-[var(--success)]" aria-hidden />
              ) : (
                rightIcon
              )}
            </span>
          )}
        </div>
        {(helperText || error) && (
          <p
            id={hasError ? errorId : helperId}
            data-slot={hasError ? "input-error" : "input-helper"}
            className={cn(
              "text-xs leading-tight",
              hasError ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
            )}
          >
            {hasError ? error : helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }