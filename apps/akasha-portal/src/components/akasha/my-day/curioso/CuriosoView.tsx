'use client';

/**
 * CuriosoView — Wave 9.1
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

import type { AdaptiveViewProps } from '../shared';

export interface CuriosoViewProps extends AdaptiveViewProps {}

interface PilarCard {
  key: string;
  icon: typeof CircleDot;
  title: string;
  subtitle: string;
  href: (locale: string) => string;
  color: string;
  glow: string;
}

const PILARES: readonly PilarCard[] = [
  {
    key: 'cabala',
    icon: CircleDot,
    title: 'Cabala',
    subtitle: 'Caminho de vida',
    href: (l) => `/${l}/mandala?layer=2`,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.35)',
  },
  {
    key: 'astrologia',
    icon: Star,
    title: 'Astrologia',
    subtitle: 'Ascendente + trânsitos',
    href: (l) => `/${l}/mandala?layer=4`,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.35)',
  },
  {
    key: 'tantra',
    icon: Zap,
    title: 'Tantra',
    subtitle: 'Corpos tântricos',
    href: (l) => `/${l}/mandala?layer=3`,
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.35)',
  },
  {
    key: 'odu',
    icon: Layers,
    title: 'Odu',
    subtitle: 'Linha ancestral',
    href: (l) => `/${l}/diario?intencao=explorar-odu`,
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.35)',
  },
  {
    key: 'iching',
    icon: Hexagon,
    title: 'I Ching',
    subtitle: 'Hexagrama do dia',
    href: (l) => `/${l}/mandala?layer=5`,
    color: '#34D399',
    glow: 'rgba(52,211,153,0.35)',
  },
];

export function CuriosoView({ data: _data, loading, locale }: AdaptiveViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      data-testid="curioso-view"
    >
      <header className="text-center">
        <p className="text-xs text-violet-200/70 uppercase tracking-widest font-semibold m-0">
          Explore os 5 Pilares
        </p>
        <h3 className="text-lg font-bold text-white mt-1 mb-1">Para onde sua curiosidade puxa?</h3>
        <p className="text-xs text-white/55 leading-relaxed m-0">
          Toque num pilar para abrir a camada correspondente no seu mapa.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PILARES.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
            >
              <Link
                href={p.href(locale)}
                className="block rounded-2xl p-4 transition-transform active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${p.color}18 0%, ${p.color}05 100%)`,
                  border: `1px solid ${p.color}35`,
                  textDecoration: 'none',
                }}
                data-testid={`curioso-pilar-${p.key}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    aria-hidden="true"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}30 0%, ${p.color}10 100%)`,
                      border: `1px solid ${p.color}50`,
                      boxShadow: `0 0 16px -6px ${p.glow}`,
                    }}
                  >
                    <Icon size={18} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-snug">{p.title}</p>
                    <p className="text-[11px] text-white/55 leading-tight mt-0.5">{p.subtitle}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {loading && (
        <p className="text-[10px] text-white/35 text-center">carregando seu mapa…</p>
      )}
    </motion.div>
  );
}

export default CuriosoView;