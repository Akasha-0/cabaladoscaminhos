// ============================================================
// MOTOR DE NUMEROLOGIA CABALÍSTICA
// ============================================================
// Implementação das fórmulas definidas no Doc 04 §2.2.
//
// Teste oficial (Doc 09 §8):
//   "Eliane Simão de Almeida", 20/08/1986
//   → lifePath = 7
//
// Redução:
//   - Reduz para 1 dígito SOMENTE se não for número mestre (11, 22, 33).
//   - Para 11/22/33, mantém-se o valor.
//   - 16/19/26 etc. SÃO reduzidos (não são números mestres oficiais).
import type { KabalisticMap } from '@akasha/types';

// ============================================================================
// TABELA DE CONVERSÃO ALFANUMÉRICA (Pitagórica simplificada)
// ============================================================================
// A=1, B=2, ... I=9, J=1, K=2, ... R=9, S=1, T=2, ... Z=8
// (NR/LS/LL: Vogais = 1)
const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const VOGAIS = new Set(['A', 'E', 'I', 'O', 'U']);

// ============================================================================
// REDUÇÃO NUMÉRICA (mantém números mestres 11, 22, 33)
// ============================================================================
function reduceToSingleDigit(n: number, keepMaster = true): number {
  if (n <= 0) return 0;
  if (n <= 9) return n;
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;

  let result = n;
  while (result > 9 && !(keepMaster && (result === 11 || result === 22 || result === 33))) {
    result = String(result)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return result;
}

function isMaster(n: number): boolean {
  return n === 11 || n === 22 || n === 33;
}

// ============================================================================
// 1. CAMINHO DE VIDA
// ============================================================================
// Soma todos os dígitos da data de nascimento, reduzida.
// Para 20/08/1986: 2+0+0+8+1+9+8+6 = 34 → 3+4 = 7
export function calculateLifePath(birthDate: string): { number: number; master: boolean } {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 2. NÚMERO DE MISSÃO
// ============================================================================
// Variante da data que olha especificamente para o dia + mês + ano reduzidos
// separadamente e depois somados. Geralmente coincide com o Caminho de Vida
// quando o consulente está alinhado com sua missão.
function calculateMission(birthDate: string): { number: number; master: boolean } {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { number: 0, master: false };
  const [, y, m, d] = match;
  const yearReduced = reduceToSingleDigit(parseInt(y, 10));
  const monthReduced = reduceToSingleDigit(parseInt(m, 10));
  const dayReduced = reduceToSingleDigit(parseInt(d, 10));
  const sum = yearReduced + monthReduced + dayReduced;
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 3. NÚMERO DE EXPRESSÃO
// ============================================================================
// Soma de todas as letras do nome completo (consonantes + vogais).
export function calculateExpression(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => LETTER_VALUES[c] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 4. NÚMERO DE MOTIVAÇÃO (Impulso da Alma)
// ============================================================================
// Soma APENAS das vogais do nome completo.
export function calculateMotivation(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => VOGAIS.has(c.toUpperCase()) && LETTER_VALUES[c.toUpperCase()] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c.toUpperCase()], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 4b. NÚMERO DE IMPRESSÃO (apenas consoantes do nome) — Doc 11 §2.4
// ============================================================================
export function calculateImpression(fullName: string): { number: number; master: boolean } {
  const sum = normalizeName(fullName)
    .split('')
    .filter((c) => !VOGAIS.has(c) && LETTER_VALUES[c] !== undefined)
    .reduce((s, c) => s + LETTER_VALUES[c], 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

// ============================================================================
// 5. DONS NATIVOS (dia de nascimento NÃO reduzido se for 10-31)
// ============================================================================
export function calculateNativeDayGifts(birthDate: string): number {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return 0;
  return parseInt(match[3], 10);
}

// ============================================================================
// 6. NÚMEROS DE DESAFIO
// ============================================================================
// Calculados a partir do dia, mês e ano de nascimento.
// - first: |dia - mês|
// - second: |dia - ano|
// - main:  |first - second|
// - last:  |ano - mês - dia| (nunca 0, mínimo 1)
export function calculateChallenges(birthDate: string): {
  first: number;
  second: number;
  main: number;
  last: number;
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return { first: 0, second: 0, main: 0, last: 1 };
  const [, y, m, d] = match;
  const year = parseInt(y, 10);
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);

  const dayRed = reduceToSingleDigit(day);
  const monthRed = reduceToSingleDigit(month);
  const yearRed = reduceToSingleDigit(year);

  const first = Math.abs(dayRed - monthRed);
  const second = Math.abs(dayRed - yearRed);
  const main = Math.abs(first - second);
  const lastRaw = Math.abs(monthRed - yearRed);
  const last = lastRaw === 0 ? 1 : lastRaw;

  return { first, second, main, last };
}

// ============================================================================
// 7. LIÇÕES KÁRMICAS (números de 1-9 AUSENTES no nome) — Doc 11 §2.4
// ============================================================================
export function calculateKarmicLessons(fullName: string): number[] {
  const lettersInName = new Set(
    normalizeName(fullName)
      .split('')
      .map((c) => LETTER_VALUES[c])
      .filter((v) => v !== undefined && v > 0)
  );
  const lessons: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!lettersInName.has(i)) lessons.push(i);
  }
  return lessons;
}

// ============================================================================
// 7b. DÍVIDAS KÁRMICAS (presença de 13/14/16/19 nos totais intermediários)
//     Doc 11 §2.4 — uma dívida existe quando o total ANTES da redução final
//     é 13, 14, 16 ou 19.
// ============================================================================
const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

/** Coleta dívidas kármicas a partir dos totais (somas) brutos informados. */
function collectKarmicDebts(rawSums: number[]): number[] {
  const found = new Set<number>();
  for (const sum of rawSums) {
    let n = sum;
    while (n > 9) {
      if (KARMIC_DEBT_NUMBERS.includes(n)) found.add(n);
      n = String(n)
        .split('')
        .reduce((s, d) => s + parseInt(d, 10), 0);
    }
  }
  return [...found].sort((a, b) => a - b);
}
export function calculateKarmicDebts(fullName: string, birthDate: string): number[] {
  const norm = normalizeName(fullName);
  const expressionSum = norm.split('').reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const motivationSum = norm
    .split('')
    .filter((c) => VOGAIS.has(c))
    .reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const impressionSum = norm
    .split('')
    .filter((c) => !VOGAIS.has(c))
    .reduce((s, c) => s + (LETTER_VALUES[c] ?? 0), 0);
  const dateSum = birthDate
    .replace(/\D/g, '')
    .split('')
    .reduce((s, d) => s + parseInt(d, 10), 0);
  const dayNum = (() => {
    const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? parseInt(m[3], 10) : 0;
  })();

  return collectKarmicDebts([expressionSum, motivationSum, impressionSum, dateSum, dayNum]);
}

// ============================================================================
// 7c. PINÁCULOS / CICLOS DE REALIZAÇÃO — Doc 11 §2.6
// ============================================================================
export function calculatePinnacles(
  birthDate: string,
  lifePath: number
): {
  first: { number: number; ageEnd: number; meaning: string };
  second: { number: number; ageStart: number; ageEnd: number; meaning: string };
  third: { number: number; ageStart: number; ageEnd: number; meaning: string };
  fourth: { number: number; ageStart: number; meaning: string };
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const day = match ? reduceToSingleDigit(parseInt(match[3], 10), false) : 0;
  const month = match ? reduceToSingleDigit(parseInt(match[2], 10), false) : 0;
  const year = match ? reduceToSingleDigit(parseInt(match[1], 10), false) : 0;
  const first = reduceToSingleDigit(day + month, false);
  const second = reduceToSingleDigit(day + year, false);
  const third = reduceToSingleDigit(first + second, false);
  const fourth = reduceToSingleDigit(month + year, false);
  const firstEnd = 36 - (isMaster(lifePath) ? reduceToSingleDigit(lifePath, false) : lifePath);
  return {
    first: { number: first, ageEnd: firstEnd, meaning: getNumberMeaning(first) },
    second: {
      number: second,
      ageStart: firstEnd + 1,
      ageEnd: firstEnd + 9,
      meaning: getNumberMeaning(second),
    },
    third: {
      number: third,
      ageStart: firstEnd + 10,
      ageEnd: firstEnd + 18,
      meaning: getNumberMeaning(third),
    },
    fourth: { number: fourth, ageStart: firstEnd + 19, meaning: getNumberMeaning(fourth) },
  };
}
// ============================================================================
// 7d. ARCANOS REGENTES (correspondência com o Tarô) — Doc 11/Doc 04 §2.2
// ============================================================================
const MAJOR_ARCANA: Record<number, { name: string; meaning: string }> = {
  0: {
    name: 'O Louco',
    meaning: 'Inocência, espontaneidade, liberdade, novos começos, o viajante',
  },
  1: { name: 'O Mago', meaning: 'Vontade, habilidade, poder, criatividade, foco,manifestação' },
  2: {
    name: 'A Sacerdotisa',
    meaning: 'Intuição, conhecimento, mistério, sabedoria interior, segredos',
  },
  3: { name: 'A Imperatriz', meaning: 'Fertilidade, abundance, nuturing, natureza, mãe divina' },
  4: {
    name: 'O Imperador',
    meaning: 'Autoridade, estrutura, paternalismo, liderança, estabilidade',
  },
  5: { name: 'O Hierofante', meaning: 'Tradição, espiritualidade, educação, dogmas, guias' },
  6: { name: 'Os Enamorados', meaning: 'Amor, união, escolhas, duality, relacionamentos' },
  7: { name: 'O Carro', meaning: 'Vontade, vitória, autodisciplina, assertividade, triunfo' },
  8: { name: 'A Justiça', meaning: 'Equilíbrio, verdade, lei,因果, honestidade, karma' },
  9: {
    name: 'O Eremita',
    meaning: 'Introspecção, solidão, autoconhecimento, busca interior, sabedoria',
  },
  10: {
    name: 'A Roda da Fortuna',
    meaning: 'Ciclos, destino, mudança, sorte, transformação, acaso',
  },
  11: { name: 'A Força', meaning: 'Coragem, perseverança, compaixão, autocontrole, poder suave' },
  12: {
    name: 'O Enforcado',
    meaning: 'Nova perspectiva, sacrifício, pausa, rendição, visão invertida',
  },
  13: {
    name: 'A Morte',
    meaning: 'Transformação, fim de ciclo, renovação, transição, metamorfose',
  },
  14: { name: 'A Temperança', meaning: 'Equilíbrio, paciência, propósito, significado, moderação' },
  15: { name: 'O Diabo', meaning: 'Apego material, sombras, tentação, cadeias, manipulação' },
  16: { name: 'A Torre', meaning: 'Destruição criativa, revelação, upheaval, despertar súbito' },
  17: { name: 'A Estrela', meaning: 'Esperança, fé, propósito,renewal, serenidade, inspiracão' },
  18: { name: 'A Lua', meaning: 'Ilusão, intuição, inconsciente, medo, sombras, água' },
  19: { name: 'O Sol', meaning: 'Sucesso, vitalidade, infância, felicidade, realização, alegria' },
  20: { name: 'O Julgamento', meaning: 'Avaliação, redenção, culpa, despertar, chamada interior' },
  21: { name: 'O Mundo', meaning: 'Completude, integração, realização, wholeness, danca da vida' },
};
function arcanaFor(n: number): number {
  return n <= 21 ? n : reduceToSingleDigit(n, false);
}
export function calculateRulingArcana(
  lifePath: number,
  expression: number
): {
  lifePath: { major: number; name: string; meaning: string };
  expression: { major: number; name: string; meaning: string };
} {
  const lpMajor = arcanaFor(lifePath);
  const exMajor = arcanaFor(expression);
  return {
    lifePath: {
      major: lpMajor,
      name: MAJOR_ARCANA[lpMajor]?.name ?? `Arcana ${lpMajor}`,
      meaning: MAJOR_ARCANA[lpMajor]?.meaning ?? 'Significado arquetípico do Tarô',
    },
    expression: {
      major: exMajor,
      name: MAJOR_ARCANA[exMajor]?.name ?? `Arcana ${exMajor}`,
      meaning: MAJOR_ARCANA[exMajor]?.meaning ?? 'Significado arquetípico do Tarô',
    },
  };
}
// ============================================================================
// 7e. CICLOS PESSOAIS (VOLÁTEIS — dependem da data atual) — Doc 11 §2.4
// ============================================================================
export function calculatePersonalCycles(
  birthDate: string,
  referenceDate: Date = new Date()
): { personalYear: number; personalMonth: number; personalDay: number; referenceDate: string } {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const birthDay = match ? parseInt(match[3], 10) : 0;
  const birthMonth = match ? parseInt(match[2], 10) : 0;

  const curYear = referenceDate.getFullYear();
  const curMonth = referenceDate.getMonth() + 1;
  const curDay = referenceDate.getDate();
  const yearReduced = reduceToSingleDigit(
    String(curYear)
      .split('')
      .reduce((s, d) => s + parseInt(d, 10), 0),
    false
  );

  const personalYear = reduceToSingleDigit(birthDay + birthMonth + yearReduced, false);
  const personalMonth = reduceToSingleDigit(personalYear + curMonth, false);
  const personalDay = reduceToSingleDigit(personalMonth + curDay, false);

  return {
    personalYear,
    personalMonth,
    personalDay,
    referenceDate: referenceDate.toISOString().slice(0, 10),
  };
}

// ============================================================================
// 8. CICLOS DE VIDA (3 grandes períodos)
// ============================================================================
// Primeiro ciclo: da infância até o dia do retorno (28 - dia reduzido)
// Segundo ciclo: até os 56 anos
// Terceiro ciclo: a partir dos 56 anos
export function calculateLifeCycles(birthDate: string): {
  first: { number: number; ageStart: number; ageEnd: number };
  second: { number: number; ageStart: number; ageEnd: number };
  third: { number: number; ageStart: number };
} {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return {
      first: { number: 0, ageStart: 0, ageEnd: 28 },
      second: { number: 0, ageStart: 29, ageEnd: 56 },
      third: { number: 0, ageStart: 57 },
    };
  }
  const [, y, m, d] = match;
  const dayRed = reduceToSingleDigit(parseInt(d, 10));
  const monthRed = reduceToSingleDigit(parseInt(m, 10));
  const yearRed = reduceToSingleDigit(parseInt(y, 10));

  const firstEnd = 36 - dayRed;
  const secondEnd = firstEnd + 27;

  return {
    first: { number: dayRed, ageStart: 0, ageEnd: firstEnd },
    second: { number: monthRed, ageStart: firstEnd + 1, ageEnd: secondEnd },
    third: { number: yearRed, ageStart: secondEnd + 1 },
  };
}

// ============================================================================
// AGREGADOR — Constrói o mapa cabalístico completo
// ============================================================================

export function buildKabalisticMap(fullName: string, birthDate: string): Partial<KabalisticMap> {
  const lifePath = calculateLifePath(birthDate);
  const mission = calculateMission(birthDate);
  const expression = calculateExpression(fullName);
  const motivation = calculateMotivation(fullName);
  const impression = calculateImpression(fullName);
  const lifePathReduced = lifePath.number;
  const expressionReduced = expression.number;
  return {
    lifePath: lifePathReduced,
    lifePathMaster: lifePath.master,
    mission: mission.number,
    expression: expressionReduced,
    expressionMaster: expression.master,
    motivation: motivation.number,
    impression: impression.number,
    nativeDayNumber: calculateNativeDayGifts(birthDate),
    challenges: calculateChallenges(birthDate),
    pinnacles: calculatePinnacles(birthDate, lifePathReduced),
    karmicLessons: calculateKarmicLessons(fullName),
    karmicDebts: calculateKarmicDebts(fullName, birthDate),
    rulingArcana: calculateRulingArcana(lifePathReduced, expressionReduced),
    lifeCycles: calculateLifeCycles(birthDate),
    personalCycles: calculatePersonalCycles(birthDate),
    vibrationalNumber: expressionReduced,
    chaliceNumber: motivation.number,
    balanceNumber: calculateBalanceNumber(fullName),
    maturityNumber: reduceToSingleDigit(lifePathReduced + expressionReduced),
    hiddenPassionNumber: calculateHiddenPassion(fullName),
    destinyNumber: expressionReduced,
    soulUrgeNumber: motivation.number,
    personalityNumber: impression.number,
    hebrewLetter:
      HEBREW_LETTERS[lifePathReduced] ??
      HEBREW_LETTERS[reduceToSingleDigit(lifePathReduced, false)] ??
      'Aleph',
    sefirotPath:
      SEFIROT_PATHS[lifePathReduced] ??
      SEFIROT_PATHS[reduceToSingleDigit(lifePathReduced, false)] ??
      'Keter (Coroa)',
    personalYear: calculatePersonalCycles(birthDate).personalYear,
    personalMonth: calculatePersonalCycles(birthDate).personalMonth,
    personalDay: calculatePersonalCycles(birthDate).personalDay,
    minorCycles: { years: [], months: [], days: [] },
    nameHistory: [
      { name: fullName, meaning: `Número de expressão ${expressionReduced}`, source: 'fornecido' },
    ],
  };
}
// ============================================================================
// HELPERS
// ============================================================================
function calculateBalanceNumber(fullName: string): number {
  const letters = normalizeName(fullName);
  const positions: number[] = [];
  for (let i = 0; i < letters.length; i++) {
    const val = LETTER_VALUES[letters[i]];
    if (val !== undefined) positions.push(val);
  }
  const sum = positions.reduce((s, v) => s + v, 0);
  return reduceToSingleDigit(sum);
}
function calculateHiddenPassion(fullName: string): number {
  const letters = normalizeName(fullName);
  const counts: Record<number, number> = {};
  for (const c of letters) {
    const val = LETTER_VALUES[c];
    if (val !== undefined) {
      counts[val] = (counts[val] ?? 0) + 1;
    }
  }
  let maxCount = 0;
  let mostRepeated = 1;
  for (const [num, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostRepeated = parseInt(num, 10);
    }
  }
  return mostRepeated;
}
function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');
}
// ============================================================================
// HELPERS — meanings
// ============================================================================
const NUMBER_MEANINGS: Record<number, string> = {
  1: 'Iniciativa, liderança, independência, originalidade, pioneirismo',
  2: 'Parceria, cooperação, diplomacia, sensibilidade, equilíbrio',
  3: 'Expressão, criatividade, comunicação, otimismo, inspiração',
  4: 'Estabilidade, estrutura, trabalho árduo, organização, fundamento',
  5: 'Liberdade, mudança, aventura, versatilidade, adaptação',
  6: 'Responsabilidade, família, lar, harmonia, serviço',
  7: 'Análise, introspecção, espiritualidade, solidão, conhecimento',
  8: 'Poder, autoridade, riqueza material, ambição, sabedoria prática',
  9: 'Compaixão, humanitarismo, encerramento, generosidade, iluminação',
  11: 'Iluminação espiritual, intuição elevada, mestre, visão profética',
  22: 'Mestre construtor, realizações práticas em grande escala',
  33: 'Mestre professor, serviço espiritual sem ego, cura em massa',
};
function getNumberMeaning(n: number): string {
  return (
    NUMBER_MEANINGS[n] ?? NUMBER_MEANINGS[reduceToSingleDigit(n, true)] ?? `Energia do número ${n}`
  );
}
const HEBREW_LETTERS: Record<number, string> = {
  1: 'Aleph',
  2: 'Bet',
  3: 'Gimel',
  4: 'Dalet',
  5: 'He',
  6: 'Vav',
  7: 'Zayin',
  8: 'Het',
  9: 'Tet',
  10: 'Yod',
  11: 'Kaf',
  12: 'Lamed',
  13: 'Mem',
  14: 'Nun',
  15: 'Samekh',
  16: 'Ayin',
  17: 'Pe',
  18: 'Tsade',
  19: 'Qof',
  20: 'Resh',
  21: 'Shin',
  22: 'Tav',
};
const SEFIROT_PATHS: Record<number, string> = {
  1: 'Keter (Coroa)',
  2: 'Chokhmah (Sabedoria)',
  3: 'Binah (Compreensão)',
  4: 'Chesed (Misericórdia)',
  5: 'Gevurah (Força)',
  6: 'Tiferet (Beleza)',
  7: 'Netzach (Vitória)',
  8: 'Hod (Glória)',
  9: 'Yesod (Fundação)',
  10: 'Malkuth (Reino)',
};
