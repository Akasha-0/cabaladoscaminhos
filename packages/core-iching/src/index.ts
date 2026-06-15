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
  Wing,
  Hexagram,
  TrigramId,
  HexagramWithWings,
} from './types';

// Hexagramas (64) — funcoes publicas
export { HEXAGRAMS, getHexagram, getAllHexagrams } from './hexagrams';

// Hexagrama natal
export { buildIchingMap } from './natal';
