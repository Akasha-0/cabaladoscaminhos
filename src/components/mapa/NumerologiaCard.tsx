'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import type { NumerologyResults } from '@/lib/engines/types/mapa-alma';

interface NumerologiaCardProps {
  data: NumerologyResults;
  className?: string;
}

const NUMBER_NAMES: Record<keyof Pick<NumerologyResults, 'vida' | 'expressao' | 'motivacao' | 'impressao'>, string> = {
  vida: 'Nº de Vida',
  expressao: 'Nº de Expressão',
  motivacao: 'Nº de Motivação',
  impressao: 'Nº de Impressão',
};

const NUMBER_DESCRIPTIONS: Record<number, string> = {
  1: 'Liderança, independência, pioneirismo. Você é um創新ador natural, determinado e autoconfiante.',
  2: 'Parceria, diplomacia, receptividade. Sua energia traz harmonia e cooperação onde quer que vá.',
  3: 'Expressão, criatividade, comunicação. Você irradia alegria e inspire os outros através da arte.',
  4: 'Estabilidade, trabalho, fundamentos. Sua disciplina constrói bases sólidas para o futuro.',
  5: 'Liberdade, mudança, aventura. Sua energia versátil busca experiências transformadoras.',
  6: 'Harmonia, família, responsabilidade. Você nurtures e cria espacios de paz e amor.',
  7: 'Análise, espiritualidade, introspecção. Sua sabedoria interior revela verdades profundas.',
  8: 'Poder, abundância, realizações. Você manifesta prosperidade através de sua determinação.',
  9: 'Compassão, humanitarianismo, sabedoria. Sua missão é servir a humanidade com amor.',
  11: 'Iluminação, intuição, mestres. Você carrega a energia de iluminação espiritual e insight superior.',
  22: 'Master Builder, realizações práticas. Você tem o poder de transformar visões grandiosas em realidade.',
  33: 'Master Healer, compaixão espiritual. Sua presença traz cura e elevação para todos ao redor.',
};

const METHOD_LABELS: Record<NumerologyResults['metodoUsado'], string> = {
  pitagorica: 'Pitagórica',
  caldeia: 'Caldeia',
  cabalistica: 'Cabalística',
  tantrica: 'Tântrica',
  misto: 'Mista',
};

const isMasterNumber = (n: number): boolean => [11, 22, 33].includes(n);

type NumberKey = 'vida' | 'expressao' | 'motivacao' | 'impressao';

export function NumerologiaCard({ data, className }: NumerologiaCardProps) {
  const [expanded, setExpanded] = useState<NumberKey | null>(null);

  const toggleExpand = (key: NumberKey) => {
    setExpanded(prev => prev === key ? null : key);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: NumberKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(key);
    }
  };

  const gridItems: { key: NumberKey; value: number; color: string }[] = [
    { key: 'vida', value: data.vida, color: 'gold' },
    { key: 'expressao', value: data.expressao, color: 'violet' },
    { key: 'motivacao', value: data.motivacao, color: 'violet' },
    { key: 'impressao', value: data.impressao, color: 'violet' },
  ];

  return (
    <div className={cn('card-spiritual p-6', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <Heading variant="mystical" className="text-amber-400 mb-2">
          ✦ NUMEROLOGIA
        </Heading>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
          {METHOD_LABELS[data.metodoUsado]}
        </span>
      </div>

      <MysticDivider className="mb-6" />

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
// fallow-ignore-next-line complexity
        {gridItems.map(({ key, value, color }) => {
          const isExpanded = expanded === key;
          const isMaster = isMasterNumber(value);
          const description = NUMBER_DESCRIPTIONS[value] || NUMBER_DESCRIPTIONS[value % 9 || 9];

          return (
            <div key={key} className="relative">
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`numerologia-detail-${key}`}
                aria-label={`${NUMBER_NAMES[key]}: número ${value}. ${isExpanded ? 'Recolher detalhes' : 'Expandir para ver interpretação'}`}
                onClick={() => toggleExpand(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                className={cn(
                  'relative rounded-xl p-4 text-center cursor-pointer transition-all duration-300',
                  'border border-slate-700/50 bg-slate-800/30',
                  'hover:bg-slate-800/50 hover:border-slate-600/60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                  isMaster && 'shadow-[0_0_20px_rgba(212,175,55,0.4)]',
                )}
              >
                {/* Number */}
                <div
                  className={cn(
                    'text-3xl sm:text-4xl md:text-5xl font-bold mb-1',
                    color === 'gold' ? 'text-amber-400' : 'text-violet-400',
                    isMaster && 'text-amber-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]',
                    isMaster && 'animate-float'
                  )}
                >
                  {value}
                </div>

                {/* Label */}
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  {NUMBER_NAMES[key]}
                </div>

                {/* Master Badge */}
                {isMaster && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wide">
                    Master
                  </div>
                )}
              </div>

              {/* Expandable Detail */}
              <div
                id={`numerologia-detail-${key}`}
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  'opacity-0 max-h-0',
                  isExpanded && 'opacity-100 max-h-48 mt-2',
                )}
              >
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand hint */}
      <div className="text-center mt-4">
        <span className="text-xs text-slate-500">Clique nos números para ver a interpretação completa</span>
      </div>
    </div>
  );
}