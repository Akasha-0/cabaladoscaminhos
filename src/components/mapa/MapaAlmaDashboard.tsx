// Skip link for keyboard navigation
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:font-semibold focus:rounded-lg focus:ring-2 focus:ring-amber-300"
    >
      Pular para o conteúdo principal
    </a>
  );
}

/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// Import existing components
import { NumerologiaCard } from './NumerologiaCard';
import { OduCardFull } from './OduCardFull';
import { ChakraPanel } from './ChakraPanel';
import { TarotCard } from './TarotCard';
import { ArvoreVidaViz } from './ArvoreVidaViz';
import { MapaNatalViz } from './MapaNatalViz';
import { CorrelacaoInsight } from './CorrelacaoInsight';
import { CalendarioEnergetico } from './CalendarioEnergetico';

interface MapaAlmaDashboardProps {
  data: MapaAlmaCompleto;
  className?: string;
}

// System card components for expandable behavior
type SystemKey = 'numerologia' | 'odu' | 'astrologia' | 'tarot' | 'chakras' | 'cabala';

interface SystemCardProps {
  id: SystemKey;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  ariaLabel: string;
}

function SystemCard({ id, title, icon, children, defaultExpanded = false, ariaLabel }: SystemCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  }, [toggleExpand]);

  return (
    <div
      className={cn(
        'card-spiritual overflow-hidden transition-all duration-300',
        expanded && 'ring-1 ring-amber-500/30'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`system-content-${id}`}
        aria-label={`${ariaLabel} - ${expanded ? 'Recolher' : 'Expandir'}`}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between p-4 cursor-pointer',
          'hover:bg-slate-800/30 transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-inset'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-hidden="true">{icon}</span>
          <Heading variant="mystical" size="sm" className="text-amber-400 m-0">
            {title}
          </Heading>
        </div>
        <span
          className={cn(
            'text-amber-400/60 transition-transform duration-300',
            expanded && 'rotate-180'
          )}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>
      <div
        id={`system-content-${id}`}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          'opacity-0 max-h-0',
          expanded && 'opacity-100 max-h-[2000px]'
        )}
      >
        <div className="p-4 pt-0">
          <MysticDivider variant="subtle" className="mb-4" />
          {children}
        </div>
      </div>
    </div>
  );
}

// Section header component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <Heading variant="section" size="lg" className="text-slate-100">
        {title}
      </Heading>
      {subtitle && (
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Main Dashboard Component
export function MapaAlmaDashboard({ data, className = '' }: MapaAlmaDashboardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Get Odu display name
  const getOduDisplayName = () => {
    if ('numero' in data.odu.regente) {
      const regente = data.odu.regente as { numero: number; nome: string };
      return `Oxé (${regente.numero})`;
    }
    const regente = data.odu.regente as { number: number; name: string };
    return `${regente.name} (${regente.number})`;
  };

  // Get Astrology sign
  const getSolSign = () => {
    return data.astrologia.sol.signo || 'Escorpião';
  };

  // Main correlation description
  const getMainCorrelationDescription = () => {
    if (data.convergencias && data.convergencias.length > 0) {
      const mainConvergence = data.convergencias[0];
      return mainConvergence.descricao;
    }
    return 'Sua tríplice convergência espiritual está sendo calculada...';
  };

  return (
    <>
      <SkipLink />
      <div
        className={cn(
          'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
          'text-slate-100',
          !prefersReducedMotion && 'animate-fade-in',
          className
        )}
        role="main"
        aria-label="Mapa da Alma - Painel Espiritual Unificado"
        id="main-content"
      >
        {/* Screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {data.convergencias && data.convergencias.length > 0
            ? `Correlação principal: ${getMainCorrelationDescription()}`
            : 'Carregando correlações espirituais...'}
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <Heading variant="mystical" size="2xl" glow="gold" className="mb-2">
                ✦ SEU MAPA DA ALMA ✦
              </Heading>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                <span className="font-medium text-slate-200">{data.perfil.nomeCompleto}</span>
                <span aria-hidden="true">•</span>
                <span>{data.perfil.dataNascimento}</span>
                {data.perfil.cidade && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{data.perfil.cidade}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <MysticDivider symbol="star" variant="bold" />
        </header>

        {/* Main Essence + Correlation Row */}
        <section
          aria-labelledby="essence-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
        >
          {/* Essence Card */}
          <div className="card-spiritual p-6">
            <Heading
              id="essence-heading"
              variant="section"
              size="md"
              className="text-amber-400 mb-6"
            >
              ✦ ESSÊNCIA
            </Heading>
            <div className="space-y-4">
              {/* Life Number */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-400">
                    {data.numerologia.vida}
                  </span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Número de Vida
                  </div>
                  <div className="text-slate-200 font-medium">
                    {data.numerologia.vida === 11 ? 'Mestre (11)' :
                     data.numerologia.vida === 22 ? 'Mestre (22)' :
                     data.numerologia.vida === 33 ? 'Mestre (33)' : ''}
                  </div>
                </div>
              </div>

              {/* Odu */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-2xl">🌀</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Odu
                  </div>
                  <div className="text-slate-200 font-medium">
                    {getOduDisplayName()}
                  </div>
                </div>
              </div>

              {/* Sun Sign */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-2xl">☀️</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Sol
                  </div>
                  <div className="text-slate-200 font-medium">
                    {getSolSign()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Correlation */}
          <div className="card-spiritual p-6">
            <Heading
              variant="section"
              size="md"
              className="text-amber-400 mb-6"
            >
              ✦ CORRELAÇÃO PRINCIPAL
            </Heading>
            <div className="mb-4">
              <p className="text-slate-200 leading-relaxed">
                {getMainCorrelationDescription()}
              </p>
            </div>
            {/* Deep Correlations AI Insight */}
            {data.deepCorrelations && data.deepCorrelations.energyHarmony && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-xl" role="img" aria-hidden="true">🔮</span>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-violet-400 mb-1">
                      Insight IA
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {data.deepCorrelations.energyHarmony.dominant_energy ||
                       'Análise profunda das conexões entre seus sistemas espirituais.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Systems Grid */}
        <section aria-labelledby="systems-heading" className="mb-6">
          <SectionHeader
            title="SISTEMAS"
            subtitle="Clique para expandir cada sistema espiritual"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Numerologia */}
            <SystemCard
              id="numerologia"
              title="NUMEROLOGIA"
              icon="🔢"
              ariaLabel="Cartão de Numerologia"
              defaultExpanded={true}
            >
              <NumerologiaCard data={data.numerologia} />
            </SystemCard>

            {/* Odu */}
            <SystemCard
              id="odu"
              title="ODU (IFÁ)"
              icon="🌀"
              ariaLabel="Cartão do Odu"
            >
              <OduCardFull odu={data.odu} />
            </SystemCard>

            {/* Astrologia */}
            <SystemCard
              id="astrologia"
              title="ASTROLOGIA"
              icon="⭐"
              ariaLabel="Cartão de Astrologia"
            >
              <MapaNatalViz astrologia={data.astrologia} />
            </SystemCard>

            {/* Tarot */}
            <SystemCard
              id="tarot"
              title="TAROT"
              icon="🃏"
              ariaLabel="Cartão de Tarot"
            >
              <TarotCard data={data.tarot} />
            </SystemCard>

            {/* Cabala */}
            <SystemCard
              id="cabala"
              title="CABALA"
              icon="🌳"
              ariaLabel="Árvore da Vida Cabalística"
            >
              <ArvoreVidaViz numerologia={data.numerologia} odu={data.odu} />
            </SystemCard>

            {/* Chakras */}
            <SystemCard
              id="chakras"
              title="CHAKRAS"
              icon="🔮"
              ariaLabel="Painel dos Chakras"
            >
              <ChakraPanel data={data.chakras} />
            </SystemCard>
          </div>
        </section>

        {/* Árvore da Vida + Mapa Natal Row */}
        <section aria-labelledby="tree-heading" className="mb-6">
          <SectionHeader
            title="ÁRV. DA VIDA & MAPA NATAL"
            subtitle="Visualizações interativas dos seus mapas celestiais e espirituais"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Árvore da Vida */}
            <div className="card-spiritual p-4">
              <ArvoreVidaViz numerologia={data.numerologia} odu={data.odu} />
            </div>

            {/* Mapa Natal Circular */}
            <div className="card-spiritual p-4">
              <MapaNatalViz astrologia={data.astrologia} />
            </div>
          </div>
        </section>

        {/* Chakras + Calendário Row */}
        <section aria-labelledby="energy-heading" className="mb-6">
          <SectionHeader
            title="CHAKRAS & CALENDÁRIO"
            subtitle="Sua energia espiritual e influências do momento"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 7 Chakras */}
            <ChakraPanel data={data.chakras} />

            {/* Calendário Energético */}
            <CalendarioEnergetico odu={data.odu} />
          </div>
        </section>

        {/* Convergências */}
        {data.convergencias && data.convergencias.length > 0 && (
          <section aria-labelledby="convergence-heading" className="mb-6">
            <SectionHeader
              title="CONVERGÊNCIAS"
              subtitle="Pontos de encontro entre seus sistemas espirituais"
            />
            <CorrelacaoInsight convergencias={data.convergencias} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <div>
              <span>Mapa da Alma Completo v{data.versao}</span>
              <span className="mx-2">•</span>
              <span>Calculado em {data.dataCalculo}</span>
            </div>
            <div className="flex items-center gap-4">
              {data.orixasDominantes && data.orixasDominantes.length > 0 && (
                <span>
                  Orixás: {data.orixasDominantes.join(', ')}
                </span>
              )}
            </div>
          </div>
        </footer>
      </div>
      {/* CSS for reduced motion */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in {
            animation: none;
          }
        }
      `}</style>
 </>
  );
}
export type { MapaAlmaDashboardProps };