/**
 * Journey Stages - Kabbalistic Spiritual Development
 * Defines the ten sephiroth stages of the soul's path
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

/**
 * The ten stages of the Kabbalistic Tree of Life journey.
 * Each stage corresponds to a sephirah and represents
 * a distinct phase of spiritual development.
 */
export function getStages(): JourneyStage[] {
  return [
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
}