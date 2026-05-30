/**
 * Chakra-Sephirot Spiritual Correlation Mapping
 * Maps the 7 main chakras (Muladhara to Sahasrara) to the 10 Sephiroth of the Tree of Life
 * Based on traditional Kabbalistic and Tantric esoteric correspondences
 * 
 * The correlation bridges Hindu/Yogic chakra system with Jewish Kabbalistic Tree of Life,
 * connecting Eastern and Western mystical traditions through shared spiritual geometry.
 */

import type { ChakraName } from './chakra-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface ChakraSephirotMapping {
  /** The chakra name in Sanskrit */
  chakra: ChakraName;
  /** The chakra number (1-7) */
  chakra_numero: number;
  /** Portuguese name for the chakra */
  chakra_nome_portugues: string;
  /** The corresponding Sephirah on the Tree of Life */
  sephirah: string;
  /** The path number connecting these energies */
  numero_caminho: number;
  /** Primary element of this correlation */
  elemento: Elemento;
  /** Spiritual significance of this chakra-sephirot connection */
  energia_espiritual: string;
  /** Corresponding Hebrew letter for the path */
  letra_hebraica: string;
  /** Tarot card associated with this path (Major Arcana) */
  arcano: string;
}

// Complete mapping of the 7 main chakras to their Sephiroth correspondences
// Based on traditional Western esoteric mapping between Tantra and Kabbalah
const CHAKRA_SEPHIROT_MAP: Record<ChakraName, ChakraSephirotMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: 1,
    chakra_nome_portugues: '1º Básico',
    sephirah: 'Malkuth',
    numero_caminho: 32,
    elemento: 'Terra',
    energia_espiritual: 'Ancoramento Terreno / Manifestação Física / Sobrevivência / Funda o Reino',
    letra_hebraica: 'Mem (מ)',
    arcano: 'O Mundo',
  },

  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: 2,
    chakra_nome_portugues: '2º Sacro',
    sephirah: 'Yesod',
    numero_caminho: 28,
    elemento: 'Água',
    energia_espiritual: 'Fundação Subconsciente / Luna / Emoções Fluidas / Imaginação',
    letra_hebraica: 'Qoph (ק)',
    arcano: 'A Lua',
  },

  Manipura: {
    chakra: 'Manipura',
    chakra_numero: 3,
    chakra_nome_portugues: '3º Plexo Solar',
    sephirah: 'Netzach',
    numero_caminho: 23,
    elemento: 'Fogo',
    energia_espiritual: 'Vitória Emocional / Paixão / Amor Universal / Determinação',
    letra_hebraica: 'Nun (נ)',
    arcano: 'A Temperança',
  },

  Anahata: {
    chakra: 'Anahata',
    chakra_numero: 4,
    chakra_nome_portugues: '4º Cardíaco',
    sephirah: 'Tiphereth',
    numero_caminho: 15,
    elemento: 'Ar',
    energia_espiritual: 'Beleza Central / Harmonia / Sol / Propósito de Vida / Sacrifício',
    letra_hebraica: 'He (ה)',
    arcano: 'O Enforcado',
  },

  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: 5,
    chakra_nome_portugues: '5º Laríngeo',
    sephirah: 'Hod',
    numero_caminho: 19,
    elemento: 'Ar',
    energia_espiritual: 'Glória Intelectual / Comunicação / Mercúrio / Verdade e Estrutura',
    letra_hebraica: 'Vav (ו)',
    arcano: 'O Sol',
  },

  Ajna: {
    chakra: 'Ajna',
    chakra_numero: 6,
    chakra_nome_portugues: '6º Frontal',
    sephirah: 'Chesed',
    numero_caminho: 13,
    elemento: 'Éter',
    energia_espiritual: 'Misericórdia Divina / Expansão / Abundância / Júpiter / Sabedoria',
    letra_hebraica: 'Daleth (ד)',
    arcano: 'A Morte',
  },

  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: 7,
    chakra_nome_portugues: '7º Coronário',
    sephirah: 'Kether',
    numero_caminho: 1,
    elemento: 'Éter',
    energia_espiritual: 'Coroa Divina / Unidade Primordial / Aláà / Além da Forma',
    letra_hebraica: 'Aleph (א)',
    arcano: 'O Louco',
  },
};

/**
 * Get the Chakra-Sephirot correlation mapping
 * @param chakra - Name or number of the chakra (e.g., 'Muladhara', 'Sahasrara', '1º Básico', '7º Coronário', '1', '7')
 * @returns ChakraSephirotMapping or null if not found
 */
export function getChakraSephirot(chakra: string): ChakraSephirotMapping | null {
  const normalized = normalizeChakraName(chakra);
  return CHAKRA_SEPHIROT_MAP[normalized] ?? null;
}

/**
 * Get the reverse mapping: Sephirah to corresponding Chakra
 * @returns Record mapping each Sephirah name to its associated chakra
 */
export function getSephirotChakra(): Record<string, ChakraName> {
  const result: Record<string, ChakraName> = {};
  for (const mapping of Object.values(CHAKRA_SEPHIROT_MAP)) {
    result[mapping.sephirah] = mapping.chakra;
  }
  return result;
}

/**
 * Get all Chakra-Sephirot mappings
 * @returns Array of all ChakraSephirotMapping objects sorted by chakra number
 */
export function getAllChakraSephiroth(): ChakraSephirotMapping[] {
  return Object.values(CHAKRA_SEPHIROT_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Normalizes chakra name to match ChakraName type
 */
function normalizeChakraName(chakra: string): ChakraName {
  const mapping: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    '1º básico': 'Muladhara',
    '1º básico (root)': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2º sacral': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3º solar plexus': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4º heart': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5º throat': 'Vishuddha',
    '6º frontal': 'Ajna',
    '6º third eye': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7º crown': 'Sahasrara',
    '1': 'Muladhara',
    '2': 'Svadhisthana',
    '3': 'Manipura',
    '4': 'Anahata',
    '5': 'Vishuddha',
    '6': 'Ajna',
    '7': 'Sahasrara',
  };

  const lower = chakra.toLowerCase().trim();
  return mapping[lower] ?? (chakra as ChakraName);
}

export default {
  getChakraSephirot,
  getSephirotChakra,
  getAllChakraSephiroth,
};