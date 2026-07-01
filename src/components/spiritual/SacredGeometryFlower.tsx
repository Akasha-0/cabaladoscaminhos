import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * <SacredGeometryFlower> — Flower of Life (Flor da Vida)
 *
 * Padrão universal: 7 círculos sobrepostos representando a criação,
 * a conexão entre todas as formas de vida e a geometria fundamental
 * do universo. Encontrado em templos de Osirís (Egito), no Palácio
 * de Maria (Israel), nos escritos de Leonardo da Vinci e em diversas
 * tradições ancestrais ao redor do mundo.
 *
 * Matemática: 6 círculos ao redor de 1 central, cada um com raio = R,
 * onde R é o raio do círculo central. Todos os centros caem na
 * circunferência do círculo central.
 *
 * @see https://en.wikipedia.org/wiki/Overlapping_circles_grid
 *
 * Visual:
 * - static: decorativo, sem movimento
 * - animated: rotação lenta (60s) respeitando prefers-reduced-motion
 * - gradient: overlay de gradiente (radial ou fade)
 *
 * Acessibilidade:
 * - role="presentation" + aria-hidden quando purely decorativo
 * - Visíveis quando focáveis (sempre pointer-events-none)
 *
 * @example
 *   <SacredGeometryFlower
 *     className="absolute inset-0 opacity-5"
 *     variant="static"
 *     colorToken="cosmic"
 *   />
 */

export type GeometryVariant = "static" | "animated" | "gradient";
export type GeometryColor = "cosmic" | "sacred-gold" | "ethereal-cyan";

const COLOR_CLASSES: Record<GeometryColor, { stroke: string; fill: string; gradient: string }> = {
  cosmic: {
    stroke: "stroke-cosmic-400 dark:stroke-cosmic-300",
    fill: "fill-cosmic-500/10 dark:fill-cosmic-400/10",
    gradient: "from-cosmic-500/20 via-cosmic-400/10 to-transparent",
  },
  "sacred-gold": {
    stroke: "stroke-sacred-gold-400 dark:stroke-sacred-gold-300",
    fill: "fill-sacred-gold-500/10 dark:fill-sacred-gold-400/10",
    gradient: "from-sacred-gold-500/20 via-sacred-gold-400/10 to-transparent",
  },
  "ethereal-cyan": {
    stroke: "stroke-ethereal-cyan-400 dark:stroke-ethereal-cyan-300",
    fill: "fill-ethereal-cyan-500/10 dark:fill-ethereal-cyan-400/10",
    gradient: "from-ethereal-cyan-500/20 via-ethereal-cyan-400/10 to-transparent",
  },
};

export interface SacredGeometryFlowerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Visual treatment */
  variant?: GeometryVariant;
  /** Color token (matches globals.css @theme) */
  colorToken?: GeometryColor;
  /** Stroke width relative to viewBox (default 0.5) */
  strokeWidth?: number;
  /** Decorative only — defaults to true. Set false if content-bearing. */
  ariaHidden?: boolean;
  /** Use solid fill instead of outline. */
  filled?: boolean;
  /** Animation duration in seconds (default 60s for "slow cosmic" feel). */
  duration?: number;
}

/**
 * Calcula os 6 centros externos para a Flor da Vida.
 * Cada centro fica na circunferência do círculo central.
 */
function flowerOfLifeCenters(cx: number, cy: number, r: number): Array<[number, number]> {
  const centers: Array<[number, number]> = [[cx, cy]];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    centers.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return centers;
}

export function SacredGeometryFlower({
  variant = "static",
  colorToken = "sacred-gold",
  strokeWidth = 0.5,
  ariaHidden = true,
  filled = false,
  duration = 60,
  className,
  ...rest
}: SacredGeometryFlowerProps) {
  const colors = COLOR_CLASSES[colorToken];
  const cx = 50;
  const cy = 50;
  const r = 16; // 7 circles within viewBox 100x100
  const centers = React.useMemo(() => flowerOfLifeCenters(cx, cy, r), [r]);

  const animClass = variant === "animated" ? "animate-sacred-rotate" : "";
  const gradientOverlay =
    variant === "gradient" ? (
      // Wave 28 W28.5 — fixed: `bg-gradient-radial` is not a Tailwind v4
      // utility. Inline radial gradient using the same color tokens as
      // the stroke so the overlay stays semantically consistent.
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            colorToken === "cosmic"
              ? "radial-gradient(circle at center, oklch(0.65 0.23 280 / 0.20) 0%, oklch(0.65 0.22 285 / 0.10) 40%, transparent 70%)"
              : colorToken === "sacred-gold"
                ? "radial-gradient(circle at center, oklch(0.68 0.15 70 / 0.20) 0%, oklch(0.68 0.15 75 / 0.10) 40%, transparent 70%)"
                : "radial-gradient(circle at center, oklch(0.65 0.17 200 / 0.20) 0%, oklch(0.65 0.17 200 / 0.10) 40%, transparent 70%)",
        }}
      />
    ) : null;

  return (
    <div
      data-slot="sacred-geometry-flower"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Padrão Flor da Vida — geometria sagrada universal"}
      {...rest}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", animClass)}
        style={
          variant === "animated"
            ? ({ ["--sacred-duration" as string]: `${duration}s` } as React.CSSProperties)
            : undefined
        }
        preserveAspectRatio="xMidYMid meet"
      >
        {centers.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            className={cn(
              colors.stroke,
              filled ? colors.fill : "fill-none",
            )}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Center dot — bindu, the seed point */}
        <circle
          cx={cx}
          cy={cy}
          r={1}
          className={cn(colors.fill, colors.stroke)}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {gradientOverlay}
    </div>
  );
}

export default SacredGeometryFlower;
