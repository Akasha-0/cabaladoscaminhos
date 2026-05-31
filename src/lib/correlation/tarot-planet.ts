/**
 * Tarot-Planet Correlation Mapping
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 * Aligns Tarot Major Arcana cards with the 7 classical planets (reverse mapping of planet-tarot.ts)
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its planet correspondence
 */
export interface TarotPlanetMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana */
  numero_carta: number;
  /** The classical planet name */
  planeta: string;
  /** The element associated with this correlation */
  elemento_conexao: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Tarot Major Arcana to Planet Mapping ─────────────────────────────────────

export const TAROT_PLANET_MAPPINGS: Record<string, TarotPlanetMapping> = {
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    planeta: 'Mercúrio',
    elemento_conexao: 'Ar',
    significado_espiritual: 'Poder mental, comunicação, mestria das ferramentas internas e manipulação da energia através da palavra e do pensamento.',
    interpretacao: 'Momento de manifestar através da mente, diplomácia e estratégia verbal. Use a comunicação como ferramenta de transformação. Favorece estudos e negócios.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    planeta: 'Vênus',
    elemento_conexao: 'Terra',
    significado_espiritual: 'Amor incondicional, fertilidade, criação abundante e conexão com o divino feminino. A mãe natureza que nutre e prospera.',
    interpretacao: 'Período de harmonização, doçura e magnetismo pessoal. Ideal para trabalhos de amor, cura emocional e atratividade. Cuide do coração e da autoestima.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    planeta: 'Marte',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Força de vontade, liderança marcial, estratégia militar e autoridade. O guerreiro que ordena o caos através da disciplina.',
    interpretacao: 'Dia de ação decisiva, coragem e força de vontade. Ideal para iniciar batalhas, quebrar resistência e impor limites. Evite conflitos desnecessários.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    planeta: 'Júpiter',
    elemento_conexao: 'Ar',
    significado_espiritual: 'Expansão espiritual, sabedoria sagrada, tradição e fé. O mestre que transmite a doutrina divina e abre portais de conhecimento.',
    interpretacao: 'Dia de buscar conhecimento profundo, expandir horizontes mentais e conectar-se com tradições espirituais. Favorável para rituais de fartura e cura.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    planeta: 'Lua',
    elemento_conexao: 'Água',
    significado_espiritual: 'Intuição profunda, o inconsciente, ilusões e flutuação emocional. Ciclo noturno da mente e conexão com a água.',
    interpretacao: 'Período propício para trabalho interno, meditação, sonhos e processos de limpeza emocional. Confie na intuição, mas evite decisões impulsivas.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    planeta: 'Sol',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Vitalidade, irradiação do poder pessoal, sucesso e alinhamento com o propósito de vida. Clareza interior e brilho próprio.',
    interpretacao: 'Dia de maximizar a energia pessoal, buscar reconhecimento, assumir liderança e manifestar seus talentos. Foque no brilho próprio e na energia Yang.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    planeta: 'Saturno',
    elemento_conexao: 'Terra',
    significado_espiritual: 'Completude, encerramento de ciclos, transformação final e realização terrena. A dança cósmica que completa uma jornada.',
    interpretacao: 'Dia de finalizações, rituais de encerramento e manifestação de projetos de longa duração. Favorece a conclusão de ciclos kármicos e a estabilidade.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_PLANET_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_PLANET_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-planet correlation mapping
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The correlation mapping or null if not found
 */
export function getTarotPlanet(arcano: string): TarotPlanetMapping | null {
  return TAROT_PLANET_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano corresponding to a planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The arcano name or null if not found
 */
export function getPlanetArcano(planeta: string): string | null {
  for (const mapping of Object.values(TAROT_PLANET_MAPPINGS)) {
    if (mapping.planeta === planeta) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all available Tarot-planet mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotPlanets(): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAPPINGS);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_PLANET_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotPlanet(arcano: string): boolean {
  return arcano in TAROT_PLANET_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (1-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_PLANET_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get planet by card number
 * @param numero - The Major Arcana card number (1-21)
 * @returns The planet name or null if not found
 */
export function getPlanetByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_PLANET_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.planeta;
    }
  }
  return null;
}

export default {
  getTarotPlanet,
  getPlanetArcano,
  getAllTarotPlanets,
  getAllArcanos,
  hasTarotPlanet,
  getArcanoByNumber,
  getPlanetByNumber,
};