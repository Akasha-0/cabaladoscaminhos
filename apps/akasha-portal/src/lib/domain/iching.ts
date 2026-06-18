/**
 * @file iching.ts
 * Cálculo determinístico do hexagrama do dia (Akasha v0.0.5, T7).
 *
 * Algoritmo: `(dayOfYear - 1) % 64 + 1` — mesmo dia do ano → mesmo hexagrama.
 * Garante distribuição uniforme dos 64 hexagramas King Wen ao longo do
 * ano e diversidade diária. Escolhido por simplicidade e auditabilidade
 * (Doc 25 §4 — Motor Diário). Coerente com o `algorithm: 'akasha.v0.0.4.trigramas-mod8'`
 * do core-iching, mas desacoplado do horário de nascimento (que não se
 * aplica a uma tiragem do dia).
 */
import { getHexagram } from '@akasha/core-iching';

export interface DailyHexagram {
  hexagramNumber: number;
  hexagramName: string;
  hexagramChineseName: string;
  lines: boolean[];
}

/**
 * Calcula o hexagrama King Wen do dia.
 *
 * Determinístico: mesma data (UTC) → mesmo hexagrama.
 *
 * @example
 *   computeDailyHexagram(new Date('2026-06-08T12:00:00Z'))
 */
export function computeDailyHexagram(date: Date = new Date()): DailyHexagram {
  const dayOfYear = getDayOfYear(date);
  const hexagramNumber = ((dayOfYear - 1) % 64) + 1; // 1..64
  const hex = getHexagram(hexagramNumber as 1);

  return {
    hexagramNumber: hex.number,
    hexagramName: hex.name,
    hexagramChineseName: hex.chineseName,
    lines: [...hex.lines],
  };
}

/** Dia do ano (1-366) em UTC. */
function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
