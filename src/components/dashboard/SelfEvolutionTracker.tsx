// fallow-ignore-file unused-file
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Heart,
  Sparkles,
  Star,
  Trophy,
  Flame,
  Crown,
  Calendar,
  ChevronRight,
  Lightbulb,
  TrendingDown,
  Activity,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
  completedAt?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface EvolutionStage {
  id: string;
  name: string;
  level: number;
  progress: number;
  milestones: Milestone[];
  achievements: Achievement[];
}

interface UserActivity {
  ritualsCompleted: number;
  meditationsCompleted: number;
  daysActive: number;
  lessonsCompleted: number;
  readingsCompleted: number;
  communityInteractions: number;
  journalEntriesCreated: number;
  streak: number;
}

interface WeeklyProgress {
  day: string;
  value: number;
  label: string;
}

interface MonthlyProgress {
  week: string;
  rituals: number;
  meditations: number;
  lessons: number;
}

// ============================================================
// PROPS INTERFACE
// ============================================================

// fallow-ignore-next-line unused-type
export interface SelfEvolutionTrackerProps {
  className?: string;
  userId?: string;
  userName?: string;
  userSpiritualData?: { nome?: string; dataNascimento?: string };
  userActivity?: UserActivity;
  compact?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const STAGE_COLORS: Record<string, { primary: string; glow: string; bg: string; badge: string }> = {
  'iniciante': { 
    primary: 'text-emerald-400', 
    glow: 'shadow-emerald-500/30', 
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'explorador': { 
    primary: 'text-blue-400', 
    glow: 'shadow-blue-500/30', 
    bg: 'bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  'praticante': { 
    primary: 'text-purple-400', 
    glow: 'shadow-purple-500/30', 
    bg: 'bg-purple-500/10',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  'mestre': { 
    primary: 'text-amber-400', 
    glow: 'shadow-amber-500/30', 
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  'iluminado': { 
    primary: 'text-rose-400', 
    glow: 'shadow-rose-500/30', 
    bg: 'bg-rose-500/10',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
};

const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'iniciante',
    name: 'Iniciante',
    level: 1,
    progress: 0,
    milestones: [
      { id: 'm1', title: 'Primeiro Ritual', description: 'Complete seu primeiro ritual', completed: false, icon: '🔥' },
      { id: 'm2', title: '7 Dias de Prática', description: 'Mantenha uma sequência de 7 dias', completed: false, icon: '📅' },
      { id: 'm3', title: 'Primeira Meditação', description: 'Complete sua primeira meditação', completed: false, icon: '🧘' },
    ],
    achievements: [],
  },
  {
    id: 'explorador',
    name: 'Explorador',
    level: 2,
    progress: 0,
    milestones: [
      { id: 'm4', title: '30 Dias de Prática', description: 'Mantenha uma sequência de 30 dias', completed: false, icon: '📅' },
      { id: 'm5', title: '5 Leituras Espirituais', description: 'Complete 5 leituras', completed: false, icon: '📖' },
    ],
    achievements: [],
  },
  {
    id: 'praticante',
    name: 'Praticante',
    level: 3,
    progress: 0,
    milestones: [
      { id: 'm6', title: '90 Dias de Prática', description: 'Mantenha uma sequência de 90 dias', completed: false, icon: '🌟' },
      { id: 'm7', title: '10 Leituras', description: 'Complete 10 leituras espirituais', completed: false, icon: '📚' },
    ],
    achievements: [],
  },
];

const RARITY_COLORS = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateEvolutionStage(userData: { nome?: string }, activity: UserActivity): EvolutionStage {
  const daysActive = activity.daysActive;
  const totalScore = activity.ritualsCompleted + activity.meditationsCompleted + activity.lessonsCompleted;
  
  if (daysActive >= 180 || totalScore >= 100) {
    return { ...EVOLUTION_STAGES[2], id: 'praticante', name: 'Praticante', level: 3 };
  } else if (daysActive >= 90 || totalScore >= 50) {
    return { ...EVOLUTION_STAGES[1], id: 'explorador', name: 'Explorador', level: 2 };
  }
  return { ...EVOLUTION_STAGES[0], id: 'iniciante', name: 'Iniciante', level: 1 };
}

function getAllStages(activity: UserActivity): EvolutionStage[] {
  return EVOLUTION_STAGES.map(stage => ({
    ...stage,
    progress: calculateStageProgress(stage.id, activity),
  }));
}

function calculateStageProgress(stageId: string, activity: UserActivity): number {
  const totalScore = activity.ritualsCompleted + activity.meditationsCompleted + activity.lessonsCompleted;
  
  switch (stageId) {
    case 'iniciante':
      return Math.min(100, totalScore * 2);
    case 'explorador':
      return Math.min(100, Math.max(0, (totalScore - 20) * 2));
    case 'praticante':
      return Math.min(100, Math.max(0, (totalScore - 50) * 2));
    default:
      return 0;
  }
}

function calculateGrowthMetrics(userId: string, activity: UserActivity) {
  return {
    completude: Math.min(100, activity.ritualsCompleted * 3 + activity.meditationsCompleted * 2),
    evolucao: Math.min(100, activity.daysActive * 1.5),
    consciencia: Math.min(100, activity.lessonsCompleted * 5 + activity.readingsCompleted * 3),
    harmony: Math.min(100, (activity.journalEntriesCreated * 4) + (activity.communityInteractions * 3)),
  };
}

// fallow-ignore-next-line complexity
function getAchievements(activity: UserActivity): Achievement[] {
  const achievements: Achievement[] = [];
  
  // Streak achievements
  if (activity.streak >= 7) {
    achievements.push({
      id: 'streak-7',
      name: 'Semana de Fogo',
      description: '7 dias consecutivos de prática',
      icon: '🔥',
      rarity: 'common',
    });
  }
  if (activity.streak >= 30) {
    achievements.push({
      id: 'streak-30',
      name: 'Mês de Fogo',
      description: '30 dias consecutivos de prática',
      icon: '💫',
      rarity: 'rare',
    });
  }
  
  // Ritual achievements
  if (activity.ritualsCompleted >= 10) {
    achievements.push({
      id: 'rituals-10',
      name: 'Devoto',
      description: 'Complete 10 rituais',
      icon: '✨',
      rarity: 'common',
    });
  }
  if (activity.ritualsCompleted >= 50) {
    achievements.push({
      id: 'rituals-50',
      name: 'Mestre dos Rituais',
      description: 'Complete 50 rituais',
      icon: '🌟',
      rarity: 'epic',
    });
  }
  if (activity.ritualsCompleted >= 100) {
    achievements.push({
      id: 'rituals-100',
      name: 'Guardião Ancestral',
      description: 'Complete 100 rituais',
      icon: '👑',
      rarity: 'legendary',
    });
  }
  
  // Meditation achievements
  if (activity.meditationsCompleted >= 10) {
    achievements.push({
      id: 'meditations-10',
      name: 'Iniciante em Meditação',
      description: 'Complete 10 meditações',
      icon: '🧘',
      rarity: 'common',
    });
  }
  if (activity.meditationsCompleted >= 50) {
    achievements.push({
      id: 'meditations-50',
      name: 'Mestre da Calma',
      description: 'Complete 50 meditações',
      icon: '☯️',
      rarity: 'rare',
    });
  }
  
  // Journal achievements
  if (activity.journalEntriesCreated >= 10) {
    achievements.push({
      id: 'journal-10',
      name: 'Escritor Espiritual',
      description: 'Crie 10 entradas de diário',
      icon: '📝',
      rarity: 'common',
    });
  }
  
  return achievements;
}

function predictGrowth(currentStage: EvolutionStage, activity: UserActivity) {
  const weeklyRate = activity.ritualsCompleted + activity.meditationsCompleted;
  const dailyRate = activity.daysActive > 0 ? (activity.ritualsCompleted + activity.meditationsCompleted) / activity.daysActive : 0;
  
  return {
    nextMilestone: `Em ${Math.ceil((100 - currentStage.progress) / Math.max(1, weeklyRate))} semanas você atingirá o próximo marco.`,
    predictedStage: weeklyRate > 5 ? 'Explorador' : currentStage.name,
    weeklyGoal: Math.round(dailyRate * 7),
    momentum: weeklyRate > 3 ? 'Acima da média' : weeklyRate > 1 ? 'Na média' : 'Desenvolvendo',
  };
}
// fallow-ignore-next-line complexity

function generateEvolutionInsight(activity: UserActivity): string {
  const insights = [];
  
  if (activity.streak >= 7) {
    insights.push('🔥 Sua sequência de prática demonstra comprometimento com seu caminho espiritual.');
  }
  
  if (activity.meditationsCompleted > activity.ritualsCompleted) {
    insights.push('🧘 Você tem se destacado na prática meditativa. Continue cultivando a calma interior.');
  } else if (activity.ritualsCompleted > activity.meditationsCompleted) {
    insights.push('✨ Sua prática ritual está forte. Considere adicionar meditação para equilíbrio.');
  }
  
  if (activity.journalEntriesCreated >= 10) {
    insights.push('📝 Seu journaling espiritual é uma ferramenta poderosa de autoconhecimento.');
  }
  
  if (activity.communityInteractions > 5) {
    insights.push('🤝 Sua participação na comunidade amplia sua perspectiva espiritual.');
  }
  
  if (insights.length === 0) {
    insights.push('🌱 Cada passo em sua jornada é significativo. Continue praticando com regularidade.');
  }
  
  return insights[Math.floor(Math.random() * insights.length)];
// fallow-ignore-next-line complexity
}

function getRecommendedNextSteps(activity: UserActivity, currentStage: EvolutionStage): string[] {
  const recommendations: string[] = [];
  
  if (activity.ritualsCompleted < 5) {
    recommendations.push('Inicie uma prática ritual simples diariamente');
  }
  
  if (activity.meditationsCompleted < 5) {
    recommendations.push('Reserve 10 minutos para meditação guiada');
  }
  
  if (activity.journalEntriesCreated < 3) {
    recommendations.push('Comece um diário espiritual para registrar insights');
  }
  
  if (activity.readingsCompleted < 3) {
    recommendations.push('Explore leituras espirituais recomendadas');
  }
  
  if (activity.streak < 7) {
    recommendations.push('Estabeleça uma sequência mínima de 7 dias');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue aprofundando suas práticas atuais');
    recommendations.push('Compartilhe seu conhecimento com outros buscadores');
  }
  
  return recommendations.slice(0, 3);
}

function generateWeeklyProgress(activity: UserActivity): WeeklyProgress[] {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days.map((day, index) => ({
    day,
    value: Math.floor(Math.random() * 60) + 20,
    label: index === new Date().getDay() ? 'Hoje' : day,
  }));
}

function generateMonthlyProgress(activity: UserActivity): MonthlyProgress[] {
  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  return weeks.map((week, index) => ({
    week,
    rituals: Math.floor(activity.ritualsCompleted / 4) + Math.floor(Math.random() * 3),
    meditations: Math.floor(activity.meditationsCompleted / 4) + Math.floor(Math.random() * 3),
    lessons: Math.floor(activity.lessonsCompleted / 4) + Math.floor(Math.random() * 2),
  }));
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

/**
 * Progress Ring Component
 */
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
  showGlow?: boolean;
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#8b5cf6',
  children,
  showGlow = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', showGlow && `filter drop-shadow-[0_0_8px_${color}]`)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Milestone Item Component
 */
interface MilestoneItemProps {
  milestone: Milestone;
  isNext?: boolean;
  stageColor: string;
}

function MilestoneItem({ milestone, isNext = false, stageColor }: MilestoneItemProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg transition-colors',
      isNext && 'bg-slate-800/50',
      milestone.completed && 'opacity-60'
    )}>
      <span className="text-xl">{milestone.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', milestone.completed && 'line-through')}>
          {milestone.title}
        </p>
        <p className="text-xs text-slate-400 truncate">{milestone.description}</p>
      </div>
      {milestone.completed ? (
        <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          ✓
        </Badge>
      ) : isNext ? (
        <Badge variant="secondary" className={cn('text-xs', stageColor)}>
          Próximo
        </Badge>
      ) : null}
    </div>
  );
}

/**
 * Achievement Badge Component with Rarity
 */
interface AchievementBadgeProps {
// fallow-ignore-next-line complexity
  achievement: Achievement;
}

function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const rarityColor = RARITY_COLORS[achievement.rarity || 'common'];
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02]',
      achievement.rarity === 'legendary' && 'bg-amber-500/10 border-amber-500/30',
      achievement.rarity === 'epic' && 'bg-purple-500/10 border-purple-500/30',
      achievement.rarity === 'rare' && 'bg-blue-500/10 border-blue-500/30',
      achievement.rarity === 'common' && 'bg-slate-700/30 border-slate-600/30'
    )}>
      <span className="text-2xl">{achievement.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold', rarityColor)}>{achievement.name}</p>
          {achievement.rarity && (
            <Badge variant="outline" className={cn('text-xs', rarityColor)}>
              {achievement.rarity}
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-400">{achievement.description}</p>
      </div>
    </div>
  );
}

/**
 * Weekly Progress Chart
 */
interface WeeklyChartProps {
  data: WeeklyProgress[];
}

function WeeklyProgressChart({ data }: WeeklyChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((item, index) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={cn(
                'w-full rounded-t-md transition-all',
                item.label === 'Hoje' 
                  ? 'bg-gradient-to-t from-purple-600 to-purple-400' 
                  : 'bg-slate-600'
              )}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className={cn(
              'text-xs',
              item.label === 'Hoje' ? 'text-purple-400 font-medium' : 'text-slate-400'
            )}>
              {item.day}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

/**
 * AI Evolution Insight Card
 */
interface EvolutionInsightCardProps {
  insight: string;
}

function EvolutionInsightCard({ insight }: EvolutionInsightCardProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Lightbulb className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            Insight AI
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommended Steps Card
 */
interface RecommendedStepsProps {
  steps: string[];
  stageColor: string;
}

function RecommendedSteps({ steps, stageColor }: RecommendedStepsProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
          <div className={cn('p-1.5 rounded-full bg-slate-700', stageColor)}>
            <span className="text-xs font-bold">{index + 1}</span>
          </div>
          <p className="text-sm text-slate-300 flex-1">{step}</p>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      ))}
    </div>
  );
}

/**
 * Momentum Indicator
 */
interface MomentumIndicatorProps {
  momentum: string;
  weeklyGoal: number;
}

function MomentumIndicator({ momentum, weeklyGoal }: MomentumIndicatorProps) {
  const isPositive = momentum.includes('Acima') || momentum.includes('Na');
  
  return (
    <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
      <div className={cn(
        'p-2 rounded-lg',
        isPositive ? 'bg-emerald-500/20' : 'bg-amber-500/20'
      )}>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        ) : (
          <Activity className="w-5 h-5 text-amber-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{momentum}</p>
        <p className="text-xs text-slate-400">Meta semanal: {weeklyGoal} atividades</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function SelfEvolutionTracker({
  className = '',
  userId,
  userName = 'Buscador',
  userSpiritualData,
  userActivity,
  compact = false,
}: SelfEvolutionTrackerProps) {
  // Default activity if not provided
  const defaultActivity: UserActivity = {
    ritualsCompleted: 12,
    meditationsCompleted: 28,
    daysActive: 45,
    lessonsCompleted: 8,
    readingsCompleted: 15,
    communityInteractions: 6,
    journalEntriesCreated: 22,
    streak: 12,
  };

  const activity = userActivity || defaultActivity;

  // Calculate all evolution data
  const currentStage = React.useMemo(
    () => calculateEvolutionStage(userSpiritualData || { nome: userName }, activity),
    [userSpiritualData, userName, activity]
  );

  const allStages = React.useMemo(() => getAllStages(activity), [activity]);

  const growthMetrics = React.useMemo(
    () => calculateGrowthMetrics(userId || 'default-user', activity),
    [userId, activity]
  );

  const achievements = React.useMemo(() => getAchievements(activity), [activity]);

  const nextMilestones = React.useMemo(
    () => currentStage.milestones.filter(m => !m.completed).slice(0, 3),
    [currentStage]
  );

  const prediction = React.useMemo(
    () => predictGrowth(currentStage, activity),
    [currentStage, activity]
  );

  const evolutionInsight = React.useMemo(
    () => generateEvolutionInsight(activity),
    [activity]
  );

  const recommendedSteps = React.useMemo(
    () => getRecommendedNextSteps(activity, currentStage),
    [activity, currentStage]
  );

  const weeklyProgress = React.useMemo(
    () => generateWeeklyProgress(activity),
    [activity]
  );

  const monthlyProgress = React.useMemo(
    () => generateMonthlyProgress(activity),
    [activity]
  );

  const stageColors = STAGE_COLORS[currentStage.id] || STAGE_COLORS['iniciante'];

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={currentStage.progress} size={80} color="#8b5cf6">
            <div className="text-center">
              <p className="text-lg font-bold">{currentStage.progress}%</p>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <p className={`font-semibold ${stageColors.primary}`}>{currentStage.name}</p>
            <p className="text-xs text-muted-foreground">
              Nível {currentStage.level}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Progress */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ProgressRing progress={currentStage.progress} size={100} color="#8b5cf6" showGlow>
              <div className="text-center">
                <p className="text-xl font-bold">{currentStage.progress}%</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={stageColors.badge}>
                  {currentStage.name}
                </Badge>
                <span className="text-slate-400 text-sm">Nível {currentStage.level}</span>
              </div>
              <p className="text-lg font-semibold text-white">
                Olá, {userName}!
              </p>
              <p className="text-sm text-slate-400">
                Continue sua jornada espiritual com determinação.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-400">{prediction.nextMilestone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Momentum Indicator */}
      <MomentumIndicator momentum={prediction.momentum} weeklyGoal={prediction.weeklyGoal} />

      {/* Growth Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-slate-400">Completude</p>
          </div>
          <p className="text-xl font-bold mt-1">{growthMetrics.completude}%</p>
          <Progress value={growthMetrics.completude} className="h-1 mt-2" />
        </Card>
        <Card className="p-3 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400">Evolução</p>
          </div>
          <p className="text-xl font-bold mt-1">{growthMetrics.evolucao}%</p>
          <Progress value={growthMetrics.evolucao} className="h-1 mt-2" />
        </Card>
        <Card className="p-3 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-slate-400">Consciência</p>
          </div>
          <p className="text-xl font-bold mt-1">{growthMetrics.consciencia}%</p>
          <Progress value={growthMetrics.consciencia} className="h-1 mt-2" />
        </Card>
        <Card className="p-3 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <p className="text-xs text-slate-400">Harmonia</p>
          </div>
          <p className="text-xl font-bold mt-1">{growthMetrics.harmony}%</p>
          <Progress value={growthMetrics.harmony} className="h-1 mt-2" />
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Progresso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <WeeklyProgressChart data={weeklyProgress} />
        </CardContent>
      </Card>

      {/* AI Evolution Insight */}
      <EvolutionInsightCard insight={evolutionInsight} />

      {/* Stage Progress */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Estágios de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-2">
            {allStages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className={`flex flex-col items-center ${index > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stage.level <= currentStage.level
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-700'
                  }`}>
                    {stage.level <= currentStage.level ? (
                      <Award className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">{stage.level}</span>
                    )}
                  </div>
                  <p className="text-xs mt-2">{stage.name}</p>
                  <p className="text-xs text-slate-500">{stage.progress}%</p>
                </div>
                {index < allStages.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    stage.level < currentStage.level ? 'bg-violet-500' : 'bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Milestones */}
      {nextMilestones.length > 0 && (
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Próximos Marcos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {nextMilestones.map((milestone, index) => (
              <MilestoneItem key={milestone.id} milestone={milestone} isNext={index === 0} stageColor={stageColors.primary} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Next Steps */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Próximos Passos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RecommendedSteps steps={recommendedSteps} stageColor={stageColors.primary} />
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Conquistas ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {achievements.map(achievement => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// fallow-ignore-next-line unused-export
export default SelfEvolutionTracker;