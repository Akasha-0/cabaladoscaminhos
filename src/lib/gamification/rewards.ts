/**
 * Streak rewards system
 * Provides rewards based on consecutive days of practice
 */

export type RewardTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Reward {
  id: string;
  tier: RewardTier;
  name: string;
  description: string;
  streakDays: number;
  type: 'badge' | 'title' | 'bonus' | 'feature';
}

export interface StreakReward {
  reward: Reward;
  unlocked: boolean;
  unlockedAt?: string;
}

/**
 * Reward definitions indexed by minimum streak days
 */
const REWARDS: Reward[] = [
  // Bronze tier
  { id: 'streak_3', tier: 'bronze', name: 'Iniciante', description: 'Mantenha uma sequência de 3 dias', streakDays: 3, type: 'badge' },
  { id: 'streak_7', tier: 'bronze', name: 'Primeira Semana', description: '7 dias consecutivos de prática', streakDays: 7, type: 'badge' },

  // Silver tier
  { id: 'streak_14', tier: 'silver', name: 'Duas Semanas', description: '14 dias consecutivos de prática', streakDays: 14, type: 'badge' },
  { id: 'streak_21', tier: 'silver', name: 'Compromisso', description: '21 dias de dedicação contínua', streakDays: 21, type: 'title' },

  // Gold tier
  { id: 'streak_30', tier: 'gold', name: 'Mês de Prática', description: '30 dias consecutivos', streakDays: 30, type: 'badge' },
  { id: 'streak_60', tier: 'gold', name: 'Guardião da Prática', description: '60 dias de prática consistente', streakDays: 60, type: 'title' },
  { id: 'streak_90', tier: 'gold', name: 'Trimestre de Ouro', description: '90 dias de dedicação', streakDays: 90, type: 'feature' },

  // Platinum tier
  { id: 'streak_120', tier: 'platinum', name: 'Mestre do Ritmo', description: '120 dias mantendo o ritmo', streakDays: 120, type: 'title' },
  { id: 'streak_180', tier: 'platinum', name: 'Devoção Platinada', description: '180 dias de prática devotion', streakDays: 180, type: 'badge' },
  { id: 'streak_270', tier: 'platinum', name: 'Tradição Viva', description: '270 dias de tradição viva', streakDays: 270, type: 'feature' },

  // Diamond tier
  { id: 'streak_365', tier: 'diamond', name: 'Ano de Prática', description: 'Um ano completo de prática diária', streakDays: 365, type: 'badge' },
  { id: 'streak_500', tier: 'diamond', name: 'Lenda do Ritual', description: '500 dias de prática legendária', streakDays: 500, type: 'title' },
  { id: 'streak_1000', tier: 'diamond', name: 'Guardião Ancestral', description: '1000 dias de caminhada ancestral', streakDays: 1000, type: 'feature' },
];

const REWARDS_STORAGE_KEY = 'gamification_streak_rewards';

/**
 * Get current streak days from streak tracking
 */
function getCurrentStreakDays(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = localStorage.getItem('cabala_streak');
    if (!stored) return 0;

    const streak = JSON.parse(stored);
    return streak?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get stored unlocked rewards
 */
function getStoredRewards(): { unlocked: string[] } {
  if (typeof window === 'undefined') return { unlocked: [] };

  try {
    const stored = localStorage.getItem(REWARDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { unlocked: [] };
  } catch {
    return { unlocked: [] };
  }
}

/**
 * Save unlocked rewards
 */
function saveRewards(data: { unlocked: string[] }): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

/**
 * Check and unlock rewards based on current streak
 */
function syncRewards(): string[] {
  const currentStreak = getCurrentStreakDays();
  const { unlocked } = getStoredRewards();
  const unlockedSet = new Set(unlocked);

  for (const reward of REWARDS) {
    if (currentStreak >= reward.streakDays && !unlockedSet.has(reward.id)) {
      unlockedSet.add(reward.id);
    }
  }

  const newUnlocked = Array.from(unlockedSet);
  if (newUnlocked.length !== unlocked.length) {
    saveRewards({ unlocked: newUnlocked });
  }

  return newUnlocked;
}

/**
 * Get all streak rewards with their unlock status
 */
export function getStreakRewards(): StreakReward[] {
  const unlockedIds = syncRewards();

  return REWARDS.map((reward) => ({
    reward,
    unlocked: unlockedIds.includes(reward.id),
    unlockedAt: undefined, // Could track individual unlock times if needed
  }));
}

/**
 * Get rewards filtered by tier
 */
export function getRewardsByTier(tier: RewardTier): StreakReward[] {
  return getStreakRewards().filter((sr) => sr.reward.tier === tier);
}

/**
 * Get next reward milestone
 */
export function getNextReward(): StreakReward | null {
  const currentStreak = getCurrentStreakDays();
  const unlockedIds = getStoredRewards().unlocked;

  const nextReward = REWARDS.find(
    (r) => r.streakDays > currentStreak && !unlockedIds.includes(r.id)
  );

  if (!nextReward) return null;

  return {
    reward: nextReward,
    unlocked: false,
  };
}

/**
 * Get count of unlocked rewards
 */
export function getUnlockedRewardsCount(): number {
  const { unlocked } = getStoredRewards();
  return unlocked.length;
}

/**
 * Get total rewards count
 */
export function getTotalRewardsCount(): number {
  return REWARDS.length;
}

/**
 * Get reward by ID
 */
export function getRewardById(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}

/**
 * Calculate progress to next reward (0-100%)
 */
export function getProgressToNextReward(): number {
  const currentStreak = getCurrentStreakDays();
  const next = getNextReward();

  if (!next) return 100;

  // Find previous milestone
  const previousMilestone = REWARDS
    .filter((r) => r.streakDays < next.reward.streakDays)
    .sort((a, b) => b.streakDays - a.streakDays)[0];

  const start = previousMilestone?.streakDays ?? 0;
  const end = next.reward.streakDays;
  const progress = currentStreak - start;
  const range = end - start;

  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}