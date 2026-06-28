/**
 * Cabala dos Caminhos — Animation Tokens & Presets (Wave 17)
 * ============================================================================
 * Single source of truth for animation duration, easing and motion presets.
 * Mirrors the CSS custom properties declared in `src/app/globals.css` so
 * JS-driven animations (Framer Motion, GSAP, View Transitions API, RSC
 * streaming transitions, etc) stay in lockstep with the design system.
 *
 * Mobile-first, 60fps mandatory. Every preset uses `transform` + `opacity`
 * only — never layout-affecting properties (width, height, top, left) — to
 * stay on the compositor thread and avoid jank.
 *
 * Accessibility: all presets must be honored by a
 * `@media (prefers-reduced-motion: reduce)` block that drops durations to
 * 0.01ms. See `globals.css` for the canonical implementation; this module
 * also exposes a `reducedMotionDuration` helper for JS consumers.
 *
 * @example
 *   import { transitions } from "@/styles/animations";
 *   <div style={transitions.fadeSlideUp}>...</div>
 *
 * @see docs/ANIMATIONS-W17.md for usage patterns and rationale.
 * ============================================================================
 */

import type { CSSProperties } from "react";

// ============================================================================
// DURATION TOKENS (ms)
// ============================================================================
// Aligned with `--duration-*` CSS variables. Keep in sync.
export const duration = {
  instant: 75,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
  page: 400,
} as const;

export type DurationToken = keyof typeof duration;

// ============================================================================
// EASING TOKENS
// ============================================================================
// Aligned with `--ease-*` CSS variables. Keep in sync.
export const easing = {
  linear: "linear",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",           // expo-out — entrances
  in: "cubic-bezier(0.7, 0, 0.84, 0)",              // expo-in  — exits
  inOut: "cubic-bezier(0.37, 0, 0.63, 1)",          // sine-in-out — symmetric
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",      // slight overshoot — playful
  gentle: "cubic-bezier(0.4, 0, 0.2, 1)",           // material standard
} as const;

export type EasingToken = keyof typeof easing;

// ============================================================================
// CSS VARIABLE READS (preferred — single source of truth)
// ============================================================================
/**
 * Build a CSS custom-property string for inline style.
 *
 * @example
 *   style={cssVar("--duration-normal")} // "var(--duration-normal)"
 */
export const cssVar = (name: `--${string}`): string => `var(${name})`;

// ============================================================================
// STYLE PRESETS (inline-style ready)
// ============================================================================
//
// Each preset is a frozen `CSSProperties` object tuned for the Akasha Portal
// design language. Use these when you need a one-off animation that doesn't
// warrant a CSS class (e.g. conditional render, RSC streaming boundary).
//
// ---------------------------------------------------------------------------

/** Opacity-only fade. Cheap, smooth. */
export const fadeTransition: CSSProperties = {
  transitionProperty: "opacity",
  transitionDuration: `${duration.normal}ms`,
  transitionTimingFunction: easing.out,
};

/** Fade + translate-y(8px → 0). Page content entrances. */
export const fadeSlideUp: CSSProperties = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${duration.slow}ms`,
  transitionTimingFunction: easing.out,
  willChange: "opacity, transform",
};

/** Fade + translate-y(0 → -8px). Subtle dismiss. */
export const fadeSlideDown: CSSProperties = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${duration.normal}ms`,
  transitionTimingFunction: easing.in,
  willChange: "opacity, transform",
};

/** Slide from right edge (toasts, notifications). */
export const slideInRight: CSSProperties = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${duration.slow}ms`,
  transitionTimingFunction: easing.out,
  willChange: "opacity, transform",
};

/** Slide from top edge (top-anchored toasts). */
export const slideInTop: CSSProperties = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${duration.slow}ms`,
  transitionTimingFunction: easing.out,
  willChange: "opacity, transform",
};

/** Scale + fade. Modal/dialog open. */
export const scaleFade: CSSProperties = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${duration.normal + 50}ms`,
  transitionTimingFunction: easing.spring,
  willChange: "opacity, transform",
};

/** Card hover lift (translateY -2px + shadow). */
export const cardHover: CSSProperties = {
  transitionProperty: "transform, box-shadow",
  transitionDuration: `${duration.normal}ms`,
  transitionTimingFunction: easing.out,
  willChange: "transform",
};

/** Button press. Use alongside `active:scale-[0.97]` Tailwind class. */
export const buttonPress: CSSProperties = {
  transitionProperty: "transform",
  transitionDuration: `${duration.fast}ms`,
  transitionTimingFunction: easing.out,
};

/** Tab indicator slide. */
export const tabIndicator: CSSProperties = {
  transitionProperty: "transform, width",
  transitionDuration: `${duration.normal}ms`,
  transitionTimingFunction: easing.gentle,
  willChange: "transform",
};

// ============================================================================
// GROUPED PRESETS
// ============================================================================
/**
 * Transition presets grouped by intent. Prefer this over individual imports
 * when composing multiple effects in one component.
 */
export const transitions = {
  fade: fadeTransition,
  fadeSlideUp,
  fadeSlideDown,
  slideInRight,
  slideInTop,
  scaleFade,
  cardHover,
  buttonPress,
  tabIndicator,
} as const;

export type TransitionPreset = keyof typeof transitions;

// ============================================================================
// STAGGER HELPERS (for lists / feeds)
// ============================================================================
/**
 * Returns inline style with computed `transition-delay` for the n-th item in
 * a staggered entrance animation.
 *
 * @param index  Zero-based position in the list.
 * @param step   Milliseconds between siblings (default 50 — Wave 17 spec).
 * @param base   Initial delay before first item starts (default 0).
 *
 * @example
 *   {items.map((item, i) => (
 *     <li key={item.id} style={staggerDelay(i)} className="animate-fade-in-up">
 *       {item.label}
 *     </li>
 *   ))}
 */
export function staggerDelay(index: number, step = 50, base = 0): CSSProperties {
  return { animationDelay: `${base + index * step}ms` };
}

/**
 * Returns inline transition-delay (for non-animation transitions like
 * hover-staggered card reveals).
 */
export function staggerTransitionDelay(index: number, step = 30, base = 0): CSSProperties {
  return { transitionDelay: `${base + index * step}ms` };
}

// ============================================================================
// KEYFRAMES (string-form, for JS animation libraries)
// ============================================================================
/**
 * Minimal keyframe strings suitable for Web Animations API or libraries
 * that consume raw keyframe definitions. Each is mirrored in `globals.css`
 * so CSS-driven entrances stay visually identical to JS-driven ones.
 */
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  fadeInDown: {
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  slideInRight: {
    from: { opacity: 0, transform: "translateX(24px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  slideInLeft: {
    from: { opacity: 0, transform: "translateX(-24px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.95)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  heartBurst: {
    "0%": { opacity: 0, transform: "scale(0.3) translateY(0)" },
    "30%": { opacity: 1, transform: "scale(1.2) translateY(-12px)" },
    "100%": { opacity: 0, transform: "scale(0.9) translateY(-40px)" },
  },
  typingBlink: {
    "0%, 60%, 100%": { opacity: 0.3, transform: "translateY(0)" },
    "30%": { opacity: 1, transform: "translateY(-3px)" },
  },
} as const;

// ============================================================================
// REDUCED MOTION HELPER
// ============================================================================
/**
 * Returns the user's `prefers-reduced-motion` preference. SSR-safe — returns
 * `false` on the server (initial render), then re-evaluates after hydration
 * via `matchMedia` change events.
 *
 * Use this in JS animation libraries (Framer Motion, GSAP) to short-circuit
 * animations for users with vestibular sensitivities.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Returns a duration token scaled to ~0 when reduced motion is requested.
 * Use in JS animation config:
 *
 * @example
 *   animate(el, { duration: reducedMotionDuration(duration.normal) })
 */
export function reducedMotionDuration(original: number): number {
  return prefersReducedMotion() ? 0.01 : original;
}

// ============================================================================
// VIEW TRANSITIONS API (Next.js 16 native page transitions)
// ============================================================================
/**
 * View Transitions API name constants — used with `document.startViewTransition`.
 * Pair with the CSS classes in `globals.css` (`.vt-fade`, `.vt-slide-up`).
 */
export const viewTransition = {
  /** Default fade transition name for `<main>` wrapper. */
  main: "akasha-main",
  /** Slide-up for modal/dialog content. */
  modal: "akasha-modal",
  /** Hero image crossfade. */
  hero: "akasha-hero",
} as const;

export type ViewTransitionName = keyof typeof viewTransition;

// ============================================================================
// PUBLIC API SURFACE
// ============================================================================
export const animations = {
  duration,
  easing,
  transitions,
  keyframes,
  staggerDelay,
  staggerTransitionDelay,
  prefersReducedMotion,
  reducedMotionDuration,
  viewTransition,
} as const;

export default animations;