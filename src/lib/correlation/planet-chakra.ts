/**
 * Planet-Chakra Spiritual Correlation Module
 * Maps classical planets to their primary and secondary chakra influences
 * Based on IDEIA.md Cabala dos Caminhos framework and day-portal correlations
 */

import type { ChakraName } from './chakra-element';

export type PlanetQualidadeEnergetica = 
  | 'Quente / Radiante'  // Sol, Marte
  | 'Fria / Receptiva'   // Lua, Vênus
  | 'Neutra / Volátil'   // Mercúrio
  | 'Fria / Expansiva'   // Júpiter
  | 'Quente / Densa';    // Saturno

export interface PlanetChakraMapping {
  planeta: string;
  chakra_primario: ChakraName;
  chakra_secundario: ChakraName | null;
  qualidade_energetica: PlanetQualidadeEnergetica;
  elemento_alinhamento: string;
  praticas_espirituais: {
    tipo: string;
    descricao: string;
    frequencias: string[];
    mantras: string[];
    praticas: string[];
  };
}

// Complete mapping of classical planets to their chakra correspondences
// Based on IDEIA.md spiritual framework and day-portal correlations
const PLANET_CHAKRA_MAP: Record<string, PlanetChakraMapping> = {
  Sol: {
    planeta: 'Sol',
    chakra_primario: 'Sahasrara',
    chakra_secundario: 'Manipura',
    qualidade_energetica: 'Quente / Radiante',
    elemento_alinhamento: 'Fogo',
    praticas_espirituais: {
      tipo: 'Vitalidade e propósito divino',
      descricao: 'Conexão com o fogo solar, propósito de vida, poder pessoal e clareza mental',
      frequencias: ['963 Hz (Conexão Divina)', '528 Hz (Transformação)'],
      mantras: ['AUM', 'EHEIEH', 'RAM (528 Hz)'],
      praticas: [
        'Banhos de sol ritualísticos ao amanhecer',
        'Meditação com visualization solar',
        'Acender vela dourada para propósito',
        'Práticas de afirmações de poder pessoal',
      ],
    },
  },
  Lua: {
    planeta: 'Lua',
    chakra_primario: 'Muladhara',
    chakra_secundario: 'Ajna',
    qualidade_energetica: 'Fria / Receptiva',
    elemento_alinhamento: 'Água',
    praticas_espirituais: {
      tipo: 'Intuição e ancestralidade',
      descricao: 'Conexão com o inconsciente, intuição profunda, ancestrais e ciclos lunares',
      frequencias: ['396 Hz (Libertação)', '852 Hz (Intuição)'],
      mantras: ['OM (852 Hz)', 'LAM (396 Hz)', 'YAH'],
      praticas: [
        'Banhos de ervas sob o luar',
        'Macerar ervas à luz da lua',
        'Rituais de limpeza energética noturna',
        'Conexão com ancestrais e almas',
        'Lavar o Ori (cabeça) antes de dormir',
      ],
    },
  },
  Marte: {
    planeta: 'Marte',
    chakra_primario: 'Svadhisthana',
    chakra_secundario: 'Manipura',
    qualidade_energetica: 'Quente / Radiante',
    elemento_alinhamento: 'Fogo',
    praticas_espirituais: {
      tipo: 'Coragem e transformação',
      descricao: 'Despertar da força vital, coragem, limpeza de traumas e direcionamento de energia',
      frequencias: ['417 Hz (Facilitação)', '528 Hz (Transformação)'],
      mantras: ['VAM (417 Hz)', 'RAM (528 Hz)', 'AUM'],
      praticas: [
        'Práticas de respiração intensa (Pranayama)',
        'Rituais de transmutação criativa',
        'Limpęza de traumas e bloqueios emocionais',
        'Exercícios físicos ritualísticos',
        'Trabalho com elementos de fogo',
      ],
    },
  },
  Mercurio: {
    planeta: 'Mercúrio',
    chakra_primario: 'Manipura',
    chakra_secundario: 'Vishuddha',
    qualidade_energetica: 'Neutra / Volátil',
    elemento_alinhamento: 'Ar',
    praticas_espirituais: {
      tipo: 'Comunicação e equilíbrio mental',
      descricao: 'Expansão da mente, comunicação clara, justiça espiritual e abertura de caminhos',
      frequencias: ['528 Hz (Transformação)', '741 Hz (Expressão)'],
      mantras: ['RAM (528 Hz)', 'HAM (741 Hz)', 'AUM'],
      praticas: [
        'Meditação para clareza mental',
        'Práticas de comunicação verdadeira',
        'Estudos espirituais e filosóficos',
        'Trabalho com elementais e guias',
        'Rituais de abertura de caminhos',
      ],
    },
  },
  Jupiter: {
    planeta: 'Júpiter',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Sahasrara',
    qualidade_energetica: 'Fria / Expansiva',
    elemento_alinhamento: 'Ar / Água',
    praticas_espirituais: {
      tipo: 'Fartura e conhecimento',
      descricao: 'Expansão da consciência, abundância espiritual, conhecimento profundo e cura',
      frequencias: ['639 Hz (Harmonia)', '963 Hz (Conexão Divina)'],
      mantras: ['YAM (639 Hz)', 'AUM (963 Hz)', 'OM'],
      praticas: [
        'Gratidão e visualização de abundância',
        'Estudos de textos sagrados',
        'Práticas de compaixão e amor incondicional',
        'Rituais de fartura e prosperidade',
        'Conexão com mestres ascensionados',
      ],
    },
  },
  Venus: {
    planeta: 'Vênus',
    chakra_primario: 'Anahata',
    chakra_secundario: 'Sahasrara',
    qualidade_energetica: 'Fria / Receptiva',
    elemento_alinhamento: 'Água',
    praticas_espirituais: {
      tipo: 'Amor e magnetismo',
      descricao: 'Expansão do amor incondicional, doçura, beleza interior, purificação e paz divina',
      frequencias: ['639 Hz (Harmonia)', '963 Hz (Conexão Divina)'],
      mantras: ['YAM (639 Hz)', 'AUM (963 Hz)', 'EHEIEH'],
      praticas: [
        'Banhos de mel e rosas para amor próprio',
        'Macerados com mel nas noites de lua cheia',
        'Práticas de gratidão profunda',
        'Silêncio e quietude meditativa',
        'Vestir branco para purificação total',
      ],
    },
  },
  Saturno: {
    planeta: 'Saturno',
    chakra_primario: 'Muladhara',
    chakra_secundario: 'Anahata',
    qualidade_energetica: 'Quente / Densa',
    elemento_alinhamento: 'Terra',
    praticas_espirituais: {
      tipo: 'Disciplina e encerramento de ciclos',
      descricao: 'Aterramento profundo, disciplina espiritual, limpeza kármica e renovação de ciclos',
      frequencias: ['396 Hz (Libertação)', '639 Hz (Harmonia)'],
      mantras: ['LAM (396 Hz)', 'YAM (639 Hz)', 'KRIM'],
      praticas: [
        'Decocção de canela-de-velho para lavar pés',
        'Rituais de limpeza kármica',
        'Banhos de arruda e assa-peixe para ancoramento',
        'Oferecer seis tipos de frutas',
        'Trabalho de encerramento de ciclos',
      ],
    },
  },
};

/**
 * Get planet chakra correlation mapping
 * @param planeta - Name of the planet (e.g., 'Sol', 'Lua', 'Marte')
 * @returns PlanetChakraMapping or undefined if not found
 */
export function getPlanetChakra(planeta: string): PlanetChakraMapping | undefined {
  const normalized = planeta.trim();
  // Try exact match first
  if (PLANET_CHAKRA_MAP[normalized]) {
    return PLANET_CHAKRA_MAP[normalized];
  }
  // Case-insensitive search
  const lower = normalized.toLowerCase();
  for (const key of Object.keys(PLANET_CHAKRA_MAP)) {
    if (key.toLowerCase() === lower) {
      return PLANET_CHAKRA_MAP[key];
    }
  }
  return undefined;
}

/**
 * Get reverse mapping: chakra to associated planets
 * @returns Record mapping each ChakraName to its associated planets
 */
export function getChakraPlanet(): Record<ChakraName, string[]> {
  const result: Partial<Record<ChakraName, string[]>> = {};

  for (const mapping of Object.values(PLANET_CHAKRA_MAP)) {
    const primary = mapping.chakra_primario;
    if (!result[primary]) {
      result[primary] = [];
    }
    if (!result[primary]!.includes(mapping.planeta)) {
      result[primary]!.push(mapping.planeta);
    }

    if (mapping.chakra_secundario) {
      const secondary = mapping.chakra_secundario;
      if (!result[secondary]) {
        result[secondary] = [];
      }
      if (!result[secondary]!.includes(mapping.planeta)) {
        result[secondary]!.push(mapping.planeta);
      }
    }
  }

  return result as Record<ChakraName, string[]>;
}

/**
 * Get all planet-chakra mappings
 * @returns Array of all PlanetChakraMapping objects
 */
export function getAllPlanetChakras(): PlanetChakraMapping[] {
  return Object.values(PLANET_CHAKRA_MAP);
}

/**
 * Normalizes planet name to standard form
 */
function normalizePlanetName(planeta: string): string {
  const mapping: Record<string, string> = {
    sol: 'Sol',
    lua: 'Lua',
    marte: 'Marte',
    mercurio: 'Mercúrio',
    mercúrio: 'Mercúrio',
    jupiter: 'Júpiter',
    júpiter: 'Júpiter',
    venus: 'Vênus',
    vênus: 'Vênus',
    saturno: 'Saturno',
  };
  const lower = planeta.toLowerCase().trim();
  return mapping[lower] ?? planeta;
}

export default {
  getPlanetChakra,
  getChakraPlanet,
  getAllPlanetChakras,
};
