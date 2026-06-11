/**
 * F-208: 88° Solar Arc — "Momento Pré-natal Akasha"
 *
 * Implementação do algoritmo de 88° solar arc usado em Human Design
 * (Ra Uru Hu 1987), Gene Keys (Rudd 2009) e agora Akasha OS.
 *
 * Contexto: para sistemas que precisam de uma "segunda camada temporal"
 * além do momento de nascimento (Pilar 2 Astrologia e Pilar 4 Odu),
 * precisamos calcular o momento em que o Sol estava 88° de arco solar
 * ANTES do nascimento. Isso é ~88 dias antes, mas varia com a
 * excentricidade da órbita — o cálculo é iterativo (bisection), não
 * aritmético.
 *
 * Nomenclatura Akasha (vs HD/GK):
 * - "Momento Pré-natal" (não "Design/Conscious")
 * - "88° solar arc" (algoritmo público, sem IP)
 *
 * Performance: 50 iterações × 1 calcularSol() por iteração. Cada
 * calcularSol é O(1) (trig simples). Total: ~50 trig calls = sub-ms.
 *
 * @see .autonomous/research/synthesis/hd-reverse-engineering.md §2.7
 * @see .autonomous/research/synthesis/gk-reverse-engineering.md §3.3
 */

import { calcularPosicao } from './swiss-ephemeris';

/**
 * Constante do algoritmo: o Sol estava 88° de arco solar antes do
 * nascimento. Não confundir com "88 dias corridos" — a órbita da Terra
 * tem excentricidade que faz os 88° variarem em ~2-3 dias ao longo do
 * ano (fonte: roxyapi.com blog 2026-05-23).
 */
const SOLAR_ARC_DEGREES = 88.0;

/**
 * Tolerância para convergência do bisection. 1e-6 graus = ~0.0036
 * segundos de arco = precisão sub-second para o momento.
 */
const BISECTION_TOLERANCE_DEG = 1e-6;

/** Janela inicial de busca em dias. */
const SEARCH_WINDOW_BEFORE_DAYS = 95;
const SEARCH_WINDOW_AFTER_DAYS = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Diferença angular normalizada entre duas longitudes, em [-180, 180].
 * Positivo = target está a leste de source. Usado pelo bisection.
 */
function angularDifference(source: number, target: number): number {
  return (target - source + 540) % 360 - 180;
}

/**
 * Encontra o "Momento Pré-natal Akasha" — a data em que o Sol estava
 * 88° de arco solar antes do birthDate.
 *
 * Algoritmo: bisection iterativo.
 * 1. Calcula longitude do Sol no nascimento (sun_birth)
 * 2. Target = sun_birth - 88° (normalizado para [0, 360))
 * 3. Inicializa janela [lo, hi] = [birth - 95 dias, birth - 80 dias]
 * 4. Bisection: 50 iterações até |sun(mid) - target| < 1e-6
 *
 * Por que 50 iterações: cada iteração divide a janela por 2.
 * 2^50 ≈ 1.1e15, mas a precisão é limitada pela precisão trig (~1e-15)
 * então converge muito antes. 50 é margem generosa.
 *
 * @param birthDate Data de nascimento (momento exato)
 * @returns Momento Pré-natal Akasha (Date)
 */
export function findPrenatalMoment(birthDate: Date): Date {
  const sunAtBirth = (((calcularPosicao('sol', birthDate).longitude) % 360) + 360) % 360;
  const targetLongitude = (((sunAtBirth - SOLAR_ARC_DEGREES) % 360) + 360) % 360;

  let loMs = birthDate.getTime() - SEARCH_WINDOW_BEFORE_DAYS * DAY_MS;
  let hiMs = birthDate.getTime() - SEARCH_WINDOW_AFTER_DAYS * DAY_MS;
  let result = new Date((loMs + hiMs) / 2);

  for (let i = 0; i < 50; i++) {
    const midMs = (loMs + hiMs) / 2;
    const sunAtMid = (((calcularPosicao('sol', new Date(midMs)).longitude) % 360) + 360) % 360;
    const diff = angularDifference(sunAtMid, targetLongitude);

    if (Math.abs(diff) < BISECTION_TOLERANCE_DEG) {
      result = new Date(midMs);
      break;
    }

    // diff > 0: target is east of sun(mid), sun was too far west at mid
    //   → truth is LATER (east = later in time) → loMs = midMs
    // diff < 0: target is west of sun(mid), sun was too far east at mid
    //   → truth is EARLIER (west = earlier in time) → hiMs = midMs
    if (diff > 0) {
      loMs = midMs;
    } else {
      hiMs = midMs;
    }
    result = new Date(midMs);
  }

  return result;
}
