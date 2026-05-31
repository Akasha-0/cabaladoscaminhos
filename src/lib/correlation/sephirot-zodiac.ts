/**
 * Sephirot-Zodiac Spiritual Correlation Module
 * Maps the ten Sephiroth of the Tree of Life to zodiac signs
 * Based on traditional Kabbalistic correspondences and astrological alignments.
 */

export type Signo = 'Áries' | 'Touro' | 'Gémeos' | 'Caranguejo' | 'Leão' | 'Virgem' | 'Balança' | 'Escorpião' | 'Sagitário' | 'Capricórnio' | 'Aquário' | 'Peixes';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

/**
 * Represents the correlation between a Sephirah and its zodiac sign
 */
export interface SephirotZodiac {
  /** The name of the Sephirah (e.g., 'Kether', 'Chokmah') */
  sephirah: string;
  /** The zodiac sign associated with this Sephirah */
  signo: Signo;
  /** The elemental correspondence of the zodiac sign */
  elemento: Elemento;
  /** Spiritual meaning of this Sephirah-Zodiac correlation */
  significado_espiritual: string;
}

// ─── Sephirot-to-Zodiac Mapping ─────────────────────────────────────────────
// Maps the 10 Sephiroth to their zodiac correspondences.
// Zodiac assignments based on traditional Kabbalistic correspondences:
// Upper sephiroth: divine/ethereal, connection to higher signs (Capricórnio, Aquário)
// Middle sephiroth: transformation, solar energy (Leão, Áries, Sagitário)
// Lower sephiroth: emotional, lunar/water signs (Câncer, Escorpião, Peixes)
// Malkuth: material, earthy signs (Capricórnio, Touro)

export const SEPHIROT_ZODIAC_MAPPINGS: Record<string, SephirotZodiac> = {
  // 1. Kether (Crown) - Capricórnio
  // Highest sephirah - pure divine light, closest to Ein Sof
  // Capricórnio: the goat that climbs mountains, discipline, ambition
  Kether: {
    sephirah: 'Kether',
    signo: 'Capricórnio',
    elemento: 'Terra',
    significado_espiritual: 'Coroa Divina / Ascensão Espiritual / Disciplina Sagrada / Ponto de Partida para a Eternidade',
  },

  // 2. Chokmah (Wisdom) - Aquário
  // First burst of creative energy, cosmic wisdom
  // Aquário: innovation, humanitarianism, vision of the future
  Chokmah: {
    sephirah: 'Chokmah',
    signo: 'Aquário',
    elemento: 'Ar',
    significado_espiritual: 'Sabedoria Cósmica / Visão Futura / Impulso Criativo / Gênese da Consciência',
  },

  // 3. Binah (Understanding) - Gémeos
  // Form-giving, limitation, superior discrimination
  // Gémeos: duality, communication, intellect
  Binah: {
    sephirah: 'Binah',
    signo: 'Gémeos',
    elemento: 'Ar',
    significado_espiritual: 'Entendimento Superior / Formatação da Matéria / Discernimento Estruturado / Limite Divino',
  },

  // 4. Chesed (Mercy) - Sagitário
  // Divine mercy, expansion, abundance, grace
  // Sagitário: expansion, faith, philosophy, wisdom seeking
  Chesed: {
    sephirah: 'Chesed',
    signo: 'Sagitário',
    elemento: 'Fogo',
    significado_espiritual: 'Misericórdia Infinita / Expansão Espiritual / Abundância Divina / Júbilo Celeste',
  },

  // 5. Geburah (Severity) - Áries
  // Strength, righteous judgment, transformative power
  // Áries: courage, initiation, warrior energy, breaking barriers
  Geburah: {
    sephirah: 'Geburah',
    signo: 'Áries',
    elemento: 'Fogo',
    significado_espiritual: 'Severidade Divina / Força Transformadora / Coragem Guerreira / Destruição Criativa',
  },

  // 6. Tiphereth (Beauty) - Leão
  // Central sun, harmony, life purpose, healing center
  // Leão: solar energy, self-expression, leadership, vitality
  Tiphereth: {
    sephirah: 'Tiphereth',
    signo: 'Leão',
    elemento: 'Fogo',
    significado_espiritual: 'Beleza Solar / Propósito de Vida / Harmonia Central / Cura através do Amor',
  },

  // 7. Netzach (Victory) - Touro
  // Emotional love, universal love, triumph of feelings
  // Touro: stability, beauty appreciation, persistence, sensuality
  Netzach: {
    sephirah: 'Netzach',
    signo: 'Touro',
    elemento: 'Terra',
    significado_espiritual: 'Vitória Emocional / Amor Universal / Beleza Eterna / Fruição Espiritual',
  },

  // 8. Hod (Glory) - Virgem
  // Intellect, communication, divine truth
  // Virgem: analysis, perfection, service, discrimination
  Hod: {
    sephirah: 'Hod',
    signo: 'Virgem',
    elemento: 'Terra',
    significado_espiritual: 'Glória Intelectual / Verdade Revelada / Comunicação Sagrada / Serviço Divino',
  },

  // 9. Yesod (Foundation) - Caranguejo (Câncer)
  // Subconscious mind, imagination, lunar connection
  // Câncer: emotions, intuition, nurturing, ancestral memory
  Yesod: {
    sephirah: 'Yesod',
    signo: 'Caranguejo',
    elemento: 'Água',
    significado_espiritual: 'Fundação Subconsciente / Imaginação Divina / Memória Ancestral / Intuição Lunar',
  },

  // 10. Malkuth (Kingdom) - Capricórnio
  // Physical world, manifestation, grounding
  // Capricórnio: manifestation, structure, material success, discipline
  Malkuth: {
    sephirah: 'Malkuth',
    signo: 'Capricórnio',
    elemento: 'Terra',
    significado_espiritual: 'Reino Material / Manifestação Física / Aterramento Divino / Sabedoria Terrestre',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(SEPHIROT_ZODIAC_MAPPINGS);
Object.values(SEPHIROT_ZODIAC_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All 12 zodiac signs used in Sephirot mapping
 */
export const SIGNOS = ['Áries', 'Touro', 'Gémeos', 'Caranguejo', 'Leão', 'Virgem', 'Balança', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'] as const;

/**
 * Get the Sephirot-zodiac correlation mapping for a given sephirah
 * @param sephirah - The name of the Sephirah (e.g., 'Kether', 'Chokmah')
 * @returns The correlation mapping or null if not found
 */
export function getSephirotZodiac(sephirah: string): SephirotZodiac | null {
  return SEPHIROT_ZODIAC_MAPPINGS[sephirah] ?? null;
}

/**
 * Get the zodiac sephirot mapping
 * @param signo - The zodiac sign name
 * @returns All Sephiroth that correspond to this zodiac sign
 */
export function getZodiacSephirot(signo: string): SephirotZodiac[] {
  const normalized = signo.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.values(SEPHIROT_ZODIAC_MAPPINGS).filter(
    (mapping) => mapping.signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
}

/**
 * Get all available Sephirot-zodiac mappings
 * @returns Array of all correlation mappings
 */
export function getAllSephirotZodiacs(): SephirotZodiac[] {
  return Object.values(SEPHIROT_ZODIAC_MAPPINGS);
}

/**
 * Get all sephirah names
 * @returns Array of sephirah names
 */
export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_ZODIAC_MAPPINGS);
}

/**
 * Check if a sephirah exists in the mapping
 * @param sephirah - Sephirah name to check
 * @returns True if sephirah exists in mapping
 */
export function hasSephirotZodiac(sephirah: string): boolean {
  return sephirah in SEPHIROT_ZODIAC_MAPPINGS;
}

/**
 * Get the zodiac sign associated with a sephirah
 * @param sephirah - The sephirah name
 * @returns Zodiac sign or null if not found
 */
export function getSignoBySephirah(sephirah: string): Signo | null {
  return SEPHIROT_ZODIAC_MAPPINGS[sephirah]?.signo ?? null;
}

/**
 * Get the element associated with a sephirah's zodiac sign
 * @param sephirah - The sephirah name
 * @returns Element type or null if not found
 */
export function getElementBySephirah(sephirah: string): Elemento | null {
  return SEPHIROT_ZODIAC_MAPPINGS[sephirah]?.elemento ?? null;
}

/**
 * Get all sephiroth for a specific zodiac sign
 * @param signo - Zodiac sign name
 * @returns Array of SephirotZodiac mappings with this sign
 */
export function getSephirothBySigno(signo: string): SephirotZodiac[] {
  return getZodiacSephirot(signo);
}

/**
 * Get all zodiac signs used in sephirot mapping
 * @returns Array of unique zodiac sign names
 */
export function getAllSignos(): Signo[] {
  const signs = new Set(Object.values(SEPHIROT_ZODIAC_MAPPINGS).map((m) => m.signo));
  return Array.from(signs) as Signo[];
}

/**
 * Get all elements used in sephirot-zodiac mapping
 * @returns Array of unique element types
 */
export function getAllElements(): Elemento[] {
  const elements = new Set(Object.values(SEPHIROT_ZODIAC_MAPPINGS).map((m) => m.elemento));
  return Array.from(elements) as Elemento[];
}

/**
 * Get the spiritual meaning for a sephirah-zodiac correlation
 * @param sephirah - The sephirah name
 * @returns Spiritual meaning or null if not found
 */
export function getSpiritualMeaning(sephirah: string): string | null {
  return SEPHIROT_ZODIAC_MAPPINGS[sephirah]?.significado_espiritual ?? null;
}

// Default export for convenience
export default {
  getSephirotZodiac,
  getZodiacSephirot,
  getAllSephirotZodiacs,
  getAllSephiroth,
  hasSephirotZodiac,
  getSignoBySephirah,
  getElementBySephirah,
  getSephirothBySigno,
  getAllSignos,
  getAllElements,
  getSpiritualMeaning,
  SEPHIROT_ZODIAC_MAPPINGS,
  SIGNOS,
};