'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Star, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getMoonPhaseInfo,
  getUpcoming7Days,
  isCurrentlyVoidOfCourse,
  getNextVoidOfCourse,
  getBestRitualTime,
  type MoonPhase
} from '@/lib/astrologia/moon-calculator';

// ============================================================
// TYPES
// ============================================================

interface RitualRecommendation {
  phase: MoonPhase;
  title: string;
  description: string;
  orixa?: string;
  category: 'intention' | 'growth' | 'manifestation' | 'release' | 'protection' | 'gratitude';
}

interface UpcomingRitual {
  date: Date;
  title: string;
  phase: MoonPhase;
  phaseName: string;
  isOptimal?: boolean;
}

interface MoonRitualPlannerProps {
  userId?: string;
  userOrixa?: string;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// ============================================================
// CONSTANTS
// ============================================================

const RITUAL_RECOMMENDATIONS: Record<MoonPhase, RitualRecommendation> = {
  new: {
    phase: 'new',
    title: 'Lua Nova - Portal de Intenções',
    description: 'Momento sagrado para plantar sementes espirituais. Defina intenções claras e inicie novos projetos com energia renovada.',
    orixa: 'Oxalá',
    category: 'intention',
  },
  waxing: {
    phase: 'waxing',
    title: 'Lua Crescente - Energia de Crescimento',
    description: 'Período de acumulação e crescimento. Amplifique suas intenções e tome ações concretas em direção aos seus objetivos.',
    orixa: 'Oxum',
    category: 'growth',
  },
  firstQuarter: {
    phase: 'firstQuarter',
    title: 'Quarto Crescente - Coragem em Ação',
    description: 'Tempo de superar obstáculos e tomar decisões importantes. Tenha coragem para avançar em seus propósito.',
    orixa: 'Xangô',
    category: 'growth',
  },
  waxingGibbous: {
    phase: 'waxingGibbous',
    title: 'Gibosa Crescente - Refinamento',
    description: 'Momento de ajustar e refinar seus planos. Busque sabedoria e aprimore sua prática espiritual.',
    orixa: 'Oxóssi',
    category: 'growth',
  },
  full: {
    phase: 'full',
    title: 'Lua Cheia - Manifestação Máxima',
    description: 'Pico de energia luminosa para gratidão, cura profunda e manifestação de desejos. Celebre suas conquistas.',
    orixa: 'Iemanjá',
    category: 'manifestation',
  },
  waningGibbous: {
    phase: 'waningGibbous',
    title: 'Gibosa Minguante - Gratidão',
    description: 'Momento de agradecer pelas bênçãos recebidas e compartilhar conhecimento. Avalie seu progresso.',
    orixa: 'Oxum',
    category: 'gratitude',
  },
  lastQuarter: {
    phase: 'lastQuarter',
    title: 'Quarto Minguante - Libertação',
    description: 'Tempo de soltar o que não serve mais. Pratique o perdão e a limpeza de velhos padrões.',
    orixa: 'Omolu',
    category: 'release',
  },
  waning: {
    phase: 'waning',
    title: 'Lua Minguante - Regeneração',
    description: 'Período de introspecção e descanso espiritual. Fortaleça sua proteção e renove sua energia.',
    orixa: 'Oxalá',
    category: 'protection',
  },
};

const RITUAL_TIMING_TIPS: Record<string, { optimal: string; good: string; avoid: string }> = {
  new: {
    optimal: 'Nascer da lua (anoitecer)',
    good: 'Qualquer hora após as 20h',
    avoid: 'Meio-dia e hora da digestão',
  },
  waxing: {
    optimal: 'Entre 14h e 17h',
    good: 'Qualquer hora diurna',
    avoid: 'Madrugada (1h-5h)',
  },
  firstQuarter: {
    optimal: 'Tarde (14h-18h)',
    good: 'Manhã com energia',
    avoid: 'Noite após as 22h',
  },
  waxingGibbous: {
    optimal: 'Final da tarde (17h-20h)',
    good: 'Qualquer hora',
    avoid: 'Períodos de estresse',
  },
  full: {
    optimal: 'Meia-noite (momento exato)',
    good: 'Qualquer hora noturna',
    avoid: 'Manhãvery cedo e digestão',
  },
  waningGibbous: {
    optimal: 'Manhã cedo (6h-10h)',
    good: 'Qualquer hora',
    avoid: 'Excesso de-stimulants',
  },
  lastQuarter: {
    optimal: 'Tarde-noite (18h-21h)',
    good: 'Qualquer hora tranquila',
    avoid: 'Atividades sociais intensas',
  },
  waning: {
    optimal: 'Noite (21h-24h)',
    good: 'Quiet reflective hours',
    avoid: 'Manhã movimentada',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
}

function formatTimeRange(start: Date, end: Date): string {
  const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function getCategoryColor(category: RitualRecommendation['category']): string {
  const colors = {
    intention: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    growth: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    manifestation: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    release: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    protection: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    gratitude: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  };
  return colors[category];
}

function getCategoryBadge(category: RitualRecommendation['category']): string {
  const badges = {
    intention: 'bg-indigo-500/20 text-indigo-300',
    growth: 'bg-green-500/20 text-green-300',
    manifestation: 'bg-amber-500/20 text-amber-300',
    release: 'bg-red-500/20 text-red-300',
    protection: 'bg-blue-500/20 text-blue-300',
    gratitude: 'bg-pink-500/20 text-pink-300',
  };
  return badges[category];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function MoonDisplay({ illumination, phase }: { illumination: number; phase: MoonPhase }) {
  return (
    <div className="relative w-24 h-24">
      {/* Glow effect behind moon */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-silver-200/30 to-purple-300/20 animate-pulse"
        style={{ filter: 'blur(12px)' }}
      />

      {/* Moon body */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          boxShadow: `inset -6px -6px 16px rgba(0,0,0,0.2), 0 0 30px rgba(255,255,255,${illumination / 400})`,
        }}
      >
        {/* Base moon color */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-300" />

        {/* Shadow/illumination overlay */}
        {illumination === 0 && <div className="absolute inset-0 bg-slate-900" />}

        {(phase === 'waxing' || phase === 'firstQuarter') && (
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ clipPath: `inset(0 ${100 - illumination}% 0 0)` }}
          />
        )}

        {(phase === 'waning' || phase === 'lastQuarter') && (
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ clipPath: `inset(0 0 0 ${100 - illumination}%)` }}
          />
        )}

        {phase === 'waxingGibbous' && (
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ clipPath: `inset(0 ${100 - illumination}% 0 0)` }}
          />
        )}

        {phase === 'waningGibbous' && (
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ clipPath: `inset(0 0 0 ${100 - illumination}%)` }}
          />
        )}

        {/* Crater details */}
        <div className="absolute top-1/4 left-1/4 w-2.5 h-2.5 rounded-full bg-slate-300/30" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-slate-300/20" />
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 rounded-full bg-slate-300/40" />
      </div>

      {/* Animated stars */}
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      <div className="absolute -top-2 left-0 w-1 h-1 rounded-full bgsilver-300 animate-ping" />
      <div className="absolute bottom-0 -right-2 w-1 h-1 rounded-full bg-white animate-pulse" />
    </div>
  );
}

function PhaseBadge({ phase, daysUntil }: { phase: string; daysUntil: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
        {phase}
      </span>
      <span className="text-xs text-slate-400">
        {daysUntil < 1 ? ' hoje' : `${Math.round(daysUntil)} dias`}
      </span>
    </div>
  );
}

function RitualRecommendationCard({ recommendation }: { recommendation: RitualRecommendation }) {
  return (
    <div className={cn('p-3 rounded-lg border bg-gradient-to-br', getCategoryColor(recommendation.category))}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-100 leading-tight">{recommendation.title}</h4>
        <span className={cn('px-1.5 py-0.5 rounded text-xs whitespace-nowrap', getCategoryBadge(recommendation.category))}>
          {recommendation.category}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2">{recommendation.description}</p>
      {recommendation.orixa && (
        <div className="flex items-center gap-1 text-xs text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Trabalhe com <span className="text-amber-400 font-medium">{recommendation.orixa}</span></span>
        </div>
      )}
    </div>
  );
}

function VoidOfCourseIndicator({ nextVoid }: { nextVoid: Date | null }) {
  const now = new Date();
  const isVoidNow = isCurrentlyVoidOfCourse(now);

  if (isVoidNow) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
        <div className="flex-1">
          <p className="text-xs text-red-300 font-medium">Lua em curso vazio</p>
          <p className="text-xs text-slate-400">Evite decisões importantes</p>
        </div>
      </div>
    );
  }

  if (nextVoid) {
    const timeUntil = nextVoid.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntil / (60 * 60 * 1000));
    const minutesUntil = Math.floor((timeUntil % (60 * 60 * 1000)) / (60 * 1000));

    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-4 h-4 text-amber-400" />
        <div className="flex-1">
          <p className="text-xs text-amber-300 font-medium">Próximo curso vazio</p>
          <p className="text-xs text-slate-400">
            {hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}min` : `${minutesUntil}min`}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function UpcomingRitualItem({ ritual }: { ritual: UpcomingRitual }) {
  const isToday = ritual.date.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg', isToday ? 'bg-amber-500/20' : 'bg-slate-700/50')}>
        {ritual.phase === 'new' ? '🌑' : ritual.phase === 'full' ? '🌕' : '🌓'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isToday ? 'text-amber-300' : 'text-slate-200')}>
          {isToday && <span className="text-xs text-amber-400 mr-1">●</span>}
          {ritual.title}
        </p>
        <p className="text-xs text-slate-400">{formatDateShort(ritual.date)}</p>
      </div>
      {ritual.isOptimal && (
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Momento ideal" />
      )}
    </div>
  );
}

function BestTimeCard({ time, phase }: { time: { start: Date; end: Date; quality: string }; phase: MoonPhase }) {
  const tips = RITUAL_TIMING_TIPS[phase];
  const qualityColors = {
    optimal: 'border-green-500/30 bg-green-500/10',
    good: 'border-amber-500/30 bg-amber-500/10',
    avoid: 'border-red-500/30 bg-red-500/10',
  };
  const qualityText = {
    optimal: 'text-green-400',
    good: 'text-amber-400',
    avoid: 'text-red-400',
  };

  return (
    <div className={cn('p-3 rounded-lg border', qualityColors[time.quality as keyof typeof qualityColors])}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={cn('w-4 h-4', qualityText[time.quality as keyof typeof qualityText])} />
        <span className={cn('text-xs font-medium', qualityText[time.quality as keyof typeof qualityText])}>
          {time.quality === 'optimal' ? 'Momento Ideal' : 'Bom Momento'}
        </span>
      </div>
      <p className="text-xs text-slate-300 mb-2">{formatTimeRange(time.start, time.end)}</p>
      <div className="space-y-1">
        <div className="flex items-start gap-1.5">
          <span className="text-green-400 text-xs">✓</span>
          <p className="text-xs text-slate-400">{tips.optimal}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-amber-400 text-xs">○</span>
          <p className="text-xs text-slate-400">{tips.good}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="w-24 h-24 rounded-full bg-slate-700 animate-pulse" />
      <div className="space-y-2 w-full">
        <div className="h-5 w-32 mx-auto rounded bg-slate-700 animate-pulse" />
        <div className="h-4 w-24 mx-auto rounded bg-slate-700 animate-pulse" />
        <div className="h-24 rounded bg-slate-700 animate-pulse mt-4" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MoonRitualPlanner({ userId, userOrixa }: MoonRitualPlannerProps) {
  const [loading, setLoading] = React.useState<LoadingState>('loading');
  const [moonInfo, setMoonInfo] = React.useState<ReturnType<typeof getMoonPhaseInfo> | null>(null);
  const [upcomingDays, setUpcomingDays] = React.useState<ReturnType<typeof getUpcoming7Days>>([]);
  const [voidOfCourse, setVoidOfCourse] = React.useState<{ next: Date | null; isNow: boolean }>({ next: null, isNow: false });
  const [bestTime, setBestTime] = React.useState<ReturnType<typeof getBestRitualTime> | null>(null);

  React.useEffect(() => {
    const calculateMoonData = async () => {
      setLoading('loading');

      // Small delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const now = new Date();
      const info = getMoonPhaseInfo(now);
      const upcoming = getUpcoming7Days(now);
      const nextVoid = getNextVoidOfCourse(now);
      const best = getBestRitualTime(now);
      const isVoidNow = isCurrentlyVoidOfCourse(now);

      setMoonInfo(info);
      setUpcomingDays(upcoming);
      setVoidOfCourse({ next: nextVoid, isNow: isVoidNow });
      setBestTime(best);
      setLoading('loaded');
    };

    calculateMoonData();
  }, [userId]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading === 'loading') {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Moon className="w-5 h-5" />
            Ritual Lunar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!moonInfo) {
    return null;
  }

  const recommendation = RITUAL_RECOMMENDATIONS[moonInfo.phase];
  const upcomingRituals: UpcomingRitual[] = upcomingDays.map((day) => ({
    date: day.date,
    title: day.phase === 'new' ? 'Lua Nova - Plantar Intenções' : day.phase === 'full' ? 'Lua Cheia - Manifestar' : `Ritual de ${day.name}`,
    phase: day.phase,
    phaseName: day.name,
    isOptimal: day.phase === 'full' || day.phase === 'new',
  }));

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Moon className="w-5 h-5" />
            Ritual Lunar
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Star className="w-3 h-3" />
            {dateStr}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Moon Phase Display */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-700/50">
          <MoonDisplay illumination={moonInfo.illumination} phase={moonInfo.phase} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-100">{moonInfo.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      i < Math.ceil(moonInfo.illumination / 20) ? 'bg-amber-400' : 'bg-slate-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-amber-400 font-medium ml-1">{moonInfo.illumination}%</span>
            </div>
            <PhaseBadge
              phase={moonInfo.isWaxing ? 'Crescente' : 'Minguante'}
              daysUntil={moonInfo.daysUntilNextPhase}
            />
          </div>
        </div>

        {/* Current Ritual Recommendation */}
        <RitualRecommendationCard recommendation={recommendation} />

        {/* Void of Course Indicator */}
        <VoidOfCourseIndicator nextVoid={voidOfCourse.next} />

        {/* Best Time for Ritual */}
        {bestTime && (
          <BestTimeCard time={bestTime} phase={moonInfo.phase} />
        )}

        {/* Upcoming Rituals */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-slate-300">Próximos 7 dias</h4>
          </div>
          <div className="space-y-0.5">
            {upcomingRituals.slice(0, 5).map((ritual, i) => (
              <UpcomingRitualItem key={i} ritual={ritual} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MoonRitualPlanner;
