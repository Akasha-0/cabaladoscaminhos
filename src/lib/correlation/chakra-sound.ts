/**
 * Chakra-Sound Spiritual Correlation Module
 * Maps the 7 main chakras to their seed syllables, mantras, frequencies,
 * Platonic solids, elements, and planetary associations.
 *
 * Based on IDEIA.md - Alquimia Tântrica Cabala section and
 * the complete correlation engine from chakra-poliedro.ts, planet-chakra.ts,
 * and frequency-chakra.ts
 */

export interface ChakraSound {
  /** Chakra identifier (e.g., "1º Básico", "7º Coronário") */
  chakra: string;
  /** Sanskrit chakra name (e.g., "Muladhara", "Sahasrara") */
  chakra_sanskrit: string;
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
  /** Platonic solid (sacred geometry) */
  poliedro: string;
  /** Poliedro in English */
  poliedro_en: string;
  /** Number of faces (0 for sphere) */
  poliedro_faces: number;
  /** Associated classical planets */
  planetas: string[];
  /** Pronunciation guide for the mantra */
  pronunciacao: string;
  /** Divine name from Kabbalah */
  nome_divino: string;
  /** Elemental direction */
  direcao: string;
  /** Spiritual dynamics */
  dinamica: string;
}

/** Map of all 7 main chakras with their complete spiritual sound correlations */
const CHAKRA_SOUNDS: Record<number, ChakraSound> = {
  1: {
    chakra: "1º Básico",
    chakra_sanskrit: "Muladhara",
    chakra_numero: 1,
    som_semente: "LAM",
    mantram: "Lam",
    frequencia: 396,
    elemento: "Terra",
    poliedro: "Cubo",
    poliedro_en: "Hexahedron",
    poliedro_faces: 6,
    planetas: ["Lua", "Saturno"],
    pronunciacao: "lahm (com 'a' longo, vibração na base da coluna)",
    nome_divino: "ADONAI HA-ARETZ",
    direcao: "Norte",
    dinamica: "Dissolução de medos de sobrevivência, ancoramento e firmeza material.",
  },
  2: {
    chakra: "2º Sacro",
    chakra_sanskrit: "Svadhisthana",
    chakra_numero: 2,
    som_semente: "VAM",
    mantram: "Vam",
    frequencia: 417,
    elemento: "Água",
    poliedro: "Icosaedro",
    poliedro_en: "Icosahedron",
    poliedro_faces: 20,
    planetas: ["Marte"],
    pronunciacao: "vahm (com 'a' longo, vibração no baixo ventre)",
    nome_divino: "ELOHIM GIBOR",
    direcao: "Oeste",
    dinamica: "Limpeza de traumas do passado, transmutação criativa e fluidez vital.",
  },
  3: {
    chakra: "3º Plexo Solar",
    chakra_sanskrit: "Manipura",
    chakra_numero: 3,
    som_semente: "RAM",
    mantram: "Ram",
    frequencia: 528,
    elemento: "Fogo",
    poliedro: "Tetraedro",
    poliedro_en: "Tetrahedron",
    poliedro_faces: 4,
    planetas: ["Sol", "Marte", "Mercúrio"],
    pronunciacao: "rahm (com 'a' longo, vibração no plexo solar)",
    nome_divino: "SHADDAI EL CHAI",
    direcao: "Oeste",
    dinamica: "Transformação da força de vontade, quebra de medos e ativação do brilho pessoal.",
  },
  4: {
    chakra: "4º Cardíaco",
    chakra_sanskrit: "Anahata",
    chakra_numero: 4,
    som_semente: "YAM",
    mantram: "Yam",
    frequencia: 639,
    elemento: "Ar",
    poliedro: "Octaedro",
    poliedro_en: "Octahedron",
    poliedro_faces: 8,
    planetas: ["Júpiter", "Vênus", "Saturno"],
    pronunciacao: "yyahm (com 'a' longo, vibração no coração)",
    nome_divino: "YHVH ELOAH VA-DAATH",
    direcao: "Sul",
    dinamica: "Expansão do afeto incondicional, harmonização de relacionamentos e cura emocional.",
  },
  5: {
    chakra: "5º Laríngeo",
    chakra_sanskrit: "Vishuddha",
    chakra_numero: 5,
    som_semente: "HAM",
    mantram: "Ham",
    frequencia: 741,
    elemento: "Ar",
    poliedro: "Dodecaedro",
    poliedro_en: "Dodecahedron",
    poliedro_faces: 12,
    planetas: ["Mercúrio"],
    pronunciacao: "hahm (com 'a' longo, vibração na garganta)",
    nome_divino: "ELOHIM SABAOTH",
    direcao: "Leste",
    dinamica: "Expressão da verdade interna, purificação e poder da palavra falada.",
  },
  6: {
    chakra: "6º Frontal",
    chakra_sanskrit: "Ajna",
    chakra_numero: 6,
    som_semente: "OM",
    mantram: "Om",
    frequencia: 852,
    elemento: "Éter",
    poliedro: "Icosaedro",
    poliedro_en: "Icosahedron",
    poliedro_faces: 20,
    planetas: ["Lua"],
    pronunciacao: "oh-umm (som primordial, vibração no centro da testa)",
    nome_divino: "YAH",
    direcao: "Leste",
    dinamica: "Despertar da intuição profunda, visão clara e dissolução de ilusões mentais.",
  },
  7: {
    chakra: "7º Coronário",
    chakra_sanskrit: "Sahasrara",
    chakra_numero: 7,
    som_semente: "OM",
    mantram: "Aum",
    frequencia: 963,
    elemento: "Éter",
    poliedro: "Esfera",
    poliedro_en: "Sphere",
    poliedro_faces: 0,
    planetas: ["Sol", "Júpiter"],
    pronunciacao: "a-u-umm (tríade sonora sagrada, vibração no topo da cabeça)",
    nome_divino: "EHEIEH",
    direcao: "Centro / Zênite",
    dinamica: "Conexão espiritual direta com a Fonte e iluminação da mente através do silêncio.",
  },
};

/**
 * Retrieves the sound correlation mapping for a given chakra identifier
 * @param chakra - Chakra name (e.g., "1º Básico", "7º Coronário", "Muladhara") or number as string
 * @returns ChakraSound mapping or undefined if not found
 */
export function getChakraSound(chakra: string): ChakraSound | undefined {
  // Try exact match by chakra name first
  const exactMatch = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.chakra === chakra
  );
  if (exactMatch) return exactMatch;

  // Try matching by Sanskrit name
  const bySanskrit = Object.values(CHAKRA_SOUNDS).find(
    (c) => c.chakra_sanskrit.toLowerCase() === chakra.toLowerCase()
  );
  if (bySanskrit) return bySanskrit;

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

/**
 * Get complete chakra frequency data with all correlations
 * Returns array with chakra, frequency, seed sound, mantram, geometry, and planet associations
 * @returns Array of ChakraFrequency objects ordered by chakra number
 */
export interface ChakraFrequency {
  chakra: string;
  chakra_sanskrit: string;
  chakra_numero: number;
  frequencia: number;
  som_semente: string;
  mantram: string;
  poliedro: string;
  poliedro_en: string;
  poliedro_faces: number;
  elemento: string;
  planetas: string[];
  nome_divino: string;
  direcao: string;
}

export function getChakraFrequencies(): ChakraFrequency[] {
  return Object.values(CHAKRA_SOUNDS)
    .sort((a, b) => a.chakra_numero - b.chakra_numero)
    .map((c) => ({
      chakra: c.chakra,
      chakra_sanskrit: c.chakra_sanskrit,
      chakra_numero: c.chakra_numero,
      frequencia: c.frequencia,
      som_semente: c.som_semente,
      mantram: c.mantram,
      poliedro: c.poliedro,
      poliedro_en: c.poliedro_en,
      poliedro_faces: c.poliedro_faces,
      elemento: c.elemento,
      planetas: c.planetas,
      nome_divino: c.nome_divino,
      direcao: c.direcao,
    }));
}

/**
 * Get the chakra(s) activated by a given planet
 * @param planeta - Planet name (e.g., "Sol", "Lua", "Marte")
 * @returns Array of ChakraSound objects associated with the planet, or empty array if none found
 */
export function getChakraForPlanet(planeta: string): ChakraSound[] {
  const normalized = planeta.trim().toLowerCase();

  // Normalize planet names with accents
  const planetMap: Record<string, string> = {
    sol: "Sol",
    lua: "Lua",
    marte: "Marte",
    mercurio: "Mercúrio",
    mercúrio: "Mercúrio",
    jupiter: "Júpiter",
    júpiter: "Júpiter",
    venus: "Vênus",
    vênus: "Vênus",
    saturno: "Saturno",
  };

  const normalizedPlanet = planetMap[normalized] ?? planeta;

  return Object.values(CHAKRA_SOUNDS).filter((c) =>
    c.planetas.some((p) => p.toLowerCase() === normalizedPlanet.toLowerCase())
  );
}

/**
 * Get the exact Solfeggio frequency for a given chakra
 * @param chakra - Chakra identifier (name, number, or Sanskrit name)
 * @returns Frequency in Hz, or undefined if chakra not found
 */
export function getFrequencyForChakra(chakra: string): number | undefined {
  return getChakraSound(chakra)?.frequencia;
}
