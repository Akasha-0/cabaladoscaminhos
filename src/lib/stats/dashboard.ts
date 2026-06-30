/**
 * Stats Dashboard Data Module
 * ----------------------------------------------------------------------------
 * Server-safe foundation for the community stats dashboard.
 *
 * History: existed at `src/lib/stats/dashboard.ts` before the "foice" refactor
 * (commit b6f42051, 2026-06-01). The visualization consumer was migrated to
 * `src/lib/statistics/` but its `import ... from '../stats/dashboard'` was
 * never re-wired — file went missing, producing a TS2307 cascade.
 *
 * This restores the *shape contract* required by `stats-visualization.ts`:
 *   - Types: ActivityDataPoint, WeeklyProgress, CategoryBreakdown,
 *     MonthlyOverview, ChartStat, MeditationTrend, AchievementStat
 *   - Function: getDashboardData() returning { stats, visualization }
 *
 * Server-safe by design (no `localStorage`, no `window`). The legacy
 * localStorage helpers (recordActivity, recordSession, clearStats) were
 * dropped: dead code, don't exist in Next.js server components, real
 * persistence should be Supabase/Prisma anyway.
 *
 * To wire live data later: replace `getDashboardData` body with a Prisma
 * aggregation. Shape and exports MUST stay stable — they're part of the
 * public surface of `src/lib/statistics/stats-visualization.ts`.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * One data point of spiritual activity (meditation, ritual, reading, etc.).
 * Mirrors the legacy schema: `date` is an ISO `YYYY-MM-DD` string for easy
 * day/week/month bucketing.
 */
export interface ActivityDataPoint {
  date: string; // YYYY-MM-DD
  sessions: number;
  minutes: number;
  type: 'meditation' | 'ritual' | 'reading' | 'chart' | 'affirmation';
}

/** Aggregate stats for the whole user journey. */
export interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  chartsGenerated: number;
  meditationsCompleted: number;
  /**
   * Number of rituals logged. NOTE: this property is spelled "ritualsLoggados"
   * to stay byte-for-byte compatible with the consumer in
   * `src/lib/statistics/stats-visualization.ts`. Do NOT rename — it would
   * re-introduce TS2322 errors in the visualization module.
   */
  ritualsLoggados: number;
  affirmationsCreated: number;
}

/** Per-week activity tally used for the "Progresso Semanal" bar chart. */
export interface WeeklyProgress {
  /** ISO date of the start of the week (YYYY-MM-DD). */
  week: string;
  meditation: number;
  ritual: number;
  reading: number;
  chart: number;
  affirmation: number;
}

/** Per-category share used for the "Distribuição por Categoria" doughnut. */
export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

/** Per-month high-level view for the "Visão Mensal" line chart. */
export interface MonthlyOverview {
  /** Short month label, e.g. "jan/26". */
  month: string;
  sessions: number;
  minutes: number;
  streakDays: number;
}

/** Per-chart-kind generation count (mapa-natal, tarot, numerologia, ...). */
export interface ChartStat {
  tipo: 'mapa-natal' | 'tarot' | 'numerologia' | 'cabala' | 'ifu' | 'compatibilidade';
  total: number;
  lastGenerated: string | null;
}

/** Per-meditation-style aggregate for the "Tendência de Meditação" line. */
export interface MeditationTrend {
  tipo: 'respiracao' | 'visualizacao' | 'afirmacao' | 'ritual' | 'manifestacao';
  totalMinutes: number;
  sessions: number;
  averageMinutes: number;
}

/** Achievement definition + progress for the gamification layer. */
export interface AchievementStat {
  id: string;
  name: string;
  description: string;
  /** ISO timestamp when the user unlocked it, or `null` if still locked. */
  unlockedAt: string | null;
  target: number;
  current: number;
}

/** Full visualization payload (everything `stats-visualization.ts` consumes). */
export interface VisualizationData {
  activityHistory: ActivityDataPoint[];
  weeklyProgress: WeeklyProgress[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyOverview: MonthlyOverview[];
  chartStats: ChartStat[];
  meditationTrends: MeditationTrend[];
  achievements: AchievementStat[];
}

/** Top-level shape returned by `getDashboardData()`. */
export interface DashboardData {
  stats: DashboardStats;
  visualization: VisualizationData;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** Zero-state stats, used when there is no recorded activity yet. */
export const DEFAULT_STATS: DashboardStats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  chartsGenerated: 0,
  meditationsCompleted: 0,
  ritualsLoggados: 0,
  affirmationsCreated: 0,
};

/** Empty activity history — the building block of an empty dashboard. */
export const DEFAULT_ACTIVITY_HISTORY: ActivityDataPoint[] = [];

/** Canonical list of achievements (id, name, description, target). */
export function getDefaultAchievements(): AchievementStat[] {
  return [
    {
      id: 'first-meditation',
      name: 'Primeiro Contato',
      description: 'Complete sua primeira meditação',
      unlockedAt: null,
      target: 1,
      current: 0,
    },
    {
      id: 'week-streak',
      name: 'Constância Semanal',
      description: 'Mantenha uma sequência de 7 dias',
      unlockedAt: null,
      target: 7,
      current: 0,
    },
    {
      id: 'month-streak',
      name: 'Dedicação Mensal',
      description: 'Mantenha uma sequência de 30 dias',
      unlockedAt: null,
      target: 30,
      current: 0,
    },
    {
      id: 'ten-sessions',
      name: 'Praticante',
      description: 'Complete 10 sessões',
      unlockedAt: null,
      target: 10,
      current: 0,
    },
    {
      id: 'fifty-sessions',
      name: 'Devoto',
      description: 'Complete 50 sessões',
      unlockedAt: null,
      target: 50,
      current: 0,
    },
    {
      id: 'hundred-sessions',
      name: 'Mestre Interior',
      description: 'Complete 100 sessões',
      unlockedAt: null,
      target: 100,
      current: 0,
    },
    {
      id: 'first-chart',
      name: 'Cartógrafo Cósmico',
      description: 'Gere seu primeiro mapa astral',
      unlockedAt: null,
      target: 1,
      current: 0,
    },
    {
      id: 'ritual-master',
      name: 'Mestre de Rituais',
      description: 'Complete 25 rituais',
      unlockedAt: null,
      target: 25,
      current: 0,
    },
    {
      id: 'affirmation-creator',
      name: 'Criador de Afirmações',
      description: 'Crie 10 afirmações personalizadas',
      unlockedAt: null,
      target: 10,
      current: 0,
    },
    {
      id: 'thousand-minutes',
      name: 'Mil Minutos de Paz',
      description: 'Complete 1000 minutos de prática',
      unlockedAt: null,
      target: 1000,
      current: 0,
    },
  ];
}

// ---------------------------------------------------------------------------
// Pure aggregators (no I/O — these are the building blocks of getDashboardData)
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<ActivityDataPoint['type'], string> = {
  meditation: 'Meditação',
  ritual: 'Ritual',
  reading: 'Leitura',
  chart: 'Mapa Astral',
  affirmation: 'Afirmação',
};

const CATEGORY_COLORS: Record<ActivityDataPoint['type'], string> = {
  meditation: '#8B5CF6',
  ritual: '#F59E0B',
  reading: '#3B82F6',
  chart: '#10B981',
  affirmation: '#EC4899',
};

/** Walk the activities list and produce a deduplicated daily aggregate. */
export function calculateStreaks(activities: ActivityDataPoint[]): {
  current: number;
  longest: number;
} {
  if (activities.length === 0) return { current: 0, longest: 0 };

  const dates = activities
    .map((a) => a.date)
    .filter((d) => Boolean(d))
    .sort()
    .reverse();

  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = Array.from(new Set(dates));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

  let current = 0;
  let longest = 0;
  let streak = 0;
  let lastDate: string | null = null;

  for (const date of uniqueDates) {
    if (lastDate === null) {
      streak = 1;
      current = date === today || date === yesterday ? 1 : 0;
    } else {
      const diff =
        (new Date(lastDate).getTime() - new Date(date).getTime()) / 86_400_000;
      if (diff === 1) {
        streak += 1;
        if (date === today || date === yesterday) current = streak;
      } else {
        longest = Math.max(longest, streak);
        streak = 1;
        current = 0;
      }
    }
    lastDate = date;
  }

  longest = Math.max(longest, streak);
  return { current, longest };
}

/** Build the `WeeklyProgress[]` series for the last `weeksBack` weeks. */
export function generateWeeklyProgress(
  activities: ActivityDataPoint[],
  weeksBack: number = 8,
): WeeklyProgress[] {
  const weeks: WeeklyProgress[] = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i -= 1) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() || 7) - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStr = weekStart.toISOString().split('T')[0];
    const weekActivities = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= weekStart && actDate <= weekEnd;
    });

    weeks.push({
      week: weekStr,
      meditation: weekActivities.filter((a) => a.type === 'meditation').length,
      ritual: weekActivities.filter((a) => a.type === 'ritual').length,
      reading: weekActivities.filter((a) => a.type === 'reading').length,
      chart: weekActivities.filter((a) => a.type === 'chart').length,
      affirmation: weekActivities.filter((a) => a.type === 'affirmation').length,
    });
  }

  return weeks;
}

/** Build the `CategoryBreakdown[]` series sorted by count, descending. */
export function generateCategoryBreakdown(
  activities: ActivityDataPoint[],
): CategoryBreakdown[] {
  const totals: Record<ActivityDataPoint['type'], number> = {
    meditation: 0,
    ritual: 0,
    reading: 0,
    chart: 0,
    affirmation: 0,
  };

  for (const activity of activities) {
    totals[activity.type] = (totals[activity.type] || 0) + 1;
  }

  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(totals)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      category: CATEGORY_LABELS[type as ActivityDataPoint['type']] || type,
      count,
      percentage: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[type as ActivityDataPoint['type']] || '#6B7280',
    }))
    .sort((a, b) => b.count - a.count);
}

/** Build the `MonthlyOverview[]` series for the last `monthsBack` months. */
export function generateMonthlyOverview(
  activities: ActivityDataPoint[],
  monthsBack: number = 6,
): MonthlyOverview[] {
  const months: MonthlyOverview[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthStr = monthStart.toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    });
    const monthActivities = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= monthStart && actDate <= monthEnd;
    });

    months.push({
      month: monthStr,
      sessions: monthActivities.length,
      minutes: monthActivities.reduce((sum, a) => sum + a.minutes, 0),
      streakDays: 0,
    });
  }

  return months;
}

/** Build the `ChartStat[]` series. */
export function generateChartStats(activities: ActivityDataPoint[]): ChartStat[] {
  const chartActivities = activities.filter((a) => a.type === 'chart');
  const statsMap: Record<ChartStat['tipo'], { total: number; lastGenerated: string | null }> = {
    'mapa-natal': { total: 0, lastGenerated: null },
    tarot: { total: 0, lastGenerated: null },
    numerologia: { total: 0, lastGenerated: null },
    cabala: { total: 0, lastGenerated: null },
    ifu: { total: 0, lastGenerated: null },
    compatibilidade: { total: 0, lastGenerated: null },
  };

  for (const activity of chartActivities) {
    statsMap['mapa-natal'].total += 1;
    if (
      !statsMap['mapa-natal'].lastGenerated ||
      activity.date > statsMap['mapa-natal'].lastGenerated
    ) {
      statsMap['mapa-natal'].lastGenerated = activity.date;
    }
  }

  return Object.entries(statsMap).map(([tipo, data]) => ({
    tipo: tipo as ChartStat['tipo'],
    total: data.total,
    lastGenerated: data.lastGenerated,
  }));
}

/** Build the `MeditationTrend[]` series. */
export function generateMeditationTrends(
  activities: ActivityDataPoint[],
): MeditationTrend[] {
  const meditationActivities = activities.filter((a) => a.type === 'meditation');
  const trendsMap: Record<MeditationTrend['tipo'], { totalMinutes: number; sessions: number }> = {
    respiracao: { totalMinutes: 0, sessions: 0 },
    visualizacao: { totalMinutes: 0, sessions: 0 },
    afirmacao: { totalMinutes: 0, sessions: 0 },
    ritual: { totalMinutes: 0, sessions: 0 },
    manifestacao: { totalMinutes: 0, sessions: 0 },
  };

  for (const activity of meditationActivities) {
    trendsMap.respiracao.totalMinutes += activity.minutes;
    trendsMap.respiracao.sessions += 1;
  }

  return Object.entries(trendsMap).map(([tipo, data]) => ({
    tipo: tipo as MeditationTrend['tipo'],
    totalMinutes: data.totalMinutes,
    sessions: data.sessions,
    averageMinutes: data.sessions > 0 ? Math.round(data.totalMinutes / data.sessions) : 0,
  }));
}

// ---------------------------------------------------------------------------
// Main entry point consumed by `src/lib/statistics/stats-visualization.ts`
// ---------------------------------------------------------------------------

/**
 * Build the full dashboard payload from a list of activity points.
 *
 * @param activities - the list of recorded activities. If omitted, returns a
 *   zero-state dashboard (used for unauthenticated requests / empty state).
 * @param baseStats - optional pre-computed stats (e.g. loaded from Prisma). If
 *   omitted, stats are derived from `activities`.
 */
export function getDashboardData(
  activities: ActivityDataPoint[] = DEFAULT_ACTIVITY_HISTORY,
  baseStats: Partial<DashboardStats> = {},
): DashboardData {
  const streaks = calculateStreaks(activities);

  const stats: DashboardStats = {
    ...DEFAULT_STATS,
    ...baseStats,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalSessions: activities.length,
    totalMinutes: activities.reduce((sum, a) => sum + a.minutes, 0),
  };

  const visualization: VisualizationData = {
    activityHistory: activities,
    weeklyProgress: generateWeeklyProgress(activities),
    categoryBreakdown: generateCategoryBreakdown(activities),
    monthlyOverview: generateMonthlyOverview(activities),
    chartStats: generateChartStats(activities),
    meditationTrends: generateMeditationTrends(activities),
    achievements: getDefaultAchievements(),
  };

  return {
    stats,
    visualization,
    lastUpdated: new Date().toISOString(),
  };
}
