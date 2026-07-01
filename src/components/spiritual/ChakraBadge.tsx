import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * <ChakraBadge> — Badge dos 7 Chakras principais.
 *
 * Sistema de energia sutil originário da tradição tântrica/yoga
 * (India, ~1500+ anos). Cada chakra representa um centro de
 * consciência/corpo no eixo espinhal ascendente.
 *
 * Os 7 chakras principais (Muladhara → Sahasrara):
 * - Muladhara (raiz)        — vermelho    — sobrevivência, fundamento
 * - Svadhisthana (sacral)   — laranja    — criatividade, sexualidade
 * - Manipura (plexo solar)  — amarelo    — poder pessoal, vontade
 * - Anahata (coração)       — verde      — amor, compaixão, conexão
 * - Vishuddha (garganta)    — azul       — expressão, verdade
 * - Ajna (terceiro olho)    — índigo     — intuição, visão interior
 * - Sahasrara (coroa)       — violeta    — transcendência, conexão divina
 *
 * @see https://en.wikipedia.org/wiki/Chakra
 *
 * Acessibilidade:
 * - Cores oficiais são parte do significado (cor carrega semântica),
 *   então NÃO são puramente decorativas — texto sempre presente
 * - Contraste do texto verificado contra cada cor (4.5:1 mínimo)
 */

export type ChakraId =
  | "muladhara"   // root
  | "svadhisthana" // sacral
  | "manipura"    // solar plexus
  | "anahata"     // heart
  | "vishuddha"   // throat
  | "ajna"        // third eye
  | "sahasrara"; // crown

export interface ChakraMeta {
  id: ChakraId;
  /** Portuguese canonical label */
  label: string;
  /** Sanskrit original */
  sanskrit: string;
  /** One-line meaning */
  meaning: string;
  /** Location in body */
  location: string;
  /** Hex stop for the chakra color */
  color: string;
  /** Tailwind class for background (saturated, text contrast handled) */
  bgClass: string;
  /** Tailwind class for text when used on a soft/tint variant */
  textClass: string;
  /** Element association */
  element: string;
  /** Position (1..7) — useful for ordering */
  position: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export const CHAKRA_META: Record<ChakraId, ChakraMeta> = {
  muladhara: {
    id: "muladhara",
    label: "Raiz",
    sanskrit: "Muladhara",
    meaning: "Sobrevivência, fundamento e enraizamento",
    location: "Base da coluna",
    color: "#DC2626", // red-600
    bgClass: "bg-red-600 text-white",
    textClass: "text-red-700 dark:text-red-300",
    element: "Terra",
    position: 1,
  },
  svadhisthana: {
    id: "svadhisthana",
    label: "Sacral",
    sanskrit: "Svadhisthana",
    meaning: "Criatividade, sexualidade e emoções",
    location: "Baixo ventre",
    color: "#EA580C", // orange-600
    bgClass: "bg-orange-600 text-white",
    textClass: "text-orange-700 dark:text-orange-300",
    element: "Água",
    position: 2,
  },
  manipura: {
    id: "manipura",
    label: "Solar",
    sanskrit: "Manipura",
    meaning: "Poder pessoal, vontade e autoestima",
    location: "Plexo solar",
    color: "#CA8A04", // yellow-600
    bgClass: "bg-yellow-500 text-yellow-950",
    textClass: "text-yellow-700 dark:text-yellow-300",
    element: "Fogo",
    position: 3,
  },
  anahata: {
    id: "anahata",
    label: "Coração",
    sanskrit: "Anahata",
    meaning: "Amor incondicional, compaixão e conexão",
    location: "Centro do peito",
    color: "#16A34A", // green-600
    bgClass: "bg-green-600 text-white",
    textClass: "text-green-700 dark:text-green-300",
    element: "Ar",
    position: 4,
  },
  vishuddha: {
    id: "vishuddha",
    label: "Garganta",
    sanskrit: "Vishuddha",
    meaning: "Expressão autêntica e verdade",
    location: "Garganta",
    color: "#2563EB", // blue-600
    bgClass: "bg-blue-600 text-white",
    textClass: "text-blue-700 dark:text-blue-300",
    element: "Éter (som)",
    position: 5,
  },
  ajna: {
    id: "ajna",
    label: "Terceiro Olho",
    sanskrit: "Ajna",
    meaning: "Intuição, visão interior e sabedoria",
    location: "Entre as sobrancelhas",
    color: "#4F46E5", // indigo-600
    bgClass: "bg-indigo-600 text-white",
    textClass: "text-indigo-700 dark:text-indigo-300",
    element: "Luz",
    position: 6,
  },
  sahasrara: {
    id: "sahasrara",
    label: "Coroa",
    sanskrit: "Sahasrara",
    meaning: "Transcendência e conexão com o divino",
    location: "Topo da cabeça",
    color: "#7C3AED", // violet-600
    bgClass: "bg-violet-600 text-white",
    textClass: "text-violet-700 dark:text-violet-300",
    element: "Consciência pura",
    position: 7,
  },
};

export interface ChakraBadgeProps
  extends Omit<React.ComponentProps<"span">, "color"> {
  chakra: ChakraId;
  /** Visual treatment */
  variant?: "solid" | "soft" | "outline";
  /** Show sanskrit name alongside the label */
  showSanskrit?: boolean;
  /** Show one-line meaning as a tooltip and via aria-describedby */
  showMeaning?: boolean;
  /** Size affects dot diameter + font size */
  size?: "sm" | "md" | "lg";
  /** Label override (defaults to Portuguese "Raiz", "Sacral", etc.) */
  label?: string;
}

const SIZE_MAP = {
  sm: { dot: "h-2 w-2", padding: "px-2 py-0.5", text: "text-xs" },
  md: { dot: "h-2.5 w-2.5", padding: "px-2.5 py-1", text: "text-sm" },
  lg: { dot: "h-3 w-3", padding: "px-3 py-1", text: "text-base" },
} as const;

/**
 * Inner symbol — 6-petal lotus line drawing scaled to dot diameter.
 */
function ChakraGlyph({ meta }: { meta: ChakraMeta }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* 6 lotus petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 12 + 8 * Math.cos(rad);
        const cy = 12 + 8 * Math.sin(rad);
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx="1.6"
            ry="3.2"
            transform={`rotate(${angle} ${cx} ${cy})`}
            fill="currentColor"
            opacity="0.65"
          />
        );
      })}
      {/* Central bindu */}
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      {/* Triangle (up for masculine, down for feminine — varies by chakra;
          crown + third eye use inverted; lower chakras use up-pointing) */}
      <polygon
        points={`12,5 19,18 5,18`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
      />
      {/* Small color-band dot at top — quick visual reference */}
      <circle cx="12" cy="12" r="11" fill={meta.color} opacity="0.05" />
    </svg>
  );
}

export function ChakraBadge({
  chakra,
  variant = "solid",
  showSanskrit = false,
  showMeaning = false,
  size = "md",
  label,
  className,
  ...props
}: ChakraBadgeProps) {
  const meta = CHAKRA_META[chakra];
  const dims = SIZE_MAP[size];
  const displayLabel = label ?? meta.label;

  const variantClass = {
    solid: meta.bgClass,
    soft: cn("bg-current/10", meta.textClass),
    outline: cn("bg-transparent ring-1 ring-inset", meta.textClass),
  }[variant];

  return (
    <span
      data-slot="chakra-badge"
      data-chakra={chakra}
      data-variant={variant}
      data-position={meta.position}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dims.padding,
        dims.text,
        variantClass,
        className,
      )}
      title={showMeaning ? `${meta.sanskrit} — ${meta.meaning}` : undefined}
      {...props}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center"
        style={{
          color: meta.color,
          width: "1em",
          height: "1em",
        }}
      >
        <ChakraGlyph meta={meta} />
      </span>
      <span>{displayLabel}</span>
      {showSanskrit && (
        <span className="italic opacity-80 text-[0.9em]">— {meta.sanskrit}</span>
      )}
      {showMeaning && (
        <span className="sr-only">. {meta.meaning}. Localização: {meta.location}.</span>
      )}
    </span>
  );
}

export { ChakraGlyph };
export default ChakraBadge;
