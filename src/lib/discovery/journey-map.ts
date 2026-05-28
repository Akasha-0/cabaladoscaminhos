/**
 * Journey Map - Spiritual Development Tracking
 * Maps the soul's progression through the paths of Kabbalah
 */

export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  sephiroth: string[];
  symbols: string[];
  practices: string[];
  completionWeight: number;
}

export interface JourneyMap {
  currentStage: number;
  stages: JourneyStage[];
  totalProgress: number;
  unlockedPaths: string[];
}

export interface JourneyProgress {
  stageId: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Maps the spiritual development journey through Kabbalistic paths
 */
export function mapJourney(progress?: Partial<JourneyProgress>): JourneyMap {
  const stages: JourneyStage[] = [
    {
      id: 'birth',
      name: 'Birth — Malkuth',
      description: 'The awakening of consciousness in the material world. Foundation of all spiritual work.',
      sephiroth: ['Malkuth'],
      symbols: ['Earth', 'Kingdom', 'Sand'],
      practices: ['Daily contemplation', 'Grounding rituals', 'Nature connection'],
      completionWeight: 1,
    },
    {
      id: 'foundation',
      name: 'Foundation — Yesod',
      description: 'Building the subconscious foundation. Dreams, imagination, and the lunar light.',
      sephiroth: ['Yesod'],
      symbols: ['Moon', 'Phallus', 'Phantom'],
      practices: ['Dream journaling', 'Lunar meditation', 'Shadow work'],
      completionWeight: 2,
    },
    {
      id: 'victory',
      name: 'Victory — Netzach',
      description: 'Developing emotional intelligence, love, and the force of nature within.',
      sephiroth: ['Netzach'],
      symbols: ['Venus', 'Victory', 'Mountain'],
      practices: ['Heart-centered meditation', 'Nature immersion', 'Emotional release'],
      completionWeight: 3,
    },
    {
      id: 'mercy',
      name: 'Mercy — Chesed',
      description: 'Expanding loving-kindness, structure, and the arm of severity.',
      sephiroth: ['Chesed'],
      symbols: ['Jupiter', 'Mercy', 'Pillar'],
      practices: ['Loving-kindness practice', 'Structure building', 'Generosity cultivation'],
      completionWeight: 3,
    },
    {
      id: 'beauty',
      name: 'Beauty — Tiphereth',
      description: 'The central equilibrum. Balance of mercy and severity, the solar self.',
      sephiroth: ['Tiphereth'],
      symbols: ['Sun', 'Beauty', 'Sacrifice'],
      practices: ['Solar meditation', 'Self-sacrifice practice', 'Harmony cultivation'],
      completionWeight: 4,
    },
    {
      id: 'severity',
      name: 'Severity — Gevurah',
      description: 'Discernment, judgment, and the arm of mercy. The warrior aspect.',
      sephiroth: ['Gevurah'],
      symbols: ['Mars', 'Severity', 'Judgment'],
      practices: ['Discernment practice', 'Boundary setting', 'Strength cultivation'],
      completionWeight: 3,
    },
    {
      id: 'wisdom',
      name: 'Wisdom — Chokmah',
      description: 'Pure insight beyond form. The first revelation of the infinite.',
      sephiroth: ['Chokmah'],
      symbols: ['Zayin', 'Wisdom', 'Father'],
      practices: ['Contemplation', 'Symbol study', 'Non-dual awareness'],
      completionWeight: 4,
    },
    {
      id: 'understanding',
      name: 'Understanding — Binah',
      description: 'The great sea. Form, limitation, and the feminine mystery.',
      sephiroth: ['Binah'],
      symbols: ['Saturn', 'Understanding', 'Mother'],
      practices: ['Feminine mysteries', 'Sabbath practice', 'Sorrow transmutation'],
      completionWeight: 4,
    },
    {
      id: 'crown',
      name: 'Crown — Kether',
      description: 'The nothingness beyond something. Union with the source.',
      sephiroth: ['Kether'],
      symbols: ['Ancient of Days', 'Crown', 'Nothing'],
      practices: ['Silence practice', 'Mystical union', 'Dissolution'],
      completionWeight: 5,
    },
  ];

  const totalWeight = stages.reduce((sum, s) => sum + s.completionWeight, 0);

  const currentStage = progress?.stageId
    ? stages.findIndex((s) => s.id === progress.stageId)
    : 0;

  const stageProgress = progress?.progress ?? 0;

  let completedWeight = 0;
  for (let i = 0; i < currentStage; i++) {
    completedWeight += stages[i].completionWeight;
  }
 completedWeight += Math.floor(stageProgress * stages[currentStage].completionWeight);

  const totalProgress = Math.round((completedWeight / totalWeight) * 100);

  const unlockedPaths = stages
    .slice(0, currentStage + 1)
    .flatMap((s) => s.sephiroth);

  return {
    currentStage,
    stages,
    totalProgress,
    unlockedPaths,
  };
}

export function getStageProgression(stageId: string): string[] {
  const stages = mapJourney().stages;
  const index = stages.findIndex((s) => s.id === stageId);
  if (index === -1) return [];
  return stages.slice(0, index + 1).map((s) => s.id);
}

export function getNextStage(currentStageId: string): JourneyStage | null {
  const stages = mapJourney().stages;
  const index = stages.findIndex((s) => s.id === currentStageId);
  if (index === -1 || index >= stages.length - 1) return null;
  return stages[index + 1];
}
