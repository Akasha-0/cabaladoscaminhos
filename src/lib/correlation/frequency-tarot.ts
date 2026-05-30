/**
 * Frequency-Tarot Correlation Module
 * Based on Solfeggio frequencies mapped to Tarot Major Arcana
 * Source: IDEIA.md - Matriz de Geometria Sagrada e correspondências espirituais
 */

/**
 * Represents the correlation between a Solfeggio frequency and its Tarot Major Arcana correspondence
 */
export interface FrequencyTarotMapping {
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Full arcano (Tarot Major Arcana card) name in Portuguese */
  arcano: string;
  /** Card number in the Major Arcana (0 for O Louco, 1-21 for others) */
  numero_carta: number;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
  /** Practical ritual guidance and interpretation */
  interpretacao: string;
  /** Chakra associated with this frequency (from frequency-chakra.ts) */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** The elemental nature of this frequency */
  elemento: string;
}

// ─── Solfeggio Frequency-to-Tarot Major Arcana Mapping ────────────────────────
// The 7 original Solfeggio frequencies aligned with Major Arcana cards through
// their vibrational correspondence and spiritual thematic alignment.

export const FREQUENCY_TAROT_MAP: Record<number, FrequencyTarotMapping> = {
  396: {
    frequencia: 396,
    arcano: 'O Louco',
    numero_carta: 0,
    significado_espiritual:
      'Libertação dos medos de sobrevivência, ancoramento e firme estabelecendo das bases. O início da jornada espiritual que dissolve a culpa do passado.',
    interpretacao:
      'Frequência de开门, novos começos e renascimento. Ideal para rituais de cura de traumas ancestrais, dissolução de padrões de medo e estabelecimento de fundações sólidas. Trabalhe com meditação na água e visualizações de raízes.',
    chakra: '1º Básico',
    chakra_numero: 1,
    elemento: 'Terra',
  },
  417: {
    frequencia: 417,
    arcano: 'O Mago',
    numero_carta: 1,
    significado_espiritual:
      'Facilitação de mudanças, manipulação da energia através da intenção e utilização consciente das ferramentas interiores. Manifestação através da vontade.',
    interpretacao:
      'Frequência de transformação e facilitação de mudanças. Favorece o trabalho de quebrar padrões LIMITANTES, iniciar novos projetos e manifestar através da mente. Excelente para rituais de abertura de caminhos.',
    chakra: '2º Sacro',
    chakra_numero: 2,
    elemento: 'Água',
  },
  528: {
    frequencia: 528,
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    significado_espiritual:
      'Transformação e regeneração, cura de padrões de DNA e limpeza de traumas do passado. A频率 do milagre que restaura a integridade celular e a essência.',
    interpretacao:
      'Frequência de cura profunda e transformação interior. Ideal para rituais de cura física, emocional e espiritual. Promove a regeneração, a quebra de padrões herdados e o despertar da consciência superior.',
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    elemento: 'Fogo',
  },
  639: {
    frequencia: 639,
    arcano: 'A Imperatriz',
    numero_carta: 3,
    significado_espiritual:
      'Conexão harmoniosa, reconciliação de opostos e harmonização de relacionamentos. O amor incondicional que nutre e prospera em todas as direções.',
    interpretacao:
      'Frequência de harmonização e restauração de laços. Favorece a cura de relacionamentos, a paz interior e a conexão com a natureza. Ideal para rituais de amor, fertilidade e abundância.',
    chakra: '4º Cardíaco',
    chakra_numero: 4,
    elemento: 'Ar / Água',
  },
  741: {
    frequencia: 741,
    arcano: 'O Hierofante',
    numero_carta: 5,
    significado_espiritual:
      'Expressão da verdade interior, poder da palavra falada e alinhamento com a doutrina divina. Despertar espiritual através da sabedoria sagrada.',
    interpretacao:
      'Frequência de despertar e expressão autêntica. Favorece a expansão da consciência, o estudo de tradições sagradas e a comunicação com mestres. Ideal para rituais de aprendizado espiritual e expansão mental.',
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    elemento: 'Ar',
  },
  852: {
    frequencia: 852,
    arcano: 'A Estrela',
    numero_carta: 17,
    significado_espiritual:
      'Despertar da intuição profunda, visão clara além das ilusões e esperança restaurada. A luz que guia através da escuridão após a crise.',
    interpretacao:
      'Frequência de intuição e esperança renovadas. Favorece a clareza mental, a meditação profunda e a reconexão com a esperança. Ideal para rituais de cura emocional, renovação espiritual e restauração da fé.',
    chakra: '6º Frontal',
    chakra_numero: 6,
    elemento: 'Éter / Ar',
  },
  963: {
    frequencia: 963,
    arcano: 'O Sol',
    numero_carta: 19,
    significado_espiritual:
      'Conexão espiritual direta com a Fonte, iluminação da mente e vitalidade irradiente. Clareza, sucesso e brilho próprio que manifesta o propósito de vida.',
    interpretacao:
      'Frequência de iluminação e conexão divina. Favorece a autoconsciência elevada, a manifestação do propósito e a irradiação de luz. Ideal para rituais de consagração, cura de enfermidades e alinhamento com o divino.',
    chakra: '7º Coronário',
    chakra_numero: 7,
    elemento: 'Éter (Quintessência)',
  },
};

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_TAROT_MAP);
Object.values(FREQUENCY_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the frequency-Tarot correlation mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyTarotMapping or null if not found
 */
export function getFrequencyTarot(frequencia: number): FrequencyTarotMapping | null {
  return FREQUENCY_TAROT_MAP[frequencia] ?? null;
}

/**
 * Get the frequency corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'A Imperatriz')
 * @returns The frequency in Hz or null if not found
 */
export function getTarotFrequency(arcano: string): number | null {
  const entry = Object.values(FREQUENCY_TAROT_MAP).find((m) => m.arcano === arcano);
  return entry?.frequencia ?? null;
}

/**
 * Get the frequency by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The frequency in Hz or null if not found
 */
export function getFrequencyByNumber(numero: number): number | null {
  const entry = Object.values(FREQUENCY_TAROT_MAP).find((m) => m.numero_carta === numero);
  return entry?.frequencia ?? null;
}

/**
 * Get the arcano name by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByFrequencyNumber(numero: number): string | null {
  const entry = Object.values(FREQUENCY_TAROT_MAP).find((m) => m.numero_carta === numero);
  return entry?.arcano ?? null;
}

/**
 * Get all available frequency-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyTarots(): FrequencyTarotMapping[] {
  return Object.values(FREQUENCY_TAROT_MAP);
}

/**
 * Get all frequencies
 * @returns Array of frequency values in Hz
 */
export function getAllFrequencies(): number[] {
  return [...SOLFEGGIO_FREQUENCIES];
}

/**
 * Check if a frequency exists in the mapping
 * @param frequencia - Frequency in Hz to check
 * @returns True if frequency exists in mapping
 */
export function hasFrequencyTarot(frequencia: number): boolean {
  return frequencia in FREQUENCY_TAROT_MAP;
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(FREQUENCY_TAROT_MAP).map((m) => m.arcano);
}

/**
 * Get the chakra number associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra number (1-7) or null if not found
 */
export function getChakraByFrequency(frequencia: number): number | null {
  return FREQUENCY_TAROT_MAP[frequencia]?.chakra_numero ?? null;
}

/**
 * Get the elemental nature associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element string or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  return FREQUENCY_TAROT_MAP[frequencia]?.elemento ?? null;
}