// fallow-ignore-file unused-file
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  category: string;
  prediction: string;
  icon: React.ReactNode;
  color: string;
}

interface PredictionWidgetProps {
  className?: string;
}

const PREDICTIONS: Prediction[] = [
  {
    category: 'Caminho Espiritual',
    prediction: 'Um novo entendimento sobre sua jornada llegará através de reflexões silenciosas.',
    icon: <Star className="w-4 h-4" />,
    color: 'from-amber-500 to-orange-600',
  },
  {
    category: 'Relacionamentos',
    prediction: 'Conexões profundas se formam quando você se abre para a vulnerabilidade.',
    icon: <Heart className="w-4 h-4" />,
    color: 'from-rose-500 to-pink-600',
  },
  {
    category: 'Energia Vital',
    prediction: 'Sua energia está em elevação. Use este momento para iniciar projetos significativos.',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-purple-500 to-indigo-600',
  },
];

const DAY_OF_WEEK = [
  'Domingo - Energia Solar', 
  'Segunda - Início da Semana', 
  'Terça - Força Interior',
  'Quarta - Comunicação Sagrada',
  'Quinta - Abundância',
  'Sexta - Amor e Beleza',
  'Sábado - Proteção e Sabedoria'
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-slate-700" />
          <div className="h-3 w-full rounded bg-slate-700/50" />
        </div>
      </div>
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 rounded bg-slate-700" />
          <div className="h-3 w-full rounded bg-slate-700/50" />
        </div>
      </div>
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-slate-700" />
          <div className="h-3 w-full rounded bg-slate-700/50" />
        </div>
      </div>
    </div>
  );
}

export function PredictionWidget({ className = '' }: PredictionWidgetProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const today = new Date();
  const dayIndex = today.getDay();
  const dayName = DAY_OF_WEEK[dayIndex];

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={cn(
      'card-spiritual overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30',
      'animate-fade-in',
      className
    )}>
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <CardTitle className="text-lg">Previsões do Dia</CardTitle>
          </div>
          <p className="text-xs text-slate-500">{dayName}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isLoaded ? (
          <LoadingSkeleton />
        ) : (
          PREDICTIONS.map((pred, index) => (
            <div
              key={index}
              className={cn(
                'group p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5',
                'opacity-0 animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white',
                  'bg-gradient-to-br shadow-lg',
                  pred.color
                )}>
                  {pred.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-purple-300 mb-1">{pred.category}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{pred.prediction}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default PredictionWidget;