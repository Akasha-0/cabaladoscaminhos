/**
 * Destiny Paths Module
 * Kabbalistic paths of destiny and spiritual evolution
 */

// @ts-nocheck

export interface DestinyPath {
  id: string;
  name: string;
  number: number;
  description: string;
  sephirot_start: string;
  sephirot_end: string;
  energy: string;
  lesson: string;
  keywords: string[];
}

export const DESTINY_PATHS: DestinyPath[] = [
  {
    id: 'path-1',
    name: 'The Path of Crown',
    number: 1,
    description: 'The journey from Kether to Chokmah, representing the transmission of divine will',
    sephirot_start: 'Kether',
    sephirot_end: 'Chokmah',
    energy: 'willpower',
    lesson: 'Embrace your divine purpose and channel cosmic intention',
    keywords: ['will', 'divine', 'purpose', 'origin', 'transmission'],
  },
  {
    id: 'path-2',
    name: 'The Path of Wisdom',
    number: 2,
    description: 'The path from Kether to Chokmah through Binah, the reception of wisdom',
    sephirot_start: 'Kether',
    sephirot_end: 'Chokmah',
    energy: 'wisdom',
    lesson: 'Receive cosmic wisdom and integrate understanding',
    keywords: ['wisdom', 'understanding', 'reception', 'integration'],
  },
  {
    id: 'path-3',
    name: 'The Path of Understanding',
    number: 3,
    description: 'The path from Chokmah to Binah, the bridge of cosmic knowledge',
    sephirot_start: 'Chokmah',
    sephirot_end: 'Binah',
    energy: 'knowledge',
    lesson: 'Bridge the gap between cosmic forces and earthly manifestation',
    keywords: ['knowledge', 'bridge', 'cosmic', 'manifestation'],
  },
  {
    id: 'path-4',
    name: 'The Path of Mercy',
    number: 4,
    description: 'The path from Chokmah to Chesed, channeling divine compassion',
    sephirot_start: 'Chokmah',
    sephirot_end: 'Chesed',
    energy: 'compassion',
    lesson: 'Channel divine compassion into structured mercy',
    keywords: ['mercy', 'compassion', 'structure', 'divine'],
  },
  {
    id: 'path-5',
    name: 'The Path of Strength',
    number: 5,
    description: 'The path from Chesed to Gevurah, balancing power with restraint',
    sephirot_start: 'Chesed',
    sephirot_end: 'Gevurah',
    energy: 'strength',
    lesson: 'Balance power with compassion and find inner strength',
    keywords: ['strength', 'power', 'restraint', 'balance'],
  },
  {
    id: 'path-6',
    name: 'The Path of Beauty',
    number: 6,
    description: 'The central path from Tiferet to all sephirot, the heart of the tree',
    sephirot_start: 'Tiferet',
    sephirot_end: 'Tiferet',
    energy: 'beauty',
    lesson: 'Find balance and harmony within yourself',
    keywords: ['beauty', 'harmony', 'balance', 'heart', 'center'],
  },
  {
    id: 'path-7',
    name: 'The Path of Victory',
    number: 7,
    description: 'The path from Gevurah to Netzach, channeling determination',
    sephirot_start: 'Gevurah',
    sephirot_end: 'Netzach',
    energy: 'victory',
    lesson: 'Transform discipline into creative triumph',
    keywords: ['victory', 'triumph', 'determination', 'creativity'],
  },
  {
    id: 'path-8',
    name: 'The Path of Splendor',
    number: 8,
    description: 'The path from Netzach to Hod, balancing emotion with intellect',
    sephirot_start: 'Netzach',
    sephirot_end: 'Hod',
    energy: 'splendor',
    lesson: 'Integrate emotional wisdom with intellectual clarity',
    keywords: ['splendor', 'emotion', 'intellect', 'integration'],
  },
  {
    id: 'path-9',
    name: 'The Path of Foundation',
    number: 9,
    description: 'The path from Hod to Yesod, grounding spiritual insight',
    sephirot_start: 'Hod',
    sephirot_end: 'Yesod',
    energy: 'foundation',
    lesson: 'Ground your intellectual understanding in practical wisdom',
    keywords: ['foundation', 'grounding', 'practical', 'wisdom'],
  },
  {
    id: 'path-10',
    name: 'The Path of Kingdom',
    number: 10,
    description: 'The final path from Yesod to Malkuth, manifesting divine reality',
    sephirot_start: 'Yesod',
    sephirot_end: 'Malkuth',
    energy: 'manifestation',
    lesson: 'Bring spiritual wisdom into physical reality',
    keywords: ['kingdom', 'manifestation', 'reality', 'earth', 'physical'],
  },
  {
    id: 'path-11',
    name: 'The Path of Faith',
    number: 11,
    description: 'The path of Binah to Chesed, transforming understanding into mercy',
    sephirot_start: 'Binah',
    sephirot_end: 'Chesed',
    energy: 'faith',
    lesson: 'Transform personal understanding into universal compassion',
    keywords: ['faith', 'understanding', 'compassion', 'universal'],
  },
  {
    id: 'path-12',
    name: 'The Path of Vision',
    number: 12,
    description: 'The path from Chesed to Tiferet, visioning beauty through mercy',
    sephirot_start: 'Chesed',
    sephirot_end: 'Tiferet',
    energy: 'vision',
    lesson: 'See beauty through the lens of mercy and compassion',
    keywords: ['vision', 'beauty', 'mercy', 'seeing'],
  },
];

export function getPaths(): DestinyPath[] {
  return [...DESTINY_PATHS];
}

export function getPathByNumber(number: number): DestinyPath | undefined {
  return DESTINY_PATHS.find((p) => p.number === number);
}

export function getPathById(id: string): DestinyPath | undefined {
  return DESTINY_PATHS.find((p) => p.id === id);
}

export function getPathsByEnergy(energy: string): DestinyPath[] {
  return DESTINY_PATHS.filter((p) => p.energy === energy);
}

export function searchPaths(query: string): DestinyPath[] {
  const lowerQuery = query.toLowerCase();
  return DESTINY_PATHS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
  );
}