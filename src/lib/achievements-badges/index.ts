// ============================================================================
// ACHIEVEMENTS-BADGES — Public barrel (Wave 69, 2026-06-30)
// ============================================================================
// Re-exports the public surface of the achievements + badges engine.
// ============================================================================

export {
  // Types
  ACHIEVEMENTS,
  // Evaluators
  evaluateAchievements,
  evaluateAchievement,
  getAchievement,
  listByCategory,
  listByTradition,
  listUnlocked,
  recordUnlocked,
  // Store plumbing
  setUnlockedStore,
  resetUnlockedStore,
  inMemoryUnlockedStore,
  auditCatalog,
  localize,
  // Type exports
  type AchievementId,
  type UserId,
  type Timestamp,
  type Locale,
  type Tier,
  type AchievementCategory,
  type SacredTradition,
  type SacredRef,
  type BadgeStyle,
  type AchievementDefinition,
  type UserState,
  type UnlockedAchievement,
  type UnlockedStore,
  type CatalogAudit,
} from './achievements.ts';

export {
  // Progress
  getProgress,
  getInProgressAchievements,
  nextMilestone,
  progressToStreakMilestones,
  progressByCategory,
  progressAllCategories,
  auditProgressCalculation,
  type ProgressEntry,
  type CategoryProgress,
  type ProgressCalculationAudit,
} from './progress.ts';

export {
  // Badges
  getBadgeStyle,
  getIconName,
  tierFromCount,
  tierBoundaries,
  tierRank,
  formatBadgeDisplay,
  formatBadgesList,
  compareBadges,
  auditBadgeTiers,
  iconColorPair,
  type BadgeDisplay,
  type BadgeTiersAudit,
} from './badges.ts';

export {
  // Notifications
  shouldNotify,
  shouldNotifySync,
  queueNotification,
  getQueuedNotifications,
  markDelivered,
  dropNotification,
  resetNotifCounter,
  auditNotifRules,
  setNotifStore,
  resetNotifStore,
  inMemoryNotifStore,
  DEFAULT_RATE_LIMIT,
  DEFAULT_RATE_LIMIT_MS,
  type NotifChannel,
  type NotificationEntry,
  type NotifStore,
  type RateLimit,
  type NotifRulesAudit,
} from './notif.ts';
