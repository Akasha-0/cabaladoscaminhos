'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  GitBranch,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  ChevronRight,
  Target,
  Zap,
  Scale,
} from 'lucide-react';
import { DeepCorrelationEngine, type SpiritualCorrelation, type CrossSystemPattern } from '@/lib/ai/deep-correlation-engine';
import { patternRecognizer, type ArchetypePattern } from '@/lib/ai/pattern-recognizer';
import type { UserSpiritualData } from '@/lib/ai/types';

interface CorrelationPredictionsWidgetProps {
  userData: UserSpiritualData;
  className?: string;
}

interface SpiritualPrediction {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  confidence: number;
  systems: string[];
  recommendation: string;
  archetype?: ArchetypePattern;
}

const SYSTEM_COLORS: Record<string, { bg: string; border: string; primary: string }> = {
  kabbalah: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', primary: 'text-violet-400' },
  ifa: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', primary: 'text-amber-400' },
  candomble: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', primary: 'text-emerald-400' },
  tarot: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', primary: 'text-rose-400' },
  astrology: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', primary: 'text-blue-400' },
  numerology: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', primary: 'text-cyan-400' },
};

function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 75) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

function getConfidenceColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-rose-400';
  }
}

function getConfidenceBg(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'bg-emerald-400';
    case 'medium': return 'bg-amber-400';
    case 'low': return 'bg-rose-400';
  }
}

// Skeleton loading
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

export function CorrelationPredictionsWidget({ userData, className = '' }: CorrelationPredictionsWidgetProps) {
  const [predictions, setPredictions] = useState<SpiritualPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const correlationEngine = useMemo(() => new DeepCorrelationEngine(), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadPredictions() {
      try {
        // Get correlations from DeepCorrelationEngine
        const correlations = correlationEngine.analyzeCorrelations(userData);
        const crossPatterns = correlationEngine.findCrossSystemPatterns(userData);
        const energyHarmony = correlationEngine.calculateEnergyHarmony(userData);

        // Get archetype patterns from PatternRecognizer
        const archetypes = patternRecognizer.recognizeArchetypePatterns(userData);

        // Build predictions from correlations and patterns
        const generatedPredictions: SpiritualPrediction[] = [];

        // 1. Top correlation-based predictions
        const topCorrelations = correlations.slice(0, 2);
        for (const corr of topCorrelations) {
          const strength = Math.round(corr.correlation * 100);
          generatedPredictions.push({
            id: `corr_${corr.source}_${corr.target}`,
            icon: <GitBranch className="h-5 w-5" />,
            title: `Conexão ${corr.source.charAt(0).toUpperCase() + corr.source.slice(1)}-${corr.target.split('_')[0]}`,
            description: `Energia compartilhada: ${corr.shared_energy}. Esta correlação indica um fluxo harmonioso entre sistemas.`,
            confidence: strength,
            systems: [corr.source, corr.target],
            recommendation: `Fortaleça esta conexão através de práticas que integrem ${corr.source} e ${corr.target}.`,
          });
        }

        // 2. Cross-system pattern predictions
        const topPatterns = crossPatterns.slice(0, 2);
        for (const pattern of topPatterns) {
          const strength = Math.round(pattern.strength * 100);
          generatedPredictions.push({
            id: `pattern_${pattern.name.replace(/\s+/g, '_')}`,
            icon: <Lightbulb className="h-5 w-5" />,
            title: `Padrão: ${pattern.name}`,
            description: pattern.description,
            confidence: strength,
            systems: pattern.involved_systems,
            recommendation: pattern.manifestations[0] || 'Continue explorando este padrão em sua jornada.',
          });
        }

        // 3. Archetype-based prediction
        if (archetypes.length > 0) {
          const dominantArchetype = archetypes[0];
          generatedPredictions.push({
            id: `archetype_${dominantArchetype.id}`,
            icon: <Sparkles className="h-5 w-5" />,
            title: `Arquetipo Dominante: ${dominantArchetype.name}`,
            description: `Energia signature: ${dominantArchetype.energy_signature}. Áreas de crescimento: ${dominantArchetype.growth_areas.join(', ')}.`,
            confidence: 72,
            systems: dominantArchetype.traditions as string[],
            recommendation: 'Trabalhe com este arquetipo através das práticas de cada tradição.',
            archetype: dominantArchetype,
          });
        }

        // 4. Energy harmony prediction
        const harmonyScore = Math.round(energyHarmony.overall_score * 100);
        if (energyHarmony.dominant_energy) {
          generatedPredictions.push({
            id: 'energy_harmony',
            icon: <Scale className="h-5 w-5" />,
            title: 'Harmonia Energética Sistêmica',
            description: `Energia dominante: ${energyHarmony.dominant_energy}. Score de harmonia: ${harmonyScore}%. ${energyHarmony.balance_indicators.harmonious.length} sistemas harmoniosos, ${energyHarmony.balance_indicators.conflicting.length} em conflito.`,
            confidence: harmonyScore,
            systems: Object.keys(energyHarmony.system_harmonies),
            recommendation: energyHarmony.recommendations[0] || 'Continue buscando equilíbrio entre os sistemas.',
          });
        }

        if (!cancelled) {
          // Deduplicate predictions by title before setting state
          const seen = new Set<string>();
          const uniquePredictions = generatedPredictions.slice(0, 5).filter(p => {
            if (seen.has(p.title)) return false;
            seen.add(p.title);
            return true;
          });
          setPredictions(uniquePredictions);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Erro ao gerar correlações. Tente novamente.');
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(loadPredictions, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [userData, correlationEngine]);

  const refreshPredictions = () => {
    setIsLoading(true);
    setError(null);
    setExpandedId(null);
    // Trigger reload by updating state
    setPredictions([]);
    setTimeout(() => {
      const correlations = correlationEngine.analyzeCorrelations(userData);
      const crossPatterns = correlationEngine.findCrossSystemPatterns(userData);
      const energyHarmony = correlationEngine.calculateEnergyHarmony(userData);
      const archetypes = patternRecognizer.recognizeArchetypePatterns(userData);

      const generatedPredictions: SpiritualPrediction[] = [];

      const topCorrelations = correlations.slice(0, 2);
      for (const corr of topCorrelations) {
        const strength = Math.round(corr.correlation * 100);
        generatedPredictions.push({
          id: `corr_${corr.source}_${corr.target}_${Date.now()}`,
          icon: <GitBranch className="h-5 w-5" />,
          title: `Conexão ${corr.source.charAt(0).toUpperCase() + corr.source.slice(1)}-${corr.target.split('_')[0]}`,
          description: `Energia compartilhada: ${corr.shared_energy}. Esta correlação indica um fluxo harmonioso entre sistemas.`,
          confidence: strength,
          systems: [corr.source, corr.target],
          recommendation: `Fortaleça esta conexão através de práticas que integrem ${corr.source} e ${corr.target}.`,
        });
      }

      const topPatterns = crossPatterns.slice(0, 2);
      for (const pattern of topPatterns) {
        const strength = Math.round(pattern.strength * 100);
        generatedPredictions.push({
          id: `pattern_${pattern.name.replace(/\s+/g, '_')}_${Date.now()}`,
          icon: <Lightbulb className="h-5 w-5" />,
          title: `Padrão: ${pattern.name}`,
          description: pattern.description,
          confidence: strength,
          systems: pattern.involved_systems,
          recommendation: pattern.manifestations[0] || 'Continue explorando este padrão em sua jornada.',
        });
      }

      if (archetypes.length > 0) {
        const dominantArchetype = archetypes[0];
        generatedPredictions.push({
          id: `archetype_${dominantArchetype.id}_${Date.now()}`,
          icon: <Sparkles className="h-5 w-5" />,
          title: `Arquetipo Dominante: ${dominantArchetype.name}`,
          description: `Energia signature: ${dominantArchetype.energy_signature}. Áreas de crescimento: ${dominantArchetype.growth_areas.join(', ')}.`,
          confidence: 72,
          systems: dominantArchetype.traditions as string[],
          recommendation: 'Trabalhe com este arquetipo através das práticas de cada tradição.',
          archetype: dominantArchetype,
        });
      }

      const harmonyScore = Math.round(energyHarmony.overall_score * 100);
      if (energyHarmony.dominant_energy) {
        generatedPredictions.push({
          id: `energy_harmony_${Date.now()}`,
          icon: <Scale className="h-5 w-5" />,
          title: 'Harmonia Energética Sistêmica',
          description: `Energia dominante: ${energyHarmony.dominant_energy}. Score de harmonia: ${harmonyScore}%. ${energyHarmony.balance_indicators.harmonious.length} sistemas harmoniosos, ${energyHarmony.balance_indicators.conflicting.length} em conflito.`,
          confidence: harmonyScore,
          systems: Object.keys(energyHarmony.system_harmonies),
          recommendation: energyHarmony.recommendations[0] || 'Continue buscando equilíbrio entre os sistemas.',
        });
      }

      // Deduplicate predictions by title
      const seen = new Set<string>();
      const uniquePredictions = generatedPredictions.slice(0, 5).filter(p => {
        if (seen.has(p.title)) return false;
        seen.add(p.title);
        return true;
      });
      setPredictions(uniquePredictions);
      setIsLoading(false);
    }, 600);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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

  return (
    <Card className={cn('card-spiritual relative overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-violet-100">Correlações Espirituais</CardTitle>
              <p className="text-sm text-violet-200/60">
                Padrões e conexões únicos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPredictions}
              disabled={isLoading}
              className="text-violet-200/60 hover:text-violet-300"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <PredictionsSkeleton />
        ) : (
          <div className="space-y-3">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-violet-200/60">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma correlação encontrada.</p>
              </div>
            ) : (
              predictions.map(prediction => {
                const isExpanded = expandedId === prediction.id;
                const confidenceLevel = getConfidenceLevel(prediction.confidence);
                const confidenceColor = getConfidenceColor(confidenceLevel);
                const confidenceBg = getConfidenceBg(confidenceLevel);

                return (
                  <div
                    key={prediction.id}
                    className={cn(
                      'rounded-lg border transition-all duration-200',
                      'bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-violet-500/20',
                      isExpanded && 'ring-1 ring-violet-500/40'
                    )}
                  >
                    <button
                      onClick={() => toggleExpand(prediction.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-xs bg-violet-500/10 text-violet-300 border-violet-500/30"
                            >
                              {prediction.icon}
                              <span className="ml-1">{prediction.title.split(':')[0]}</span>
                            </Badge>
                            <span className={cn('text-xs font-medium', confidenceColor)}>
                              {confidenceLevel === 'high' ? '★★★' : confidenceLevel === 'medium' ? '★★' : '★'} {prediction.confidence}%
                            </span>
                          </div>
                          <h4 className="font-medium text-violet-100 truncate">{prediction.title}</h4>
                          <p className="text-sm text-violet-200/60 line-clamp-2">{prediction.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <ChevronRight className={cn(
                            'h-4 w-4 text-violet-400 transition-transform',
                            isExpanded && 'rotate-90'
                          )} />
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', confidenceBg)}
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prediction.systems.slice(0, 4).map(system => {
                          const colors = SYSTEM_COLORS[system] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', primary: 'text-slate-400' };
                          return (
                            <span
                              key={system}
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full border',
                                colors.bg, colors.border, colors.primary
                              )}
                            >
                              {system}
                            </span>
                          );
                        })}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-3">
                        <div className="h-px bg-violet-500/20" />
                        <div>
                          <h5 className="text-sm font-medium text-violet-200 mb-2 flex items-center gap-2">
                            <Target className="h-3 w-3" />Recomendação
                          </h5>
                          <p className="text-sm text-violet-100/80 leading-relaxed">{prediction.recommendation}</p>
                        </div>
                        {prediction.archetype && (
                          <div className="p-3 rounded-lg bg-violet-900/20 border border-violet-500/20">
                            <h6 className="text-xs font-medium text-violet-300 mb-2 flex items-center gap-1.5">
                              <Zap className="h-3 w-3" />Arquetipo em Tradições
                            </h6>
                            <div className="grid grid-cols-2 gap-2 text-xs text-violet-100/70">
                              {prediction.archetype.manifestations.kabbalah && (
                                <div><span className="text-violet-300">Cabala:</span> {prediction.archetype.manifestations.kabbalah}</div>
                              )}
                              {prediction.archetype.manifestations.ifa && (
                                <div><span className="text-amber-300">Ifá:</span> {prediction.archetype.manifestations.ifa}</div>
                              )}
                              {prediction.archetype.manifestations.candomble && (
                                <div><span className="text-emerald-300">Candomblé:</span> {prediction.archetype.manifestations.candomble}</div>
                              )}
                              {prediction.archetype.manifestations.tarot && (
                                <div><span className="text-rose-300">Tarot:</span> {prediction.archetype.manifestations.tarot}</div>
                              )}
                              {prediction.archetype.manifestations.astrology && (
                                <div><span className="text-blue-300">Astrologia:</span> {prediction.archetype.manifestations.astrology}</div>
                              )}
                              {prediction.archetype.manifestations.numerology && (
                                <div><span className="text-cyan-300">Numerologia:</span> {prediction.archetype.manifestations.numerology}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!isLoading && predictions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-violet-500/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-violet-200/60">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{predictions.length} correlações</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{predictions.filter(p => getConfidenceLevel(p.confidence) === 'high').length} alta confiança</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-violet-300 hover:text-violet-200">
                Ver mais <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CorrelationPredictionsWidget;
