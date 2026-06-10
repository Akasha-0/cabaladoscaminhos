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

// Re-export components
export { StatsCard } from './components/StatsCard';
export { DashboardStats as DashboardStatsGrid } from './components/DashboardStats';
export { CalendarDay } from './CalendarDay';
export { StreakCalendar } from './StreakCalendar';

// Re-export hook
export { useDashboardData } from './hooks/useDashboardData';
export type {
  DashboardData,
  UseDashboardDataOptions,
} from './hooks/useDashboardData';
