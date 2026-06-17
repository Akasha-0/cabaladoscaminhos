export interface AstroMap {
  sun?: string;
  moon?: string;
  elementalChart?: Record<string, number>;
  [key: string]: unknown;
}

export interface LifePathMap {
  lifePath?: number;
  [key: string]: unknown;
}

export interface TransitResult {
  date: string;
  moonPhase: { name: string; phase: string };
  majorAspects: Array<{ type: string; planets: string[]; orb: number }>;
  overallTheme: string;
  luckyColor: string;
  overallEnergy: number;
}

export function buildDailyEnergy(
  _astro: AstroMap,
  _lifePath: LifePathMap,
  date: Date
): TransitResult {
  return {
    date: date.toISOString().split('T')[0],
    moonPhase: { name: 'Lua Cheia', phase: 'full' },
    majorAspects: [],
    overallTheme: 'Iluminação',
    luckyColor: 'dourado',
    overallEnergy: 72,
  };
}
