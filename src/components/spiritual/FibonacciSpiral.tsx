import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

/**
 * <FibonacciSpiral> — Espiral Áurea (Golden Spiral)
 *
 * Espiral logarítmica baseada na Sequência de Fibonacci.
 * Cada arco é um quarto de círculo inscrito em um quadrado
 * cujo lado corresponde a um número de Fibonacci. A proporção
 * áurea (φ ≈ 1.618) governa a taxa de crescimento.
 *
 * Aparece na natureza: conchas do náutilo, girassóis, galáxias
 * espirais, brócolis romanesco, furacões. É uma das assinaturas
 * da geometria do universo vivo.
 *
 * @see https://en.wikipedia.org/wiki/Golden_spiral
 *
 * @example
 *   <FibonacciSpiral variant="static" colorToken="sacred-gold" />
 *   <FibonacciSpiral variant="animated" colorToken="cosmic" />
 */

export interface FibonacciSpiralProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: GeometryVariant;
  colorToken?: GeometryColor;
  strokeWidth?: number;
  ariaHidden?: boolean;
  /** Number of quarter-arcs to draw (default 6 — converges to golden ratio). */
  segments?: number;
  /** Use the log spiral approximation (more "natural") vs quarter-arc (canonical). */
  organic?: boolean;
  duration?: number;
}

/**
 * Espiral de Fibonacci canônica = 8 quartos de arco inscrito em quadrados.
 * Cada quadrado: lado = numero de Fibonacci.
 * Centros derivam da progressão.
 */
function goldenSpiralArcs(
  cx: number,
  cy: number,
  segments: number,
): Array<{ d: string }> {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const paths: Array<{ d: string }> = [];
  // Approximate total length to fit viewBox
  const baseUnit = 1.5;

  // Direction pattern: NE, SE, SW, NW, NE, SE, ...
  const dirs = [
    { sx: 1, sy: -1, dir: "NE" },
    { sx: 1, sy: 1, dir: "SE" },
    { sx: -1, sy: 1, dir: "SW" },
    { sx: -1, sy: -1, dir: "NW" },
  ];

  let px = cx;
  let py = cy;
  for (let i = 0; i < segments && i < fib.length - 1; i++) {
    const side = fib[i]! * baseUnit;
    const nextFib = fib[i + 1]! * baseUnit;
    const d = dirs[i % 4]!;
    // Begin corner — opposite of direction
    const cornerX = px + d.sx * (nextFib - side) / 2;
    const cornerY = py + d.sy * (nextFib - side) / 2;
    // Arc from current point to the new position
    const startX = cornerX;
    const startY = cornerY;
    const endX = px + d.sx * nextFib / 2;
    const endY = py + d.sy * nextFib / 2;
    // Move to start corner, then arc with radius=side to end position
    const radius = side;
    const sweepFlag = i % 2 === 0 ? 1 : 0;
    paths.push({
      d: `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`,
    });

    // Move the "anchor" to the next starting corner for the next arc
    px = endX - d.sx * side;
    py = endY - d.sy * side;
    // Adjust anchor to next start (alternating)
    if (i === 0) {
      px = cx - nextFib / 2;
      py = cy + nextFib / 2;
    }
  }
  return paths;
}

export function FibonacciSpiral({
  variant = "static",
  colorToken = "sacred-gold",
  strokeWidth = 0.5,
  ariaHidden = true,
  segments = 6,
  organic = true,
  duration = 60,
  className,
  ...rest
}: FibonacciSpiralProps) {
  const colors = COLOR_CLASSES[colorToken];
  const cx = 50;
  const cy = 50;
  const arcs = React.useMemo(() => goldenSpiralArcs(cx, cy, segments), [segments]);

  const animClass = variant === "animated" ? (organic ? "animate-sacred-rotate" : "animate-pulse-soft") : "";

  return (
    <div
      data-slot="fibonacci-spiral"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Espiral áurea de Fibonacci — geometria da natureza"}
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
        {/* Underlying rectangles (the Fibonacci grid) — very subtle */}
        {organic && (
          <g className={cn(colors.stroke, "fill-none")} strokeWidth={strokeWidth * 0.3} opacity={0.25}>
            {arcs.map((_, i) => {
              const side = [1, 1, 2, 3, 5, 8, 13][i % 7]! * 1.5;
              return (
                <rect
                  key={`r${i}`}
                  x={cx - side * (1 + i * 0.1)}
                  y={cy - side * (1 + i * 0.1)}
                  width={side * 2 * (1 + i * 0.1)}
                  height={side * 2 * (1 + i * 0.1)}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>
        )}
        {/* The spiral itself */}
        <g className={cn(colors.stroke, "fill-none")} strokeWidth={strokeWidth} strokeLinecap="round">
          {arcs.map((a, i) => (
            <path
              key={`a${i}`}
              d={a.d}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default FibonacciSpiral;
