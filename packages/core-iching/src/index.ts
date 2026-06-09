/**
 * @akasha/core-iching
 * Motor determinístico do I-Ching — Sistema Akasha.
 * 8 trigramas (Bagua) + 64 hexagramas (King Wen) + hexagrama natal.
 *
 * Sem dependências de framework. Dados esotéricos validados contra IDEIA.md.
 * Ver Doc 14 (Extensibilidade Oracular) §2 — I-Ching como 5º sistema opt-in.
 */

// Tipos
export type {
  TrigramId,
  Trigram,
  Hexagram,
  MutatingLine,
  IChingMap,
  BuildIchingMapArgs,
  Wing,
  HexagramWithWings,
  Element,
  PracticeCategory,
  PracticeAssociations,
  IntegrativePractice,
} from './types';

// Bagua (8 trigramas)
export { TRIGRAMS, getTrigram, getTrigramByLines } from './bagua';

// Hexagramas (64)
export { HEXAGRAMS, getHexagram, getAllHexagrams, getHexagramWithDetails } from './hexagrams';
export type { HexagramWithDetails } from './hexagrams';

// Asas (10 Wings)
export { WINGS, getWing, getAllWings, getWingsByHexagram, getHexagramWithWings } from './wings';

// Hexagrama natal
export { buildIchingMap } from './natal';

// Práticas integrativas
export {
  PRACTICES,
  getPractice,
  getPracticesByElement,
  getPracticesByTradition,
  getPracticesByCategory,
  getPracticesByLifeArea,
  getAllPractices,
} from './practices';
