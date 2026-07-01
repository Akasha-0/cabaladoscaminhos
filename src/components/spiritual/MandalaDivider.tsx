import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

/**
 * <MandalaDivider> — Divisor horizontal com motivo geométrico sagrado.
 *
 * Substitui `<hr />` em lugares onde a quebra visual também serve
 * como micro-inflection estético. O motivo central é uma mandala
 * minimal (círculo + 6 pontos cardeais) flanqueada por linhas finas.
 *
 * @example
 *   <MandalaDivider colorToken="sacred-gold" size="md" />
 *   <MandalaDivider label="Seção 2" />  // com label centralizado
 */

export type MandalaDividerSize = "sm" | "md" | "lg" | "xl";

export interface MandalaDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  colorToken?: GeometryColor;
  /** Visual size — affects mandala diameter and stroke weight. */
  size?: MandalaDividerSize;
  /** Show the animated rotation (prefers-reduced-motion still respected). */
  variant?: GeometryVariant;
  /** Optional label rendered inside the mandala (defaults to no text). */
  label?: string;
  /** Orientation — horizontal (default) or vertical. */
  orientation?: "horizontal" | "vertical";
  /** Aria label override. */
  ariaLabel?: string;
}

const SIZE_MAP: Record<
  MandalaDividerSize,
  { mandalaSize: string; strokeWidth: number; lineClass: string; textClass: string }
> = {
  sm: { mandalaSize: "h-6 w-6", strokeWidth: 1, lineClass: "h-px", textClass: "text-xs" },
  md: { mandalaSize: "h-8 w-8", strokeWidth: 1.2, lineClass: "h-px", textClass: "text-sm" },
  lg: { mandalaSize: "h-12 w-12", strokeWidth: 1.4, lineClass: "h-[1.5px]", textClass: "text-base" },
  xl: { mandalaSize: "h-16 w-16", strokeWidth: 1.6, lineClass: "h-[2px]", textClass: "text-lg" },
};

/**
 * Mandala minimal: 2 círculos concêntricos + 6 raios = rosa-dos-ventos
 * estilizada. SVG de 24x24 com viewBox 0 0 24 24.
 */
function MandalaGlyph({
  colors,
  strokeWidth,
}: { colors: { stroke: string }; strokeWidth: number }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <g className={colors.stroke} fill="none" strokeWidth={strokeWidth * 0.5} vectorEffect="non-scaling-stroke">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
      </g>
      <g
        className={colors.stroke}
        fill="none"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 12 + 10 * Math.cos(rad);
          const y = 12 + 10 * Math.sin(rad);
          return (
            <line
              key={angle}
              x1={12 + 3 * Math.cos(rad)}
              y1={12 + 3 * Math.sin(rad)}
              x2={x}
              y2={y}
            />
          );
        })}
      </g>
      <circle cx="12" cy="12" r="1.5" className={colors.stroke} fill="currentColor" />
    </svg>
  );
}

export function MandalaDivider({
  colorToken = "sacred-gold",
  size = "md",
  variant = "static",
  label,
  orientation = "horizontal",
  ariaLabel = "Divisor decorativo com motivo de mandala",
  className,
  ...rest
}: MandalaDividerProps) {
  const colors = COLOR_CLASSES[colorToken];
  const dims = SIZE_MAP[size];
  const animClass = variant === "animated" ? "animate-sacred-rotate" : "";

  const wrapperClass = cn(
    "flex items-center justify-center gap-3 text-muted-foreground/60",
    orientation === "horizontal" ? "w-full" : "h-full flex-col",
    className,
  );

  const lineClass = cn(
    orientation === "horizontal" ? "flex-1" : "w-px h-full",
    colors.stroke,
    dims.lineClass,
    "bg-current opacity-50",
  );

  const mandalaClass = cn(dims.mandalaSize, "shrink-0", animClass);

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      className={wrapperClass}
      data-slot="mandala-divider"
      data-color={colorToken}
      data-size={size}
      {...rest}
    >
      {orientation === "horizontal" ? (
        <>
          <span className={lineClass} />
          <span className={cn(mandalaClass, "inline-flex items-center justify-center")}>
            <MandalaGlyph colors={colors} strokeWidth={dims.strokeWidth} />
          </span>
          {label && (
            <span
              className={cn(
                "px-2 font-medium uppercase tracking-widest",
                dims.textClass,
                colors.stroke.replace("stroke-", "text-"),
              )}
            >
              {label}
            </span>
          )}
          {label && <span className={lineClass} />}
          {!label && <span className={lineClass} />}
        </>
      ) : (
        <>
          <span className={cn(lineClass, "block")} />
          <span className={cn(mandalaClass, "inline-flex items-center justify-center")}>
            <MandalaGlyph colors={colors} strokeWidth={dims.strokeWidth} />
          </span>
          <span className={cn(lineClass, "block")} />
        </>
      )}
    </div>
  );
}

export default MandalaDivider;
