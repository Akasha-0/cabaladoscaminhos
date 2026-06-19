'use client';

/**
 * AreasSection — F-235
 * Renders the 8 life areas grid translated by the dominant pillar.
 * Collapsed by default with framer-motion expand.
 */
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslations } from '@/lib/i18n';
import { useReducedMotion } from '@/components/akasha/hooks/useReducedMotion';
import { AREAS, traducaoPara } from '@/lib/grimoire/traducao-areas';
import type { Pilar } from '@/lib/grimoire/significados-curados';

const TraducaoAreaPanel = dynamic(
  () =>
    import('@/components/akasha/TraducaoAreaPanel').then(
      (m) => m.TraducaoAreaPanel
    ),
  { ssr: false }
);

export interface AreasSectionProps {
  pilarPrincipal: Pilar;
  pilarInfo: { nome: string; cor: string };
  locale: string;
}

function headerStyle(cor: string, isOpen: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: isOpen ? `${cor}18` : 'rgba(11,14,28,0.6)',
    border: `1px solid ${cor}44`,
    borderLeft: `3px solid ${cor}`,
    borderRadius: 12,
    cursor: 'pointer',
    width: '100%',
    outline: '2px solid transparent',
    outlineOffset: '-2px',
    transition: 'background 0.2s ease, outline-color 0.15s ease',
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

export function AreasSection({ pilarPrincipal, pilarInfo, locale }: AreasSectionProps) {
  const t = getTranslations(locale);
  const [expanded, setExpanded] = useState(false);
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label={t('diario.areas.titulo')}
      className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4"
    >
      <button
              type="button"
              style={{ ...headerStyle(pilarInfo.cor, expanded), outlineColor: pilarInfo.cor }}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="areas-panel"
              className="mb-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
        <div>
          <h2 className="text-[1.15rem] font-cinzel text-[#F4F5FF] leading-snug mb-0.5">
            {t('diario.areas.titulo')}
          </h2>
          <p className="text-[0.75rem] text-[#8A9BB8]">
            {t('diario.areas.descricao', { pilar: pilarInfo.nome })}
          </p>
        </div>
        <span aria-hidden="true" style={chevronStyle(expanded)}>▼</span>
      </button>

      {!shouldReduce ? (
        <AnimatePresence>
          {expanded && (
            <motion.div
              id="areas-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <p className="text-[0.68rem] text-[#8A9BB8] mb-3 px-1">
                {t('diario.areas.leiaInstrucao')}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {AREAS.map((area) => {
                  const traducao = traducaoPara(pilarPrincipal, area);
                  if (!traducao) return null;
                  return (
                    <TraducaoAreaPanel
                      key={area}
                      traducao={traducao}
                      cor={pilarInfo.cor}
                      variant="expanded"
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : expanded ? (
        <div id="areas-panel">
          <p className="text-[0.68rem] text-[#8A9BB8] mb-3 px-1">
            {t('diario.areas.leiaInstrucao')}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {AREAS.map((area) => {
              const traducao = traducaoPara(pilarPrincipal, area);
              if (!traducao) return null;
              return (
                <TraducaoAreaPanel
                  key={area}
                  traducao={traducao}
                  cor={pilarInfo.cor}
                  variant="expanded"
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
