/**
 * Chakra-Planet Spiritual Correlation Module
 * Maps the 7 primary chakras to their associated classical planets
 * Based on IDEIA.md Cabala dos Caminhos framework and day-portal correlations
 */

import type { ChakraName } from './chakra-element';

export type ChakraPlanetQualidadeEnergetica = 
  | 'Quente / Radiante'
  | 'Fria / Receptiva'
  | 'Neutra / Equilibrada'
  | 'Mista / Dinâmica';

export interface ChakraPlanetMapping {
  chakra: ChakraName;
  chakra_numero: string;
  planeta_primario: string;
  planeta_secundario: string | null;
  qualidade_energetica: ChakraPlanetQualidadeEnergetica;
  elemento_conexao: string;
  praticas_espirituais: {
    tipo: string;
    descricao: string;
    frequencias: string[];
    mantras: string[];
    praticas: string[];
  };
}

// Complete mapping of the 7 chakras to their planetary correspondences
// Each chakra resonates with specific planets based on vibrational frequency
const CHAKRA_PLANET_MAP: Record<ChakraName, ChakraPlanetMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: '1º Básico (Raiz)',
    planeta_primario: 'Lua',
    planeta_secundario: 'Saturno',
    qualidade_energetica: 'Fria / Receptiva',
    elemento_conexao: 'Terra',
    praticas_espirituais: {
      tipo: 'Aterramento e estabilidade',
      descricao: 'Conexão com a energia terrestre, segurança existencial, ancestralidade e os ciclos naturais',
      frequencias: ['396 Hz (Libertação)', '852 Hz (Intuição)'],
      mantras: ['LAM (396 Hz)', 'KRIM', 'YAH'],
      praticas: [
        'Meditação de aterramento visualizing raízes',
        'Banhos de arruda e assa-peixe para ancoramento',
        'Rituais de limpeza kármica',
        'Conexão com ancestrais e spirits da terra',
        'Decocção de canela-de-velho para lavar pés',
        'Práticas de encerramento de ciclos',
      ],
    },
  },
  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacral (Esplênico)',
    planeta_primario: 'Marte',
    planeta_secundario: null,
    qualidade_energetica: 'Quente / Radiante',
    elemento_conexao: 'Água',
    praticas_espirituais: {
      tipo: 'Criatividade e transformação',
      descricao: 'Despertar da força vital, criatividade, limpeza de traumas e direcionamento de energia sexual',
      frequencias: ['417 Hz (Facilitação)', '528 Hz (Transformação)'],
      mantras: ['VAM (417 Hz)', 'RAM (528 Hz)', 'AUM'],
      praticas: [
        'Pranayama (respiração intensa)',
        'Rituais de transmutação criativa',
        'Limpeza de traumas e bloqueios emocionais',
        'Exercícios físicos ritualísticos',
        'Trabalho com elementos de fogo e água',
        'Práticas de тантрическая energia',
      ],
    },
  },
  Manipura: {
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    planeta_primario: 'Mercúrio',
    planeta_secundario: 'Sol',
    qualidade_energetica: 'Neutra / Equilibrada',
    elemento_conexao: 'Fogo',
    praticas_espirituais: {
      tipo: 'Poder pessoal e clareza mental',
      descricao: 'Expansão da mente, comunicação clara, justiça espiritual, poder pessoal e abertura de caminhos',
      frequencias: ['528 Hz (Transformação)', '741 Hz (Expressão)'],
      mantras: ['RAM (528 Hz)', 'HAM (741 Hz)', 'AUM'],
      praticas: [
        'Meditação para clareza mental',
        'Práticas de comunicação verdadeira',
        'Estudos espirituais e filosóficos',
        'Trabalho com elementais e guias',
        'Rituais de abertura de caminhos',
        'Visualização solar para poder pessoal',
      ],
    },
  },
  Anahata: {
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco (Coração)',
    planeta_primario: 'Vênus',
    planeta_secundario: 'Júpiter',
    qualidade_energetica: 'Mista / Dinâmica',
    elemento_conexao: 'Ar',
    praticas_espirituais: {
      tipo: 'Amor e abundância',
      descricao: 'Expansão do amor incondicional, fartura espiritual, compaixão, cura e conexão com mestres',
      frequencias: ['639 Hz (Harmonia)', '963 Hz (Conexão Divina)'],
      mantras: ['YAM (639 Hz)', 'AUM (963 Hz)', 'EHEIEH', 'OM'],
      praticas: [
        'Gratidão e visualização de abundância',
        'Práticas de compaixão e amor incondicional',
        'Conexão com mestres ascensionados',
        'Rituais de fartura e prosperidade',
        'Banhos de mel e rosas para amor próprio',
        'Silêncio e quietude meditativa',
      ],
    },
  },
  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo (Garganta)',
    planeta_primario: 'Mercúrio',
    planeta_secundario: null,
    qualidade_energetica: 'Neutra / Equilibrada',
    elemento_conexao: 'Éter',
    praticas_espirituais: {
      tipo: 'Comunicação e expressão',
      descricao: 'Expressão autêntica, comunicação espiritual, verdade, criatividade verbal e manifestação',
      frequencias: ['741 Hz (Expressão)', '528 Hz (Transformação)'],
      mantras: ['HAM (741 Hz)', 'RAM (528 Hz)', 'AUM'],
      praticas: [
        'Canto de mantras e cânticos sagrados',
        'Práticas de comunicação verdadeira',
        'Escrita criativa e journaling espiritual',
        'Meditação de throat healing',
        'Trabalho com chackras da garganta',
        'Rituais de manifestação verbal',
      ],
    },
  },
  Ajna: {
    chakra: 'Ajna',
    chakra_numero: '6º Terceiro Olho (Frontal)',
    planeta_primario: 'Lua',
    planeta_secundario: null,
    qualidade_energetica: 'Fria / Receptiva',
    elemento_conexao: 'Éter',
    praticas_espirituais: {
      tipo: 'Intuição e visão interior',
      descricao: 'Desenvolvimento da intuição, visão clarividente, percepção extra-sensorial e conexão com o divino',
      frequencias: ['852 Hz (Intuição)', '396 Hz (Libertação)'],
      mantras: ['OM (852 Hz)', 'SHAM', 'AUM'],
      praticas: [
        'Meditação no terceiro olho',
        'Visualização de luz violeta',
        'Práticas de remote viewing',
        'Trabalho com sonhos lúcidos',
        'Conexão com guias e mentores',
        'Leitura de oráculos e símbolos',
      ],
    },
  },
  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário (Plexo Superior)',
    planeta_primario: 'Sol',
    planeta_secundario: null,
    qualidade_energetica: 'Quente / Radiante',
    elemento_conexao: 'Éter / Luz',
    praticas_espirituais: {
      tipo: 'Iluminação e propósito divino',
      descricao: 'Conexão com a energia solar divina, propósito de vida, consciência cósmica e trascendência',
      frequencias: ['963 Hz (Conexão Divina)', '528 Hz (Transformação)'],
      mantras: ['AUM', 'EHEIEH', 'OM (963 Hz)'],
      praticas: [
        'Banhos de sol ritualísticos ao amanhecer',
        'Meditação de luz dourada',
        'Acender vela dourada para propósito',
        'Práticas de afirmações de poder pessoal',
        'Conexão com masters ascensionados',
        'Rituais de integração alma-corpo',
      ],
    },
  },
};

/**
 * Normalizes chakra name or number to match ChakraName type
 */
function normalizeChakraInput(chakra: string): ChakraName | null {
  const normalized = chakra.trim().toLowerCase();
  const mapping: Record<string, ChakraName> = {
    // By name (Portuguese)
    muladhara: 'Muladhara',
    svadhisthana: 'Svadhisthana',
    manipura: 'Manipura',
    anahata: 'Anahata',
    vishuddha: 'Vishuddha',
    ajna: 'Ajna',
    sahasrara: 'Sahasrara',
    // By name (English alternative)
    'root': 'Muladhara',
    'sacral': 'Svadhisthana',
    'solar': 'Manipura',
    'heart': 'Anahata',
    'throat': 'Vishuddha',
    'third': 'Ajna',
    'crown': 'Sahasrara',
    // By number
    '1': 'Muladhara',
    '2': 'Svadhisthana',
    '3': 'Manipura',
    '4': 'Anahata',
    '5': 'Vishuddha',
    '6': 'Ajna',
    '7': 'Sahasrara',
    // By number + name
    '1º': 'Muladhara',
    '2º': 'Svadhisthana',
    '3º': 'Manipura',
    '4º': 'Anahata',
    '5º': 'Vishuddha',
    '6º': 'Ajna',
    '7º': 'Sahasrara',
    '1º básico': 'Muladhara',
    '2º sacral': 'Svadhisthana',
    '3º plexo': 'Manipura',
    '4º cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '6º terceiro olho': 'Ajna',
    '7º coronário': 'Sahasrara',
    // Variations
    'básico': 'Muladhara',
    'raiz': 'Muladhara',
    'sacral': 'Svadhisthana',
    'esplênico': 'Svadhisthana',
    'plexo solar': 'Manipura',
    'cardíaco': 'Anahata',
    'coração': 'Anahata',
    'laríngeo': 'Vishuddha',
    'garganta': 'Vishuddha',
    'terceiro olho': 'Ajna',
    'frontal': 'Ajna',
    'coronário': 'Sahasrara',
    'plexo superior': 'Sahasrara',
  };

  return mapping[normalized] || null;
}

/**
 * Get chakra-planet correlation mapping
 * @param chakra - Name or number of the chakra (e.g., 'Muladhara', '1', 'Raiz', 'Sahasrara')
 * @returns ChakraPlanetMapping or null if not found
 */
export function getChakraPlanet(chakra: string): ChakraPlanetMapping | null {
  const normalized = normalizeChakraInput(chakra);
  if (!normalized) return null;
  return CHAKRA_PLANET_MAP[normalized] || null;
}

/**
 * Get all planets associated with each chakra
 * @returns Record mapping each ChakraName to its primary planet
 */
export function getPlanetChakra(): Record<ChakraName, string> {
  const result: Partial<Record<ChakraName, string>> = {};

  for (const [chakraName, mapping] of Object.entries(CHAKRA_PLANET_MAP)) {
    result[chakraName as ChakraName] = mapping.planeta_primario;
  }

  return result as Record<ChakraName, string>;
}

/**
 * Get all chakra-planet mappings
 * @returns Array of all ChakraPlanetMapping objects
 */
export function getAllChakraPlanets(): ChakraPlanetMapping[] {
  return Object.values(CHAKRA_PLANET_MAP);
}

/**
 * Get secondary planet for a chakra (if any)
 * @param chakra - Name or number of the chakra
 * @returns Secondary planet name or null
 */
export function getChakraSecondaryPlanet(chakra: string): string | null {
  const mapping = getChakraPlanet(chakra);
  return mapping?.planeta_secundario || null;
}

/**
 * Get planet-to-chakra reverse mapping
 * @returns Record mapping each planet to its primary chakra
 */
export function getPlanetToChakra(): Record<string, ChakraName> {
  const result: Record<string, ChakraName> = {};

  for (const mapping of Object.values(CHAKRA_PLANET_MAP)) {
    result[mapping.planeta_primario] = mapping.chakra;
    if (mapping.planeta_secundario) {
      // For secondary planets, keep the primary mapping
    }
  }

  return result;
}

export default {
  getChakraPlanet,
  getPlanetChakra,
  getAllChakraPlanets,
  getChakraSecondaryPlanet,
  getPlanetToChakra,
};