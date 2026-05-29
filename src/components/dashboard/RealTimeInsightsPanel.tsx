'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Lightbulb, Clock, Eye, Check, ChevronDown, ChevronRight, Zap, Activity, RefreshCw } from 'lucide-react';

export interface RealTimeInsight {
  id: string;
  type: 'spiritual' | 'technical' | 'mixed';
  title: string;
  description: string;
  timestamp: string;
  read?: boolean;
  priority?: 'high' | 'medium' | 'low';
  metrics?: Record<string, number>;
}

interface RealTimeInsightsPanelProps {
  insights?: RealTimeInsight[];
  onInsightClick?: (insight: RealTimeInsight) => void;
  onMarkAsRead?: (id: string) => void;
  onRefresh?: () => void;
  className?: string;
}

// Sample insights
const SAMPLE_INSIGHTS: RealTimeInsight[] = [
  {
    id: 'insight-1',
    type: 'mixed',
    title: 'Padrão de Energia Lunar Detectado',
    description: 'Correlação forte entre fase lunar atual e performance do sistema detectada. Recomenda-se ajuste fino.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    metrics: { lunar: 0.85, performance: 0.78 },
  },
  {
    id: 'insight-2',
    type: 'spiritual',
    title: 'Alinhamento de Chakras Estável',
    description: 'Seus chakras estão bem alinhados, indicando harmonia espiritual e mental.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium',
  },
  {
    id: 'insight-3',
    type: 'technical',
    title: 'Uso de Memória Otimizado',
    description: 'Alocação de memória atual está dentro dos parâmetros ideais para o momento.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
  },
  {
    id: 'insight-4',
    type: 'mixed',
    title: 'Conexão Oxum-Rede Ativa',
    description: 'Energia de Oxum está favorecendo o fluxo de dados na rede. Bom momento para transfers.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
  },
  {
    id: 'insight-5',
    type: 'technical',
    title: 'CPU em Nível Seguro',
    description: 'Temperatura e uso de CPU estão dentro da faixa ideal de operação.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
  },
  {
    id: 'insight-6',
    type: 'spiritual',
    title: 'Orixá Oxalá em Destaque',
    description: 'Oxalá traz paz e harmonia para suas atividades digitais hoje.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium',
  },
  {
    id: 'insight-7',
    type: 'mixed',
    title: 'Elemento Fogo Elevado',
    description: 'Energia do elemento fogo está alta, indicando dinamismo e força.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
  },
  {
    id: 'insight-8',
    type: 'technical',
    title: 'Storage em Níveis Ideais',
    description: 'Utilização de armazenamento está otimizada para o ciclo atual.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
  },
];

export function RealTimeInsightsPanel({
  insights = SAMPLE_INSIGHTS,
  onInsightClick,
  onMarkAsRead,
  onRefresh,
  className = ''
}: RealTimeInsightsPanelProps) {
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    new Set(insights.filter(i => !i.read).map(i => i.id))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const listRef = useRef<HTMLDivElement>(null);
  const prevInsightsLength = useRef(insights.length);

  // Auto-scroll to top when new insights arrive
  useEffect(() => {
    if (insights.length > prevInsightsLength.current) {
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevInsightsLength.current = insights.length;
  }, [insights.length]);

  // Update last update time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle expanded
  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    // Mark as read when expanded
    if (!unreadIds.has(id)) {
      setUnreadIds(prev => new Set(prev).add(id));
      onMarkAsRead?.(id);
    }
  }, [unreadIds, onMarkAsRead]);

  // Handle click
  const handleClick = useCallback((insight: RealTimeInsight) => {
    onInsightClick?.(insight);
    handleToggle(insight.id);
  }, [onInsightClick, handleToggle]);

  // Get type color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'spiritual': return 'bg-violet-500/20 text-violet-400';
      case 'technical': return 'bg-cyan-500/20 text-cyan-400';
      case 'mixed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'spiritual': return '✨';
      case 'technical': return '⚙️';
      case 'mixed': return '🔮';
      default: return '💡';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return 'Agora';
    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    return date.toLocaleTimeString('pt-BR');
  };

  // Get relative time
  const getRelativeTime = (): string => {
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 5) return 'agora';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  // Count unread
  const unreadCount = insights.filter(i => !unreadIds.has(i.id) || !i.read).length;

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">Insights em Tempo Real</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                {unreadCount} novo(s)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs text-slate-500">
                {isLive ? 'Live' : 'Pausado'}
              </span>
            </div>

            {/* Last update */}
            <span className="text-xs text-slate-500">
              {getRelativeTime()}
            </span>

            {/* Refresh button */}
            <button
              onClick={() => {
                setLastUpdate(new Date());
                onRefresh?.();
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Insights list */}
      <div ref={listRef} className="max-h-[400px] overflow-y-auto">
        {insights.map((insight, index) => {
          const isExpanded = expandedId === insight.id;
          const isUnread = !insight.read && unreadIds.has(insight.id);
          const isNew = index < 3 && isUnread;

          return (
            <div
              key={insight.id}
              onClick={() => handleClick(insight)}
              className={`
                p-4 border-b border-slate-800/60 cursor-pointer transition-colors
                ${isExpanded ? 'bg-slate-800/30' : 'hover:bg-slate-800/20'}
                ${isUnread ? 'border-l-2 border-l-amber-500' : ''}
                ${isNew ? 'bg-amber-500/5' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${getTypeColor(insight.type)}`}>
                  {getTypeIcon(insight.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isUnread ? 'text-slate-100' : 'text-slate-300'}`}>
                        {insight.title}
                      </h4>
                      {isNew && (
                        <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                          Novo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(insight.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{insight.description}</p>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {/* Metrics */}
                      {insight.metrics && (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-2">Métricas relacionadas</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(insight.metrics).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-slate-400 capitalize">{key}</span>
                                <span className={`text-sm font-medium ${
                                  value >= 0.8 ? 'text-emerald-400' :
                                  value >= 0.5 ? 'text-amber-400' : 'text-slate-400'
                                }`}>
                                  {Math.round(value * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnreadIds(prev => {
                              const next = new Set(prev);
                              next.add(insight.id);
                              return next;
                            });
                            onMarkAsRead?.(insight.id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Marcar como lido
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show more details
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {insights.length} insight(s)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-2 py-1 rounded ${
              isLive
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isLive ? 'Pausar' : 'Retomar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RealTimeInsightsPanel;