/**
 * Chakra-Odú Ifá Spiritual Correlation Module
 * Maps each of the 7 main chakras to their associated Odu Ifá (Merindilogun)
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

import type { ChakraName } from './chakra-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface OduInfo {
  numero: number;
  nome: string;
  nomeingles: string;
}

export interface ChakraOduMapping {
  chakra: ChakraName;
  chakra_numero: number;
  chakra_nome_portugues: string;
  odu: {
    primario: OduInfo;
    secundario: OduInfo | null;
  };
  elemento: Elemento;
  propriedades: {
    qualidade: string;
    direcao: string;
    estacao: string;
  };
  praticas_espirituais: {
    tipo: string;
    descricao: string;
    mantras: string[];
    ebos: string[];
    cores: string[];
  };
}

// ─── Chakra to Odu Ifá Mapping ─────────────────────────────────────────────────

export const CHAKRA_ODU_MAPPINGS: Record<ChakraName, ChakraOduMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: 1,
    chakra_nome_portugues: '1º Básico',
    odu: {
      primario: {
        numero: 4,
        nome: 'Irosun',
        nomeingles: 'Irosun',
      },
      secundario: {
        numero: 1,
        nome: 'Okaran',
        nomeingles: 'Okaran',
      },
    },
    elemento: 'Terra',
    propriedades: {
      qualidade: 'Estrutura, ancoramento, sobrevivência',
      direcao: 'Norte',
      estacao: 'Inverno',
    },
    praticas_espirituais: {
      tipo: 'Aterramento e dissolução de medos',
      descricao: 'Conexão com a terra para dissolver medos de sobrevivência e estabelecer ancoramento energético',
      mantras: ['LAM (396 Hz)', 'KRIM'],
      ebos: ['Firmeza comquiabo', 'Aterramento com raízes', 'Saudação a Obaluaiê para proteção física'],
      cores: ['Vermelho', 'Marrom', 'Preto'],
    },
  },

  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: 2,
    chakra_nome_portugues: '2º Sacro',
    odu: {
      primario: {
        numero: 8,
        nome: 'Oponla',
        nomeingles: 'Oponla',
      },
      secundario: {
        numero: 11,
        nome: 'Ogundá',
        nomeingles: 'Ogundá',
      },
    },
    elemento: 'Água',
    propriedades: {
      qualidade: 'Fluidez, emoção, fertilidade',
      direcao: 'Oeste',
      estacao: 'Outono',
    },
    praticas_espirituais: {
      tipo: 'Criatividade e transmutação emocional',
      descricao: 'Desbloqueio da criatividade, transmutação de traumas emocionais através da fluidez emocional',
      mantras: ['VAM (417 Hz)', 'RAM (528 Hz)'],
      ebos: ['Oferendas aquáticas a Oxum', 'Purificação com água de florais', 'Libações para os Orixás das águas'],
      cores: ['Laranja', 'Vermelho-alaranjado', 'Azul claro'],
    },
  },

  Manipura: {
    chakra: 'Manipura',
    chakra_numero: 3,
    chakra_nome_portugues: '3º Plexo Solar',
    odu: {
      primario: {
        numero: 12,
        nome: 'Ejilsebora',
        nomeingles: 'Ejilsebora',
      },
      secundario: {
        numero: 6,
        nome: 'Obará',
        nomeingles: 'Obará',
      },
    },
    elemento: 'Fogo',
    propriedades: {
      qualidade: 'Transformação, vontade, poder pessoal',
      direcao: 'Sul',
      estacao: 'Verão',
    },
    praticas_espirituais: {
      tipo: 'Força de vontade e transformação',
      descricao: 'Fortalece a vontade interior, transformação através do fogo, equilíbrio mental e justiça divina',
      mantras: ['RAM (528 Hz)', 'AUM'],
      ebos: ['Amalá com fumo para Xangô', 'Firmeza de raio (quartzo)', 'Rituais de fogo e justiça'],
      cores: ['Amarelo', 'Dourado', 'Laranja'],
    },
  },

  Anahata: {
    chakra: 'Anahata',
    chakra_numero: 4,
    chakra_nome_portugues: '4º Cardíaco',
    odu: {
      primario: {
        numero: 7,
        nome: 'Osá',
        nomeingles: 'Osa',
      },
      secundario: {
        numero: 14,
        nome: 'Daí',
        nomeingles: 'Dai',
      },
    },
    elemento: 'Ar',
    propriedades: {
      qualidade: 'Harmonia, amor incondicional, expansão',
      direcao: 'Leste',
      estacao: 'Primavera',
    },
    praticas_espirituais: {
      tipo: 'Expansão do afeto e harmonização',
      descricao: 'Expansão do afeto incondicional, harmonização de relacionamentos e cura emocional',
      mantras: ['YAM (639 Hz)', 'YAH'],
      ebos: ['Presentes para Oxum', 'Harmonização com flores', 'Saudação a Iemanjá para paz interior'],
      cores: ['Verde', 'Rosa', 'Amarelo-claro'],
    },
  },

  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: 5,
    chakra_nome_portugues: '5º Laríngeo',
    odu: {
      primario: {
        numero: 5,
        nome: 'Meí',
        nomeingles: 'Mei',
      },
      secundario: {
        numero: 15,
        nome: 'Kanji',
        nomeingles: 'Kanji',
      },
    },
    elemento: 'Ar',
    propriedades: {
      qualidade: 'Expressão, comunicação, verdade',
      direcao: 'Leste',
      estacao: 'Primavera',
    },
    praticas_espirituais: {
      tipo: 'Expressão da verdade interna',
      descricao: 'Purificação da comunicação, expressão da verdade interna e poder da palavra falada',
      mantras: ['HAM (741 Hz)', 'OM'],
      ebos: ['Ofurô com folhas sagradas', 'Purificação da fala', 'Rituais de Ogum para proteção da palavra'],
      cores: ['Azul claro', 'Azul-turquesa', 'Branco'],
    },
  },

  Ajna: {
    chakra: 'Ajna',
    chakra_numero: 6,
    chakra_nome_portugues: '6º Frontal',
    odu: {
      primario: {
        numero: 2,
        nome: 'Ejiokô',
        nomeingles: 'Ejiokô',
      },
      secundario: {
        numero: 10,
        nome: 'Ocanha',
        nomeingles: 'Ocanha',
      },
    },
    elemento: 'Éter',
    propriedades: {
      qualidade: 'Intuição, visão clara, percepção',
      direcao: 'Centro',
      estacao: 'Todas',
    },
    praticas_espirituais: {
      tipo: 'Despertar da intuição',
      descricao: 'Despertar da intuição profunda, visão clara e dissolução de ilusões mentais',
      mantras: ['OM (852 Hz)', 'SHADDAI EL CHAI'],
      ebos: ['Consagração a Orunmilá', 'Merindilogun para clarividência', 'Rituais de conhecimento oculto'],
      cores: ['Índigo', 'Roxo', 'Branco lunar'],
    },
  },

  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: 7,
    chakra_nome_portugues: '7º Coronário',
    odu: {
      primario: {
        numero: 16,
        nome: 'Oxumá',
        nomeingles: 'Oxuma',
      },
      secundario: {
        numero: 9,
        nome: 'Ejiá',
        nomeingles: 'Ejia',
      },
    },
    elemento: 'Éter',
    propriedades: {
      qualidade: 'Unidade, iluminação, transcendência',
      direcao: 'Zênite',
      estacao: 'Eterno',
    },
    praticas_espirituais: {
      tipo: 'Conexão espiritual direta',
      descricao: 'Conexão espiritual direta com a Fonte, iluminação da mente através do silêncio e transcendência',
      mantras: ['AUM (963 Hz)', 'SILÊNCIO', 'EHEIEH'],
      ebos: ['Rituais de Oxalá', 'Consagração a Olodumaré', 'Oração em silêncio e contemplação'],
      cores: ['Branco', 'Dourado', 'Transparente'],
    },
  },
};

// ─── Lookup Functions ──────────────────────────────────────────────────────────

/**
 * Returns the complete chakra-odu mapping for a given chakra.
 * @param chakra - Chakra name (e.g., 'Muladhara', 'Ajna') or number ('1º Básico', '6º Frontal')
 * @returns The ChakraOduMapping or null if not found
 */
export function getChakraOdu(chakra: string): ChakraOduMapping | null {
  const normalized = normalizeChakraName(chakra);
  return CHAKRA_ODU_MAPPINGS[normalized as ChakraName] ?? null;
}

/**
 * Returns the chakra associated with a given Odu number.
 * @param oduNumero - Odu number (1-16)
 * @returns The ChakraOduMapping or null if not found
 */
export function getOduChakra(oduNumero: number): ChakraOduMapping | null {
  for (const mapping of Object.values(CHAKRA_ODU_MAPPINGS)) {
    if (mapping.odu.primario.numero === oduNumero) {
      return mapping;
    }
    if (mapping.odu.secundario?.numero === oduNumero) {
      return mapping;
    }
  }
  return null;
}

/**
 * Returns all chakra-odu mappings.
 * @returns Array of all ChakraOduMapping sorted by chakra number
 */
export function getAllChakraOdus(): ChakraOduMapping[] {
  return Object.values(CHAKRA_ODU_MAPPINGS).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Returns all Odu numbers associated with a specific chakra.
 * @param chakra - Chakra name
 * @returns Array of Odu numbers or empty array if chakra not found
 */
export function getOduNumbersByChakra(chakra: string): number[] {
  const mapping = getChakraOdu(chakra);
  if (!mapping) return [];

  const numbers = [mapping.odu.primario.numero];
  if (mapping.odu.secundario) {
    numbers.push(mapping.odu.secundario.numero);
  }
  return numbers;
}

/**
 * Returns the primary Odu for a given chakra.
 * @param chakra - Chakra name
 * @returns Primary OduInfo or null if not found
 */
export function getPrimaryOdu(chakra: string): OduInfo | null {
  return getChakraOdu(chakra)?.odu.primario ?? null;
}

/**
 * Returns the secondary Odu for a given chakra.
 * @param chakra - Chakra name
 * @returns Secondary OduInfo or null if not found
 */
export function getSecondaryOdu(chakra: string): OduInfo | null {
  return getChakraOdu(chakra)?.odu.secundario ?? null;
}

/**
 * Get all chakras associated with a specific element.
 * @param elemento - Element name (Terra, Água, Fogo, Ar, Éter)
 * @returns Array of ChakraOduMapping or empty array
 */
export function getChakrasByElement(elemento: string): ChakraOduMapping[] {
  const normalized = normalizeElementName(elemento);
  return Object.values(CHAKRA_ODU_MAPPINGS).filter(
    (mapping) => mapping.elemento === normalized
  );
}

/**
 * Normalizes chakra name to match ChakraName type.
 * Handles variations like '1º Básico', '6º Frontal', etc.
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    'muladhara': 'Muladhara',
    'basic': 'Muladhara',
    'root': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    'svadhisthana': 'Svadhisthana',
    'sacro': 'Svadhisthana',
    'sacral': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    'manipura': 'Manipura',
    'plexo': 'Manipura',
    'solar': 'Manipura',
    'solar plexus': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    'anahata': 'Anahata',
    'cardíaco': 'Anahata',
    'cardiac': 'Anahata',
    'heart': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    'vishuddha': 'Vishuddha',
    'laríngeo': 'Vishuddha',
    'throat': 'Vishuddha',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    'ajna': 'Ajna',
    'frontal': 'Ajna',
    'third eye': 'Ajna',
    'third eye chakra': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
    'sahasrara': 'Sahasrara',
    'coronário': 'Sahasrara',
    'coronary': 'Sahasrara',
    'crown': 'Sahasrara',
  };

  const lower = chakra.toLowerCase().trim();
  return chakraMap[lower] ?? chakra;
}

/**
 * Normalizes element name to match Elemento type.
 */
function normalizeElementName(elemento: string): Elemento {
  const elementMap: Record<string, Elemento> = {
    'terra': 'Terra',
    'earth': 'Terra',
    'água': 'Água',
    'agua': 'Água',
    'water': 'Água',
    'fogo': 'Fogo',
    'fire': 'Fogo',
    'ar': 'Ar',
    'air': 'Ar',
    'éter': 'Éter',
    'eter': 'Éter',
    'ether': 'Éter',
    'space': 'Éter',
  };

  const lower = elemento.toLowerCase().trim();
  return elementMap[lower] ?? elemento as Elemento;
}

// Default export
export default {
  getChakraOdu,
  getOduChakra,
  getAllChakraOdus,
  getOduNumbersByChakra,
  getPrimaryOdu,
  getSecondaryOdu,
  getChakrasByElement,
  CHAKRA_ODU_MAPPINGS,
};