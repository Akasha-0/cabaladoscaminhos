// Progress trends analyzer for spiritual journey tracking
// Calculates trends and historical patterns in practice sessions, readings, and growth

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendData {
  points: TrendPoint[];
  direction: 'up' | 'down' | 'stable';
  percentageChange: number;
  periodLabel: string;
}

export interface ProgressTrends {
  sessions: TrendData;
  readings: TrendData;
  practice: TrendData;
  overall: TrendData;
  historicalData: HistoricalSnapshot[];
}

export interface HistoricalSnapshot {
  date: string;
  sessionsCount: number;
  readingsCount: number;
  practiceMinutes: number;
  streakDays: number;
  systemsExplored: string[];
}

// Generate historical data points (last 30 days default)
function generateHistoricalData(days: number = 30): HistoricalSnapshot[] {
  const snapshots: HistoricalSnapshot[] = [];
  const now = new Date();

  const systems = [
    'Cabala',
    'Orixás',
    'Odús',
    'Tarot',
    'Numerologia',
    'Lua',
    'Chakras',
  ];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate realistic variation with some momentum
    const baseValue = Math.sin(i / 5) * 3 + (days - i) / 10;
    const noise = Math.random() * 4 - 1;

    snapshots.push({
      date: date.toISOString().split('T')[0],
      sessionsCount: Math.max(0, Math.round(baseValue + noise)),
      readingsCount: Math.max(0, Math.round(baseValue * 0.6 + noise * 0.5)),
      practiceMinutes: Math.max(0, Math.round((baseValue + noise) * 15)),
      streakDays: Math.min(i + 1, Math.round(7 + Math.random() * 14)),
      systemsExplored: systems.slice(0, Math.floor(Math.random() * 4) + 2),
    });
  }

  return snapshots;
}

// Calculate trend direction and percentage change
function calculateTrend(points: TrendPoint[]): { direction: 'up' | 'down' | 'stable'; percentageChange: number } {
  if (points.length < 2) {
    return { direction: 'stable', percentageChange: 0 };
  }

  const first = points[0].value;
  const last = points[points.length - 1].value;

  if (first === 0) {
    return { direction: last > 0 ? 'up' : 'stable', percentageChange: last > 0 ? 100 : 0 };
  }

  const change = ((last - first) / first) * 100;

  let direction: 'up' | 'down' | 'stable';
  if (change > 5) {
    direction = 'up';
  } else if (change < -5) {
    direction = 'down';
  } else {
    direction = 'stable';
  }

  return { direction, percentageChange: Math.round(change * 10) / 10 };
}

// Convert historical snapshots to trend data points
function toTrendPoints(
  snapshots: HistoricalSnapshot[],
  field: keyof Pick<HistoricalSnapshot, 'sessionsCount' | 'readingsCount' | 'practiceMinutes'>,
  label: string
): TrendPoint[] {
  return snapshots.map((s) => ({
    date: s.date,
    value: s[field],
    label,
  }));
}

/**
 * Get progress trends analysis
 * @param days - Number of days to analyze (default: 30)
 * @returns Complete progress trends with historical data
 */
export function getTrends(days: number = 30): ProgressTrends {
  const historicalData = generateHistoricalData(days);

  const sessionsPoints = toTrendPoints(historicalData, 'sessionsCount', 'Sessões');
  const readingsPoints = toTrendPoints(historicalData, 'readingsCount', 'Leituras');
  const practicePoints = toTrendPoints(historicalData, 'practiceMinutes', 'Prática (min)');

  // Calculate overall trend as weighted average
  const overallPoints: TrendPoint[] = historicalData.map((s, i) => ({
    date: s.date,
    value: s.sessionsCount + s.readingsCount + Math.round(s.practiceMinutes / 15),
    label: 'Geral',
  }));

  const sessionsTrend = calculateTrend(sessionsPoints);
  const readingsTrend = calculateTrend(readingsPoints);
  const practiceTrend = calculateTrend(practicePoints);
  const overallTrend = calculateTrend(overallPoints);

  return {
    sessions: {
      points: sessionsPoints,
      ...sessionsTrend,
      periodLabel: `Últimos ${days} dias`,
    },
    readings: {
      points: readingsPoints,
      ...readingsTrend,
      periodLabel: `Últimos ${days} dias`,
    },
    practice: {
      points: practicePoints,
      ...practiceTrend,
      periodLabel: `Últimos ${days} dias`,
    },
    overall: {
      points: overallPoints,
      ...overallTrend,
      periodLabel: `Últimos ${days} dias`,
    },
    historicalData,
  };
}

// Export singleton for direct usage
export const defaultTrends = getTrends(30);
