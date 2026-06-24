'use client';

/**
 * AnsiosoView — Wave 10.3 polish
 *
 * Shown when the user picks "ansioso" (preciso de calma).
 *
 * Goal from grill-me: "se eu estou com ansiedade hoje, eu vou ter que ficar
 * procurando na interface até eu achar aquilo que eu preciso"
 *
 * Wave 10.3 polish:
 *   - BreathOrb is bigger (260px, was 220) — fills more of the viewport.
 *   - The grounding phrase is shortened to ≤ 8 words (we don't show the
 *     full synthesis paragraph here — anxiety users don't want to read).
 *   - Mentor CTA is now a full-width primary button (~72px tall, was a
 *     60px card with tiny eyebrow label). Copy: "Falar com Mentor agora".
 *   - The whole view fits in one viewport on a 360×640 phone so the user
 *     never has to scroll past the orb to find help.
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

/**
 * Trim a phrase to ≤ `maxWords` words. If truncated, ellipsis is appended.
 * We deliberately don't split words — anxiety users don't want to read
 * mid-sentence fragments.
 */
function trimPhrase(text: string, maxWords: number): string {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export function AnsiosoView({ data, loading, locale }: AnsiosoViewProps) {
  const [orbStarted, setOrbStarted] = useState(false);

  // Pick the shortest, most calming sentence from the synthesis. If we have
  // the full synthesis paragraph, use that — otherwise show a static
  // grounding phrase. We deliberately do NOT show authority/strategy here:
  // the user in anxiety doesn't need a "aja agora" prompt.
  // Wave 10.3: cap at 8 words so it fits one line on 360px wide.
  const phrase = trimPhrase(
    data?.synthesisParagraph ?? data?.climate ?? 'Respire. Apenas isso, agora.',
    8
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      data-testid="ansioso-view"
    >
      {/* Breath orb — the centrepiece, larger in Wave 10.3 */}
      <div
        className="rounded-3xl border border-blue-400/25 px-4 pt-6 pb-4 flex flex-col items-center"
        style={{
          background:
            'linear-gradient(145deg, rgba(96,165,250,0.10) 0%, rgba(30,64,175,0.04) 100%)',
        }}
      >
        <BreathOrb
          paused={!orbStarted}
          cycles={3}
          size={260}
        />
        {!orbStarted && (
          <button
            type="button"
            onClick={() => setOrbStarted(true)}
            className="mt-4 min-h-[48px] px-6 rounded-full text-base font-semibold text-white transition-transform active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.4) 0%, rgba(59,130,246,0.25) 100%)',
              border: '1px solid rgba(96,165,250,0.55)',
            }}
            data-testid="ansioso-start-breath"
          >
            Começar respiração
          </button>
        )}
      </div>

      {/* One grounding phrase — short (≤ 8 words) */}
      <blockquote
        className="rounded-2xl border border-white/10 px-4 py-3 bg-white/[0.03] text-center"
        aria-live="polite"
      >
        <p className="text-base text-white/90 leading-snug">
          “{phrase}”
        </p>
      </blockquote>

      {/* Mentor CTA — primary, full-width, ≥ 56px tall. Wave 10.3: was a
          tiny card with eyebrow label, now a real button-like link. */}
      <Link
        href={`/${locale}/diario?intencao=ansiedade`}
        className="flex items-center justify-center gap-3 rounded-2xl min-h-[60px] px-5 text-center transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          border: '1px solid rgba(147,197,253,0.55)',
          textDecoration: 'none',
          boxShadow: '0 6px 24px -10px rgba(59,130,246,0.6)',
        }}
        data-testid="ansioso-mentor-link"
      >
        <MessageCircle size={22} className="text-white" aria-hidden="true" />
        <span className="text-base font-bold text-white tracking-wide">
          Falar com Mentor agora
        </span>
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
