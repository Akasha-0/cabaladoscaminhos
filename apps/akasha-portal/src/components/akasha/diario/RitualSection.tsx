'use client';

/**
 * RitualSection — F-235
 * Renderiza o micro-ritual com expand/collapse animado.
 */
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface RitualSectionProps {
  ritual: { titulo: string; instrucao: string };
  pilarInfo: { nome: string; cor: string };
  locale: string;
}

export function RitualSection({ ritual, pilarInfo, locale }: RitualSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const card = `bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4`;

  const badge = (color: string) =>
    `inline-block text-[0.72rem] tracking-wide px-3 py-1 rounded-full mr-2 mb-2 border`;

  const explainText =
    ritual.titulo === 'Conta-Cantiga'
      ? 'A Numerologia Cabalística trabalha com números como códigos de ressonância. Este ritual ativa a vibração do seu número-base no contexto do dia.'
      : ritual.titulo === 'Respiração do Céu'
      ? 'A Astrologia pede que você se alinhe com o ritmo celeste. Respirar com a Lua e o signo dissolve a resistência mental.'
      : ritual.titulo === 'Varredura dos 11'
      ? 'A Numerologia Tântrica sustenta que cada corpo sutil carrega memórias. Passar 11 respirações por cada um mobiliza energia adormecida.'
      : ritual.titulo === 'Oração ao Ori'
      ? 'O Odu de Nascimento é a sua assinatura oral. Agradecer ao Ori antes de agir estabelece presença e discernimento.'
      : 'O I Ching revela mutações em curso. Escrever 1 palavra por linha mutável ancora a percepção antes que a mente interprete.';

  return (
    <section aria-label="Micro-Ritual" className={card}>
      <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF] mb-2 leading-snug">
        O Micro-Ritual
      </h2>
      <p className="text-[0.9rem] leading-relaxed text-[#A7AECF]">{ritual.instrucao}</p>

      <div className="mt-3.5">
        <span
          className={badge(pilarInfo.cor)}
          style={{ background: `${pilarInfo.cor}1A`, borderColor: `${pilarInfo.cor}55`, color: pilarInfo.cor }}
        >
          via {pilarInfo.nome}
        </span>
        <span
          className={badge('#2DD4BF')}
          style={{ background: '#2DD4BF1A', borderColor: '#2DD4BF55', color: '#2DD4BF' }}
        >
          ~ 3 min
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-[0.72rem] text-[#5C6691] hover:text-white/60 transition-colors flex items-center gap-1"
        aria-expanded={expanded}
      >
        <span>{expanded ? '−' : '+'}</span>
        <span>Por que este ritual?</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="text-[0.85rem] leading-relaxed text-[#A7AECF] mt-3 border-t border-[#141A33] pt-3">
              {explainText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href={`/${locale}/oraculo`}
        className="mt-4 block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-[rgba(124,92,255,0.13)] to-[rgba(45,212,191,0.08)] border border-[rgba(124,92,255,0.33)] text-[#7C5CFF] text-[0.88rem] tracking-wide font-cinzel no-underline transition-opacity hover:opacity-80"
      >
        Consultar Oráculo →
      </Link>
    </section>
  );
}
