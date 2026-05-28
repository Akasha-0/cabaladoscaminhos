// Stats dashboard data module
// Dashboard statistics and visualization data for spiritual practice tracking

export interface DashboardStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  chartsGenerated: number;
  meditationsCompleted: number;
  ritualsLoggados: number;
  affirmationsCreated: number;
}

export interface ActivityDataPoint {
  date: string;
  sessions: number;
  minutes: number;
  type: 'meditation' | 'ritual' | 'reading' | 'chart' | 'affirmation';
}

export interface WeeklyProgress {
  week: string;
  meditation: number;
  ritual: number;
  reading: number;
  chart: number;
  affirmation: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AchievementStat {
  id: string;
  name: string;
  description: string;
  unlockedAt: string | null;
  target: number;
  current: number;
}

export interface MonthlyOverview {
  month: string;
  sessions: number;
  minutes: number;
  streakDays: number;
}

export interface ChartStat {
  tipo: 'mapa-natal' | 'tarot' | 'numerologia' | 'cabala' | 'ifu' | 'compatibilidade';
  total: number;
  lastGenerated: string | null;
}

export interface MeditationTrend {
  tipo: 'respiracao' | 'visualizacao' | 'afirmacao' | 'ritual' | 'manifestacao';
  totalMinutes: number;
  sessions: number;
  averageMinutes: number;
}

export interface VisualizationData {
  activityHistory: ActivityDataPoint[];
  weeklyProgress: WeeklyProgress[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyOverview: MonthlyOverview[];
  chartStats: ChartStat[];
  meditationTrends: MeditationTrend[];
  achievements: AchievementStat[];
}

const DEFAULT_STATS: DashboardStats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  chartsGenerated: 0,
  meditationsCompleted: 0,
  ritualsLoggados: 0,
  affirmationsCreated: 0,
};

const DEFAULT_ACTIVITY_HISTORY: ActivityDataPoint[] = [];
const DEFAULT_WEEKLY_PROGRESS: WeeklyProgress[] = [];
const DEFAULT_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [];
const DEFAULT_MONTHLY_OVERVIEW: MonthlyOverview[] = [];
const DEFAULT_CHART_STATS: ChartStat[] = [];
const DEFAULT_MEDITATION_TRENDS: MeditationTrend[] = [];
const DEFAULT_ACHIEVEMENTS: AchievementStat[] = [];

const STATS_STORAGE_KEY = 'spiritual_stats';
const ACTIVITY_STORAGE_KEY = 'spiritual_activity';

function getStoredStats(): DashboardStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function getStoredActivity(): ActivityDataPoint[] {
  if (typeof window === 'undefined') return DEFAULT_ACTIVITY_HISTORY;
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ACTIVITY_HISTORY;
  } catch {
    return DEFAULT_ACTIVITY_HISTORY;
  }
}

export function calculateStreaks(activities: ActivityDataPoint[]): { current: number; longest: number } {
  if (activities.length === 0) return { current: 0, longest: 0 };

  const dates = activities
    .map((a) => a.date)
    .filter((d) => d)
    .sort()
    .reverse();

  if (dates.length === 0) return { current: 0, longest: 0 };

 const uniqueDates = Array.from(new Set(dates));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let current = 0;
  let longest = 0;
  let streak = 0;
  let lastDate: string | null = null;

  for (const date of uniqueDates) {
    if (lastDate === null) {
      streak = 1;
      current = date === today || date === yesterday ? 1 : 0;
    } else {
      const diff = (new Date(lastDate).getTime() - new Date(date).getTime()) / 86400000;
      if (diff === 1) {
        streak++;
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

export function generateWeeklyProgress(activities: ActivityDataPoint[], weeksBack: number = 8): WeeklyProgress[] {
  const weeks: WeeklyProgress[] = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
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

export function generateCategoryBreakdown(activities: ActivityDataPoint[]): CategoryBreakdown[] {
  const totals: Record<string, number> = {
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

  const colors: Record<string, string> = {
    meditation: '#8B5CF6',
    ritual: '#F59E0B',
    reading: '#3B82F6',
    chart: '#10B981',
    affirmation: '#EC4899',
  };

  const labels: Record<string, string> = {
    meditation: 'Meditação',
    ritual: 'Ritual',
    reading: 'Leitura',
    chart: 'Mapa Astral',
    affirmation: 'Afirmação',
  };

  return Object.entries(totals)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      category: labels[type] || type,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[type] || '#6B7280',
    }))
    .sort((a, b) => b.count - a.count);
}

export function generateMonthlyOverview(activities: ActivityDataPoint[], monthsBack: number = 6): MonthlyOverview[] {
  const months: MonthlyOverview[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthStr = monthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
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

export function generateChartStats(activities: ActivityDataPoint[]): ChartStat[] {
  const chartActivities = activities.filter((a) => a.type === 'chart');
  const statsMap: Record<string, { total: number; lastGenerated: string | null }> = {
    'mapa-natal': { total: 0, lastGenerated: null },
    tarot: { total: 0, lastGenerated: null },
    numerologia: { total: 0, lastGenerated: null },
    cabala: { total: 0, lastGenerated: null },
    ifa: { total: 0, lastGenerated: null },
    compatibilidade: { total: 0, lastGenerated: null },
  };

  for (const activity of chartActivities) {
    statsMap['mapa-natal'].total++;
    if (!statsMap['mapa-natal'].lastGenerated || activity.date > statsMap['mapa-natal'].lastGenerated) {
      statsMap['mapa-natal'].lastGenerated = activity.date;
    }
  }

  return Object.entries(statsMap).map(([tipo, data]) => ({
    tipo: tipo as ChartStat['tipo'],
    total: data.total,
    lastGenerated: data.lastGenerated,
  }));
}

export function generateMeditationTrends(activities: ActivityDataPoint[]): MeditationTrend[] {
  const meditationActivities = activities.filter((a) => a.type === 'meditation');
  const trendsMap: Record<string, { totalMinutes: number; sessions: number }> = {
    respiracao: { totalMinutes: 0, sessions: 0 },
    visualizacao: { totalMinutes: 0, sessions: 0 },
    afirmacao: { totalMinutes: 0, sessions: 0 },
    ritual: { totalMinutes: 0, sessions: 0 },
    manifestacao: { totalMinutes: 0, sessions: 0 },
  };

  for (const activity of meditationActivities) {
    trendsMap.respiracao.totalMinutes += activity.minutes;
    trendsMap.respiracao.sessions++;
  }

  return Object.entries(trendsMap).map(([tipo, data]) => ({
    tipo: tipo as MeditationTrend['tipo'],
    totalMinutes: data.totalMinutes,
    sessions: data.sessions,
    averageMinutes: data.sessions > 0 ? Math.round(data.totalMinutes / data.sessions) : 0,
  }));
}

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
      name: 'Mestre de Ritais',
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

export interface DashboardData {
  stats: DashboardStats;
  visualization: VisualizationData;
  lastUpdated: string;
}

export function getDashboardData(): DashboardData {
  const activities = getStoredActivity();
  const stats = getStoredStats();
  const streaks = calculateStreaks(activities);

  const updatedStats: DashboardStats = {
    ...stats,
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
    stats: updatedStats,
    visualization,
    lastUpdated: new Date().toISOString(),
  };
}

export function recordActivity(data: Omit<ActivityDataPoint, 'date'>): void {
  if (typeof window === 'undefined') return;

  const activities = getStoredActivity();
  const today = new Date().toISOString().split('T')[0];

  const newActivity: ActivityDataPoint = {
    ...data,
    date: today,
  };

  activities.push(newActivity);

  if (activities.length > 365) {
    activities.splice(0, activities.length - 365);
  }

  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
}

export function recordSession(type: ActivityDataPoint['type'], minutes: number): void {
  recordActivity({
    sessions: 1,
    minutes,
    type,
  });
}

export function clearStats(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STATS_STORAGE_KEY);
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
}
