/**
 * Tarot-Frequency Correlation Module
 * Maps Tarot Major Arcana cards to Solfeggio frequencies with spiritual context
 * Based on IDEIA.md vibrational correspondences and Cabala dos Caminhos framework
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Solfeggio frequency
 */
export interface TarotFrequencyMapping {
  /** The Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** The element associated with this frequency */
  elemento: string;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
  /** Chakra associated with this frequency */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
}

// ─── Tarot Major Arcana to Solfeggio Frequency Mapping ────────────────────────
// Maps all 22 Major Arcana cards to their vibrational frequency correspondences.
// The frequencies are assigned based on thematic alignment:
// 396 Hz - Foundation/Ground (Root work, liberation from fear)
// 417 Hz - Flow/Change (Transformation, facilitating situations)
// 528 Hz - Creation/Healing (DNA repair, miracles, Abundance)
// 639 Hz - Harmony/Relationships (Connection, Reconciliation, Unity)
// 741 Hz - Expression/Awakening (Intuition, Truth, Expression)
// 852 Hz - Wisdom/Third Eye (Intuitive knowing, Perception)
// 963 Hz - Oneness/Divine (Crown activation, Unity with Source)

export const TAROT_FREQUENCY_MAPPINGS: Record<string, TarotFrequencyMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    frequencia: 396,
    elemento: 'Terra',
    significado_espiritual:
      'Libertação dos medos ancestrais, novos começos e estabelecimento de bases sólidas. O início da jornada espiritual que dissolve a culpa do passado.',
    chakra: '1º Chakra Raiz (Muladhara)',
    chakra_numero: 1,
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    frequencia: 417,
    elemento: 'Ar',
    significado_espiritual:
      'Poder de manifestar através da intenção, domínio das ferramentas interiores e manipulação consciente da energia. A vontade que transforma.',
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    frequencia: 528,
    elemento: 'Água',
    significado_espiritual:
      'Intuição profunda, sabedoria interior e conexão com o divino feminino. Guardiã dos mistérios que aguarda a revelação.',
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    frequencia: 639,
    elemento: 'Terra',
    significado_espiritual:
      'Abundância criativa, amor fertilizante e nutrição divina. A mãe natureza que manifesta prosperidade em todas as formas.',
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    frequencia: 417,
    elemento: 'Fogo',
    significado_espiritual:
      'Estrutura, disciplina e força de vontade marcial. O arquiteto que impõe ordem ao caos através da autoridade interior.',
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    frequencia: 741,
    elemento: 'Ar',
    significado_espiritual:
      'Sabedoria sagrada, tradição espiritual e transmissão da doutrina divina. O mestre que abre portais de conhecimento transcendental.',
    chakra: '5º Chakra Laríngeo (Vishuddha)',
    chakra_numero: 5,
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    frequencia: 639,
    elemento: 'Ar',
    significado_espiritual:
      'União de opostos, escolha sagrada e harmonização de forças complementares. O casamento interior que une razão e emoção.',
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    frequencia: 417,
    elemento: 'Fogo',
    significado_espiritual:
      'Triunfo através da vontade, controle das energias opostas e vitória sobre obstáculos. A conquista que vem da disciplina guerreira.',
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    frequencia: 741,
    elemento: 'Ar',
    significado_espiritual:
      'Equilíbrio cósmico, lei divina e causa-efeito. O peso da balança que mede toda ação com precisão celestial.',
    chakra: '5º Chakra Laríngeo (Vishuddha)',
    chakra_numero: 5,
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    frequencia: 528,
    elemento: 'Terra',
    significado_espiritual:
      'Iluminação interior, solidão sagrada e busca da verdade última. A lanterna que guia através da escuridão da ignorância.',
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    frequencia: 396,
    elemento: 'Fogo',
    significado_espiritual:
      'Ciclos do destino, mudança inevitável e oportunidade cíclica. A roda cósmica que gira conforme a lei de ação e reação.',
    chakra: '1º Chakra Raiz (Muladhara)',
    chakra_numero: 1,
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    frequencia: 639,
    elemento: 'Fogo',
    significado_espiritual:
      'Coragem do coração, domínio das paixões e poder gentil da compaixão. A força interior que supera toda野兽 através do amor.',
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    frequencia: 528,
    elemento: 'Água',
    significado_espiritual:
      'Sacrifício consciente, nova perspectiva e entrega ao fluxo divino. A inversão que revela a verdade através da suspensão do ego.',
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    frequencia: 417,
    elemento: 'Água',
    significado_espiritual:
      'Transformação inevitável, fim de ciclos e renascimento espiritual. A morte do velho self que abre espaço para o novo ser.',
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    frequencia: 639,
    elemento: 'Fogo',
    significado_espiritual:
      'Equilíbrio entre opostos, harmonia das polaridades e cura através do meio. O alquimista que transfigura chumbo em ouro interior.',
    chakra: '4º Chakra Cardíaco (Anahata)',
    chakra_numero: 4,
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    frequencia: 396,
    elemento: 'Terra',
    significado_espiritual:
      'Libertação das prisões interiores, reconhecimento das sombras e transcendência das amarras materiais. A chave que abre os grilhões autoimpostos.',
    chakra: '1º Chakra Raiz (Muladhara)',
    chakra_numero: 1,
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    frequencia: 417,
    elemento: 'Fogo',
    significado_espiritual:
      'Desconstrução das ilusões, revelação súbita da verdade e libertação através da crise. O raio que destrói para reconstruir em verdade.',
    chakra: '2º Chakra Sacral (Svadhisthana)',
    chakra_numero: 2,
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    frequencia: 852,
    elemento: 'Ar',
    significado_espiritual:
      'Esperança renovada, intuição desperta e alinhamento com o propósito divino. A luz que flui para restaurar a fé após a escuridão.',
    chakra: '6º Chakra Frontal (Ajna)',
    chakra_numero: 6,
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    frequencia: 852,
    elemento: 'Água',
    significado_espiritual:
      'Intuição profunda, inconsciente revelado e navegação pelos mares emocionais. Os véus entre o visível e o invisível se dissipam.',
    chakra: '6º Chakra Frontal (Ajna)',
    chakra_numero: 6,
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    frequencia: 963,
    elemento: 'Fogo',
    significado_espiritual:
      'Vitalidaderadiante, verdade clara e conexão direta com a fonte de toda luz. O brilho próprio que manifesta o propósito de vida.',
    chakra: '7º Chakra Coronário (Sahasrara)',
    chakra_numero: 7,
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    frequencia: 528,
    elemento: 'Fogo',
    significado_espiritual:
      'Renascimento interior, chamado divino e ressurreição do verdadeiro self. O despertar que responde ao chamado da alma.',
    chakra: '3º Chakra Plexo Solar (Manipura)',
    chakra_numero: 3,
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    frequencia: 963,
    elemento: 'Terra',
    significado_espiritual:
      'Completude, realização do propósito e integração de todos os opostos. A dança cósmica que completa o ciclo da grande obra.',
    chakra: '7º Chakra Coronário (Sahasrara)',
    chakra_numero: 7,
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_FREQUENCY_MAPPINGS);
Object.values(TAROT_FREQUENCY_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies used in Tarot mapping
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the Tarot-Frequency correlation mapping for a given arcano
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Mago')
 * @returns The correlation mapping or null if not found
 */
export function getTarotFrequency(arcano: string): TarotFrequencyMapping | null {
  return TAROT_FREQUENCY_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano name corresponding to a frequency
 * @param frequencia - Solfeggio frequency in Hz (396, 417, 528, 639, 741, 852, 963)
 * @returns The arcano name or null if not found
 */
export function getFrequencyTarot(frequencia: number): string | null {
  for (const mapping of Object.values(TAROT_FREQUENCY_MAPPINGS)) {
    if (mapping.frequencia === frequencia) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all available Tarot-Frequency mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotFrequencies(): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_FREQUENCY_MAPPINGS)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map((m) => m.arcano);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotFrequency(arcano: string): boolean {
  return arcano in TAROT_FREQUENCY_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_FREQUENCY_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get frequency by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The frequency in Hz or null if not found
 */
export function getFrequencyByNumber(numero: number): number | null {
  for (const mapping of Object.values(TAROT_FREQUENCY_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.frequencia;
    }
  }
  return null;
}

/**
 * Get all mappings for a specific frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of mappings with this frequency (can be multiple arcanos)
 */
export function getArcanosByFrequency(frequencia: number): TarotFrequencyMapping[] {
  return Object.values(TAROT_FREQUENCY_MAPPINGS).filter(
    (m) => m.frequencia === frequencia
  );
}

/**
 * Get all frequencies
 * @returns Array of unique frequencies in Hz
 */
export function getAllFrequencies(): number[] {
  return [...SOLFEGGIO_FREQUENCIES];
}

/**
 * Get the chakra number associated with an arcano
 * @param arcano - The arcano name
 * @returns Chakra number (1-7) or null if not found
 */
export function getChakraByArcano(arcano: string): number | null {
  return TAROT_FREQUENCY_MAPPINGS[arcano]?.chakra_numero ?? null;
}

/**
 * Get the element associated with an arcano
 * @param arcano - The arcano name
 * @returns Element name or null if not found
 */
export function getElementByArcano(arcano: string): string | null {
  return TAROT_FREQUENCY_MAPPINGS[arcano]?.elemento ?? null;
}

export default {
  getTarotFrequency,
  getFrequencyTarot,
  getAllTarotFrequencies,
  getAllArcanos,
  hasTarotFrequency,
  getArcanoByNumber,
  getFrequencyByNumber,
  getArcanosByFrequency,
  getAllFrequencies,
  getChakraByArcano,
  getElementByArcano,
  SOLFEGGIO_FREQUENCIES,
  TAROT_FREQUENCY_MAPPINGS,
};