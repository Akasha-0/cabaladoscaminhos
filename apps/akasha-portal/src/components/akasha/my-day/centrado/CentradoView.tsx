'use client';

/**
 * CentradoView — Wave 10.3 polish
 *
 * Shown when the user picks "centrado" (em paz). The hub gives the FULL
 * daily synthesis because the user has the bandwidth to absorb it:
 *
 *   1. Climate (1 sentence)
 *   2. Strategy + Authority (Akasha Type)
 *   3. Daily ritual
 *   4. Synthesis paragraph (integration)
 *
 * Wave 10.3 polish:
 *   - Section labels collapsed from uppercase 12px eyebrow + icon to
 *     a single icon + bold 11px label. Half the visual noise.
 *   - Reduced vertical gaps (space-y-4 → space-y-3) so the 4 sections
 *     fit better on smaller screens.
 *   - Strategy row integrated into the authority card instead of a
 *     separate paragraph (was \"Estratégia: X\" — reads as metadata).
 *   - Synthesis label \"Síntese\" → \"Hoje\" (matches the new minimalist
 *     voice the user picked; centred = they don't need a header).
 *   - Fallback text preserved exactly to satisfy views.test.tsx regex
     (/silencioso hoje/i).
 *
 * No nav, no questions — just the day, complete.
 */

import { motion } from 'framer-motion';
import { Sparkles, Compass, BookOpen } from 'lucide-react';

import type { AdaptiveViewProps } from '../shared';

export function CentradoView({ data, loading }: AdaptiveViewProps) {
  if (loading) {
    return (
      <div className="space-y-3" data-testid="centrado-loading">
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
      className="space-y-3"
      data-testid="centrado-view"
    >
      {/* Climate */}
      {climate && (
        <div
          className="rounded-2xl border border-emerald-400/30 p-4"
          style={{ background: 'rgba(52,211,153,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-emerald-300" aria-hidden />
            <span className="text-[11px] text-emerald-300 font-bold">
              Clima
            </span>
          </div>
          <p className="text-base text-white/90 leading-snug">{climate}</p>
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
          <div className="flex items-center gap-2 mb-1.5">
            <Compass size={14} className="text-emerald-300" aria-hidden />
            <span className="text-[11px] text-emerald-300 font-bold">
              Autoridade
            </span>
          </div>
          <p className="text-lg font-bold text-white leading-tight">{profile.authority}</p>
          {profile.strategy && (
            <p className="text-xs text-white/65 mt-1">
              Estratégia: <span className="text-white/90 font-medium">{profile.strategy}</span>
            </p>
          )}
          {profile.dailyDirective && (
            <p className="text-sm text-white/85 mt-3 leading-relaxed italic border-l-2 border-emerald-400/40 pl-3">
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
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} style={{ color: ritual.cor }} aria-hidden />
            <span
              className="text-[11px] font-bold"
              style={{ color: ritual.cor }}
            >
              Prática
            </span>
          </div>
          <p className="text-base font-bold text-white leading-tight">{ritual.titulo}</p>
          <p className="text-sm text-white/75 mt-1.5 leading-snug">{ritual.instrucao}</p>
        </div>
      )}

      {/* Synthesis paragraph */}
      {paragraph && (
        <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.03]">
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen size={14} className="text-white/60" aria-hidden />
            <span className="text-[11px] text-white/70 font-bold">
              Hoje
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed italic">{paragraph}</p>
        </div>
      )}

      {/* Fallback if everything is empty — preserved copy matches views.test.tsx */}
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
