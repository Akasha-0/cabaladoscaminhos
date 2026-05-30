/**
 * Numerology-Chakra Spiritual Correlation
 * Maps numerology numbers to their corresponding chakras, elements,
 * and spiritual meanings based on Cabala dos Caminhos hermetic principles.
 * 
 * This is the reverse mapping of chakra-numerology.ts - it provides
 * numerology-centric access to chakra correlations.
 */

import type { Elemento } from './chakra-element';
import type { ChakraName } from './chakra-numerology';

export type ChakraPosition = 
  | '1º - Raiz'
  | '2º - Sacral'
  | '3º - Plexo Solar'
  | '4º - Cardíaco'
  | '5º - Laríngeo'
  | '6º - Frontal'
  | '7º - Coronário';

/**
 * Numerology-Chakra spiritual correlation mapping
 */
export interface NumerologyChakra {
  /** Numerology number */
  numero: number;
  /** Associated chakra name */
  chakra: ChakraName;
  /** Chakra position description */
  chakra_posicao: ChakraPosition;
  /** Element connection */
  elemento: Elemento;
  /** Spiritual meaning */
  significado_espiritual: string;
}

/**
 * Number 1 - Muladhara (Root Chakra)
 * Element: Terra
 * The Foundation - Individual identity, willpower, new beginnings, grounding
 */
const NUMERO_1: NumerologyChakra = {
  numero: 1,
  chakra: 'Muladhara',
  chakra_posicao: '1º - Raiz',
  elemento: 'Terra',
  significado_espiritual: 'Início, liderança, individualidade, força de vontade, determinação, manifestação material, coragem de existir, identidade única',
};

/**
 * Number 2 - Svadhisthana (Sacral Chakra)
 * Element: Água
 * The Flow - Partnerships, duality, receptivity, balance, harmony
 */
const NUMERO_2: NumerologyChakra = {
  numero: 2,
  chakra: 'Svadhisthana',
  chakra_posicao: '2º - Sacral',
  elemento: 'Água',
  significado_espiritual: 'Parcerias, dualidade, receptividade, equilíbrio, harmonia, cooperação, Diplomacia, intuição emocional, sagrada feminilidade',
};

/**
 * Number 3 - Manipura (Solar Plexus Chakra)
 * Element: Fogo
 * The Power - Expression, creativity, manifestation, joy, communication
 */
const NUMERO_3: NumerologyChakra = {
  numero: 3,
  chakra: 'Manipura',
  chakra_posicao: '3º - Plexo Solar',
  elemento: 'Fogo',
  significado_espiritual: 'Expressão criativa, alegria, comunicação, expansão, otimismo, Sociabilidade, autoexpressão, magia criativa, entusiasmo',
};

/**
 * Number 4 - Manipura (Solar Plexus Chakra)
 * Element: Fogo
 * The Power - Stability, structure, foundation, discipline, order
 */
const NUMERO_4: NumerologyChakra = {
  numero: 4,
  chakra: 'Manipura',
  chakra_posicao: '3º - Plexo Solar',
  elemento: 'Fogo',
  significado_espiritual: 'Estrutura, organização, disciplina, trabalho árduo, fundamentos sólidos, responsabilidade, manifestação através da ação, estabilidade',
};

/**
 * Number 5 - Anahata (Heart Chakra)
 * Element: Ar
 * The Love - Freedom, change, adventure, expansion, versatility
 */
const NUMERO_5: NumerologyChakra = {
  numero: 5,
  chakra: 'Anahata',
  chakra_posicao: '4º - Cardíaco',
  elemento: 'Ar',
  significado_espiritual: 'Liberdade, mudança, aventura, expansão, versatilidade, curiosidade, aprendizado, experiência, abertura mental, transformação do coração',
};

/**
 * Number 6 - Anahata (Heart Chakra)
 * Element: Ar
 * The Love - Love, harmony, responsibility, nurturing, home
 */
const NUMERO_6: NumerologyChakra = {
  numero: 6,
  chakra: 'Anahata',
  chakra_posicao: '4º - Cardíaco',
  elemento: 'Ar',
  significado_espiritual: 'Amor, harmonia, responsabilidade, nutrição, lar, família, compaixão, serviço ao próximo, equilíbrio entre dar e receber, beleza',
};

/**
 * Number 7 - Ajna (Third Eye Chakra)
 * Element: Éter
 * The Vision - Reflection, analysis, wisdom, spirituality, inner knowing
 */
const NUMERO_7: NumerologyChakra = {
  numero: 7,
  chakra: 'Ajna',
  chakra_posicao: '6º - Frontal',
  elemento: 'Éter',
  significado_espiritual: 'Reflexão, análise, sabedoria interior, espiritualidade, conhecimento intuitivo, introspecção, busca interior, meditação, compreensão profunda',
};

/**
 * Number 8 - Vishuddha (Throat Chakra)
 * Element: Éter
 * The Voice - Power, authority, material success, manifestation
 */
const NUMERO_8: NumerologyChakra = {
  numero: 8,
  chakra: 'Vishuddha',
  chakra_posicao: '5º - Laríngeo',
  elemento: 'Éter',
  significado_espiritual: 'Poder, autoridade, sucesso material, manifesta ção, poder pessoal, karma, abundância, negocios, liderança financeira, verdadefalada',
};

/**
 * Number 9 - Sahasrara (Crown Chakra)
 * Element: Éter
 * The Crown - Completion, humanitarianism, wisdom, endings
 */
const NUMERO_9: NumerologyChakra = {
  numero: 9,
  chakra: 'Sahasrara',
  chakra_posicao: '7º - Coronário',
  elemento: 'Éter',
  significado_espiritual: 'Completude, humanitarismo, sabedoria, finais, iluminação, compaixão universal, encerramento de ciclos, maestria espiritual, amor incondicional',
};

/**
 * Number 10 - Muladhara (Root Chakra)
 * Element: Terra
 * The Foundation - Transformation, completion of cycle, new beginning after completion
 */
const NUMERO_10: NumerologyChakra = {
  numero: 10,
  chakra: 'Muladhara',
  chakra_posicao: '1º - Raiz',
  elemento: 'Terra',
  significado_espiritual: 'Reinício, transformação, fim de ciclo e novo começo, sabedoria prática, manifestação direta, completude e renascimento, experiência de vida',
};

/**
 * Number 11 - Ajna (Third Eye Chakra)
 * Element: Éter
 * The Vision - Channeling, spiritual gift, illumination, intuition amplified
 */
const NUMERO_11: NumerologyChakra = {
  numero: 11,
  chakra: 'Ajna',
  chakra_posicao: '6º - Frontal',
  elemento: 'Éter',
  significado_espiritual: 'Canalização, dom espiritual, iluminação, intuição amplificada, visão profética, sensibilidade energetica, missão espiritual, inspirado',
};

/**
 * Number 12 - Manipura (Solar Plexus Chakra)
 * Element: Fogo
 * The Power - Service through creativity, teamwork, enlightenment through sacrifice
 */
const NUMERO_12: NumerologyChakra = {
  numero: 12,
  chakra: 'Manipura',
  chakra_posicao: '3º - Plexo Solar',
  elemento: 'Fogo',
  significado_espiritual: 'Serviço através da criatividade, trabalho em equipe, iluminação através do sacrifício, transformação grupal, expressão artística coletiva',
};

/**
 * Number 13 - Sahasrara (Crown Chakra)
 * Element: Éter
 * The Crown - Transformation, rebirth, letting go of old patterns
 */
const NUMERO_13: NumerologyChakra = {
  numero: 13,
  chakra: 'Sahasrara',
  chakra_posicao: '7º - Coronário',
  elemento: 'Éter',
  significado_espiritual: 'Transformação profunda, renascimento, libertação de velhos padrões, morte e renascimento, encerramento kármico, sabedoria dos mestres',
};

/**
 * Complete lookup table for numerology numbers 1-13
 */
const NUMEROLOGIA_CHAKRA_MAP: Record<number, NumerologyChakra> = {
  1: NUMERO_1,
  2: NUMERO_2,
  3: NUMERO_3,
  4: NUMERO_4,
  5: NUMERO_5,
  6: NUMERO_6,
  7: NUMERO_7,
  8: NUMERO_8,
  9: NUMERO_9,
  10: NUMERO_10,
  11: NUMERO_11,
  12: NUMERO_12,
  13: NUMERO_13,
};

/**
 * Returns the numerology-chakra correlation for a given number.
 * @param numero - The numerology number to look up (1-13)
 * @returns NumerologyChakra object with chakra correlation
 * @throws Error if number is not recognized
 */
export function getNumerologyChakra(numero: number): NumerologyChakra {
  const result = NUMEROLOGIA_CHAKRA_MAP[numero];
  if (!result) {
    throw new Error(`Número ${numero} não reconhecido na correlação numerologia-chakra (use 1-13)`);
  }
  return result;
}

/**
 * Returns the chakra-numerology correlation for a given chakra name.
 * @param chakra - The chakra name to search for
 * @returns Array of NumerologyChakra objects associated with the chakra
 */
export function getChakraNumerology(chakra: string): NumerologyChakra[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return Object.values(NUMEROLOGIA_CHAKRA_MAP).filter(
    (mapping) => mapping.chakra === normalizedChakra
  );
}

/**
 * Returns all numerology-chakra mappings (1-13).
 * @returns Array of all NumerologyChakra objects
 */
export function getAllNumerologyChakras(): NumerologyChakra[] {
  return Object.values(NUMEROLOGIA_CHAKRA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): ChakraName {
  const normalized = chakra.toLowerCase().trim();
  
  const chakraMap: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    // Portuguese alternatives
    'raiz': 'Muladhara',
    'basic': 'Muladhara',
    'sacral': 'Svadhisthana',
    'sexual': 'Svadhisthana',
    'plexo': 'Manipura',
    'solar': 'Manipura',
    'cardiaco': 'Anahata',
    'coracao': 'Anahata',
    'laringeo': 'Vishuddha',
    'garganta': 'Vishuddha',
    'frontal': 'Ajna',
    'terceiro olho': 'Ajna',
    'third eye': 'Ajna',
    'coronario': 'Sahasrara',
    'coroa': 'Sahasrara',
    'crown': 'Sahasrara',
    // Position-based
    '1º': 'Muladhara',
    '1º chakra': 'Muladhara',
    '1': 'Muladhara',
    '2º': 'Svadhisthana',
    '2º chakra': 'Svadhisthana',
    '2': 'Svadhisthana',
    '3º': 'Manipura',
    '3º chakra': 'Manipura',
    '3': 'Manipura',
    '4º': 'Anahata',
    '4º chakra': 'Anahata',
    '4': 'Anahata',
    '5º': 'Vishuddha',
    '5º chakra': 'Vishuddha',
    '5': 'Vishuddha',
    '6º': 'Ajna',
    '6º chakra': 'Ajna',
    '6': 'Ajna',
    '7º': 'Sahasrara',
    '7º chakra': 'Sahasrara',
    '7': 'Sahasrara',
  };

  return chakraMap[normalized] || chakra.toLowerCase() as ChakraName;
}