'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipInfo } from '@/components/ui/tooltip-info';
import {
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  Loader2,
  Zap,
  Moon,
  Sun,
  Eye,
  Info,
  ArrowRight,
  Lightbulb,
  GitBranch,
  Target,
  ScrollText,
} from 'lucide-react';
import { generateAllPredictions, filterPredictions, getConfidenceLevel, getConfidenceColor, type Prediction, type UserSpiritualData } from '@/lib/predictions/prediction-engine';
import { TYPE_COLORS, TYPE_LABELS, PREDICTION_TYPES, CONFIDENCE_LABELS, PERIOD_OPTIONS, DEFAULT_PERIOD, MIN_PERIOD, MAX_PERIOD, type PredictionType } from '@/lib/predictions/constants';

// Sacred geometry corner decoration
const SacredCornerSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L20 2 L20 5 L5 5 L5 20 L2 20 Z" fill="currentColor" opacity="0.3" />
    <path d="M2 2 Q20 2 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.4" />
  </svg>
);

interface TimelinePoint {
  date: Date;
  predictions: Prediction[];
  intensity: number;
}

interface PredictiveInsightsPanelProps {
  userId: string;
  userData: UserSpiritualData;
  className?: string;
  predictionPeriod?: number;
}

interface EnhancedPrediction extends Prediction {
  whyPrediction: string;
  historicalPattern: string;
  recommendedAction: string;
}

function generateTimelinePoints(predictions: Prediction[], period: number): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  const now = new Date();
  const intervalDays = Math.max(1, Math.floor(period / 10));

  for (let i = 0; i <= period; i += intervalDays) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const pointPredictions = predictions.filter(p => {
      const diffDays = Math.ceil((p.date.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < intervalDays;
    });

    const intensity = pointPredictions.reduce((sum, p) => sum + p.confidence, 0) / Math.max(1, pointPredictions.length);

    points.push({ date, predictions: pointPredictions, intensity: Math.min(100, intensity) });
  }
  return points;
}

function getConfidenceBgColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'bg-emerald-400';
    case 'medium': return 'bg-amber-400';
    case 'low': return 'bg-rose-400';
  }
}

function getImpactBadge(impact: 'low' | 'medium' | 'high'): React.ReactElement {
  switch (impact) {
    case 'high':
      return <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border-rose-500/30">Alto Impacto</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Médio Impacto</Badge>;
    case 'low':
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Baixo Impacto</Badge>;
  }
}

// Loading skeleton
function PredictionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-lg border border-slate-700/30 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded skeleton-spiritual" />
            <div className="h-5 w-16 rounded skeleton-spiritual" />
          </div>
          <div className="h-4 w-3/4 rounded skeleton-spiritual" />
          <div className="h-3 w-full rounded skeleton-spiritual" />
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div className="h-full rounded-full skeleton-spiritual" style={{ width: `${50 + i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PredictiveInsightsPanel({
  userId,
  userData,
  className = '',
  predictionPeriod = DEFAULT_PERIOD,
}: PredictiveInsightsPanelProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<PredictionType[]>(PREDICTION_TYPES);
  const [selectedConfidence, setSelectedConfidence] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState(predictionPeriod);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadPredictions() {
      try {
        const generated = await generateAllPredictions(userData, selectedPeriod, selectedTypes.length > 0 ? selectedTypes : undefined);
        if (!cancelled) {
          setPredictions(generated);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Erro ao gerar previsões. Tente novamente.');
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(loadPredictions, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [userData, selectedPeriod, selectedTypes]);

  const filteredPredictions = useMemo(() => {
    let result = predictions.filter(p => selectedTypes.includes(p.type));
    if (selectedConfidence !== 'all') {
      result = result.filter(p => getConfidenceLevel(p.confidence) === selectedConfidence);
    }
    return result;
  }, [predictions, selectedTypes, selectedConfidence]);

  const timelinePoints = useMemo(() => generateTimelinePoints(filteredPredictions, selectedPeriod), [filteredPredictions, selectedPeriod]);

  const toggleType = useCallback((type: PredictionType) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const refreshPredictions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setExpandedId(null);
    async function loadPredictions() {
      try {
        const generated = await generateAllPredictions(userData, selectedPeriod, selectedTypes.length > 0 ? selectedTypes : undefined);
        setPredictions(generated);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao gerar previsões. Tente novamente.');
        setIsLoading(false);
      }
    }
    const timer = setTimeout(loadPredictions, 500);
    return () => clearTimeout(timer);
  }, [userData, selectedPeriod, selectedTypes]);

  const formatDate = (date: Date): string => date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  const scrollTimeline = useCallback((direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  if (error) {
    return (
      <Card className={cn('card-spiritual border-rose-500/30', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={refreshPredictions}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weekMarkers = useMemo(() => {
    const markers = [];
    const now = new Date();
    for (let week = 0; week <= Math.ceil(selectedPeriod / 7); week++) {
      const date = new Date(now);
      date.setDate(date.getDate() + week * 7);
      markers.push({ week, date, label: `Sem ${week + 1}` });
    }
    return markers;
  }, [selectedPeriod]);

  return (
    <Card className={cn('card-spiritual relative overflow-hidden', className)}>
      {/* Sacred corner decorations */}
      <SacredCornerSVG className="sacred-corner sacred-corner-tl text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-tr text-violet-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-bl text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-br text-violet-500 hidden md:block" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-amber-100">Previsões Espirituais AI</CardTitle>
              <p className="text-sm text-amber-200/60">
                Próximos {selectedPeriod} dias • {filteredPredictions.length} previsões
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-amber-950/50 rounded-lg p-1">
              <Button
                variant="ghost" size="sm"
                onClick={() => setViewMode('cards')}
                className={viewMode === 'cards' ? 'bg-amber-500/20 text-amber-300' : 'text-amber-200/60'}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => setViewMode('timeline')}
                className={viewMode === 'timeline' ? 'bg-amber-500/20 text-amber-300' : 'text-amber-200/60'}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={refreshPredictions} disabled={isLoading} className="text-amber-200/60 hover:text-amber-300">
              <Sparkles className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-200/60 text-sm">
            <Clock className="h-4 w-4" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-amber-950/50 text-amber-200 border border-amber-500/30 rounded px-2 py-1 text-sm"
            >
              {PERIOD_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-amber-200/60 text-sm">
            <Star className="h-3 w-3" />
            <span>Confiança:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(level => (
              <Button
                key={level}
                variant="ghost" size="sm"
                onClick={() => setSelectedConfidence(level)}
                className={cn(
                  'text-xs px-2 py-0.5 h-auto transition-all',
                  selectedConfidence === level ? 'bg-amber-500/30 text-amber-200' : 'text-amber-200/40 hover:text-amber-300'
                )}
              >
                {level === 'all' ? 'Todas' : CONFIDENCE_LABELS[level]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1 text-amber-200/60 text-sm">
            <Filter className="h-3 w-3" />
            <span>Sistemas:</span>
          </div>
          {PREDICTION_TYPES.map(type => {
            const isActive = selectedTypes.includes(type);
            const colors = TYPE_COLORS[type];
            return (
              <Button
                key={type} variant="ghost" size="sm"
                onClick={() => toggleType(type)}
                className={cn('text-xs px-2 py-1 h-auto transition-all', isActive ? colors.bg + ' ' + colors.primary : 'text-amber-200/40')}
              >
                {TYPE_LABELS[type]}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {isLoading ? (
          <PredictionsSkeleton />
        ) : viewMode === 'cards' ? (
          <div className="space-y-3">
            {filteredPredictions.length === 0 ? (
              <div className="text-center py-8 text-amber-200/60">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma previsão para os filtros selecionados.</p>
              </div>
            ) : (
              filteredPredictions.map(prediction => {
                const colors = TYPE_COLORS[prediction.type];
                const isExpanded = expandedId === prediction.id;
                const confidenceLevel = getConfidenceLevel(prediction.confidence);
                const confidenceColor = getConfidenceColor(confidenceLevel);
                const confidenceBgColor = getConfidenceBgColor(confidenceLevel);

                return (
                  <div key={prediction.id} className={cn(
                    'rounded-lg border transition-all duration-200',
                    colors.border, colors.bg,
                    isExpanded && 'ring-1 ring-amber-500/40'
                  )}>
                    <button onClick={() => toggleExpand(prediction.id)} className="w-full p-4 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn('text-xs', colors.bg, colors.primary, 'border-0')}>{TYPE_LABELS[prediction.type]}</Badge>
                            {getImpactBadge(prediction.impact)}
                            <span className={cn('text-xs', confidenceColor)}>
                              {confidenceLevel === 'high' ? '★★★' : confidenceLevel === 'medium' ? '★★' : '★'} {prediction.confidence}%
                            </span>
                          </div>
                          <h4 className="font-medium text-amber-100 truncate">{prediction.title}</h4>
                          <p className="text-sm text-amber-200/60 line-clamp-2">{prediction.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-xs text-amber-200/60">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(prediction.date)}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-amber-400" /> : <ChevronDown className="h-4 w-4 text-amber-400" />}
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-amber-950/50 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', confidenceBgColor)} style={{ width: `${prediction.confidence}%` }} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-4">
                        <div className="h-px bg-amber-500/20" />
                        <div>
                          <h5 className="text-sm font-medium text-amber-200 mb-2 flex items-center gap-2">
                            <ScrollText className="h-3 w-3" />Interpretação Detalhada
                          </h5>
                          <p className="text-sm text-amber-100/80 leading-relaxed">{prediction.detailedExplanation || prediction.description}</p>
                        </div>
                        <div className="grid gap-3">
                          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-500/20">
                            <h6 className="text-xs font-medium text-amber-300 mb-1 flex items-center gap-1.5">
                              <Lightbulb className="h-3 w-3" />Por Que Esta Predição
                            </h6>
                            <p className="text-xs text-amber-100/70">{prediction.whyPrediction}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-500/20">
                            <h6 className="text-xs font-medium text-amber-300 mb-1 flex items-center gap-1.5">
                              <GitBranch className="h-3 w-3" />Padrão Histórico
                            </h6>
                            <p className="text-xs text-amber-100/70">{prediction.historicalPattern}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                            <h6 className="text-xs font-medium text-emerald-400 mb-1 flex items-center gap-1.5">
                              <Target className="h-3 w-3" />Ação Recomendada
                            </h6>
                            <p className="text-xs text-emerald-100/70">{prediction.recommendedAction}</p>
                          </div>
                        </div>
                        {prediction.optimalTime && (
                          <div className="flex items-center gap-2 text-sm text-amber-200/80">
                            <Clock className="h-4 w-4 text-amber-400" />
                            <span>Momento ideal: <strong className="text-amber-200">{prediction.optimalTime}</strong></span>
                          </div>
                        )}
                        <div>
                          <h5 className="text-sm font-medium text-amber-200 mb-2 flex items-center gap-2">
                            <Zap className="h-3 w-3" />Recomendações
                          </h5>
                          <ul className="space-y-1">
                            {prediction.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-amber-100/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                          <div className={cn('flex items-center gap-1 text-xs', confidenceColor)}>
                            <Star className="h-3 w-3" />
                            <span>Confiança: {prediction.confidence}%</span>
                            <span className="text-amber-200/40">({CONFIDENCE_LABELS[confidenceLevel]})</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs text-amber-300 hover:text-amber-200">
                            Conectar ao sistema <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-amber-200/60">
                <span>Período:</span>
                {weekMarkers.map((marker, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-900/30 text-xs">{marker.label}</span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => scrollTimeline('left')} className="h-7 w-7 p-0 text-amber-300">
                  <ChevronUp className="h-4 w-4 rotate-90" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => scrollTimeline('right')} className="h-7 w-7 p-0 text-amber-300">
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
              </div>
            </div>
            <div
              ref={timelineRef}
              className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-amber-950/20"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="flex gap-3 min-w-max px-1">
                {timelinePoints.map((point, idx) => {
                  const hasPredictions = point.predictions.length > 0;
                  const isToday = idx === 0;
                  return (
                    <div key={idx} className="flex flex-col items-center w-32 flex-shrink-0">
                      <div className="text-xs text-amber-200/60 mb-2">{formatDate(point.date)}</div>
                      <div className="relative w-full h-24 flex flex-col items-center">
                        <div
                          className={cn(
                            'absolute top-6 w-full rounded-lg border transition-all',
                            hasPredictions ? 'bg-gradient-to-b from-amber-900/40 to-amber-950/60 border-amber-500/30' : 'bg-amber-950/30 border-amber-700/20'
                          )}
                          style={{ height: `${Math.max(20, point.intensity)}%` }}
                        >
                          {hasPredictions && (
                            <div className="absolute inset-x-0 top-1 flex justify-center gap-0.5 flex-wrap">
                              {point.predictions.slice(0, 3).map((pred, pIdx) => {
                                const pColors = TYPE_COLORS[pred.type];
                                return (
                                  <div key={pIdx} className={cn('w-2 h-2 rounded-full', pColors.primary.replace('text-', 'bg-'))} title={pred.title} />
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div
                          className={cn(
                            'absolute -top-1 w-3 h-3 rounded-full border-2',
                            isToday ? 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/50' :
                            hasPredictions ? 'bg-amber-500 border-amber-400' : 'bg-amber-950 border-amber-700'
                          )}
                        />
                      </div>
                      {hasPredictions && (
                        <div className="mt-2 text-xs text-amber-200/60">
                          {point.predictions.length} {point.predictions.length === 1 ? 'evento' : 'eventos'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-amber-950/80 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-950/80 to-transparent pointer-events-none" />
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-amber-500/20">
              <div className="flex items-center gap-2 text-xs text-amber-200/60">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-amber-900/60 to-amber-950/80 border border-amber-500/30" />
                <span>Com eventos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-200/60">
                <div className="w-4 h-4 rounded bg-amber-950/30 border border-amber-700/20" />
                <span>Sem eventos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-200/60">
                <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-amber-300" />
                <span>Hoje</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {filteredPredictions.slice(0, 4).map(pred => {
                const colors = TYPE_COLORS[pred.type];
                return (
                  <div key={pred.id} className={cn('p-2 rounded', colors.bg, 'border', colors.border)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('text-xs font-medium', colors.primary)}>{TYPE_LABELS[pred.type]}</span>
                      <span className={cn('text-xs', getConfidenceColor(getConfidenceLevel(pred.confidence))))}>{pred.confidence}%</span>
                    </div>
                    <p className="text-xs text-amber-100/80 line-clamp-1">{pred.title}</p>
                    <p className="text-xs text-amber-200/50 mt-1">{formatDate(pred.date)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && filteredPredictions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <TooltipInfo titulo="Total de Previsões" descricao="Total de previsões no período">
                  <div className="flex items-center gap-1.5 text-amber-200/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{filteredPredictions.length} previsões</span>
                  </div>
                </TooltipInfo>
                <TooltipInfo titulo="Alta Confiança" descricao="Previsões de alta confiança">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{filteredPredictions.filter(p => p.confidence >= 80).length} alta confiança</span>
                  </div>
                </TooltipInfo>
                <TooltipInfo titulo="Período Selecionado" descricao="Dias para análise">
                  <div className="flex items-center gap-1.5 text-amber-200/60">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{selectedPeriod} dias</span>
                  </div>
                </TooltipInfo>
              </div>
              <div className="flex items-center gap-1.5 text-amber-200/60">
                {userData.caminho && (
                  <Badge variant="outline" className="text-xs border-amber-500/30">
                    {userData.caminho.replace(/-/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PredictiveInsightsPanel;
