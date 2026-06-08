/**
 * @akasha/core-iching — Os 8 Trigramas (Bagua)
 * Sequência "Posterior ao Céu" (Fu Xi) — também chamada de Wen Wang
 * (八卦) na tradição da Sabedoria Ancestral Chinesa.
 *
 * Ordem King Wen:
 *  1 ☰ Qian (Céu)     — yang puro
 *  2 ☷ Kun (Terra)    — yin puro
 *  3 ☵ Kan (Água)     — yin central
 *  4 ☲ Li (Fogo)      — yang central
 *  5 ☳ Zhen (Trovão)  — yang ascendente
 *  6 ☶ Gen (Montanha) — yang descendente
 *  7 ☴ Xun (Vento)    — yin descendente
 *  8 ☱ Dui (Lago)     — yin ascendente
 */

import type { Trigram, TrigramId } from './types';

export const TRIGRAMS: Record<TrigramId, Trigram> = {
  1: {
    id: 1,
    chineseName: 'Qian',
    name: 'Céu',
    nameEn: 'Heaven',
    glyph: '☰',
    nature: 'yang',
    element: 'metal',
    family: 'pai',
    direction: 'Noroeste',
    attribute: 'criativo, forte, luminoso',
    lines: [true, true, true],
  },
  2: {
    id: 2,
    chineseName: 'Kun',
    name: 'Terra',
    nameEn: 'Earth',
    glyph: '☷',
    nature: 'yin',
    element: 'earth',
    family: 'mae',
    direction: 'Sudoeste',
    attribute: 'receptivo, dócil, devotado',
    lines: [false, false, false],
  },
  3: {
    id: 3,
    chineseName: 'Kan',
    name: 'Água',
    nameEn: 'Water',
    glyph: '☵',
    nature: 'yin',
    element: 'water',
    family: 'filho',
    direction: 'Norte',
    attribute: 'abismal, perigoso, fluente',
    lines: [false, true, false],
  },
  4: {
    id: 4,
    chineseName: 'Li',
    name: 'Fogo',
    nameEn: 'Fire',
    glyph: '☲',
    nature: 'yang',
    element: 'fire',
    family: 'filha',
    direction: 'Sul',
    attribute: 'luminoso, dependente, claro',
    lines: [true, false, true],
  },
  5: {
    id: 5,
    chineseName: 'Zhen',
    name: 'Trovão',
    nameEn: 'Thunder',
    glyph: '☳',
    nature: 'yang',
    element: 'wood',
    family: 'filho',
    direction: 'Leste',
    attribute: 'mobilizador, desperto, iniciante',
    lines: [false, false, true],
  },
  6: {
    id: 6,
    chineseName: 'Gen',
    name: 'Montanha',
    nameEn: 'Mountain',
    glyph: '☶',
    nature: 'yang',
    element: 'earth',
    family: 'filho',
    direction: 'Nordeste',
    attribute: 'imóvel, meditativo, contido',
    lines: [true, false, false],
  },
  7: {
    id: 7,
    chineseName: 'Xun',
    name: 'Vento',
    nameEn: 'Wind',
    glyph: '☴',
    nature: 'yin',
    element: 'wood',
    family: 'filha',
    direction: 'Sudeste',
    attribute: 'suave, penetrante, dispersante',
    lines: [true, true, false],
  },
  8: {
    id: 8,
    chineseName: 'Dui',
    name: 'Lago',
    nameEn: 'Lake',
    glyph: '☱',
    nature: 'yin',
    element: 'metal',
    family: 'filha',
    direction: 'Oeste',
    attribute: 'alegre, sereno, submisso',
    lines: [false, true, true],
  },
};

/** Retorna o trigrama pelo id 1-8. */
export function getTrigram(id: TrigramId): Trigram {
  return TRIGRAMS[id];
}

/** Retorna o trigrama a partir das 3 linhas (de baixo para cima). */
export function getTrigramByLines(lower: boolean, middle: boolean, upper: boolean): TrigramId {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8] as TrigramId[]) {
    const t = TRIGRAMS[id];
    if (t.lines[0] === lower && t.lines[1] === middle && t.lines[2] === upper) {
      return id;
    }
  }
  // fallback inatingível — todas as 8 combinações existem no mapa acima
  throw new Error('Trigrama não encontrado para as linhas informadas');
}
