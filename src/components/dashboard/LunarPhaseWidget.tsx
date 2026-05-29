'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Star } from 'lucide-react';
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
    meaning: 'Momento de novos começos, intenções e renovação. A Lua Nova é um portal para plantar sementes espirituais e iniciar novos projetos.',
    energy: 'Introspecção e Renovação',
    recommended: ['Definir intenções e metas', 'Iniciar novos projetos', 'Meditação e reflexão interior', 'Rituais de purificação'],
    avoided: ['Confrontos e discussões', 'Decisões precipitadas', 'Excesso de atividade social'],
  },
  waxing: {
    name: 'Lua Crescente', emoji: '🌓', illumination: 25,
    meaning: 'Período de crescimento e acumulação de energia. As intenções plantadas na Lua Nova começam a se manifestar.',
    energy: 'Crescimento e Manifestação',
    recommended: ['Rituais de prosperidade', 'Práticas de cura emocional', 'Trabalho com Oxum', 'Amplificar intenções'],
    avoided: ['Confrontos diretos', 'Decisões financeiras importantes'],
  },
  firstQuarter: {
    name: 'Quarto Crescente', emoji: '🌔', illumination: 50,
    meaning: 'Fase de ação e superação de obstáculos. Momento de coragem para tomar decisões e avançar.',
    energy: 'Ação e Determinação',
    recommended: ['Tomar decisões importantes', 'Ações concretas em projetos', 'Rituais de coragem', 'Trabalhar com Xangô'],
    avoided: ['Indecisão e procrastinação', 'Aceitar medos sem questionar'],
  },
  waxingGibbous: {
    name: 'Gibosa Crescente', emoji: '🌔', illumination: 75,
    meaning: 'Período de refinamento e ajustes. As sementes começam a germinar e precisam de cuidado.',
    energy: 'Refinamento e Paciência',
    recommended: ['Revisar e ajustar planos', 'Estudos espirituais', 'Práticas de Oxóssi', 'Orações pela sabedoria'],
    avoided: ['Mudanças drásticas nos planos', 'Desistir dos objetivos'],
  },
  full: {
    name: 'Lua Cheia', emoji: '🌕', illumination: 100,
    meaning: 'Pico de energia e manifestação máxima. Momento de iluminação, gratidão e cura profunda.',
    energy: 'Iluminação e Manifestação',
    recommended: ['Gratidão e celebrações', 'Rituais de cura poderosa', 'Trabalhar com Iemanjá', 'Práticas de perdão', 'Manifestação de desejos'],
    avoided: ['Confrontos e conflitos', 'Negatividade e reclamações', 'Rituais de banimento'],
  },
  waningGibbous: {
    name: 'Gibosa Minguante', emoji: '🌖', illumination: 75,
    meaning: 'Fase de gratidão e compartilhamento. Momento de avaliar o que foi realizado e preparar para a transição.',
    energy: 'Gratidão e Avaliação',
    recommended: ['Agradecimentos pelas bênçãos', 'Compartilhar conhecimento', 'Trabalhar com Oxum', 'Avaliação de metas'],
    avoided: ['Iniciar novos projetos', 'Excesso de otimismo'],
  },
  lastQuarter: {
    name: 'Quarto Minguante', emoji: '🌗', illumination: 50,
    meaning: 'Período de liberação e perdão. Momento de deixar ir o que não serve mais.',
    energy: 'Libertação e Perdão',
    recommended: ['Rituais de limpeza', 'Perdão de si e outros', 'Trabalhar com Omolu', 'Eliminar velhos padrões'],
    avoided: ['Iniciar novos projetos', 'Excesso de atividade'],
  },
  waning: {
    name: 'Lua Minguante', emoji: '🌘', illumination: 25,
    meaning: 'Fase de introspecção e preparo para o novo ciclo. Momento de descanso e regeneração espiritual.',
    energy: 'Descanso e Regeneração',
    recommended: ['Meditação e contemplação', 'Práticas de auto-cuidado', 'Rituais de proteção', 'Trabalhar com Oxalá'],
    avoided: ['Novas iniciativas', 'Excesso de atividade'],
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
// SUB-COMPONENTS
// ============================================================

function MoonVisual({ phase, illumination, size = 100 }: { phase: string; illumination: number; size?: number }) {
  const data = LUNAR_PHASES[phase];
  if (!data) return null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 animate-pulse" style={{ filter: 'blur(20px)', opacity: illumination / 200 }} />
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-300 overflow-hidden"
        style={{ boxShadow: `inset -8px -8px 20px rgba(0, 0, 0, 0.15), 0 0 40px rgba(255, 255, 255, ${illumination / 300})` }}>
        {phase === 'new' && <div className="absolute inset-0 bg-slate-900" />}
        {(phase === 'waxing' || phase === 'firstQuarter') && <div className="absolute inset-0 bg-slate-900" style={{ clipPath: `inset(0 ${100 - illumination}% 0 0)` }} />}
        {(phase === 'waning' || phase === 'lastQuarter') && <div className="absolute inset-0 bg-slate-900" style={{ clipPath: `inset(0 0 0 ${100 - illumination}%)` }} />}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-slate-300/30" />
        <div className="absolute top-1/2 right-1/3 w-4 h-4 rounded-full bg-slate-300/20" />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-slate-300/40" />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-4xl animate-bounce">{data.emoji}</div>
    </div>
  );
}

function PhaseInfo({ phase }: { phase: LunarPhaseData }) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-1">{phase.energy}</h4>
        <p className="text-xs text-slate-500">{phase.meaning}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-400 font-medium mb-1">Recomendado</p>
          <ul className="space-y-0.5">
            {phase.recommended.slice(0, 3).map((item, i) => (<li key={i} className="text-xs text-green-400/80 flex items-start gap-1"><span className="text-green-400">✓</span>{item}</li>))}
          </ul>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 font-medium mb-1">Evitar</p>
          <ul className="space-y-0.5">
            {phase.avoided.slice(0, 2).map((item, i) => (<li key={i} className="text-xs text-red-400/80 flex items-start gap-1"><span className="text-red-400">✗</span>{item}</li>))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="w-28 h-28 rounded-full bg-slate-700 animate-pulse" />
      <div className="space-y-2 w-full">
        <div className="h-4 w-24 mx-auto rounded bg-slate-700 animate-pulse" />
        <div className="h-3 w-16 mx-auto rounded bg-slate-700 animate-pulse" />
        <div className="h-16 rounded bg-slate-700 animate-pulse" />
      </div>
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
  const dateStr = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const tipMessages: Record<string, string> = {
    new: 'Perfecto para nuevas intenciones',
    waxing: 'Momento de crecimiento y acción',
    firstQuarter: 'Tiempo de superar obstáculos',
    waxingGibbous: 'Refina tus planes',
    full: 'Celebración y gratitud',
    waningGibbous: 'Comparte tus bendiciones',
    lastQuarter: 'Hora de soltar y perdonar',
    waning: 'Descanso y renovación',
  };

  return (
    <Card className={cn('overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-300"><Moon className="w-5 h-5" />Fase Lunar</CardTitle>
          <div className="flex items-center gap-1 text-xs text-slate-400"><Star className="w-3 h-3" />{dateStr}</div>
        </div>
      </CardHeader>
      <CardContent>
        {loading === 'loading' ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative py-4"><MoonVisual phase={phase} illumination={illumination} size={100} /></div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-100">{phaseData?.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} className={cn('w-2 h-2 rounded-full transition-all duration-300', i < Math.ceil(illumination / 20) ? 'bg-amber-400' : 'bg-slate-600')} />))}
                </div>
                <span className="text-sm text-amber-400 font-medium">{illumination}% iluminada</span>
              </div>
            </div>
            <PhaseInfo phase={phaseData} />
            <div className="mt-4 pt-3 border-t border-slate-700/50 w-full">
              <div className="flex items-center gap-2 text-xs text-slate-400"><Sparkles className="w-4 h-4 text-amber-400" /><span>{tipMessages[phase]}</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LunarPhaseWidget;
