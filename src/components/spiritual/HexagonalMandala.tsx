import * as React from "react";
import { cn } from "@/lib/utils";
import type { GeometryVariant, GeometryColor } from "./SacredGeometryFlower";
import { COLOR_CLASSES } from "./SacredGeometryFlower";

/**
 * <HexagonalMandala> — Mandala Hexagonal (Anel Hexagonal)
 *
 * Padrão derivado da Flor da Vida quando estendido para um anel
 * mais amplo: 19 hexágonos formando uma malha de favo de mel
 * centrada no bindu. Cada hexágono é o "espelho hexagonal" da
 * criação — a base geométrica de muitas mandalas orientais e
 * do símbolo da Estrela de Davi / Selo de Salomão.
 *
 * Aparece em:
 * - Padrões islâmicos / arabescos geométricos
 * - Mandalas budistas de diferentes linhagens
 * - Selo de Salomão (estrela de 6 pontas = dois triângulos)
 * - Padmasambhava / mandalas tântricas
 *
 * @see https://en.wikipedia.org/wiki/Hexagonal_tiling
 *
 * @example
 *   <HexagonalMandala variant="static" colorToken="ethereal-cyan" />
 *   <HexagonalMandala variant="animated" colorToken="cosmic" />
 */

export interface HexagonalMandalaProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: GeometryVariant;
  colorToken?: GeometryColor;
  strokeWidth?: number;
  ariaHidden?: boolean;
  /** Number of rings of hexagons around the center (1–3, default 2). */
  rings?: 1 | 2 | 3;
  /** Show the central hexagon emphasized. */
  showCenter?: boolean;
  duration?: number;
}

/**
 * Hexágono regular com centro (cx, cy) e raio circunscrito r.
 * Ponta para cima (flat-top layout).
 */
function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(3)},${(cy + r * Math.sin(angle)).toFixed(3)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

/**
 * Gera os centros de um favo de mel concêntrico.
 * Anel 0 = 1 hexágono central.
 * Anel n = 6n hexágonos.
 */
function hexMandalaCenters(rings: number): Array<{ x: number; y: number; ring: number }> {
  const centers: Array<{ x: number; y: number; ring: number }> = [
    { x: 50, y: 50, ring: 0 },
  ];
  const r = 8; // raio do hexágono
  const w = r * Math.sqrt(3); // distância horizontal entre hexágonos vizinhos
  const h = r * 1.5; // distância vertical entre linhas

  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < 6 * ring; i++) {
      const angle = (i * Math.PI) / (3 * ring) - Math.PI / 2;
      const dist = ring * (w / 2);
      const x = 50 + dist * Math.cos(angle);
      const y = 50 + dist * Math.sin(angle);
      // Snap to hex grid for cleaner geometry
      centers.push({ x, y, ring });
    }
    // Suppress unused vars
    void w;
    void h;
  }
  return centers;
}

export function HexagonalMandala({
  variant = "static",
  colorToken = "ethereal-cyan",
  strokeWidth = 0.4,
  ariaHidden = true,
  rings = 2,
  showCenter = true,
  duration = 90,
  className,
  ...rest
}: HexagonalMandalaProps) {
  const colors = COLOR_CLASSES[colorToken];
  const hexR = 8;
  const centers = React.useMemo(() => hexMandalaCenters(rings), [rings]);

  const animClass = variant === "animated" ? "animate-sacred-rotate" : "";

  return (
    <div
      data-slot="hexagonal-mandala"
      data-variant={variant}
      data-color={colorToken}
      className={cn("relative pointer-events-none select-none", className)}
      role={ariaHidden ? "presentation" : "img"}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : "Mandala hexagonal — geometria sagrada universal"}
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
        {/* All hexagons */}
        <g className={cn(colors.stroke, "fill-none")} strokeWidth={strokeWidth}>
          {centers.map((c, i) => (
            <path
              key={`h${i}`}
              d={hexPath(c.x, c.y, hexR)}
              vectorEffect="non-scaling-stroke"
              opacity={c.ring === 0 && !showCenter ? 0.3 : 1}
            />
          ))}
        </g>
        {/* Central bindu — six-pointed star (Solomon's seal) */}
        <g
          className={cn(colors.stroke, "fill-none")}
          strokeWidth={strokeWidth * 1.2}
          opacity={0.7}
        >
          {/* Up triangle */}
          <polygon
            points={`${cx(50, hexR * 0.9, 0)},${cy(50, hexR * 0.9, 0)} ${cx(50, hexR * 0.9, 4)},${cy(50, hexR * 0.9, 4)} ${cx(50, hexR * 0.9, 2)},${cy(50, hexR * 0.9, 2)}`}
            vectorEffect="non-scaling-stroke"
          />
        </g>
        {/* Center dot */}
        <circle
          cx={50}
          cy={50}
          r={1}
          className={cn(showCenter ? colors.fill : "", colors.stroke)}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// Helper closure: nth hex vertex (0..5) of a flat-top hex centered at (cx0, cy0) with radius r
function cx(cx0: number, r: number, vertex: number): string {
  const angle = (Math.PI / 3) * vertex - Math.PI / 2;
  return (cx0 + r * Math.cos(angle)).toFixed(3);
}
function cy(cy0: number, r: number, vertex: number): string {
  const angle = (Math.PI / 3) * vertex - Math.PI / 2;
  return (cy0 + r * Math.sin(angle)).toFixed(3);
}

export default HexagonalMandala;
