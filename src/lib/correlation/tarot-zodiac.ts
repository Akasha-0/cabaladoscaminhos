/**
 * Tarot-Zodiac Major Arcana Correlation
 * Correlates the 22 Major Arcana cards with the 12 Zodiac signs
 * Based on Traditional Tarot symbolism and Western Astrology correspondences
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Zodiac correspondence
 */
export interface TarotZodiacMapping {
  /** The Arcana number (0-21) */
  arcano: number;
  /** The Major Arcana card name in Portuguese */
  carta: string;
  /** The associated Zodiac sign */
  signo: string;
  /** Elemental association (Fogo, Água, Terra, Ar) */
  elemento: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** The range of zodiac degrees associated (starting degree) */
  grau_zodiacal: number;
}

// ─── Tarot Major Arcana-to-Zodiac Mapping ─────────────────────────────────────

export const TAROT_ZODIAC_MAPPINGS: Record<number, TarotZodiacMapping> = {
  0: {
    arcano: 0,
    carta: 'O Louco',
    signo: 'Aquário',
    elemento: 'Ar',
    significado_espiritual:
      'O Iniciado, liberdade, salto de fé, renovação, despreocupação e spontaneidade. O eterno viajante que caminha sem medo.',
    grau_zodiacal: 20,
  },
  1: {
    arcano: 1,
    carta: 'O Mago',
    signo: 'Mercúrio',
    elemento: 'Ar',
    significado_espiritual:
      'O Poder, manifestação, habilidade, vontade e comunicação. O catalyst que transforma a intenção em realidade.',
    grau_zodiacal: 15,
  },
  2: {
    arcano: 2,
    carta: 'A Sacerdotisa',
    signo: 'Lua',
    elemento: 'Água',
    significado_espiritual:
      'A Intuição, mistério, sabedoria oculta, o divino feminino e os segredos do universo. A guardiã dos mistérios.',
    grau_zodiacal: 0,
  },
  3: {
    arcano: 3,
    carta: 'A Imperatriz',
    signo: 'Vênus',
    elemento: 'Terra',
    significado_espiritual:
      'A Abundância, fertilidade, natureza, beleza, criação e nutrição. A mãe universal que sustenta toda vida.',
    grau_zodiacal: 0,
  },
  4: {
    arcano: 4,
    carta: 'O Imperador',
    signo: 'Áries',
    elemento: 'Fogo',
    significado_espiritual:
      'A Autoridade, estrutura, liderança, estabilidade e disciplina. O pai que estabelece ordem no caos.',
    grau_zodiacal: 0,
  },
  5: {
    arcano: 5,
    carta: 'O Hierofante',
    signo: 'Touro',
    elemento: 'Terra',
    significado_espiritual:
      'A Tradição, espiritualidade, fé, ensinamentos e orientação. O sábio que guia pela experiência.',
    grau_zodiacal: 0,
  },
  6: {
    arcano: 6,
    carta: 'Os Enamorados',
    signo: 'Gêmeos',
    elemento: 'Ar',
    significado_espiritual:
      'A União, escolha, dualidade, amor e alinhamento de valores. O momento de decisão que define o caminho.',
    grau_zodiacal: 0,
  },
  7: {
    arcano: 7,
    carta: 'O Carro',
    signo: 'Câncer',
    elemento: 'Água',
    significado_espiritual:
      'A Conquista, vitória, determinação, controlo e autorresponsabilidade. O guerreiro que vence pela vontade.',
    grau_zodiacal: 0,
  },
  8: {
    arcano: 8,
    carta: 'A Justiça',
    signo: 'Libra',
    elemento: 'Ar',
    significado_espiritual:
      'O Equilíbrio, verdade, lei, consequências e imparcialidade. O justo que pesa as ações com precisão.',
    grau_zodiacal: 0,
  },
  9: {
    arcano: 9,
    carta: 'O Eremita',
    signo: 'Virgem',
    elemento: 'Terra',
    significado_espiritual:
      'A Iluminação interior, introspecção, solidão, sabedoria e busca da verdade. O peregrino que caminha para dentro.',
    grau_zodiacal: 0,
  },
  10: {
    arcano: 10,
    carta: 'A Roda da Fortuna',
    signo: 'Júpiter',
    elemento: 'Fogo',
    significado_espiritual:
      'O Destino, ciclos, mudança, sorte e o fluxo inevitável da vida. A roda que gira sem parar.',
    grau_zodiacal: 0,
  },
  11: {
    arcano: 11,
    carta: 'A Força',
    signo: 'Leão',
    elemento: 'Fogo',
    significado_espiritual:
      'A Coragem, força interior, perseverança, compaixão e poder gentil. O leão que domestica sua besta interior.',
    grau_zodiacal: 0,
  },
  12: {
    arcano: 12,
    carta: 'O Enforcado',
    signo: 'Netuno',
    elemento: 'Água',
    significado_espiritual:
      'O Sacrifício, nova perspectiva, entrega, rendição e sacrifício voluntário. O que se entrega para transcender.',
    grau_zodiacal: 0,
  },
  13: {
    arcano: 13,
    carta: 'A Morte',
    signo: 'Escorpião',
    elemento: 'Água',
    significado_espiritual:
      'A Transformação, fim, renovação, passagem do velho para o novo e mutação profunda. A fênix que renasce das cinzas.',
    grau_zodiacal: 0,
  },
  14: {
    arcano: 14,
    carta: 'A Temperança',
    signo: 'Sagitário',
    elemento: 'Fogo',
    significado_espiritual:
      'O Equilíbrio, paciência, harmonização, moderação e integração dos opostos. O alquimista que transfigura.',
    grau_zodiacal: 0,
  },
  15: {
    arcano: 15,
    carta: 'O Diabo',
    signo: 'Capricórnio',
    elemento: 'Terra',
    significado_espiritual:
      'A Ocultação, tentação, materialismo, amarras e sombras interiores. O guardião do limiar inferior.',
    grau_zodiacal: 0,
  },
  16: {
    arcano: 16,
    carta: 'A Torre',
    signo: 'Marte',
    elemento: 'Fogo',
    significado_espiritual:
      'A Destruição criativa, upheaval, revelação súbita, mudança abrupta e despertar. O raio que ilumina a verdade.',
    grau_zodiacal: 0,
  },
  17: {
    arcano: 17,
    carta: 'A Estrela',
    signo: 'Aquário',
    elemento: 'Ar',
    significado_espiritual:
      'A Esperança, inspiração, luz, serenidade, renovação e conexão celestial. A constelação que guia os perdidos.',
    grau_zodiacal: 27,
  },
  18: {
    arcano: 18,
    carta: 'A Lua',
    signo: 'Peixes',
    elemento: 'Água',
    significado_espiritual:
      'A Ilusão, inconsciente, medos ocultos, confusão e a noite mais escura. O espelho que reflete verdades escondidas.',
    grau_zodiacal: 0,
  },
  19: {
    arcano: 19,
    carta: 'O Sol',
    signo: 'Leão',
    elemento: 'Fogo',
    significado_espiritual:
      'A Alegria, sucesso, vitalidade, clareza, criança interior e a luz que dissipa as sombras. O astro rei que reanima.',
    grau_zodiacal: 0,
  },
  20: {
    arcano: 20,
    carta: 'O Julgamento',
    signo: 'Plutão',
    elemento: 'Fogo',
    significado_espiritual:
      'A Renovação, redenção, despertar, julgamento interior e ressurreição. A trombeta que chama à nova vida.',
    grau_zodiacal: 0,
  },
  21: {
    arcano: 21,
    carta: 'O Mundo',
    signo: 'Saturno',
    elemento: 'Terra',
    significado_espiritual:
      'A Completude, realização, integração, conquista e cumprimento. O círculo que se fecha com harmonia.',
    grau_zodiacal: 0,
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ZODIAC_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_ZODIAC_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Tarot-to-Zodiac correlation mapping
 * @param arcano - Arcana number from 0 to 21
 * @returns The correlation mapping or null if not found
 */
export function getTarotZodiac(arcano: number): TarotZodiacMapping | null {
  return TAROT_ZODIAC_MAPPINGS[arcano] ?? null;
}

/**
 * Get the Tarot Major Arcana card corresponding to a Zodiac sign
 * @param signo - The Zodiac sign name
 * @returns The arcano number or null if not found
 */
export function getZodiacTarot(signo: string): number | null {
  const mapping = Object.values(TAROT_ZODIAC_MAPPINGS).find(
    (m) => m.signo.toLowerCase() === signo.toLowerCase()
  );
  return mapping?.arcano ?? null;
}

/**
 * Get all available Tarot-Zodiac mappings
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotZodiacs(): TarotZodiacMapping[] {
  return Object.values(TAROT_ZODIAC_MAPPINGS).sort((a, b) => a.arcano - b.arcano);
}

/**
 * Get all arcano numbers
 * @returns Array of numbers 0-21
 */
export function getAllArcanos(): number[] {
  return Object.keys(TAROT_ZODIAC_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano number to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotZodiac(arcano: number): boolean {
  return arcano in TAROT_ZODIAC_MAPPINGS;
}

/**
 * Get mapping by card name
 * @param carta - The card name
 * @returns The correlation mapping or null if not found
 */
export function getMappingByCarta(carta: string): TarotZodiacMapping | null {
  const mapping = Object.values(TAROT_ZODIAC_MAPPINGS).find(
    (m) => m.carta.toLowerCase() === carta.toLowerCase()
  );
  return mapping ?? null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar)
 * @returns Array of TarotZodiacMapping objects matching the element
 */
export function getTarotZodiacByElement(elemento: string): TarotZodiacMapping[] {
  return Object.values(TAROT_ZODIAC_MAPPINGS)
    .filter((m) => m.elemento.toLowerCase() === elemento.toLowerCase())
    .sort((a, b) => a.arcano - b.arcano);
}

/**
 * Get mappings filtered by Zodiac sign
 * @param signo - Zodiac sign to search for
 * @returns Array of TarotZodiacMapping objects associated with the sign
 */
export function getTarotZodiacBySigno(signo: string): TarotZodiacMapping[] {
  return Object.values(TAROT_ZODIAC_MAPPINGS)
    .filter((m) => m.signo.toLowerCase() === signo.toLowerCase())
    .sort((a, b) => a.arcano - b.arcano);
}

export default {
  getTarotZodiac,
  getZodiacTarot,
  getAllTarotZodiacs,
  getAllArcanos,
  hasTarotZodiac,
  getMappingByCarta,
  getTarotZodiacByElement,
  getTarotZodiacBySigno,
  TAROT_ZODIAC_MAPPINGS,
};