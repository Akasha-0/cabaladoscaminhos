/**
 * Chakra-Sound Spiritual Correlation Module
 * Maps the 7 main chakras to their seed syllables, mantras, frequencies, and elements
 * Based on IDEIA.md - Alquimia Tântrica Cabala section
 */

export interface ChakraSound {
  /** Chakra identifier (e.g., "1º Básico", "7º Coronário") */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Seed syllable (bija mantra) */
  som_semente: string;
  /** Seed mantra text */
  mantram: string;
  /** Frequency in Hertz */
  frequencia: number;
  /** Element associated with the chakra */
  elemento: string;
  /** Pronunciation guide for the mantra */
  pronunciacao: string;
}

/** Map of all 7 main chakras with their spiritual sound correlations */
const CHAKRA_SOUNDS: Record<number, ChakraSound> = {
  1: {
    chakra: "1º Básico",
    chakra_numero: 1,
    som_semente: "LAM",
    mantram: "Lam",
    frequencia: 396,
    elemento: "Terra",
    pronunciacao: "lahm (com 'a' longo, vibração na base da coluna)",
  },
  2: {
    chakra: "2º Sacro",
    chakra_numero: 2,
    som_semente: "VAM",
    mantram: "Vam",
    frequencia: 417,
    elemento: "Água",
    pronunciacao: "vahm (com 'a' longo, vibração no baixo ventre)",
  },
  3: {
    chakra: "3º Plexo Solar",
    chakra_numero: 3,
    som_semente: "RAM",
    mantram: "Ram",
    frequencia: 528,
    elemento: "Fogo",
    pronunciacao: "rahm (com 'a' longo, vibração no plexo solar)",
  },
  4: {
    chakra: "4º Cardíaco",
    chakra_numero: 4,
    som_semente: "YAM",
    mantram: "Yam",
    frequencia: 639,
    elemento: "Ar",
    pronunciacao: "yyahm (com 'a' longo, vibração no coração)",
  },
  5: {
    chakra: "5º Laríngeo",
    chakra_numero: 5,
    som_semente: "HAM",
    mantram: "Ham",
    frequencia: 741,
    elemento: "Ar",
    pronunciacao: "hahm (com 'a' longo, vibração na garganta)",
  },
  6: {
    chakra: "6º Frontal",
    chakra_numero: 6,
    som_semente: "OM",
    mantram: "Om",
    frequencia: 852,
    elemento: "Éter",
    pronunciacao: "oh-umm (som primordial, vibração no centro da testa)",
  },
  7: {
    chakra: "7º Coronário",
    chakra_numero: 7,
    som_semente: "OM",
    mantram: "Aum",
    frequencia: 963,
    elemento: "Éter",
    pronunciacao: "a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)",
  },
};

/**
 * Retrieves the sound correlation mapping for a given chakra identifier
 * @param chakra - Chakra name (e.g., "1º Básico", "7º Coronário") or number as string
 * @returns ChakraSound mapping or undefined if not found
 */
export function getChakraSound(chakra: string): ChakraSound | undefined {
  // Try exact match by chakra name first
  const exactMatch = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.chakra === chakra
  );
  if (exactMatch) return exactMatch;

  // Try matching by chakra number (e.g., "1", "7")
  const numMatch = parseInt(chakra, 10);
  if (!isNaN(numMatch) && numMatch >= 1 && numMatch <= 7) {
    return CHAKRA_SOUNDS[numMatch];
  }

  // Try partial match (e.g., "Básico", "Sacro", "Coronário")
  const lowerChakra = chakra.toLowerCase();
  const partialMatch = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.chakra.toLowerCase().includes(lowerChakra)
  );
  if (partialMatch) return partialMatch;

  return undefined;
}

/**
 * Retrieves the chakra associated with a given seed syllable or mantra
 * @param som - Seed syllable (e.g., "LAM", "OM") or mantra text
 * @returns ChakraSound mapping or undefined if not found
 */
export function getSoundChakra(som: string): ChakraSound | undefined {
  const upperSom = som.toUpperCase();
  const lowerSom = som.toLowerCase();

  // Try exact match by seed syllable
  const bySeedSyllable = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.som_semente.toUpperCase() === upperSom
  );
  if (bySeedSyllable) return bySeedSyllable;

  // Try exact match by mantram
  const byMantram = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.mantram.toLowerCase() === lowerSom
  );
  if (byMantram) return byMantram;

  // Try partial match
  const partialMatch = Object.values(CHAKRA_SOUNDS).find(
    (c) =>
      c.som_semente.toLowerCase().includes(lowerSom) ||
      c.mantram.toLowerCase().includes(lowerSom)
  );
  if (partialMatch) return partialMatch;

  return undefined;
}

/**
 * Get all chakra sound mappings
 * @returns Array of all ChakraSound objects ordered by chakra number
 */
export function getAllChakraSounds(): ChakraSound[] {
  return Object.values(CHAKRA_SOUNDS).sort((a, b) => a.chakra_numero - b.chakra_numero);
}
