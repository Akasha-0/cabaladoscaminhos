/**
 * Planet-Tarot Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns the 7 classical planets with Tarot Major Arcana cards
 */

/**
 * Represents the correlation between a planet and its Tarot Major Arcana correspondence
 */
export interface PlanetTarotMapping {
  /** The classical planet name */
  planeta: string;
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Planet-to-Tarot Major Arcana Mapping ─────────────────────────────────────

export const PLANET_TAROT_MAPPINGS: Record<string, PlanetTarotMapping> = {
  Sol: {
    planeta: 'Sol',
    arcano: 'O Sol',
    numero_carta: 19,
    significado_espiritual: 'Vitalidade, irradiação do poder pessoal, sucesso e alinhamento com o propósito de vida. Clareza interior e brilho próprio.',
    interpretacao: 'Dia de maximizar a energia pessoal, buscar reconhecimento, assumir liderança e manifestar seus talentos. Foque no brilho próprio e na阳性能量.',
  },
  Lua: {
    planeta: 'Lua',
    arcano: 'A Lua',
    numero_carta: 18,
    significado_espiritual: 'Intuição profunda, o inconsciente, ilusões e flutuação emocional. Ciclo noturno da mente e conexão com a água.',
    interpretacao: 'Período propício para trabalho interno, meditação, sonhos e processos de limpeza emocional. Confie na intuição, mas evite decisões impulsivas.',
  },
  Marte: {
    planeta: 'Marte',
    arcano: 'O Imperador',
    numero_carta: 4,
    significado_espiritual: 'Força de vontade, liderança marcial, estratégia militar e autoridade. O guerreiro que ordena o caos através da disciplina.',
    interpretacao: 'Dia de ação decisive, coragem e força de vontade. Ideal para iniciar batalhas, quebrar resistência e impor limites. Evite conflitos desnecessários.',
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    arcano: 'O Mago',
    numero_carta: 1,
    significado_espiritual: 'Poder mental, comunicação, maestria das ferramentas internas e manipulação da energia através da palavra e do pensamento.',
    interpretacao: 'Momento de manifestar através da mente, diplomácia e estratégia verbal. Use a comunicação como ferramenta de transformação. Favorece estudos e negócios.',
  },
  Júpiter: {
    planeta: 'Júpiter',
    arcano: 'O Hierofante',
    numero_carta: 5,
    significado_espiritual: 'Expansão espiritual, sabedoria sagrada, tradição e fé. O mestre que transmite a doutrina divina e abre portais de conhecimento.',
    interpretacao: 'Dia de buscar conhecimento profundo, expandir horizontes mentais e conectar-se com tradições espirituais. Favorável para rituais de fartura e cura.',
  },
  Vênus: {
    planeta: 'Vênus',
    arcano: 'A Imperatriz',
    numero_carta: 3,
    significado_espiritual: 'Amor incondicional, fertilidade, criação abundante e conexão com o divino feminino. A mãe natureza que nutre e prospera.',
    interpretacao: 'Período de harmonização, doçura e magnetismo pessoal. Ideal para trabalhos de amor, cura emocional e atratividade. Cuide do coração e da autoestima.',
  },
  Saturno: {
    planeta: 'Saturno',
    arcano: 'O Mundo',
    numero_carta: 21,
    significado_espiritual: 'Completude, encerramento de ciclos, transformação final e realização terrena. A dança cósmica que completa uma jornada.',
    interpretacao: 'Dia de finalizações, rituais de encerramento e manifestação de projetos de longa duração. Favorece a conclusão de ciclos kármicos e a estabilidade.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_TAROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the planet-to-Tarot correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetTarot(planeta: string): PlanetTarotMapping | null {
  return PLANET_TAROT_MAPPINGS[planeta] ?? null;
}

/**
 * Get the planet corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The planet name or null if not found
 */
export function getTarotPlanet(arcano: string): string | null {
  for (const [planeta, mapping] of Object.entries(PLANET_TAROT_MAPPINGS)) {
    if (mapping.arcano === arcano) {
      return planeta;
    }
  }
  return null;
}

/**
 * Get all available planet-Tarot mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetTarots(): PlanetTarotMapping[] {
  return Object.values(PLANET_TAROT_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_TAROT_MAPPINGS);
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - Planet name to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetTarot(planeta: string): boolean {
  return planeta in PLANET_TAROT_MAPPINGS;
}

/**
 * Get planet by card number
 * @param numero - The Major Arcana card number (1-21)
 * @returns The planet name or null if not found
 */
export function getPlanetByNumber(numero: number): string | null {
  for (const [planeta, mapping] of Object.entries(PLANET_TAROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return planeta;
    }
  }
  return null;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (1-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(PLANET_TAROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}