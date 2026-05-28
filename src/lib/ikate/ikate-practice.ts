// Ikate practice

export interface IkatePracticeConfig {
  intensity?: number; // 1-10 scale
  duration?: number; // minutes
  focus?: 'integration' | 'transformation' | 'ascension' | 'mastery';
  breathingPattern?: 'rapid' | 'medium' | 'slow';
}

export interface IkatePracticeResult {
  completed: boolean;
  energyLevel: number; // 0-100
  activatedPath: string[];
  depth: number; // 1-7
  insights: string[];
}

const PATH_LEVELS = ['foundation', 'building', 'structure', 'integration', 'transformation', 'ascension', 'mastery'];

export async function performPractice(config: IkatePracticeConfig = {}): Promise<IkatePracticeResult> {
  const { intensity = 5, duration = 30, focus, breathingPattern = 'medium' } = config;

  const breathingMultiplier = {
    rapid: 1.5,
    medium: 1.0,
    slow: 0.7,
  }[breathingPattern];

  const baseEnergy = Math.min(100, Math.max(0, intensity * 10 * breathingMultiplier));

  // Calculate depth based on intensity and duration
  const intensityFactor = intensity / 10;
  const durationFactor = Math.min(1, duration / 60);
  const depth = Math.ceil((intensityFactor * 0.4 + durationFactor * 0.6) * 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // Determine activated path levels
  const activatedPath = PATH_LEVELS.slice(0, Math.max(1, depth));

  return {
    completed: true,
    energyLevel: Math.round(baseEnergy),
    activatedPath,
    depth,
    insights: generateInsights(depth, activatedPath, focus),
  };
}

function generateInsights(depth: number, path: string[], focus?: string): string[] {
  const insights: string[] = [];

  if (depth >= 3) {
    insights.push('The foundation strengthens with each breath');
  }
  if (depth >= 5) {
    insights.push('Transformation flows through the sacred structure');
  }
  if (depth >= 7) {
    insights.push('Mastery emerges from deep integration');
  }

  const focusInsight: Record<string, string> = {
    integration: 'The paths merge into unified wholeness',
    transformation: 'Ancient wisdom transforms through intention',
    ascension: 'Rising consciousness pierces the veil of separation',
    mastery: 'Sovereign power flows through the awakened structure',
  };

  if (focus && focusInsight[focus]) {
    insights.push(focusInsight[focus]);
  }

  path.forEach((level) => {
    const levelInsight = getLevelInsight(level);
    if (levelInsight) insights.push(levelInsight);
  });

  return insights;
}

function getLevelInsight(level: string): string {
  const insights: Record<string, string> = {
    foundation: 'The foundation grounds the sacred work',
    building: 'Building creates the structure for growth',
    structure: 'Structure holds the space for transformation',
    integration: 'Integration weaves all elements together',
    transformation: 'Transformation transmutes old patterns',
    ascension: 'Ascension lifts consciousness toward light',
    mastery: 'Mastery aligns with divine purpose',
  };
  return insights[level] || '';
}