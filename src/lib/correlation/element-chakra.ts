/**
 * Element-Chakra Spiritual Correlation Module
 * Maps spiritual elements to their corresponding chakras with planetary connections
 * and spiritual meanings based on the Cabala dos Caminhos hermetic framework.
 * 
 * This is the reverse correlation of chakra-element.ts - focused on element perspective.
 */

import type { ChakraName } from './chakra-element';

export type Elemento = 'terra' | 'água' | 'fogo' | 'ar' | 'éter';

export interface ElementChakraMapping {
  elemento: Elemento;
  elemento_nome_portugues: string;
  chakra_primario: ChakraName;
  chakra_secundario: ChakraName | null;
  chakra_numero_primario: string;
  chakra_numero_secundario: string | null;
  conexao_planetaria: {
    planeta_primario: string;
    planeta_secundario: string | null;
  };
  significado_espiritual: {
    qualidade: string;
    licao: string;
    pratica: string;
  };
  mantras: string[];
}

/**
 * Complete mapping of elements to their chakra correspondences.
 * Based on the reverse correlation from chakra-element.ts.
 */
const ELEMENT_CHAKRA_MAP: Record<Elemento, ElementChakraMapping> = {
  terra: {
    elemento: 'terra',
    elemento_nome_portugues: 'Terra',
    chakra_primario: 'Muladhara',
    chakra_secundario: null,
    chakra_numero_primario: '1º Básico (Raiz)',
    chakra_numero_secundario: null,
    conexao_planetaria: {
      planeta_primario: 'Lua',
      planeta_secundario: 'Saturno'
    },
    significado_espiritual: {
      qualidade: 'Estrutura, ancoramento e sobrevivência',
      licao: 'Estabelecer firmeza material e segurança existencial',
      pratica: 'Meditação de aterramento e conexão com ancestrais'
    },
    mantras: ['LAM (396 Hz)', 'KRIM']
  },

  água: {
    elemento: 'água',
    elemento_nome_portugues: 'Água',
    chakra_primario: 'Svadhisthana',
    chakra_secundario: 'Anahata',
    chakra_numero_primario: '2º Sacral (Esplênico)',
    chakra_numero_secundario: '4º Cardíaco (Coração)',
    conexao_planetaria: {
      planeta_primario: 'Marte',
      planeta_secundario: 'Vênus'
    },
    significado_espiritual: {
      qualidade: 'Fluidez emocional, criatividade e fertilidade',
      licao: 'Transmutar emoções em expressão criativa e amar incondicionalmente',
      pratica: 'Rituais de transmutação criativa e banhos de purificação'
    },
    mantras: ['VAM (417 Hz)', 'RAM (528 Hz)', 'YAM (639 Hz)']
  },

  fogo: {
    elemento: 'fogo',
    elemento_nome_portugues: 'Fogo',
    chakra_primario: 'Manipura',
    chakra_secundario: null,
    chakra_numero_primario: '3º Plexo Solar',
    chakra_numero_secundario: null,
    conexao_planetaria: {
      planeta_primario: 'Mercúrio',
      planeta_secundario: 'Sol'
    },
    significado_espiritual: {
      qualidade: 'Transformação, vontade e poder pessoal',
      licao: 'Canalizar a energia em propósito construtivo e clareza mental',
      pratica: 'Meditação solar e visualização de poder pessoal'
    },
    mantras: ['RAM (528 Hz)', 'AUM']
  },

  ar: {
    elemento: 'ar',
    elemento_nome_portugues: 'Ar',
    chakra_primario: 'Vishuddha',
    chakra_secundario: 'Ajna',
    chakra_numero_primario: '5º Laríngeo (Garganta)',
    chakra_numero_secundario: '6º Terceiro Olho (Frontal)',
    conexao_planetaria: {
      planeta_primario: 'Mercúrio',
      planeta_secundario: 'Lua'
    },
    significado_espiritual: {
      qualidade: 'Expressão autêntica, comunicação e intuição',
      licao: 'Expressar a verdade interior e desenvolver percepção clarividente',
      pratica: 'Canto de mantras e meditação no terceiro olho'
    },
    mantras: ['HAM (741 Hz)', 'OM (852 Hz)']
  },

  éter: {
    elemento: 'éter',
    elemento_nome_portugues: 'Éter',
    chakra_primario: 'Ajna',
    chakra_secundario: 'Sahasrara',
    chakra_numero_primario: '6º Terceiro Olho (Frontal)',
    chakra_numero_secundario: '7º Coronário (Plexo Superior)',
    conexao_planetaria: {
      planeta_primario: 'Lua',
      planeta_secundario: 'Sol'
    },
    significado_espiritual: {
      qualidade: 'Unidade, transcendência e iluminação',
      licao: 'Integrar consciência espiritual com vida terrena',
      pratica: 'Meditação de luz dourada e silêncio contemplativo'
    },
    mantras: ['OM (852 Hz)', 'AUM (963 Hz)', 'EHEIEH']
  }
};

/**
 * Normalizes element name to match Elemento type.
 */
function normalizeElementInput(elemento: string): Elemento | null {
  const normalized = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const mapping: Record<string, Elemento> = {
    'terra': 'terra',
    'água': 'água',
    'agua': 'água',
    'fogo': 'fogo',
    'ar': 'ar',
    'éter': 'éter',
    'eter': 'éter',
    'ether': 'éter',
    'akasha': 'éter'
  };
  return mapping[normalized] || null;
}

/**
 * Get Element-Chakra correlation mapping
 * @param elemento - Element type (terra, água, fogo, ar, éter)
 * @returns ElementChakraMapping or undefined if not found
 */
export function getElementChakra(elemento: string): ElementChakraMapping | undefined {
  const normalized = normalizeElementInput(elemento);
  return normalized ? ELEMENT_CHAKRA_MAP[normalized] : undefined;
}

/**
 * Get reverse mapping: Chakra to their primary element
 * @returns Record mapping each ChakraName to their element
 */
export function getChakraElement(): Record<ChakraName, Elemento> {
  return {
    'Muladhara': 'terra',
    'Svadhisthana': 'água',
    'Manipura': 'fogo',
    'Anahata': 'ar',
    'Vishuddha': 'ar',
    'Ajna': 'éter',
    'Sahasrara': 'éter'
  };
}

/**
 * Get all Element-Chakra mappings
 * @returns Array of all ElementChakraMapping objects
 */
export function getAllElementChakras(): ElementChakraMapping[] {
  return Object.values(ELEMENT_CHAKRA_MAP);
}

/**
 * Get Chakra names associated with an element
 * @param elemento - Element type (terra, água, fogo, ar, éter)
 * @returns Object with primary and secondary chakra names
 */
export function getChakrasPorElemento(elemento: string): { primario: ChakraName; secundario: ChakraName | null } | undefined {
  const mapping = getElementChakra(elemento);
  if (!mapping) return undefined;
  return {
    primario: mapping.chakra_primario,
    secundario: mapping.chakra_secundario
  };
}

export default {
  getElementChakra,
  getChakraElement,
  getAllElementChakras,
  getChakrasPorElemento
};
