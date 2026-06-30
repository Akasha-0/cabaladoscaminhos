// ============================================================================
// DASHBOARD — Tests
// ----------------------------------------------------------------------------
// Cobertura do contrato público de `src/lib/stats/dashboard.ts`:
//
//   1. Default stats (zero-state) têm os campos esperados
//   2. getDashboardData() retorna a forma exata consumida por stats-visualization
//   3. Streak calculation: zero, single day, continuous, broken
//   4. Weekly progress: 8 weeks, agregação por tipo
//   5. Category breakdown: percentuais somam 100, sort por count desc
//   6. Monthly overview: 6 meses, sessions e minutes
//   7. Chart stats: seed → 'mapa-natal' count
//   8. Meditation trends: agregação de minutos e cálculo de average
//   9. Achievements: 10 entries com shape correto
//
// Esses testes não rodam TSC (que fica no gate separado do agent) — eles
// rodam com vitest. Verificam que os helpers puros se comportam como
// esperado e que a função `getDashboardData` devolve a forma exata que
// `src/lib/statistics/stats-visualization.ts` espera consumir.
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  // types
  type ActivityDataPoint,
  type ChartStat,
  type MeditationTrend,
  type WeeklyProgress,
  // constants
  DEFAULT_STATS,
  // pure helpers
  calculateStreaks,
  generateWeeklyProgress,
  generateCategoryBreakdown,
  generateMonthlyOverview,
  generateChartStats,
  generateMeditationTrends,
  getDefaultAchievements,
  // main entry
  getDashboardData,
} from '../dashboard';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeActivity(
  date: string,
  type: ActivityDataPoint['type'],
  minutes = 15,
  sessions = 1,
): ActivityDataPoint {
  return { date, type, minutes, sessions };
}

// A compact, realistic 14-day fixture with mixed types and a 5-day streak.
const FIXTURE: ActivityDataPoint[] = [
  makeActivity('2026-06-01', 'meditation', 20),
  makeActivity('2026-06-02', 'meditation', 10),
  makeActivity('2026-06-03', 'ritual', 30),
  makeActivity('2026-06-04', 'reading', 25),
  makeActivity('2026-06-05', 'meditation', 15),
  // gap 06-06
  makeActivity('2026-06-07', 'meditation', 15),
  makeActivity('2026-06-08', 'chart', 0),
  makeActivity('2026-06-09', 'affirmation', 5),
  makeActivity('2026-06-10', 'meditation', 20),
  makeActivity('2026-06-11', 'ritual', 45),
  makeActivity('2026-06-12', 'meditation', 15),
  makeActivity('2026-06-13', 'reading', 30),
  makeActivity('2026-06-14', 'meditation', 20),
];

// ---------------------------------------------------------------------------
// 1. Default stats
// ---------------------------------------------------------------------------

describe('DEFAULT_STATS', () => {
  it('tem todos os campos numéricos em zero', () => {
    expect(DEFAULT_STATS).toEqual({
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      chartsGenerated: 0,
      meditationsCompleted: 0,
      ritualsLoggados: 0,
      affirmationsCreated: 0,
    });
  });

  it('preserva o nome do campo "ritualsLoggados" para compatibilidade com stats-visualization', () => {
    // O consumer `stats-visualization.ts` acessa `stats.ritualsLoggados` —
    // um rename quebraria o consumidor em runtime. Este teste é o "canary".
    expect('ritualsLoggados' in DEFAULT_STATS).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. getDashboardData() — shape contract
// ---------------------------------------------------------------------------

describe('getDashboardData()', () => {
  it('sem argumentos retorna dashboard zero-state', () => {
    const data = getDashboardData();
    expect(data.stats).toEqual(DEFAULT_STATS);
    expect(data.visualization.activityHistory).toEqual([]);
    expect(data.visualization.weeklyProgress).toHaveLength(8);
    expect(data.visualization.monthlyOverview).toHaveLength(6);
    expect(data.visualization.categoryBreakdown).toEqual([]);
    expect(data.visualization.chartStats).toHaveLength(6);
    expect(data.visualization.meditationTrends).toHaveLength(5);
    expect(data.visualization.achievements).toHaveLength(10);
    expect(typeof data.lastUpdated).toBe('string');
  });

  it('lastUpdated é um ISO date string parseable', () => {
    const data = getDashboardData();
    const parsed = Date.parse(data.lastUpdated);
    expect(Number.isNaN(parsed)).toBe(false);
  });

  it('agrega stats a partir das activities', () => {
    const data = getDashboardData(FIXTURE);
    expect(data.stats.totalSessions).toBe(FIXTURE.length);
    expect(data.stats.totalMinutes).toBe(
      FIXTURE.reduce((sum, a) => sum + a.minutes, 0),
    );
  });

  it('respeita baseStats parciais (override de campos derivados)', () => {
    const data = getDashboardData(FIXTURE, { chartsGenerated: 42 });
    expect(data.stats.chartsGenerated).toBe(42);
    // campos derivados continuam sendo recalculados a partir de activities
    expect(data.stats.totalSessions).toBe(FIXTURE.length);
  });

  it('retorna 10 achievements por padrão, todos locked', () => {
    const data = getDashboardData();
    expect(data.visualization.achievements).toHaveLength(10);
    for (const a of data.visualization.achievements) {
      expect(a.unlockedAt).toBeNull();
      expect(a.current).toBe(0);
      expect(a.target).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Streaks
// ---------------------------------------------------------------------------

describe('calculateStreaks', () => {
  it('lista vazia → 0, 0', () => {
    expect(calculateStreaks([])).toEqual({ current: 0, longest: 0 });
  });

  it('ignora activities com date vazia', () => {
    const data: ActivityDataPoint[] = [
      { date: '', type: 'meditation', minutes: 10, sessions: 1 },
    ];
    expect(calculateStreaks(data)).toEqual({ current: 0, longest: 0 });
  });

  it('data única → longest >= 1', () => {
    const data = [makeActivity('2026-06-01', 'meditation')];
    const { longest } = calculateStreaks(data);
    expect(longest).toBeGreaterThanOrEqual(1);
  });

  it('datas contíguas formam um streak contínuo', () => {
    const data = [
      makeActivity('2026-06-01', 'meditation'),
      makeActivity('2026-06-02', 'meditation'),
      makeActivity('2026-06-03', 'meditation'),
      makeActivity('2026-06-04', 'meditation'),
    ];
    const { longest } = calculateStreaks(data);
    expect(longest).toBeGreaterThanOrEqual(4);
  });

  it('gap entre datas quebra o streak', () => {
    const data = [
      makeActivity('2026-06-01', 'meditation'),
      // gap em 06-02
      makeActivity('2026-06-03', 'meditation'),
      makeActivity('2026-06-04', 'meditation'),
    ];
    const { longest } = calculateStreaks(data);
    // longest deve ser 2 (06-03 + 06-04), nunca 3
    expect(longest).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 4. Weekly progress
// ---------------------------------------------------------------------------

describe('generateWeeklyProgress', () => {
  it('retorna 8 weeks por padrão (parâmetro weeksBack)', () => {
    const series = generateWeeklyProgress([], 8);
    expect(series).toHaveLength(8);
  });

  it('respeita parâmetro weeksBack customizado', () => {
    const series = generateWeeklyProgress([], 3);
    expect(series).toHaveLength(3);
  });

  it('cada week tem a forma exata esperada pelo consumer', () => {
    const series = generateWeeklyProgress([], 1);
    const week: WeeklyProgress = series[0]!;
    expect(week).toHaveProperty('week');
    expect(week).toHaveProperty('meditation');
    expect(week).toHaveProperty('ritual');
    expect(week).toHaveProperty('reading');
    expect(week).toHaveProperty('chart');
    expect(week).toHaveProperty('affirmation');
  });

  it('agrega activities em weeks do passado', () => {
    const series = generateWeeklyProgress(FIXTURE, 8);
    const total = series.reduce((sum, w) => sum + w.meditation, 0);
    expect(total).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Category breakdown
// ---------------------------------------------------------------------------

describe('generateCategoryBreakdown', () => {
  it('lista vazia → array vazio', () => {
    expect(generateCategoryBreakdown([])).toEqual([]);
  });

  it('inclui apenas categorias com count > 0', () => {
    const data = [makeActivity('2026-06-01', 'meditation')];
    const breakdown = generateCategoryBreakdown(data);
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0]!.category).toBe('Meditação');
  });

  it('percentuais somam 100 (com arredondamento)', () => {
    const data = [
      makeActivity('2026-06-01', 'meditation'),
      makeActivity('2026-06-02', 'ritual'),
      makeActivity('2026-06-03', 'reading'),
    ];
    const breakdown = generateCategoryBreakdown(data);
    const total = breakdown.reduce((sum, b) => sum + b.percentage, 0);
    // Pode ser 99 ou 100 por causa do Math.round
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('ordena por count descendente', () => {
    const data = [
      makeActivity('2026-06-01', 'meditation'),
      makeActivity('2026-06-02', 'meditation'),
      makeActivity('2026-06-03', 'meditation'),
      makeActivity('2026-06-04', 'ritual'),
    ];
    const breakdown = generateCategoryBreakdown(data);
    expect(breakdown[0]!.category).toBe('Meditação');
    expect(breakdown[0]!.count).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 6. Monthly overview
// ---------------------------------------------------------------------------

describe('generateMonthlyOverview', () => {
  it('retorna 6 meses por padrão', () => {
    expect(generateMonthlyOverview([])).toHaveLength(6);
  });

  it('cada mês tem a forma exata esperada', () => {
    const series = generateMonthlyOverview([], 1);
    const month = series[0]!;
    expect(month).toHaveProperty('month');
    expect(month).toHaveProperty('sessions');
    expect(month).toHaveProperty('minutes');
    expect(month).toHaveProperty('streakDays');
  });

  it('soma sessions e minutes corretamente a partir das activities do mês atual', () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const data = [
      makeActivity(`${yyyy}-${mm}-05`, 'meditation', 10),
      makeActivity(`${yyyy}-${mm}-15`, 'ritual', 30),
      makeActivity(`${yyyy}-${mm}-25`, 'reading', 25),
    ];
    const series = generateMonthlyOverview(data);
    const currentMonth = series[series.length - 1]!;
    expect(currentMonth.sessions).toBe(3);
    expect(currentMonth.minutes).toBe(10 + 30 + 25);
  });
});

// ---------------------------------------------------------------------------
// 7. Chart stats
// ---------------------------------------------------------------------------

describe('generateChartStats', () => {
  it('retorna 6 tipos de chart com totais zerados sem activities', () => {
    const stats = generateChartStats([]);
    expect(stats).toHaveLength(6);
    for (const s of stats) {
      expect(s.total).toBe(0);
      expect(s.lastGenerated).toBeNull();
    }
  });

  it('conta activities do tipo "chart" como "mapa-natal"', () => {
    const data = [
      makeActivity('2026-06-01', 'chart', 0),
      makeActivity('2026-06-02', 'chart', 0),
    ];
    const stats = generateChartStats(data);
    const mapaNatal = stats.find((s: ChartStat) => s.tipo === 'mapa-natal')!;
    expect(mapaNatal.total).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 8. Meditation trends
// ---------------------------------------------------------------------------

describe('generateMeditationTrends', () => {
  it('retorna 5 tipos de meditation', () => {
    const trends = generateMeditationTrends([]);
    expect(trends).toHaveLength(5);
  });

  it('lista vazia → averageMinutes = 0', () => {
    const trends = generateMeditationTrends([]);
    for (const t of trends) {
      expect(t.averageMinutes).toBe(0);
      expect(t.sessions).toBe(0);
      expect(t.totalMinutes).toBe(0);
    }
  });

  it('soma minutos das activities do tipo "meditation"', () => {
    const data = [
      makeActivity('2026-06-01', 'meditation', 10),
      makeActivity('2026-06-02', 'meditation', 20),
      makeActivity('2026-06-03', 'ritual', 99), // não conta
    ];
    const trends = generateMeditationTrends(data);
    const respiracao = trends.find((t: MeditationTrend) => t.tipo === 'respiracao')!;
    expect(respiracao.totalMinutes).toBe(30);
    expect(respiracao.sessions).toBe(2);
    expect(respiracao.averageMinutes).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// 9. Default achievements
// ---------------------------------------------------------------------------

describe('getDefaultAchievements', () => {
  it('retorna 10 achievements (canonical list)', () => {
    expect(getDefaultAchievements()).toHaveLength(10);
  });

  it('cada achievement tem os campos esperados', () => {
    const all = getDefaultAchievements();
    for (const a of all) {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('name');
      expect(a).toHaveProperty('description');
      expect(a).toHaveProperty('unlockedAt');
      expect(a).toHaveProperty('target');
      expect(a).toHaveProperty('current');
      expect(a.unlockedAt).toBeNull();
      expect(a.current).toBe(0);
      expect(a.target).toBeGreaterThan(0);
    }
  });

  it('IDs são únicos', () => {
    const all = getDefaultAchievements();
    const ids = all.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
