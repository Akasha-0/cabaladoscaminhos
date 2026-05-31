/**
 * Sephirot-Frequency Spiritual Correlation Module
 * Maps the ten Sephiroth of the Tree of Life to Solfeggio frequencies
 * Based on traditional Kabbalistic correspondences and vibrational healing
 */

/**
 * Represents the correlation between a Sephirah and its Solfeggio frequency
 */
export interface SephirotFrequency {
  /** The name of the Sephirah in Hebrew/English */
  sephirah: string;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Associated classical element */
  elemento: string;
  /** Chakra number (1-7) associated with this sephirah */
  chakra_numero: number;
  /** Spiritual meaning and vibrational quality */
  significado_espiritual: string;
}

// ─── Sephirot-to-Frequency Mapping ──────────────────────────────────────────
// Maps the 10 Sephiroth to their vibrational frequency correspondences.
// Frequencies are assigned based on the spiritual nature and position on the
// Tree of Life:
// 396 Hz - Foundation/Ground (Root work, liberation from fear)
// 417 Hz - Transformation/Flow (Change, facilitating situations)
// 528 Hz - Creation/Healing (DNA repair, miracles, harmony)
// 639 Hz - Harmony/Relationships (Connection, Reconciliation, Unity)
// 741 Hz - Awakening/Expression (Intuition, Truth, Expression)
// 852 Hz - Wisdom/Third Eye (Intuitive knowing, Perception)
// 963 Hz - Oneness/Divine (Crown activation, Unity with Source)

export const SEPHIROT_FREQUENCY_MAPPINGS: Record<string, SephirotFrequency> = {
  // 1. Kether (Crown) - 963 Hz - Éter - Divine Purity
  // Highest sephirah - pure divine light, closest to Ein Sof
  Kether: {
    sephirah: 'Kether',
    frequencia: 963,
    elemento: 'Éter',
    chakra_numero: 7,
    significado_espiritual: 'Coroa Divina / União com o Source / Purificação Primordial',
  },

  // 2. Chokmah (Wisdom) - 852 Hz - Éter - Dynamic Impulse
  // First burst of creative energy, cosmic wisdom
  Chokmah: {
    sephirah: 'Chokmah',
    frequencia: 852,
    elemento: 'Éter',
    chakra_numero: 6,
    significado_espiritual: 'Sabedoria Cósmica / Impulso Dinâmico /的一声 / Intuição Pura',
  },

  // 3. Binah (Understanding) - 741 Hz - Ar - Structured Discernment
  // Form-giving, limitation, superior discrimination
  Binah: {
    sephirah: 'Binah',
    frequencia: 741,
    elemento: 'Ar',
    chakra_numero: 6,
    significado_espiritual: 'Entendimento Superior / Formatação / Discernimento Estruturado',
  },

  // 4. Chesed (Mercy) - 639 Hz - Água - Abundant Expansion
  // Divine mercy, expansion, abundance, grace
  Chesed: {
    sephirah: 'Chesed',
    frequencia: 639,
    elemento: 'Água',
    chakra_numero: 4,
    significado_espiritual: 'Misericórdia Divina / Abundância / Expansão / Graça Infinita',
  },

  // 5. Geburah (Severity) - 417 Hz - Fogo - Cutting Force
  // Strength, righteous judgment, transformative power
  Geburah: {
    sephirah: 'Geburah',
    frequencia: 417,
    elemento: 'Fogo',
    chakra_numero: 3,
    significado_espiritual: 'Severidade Divina / Força Cortante / Guerra Santa / Transformação',
  },

  // 6. Tiphereth (Beauty) - 528 Hz - Fogo - Vital Harmony
  // Central sun, harmony, life purpose, healing center
  Tiphereth: {
    sephirah: 'Tiphereth',
    frequencia: 528,
    elemento: 'Fogo',
    chakra_numero: 4,
    significado_espiritual: 'Beleza Central / Harmonia Solar / Propósito de Vida / Cura Miraculosa',
  },

  // 7. Netzach (Victory) - 639 Hz - Água - Emotional Victory
  // Emotional love, universal love, triumph of feelings
  Netzach: {
    sephirah: 'Netzach',
    frequencia: 639,
    elemento: 'Água',
    chakra_numero: 4,
    significado_espiritual: 'Vitória Emocional / Amor Universal / Triunfo dos Sentimentos',
  },

  // 8. Hod (Glory) - 741 Hz - Ar - Superior Intellect
  // Intellect, communication, divine truth
  Hod: {
    sephirah: 'Hod',
    frequencia: 741,
    elemento: 'Ar',
    chakra_numero: 5,
    significado_espiritual: 'Glória Divina / Intelecto Superior / Comunicação com o Divino',
  },

  // 9. Yesod (Foundation) - 396 Hz - Água - Subconscious Imagination
  // Subconscious mind, imagination, lunar connection
  Yesod: {
    sephirah: 'Yesod',
    frequencia: 396,
    elemento: 'Água',
    chakra_numero: 2,
    significado_espiritual: 'Fundação Subconsciente / Imaginação / Conexão Lunar / Base Invisível',
  },

  // 10. Malkuth (Kingdom) - 396 Hz - Terra - Material Manifestation
  // Physical world, manifestation, grounding
  Malkuth: {
    sephirah: 'Malkuth',
    frequencia: 396,
    elemento: 'Terra',
    chakra_numero: 1,
    significado_espiritual: 'Reino Material / Manifestação / Aterramento / Matéria Física',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_FREQUENCY_MAPPINGS);
Object.values(SEPHIROT_FREQUENCY_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All 6 Solfeggio frequencies used in Sephirot mapping
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the Sephirot-frequency correlation mapping for a given sephirah
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotFrequency(sephirah: string): SephirotFrequency | null {
  return SEPHIROT_FREQUENCY_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the sephirah name corresponding to a frequency
 * @param frequencia - Solfeggio frequency in Hz (396, 417, 528, 639, 741, 852, 963)
 * @returns The sephirah name or null if not found
 */
export function getFrequencySephirot(frequencia: number): string | null {
  const entry = Object.values(SEPHIROT_FREQUENCY_MAPPINGS).find(
    (mapping) => mapping.frequencia === frequencia,
  );
  return entry?.sephirah ?? null;
}

/**
 * Get all available Sephirot-frequency mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotFrequencies(): SephirotFrequency[] {
  return Object.values(SEPHIROT_FREQUENCY_MAPPINGS);
}

/**
 * Get all sephirah names
 * @returns Array of sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_FREQUENCY_MAPPINGS);
}

/**
 * Check if a sephirah exists in the mapping
 * @param sephirah - Sephirah name to check
 * @returns True if sephirah exists in mapping
 */
export function hasSephirotFrequency(sephirah: string): boolean {
  return sephirah in SEPHIROT_FREQUENCY_MAPPINGS;
}

/**
 * Get the chakra number associated with a sephirah
 * @param sephirah - The sephirah name
 * @returns Chakra number (1-7) or null if not found
 */
export function getChakraBySephirah(sephirah: string): number | null {
  return SEPHIROT_FREQUENCY_MAPPINGS[sephirah]?.chakra_numero ?? null;
}

/**
 * Get the element associated with a sephirah
 * @param sephirah - The sephirah name
 * @returns Element name or null if not found
 */
export function getElementBySephirah(sephirah: string): string | null {
  return SEPHIROT_FREQUENCY_MAPPINGS[sephirah]?.elemento ?? null;
}

/**
 * Get all sephiroth for a specific frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of SephirotFrequency mappings with this frequency
 */
export function getSephirothByFrequency(frequencia: number): SephirotFrequency[] {
  return Object.values(SEPHIROT_FREQUENCY_MAPPINGS).filter(
    (mapping) => mapping.frequencia === frequencia,
  );
}

/**
 * Get all frequencies used in sephirot mapping
 * @returns Array of unique frequencies in Hz
 */
export function getAllFrequencies(): number[] {
  return [...SOLFEGGIO_FREQUENCIES];
}

// Default export for convenience
export default {
  getSephirotFrequency,
  getFrequencySephirot,
  getAllSephirotFrequencies,
  getAllSephiroth,
  hasSephirotFrequency,
  getChakraBySephirah,
  getElementBySephirah,
  getSephirothByFrequency,
  getAllFrequencies,
  SEPHIROT_FREQUENCY_MAPPINGS,
  SOLFEGGIO_FREQUENCIES,
};