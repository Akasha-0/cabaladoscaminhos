 
/* tslint:disable */
/**
 * Stats Visualization Module
 * Chart data generation and visualization utilities
// fallow-ignore-next-line unresolved-import
import {
  getDashboardData,
  ActivityDataPoint,
  WeeklyProgress,
  CategoryBreakdown,
  MonthlyOverview,
  ChartStat,
  MeditationTrend,
  AchievementStat,
} from '../stats/dashboard';
export interface ActivityDataPoint {
  date: string;
  value: number;
  type: string;
}
export interface WeeklyProgress {
  day: string;
  value: number;
}
export interface CategoryBreakdown {
  category: string;
  value: number;
}
export interface MonthlyOverview {
  month: string;
  value: number;
}
export interface ChartStat {
  label: string;
  value: number;
}
export interface MeditationTrend {
  date: string;
  duration: number;
}
export interface AchievementStat {
  name: string;
  progress: number;
}
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'doughnut';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface VisualizationOutput {
  weeklyProgressChart: ChartConfig;
  categoryBreakdownChart: ChartConfig;
  monthlyOverviewChart: ChartConfig;
  chartStatsChart: ChartConfig;
  meditationTrendsChart: ChartConfig;
  streakData: { current: number; longest: number };
  achievementsProgress: { total: number; unlocked: number };
  activityHistory: ActivityDataPoint[];
  dashboardStats: {
    totalSessions: number;
    totalMinutes: number;
    meditationsCompleted: number;
    ritualsLogged: number;
    affirmationsCreated: number;
  };
}

const DEFAULT_COLORS = [
  'rgba(99, 102, 241, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(250, 204, 21, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(168, 85, 247, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(20, 184, 166, 0.8)',
];

const BORDER_COLORS = [
  'rgb(99, 102, 241)',
  'rgb(236, 72, 153)',
  'rgb(34, 197, 94)',
  'rgb(250, 204, 21)',
  'rgb(14, 165, 233)',
  'rgb(168, 85, 247)',
  'rgb(249, 115, 22)',
  'rgb(20, 184, 166)',
];

/**
 * Generate weekly progress chart configuration
 */
function generateWeeklyProgressChart(
  weeklyProgress: WeeklyProgress[]
): ChartConfig {
  const labels = weeklyProgress.map((w) => `Semana ${w.week}`);

  const datasets: ChartDataset[] = [
    {
      label: 'Sessões de Meditação',
      data: weeklyProgress.map((w) => w.meditation),
      backgroundColor: DEFAULT_COLORS[0],
      borderColor: BORDER_COLORS[0],
      borderWidth: 2,
    },
    {
      label: 'Sessões de Ritual',
      data: weeklyProgress.map((w) => w.ritual),
      backgroundColor: DEFAULT_COLORS[1],
      borderColor: BORDER_COLORS[1],
      borderWidth: 2,
    },
    {
      label: 'Afilmações',
      data: weeklyProgress.map((w) => w.affirmation),
      backgroundColor: DEFAULT_COLORS[2],
      borderColor: BORDER_COLORS[2],
      borderWidth: 2,
    },
  ];

  return {
    type: 'bar',
    title: 'Progresso Semanal',
    labels,
    datasets,
  };
}

/**
 * Generate category breakdown chart configuration
 */
function generateCategoryBreakdownChart(
  categoryBreakdown: CategoryBreakdown[]
): ChartConfig {
  const labels = categoryBreakdown.map((c) => c.category);
  const data = categoryBreakdown.map((c) => c.count);
  const backgroundColors = categoryBreakdown.map(
    (_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length]
  );

  return {
    type: 'doughnut',
    title: 'Distribuição por Categoria',
    labels,
    datasets: [
      {
        label: 'Categorias',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map((c) => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };
}

/**
 * Generate monthly overview chart configuration
 */
function generateMonthlyOverviewChart(
  monthlyOverview: MonthlyOverview[]
): ChartConfig {
  const labels = monthlyOverview.map((m) => m.month);

  const datasets: ChartDataset[] = [
    {
      label: 'Total de Sessões',
      data: monthlyOverview.map((m) => m.sessions),
      backgroundColor: DEFAULT_COLORS[0],
      borderColor: BORDER_COLORS[0],
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Minutos de Prática',
      data: monthlyOverview.map((m) => m.minutes),
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      borderColor: 'rgb(14, 165, 233)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ];

  return {
    type: 'line',
    title: 'Visão Mensal',
    labels,
    datasets,
  };
}

/**
 * Generate chart stats chart configuration
 */
function generateChartStatsChart(chartStats: ChartStat[]): ChartConfig {
  const labels = chartStats.map((s) => s.tipo);

  return {
    type: 'bar',
    title: 'Estatísticas dos Gráficos',
    labels,
    datasets: [
      {
        label: 'Quantidade',
        data: chartStats.map((s) => s.total),
        backgroundColor: DEFAULT_COLORS.slice(0, chartStats.length),
        borderColor: BORDER_COLORS.slice(0, chartStats.length),
        borderWidth: 2,
      },
    ],
  };
}

/**
 * Generate meditation trends chart configuration
 */
function generateMeditationTrendsChart(
  meditationTrends: MeditationTrend[]
): ChartConfig {
  const labels = meditationTrends.map((t) => t.tipo);

  const datasets: ChartDataset[] = [
    {
      label: 'Tendência de Meditação',
      data: meditationTrends.map((t) => t.totalMinutes),
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: BORDER_COLORS[5],
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    },
  ];

  return {
    type: 'line',
    title: 'Tendência de Meditação',
    labels,
    datasets,
  };
}

/**
 * Calculate achievements progress
 */
function calculateAchievementsProgress(
  achievements: AchievementStat[]
): { total: number; unlocked: number } {
  return {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlockedAt !== null).length,
  };
}

/**
 * Main visualization getter - returns all chart data and statistics
 */
export function getVisualization(): VisualizationOutput {
  const dashboardData = getDashboardData();
  const { stats, visualization } = dashboardData;

  return {
    weeklyProgressChart: generateWeeklyProgressChart(visualization.weeklyProgress),
    categoryBreakdownChart: generateCategoryBreakdownChart(visualization.categoryBreakdown),
    monthlyOverviewChart: generateMonthlyOverviewChart(visualization.monthlyOverview),
    chartStatsChart: generateChartStatsChart(visualization.chartStats),
    meditationTrendsChart: generateMeditationTrendsChart(visualization.meditationTrends),
    streakData: {
      current: stats.currentStreak,
      longest: stats.longestStreak,
    },
    achievementsProgress: calculateAchievementsProgress(visualization.achievements),
    activityHistory: visualization.activityHistory,
    dashboardStats: {
      totalSessions: stats.totalSessions,
      totalMinutes: stats.totalMinutes,
      meditationsCompleted: stats.meditationsCompleted,
      ritualsLogged: stats.ritualsLoggados,
      affirmationsCreated: stats.affirmationsCreated,
    },
  };
}

/**
 * Get specific chart by type
 */
export function getChartByType(
  type: 'weekly' | 'category' | 'monthly' | 'stats' | 'meditation'
): ChartConfig | null {
  const visualization = getVisualization();

  switch (type) {
    case 'weekly':
      return visualization.weeklyProgressChart;
    case 'category':
      return visualization.categoryBreakdownChart;
    case 'monthly':
      return visualization.monthlyOverviewChart;
    case 'stats':
      return visualization.chartStatsChart;
    case 'meditation':
      return visualization.meditationTrendsChart;
    default:
      return null;
  }
}

/**
 * Export chart data for external use (e.g., chart libraries)
 */
export function exportChartData(): {
  charts: ChartConfig[];
  metadata: {
    exportDate: string;
    totalActivities: number;
    currentStreak: number;
    longestStreak: number;
  };
} {
  const visualization = getVisualization();

  return {
    charts: [
      visualization.weeklyProgressChart,
      visualization.categoryBreakdownChart,
      visualization.monthlyOverviewChart,
      visualization.chartStatsChart,
      visualization.meditationTrendsChart,
    ],
    metadata: {
      exportDate: new Date().toISOString(),
      totalActivities: visualization.activityHistory.length,
      currentStreak: visualization.streakData.current,
      longestStreak: visualization.streakData.longest,
    },
  };
}