/**
 * Planet-Aspect Correlation Mapping
 * Classical astrological aspects with spiritual correlations
 * Based on Western astrology traditions integrated with Cabala dos Caminhos
 */

export interface PlanetAspect {
  aspecto: string;
  /** Portuguese name */
  nome: string;
  /** Symbol used in astrological charts */
  simbolo: string;
  /** Exact degree measurement */
  grau: number;
  /** Orb range in degrees (exact, min, max) */
  orb: {
    exato: number;
    /** Standard allowed orb */
    padrao: number;
    /** Wide orb for outer planets */
    amplo: number;
  };
  /** Nature classification */
  natureza: 'harmonioso' | 'tensional' | 'neutro';
  /** Classical interpretation */
  interpretacao: string;
  /** Which planets commonly form this aspect */
  planetas_comuns: string[];
  /** Element dynamics */
  elementos_envolvidos?: string[];
  /** Spiritual significance in the system */
  significado_espiritual: string;
}

/**
 * All five classical astrological aspects
 * Each mapped with orbital data, nature, and spiritual correlation
 */
export const PLANET_ASPECTS: Record<string, PlanetAspect> = {
  conjunção: {
    aspecto: 'conjunção',
    nome: 'Conjunção',
    simbolo: '☌',
    grau: 0,
    orb: {
      exato: 0,
      padrao: 8,
      amplo: 12,
    },
    natureza: 'neutro',
    interpretacao:
      'A conjunção é o aspecto mais intenso, onde dois corpos celestes ocupam a mesma posição ou estão muito próximos no céu. Representa a fusão de energias planetárias, potencializando ambos os corpos. Não é inerentemente boa ou má — a qualidade depende dos planetas envolvidos e do signo/casa. Traz foco, clareza de propósito e início de novos ciclos. É donde se concentram as forças mais potentes do mapa natal.',
    planetas_comuns: [
      'Sol',
      'Lua',
      'Mercúrio',
      'Vênus',
      'Marte',
      'Júpiter',
      'Saturno',
    ],
    elementos_envolvidos: ['fogo', 'terra', 'ar', 'água'],
    significado_espiritual:
      'Unificação de forças cósmicas. No sistema Cabala, representa a convergência do caminho do iniciado com a vontade divina. É o momento de sintonia entre o microcosmo e macrocosmo.',
  },

  sextil: {
    aspecto: 'sextil',
    nome: 'Sextil',
    simbolo: '⚹',
    grau: 60,
    orb: {
      exato: 60,
      padrao: 6,
      amplo: 8,
    },
    natureza: 'harmonioso',
    interpretacao:
      'O sextil conecta signos de elementos compatíveis (fogo→ar, terra→água). É um aspecto de oportunidade natural que oferece facilidade para crescimento criativo e comunicação. Não força a ação, mas cria o terreno fértil onde talentos podem florescer. Traz possibilidades que recompensam a iniciativa. É o aspecto das portas que se abrem para quem está preparado.',
    planetas_comuns: [
      'Mercúrio',
      'Vênus',
      'Marte',
      'Júpiter',
      'Saturno',
      'Sol',
      'Lua',
    ],
    elementos_envolvidos: ['fogo↔ar', 'terra↔água'],
    significado_espiritual:
      'Oportunidade de evolução. No contexto do sistema Cabala, indica as janelas astrais onde o praticante pode atuar com menos resistência. O sextil revela os caminhos abertos nas encruzilhadas do destino, promovendo o alinhamento entre microcosmo e macrocosmo.',
  },

  quadratura: {
    aspecto: 'quadratura',
    nome: 'Quadratura',
    simbolo: '□',
    grau: 90,
    orb: {
      exato: 90,
      padrao: 8,
      amplo: 10,
    },
    natureza: 'tensional',
    interpretacao:
      'A quadratura conecta signos do mesmo modo (cardinal, fixo ou mutável), criando tensão que exige ação direta. É o aspecto do desafio consciente — confronta o nativo com obstáculos que não podem ser ignorados. Não é destrutivo; é fermento de transformação. Se trabalhado, a tensão se converte em força motriz e desenvolvimento de caráter. Se evitado, manifesta-se como frustração, crise ou crise de crescimento.',
    planetas_comuns: [
      'Marte',
      'Saturno',
      'Plutão',
      'Urano',
      'Sol',
      'Lua',
      'Mercúrio',
    ],
    elementos_envolvidos: ['cardinal↔cardinal', 'fixo↔fixo', 'mutável↔mutável'],
    significado_espiritual:
      'Prova de fogo espiritual. A quadratura é a fornalha onde o metal é temperado. No sistema Cabala, representa as provações necessárias que aparecem no caminho do iniciado para testarem sua real dedicação ao caminho de reorganização interior.',
  },

  trino: {
    aspecto: 'trino',
    nome: 'Trino',
    simbolo: '△',
    grau: 120,
    orb: {
      exato: 120,
      padrao: 8,
      amplo: 12,
    },
    natureza: 'harmonioso',
    interpretacao:
      'O trino é o aspecto de maior fluidez, conectando signos do mesmo elemento em harmonia natural e automática. Traz facilidade em tudo que toca — talento inato, sorte circumstantial, conexões suaves e naturais. É onde o nativo nem precisa tentar que as coisas acontecem. Porém, a太过-harmonia pode levar à preguiça, complacência ou autossatisfação. É o tipo de aspecto que o nativo nem percebe que possui, até que lhe falta.',
    planetas_comuns: [
      'Júpiter',
      'Saturno',
      'Vênus',
      'Sol',
      'Lua',
      'Mercúrio',
      'Marte',
      'Netuno',
      'Urano',
    ],
    elementos_envolvidos: ['fogo↔fogo', 'terra↔terra', 'ar↔ar', 'água↔água'],
    significado_espiritual:
      'Graça divina fluindo naturalmente. No sistema Cabala, representa a bênção do fluxo cósmico quando o praticante está em alinhamento. É aharmonia entre os elementos internos e externos, o estado de graça que permite a manifestação da vontade superior.',
  },

  oposição: {
    aspecto: 'oposição',
    nome: 'Oposição',
    simbolo: '☍',
    grau: 180,
    orb: {
      exato: 180,
      padrao: 8,
      amplo: 12,
    },
    natureza: 'tensional',
    interpretacao:
      'A oposição conecta signos opostos do zodíaco, presentando duas forças em tensão dialética. Traz consciência de polaridade — a capacidade de ver ambos os lados de qualquer questão. É o aspecto do espelho, onde tudo que é projetado no exterior reflete algo interno. O desafio é a indecisão, a projeção ou a transferência de responsabilidades. Quando conscientemente integrada, oferece maturidade, amplitude de perspectiva e wisdom através do contraste. É o aspecto da integração dos opostos.',
    planetas_comuns: [
      'Sol',
      'Lua',
      'Saturno',
      'Marte',
      'Plutão',
      'Júpiter',
      'Vênus',
    ],
    elementos_envolvidos: ['fogo↔água', 'terra↔ar'],
    significado_espiritual:
      'Integração dos opostos. No sistema Cabala, representa o momento de reconcileiação entre direita e esquerda, entre forças aparentemente contraditórias. A oposição é o caminho do meio que emerge quando se reconhece que os opostos são complementares na Totalidade.',
  },
};

// Freeze the mapping to prevent accidental modifications
Object.freeze(PLANET_ASPECTS);
Object.values(PLANET_ASPECTS).forEach(aspect => Object.freeze(aspect));

/**
 * Get full aspect data by aspect name
 * @param aspecto - Aspect name (conjunção, sextil, quadratura, trino, oposição)
 * @returns The PlanetAspect data or null if not found
 */
export function getPlanetAspect(aspecto: string): PlanetAspect | null {
  return PLANET_ASPECTS[aspecto] ?? null;
}

/**
 * Get the interpretation for an aspect
 * @param aspecto - Aspect name
 * @returns The interpretation string or null if not found
 */
function getAspectInterpretation(aspecto: string): string | null {
  return PLANET_ASPECTS[aspecto]?.interpretacao ?? null;
}

/**
 * Get all available aspects
 * @returns Array of all aspect names
 */
function getAllAspects(): string[] {
  return Object.keys(PLANET_ASPECTS);
}

/**
 * Get all aspect data as array
 * @returns Array of all PlanetAspect objects
 */
export function getAllPlanetAspects(): PlanetAspect[] {
  return Object.values(PLANET_ASPECTS);
}

/**
 * Check if an aspect exists
 * @param aspecto - Aspect name to check
 * @returns True if aspect exists
 */
function hasAspect(aspecto: string): boolean {
  return aspecto in PLANET_ASPECTS;
}

/**
 * Get aspects by nature (harmonious/tensional)
 * @param natureza - Nature to filter by
 * @returns Array of PlanetAspect objects matching the nature
 */
function getAspectsByNature(natureza: 'harmonioso' | 'tensional' | 'neutro'): PlanetAspect[] {
  return Object.values(PLANET_ASPECTS).filter(a => a.natureza === natureza);
}

/**
 * Get the symbol for an aspect
 * @param aspecto - Aspect name
 * @returns The symbol or null if not found
 */
function getAspectSymbol(aspecto: string): string | null {
  return PLANET_ASPECTS[aspecto]?.simbolo ?? null;
}

/**
 * Get the orb range for an aspect
 * @param aspecto - Aspect name
 * @param tipo - Orb type: 'padrao' (default), 'amplo', 'exato'
 * @returns The orb in degrees or null if not found
 */
function getAspectOrb(aspecto: string, tipo: 'padrao' | 'amplo' | 'exato' = 'padrao'): number | null {
  return PLANET_ASPECTS[aspecto]?.orb[tipo] ?? null;
}

/**
 * Get planets that commonly form a specific aspect
 * @param aspecto - Aspect name
 * @returns Array of planet names or null if not found
 */
function getAspectPlanets(aspecto: string): string[] | null {
  return PLANET_ASPECTS[aspecto]?.planetas_comuns ?? null;
}

/**
 * Check if two planets can form a specific aspect (based on common placement)
 * @param planeta1 - First planet name
 * @param planeta2 - Second planet name
 * @param aspecto - Aspect type to check
 * @returns True if these planets commonly form this aspect
 */
function canFormAspect(planeta1: string, planeta2: string, aspecto: string): boolean {
  const aspect = PLANET_ASPECTS[aspecto];
  if (!aspect) return false;

  return (
    aspect.planetas_comuns.includes(planeta1) &&
    aspect.planetas_comuns.includes(planeta2)
  );
}

/**
 * Get aspect degree
 * @param aspecto - Aspect name
 * @returns The exact degree or null if not found
 */
function getAspectDegree(aspecto: string): number | null {
  return PLANET_ASPECTS[aspecto]?.grau ?? null;
}