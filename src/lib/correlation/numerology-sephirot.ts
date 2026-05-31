/**
 * Numerology-Sephirot Spiritual Correlation Mapping
 * Maps numerology numbers (1-9, master numbers) to the ten Sephiroth of the Tree of Life
 * Based on traditional Kabbalistic and numerological correspondences
 */

/** Master numbers that reduce to single digits (double-digit numerology) */
export type NumeroMestre = 11 | 22 | 33;

/** Regular numerology numbers */
export type NumeroRegular = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** All valid numerology numbers including master numbers */
export type Numerologia = NumeroRegular | NumeroMestre;

/**
 * Represents the correlation between a numerology number and its Sephiroth connections
 */
export interface NumerologiaSephirot {
  /** The numerology number (1-9 or master numbers 11, 22, 33) */
  numero: Numerologia;
  /** The primary associated Sephirah in Hebrew/English */
  sephirah: string;
  /** The corresponding classical element */
  elemento: 'Fogo' | 'Terra' | 'Ar' | 'Água' | 'Éter';
  /** Path number on the Tree of Life */
  numero_caminho: number;
  /** Spiritual energy and quality of the numerology-sephirah connection */
  energia_espiritual: string;
  /** Whether this is a master number with heightened spiritual significance */
  numero_mestre: boolean;
}

// ─── Numerology-to-Sephirot Mapping ───────────────────────────────────────────

export const NUMEROLOGIA_SEPHIROT_MAPPINGS: Record<number, NumerologiaSephirot> = {
  // 1 - Unity / Solar / Kether (Crown) + Tiphereth (Beauty)
  1: {
    numero: 1,
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 11,
    energia_espiritual: 'Iniciação / Liderança / Individualidade / Propósito Divino',
    numero_mestre: false,
  },

  // 2 - Duality / Lunar / Binah + Chokmah
  2: {
    numero: 2,
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Parceria / Intuição / Cooperação / Sabedoria Feminina',
    numero_mestre: false,
  },

  // 3 - Trinity / Mercury / Chesed + Geburah
  3: {
    numero: 3,
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    energia_espiritual: 'Expressão / Criatividade / Comunicação / Abundância',
    numero_mestre: false,
  },

  // 4 - Stability / Venus / Tiphereth + Netzach
  4: {
    numero: 4,
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 6,
    energia_espiritual: 'Fundação / Trabalho / Disciplina / Harmonia Solar',
    numero_mestre: false,
  },

  // 5 - Change / Mars / Geburah + Hod
  5: {
    numero: 5,
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Liberdade / Aventura / Adaptabilidade / Força Interior',
    numero_mestre: false,
  },

  // 6 - Harmony / Saturn / Netzach + Chesed
  6: {
    numero: 6,
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Responsabilidade / Amor / Serviço / Beleza Emocional',
    numero_mestre: false,
  },

  // 7 - Reflection / Jupiter / Hod + Yesod
  7: {
    numero: 7,
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Conhecimento / Análise / Sabedoria Interior / Glória',
    numero_mestre: false,
  },

  // 8 - Power / Pluto / Yesod + Malkuth
  8: {
    numero: 8,
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 9,
    energia_espiritual: 'Abundância / Autoridade / Realização / Base Subconsciente',
    numero_mestre: false,
  },

  // 9 - Completion / Neptune / Malkuth + Kether
  9: {
    numero: 9,
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
    energia_espiritual: 'Compaixão / Humanitarismo / Sabedoria Divina / Manifestação',
    numero_mestre: false,
  },

  // Master Number 11 - Illuminatio / The Higher Self / Kether (Channel)
  11: {
    numero: 11,
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 11,
    energia_espiritual: 'Iluminação / Inspiração / Visão Profética / Canal Divino',
    numero_mestre: true,
  },

  // Master Number 22 - Builder / The Great Work / Chokmah
  22: {
    numero: 22,
    sephirah: 'Chokmah',
    elemento: 'Éter',
    numero_caminho: 12,
    energia_espiritual: 'Realização Prática / Obra Maior / Poder Manifestador / Dinamismo',
    numero_mestre: true,
  },

  // Master Number 33 - Master Teacher / Christ Consciousness / Binah
  33: {
    numero: 33,
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    energia_espiritual: 'Ensino Espiritual / Sacrifício / Amor Divino / Compreensão Superior',
    numero_mestre: true,
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGIA_SEPHIROT_MAPPINGS);

/**
 * Get the numerology-Sephirot correlation mapping
 * @param numero - The numerology number (1-9 or master numbers 11, 22, 33)
 * @returns The correlation mapping or null if not found
 */
export function getNumerologySephirot(numero: number): NumerologiaSephirot | null {
  return NUMEROLOGIA_SEPHIROT_MAPPINGS[numero] ?? null;
}

export function getSephirotNumerologia(sephirah: string): NumerologiaSephirot[] {
  const upperSephirah = sephirah.charAt(0).toUpperCase() + sephirah.slice(1);
  return Object.values(NUMEROLOGIA_SEPHIROT_MAPPINGS).filter(
    (mapping) => mapping.sephirah === upperSephirah
  );
}

/**
 * Get all available numerology-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllNumerologiaSephiroth(): NumerologiaSephirot[] {
  return Object.values(NUMEROLOGIA_SEPHIROT_MAPPINGS);
}