/**
 * Orixá-Chakra Spiritual Correlation Module
 * Maps Orixás to their primary and secondary chakra influences
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

import type { ChakraName } from './chakra-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface OrixaChakraMapping {
  orixa: string;
  chakra_primario: ChakraName;
  chakra_secundario: ChakraName | null;
  elemento_alinhamento: Elemento;
  praticas_espirituais: {
    tipo: string;
    descricao: string;
    mantras: string[];
    erivas: string[];
  };
}

// Complete mapping of Orixás to their chakra correspondences
// Based on IDEIA.md spiritual framework
const ORIXA_CHAKRA_MAP: Record<string, OrixaChakraMapping> = {
  'Oxalá': {
    orixa: 'Oxalá',
    chakra_primario: 'Sahasrara',
    chakra_secundario: null,
    elemento_alinhamento: 'Éter',
    praticas_espirituais: {
      tipo: 'Purificação e paz espiritual',
      descricao: 'Conexão direta com o Divino, paz interior, equilíbrio do Ori (cabeça)',
      mantras: ['AUM', 'SILÊNCIO', 'EHEIEH'],
      erivas: ['Boldo', 'Saião', 'Manjericão Branco', 'Algodoeiro', 'Colônia'],
    },
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    chakra_primario: 'Ajna',
    chakra_secundario: 'Anahata',
    elemento_alinhamento: 'Água',
    praticas_espirituais: {
      tipo: 'Intuição e equilíbrio emocional',
      descricao: 'Despertar da intuição profunda, visão clara e harmonização emocional nas águas',
      mantras: ['OM (852 Hz)', 'YAH'],
      erivas: ['Colônia', 'Alcaparra', 'Folha de Lágrima-de-Nossa-Senhora', 'Pata-de-vaca'],
    },
  },
  'Oxum': {
    orixa: 'Oxum',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Ajna',
    elemento_alinhamento: 'Água',
    praticas_espirituais: {
      tipo: 'Amor e magnetismo',
      descricao: 'Expansão do afeto incondicional, doçura, ouro e feitiçaria natural',
      mantras: ['YAM (639 Hz)', 'YAH'],
      erivas: ['Erva-doce', 'Calêndula', 'Camomila', 'Melissa', 'Rosa Branca'],
    },
  },
  'Ogum': {
    orixa: 'Ogum',
    chakra_primario: 'Vishuddha',
    chakra_secundario: 'Manipura',
    elemento_alinhamento: 'Terra',
    praticas_espirituais: {
      tipo: 'Expressão e ordenação',
      descricao: 'Expressão da verdade interna, abertura de caminhos e lei espiritual',
      mantras: ['HAM (741 Hz)', 'AUM'],
      erivas: ['Espada-de-são-jorge', 'Quebra-demanda', 'Guiné', 'Aroeira', 'Losna'],
    },
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Sahasrara',
    elemento_alinhamento: 'Terra',
    praticas_espirituais: {
      tipo: 'Fartura e conhecimento',
      descricao: 'Expansão da consciência, busca por conhecimento e cura através das matas',
      mantras: ['YAM (639 Hz)', 'AUM (963 Hz)'],
      erivas: ['Guiné', 'Alecrim', 'Samambaia', 'Folha de Jurema', 'Arruda', 'Eucalipto'],
    },
  },
  'Xangô': {
    orixa: 'Xangô',
    chakra_primario: 'Manipura',
    chakra_secundario: 'Svadhisthana',
    elemento_alinhamento: 'Fogo',
    praticas_espirituais: {
      tipo: 'Transformação e justiça',
      descricao: 'Transformação da força de vontade, justiça divina e equilíbrio mental',
      mantras: ['RAM (528 Hz)', 'AUM'],
      erivas: ['Quebra-pedra', 'Erva-de-são-joão', 'Folha de Café', 'Manjericão Roxo', 'Levante'],
    },
  },
  'Iansã': {
    orixa: 'Iansã',
    chakra_primario: 'Svadhisthana',
    chakra_secundario: 'Manipura',
    elemento_alinhamento: 'Fogo',
    praticas_espirituais: {
      tipo: 'Movimento e transformação',
      descricao: 'Transmutação criativa, limpeza de traumas e direcionamento dos ventos',
      mantras: ['VAM (417 Hz)', 'RAM (528 Hz)'],
      erivas: ['Pinhão Roxo', 'Espada-de-santa-bárbara', 'Bambu', 'Folha de Fumo', 'Louro'],
    },
  },
  'Omolu': {
    orixa: 'Omolu',
    chakra_primario: 'Muladhara',
    chakra_secundario: null,
    elemento_alinhamento: 'Terra',
    praticas_espirituais: {
      tipo: 'Aterramento e cura',
      descricao: 'Dissolução de medos de sobrevivência, ancoramento e cura física',
      mantras: ['LAM (396 Hz)', 'KRIM'],
      erivas: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho', 'Vassourinha de Relógio'],
    },
  },
  'Nanã': {
    orixa: 'Nanã',
    chakra_primario: 'Muladhara',
    chakra_secundario: 'Ajna',
    elemento_alinhamento: 'Água',
    praticas_espirituais: {
      tipo: 'Sabedoria ancestral',
      descricao: 'Conexão com a sabedoria dos mais velhos, paciência e decantação espiritual',
      mantras: ['LAM (396 Hz)', 'OM (852 Hz)'],
      erivas: ['Manjericão Roxo', 'Assa-peixe', 'Folha de Mostarda', 'Trapoeraba Roxa', 'Avenca'],
    },
  },
};

/**
 * Get Orixá chakra correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaChakraMapping or undefined if not found
 */
export function getOrixaChakra(orixa: string): OrixaChakraMapping | undefined {
  const normalized = orixa.trim();
  // Try exact match first, then case-insensitive
  if (ORIXA_CHAKRA_MAP[normalized]) {
    return ORIXA_CHAKRA_MAP[normalized];
  }
  // Case-insensitive search
  const lower = normalized.toLowerCase();
  for (const key of Object.keys(ORIXA_CHAKRA_MAP)) {
    if (key.toLowerCase() === lower) {
      return ORIXA_CHAKRA_MAP[key];
    }
  }
  return undefined;
}

/**
 * Get reverse mapping: chakra to associated Orixás
 * @returns Record mapping each ChakraName to its associated Orixás
 */
export function getChakraOrixa(): Record<ChakraName, string[]> {
  const result: Partial<Record<ChakraName, string[]>> = {};

  for (const mapping of Object.values(ORIXA_CHAKRA_MAP)) {
    const primary = mapping.chakra_primario;
    if (!result[primary]) {
      result[primary] = [];
    }
    if (!result[primary]!.includes(mapping.orixa)) {
      result[primary]!.push(mapping.orixa);
    }

    if (mapping.chakra_secundario) {
      const secondary = mapping.chakra_secundario;
      if (!result[secondary]) {
        result[secondary] = [];
      }
      if (!result[secondary]!.includes(mapping.orixa)) {
        result[secondary]!.push(mapping.orixa);
      }
    }
  }

  return result as Record<ChakraName, string[]>;
}

/**
 * Get all Orixá-chakra mappings
 * @returns Array of all OrixaChakraMapping objects
 */
export function getAllOrixaChakras(): OrixaChakraMapping[] {
  return Object.values(ORIXA_CHAKRA_MAP);
}

/**
 * Get Orixás by primary chakra
 * @param chakra - Chakra name or number (e.g., 'Muladhara', '1º Básico')
 * @returns Array of Orixás associated with that primary chakra
 */
export function getOrixasByChakra(chakra: string): OrixaChakraMapping[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return Object.values(ORIXA_CHAKRA_MAP).filter(
    (m) => m.chakra_primario === normalizedChakra || m.chakra_secundario === normalizedChakra
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
    '2º sacro': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '4º cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '6º frontal': 'Ajna',
    '7º coronário': 'Sahasrara',
  };

  const lower = chakra.toLowerCase().trim();
  return mapping[lower] ?? (chakra as ChakraName);
}

export default {
  getOrixaChakra,
  getChakraOrixa,
  getAllOrixaChakras,
  getOrixasByChakra,
};
