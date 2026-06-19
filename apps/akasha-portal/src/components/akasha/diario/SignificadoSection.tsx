'use client';

/**
 * SignificadoSection — F-235
 * Renders "Significado dos Pilares" with collapsible cards per pillar.
 */
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslations } from '@/lib/i18n';
import { useReducedMotion } from '@/components/akasha/hooks/useReducedMotion';
import type { SignificadoCurado, Pilar } from '@/lib/grimoire/significados-curados';
import type { PilaresDoMandato } from './types';

const SignificadoPilar = dynamic(
  () => import('@/components/akasha/SignificadoPilar').then((m) => m.SignificadoPilar),
  { ssr: false }
);

const CORES_POR_PILAR: Record<Pilar, string> = {
  cabala: '#7C5CFF',
  astrologia: '#2DD4BF',
  tantrica: '#F0B429',
  odu: '#FB5781',
  iching: '#A0763A',
};

const ORDEM_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

type SignificadosPorPilar = {
  cabala: SignificadoCurado;
  astrologia: SignificadoCurado;
  tantrica: SignificadoCurado;
  odu: SignificadoCurado;
  iching: SignificadoCurado;
};

export interface SignificadoSectionProps {
  pilares: PilaresDoMandato;
  pilarPrincipal: Pilar;
  significados: SignificadosPorPilar;
  locale: string;
}

function cardStyle(borderColor: string, isOpen: boolean): React.CSSProperties {
  return {
    background: isOpen ? `${borderColor}0d` : 'rgba(11,14,28,0.72)',
    border: `1px solid ${borderColor}${isOpen ? '66' : '33'}`,
    borderLeft: `3px solid ${borderColor}`,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  };
}

function headerStyle(): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    cursor: 'pointer',
    width: '100%',
  };
}

function chevronStyle(isOpen: boolean): React.CSSProperties {
  return {
    transition: 'transform 0.3s ease',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    color: '#8A9BB8',
    fontSize: '1rem',
    lineHeight: 1,
  };
}

export function SignificadoSection({
  pilares,
  pilarPrincipal,
  significados,
  locale,
}: SignificadoSectionProps) {
  const t = getTranslations(locale);
  const [openPilar, setOpenPilar] = useState<Pilar | null>(null);
  const shouldReduce = useReducedMotion();

  const sexualidade = (() => {
    if (!('astrologia' in pilares)) return undefined;
    const astro = pilares.astrologia as { lilith_signo?: string | null; casa_8_signo?: string | null };
    return { lilith_signo: astro.lilith_signo, casa_8_signo: astro.casa_8_signo };
  })();

  return (
    <section
      aria-label={t('diario.significado.titulo')}
      className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4"
    >
      <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF] mb-1 leading-snug">
        {t('diario.significado.titulo')}
      </h2>
      <p className="text-[0.8rem] text-[#8A9BB8] leading-relaxed mb-4">
        {t('diario.significado.instrucao')}
      </p>

      {ORDEM_PILARES.map((p) => {
        const isOpen = openPilar === p;
        const cor = CORES_POR_PILAR[p];
        const isPrincipal = p === pilarPrincipal;
        const sig = significados[p];

        return (
          <div key={p} style={cardStyle(cor, isOpen)}>
            <button
              type="button"
              style={headerStyle()}
              onClick={() => setOpenPilar(isOpen ? null : p)}
              aria-expanded={isOpen}
              aria-controls={`significado-${p}`}
            >
              <div className="flex items-center gap-3">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: cor,
                    boxShadow: `0 0 6px ${cor}88`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span
                    className="text-[0.8rem] font-semibold"
                    style={{ color: isPrincipal ? cor : '#B8BFCE' }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                  {isPrincipal && (
                    <span
                      className="ml-2 text-[0.6rem] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${cor}1A`,
                        border: `1px solid ${cor}55`,
                        color: cor,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {t('diario.significado.principal')}
                    </span>
                  )}
                </div>
              </div>
              <span style={chevronStyle(isOpen)}>▼</span>
            </button>

            {!shouldReduce ? (
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={`significado-${p}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-5 pb-5 pt-2">
                      {sig ? (
                        <SignificadoPilar
                          significado={sig}
                          cor={cor}
                          destaque={isPrincipal}
                          sexualidade={p === 'astrologia' ? sexualidade : undefined}
                        />
                      ) : (
                        <p className="text-[0.8rem] text-[#8A9BB8] italic">
                          {t('diario.significado.indisponivel', { pilar: p })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : isOpen ? (
              <div id={`significado-${p}`}>
                <div className="px-5 pb-5 pt-2">
                  {sig ? (
                    <SignificadoPilar
                      significado={sig}
                      cor={cor}
                      destaque={isPrincipal}
                      sexualidade={p === 'astrologia' ? sexualidade : undefined}
                    />
                  ) : (
                    <p className="text-[0.8rem] text-[#8A9BB8] italic">
                      {t('diario.significado.indisponivel', { pilar: p })}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
