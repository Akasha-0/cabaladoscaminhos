/**
 * Zodiac-Sephirot Spiritual Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns the 12 zodiac signs with the 10 Sephiroth of the Kabbalistic Tree of Life
 */

/** Element types for correlation */
export type Elemento = 'Fogo' | 'Água' | 'Terra' | 'Ar';

/** The 10 Sephiroth names */
export type Sephirah =
  | 'Kether'
  | 'Chokmah'
  | 'Binah'
  | 'Chesed'
  | 'Geburah'
  | 'Tiphereth'
  | 'Netzach'
  | 'Hod'
  | 'Yesod'
  | 'Malkuth';

/**
 * Represents the correlation between a zodiac sign and its Sephirah correspondence
 */
export interface ZodiacSephirot {
  /** The zodiac sign name in Portuguese */
  signo: string;
  /** The associated Sephirah name */
  sephirah: Sephirah;
  /** Element connection (Fogo, Água, Terra, Ar) */
  elemento: Elemento;
  /** Path number on the Tree of Life (1-22, including the 22 paths) */
  numero_caminho: number;
  /** Spiritual meaning and archetype correlation */
  significado_espiritual: string;
}

// ─── Zodiac-to-Sephiroth Mapping ─────────────────────────────────────────────

/**
 * Complete mapping of all 12 zodiac signs to their Sephiroth correspondences.
 * Based on the Cabala dos Caminhos system integrating Western astrology
 * with Kabbalistic Tree of Life wisdom.
 * 
 * The mapping follows traditional esoteric correspondences where:
 * - Fire signs connect to active, radiating Sephiroth
 * - Earth signs connect to stabilizing, manifesting Sephiroth
 * - Air signs connect to mental, communicative Sephiroth
 * - Water signs connect to receptive, emotional Sephiroth
 */
export const ZODIAC_SEPHIROT_MAPPINGS: Record<string, ZodiacSephirot> = {
  // 1. Áries (Cardinal Fire) - Kether (Crown) - Path 1
  // The initiating fire of the crown, pure will before form.
  Áries: {
    signo: 'Áries',
    sephirah: 'Kether',
    elemento: 'Fogo',
    numero_caminho: 1,
    significado_espiritual: 'A coroa divina em sua expressão mais pura, o impulso primário de existência que dá início a todo ciclo. A fagulha criativa que rompe a inércia do vazio. O guerreiro cósmico que abre caminhos através da vontade pura.',
  },

  // 2. Touro (Fixed Earth) - Chokmah (Wisdom) - Path 2
  // The stable earth of wisdom, the bull's patient strength.
  Touro: {
    signo: 'Touro',
    sephirah: 'Chokmah',
    elemento: 'Terra',
    numero_caminho: 2,
    significado_espiritual: 'A sabedoria dinâmica que se move como um touro, o impulso masculino primordial que busca manifestar-se. A fertilidade da terra que sustenta a vida. A perseverança que transforma o desejo em realidade concreta.',
  },

  // 3. Gémeos (Mutable Air) - Binah (Understanding) - Path 3
  // The understanding of duality, the twins' communication.
  Gémeos: {
    signo: 'Gémeos',
    sephirah: 'Binah',
    elemento: 'Ar',
    numero_caminho: 3,
    significado_espiritual: 'O entendimento formativo que limita e dá forma, a mente que distingue e categoriza. A limitação sagrada que permite a comunicação entre opostos. A dualidade que manifesta a multiplicidade através da análise.',
  },

  // 4. Câncer (Cardinal Water) - Chesed (Mercy) - Path 4
  // The nurturing water of mercy, the crab's protection.
  Câncer: {
    signo: 'Câncer',
    sephirah: 'Chesed',
    elemento: 'Água',
    numero_caminho: 4,
    significado_espiritual: 'A misericórdia expansiva que nutre e protege, o amor maternal que acolhe sem julgamento. A expansão da consciência através da compaixão. A estrutura sagrada que sustenta o universo emocional.',
  },

  // 5. Leão (Fixed Fire) - Geburah (Severity) - Path 5
  // The fierce fire of severity, the lion's regal power.
  Leão: {
    signo: 'Leão',
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    significado_espiritual: 'A severidade cortante que poda o excesso, a justiça que estabelece limites. A força do leão que protege seu território. O poder transformador que queima o que não serve para criar espaço ao novo.',
  },

  // 6. Virgem (Mutable Earth) - Tiphereth (Beauty) - Path 6
  // The perfection-seeking earth of beauty, the virgin's purity.
  Virgem: {
    signo: 'Virgem',
    sephirah: 'Tiphereth',
    elemento: 'Terra',
    numero_caminho: 6,
    significado_espiritual: 'A harmonia central que busca a perfeição, o ponto de equilíbrio entre todas as forças. A beleza que emerge da ordem interior. O sacrifício sagrado que purifica através do serviço dedicado.',
  },

  // 7. Balança (Cardinal Air) - Netzach (Victory) - Path 7
  // The balanced air of victory, the scales' justice.
  Balança: {
    signo: 'Balança',
    sephirah: 'Netzach',
    elemento: 'Ar',
    numero_caminho: 7,
    significado_espiritual: 'A vitória emocional pelo amor e parceria, a harmonia das relações entre iguais. A balança que mede com precisão. A paixão que vence toda resistência através da harmonia natural.',
  },

  // 8. Escorpião (Fixed Water) - Hod (Glory) - Path 8
  // The deep water of glory, the scorpion's transformative sting.
  Escorpião: {
    signo: 'Escorpião',
    sephirah: 'Hod',
    elemento: 'Água',
    numero_caminho: 8,
    significado_espiritual: 'A glória intelectual que penetra os mistérios, a sabedoria que desce aos abismos. A transformação que nasce da morte do ego. A profundidade emocional que recria a si mesmo das cinzas.',
  },

  // 9. Sagitário (Mutable Fire) - Yesod (Foundation) - Path 9
  // The expansive fire of foundation, the archer's vision.
  Sagitário: {
    signo: 'Sagitário',
    sephirah: 'Yesod',
    elemento: 'Fogo',
    numero_caminho: 9,
    significado_espiritual: 'A fundação do subconsciente que ancora a expansão, a base sobre a qual se manifesta a verdade. A sabedoria que расширяется além dos limites. A filosofia que fundamenta o crescimento espiritual.',
  },

  // 10. Capricórnio (Cardinal Earth) - Malkuth (Kingdom) - Path 10
  // The material earth of kingdom, the goat's disciplined climb.
  Capricórnio: {
    signo: 'Capricórnio',
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 10,
    significado_espiritual: 'O reino material que manifesta a vontade divina, a terra que é o objetivo final da criação. A disciplina que escala montanhas. A realização concreta que honra o trabalho sagrado do mundo.',
  },

  // 11. Aquário (Fixed Air) - Extended mapping to Kether/Crown - Path 11
  // The innovative air of the new age, the water-bearer's vision.
  Aquário: {
    signo: 'Aquário',
    sephirah: 'Kether',
    elemento: 'Ar',
    numero_caminho: 11,
    significado_espiritual: 'A coroa coletivamente expandida, o futuro que ainda não existe. A inovação que quebra estruturas obsoletas. O water-bearer que carrega a luz para uma nova era de consciência coletiva.',
  },

  // 12. Peixes (Mutable Water) - Extended mapping to Binah/Understanding - Path 12
  // The dissolving water of enlightenment, the fishes' transcendence.
  Peixes: {
    signo: 'Peixes',
    sephirah: 'Binah',
    elemento: 'Água',
    numero_caminho: 12,
    significado_espiritual: 'O entendimento que dissolve os limites do eu, a transcendência que dissolve a dualidade. A compaixão que abraça tudo e todos. A unified consciência que retorna à fonte original.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(ZODIAC_SEPHIROT_MAPPINGS);
// Freeze nested objects
Object.values(ZODIAC_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Normalizes a zodiac sign name for lookup
 * Handles case, accents, and common variations
 */
function normalizeSigno(signo: string): string {
  return signo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Mapping of normalized sign names to standard Portuguese names
 */
const NORMALIZED_TO_SIGNO: Record<string, string> = {
  'aries': 'Áries',
  'touro': 'Touro',
  'gemes': 'Gémeos',
  'gemeos': 'Gémeos',
  'cancer': 'Câncer',
  'cancrejo': 'Câncer',
  'caranguejo': 'Câncer',
  'leao': 'Leão',
  'virgem': 'Virgem',
  'balanca': 'Balança',
  'libra': 'Balança',
  'escorpiao': 'Escorpião',
  'scorpio': 'Escorpião',
  'sagitario': 'Sagitário',
  'capricornio': 'Capricórnio',
  'aquario': 'Aquário',
  'peixes': 'Peixes',
};

/**
 * Get the zodiac-Sephirot correlation mapping for a given sign.
 *
 * @param signo - The zodiac sign name (case-insensitive, accent-tolerant)
 * @returns The correlation mapping or null if sign not found
 *
 * @example
 * getZodiacSephirot('Áries')?.sephirah // 'Kether'
 * getZodiacSephirot('Leão')?.elemento // 'Fogo'
 */
export function getZodiacSephirot(signo: string): ZodiacSephirot | null {
  const normalized = normalizeSigno(signo);
  const standard = NORMALIZED_TO_SIGNO[normalized];
  return standard ? (ZODIAC_SEPHIROT_MAPPINGS[standard] ?? null) : null;
}

/**
 * Get the zodiac sign corresponding to a Sephirah.
 *
 * @param sephirah - The Sephirah name (e.g., 'Kether', 'Chokmah')
 * @returns The zodiac sign name or null if not found
 *
 * @example
 * getSephirotZodiac('Kether') // 'Áries'
 * getSephirotZodiac('Malkuth') // 'Capricórnio'
 */
export function getSephirotZodiac(sephirah: string): string | null {
  const entry = Object.values(ZODIAC_SEPHIROT_MAPPINGS).find(
    mapping => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
  return entry?.signo ?? null;
}

/**
 * Get all available zodiac-Sephirot mappings.
 *
 * @returns Array of all correlation mappings
 *
 * @example
 * const all = getAllZodiacSephiroth();
 * all.length // 12
 */
export function getAllZodiacSephiroth(): ZodiacSephirot[] {
  return Object.values(ZODIAC_SEPHIROT_MAPPINGS);
}

/**
 * Get all zodiac signs mapped to a specific Sephirah.
 *
 * @param sephirah - The Sephirah name
 * @returns Array of zodiac sign names
 *
 * @example
 * getZodiacsBySephirot('Kether') // ['Áries', 'Aquário']
 */
export function getZodiacsBySephirot(sephirah: string): string[] {
  return Object.values(ZODIAC_SEPHIROT_MAPPINGS)
    .filter(mapping => mapping.sephirah.toLowerCase() === sephirah.toLowerCase())
    .map(mapping => mapping.signo);
}

/**
 * Get all Sephirah names.
 *
 * @returns Array of unique Sephirah names used in the mapping
 *
 * @example
 * const sephiroth = getAllSephiroth(); // ['Kether', 'Chokmah', ...]
 */
export function getAllSephiroth(): string[] {
  return [...new Set(Object.values(ZODIAC_SEPHIROT_MAPPINGS).map(m => m.sephirah))];
}

/**
 * Check if a zodiac sign exists in the mapping.
 *
 * @param signo - The zodiac sign name to check
 * @returns True if sign exists in mapping
 */
export function hasZodiacSephirot(signo: string): boolean {
  const normalized = normalizeSigno(signo);
  const standard = NORMALIZED_TO_SIGNO[normalized];
  return standard ? standard in ZODIAC_SEPHIROT_MAPPINGS : false;
}

/**
 * Get zodiac signs by element.
 *
 * @param elemento - The element name (e.g., 'Fogo', 'Água')
 * @returns Array of zodiac sign names with that element
 *
 * @example
 * getZodiacsByElement('Fogo') // ['Áries', 'Leão', 'Sagitário']
 */
export function getZodiacsByElement(elemento: string): string[] {
  return Object.values(ZODIAC_SEPHIROT_MAPPINGS)
    .filter(mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase())
    .map(mapping => mapping.signo);
}

/**
 * Get the path number for a zodiac sign on the Tree of Life.
 *
 * @param signo - The zodiac sign name
 * @returns Path number (1-22) or null if not found
 */
export function getPathBySigno(signo: string): number | null {
  const mapping = getZodiacSephirot(signo);
  return mapping?.numero_caminho ?? null;
}

/**
 * Get the Sephirah name by path number on the Tree of Life.
 *
 * @param caminho - The path number (1-22)
 * @returns The Sephirah name or null if not found
 */
export function getSephirotByPath(caminho: number): string | null {
  const entry = Object.values(ZODIAC_SEPHIROT_MAPPINGS).find(
    mapping => mapping.numero_caminho === caminho
  );
  return entry?.sephirah ?? null;
}