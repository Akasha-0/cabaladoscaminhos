/**
 * Chakra-Element Spiritual Correlation
 * Maps the 7 chakras (Muladhara to Sahasrara) to their primary and secondary elements,
 * elemental properties, directions, seasons, and aligned spiritual practices.
 * 
 * Based on Cabala dos Caminhos hermetic principles and IDEIA.md system data.
 */

import type { ChakraName, Elemento } from './chakra-base';
import { normalizeChakraName } from './chakra-base';

// Re-export for backward compatibility with existing importers
export type { ChakraName, Elemento };

export interface ChakraElementMapping {
  chakra: ChakraName;
  chakra_numero: string;
  elemento_primario: Elemento;
  elemento_secundario: Elemento | null;
  propriedades_elementais: {
    qualidade: string;
    direcao: string;
    estacao: string;
  };
  pratica_espiritual: {
    tipo: string;
    descricao: string;
    mantras: string[];
  };
}

/**
 * Complete mapping of the 7 chakras to their elemental correspondences.
 * Derived from IDEIA.md Cabala dos Caminhos system data.
 */
export const CHAKRA_ELEMENT_MAPPINGS: Record<ChakraName, ChakraElementMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento_primario: 'Terra',
    elemento_secundario: null,
    propriedades_elementais: {
      qualidade: 'Estrutura, ancoramento, sobrevivência',
      direcao: 'Norte',
      estacao: 'Inverno',
    },
    pratica_espiritual: {
      tipo: 'Aterramento e dissolution de medos',
      descricao: 'Conexão com a terra para dissolver medos de sobrevivência e estabelecer firmeza material',
      mantras: ['LAM (396 Hz)', 'KRIM'],
    },
  },

  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento_primario: 'Água',
    elemento_secundario: null,
    propriedades_elementais: {
      qualidade: 'Fluidez, emoção, fertilidade',
      direcao: 'Oeste',
      estacao: 'Outono',
    },
    pratica_espiritual: {
      tipo: 'Transmutação criativa',
      descricao: 'Limpeza de traumas do passado através da fluidity emocional e transformação criativa',
      mantras: ['VAM (417 Hz)', 'RAM'],
    },
  },

  Manipura: {
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento_primario: 'Fogo',
    elemento_secundario: null,
    propriedades_elementais: {
      qualidade: 'Transformação, vontade, poder pessoal',
      direcao: 'Oeste',
      estacao: 'Verão',
    },
    pratica_espiritual: {
      tipo: 'Quebra de medos e ativação',
      descricao: 'Transformação da força de vontade, quebra de medos e ativação do brilho pessoal',
      mantras: ['RAM (528 Hz)', 'AUM'],
    },
  },

  Anahata: {
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento_primario: 'Ar',
    elemento_secundario: 'Água',
    propriedades_elementais: {
      qualidade: 'Harmonia, amor incondicional, expansão',
      direcao: 'Sul',
      estacao: 'Primavera',
    },
    pratica_espiritual: {
      tipo: 'Expansão do afeto',
      descricao: 'Expansão do afeto incondicional, harmonização de relacionamentos e cura emocional',
      mantras: ['YAM (639 Hz)', 'YAH'],
    },
  },

  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento_primario: 'Ar',
    elemento_secundario: null,
    propriedades_elementais: {
      qualidade: 'Expressão, comunicação, verdade',
      direcao: 'Leste',
      estacao: 'Primavera',
    },
    pratica_espiritual: {
      tipo: 'Expressão da verdade interna',
      descricao: 'Purificação da comunicação, expressão da verdade interna e poder da palavra falada',
      mantras: ['HAM (741 Hz)', 'OM'],
    },
  },

  Ajna: {
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento_primario: 'Éter',
    elemento_secundario: 'Ar',
    propriedades_elementais: {
      qualidade: 'Intuição, visão clara, percepção',
      direcao: 'Leste',
      estacao: 'Todas',
    },
    pratica_espiritual: {
      tipo: 'Despertar da intuição',
      descricao: 'Despertar da intuição profunda, visão clara e dissolução de ilusões mentais',
      mantras: ['OM (852 Hz)', 'SHADDAI EL CHAI'],
    },
  },

  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento_primario: 'Éter',
    elemento_secundario: null,
    propriedades_elementais: {
      qualidade: 'Unidade, iluminação, transcendência',
      direcao: 'Centro / Zênite',
      estacao: 'Eterno',
    },
    pratica_espiritual: {
      tipo: 'Conexão espiritual direta',
      descricao: 'Conexão espiritual direta com a Fonte e iluminação da mente através do silêncio',
      mantras: ['AUM (963 Hz)', 'SILÊNCIO', 'EHEIEH'],
    },
  },
};

/**
 * Returns the complete chakra-element mapping for a given chakra name.
 */
export function getChakraElement(chakra: string): ChakraElementMapping | null {
  const normalizedChakra = normalizeChakraName(chakra);
  return CHAKRA_ELEMENT_MAPPINGS[normalizedChakra as ChakraName] ?? null;
}

/**
 * Returns all chakras associated with a given element.
 */
export function getElementChakras(elemento: string): ChakraElementMapping[] {
  const normalizedElement = normalizeElementName(elemento);
  return Object.values(CHAKRA_ELEMENT_MAPPINGS).filter(
    mapping => 
      mapping.elemento_primario === normalizedElement ||
      mapping.elemento_secundario === normalizedElement
  );
}

/**
 * Returns all chakra-element mappings.
 */
export function getAllChakraElements(): ChakraElementMapping[] {
  return Object.values(CHAKRA_ELEMENT_MAPPINGS);
}

/**
 * Normalizes element name to match Elemento type.
 */
function normalizeElementName(elemento: string): Elemento {
  const elementMap: Record<string, Elemento> = {
    'terra': 'Terra',
    'água': 'Água',
    'agua': 'Água',
    'fogo': 'Fogo',
    'ar': 'Ar',
    'éter': 'Éter',
    'eter': 'Éter',
    'ether': 'Éter',
    'akasha': 'Éter',
  };
  return elementMap[elemento.toLowerCase()] ?? elemento as Elemento;
}
