/**
 * Zodiac-Element Spiritual Correlation Module
 * Maps zodiac signs to classical elements with chakra connections and spiritual meanings.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type SignoZodiac =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/**
 * Represents the correlation between a zodiac sign and its elemental nature
 */
export interface ZodiacElementMapping {
  signo: SignoZodiac;
  elemento: Elemento;
  /** Chakra most associated with this sign's energy */
  chakra: string;
  /** Portuguese name of the chakra */
  chakraPt: string;
  /** Core spiritual meaning of this sign-element combination */
  significado_espiritual: string;
}

/**
 * Complete mapping of the 12 zodiac signs to their classical element correspondences.
 * Based on ancient esoteric traditions integrated with the Cabala dos Caminhos system.
 * Each sign carries the archetypal energy of its element.
 */
export const ZODIAC_ELEMENT_MAP: Record<SignoZodiac, ZodiacElementMapping> = {
  /** Fogo - Transformação e Iniciativa */
  Áries: {
    signo: 'Áries',
    elemento: 'Fogo',
    chakra: 'Manipura',
    chakraPt: 'Chakra do Plexo Solar',
    significado_espiritual: 'Pioneirismo, coragem, ação direta, liderança espiritual, renovação da vontade',
  },
  /** Terra - Abundância e Persistência */
  Touro: {
    signo: 'Touro',
    elemento: 'Terra',
    chakra: 'Muladhara',
    chakraPt: 'Chakra Raiz',
    significado_espiritual: 'Estabilidade, prosperidade material e espiritual, sensualidade sagrada, conexão com a natureza',
  },
  /** Ar - Comunicação e Dualidade */
  Gémeos: {
    signo: 'Gémeos',
    elemento: 'Ar',
    chakra: 'Vishuddha',
    chakraPt: 'Chakra da Garganta',
    significado_espiritual: 'Versatilidade mental, comunicação, aprendizado dual, integração de opostos, expressividade',
  },
  /** Água - Intuição e Emocionalidade */
  Câncer: {
    signo: 'Câncer',
    elemento: 'Água',
    chakra: 'Anahata',
    chakraPt: 'Chakra Cardíaco',
    significado_espiritual: 'Nutrição emocional, proteção do lar interior, memória ancestral, compaixão profunda',
  },
  /** Fogo - Criatividade e Expressão */
  Leão: {
    signo: 'Leão',
    elemento: 'Fogo',
    chakra: 'Manipura',
    chakraPt: 'Chakra do Plexo Solar',
    significado_espiritual: 'Autoexpressão criativa, amor próprio, generosidade solar, liderança magnética, propósito de vida',
  },
  /** Terra - Serviço e Discernimento */
  Virgem: {
    signo: 'Virgem',
    elemento: 'Terra',
    chakra: 'Svadhisthana',
    chakraPt: 'Chakra Sacral',
    significado_espiritual: 'Discernimento analítico, serviço sagrado, purificação, saúde holística, perfeccionismo espiritual',
  },
  /** Ar - Harmonia e Relacionamento */
  Libra: {
    signo: 'Libra',
    elemento: 'Ar',
    chakra: 'Vishuddha',
    chakraPt: 'Chakra da Garganta',
    significado_espiritual: 'Equilíbrio relacional, justiça, parcerias, estética sagrada, diplomacia espiritual',
  },
  /** Água - Transformação e Poder */
  Escorpião: {
    signo: 'Escorpião',
    elemento: 'Água',
    chakra: 'Svadhisthana',
    chakraPt: 'Chakra Sacral',
    significado_espiritual: 'Regeneração profunda, mistério oculto, poder pessoal, investigação espiritual, transcendência emocional',
  },
  /** Fogo - Expansão e Sabedoria */
  Sagitário: {
    signo: 'Sagitário',
    elemento: 'Fogo',
    chakra: 'Ajna',
    chakraPt: 'Chakra do Terceiro Olho',
    significado_espiritual: 'Expansão da consciência, busca de verdade, otimismo filosofico, viajante espiritual, sabedoria universal',
  },
  /** Terra - Disciplina e Realização */
  Capricórnio: {
    signo: 'Capricórnio',
    elemento: 'Terra',
    chakra: 'Muladhara',
    chakraPt: 'Chakra Raiz',
    significado_espiritual: 'Ambição estruturada, autoridade espiritual, responsabilidade, realizações duradouras, disciplina interior',
  },
  /** Ar - Inovação e Humanitarismo */
  Aquário: {
    signo: 'Aquário',
    elemento: 'Ar',
    chakra: 'Ajna',
    chakraPt: 'Chakra do Terceiro Olho',
    significado_espiritual: 'Libertação mental, pensamento humanitário, inovação radical, uniqueness colectivo, servir a humanidade',
  },
  /** Água - União e Transcendência */
  Peixes: {
    signo: 'Peixes',
    elemento: 'Água',
    chakra: 'Sahasrara',
    chakraPt: 'Chakra Coronário',
    significado_espiritual: 'União com o divino, compaixão universal, dissolução do ego, intuição transcendente, mundo dos espíritos',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ZODIAC_ELEMENT_MAP);
Object.values(ZODIAC_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 12 zodiac signs
 */
export const TODOS_SIGNOS: readonly SignoZodiac[] = [
  'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const normalizado = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const mapa: Record<string, SignoZodiac> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'cancer': 'Câncer',
    'leao': 'Leão',
    'virgem': 'Virgem',
    'libra': 'Libra',
    'escorpiao': 'Escorpião',
    'sagitario': 'Sagitário',
    'capricornio': 'Capricórnio',
    'aquario': 'Aquário',
    'peixes': 'Peixes',
  };

  return mapa[normalizado] ?? null;
}

/**
 * Get the zodiac-element mapping for a given sign name.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns ZodiacElementMapping or null if not found
 */
export function getZodiacElement(signo: string): ZodiacElementMapping | null {
  const normalizado = normalizarSigno(signo);
  return normalizado ? ZODIAC_ELEMENT_MAP[normalizado] ?? null : null;
}

/**
 * Get the element for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Elemento or null if not found
 */
export function getElementFromSigno(signo: string): Elemento | null {
  return getZodiacElement(signo)?.elemento ?? null;
}

/**
 * Get the chakra for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Chakra identifier or null if not found
 */
export function getChakraFromSigno(signo: string): string | null {
  return getZodiacElement(signo)?.chakra ?? null;
}

/**
 * Get the spiritual meaning for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoFromSigno(signo: string): string | null {
  return getZodiacElement(signo)?.significado_espiritual ?? null;
}

/**
 * Get all zodiac signs associated with a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of ZodiacElementMapping
 */
export function getElementZodiac(elemento: string): ZodiacElementMapping[] {
  return Object.values(ZODIAC_ELEMENT_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all zodiac-element mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacElements(): ZodiacElementMapping[] {
  return Object.values(ZODIAC_ELEMENT_MAP);
}

/**
 * Get all signs mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of SignoZodiac
 */
export function getSignosByElement(elemento: string): SignoZodiac[] {
  return getElementZodiac(elemento).map((mapping) => mapping.signo);
}

/**
 * Get all zodiac signs used in the mapping.
 * @returns Array of unique sign names
 */
export function getAllSigns(): SignoZodiac[] {
  return Object.values(ZODIAC_ELEMENT_MAP).map((m) => m.signo);
}

export default {
  getZodiacElement,
  getElementZodiac,
  getAllZodiacElements,
  getElementFromSigno,
  getChakraFromSigno,
  getSignificadoFromSigno,
  getSignosByElement,
  getAllSigns,
  ZODIAC_ELEMENT_MAP,
  TODOS_SIGNOS,
};