/**
 * Orixá-Sephirot Spiritual Correlation Mapping
 * Maps the Orixás of Candomblé to the ten Sephiroth of the Tree of Life
 * Based on traditional Afro-Brazilian and Kabbalistic spiritual correspondences
 */

/** The Orixás of the main pantheon */
export type Orixá =
  | 'Oxalá'
  | 'Obatalá'
  | 'Iemanjá'
  | 'Oxum'
  | 'Xangô'
  | 'Oxóssi'
  | 'Iansã'
  | 'Ogum'
  | 'Nanã'
  | 'Omolu';

/**
 * Represents the correlation between an Orixá and its Sephirah correspondence
 */
export interface OrixáSephirot {
  /** The name of the Orixá */
  orixá: Orixá;
  /** The corresponding Sephirah in Hebrew/English */
  sephirah: string;
  /** The element associated with this correlation */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the orixá-sephirah connection */
  energia_espiritual: string;
}

// ─── Orixá-to-Sephirot Mapping ─────────────────────────────────────────────

export const ORIXÁ_SEPHIROT_MAPPINGS: Record<string, OrixáSephirot> = {
  // Oxalá - Kether (Corona) - Éter - Pureza Divina Primordial
  Oxalá: {
    orixá: 'Oxalá',
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 1,
    energia_espiritual: 'Pureza Primordial / Criação Divina / Aláà / Pai dos Orixás',
  },

  // Obatalá - Chokmah (Sabedoria) - Éter - Sabedoria Criadora
  Obatalá: {
    orixá: 'Obatalá',
    sephirah: 'Chokmah',
    elemento: 'Éter',
    numero_caminho: 2,
    energia_espiritual: 'Sabedoria Primordial / Mente Divina / Pureza do pensamento',
  },

  // Iemanjá - Binah (Entendimento) - Água - Compreensão Marinha
  Iemanjá: {
    orixá: 'Iemanjá',
    sephirah: 'Binah',
    elemento: 'Água',
    numero_caminho: 3,
    energia_espiritual: 'Compreensão / Maternidade Divina / Mares e emoções profundas',
  },

  // Oxum - Chesed (Misericórdia) - Água - Abundância Fluvial
  Oxum: {
    orixá: 'Oxum',
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Misericórdia / Abundância / Rios / Amor prospero',
  },

  // Xangô - Geburah (Severidade) - Fogo - Força Retificadora
  Xangô: {
    orixá: 'Xangô',
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força / Justiça / Trovão / Cortante como raio',
  },

  // Oxóssi - Tiphereth (Beleza) - Fogo - Harmonia Solar
  Oxóssi: {
    orixá: 'Oxóssi',
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Beleza / Harmonia / Caça espiritual / Luz solar',
  },

  // Iansã - Netzach (Vitória) - Fogo - Paixão Vitoriosa
  Iansã: {
    orixá: 'Iansã',
    sephirah: 'Netzach',
    elemento: 'Fogo',
    numero_caminho: 7,
    energia_espiritual: 'Vitória / Paixão / Ventos e tempestades / Guerra e transformação',
  },

  // Ogum - Hod (Glória) - Ar - Gloria Intelectual
  Ogum: {
    orixá: 'Ogum',
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Glória / Intelecto / Ferro e ferramentas / Conquista tecnológica',
  },

  // Nanã - Yesod (Fundação) - Água - Fundação Lunar
  Nanã: {
    orixá: 'Nanã',
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Fundação / Subconsciente / Lua / Mortes e renascimentos',
  },

  // Omolu - Malkuth (Reino) - Terra - Manifestação Material
  Omolu: {
    orixá: 'Omolu',
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Reino / Manifestação / Terra e peste / Aterramento material',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ORIXÁ_SEPHIROT_MAPPINGS);

/**
 * Get the Orixá-Sephirot correlation mapping
 * @param orixá - The name of the Orixá (e.g., 'Oxalá', 'Iemanjá', 'Xangô')
 * @returns The correlation mapping or null if not found
 */
export function getOrixáSephirot(orixá: string): OrixáSephirot | null {
  return ORIXÁ_SEPHIROT_MAPPINGS[orixá] ?? null;
}

/**
 * Get the Sephirot-Orixá reverse correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah', 'Malkuth')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotOrixá(sephirah: string): OrixáSephirot | null {
  const found = Object.values(ORIXÁ_SEPHIROT_MAPPINGS).find(
    (mapping) => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
  return found ?? null;
}

/**
 * Get all available Orixá-Sephirot mappings
 * @returns Array of all correlation mappings sorted by path number
 */
export function getAllOrixáSephirots(): OrixáSephirot[] {
  return Object.values(ORIXÁ_SEPHIROT_MAPPINGS).sort(
    (a, b) => a.numero_caminho - b.numero_caminho
  );
}
