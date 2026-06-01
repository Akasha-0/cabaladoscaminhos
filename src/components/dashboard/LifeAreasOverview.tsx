'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProgress } from './SpiritualWidgetSystem';
import { Compass, TrendingUp, AlertCircle, Star, Loader2, Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LifeMapResult, AreaCorrelation } from '@/lib/life-areas';
import { LifeAreaId } from '@/lib/life-areas';

interface LifeAreasOverviewProps {
  result: LifeMapResult | null;
  onSelectArea?: (areaId: LifeAreaId) => void;
  loading?: boolean;
  className?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LifeAreasOverview({ result, onSelectArea, loading, className }: LifeAreasOverviewProps) {
  if (loading || !result) {
    return (
      <Card className={cn(
        'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50',
        className
      )}>
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Mapeando suas áreas de vida...</p>
        </CardContent>
      </Card>
    );
  }

  const topArea = result.correlations[0];
  const top3 = result.correlations.slice(0, 3);
  const shadow = result.shadowAreas[0];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent block">
                Mapa de Áreas da Vida
              </span>
              <span className="text-xs text-slate-400">12 dimensões do seu ser</span>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Brain className="w-3.5 h-3.5" />
            <span>IA M3</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Top area highlight */}
        <div
          className="p-4 rounded-xl border"
          style={{
            background: `linear-gradient(135deg, ${topArea.area.color}15, ${topArea.area.color}05)`,
            borderColor: `${topArea.area.color}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{topArea.area.emoji}</div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Sua área mais forte</p>
              <h3 className="text-lg font-bold text-white">{topArea.area.name}</h3>
              <p className="text-xs mt-1" style={{ color: topArea.area.color }}>
                {topArea.intensidade.toUpperCase()} • {topArea.score}% de afinidade
              </p>
            </div>
            <Star className="w-6 h-6" style={{ color: topArea.area.color }} />
          </div>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            {topArea.guidance}
          </p>
        </div>

        {/* Top 3 visualization */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Top 3 Áreas
          </h4>
          {top3.map((corr) => (
            <button
              key={corr.area.id}
              onClick={() => onSelectArea?.(corr.area.id)}
              className="w-full text-left"
            >
              <WidgetProgress
                label={`${corr.area.emoji} ${corr.area.name}`}
                value={corr.score}
                max={100}
                color="amber"
              />
            </button>
          ))}
        </div>

        {/* Shadow area */}
        {shadow && (
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-amber-300 font-medium">
                  Área que pede atenção
                </p>
                <button
                  onClick={() => onSelectArea?.(shadow)}
                  className="text-sm font-semibold text-white hover:underline mt-0.5"
                >
                  {result.correlations.find(c => c.area.id === shadow)?.area.emoji}{' '}
                  {result.correlations.find(c => c.area.id === shadow)?.area.name}
                </button>
                <p className="text-xs text-slate-400 mt-1">
                  {result.correlations.find(c => c.area.id === shadow)?.guidance}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View all button */}
        <button
          onClick={() => onSelectArea?.('proposito')}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-violet-500/15 hover:from-amber-500/25 hover:to-violet-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Explorar mapa completo
        </button>
      </CardContent>
    </Card>
  );
}

export default LifeAreasOverview;
