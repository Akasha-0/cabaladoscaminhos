// fallow-ignore-file unused-file
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// TYPES
// ============================================================

interface SpiritWellnessWidgetProps {
  userId?: string;
}

interface WellnessDimension {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
  suggestion: string;
}

interface WellnessEntry {
  date: string;
  dimensions: Record<string, number>;
  overallScore: number;
}

interface WellnessState {
  current: Record<string, number>;
  history: WellnessEntry[];
}

// CONSTANTS
// ============================================================

const STORAGE_KEY = 'cabala_wellness_data';

const DIMENSIONS_CONFIG = [
  {
    id: 'fisica',
    name: 'Física',
    icon: '💪',
    color: 'bg-emerald-500',
    suggestion: 'Pratique exercícios físicos hoje, mesmo que apenas uma caminhada de 15 minutos.',
  },
  {
    id: 'emocional',
    name: 'Emocional',
    icon: '💚',
    color: 'bg-teal-500',
    suggestion: 'Reserve um momento para identificar e nomear suas emoções atuais.',
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: '🧠',
    color: 'bg-cyan-500',
    suggestion: 'Pratique mindfulness ou meditação por pelo menos 10 minutos.',
  },
  {
    id: 'espiritual',
    name: 'Espiritual',
    icon: '✨',
    color: 'bg-violet-500',
    suggestion: 'Conecte-se com sua espiritualidade através de oração, meditação ou reflexão.',
  },
  {
    id: 'energetica',
    name: 'Energética',
    icon: '⚡',
    color: 'bg-amber-500',
    suggestion: 'Cuide do seu campo energético: tome um banho de luz, use cristais ou faça uma limpeza de ambientes.',
  },
];

const DEFAULT_STATE: WellnessState = {
  current: {
    fisica: 70,
    emocional: 70,
    mental: 70,
    espiritual: 70,
    energetica: 70,
  },
  history: [],
};

// HELPERS
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-cyan-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-orange-400';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-600';
  if (score >= 60) return 'from-cyan-500 to-cyan-600';
  if (score >= 40) return 'from-amber-500 to-amber-600';
  return 'from-orange-500 to-orange-600';
}

function getProgressColor(value: number): string {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 60) return 'bg-cyan-500';
  if (value >= 40) return 'bg-amber-500';
  return 'bg-orange-500';
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function loadFromStorage(): WellnessState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WellnessState;
      return {
        current: { ...DEFAULT_STATE.current, ...parsed.current },
        history: parsed.history || [],
      };
    }
  } catch {
    console.warn('Failed to load wellness data from storage');
  }
  return DEFAULT_STATE;
}

function saveToStorage(state: WellnessState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Failed to save wellness data to storage');
  }
}

function calculateOverallScore(dimensions: Record<string, number>): number {
  const values = Object.values(dimensions);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

// SUB-COMPONENTS
// ============================================================

interface ProgressBarProps {
  value: number;
  color: string;
  showLabel?: boolean;
}

function ProgressBar({ value, color, showLabel = true }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground w-10 text-right">
          {value}%
        </span>
      )}
    </div>
  );
}

interface DimensionSliderProps {
  dimension: typeof DIMENSIONS_CONFIG[number];
  value: number;
  onChange: (id: string, value: number) => void;
}

function DimensionSlider({ dimension, value, onChange }: DimensionSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{dimension.icon}</span>
          <span className="font-medium">{dimension.name}</span>
        </div>
        <span className={cn('text-sm font-bold', getScoreColor(value))}>
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={(vals) => onChange(dimension.id, (vals as readonly number[])[0])}
        className="py-1"
      />
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-200', getProgressColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface InsightCardProps {
  dimension: typeof DIMENSIONS_CONFIG[number];
  score: number;
}

function InsightCard({ dimension, score }: InsightCardProps) {
  return (
    <div className={cn(
      'p-3 rounded-lg border transition-all',
      score < 40 
        ? 'border-orange-300 bg-orange-500/10' 
        : 'border-muted bg-muted/30'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span>{dimension.icon}</span>
        <span className="font-medium text-sm">{dimension.name}</span>
        <span className={cn('ml-auto text-sm font-bold', getScoreColor(score))}>
          {score}%
        </span>
      </div>
      {score < 50 && (
        <p className="text-xs text-muted-foreground mt-1">
          {dimension.suggestion}
        </p>
      )}
    </div>
  );
}

// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function SpiritWellnessWidget({ userId }: SpiritWellnessWidgetProps) {
  const [state, setState] = useState<WellnessState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    setState(loadFromStorage());
    setIsHydrated(true);
  }, []);

  // Calculate overall score
  const overallScore = useMemo(() => {
    return calculateOverallScore(state.current);
  }, [state.current]);

  // Get lowest dimensions for suggestions
  const lowestDimensions = useMemo(() => {
    return DIMENSIONS_CONFIG
      .map(dim => ({
        ...dim,
        score: state.current[dim.id] ?? 50,
      }))
      .filter(dim => dim.score < 50)
      .sort((a, b) => a.score - b.score);
  }, [state.current]);

  // Handle slider changes
  const handleDimensionChange = (id: string, value: number) => {
    setState(prev => ({
      ...prev,
      current: { ...prev.current, [id]: value },
    }));
  };

  // Save check-in
  const handleCheckIn = () => {
    const entry: WellnessEntry = {
      date: formatDate(new Date()),
      dimensions: { ...state.current },
      overallScore,
    };

    setState(prev => {
      // Keep last 30 days of history
      const history = [entry, ...prev.history].slice(0, 30);
      const newState = { ...prev, history };
      saveToStorage(newState);
      return newState;
    });
  };

  // Get trend from history
  const trend = useMemo(() => {
    if (state.history.length < 2) return null;
    const recent = state.history[0];
    const previous = state.history[1];
    const diff = recent.overallScore - previous.overallScore;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      diff: Math.abs(diff),
    };
  }, [state.history]);

  if (!isHydrated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className={cn(
        'h-1 bg-gradient-to-r transition-all',
        getScoreGradient(overallScore)
      )} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🌿</span>
            <span>Bienestar Espiritual</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={cn(
              'text-2xl font-bold',
              getScoreColor(overallScore)
            )}>
              {overallScore}
            </div>
            {trend && (
              <div className="text-sm text-muted-foreground">
                {trend.direction === 'up' && '↑'}
                {trend.direction === 'down' && '↓'}
                {trend.direction === 'stable' && '→'}
                {trend.diff > 0 && ` ${trend.diff}%`}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu equilíbrio nas cinco dimensões do bienestar
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pontuação Geral</span>
            <span className={cn('font-medium', getScoreColor(overallScore))}>
              {overallScore >= 80 ? 'Excelente' 
                : overallScore >= 60 ? 'Bom'
                : overallScore >= 40 ? 'Moderado'
                : 'Precisa atenção'}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                'bg-gradient-to-r',
                getScoreGradient(overallScore)
              )}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Dimension sliders */}
        <div className="space-y-4">
          {DIMENSIONS_CONFIG.map(dimension => (
            <DimensionSlider
              key={dimension.id}
              dimension={dimension}
              value={state.current[dimension.id] ?? 50}
              onChange={handleDimensionChange}
            />
          ))}
        </div>

        {/* Check-in button */}
        <button
          onClick={handleCheckIn}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium transition-all',
            'bg-gradient-to-r from-violet-600 to-cyan-600',
            'hover:from-violet-500 hover:to-cyan-500',
            'text-white shadow-lg hover:shadow-xl',
            'active:scale-[0.98]'
          )}
        >
          Registrar Check-in de Hoje
        </button>

        {/* Insights based on lowest scores */}
        {lowestDimensions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <span>💡</span>
              <span>Recomendações Personalizadas</span>
            </h4>
            <div className="grid gap-2">
              {lowestDimensions.slice(0, 3).map(dim => (
                <InsightCard
                  key={dim.id}
                  dimension={dim}
                  score={dim.score}
                />
              ))}
            </div>
          </div>
        )}

        {/* History indicator */}
        {state.history.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            {state.history.length} registros de check-in salvos
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpiritWellnessWidget;