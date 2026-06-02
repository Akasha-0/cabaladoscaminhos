// fallow-ignore-file unused-file
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Check, X, ChevronDown, ChevronRight, RefreshCw, Clock, Zap } from 'lucide-react';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: 'spiritual' | 'technical' | 'mixed';
  actions?: string[];
  timestamp: string;
  metrics?: Record<string, number>;
  insight?: string;
}

interface AIRecommendationsEngineProps {
  recommendations?: AIRecommendation[];
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onLearnMore?: (id: string) => void;
  className?: string;
}

// Sample recommendations
const SAMPLE_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Aumentar frequência de sincronização',
    description: 'Baseado no padrão lunar atual, recomienda-se aumentar a frequência de sincronização para melhor alinhamento energético.',
    confidence: 0.92,
    priority: 'high',
    category: 'mixed',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actions: ['Aplicar', 'Ignorar', 'Mais info'],
    insight: 'Correlação forte detectada entre ciclo lunar e performance',
  },
  {
    id: 'rec-2',
    title: 'Otimizar alocação de memória',
    description: 'O elemento água está em destaque, indicando necessidade de fluxo otimizado na alocação de memória.',
    confidence: 0.87,
    priority: 'high',
    category: 'technical',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    actions: ['Aplicar', 'Ignorar'],
    metrics: { memory: 0.85, optimization: 0.78 },
  },
  {
    id: 'rec-3',
    title: 'Ativar modo de proteção extra',
    description: 'Ogum indica necessidade de proteção adicional para operações críticas.',
    confidence: 0.81,
    priority: 'medium',
    category: 'spiritual',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actions: ['Aplicar', 'Ignorar', 'Agendar'],
  },
  {
    id: 'rec-4',
    title: 'Revisar configuração de rede',
    description: 'Oxalá sugere harmonia na configuração de rede para melhor estabilidade.',
    confidence: 0.75,
    priority: 'medium',
    category: 'spiritual',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    insight: 'Conexão espiritual detectada',
  },
  {
    id: 'rec-5',
    title: 'Ajustar threshold de alertas',
    description: 'Métricas técnicas indicam necessidade de ajuste nos thresholds de alertas.',
    confidence: 0.69,
    priority: 'low',
    category: 'technical',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rec-6',
    title: 'Iniciar ritual de limpeza energética',
    description: 'Sistema indicando acúmulo de energias densas, recomenda-se ritual de limpeza.',
    confidence: 0.95,
    priority: 'high',
    category: 'spiritual',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actions: ['Iniciar', 'Agendar', 'Ignorar'],
    insight: 'Energia acumulada detectada',
  },
];

export function AIRecommendationsEngine({
  recommendations = SAMPLE_RECOMMENDATIONS,
  onApply,
  onDismiss,
  onLearnMore,
  className = ''
}: AIRecommendationsEngineProps) {
  const [filterCategory, setFilterCategory] = useState<'all' | 'spiritual' | 'technical' | 'mixed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
      if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
      return true;
    });
  }, [recommendations, filterCategory, filterPriority]);

  // Sort by priority and timestamp
  const sortedRecommendations = useMemo(() => {
    return [...filteredRecommendations].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [filteredRecommendations]);

  // Toggle expanded
  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spiritual': return '✨';
      case 'technical': return '⚙️';
      case 'mixed': return '🔮';
      default: return '📌';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-emerald-400';
    if (confidence >= 0.7) return 'text-cyan-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-slate-400';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Stats
  const stats = useMemo(() => ({
    total: recommendations.length,
    high: recommendations.filter(r => r.priority === 'high').length,
    medium: recommendations.filter(r => r.priority === 'medium').length,
    low: recommendations.filter(r => r.priority === 'low').length,
    avgConfidence: recommendations.reduce((a, r) => a + r.confidence, 0) / recommendations.length,
  }), [recommendations]);

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-slate-100">Motor de Recomendações AI</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3 h-3" />
            <span>Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800/60 flex items-center gap-4 text-xs">
        <div>
          <span className="text-slate-500">Total:</span>
          <span className="ml-1 text-slate-300 font-medium">{stats.total}</span>
        </div>
        <div>
          <span className="text-slate-500">Alta:</span>
          <span className="ml-1 text-red-400 font-medium">{stats.high}</span>
        </div>
        <div>
          <span className="text-slate-500">Média:</span>
          <span className="ml-1 text-amber-400 font-medium">{stats.medium}</span>
        </div>
        <div className="ml-auto">
          <span className="text-slate-500">Confiança média:</span>
          <span className={`ml-1 font-medium ${getConfidenceColor(stats.avgConfidence)}`}>
            {Math.round(stats.avgConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-slate-800/60 flex items-center gap-2">
        <span className="text-xs text-slate-500">Categoria:</span>
        {['all', 'spiritual', 'technical', 'mixed'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat as any)}
            className={`
              px-2 py-1 text-xs rounded-lg transition-colors capitalize
              ${filterCategory === cat
                ? 'bg-violet-500/20 text-violet-300'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-700 mx-2" />
        <span className="text-xs text-slate-500">Prioridade:</span>
        {['all', 'high', 'medium', 'low'].map(pri => (
          <button
            key={pri}
            onClick={() => setFilterPriority(pri as any)}
            className={`
              px-2 py-1 text-xs rounded-lg transition-colors capitalize
              ${filterPriority === pri
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            {pri === 'all' ? 'Todos' : pri}
          </button>
        ))}
      </div>

      {/* Recommendations list */}
      <div className="max-h-[500px] overflow-y-auto">
// fallow-ignore-next-line complexity
        {sortedRecommendations.map(rec => {
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`
                p-4 border-b border-slate-800/60 transition-colors
                ${isExpanded ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'}
              `}
            >
              {/* Main info */}
              <div className="flex items-start gap-3">
                {/* Category icon */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-lg
                  ${rec.category === 'spiritual' ? 'bg-violet-500/20' : ''}
                  ${rec.category === 'technical' ? 'bg-cyan-500/20' : ''}
                  ${rec.category === 'mixed' ? 'bg-emerald-500/20' : ''}
                `}>
                  {getCategoryIcon(rec.category)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-100">{rec.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full border capitalize
                        ${getPriorityColor(rec.priority)}
                      `}>
                        {rec.priority}
                      </span>
                      <span className={`text-sm font-bold ${getConfidenceColor(rec.confidence)}`}>
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{rec.description}</p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(rec.timestamp)}
                    </span>
                    <span className="capitalize">• {rec.category}</span>
                    {rec.insight && (
                      <span className="text-violet-400">• {rec.insight}</span>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {/* Metrics */}
                      {rec.metrics && (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-2">Métricas relacionadas</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(rec.metrics).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-slate-400 capitalize">{key}</span>
                                <span className={`text-sm font-medium ${getConfidenceColor(value)}`}>
                                  {Math.round(value * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {rec.actions && (
                        <div className="flex gap-2">
                          {rec.actions.map((action, i) => (
                            <button
// fallow-ignore-next-line complexity
                              key={i}
                              onClick={() => {
                                if (action === 'Aplicar' || action === 'Iniciar') onApply?.(rec.id);
                                else if (action === 'Ignorar') onDismiss?.(rec.id);
                                else onLearnMore?.(rec.id);
                              }}
                              className={`
                                flex-1 px-3 py-2 text-sm rounded-lg transition-colors
                                ${action === 'Aplicar' || action === 'Iniciar'
                                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                                  : action === 'Ignorar'
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }
                              `}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand button */}
                <button
                  onClick={() => handleToggle(rec.id)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {sortedRecommendations.length} recomendação(ões)
        </span>
        <button className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Gerar mais
        </button>
      </div>
    </div>
  );
}

export default AIRecommendationsEngine;