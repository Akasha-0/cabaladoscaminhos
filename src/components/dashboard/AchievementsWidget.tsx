// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Trophy, Star, Flame, Zap, Heart, Moon, Sun, Crown, Lock, ChevronRight, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AchievementsWidgetProps {
  className?: string;
  userData?: {
    nome?: string;
    nivel?: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Sparkles, color: 'amber' },
  { id: 'meditation', name: 'Meditação', icon: Moon, color: 'violet' },
  { id: 'ritual', name: 'Rituais', icon: Flame, color: 'orange' },
  { id: 'streak', name: 'Sequências', icon: Zap, color: 'emerald' },
  { id: 'social', name: 'Social', icon: Heart, color: 'pink' },
];

const ACHIEVEMENTS = [
  {
    id: 1,
    name: 'Primeiro Passo',
    description: 'Complete sua primeira meditação',
    icon: Star,
    color: 'amber',
    points: 100,
    category: 'meditation',
    unlocked: true,
    progress: 100,
    date: '15/01',
  },
  {
    id: 2,
    name: 'Devoto de Oxum',
    description: 'Faça 7 rituais para Oxum',
    icon: Droplets,
    color: 'cyan',
    points: 500,
    category: 'ritual',
    unlocked: true,
    progress: 100,
    date: '22/01',
  },
  {
    id: 3,
    name: 'Semana Perfeita',
    description: '7 dias consecutivos de prática',
    icon: Flame,
    color: 'orange',
    points: 300,
    category: 'streak',
    unlocked: true,
    progress: 100,
    date: '05/02',
  },
  {
    id: 4,
    name: 'Mestre da Lua',
    description: '30 meditações lunares',
    icon: Moon,
    color: 'violet',
    points: 1000,
    category: 'meditation',
    unlocked: false,
    progress: 67,
    date: null,
  },
  {
    id: 5,
    name: 'Caminhante',
    description: 'Alcance nível 5',
    icon: Award,
    color: 'amber',
    points: 750,
    category: 'all',
    unlocked: false,
    progress: 85,
    date: null,
  },
  {
    id: 6,
    name: 'Amigo do Axé',
    description: 'Indique 3 amigos',
    icon: Heart,
    color: 'pink',
    points: 400,
    category: 'social',
    unlocked: false,
    progress: 33,
    date: null,
  },
];

const RANKS = [
  { name: 'Iniciante', minPoints: 0, icon: Star, color: 'text-slate-400' },
  { name: 'Caminhante', minPoints: 1000, icon: Flame, color: 'text-amber-400' },
  { name: 'Devoto', minPoints: 5000, icon: Crown, color: 'text-orange-400' },
  { name: 'Mestre', minPoints: 15000, icon: Trophy, color: 'text-violet-400' },
  { name: 'Ancient', minPoints: 50000, icon: Sparkles, color: 'text-emerald-400' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const USER_STATS = {
  points: 8740,
  level: 3,
  rank: RANKS[1],
  totalAchievements: 8,
  unlockedThisMonth: 3,
};

function Droplets({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AchievementsWidget({ className, userData }: AchievementsWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const displayedAchievements = showAll ? filteredAchievements : filteredAchievements.slice(0, 4);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Conquistas
            </span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </CardTitle>

        {/* User Rank Card */}
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{USER_STATS.rank.name}</p>
                <p className="text-xs text-amber-400">{USER_STATS.points.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">{USER_STATS.level}</p>
              <p className="text-[10px] text-slate-400">Nível</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-500/20 text-${cat.color}-400 border border-${cat.color}-500/30`
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/50'
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Achievements List */}
        <div className="space-y-2">
// fallow-ignore-next-line complexity
          {displayedAchievements.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = achievement.unlocked;
            
            return (
              <div
                key={achievement.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20'
                    : 'bg-slate-800/30 border-slate-700/30 opacity-70'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                    : 'bg-slate-800/50'
                )}>
                  {isUnlocked ? (
                    <Icon className={cn('w-6 h-6', `text-${achievement.color}-400`)} />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isUnlocked ? 'text-white' : 'text-slate-400'
                  )}>
                    {achievement.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {achievement.description}
                  </p>
                  
                  {/* Progress bar */}
                  {!isUnlocked && achievement.progress < 100 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">{achievement.progress}%</span>
                        <span className="text-amber-400">+{achievement.points} XP</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Date/Points */}
                {isUnlocked ? (
                  <span className="text-xs text-slate-500">{achievement.date}</span>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-medium text-amber-400">+{achievement.points}</span>
                    <p className="text-[10px] text-slate-500">XP</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More */}
        {filteredAchievements.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1"
          >
            {showAll ? 'Ver menos' : `Ver mais (${filteredAchievements.length - 4})`}
            <ChevronRight className={cn('w-4 h-4 transition-transform', showAll && 'rotate-90')} />
          </button>
        )}

        {/* Next Rank Preview */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Próxima conquista</span>
            <span className="text-xs text-amber-400">+{RANKS[2].minPoints - USER_STATS.points} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className={cn('w-5 h-5', RANKS[2].color)} />
            <span className="text-sm font-medium text-white">{RANKS[2].name}</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              style={{ width: `${(USER_STATS.points / RANKS[2].minPoints) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AchievementsWidget;