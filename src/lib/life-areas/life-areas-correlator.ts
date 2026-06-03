// LIFE AREAS CORRELATOR
// ============================================================
// Correlaciona o perfil completo do usuário com cada área da vida
// Retorna um "score" e correlação para cada área
// ============================================================

import {
  LifeArea,
  LifeAreaId,
  getAllLifeAreas,
} from './life-areas-engine';

// ============================================================
// TYPES
// ============================================================

export interface UserProfile {
  nome: string;
  dataNascimento: string; // ISO format
  horaNascimento?: string;
  localNascimento?: string;

  // Numerologia
  caminhoDeVida: number;
  numeroDestino: number;
  numeroExpressao?: number;
  anoPessoal: number;

  // Astrologia
  signoSolar: string;
  ascendente?: string;
  lua?: string;
  planetaDominante?: string;
  casaForte?: number;

  // Odu / Ifá
  oduNascimento: string;

  // Orixá
  orixaRegente: string;

  // Tantra / Chakras
  chakraDominante?: string;
  elementoDominante?: string;
}

export interface AreaCorrelation {
  area: LifeArea;
  score: number;                    // 0-100 - quão forte é essa área para o usuário
  intensidade: 'muito alta' | 'alta' | 'média' | 'baixa' | 'muito baixa';
  matches: AreaMatch[];             // Correspondências encontradas
  challenges: string[];             // Desafios apontados
  gifts: string[];                  // Dons e talentos
  guidance: string;                 // Orientação geral
}

export interface AreaMatch {
  source: 'numerologia' | 'astrologia' | 'odu' | 'orixa' | 'chakra' | 'elemento';
  category: string;     // ex: 'Caminho de Vida', 'Planeta regente', 'Odu', 'Orixá'
  value: string;        // ex: '7', 'Netuno', 'Irosun', 'Oxum'
  resonance: number;    // 0-100
  interpretation: string; // Texto explicando a correlação
}

export interface LifeMapResult {
  user: UserProfile;
  correlations: AreaCorrelation[];
  topAreas: LifeAreaId[];        // Áreas de maior afinidade
  growthAreas: LifeAreaId[];     // Áreas de maior crescimento
  shadowAreas: LifeAreaId[];     // Áreas que pedem cura
  synthesis: string;             // Síntese geral
}

// ============================================================
// CONSTANTS - Correspondências numerológicas
// ============================================================

const NUMEROLOGY_AREAS: Record<number, LifeAreaId[]> = {
  1: ['carreira', 'proposito', 'criatividade'],
  2: ['relacionamentos', 'familia', 'amizades'],
  3: ['criatividade', 'amizades', 'conhecimento'],
  4: ['carreira', 'familia', 'saude'],
  5: ['sexualidade', 'criatividade', 'amizades'],
  6: ['relacionamentos', 'familia', 'espiritualidade'],
  7: ['espiritualidade', 'conhecimento', 'autoconhecimento'],
  8: ['financas', 'carreira', 'sexualidade'],
  9: ['proposito', 'espiritualidade', 'relacionamentos'],
  11: ['proposito', 'espiritualidade', 'autoconhecimento'],
  22: ['carreira', 'proposito', 'autoconhecimento'],
  33: ['espiritualidade', 'autoconhecimento', 'relacionamentos'],
};

const ORIXAS_AREAS: Record<string, LifeAreaId[]> = {
  'oxala': ['espiritualidade', 'proposito', 'autoconhecimento'],
  'oxaguia': ['espiritualidade', 'carreira', 'proposito'],
  'oxum': ['relacionamentos', 'financas', 'sexualidade'],
  'iansa': ['sexualidade', 'criatividade', 'carreira'],
  'xango': ['carreira', 'autoconhecimento', 'relacionamentos'],
  'ogum': ['carreira', 'financas', 'autoconhecimento'],
  'oxossi': ['conhecimento', 'criatividade', 'carreira'],
  'iemanja': ['relacionamentos', 'familia', 'espiritualidade'],
  'omolu': ['saude', 'autoconhecimento', 'familia'],
  'nana': ['familia', 'autoconhecimento', 'espiritualidade'],
  'exu': ['amizades', 'carreira', 'conhecimento'],
  'pomba-gira': ['sexualidade', 'relacionamentos', 'autoconhecimento'],
  'loguned': ['relacionamentos', 'criatividade', 'sexualidade'],
};

const ELEMENT_AREAS: Record<string, LifeAreaId[]> = {
  'fogo': ['carreira', 'sexualidade', 'criatividade'],
  'agua': ['relacionamentos', 'sexualidade', 'espiritualidade'],
  'terra': ['saude', 'financas', 'familia'],
  'ar': ['conhecimento', 'amizades', 'criatividade'],
  'eter': ['espiritualidade', 'proposito', 'autoconhecimento'],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalize(s: string): string {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getOrixaMatches(orixa: string): string {
  const norm = normalize(orixa);
  // Return original form for matching
  const matches = Object.keys(ORIXAS_AREAS).find(k => normalize(k) === norm);
  return matches || '';
}

function classifyIntensity(score: number): AreaCorrelation['intensidade'] {
  if (score >= 85) return 'muito alta';
  if (score >= 70) return 'alta';
  if (score >= 50) return 'média';
  if (score >= 30) return 'baixa';
  return 'muito baixa';
}

function getIntensityEmoji(intensity: AreaCorrelation['intensidade']): string {
  return {
    'muito alta': '🔥🔥🔥',
    'alta': '🔥🔥',
    'média': '🔥',
    'baixa': '💧',
    'muito baixa': '🌫️',
  }[intensity];
}

// ============================================================
// MAIN CORRELATION FUNCTION
// ============================================================

// ============================================================
// MAIN CORRELATION FUNCTION
// ============================================================
function correlateLifeAreas(user: UserProfile): LifeMapResult {
  // Compute correlation for each life area
  const correlations = getAllLifeAreas().map(area => computeAreaCorrelation(area, user));
  // Sort by score descending
  correlations.sort((a, b) => b.score - a.score);
  // Classify areas
  const { topAreas, growthAreas, shadowAreas } = classifyAreas(correlations);
  // Generate synthesis
  const synthesis = generateSynthesis(correlations, user);
  return {
    user,
    correlations,
    topAreas,
    growthAreas,
    shadowAreas,
    synthesis,
  };
}

// ============================================================
// HELPERS - Map of astrology planets/signs to areas
// ============================================================

const ASTROLOGY_PLANET_AREAS: Record<string, LifeAreaId[]> = {
  'sol': ['proposito', 'criatividade'],
  'lua': ['familia', 'relacionamentos'],
  'mercurio': ['conhecimento', 'amizades'],
  'venus': ['relacionamentos', 'financas', 'sexualidade'],
  'marte': ['carreira', 'sexualidade', 'saude'],
  'jupiter': ['financas', 'conhecimento', 'espiritualidade'],
  'saturno': ['carreira', 'familia', 'autoconhecimento'],
  'urano': ['amizades', 'criatividade'],
  'netuno': ['espiritualidade', 'autoconhecimento'],
  'plutao': ['sexualidade', 'autoconhecimento', 'relacionamentos'],
  'quiron': ['autoconhecimento', 'relacionamentos', 'saude'],
  'lilith': ['sexualidade', 'autoconhecimento', 'relacionamentos'],
};

const ASTROLOGY_SIGN_AREAS: Record<string, LifeAreaId[]> = {
  'aries': ['carreira', 'sexualidade', 'criatividade'],
  'touro': ['financas', 'relacionamentos'],
  'gemeos': ['conhecimento', 'amizades'],
  'cancer': ['familia', 'relacionamentos'],
  'leao': ['criatividade', 'proposito'],
  'virgem': ['saude', 'conhecimento'],
  'libra': ['relacionamentos', 'criatividade'],
  'escorpiao': ['sexualidade', 'autoconhecimento'],
  'sagitario': ['espiritualidade', 'conhecimento'],
  'capricornio': ['carreira', 'familia'],
  'aquario': ['amizades', 'criatividade'],
  'peixes': ['espiritualidade', 'autoconhecimento'],
};

// ============================================================
// SYNTHESIS
// ============================================================

function generateSynthesis(correlations: AreaCorrelation[], user: UserProfile): string {
  const top = correlations[0];
  const second = correlations[1];
  const third = correlations[2];

  const topNames = [top, second, third].map(c => c.area.name).join(', ');

  return `Olá, ${user.nome}! 🌟

Seu Mapa de Áreas da Vida revela um perfil único e multifacetado. As áreas que ressoam mais fortemente com seu mapa são: **${topNames}**.

Seu caminho de vida ${user.caminhoDeVida}, regido por ${user.orixaRegente}, com a energia de ${user.oduNascimento} e o signo ${user.signoSolar}, forma uma constelação que favorece especialmente a área de ${top.area.name.toLowerCase()} (${top.score}% de afinidade).

${top.guidance}

Você também tem uma base sólida em ${second.area.name.toLowerCase()} e ${third.area.name.toLowerCase()}, áreas que complementam sua jornada. Use esses dons para equilibrar as áreas que pedem mais atenção.

A integração de todos esses sistemas não é um destino, mas um mapa. Você tem o livre-arbítrio para trilhar seu próprio caminho. Use essas correlações como bússola, não como prisão.`;
}

// ============================================================
// UTILITY: get top area by score
// ============================================================

function getTopArea(result: LifeMapResult): AreaCorrelation {
  return result.correlations[0];
}

function getAreaById(result: LifeMapResult, id: LifeAreaId): AreaCorrelation | undefined {
  return result.correlations.find(c => c.area.id === id);
}
// ============================================================
// SCORE CALCULATION
// ============================================================
function calculateCorrelationScore(matches: AreaMatch[]): number {
  if (matches.length === 0) return 25;
  const totalScore = matches.reduce((sum, m) => sum + m.resonance, 0);
  return Math.min(100, Math.round(totalScore / matches.length));
}
function extractGifts(area: LifeArea): string[] {
  return area.astrology.keywords.slice(0, 3);
}
function extractChallenges(area: LifeArea): string[] {
  return [
    `Trabalhar a energia de ${area.astrology.signs[0] || 'transformação'}`,
    `Equilibrar o elemento ${area.element.primary}`,
    `Honrar o Odu ${area.odu.primaryOdus[0]}`,
  ];
}
// ============================================================
// MATCH COLLECTORS
// ============================================================
function collectNumerologyMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  // Caminho de Vida
  const caminhoAreas = NUMEROLOGY_AREAS[user.caminhoDeVida];
  if (caminhoAreas?.includes(area.id)) {
    matches.push({
      source: 'numerologia',
      category: 'Caminho de Vida',
      value: String(user.caminhoDeVida),
      resonance: 85,
      interpretation: `Seu caminho de vida ${user.caminhoDeVida} vibra fortemente com a área de ${area.name.toLowerCase()}.`,
    });
  }
  // Número de Destino
  const destinoAreas = NUMEROLOGY_AREAS[user.numeroDestino];
  if (destinoAreas?.includes(area.id)) {
    matches.push({
      source: 'numerologia',
      category: 'Número de Destino',
      value: String(user.numeroDestino),
      resonance: 80,
      interpretation: `Seu número de destino ${user.numeroDestino} alinha com esta área, apontando para um campo de realização natural.`,
    });
  }
  // Ano Pessoal
  const anoAreas = NUMEROLOGY_AREAS[user.anoPessoal];
  if (anoAreas?.includes(area.id)) {
    matches.push({
      source: 'numerologia',
      category: 'Ano Pessoal',
      value: String(user.anoPessoal),
      resonance: 50,
      interpretation: `Seu ano pessoal ${user.anoPessoal} traz foco especial para esta área.`,
    });
  }
}
function collectAstrologyMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  // Signo Solar
  const signoLower = normalize(user.signoSolar);
  const signoAreas = ASTROLOGY_SIGN_AREAS[signoLower];
  if (signoAreas?.includes(area.id)) {
    matches.push({
      source: 'astrologia',
      category: 'Signo Solar',
      value: user.signoSolar,
      resonance: 75,
      interpretation: `Seu signo ${user.signoSolar} tem afinidade natural com ${area.name.toLowerCase()}.`,
    });
  }
  // Planeta Dominante
  if (user.planetaDominante) {
    const planetaLower = normalize(user.planetaDominante);
    const planetaAreas = ASTROLOGY_PLANET_AREAS[planetaLower];
    if (planetaAreas?.includes(area.id)) {
      matches.push({
        source: 'astrologia',
        category: 'Planeta Dominante',
        value: user.planetaDominante,
        resonance: 80,
        interpretation: `${user.planetaDominante} rege diretamente aspectos de ${area.name.toLowerCase()}, ativando esta área de forma intensa.`,
      });
    }
  }
}
function collectOrixaMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  const orixaKey = getOrixaMatches(user.orixaRegente);
  if (!orixaKey) return;
  const orixaAreas = ORIXAS_AREAS[orixaKey];
  if (orixaAreas?.includes(area.id)) {
    matches.push({
      source: 'orixa',
      category: 'Orixá Regente',
      value: user.orixaRegente,
      resonance: 90,
      interpretation: `${user.orixaRegente} é o guardião desta área na sua vida, trazendo proteção e direcionamento.`,
    });
  }
}
function collectOduMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  const oduLower = normalize(user.oduNascimento);
  const isPrimary = area.odu.primaryOdus.some(o => normalize(o) === oduLower);
  const isFavorable = area.odu.favorableOdus.some(o => normalize(o) === oduLower);
  if (isPrimary) {
    matches.push({
      source: 'odu',
      category: 'Odu de Nascimento',
      value: user.oduNascimento,
      resonance: 85,
      interpretation: `O Odu ${user.oduNascimento} traz suas lições e bênçãos especificamente para esta área.`,
    });
  } else if (isFavorable) {
    matches.push({
      source: 'odu',
      category: 'Odu Favorável',
      value: user.oduNascimento,
      resonance: 65,
      interpretation: `${user.oduNascimento} é um Odu favorável para esta área, trazendo fluidez.`,
    });
  }
}
function collectChakraMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  if (!user.chakraDominante) return;
  const chakraMatch = area.chakra.primary.some(
    c => normalize(c).includes(normalize(user.chakraDominante!))
  );
  if (chakraMatch) {
    matches.push({
      source: 'chakra',
      category: 'Chakra Dominante',
      value: user.chakraDominante,
      resonance: 70,
      interpretation: `Seu chakra ${user.chakraDominante} rege energeticamente esta área.`,
    });
  }
}
function collectElementMatches(area: LifeArea, user: UserProfile, matches: AreaMatch[]): void {
  if (!user.elementoDominante) return;
  const elemLower = normalize(user.elementoDominante);
  const elemAreas = ELEMENT_AREAS[elemLower];
  if (elemAreas?.includes(area.id)) {
    matches.push({
      source: 'elemento',
      category: 'Elemento Dominante',
      value: user.elementoDominante,
      resonance: 60,
      interpretation: `O elemento ${user.elementoDominante} potencializa esta área, trazendo vitalidade.`,
    });
  }
}
function collectAllMatches(area: LifeArea, user: UserProfile): AreaMatch[] {
  const matches: AreaMatch[] = [];
  collectNumerologyMatches(area, user, matches);
  collectAstrologyMatches(area, user, matches);
  collectOrixaMatches(area, user, matches);
  collectOduMatches(area, user, matches);
  collectChakraMatches(area, user, matches);
  collectElementMatches(area, user, matches);
  return matches;
}
// ============================================================
// AREA CORRELATION COMPUTATION
// ============================================================
function computeAreaCorrelation(area: LifeArea, user: UserProfile): AreaCorrelation {
  const matches = collectAllMatches(area, user);
  const score = calculateCorrelationScore(matches);
  return {
    area,
    score,
    intensidade: classifyIntensity(score),
    matches: matches.sort((a, b) => b.resonance - a.resonance),
    challenges: extractChallenges(area),
    gifts: extractGifts(area),
    guidance: generateGuidance(score, area),
  };
}
// ============================================================
// AREA CLASSIFICATION
// ============================================================
function classifyAreas(correlations: AreaCorrelation[]): {
  topAreas: LifeAreaId[];
  growthAreas: LifeAreaId[];
  shadowAreas: LifeAreaId[];
} {
  const topAreas = correlations
    .filter(c => c.score >= 70)
    .map(c => c.area.id)
    .slice(0, 3);
  const shadowAreas = correlations
    .filter(c => c.score < 50)
    .map(c => c.area.id)
    .slice(0, 3);
  const growthAreas = correlations
    .filter(c => c.score >= 50 && c.score < 70)
    .map(c => c.area.id)
    .slice(0, 3);
  return { topAreas, growthAreas, shadowAreas };
}
// ============================================================
// GUIDANCE GENERATION
// ============================================================
function generateGuidance(score: number, area: LifeArea): string {
  if (score >= 70) {
    return `Esta é uma área de poder na sua vida. Você tem recursos internos para brilhar e contribuir significativamente. ${area.practices[0]} pode amplificar ainda mais.`;
  }
  if (score >= 50) {
    return `Esta é uma área de equilíbrio. Continue cultivando-a com atenção e presença. ${area.practices[0]} é recomendado.`;
  }
  return `Esta área pede atenção e cura. Seja gentil consigo mesmo(a) ao desenvolvê-la. ${area.questions[0]} é um bom ponto de partida.`;
}
