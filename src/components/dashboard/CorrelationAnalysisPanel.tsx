// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity,
  Link2,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Circle,
  Gauge,
  Heart,
  Star,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface CorrelationAnalysisPanelProps {
  correlations?: Correlation[];
  className?: string;
  onCorrelationClick?: (correlation: Correlation) => void;
  userData?: {
    odu?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
    sign?: string;
  };
}

export interface Correlation {
  id: string;
  source: string;
  target: string;
  strength: number;
  description: string;
  insight: string;
  type: 'numerology_astrology' | 'ifa_cabala' | 'orixa_chakra' | 'element_planetary' | 'archetype_destination';
  confirmed: boolean;
}

export interface CrossSystemInsight {
  id: string;
  title: string;
  description: string;
  systems: string[];
  strength: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const SYSTEM_PAIRS = [
  { source: 'Numerologia', target: 'Astrologia', color: 'text-blue-400' },
  { source: 'Ifá/Odu', target: 'Cabala', color: 'text-amber-400' },
  { source: 'Candomblé', target: 'Tarot', color: 'text-purple-400' },
  { source: 'Chakras', target: 'Elementos', color: 'text-emerald-400' },
];

const DEFAULT_CORRELATIONS: Correlation[] = [
  {
    id: '1',
    source: 'Numerologia',
    target: 'Astrologia',
    strength: 0.85,
    description: 'Seu número pessoal 7 harmoniza com a posição de Netuno em seu mapa.',
    insight: 'Esta conexão indica forte capacidade intuitiva e propensão a experiências espirituais profundas.',
    type: 'numerology_astrology',
    confirmed: true,
  },
  {
    id: '2',
    source: 'Ifá/Odu',
    target: 'Cabala',
    strength: 0.78,
    description: 'Odu Ogbe refleja conexão com as primeiras sefirot do árvore da vida.',
    insight: 'Seus arcos pessoais ressoam com os caminhos cabalísticos de Chokhmah (Sabedoria).',
    type: 'ifa_cabala',
    confirmed: true,
  },
  {
    id: '3',
    source: 'Orixá Regente',
    target: 'Chakras',
    strength: 0.92,
    description: 'Oxum governa o chakra do coração, explicando sua alta sensibilidade emocional.',
    insight: 'Sua jornada espiritual passa pela harmonização emocional e autoamor.',
    type: 'orixa_chakra',
    confirmed: true,
  },
  {
    id: '4',
    source: 'Elementos',
    target: 'Planetário',
    strength: 0.65,
    description: 'Elemento Água domina seu mapa, harmonizando com posições de Lua e Netuno.',
    insight: 'A energia lunar influencia seus ciclos de prática espiritual.',
    type: 'element_planetary',
    confirmed: false,
  },
  {
    id: '5',
    source: 'Arquetipo',
    target: 'Destino',
    strength: 0.81,
    description: 'O arquétipo do Curador ressoa com seu número de destino 5.',
    insight: 'Sua missão espiritual envolve cura e transformação de outros.',
    type: 'archetype_destination',
    confirmed: true,
  },
];

const CROSS_SYSTEM_INSIGHTS: CrossSystemInsight[] = [
  {
    id: '1',
    title: 'Tríade Espiritual',
    description: 'Numerologia, Astrologia e Ifá convergem para revelar seu caminho de iluminação.',
    systems: ['Numerologia', 'Astrologia', 'Ifá/Odu'],
    strength: 0.88,
  },
  {
    id: '2',
    title: 'Ponte Ancestral',
    description: 'Conexão entre tradição Ifá e Cabala indica missão de unir sabedoria antiga.',
    systems: ['Ifá/Odu', 'Cabala'],
    strength: 0.75,
  },
  {
    id: '3',
    title: 'Alinhamento Energético',
    description: 'Orixá, elementos e chakras em perfeita harmonia para práticas ascensionais.',
    systems: ['Candomblé', 'Elementos', 'Chakras'],
    strength: 0.82,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getCorrelationColor(strength: number): string {
  if (strength >= 0.8) return 'text-emerald-400';
  if (strength >= 0.6) return 'text-amber-400';
  return 'text-slate-400';
}

function getStrengthBg(strength: number): string {
  if (strength >= 0.8) return 'bg-emerald-500/20';
  if (strength >= 0.6) return 'bg-amber-500/20';
  return 'bg-slate-700/50';
}

function getTypeLabel(type: Correlation['type']): string {
  const labels: Record<Correlation['type'], string> = {
    'numerology_astrology': 'Num-Astro',
    'ifa_cabala': 'Ifá-Cabala',
    'orixa_chakra': 'Orixá-Chakra',
    'element_planetary': 'Elem-Planet',
    'archetype_destination': 'Arq-Dest',
  };
  return labels[type];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface CorrelationLineProps {
  correlation: Correlation;
  onClick?: () => void;
  isExpanded?: boolean;
}

function CorrelationLine({ correlation, onClick, isExpanded }: CorrelationLineProps) {
  const colors = getCorrelationColor(correlation.strength);
  const strengthBg = getStrengthBg(correlation.strength);
  
  return (
    <div
      className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:border-slate-500/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-sm font-medium">{correlation.source}</span>
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400 text-sm font-medium">{correlation.target}</span>
          </div>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            correlation.confirmed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          )}>
            {correlation.confirmed ? 'Confirmado' : 'Sugerido'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{getTypeLabel(correlation.type)}</span>
          <div className={cn('px-3 py-1 rounded-full', strengthBg)}>
            <span className={cn('font-bold text-sm', colors)}>
              {Math.round(correlation.strength * 100)}%
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-600/30 space-y-3">
          <div>
            <p className="text-slate-400 text-sm">{correlation.description}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-purple-300 text-sm flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {correlation.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface InsightCardProps {
  insight: CrossSystemInsight;
  onClick?: () => void;
}

function InsightCard({ insight, onClick }: InsightCardProps) {
  const strengthColor = getCorrelationColor(insight.strength);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm mb-1">{insight.title}</h4>
          <p className="text-slate-400 text-xs">{insight.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {insight.systems.map(system => (
              <span key={system} className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                {system}
              </span>
            ))}
          </div>
        </div>
        <div className={cn('text-right', strengthColor)}>
          <span className="text-lg font-bold">{Math.round(insight.strength * 100)}%</span>
          <p className="text-xs text-slate-500">Força</p>
        </div>
      </div>
    </button>
  );
}

interface SystemConnectionProps {
  source: string;
  target: string;
  strength: number;
  color: string;
}

function SystemConnection({ source, target, strength, color }: SystemConnectionProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
      <div className={cn('p-2 rounded-lg bg-slate-800/50', color)}>
        <Activity className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1 text-sm">
          <span className="text-slate-300">{source}</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-slate-300">{target}</span>
        </div>
      </div>
      <div className={cn('text-right', getCorrelationColor(strength))}>
        <span className="text-sm font-bold">{Math.round(strength * 100)}%</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function CorrelationAnalysisPanel({
  correlations = DEFAULT_CORRELATIONS,
  className = '',
  onCorrelationClick,
  userData,
}: CorrelationAnalysisPanelProps) {
  const [expandedCorrelation, setExpandedCorrelation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'insights'>('list');

  const sortedCorrelations = useMemo(() => {
    return [...correlations].sort((a, b) => b.strength - a.strength);
  }, [correlations]);

  const confirmedCount = correlations.filter(c => c.confirmed).length;
  const averageStrength = correlations.length > 0
    ? correlations.reduce((acc, c) => acc + c.strength, 0) / correlations.length
    : 0;

  const handleCorrelationClick = (correlation: Correlation) => {
    setExpandedCorrelation(expandedCorrelation === correlation.id ? null : correlation.id);
    onCorrelationClick?.(correlation);
  };

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Análise de Correlações</h3>
              <p className="text-slate-400 text-xs">
                {userData?.orixaRegente 
                  ? `Conexões espirituais de ${userData.orixaRegente}` 
                  : 'Mapeamento de sistemas'}
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-400">{confirmedCount}/{correlations.length}</p>
              <p className="text-slate-500 text-xs">Confirmadas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-400">{Math.round(averageStrength * 100)}%</p>
              <p className="text-slate-500 text-xs">Força Média</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg transition-colors',
              viewMode === 'list' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            )}
          >
            Correlações
          </button>
          <button
            onClick={() => setViewMode('insights')}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg transition-colors',
              viewMode === 'insights' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            )}
          >
            Insights Cruzados
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
        {viewMode === 'list' ? (
          <>
            {/* System Connections */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-slate-400 mb-2">Conexões de Sistemas</h4>
              <div className="space-y-2">
                {SYSTEM_PAIRS.map((pair, index) => {
                  const correlation = correlations.find(
                    c => (c.source === pair.source && c.target === pair.target) ||
                         (c.source === pair.target && c.target === pair.source)
                  );
                  return (
                    <SystemConnection
                      key={index}
                      source={pair.source}
                      target={pair.target}
                      strength={correlation?.strength || 0.5}
                      color={pair.color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Correlations List */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate-400">Todas as Correlações</h4>
              {sortedCorrelations.map(correlation => (
                <CorrelationLine
                  key={correlation.id}
                  correlation={correlation}
                  isExpanded={expandedCorrelation === correlation.id}
                  onClick={() => handleCorrelationClick(correlation)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate-400 mb-2">Insights entre Sistemas</h4>
              {CROSS_SYSTEM_INSIGHTS.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-xs">
            Análise baseada em {correlations.length} correlações identificadas
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Gauge className="w-3 h-3" />
            <span>Auto-atualizado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CorrelationAnalysisPanel;