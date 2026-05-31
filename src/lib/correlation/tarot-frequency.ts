/**
 * Tarot-Frequency Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to Solfeggio frequencies
 * Based on vibrational correspondences between archetypal energies and healing frequencies
 * Source: Cabala dos Caminhos spiritual system
 */

/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Tarot Major Arcana card and its Solfeggio frequency
 */
export interface TarotFrequencyMapping {
  /** Major Arcana card number (0-21) */
  numero_carta: number;
  /** Tarot arcano name in Portuguese */
  arcano: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Associated element */
  elemento: Elemento;
  /** Chakra correspondence (1-7) */
  chakra: number;
  /** Chakra name in Portuguese */
  chakra_nome: string;
  /** Spiritual meaning of the arcano */
  significado_espiritual: string;
  /** Healing properties of the frequency */
  propriedades_healing: string[];
  /** Associated Orixá (if any) */
  orixa?: string;
  /** Associated Sephirah (if any) */
  sephirah?: string;
}

/**
 * Complete mapping of the 22 Major Arcana cards to their Solfeggio frequency correspondences.
 * Based on vibrational spiritual correspondences where each arcano carries a specific
 * energetic frequency that can be used for spiritual work and healing.
 */
export const TAROT_FREQUENCY_MAP: Record<number, TarotFrequencyMapping> = {
  // 0 - O Louco - New beginnings, freedom, leap of faith
  0: {
    numero_carta: 0,
    arcano: 'O Louco',
    frequencia: 417,
    elemento: 'Ar',
    chakra: 5,
    chakra_nome: 'Vishuddha (Garganta)',
    significado_espiritual: 'Libertação, novos começos, salto de fé, espontaneidade, travels, unbounded potential',
    propriedades_healing: ['Facilita mudanças', 'Remove bloqueios', 'Promove transformação', 'Liberta de padrões'],
    orixa: 'Eshu',
    sephirah: 'Aleph',
  },
  // I - O Mago - Power, skill, wisdom, will
  1: {
    numero_carta: 1,
    arcano: 'O Mago',
    frequencia: 396,
    elemento: 'Ar',
    chakra: 5,
    chakra_nome: 'Vishuddha (Garganta)',
    significado_espiritual: 'Vontade, poder pessoal, habilidade, manifesttação, recursos internos',
    propriedades_healing: ['Ativa poder pessoal', 'Fortalece willpower', 'Desbloqueia talentos', 'Promove manifesttação'],
    orixa: 'Exu',
    sephirah: 'Beth',
  },
  // II - A Sacerdotisa - Secrets, mystery, intuition, knowledge
  2: {
    numero_carta: 2,
    arcano: 'A Sacerdotisa',
    frequencia: 528,
    elemento: 'Água',
    chakra: 6,
    chakra_nome: 'Ajna (Terceiro Olho)',
    significado_espiritual: 'Intuição, mistérios ocultos, sabedoria interior, lua, inconsciente',
    propriedades_healing: ['Ativa intuição', 'Promove clareza interior', 'Abre percepção sutil', 'Fortalece sabedoria'],
    orixa: 'Nanã',
    sephirah: 'Gimel',
  },
  // III - A Imperatriz - Fertility, beauty, nature, abundance
  3: {
    numero_carta: 3,
    arcano: 'A Imperatriz',
    frequencia: 528,
    elemento: 'Terra',
    chakra: 4,
    chakra_nome: 'Anahata (Coração)',
    significado_espiritual: 'Abundância, fertilidade, beleza, natureza, criação, mãe divina',
    propriedades_healing: ['Promove abundância', 'Fortalece fertilidade', 'Abre coração', 'Nutre criatividade'],
    orixa: 'Oxum',
    sephirah: 'Daleth',
  },
  // IV - O Imperador - Authority, structure, father, stability
  4: {
    numero_carta: 4,
    arcano: 'O Imperador',
    frequencia: 396,
    elemento: 'Fogo',
    chakra: 3,
    chakra_nome: 'Manipura (Plexo Solar)',
    significado_espiritual: 'Autoridade, estrutura, ordem, estabilidade, líder, pai divino',
    propriedades_healing: ['Fortalece disciplina', 'Promove organização', 'Estabiliza', 'Desenvolve liderança'],
    orixa: 'Oxalá',
    sephirah: 'Heh',
  },
  // V - O Hierofante - Spiritual wisdom, tradition, conformity, ethics
  5: {
    numero_carta: 5,
    arcano: 'O Hierofante',
    frequencia: 639,
    elemento: 'Ar',
    chakra: 5,
    chakra_nome: 'Vishuddha (Garganta)',
    significado_espiritual: 'Sabedoria espiritual, tradição, ética, professor, dogma religioso',
    propriedades_healing: ['Promove harmonia em comunidade', 'Fortalece tradições', 'Abre canal de ensino', 'Conecta com sagrado'],
    orixa: 'Oxóssi',
    sephirah: 'Vau',
  },
  // VI - Os Enamorados - Love, harmony, relationships, choices
  6: {
    numero_carta: 6,
    arcano: 'Os Enamorados',
    frequencia: 528,
    elemento: 'Ar',
    chakra: 4,
    chakra_nome: 'Anahata (Coração)',
    significado_espiritual: 'Amor, harmonia, relacionamentos, escolha, união, dualidade',
    propriedades_healing: ['Promove amor unconditional', 'Harmoniza relacionamentos', 'Auxilia decisões', 'Une opostos'],
    orixa: 'Logun Edé',
    sephirah: 'Zain',
  },
  // VII - O Carro - Victory, success, control, willpower
  7: {
    numero_carta: 7,
    arcano: 'O Carro',
    frequencia: 396,
    elemento: 'Fogo',
    chakra: 3,
    chakra_nome: 'Manipura (Plexo Solar)',
    significado_espiritual: 'Vitória, sucesso, controle, vontade, conquista, disciplina',
    propriedades_healing: ['Promove vitória', 'Fortalece vontade', 'Auxilia conquista', 'Desenvolve foco'],
    orixa: 'Ogum',
    sephirah: 'Cheth',
  },
  // VIII - A Justiça - Fairness, truth, law, cause and effect
  8: {
    numero_carta: 8,
    arcano: 'A Justiça',
    frequencia: 741,
    elemento: 'Ar',
    chakra: 5,
    chakra_nome: 'Vishuddha (Garganta)',
    significado_espiritual: 'Justiça, verdade, lei, karma, equilíbrio, responsabilidade',
    propriedades_healing: ['Promove verdade', 'Equilibra karma', 'Fortalece justiça', 'Purifica comunicação'],
    orixa: 'Xangô',
    sephirah: 'Teth',
  },
  // IX - O Eremita - Soul-searching, introspection, inner guidance, solitude
  9: {
    numero_carta: 9,
    arcano: 'O Eremita',
    frequencia: 417,
    elemento: 'Terra',
    chakra: 6,
    chakra_nome: 'Ajna (Terceiro Olho)',
    significado_espiritual: 'Introspecção, busca interior, solitude, sabedoria, iluminação interior',
    propriedades_healing: ['Promove introspecção', 'Fortalece sabedoria interior', 'Apoia solitude', 'Ilumina caminho'],
    sephirah: 'Yod',
  },
  // X - A Roda da Fortuna - Good luck, karma, life cycles, destiny
  10: {
    numero_carta: 10,
    arcano: 'A Roda da Fortuna',
    frequencia: 741,
    elemento: 'Fogo',
    chakra: 3,
    chakra_nome: 'Manipura (Plexo Solar)',
    significado_espiritual: 'Destino, ciclos, mudança, fortuna, karma, roda da vida',
    propriedades_healing: ['Promove aceitação de ciclos', 'Fortalece resiliência', 'Auxilia adaptação', 'Equilibra destino'],
    sephirah: 'Kaph',
  },
  // XI - A Força - Inner strength, courage, patience, power
  11: {
    numero_carta: 11,
    arcano: 'A Força',
    frequencia: 396,
    elemento: 'Terra',
    chakra: 1,
    chakra_nome: 'Muladhara (Raiz)',
    significado_espiritual: 'Força interior, coragem, paciência, poder, domínio de emoções',
    propriedades_healing: ['Fortalece coragem', 'Promove calma', 'Desenvolve poder interior', 'Equilibra emoções'],
    sephirah: 'Lamed',
  },
  // XII - O Enforcado - Pause, surrender, sacrifice, new perspective
  12: {
    numero_carta: 12,
    arcano: 'O Enforcado',
    frequencia: 528,
    elemento: 'Água',
    chakra: 6,
    chakra_nome: 'Ajna (Terceiro Olho)',
    significado_espiritual: 'Sacrifício, nova perspectiva, pausa, entrega, inversão de viewpoint',
    propriedades_healing: ['Promove entrega', 'Facilita sacrifício consciente', 'Abre nova perspectiva', 'Liberta apegos'],
    sephirah: 'Mem',
  },
  // XIII - A Morte - Endings, change, transformation, transition
  13: {
    numero_carta: 13,
    arcano: 'A Morte',
    frequencia: 417,
    elemento: 'Terra',
    chakra: 2,
    chakra_nome: 'Svadhisthana (Sacro)',
    significado_espiritual: 'Transformação, fim de ciclos, morte e renascimento, mudança profunda',
    propriedades_healing: ['Facilita transições', 'Promove transformação', 'Liberta do antigo', 'Apoia renascimento'],
    orixa: 'Omolu',
    sephirah: 'Nun',
  },
  // XIV - A Temperança - Balance, patience, purpose, meaning
  14: {
    numero_carta: 14,
    arcano: 'A Temperança',
    frequencia: 639,
    elemento: 'Água',
    chakra: 4,
    chakra_nome: 'Anahata (Coração)',
    significado_espiritual: 'Equilíbrio, harmonia, paciência, propósito, significado, mediocridade',
    propriedades_healing: ['Promove equilíbrio', 'Harmoniza extremos', 'Fortalece paciência', 'Acha propósito'],
    sephirah: 'Samekh',
  },
  // XV - O Diabo - Shadow self, attachment, addiction, materialism
  15: {
    numero_carta: 15,
    arcano: 'O Diabo',
    frequencia: 963,
    elemento: 'Terra',
    chakra: 1,
    chakra_nome: 'Muladhara (Raiz)',
    significado_espiritual: 'Sombra, apego, vício, materialismo, tentação, prisões autoconstruídas',
    propriedades_healing: ['Liberta de vícios', 'Ilumina sombra', 'Transmuta materialismo', 'Quebra prisões'],
    sephirah: 'Ayin',
  },
  // XVI - A Torre - Sudden change, upheaval, chaos, revelation, awakening
  16: {
    numero_carta: 16,
    arcano: 'A Torre',
    frequencia: 741,
    elemento: 'Fogo',
    chakra: 3,
    chakra_nome: 'Manipura (Plexo Solar)',
    significado_espiritual: 'Mudança súbita, destruição, revelação, despertar, chaos construtivo',
    propriedades_healing: ['Promove despertar', 'Liberta de ilusões', 'Facilita mudanças abruptas', 'Acelera transformação'],
    orixa: 'Iansã',
    sephirah: 'Peh',
  },
  // XVII - A Estrela - Hope, faith, purpose, serenity, spirituality
  17: {
    numero_carta: 17,
    arcano: 'A Estrela',
    frequencia: 852,
    elemento: 'Água',
    chakra: 5,
    chakra_nome: 'Vishuddha (Garganta)',
    significado_espiritual: 'Esperança, fé, serenidade, propósito, espiritualidade, renovação',
    propriedades_healing: ['Promove esperança', 'Restoura fé', 'Acalma mente', 'Renova espírito'],
    orixa: 'Iemanjá',
    sephirah: 'Tzaddi',
  },
  // XVIII - A Lua - Illusion, fear, anxiety, subconscious, intuition
  18: {
    numero_carta: 18,
    arcano: 'A Lua',
    frequencia: 417,
    elemento: 'Água',
    chakra: 6,
    chakra_nome: 'Ajna (Terceiro Olho)',
    significado_espiritual: 'Ilusão, medo, inconsciente, intuição, sonho, superstição',
    propriedades_healing: ['Ativa intuição', 'Promove sonhos', 'Ilumina inconsciente', 'Dissolve medos'],
    sephirah: 'Qoph',
  },
  // XIX - O Sol - Joy, success, optimism, vitality, clarity
  19: {
    numero_carta: 19,
    arcano: 'O Sol',
    frequencia: 852,
    elemento: 'Fogo',
    chakra: 4,
    chakra_nome: 'Anahata (Coração)',
    significado_espiritual: 'Alegria, sucesso, otimismo, vitalidade, clareza, verdade, criança interior',
    propriedades_healing: ['Promove alegria', 'Ilumina vitalidade', 'Clareia pensamento', 'Fortalece otimismo'],
    orixa: 'Xangô',
    sephirah: 'Resh',
  },
  // XX - O Julgamento - Judgement, rebirth, inner calling, absolution
  20: {
    numero_carta: 20,
    arcano: 'O Julgamento',
    frequencia: 528,
    elemento: 'Fogo',
    chakra: 7,
    chakra_nome: 'Sahasrara (Coroa)',
    significado_espiritual: 'Juízo, renascimento, chamado interior, absolvição, julgamento final, redenção',
    propriedades_healing: ['Promove renascimento', 'Chama para propósito', 'Absolve culpas', 'Eleva consciência'],
    sephirah: 'Shin',
  },
  // XXI - O Mundo - Completion, integration, accomplishment, travel
  21: {
    numero_carta: 21,
    arcano: 'O Mundo',
    frequencia: 963,
    elemento: 'Terra',
    chakra: 7,
    chakra_nome: 'Sahasrara (Coroa)',
    significado_espiritual: 'Completude, integração, realização, viagem, conclusão, cycles encerrados',
    propriedades_healing: ['Promove completude', 'Integra experiências', 'Celebra realizações', 'Fecha ciclos'],
    orixa: 'Omolu',
    sephirah: 'Tau',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_FREQUENCY_MAP);
Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 22 Major Arcana card numbers
 */
export const TODOS_ARCANOS_MAIORES: readonly number[] = Object.freeze(
  Object.keys(TAROT_FREQUENCY_MAP).map(Number).sort((a, b) => a - b)
);

/**
 * All Solfeggio frequencies used in the mapping
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Normalizes arcano name for consistent lookup.
 * Handles case variations.
 */
function normalizarArcano(arcano: string): string | null {
  const normalized = arcano.trim();
  for (const mapping of Object.values(TAROT_FREQUENCY_MAP)) {
    if (mapping.arcano.toLowerCase() === normalized.toLowerCase()) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get the tarot-frequency mapping for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns TarotFrequencyMapping or null if not found
 */
export function getTarotFrequency(numero: number): TarotFrequencyMapping | null {
  return TAROT_FREQUENCY_MAP[numero] ?? null;
}

/**
 * Get the arcano name by card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  return TAROT_FREQUENCY_MAP[numero]?.arcano ?? null;
}

/**
 * Get the frequency for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByNumber(numero: number): number | null {
  return TAROT_FREQUENCY_MAP[numero]?.frequencia ?? null;
}

/**
 * Get the element for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Element name or null if not found
 */
export function getElementByNumber(numero: number): string | null {
  return TAROT_FREQUENCY_MAP[numero]?.elemento ?? null;
}

/**
 * Get the chakra for a given card number.
 * @param numero - Major Arcana card number (0-21)
 * @returns Chakra number or null if not found
 */
export function getChakraByNumber(numero: number): number | null {
  return TAROT_FREQUENCY_MAP[numero]?.chakra ?? null;
}

/**
 * Get the frequency-tarot mapping for a given arcano name.
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Lua')
 * @returns TarotFrequencyMapping or null if not found
 */
export function getFrequencyTarot(arcano: string): TarotFrequencyMapping | null {
  const normalized = normalizarArcano(arcano);
  if (!normalized) return null;
  
  for (const mapping of Object.values(TAROT_FREQUENCY_MAP)) {
    if (mapping.arcano === normalized) {
      return mapping;
    }
  }
  return null;
}

/**
 * Get the frequency corresponding to a given arcano name.
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Lua')
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByArcano(arcano: string): number | null {
  return getFrequencyTarot(arcano)?.frequencia ?? null;
}

/**
 * Get all tarot-frequency mappings.
 * @returns Array of all correlation mappings
 */
export function getAllTarotFrequencies(): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all arcano names.
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_FREQUENCY_MAP)
    .map((m) => m.arcano)
    .sort((a, b) => TAROT_FREQUENCY_MAP.findIndex((m) => m.arcano === a) - TAROT_FREQUENCY_MAP.findIndex((m) => m.arcano === b));
}

/**
 * Get all frequencies used in the mapping.
 * @returns Array of unique frequencies
 */
export function getAllFrequencies(): number[] {
  const frequencies = new Set(Object.values(TAROT_FREQUENCY_MAP).map((m) => m.frequencia));
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get all tarot cards mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of TarotFrequencyMapping
 */
export function getTarotsByElement(elemento: string): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get all tarot cards mapped to a specific frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of TarotFrequencyMapping
 */
export function getTarotsByFrequency(frequencia: number): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter(
    (mapping) => mapping.frequencia === frequencia
  );
}

/**
 * Get all tarot cards mapped to a specific chakra.
 * @param chakra - Chakra number (1-7)
 * @returns Array of TarotFrequencyMapping
 */
export function getTarotsByChakra(chakra: number): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter(
    (mapping) => mapping.chakra === chakra
  );
}

/**
 * Check if a card number exists in the mapping.
 * @param numero - Major Arcana card number (0-21)
 * @returns True if number exists in mapping
 */
export function hasTarotFrequency(numero: number): boolean {
  return numero in TAROT_FREQUENCY_MAP;
}

/**
 * Get the card number for a given arcano name.
 * @param arcano - Arcano name
 * @returns Card number or null if not found
 */
export function getNumeroByArcano(arcano: string): number | null {
  return getFrequencyTarot(arcano)?.numero_carta ?? null;
}

/**
 * Get mapping by frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns TarotFrequencyMapping or null if not found
 */
export function getMappingByFrequency(frequencia: number): TarotFrequencyMapping | null {
  const mapping = getTarotsByFrequency(frequencia);
  return mapping.length > 0 ? mapping[0] : null;
}

/**
 * Get all tarot cards associated with an Orixá.
 * @param orixa - Orixá name to search for
 * @returns Array of TarotFrequencyMapping
 */
export function getTarotsByOrixa(orixa: string): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter(
    (mapping) => mapping.orixa?.toLowerCase() === orixa.toLowerCase()
  );
}

/**
 * Get all tarot cards associated with a Sephirah.
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotFrequencyMapping
 */
export function getTarotsBySephirah(sephirah: string): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAP).filter(
    (mapping) => mapping.sephirah?.toLowerCase() === sephirah.toLowerCase()
  );
}

/**
 * Default export with all functions
 */
export default {
  getTarotFrequency,
  getFrequencyTarot,
  getAllTarotFrequencies,
  getAllArcanos,
  getAllFrequencies,
  getArcanoByNumber,
  getFrequencyByNumber,
  getFrequencyByArcano,
  getElementByNumber,
  getChakraByNumber,
  getTarotsByElement,
  getTarotsByFrequency,
  getTarotsByChakra,
  hasTarotFrequency,
  getNumeroByArcano,
  getMappingByFrequency,
  getTarotsByOrixa,
  getTarotsBySephirah,
  TAROT_FREQUENCY_MAP,
  TODOS_ARCANOS_MAIORES,
  SOLFEGGIO_FREQUENCIES,
};