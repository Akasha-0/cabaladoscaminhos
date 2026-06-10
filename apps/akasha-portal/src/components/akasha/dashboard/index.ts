/**
 * @akasha/portal — Dashboard Module
 * 
 * Exports do módulo de Dashboard.
 */

// Re-export tipos do core
export type {
  DashboardStats,
  StreakDay,
  RitualHistoryItem,
  RitualCompletionData,
  RitualCompletionResponse,
  DashboardViewConfig,
} from '@akasha/core';

// Re-export mock data
export {
  mockStats,
  mockStreak,
  mockHistory,
  mockDashboardData,
} from './mocks';

// Re-export hook
export { useDashboardData } from './hooks/useDashboardData';
export type {
  DashboardData,
  UseDashboardDataOptions,
} from './hooks/useDashboardData';
