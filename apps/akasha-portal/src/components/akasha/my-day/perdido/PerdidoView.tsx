'use client';

/**
 * PerdidoView — Wave 9.1
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
      className="space-y-5"
      data-testid="perdido-view"
    >
      {/* Mini mandala — static SVG ring + central glyph */}
      <div
        className="rounded-3xl border border-amber-400/25 p-6 flex items-center justify-center"
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
      <blockquote className="rounded-2xl border border-white/10 p-4 bg-white/[0.03] text-center">
        <p className="text-sm text-white/85 leading-relaxed italic">“{phrase}”</p>
      </blockquote>

      {/* 3 practice cards — short, low-decision */}
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
          title="5 minutos de silêncio"
          description="Sente-se. Apenas observe o que aparece. Não corrija."
          testid="perdido-practice-silence"
        />
        <PracticeCard
          icon={Compass}
          color="#34D399"
          title="Escreva a primeira coisa"
          description="Sem editar. A próxima palavra virá."
          testid="perdido-practice-write"
        />
      </div>

      {/* Mentor CTA — "me dê um caminho" */}
      <Link
        href={`/${locale}/diario?intencao=perdido`}
        className="block rounded-2xl p-4 transition-transform active:scale-[0.98]"
        style={{
          background:
            'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 100%)',
          border: '1px solid rgba(251,191,36,0.35)',
          textDecoration: 'none',
        }}
        data-testid="perdido-mentor-link"
      >
        <p className="text-xs text-amber-200/70 uppercase tracking-widest font-semibold">
          Pedir um caminho
        </p>
        <p className="text-sm font-medium text-white leading-snug mt-1">
          Me dê um caminho — abrir o Mentor com sua missão de hoje
        </p>
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
      className="rounded-2xl border p-4 flex items-start gap-3"
      style={{
        background: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)`,
        borderColor: `${color}35`,
      }}
      data-testid={testid}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          border: `1px solid ${color}40`,
        }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white leading-snug">{title}</p>
        <p className="text-xs text-white/65 leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}

export default PerdidoView;