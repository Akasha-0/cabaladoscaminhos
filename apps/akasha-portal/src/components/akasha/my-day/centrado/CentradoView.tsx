'use client';

/**
 * CentradoView — Wave 9.1
 *
 * Shown when the user picks "centrado" (em paz). The hub gives the FULL
 * daily synthesis because the user has the bandwidth to absorb it:
 *
 *   1. Climate (1 sentence)
 *   2. Strategy + Authority (Akasha Type)
 *   3. Daily ritual
 *   4. Synthesis paragraph (integration)
 *
 * No nav, no questions — just the day, complete.
 */

import { motion } from 'framer-motion';
import { Sparkles, Compass, BookOpen } from 'lucide-react';

import type { AdaptiveViewProps } from '../shared';

export function CentradoView({ data, loading }: AdaptiveViewProps) {
  if (loading) {
    return (
      <div className="space-y-4" data-testid="centrado-loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/5 h-24" />
        ))}
      </div>
    );
  }

  const profile = data?.oneProfile;
  const ritual = data?.ritual;
  const climate = data?.climate;
  const paragraph = data?.synthesisParagraph;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      data-testid="centrado-view"
    >
      {/* Climate */}
      {climate && (
        <div
          className="rounded-2xl border border-emerald-400/30 p-4"
          style={{ background: 'rgba(52,211,153,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-emerald-300" aria-hidden />
            <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">
              Clima do dia
            </span>
          </div>
          <p className="text-sm text-white/85 leading-relaxed">{climate}</p>
        </div>
      )}

      {/* Strategy + Authority (Akasha Type) */}
      {profile && (
        <div
          className="rounded-2xl border border-emerald-400/25 p-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(20,184,166,0.05) 100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Compass size={14} className="text-emerald-300" aria-hidden />
            <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">
              Sua autoridade hoje
            </span>
          </div>
          <p className="text-base font-bold text-white">{profile.authority}</p>
          <p className="text-xs text-white/65 mt-1">
            Estratégia: <span className="text-white/85 font-medium">{profile.strategy}</span>
          </p>
          {profile.dailyDirective && (
            <p className="text-sm text-white/80 mt-3 leading-relaxed italic border-l-2 border-emerald-400/40 pl-3">
              {profile.dailyDirective}
            </p>
          )}
        </div>
      )}

      {/* Ritual */}
      {ritual && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: `linear-gradient(135deg, ${ritual.cor}22 0%, ${ritual.cor}08 100%)`,
            border: `1px solid ${ritual.cor}44`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: ritual.cor }} aria-hidden />
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: ritual.cor }}
            >
              Prática de hoje
            </span>
          </div>
          <p className="text-sm font-medium text-white leading-snug">{ritual.titulo}</p>
          <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{ritual.instrucao}</p>
        </div>
      )}

      {/* Synthesis paragraph */}
      {paragraph && (
        <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-white/60" aria-hidden />
            <span className="text-xs text-white/55 uppercase tracking-widest font-semibold">
              Síntese
            </span>
          </div>
          <p className="text-sm text-white/75 leading-relaxed italic">{paragraph}</p>
        </div>
      )}

      {/* Fallback if everything is empty */}
      {!climate && !profile && !ritual && !paragraph && (
        <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.03] text-center">
          <p className="text-sm text-white/70 leading-relaxed">
            Seu mapa está silencioso hoje — isso também é resposta. Aproveite o espaço.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default CentradoView;