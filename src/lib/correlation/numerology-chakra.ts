/**
 * Numerology-Chakra Spiritual Correlation
 * Maps numerology numbers 1-9 to their corresponding chakras, elements,
 * and spiritual meanings based on Cabala dos Caminhos hermetic principles.
 * 
 * This is the numerology-centric view of the chakra correlation system,
 * complementing chakra-numerology.ts which provides the reverse lookup.
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
 * Numerology-Chakra spiritual correlation mapping
 */
export interface NumerologyChakraMapping {
  /** The numerology number (1-9) */
  numero: number;
  /** Associated chakra in Sanskrit */
  chakra: ChakraName;
  /** Chakra position description */
  chakra_posicao: string;
  /** Element connection */
  elemento: Elemento;
  /** Chakra color in Portuguese */
  cor: string;
  /** Spiritual meaning */
  significado_espiritual: string;
  /** Associated sephirah */
  sephirah: string;
  /** Associated orixá */
  orixa: string;
  /** Quality of the energy */
  qualidade_energetica: string;
  /** Chakra affirmation for healing */
  afirmacao: string;
}

/**
 * Complete mapping of numerology numbers 1-9 to their chakra correspondences.
 * Derived from chakra-numerology.ts reverse mapping and numerology-element.ts data.
 */
export const NUMERO_CHAKRA_MAP: Record<number, NumerologyChakraMapping> = {
  1: {
    numero: 1,
    chakra: 'Muladhara',
    chakra_posicao: '1º Chakra - Raiz',
    elemento: 'Terra',
    cor: 'Vermelho',
    significado_espiritual: 'Força de vontade primal, identidade individual, sobrevivência, coragem de existir, manifestação material, conexão com a terra ancestral.',
    sephirah: 'Kether',
    orixa: 'Omolu',
    qualidade_energetica: 'Yang - Estável, fundamentadora, primária',
    afirmacao: 'Eu existo, eu sou, eu tenho o direito de estar aqui.',
  },
  2: {
    numero: 2,
    chakra: 'Svadhisthana',
    chakra_posicao: '2º Chakra - Sacral',
    elemento: 'Água',
    cor: 'Laranja',
    significado_espiritual: 'Criatividade, fluidez emocional, intimidade, parcerias, receptividade, adaptabilidade, prazer sagrado e desejo sagrado.',
    sephirah: 'Chokmah',
    orixa: 'Iemanjá',
    qualidade_energetica: 'Yin - Fluida, emocional, receptiva',
    afirmacao: 'Eu sinto, eu fluo, eu me adapto às correntes da vida.',
  },
  3: {
    numero: 3,
    chakra: 'Manipura',
    chakra_posicao: '3º Chakra - Plexo Solar',
    elemento: 'Fogo',
    cor: 'Amarelo',
    significado_espiritual: 'Poder pessoal, vontade interior, transformação, disciplina, autoexpressão criativa, fogo interior que move a ação.',
    sephirah: 'Binah',
    orixa: 'Ogum',
    qualidade_energetica: 'Yang - Dinâmica, transformadora, autodeterminada',
    afirmacao: 'Eu agejo, eu Transformo, eu manifesto minha vontade.',
  },
  4: {
    numero: 4,
    chakra: 'Manipura',
    chakra_posicao: '3º Chakra - Plexo Solar',
    elemento: 'Terra',
    cor: 'Amarelo',
    significado_espiritual: 'Estrutura, organização, estabilidade interior, trabalho perseverante, foundations sólidos que sustentam a evolução espiritual.',
    sephirah: 'Chesed',
    orixa: 'Iemanjá',
    qualidade_energetica: 'Yang - Estruturada, estável, trabalhadora',
    afirmacao: 'Eu construo, eu organizo, eu estableço alicerces firmes.',
  },
  5: {
    numero: 5,
    chakra: 'Anahata',
    chakra_posicao: '4º Chakra - Cardíaco',
    elemento: 'Ar',
    cor: 'Verde',
    significado_espiritual: 'Amor incondicional, compaixão, perdão, expansão do coração, equilíbrio entre dar e receber, serviço ao próximo.',
    sephirah: 'Geburah',
    orixa: 'Oxum',
    qualidade_energetica: 'Equilibrado - Harmonioso, amoroso, expansivo',
    afirmacao: 'Eu amo, eu perdoo, eu me abro ao amor universal.',
  },
  6: {
    numero: 6,
    chakra: 'Anahata',
    chakra_posicao: '4º Chakra - Cardíaco',
    elemento: 'Fogo',
    cor: 'Verde/Rosa',
    significado_espiritual: 'Amor harmonioso, equilíbrio coração-ação, responsabilidade afetiva, beleza interior, devoção ao sagrado.',
    sephirah: 'Tiphereth',
    orixa: 'Xangô',
    qualidade_energetica: 'Yang - Harmonioso, dedicado, Beau',
    afirmacao: 'Eu harmonizo, eu equilibro, eu escolho o amor em todas as situações.',
  },
  7: {
    numero: 7,
    chakra: 'Ajna',
    chakra_posicao: '6º Chakra - Frontal',
    elemento: 'Éter',
    cor: 'Índigo',
    significado_espiritual: 'Intuição, visão clara, sabedoria interior, channeling espiritual, percepção além dos sentidos, insight divino.',
    sephirah: 'Netzach',
    orixa: 'Iansã',
    qualidade_energetica: 'Neutro - Intuitivo, visionário, sábio',
    afirmacao: 'Eu vejo, eu sei, eu confio na minha sabedoria interior.',
  },
  8: {
    numero: 8,
    chakra: 'Vishuddha',
    chakra_posicao: '5º Chakra - Laríngeo',
    elemento: 'Éter',
    cor: 'Azul Claro',
    significado_espiritual: 'Comunicação verdadeira, expressão autêntica, poder da palavra, verdade falada, ressonância vibrational, channeling verbal.',
    sephirah: 'Hod',
    orixa: 'Oxalá',
    qualidade_energetica: 'Neutro - Comunicativo, verídico, ressonante',
    afirmacao: 'Eu falo a verdade, eu expresso minha autenticidade, minha voz tem poder.',
  },
  9: {
    numero: 9,
    chakra: 'Sahasrara',
    chakra_posicao: '7º Chakra - Coronário',
    elemento: 'Éter',
    cor: 'Violeta/Branco',
    significado_espiritual: 'Iluminação, transcendência, conexão divina, compaixão universal, encerramento de ciclos, sabedoria dos mestres.',
    sephirah: 'Yesod',
    orixa: 'Orunmilá',
    qualidade_energetica: 'Neutro - Iluminado, transcendente, universal',
    afirmacao: 'Eu me conecto ao divino, eu sou um com o universo, eu transmito sabedoria.',
  },
};

/**
 * Returns the chakra correlation for a given numerology number (1-9)
 * @param numero - The number to look up (must be 1-9)
 * @returns NumerologyChakraMapping object with chakra correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyChakra(numero: number): NumerologyChakraMapping {
  if (!Number.isInteger(numero) || numero < 1 || numero > 9) {
    throw new Error(`Número fora do intervalo válido (1-9). Recebido: ${numero}`);
  }
  return NUMERO_CHAKRA_MAP[numero];
}

/**
 * Get all numerology chakra mappings
 * @returns Array of all NumerologyChakraMapping objects for numbers 1-9
 */
export function getAllNumerologyChakras(): NumerologyChakraMapping[] {
  return Object.values(NUMERO_CHAKRA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Returns all numbers associated with a given chakra
 * @param chakra - Chakra name (Sanskrit or position description)
 * @returns Array of NumerologyChakraMapping objects for the chakra
 */
export function getChakraNumerology(chakra: string): NumerologyChakraMapping[] {
  const normalizedChakra = normalizeChakraName(chakra);
  
  return getAllNumerologyChakras().filter(
    (m) => m.chakra.toLowerCase() === normalizedChakra.toLowerCase()
  );
}

/**
 * Returns the chakra name for a given number
 * @param numero - The number to look up (1-9)
 * @returns ChakraName string or null if invalid
 */
export function getChakraByNumero(numero: number): ChakraName | null {
  if (numero < 1 || numero > 9) return null;
  return NUMERO_CHAKRA_MAP[numero].chakra;
}

/**
 * Returns the element for a given number
 * @param numero - The number to look up (1-9)
 * @returns Elemento string or null if invalid
 */
export function getElementByNumero(numero: number): Elemento | null {
  if (numero < 1 || numero > 9) return null;
  return NUMERO_CHAKRA_MAP[numero].elemento;
}

/**
 * Returns the chakra position for a given number
 * @param numero - The number to look up (1-9)
 * @returns Chakra position string or null if invalid
 */
export function getChakraPosicaoByNumero(numero: number): string | null {
  if (numero < 1 || numero > 9) return null;
  return NUMERO_CHAKRA_MAP[numero].chakra_posicao;
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
