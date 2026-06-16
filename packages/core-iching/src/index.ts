/**
 * @akasha/core-iching
 * Motor determinístico do I-Ching — Sistema Akasha.
 * 8 trigramas (Bagua) + 64 hexagramas (King Wen) + hexagrama natal.
 *
 * Sem dependências de framework. Dados esotéricos validados contra IDEIA.md.
 * Ver Doc 14 (Extensibilidade Oracular) §2 — I-Ching como 5º sistema opt-in.
 */

// Tipos públicos
export type {
  IChingMap,
  Trigram,
  Wing,
  Hexagram,
  TrigramId,
  HexagramWithWings,
} from './types';

// Trigramas (Bagua) — 8 trigramas + funções
export { TRIGRAMS, getTrigram, getTrigramByLines } from './bagua';

// Hexagramas (64) — funções públicas
export { HEXAGRAMS, getHexagram, getAllHexagrams } from './hexagrams';

// Asas (Wings) — 10 wings do I Ching
export {
  WINGS,
  getWing,
  getAllWings,
  getWingsByHexagram,
  getHexagramWithWings,
} from './wings';

// Hexagrama natal
export { buildIchingMap } from './natal';
