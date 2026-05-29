// Evolution Engine - Core logic for calculating spiritual evolution stages

// ============================================================
// TYPES
// ============================================================

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface EvolutionStage {
  id: string;
  name: string;
  nivel: number;
  icon: string;
  color: string;
  description: string;
  milestones: Milestone[];
  progress: number; // 0-100
}

export interface UserActivity {
  ritualsCompleted: number;
  meditationsCompleted: number;
  daysActive: number;
  lessonsCompleted: number;
  readingsCompleted: number;
  communityInteractions: number;
  journalEntriesCreated: number;
  streak: number;
  lastActiveAt?: Date;
}

export interface GrowthMetrics {
  completionRate: number;
  evolutionVelocity: number;
  consciousnessScore: number;
  engagementScore: number;
  activeDays: number;
  totalActivities: number;
  weeklyProgress: number[];
  monthlyProgress: number;
  streakDays: number;
}

export interface GrowthPrediction {
  nextMilestone: string;
  estimatedDate: Date;
  confidence: number;
  projectedXP: number;
  daysToMilestone: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earnedAt?: Date;
  category: 'milestone' | 'stage' | 'system' | 'streak' | 'mastery';
}

export interface StageTransition {
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  celebratedAt: Date;
  rewards: Achievement[];
}

// ============================================================
// EVOLUTION STAGES CONFIGURATION
// ============================================================

interface StageConfig {
  id: string;
  name: string;
  nivel: number;
  icon: string;
  color: string;
  description: string;
  requiredPoints: number;
  milestones: Array<{ id: string; title: string; description: string; completed: boolean }>;
}

const EVOLUTION_STAGES_CONFIG: StageConfig[] = [
  {
    id: 'iniciante',
    name: 'Iniciante',
    nivel: 1,
    icon: 'sunrise',
    color: '#10b981',
    description: 'Primeiros passos na jornada espiritual. Despertar da consciência e conexão inicial com as práticas.',
    requiredPoints: 0,
    milestones: [
      { id: 'm1-1', title: 'Primeiro Contato', description: 'Complete sua primeira consulta ou ritual', completed: false },
      { id: 'm1-2', title: 'Despertar', description: 'Assista 3 lições introdutórias', completed: false },
      { id: 'm1-3', title: 'Criança de Oxum', description: 'Faça sua primeira oferenda simples', completed: false },
      { id: 'm1-4', title: 'Explorador', description: 'Experimente 3 diferentes práticas espirituais', completed: false },
    ],
  },
  {
    id: 'explorador',
    name: 'Explorador',
    nivel: 2,
    icon: 'compass',
    color: '#06b6d4',
    description: 'Explorando os caminhos da espiritualidade. Conexão com orixás e práticas básicas.',
    requiredPoints: 100,
    milestones: [
      { id: 'm2-1', title: 'Ritual de Lua', description: 'Complete um ritual durante lua cheia', completed: false },
      { id: 'm2-2', title: 'Guardião Revelado', description: 'Identifique seu orixá guardião', completed: false },
      { id: 'm2-3', title: 'Meditante', description: 'Complete 7 dias de meditação', completed: false },
      { id: 'm2-4', title: 'Diário Espiritual', description: 'Crie 10 entradas no diário', completed: false },
    ],
  },
  {
    id: 'praticante',
    name: 'Praticante',
    nivel: 3,
    icon: 'flame',
    color: '#f59e0b',
    description: 'Praticando consistentemente. Desenvolvimento de disciplina espiritual e rituais.',
    requiredPoints: 300,
    milestones: [
      { id: 'm3-1', title: 'Ritualista', description: 'Complete 21 rituais de proteção', completed: false },
      { id: 'm3-2', title: 'Mapa Completo', description: 'Solicite análise completa do mapa astral', completed: false },
      { id: 'm3-3', title: 'Ciclo Lunar', description: 'Complete um ciclo de 28 dias de práticas', completed: false },
      { id: 'm3-4', title: 'Professor Iniciante', description: 'Compartilhe conhecimento com 5 pessoas', completed: false },
    ],
  },
  {
    id: 'mestre',
    name: 'Mestre',
    nivel: 4,
    icon: 'crown',
    color: '#8b5cf6',
    description: 'Dominando os ensinamentos. Capacidade de ensinar e guiar outros buscadores.',
    requiredPoints: 700,
    milestones: [
      { id: 'm4-1', title: 'Mestre dos Rituais', description: 'Dominar diferentes tipos de rituais', completed: false },
      { id: 'm4-2', title: 'Líder Espiritual', description: 'Liderar um grupo de oração por dias', completed: false },
      { id: 'm4-3', title: 'Curandeiro', description: 'Realizar rituais de cura', completed: false },
      { id: 'm4-4', title: 'Guardião da Tradição', description: 'Ensinar formalmente outros alunos', completed: false },
    ],
  },
  {
    id: 'iluminado',
    name: 'Iluminado',
    nivel: 5,
    icon: 'sparkles',
    color: '#ec4899',
    description: 'Iluminação e maestria total. Integração completa dos ensinamentos ancestrais.',
    requiredPoints: 1500,
    milestones: [
      { id: 'm5-1', title: 'União Cósmica', description: 'Alcançar estado de samadhi', completed: false },
      { id: 'm5-2', title: 'Canal Divino', description: 'Receber revelações espirituais', completed: false },
      { id: 'm5-3', title: 'Transmutador', description: 'Realizar rituais de transmutação', completed: false },
      { id: 'm5-4', title: 'Legado Espiritual', description: 'Estabelecer linhagem de ensinamentos', completed: false },
    ],
  },
];

// ============================================================
// ACTIVITY WEIGHTS FOR CALCULATIONS
// ============================================================

const ACTIVITY_WEIGHTS = {
  ritual: 10,
  meditation: 5,
  lesson: 8,
  reading: 3,
  journal: 2,
  community: 4,
} as const;

// ============================================================
// ICON MAPPING
// ============================================================

export const ICON_MAP: Record<string, string> = {
  sunrise: '🌅',
  compass: '🧭',
  flame: '🔥',
  crown: '👑',
  sparkles: '✨',
  moon: '🌙',
  star: '⭐',
  sun: '☀️',
  heart: '❤️',
  book: '📖',
  trophy: '🏆',
  medal: '🏅',
  target: '🎯',
  zap: '⚡',
  tree: '🌳',
  mountain: '⛰️',
  wave: '🌊',
  wind: '🌬️',
  fire: '🔥',
  earth: '🌍',
  diamond: '💎',
  lightning: '⚡',
};

// ============================================================
// TIER CONFIGURATIONS
// ============================================================

export const ACHIEVEMENT_TIERS = {
  bronze: { threshold: 1, color: '#cd7f32', multiplier: 1 },
  silver: { threshold: 5, color: '#c0c0c0', multiplier: 2 },
  gold: { threshold: 10, color: '#ffd700', multiplier: 3 },
  platinum: { threshold: 25, color: '#e5e4e2', multiplier: 5 },
  diamond: { threshold: 50, color: '#b9f2ff', multiplier: 10 },
} as const;

// ============================================================
// CORE CALCULATION FUNCTIONS
// ============================================================

/**
 * Calculate total activity points from user activity
 */
export function calculateActivityPoints(activity: UserActivity): number {
  const weightedPoints =
    activity.ritualsCompleted * ACTIVITY_WEIGHTS.ritual +
    activity.meditationsCompleted * ACTIVITY_WEIGHTS.meditation +
    activity.lessonsCompleted * ACTIVITY_WEIGHTS.lesson +
    activity.readingsCompleted * ACTIVITY_WEIGHTS.reading +
    activity.journalEntriesCreated * ACTIVITY_WEIGHTS.journal +
    activity.communityInteractions * ACTIVITY_WEIGHTS.community;

  // Bonus for streaks
  const streakBonus = Math.min(activity.streak * 0.5, 50);

  return Math.floor(weightedPoints + streakBonus);
}

/**
 * Check if a milestone is completed based on activity
 */
function checkMilestoneCompletion(milestoneId: string, activity: UserActivity): boolean {
  switch (milestoneId) {
    case 'm1-1':
      return activity.ritualsCompleted >= 1;
    case 'm1-2':
      return activity.lessonsCompleted >= 3;
    case 'm1-3':
      return activity.ritualsCompleted >= 2;
    case 'm1-4':
      return (
        activity.ritualsCompleted >= 1 &&
        activity.meditationsCompleted >= 1 &&
        activity.readingsCompleted >= 1
      );

    case 'm2-1':
      return activity.ritualsCompleted >= 5;
    case 'm2-2':
      return activity.readingsCompleted >= 8;
    case 'm2-3':
      return activity.meditationsCompleted >= 7;
    case 'm2-4':
      return activity.journalEntriesCreated >= 10;

    case 'm3-1':
      return activity.ritualsCompleted >= 21;
    case 'm3-2':
      return activity.readingsCompleted >= 15;
    case 'm3-3':
      return activity.daysActive >= 28 && activity.meditationsCompleted >= 28;
    case 'm3-4':
      return activity.communityInteractions >= 5;

    case 'm4-1':
      return activity.ritualsCompleted >= 50;
    case 'm4-2':
      return activity.daysActive >= 60 && activity.communityInteractions >= 20;
    case 'm4-3':
      return activity.journalEntriesCreated >= 100;
    case 'm4-4':
      return activity.communityInteractions >= 50;

    case 'm5-1':
      return activity.meditationsCompleted >= 365;
    case 'm5-2':
      return activity.journalEntriesCreated >= 365;
    case 'm5-3':
      return activity.ritualsCompleted >= 200;
    case 'm5-4':
      return activity.communityInteractions >= 100;

    default:
      return false;
  }
}

/**
 * Determine evolution stage based on user data and activity
 */
export function calculateEvolutionStage(
  userData: { nome?: string; dataNascimento?: string },
  activity: UserActivity
): EvolutionStage {
  const totalPoints = calculateActivityPoints(activity);

  // Find the appropriate stage
  let currentStage = EVOLUTION_STAGES_CONFIG[0];
  let nextStage: StageConfig | null = null;

  for (let i = 0; i < EVOLUTION_STAGES_CONFIG.length; i++) {
    const stage = EVOLUTION_STAGES_CONFIG[i];
    if (totalPoints >= stage.requiredPoints) {
      currentStage = stage;
      nextStage = EVOLUTION_STAGES_CONFIG[i + 1] || null;
    } else {
      break;
    }
  }

  // Calculate progress within current stage
  const currentStageMinPoints = currentStage.requiredPoints;
  const nextStagePoints = nextStage?.requiredPoints ?? currentStage.requiredPoints + 1000;
  const pointsInStage = totalPoints - currentStageMinPoints;
  const stageRange = nextStagePoints - currentStageMinPoints;
  const progress = Math.min(Math.round((pointsInStage / stageRange) * 100), 100);

  // Calculate milestone completion status based on activity
  const milestones: Milestone[] = currentStage.milestones.map((milestone) => {
    const completed = checkMilestoneCompletion(milestone.id, activity);
    return {
      ...milestone,
      completed,
      completedAt: completed ? new Date() : undefined,
    };
  });

  return {
    id: currentStage.id,
    name: currentStage.name,
    nivel: currentStage.nivel,
    icon: currentStage.icon,
    color: currentStage.color,
    description: currentStage.description,
    milestones,
    progress,
  };
}

/**
 * Get next milestones for user to complete
 */
export function getNextMilestones(
  currentStage: EvolutionStage,
  _userData: { nome?: string }
): Milestone[] {
  // Get incomplete milestones from current stage
  const incompleteCurrentMilestones = currentStage.milestones.filter((m) => !m.completed);

  // If all current milestones are complete, look at next stage
  if (incompleteCurrentMilestones.length === 0) {
    const nextStageIndex = EVOLUTION_STAGES_CONFIG.findIndex(
      (s) => s.id === currentStage.id
    ) + 1;

    if (nextStageIndex < EVOLUTION_STAGES_CONFIG.length) {
      const nextStage = EVOLUTION_STAGES_CONFIG[nextStageIndex];
      return nextStage.milestones.slice(0, 3).map((m) => ({
        ...m,
        completed: false,
      }));
    }
  }

  return incompleteCurrentMilestones.slice(0, 3);
}

/**
 * Calculate comprehensive growth metrics
 */
export function calculateGrowthMetrics(
  _userId: string,
  activity: UserActivity
): GrowthMetrics {
  // Calculate total milestones across all stages
  const totalMilestones = EVOLUTION_STAGES_CONFIG.reduce(
    (acc, stage) => acc + stage.milestones.length,
    0
  );

  // Count completed milestones
  let completedMilestones = 0;
  for (const stage of EVOLUTION_STAGES_CONFIG) {
    for (const milestone of stage.milestones) {
      if (checkMilestoneCompletion(milestone.id, activity)) {
        completedMilestones++;
      }
    }
  }

  const completionRate =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Evolution velocity: stages completed per 30 days
  const daysActive = activity.daysActive || 1;
  const points = calculateActivityPoints(activity);
  const stagesProgress = (points / 1500) * 5; // max 5 stages
  const evolutionVelocity = (stagesProgress / Math.max(daysActive / 30, 1)) * 100;

  // Consciousness score: weighted by understanding depth
  const totalActivities =
    activity.ritualsCompleted +
    activity.meditationsCompleted +
    activity.lessonsCompleted +
    activity.readingsCompleted;
  const maxActivities = 365;
  const consciousnessScore = Math.min((totalActivities / maxActivities) * 100, 100);

  // Engagement score: combination of streak and activity diversity
  const activityTypes =
    (activity.ritualsCompleted > 0 ? 1 : 0) +
    (activity.meditationsCompleted > 0 ? 1 : 0) +
    (activity.lessonsCompleted > 0 ? 1 : 0) +
    (activity.readingsCompleted > 0 ? 1 : 0) +
    (activity.journalEntriesCreated > 0 ? 1 : 0) +
    (activity.communityInteractions > 0 ? 1 : 0);
  const engagementScore =
    (Math.min(activity.streak / 30, 1) * 50) + ((activityTypes / 6) * 50);

  // Generate weekly progress (last 7 days simulation)
  const avgDaily = points / Math.max(daysActive, 1);
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const variation = 0.75 + Math.random() * 0.5; // 75% to 125% variation
    return Math.round(avgDaily * variation * (1 + i * 0.1));
  });

  // Monthly progress
  const monthlyProgress = Math.round(
    (points / Math.max(activity.daysActive || 30, 1)) *
      30 *
      Math.min((activity.daysActive || 1) / 30, 1)
  );

  return {
    completionRate: Math.round(completionRate * 10) / 10,
    evolutionVelocity: Math.round(evolutionVelocity * 10) / 10,
    consciousnessScore: Math.round(consciousnessScore * 10) / 10,
    engagementScore: Math.round(engagementScore * 10) / 10,
    activeDays: activity.daysActive,
    totalActivities,
    weeklyProgress,
    monthlyProgress,
    streakDays: activity.streak,
  };
}

/**
 * Predict growth based on current activity patterns
 */
export function predictGrowth(
  currentStage: EvolutionStage,
  activity: UserActivity
): GrowthPrediction {
  const points = calculateActivityPoints(activity);
  const avgDailyProgress = points / Math.max(activity.daysActive || 1);

  // Calculate points needed for next milestone
  const incompleteMilestones = currentStage.milestones.filter((m) => !m.completed);
  let pointsNeeded = 50;

  if (incompleteMilestones.length > 0) {
    pointsNeeded = getMilestonePointsRequired(incompleteMilestones[0].id);
  }

  const dailyRate = avgDailyProgress > 0 ? avgDailyProgress : 5;
  const daysToMilestone = Math.ceil(pointsNeeded / dailyRate);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysToMilestone);

  // Calculate confidence based on streak and consistency
  const streakBonus = Math.min(activity.streak * 0.02, 0.3);
  const activityBonus = activity.daysActive > 30 ? 0.1 : 0;
  const confidence = Math.min(0.5 + streakBonus + activityBonus, 0.95);

  return {
    nextMilestone: incompleteMilestones[0]?.title || 'Evolução Contínua',
    estimatedDate,
    confidence: Math.round(confidence * 100) / 100,
    projectedXP: points + daysToMilestone * dailyRate,
    daysToMilestone,
    difficulty: getMilestoneDifficulty(incompleteMilestones[0]?.id || ''),
  };
}

function getMilestonePointsRequired(milestoneId: string): number {
  switch (milestoneId) {
    case 'm1-1':
    case 'm1-2':
      return 30;
    case 'm1-3':
    case 'm1-4':
      return 50;
    case 'm2-1':
    case 'm2-2':
      return 80;
    case 'm2-3':
    case 'm2-4':
      return 100;
    case 'm3-1':
      return 150;
    case 'm3-2':
    case 'm3-3':
    case 'm3-4':
      return 200;
    default:
      return 100;
  }
}

function getMilestoneDifficulty(milestoneId: string): 'easy' | 'medium' | 'hard' {
  const easyMilestones = ['m1-1', 'm1-2', 'm2-3', 'm2-4'];
  const hardMilestones = ['m3-1', 'm4-1', 'm4-2', 'm5-1', 'm5-3'];

  if (easyMilestones.includes(milestoneId)) return 'easy';
  if (hardMilestones.includes(milestoneId)) return 'hard';
  return 'medium';
}

/**
 * Get achievements based on user activity
 */
export function getAchievements(activity: UserActivity): Achievement[] {
  const achievements: Achievement[] = [];

  // Count completed milestones
  const completedCount = EVOLUTION_STAGES_CONFIG.reduce((acc, stage) => {
    return acc + stage.milestones.filter((m) => checkMilestoneCompletion(m.id, activity)).length;
  }, 0);

  // Milestone achievements
  if (completedCount >= 1) {
    achievements.push({
      id: 'first-milestone',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro marco',
      icon: 'star',
      tier: 'bronze',
      earnedAt: new Date(),
      category: 'milestone',
    });
  }

  if (completedCount >= 10) {
    achievements.push({
      id: 'milestone-master',
      title: 'Mestre dos Marcos',
      description: 'Complete 10 marcos',
      icon: 'trophy',
      tier: 'gold',
      earnedAt: new Date(),
      category: 'milestone',
    });
  }

  // Streak achievements
  if (activity.streak >= 7) {
    achievements.push({
      id: 'week-warrior',
      title: 'Guerreiro da Semana',
      description: 'Mantenha 7 dias consecutivos',
      icon: 'flame',
      tier: 'silver',
      earnedAt: new Date(),
      category: 'streak',
    });
  }

  if (activity.streak >= 30) {
    achievements.push({
      id: 'month-master',
      title: 'Mestre do Mês',
      description: 'Mantenha 30 dias consecutivos',
      icon: 'crown',
      tier: 'platinum',
      earnedAt: new Date(),
      category: 'streak',
    });
  }

  // Stage achievements
  const points = calculateActivityPoints(activity);
  if (points >= 100) {
    achievements.push({
      id: 'stage-explorer',
      title: 'Explorador',
      description: 'Alcance o estágio Explorador',
      icon: 'compass',
      tier: 'bronze',
      earnedAt: points >= 100 ? new Date() : undefined,
      category: 'stage',
    });
  }

  if (points >= 300) {
    achievements.push({
      id: 'stage-practitioner',
      title: 'Praticante Dedicado',
      description: 'Alcance o estágio Praticante',
      icon: 'flame',
      tier: 'silver',
      earnedAt: points >= 300 ? new Date() : undefined,
      category: 'stage',
    });
  }

  // System mastery badges
  if (activity.ritualsCompleted >= 50) {
    achievements.push({
      id: 'ritual-master',
      title: 'Mestre dos Rituals',
      description: 'Complete 50 rituais',
      icon: 'flame',
      tier: 'gold',
      earnedAt: activity.ritualsCompleted >= 50 ? new Date() : undefined,
      category: 'mastery',
    });
  }

  if (activity.meditationsCompleted >= 100) {
    achievements.push({
      id: 'meditation-master',
      title: 'Mestre da Meditação',
      description: 'Complete 100 медитаções',
      icon: 'moon',
      tier: 'gold',
      earnedAt: activity.meditationsCompleted >= 100 ? new Date() : undefined,
      category: 'mastery',
    });
  }

  if (activity.journalEntriesCreated >= 50) {
    achievements.push({
      id: 'journal-keeper',
      title: 'Guardião do Diário',
      description: 'Crie 50 entradas no diário',
      icon: 'book',
      tier: 'silver',
      earnedAt: activity.journalEntriesCreated >= 50 ? new Date() : undefined,
      category: 'system',
    });
  }

  return achievements;
}

/**
 * Check for stage transition opportunity
 */
export function checkStageTransition(
  currentStage: EvolutionStage,
  activity: UserActivity
): StageTransition | null {
  const totalPoints = calculateActivityPoints(activity);
  const currentStageIndex = EVOLUTION_STAGES_CONFIG.findIndex(
    (s) => s.id === currentStage.id
  );
  const nextStage = EVOLUTION_STAGES_CONFIG[currentStageIndex + 1];

  if (!nextStage || totalPoints < nextStage.requiredPoints) {
    return null;
  }

  // Create new stage representation
  const newStage: EvolutionStage = {
    id: nextStage.id,
    name: nextStage.name,
    nivel: nextStage.nivel,
    icon: nextStage.icon,
    color: nextStage.color,
    description: nextStage.description,
    milestones: nextStage.milestones.map((m) => ({ ...m, completed: false })),
    progress: 0,
  };

  // Generate celebration rewards
  const rewards: Achievement[] = [
    {
      id: `stage-${nextStage.id}`,
      title: `Ascensão: ${nextStage.name}`,
      description: `Você alcançou o estágio ${nextStage.name}`,
      icon: nextStage.icon,
      tier: 'gold',
      earnedAt: new Date(),
      category: 'stage',
    },
  ];

  // Bonus achievement for fast progression
  if (currentStageIndex >= 2) {
    rewards.push({
      id: 'rapid-ascension',
      title: 'Ascensão Rápida',
      description: 'Alcance 3 estágios em tempo recorde',
      icon: 'lightning',
      tier: 'diamond',
      earnedAt: new Date(),
      category: 'stage',
    });
  }

  return {
    fromStage: currentStage,
    toStage: newStage,
    celebratedAt: new Date(),
    rewards,
  };
}

/**
 * Get all evolution stages with completion status
 */
export function getAllStages(activity: UserActivity): EvolutionStage[] {
  const totalPoints = calculateActivityPoints(activity);

  return EVOLUTION_STAGES_CONFIG.map((stage) => {
    const isUnlocked = totalPoints >= stage.requiredPoints;
    const nextStagePoints =
      EVOLUTION_STAGES_CONFIG[
        EVOLUTION_STAGES_CONFIG.findIndex((s) => s.id === stage.id) + 1
      ]?.requiredPoints ?? stage.requiredPoints + 1000;

    let progress = 0;
    if (isUnlocked) {
      const pointsInStage = totalPoints - stage.requiredPoints;
      const stageRange = nextStagePoints - stage.requiredPoints;
      progress = Math.min(Math.round((pointsInStage / stageRange) * 100), 100);
    }

    const milestones: Milestone[] = stage.milestones.map((m) => ({
      ...m,
      completed: checkMilestoneCompletion(m.id, activity),
      completedAt: checkMilestoneCompletion(m.id, activity) ? new Date() : undefined,
    }));

    return {
      id: stage.id,
      name: stage.name,
      nivel: stage.nivel,
      icon: stage.icon,
      color: stage.color,
      description: stage.description,
      milestones,
      progress: isUnlocked ? progress : 0,
    };
  });
}

/**
 * Generate insights based on current state
 */
export function generateInsights(
  currentStage: EvolutionStage,
  activity: UserActivity
): string[] {
  const insights: string[] = [];

  // Stage-based insights
  if (currentStage.nivel === 1) {
    insights.push(
      'Seu despertar espiritual está apenas começando. Cada pequeno passo constrói uma fundação sólida para sua jornada.'
    );
  } else if (currentStage.nivel === 2) {
    insights.push(
      'Você está desenvolvendo consistência em suas práticas. A conexão com seus orixás se aprofundará naturalmente.'
    );
  } else if (currentStage.nivel === 3) {
    insights.push(
      'Sua prática está amadurecendo. Considere explorar rituais mais avançados e compartilhá-los com outros.'
    );
  } else if (currentStage.nivel >= 4) {
    insights.push(
      'Você está em um caminho de maestria. Sua experiência pode iluminar o caminho para outros buscadores.'
    );
  }

  // Activity-based insights
  if (activity.streak >= 7) {
    insights.push(
      `Impressionante! ${activity.streak} dias consecutivos. Sua dedicação está acelerando seu crescimento espiritual.`
    );
  }

  if (activity.meditationsCompleted > activity.ritualsCompleted * 2) {
    insights.push(
      'Você está priorizando a meditação. Isso indica busca por experiência interior profunda.'
    );
  } else if (activity.ritualsCompleted > activity.meditationsCompleted * 2) {
    insights.push(
      'Você está focado em rituais externos. Considere equilibrar com práticas contemplativas.'
    );
  }

  if (activity.communityInteractions === 0) {
    insights.push(
      'Sua jornada está sendo solitária. A comunidade espiritual pode acelerar seu crescimento.'
    );
  }

  // Milestone insights
  const completedCount = currentStage.milestones.filter((m) => m.completed).length;
  if (completedCount === 0) {
    insights.push(
      'Você ainda não completou marcos neste estágio. Foque em um objetivo de cada vez.'
    );
  } else if (completedCount === currentStage.milestones.length) {
    insights.push(
      `Parabéns! Você completou todos os marcos de ${currentStage.name}. Uma nova fase aguarda!`
    );
  }

  return insights;
}

// ============================================================
// DEFAULT EXPORTS
// ============================================================

export const DEFAULT_ACTIVITY: UserActivity = {
  ritualsCompleted: 0,
  meditationsCompleted: 0,
  daysActive: 0,
  lessonsCompleted: 0,
  readingsCompleted: 0,
  communityInteractions: 0,
  journalEntriesCreated: 0,
  streak: 0,
};

export const EVOLUTION_STAGES = EVOLUTION_STAGES_CONFIG;
