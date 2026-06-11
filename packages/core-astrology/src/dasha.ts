/**
 * F-210: Vimshottari Dasha (Jyotish) — Dimensão temporal do Pilar 2
 *
 * Implementa o algoritmo Vimshottari Dasha da tradição Jyotish
 * (Brihat Parashara Hora Shastra, séc. 7-8 CE). Cita Parashara como fonte.
 *
 * Vimshottari = ciclo de 120 anos dividido em 9 Mahadashas (períodos
 * planetários) + 81 Antardashas (sub-períodos). Algoritmo determinístico
 * baseado em:
 * 1. Posição da Lua em um dos 27 Nakshatras (0-360° / 13.333° cada)
 * 2. Regente do Nakshatra = Mahadasha inicial
 * 3. Proporção restante do Mahadasha = (360 - 13.333 * nakshatra) / total
 *
 * Por que isso importa (R-018 D3):
 * - Adiciona dimensão temporal ao Pilar 2 (vs mapa estático)
 * - Combina com Trânsitos (ocidental) para cobertura completa
 * - Cita Jyotish explicitamente como inspiração (R-022 §2.1)
 * - Implementa com transparência algorítmica (não revelação mística)
 *
 * Nomenclatura Akasha (vs Jyotish):
 * - mahadasha_Atual / antardasha_Atual (português claro)
 * - Nomes dos Grahas preservados (Sol, Lua, Marte, Rahu, Júpiter, Saturno,
 *   Mercúrio, Ketu, Vênus) por serem sânscrito consagrado
 *
 * @see .autonomous/research/synthesis/jyotish-reverse-engineering.md §3
 * @see Brihat Parashara Hora Shastra (séc. 7-8 CE)
 */

export type Graha = 'sol' | 'lua' | 'marte' | 'rahu' | 'jupiter' | 'saturno' | 'mercurio' | 'ketu' | 'venus';

export const MAHADASHA_DURATIONS: Record<Graha, number> = {
  sol: 6,
  lua: 10,
  marte: 7,
  rahu: 18,
  jupiter: 16,
  saturno: 19,
  mercurio: 17,
  ketu: 7,
  venus: 20,
};

export const DASHA_ORDER: readonly Graha[] = [
  'sol', 'lua', 'marte', 'rahu', 'jupiter', 'saturno', 'mercurio', 'ketu', 'venus',
] as const;

export const TOTAL_DASHA_YEARS = 120;

export const NAKSHATRA_LORDS: readonly Graha[] = [
  'ketu', 'venus', 'sol', 'lua', 'marte', 'rahu', 'jupiter', 'saturno', 'mercurio',
  'ketu', 'venus', 'sol', 'lua', 'marte', 'rahu', 'jupiter', 'saturno', 'mercurio',
  'ketu', 'venus', 'sol', 'lua', 'marte', 'rahu', 'jupiter', 'saturno', 'mercurio',
] as const;

export const NAKSHATRA_SPAN = 360 / 27;

export interface DashaPeriod {
  graha: Graha;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  level: 'mahadasha' | 'antardasha';
}

export interface VimshottariResult {
  moonLongitude: number;
  birthNakshatra: number;
  startingGraha: Graha;
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  fullLifeMahadashas: DashaPeriod[];
  currentMahadashaAntardashas: DashaPeriod[];
}

/**
 * Determina qual Nakshatra (0-26) a Lua está em dada longitude.
 * Math.round evita float edge case (360/27 não é exato).
 */
export function getNakshatra(moonLongitude: number): number {
  const norm = ((moonLongitude % 360) + 360) % 360;
  return Math.min(26, Math.round(norm / NAKSHATRA_SPAN));
}

/** Retorna o regente (Graha) do Nakshatra onde a Lua está. */
export function getNakshatraLord(moonLongitude: number): Graha {
  return NAKSHATRA_LORDS[getNakshatra(moonLongitude)];
}

/**
 * Calcula saldo do Mahadasha inicial (Parashara §3).
 * Lua no meio de um Nakshatra → saldo proporcional.
 */
function getBirthDashaBalance(moonLongitude: number, startingGraha: Graha): number {
  const norm = ((moonLongitude % 360) + 360) % 360;
  const nakshatraIdx = getNakshatra(moonLongitude);
  const nakshatraPosition = norm - nakshatraIdx * NAKSHATRA_SPAN;
  const nakshatraRemaining = (NAKSHATRA_SPAN - nakshatraPosition) / NAKSHATRA_SPAN;
  return nakshatraRemaining * MAHADASHA_DURATIONS[startingGraha];
}

function yearsToMs(years: number): number {
  return years * 365.25 * 24 * 60 * 60 * 1000;
}

function generateFullMahadashas(
  birthDate: Date,
  startingGraha: Graha,
  birthBalance: number,
): DashaPeriod[] {
  const periods: DashaPeriod[] = [];
  const startIdx = DASHA_ORDER.indexOf(startingGraha);

  const firstStart = new Date(birthDate);
  const firstEnd = new Date(birthDate.getTime() + yearsToMs(birthBalance));
  periods.push({
    graha: startingGraha,
    startDate: firstStart,
    endDate: firstEnd,
    durationYears: birthBalance,
    level: 'mahadasha',
  });

  let cursor = new Date(firstEnd);
  for (let i = 1; i < 9; i++) {
    const graha = DASHA_ORDER[(startIdx + i) % 9];
    const duration = MAHADASHA_DURATIONS[graha];
    const end = new Date(cursor.getTime() + yearsToMs(duration));
    periods.push({
      graha,
      startDate: cursor,
      endDate: end,
      durationYears: duration,
      level: 'mahadasha',
    });
    cursor = end;
  }
  return periods;
}

function generateAntardashas(mahadasha: DashaPeriod): DashaPeriod[] {
  const periods: DashaPeriod[] = [];
  let cursor = new Date(mahadasha.startDate);
  for (const antaGraha of DASHA_ORDER) {
    const antaDuration = (mahadasha.durationYears * MAHADASHA_DURATIONS[antaGraha]) / TOTAL_DASHA_YEARS;
    const end = new Date(cursor.getTime() + yearsToMs(antaDuration));
    periods.push({
      graha: antaGraha,
      startDate: cursor,
      endDate: end,
      durationYears: antaDuration,
      level: 'antardasha',
    });
    cursor = end;
  }
  return periods;
}

function findPeriod(periods: DashaPeriod[], at: Date): DashaPeriod | null {
  for (const p of periods) {
    if (at >= p.startDate && at < p.endDate) return p;
  }
  return null;
}

/**
 * Calcula o Vimshottari Dasha completo para uma data de nascimento
 * e Lua em longitude específica.
 */
export function calcularVimshottari(
  birthDate: Date,
  moonLongitude: number,
  referenceDate: Date = new Date(),
): VimshottariResult {
  const startingGraha = getNakshatraLord(moonLongitude);
  const birthNakshatra = getNakshatra(moonLongitude);
  const birthBalance = getBirthDashaBalance(moonLongitude, startingGraha);
  const fullLifeMahadashas = generateFullMahadashas(birthDate, startingGraha, birthBalance);

  const currentMahadasha = findPeriod(fullLifeMahadashas, referenceDate);
  if (!currentMahadasha) {
    throw new Error(
      `Reference date ${referenceDate.toISOString()} is outside the 120-year Vimshottari cycle starting at ${birthDate.toISOString()}`,
    );
  }

  const currentMahadashaAntardashas = generateAntardashas(currentMahadasha);
  const currentAntardasha = findPeriod(currentMahadashaAntardashas, referenceDate);
  if (!currentAntardasha) {
    throw new Error(`No antardasha found for ${referenceDate.toISOString()}`);
  }

  return {
    moonLongitude,
    birthNakshatra,
    startingGraha,
    currentMahadasha,
    currentAntardasha,
    fullLifeMahadashas,
    currentMahadashaAntardashas,
  };
}
