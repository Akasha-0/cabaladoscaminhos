'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress, ProgressIndicator } from '@/components/ui/progress';
import { Lock, Unlock, Award, Star, Flame, Heart, Moon, Sun } from 'lucide-react';

type AchievementCategory = 'ritual' | 'meditation' | 'learning' | 'streak' | 'mastery' | 'social';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon?: string;
  progress?: number;
  target?: number;
  unlockedAt?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  variant?: 'compact' | 'expanded';
  onClick?: () => void;
}

const categoryConfig: Record<AchievementCategory, { icon: React.ReactNode; color: string; label: string }> = {
  ritual: { icon: <Star className="w-3 h-3" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Ritual' },
  meditation: { icon: <Moon className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Meditação' },
  learning: { icon: <Sun className="w-3 h-3" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Aprendizado' },
  streak: { icon: <Flame className="w-3 h-3" />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Sequência' },
  mastery: { icon: <Award className="w-3 h-3" />, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', label: 'Domínio' },
  social: { icon: <Heart className="w-3 h-3" />, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', label: 'Social' },
};

const categoryColors: Record<string, string> = {
  ritual: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  meditation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  learning: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  streak: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  mastery: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  social: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

function getCategoryConfig(category: string) {
  return categoryConfig[category as AchievementCategory] || categoryConfig.learning;
}

function getCategoryColor(category: string): string {
  return categoryColors[category] || categoryColors.learning;
}

export function AchievementBadge({ achievement, variant = 'compact', onClick }: AchievementBadgeProps) {
  const isUnlocked = Boolean(achievement.unlockedAt);
  const categoryInfo = getCategoryConfig(achievement.category);
  const categoryColor = getCategoryColor(achievement.category);
  const progressPercent = achievement.progress !== undefined && achievement.target
    ? Math.min(100, (achievement.progress / achievement.target) * 100)
    : isUnlocked ? 100 : 0;

  if (variant === 'compact') {
    return (
      <Card
        className={`transition-all ${isUnlocked ? 'cursor-pointer hover:border-primary/50' : 'opacity-60'}`}
        onClick={isUnlocked ? onClick : undefined}
      >
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`relative ${isUnlocked ? 'text-amber-400' : 'text-muted-foreground'}`}>
            {isUnlocked ? (
              <Unlock className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
            {isUnlocked && (
              <Award className="w-4 h-4 absolute -top-1 -right-1 text-amber-300 fill-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-sm truncate">{achievement.title}</p>
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColor} border text-[10px] px-1.5 py-0`} variant="outline">
                <span className="flex items-center gap-0.5">
                  {categoryInfo.icon}
                  {categoryInfo.label}
                </span>
              </Badge>
              {!isUnlocked && achievement.target && (
                <span className="text-xs text-muted-foreground">
                  {achievement.progress || 0}/{achievement.target}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all ${isUnlocked ? 'cursor-pointer hover:border-primary/50' : 'opacity-70'}`}
      onClick={isUnlocked ? onClick : undefined}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`relative ${isUnlocked ? 'text-amber-400' : 'text-muted-foreground'}`}>
            {isUnlocked ? (
              <Unlock className="w-10 h-10" />
            ) : (
              <Lock className="w-10 h-10" />
            )}
            {isUnlocked && (
              <Award className="w-5 h-5 absolute -top-1.5 -right-1.5 text-amber-300 fill-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="font-semibold leading-tight">{achievement.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
            <Badge className={`${categoryColor} border`} variant="outline">
              <span className="flex items-center gap-1">
                {categoryInfo.icon}
                {categoryInfo.label}
              </span>
            </Badge>
          </div>
        </div>

        {!isUnlocked && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium tabular-nums">
                {achievement.progress || 0}/{achievement.target || 0}
              </span>
            </div>
            <Progress value={progressPercent}>
              <ProgressIndicator />
            </Progress>
          </div>
        )}

        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-muted-foreground">
            Desbloqueado em: {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}