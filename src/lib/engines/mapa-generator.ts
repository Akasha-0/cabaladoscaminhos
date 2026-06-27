/**
 * Mapa Inicial — gerador determinístico
 * ----------------------------------------------------------------------------
 * Consolida os 4 mapas espirituais primários em um único payload
 * que alimenta o dashboard `/mapa` após o onboarding.
 *
 * Tradições cobertas:
 *   1. Numerologia Cabalística (vida, expressão, motivação)
 *   2. Numerologia Tântrica   (chakras dominantes)
 *   3. Odu Ifá de nascimento  (regente + orixá)
 *   4. Astrologia Ocidental   (signo solar + ascendente)
 *
 * Todas as funções aqui são PURAS (sem I/O) para serem triviais de testar.
 * Para coords geográficas reais (ascendente, casas), ver
 * `lib/astrologia/birth-chart.ts` — esta função só computa o signo solar
 * e um placeholder determinístico do ascendente baseado na hora.
 *
 * @module engines/mapa-generator
 */

import {
  calculateLifePath as kabLifePath,
  calculateExpression as kabExpression,
  calculateMotivation as kabMotivation,
} from '@/lib/calculators/numerology-kabalah';
import {
  buildTantricMap,
  getTantricBody,
} from '@/lib/calculators/numerology-tantric';
import {
  calculateBirthOdu,
  type OduBirth,
} from '@/lib/calculators/odu-birth';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerateInitialMapaInput {
  fullName: string;
  birthDate: string; // ISO yyyy-mm-dd
  birthTime?: string; // HH:MM ou vazio
  birthCity?: string;
  birthState?: string;
}

export interface InitialMapa {
  // Identidade
  generatedAt: string;
  fullName: string;

  // Numerologia Cabalística
  cabalistica: {
    caminhoDeVida: number;
    caminhoDeVidaMestre: boolean;
    expressao: number;
    motivacao: number;
  };

  // Numerologia Tântrica
  tantrica: {
    numeroAlma: number;
    numeroAlmaDescricao: string;
    numeroKarma: number;
    domDivino: number;
    domDivinoDescricao: string;
    numeroDestino: number;
    caminhoTantrico: number;
    chakrasDominantes: number[]; // ex.: [3, 5]
  };

  // Odu de Nascimento
  odu: OduBirth;

  // Astrologia
  astrologia: {
    signoSolar: SolarSign;
    signoSolarNome: string;
    ascendente: SolarSign | null;
    ascendenteNome: string | null;
    ascendentePlaceholder: boolean;
  };
}

/**
 * Alias do tipo `Signo` de `@/lib/astrologia/tipos`.
 * Espelhado aqui para manter este módulo self-contained — pode
 * divergir do canônico se o time decidir expandir a tipagem.
 */
export type SolarSign =
  | 'aries'
  | 'touro'
  | 'gemeos'
  | 'cancer'
  | 'leao'
  | 'virgem'
  | 'libra'
  | 'escorpio'
  | 'sagitario'
  | 'capricornio'
  | 'aquario'
  | 'peixes';

// ============================================================================
// CONSTANTES — signos e períodos
// ============================================================================

const SIGN_PT_BR: Record<SolarSign, string> = {
  aries: 'Áries',
  touro: 'Touro',
  gemeos: 'Gêmeos',
  cancer: 'Câncer',
  leao: 'Leão',
  virgem: 'Virgem',
  libra: 'Libra',
  escorpio: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

/**
 * Trânsitos de signo solar por data (dd-mm).
 * Limites inclusivos no início, exclusivos no fim.
 * Ref: tabela clássica de signos tropicais (ano 2026).
 */
const SIGN_RANGES: Array<{
  sign: SolarSign;
  fromMonth: number;
  fromDay: number;
  toMonth: number;
  toDay: number;
}> = [
  { sign: 'capricornio', fromMonth: 12, fromDay: 22, toMonth: 1, toDay: 20 },
  { sign: 'aquario', fromMonth: 1, fromDay: 20, toMonth: 2, toDay: 19 },
  { sign: 'peixes', fromMonth: 2, fromDay: 19, toMonth: 3, toDay: 21 },
  { sign: 'aries', fromMonth: 3, fromDay: 21, toMonth: 4, toDay: 20 },
  { sign: 'touro', fromMonth: 4, fromDay: 20, toMonth: 5, toDay: 21 },
  { sign: 'gemeos', fromMonth: 5, fromDay: 21, toMonth: 6, toDay: 21 },
  { sign: 'cancer', fromMonth: 6, fromDay: 21, toMonth: 7, toDay: 23 },
  { sign: 'leao', fromMonth: 7, fromDay: 23, toMonth: 8, toDay: 23 },
  { sign: 'virgem', fromMonth: 8, fromDay: 23, toMonth: 9, toDay: 23 },
  { sign: 'libra', fromMonth: 9, fromDay: 23, toMonth: 10, toDay: 23 },
  { sign: 'escorpio', fromMonth: 10, fromDay: 23, toMonth: 11, toDay: 22 },
  { sign: 'sagitario', fromMonth: 11, fromDay: 22, toMonth: 12, toDay: 22 },
];

/**
 * Ascendente por hora (placeholder determinístico).
 * Aproximação grosseira — cada 2h muda o ascendente ~1 signo.
 * Ref: horoscope ascendant chart simplificado.
 */
const ASCENDANT_RANGES: Array<{
  sign: SolarSign;
  fromHour: number;
  toHour: number;
}> = [
  { sign: 'aries', fromHour: 6, toHour: 8 },
  { sign: 'touro', fromHour: 8, toHour: 10 },
  { sign: 'gemeos', fromHour: 10, toHour: 12 },
  { sign: 'cancer', fromHour: 12, toHour: 14 },
  { sign: 'leao', fromHour: 14, toHour: 16 },
  { sign: 'virgem', fromHour: 16, toHour: 18 },
  { sign: 'libra', fromHour: 18, toHour: 20 },
  { sign: 'escorpio', fromHour: 20, toHour: 22 },
  { sign: 'sagitario', fromHour: 22, toHour: 24 },
  { sign: 'capricornio', fromHour: 0, toHour: 2 },
  { sign: 'aquario', fromHour: 2, toHour: 4 },
  { sign: 'peixes', fromHour: 4, toHour: 6 },
];

// ============================================================================
// HELPERS
// ============================================================================

function safeParseBirthDate(input: string): { year: number; month: number; day: number } | null {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function getSolarSign(year: number, month: number, day: number): SolarSign {
  for (const range of SIGN_RANGES) {
    const afterStart =
      month > range.fromMonth || (month === range.fromMonth && day >= range.fromDay);
    const beforeEnd = month < range.toMonth || (month === range.toMonth && day < range.toDay);
    if (range.fromMonth === range.toMonth) {
      // Capricórnio: 22 dez → 20 jan (quebra de ano)
      const isCap = range.sign === 'capricornio';
      if (isCap) {
        if ((month === 12 && day >= 22) || (month === 1 && day < 20)) return range.sign;
        continue;
      }
      if (afterStart && beforeEnd) return range.sign;
    } else if (afterStart && beforeEnd) {
      return range.sign;
    }
  }
  return 'capricornio'; // fallback seguro
}

function getAscendantByHour(hour: number): SolarSign | null {
  for (const range of ASCENDANT_RANGES) {
    if (range.fromHour < range.toHour) {
      if (hour >= range.fromHour && hour < range.toHour) return range.sign;
    } else {
      // Wrap midnight (ex.: capricórnio 0-2)
      if (hour >= range.fromHour || hour < range.toHour) return range.sign;
    }
  }
  return null;
}

function parseHour(birthTime: string | undefined): number | null {
  if (!birthTime) return null;
  const m = birthTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return Number(m[1]);
}

/**
 * Reduz um número a um único dígito (mantém mestres 11/22/33).
 */
function reduceToSingleDigit(n: number): number {
  if (n <= 0) return 0;
  if (n <= 9) return n;
  if (n === 11 || n === 22 || n === 33) return n;
  let r = n;
  while (r > 9) {
    r = String(r)
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return r;
}

/**
 * Calcula o caminho de vida a partir da data (Pythagorean).
 * Versão inline (espelha `lib/numerologia/life-path.ts`) para manter este
 * módulo self-contained — útil pra testes sem precisar mockar imports.
 */
export function computeLifePath(birthDate: string): number {
  const parsed = safeParseBirthDate(birthDate);
  if (!parsed) return 0;
  const digits = `${parsed.year}${String(parsed.month).padStart(2, '0')}${String(parsed.day).padStart(2, '0')}`;
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  return reduceToSingleDigit(sum);
}

// ============================================================================
// CHAKRAS DOMINANTES (Tântrica)
// ============================================================================

/**
 * Mapeia os 5 números tântricos (alma, karma, dom, destino, caminho)
 * para os 7 chakras. Usa uma chave determinística:
 *   - 1-2 → chakras inferiores (1, 2)
 *   - 3-5 → chakras do meio (3, 4, 5)
 *   - 6-9 → chakras superiores (6, 7)
 *   - 10-11 → chakras superiores com ênfase no coração
 *
 * Retorna até 3 chakras dominantes únicos, em ordem de relevância.
 */
function deriveDominantChakras(
  soul: number,
  karma: number,
  divineGift: number
): number[] {
  const candidates: Array<{ chakra: number; weight: number }> = [];
  const bump = (chakra: number, weight: number) => {
    const existing = candidates.find((c) => c.chakra === chakra);
    if (existing) existing.weight += weight;
    else candidates.push({ chakra, weight });
  };

  const lower = [1, 2];
  const middle = [3, 4, 5];
  const upper = [6, 7];

  const map = (n: number, weight: number) => {
    const r = reduceToSingleDigit(n);
    if (r <= 2) lower.forEach((c) => bump(c, weight));
    else if (r <= 5) middle.forEach((c) => bump(c, weight));
    else if (r <= 9) upper.forEach((c) => bump(c, weight));
    else if (r === 11) bump(4, weight * 2); // mestres iluminam o coração
    else if (r === 22) bump(3, weight * 2);
    else if (r === 33) bump(4, weight * 2);
  };

  map(soul, 2);
  map(karma, 1);
  map(divineGift, 1);

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates.slice(0, 3).map((c) => c.chakra);
}

// ============================================================================
// MAIN — generateInitialMapa
// ============================================================================

/**
 * Gera o mapa espiritual inicial a partir dos dados do onboarding.
 * Função PURA — não toca DB nem rede.
 */
export function generateInitialMapa(input: GenerateInitialMapaInput): InitialMapa {
  const parsed = safeParseBirthDate(input.birthDate);
  if (!parsed) {
    throw new Error(`generateInitialMapa: data inválida "${input.birthDate}"`);
  }

  // 1. Numerologia Cabalística
  const cabLifePath = kabLifePath(input.birthDate);
  const cabExpression = kabExpression(input.fullName);
  const cabMotivation = kabMotivation(input.fullName);

  // 2. Numerologia Tântrica
  const tantric = buildTantricMap(input.birthDate);

  // 3. Odu de Nascimento
  const odu = calculateBirthOdu(input.birthDate);

  // 4. Astrologia
  const solarSign = getSolarSign(parsed.year, parsed.month, parsed.day);
  const hour = parseHour(input.birthTime);
  const ascendant = hour !== null ? getAscendantByHour(hour) : null;

  return {
    generatedAt: new Date().toISOString(),
    fullName: input.fullName,
    cabalistica: {
      caminhoDeVida: cabLifePath.number,
      caminhoDeVidaMestre: cabLifePath.master,
      expressao: cabExpression.number,
      motivacao: cabMotivation.number,
    },
    tantrica: {
      numeroAlma: tantric.soul,
      numeroAlmaDescricao: tantric.soulDescription ?? getTantricBody(tantric.soul),
      numeroKarma: tantric.karma,
      domDivino: tantric.divineGift,
      domDivinoDescricao: tantric.divineGiftDescription ?? getTantricBody(tantric.divineGift),
      numeroDestino: tantric.destiny,
      caminhoTantrico: tantric.tantricPath,
      chakrasDominantes: deriveDominantChakras(
        tantric.soul,
        tantric.karma,
        tantric.divineGift
      ),
    },
    odu,
    astrologia: {
      signoSolar: solarSign,
      signoSolarNome: SIGN_PT_BR[solarSign],
      ascendente: ascendant,
      ascendenteNome: ascendant ? SIGN_PT_BR[ascendant] : null,
      ascendentePlaceholder: ascendant !== null,
    },
  };
}