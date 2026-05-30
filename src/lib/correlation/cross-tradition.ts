/**
 * ════════════════════════════════════════════════════════════════════════════
 * CROSS-TRADITION CORRELATION UTILITIES — Cabala dos Caminhos
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Utility functions for correlating spiritual data across traditions:
 * - Numerology ↔ Orixá ↔ Astrology ↔ Chakra ↔ Tarot ↔ Kabbalah
 *
 * Version: 1.0.0
 * Last Updated: 2026-05-30
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════

export interface CrossTraditionMap {
  source: {
    tradition: 'numerology' | 'orixa' | 'astrology' | 'chakra' | 'tarot' | 'kabbalah';
    value: string | number;
  };
  targets: Array<{
    tradition: string;
    value: string | number;
    confidence: number; // 0-1
    explanation: string;
  }>;
}

export interface CorrelationResult {
  success: boolean;
  maps: CrossTraditionMap[];
  dominantElement: string | null;
  conflicts: string[];
  recommendations: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// ELEMENT MAPPINGS
// ════════════════════════════════════════════════════════════════════════════

const ELEMENT_MAP: Record<string, {
  orixas: string[];
  zodiacSigns: string[];
  planets: string[];
  chakras: number[];
  sephirot: number[];
  tarotArcanos: number[];
}> = {
  'Fogo': {
    orixas: ['Ogum', 'Xangô', 'Iansã', 'Exu'],
    zodiacSigns: ['aries', 'leao', 'sagitario'],
    planets: ['Sol', 'Marte', 'Júpiter'],
    chakras: [3, 7],
    sephirot: [6, 8],
    tarotArcanos: [4, 6, 16],
  },
  'Água': {
    orixas: ['Iemanjá', 'Oxum', 'Nanã', 'Olokun'],
    zodiacSigns: ['cancer', 'escorpiao', 'peixes'],
    planets: ['Lua', 'Netuno', 'Plutão'],
    chakras: [2, 4],
    sephirot: [2, 9],
    tarotArcanos: [2, 12, 17],
  },
  'Terra': {
    orixas: ['Obatalá', 'Omolu', 'Oxóssi'],
    zodiacSigns: ['touro', 'virgem', 'capricornio'],
    planets: ['Vênus', 'Saturno', 'Mercury'],
    chakras: [1, 4],
    sephirot: [3, 4, 10],
    tarotArcanos: [3, 7, 10],
  },
  'Ar': {
    orixas: ['Oxalá', 'Logun-edé', 'Ewa'],
    zodiacSigns: ['gemeos', 'libra', 'aquario'],
    planets: ['Mercury', 'Júpiter', 'Urano'],
    chakras: [5, 6],
    sephirot: [1, 5, 7],
    tarotArcanos: [0, 5, 11, 14],
  },
  'Éter': {
    orixas: ['Oxumare', 'Orunmilá'],
    zodiacSigns: ['peixes'],
    planets: ['Netuno'],
    chakras: [6, 7],
    sephirot: [1, 11],
    tarotArcanos: [0, 13, 21],
  },
};

// ════════════════════════════════════════════════════════════════════════════
// MASTER NUMBER CORRELATIONS
// ════════════════════════════════════════════════════════════════════════════

export const MASTER_NUMBER_CORRELATIONS: Record<number, {
  name: string;
  element: string;
  sephirah: number;
  orixa: string;
  chakra: number;
  tarotArcano: number;
  zodiacSign: string;
  planet: string;
}> = {
  11: {
    name: 'O Iluminado',
    element: 'Ar',
    sephirah: 11, // Daath
    orixa: 'Oxalá',
    chakra: 6, // Third Eye
    tarotArcano: 11, // Justice (or The Strength alternative)
    zodiacSign: 'libra',
    planet: 'Mercury',
  },
  22: {
    name: 'O Mestre Construtor',
    element: 'Terra',
    sephirah: 22, // Special path
    orixa: 'Ogum',
    chakra: 5, // Throat
    tarotArcano: 22, // The World
    zodiacSign: 'touro',
    planet: 'Venus',
  },
  33: {
    name: 'O Mestre Espiritual',
    element: 'Fogo',
    sephirah: 33, // Tiphereth elevated
    orixa: 'Iansã',
    chakra: 7, // Crown
    tarotArcano: 20, // Judgment
    zodiacSign: 'sagitario',
    planet: 'Sol',
  },
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get the element for a given value across traditions
 */
export function getElement(value: string | number, tradition?: string): string | null {
  const val = String(value).toLowerCase();

  // Check master numbers first
  if (typeof value === 'number' && [11, 22, 33].includes(value)) {
    return MASTER_NUMBER_CORRELATIONS[value].element;
  }

  // Check elements
  for (const [element, data] of Object.entries(ELEMENT_MAP)) {
    if (tradition === 'orixa' && data.orixas.some(o => o.toLowerCase() === val)) {
      return element;
    }
    if (tradition === 'astrology' && data.zodiacSigns.some(s => s.toLowerCase() === val)) {
      return element;
    }
    if (tradition === 'planet' && data.planets.some(p => p.toLowerCase() === val)) {
      return element;
    }
    if (tradition === 'chakra' && data.chakras.includes(Number(value))) {
      return element;
    }
  }

  // Direct element match
  if (['fogo', 'água', 'terra', 'ar', 'éter'].includes(val)) {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  return null;
}

/**
 * Correlate a number (from numerology) across all traditions
 */
export function correlateNumber(num: number): CrossTraditionMap | null {
  // Check master numbers
  if ([11, 22, 33].includes(num)) {
    const master = MASTER_NUMBER_CORRELATIONS[num];
    return {
      source: { tradition: 'numerology', value: num },
      targets: [
        { tradition: 'element', value: master.element, confidence: 1.0, explanation: `Mestre ${num} vibra em ${master.element}` },
        { tradition: 'kabbalah', value: master.sephirah, confidence: 1.0, explanation: `${master.sephirah === 11 ? 'Daath' : 'Caminho especial'}` },
        { tradition: 'orixa', value: master.orixa, confidence: 0.9, explanation: `${master.orixa} carrega a energia do ${num}` },
        { tradition: 'chakra', value: master.chakra, confidence: 0.9, explanation: `Chakra ${master.chakra} ativado` },
        { tradition: 'tarot', value: master.tarotArcano, confidence: 0.85, explanation: `Arcano ${master.tarotArcano}` },
        { tradition: 'astrology', value: master.zodiacSign, confidence: 0.85, explanation: `Signo ${master.zodiacSign}` },
      ],
    };
  }

  // Base number element
  const baseNum = num > 9 ? num % 9 || 9 : num;
  const elementMap: Record<number, string> = {
    1: 'Fogo', 2: 'Água', 3: 'Terra', 4: 'Ar',
    5: 'Fogo', 6: 'Terra', 7: 'Água', 8: 'Ar', 9: 'Fogo',
  };
  const element = elementMap[baseNum] || 'Ar';
  const elementData = ELEMENT_MAP[element];

  return {
    source: { tradition: 'numerology', value: num },
    targets: [
      { tradition: 'element', value: element, confidence: 0.9, explanation: `Número ${num} reduz a ${baseNum}, vibrando em ${element}` },
      { tradition: 'tarot', value: num % 22, confidence: 0.7, explanation: `Arcano ${num % 22}` },
      { tradition: 'orixa', value: elementData.orixas[0], confidence: 0.6, explanation: `${elementData.orixas[0]} relacionado a ${element}` },
    ],
  };
}

/**
 * Correlate an Orixá across traditions
 */
export function correlateOrixa(orixaName: string): CrossTraditionMap | null {
  const normalized = orixaName.toLowerCase();

  for (const [element, data] of Object.entries(ELEMENT_MAP)) {
    const matchingOrixa = data.orixas.find(o => o.toLowerCase() === normalized);
    if (matchingOrixa) {
      return {
        source: { tradition: 'orixa', value: matchingOrixa },
        targets: [
          { tradition: 'element', value: element, confidence: 1.0, explanation: `${matchingOrixa} é regido por ${element}` },
          { tradition: 'chakra', value: data.chakras[0], confidence: 0.9, explanation: `Chakra ${data.chakras[0]} é o principal` },
          { tradition: 'zodiac', value: data.zodiacSigns[0], confidence: 0.8, explanation: `Signo correlato: ${data.zodiacSigns[0]}` },
          { tradition: 'planet', value: data.planets[0], confidence: 0.85, explanation: `Planeta regente: ${data.planets[0]}` },
          { tradition: 'sephirot', value: data.sephirot[0], confidence: 0.75, explanation: `Sephirah correlato: ${data.sephirot[0]}` },
          { tradition: 'tarot', value: data.tarotArcanos[0], confidence: 0.7, explanation: `Arcano: ${data.tarotArcanos[0]}` },
        ],
      };
    }
  }

  return null;
}

/**
 * Correlate a zodiac sign across traditions
 */
export function correlateZodiac(signo: string): CrossTraditionMap | null {
  const normalized = signo.toLowerCase();

  for (const [element, data] of Object.entries(ELEMENT_MAP)) {
    const matchingSign = data.zodiacSigns.find(s => s.toLowerCase() === normalized);
    if (matchingSign) {
      return {
        source: { tradition: 'astrology', value: matchingSign },
        targets: [
          { tradition: 'element', value: element, confidence: 1.0, explanation: `${matchingSign} é signo de ${element}` },
          { tradition: 'planet', value: data.planets[0], confidence: 0.9, explanation: `Regente: ${data.planets[0]}` },
          { tradition: 'chakra', value: data.chakras[0], confidence: 0.8, explanation: `Chakra relacionado: ${data.chakras[0]}` },
          { tradition: 'orixa', value: data.orixas[0], confidence: 0.75, explanation: `Orixá: ${data.orixas[0]}` },
          { tradition: 'tarot', value: data.tarotArcanos[0], confidence: 0.7, explanation: `Arcano: ${data.tarotArcanos[0]}` },
        ],
      };
    }
  }

  return null;
}

/**
 * Correlate a chakra across traditions
 */
export function correlateChakra(chakraNum: number): CrossTraditionMap | null {
  for (const [element, data] of Object.entries(ELEMENT_MAP)) {
    if (data.chakras.includes(chakraNum)) {
      return {
        source: { tradition: 'chakra', value: chakraNum },
        targets: [
          { tradition: 'element', value: element, confidence: 1.0, explanation: `Chakra ${chakraNum} vibra em ${element}` },
          { tradition: 'orixa', value: data.orixas[0], confidence: 0.9, explanation: `${data.orixas[0]} relacionado` },
          { tradition: 'zodiac', value: data.zodiacSigns[0], confidence: 0.8, explanation: `${data.zodiacSigns[0]} é signo de ${element}` },
          { tradition: 'planet', value: data.planets[0], confidence: 0.85, explanation: `${data.planets[0]} relacionado` },
        ],
      };
    }
  }

  return null;
}

/**
 * Perform full cross-tradition correlation analysis
 */
export function analyzeCrossTraditions(data: {
  caminhoVida?: number;
  signoSolar?: string;
  orixaRegente?: string;
  chakraPrincipal?: number;
}): CorrelationResult {
  const maps: CrossTraditionMap[] = [];
  const elements: string[] = [];
  const conflicts: string[] = [];

  // Correlate each data point
  if (data.caminhoVida) {
    const numMap = correlateNumber(data.caminhoVida);
    if (numMap) {
      maps.push(numMap);
      const elem = getElement(data.caminhoVida, 'numerology');
      if (elem) elements.push(elem);
    }
  }

  if (data.signoSolar) {
    const zodiacMap = correlateZodiac(data.signoSolar);
    if (zodiacMap) {
      maps.push(zodiacMap);
      const elem = getElement(data.signoSolar, 'astrology');
      if (elem) elements.push(elem);
    }
  }

  if (data.orixaRegente) {
    const orixaMap = correlateOrixa(data.orixaRegente);
    if (orixaMap) {
      maps.push(orixaMap);
      const elem = getElement(data.orixaRegente, 'orixa');
      if (elem) elements.push(elem);
    }
  }

  if (data.chakraPrincipal) {
    const chakraMap = correlateChakra(data.chakraPrincipal);
    if (chakraMap) {
      maps.push(chakraMap);
      const elem = getElement(data.chakraPrincipal, 'chakra');
      if (elem) elements.push(elem);
    }
  }

  // Find dominant element
  const elementCounts: Record<string, number> = {};
  for (const elem of elements) {
    elementCounts[elem] = (elementCounts[elem] || 0) + 1;
  }
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Detect conflicts (opposing elements)
  const opposingPairs = [
    ['Fogo', 'Água'],
    ['Terra', 'Ar'],
  ];
  for (const [elem1, elem2] of opposingPairs) {
    if (elements.includes(elem1) && elements.includes(elem2)) {
      conflicts.push(`${elem1} e ${elem2} em tensão — requer integração`);
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (dominantElement) {
    recommendations.push(`Use elementos de ${dominantElement} para harmonização`);
  }
  if (conflicts.length > 0) {
    recommendations.push('Pratique respiração elemental para integrar tensões');
  }
  if (data.caminhoVida && [11, 22, 33].includes(data.caminhoVida)) {
    recommendations.push('Número MESTRE detectado — integre com prática espiritual regular');
  }

  return {
    success: maps.length > 0,
    maps,
    dominantElement,
    conflicts,
    recommendations,
  };
}

/**
 * Get the signature for a profile (compact representation)
 */
export function getSignature(data: {
  caminhoVida: number;
  signoSolar: string;
  orixaRegente: string;
}): string {
  const vida = [11, 22, 33].includes(data.caminhoVida)
    ? `${data.caminhoVida}M` // Master indicator
    : String(data.caminhoVida);
  const signo = data.signoSolar.substring(0, 3).toLowerCase();
  const orixa = data.orixaRegente.toLowerCase().substring(0, 3);
  return `${vida}-${signo}-${orixa}`;
}

/**
 * Get harmonization advice for conflicting elements
 */
export function getHarmonizationAdvice(element1: string, element2: string): string {
  const harmonizations: Record<string, Record<string, string>> = {
    'Fogo': { 'Água': 'Use signos de transição (Sagitário/Câncer) para mediar', 'Terra': 'Pratique respiração de fogo para aquecer', 'Ar': 'Integrar através de práticas intelectuais' },
    'Água': { 'Fogo': 'Use signos de transição (Câncer/Escorpiao) para mediar', 'Terra': 'Pratique em locais naturais perto de água', 'Ar': 'Integre através de meditação aquática' },
    'Terra': { 'Fogo': 'Use atividades práticas para aterrar energia', 'Água': 'Pratique em jardins ou perto de água', 'Ar': 'Combinar trabalho manual com estudo' },
    'Ar': { 'Fogo': 'Use comunicação para expressar ideias', 'Água': 'Integre com práticas de comunicação emocional', 'Terra': 'Combine estudos com trabalho prático' },
  };

  return harmonizations[element1]?.[element2] || 'Pratique equilíbrio através de meditação';
}

// Export element data for external use
export { ELEMENT_MAP };