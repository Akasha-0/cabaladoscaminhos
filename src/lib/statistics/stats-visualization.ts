// fallow-ignore-file unused-file
/* tslint:disable */
/**
 * Stats Visualization Module
 * Chart data generation and visualization utilities
 */

// ============================================================
// LOCAL TYPE DEFINITIONS (replacing missing ../stats/dashboard)
// ============================================================

export interface ActivityDataPoint {
  id: string;
  date: string;
  sessions: number;
  minutes: number;
  type: string;
}

export interface WeeklyProgress {
  week: number;
  meditation: number;
  ritual: number;
  affirmation: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface MonthlyOverview {
  month: string;
  sessions: number;
  minutes: number;
}

export interface ChartStat {
  tipo: string;
  total: number;
}

export interface MeditationTrend {
  tipo: string;
  totalMinutes: number;
}

export interface AchievementStat {
  id: string;
  name: string;
  unlockedAt: string | null;
}

interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  meditationsCompleted: number;
  ritualsLogged: number;
  affirmationsCreated: number;
}

interface VisualizationData {
  weeklyProgress: WeeklyProgress[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyOverview: MonthlyOverview[];
  chartStats: ChartStat[];
  meditationTrends: MeditationTrend[];
  achievements: AchievementStat[];
  activityHistory: ActivityDataPoint[];
}

interface DashboardData {
  stats: DashboardStats;
  visualization: VisualizationData;
}

// Mock data generator for getDashboardData
function getMockDashboardData(): DashboardData {
  const now = new Date();
  const currentMonth = now.toLocaleString('pt-BR', { month: 'short' });
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleString('pt-BR', { month: 'short' });
  const prevPrevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    .toLocaleString('pt-BR', { month: 'short' });

  return {
    stats: {
      currentStreak: 7,
      longestStreak: 21,
      totalSessions: 42,
      totalMinutes: 1260,
      meditationsCompleted: 35,
      ritualsLogged: 7,
      affirmationsCreated: 15,
    },
    visualization: {
      weeklyProgress: [
        { week: 1, meditation: 3, ritual: 1, affirmation: 2 },
        { week: 2, meditation: 4, ritual: 2, affirmation: 3 },
        { week: 3, meditation: 5, ritual: 1, affirmation: 2 },
        { week: 4, meditation: 4, ritual: 2, affirmation: 3 },
      ],
      categoryBreakdown: [
        { category: 'Meditação', count: 35 },
        { category: 'Ritual', count: 7 },
        { category: 'Afirmação', count: 15 },
        { category: 'Estudo', count: 12 },
      ],
      monthlyOverview: [
        { month: prevPrevMonth, sessions: 8, minutes: 240 },
        { month: prevMonth, sessions: 12, minutes: 360 },
        { month: currentMonth, sessions: 22, minutes: 660 },
      ],
      chartStats: [
        { tipo: 'Leitura', total: 18 },
        { tipo: 'Meditação', total: 35 },
        { tipo: 'Ritual', total: 7 },
      ],
      meditationTrends: [
        { tipo: 'Manhã', totalMinutes: 420 },
        { tipo: 'Tarde', totalMinutes: 180 },
        { tipo: 'Noite', totalMinutes: 660 },
      ],
      achievements: [
        { id: 'first_meditation', name: 'Primeira Meditação', unlockedAt: '2024-01-15' },
        { id: 'week_streak', name: '7 Dias Seguidos', unlockedAt: '2024-01-22' },
        { id: 'month_streak', name: '30 Dias Seguidos', unlockedAt: null },
        { id: 'ritual_master', name: 'Mestre dos Rituais', unlockedAt: null },
      ],
      activityHistory: [
        { id: '1', date: now.toISOString().split('T')[0], sessions: 2, minutes: 60, type: 'meditation' },
        { id: '2', date: new Date(now.getTime() - 86400000).toISOString().split('T')[0], sessions: 1, minutes: 30, type: 'ritual' },
      ],
    },
  };
}

// ============================================================
// EXPORTED TYPES
// ============================================================

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

// ============================================================
// PRIVATE CONSTANTS
// ============================================================

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

// ============================================================
// CHART GENERATORS
// ============================================================

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
      label: 'Afirmações',
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

function calculateAchievementsProgress(
  achievements: AchievementStat[]
): { total: number; unlocked: number } {
  return {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlockedAt !== null).length,
  };
}

// ============================================================
// EXPORTED FUNCTIONS
// ============================================================

export function getVisualization(): VisualizationOutput {
  const dashboardData = getMockDashboardData();
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
      ritualsLogged: stats.ritualsLogged,
      affirmationsCreated: stats.affirmationsCreated,
    },
  };
}

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
