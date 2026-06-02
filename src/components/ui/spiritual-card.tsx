'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpiritualCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow' | 'golden';
  size?: 'sm' | 'default' | 'lg';
}

const SpiritualCard = React.forwardRef<HTMLDivElement, SpiritualCardProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "relative overflow-hidden transition-all duration-250 ease-out-expo";
    
    const variantStyles = {
      default: "bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card",
      elevated: "bg-gradient-to-br from-card via-slate-800/50 to-card border border-border/30 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow-gold)]",
      glow: "bg-gradient-to-br from-card to-card/80 border border-spiritual-violet/30 shadow-[var(--shadow-glow-violet)]",
      golden: "bg-gradient-to-br from-spiritual-gold-muted to-card border border-spiritual-gold/30 shadow-[var(--shadow-glow-gold)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
    };
    
    const sizeStyles = {
      sm: "p-3 rounded-lg",
      default: "p-5 rounded-xl",
      lg: "p-6 rounded-2xl"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
SpiritualCard.displayName = "SpiritualCard";

const SpiritualCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 pb-3 border-b border-spiritual-gold/10",
      className
    )}
    {...props}
  />
));
SpiritualCardHeader.displayName = "SpiritualCardHeader";

const SpiritualCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xl font-heading font-semibold text-spiritual-gold tracking-wide",
      className
    )}
    style={{ fontFamily: "var(--font-cinzel), serif" }}
    {...props}
  />
));
SpiritualCardTitle.displayName = "SpiritualCardTitle";

const SpiritualCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-4", className)}
    {...props}
  />
));
SpiritualCardContent.displayName = "SpiritualCardContent";

export {
  SpiritualCard,
  SpiritualCardHeader,
  SpiritualCardTitle,
  SpiritualCardContent,
}