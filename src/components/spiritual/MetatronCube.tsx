import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

/**
 * <MetatronCube> — Cubo de Metatron
 *
 * Padrão: 13 círculos dispostos em torno do图案 da Flor da Vida,
 * conectados por linhas retas formando os 5 Sólidos Platônicos.
 * Metatron, o anjo da vida na tradição cabalística/angélica, é
 * associado a este padrão que encapsula a estrutura geométrica
 * de toda a matéria (os 5 elementos clássicos).
 *
 * Os 13 círculos = 1 central + 6 da Flor da Vida + 6 externos
 * (formando os vértices do hexágono que contém o cubo).
 *
 * Os 5 Sólidos Platônicos que emergem das conexões:
 * - Tetraedro (fogo) — 4 vértices
 * - Cubo (terra) — 8 vértices
 * - Octaedro (ar) — 6 vértices
 * - Icosaedro (água) — 12 vértices
 * - Dodecaedro (éter/quinto elemento) — 20 vértices
 *
 * @see https://en.wikipedia.org/wiki/Metatron%27s_Cube
 *
 * @example
 *   <MetatronCube variant="animated" colorToken="cosmic" />
 */

export interface MetatronCubeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: GeometryVariant;
  colorToken?: GeometryColor;
  strokeWidth?: number;
  ariaHidden?: boolean;
  /** Show the connecting lines (default true). */
  showLines?: boolean;
  /** Show the central circle emphasized. */
  showCenter?: boolean;
  duration?: number;
}

/**
 * Gera os 13 centros do Cubo de Metatron:
 * - 1 centro
 * - 6 em hexágono interno (raio r1)
 * - 6 em hexágono externo (raio r2)
 */
function metatronCenters(cx: number, cy: number): Array<{ x: number; y: number; ring: number }> {
  const centers: Array<{ x: number; y: number; ring: number }> = [{ x: cx, y: cy, ring: 0 }];
  const r1 = 14;
  const r2 = 28;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    centers.push({ x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle), ring: 1 });
    centers.push({ x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle), ring: 2 });
  }
  return centers;
}

export function MetatronCube({
  variant = "static",
  colorToken = "cosmic",
  strokeWidth = 0.4,
  ariaHidden = true,
  showLines = true,
  showCenter = true,
  duration = 90,
  className,
  ...rest
}: MetatronCubeProps) {
  const colors = COLOR_CLASSES[colorToken];
  const cx = 50;
  const cy = 50;
  const centers = React.useMemo(() => metatronCenters(cx, cy), []);

  const animClass = variant === "animated" ? "animate-sacred-rotate" : "";

  // Linhas conectando cada par (Platonic solids emerge from these lines)
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  if (showLines) {
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const a = centers[i];
        const b = centers[j];
        if (!a || !b) continue;
        // Skip some outer-outer connections to avoid clutter (hex pattern visibility)
        if (a.ring === 2 && b.ring === 2) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 32) continue;
        }
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
  }

  return (
    <div
      data-slot="metatron-cube"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Cubo de Metatron — 13 círculos e 5 sólidos platônicos"}
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
        {/* Connecting lines (Platonic structure) */}
        <g className={colors.stroke} fill="none" strokeWidth={strokeWidth * 0.6} opacity={0.5}>
          {lines.map((l, i) => (
            <line
              key={`l${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        {/* 13 circles */}
        <g>
          {centers.map((c, i) => (
            <circle
              key={`c${i}`}
              cx={c.x}
              cy={c.y}
              r={c.ring === 0 ? 1.5 : c.ring === 1 ? 1.2 : 1}
              className={cn(
                colors.stroke,
                "fill-none",
                showCenter && c.ring === 0 && colors.fill,
              )}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default MetatronCube;
