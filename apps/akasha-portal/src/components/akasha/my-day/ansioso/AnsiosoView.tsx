'use client';

/**
 * AnsiosoView — Wave 9.1
 *
 * Shown when the user picks "ansioso" (preciso de calma).
 *
 * Goal from grill-me: "se eu estou com ansiedade hoje, eu vou ter que ficar
 * procurando na interface até eu achar aquilo que eu preciso".
 *
 * The view is intentionally small. Big breath orb, one short phrase from
 * the synthesis (no scroll), one CTA to talk to the Mentor with the
 * `ansiedade` intent pre-loaded (wired in Sub-Wave 9.3 — for now the
 * intent is encoded in the URL so even before 9.3 merges, clicking
 * already opens the Mentor with the right context).
 *
 * The Mentor link sets `?intencao=ansiedade` which the diario/ page already
 * passes through to /api/akasha/mandato-do-dia, so the climate + ritual
 * there will already be tilted toward calming work.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { BreathOrb } from './BreathOrb';
import type { AdaptiveViewProps } from '../shared';

export interface AnsiosoViewProps extends AdaptiveViewProps {
  /** Locale used to build the Mentor link. */
  locale: string;
}

export function AnsiosoView({ data, loading, locale }: AnsiosoViewProps) {
  const [orbStarted, setOrbStarted] = useState(false);

  // Pick the shortest, most calming sentence from the synthesis. If we have
  // the full synthesis paragraph, use that — otherwise show a static
  // grounding phrase. We deliberately do NOT show authority/strategy here:
  // the user in anxiety doesn't need a "aja agora" prompt.
  const phrase =
    data?.synthesisParagraph ??
    data?.climate ??
    'Você não precisa resolver nada agora. Apenas respire.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
      data-testid="ansioso-view"
    >
      {/* Breath orb — the centrepiece */}
      <div className="rounded-3xl border border-blue-400/25 p-6 flex flex-col items-center" style={{
        background:
          'linear-gradient(145deg, rgba(96,165,250,0.08) 0%, rgba(30,64,175,0.04) 100%)',
      }}>
        <BreathOrb
          paused={!orbStarted}
          cycles={3}
          size={220}
        />
        {!orbStarted && (
          <button
            type="button"
            onClick={() => setOrbStarted(true)}
            className="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white/90 transition-transform active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.35) 0%, rgba(59,130,246,0.2) 100%)',
              border: '1px solid rgba(96,165,250,0.5)',
            }}
            data-testid="ansioso-start-breath"
          >
            Começar respiração
          </button>
        )}
      </div>

      {/* One grounding phrase */}
      <blockquote
        className="rounded-2xl border border-white/10 p-4 bg-white/[0.03] text-center"
        aria-live="polite"
      >
        <p className="text-sm text-white/85 leading-relaxed italic">
          “{phrase}”
        </p>
      </blockquote>

      {/* Mentor CTA */}
      <Link
        href={`/${locale}/diario?intencao=ansiedade`}
        className="block rounded-2xl p-4 transition-transform active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.08) 100%)',
          border: '1px solid rgba(96,165,250,0.35)',
          textDecoration: 'none',
        }}
        data-testid="ansioso-mentor-link"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.4) 0%, rgba(59,130,246,0.2) 100%)',
              border: '1px solid rgba(96,165,250,0.5)',
            }}
          >
            <MessageCircle size={18} className="text-blue-200" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-200/70 uppercase tracking-widest font-semibold">
              Conversar com o Mentor
            </p>
            <p className="text-sm font-medium text-white leading-snug">
              Abrir uma conversa sobre o que sinto agora
            </p>
          </div>
        </div>
      </Link>

      {loading && (
        <p className="text-[10px] text-white/35 text-center">
          carregando seu mapa…
        </p>
      )}
    </motion.div>
  );
}

export default AnsiosoView;