/**
 * Remove accents and ordinal indicators from a string for normalized matching
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritics
    .replace(/[º°]/g, '') // Remove ordinal indicators
    .replace(/º/g, '')
    .trim();
}
 * Maps each of the 7 primary chakras to their associated Solfeggio frequency,
 * element connections, and healing properties.
 * This is the reverse lookup from frequency-chakra.ts
 */

/**
 * Chakra-Frequency correlation interface
 */
export interface ChakraFrequency {
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Chakra name in Portuguese */
  chakra: string;
  /** Sanskrit name for the chakra */
  chakra_sanskrit: string;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** Primary element associated with this chakra */
  elemento: string;
  /** Elemental qualities */
  qualidades_elementais: string[];
  /** Direction of elemental energy */
  direcao_energetica: string;
  /** Seed sound / mantram */
  mantram: string;
  /** Healing properties breakdown */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice */
    pratica_recomendada: string;
  };
}

/**
 * Complete mapping of the 7 primary chakras to their Solfeggio frequencies,
 * elements, mantrams, and healing properties
 */
export const CHAKRA_FREQUENCY_MAP: Record<string, ChakraFrequency> = {
  '1': {
    chakra_numero: 1,
    chakra: '1º Básico',
    chakra_sanskrit: 'Muladhara',
    frequencia: 396,
    elemento: 'Terra',
    qualidades_elementais: ['Frio', 'Seco', 'Estável'],
    direcao_energetica: 'Descendente e centrípeto',
    mantram: 'LAM',
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
  },
  '2': {
    chakra_numero: 2,
    chakra: '2º Sacro',
    chakra_sanskrit: 'Svadhisthana',
    frequencia: 417,
    elemento: 'Água',
    qualidades_elementais: ['Frio', 'Úmido', 'Fluido'],
    direcao_energetica: 'Ondulante e expansivo',
    mantram: 'VAM',
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
  },
  '3': {
    chakra_numero: 3,
    chakra: '3º Plexo Solar',
    chakra_sanskrit: 'Manipura',
    frequencia: 528,
    elemento: 'Fogo',
    qualidades_elementais: ['Quente', 'Seco', 'Transformador'],
    direcao_energetica: 'Ascendente e radiante',
    mantram: 'RAM',
    propriedades_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
  },
  '4': {
    chakra_numero: 4,
    chakra: '4º Cardíaco',
    chakra_sanskrit: 'Anahata',
    frequencia: 639,
    elemento: 'Ar',
    qualidades_elementais: ['Neutro', 'Úmido', 'Harmonizador'],
    direcao_energetica: 'Bidirecional e difuso',
    mantram: 'YAM',
    propriedades_healing: {
      fisico: 'Equilibra sistema circulatório e coração',
      emocional: 'Promove perdão, amor próprio e compaixão universal',
      mental_espiritual: 'Abre canais de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
  },
  '5': {
    chakra_numero: 5,
    chakra: '5º Laríngeo',
    chakra_sanskrit: 'Vishuddha',
    frequencia: 741,
    elemento: 'Ar',
    qualidades_elementais: ['Quente', 'Seco', 'Expressivo'],
    direcao_energetica: 'Ascendente e libertador',
    mantram: 'HAM',
    propriedades_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
  },
  '6': {
    chakra_numero: 6,
    chakra: '6º Frontal',
    chakra_sanskrit: 'Ajna',
    frequencia: 852,
    elemento: 'Éter',
    qualidades_elementais: ['Neutro', 'Puro', 'Iluminador'],
    direcao_energetica: 'Expansivo e unificador',
    mantram: 'OM',
    propriedades_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
  },
  '7': {
    chakra_numero: 7,
    chakra: '7º Coronário',
    chakra_sanskrit: 'Sahasrara',
    frequencia: 963,
    elemento: 'Éter (Quintessência)',
    qualidades_elementais: ['Neutro', 'Puro', 'Transcendente'],
    direcao_energetica: 'Centrípeto e ascendente simultâneo',
    mantram: 'AUM / SILÊNCIO',
    propriedades_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(CHAKRA_FREQUENCY_MAP);
Object.values(CHAKRA_FREQUENCY_MAP).forEach((mapping) => {
  Object.freeze(mapping.propriedades_healing);
  Object.freeze(mapping.qualidades_elementais);
  Object.freeze(mapping);
});

/**
 * Chakra number to frequency lookup table
 */
const CHAKRA_NUMERO_TO_FREQUENCY: Record<number, number> = {
  1: 396,
  2: 417,
  3: 528,
  4: 639,
  5: 741,
  6: 852,
  7: 963,
};

/**
 * Chakra name to frequency lookup (normalized lowercase)
 */
const CHAKRA_NAME_TO_FREQUENCY: Record<string, number> = {
  // Normalized Portuguese names (no accents)
  '1 basico': 396,
  '1 basico chakra': 396,
  'chakra 1': 396,
  // Sanskrit and English
  'muladhara': 396,
  'root': 396,
  'basic': 396,
  'raiz': 396,
  // 2
  '2 sacro': 417,
  '2 sacro chakra': 417,
  'chakra 2': 417,
  'svadhisthana': 417,
  'sacral': 417,
  'sacro': 417,
  // 3
  '3 plexo solar': 528,
  '3 plexo solar chakra': 528,
  'chakra 3': 528,
  'manipura': 528,
  'solar plexus': 528,
  'plexo': 528,
  'plexo solar': 528,
  'solar': 528,
  // 4
  '4 cardiaco': 639,
  '4 cardiaco chakra': 639,
  'chakra 4': 639,
  'anahata': 639,
  'heart': 639,
  'cardiaco': 639,
  'coracao': 639,
  // 5
  '5 laringeo': 741,
  '5 laringeo chakra': 741,
  'chakra 5': 741,
  'vishuddha': 741,
  'throat': 741,
  'laringeo': 741,
  'garganta': 741,
  'ajna': 852,
  'anja': 852,
  '3rd eye': 852,
  '7 coronario': 963,
  '7 coronario chakra': 963,
  'chakra 7': 963,
  'sahasrara': 963,
  'crown': 963,
  'coronario': 963,
  'coroa': 963,
};

/**
 * Get the Solfeggio frequency for a given chakra
 * @param chakra - Chakra name (e.g., '1º Básico', 'Muladhara', '1') or number (1-7)
 * @returns Frequency in Hz or null if not found
 */
export function getChakraFrequency(chakra: string | number): number | null {
  if (typeof chakra === 'number') {
    return CHAKRA_NUMERO_TO_FREQUENCY[chakra] ?? null;
  }

  // Normalize input string (remove accents)
  const normalized = normalizeString(chakra);
  // Reject empty or too short strings
  if (normalized.length < 3) {
    return null;
  }
  // Try exact match first (with accent normalization)
  for (const [key, value] of Object.entries(CHAKRA_NAME_TO_FREQUENCY)) {
    if (normalized === key) {
      return value;
    }
  }
  // Try partial matching only for longer strings (>= 4 chars)
  if (normalized.length >= 4) {
    for (const [key, value] of Object.entries(CHAKRA_NAME_TO_FREQUENCY)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
  }
   return null;
}

/**
 * Get the frequency-chakra lookup map
 * Returns the underlying lookup table for frequency to chakra conversion
 * @returns Frequency to ChakraFrequency lookup object
 */
export function getFrequencyChakra(): Record<number, ChakraFrequency> {
  const lookup: Record<number, ChakraFrequency> = {};
  for (const chakra of Object.values(CHAKRA_FREQUENCY_MAP)) {
    lookup[chakra.frequencia] = chakra;
  }
  return lookup;
}

/**
 * Get all available chakra-frequency mappings
 * @returns Array of all ChakraFrequency mappings sorted by chakra number
 */
export function getAllChakraFrequencies(): ChakraFrequency[] {
  return Object.values(CHAKRA_FREQUENCY_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Get the ChakraFrequency data for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns ChakraFrequency mapping or null if not found
 */
export function getChakraByFrequency(frequencia: number): ChakraFrequency | null {
  const lookup = getFrequencyChakra();
  return lookup[frequencia] ?? null;
}

/**
 * Get the Sanskrit name for a given chakra
 * @param chakra - Chakra name or number
 * @returns Sanskrit name or null if not found
 */
export function getChakraSanskrit(chakra: string | number): string | null {
  if (typeof chakra === 'number') {
    return CHAKRA_FREQUENCY_MAP[chakra.toString()]?.chakra_sanskrit ?? null;
  }
  const frequency = getChakraFrequency(chakra);
  if (frequency === null) return null;
  return CHAKRA_FREQUENCY_MAP[frequency.toString()]?.chakra_sanskrit ?? null;
}

/**
 * Get the mantram (seed sound) for a given chakra
 * @param chakra - Chakra name or number
 * @returns Mantram string or null if not found
 */
export function getChakraMantram(chakra: string | number): string | null {
  if (typeof chakra === 'number') {
    return CHAKRA_FREQUENCY_MAP[chakra.toString()]?.mantram ?? null;
  }
  const frequency = getChakraFrequency(chakra);
  if (frequency === null) return null;
  return CHAKRA_FREQUENCY_MAP[frequency.toString()]?.mantram ?? null;
}

/**
 * Get the element associated with a given chakra
 * @param chakra - Chakra name or number
 * @returns Element string or null if not found
 */
export function getChakraElement(chakra: string | number): string | null {
  if (typeof chakra === 'number') {
    return CHAKRA_FREQUENCY_MAP[chakra.toString()]?.elemento ?? null;
  }
  const frequency = getChakraFrequency(chakra);
  if (frequency === null) return null;
  return CHAKRA_FREQUENCY_MAP[frequency.toString()]?.elemento ?? null;
}

/**
 * Get the healing properties for a given chakra
 * @param chakra - Chakra name or number
 * @returns Healing properties object or null if not found
 */
export function getChakraHealing(chakra: string | number): ChakraFrequency['propriedades_healing'] | null {
  if (typeof chakra === 'number') {
    return CHAKRA_FREQUENCY_MAP[chakra.toString()]?.propriedades_healing ?? null;
  }
  const frequency = getChakraFrequency(chakra);
  if (frequency === null) return null;
  return CHAKRA_FREQUENCY_MAP[frequency.toString()]?.propriedades_healing ?? null;
}

/**
 * Get the energy direction for a given chakra
 * @param chakra - Chakra name or number
 * @returns Direction string or null if not found
 */
export function getChakraDirection(chakra: string | number): string | null {
  if (typeof chakra === 'number') {
    return CHAKRA_FREQUENCY_MAP[chakra.toString()]?.direcao_energetica ?? null;
  }
  const frequency = getChakraFrequency(chakra);
  if (frequency === null) return null;
  return CHAKRA_FREQUENCY_MAP[frequency.toString()]?.direcao_energetica ?? null;
}

/**
 * Get all chakras associated with a specific element
 * @param elemento - Element name (e.g., 'Terra', 'Água', 'Fogo', 'Ar', 'Éter')
 * @returns Array of ChakraFrequency mappings for that element
 */
export function getChakrasByElement(elemento: string): ChakraFrequency[] {
  const normalized = elemento.toLowerCase().trim();
  return getAllChakraFrequencies().filter(
    (chakra) => chakra.elemento.toLowerCase().includes(normalized)
  );
}

/**
 * Validate if a chakra identifier is valid
 * @param chakra - Chakra identifier (name or number)
 * @returns true if valid, false otherwise
 */
export function isValidChakra(chakra: string | number): boolean {
  return getChakraFrequency(chakra) !== null;
}

/**
 * Get all 7 chakra numbers
 * @returns Array of chakra numbers [1, 2, 3, 4, 5, 6, 7]
 */
export function getAllChakraNumbers(): number[] {
  return [1, 2, 3, 4, 5, 6, 7];
}

/**
 * Get all Solfeggio frequencies mapped to chakras
 * @returns Array of frequencies [396, 417, 528, 639, 741, 852, 963]
 */
export function getAllSolfeggioFrequencies(): number[] {
  return [396, 417, 528, 639, 741, 852, 963];
}
