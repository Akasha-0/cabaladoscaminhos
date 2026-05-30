/**
 * Sephirot-Orixá Spiritual Correlation Mapping
 * Maps the ten Sephiroth of the Tree of Life to Orixás of Candomblé
 * Based on traditional Kabbalistic and Afro-Brazilian spiritual correspondences
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
 * Represents the correlation between a Sephirah and its Orixá correspondence
 */
export interface SephirotOrixá {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding Orixá */
  orixá: Orixá;
  /** The element associated with this correlation */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the sephirah-orixá connection */
  energia_espiritual: string;
}

// ─── Sephirot-to-Orixá Mapping ─────────────────────────────────────────────

export const SEPHIROT_ORIXÁ_MAPPINGS: Record<string, SephirotOrixá> = {
  // 1. Kether (Corona) - Oxalá - Éter - Pureza Divina Primordial
  Kether: {
    sephirah: 'Kether',
    orixá: 'Oxalá',
    elemento: 'Éter',
    numero_caminho: 1,
    energia_espiritual: 'Pureza Primordial / Criação Divina / Aláà / Pai dos Orixás',
  },

  // 2. Chokmah (Sabedoria) - Obatalá - Éter - Sabedoria Criadora
  Chokmah: {
    sephirah: 'Chokmah',
    orixá: 'Obatalá',
    elemento: 'Éter',
    numero_caminho: 2,
    energia_espiritual: 'Sabedoria Primordial / Mente Divina / Pureza do pensamento',
  },

  // 3. Binah (Entendimento) - Iemanjá - Água - Compreensão Marinha
  Binah: {
    sephirah: 'Binah',
    orixá: 'Iemanjá',
    elemento: 'Água',
    numero_caminho: 3,
    energia_espiritual: 'Compreensão / Maternidade Divina / Mares e emoções profundas',
  },

  // 4. Chesed (Misericórdia) - Oxum - Água - Abundância Fluvial
  Chesed: {
    sephirah: 'Chesed',
    orixá: 'Oxum',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Misericórdia / Abundância / Rios / Amor prospero',
  },

  // 5. Geburah (Severidade) - Xangô - Fogo - Força Retificadora
  Geburah: {
    sephirah: 'Geburah',
    orixá: 'Xangô',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Força / Justiça / Trovão / Cortante como raio',
  },

  // 6. Tiphereth (Beleza) - Oxóssi - Fogo - Harmonia Solar
  Tiphereth: {
    sephirah: 'Tiphereth',
    orixá: 'Oxóssi',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Beleza / Harmonia / Caça espiritual / Luz solar',
  },

  // 7. Netzach (Vitória) - Iansã - Fogo - Paixão Vitoriosa
  Netzach: {
    sephirah: 'Netzach',
    orixá: 'Iansã',
    elemento: 'Fogo',
    numero_caminho: 7,
    energia_espiritual: 'Vitória / Paixão / Ventos e tempestades / Guerra e transformação',
  },

  // 8. Hod (Glória) - Ogum - Ar - Gloria Intelectual
  Hod: {
    sephirah: 'Hod',
    orixá: 'Ogum',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Glória / Intelecto / Ferro e ferramentas / Conquista tecnológica',
  },

  // 9. Yesod (Fundação) - Nanã - Água - Fundação Lunar
  Yesod: {
    sephirah: 'Yesod',
    orixá: 'Nanã',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Fundação / Subconsciente / Lua / Mortes e renascimentos',
  },

  // 10. Malkuth (Reino) - Omolu - Terra - Manifestação Material
  Malkuth: {
    sephirah: 'Malkuth',
    orixá: 'Omolu',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Reino / Manifestação / Terra e peste / Aterramento material',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_ORIXÁ_MAPPINGS);

/**
 * Get the Sephirot-Orixá correlation mapping
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah', 'Malkuth')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotOrixá(sephirah: string): SephirotOrixá | null {
  return SEPHIROT_ORIXÁ_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the Orixá-Sephirot reverse correlation mapping
 * @param orixá - The name of the Orixá (e.g., 'Oxalá', 'Iemanjá', 'Xangô')
 * @returns The correlation mapping or null if not found
 */
export function getOrixáSephirot(orixá: string): SephirotOrixá | null {
  const found = Object.values(SEPHIROT_ORIXÁ_MAPPINGS).find(
    (mapping) => mapping.orixá.toLowerCase() === orixá.toLowerCase()
  );
  return found ?? null;
}

/**
 * Get all available Sephirot-Orixá mappings
 * @returns Array of all correlation mappings sorted by path number
 */
export function getAllSephirotOrixás(): SephirotOrixá[] {
  return Object.values(SEPHIROT_ORIXÁ_MAPPINGS).sort(
    (a, b) => a.numero_caminho - b.numero_caminho
  );
}