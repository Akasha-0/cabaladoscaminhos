// @ts-nocheck
// SKIP_LINT

/**
 * Gamificacao Data Module
 * Spiritual data for Gamificacao, the orixá of motivation, rewards, and achievement
 */

/**
 * Gamificacao Core Data
 */
export interface GamificacaoData {
  id: string;
  name: string;
  description: string;
  domains: string[];
  sacredObjects: string[];
  invocationPhrases: string[];
  element: string;
  dayOfWeek: string;
  colors: string[];
  path: string;
  attributes: GamificacaoAttributes;
}

/**
 * Gamificacao Attributes
 */
export interface GamificacaoAttributes {
  motivation: number;
  achievement: number;
  engagement: number;
  progression: number;
  reward: number;
}

/**
 * Gamificacao Achievement Types
 */
export interface AchievementType {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Gamificacao Reward Tiers
 */
export interface RewardTier {
  id: string;
  name: string;
  level: number;
  requirements: string[];
  benefits: string[];
}

/**
 * Gamificacao Level Progression
 */
export interface LevelProgression {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  unlockables: string[];
}

// Core Gamificacao Data
const GAMIFICACAO_DATA: GamificacaoData = {
  id: 'gamificacao',
  name: 'Gamificacao',
  description: 'The orixá of motivation, rewards, and achievement. Gamificacao governs the sacred art of transforming mundane activities into engaging experiences through game mechanics.',
  domains: [
    'motivation',
    'rewards',
    'achievements',
    'progression',
    'engagement',
    'goals',
    'challenges',
    'competition',
    'leaderboards',
    'badges',
    'points',
    'levels',
  ],
  sacredObjects: [
    'trophy',
    'medal',
    'crown',
    'scroll',
    'gem',
    'token',
    'badge',
  ],
  invocationPhrases: [
    'I honor the gamificacao that awakens my potential',
    'May my achievements be recognized and rewarded',
    'Guide me through challenges toward mastery',
    'Let motivation flow through every completed task',
    'I rise through levels of accomplishment',
  ],
  element: 'achievement',
  dayOfWeek: 'monday',
  colors: ['gold', 'silver', 'bronze', 'purple', 'emerald'],
  path: 'Achievement Path',
  attributes: {
    motivation: 85,
    achievement: 95,
    engagement: 90,
    progression: 88,
    reward: 92,
  },
};

// Achievement Types
const achievementTypes: AchievementType[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first task',
    category: 'beginner',
    points: 100,
    rarity: 'common',
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    points: 500,
    rarity: 'rare',
  },
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'Reach a new level',
    category: 'progression',
    points: 200,
    rarity: 'uncommon',
  },
  {
    id: 'challenge_conqueror',
    name: 'Challenge Conqueror',
    description: 'Complete a challenging task',
    category: 'challenge',
    points: 750,
    rarity: 'epic',
  },
  {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Help others in the community',
    category: 'social',
    points: 600,
    rarity: 'rare',
  },
  {
    id: 'master_achiever',
    name: 'Master Achiever',
    description: 'Reach master level status',
    category: 'master',
    points: 5000,
    rarity: 'legendary',
  },
];

// Reward Tiers
const rewardTiers: RewardTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Tier',
    level: 1,
    requirements: ['complete 10 tasks', 'earn 500 points'],
    benefits: ['basic badges', 'daily rewards', 'leaderboard visibility'],
  },
  {
    id: 'silver',
    name: 'Silver Tier',
    level: 2,
    requirements: ['complete 50 tasks', 'earn 2500 points', 'maintain 14-day streak'],
    benefits: ['premium badges', 'weekly rewards', 'challenge access', 'special leaderboard'],
  },
  {
    id: 'gold',
    name: 'Gold Tier',
    level: 3,
    requirements: ['complete 100 tasks', 'earn 10000 points', 'maintain 30-day streak'],
    benefits: ['exclusive badges', 'monthly rewards', 'advanced challenges', 'community recognition'],
  },
  {
    id: 'platinum',
    name: 'Platinum Tier',
    level: 4,
    requirements: ['complete 250 tasks', 'earn 50000 points', 'maintain 90-day streak'],
    benefits: ['legendary badges', 'quarterly rewards', 'expert challenges', 'featured profile'],
  },
  {
    id: 'diamond',
    name: 'Diamond Tier',
    level: 5,
    requirements: ['complete 500 tasks', 'earn 100000 points', 'maintain 180-day streak'],
    benefits: ['master badges', 'annual rewards', 'master challenges', 'mentor status'],
  },
];

// Level Progression
const levelProgression: LevelProgression[] = [
  { level: 1, name: 'Initiate', minPoints: 0, maxPoints: 500, unlockables: ['basic interface'] },
  { level: 2, name: 'Apprentice', minPoints: 500, maxPoints: 1500, unlockables: ['first badge'] },
  { level: 3, name: 'Journeyman', minPoints: 1500, maxPoints: 4000, unlockables: ['streak counter'] },
  { level: 4, name: 'Expert', minPoints: 4000, maxPoints: 10000, unlockables: ['leaderboard access'] },
  { level: 5, name: 'Master', minPoints: 10000, maxPoints: 25000, unlockables: ['advanced challenges'] },
  { level: 6, name: 'Grandmaster', minPoints: 25000, maxPoints: 50000, unlockables: ['community features'] },
  { level: 7, name: 'Legend', minPoints: 50000, maxPoints: 100000, unlockables: ['exclusive rewards'] },
  { level: 8, name: 'Mythic', minPoints: 100000, maxPoints: Infinity, unlockables: ['master status', 'mentor abilities'] },
];

/**
 * Get the main Gamificacao data
 */
export function getData(): GamificacaoData {
  return GAMIFICACAO_DATA;
}

/**
 * Get Gamificacao data by ID
 */
export function getDataById(id: string): GamificacaoData | undefined {
  return id === 'gamificacao' ? GAMIFICACAO_DATA : undefined;
}

/**
 * Get all achievement types
 */
export function getAchievementTypes(): AchievementType[] {
  return achievementTypes;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): AchievementType | undefined {
  return achievementTypes.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementType[] {
  return achievementTypes.filter(a => a.category === category);
}

/**
 * Get all reward tiers
 */
export function getRewardTiers(): RewardTier[] {
  return rewardTiers;
}

/**
 * Get reward tier by ID
 */
export function getRewardTierById(id: string): RewardTier | undefined {
  return rewardTiers.find(t => t.id === id);
}

/**
 * Get reward tier by level
 */
export function getRewardTierByLevel(level: number): RewardTier | undefined {
  return rewardTiers.find(t => t.level === level);
}

/**
 * Get level progression data
 */
export function getLevelProgression(): LevelProgression[] {
  return levelProgression;
}

/**
 * Get level by points
 */
export function getLevelByPoints(points: number): LevelProgression | undefined {
  return levelProgression.find(l => points >= l.minPoints && points <= l.maxPoints);
}

/**
 * Get Gamificacao domains
 */
export function getDomains(): string[] {
  return GAMIFICACAO_DATA.domains;
}

/**
 * Get sacred objects
 */
export function getSacredObjects(): string[] {
  return GAMIFICACAO_DATA.sacredObjects;
}

/**
 * Get invocation phrases
 */
export function getInvocationPhrases(): string[] {
  return GAMIFICACAO_DATA.invocationPhrases;
}

/**
 * Get Gamificacao by element
 */
export function getGamificacaoByElement(element: string): GamificacaoData | undefined {
  return GAMIFICACAO_DATA.element.toLowerCase().includes(element.toLowerCase()) ? GAMIFICACAO_DATA : undefined;
}

/**
 * Get Gamificacao by day
 */
export function getGamificacaoByDay(day: string): GamificacaoData | undefined {
  return GAMIFICACAO_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? GAMIFICACAO_DATA : undefined;
}

/**
 * Get Gamificacao attributes
 */
export function getAttributes(): GamificacaoAttributes {
  return GAMIFICACAO_DATA.attributes;
}

/**
 * Get Gamificacao colors
 */
export function getColors(): string[] {
  return GAMIFICACAO_DATA.colors;
}