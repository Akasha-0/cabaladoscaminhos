/**
 * Chakra-Orixá Spiritual Correlation Module
 * Maps each of the 7 main chakras to their associated Orixás
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

import type { ChakraName } from './chakra-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface ChakraOrixaMapping {
  chakra: ChakraName;
  chakra_numero: number;
  chakra_nome_portugues: string;
  orixas: {
    primario: string;
    secundario: string | null;
  };
  elemento: Elemento;
  praticas_espirituais: {
    tipo: string;
    descricao: string;
    mantras: string[];
    erivas: string[];
    cores: string[];
  };
}

// Complete mapping of each chakra to its Orixá correspondences
// Derived from IDEIA.md spiritual framework
const CHAKRA_ORIXA_MAP: Record<ChakraName, ChakraOrixaMapping> = {
  'Muladhara': {
    chakra: 'Muladhara',
    chakra_numero: 1,
    chakra_nome_portugues: '1º Básico',
    orixas: {
      primario: 'Omolu',
      secundario: 'Nanã',
    },
    elemento: 'Terra',
    praticas_espirituais: {
      tipo: 'Aterramento e cura física',
      descricao: 'Conexão com a terra, dissolução de medos de sobrevivência, ancoramento energético e cura do corpo físico',
      mantras: ['LAM (396 Hz)', 'KRIM'],
      erivas: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho', 'Vassourinha de Relógio'],
      cores: ['Vermelho', 'Marrom'],
    },
  },
  'Svadhisthana': {
    chakra: 'Svadhisthana',
    chakra_numero: 2,
    chakra_nome_portugues: '2º Sacro',
    orixas: {
      primario: 'Iansã',
      secundario: 'Xangô',
    },
    elemento: 'Água',
    praticas_espirituais: {
      tipo: 'Criatividade e transmutação emocional',
      descricao: 'Desbloqueio da criatividade, transmutação de traumas emocionais, direcionamento dos ventos da mudança',
      mantras: ['VAM (417 Hz)', 'RAM (528 Hz)'],
      erivas: ['Pinhão Roxo', 'Espada-de-santa-bárbara', 'Bambu', 'Folha de Fumo', 'Louro'],
      cores: ['Laranja', 'Vermelho-alaranjado'],
    },
  },
  'Manipura': {
    chakra: 'Manipura',
    chakra_numero: 3,
    chakra_nome_portugues: '3º Plexo Solar',
    orixas: {
      primario: 'Xangô',
      secundario: 'Ogum',
    },
    elemento: 'Fogo',
    praticas_espirituais: {
      tipo: 'Força de vontade e transformação',
      descricao: 'Fortalece a vontade interior, transformação através do fogo, equilíbrio mental e justiça divina',
      mantras: ['RAM (528 Hz)', 'AUM'],
      erivas: ['Quebra-pedra', 'Erva-de-são-joão', 'Folha de Café', 'Manjericão Roxo', 'Levante'],
      cores: ['Amarelo', 'Dourado'],
    },
  },
  'Anahata': {
    chakra: 'Anahata',
    chakra_numero: 4,
    chakra_nome_portugues: '4º Cardíaco',
    orixas: {
      primario: 'Oxum',
      secundario: 'Oxóssi',
    },
    elemento: 'Ar',
    praticas_espirituais: {
      tipo: 'Amor e expansão da consciência',
      descricao: 'Expansão do amor incondicional, conexão com a natureza, busca por conhecimento e fartura espiritual',
      mantras: ['YAM (639 Hz)', 'AUM (963 Hz)'],
      erivas: ['Erva-doce', 'Calêndula', 'Camomila', 'Melissa', 'Rosa Branca', 'Alecrim', 'Samambaia'],
      cores: ['Verde', 'Rosa'],
    },
  },
  'Vishuddha': {
    chakra: 'Vishuddha',
    chakra_numero: 5,
    chakra_nome_portugues: '5º Laríngeo',
    orixas: {
      primario: 'Ogum',
      secundario: null,
    },
    elemento: 'Terra',
    praticas_espirituais: {
      tipo: 'Expressão da verdade',
      descricao: 'Abertura de caminhos, expressão da verdade interior, lei espiritual e ordenação cósmica',
      mantras: ['HAM (741 Hz)', 'AUM'],
      erivas: ['Espada-de-são-jorge', 'Quebra-demanda', 'Guiné', 'Aroeira', 'Losna'],
      cores: ['Azul', 'Azul-turquesa'],
    },
  },
  'Ajna': {
    chakra: 'Ajna',
    chakra_numero: 6,
    chakra_nome_portugues: '6º Frontal',
    orixas: {
      primario: 'Iemanjá',
      secundario: 'Nanã',
    },
    elemento: 'Éter',
    praticas_espirituais: {
      tipo: 'Intuição e visão clara',
      descricao: 'Despertar da intuição profunda, visão clarividente, equilíbrio emocional nas águas sagradas',
      mantras: ['OM (852 Hz)', 'YAH'],
      erivas: ['Colônia', 'Alcaparra', 'Folha de Lágrima-de-Nossa-Senhora', 'Pata-de-vaca', 'Manjericão Roxo'],
      cores: ['Índigo', 'Azul-escuro'],
    },
  },
  'Sahasrara': {
    chakra: 'Sahasrara',
    chakra_numero: 7,
    chakra_nome_portugues: '7º Coronário',
    orixas: {
      primario: 'Oxalá',
      secundario: 'Oxóssi',
    },
    elemento: 'Éter',
    praticas_espirituais: {
      tipo: 'Conexão divina e paz espiritual',
      descricao: 'Conexão direta com o Divino, paz interior absoluta, equilíbrio do Ori (cabeça), transcendência',
      mantras: ['AUM', 'SILÊNCIO', 'EHEIEH'],
      erivas: ['Boldo', 'Saião', 'Manjericão Branco', 'Algodoeiro', 'Colônia'],
      cores: ['Branco', 'Dourado', 'Violeta'],
    },
  },
};

/**
 * Get Chakra-Orixá correlation mapping
 * @param chakra - Name or number of the chakra (e.g., 'Muladhara', 'Sahasrara', '1º Básico', '7º Coronário')
 * @returns ChakraOrixaMapping or undefined if not found
 */
export function getChakraOrixa(chakra: string): ChakraOrixaMapping | undefined {
  const normalized = normalizeChakraName(chakra);
  return CHAKRA_ORIXA_MAP[normalized];
}
/**
 * Get reverse mapping: Orixá to primary chakra
 * Prioritizes primary Orixá association when an Orixá appears in multiple chakras
 * @returns Record mapping each Orixá name to their primary chakra
 */
export function getOrixaChakra(): Record<string, ChakraName> {
  const result: Record<string, ChakraName> = {};
  // First pass: assign all primary Orixás
  for (const mapping of Object.values(CHAKRA_ORIXA_MAP)) {
    result[mapping.orixas.primario] = mapping.chakra;
  }
  // Second pass: assign secondary Orixás that aren't already assigned as primary
  for (const mapping of Object.values(CHAKRA_ORIXA_MAP)) {
    if (mapping.orixas.secundario) {
      const secondary = mapping.orixas.secundario;
      if (!result[secondary]) {
        result[secondary] = mapping.chakra;
      }
    }
  }
  return result;
}

/**
 * Get all Chakra-Orixá mappings
 * @returns Array of all ChakraOrixaMapping objects
 */
export function getAllChakraOrixas(): ChakraOrixaMapping[] {
  return Object.values(CHAKRA_ORIXA_MAP);
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
