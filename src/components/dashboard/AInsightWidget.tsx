// fallow-ignore-file unused-file
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProgress } from './SpiritualWidgetSystem';
import { Sparkles, RefreshCw, Lightbulb, Eye, Heart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface InsightData {
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const INSIGHTS_DATA: InsightData[] = [
  {
    title: 'Conexão Ancestral',
    content: 'Seus antepassados estão a trabalhar para abrir caminhos em sua vida. Honre suas raízes e receba suas bênçãos.',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-pink-400',
  },
  {
    title: 'Energia do Dia',
    content: 'A lua em signo de água potencializa sua intuição. Confie em suas visões e permita que seu coração guie suas escolhas.',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-violet-400',
  },
  {
    title: 'Orixá Regente',
    content: 'Oxum traz mensagens de amor e prosperidade. Mantenha-se em harmonia com suas águas interiores.',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-400',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getInsightDoDia(): InsightData {
  const today = new Date();
  return INSIGHTS_DATA[today.getDate() % INSIGHTS_DATA.length];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AInsightWidget({ className = '' }: AInsightWidgetProps) {
  const insight = React.useMemo(() => getInsightDoDia(), []);
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
              Insight Diário
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{dateStr}</span>
            <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main insight card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(251,191,36,0.5), transparent 50%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('p-3 rounded-xl bg-amber-500/20', insight.color)}>
                {insight.icon}
              </div>
              <div>
                <p className="text-xs text-amber-400/70">Insight do Dia</p>
                <h3 className="text-lg font-bold text-white">{insight.title}</h3>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.content}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white">87%</p>
            <p className="text-xs text-slate-400">Alinhamento</p>
          </div>
          
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-lg font-bold text-white">12</p>
            <p className="text-xs text-slate-400">Intuições</p>
          </div>
          
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg font-bold text-white">5</p>
            <p className="text-xs text-slate-400">Sinais</p>
          </div>
        </div>

        {/* Progress */}
        <WidgetProgress label="Clareza spiritual" value={82} max={100} color="amber" />
      </CardContent>
    </Card>
  );
}

export default AInsightWidget;

interface AInsightWidgetProps {
  className?: string;
}