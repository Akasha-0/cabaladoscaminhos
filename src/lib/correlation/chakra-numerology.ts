/**
 * Chakra-Numerology Spiritual Correlation
 * Maps the 7 main chakras to their corresponding numerology numbers, elements,
 * and spiritual meanings based on Cabala dos Caminhos hermetic principles.
 * 
 * This is the reverse mapping of numerology-chakra.ts - it provides
 * chakra-centric access to numerology correlations.
 */

import type { Elemento } from './chakra-element';

export type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

/**
 * Chakra-Numerology spiritual correlation mapping
 */
export interface ChakraNumerology {
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Chakra name in Sanskrit */
  chakra: ChakraName;
  /** Chakra position description */
  chakra_posicao: string;
  /** Associated numerology numbers */
  numeros: number[];
  /** Element connection */
  elemento: Elemento;
  /** Spiritual meaning */
  significado_espiritual: string;
}

/**
 * Muladhara (Root Chakra) - Number 1
 * Element: Terra
 * The Foundation - Grounding, survival, primal will, material manifestation
 */
const MULADHARA: ChakraNumerology = {
  chakra_numero: 1,
  chakra: 'Muladhara',
  chakra_posicao: '1º Chakra - Raiz',
  numeros: [1, 10],
  elemento: 'Terra',
  significado_espiritual: 'Conexão com a terra, força de vontade primal, identidade individual, sobrevivência, manifestação material, coragem de existir',
};

/**
 * Svadhisthana (Sacral Chakra) - Number 2
 * Element: Água
 * The Flow - Creativity, emotional fluidity, intimacy, partnerships, receptivity
 */
const SVADHISTHANA: ChakraNumerology = {
  chakra_numero: 2,
  chakra: 'Svadhisthana',
  chakra_posicao: '2º Chakra - Sacral',
  numeros: [2],
  elemento: 'Água',
  significado_espiritual: 'Criatividade, fluidez emocional, intimidade, parcerias, receptividade, adaptabilidade, placer e desejo sagrado',
};

/**
 * Manipura (Solar Plexus Chakra) - Numbers 3, 4
 * Element: Fogo
 * The Power - Personal will, transformation, discipline, self-esteem, digestive power
 */
const MANIPURA: ChakraNumerology = {
  chakra_numero: 3,
  chakra: 'Manipura',
  chakra_posicao: '3º Chakra - Plexo Solar',
  numeros: [3, 4, 12],
  elemento: 'Fogo',
  significado_espiritual: 'Poder pessoal, vontade interior, transformação, disciplina, autoexpressão, organização, justiça divina, fogo purificador',
};

/**
 * Anahata (Heart Chakra) - Numbers 5, 6
 * Element: Ar
 * The Love - Unconditional love, compassion, balance, healing, forgiveness
 */
const ANAHATA: ChakraNumerology = {
  chakra_numero: 4,
  chakra: 'Anahata',
  chakra_posicao: '4º Chakra - Cardíaco',
  numeros: [5, 6],
  elemento: 'Ar',
  significado_espiritual: 'Amor incondicional, compaixão, harmonia, perdão, expansão do coração, equilíbrio entre dar e receber, serviço ao próximo',
};

/**
 * Vishuddha (Throat Chakra) - Number 8
 * Element: Éter
 * The Voice - Authentic expression, truth, communication, manifestation through speech
 */
const VISHUDDHA: ChakraNumerology = {
  chakra_numero: 5,
  chakra: 'Vishuddha',
  chakra_posicao: '5º Chakra - Laríngeo',
  numeros: [8],
  elemento: 'Éter',
  significado_espiritual: 'Comunicação verdadeira, expressão autêntica, poder da palavra, verdade falada, ressonância vibrational, canalização verbal',
};

/**
 * Ajna (Third Eye Chakra) - Numbers 7, 11
 * Element: Éter
 * The Vision - Intuition, insight, wisdom, channeling, inner truth
 */
const AJNA: ChakraNumerology = {
  chakra_numero: 6,
  chakra: 'Ajna',
  chakra_posicao: '6º Chakra - Frontal',
  numeros: [7, 11],
  elemento: 'Éter',
  significado_espiritual: 'Intuição, visão clara, sabedoria interior, channeling espiritual, percepção além dos sentidos, insight divino, consciência desperta',
};

/**
 * Sahasrara (Crown Chakra) - Numbers 9, 13
 * Element: Éter
 * The Crown - Enlightenment, transcendence, divine connection, completion
 */
const SAHASRARA: ChakraNumerology = {
  chakra_numero: 7,
  chakra: 'Sahasrara',
  chakra_posicao: '7º Chakra - Coronário',
  numeros: [9, 13],
  elemento: 'Éter',
  significado_espiritual: 'Iluminação, transcendência, conexão divina, compaixão universal, encerramento de ciclos, sabedoria dos mestres, evolução da consciência',
};

/**
 * Complete lookup table for the 7 main chakras
 */
const CHAKRA_NUMEROLOGIA_MAP: Record<ChakraName, ChakraNumerology> = {
  'Muladhara': MULADHARA,
  'Svadhisthana': SVADHISTHANA,
  'Manipura': MANIPURA,
  'Anahata': ANAHATA,
  'Vishuddha': VISHUDDHA,
  'Ajna': AJNA,
  'Sahasrara': SAHASRARA,
};

/**
 * Returns the chakra-numerology correlation for a given chakra.
 * @param chakra - The chakra name to look up
 * @returns ChakraNumerology object with numerology correlation
 * @throws Error if chakra is not recognized
 */
export function getChakraNumerology(chakra: string): ChakraNumerology {
  const normalizedChakra = normalizeChakraName(chakra);
  const result = CHAKRA_NUMEROLOGIA_MAP[normalizedChakra as ChakraName];
  if (!result) {
    throw new Error(`Chakra não reconhecido: ${chakra}`);
  }
  return result;
}

/**
 * Returns all numerology numbers associated with a given chakra.
 * @param chakra - The chakra name to search for
 * @returns Array of numerology numbers associated with the chakra
 */
export function getNumerologyChakra(chakra: string): number[] {
  const mapping = getChakraNumerology(chakra);
  return mapping.numeros;
}

/**
 * Returns all chakra-numerology mappings (7 main chakras).
 * @returns Array of all ChakraNumerology objects
 */
export function getAllChakraNumerology(): ChakraNumerology[] {
  return Object.values(CHAKRA_NUMEROLOGIA_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    'raiz': 'Muladhara',
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    'sacral': 'Svadhisthana',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    'plexo solar': 'Manipura',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    'cardíaco': 'Anahata',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    'laríngeo': 'Vishuddha',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    'frontal': 'Ajna',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    'terceiro olho': 'Ajna',
    'coronário': 'Sahasrara',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
    'coroa': 'Sahasrara',
  };
  return chakraMap[chakra.toLowerCase()] ?? chakra;
}
