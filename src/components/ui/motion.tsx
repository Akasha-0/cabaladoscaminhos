"use client";

// ============================================================================
// Motion Primitives — Wave 17 (Trilha Design 3/6)
// ============================================================================
// Mobile-first, 60fps primitives that compose with the design tokens in
// `@/styles/animations`. Every primitive honors `prefers-reduced-motion`
// via the CSS utility classes (`.animate-*`) in `globals.css` — they are
// automatically dropped to 0.01ms by the global reduced-motion media query.
//
// All animations animate ONLY `transform` and `opacity` — never layout
// properties — to stay on the GPU compositor and hit 60fps on mid-tier
// Android devices.
//
// Usage:
//   <FadeIn delay={150}>...</FadeIn>
//   <StaggerList>{posts.map(p => <PostCard key={p.id} post={p} />)}</StaggerList>
// ============================================================================

import * as React from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { staggerDelay, reducedMotionDuration } from "@/styles/animations";

// ============================================================================
// FadeIn — Generic opacity entrance
// ============================================================================
export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in ms before animation starts (default 0). */
  delay?: number;
  /** Use `fadeSlideUp` (translateY + opacity) instead of pure opacity. */
  slide?: boolean;
  /** Render as a child element (e.g. `"li"`, `"section"`). */
  as?: React.ElementType;
  /** Skip the animation entirely (e.g. SSR placeholder). */
  disabled?: boolean;
}

/**
 * Generic opacity/slide entrance. Plays once on mount.
 *
 * @example
 *   <FadeIn slide delay={100}>Conteúdo chegando com elegância.</FadeIn>
 */
export function FadeIn({
  delay = 0,
  slide = false,
  as: Tag = "div",
  disabled = false,
  className,
  style,
  children,
  ...rest
}: FadeInProps) {
  if (disabled) {
    return <Tag className={className} style={style} {...rest}>{children}</Tag>;
  }

  const animClass = slide ? "animate-fade-in-up" : "animate-fade-in";
  return (
    <Tag
      className={cn(animClass, className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ============================================================================
// StaggerList — Feed/library entrance with per-item delay
// ============================================================================
// Cycle 20 W20-Worker-A: nao estende React.HTMLAttributes para evitar TS2430
// (React 19 tipa algumas props como `T | undefined`, conflitando com a interface
// declarada como required).
export interface StaggerListProps {
  /** Milliseconds between siblings (default 50 — Wave 17 spec). */
  step?: number;
  /** Initial delay before the first child starts (default 0). */
  base?: number;
  /** Maximum number of children to stagger. Beyond this, no delay added. */
  max?: number;
  /** Stagger via scroll-fade-in instead of mount-time. */
  onScroll?: boolean;
  /** Class extras (mesma convencao dos outros componentes). */
  className?: string;
  /** Filhos a serem staggered. */
  children?: React.ReactNode;
  /** Outras props sao repassadas ao `<div>` wrapper. */
  [key: string]: unknown;
}

/**
 * Wraps a list and applies staggered fade-in delays to direct children.
 *
 * Defaults match the Wave 17 spec (50ms between siblings, fade-slide-up).
 * For very long lists (>max), extra items render immediately to avoid
 * perceptible lag at the tail.
 *
 * @example
 *   <StaggerList>
 *     {posts.map(p => <PostCard key={p.id} post={p} />)}
 *   </StaggerList>
 */
export function StaggerList({
  step = 50,
  base = 0,
  max = 20,
  onScroll = false,
  className,
  children,
  ...rest
}: StaggerListProps) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={cn(onScroll ? "stagger-on-scroll" : "stagger-children", className)} {...rest}>
      {childArray.map((child, idx) => {
        if (!React.isValidElement(child)) return child;
        const cappedIdx = Math.min(idx, max);
        const delayStyle = staggerDelay(cappedIdx, step, base);

        // Compose with any existing inline style the child may carry.
        const existingStyle = (child.props as { style?: React.CSSProperties }).style ?? {};
        return React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
          key: child.key ?? idx,
          style: { ...delayStyle, ...existingStyle },
        });
      })}
    </div>
  );
}

// ============================================================================
// FadeInOnScroll — IntersectionObserver-driven entrance
// ============================================================================
export interface FadeInOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Threshold for the IntersectionObserver (0..1, default 0.15). */
  threshold?: number;
  /** Translate distance in px (default 16). */
  offset?: number;
  /** Delay before animation starts after intersection (ms). */
  delay?: number;
  /** Stagger inside scroll-revealed list via custom delay formula. */
  index?: number;
  /** Render as a different element. */
  as?: React.ElementType;
}

/**
 * Triggers a fade-slide-up animation when the element scrolls into view.
 * Lightweight IntersectionObserver wrapper — no Framer Motion dependency.
 * Respects `prefers-reduced-motion` via the `.animate-on-scroll` class.
 *
 * @example
 *   {articles.map((a, i) => (
 *     <FadeInOnScroll key={a.id} index={i}>
 *       <ArticleCard article={a} />
 *     </FadeInOnScroll>
 *   ))}
 */
export function FadeInOnScroll({
  threshold = 0.15,
  offset = 16,
  delay = 0,
  index = 0,
  as: Tag = "div",
  className,
  children,
  ...rest
}: FadeInOnScrollProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // SSR fallback / very old browser — show immediately.
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: `0px 0px -${offset}px 0px` },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, offset]);

  const computedDelay = delay + index * 60;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn(
        "scroll-fade-in",
        visible && "is-visible",
        className,
      )}
      style={{
        transitionDelay: `${computedDelay}ms`,
        animationDelay: `${computedDelay}ms`,
      }}
      data-visible={visible ? "true" : "false"}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ============================================================================
// TypingDots — Loading indicator for chat / IA streaming
// ============================================================================
export interface TypingDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual size — affects dot diameter (default "md"). */
  size?: "sm" | "md" | "lg";
  /** Brand color override. Default = spiritual-violet. */
  color?: string;
  /** Accessible label override. */
  label?: string;
}

const SIZES: Record<NonNullable<TypingDotsProps["size"]>, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

/**
 * Three-dot "..." typing indicator. Pure CSS animation — zero JS per frame.
 * Mirrors the convention used by iMessage, WhatsApp, Telegram for AI/typing.
 *
 * @example
 *   <TypingDots label="Akasha está escrevendo" />
 */
export function TypingDots({
  size = "md",
  color,
  label = "Digitando",
  className,
  ...rest
}: TypingDotsProps) {
  const dotClass = cn("inline-block rounded-full bg-current", SIZES[size]);
  const dotStyle: CSSProperties = color ? { color } : {};

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center gap-1 align-middle", className)}
      style={dotStyle}
      {...rest}
    >
      <span
        className={cn(dotClass, "typing-dot")}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn(dotClass, "typing-dot")}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn(dotClass, "typing-dot")}
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

// ============================================================================
// HeartBurst — Like animation with particles
// ============================================================================
export interface HeartBurstProps {
  /** Visual trigger — when true, plays the burst. */
  active: boolean;
  /** Optional callback fired after the burst finishes. */
  onComplete?: () => void;
  /** Diameter of the central heart in px (default 28). */
  size?: number;
  /** Brand color for the heart (default spiritual-violet). */
  color?: string;
  className?: string;
}

/**
 * Heart-burst particle animation for "like" interactions. Self-contained —
 * does NOT render a button. Wrap your own button:
 *
 * @example
 *   <button onClick={() => setLiked(true)}>
 *     <HeartBurst active={liked} onComplete={() => setBursting(false)} />
 *     <HeartIcon filled={liked} />
 *   </button>
 *
 * Uses six particles arranged in a radial pattern. Reduced motion users
 * see a brief opacity-only acknowledgement instead.
 */
export function HeartBurst({
  active,
  onComplete,
  size = 28,
  color = "var(--spiritual-violet)",
  className,
}: HeartBurstProps) {
  React.useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(
      () => onComplete?.(),
      reducedMotionDuration(700),
    );
    return () => window.clearTimeout(t);
  }, [active, onComplete]);

  if (!active) return null;

  // Six particle directions (in degrees) — radial pattern.
  const particles = [0, 60, 120, 180, 240, 300];

  return (
    <span
      aria-hidden="true"
      className={cn("heart-burst pointer-events-none absolute inset-0", className)}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="heart-burst-center"
        fill={color}
      >
        <path d="M12 21s-7-4.5-9.5-9C.5 8.5 2.5 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4.5 4 8-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
      {particles.map((angle) => (
        <span
          key={angle}
          className="heart-burst-particle"
          style={{
            // Set CSS custom property for the radial transform.
            ["--burst-angle" as string]: `${angle}deg`,
            background: color,
          }}
        />
      ))}
    </span>
  );
}

// ============================================================================
// PressableScale — Wraps a child with a press scale effect
// ============================================================================
export interface PressableScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scale factor on press (default 0.97 — matches Button primitive). */
  scale?: number;
  /** Disable the press effect (e.g. for non-interactive decorative use). */
  disabled?: boolean;
}

/**
 * Lightweight wrapper that applies a tactile press-scale animation.
 * Useful for `<Card>` and `<ListItem>` that don't ship with a base
 * `active:scale-[0.97]` Tailwind class.
 *
 * Honors `prefers-reduced-motion` (CSS handles it).
 *
 * @example
 *   <PressableScale>
 *     <article className="card-spiritual">...</article>
 *   </PressableScale>
 */
export function PressableScale({
  scale = 0.97,
  disabled = false,
  className,
  children,
  ...rest
}: PressableScaleProps) {
  const style = React.useMemo<CSSProperties>(
    () => ({
      transition: "transform 100ms cubic-bezier(0.16, 1, 0.3, 1)",
      ["--press-scale" as string]: String(scale),
    }),
    [scale],
  );

  return (
    <div
      className={cn(
        !disabled && "pressable-scale",
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Toast — Slide-in notification
// ============================================================================
export type ToastVariant = "default" | "success" | "warning" | "destructive" | "sacred";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  variant?: ToastVariant;
  /** Auto-dismiss after N ms (default 5000). Set 0 to disable. */
  autoDismissMs?: number;
  onDismiss?: () => void;
  /** Position — `top` for system notifications, `bottom` for inline feedback. */
  position?: "top" | "bottom";
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-emerald-500/50 bg-emerald-950/80 text-emerald-50",
  warning: "border-amber-500/50 bg-amber-950/80 text-amber-50",
  destructive: "border-red-500/50 bg-red-950/80 text-red-50",
  sacred: "border-spiritual-gold/40 bg-card text-foreground shadow-[var(--shadow-glow-gold)]",
};

/**
 * Self-managing toast: slide-in from top + auto-dismiss + ARIA live region.
 *
 * @example
 *   <Toast
 *     visible={showToast}
 *     variant="sacred"
 *     onDismiss={() => setShowToast(false)}
 *   >
 *     ✨ Sincronização concluída
 *   </Toast>
 */
export function Toast({
  visible,
  variant = "default",
  autoDismissMs = 5000,
  onDismiss,
  position = "top",
  className,
  children,
  ...rest
}: ToastProps) {
  React.useEffect(() => {
    if (!visible || autoDismissMs <= 0) return;
    const t = window.setTimeout(() => onDismiss?.(), autoDismissMs);
    return () => window.clearTimeout(t);
  }, [visible, autoDismissMs, onDismiss]);

  const positionClass = position === "top" ? "toast-top" : "toast-bottom";

  return (
    <div
      role={variant === "destructive" || variant === "warning" ? "alert" : "status"}
      aria-live={variant === "destructive" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "pointer-events-auto fixed left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md",
        "min-w-[260px] max-w-[420px]",
        positionClass,
        visible ? "is-visible" : "is-hidden",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ProgressBar — Upload progress with shimmer
// ============================================================================
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..100 percent complete. */
  value: number;
  /** Brand color (default spiritual-gold gradient). */
  variant?: "gold" | "violet" | "auto";
  /** Optional ARIA label override. */
  label?: string;
  /** Show percentage label (default true). */
  showLabel?: boolean;
}

const VARIANT_FILL: Record<NonNullable<ProgressBarProps["variant"]>, string> = {
  gold: "progress-fill-gold",
  violet: "progress-fill-violet",
  auto: "progress-fill-auto",
};

/**
 * Accessible progress bar with animated fill. Uses a CSS transition on
 * `transform: scaleX(...)` so the fill animates on the compositor thread.
 *
 * @example
 *   <ProgressBar value={uploadPercent} label="Enviando foto" />
 */
export function ProgressBar({
  value,
  variant = "gold",
  label = "Progresso",
  showLabel = true,
  className,
  ...rest
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)} {...rest}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span aria-hidden="true">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted/40"
      >
        <div
          className={cn("progress-fill h-full origin-left rounded-full", VARIANT_FILL[variant])}
          style={{ transform: `scaleX(${clamped / 100})` }}
        />
      </div>
      <span className="sr-only">{Math.round(clamped)} por cento concluído</span>
    </div>
  );
}

// ============================================================================
// ModalShell — Reusable modal animation wrapper
// ============================================================================
export interface ModalShellProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  /** Backdrop click handler. */
  onBackdropClick?: () => void;
  /** Render the modal as a portal (recommended). */
  portal?: boolean;
}

/**
 * Reusable modal shell that handles scale-fade animation + backdrop.
 * Composes with Radix Dialog / HeadlessUI Dialog via children.
 *
 * @example
 *   <ModalShell visible={open} onBackdropClick={() => setOpen(false)}>
 *     <Dialog.Content>...</Dialog.Content>
 *   </ModalShell>
 */
export function ModalShell({
  visible,
  onBackdropClick,
  className,
  children,
  ...rest
}: ModalShellProps) {
  if (!visible) return null;
  return (
    <div
      className="modal-shell-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "modal-shell-content relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-modal)]",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// PageTransition — Next.js layout-level wrapper
// ============================================================================
export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique route key — re-mounts the wrapper when it changes. */
  routeKey: string;
  /** Animation style (default "fadeSlideUp"). */
  preset?: "fade" | "fadeSlideUp" | "slideInRight";
}

/**
 * Drop-in wrapper for Next.js layouts/pages. Re-keys on route change so the
 * animation replays. Pairs with the View Transitions API constant
 * `viewTransition.main` in `@/styles/animations`.
 *
 * @example
 *   // app/(community)/layout.tsx
 *   return <PageTransition routeKey={pathname}>{children}</PageTransition>;
 */
export function PageTransition({
  routeKey,
  preset = "fadeSlideUp",
  className,
  children,
  ...rest
}: PageTransitionProps) {
  const presetClass =
    preset === "fade"
      ? "page-transition-fade"
      : preset === "slideInRight"
        ? "page-transition-slide"
        : "page-transition-slide-up";

  return (
    <div
      key={routeKey}
      className={cn("page-transition-root", presetClass, className)}
      style={{ viewTransitionName: "akasha-main" } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PUBLIC API SURFACE
// ============================================================================
export const Motion = {
  FadeIn,
  StaggerList,
  FadeInOnScroll,
  TypingDots,
  HeartBurst,
  PressableScale,
  Toast,
  ProgressBar,
  ModalShell,
  PageTransition,
} as const;

export default Motion;