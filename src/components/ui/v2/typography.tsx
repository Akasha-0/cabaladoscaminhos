/**
 * Typography v2 — Sacred typography primitives
 *
 * Wave 28.5 — Refinamento tipográfico.
 * Filosofia: cada fonte carrega intenção.
 *   - Cinzel (Sacred/Display) — herança romana, uppercase + tracking wide
 *   - Cormorant Garamond (Mystical/Serif) — eloqüência, poesia, oráculo
 *   - Raleway (Tech/Sans) — precisão moderna, UI, dados
 *   - IM Fell English (Manuscript) — manuscrito antigo, marginalia
 *   - Noto Sans Devanagari (Sanskrit) — mantras, sutras, transliteração
 *
 * Cada <Component as> aceita `as` prop para polymorphic rendering
 * (ex: <Heading as="h1">, <Display as="h2">).
 */

import * as React from "react";

import { cn } from "@/lib/utils";

// ============================================================================
// Headings (Cinzel Display)
// ============================================================================

interface HeadingProps extends React.ComponentProps<"h1"> {
  /** Override element. Defaults match the variant. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
}

/** Hero H1 — Cinzel Display 2XL (clamp 40-64px), tracking wide. */
const DisplayHero = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: As = "h1", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(
        "font-cinzel font-bold tracking-[0.02em] leading-[1.1]",
        "text-display-xl md:text-display-2xl",
        className,
      )}
      {...props}
    />
  ),
);
DisplayHero.displayName = "DisplayHero";

/** Section H2 — Cinzel Sacred (uppercase tracking). */
const SectionHeading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: As = "h2", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(
        "font-cinzel font-semibold uppercase tracking-[0.06em] leading-[1.2]",
        "text-display-lg md:text-display-xl",
        className,
      )}
      {...props}
    />
  ),
);
SectionHeading.displayName = "SectionHeading";

/** Subheading H3 — Cormorant Bold Italic. */
const Subheading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: As = "h3", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(
        "font-cormorant font-bold italic leading-[1.3]",
        "text-display-md md:text-display-lg",
        className,
      )}
      {...props}
    />
  ),
);
Subheading.displayName = "Subheading";

/** Small heading H4 — Cormorant Semibold. */
const HeadingSmall = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: As = "h4", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(
        "font-cormorant font-semibold leading-[1.35]",
        "text-display-sm md:text-display-md",
        className,
      )}
      {...props}
    />
  ),
);
HeadingSmall.displayName = "HeadingSmall";

// ============================================================================
// Body / Labels / Quotes
// ============================================================================

interface SpanProps extends React.ComponentProps<"span"> {
  as?: "span" | "p" | "div";
}

/** Body text — Raleway Regular 16px (iOS-safe). */
const Body = React.forwardRef<HTMLParagraphElement, SpanProps>(
  ({ className, as: As = "p", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn("font-raleway text-base leading-[1.5]", className)}
      {...props}
    />
  ),
);
Body.displayName = "Body";

/** Caption — Raleway Medium 14px. */
const Caption = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "font-raleway text-sm font-medium leading-[1.5]",
        className,
      )}
      {...props}
    />
  ),
);
Caption.displayName = "Caption";

/** Quote — Cormorant Italic 18px (line-height 1.6). */
const Quote = React.forwardRef<HTMLQuoteElement, React.ComponentProps<"blockquote">>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn(
        "font-cormorant italic font-medium leading-[1.6] text-lg",
        "border-l-[3px] border-[var(--color-sacred-gold-400,#d4af37)]",
        "pl-4 ml-0",
        className,
      )}
      {...props}
    />
  ),
);
Quote.displayName = "Quote";

/** Mystical display quote — Cormorant Bold Italic, hero quote. */
const MysticalQuote = React.forwardRef<HTMLQuoteElement, React.ComponentProps<"blockquote">>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn(
        "font-cormorant italic font-bold leading-[1.3] text-2xl md:text-3xl",
        // Wave 28 W28.5 — fixed: `text-mystical-display` is not a generated
        // utility; replaced with cosmic-400 (deep violet) for the mystical
        // hero-quote feeling without inventing a missing @theme token.
        "text-cosmic-400 dark:text-cosmic-300",
        className,
      )}
      {...props}
    />
  ),
);
MysticalQuote.displayName = "MysticalQuote";

/** Tech label — Raleway uppercase tracking (tabs, navigation). */
const TechLabel = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "font-raleway text-xs font-medium uppercase tracking-[0.12em] leading-[1.4]",
        className,
      )}
      {...props}
    />
  ),
);
TechLabel.displayName = "TechLabel";

/** Sacred label — Cinzel uppercase tracking (headings, sacred buttons). */
const SacredLabel = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "font-cinzel text-sm font-semibold uppercase tracking-[0.08em] leading-[1.4]",
        className,
      )}
      {...props}
    />
  ),
);
SacredLabel.displayName = "SacredLabel";

/** Manuscript — IM Fell English (display decorativo). */
const Manuscript = React.forwardRef<HTMLParagraphElement, SpanProps>(
  ({ className, as: As = "p", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={cn(
        "font-imfell text-base leading-[1.35] tracking-[0.01em]",
        className,
      )}
      {...props}
    />
  ),
);
Manuscript.displayName = "Manuscript";

/** Sanskrit — Noto Devanagari (mantras, sutras). */
const Sanskrit = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        // Wave 28 W28.5 — fixed: token is --font-devanagari (Noto_Sans_Devanagari),
        // utility is `font-devanagari`, not `font-sanskrit`.
        "font-devanagari text-base font-medium leading-[1.5]",
        className,
      )}
      {...props}
    />
  ),
);
Sanskrit.displayName = "Sanskrit";

// ============================================================================
// Gradient Text Variants
// ============================================================================

/** Cosmic gradient text — purple → cyan.
 *  Wave 28 W28.5 — fixed: `text-cosmic` is not a generated utility
 *  (only `text-cosmic-{50..950}` exist). Using `text-cosmic-500` for
 *  base text + `bg-gradient-to-r` + `bg-clip-text` for the gradient
 *  variant when callers want the iridescent look.
 */
const CosmicText = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn("text-cosmic-500 dark:text-cosmic-300 font-bold", className)}
      {...props}
    />
  ),
);
CosmicText.displayName = "CosmicText";

/** Aurora gradient text — emerald → cyan → violet.
 *  Wave 28 W28.5 — `text-aurora` does not exist (aurora is a gradient,
 *  not a single color). Use Tailwind v4 `bg-clip-text` pattern with the
 *  Wave 28 `--gradient-aurora` CSS var for true iridescent aurora text.
 */
const AuroraText = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "bg-[var(--gradient-aurora)] bg-clip-text text-transparent font-bold",
        className,
      )}
      {...props}
    />
  ),
);
AuroraText.displayName = "AuroraText";

/** Divine gradient text — ouro envelhecido (sagrado gold 600).
 *  Wave 28 W28.5 — `text-divine` does not exist; `sacred-gold-600` is the
 *  Wave 28 token that carries the "aged temple gold" semantic that the
 *  divine metaphor was reaching for.
 */
const DivineText = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, as: As = "span", ...props }, ref) => (
    <As
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        "text-sacred-gold-600 dark:text-sacred-gold-400 font-bold",
        className,
      )}
      {...props}
    />
  ),
);
DivineText.displayName = "DivineText";

export {
  DisplayHero,
  SectionHeading,
  Subheading,
  HeadingSmall,
  Body,
  Caption,
  Quote,
  MysticalQuote,
  TechLabel,
  SacredLabel,
  Manuscript,
  Sanskrit,
  CosmicText,
  AuroraText,
  DivineText,
};