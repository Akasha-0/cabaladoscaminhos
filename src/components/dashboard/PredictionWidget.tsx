'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Heart, Zap } from 'lucide-react';

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
    color: 'from-pink-500 to-rose-600',
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

export function PredictionWidget({ className = '' }: PredictionWidgetProps) {
  const today = new Date();
  const dayIndex = today.getDay();
  const dayName = DAY_OF_WEEK[dayIndex];

  return (
    <Card className={`card-spiritual ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <CardTitle className="text-lg">Previsões do Dia</CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-1">{dayName}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {PREDICTIONS.map((pred, index) => (
          <div
            key={index}
            className="group p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${pred.color} flex items-center justify-center flex-shrink-0 text-white`}>
                {pred.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-amber-300 mb-1">{pred.category}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pred.prediction}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default PredictionWidget;
