// fallow-ignore-file unused-file
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetStat, WidgetStatGrid, WidgetInfoRow, WidgetProgress, WidgetTagList } from './SpiritualWidgetSystem';
import { Zap, Sparkles, Target, Heart } from 'lucide-react';

interface NumerologyWidgetProps {
  name?: string;
  birthDate?: string;
}

// Sample numbers based on spiritual calculation
const SAMPLE_NUMBERS = {
  vida: { value: 7, meaning: 'O buscador da verdade', color: 'amber' as const },
  destino: { value: 3, meaning: 'O expressivo criativo', color: 'violet' as const },
  alma: { value: 9, meaning: 'O buscador da sabedoria', color: 'emerald' as const },
  personalidade: { value: 1, meaning: 'O líder pioneiro', color: 'cyan' as const },
};

export function NumerologyWidget({ name, birthDate }: NumerologyWidgetProps) {
  const numbers = [
    { key: 'vida', label: 'Vida', icon: <Sparkles className="w-4 h-4" />, ...SAMPLE_NUMBERS.vida },
    { key: 'destino', label: 'Destino', icon: <Target className="w-4 h-4" />, ...SAMPLE_NUMBERS.destino },
    { key: 'alma', label: 'Alma', icon: <Heart className="w-4 h-4" />, ...SAMPLE_NUMBERS.alma },
    { key: 'personalidade', label: 'Personalidade', icon: <Zap className="w-4 h-4" />, ...SAMPLE_NUMBERS.personalidade },
  ];

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Numerologia
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Numbers Grid */}
        <div className="grid grid-cols-2 gap-3">
          {numbers.map((num) => (
            <div 
              key={num.key}
              className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/70 transition-all duration-300 cursor-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-slate-400 group-hover:text-${num.color}-400 transition-colors`}>
                  {num.icon}
                </span>
                <span className="text-xs text-slate-400">{num.label}</span>
              </div>
              <p className={`text-3xl font-bold bg-gradient-to-r from-${num.color}-400 to-${num.color}-500 bg-clip-text text-transparent`}>
                {num.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{num.meaning}</p>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <WidgetProgress label="Harmonia dos números" value={78} max={100} color="cyan" />
        </div>
      </CardContent>
    </Card>
  );
}