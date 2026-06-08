"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

// =============================================================================
// Heading Component
// =============================================================================

const headingVariants = cva("font-semibold tracking-tight", {
  variants: {
    variant: {
      display: [
        "font-serif",
        "font-semibold",
        "tracking-wide",
        "text-foreground",
      ],
      mystical: [
        "font-cinzel",
        "font-medium",
        "tracking-[0.15em]",
        "uppercase",
        "text-foreground",
      ],
      section: [
        "font-cinzel",
        "font-normal",
        "tracking-wide",
        "text-foreground",
      ],
      title: [
        "font-sans",
        "font-semibold",
        "tracking-normal",
        "text-foreground",
      ],
      subtitle: [
        "font-sans",
        "font-normal",
        "tracking-normal",
        "text-muted-foreground",
      ],
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    glow: {
      gold: "text-shadow-[0_0_10px_var(--spiritual-gold),0_0_20px_var(--spiritual-gold),0_0_30px_var(--spiritual-gold)]",
      purple: "text-shadow-[0_0_10px_var(--spiritual-violet),0_0_20px_var(--spiritual-violet),0_0_30px_var(--spiritual-violet)]",
      none: "",
    },
  },
  compoundVariants: [
    {
      variant: "display",
      size: "xs",
      className: "text-base font-semibold",
    },
    {
      variant: "display",
      size: "sm",
      className: "text-lg font-semibold",
    },
    {
      variant: "display",
      size: "md",
      className: "text-xl font-semibold",
    },
    {
      variant: "display",
      size: "lg",
      className: "text-2xl font-semibold",
    },
    {
      variant: "display",
      size: "xl",
      className: "text-3xl font-semibold",
    },
    {
      variant: "display",
      size: "2xl",
      className: "text-4xl font-semibold",
    },
    {
      variant: "display",
      size: "3xl",
      className: "text-5xl font-semibold",
    },
    {
      variant: "display",
      size: "4xl",
      className: "text-6xl font-bold",
    },
    {
      variant: "mystical",
      size: "xs",
      className: "text-xs",
    },
    {
      variant: "mystical",
      size: "sm",
      className: "text-sm",
    },
    {
      variant: "mystical",
      size: "md",
      className: "text-base",
    },
    {
      variant: "mystical",
      size: "lg",
      className: "text-lg",
    },
    {
      variant: "mystical",
      size: "xl",
      className: "text-xl",
    },
    {
      variant: "mystical",
      size: "2xl",
      className: "text-2xl",
    },
    {
      variant: "mystical",
      size: "3xl",
      className: "text-3xl",
    },
    {
      variant: "mystical",
      size: "4xl",
      className: "text-4xl",
    },
    {
      variant: "section",
      size: "xs",
      className: "text-xs",
    },
    {
      variant: "section",
      size: "sm",
      className: "text-sm",
    },
    {
      variant: "section",
      size: "md",
      className: "text-base",
    },
    {
      variant: "section",
      size: "lg",
      className: "text-lg",
    },
    {
      variant: "section",
      size: "xl",
      className: "text-xl",
    },
    {
      variant: "section",
      size: "2xl",
      className: "text-2xl",
    },
    {
      variant: "section",
      size: "3xl",
      className: "text-3xl",
    },
    {
      variant: "section",
      size: "4xl",
      className: "text-4xl",
    },
    {
      variant: "title",
      size: "xs",
      className: "text-xs",
    },
    {
      variant: "title",
      size: "sm",
      className: "text-sm",
    },
    {
      variant: "title",
      size: "md",
      className: "text-base",
    },
    {
      variant: "title",
      size: "lg",
      className: "text-lg",
    },
    {
      variant: "title",
      size: "xl",
      className: "text-xl",
    },
    {
      variant: "title",
      size: "2xl",
      className: "text-2xl",
    },
    {
      variant: "title",
      size: "3xl",
      className: "text-3xl",
    },
    {
      variant: "title",
      size: "4xl",
      className: "text-4xl",
    },
    {
      variant: "subtitle",
      size: "xs",
      className: "text-xs",
    },
    {
      variant: "subtitle",
      size: "sm",
      className: "text-sm",
    },
    {
      variant: "subtitle",
      size: "md",
      className: "text-base",
    },
    {
      variant: "subtitle",
      size: "lg",
      className: "text-lg",
    },
    {
      variant: "subtitle",
      size: "xl",
      className: "text-xl",
    },
    {
      variant: "subtitle",
      size: "2xl",
      className: "text-2xl",
    },
    {
      variant: "subtitle",
      size: "3xl",
      className: "text-3xl",
    },
    {
      variant: "subtitle",
      size: "4xl",
      className: "text-4xl",
    },
  ],
  defaultVariants: {
    variant: "title",
    size: "md",
    glow: "none",
  },
});

export interface HeadingProps
  extends VariantProps<typeof headingVariants>,
    Omit<React.HTMLAttributes<HTMLHeadingElement>, "size"> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, size, glow, as, ...props }, ref) => {
    const Component = as ?? "h2";

    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ variant, size, glow }), className)}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";

// =============================================================================
// BodyText Component
// =============================================================================

const bodyTextVariants = cva("leading-relaxed", {
  variants: {
    variant: {
      primary: [
        "font-sans",
        "font-normal",
        "text-foreground",
        "[color:var(--foreground)]",
      ],
      secondary: [
        "font-sans",
        "font-normal",
        "[color:var(--secondary)]",
      ],
      muted: [
        "font-sans",
        "font-normal",
        "text-muted-foreground",
      ],
      mystical: [
        "font-serif",
        "italic",
        "text-foreground",
        "[color:var(--foreground)]",
        "leading-relaxed",
      ],
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface BodyTextProps
  extends VariantProps<typeof bodyTextVariants>,
    React.HTMLAttributes<HTMLParagraphElement> {}

const BodyText = forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(bodyTextVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

BodyText.displayName = "BodyText";

// =============================================================================
// Label Component
// =============================================================================

const labelVariants = cva("", {
  variants: {
    variant: {
      default: [
        "uppercase",
        "tracking-wider",
        "text-xs",
        "font-medium",
        "text-foreground",
      ],
      spiritual: [
        "font-cinzel",
        "uppercase",
        "tracking-[0.2em]",
        "text-[10px]",
        "font-medium",
        "text-foreground",
      ],
      orixa: [
        "pl-3",
        "border-l-2",
        "border-solid",
        "font-sans",
        "text-sm",
        "font-medium",
        "text-foreground",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Orixá day colors for the orixa label variant
 * Maps each Orixá to its traditional day color
 */
const ORIXÁ_COLORS: Record<string, string> = {
  oxum: "#FFD700", // Gold - Thursday
  iemanja: "#87CEEB", // Light Blue - Saturday
  oxossi: "#228B22", // Forest Green - Wednesday
  xango: "#DC143C", // Crimson - Wednesday
  ogum: "#FF4500", // Orange Red - Tuesday
  "logun Ede": "#FFD700", // Gold - Monday
  nanburuzinho: "#228B22", // Green - Monday
  obaluaiê: "#8B4513", // Saddle Brown - Friday
  iansã: "#FF4500", // Orange Red - Wednesday
  cosmico: "#DDA0DD", // Plum - Sunday
  oxala: "#FFFFFF", // White - Friday
  default: "#D4AF37", // Spiritual Gold
};

export interface LabelProps
  extends VariantProps<typeof labelVariants>,
    Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "variant"> {
  orixaName?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, orixaName, style, ...props }, ref) => {
    const isOrixaVariant = variant === "orixa";
    const borderColor = isOrixaVariant
      ? orixaName
        ? ORIXÁ_COLORS[orixaName.toLowerCase()] || ORIXÁ_COLORS.default
        : ORIXÁ_COLORS.default
      : undefined;

    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant }), className)}
        style={
          isOrixaVariant && borderColor
            ? { ...style, borderLeftColor: borderColor }
            : style
        }
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

// =============================================================================
// Exports
// =============================================================================

export { Heading };

export { BodyText };

