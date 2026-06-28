"use client";

// ============================================================================
// Skeleton — Placeholder animado para estados de loading
// ============================================================================
// Respeita prefers-reduced-motion (sem animação). Suporta shimmer customizado,
// múltiplos variants e composição.
// ============================================================================

import { cn } from '@/lib/utils';

type SkeletonVariant =
  | "text"
  | "text-sm"
  | "text-lg"
  | "avatar-sm"
  | "avatar-md"
  | "avatar-lg"
  | "card"
  | "chart"
  | "button"
  | "thumbnail"
  | "circle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  /** Largura custom (Tailwind class ex: 'w-32'). Default = full */
  width?: string;
  /** Altura custom (Tailwind class ex: 'h-4'). Sobrescreve variant default */
  height?: string;
  /** Se true, usa shimmer em vez de pulse (mais "vivo") */
  shimmer?: boolean;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text: "h-4 w-full",
  "text-sm": "h-3 w-3/4",
  "text-lg": "h-5 w-full",
  "avatar-sm": "h-8 w-8 rounded-full",
  "avatar-md": "h-11 w-11 rounded-full",
  "avatar-lg": "h-16 w-16 rounded-full",
  card: "h-48 w-full rounded-xl",
  chart: "h-64 w-full rounded-lg",
  button: "h-11 w-24 rounded-lg",
  thumbnail: "h-20 w-20 rounded-lg",
  circle: "h-4 w-4 rounded-full",
};

export function Skeleton({
  variant = "text",
  className,
  width,
  height,
  shimmer = false,
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      aria-live="polite"
      className={cn(
        // Base: bg-muted (lê do tema light/dark via CSS variables)
        "bg-muted/60",
        // Animation: pulse default, shimmer opt-in
        shimmer
          ? "animate-shimmer bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%]"
          : "animate-pulse",
        // Shape
        "rounded",
        // Variant classes
        VARIANT_CLASSES[variant],
        // Custom overrides
        width,
        height,
        className,
      )}
    />
  );
}

// ============================================================================
// SkeletonText — Múltiplas linhas com largura variável
// ============================================================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Última linha tem largura menor pra parecer parágrafo */
  truncateLast?: boolean;
}

export function SkeletonText({
  lines = 3,
  className,
  truncateLast = true,
}: SkeletonTextProps) {
  return (
    <div
      className={cn("space-y-2", className)}
      role="status"
      aria-label="Carregando texto"
    >
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1;
        const widthClass =
          truncateLast && isLast ? "w-2/3" : i === 0 ? "w-full" : "w-5/6";
        return (
          <Skeleton
            key={i}
            variant="text"
            className={widthClass}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// SkeletonCard — Padrão completo de card de feed
// ============================================================================

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando conteúdo"
      className={cn(
        "rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 space-y-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton variant="avatar-md" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-32" />
          <Skeleton variant="text-sm" className="w-20" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

// ============================================================================
// SkeletonList — Lista de SkeletonCards
// ============================================================================

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function SkeletonList({
  count = 3,
  className,
  itemClassName,
}: SkeletonListProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando lista"
      className={cn("space-y-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={itemClassName} />
      ))}
    </div>
  );
}

// ============================================================================
// SkeletonGrid — Grid de itens (cards pequenos — biblioteca, grupos)
// ============================================================================

interface SkeletonGridProps {
  count?: number;
  className?: string;
  /** Colunas em Tailwind (ex: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'). Default 1 mobile / 2 tablet / 3 desktop */
  colsClass?: string;
}

export function SkeletonGrid({
  count = 6,
  className,
  colsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: SkeletonGridProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando grade"
      className={cn("grid gap-4", colsClass, className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 space-y-3"
        >
          <Skeleton variant="thumbnail" />
          <Skeleton variant="text-lg" />
          <Skeleton variant="text-sm" className="w-4/5" />
        </div>
      ))}
    </div>
  );
}