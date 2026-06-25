/**
 * sources.ts — fonte da verdade dos "Pillars" + icons + cores (Wave 23.2).
 *
 * 5 Pilares + 'literature' (Wave 21.1). Centralizado aqui para:
 *   - Consistência visual (cor + ícone + label) em qualquer consumer.
 *   - i18n-friendly (label resolvido por `useTranslation` ou pelo caller).
 *   - DiscoverySource reusado em shared.ts (type union) e na UI.
 */

import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Compass,
  Flame,
  Sparkles,
  Sprout,
  Telescope,
} from 'lucide-react';

export type DiscoverySource =
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'odu'
  | 'iching'
  | 'literature';

/**
 * Display config por source — single source of truth visual.
 * Cor segue convenção Mandala (Wave 5.2) — mesma paleta que
 * `PILAR_COLORS` em `components/akasha/mandala-geometry.ts`.
 */
export interface SourceDisplay {
  source: DiscoverySource;
  /** Label em pt-BR (fallback se i18n não prover). */
  labelPtBr: string;
  /** Label em inglês. */
  labelEn: string;
  /** Cor HEX/Tailwind-safe (mesma do Mandala). */
  color: string;
  /** Tailwind text color utility. */
  colorClass: string;
  /** Ícone lucide. */
  icon: LucideIcon;
}

export const SOURCE_DISPLAY: Record<DiscoverySource, SourceDisplay> = {
  cabala: {
    source: 'cabala',
    labelPtBr: 'Cabala',
    labelEn: 'Kabbalah',
    color: '#8b5cf6', // violet
    colorClass: 'text-violet-400',
    icon: Sparkles,
  },
  astrologia: {
    source: 'astrologia',
    labelPtBr: 'Astrologia',
    labelEn: 'Astrology',
    color: '#fbbf24', // amber
    colorClass: 'text-amber-400',
    icon: Compass,
  },
  tantra: {
    source: 'tantra',
    labelPtBr: 'Tantra',
    labelEn: 'Tantra',
    color: '#f43f5e', // rose
    colorClass: 'text-rose-400',
    icon: Flame,
  },
  odu: {
    source: 'odu',
    labelPtBr: 'Odu',
    labelEn: 'Odu',
    color: '#10b981', // emerald
    colorClass: 'text-emerald-400',
    icon: Sprout,
  },
  iching: {
    source: 'iching',
    labelPtBr: 'I Ching',
    labelEn: 'I Ching',
    color: '#3b82f6', // blue
    colorClass: 'text-blue-400',
    icon: Telescope,
  },
  literature: {
    source: 'literature',
    labelPtBr: 'Literatura',
    labelEn: 'Literature',
    color: '#94a3b8', // slate
    colorClass: 'text-slate-300',
    icon: BookOpen,
  },
};

/**
 * Label canônico por source (helper puro — UI consumers preferem
 * `useTranslation` quando disponível; este é fallback deterministic).
 */
export function sourceLabel(source: DiscoverySource, locale: string): string {
  const entry = SOURCE_DISPLAY[source];
  return locale === 'en' ? entry.labelEn : entry.labelPtBr;
}