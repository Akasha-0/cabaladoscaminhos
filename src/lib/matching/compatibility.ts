/**
 * Spiritual compatibility calculator
 * Analyzes compatibility based on astrological signs and elements
 */

import type { Signo } from '../astrologia/tipos';

// Element types
export type Elemento = 'fogo' | 'terra' | 'ar' | 'agua';

// Quality types (cardinal, fixed, mutable)
export type Qualidade = 'cardinal' | 'fixo' | 'mutavel';

// Sign to element mapping
const SIGN_TO_ELEMENT: Record<Signo, Elemento> = {
  aries: 'fogo',
  touro: 'terra',
  gemeos: 'ar',
  cancer: 'agua',
  leao: 'fogo',
  virgem: 'terra',
  libra: 'ar',
  escorpio: 'agua',
  sagitario: 'fogo',
  capricornio: 'terra',
  aquario: 'ar',
  peixes: 'agua',
};

// Sign to quality mapping
const SIGN_TO_QUALIDADE: Record<Signo, Qualidade> = {
  aries: 'cardinal',
  touro: 'fixo',
  gemeos: 'mutavel',
  cancer: 'cardinal',
  leao: 'fixo',
  virgem: 'mutavel',
  libra: 'cardinal',
  escorpio: 'fixo',
  sagitario: 'mutavel',
  capricornio: 'cardinal',
  aquario: 'fixo',
  peixes: 'mutavel',
};

// Element compatibility scores
const ELEMENT_COMPATIBILITY: Record<Elemento, Partial<Record<Elemento, number>>> = {
  fogo: { fogo: 70, terra: 30, ar: 80, agua: 20 },
  terra: { fogo: 30, terra: 75, ar: 50, agua: 80 },
  ar: { fogo: 80, terra: 50, ar: 70, agua: 40 },
  agua: { fogo: 20, terra: 80, ar: 40, agua: 70 },
};

// Quality compatibility scores
const QUALITY_COMPATIBILITY: Record<Qualidade, Partial<Record<Qualidade, number>>> = {
  cardinal: { cardinal: 60, fixo: 50, mutavel: 55 },
  fixo: { cardinal: 50, fixo: 75, mutavel: 60 },
  mutavel: { cardinal: 55, fixo: 60, mutavel: 70 },
};

// Sign ruler relationships (traditional planetary rulerships)
const SIGN_RULERS: Record<Signo, string> = {
  aries: 'marte',
  touro: 'venus',
  gemeos: 'mercurio',
  cancer: 'lua',
  leao: 'sol',
  virgem: 'mercurio',
  libra: 'venus',
  escorpio: 'marte',
  sagitario: 'jupiter',
  capricornio: 'saturno',
  aquario: 'saturno',
  peixes: 'jupiter',
};

export interface CompatibilityResult {
  score: number;
  level: 'excelente' | 'bom' | 'neutro' | 'desafiante' | 'harmonioso';
  element: {
    score: number;
    description: string;
  };
  quality: {
    score: number;
    description: string;
  };
  planetary: {
    score: number;
    description: string;
  };
  summary: string;
  strengths: string[];
  challenges: string[];
}

/**
 * Calculate spiritual compatibility between two signs
 */
export function calculateCompatibility(
  sign1: Signo | string,
  sign2: Signo | string
): CompatibilityResult {
  const s1 = sign1.toLowerCase() as Signo;
  const s2 = sign2.toLowerCase() as Signo;

  const elem1 = SIGN_TO_ELEMENT[s1];
  const elem2 = SIGN_TO_ELEMENT[s2];
  const qual1 = SIGN_TO_QUALIDADE[s1];
  const qual2 = SIGN_TO_QUALIDADE[s2];
  const ruler1 = SIGN_RULERS[s1];
  const ruler2 = SIGN_RULERS[s2];

  // Element compatibility
  const elemScore = ELEMENT_COMPATIBILITY[elem1]?.[elem2] ?? 50;
  const elemDesc = getElementDescription(elem1, elem2);

  // Quality compatibility
  const qualScore = QUALITY_COMPATIBILITY[qual1]?.[qual2] ?? 50;
  const qualDesc = getQualityDescription(qual1, qual2);

  // Planetary ruler compatibility
  const planetaryScore = getPlanetaryScore(ruler1, ruler2);
  const planetaryDesc = getPlanetaryDescription(ruler1, ruler2);

  // Weighted overall score
  const score = Math.round(elemScore * 0.4 + qualScore * 0.3 + planetaryScore * 0.3);

  // Determine compatibility level
  const level = getCompatibilityLevel(score);

  // Generate summary and details
  const summary = generateSummary(s1, s2, score, level);
  const strengths = getStrengths(s1, s2, elem1, elem2, planetaryScore);
  const challenges = getChallenges(s1, s2, elem1, elem2, planetaryScore);

  return {
    score,
    level,
    element: { score: elemScore, description: elemDesc },
    quality: { score: qualScore, description: qualDesc },
    planetary: { score: planetaryScore, description: planetaryDesc },
    summary,
    strengths,
    challenges,
  };
}

function getElementDescription(elem1: Elemento, elem2: Elemento): string {
  if (elem1 === elem2) {
    return 'Mesmos elementos criam profunda compreensão mútua e Intuição compartilhada';
  }

  const compat = ELEMENT_COMPATIBILITY[elem1]?.[elem2] ?? 50;

  if (compat >= 75) {
    return 'Elementos altamente complementares, criando harmonia natural e mutualidade';
  } else if (compat >= 50) {
    return 'Elementos com potencial para equilíbrio quando há compreensão mútua';
  } else {
    return 'Elementos contrastantes exigem mais esforço para harmonia, mas oferecem crescimento mútuo';
  }
}

function getQualityDescription(qual1: Qualidade, qual2: Qualidade): string {
  if (qual1 === qual2) {
    return 'Mesma qualidade cria estilos de vida compatíveis e compreensão mútua';
  }

  const descMap: Record<string, string> = {
    'cardinal-cardinal': 'Ambos activos e iniciadores, podem criar dinâmicas energeticas ou competitiva',
    'cardinal-fixo': 'Cardinal incentiva, fixo mantem - combinação de estabilidade e progresso',
    'cardinal-mutavel': 'Cardinal traz direcção, mutável traz adaptabilidade e flexibilidade',
    'fixo-cardinal': 'Fixos proporcionam consistência, cardinais trazem iniciativa',
    'fixo-mutavel': 'Fixos oferecem persistência, mutáveis trazem adaptação',
    'mutavel-cardinal': 'Mutáveis adaptam-se à energia cardinal, criando flexibilidade com direcção',
    'mutavel-fixo': 'Mutáveis oferecem flexibilidade, fixos proporcionam solidez',
  };

  return descMap[`${qual1}-${qual2}`] || 'Qualidades complementares com diferentes abordagens de vida';
}

function getPlanetaryScore(ruler1: string, ruler2: string): number {
  // Same ruler
  if (ruler1 === ruler2) return 90;

  // Traditional rulerships that harmonize
  const harmoniousRulers = [
    ['sol', 'lua'], // luminaries
    ['mercurio', 'mercurio'],
    ['venus', 'venus'],
    ['marte', 'marte'],
    ['jupiter', 'jupiter'],
    ['saturno', 'saturno'],
  ];

  // Check if rulers are traditionally harmonious
  if (harmoniousRulers.some(([r1, r2]) => (ruler1 === r1 && ruler2 === r2) || (ruler1 === r2 && ruler2 === r1))) {
    return 85;
  }

  // Check element alignment between rulers
  const rulerElements: Record<string, Elemento> = {
    sol: 'fogo',
    lua: 'agua',
    mercurio: 'ar',
    venus: 'terra',
    marte: 'fogo',
    jupiter: 'fogo',
    saturno: 'terra',
  };

  const elem1 = rulerElements[ruler1] || 'ar';
  const elem2 = rulerElements[ruler2] || 'ar';
  const compat = ELEMENT_COMPATIBILITY[elem1]?.[elem2] ?? 50;

  return Math.round(compat * 0.8 + 20);
}

function getPlanetaryDescription(ruler1: string, ruler2: string): string {
  if (ruler1 === ruler2) {
    return `Ambos guiados pelo planeta ${ruler1}, criando understanding profunda e Intuição compartilhada`;
  }

  return `Planetas regentes ${ruler1} e ${ruler2} oferecem perspectivas diferentes mas potencialmente complementares`;
}

function getCompatibilityLevel(score: number): CompatibilityResult['level'] {
  if (score >= 80) return 'excelente';
  if (score >= 65) return 'harmonioso';
  if (score >= 50) return 'bom';
  if (score >= 35) return 'neutro';
  return 'desafiante';
}

function generateSummary(
  sign1: Signo,
  sign2: Signo,
  score: number,
  level: CompatibilityResult['level']
): string {
  const levelDescriptions = {
    excelente: 'A conexão entre vocês é excepcional. Há uma sintonia profunda que transcende o racional.',
    harmonioso: 'Vocês encontram harmonia natural. A relação flui com entendimento mútuo e respeito.',
    bom: 'Há compatibility positiva entre vocês. Diferenças podem ser puente de crescimento.',
    neutro: 'A compatibility é equilibrada. Esforço consciente traz compreensão mútua.',
    desafiante: 'A relação traz aprendizados importantes. O desafio fortalece ambos.',
  };

  return levelDescriptions[level];
}

function getStrengths(
  sign1: Signo,
  sign2: Signo,
  elem1: Elemento,
  elem2: Elemento,
  planetaryScore: number
): string[] {
  const strengths: string[] = [];

  if (elem1 === elem2) {
    strengths.push('Intuição compartilhada e compreensão mútua natural');
  }

  if (elem1 === 'fogo' && elem2 === 'ar') {
    strengths.push('Inspiram-se mutuamente e compartilham visão idealista');
  }
  if (elem1 === 'ar' && elem2 === 'fogo') {
    strengths.push('Fogo e ar criam entusiasmo e comunicação vibrante');
  }
  if (elem1 === 'terra' && elem2 === 'agua') {
    strengths.push('Nutrem-se mutuamente com estabilidade e sensibilidade');
  }
  if (elem1 === 'agua' && elem2 === 'terra') {
    strengths.push('Formam base sólida com compreensão emocional profunda');
  }

  if (planetaryScore >= 80) {
    strengths.push('Planetas regentes harmonizam-se criando alinhamento de propósito');
  }

  if (strengths.length === 0) {
    strengths.push('Oportunidade de crescimento através da integração de perspectivas diferentes');
  }

  return strengths;
}

function getChallenges(
  sign1: Signo,
  sign2: Signo,
  elem1: Elemento,
  elem2: Elemento,
  planetaryScore: number
): string[] {
  const challenges: string[] = [];

  if (elem1 === 'fogo' && elem2 === 'agua') {
    challenges.push('Fogo e água podem criar tensão - intensidade emocional vs necessidade de espaço');
  }
  if (elem1 === 'agua' && elem2 === 'fogo') {
    challenges.push('Água e fogo demandam adaptação - Sensitivity vs energia assertiva');
  }
  if (elem1 === 'terra' && elem2 === 'ar') {
    challenges.push('Terra e ar têm diferentes prioridades - praticidade vs idealismo');
  }
  if (elem1 === 'ar' && elem2 === 'terra') {
    challenges.push('Ar e terra requerem bridge - comunicação intelectual vs grounded experiência');
  }

  if (planetaryScore < 50) {
    challenges.push('Planetas regentes em tensão podem criar diferenças de perspectiva');
  }

  if (challenges.length === 0) {
    challenges.push('Desafios menores que podem ser trabalhados com comunicação consciente');
  }

  return challenges;
}
