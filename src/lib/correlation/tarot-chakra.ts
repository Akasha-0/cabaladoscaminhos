/**
 * Tarot-Chakra Spiritual Correlation Mapping
 * Maps the 7 main chakras to Tarot Major Arcana cards and elemental correspondences
 * Based on traditional Western esoteric correspondences
 * 
 * The correlation bridges Hindu/Yogic chakra system with Tarot,
 * connecting Eastern and Western mystical traditions through shared spiritual geometry.
 */

import type { ChakraName } from './chakra-element';
import type { OrixaElement } from './orixa-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents a chakra-tarot correlation mapping
 */
export interface TarotChakraMapping {
  /** The chakra name in Sanskrit */
  chakra: ChakraName;
  /** The chakra number (1-7) */
  chakra_numero: number;
  /** Portuguese name for the chakra */
  chakra_nome_portugues: string;
  /** Corresponding Major Arcana card */
  arcano: string;
  /** Card number in the Major Arcana */
  arcano_numero: number;
  /** Primary element of this correlation */
  elemento: Elemento;
  /** Spiritual significance of this chakra-arcano connection */
  energia_espiritual: string;
  /** The orixá associated with this energy */
  orixa: string;
  /** Symbolic keywords for meditation */
  keywords: string[];
}

/**
 * Complete mapping of the 7 main chakras to their Tarot correspondences
 * Based on traditional Western esoteric mapping between Tantra and Tarot
 * Correlations derived from the Cabala dos Caminhos framework
 */
const TAROT_CHAKRA_MAP: Record<ChakraName, TarotChakraMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: 1,
    chakra_nome_portugues: '1º Básico',
    arcano: 'O Mundo',
    arcano_numero: 21,
    elemento: 'Terra',
    energia_espiritual: 'Manifestação Terrena / Realização / Fulgor / Conexão com o Ser',
    orixa: 'Oxalá',
    keywords: ['realização', 'trabalho', 'estabilidade', 'abundância', 'coragem'],
  },

  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: 2,
    chakra_nome_portugues: '2º Sacro',
    arcano: 'A Lua',
    arcano_numero: 18,
    elemento: 'Água',
    energia_espiritual: 'Inconsciente / Imaginação / Fluidez Emocional / Intuição Profunda',
    orixa: 'Iemanjá',
    keywords: ['emoção', 'criatividade', 'sensualidade', 'fluidez', 'sonhos'],
  },

  Manipura: {
    chakra: 'Manipura',
    chakra_numero: 3,
    chakra_nome_portugues: '3º Plexo Solar',
    arcano: 'O Sol',
    arcano_numero: 19,
    elemento: 'Fogo',
    energia_espiritual: 'Iluminação Interior / Clareza / Poder Pessoal / Vitalidade Solar',
    orixa: 'Xangô',
    keywords: ['confiança', 'sucesso', 'liderança', 'vitalidade', 'clareza'],
  },

  Anahata: {
    chakra: 'Anahata',
    chakra_numero: 4,
    chakra_nome_portugues: '4º Cardíaco',
    arcano: 'A Estrela',
    arcano_numero: 17,
    elemento: 'Ar',
    energia_espiritual: 'Esperança / Bondade / Renovação / Amor Incondicional / Harmonia',
    orixa: 'Oxum',
    keywords: ['amor', 'compaixão', 'perdon', 'harmonia', 'equilíbrio'],
  },

  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: 5,
    chakra_nome_portugues: '5º Laríngeo',
    arcano: 'O Mago',
    arcano_numero: 1,
    elemento: 'Éter',
    energia_espiritual: 'Comunicação / Manifestação / Poder da Vontade / Expressão Criativa',
    orixa: 'Ogum',
    keywords: ['comunicação', 'expressão', 'vontade', 'criatividade', 'ação'],
  },

  Ajna: {
    chakra: 'Ajna',
    chakra_numero: 6,
    chakra_nome_portugues: '6º Terceiro Olho',
    arcano: 'O Louco',
    arcano_numero: 0,
    elemento: 'Ar',
    energia_espiritual: 'Intuição / Libertação / Espontaneidade / Transcendência / Loucura Sagrada',
    orixa: 'Oxóssi',
    keywords: ['intuição', 'liberdade', 'aventura', 'insight', 'transição'],
  },

  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: 7,
    chakra_nome_portugues: '7º Coronário',
    arcano: 'O Welt',
    arcano_numero: 21,
    elemento: 'Éter',
    energia_espiritual: 'Iluminação / Transcendência / Unicidade / Infinitude / Paz Absoluta',
    orixa: 'Nanã',
    keywords: ['unidade', 'sabedoria', 'iluminação', 'paz', 'libertação'],
  },
};

/**
 * Get the Tarot-Chakra correlation mapping
 * @param chakra - Name or number of the chakra (e.g., 'Muladhara', 'Sahasrara', '1º Básico', '7º Coronário', '1', '7')
 * @returns TarotChakraMapping or null if not found
 */
export function getTarotChakra(chakra: string): TarotChakraMapping | null {
  const normalized = normalizeChakraName(chakra);
  if (normalized) {
    return TAROT_CHAKRA_MAP[normalized] || null;
  }
  return null;
}

/**
 * Get the reverse mapping: Tarot card to corresponding Chakra
 * @param arcano - The Major Arcana card name (e.g., 'O Mundo', 'A Lua')
 * @returns ChakraName or null if not found
 */
export function getChakraTarot(arcano: string): ChakraName | null {
  const normalizedArcano = normalizeArcanoName(arcano);
  for (const [chakraName, mapping] of Object.entries(TAROT_CHAKRA_MAP)) {
    if (mapping.arcano.toLowerCase() === normalizedArcano.toLowerCase()) {
      return chakraName as ChakraName;
    }
  }
  return null;
}

/**
 * Get all Tarot-Chakra mappings
 * @returns Array of all TarotChakraMapping objects sorted by chakra number
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Get all Chakra names in the mapping
 * @returns Array of ChakraName values
 */
export function getAllChakraNames(): ChakraName[] {
  return Object.keys(TAROT_CHAKRA_MAP) as ChakraName[];
}

/**
 * Get all Tarot Major Arcana card names in the mapping
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_CHAKRA_MAP).map((m) => m.arcano);
}

/**
 * Get the chakra corresponding to a Tarot card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns ChakraName or null if not found
 */
export function getChakraByNumber(numero: number): ChakraName | null {
  for (const [chakraName, mapping] of Object.entries(TAROT_CHAKRA_MAP)) {
    if (mapping.arcano_numero === numero) {
      return chakraName as ChakraName;
    }
  }
  return null;
}

/**
 * Get the Tarot card number by chakra name
 * @param chakra - The chakra name
 * @returns The arcano number or null if not found
 */
export function getArcanoNumberByChakra(chakra: string): number | null {
  const mapping = getTarotChakra(chakra);
  return mapping ? mapping.arcano_numero : null;
}

/**
 * Get chakras by element
 * @param elemento - The element to filter by (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of TarotChakraMapping objects with the given element
 */
export function getChakrasByElement(elemento: string): TarotChakraMapping[] {
  const normalizedElemento = normalizeElementName(elemento);
  return Object.values(TAROT_CHAKRA_MAP).filter(
    (m) => m.elemento.toLowerCase() === normalizedElemento.toLowerCase()
  );
}

/**
 * Get the element associated with a chakra
 * @param chakra - The chakra name or number
 * @returns The element or null if not found
 */
export function getChakraElement(chakra: string): Elemento | null {
  const mapping = getTarotChakra(chakra);
  return mapping ? mapping.elemento : null;
}

/**
 * Get the orixá associated with a chakra
 * @param chakra - The chakra name or number
 * @returns The orixá name or null if not found
 */
export function getChakraOrixa(chakra: string): string | null {
  const mapping = getTarotChakra(chakra);
  return mapping ? mapping.orixa : null;
}

/**
 * Get the arcano associated with a chakra
 * @param chakra - The chakra name or number
 * @returns The arcano name or null if not found
 */
export function getChakraArcano(chakra: string): string | null {
  const mapping = getTarotChakra(chakra);
  return mapping ? mapping.arcano : null;
}

/**
 * Get keywords for a chakra
 * @param chakra - The chakra name or number
 * @returns Array of keywords or null if not found
 */
export function getChakraKeywords(chakra: string): string[] | null {
  const mapping = getTarotChakra(chakra);
  return mapping ? mapping.keywords : null;
}

/**
 * Check if a chakra exists in the mapping
 * @param chakra - The chakra name to check
 * @returns True if chakra exists in mapping
 */
export function hasChakraTarot(chakra: string): boolean {
  return getTarotChakra(chakra) !== null;
}

/**
 * Check if a Tarot card exists in the mapping
 * @param arcano - The arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasArcanoChakra(arcano: string): boolean {
  return getChakraTarot(arcano) !== null;
}

/**
 * Normalizes chakra name to match ChakraName type
 */
function normalizeChakraName(chakra: string): ChakraName | null {
  const normalized = chakra.trim().toLowerCase();

  // Direct match
  const directMap: Record<string, ChakraName> = {
    muladhara: 'Muladhara',
    svadhisthana: 'Svadhisthana',
    manipura: 'Manipura',
    anahata: 'Anahata',
    vishuddha: 'Vishuddha',
    ajna: 'Ajna',
    sahasrara: 'Sahasrara',
  };

  if (directMap[normalized]) {
    return directMap[normalized];
  }

  // Portuguese names and numbered format
  const nameMap: Record<string, ChakraName> = {
    '1º básico': 'Muladhara',
    '1ºbasico': 'Muladhara',
    'basico': 'Muladhara',
    'basic': 'Muladhara',
    'root': 'Muladhara',
    'raiz': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2ºsacro': 'Svadhisthana',
    'sacro': 'Svadhisthana',
    'sacral': 'Svadhisthana',
    'sexual': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3ºplexo solar': 'Manipura',
    'plexo': 'Manipura',
    'solar': 'Manipura',
    'solar plexus': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4ºcardíaco': 'Anahata',
    'cardíaco': 'Anahata',
    'cardiaco': 'Anahata',
    'coração': 'Anahata',
    'coracao': 'Anahata',
    'heart': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5ºlaríngeo': 'Vishuddha',
    'laríngeo': 'Vishuddha',
    'laringeo': 'Vishuddha',
    'garganta': 'Vishuddha',
    'throat': 'Vishuddha',
    '6º terceiro olho': 'Ajna',
    '6ºterceiro olho': 'Ajna',
    'terceiro olho': 'Ajna',
    'terceiroolho': 'Ajna',
    'ajna': 'Ajna',
    'third eye': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7ºcoronário': 'Sahasrara',
    'coronário': 'Sahasrara',
    'coronario': 'Sahasrara',
    'coroa': 'Sahasrara',
    'crown': 'Sahasrara',
  };

  if (nameMap[normalized]) {
    return nameMap[normalized];
  }

  // Number format (1-7)
  const numberMap: Record<string, ChakraName> = {
    '1': 'Muladhara',
    '2': 'Svadhisthana',
    '3': 'Manipura',
    '4': 'Anahata',
    '5': 'Vishuddha',
    '6': 'Ajna',
    '7': 'Sahasrara',
    '01': 'Muladhara',
    '02': 'Svadhisthana',
    '03': 'Manipura',
    '04': 'Anahata',
    '05': 'Vishuddha',
    '06': 'Ajna',
    '07': 'Sahasrara',
  };

  return numberMap[normalized] || null;
}

/**
 * Normalizes arcano name to match internal format
 */
function normalizeArcanoName(arcano: string): string {
  return arcano.trim();
}

/**
 * Normalizes element name to match Elemento type
 */
function normalizeElementName(elemento: string): string {
  const normalized = elemento.trim().toLowerCase();

  const elementMap: Record<string, string> = {
    fogo: 'Fogo',
    fire: 'Fogo',
    'água': 'Água',
    agua: 'Água',
    water: 'Água',
    ar: 'Ar',
    air: 'Ar',
    terra: 'Terra',
    earth: 'Terra',
    éter: 'Éter',
    ether: 'Éter',
    quinta: 'Éter',
  };

  return elementMap[normalized] || elemento;
}

/**
 * Get the count of mapped chakras
 * @returns Number of chakra-arcano mappings
 */
export function getChakraCount(): number {
  return Object.keys(TAROT_CHAKRA_MAP).length;
}

/**
 * Get the count of unique arcanos
 * @returns Number of unique arcano cards
 */
export function getArcanoCount(): number {
  const uniqueArcanos = new Set(Object.values(TAROT_CHAKRA_MAP).map((m) => m.arcano));
  return uniqueArcanos.size;
}

export default {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllChakraNames,
  getAllArcanos,
  getChakraByNumber,
  getArcanoNumberByChakra,
  getChakrasByElement,
  getChakraElement,
  getChakraOrixa,
  getChakraArcano,
  getChakraKeywords,
  hasChakraTarot,
  hasArcanoChakra,
  getChakraCount,
  getArcanoCount,
};