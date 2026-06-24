'use client';

/**
 * PerdidoView — Wave 10.3 polish
 *
 * Shown when the user picks "perdido" (sem direção).
 *
 * The user feels without direction. The view gives:
 *   - Mini-mandala: a static SVG ring + glyph reminding the user their
 *     map exists. Not interactive (we don't want another menu).
 *   - Three practice cards (short, low-decision) — pick one, do it.
 *   - "Me dê um caminho" CTA → opens the diario/ Mentor view with the
 *     `perdido` intent (which the synthesis engine handles by surfacing
 *     the day's `missaoDestino` narrative).
 *
 * Wave 10.3 polish:
 *   - Practice cards: bigger icons (44px box, was 36px), tighter copy
 *     (description ≤ 6 words), stronger colour cues.
 *   - Mentor CTA is now a primary button (was a small card with two-line
 *     label). Copy: "Me dê um caminho".
 *   - Mini-mandala stays — it anchors the view visually.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Compass, Sparkles, Eye } from 'lucide-react';

import type { AdaptiveViewProps } from '../shared';

export interface PerdidoViewProps extends AdaptiveViewProps {}

export function PerdidoView({ data, loading, locale }: AdaptiveViewProps) {
  const phrase = data?.climate ?? 'Quando não há direção, comece pelo corpo.';
  const practice = data?.ritual;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      data-testid="perdido-view"
    >
      {/* Mini mandala — static SVG ring + central glyph */}
      <div
        className="rounded-3xl border border-amber-400/25 p-4 flex items-center justify-center"
        style={{
          background:
            'linear-gradient(145deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.03) 100%)',
        }}
      >
        <svg
          width={180}
          height={180}
          viewBox="0 0 180 180"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block"
          data-testid="perdido-mini-mandala"
        >
          <defs>
            <radialGradient id="perdidoCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Outer ring */}
          <circle cx="90" cy="90" r="85" fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="1" />
          <circle cx="90" cy="90" r="68" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
          <circle cx="90" cy="90" r="48" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
          {/* Inner core */}
          <circle cx="90" cy="90" r="42" fill="url(#perdidoCore)" />
          {/* Compass needle — pointing up to suggest "busca" */}
          <polygon
            points="90,55 95,90 90,125 85,90"
            fill="rgba(251,191,36,0.85)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.5"
          />
          <circle cx="90" cy="90" r="3" fill="rgba(255,255,255,0.9)" />
          {/* Tick marks at 8 directions */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
            const x1 = 90 + Math.cos(angle) * 78;
            const y1 = 90 + Math.sin(angle) * 78;
            const x2 = 90 + Math.cos(angle) * 84;
            const y2 = 90 + Math.sin(angle) * 84;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(251,191,36,0.4)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      {/* One grounding phrase */}
      <blockquote className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.03] text-center">
        <p className="text-base text-white/90 leading-snug">“{phrase}”</p>
      </blockquote>

      {/* 3 practice cards — short, low-decision. Wave 10.3: tighter copy
          + bigger icons so the cards read as buttons at a glance. */}
      <div className="grid grid-cols-1 gap-3">
        {practice && (
          <PracticeCard
            icon={Sparkles}
            color="#FBBF24"
            title={practice.titulo}
            description={practice.instrucao}
            testid="perdido-practice-ritual"
          />
        )}
        <PracticeCard
          icon={Eye}
          color="#A78BFA"
          title="5 min de silêncio"
          description="Sente-se. Apenas observe."
          testid="perdido-practice-silence"
        />
        <PracticeCard
          icon={Compass}
          color="#34D399"
          title="Escreva a 1ª coisa"
          description="Sem editar. A próxima vem."
          testid="perdido-practice-write"
        />
      </div>

      {/* Mentor CTA — primary button. Wave 10.3: was a small amber card
          with two-line eyebrow + headline. Now a single primary action. */}
      <Link
        href={`/${locale}/diario?intencao=perdido`}
        className="flex items-center justify-center gap-3 rounded-2xl min-h-[60px] px-5 text-center transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
          border: '1px solid rgba(252,211,77,0.55)',
          textDecoration: 'none',
          boxShadow: '0 6px 24px -10px rgba(245,158,11,0.6)',
        }}
        data-testid="perdido-mentor-link"
      >
        <Compass size={22} className="text-white" aria-hidden="true" />
        <span className="text-base font-bold text-white tracking-wide">
          Me dê um caminho
        </span>
      </Link>

      {loading && (
        <p className="text-[10px] text-white/35 text-center">carregando seu mapa…</p>
      )}
    </motion.div>
  );
}

function PracticeCard({
  icon: Icon,
  color,
  title,
  description,
  testid,
}: {
  icon: typeof Sparkles;
  color: string;
  title: string;
  description: string;
  testid: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4 flex items-center gap-3 min-h-[64px]"
      style={{
        background: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)`,
        borderColor: `${color}35`,
      }}
      data-testid={testid}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          border: `1px solid ${color}40`,
        }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">{title}</p>
        <p className="text-xs text-white/65 leading-snug mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default PerdidoView;
