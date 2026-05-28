// Ida-pingala practice

export interface IdaPingalaPracticeConfig {
  intensity?: number; // 1-10 scale
  duration?: number; // minutes
  focus?: 'ida' | 'pingala' | 'balanced' | 'sushumna';
  technique?: 'alternate' | 'right' | 'left' | 'rapid';
}

export interface IdaPingalaPracticeResult {
  completed: boolean;
  energyLevel: number; // 0-100
  dominantNadi: 'ida' | 'pingala' | 'balanced';
  channelsActivated: string[];
  cycleCount: number;
  insights: string[];
}

const NADIS = ['ida', 'pingala', 'sushumna'] as const;

export async function performPractice(config: IdaPingalaPracticeConfig = {}): Promise<IdaPingalaPracticeResult> {
  const { intensity = 5, duration = 20, focus = 'balanced', technique = 'alternate' } = config;

  const breathingMultiplier = {
    rapid: 1.5,
    alternate: 1.0,
    left: 0.8,
    right: 0.8,
  }[technique];

  const baseEnergy = Math.min(100, Math.max(0, intensity * 10 * breathingMultiplier));

  // Calculate cycles based on duration and technique
  const cycleDuration = {
    rapid: 0.5,
    alternate: 1.0,
    left: 1.5,
    right: 1.5,
  }[technique];

  const cycleCount = Math.floor((duration / cycleDuration) * (intensity / 10));

  // Determine dominant nadi
  let dominantNadi: 'ida' | 'pingala' | 'balanced' = 'balanced';

  if (focus === 'ida' || (technique === 'left' && intensity > 6)) {
    dominantNadi = 'ida';
  } else if (focus === 'pingala' || (technique === 'right' && intensity > 6)) {
    dominantNadi = 'pingala';
  }

  // Determine activated channels
  let channelsActivated = [...NADIS];

  if (focus === 'ida' || focus === 'pingala') {
    channelsActivated = ['sushumna', focus];
  }

  return {
    completed: true,
    energyLevel: Math.round(baseEnergy),
    dominantNadi,
    channelsActivated,
    cycleCount,
    insights: generateInsights(dominantNadi, channelsActivated, technique),
  };
}

function generateInsights(
  dominant: 'ida' | 'pingala' | 'balanced',
  channels: string[],
  technique: string
): string[] {
  const insights: string[] = [];

  if (technique === 'alternate') {
    insights.push('The breath dances between sun and moon, clearing the nadis');
  }
  if (technique === 'rapid') {
    insights.push('Rapid rhythmic breathing ignites the central fire');
  }

  if (dominant === 'ida') {
    insights.push('Lunar energy flows through the left channel, cooling and calming');
  } else if (dominant === 'pingala') {
    insights.push('Solar energy burns bright through the right channel, energizing and warming');
  } else {
    insights.push('Ida and Pingala dance in perfect harmony around the central column');
  }

  if (channels.includes('sushumna')) {
    insights.push('The breath begins to touch the sacred central channel');
  }

  const channelInsight: Record<string, string> = {
    ida: 'Chandra nadi brings lunar clarity and intuitive wisdom',
    pingala: 'Surya nadi ignites solar will and dynamic prana',
    sushumna: 'The royal path opens through the spine\'s sacred axis',
  };

  channels.forEach((c) => {
    if (channelInsight[c]) insights.push(channelInsight[c]);
  });

  return insights;
}