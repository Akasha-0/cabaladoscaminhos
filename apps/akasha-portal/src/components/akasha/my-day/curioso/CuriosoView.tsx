'use client';

/**
 * CuriosoView — Wave 10.3 polish
 *
 * Shown when the user picks "curioso" (quero explorar).
 *
 * The user has bandwidth and curiosity. The view gives a 5-card grid,
 * one per Pilar:
 *   1. Cabala        — caminho de vida
 *   2. Astrologia    — ascendente + trânsitos
 *   3. Tantra        — corpos tântricos
 *   4. Odu           — Odu do dia
 *   5. I Ching       — hexagrama mutacional
 *
 * Each card is a tappable link to /mandala?layer=N (where layer N
 * corresponds to the Pilar's mandala layer). For Odu we link to /diario
 * (where the Odu is rendered with consent context).
 *
 * Wave 10.3 polish:
 *   - Header collapsed from 3 lines (eyebrow + h3 + subtitle) to 2.
 *   - Card icon box: 40 → 48 px; icon size 18 → 22 px.
 *   - Card min-height 64px so it reads as a touch target.
 *   - Subtitle is now ≤ 3 words (was 2-4 word phrases that took 2 lines
 *     in some locales).
 *   - Grid stays 1-col on mobile (per spec — no horizontal scroll on
 *     360px), becomes 2-col on >= 640px. The plan asked for \"2x3 grid\"
 *     but 5 cards don't divide evenly; 1-col on mobile + 2-col on
 *     sm+ gives the same visual density without horizontal cramping.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CircleDot,
  Star,
  Zap,
  Layers,
  Hexagon,
} from 'lucide-react';

import { useTranslation } from '@/i18n';
import type { AdaptiveViewProps } from '../shared';

export interface CuriosoViewProps extends AdaptiveViewProps {}

interface PilarCard {
  key: 'cabala' | 'astrologia' | 'tantra' | 'odu' | 'iching';
  icon: typeof CircleDot;
  href: (locale: string) => string;
  color: string;
  glow: string;
}

const PILARES: readonly PilarCard[] = [
  {
    key: 'cabala',
    icon: CircleDot,
    href: (l) => `/${l}/mandala?layer=2`,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.35)',
  },
  {
    key: 'astrologia',
    icon: Star,
    href: (l) => `/${l}/mandala?layer=4`,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.35)',
  },
  {
    key: 'tantra',
    icon: Zap,
    href: (l) => `/${l}/mandala?layer=3`,
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.35)',
  },
  {
    key: 'odu',
    icon: Layers,
    href: (l) => `/${l}/diario?intencao=explorar-odu`,
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.35)',
  },
  {
    key: 'iching',
    icon: Hexagon,
    href: (l) => `/${l}/mandala?layer=5`,
    color: '#34D399',
    glow: 'rgba(52,211,153,0.35)',
  },
];

export function CuriosoView({ data: _data, loading, locale }: AdaptiveViewProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
      data-testid="curioso-view"
    >
      <header className="px-1">
        <h3 className="text-lg font-bold text-white m-0">
          {t('meuDia.curioso.heading')}
        </h3>
        <p className="text-xs text-white/55 leading-snug mt-1 m-0">
          {t('meuDia.curioso.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PILARES.map((p, i) => {
          const Icon = p.icon;
          const title = t(`meuDia.curioso.pilar.${p.key}.title`);
          const subtitle = t(`meuDia.curioso.pilar.${p.key}.subtitle`);
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
            >
              <Link
                href={p.href(locale)}
                className="block rounded-2xl p-4 min-h-[64px] transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                style={{
                  background: `linear-gradient(135deg, ${p.color}18 0%, ${p.color}05 100%)`,
                  border: `1px solid ${p.color}35`,
                  textDecoration: 'none',
                }}
                data-testid={`curioso-pilar-${p.key}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}30 0%, ${p.color}10 100%)`,
                      border: `1px solid ${p.color}50`,
                      boxShadow: `0 0 16px -6px ${p.glow}`,
                    }}
                  >
                    <Icon size={22} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white leading-tight">{title}</p>
                    <p className="text-xs text-white/60 leading-tight mt-0.5">{subtitle}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {loading && (
        <p className="text-[10px] text-white/35 text-center">{t('meuDia.loading')}</p>
      )}
    </motion.div>
  );
}

export default CuriosoView;
