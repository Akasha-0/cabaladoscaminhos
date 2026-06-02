/**
 * Motor de Cálculo do Odu de Nascimento
 * ======================================
 *
 * Determina o Odu (1..16) a partir da data de nascimento.
 *
 * @see docs/04_data-model.md §2.4
 * @see docs/07_epics-stories.md §S2.4
 *
 * Método canônico: o Odu de Nascimento é derivado da soma reduzida
 * do dia + mês de nascimento, mapeada para o intervalo 1..16.
 *   - Se resultado ≤ 0 ou > 16, aplica-se uma redução adicional
 *     preservando a tradição Ifá (módulo 16 com offset 1).
 *
 * IMPORTANTE: esta é uma simplificação pedagógica. A tradição viva
 * consulta o Odu de nascimento através do jogo dos búzios feito
 * pela Ialorixá ou pelo babalorixá do consulente. O resultado deste
 * cálculo é uma aproximação para uso automático no sistema — o
 * terapeuta SEMPRE pode sobrescrever manualmente.
 */

import { ODUS } from '@/lib/constants/odus';
import type { OduBirth } from '@/types';

function splitDate(date: Date | string): { year: number; month: number; day: number } {
  const iso =
    typeof date === 'string'
      ? date.slice(0, 10)
      : date.toISOString().slice(0, 10);
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 0, day: d ?? 0 };
}

function sumDigits(n: number): number {
  return n
    .toString()
    .split('')
    .reduce((acc, d) => acc + Number(d), 0);
}

/**
 * Calcula o número do Odu (1..16) a partir da data de nascimento.
 *  - Soma dia + mês, reduz a um dígito.
 *  - Mapeia para 1..16: (reduzido - 1) % 16 + 1
 */
export function calculateOduNumber(date: Date | string): number {
  const { day, month } = splitDate(date);
  const total = sumDigits(day) + sumDigits(month);
  let reduced = total;
  while (reduced > 9) reduced = sumDigits(reduced);
  if (reduced === 0) reduced = 16;
  return ((reduced - 1) % 16) + 1;
}

/**
 * Constrói o OduBirth completo. O sistema de crenças associa o
 * Odu a uma "lição de vida" — para o MVP, usamos a `essence`
 * como life lesson. Aprofundamentos podem ser editados
 * manualmente pelo terapeuta.
 */
export function buildOduBirth(date: Date | string): OduBirth {
  const oduNumber = calculateOduNumber(date);
  const odu = ODUS[oduNumber - 1];
  if (!odu) {
    throw new Error(`Odu ${oduNumber} não encontrado em ODUS`);
  }
  return {
    oduNumber,
    oduName: odu.name,
    orixaRegency: [...odu.orixas],
    elementalForce: odu.essence,
    lifeLesson: `O Odu ${odu.name} traz como ensinamento central: ${odu.essence}.`,
  };
}
