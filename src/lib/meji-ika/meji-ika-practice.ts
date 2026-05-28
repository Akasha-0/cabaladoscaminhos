// Meji-ika practice

export interface MejiIkaPracticeConfig {
  intensity?: number; // 1-10 scale
  duration?: number; // minutes
  focus?: 'wisdom' | 'balance' | 'integration' | 'clarity';
  meditationType?: 'contemplative' | 'active' | 'restorative';
}

export interface MejiIkaPracticeResult {
  completed: boolean;
  energyLevel: number; // 0-100
  activatedStates: string[];
  depth: number; // 1-7
  insights: string[];
}

const STATES = ['grounding', 'observation', 'discernment', 'integration', 'wisdom', 'balance', 'clarity'];

export async function performPractice(config: MejiIkaPracticeConfig = {}): Promise<MejiIkaPracticeResult> {
  const { intensity = 5, duration = 30, focus, meditationType = 'contemplative' } = config;

  const meditationMultiplier = {
    contemplative: 1.2,
    active: 1.5,
    restorative: 0.8,
  }[meditationType];

  const baseEnergy = Math.min(100, Math.max(0, intensity * 10 * meditationMultiplier));

  // Calculate depth based on intensity and duration
  const intensityFactor = intensity / 10;
  const durationFactor = Math.min(1, duration / 60);
  const depth = Math.ceil((intensityFactor * 0.4 + durationFactor * 0.6) * 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // Determine activated states
  const activatedStates = STATES.slice(0, Math.max(1, depth));

  return {
    completed: true,
    energyLevel: Math.round(baseEnergy),
    activatedStates,
    depth,
    insights: generateInsights(depth, activatedStates, focus),
  };
}

function generateInsights(depth: number, states: string[], focus?: string): string[] {
  const insights: string[] = [];

  if (depth >= 3) {
    insights.push('Discernment sharpens through patient observation');
  }
  if (depth >= 5) {
    insights.push('Integration reveals the balance of opposites');
  }
  if (depth >= 7) {
    insights.push('Clarity emerges from deep wisdom');
  }

  const focusInsight: Record<string, string> = {
    wisdom: 'Ancient knowledge flows through the sacred practice',
    balance: 'Equilibrium forms between light and shadow',
    integration: 'The dual nature unified in wholeness',
    clarity: 'Truth illuminates through inner sight',
  };

  if (focus && focusInsight[focus]) {
    insights.push(focusInsight[focus]);
  }

  states.forEach((state) => {
    const stateInsight = getStateInsight(state);
    if (stateInsight) insights.push(stateInsight);
  });

  return insights;
}

function getStateInsight(state: string): string {
  const insights: Record<string, string> = {
    grounding: 'Earth connects with cosmic intention',
    observation: 'Witnessing reveals hidden patterns',
    discernment: 'Wisdom distinguishes truth from illusion',
    integration: 'All aspects merge into one purpose',
    wisdom: 'Ancient understanding guides the path',
    balance: 'Harmony holds the sacred space',
    clarity: 'Inner vision pierces the veil of confusion',
  };
  return insights[state] || '';
}