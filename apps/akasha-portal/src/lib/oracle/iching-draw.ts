/**
 * iching-draw.ts — Akasha v0.0.5 T8
 *
 * Sorteio ponderado do hexagrama King Wen para a consulta oracular.
 *
 * 16 hexagramas curados (King Wen 1-16) recebem peso 4; os 48 restantes
 * (17-64) recebem peso 1. Total: 16×4 + 48×1 = 112 slots. A escolha
 * reflete o fato de que os 16 primeiros são os que têm entries completas
 * no Grimório (grimoire/iching/hex-*.md), garantindo que o sorteio
 * prefira hexagramas com material curado para a leitura cruzada.
 *
 * Sem dependência de crypto/Node — usa Math.random() com fallback
 * determinístico via seed (mulberry32) para reproducibilidade em testes.
 */
import { getAllHexagrams, getHexagram, type Hexagram, type TrigramId } from '@akasha/core-iching';

export interface IchingDrawResult {
  hexagramNumber: number;
  hexagramName: string;
  hexagramChineseName: string;
  upperTrigram: TrigramId;
  lowerTrigram: TrigramId;
  lines: boolean[];
}

const CURATED_WEIGHT = 4;
const DEFAULT_WEIGHT = 1;
const CURATED_THRESHOLD = 16; // King Wen 1-16
const ALL = getAllHexagrams();

/** PRNG determinístico (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(rand: () => number): Hexagram {
  // 16 curados × 4 + 48 restantes × 1 = 112 slots
  const total = CURATED_THRESHOLD * CURATED_WEIGHT + (ALL.length - CURATED_THRESHOLD) * DEFAULT_WEIGHT;
  let n = Math.floor(rand() * total);
  for (const hex of ALL) {
    const weight = hex.number <= CURATED_THRESHOLD ? CURATED_WEIGHT : DEFAULT_WEIGHT;
    if (n < weight) return hex;
    n -= weight;
  }
  // Fallback inatingível (rand() < 1 garante n < total)
  return getHexagram(1);
}

/**
 * Sorteia um hexagrama King Wen (1-64) com peso 4 para os 16 curados
 * e peso 1 para os 48 restantes.
 *
 * Se `seed` for fornecido, o sorteio é determinístico (testes).
 * Caso contrário, usa `Math.random()`.
 */
export function drawIchingHexagram(seed?: number): IchingDrawResult {
  const rand = typeof seed === 'number' ? mulberry32(seed) : Math.random;
  const hex = pickWeighted(rand);
  return {
    hexagramNumber: hex.number,
    hexagramName: hex.name,
    hexagramChineseName: hex.chineseName,
    upperTrigram: hex.upperTrigram,
    lowerTrigram: hex.lowerTrigram,
    lines: [...hex.lines],
  };
}
