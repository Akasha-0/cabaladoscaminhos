'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Star } from 'lucide-react';
import { WidgetInfoRow, WidgetProgress, WidgetTagList } from './SpiritualWidgetSystem';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface LunarPhaseData {
  name: string;
  emoji: string;
  illumination: number;
  meaning: string;
  energy: string;
  recommended: string[];
  avoided: string[];
}

interface LunarPhaseWidgetProps {
  className?: string;
  customDate?: Date;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// ============================================================
// CONSTANTS
// ============================================================

const LUNAR_PHASES: Record<string, LunarPhaseData> = {
  new: {
    name: 'Lua Nova', emoji: '🌑', illumination: 0,
    meaning: 'Momento de novos começos, intenções e renovação.',
    energy: 'Introspecção',
    recommended: ['Definir intenções', 'Iniciar projetos', 'Meditação'],
    avoided: ['Confrontos', 'Decisões precipitadas'],
  },
  waxing: {
    name: 'Crescente', emoji: '🌓', illumination: 25,
    meaning: 'Período de crescimento e acumulação de energia.',
    energy: 'Crescimento',
    recommended: ['Rituais de prosperidade', 'Amplificar intenções'],
    avoided: ['Confrontos diretos'],
  },
  firstQuarter: {
    name: 'Quarto Crescente', emoji: '🌔', illumination: 50,
    meaning: 'Fase de ação e superação de obstáculos.',
    energy: 'Ação',
    recommended: ['Tomar decisões', 'Ações concretas'],
    avoided: ['Indecisão'],
  },
  waxingGibbous: {
    name: 'Gibosa', emoji: '🌔', illumination: 75,
    meaning: 'Refinamento e ajustes nas sementes germinando.',
    energy: 'Refinamento',
    recommended: ['Revisar planos', 'Estudos espirituais'],
    avoided: ['Mudanças drásticas'],
  },
  full: {
    name: 'Lua Cheia', emoji: '🌕', illumination: 100,
    meaning: 'Pico de energia e manifestação máxima.',
    energy: 'Iluminação',
    recommended: ['Gratidão', 'Rituais de cura', 'Perdão'],
    avoided: ['Confrontos', 'Negatividade'],
  },
  waningGibbous: {
    name: 'Gibosa Minguante', emoji: '🌖', illumination: 75,
    meaning: 'Gratidão e compartilhamento das bênçãos.',
    energy: 'Gratidão',
    recommended: ['Agradecimentos', 'Compartilhar conhecimento'],
    avoided: ['Novos projetos'],
  },
  lastQuarter: {
    name: 'Quarto Minguante', emoji: '🌗', illumination: 50,
    meaning: 'Liberação e perdão do que não serve mais.',
    energy: 'Libertação',
    recommended: ['Rituais de limpeza', 'Perdão'],
    avoided: ['Novas iniciativas'],
  },
  waning: {
    name: 'Minguante', emoji: '🌘', illumination: 25,
    meaning: 'Descanso e regeneração espiritual.',
    energy: 'Descanso',
    recommended: ['Meditação', 'Auto-cuidado'],
    avoided: ['Excesso de atividade'],
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMoonPhase(date: Date): string {
  const knownNewMoon = new Date(2000, 0, 6).getTime();
  const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000;
  const daysSinceKnown = date.getTime() - knownNewMoon;
  const lunarAge = ((daysSinceKnown % lunarCycle) + lunarCycle) % lunarCycle;
  const phaseIndex = (lunarAge / lunarCycle) * 8;
  if (phaseIndex < 0.5) return 'new';
  if (phaseIndex < 1.5) return 'waxing';
  if (phaseIndex < 2.5) return 'firstQuarter';
  if (phaseIndex < 3.5) return 'waxingGibbous';
  if (phaseIndex < 4.5) return 'full';
  if (phaseIndex < 5.5) return 'waningGibbous';
  if (phaseIndex < 6.5) return 'lastQuarter';
  if (phaseIndex < 7.5) return 'waning';
  return 'new';
}

function getIllumination(phase: string): number {
  return LUNAR_PHASES[phase]?.illumination ?? 0;
}

// ============================================================
// MOON VISUAL COMPONENT
// ============================================================

function MoonVisual({ phase, illumination, size = 80 }: { phase: string; illumination: number; size?: number }) {
  const data = LUNAR_PHASES[phase];
  if (!data) return null;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size + 40 }}>
      {/* Moon circle with glow */}
      <div 
        className="relative rounded-full bg-gradient-to-br from-slate-200 to-slate-400 overflow-hidden transition-all duration-500"
        style={{ 
          width: size, 
          height: size,
          boxShadow: `inset -6px -6px 16px rgba(0, 0, 0, 0.15), 0 0 ${size/2}px rgba(255, 255, 255, ${illumination/400})`
        }}
      >
        {/* Shadow overlay for phase */}
        {phase === 'new' && (
          <div className="absolute inset-0 bg-slate-900" />
        )}
        {(phase === 'waxing' || phase === 'firstQuarter' || phase === 'waxingGibbous') && (
          <div 
            className="absolute inset-0 bg-slate-900 transition-all duration-500"
            style={{ clipPath: `inset(0 ${100 - illumination}% 0 0)` }}
          />
        )}
        {(phase === 'waning' || phase === 'lastQuarter' || phase === 'waningGibbous') && (
          <div 
            className="absolute inset-0 bg-slate-900 transition-all duration-500"
            style={{ clipPath: `inset(0 0 0 ${100 - illumination}%)` }}
          />
        )}
        
        {/* Craters */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-slate-300/40" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-slate-300/30" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 rounded-full bg-slate-300/50" />
      </div>
      
      {/* Emoji label */}
      <div className="mt-3 text-2xl animate-bounce">{data.emoji}</div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LunarPhaseWidget({ className = '', customDate }: LunarPhaseWidgetProps) {
  const [loading, setLoading] = React.useState<LoadingState>('loading');
  const [phase, setPhase] = React.useState<string>('full');
  const [illumination, setIllumination] = React.useState(100);

  React.useEffect(() => {
    const calculatePhase = async () => {
      setLoading('loading');
      await new Promise((resolve) => setTimeout(resolve, 400));
      const date = customDate || new Date();
      const moonPhase = getMoonPhase(date);
      const moonIllumination = getIllumination(moonPhase);
      setPhase(moonPhase);
      setIllumination(moonIllumination);
      setLoading('loaded');
    };
    calculatePhase();
  }, [customDate]);

  const phaseData = LUNAR_PHASES[phase];
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Moon className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Fase Lunar
            </span>
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Star className="w-3 h-3" />
            {dateStr}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {loading === 'loading' ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-slate-700 animate-pulse" />
            <div className="h-6 w-24 rounded bg-slate-700 animate-pulse" />
            <div className="h-16 w-full rounded bg-slate-700 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Moon visual and info */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <MoonVisual phase={phase} illumination={illumination} size={80} />
              
              <div className="text-center mt-3">
                <h3 className="text-xl font-bold text-white">{phaseData?.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {/* Illumination dots */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all duration-300',
                          i <= Math.ceil(illumination / 20) ? 'bg-amber-400' : 'bg-slate-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-amber-400 font-medium ml-2">{illumination}%</span>
                </div>
              </div>
            </div>

            {/* Energy and meaning */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Energia do momento</p>
                <p className="text-sm font-medium text-violet-300">{phaseData?.energy}</p>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed">
                {phaseData?.meaning}
              </p>
            </div>

            {/* Recommended and avoided */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-medium mb-2">✓ Recomendado</p>
                <ul className="space-y-1">
                  {phaseData?.recommended.slice(0, 2).map((item, i) => (
                    <li key={i} className="text-xs text-emerald-400/80">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 font-medium mb-2">✗ Evitar</p>
                <ul className="space-y-1">
                  {phaseData?.avoided.slice(0, 2).map((item, i) => (
                    <li key={i} className="text-xs text-red-400/80">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tip */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400/80">
                {phase === 'new' && 'Perfecto para plantar nuevas intenciones'}
                {phase === 'full' && 'Momento de manifestación máxima'}
                {phase === 'waning' && 'Ideal para limpiar y dejar ir'}
                {phase !== 'new' && phase !== 'full' && phase !== 'waning' && 'Buen momento para introspección'}
              </p>
            </div>

            {/* Progress */}
            <WidgetProgress label="Influência lunar" value={illumination} max={100} color="violet" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LunarPhaseWidget;