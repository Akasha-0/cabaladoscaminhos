'use client';

/**
 * RitualSection — F-235
 * Renderiza o micro-ritual com expand/collapse animado.
 */
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslations } from '@/lib/i18n';
import { useReducedMotion } from '@/components/akasha/hooks/useReducedMotion';

interface RitualSectionProps {
  ritual: { titulo: string; instrucao: string };
  pilarInfo: { nome: string; cor: string };
  locale: string;
}

// Stable — no closure captures, defined once at module level
const badge = (color: string) =>
  `inline-block text-[0.72rem] tracking-wide px-3 py-1 rounded-full mr-2 mb-2 border`;

export function RitualSection({ ritual, pilarInfo, locale }: RitualSectionProps) {
  const t = getTranslations(locale);
  const [expanded, setExpanded] = useState(false);
  const shouldReduce = useReducedMotion();

  const card = `bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4`;

  const explainText = useMemo(() => {
    if (ritual.titulo === 'Conta-Cantiga') return t('diario.ritual.explicaContaCantiga');
    if (ritual.titulo === 'Respiração do Céu') return t('diario.ritual.explicaRespiracao');
    if (ritual.titulo === 'Varredura dos 11') return t('diario.ritual.explicaVarredura');
    if (ritual.titulo === 'Oração ao Ori') return t('diario.ritual.explicaOracao');
    return t('diario.ritual.explicaIching');
  }, [ritual.titulo, t]);

  return (
    <section aria-label={t('diario.ritual.microRitual')} className={card}>
      <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF] mb-2 leading-snug">
        {t('diario.ritual.microRitual')}
      </h2>
      <p className="text-[0.9rem] leading-relaxed text-[#B8BFCE]">{ritual.instrucao}</p>

      <div className="mt-3.5">
        <span
          className={badge(pilarInfo.cor)}
          style={{ background: `${pilarInfo.cor}1A`, borderColor: `${pilarInfo.cor}55`, color: pilarInfo.cor }}
        >
          {pilarInfo.nome}
        </span>
        <span
          className={badge('#2DD4BF')}
          style={{ background: '#2DD4BF1A', borderColor: '#2DD4BF55', color: '#2DD4BF' }}
        >
          {t('diario.ritual.duracao')}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-[0.72rem] text-[#8A9BB8] hover:text-white/60 transition-colors flex items-center gap-1 focus:outline-none"
        style={{ outline: '2px solid #7C5CFF', outlineOffset: '2px', borderRadius: '4px' }}
        aria-expanded={expanded}
        aria-controls="ritual-explain"
      >
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        <span>{t('diario.ritual.porQueEsteRitual')}</span>
      </button>

      {!shouldReduce ? (
        <AnimatePresence>
          {expanded && (
            <motion.div
              id="ritual-explain"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <p className="text-[0.85rem] leading-relaxed text-[#B8BFCE] mt-3 border-t border-[#141A33] pt-3">
                {explainText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      ) : expanded ? (
        <div id="ritual-explain">
          <p className="text-[0.85rem] leading-relaxed text-[#B8BFCE] mt-3 border-t border-[#141A33] pt-3">
            {explainText}
          </p>
        </div>
      ) : null}

      <Link
        href={`/${locale}/oraculo?pilar=${encodeURIComponent(pilarInfo.nome)}`}
        className="mt-4 block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-[rgba(124,92,255,0.13)] to-[rgba(45,212,191,0.08)] border border-[rgba(124,92,255,0.33)] text-[#7C5CFF] text-[0.88rem] tracking-wide font-cinzel no-underline transition-opacity hover:opacity-80 focus:outline-none"
        style={{ outline: '2px solid #7C5CFF', outlineOffset: '2px' }}
      >
        {t('diario.ritual.consultarOraculo')}
      </Link>
    </section>
  );
}
