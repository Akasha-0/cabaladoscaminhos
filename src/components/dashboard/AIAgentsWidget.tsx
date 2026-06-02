// fallow-ignore-file unused-file
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, TrendingUp, Eye, Zap, ChevronRight, RefreshCw, Loader2, Star, Heart, Flame, Droplets, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AIAgentsWidgetProps {
  className?: string;
  userData?: {
    nome?: string;
    orixaRegente?: string;
    odu?: string;
    numeroPessoal?: number;
  };
}

interface Insight {
  id: string;
  type: 'daily' | 'correlation' | 'prediction' | 'guidance';
  title: string;
  content: string;
  confidence: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const INSIGHT_TYPES = {
  daily: { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  correlation: { icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
  prediction: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  guidance: { icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
};

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'daily',
    title: 'Alinhamento Planetário',
    content: 'O alinhamento entre seu orixá regente (Oxum) e o planeta Vênus indica um dia favorável para práticas de amor-próprio e auto-cuidado.',
    confidence: 92,
    icon: Droplets as React.ComponentType<{ className?: string }>,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
  },
  {
    id: '2',
    type: 'correlation',
    title: 'Padrão Numerológico',
    content: 'Seu número pessoal (7) ressoa com a energia da Lua nesta semana, amplificando sua intuição e capacidade de洞察.',
    confidence: 87,
    icon: Brain as React.ComponentType<{ className?: string }>,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20',
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Oportunidade de Crescimento',
    content: 'Nas próximas 48 horas, você terá maior receptividade para meditação e práticas ascensionais. Aproveite!',
    confidence: 78,
    icon: TrendingUp as React.ComponentType<{ className?: string }>,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
  },
  {
    id: '4',
    type: 'guidance',
    title: 'Mensagem do Odú',
    content: 'Alafia - A cura está presente. Permita-se receber as bênçãos que o universo oferece hoje.',
    confidence: 95,
    icon: Sparkles as React.ComponentType<{ className?: string }>,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
  },
];

const SYSTEM_CORRELATIONS = [
  { system: 'Numerologia', strength: 92, color: 'bg-amber-500' },
  { system: 'Astrologia', strength: 85, color: 'bg-violet-500' },
  { system: 'Odú/Ifá', strength: 88, color: 'bg-emerald-500' },
  { system: 'Cabala', strength: 76, color: 'bg-cyan-500' },
  { system: 'Tarot', strength: 82, color: 'bg-pink-500' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getInsightIcon(type: Insight['type']) {
  const icons = {
    daily: <Droplets className="w-5 h-5" />,
    correlation: <Brain className="w-5 h-5" />,
    prediction: <TrendingUp className="w-5 h-5" />,
    guidance: <Sparkles className="w-5 h-5" />,
  };
  return icons[type];
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'text-emerald-400';
  if (confidence >= 75) return 'text-amber-400';
  return 'text-slate-400';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function AIAgentsWidget({ className, userData }: AIAgentsWidgetProps) {
  const [insights, setInsights] = useState<Insight[]>(SAMPLE_INSIGHTS);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'correlations'>('insights');

  const handleRefresh = () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const averageConfidence = Math.round(
    insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length
  );

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Agentes IA
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              averageConfidence >= 85 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            )}>
              {averageConfidence}% acurácia
            </span>
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-violet-400 hover:bg-slate-700/50 transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'insights'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            )}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('correlations')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === 'correlations'
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            )}
          >
            Correlações
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {activeTab === 'insights' ? (
          <>
            {/* Selected insight detail */}
            {selectedInsight ? (
              <div className={cn(
                'p-4 rounded-xl border animate-fade-in',
                selectedInsight.bg,
                'border-slate-700/30'
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('p-2 rounded-lg bg-slate-900/50', selectedInsight.color)}>
                    {getInsightIcon(selectedInsight.type)}
                  </div>
                  <div>
                    <h4 className={cn('font-medium', selectedInsight.color)}>{selectedInsight.title}</h4>
                    <span className="text-xs text-slate-400">{selectedInsight.type}</span>
                  </div>
                  <div className={cn('ml-auto text-xs font-medium', getConfidenceColor(selectedInsight.confidence))}>
                    {selectedInsight.confidence}%
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedInsight.content}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-400">Clique em um insight para ver detalhes</p>
              </div>
            )}

            {/* Insights list */}
            <div className="space-y-2">
              {insights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => setSelectedInsight(insight)}
                  className={cn(
                    'w-full p-3 rounded-xl border transition-all text-left',
                    insight.bg,
                    'border-slate-700/30',
                    selectedInsight?.id === insight.id ? 'border-violet-500/50 ring-1 ring-violet-500/30' : 'hover:border-slate-600/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg bg-slate-900/50', insight.color)}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', insight.color)}>{insight.title}</p>
                      <p className="text-xs text-slate-400 truncate">{insight.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-medium', getConfidenceColor(insight.confidence))}>
                        {insight.confidence}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Correlation visualization */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30">
              <p className="text-sm text-slate-400 mb-3">Força das Correlações com seu Mapa</p>
              <div className="space-y-3">
                {SYSTEM_CORRELATIONS.map((corr) => (
                  <div key={corr.system} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 truncate">{corr.system}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all duration-500', corr.color)}
                        style={{ width: `${corr.strength}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{corr.strength}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Processing indicator */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-violet-400 animate-pulse" />
                <span className="text-sm text-violet-400 font-medium">Análise em Andamento</span>
              </div>
              <p className="text-xs text-slate-400">
                Processando correlações entre 12 sistemas espirituais...
              </p>
              <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>
          </>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" /> 4 modelos
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 12 sistemas
            </span>
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            Ver mais <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </Card>
  );
}

export default AIAgentsWidget;