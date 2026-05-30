/**
 * Gamification module - re-exports from gamification submodules
 */
// Achievements
export {
  getAchievements,
  getAchievementById,
  getAchievementsByCategory,
  unlockAchievement,
  updateProgress,
  getUnlockedCount,
  getTotalCount,
  getCompletionPercentage,
  getRecentAchievements,
  type Achievement,
  type AchievementCategory,
  type AchievementDefinition,
} from './gamification/achievements';

// Missions
export {
  getDailyMissions,
  completeMission,
  getCompletedCount,
  getTotalMissionCount,
  getMissionCompletionPercentage,
  getMissionById,
  type Mission,
  type MissionCategory,
  type MissionDefinition,
} from './gamification/missions';

// Rewards
export {
  getStreakRewards,
  getRewardsByTier,
  getNextReward,
  getUnlockedRewardsCount,
  getTotalRewardsCount,
  getRewardById,
  getProgressToNextReward,
  type Reward,
  type RewardTier,
  type StreakReward,
} from './gamification/rewards';