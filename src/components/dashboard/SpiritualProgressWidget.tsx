'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Flame, Heart, Sparkles, TrendingUp, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpiritualHistory } from '@/hooks/useSpiritualHistory';

// ============================================================
// TYPES
// ============================================================

interface ProgressMetric {
  id: string;
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface SpiritualProgressWidgetProps {
  className?: string;
  userId?: string;
  userName?: string;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

const STREAK_MESSAGES = [
  'Tu camino espiritual brilla con cada paso!',
  'Continúa así, la luz te guía!',
  'Tus ancestros se sienten orgullosos!',
  'El universo conspira a tu favor!',
  'Tu energía crece día a día!',
  'Cada ritual te acerca a la plenitud!',
];

const ENCOURAGEMENT_MESSAGES = [
  'El próximo nivel te espera con sabiduría',
  'Tus prácticas están creando transformación',
  'La consistencia es la clave del éxito espiritual',
  'Tu dedicación es inspiradora',
  'El crecimiento espiritual es eterno',
  'Cada día traes más luz al mundo',
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  const sorted = completions.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const date of sorted) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - streak);
    const dateStr = date.toISOString().split('T')[0];
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateStr === checkStr) { streak++; }
    else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (dateStr === checkDate.toISOString().split('T')[0]) { streak++; } else { break; }
    }
  }
  return streak;
}

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  children?: React.ReactNode;
  showGlow?: boolean;
}

function CircularProgress({ progress, size = 100, strokeWidth = 8, color, bgColor = 'rgba(30, 41, 59, 0.5)', children, showGlow = false }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', showGlow && 'filter drop-shadow-[0_0_8px_currentColor]')} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

interface MetricCardProps { metric: ProgressMetric; index: number; }

function MetricCard({ metric, index }: MetricCardProps) {
  const percentage = Math.round((metric.value / metric.max) * 100);
  return (
    <div className={cn('group flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-slate-900/50')} style={{ animationDelay: `${index * 100}ms` }}>
      <CircularProgress progress={percentage} size={64} strokeWidth={6} color={metric.color} showGlow={percentage >= 100}>
        <div className={cn('text-2xl', metric.color)}>{metric.icon}</div>
      </CircularProgress>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-bold text-slate-100">{metric.value}</span>
          <span className="text-xs text-slate-500">/ {metric.max}</span>
        </div>
        <p className="text-sm text-slate-400 truncate">{metric.label}</p>
        <div className="mt-2 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: metric.color }} />
        </div>
      </div>
    </div>
  );
}

function EncouragementBanner({ streak, message }: { streak: number; message: string }) {
  const getStreakColor = (s: number): string => {
    if (s >= 30) return 'text-amber-400';
    if (s >= 14) return 'text-orange-400';
    if (s >= 7) return 'text-yellow-400';
    return 'text-slate-400';
  };
  return (
    <div className={cn('relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-orange-900/30 border border-amber-600/20')}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className={cn('flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30')}>
          <Flame className={cn('w-6 h-6', getStreakColor(streak))} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={cn('text-2xl font-bold', getStreakColor(streak))}>{streak}</span>
            <span className="text-sm text-amber-400/80">días seguidos</span>
          </div>
          <p className="text-sm text-slate-400 italic">"{message}"</p>
        </div>
        {streak >= 7 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">¡En racha!</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30">
          <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-16 rounded bg-slate-700 animate-pulse" />
            <div className="h-4 w-32 rounded bg-slate-700 animate-pulse" />
            <div className="h-1.5 w-full rounded bg-slate-700 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualProgressWidget({ className = '', userId = 'default', userName = 'Buscador' }: SpiritualProgressWidgetProps) {
  const [loading, setLoading] = React.useState<LoadingState>('loading');
  const [metrics, setMetrics] = React.useState<ProgressMetric[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [message, setMessage] = React.useState('');

  // Store spiritual history values in state to avoid calling impure hook during render
  const [history, setHistory] = React.useState<{ date: string; rituals: { completed: boolean; name: string }[]; divinations: unknown[] }[]>([]);
  const [historyStreak, setHistoryStreak] = React.useState(0);

  // Initialize spiritual history data in useEffect to avoid render-time impure calls
  React.useEffect(() => {
    const { history: h, getStreak: gs } = useSpiritualHistory();
    setHistory(h);
    setHistoryStreak(gs());
  }, []);

  React.useEffect(() => {
    const loadProgress = async () => {
      setLoading('loading');
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const storageKey = `spiritual-progress-${userId}`;
      const saved = localStorage.getItem(storageKey);
      let ritualsCompleted = 12, readingsDone = 8, completions: string[] = [];
      
      if (saved) {
        try {
          const data = JSON.parse(saved);
          ritualsCompleted = data.ritualsCompleted ?? ritualsCompleted;
          readingsDone = data.readingsDone ?? readingsDone;
          completions = data.completionDates ?? completions;
        } catch { /* use defaults */ }
      }

      // Use state from spiritual history for streak
      const currentStreak = historyStreak > 0 ? historyStreak : calculateStreak(completions);
      setStreak(currentStreak);

      // Calculate readings from history
      const readingsDoneFromHistory = history.reduce((acc, entry) => acc + entry.divinations.length, 0);
      if (readingsDoneFromHistory > 0) {
        readingsDone = readingsDoneFromHistory;
      }

      // Calculate rituals from history
      const ritualsFromHistory = history.reduce((acc, entry) => {
        const completedRituals = entry.rituals.filter(r => r.completed).length;
        return acc + completedRituals;
      }, 0);
      if (ritualsFromHistory > 0) {
        ritualsCompleted = ritualsFromHistory;
      }

      const progressMetrics: ProgressMetric[] = [
        { id: 'rituals', label: 'Rituales completados', value: ritualsCompleted, max: 30, icon: <Sparkles className="w-5 h-5" />, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
        { id: 'readings', label: 'Lecturas realizadas', value: readingsDone, max: 20, icon: <BookOpen className="w-5 h-5" />, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.2)' },
        { id: 'streak', label: 'Días de práctica', value: currentStreak, max: 30, icon: <Flame className="w-5 h-5" />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
      ];

      setMetrics(progressMetrics);
      setMessage(currentStreak > 0 ? getRandomMessage(STREAK_MESSAGES) : getRandomMessage(ENCOURAGEMENT_MESSAGES));
      setLoading('loaded');
    };
    loadProgress();
  }, [userId, history, historyStreak]);

  const totalProgress = metrics.length > 0 ? Math.round(metrics.reduce((acc, m) => acc + (m.value / m.max) * 100, 0) / metrics.length) : 0;

  return (
    <Card className={cn('overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-300"><TrendingUp className="w-5 h-5" />Progreso Espiritual</CardTitle>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium text-amber-400">{totalProgress}%</span></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading === 'loading' ? (
          <LoadingSkeleton />
        ) : (
          <>
            <EncouragementBanner streak={streak} message={message} />
            <div className="grid gap-3">
              {metrics.map((metric, index) => (<MetricCard key={metric.id} metric={metric} index={index} />))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Heart className="w-4 h-4 text-pink-400" /><span>Consistencia es clave</span></div>
              <div className="flex items-center gap-1">
                {streak >= 7 && <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">¡En racha activa!</span>}
                {totalProgress >= 75 && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs">¡Excelente!</span>}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SpiritualProgressWidget;
