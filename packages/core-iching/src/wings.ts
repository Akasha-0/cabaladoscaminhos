/**
 * @akasha/core-iching — As 10 Asas do I Ching (十翼/Shi Yi)
 * Os dez comentários tradicionais atribuídos a Confucius ou tradição
 * pós-Wen Wang que expandem o significado dos 64 hexagramas.
 *
 * As Asas agrupam hexagramas por tema/arquetípico, facilitando
 * a leitura espiritual e o estudo comparado.
 */
import { getHexagram } from './hexagrams';
import type { Wing, HexagramWithWings } from './types';

/** As 10 Asas do I Ching em ordem canônica. */
const WINGS: Wing[] = [
  {
    id: 1,
    name: '天璜',
    nameEn: 'Tian Huang (Heavenly Wing)',
    description:
      'Céu e Ambiente — O aspecto criativo e espiritual. Governa os processos de nascimento e renovação cósmica.',
    themes: ['criação', 'espírito', 'movimento celestial', 'renovação cósmica'],
    hexagrams: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2,
    name: '坤璜',
    nameEn: 'Kun Huang (Earthly Wing)',
    description:
      'Terra — A dimensão receptiva e nutritiva. Representa o plano material e a devoção à vida.',
    themes: ['terra', 'nutrição', 'receptividade', 'devoção'],
    hexagrams: [7, 8, 9, 10, 11, 12, 13, 14],
  },
  {
    id: 3,
    name: '同人璜',
    nameEn: 'Wei Ren (Social Consciousness Wing)',
    description:
      'Consciência Social — O reconhecimento da humanidade como coletivo. Harmonia entre pessoas.',
    themes: ['humanidade', 'comunidade', 'cooperação', 'fraternidade'],
    hexagrams: [15, 16, 17, 18, 19],
  },
  {
    id: 4,
    name: '咸璜',
    nameEn: 'Xian Huang (Intimacy Wing)',
    description:
      'Intimidade — A conexão coração-a-coração. Relacionamentos, casamento e influência mútua.',
    themes: ['intimidade', 'relacionamento', 'casamento', 'influência'],
    hexagrams: [20, 21, 22, 23],
  },
  {
    id: 5,
    name: '遯璜',
    nameEn: 'Dun Huang (Isolation Wing)',
    description:
      'Isolamento — A sabedoria de recuar. Saber quando se retirar para preservar a essência.',
    themes: ['retirada', 'preservação', 'discernimento', 'timing'],
    hexagrams: [24, 25, 26, 27, 28],
  },
  {
    id: 6,
    name: '晉璜',
    nameEn: 'Jin Huang (Advance Wing)',
    description: 'Avanço — O progresso e a ascensão. Luz nascente e expansão da consciência.',
    themes: ['progresso', 'ascensão', 'luz', 'avanço'],
    hexagrams: [29, 30, 31, 32, 33, 34],
  },
  {
    id: 7,
    name: '損益璜',
    nameEn: 'Sun Yi (Flux Wing)',
    description: 'Fluxo — Oscilação entre diminuição e aumento. A lei do dar e receber cósmico.',
    themes: ['fluxo', 'diminuição', 'aumento', 'equilíbrio'],
    hexagrams: [35, 36, 37, 38, 39, 40],
  },
  {
    id: 8,
    name: '夬璜',
    nameEn: 'Guai Huang (Resolution Wing)',
    description: 'Resolução — A decisão e o corte. Ação decisiva que resolve situações pendentes.',
    themes: ['decisão', 'resolução', 'corte', 'ação firme'],
    hexagrams: [41, 42, 43, 44, 45, 46],
  },
  {
    id: 9,
    name: '豐璜',
    nameEn: 'Feng Huang (Abundance Wing)',
    description:
      'Abundância — A plenitude e a transformação. Caldeirão alquímico e mudança de era.',
    themes: ['abundância', 'transformação', 'plenitude', 'alquimia'],
    hexagrams: [47, 48, 49, 50, 51, 52],
  },
  {
    id: 10,
    name: '旅璜',
    nameEn: 'Lu Huang (Wanderer Wing)',
    description:
      'Wanderer — O andante e a jornada. Viagem interior e exterior, estrangeiro e peregrino.',
    themes: ['viagem', 'andança', 'estrangeiro', 'peregrinação'],
    hexagrams: [53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
  },
];

/** Mapa de asas por ID para busca rápida. */
const WINGS_BY_ID = Object.fromEntries(WINGS.map((w) => [w.id, w]));

/** Mapa de asas por hexagrama para busca rápida. */
const WINGS_BY_HEXAGRAM = WINGS.reduce<Record<number, Wing[]>>((acc, wing) => {
  wing.hexagrams.forEach((h) => {
    if (!acc[h]) acc[h] = [];
    acc[h].push(wing);
  });
  return acc;
}, {});

export { WINGS };

/** Retorna a Asa pelo ID (1-10). */
export function getWing(id: number): Wing {
  if (!Number.isInteger(id) || id < 1 || id > 10) {
    throw new RangeError(`ID de Asa inválido: ${id}. Esperado 1-10.`);
  }
  return WINGS_BY_ID[id];
}

/** Retorna todas as 10 Asas em ordem. */
export function getAllWings(): Wing[] {
  return [...WINGS];
}

/** Retorna as Asas que contêm um hexagrama específico (1-64). */
export function getWingsByHexagram(hexagramNumber: number): Wing[] {
  if (!Number.isInteger(hexagramNumber) || hexagramNumber < 1 || hexagramNumber > 64) {
    throw new RangeError(`Número de hexagrama inválido: ${hexagramNumber}. Esperado 1-64.`);
  }
  return WINGS_BY_HEXAGRAM[hexagramNumber] ?? [];
}

/**
 * Retorna o hexagrama expandido com suas Asas.
 * Cada hexagrama pode pertencer a múltiplas Asas.
 */
export function getHexagramWithWings(number: number): HexagramWithWings {
  const hexagram = getHexagram(number);
  const wings = getWingsByHexagram(number);
  if (wings.length === 0) {
    throw new Error(`Hexagrama ${number} não pertence a nenhuma Asa.`);
  }
  return {
    ...hexagram,
    wings,
    mainWing: wings[0],
  };
}
