import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

/**
 * <SriYantra> — Sri Yantra (Shri Yantra / Srivatsa)
 *
 * Yantra = diagrama geométrico sagrado usado como foco de meditação.
 * O Sri Yantra é composto por 4 triângulos "shiva" (apontando para
 * baixo, ♁) e 5 triângulos "shakti" (apontando para cima, ♀),
 * entrelaçados para formar 43 triângulos secundários.
 *
 * Filosofia tântrica:
 * - Triângulos shiva = consciência masculina, estática, princípio
 * - Triângulos shakti = energia feminina, dinâmica, manifestação
 * - Centro (bindu) = o ponto de não-dualidade onde ambos se fundem
 *
 * Origem: tradição hindu/tântrica (India, ~3000+ anos). É o
 * yantra mais estudado do Tantra Shastra.
 *
 * @see https://en.wikipedia.org/wiki/Sri_Yantra
 *
 * @example
 *   <SriYantra variant="static" colorToken="sacred-gold" />
 */

export interface SriYantraProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: GeometryVariant;
  colorToken?: GeometryColor;
  strokeWidth?: number;
  ariaHidden?: boolean;
  /** Show outer square (bhupura) — traditional frame. */
  showFrame?: boolean;
  duration?: number;
}

/**
 * Gera os 9 triângulos do Sri Yantra.
 * 4 downwards (shiva), 5 upwards (shakti), com centros e raios
 * baseados na proporção áurea (≈1.618).
 */
function sriYantraTriangles(
  cx: number,
  cy: number,
  R: number,
): Array<{ points: string; type: "shiva" | "shakti" }> {
  const triangles: Array<{ points: string; type: "shiva" | "shakti" }> = [];
  // O Sri Yantra tradicional tem simetria rotacional — vamos simplificar
  // para uma versão canônica com proporções harmônicas.

  const ratios = [
    // Shiva — downwards (apex pointed down)
    { r: R * 0.95, ty: "shiva" },
    { r: R * 0.75, ty: "shiva" },
    { r: R * 0.55, ty: "shiva" },
    { r: R * 0.35, ty: "shiva" },
    // Shakti — upwards (apex pointed up)
    { r: R, ty: "shakti" },
    { r: R * 0.82, ty: "shakti" },
    { r: R * 0.65, ty: "shakti" },
    { r: R * 0.48, ty: "shakti" },
    { r: R * 0.32, ty: "shakti" },
  ];

  for (const t of ratios) {
    if (t.ty === "shiva") {
      // Apex down: top vertices, bottom vertex
      triangles.push({
        points: `${cx - t.r},${cy - t.r * 0.5} ${cx + t.r},${cy - t.r * 0.5} ${cx},${cy + t.r * 0.866}`,
        type: "shiva",
      });
    } else {
      // Apex up: bottom vertices, top vertex
      triangles.push({
        points: `${cx - t.r},${cy + t.r * 0.5} ${cx + t.r},${cy + t.r * 0.5} ${cx},${cy - t.r * 0.866}`,
        type: "shakti",
      });
    }
  }
  return triangles;
}

export function SriYantra({
  variant = "static",
  colorToken = "sacred-gold",
  strokeWidth = 0.4,
  ariaHidden = true,
  showFrame = true,
  duration = 120,
  className,
  ...rest
}: SriYantraProps) {
  const colors = COLOR_CLASSES[colorToken];
  const cx = 50;
  const cy = 50;
  const R = 28;
  const triangles = React.useMemo(() => sriYantraTriangles(cx, cy, R), [R]);

  const animClass = variant === "animated" ? "animate-sacred-rotate-reverse" : "";

  return (
    <div
      data-slot="sri-yantra"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Sri Yantra — yantra tântrico de 9 triângulos entrelaçados"}
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
        {/* Outer frame — bhupura (Earth Mother) */}
        {showFrame && (
          <rect
            x="6"
            y="6"
            width="88"
            height="88"
            className={cn(colors.stroke, "fill-none")}
            strokeWidth={strokeWidth * 0.8}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {/* 9 interlocking triangles */}
        <g className={cn(colors.stroke, "fill-none")} strokeWidth={strokeWidth} opacity={0.85}>
          {triangles.map((t, i) => (
            <polygon
              key={`t${i}`}
              points={t.points}
              vectorEffect="non-scaling-stroke"
              strokeDasharray={t.type === "shiva" ? "none" : `${strokeWidth * 4} ${strokeWidth * 2}`}
            />
          ))}
        </g>
        {/* Bindu — central point (non-duality) */}
        <circle
          cx={cx}
          cy={cy}
          r={1.5}
          className={cn(colors.stroke, colors.fill)}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default SriYantra;
