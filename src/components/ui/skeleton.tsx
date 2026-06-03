"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "card" | "chart";
  className?: string;
}
export function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-pulse bg-muted rounded",
        {
          "h-4 w-full": variant === "text",
          "h-48 w-full rounded-xl": variant === "card",
          "h-64 w-full rounded-lg": variant === "chart",
        },
        className
      )}
    />
  );
}
