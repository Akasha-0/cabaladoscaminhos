'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress, ProgressIndicator } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Zap } from 'lucide-react';

interface StreakMilestone {
  days: number;
  label: string;
  achieved: boolean;
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  className?: string;
}

const MILESTONES: StreakMilestone[] = [
  { days: 3, label: '3 dias', achieved: false },
  { days: 7, label: '7 dias', achieved: false },
  { days: 14, label: '14 dias', achieved: false },
  { days: 30, label: '30 dias', achieved: false },
  { days: 60, label: '60 dias', achieved: false },
  { days: 90, label: '90 dias', achieved: false },
  { days: 180, label: '6 meses', achieved: false },
  { days: 365, label: '1 ano', achieved: false },
];

function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return MILESTONES.find(m => m.days > currentStreak) || null;
}

function getProgressToNextMilestone(currentStreak: number): number {
  const next = getNextMilestone(currentStreak);
  if (!next) return 100;
  const prev = MILESTONES.filter(m => m.days < next.days).pop();
  const start = prev?.days || 0;
  return ((currentStreak - start) / (next.days - start)) * 100;
}

function FlameAnimation({ active }: { active: boolean }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 3);
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  const scale = [1, 1.1, 1.05][frame];
  const opacity = [0.9, 1, 0.95][frame];

  return (
    <Flame
      className="text-orange-500"
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))',
      }}
    />
  );
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastPracticeDate,
  className,
}: StreakDisplayProps) {
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = getProgressToNextMilestone(currentStreak);
  const isActive = lastPracticeDate
    ? new Date(lastPracticeDate).toDateString() === new Date().toDateString() ||
      new Date(new Date(lastPracticeDate).getTime() + 86400000).toDateString() === new Date().toDateString()
    : currentStreak > 0;

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Header with flame */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlameAnimation active={isActive && currentStreak > 0} />
            <span className="text-lg font-semibold">Sequência Espiritual</span>
          </div>
          {isActive && currentStreak > 0 && (
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Ativa
            </Badge>
          )}
        </div>

        {/* Streak numbers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20">
            <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
            <div className="text-xs text-muted-foreground mt-1">Dias atuais</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="text-3xl font-bold text-amber-400">{longestStreak}</div>
            <div className="text-xs text-muted-foreground mt-1">Recorde</div>
          </div>
        </div>

        {/* Milestone progress */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próximo marco</span>
              <span className="font-medium">
                {nextMilestone.days - currentStreak} dias para {nextMilestone.label}
              </span>
            </div>
            <Progress value={progress} className="h-2">
              <ProgressIndicator
                className="bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>
        )}

        {/* All milestones */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground mb-2">Marcos de sequência</div>
          <div className="flex flex-wrap gap-2">
            {MILESTONES.map((milestone) => {
              const achieved = currentStreak >= milestone.days;
              return (
                <div
                  key={milestone.days}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    achieved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/10 text-muted-foreground border border-slate-500/20'
                  }`}
                >
                  {achieved ? (
                    <Trophy className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-current opacity-50" />
                  )}
                  <span>{milestone.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { StreakDisplayProps, StreakMilestone };