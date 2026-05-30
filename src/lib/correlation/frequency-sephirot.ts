/**
 * Frequency-Sephirot Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to the 10 Sephiroth of the Tree of Life
 * Source: Cabala dos Caminhos system and sacred geometry principles
 */

export type Sephirah =
  | 'Kether'
  | 'Chokmah'
  | 'Binah'
  | 'Chesed'
  | 'Gevurah'
  | 'Tiferet'
  | 'Netzach'
  | 'Hod'
  | 'Yesod'
  | 'Malchut';

/**
 * Represents the correlation between a Solfeggio frequency and its Sephirah correspondence
 */
export interface FrequencySephirotMapping {
  /** Frequency in Hz */
  frequencia: number;
  /** Primary Sephirah name (Hebrew) */
  sephirah: Sephirah;
  /** Path number on the Tree of Life (1-22) */
  caminho: number;
  /** Associated element */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Sephirah meanings and characteristics */
  caracteristicas: {
    /** Portuguese name */
    nome_portugues: string;
    /** Divine name association */
    nome_divino: string;
    /** Archangel correspondence */
    arcanjo: string;
    /** Angelic order */
    ordem_angelical: string;
    /** Planetary correspondence when applicable */
    planeta?: string;
    /** Classical element when applicable */
    elemento_classico?: string;
  };
  /** Spiritual applications */
  aplicacao_espiritual: {
    /** Primary spiritual focus */
    foco_primario: string;
    /** Meditation guidance */
    meditacao: string;
    /** Affirmation for this frequency-sephirah */
    afiliacao: string;
    /** Transformation goal */
    transformacao: string;
  };
  /** Chakra correspondence */
  chakra: string;
  /** Orixá with vibrational affinity */
  orixa: string;
}

/**
 * Complete mapping of Solfeggio frequencies to their Sephirot correspondences.
 * Based on the Cabala dos Caminhos system data.
 * Each frequency carries the vibrational signature of its corresponding Sephirah.
 */
export const FREQUENCY_SEPHIROT_MAP: Record<number, FrequencySephirotMapping> = {
  396: {
    frequencia: 396,
    sephirah: 'Malchut',
    caminho: 32,
    elemento: 'Terra',
    caracteristicas: {
      nome_portugues: 'Reino',
      nome_divino: 'Adonai Ha-Aretz',
      arcanjo: 'Gabriel',
      ordem_angelical: 'Kerubim',
      planeta: undefined,
      elemento_classico: 'Terra',
    },
    aplicacao_espiritual: {
      foco_primario: 'Ancoramento e manifestação no mundo físico',
      meditacao: 'Conecte-se com a terra, visualize raízes descendo ao centro da Terra',
      afiliacao: 'Eu me ancoro na abundância do Reino',
      transformacao: 'Transformo limitações em realidade concreta',
    },
    chakra: '1º Básico (Muladhara)',
    orixa: 'Oxalufã',
  },
  417: {
    frequencia: 417,
    sephirah: 'Yesod',
    caminho: 31,
    elemento: 'Água',
    caracteristicas: {
      nome_portugues: 'Fundação',
      nome_divino: 'Shaddai El Chai',
      arcanjo: 'Gabriel',
      ordem_angelical: 'Ishim',
      planeta: 'Lua',
      elemento_classico: 'Água',
    },
    aplicacao_espiritual: {
      foco_primario: 'Transformação e liberação de padrões passados',
      meditacao: 'Permita que as águas lavem traumas e memórias limitantes',
      afiliacao: 'Eu libero o passado e fluo com a vida',
      transformacao: 'Dissolvo bloqueios emocionais e inconscientes',
    },
    chakra: '2º Sacro (Svadhisthana)',
    orixa: 'Oxum',
  },
  528: {
    frequencia: 528,
    sephirah: 'Tiferet',
    caminho: 6,
    elemento: 'Fogo',
    caracteristicas: {
      nome_portugues: 'Beleza/Harmonia',
      nome_divino: 'Elohim',
      arcanjo: 'Michael',
      ordem_angelical: 'Malachim',
      planeta: 'Sol',
      elemento_classico: 'Fogo',
    },
    aplicacao_espiritual: {
      foco_primario: 'Amor, compaixão e integração do self',
      meditacao: 'Visualize uma luz dourada no centro do peito, irradiando amor incondicional',
      afiliacao: 'Eu sou amor e compaixão em ação',
      transformacao: 'Transmuto negatividade em amor e harmonia',
    },
    chakra: '4º Cardíaco (Anahata)',
    orixa: 'Xangô',
  },
  639: {
    frequencia: 639,
    sephirah: 'Netzach',
    caminho: 28,
    elemento: 'Ar',
    caracteristicas: {
      nome_portugues: 'Vitória',
      nome_divino: 'YHVH Tzabaoth',
      arcanjo: 'Haniel',
      ordem_angelical: 'Elohim',
      planeta: 'Vênus',
      elemento_classico: 'Ar',
    },
    aplicacao_espiritual: {
      foco_primario: 'Harmonia em relacionamentos e conexões',
      meditacao: 'Abra o coração para dar e receber amor harmoniosamente',
      afiliacao: 'Eu atraio relacionamentos harmônicos e significativos',
      transformacao: 'Harmonizo todas as minhas conexões relacionais',
    },
    chakra: '4º Cardíaco (Anahata)',
    orixa: 'Oxóssi',
  },
  741: {
    frequencia: 741,
    sephirah: 'Hod',
    caminho: 29,
    elemento: 'Ar',
    caracteristicas: {
      nome_portugues: 'Glória/Esplendor',
      nome_divino: 'Elohim Tzabaoth',
      arcanjo: 'Michael',
      ordem_angelical: 'Serafim',
      planeta: 'Mercúrio',
      elemento_classico: 'Ar',
    },
    aplicacao_espiritual: {
      foco_primario: 'Expressão autêntica e comunicação divina',
      meditacao: 'Permita que sua voz interior se expresse com clareza e verdade',
      afiliacao: 'Eu comunico minha verdade com poder e graça',
      transformacao: 'Liberto o medo de falar minha verdade',
    },
    chakra: '5º Laríngeo (Vishuddha)',
    orixa: 'Iansã',
  },
  852: {
    frequencia: 852,
    sephirah: 'Chokmah',
    caminho: 13,
    elemento: 'Éter',
    caracteristicas: {
      nome_portugues: 'Sabedoria',
      nome_divino: 'YHVH',
      arcanjo: 'Raziel',
      ordem_angelical: 'Auphanim',
      planeta: undefined,
      elemento_classico: undefined,
    },
    aplicacao_espiritual: {
      foco_primario: 'Despertar da intuição e sabedoria divina',
      meditacao: 'Visualize um movimento espiral de sabedoria descendo do alto',
      afiliacao: 'Eu acesso a sabedoria divina e a intuição pura',
      transformacao: 'Desperto minha capacidade de ver além das ilusões',
    },
    chakra: '6º Frontal (Ajna)',
    orixa: 'Oxumaré',
  },
  963: {
    frequencia: 963,
    sephirah: 'Kether',
    caminho: 1,
    elemento: 'Éter',
    caracteristicas: {
      nome_portugues: 'Coroa',
      nome_divino: 'Ehyeh',
      arcanjo: 'Metatron',
      ordem_angelical: 'Ofanim',
      planeta: undefined,
      elemento_classico: undefined,
    },
    aplicacao_espiritual: {
      foco_primario: 'Conexão direta com a Fonte/Deus',
      meditacao: 'Dissolva-se na luz branca infinita, transcendendo todo o véu',
      afiliacao: 'Eu sou um com a Fonte infinita de toda vida',
      transformacao: 'Alcanço a iluminação e a paz suprema',
    },
    chakra: '7º Coronário (Sahasrara)',
    orixa: 'Olokun',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_SEPHIROT_MAP);
Object.values(FREQUENCY_SEPHIROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All Solfeggio frequencies mapped to Sephiroth
 */
export const SOLFEGGIO_SEPHIROT_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-sephirot mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencySephirotMapping or null if not found
 */
export function getFrequencySephirot(frequencia: number): FrequencySephirotMapping | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia] ?? null;
}

/**
 * Get the Sephirah corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Sephirah name or null if not found
 */
export function getSephirotByFrequency(frequencia: number): Sephirah | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.sephirah ?? null;
}
/**
 * Get the frequency corresponding to a given Sephirah
 * @param sephirah - Sephirah name (e.g., 'Kether', 'Chokmah', 'Malchut')
 * @returns Frequency in Hz or null if not found
 */
export function getSephirotFrequency(sephirah: string): number | null {
  const sephirahNormalized = sephirah.toLowerCase().trim();
  const entry = Object.values(FREQUENCY_SEPHIROT_MAP).find(
    (mapping) => mapping.sephirah.toLowerCase() === sephirahNormalized
  );
  return entry?.frequencia ?? null;
}

/**
 * Get all frequencies mapped to a specific Sephirah
 * @param sephirah - Sephirah name (e.g., 'Kether', 'Chokmah', 'Malchut')
 * @returns Array of FrequencySephirotMapping
 */
export function getFrequenciesBySephirah(sephirah: string): FrequencySephirotMapping[] {
  return Object.values(FREQUENCY_SEPHIROT_MAP).filter(
    (mapping) => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Get the path number for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Path number or null if not found
 */
export function getPathByFrequency(frequencia: number): number | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.caminho ?? null;
}

/**
 * Get the element connection for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get the spiritual application for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Spiritual application object or null if not found
 */
export function getSpiritualApplicationByFrequency(
  frequencia: number
): FrequencySephirotMapping['aplicacao_espiritual'] | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.aplicacao_espiritual ?? null;
}

/**
 * Get the Sephirah characteristics for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Characteristics object or null if not found
 */
export function getSephirotCharacteristicsByFrequency(
  frequencia: number
): FrequencySephirotMapping['caracteristicas'] | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.caracteristicas ?? null;
}

/**
 * Get the Chakra associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra name or null if not found
 */
export function getChakraByFrequency(frequencia: number): string | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.chakra ?? null;
}

/**
 * Get the Orixá associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Orixá name or null if not found
 */
export function getOrixaByFrequency(frequencia: number): string | null {
  return FREQUENCY_SEPHIROT_MAP[frequencia]?.orixa ?? null;
}

/**
 * Get all Sephirot names used in the mapping
 * @returns Array of unique Sephirah names
 */
export function getAllSephiroth(): Sephirah[] {
  return [...new Set(Object.values(FREQUENCY_SEPHIROT_MAP).map((m) => m.sephirah))];
}

/**
 * Get all available frequency-sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencySephiroth(): FrequencySephirotMapping[] {
  return Object.values(FREQUENCY_SEPHIROT_MAP);
}

/**
 * Get frequencies by their element
 * @param elemento - Element name (e.g., 'Terra', 'Água', 'Fogo', 'Ar', 'Éter')
 * @returns Array of FrequencySephirotMapping
 */
export function getFrequenciesByElement(elemento: string): FrequencySephirotMapping[] {
  return Object.values(FREQUENCY_SEPHIROT_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get frequencies by their path number on the Tree of Life
 * @param caminho - Path number (1-32)
 * @returns Array of FrequencySephirotMapping
 */
export function getFrequenciesByPath(caminho: number): FrequencySephirotMapping[] {
  return Object.values(FREQUENCY_SEPHIROT_MAP).filter((mapping) => mapping.caminho === caminho);
}

/**
 * Normalizes Sephirah name to match Sephirah type
 * Handles case-insensitive matching and variations
 */
function normalizeSephirahName(sephirah: string): Sephirah | null {
  const normalizado = sephirah.toLowerCase().trim();

  const mapping: Record<string, Sephirah> = {
    kether: 'Kether',
    chokmah: 'Chokmah',
    binah: 'Binah',
    chesed: 'Chesed',
    gevurah: 'Gevurah',
    tiferet: 'Tiferet',
    netzach: 'Netzach',
    hod: 'Hod',
    yesod: 'Yesod',
    malchut: 'Malchut',
    // Alternative names
    coroa: 'Kether',
    sabedoria: 'Chokmah',
    entendimento: 'Binah',
    misericordia: 'Chesed',
    julgamento: 'Gevurah',
    fortaleza: 'Gevurah',
    beleza: 'Tiferet',
    harmon: 'Tiferet',
    vitoria: 'Netzach',
    gloria: 'Hod',
    espl: 'Hod',
    fundacao: 'Yesod',
    reino: 'Malchut',
  };

  return mapping[normalizado] ?? null;
}