/**
 * Akasha v0.0.5 T6 — Helper para renderizar o I-Ching como 5º nó da Mandala.
 *
 * Camadas concêntricas: Odus (r=50), Cabala (r=80), Tantra (r=138), Astrologia (r=170-196).
 * O I-Ching entra em r=110, ângulo 90° (topo), entre Tantra (138) e Cabala (80).
 */

import { buildIchingMap, TRIGRAMS, type IChingMap, type TrigramId } from '@akasha/core-iching';

export interface IchingNodePosition {
  x: number;
  y: number;
}

export interface IchingNodeData {
  position: IchingNodePosition;
  hexagramNumber: number | null;
  hexagramName: string | null;
  hexagramChineseName: string | null;
  upperTrigram: TrigramId | null;
  lowerTrigram: TrigramId | null;
  upperTrigramName: string | null;
  lowerTrigramName: string | null;
  available: boolean;
}

const CENTER_X = 200;
const CENTER_Y = 200;
const ICHING_RADIUS = 110;
const ICHING_ANGLE_DEG = 90; // topo

const TRIGRAM_PT_NAMES: Record<TrigramId, string> = {
  1: 'Céu',
  2: 'Terra',
  3: 'Água',
  4: 'Fogo',
  5: 'Trovão',
  6: 'Montanha',
  7: 'Vento',
  8: 'Lago',
};

function trigramName(id: TrigramId | null | undefined): string | null {
  if (id == null) return null;
  return TRIGRAM_PT_NAMES[id] ?? TRIGRAMS[id]?.name ?? null;
}

/**
 * Calcula o nó SVG do I-Ching para a Mandala.
 * - Se `ichingMap` for null mas houver birthDate/birthTime, calcula sob demanda.
 * - Se entrada inválida ou erro, retorna `available: false` (sem lançar).
 */
export function computeIchingNode(
  user: { birthDate?: Date | string | null; birthTime?: string | null },
  ichingMap?: IChingMap | null,
): IchingNodeData {
  const position: IchingNodePosition = {
    x: CENTER_X + ICHING_RADIUS * Math.cos((ICHING_ANGLE_DEG - 90) * Math.PI / 180),
    y: CENTER_Y + ICHING_RADIUS * Math.sin((ICHING_ANGLE_DEG - 90) * Math.PI / 180),
  };

  if (!ichingMap && (user.birthDate || user.birthTime)) {
    try {
      ichingMap = buildIchingMap({
        birthDate: user.birthDate as string,
        birthTime: user.birthTime ?? null,
      });
    } catch {
      ichingMap = null;
    }
  }

  if (!ichingMap) {
    return {
      position,
      hexagramNumber: null,
      hexagramName: null,
      hexagramChineseName: null,
      upperTrigram: null,
      lowerTrigram: null,
      upperTrigramName: null,
      lowerTrigramName: null,
      available: false,
    };
  }

  return {
    position,
    hexagramNumber: ichingMap.hexagramNumber,
    hexagramName: ichingMap.hexagramName,
    hexagramChineseName: ichingMap.hexagramChineseName,
    upperTrigram: ichingMap.upperTrigram,
    lowerTrigram: ichingMap.lowerTrigram,
    upperTrigramName: trigramName(ichingMap.upperTrigram),
    lowerTrigramName: trigramName(ichingMap.lowerTrigram),
    available: !ichingMap.error,
  };
}
