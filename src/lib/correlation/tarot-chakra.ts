/**
 * Tarot-Chakra Spiritual Correlation Mapping
 * Maps Tarot Major Arcana cards to the 7 main chakras
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * 
 * This is the reverse mapping of chakra-tarot.ts, focusing on Tarot as the primary lookup.
 */

import type { ChakraName } from './chakra-element';

/**
 * Represents the correlation between a Tarot Major Arcana card and its chakra
 */
export interface TarotChakraMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** The corresponding chakra name in Sanskrit */
  chakra: ChakraName;
  /** The chakra number (1-7) */
  numero_chakra: number;
  /** Portuguese name for the chakra */
  nome_chakra_portugues: string;
  /** Primary element of this correlation */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Spiritual significance of this arcano-chakra connection */
  energia_espiritual: string;
  /** The orixá associated with this energy */
  orixa: string;
  /** Symbolic keywords for meditation */
  keywords: string[];
}

// ─── Tarot Major Arcana-to-Chakra Mapping ─────────────────────────────────────
// Based on the Cabala dos Caminhos framework from IDEIA.md
// Maps each Major Arcana card to its corresponding chakra energy

export const TAROT_CHAKRA_MAPPINGS: Record<string, TarotChakraMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    chakra: 'Ajna',
    numero_chakra: 6,
    nome_chakra_portugues: '6º Terceiro Olho',
    elemento: 'Ar',
    energia_espiritual: 'Início da jornada / Libertação / salto de fé / Intuição pura',
    orixa: 'Oxóssi',
    keywords: ['liberdade', 'início', 'intuição', 'aventura', 'espontaneidade'],
  },

  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    chakra: 'Vishuddha',
    numero_chakra: 5,
    nome_chakra_portugues: '5º Laríngeo',
    elemento: 'Éter',
    energia_espiritual: 'Manifestação da vontade / Comunicação criativa / Poder pessoal',
    orixa: 'Ogum',
    keywords: ['vontade', 'comunicação', 'habilidade', 'inteligência', 'ação'],
  },

  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    chakra: 'Ajna',
    numero_chakra: 6,
    nome_chakra_portugues: '6º Terceiro Olho',
    elemento: 'Ar',
    energia_espiritual: 'Sabedoria oculta / Intuição profunda / Mistérios do inconsciente',
    orixa: 'Nanã',
    keywords: ['intuição', 'mistério', 'sabedoria', 'feminino sagrado', 'lua'],
  },

  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    chakra: 'Anahata',
    numero_chakra: 4,
    nome_chakra_portugues: '4º Cardíaco',
    elemento: 'Ar',
    energia_espiritual: 'Fertilidade criativa / Amor nutridor / Abundância natural',
    orixa: 'Oxum',
    keywords: ['amor', 'fertilidade', 'criação', 'natureza', 'nurtrição'],
  },

  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    chakra: 'Manipura',
    numero_chakra: 3,
    nome_chakra_portugues: '3º Plexo Solar',
    elemento: 'Fogo',
    energia_espiritual: 'Autoridade / Estrutura / Disciplina / Força de vontade',
    orixa: 'Xangô',
    keywords: ['autoridade', 'liderança', 'estrutura', 'disciplina', 'justiça'],
  },

  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    chakra: 'Vishuddha',
    numero_chakra: 5,
    nome_chakra_portugues: '5º Laríngeo',
    elemento: 'Ar',
    energia_espiritual: 'Tradição espiritual / Enseñanzas / Sabedoria convencional',
    orixa: 'Oxalá',
    keywords: ['tradição', 'ensino', 'espiritualidade', 'ética', 'ritual'],
  },

  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    chakra: 'Anahata',
    numero_chakra: 4,
    nome_chakra_portugues: '4º Cardíaco',
    elemento: 'Ar',
    energia_espiritual: 'União / Escolha amorosa / Harmonia nas relações',
    orixa: 'Oxum',
    keywords: ['amor', 'união', 'escolha', 'relação', 'harmonia'],
  },

  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    chakra: 'Manipura',
    numero_chakra: 3,
    nome_chakra_portugues: '3º Plexo Solar',
    elemento: 'Fogo',
    energia_espiritual: 'Vitória / Determinação / Conquista de objetivos',
    orixa: 'Ogum',
    keywords: ['vitória', 'determinação', 'conquista', 'controle', 'força'],
  },

  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    chakra: 'Svadhisthana',
    numero_chakra: 2,
    nome_chakra_portugues: '2º Sacro',
    elemento: 'Água',
    energia_espiritual: 'Equilíbrio kármico / Decisões corretas / Lei universal',
    orixa: 'Xangô',
    keywords: ['justiça', 'equilíbrio', 'verdade', 'lei', 'conseqüência'],
  },

  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    chakra: 'Ajna',
    numero_chakra: 6,
    nome_chakra_portugues: '6º Terceiro Olho',
    elemento: 'Terra',
    energia_espiritual: 'Iluminação interior / Busca da verdade / Solidão sagrada',
    orixa: 'Oxalá',
    keywords: ['iluminação', 'busca interior', 'sabedoria', 'solitário', 'verdade'],
  },

  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    chakra: 'Manipura',
    numero_chakra: 3,
    nome_chakra_portugues: '3º Plexo Solar',
    elemento: 'Fogo',
    energia_espiritual: 'Ciclos do destino / Sorte / Mudanças energéticas',
    orixa: 'Oxóssi',
    keywords: ['destino', 'ciclos', 'mudança', 'sorte', 'energia'],
  },

  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    chakra: 'Anahata',
    numero_chakra: 4,
    nome_chakra_portugues: '4º Cardíaco',
    elemento: 'Ar',
    energia_espiritual: 'Coragem interior / Sabedoria do coração / Triunfo suave',
    orixa: 'Iemanjá',
    keywords: ['coragem', 'força interior', 'compaixão', 'poder suave', 'equilíbrio'],
  },

  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    chakra: 'Sahasrara',
    numero_chakra: 7,
    nome_chakra_portugues: '7º Coronário',
    elemento: 'Éter',
    energia_espiritual: 'Sacrifício / Nova perspectiva / Entrega ao divino',
    orixa: 'Nanã',
    keywords: ['sacrifício', 'nova visão', 'entrega', 'renúncia', 'transição'],
  },

  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    chakra: 'Svadhisthana',
    numero_chakra: 2,
    nome_chakra_portugues: '2º Sacro',
    elemento: 'Água',
    energia_espiritual: 'Transformação / Fim de ciclo / Renovação total',
    orixa: 'Iansã',
    keywords: ['transformação', 'renovação', 'morte e renascimento', 'transição', 'mudança'],
  },

  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    chakra: 'Svadhisthana',
    numero_chakra: 2,
    nome_chakra_portugues: '2º Sacro',
    elemento: 'Água',
    energia_espiritual: 'Equilíbrio emocional / Paciência / Integração de opostos',
    orixa: 'Oxum',
    keywords: ['equilíbrio', 'paciência', 'integração', 'moderación', 'harmonia'],
  },

  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    chakra: 'Muladhara',
    numero_chakra: 1,
    nome_chakra_portugues: '1º Básico',
    elemento: 'Terra',
    energia_espiritual: 'Ilusão material / Apego / Provação terrena',
    orixa: 'Omolu',
    keywords: ['ilusão', 'apego', 'provação', 'materialismo', 'encarceramento'],
  },

  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    chakra: 'Manipura',
    numero_chakra: 3,
    nome_chakra_portugues: '3º Plexo Solar',
    elemento: 'Fogo',
    energia_espiritual: 'Destruição criativa / Revelação súbita / Queda dos ídolos',
    orixa: 'Xangô',
    keywords: ['revelação', 'destruição', 'mudança súbita', 'libertação', 'desconstrução'],
  },

  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    chakra: 'Anahata',
    numero_chakra: 4,
    nome_chakra_portugues: '4º Cardíaco',
    elemento: 'Ar',
    energia_espiritual: 'Esperança / Renovação / Paz interior / Guía celestial',
    orixa: 'Oxum',
    keywords: ['esperança', 'renovação', 'paz', 'guia', 'inspiração'],
  },

  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    chakra: 'Svadhisthana',
    numero_chakra: 2,
    nome_chakra_portugues: '2º Sacro',
    elemento: 'Água',
    energia_espiritual: 'Inconsciente / Sonhos / Intuição emocional / Ilusão',
    orixa: 'Iemanjá',
    keywords: ['inconsciente', 'sonhos', 'intuição', 'ilusão', 'noite'],
  },

  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    chakra: 'Manipura',
    numero_chakra: 3,
    nome_chakra_portugues: '3º Plexo Solar',
    elemento: 'Fogo',
    energia_espiritual: 'Iluminação / Alegria / Vitalidade / Sucessomanifestado',
    orixa: 'Xangô',
    keywords: ['iluminação', 'alegria', 'vitalidade', 'sucesso', 'luz'],
  },

  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    chakra: 'Sahasrara',
    numero_chakra: 7,
    nome_chakra_portugues: '7º Coronário',
    elemento: 'Fogo',
    energia_espiritual: 'Renascimento / Evaluación final / Llamada divina',
    orixa: 'Iansã',
    keywords: ['renascimento', 'avaliação', 'chamada', 'transformação', 'ascensão'],
  },

  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    chakra: 'Muladhara',
    numero_chakra: 1,
    nome_chakra_portugues: '1º Básico',
    elemento: 'Terra',
    energia_espiritual: 'Realização / Completude / Fulgor terreno / Harmonia com a Terra',
    orixa: 'Oxalá',
    keywords: ['realização', 'completude', 'fulgor', 'harmonia', 'êxito'],
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_CHAKRA_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_CHAKRA_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-Chakra correlation mapping
 * @param arcano - The Major Arcana card name (e.g., 'O Louco', 'A Lua', 'O Sol')
 * @returns The correlation mapping or null if not found
 */
export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  const normalized = normalizeArcanoName(arcano);
  return TAROT_CHAKRA_MAPPINGS[normalized] ?? null;
}

/**
 * Get the Tarot card corresponding to a chakra
 * @param chakra - Chakra name (e.g., 'Muladhara', 'Ajna', 'Sahasrara', '1º Básico', '6º Terceiro Olho')
 * @returns The arcano name or null if not found
 */
export function getChakraTarot(chakra: string): string | null {
  const normalized = normalizeChakraName(chakra);
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (mapping.chakra === normalized || mapping.nome_chakra_portugues === normalized) {
      return mapping.arcano;
    }
  }
  // Try to find by number
  const match = normalized.match(/^(\d+)º?\s*/);
  if (match) {
    const num = parseInt(match[1], 10);
    for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
      if (mapping.numero_chakra === num) {
        return mapping.arcano;
      }
    }
  }
  return null;
}

/**
 * Get all available Tarot-Chakra mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all Major Arcana card names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_CHAKRA_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotChakra(arcano: string): boolean {
  const normalized = normalizeArcanoName(arcano);
  return normalized in TAROT_CHAKRA_MAPPINGS;
}

/**
 * Get chakra by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The chakra name or null if not found
 */
export function getChakraByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.chakra;
    }
  }
  return null;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all arcano names sorted by number
 * @returns Array of arcano names sorted by card number
 */
export function getArcanosByNumber(): string[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map(m => m.arcano);
}

/**
 * Get the orixá associated with an arcano
 * @param arcano - The arcano name
 * @returns The orixá name or null if not found
 */
export function getOrixaByArcano(arcano: string): string | null {
  const mapping = getTarotChakra(arcano);
  return mapping?.orixa ?? null;
}

/**
 * Get all arcano names associated with an orixá
 * @param orixa - The orixá name (case-insensitive)
 * @returns Array of arcano names
 */
export function getArcanosByOrixa(orixa: string): string[] {
  const normalized = orixa.trim().toLowerCase();
  return Object.values(TAROT_CHAKRA_MAPPINGS)
    .filter(m => m.orixa.toLowerCase() === normalized)
    .map(m => m.arcano);
}

/**
 * Get the element associated with an arcano
 * @param arcano - The arcano name
 * @returns The element or null if not found
 */
export function getElementByArcano(arcano: string): string | null {
  const mapping = getTarotChakra(arcano);
  return mapping?.elemento ?? null;
}

/**
 * Get all arcano names by element
 * @param elemento - The element (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of arcano names
 */
export function getArcanosByElement(elemento: string): string[] {
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
  };
  const targetElement = elementMap[normalized] || elemento;
  
  return Object.values(TAROT_CHAKRA_MAPPINGS)
    .filter(m => m.elemento === targetElement)
    .map(m => m.arcano);
}

/**
 * Get the number of mapped arcano cards
 * @returns Total count of arcano mappings
 */
export function getArcanoCount(): number {
  return Object.keys(TAROT_CHAKRA_MAPPINGS).length;
}

/**
 * Normalizes arcano name to match TAROT_CHAKRA_MAPPINGS keys
 */
function normalizeArcanoName(arcano: string): string {
  const trimmed = arcano.trim();
  
  // Direct match
  if (trimmed in TAROT_CHAKRA_MAPPINGS) {
    return trimmed;
  }
  
  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(TAROT_CHAKRA_MAPPINGS)) {
    if (key.toLowerCase() === lower) {
      return key;
    }
  }
  
  return trimmed;
}

/**
 * Normalizes chakra name to match ChakraName type
 */
function normalizeChakraName(chakra: string): string {
  const normalized = chakra.trim().toLowerCase();

  const directMap: Record<string, string> = {
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

  const nameMap: Record<string, string> = {
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
    '6º frontal': 'Ajna',
    'frontal': 'Ajna',
    'third eye': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7ºcoronário': 'Sahasrara',
    'coronário': 'Sahasrara',
    'coronario': 'Sahasrara',
    'coroa': 'Sahasrara',
    'crown': 'Sahasrara',
  };

  return nameMap[normalized] || chakra;
}

export default {
  getTarotChakra,
  getChakraTarot,
  getAllTarotChakras,
  getAllArcanos,
  hasTarotChakra,
  getChakraByNumber,
  getArcanoByNumber,
  getArcanosByNumber,
  getOrixaByArcano,
  getArcanosByOrixa,
  getElementByArcano,
  getArcanosByElement,
  getArcanoCount,
  TAROT_CHAKRA_MAPPINGS,
};