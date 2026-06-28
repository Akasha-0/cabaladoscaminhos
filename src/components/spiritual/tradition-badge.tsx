import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Tradições suportadas pela plataforma Akasha Portal.
 * Mapeadas para color tokens específicos em globals.css (@theme).
 *
 * Ramp dedicado (8): cabala, ifa, tantra, reiki, astrologia, meditacao,
 *                    xamanismo, umbanda
 * Ramp compartilhado (8): numerologia→sky, tarot→violet, cristais→sky-cyan,
 *                    runas→neutral, candomble→rose, budismo→amber,
 *                    ayurveda→reiki, wicca→umbanda
 */
export type TraditionId =
  | "cabala"
  | "ifa"
  | "tantra"
  | "reiki"
  | "astrologia"
  | "meditacao"
  | "xamanismo"
  | "umbanda"
  | "numerologia"
  | "tarot"
  | "cristais"
  | "runas"
  | "candomble"
  | "budismo"
  | "ayurveda"
  | "wicca"

const TRADITION_META: Record<
  TraditionId,
  {
    label: string
    /** Tailwind classes for solid bg + readable fg */
    bgClass: string
    /** Tint class for soft/outline variant */
    tintClass: string
    /** Outline text color (resolved per-tradition to keep JIT happy) */
    outlineTextClass: string
    /** Subtle ring color (border) */
    ringClass: string
    /** Optional emoji/icon glyph */
    glyph: string
  }
> = {
  cabala: {
    label: "Cabala",
    bgClass: "bg-cabala-600 text-cabala-50",
    tintClass: "bg-cabala-100 text-cabala-800 dark:bg-cabala-950 dark:text-cabala-100",
    outlineTextClass: "text-cabala-800 dark:text-cabala-100",
    ringClass: "ring-cabala-500/40",
    glyph: "✡",
  },
  ifa: {
    label: "Ifá",
    bgClass: "bg-ifa-600 text-ifa-50",
    tintClass: "bg-ifa-100 text-ifa-800 dark:bg-ifa-950 dark:text-ifa-100",
    outlineTextClass: "text-ifa-800 dark:text-ifa-100",
    ringClass: "ring-ifa-500/40",
    glyph: "⚸",
  },
  tantra: {
    label: "Tantra",
    bgClass: "bg-tantra-600 text-tantra-50",
    tintClass: "bg-tantra-100 text-tantra-800 dark:bg-tantra-950 dark:text-tantra-100",
    outlineTextClass: "text-tantra-800 dark:text-tantra-100",
    ringClass: "ring-tantra-500/40",
    glyph: "◉",
  },
  reiki: {
    label: "Reiki",
    bgClass: "bg-reiki-600 text-reiki-50",
    tintClass: "bg-reiki-100 text-reiki-800 dark:bg-reiki-950 dark:text-reiki-100",
    outlineTextClass: "text-reiki-800 dark:text-reiki-100",
    ringClass: "ring-reiki-500/40",
    glyph: "✋",
  },
  astrologia: {
    label: "Astrologia",
    bgClass: "bg-astrologia-600 text-astrologia-50",
    tintClass: "bg-astrologia-100 text-astrologia-800 dark:bg-astrologia-950 dark:text-astrologia-100",
    outlineTextClass: "text-astrologia-800 dark:text-astrologia-100",
    ringClass: "ring-astrologia-500/40",
    glyph: "✦",
  },
  meditacao: {
    label: "Meditação",
    bgClass: "bg-meditacao-600 text-meditacao-50",
    tintClass: "bg-meditacao-100 text-meditacao-800 dark:bg-meditacao-950 dark:text-meditacao-100",
    outlineTextClass: "text-meditacao-800 dark:text-meditacao-100",
    ringClass: "ring-meditacao-500/40",
    glyph: "🕉",
  },
  xamanismo: {
    label: "Xamanismo",
    bgClass: "bg-xamanismo-600 text-xamanismo-50",
    tintClass: "bg-xamanismo-100 text-xamanismo-800 dark:bg-xamanismo-950 dark:text-xamanismo-100",
    outlineTextClass: "text-xamanismo-800 dark:text-xamanismo-100",
    ringClass: "ring-xamanismo-500/40",
    glyph: "🌿",
  },
  umbanda: {
    label: "Umbanda",
    bgClass: "bg-umbanda-600 text-umbanda-50",
    tintClass: "bg-umbanda-100 text-umbanda-800 dark:bg-umbanda-950 dark:text-umbanda-100",
    outlineTextClass: "text-umbanda-800 dark:text-umbanda-100",
    ringClass: "ring-umbanda-500/40",
    glyph: "✺",
  },
  numerologia: {
    label: "Numerologia",
    bgClass: "bg-sky-600 text-sky-50",
    tintClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-100",
    outlineTextClass: "text-sky-800 dark:text-sky-100",
    ringClass: "ring-sky-500/40",
    glyph: "9",
  },
  tarot: {
    label: "Tarot",
    bgClass: "bg-violet-700 text-violet-50",
    tintClass: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-100",
    outlineTextClass: "text-violet-800 dark:text-violet-100",
    ringClass: "ring-violet-500/40",
    glyph: "♠",
  },
  cristais: {
    label: "Cristais",
    bgClass: "bg-sky-500 text-sky-950",
    tintClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-100",
    outlineTextClass: "text-sky-800 dark:text-sky-100",
    ringClass: "ring-sky-500/40",
    glyph: "◆",
  },
  runas: {
    label: "Runas",
    bgClass: "bg-neutral-700 text-neutral-50",
    tintClass: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
    outlineTextClass: "text-neutral-800 dark:text-neutral-100",
    ringClass: "ring-neutral-500/40",
    glyph: "ᚱ",
  },
  candomble: {
    label: "Candomblé",
    bgClass: "bg-rose-600 text-rose-50",
    tintClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
    outlineTextClass: "text-rose-800 dark:text-rose-100",
    ringClass: "ring-rose-500/40",
    glyph: "⛤",
  },
  budismo: {
    label: "Budismo",
    bgClass: "bg-amber-500 text-amber-950",
    tintClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
    outlineTextClass: "text-amber-800 dark:text-amber-100",
    ringClass: "ring-amber-500/40",
    glyph: "☸",
  },
  ayurveda: {
    label: "Ayurveda",
    bgClass: "bg-reiki-700 text-reiki-50",
    tintClass: "bg-reiki-100 text-reiki-800 dark:bg-reiki-950 dark:text-reiki-100",
    outlineTextClass: "text-reiki-800 dark:text-reiki-100",
    ringClass: "ring-reiki-500/40",
    glyph: "✿",
  },
  wicca: {
    label: "Wicca",
    bgClass: "bg-umbanda-700 text-umbanda-50",
    tintClass: "bg-umbanda-100 text-umbanda-800 dark:bg-umbanda-950 dark:text-umbanda-100",
    outlineTextClass: "text-umbanda-800 dark:text-umbanda-100",
    ringClass: "ring-umbanda-500/40",
    glyph: "☾",
  },
}

export interface TraditionBadgeProps
  extends Omit<React.ComponentProps<"span">, "color"> {
  tradition: TraditionId
  /** Visual treatment */
  variant?: "solid" | "soft" | "outline"
  /** Show the tradition glyph (emoji/sigil) before the label */
  showGlyph?: boolean
  /** Label override (defaults to Portuguese canonical name) */
  label?: string
}

/**
 * <TraditionBadge> — Etiqueta visual de tradição espiritual.
 *
 * Tradições: cabala, ifa, tantra, reiki, astrologia, meditacao, xamanismo,
 * umbanda, numerologia, tarot, cristais, runas, candomble, budismo,
 * ayurveda, wicca (16 total).
 *
 * Visual:
 * - solid: fundo saturado + texto claro (uso primário)
 * - soft: fundo 100/950 + texto 800/100 (cards/listas)
 * - outline: 1px ring + texto (uso decorativo)
 *
 * Acessibilidade:
 * - text contrast >= 4.5:1 em todas combinações (verificado em COLOR-SYSTEM-W17.md)
 * - glyph é decorativo (aria-hidden); texto carrega significado
 * - foco visível herdado de ring (focus-visible)
 *
 * @example
 *   <TraditionBadge tradition="cabala" variant="solid" />
 *   <TraditionBadge tradition="reiki" variant="soft" showGlyph />
 */
export function TraditionBadge({
  tradition,
  variant = "solid",
  showGlyph = false,
  label,
  className,
  ...props
}: TraditionBadgeProps) {
  const meta = TRADITION_META[tradition]
  const displayLabel = label ?? meta.label

  const variantClass = {
    solid: meta.bgClass,
    soft: meta.tintClass,
    outline: cn("bg-transparent ring-1 ring-inset", meta.ringClass, meta.outlineTextClass),
  }[variant]

  return (
    <span
      data-slot="tradition-badge"
      data-tradition={tradition}
      data-variant={variant}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variantClass,
        className,
      )}
      {...props}
    >
      {showGlyph && (
        <span aria-hidden="true" className="text-[0.875em] leading-none">
          {meta.glyph}
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  )
}

export { TRADITION_META }