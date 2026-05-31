/**
 * Tarot-Sephirot Correlation Mapping
 * Based on Kabbalistic tradition mapping Major Arcana cards to the Tree of Life
 * Aligns Tarot Major Arcana cards with the 10 Sephiroth (Divine Emanations)
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its Sephirah
 */
export interface TarotSephirotMapping {
  /** The Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The associated Sephirah name (Hebrew) */
  sephirah: string;
  /** The element associated with this correlation (Fire, Water, Air, Earth, Éther) */
  elemento_conexao: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Path number on the Tree of Life (0-32, where 0 is The Fool's path) */
  numero_caminho: number;
  /** Hebrew letter associated with this path */
  letra_hebraica: string;
}

// ─── Tarot Major Arcana to Sephirot Mapping ───────────────────────────────────

/**
 * Complete mapping of Major Arcana to the 10 Sephiroth
 * Based on traditional Kabbalistic correspondences and the Cabala dos Caminhos system
 */
export const TAROT_SEPHIROT_MAPPINGS: Record<string, TarotSephirotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    sephirah: 'Kether',
    elemento_conexao: 'Ar',
    significado_espiritual: 'O ponto zero da existência, antes da forma. O impulso original de criar, a liberdade absoluta e a loucura sagrada do iniciado. Abre todos os caminhos.',
    numero_caminho: 0,
    letra_hebraica: 'Aleph',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    sephirah: 'Kether',
    elemento_conexao: 'Ar',
    significado_espiritual: 'A vontade divina em ação. O poder de manipular as forças elementais através da mente. Primeiro ato de criação manifested through speech and thought.',
    numero_caminho: 11,
    letra_hebraica: 'Beth',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    sephirah: 'Chokmah',
    elemento_conexao: 'Água',
    significado_espiritual: 'A sabedoria oculta, a intuição pura e o conhecimento direto. O princípio feminino ativo que revela os mistérios além do véu da ilusão.',
    numero_caminho: 12,
    letra_hebraica: 'Gimel',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    sephirah: 'Binah',
    elemento_conexao: 'Terra',
    significado_espiritual: 'A mãe divina, a fertilidade universal e o amor incondicional. O princípio formativo que estrutura a criação em abundância.',
    numero_caminho: 3,
    letra_hebraica: 'Daleth',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    sephirah: 'Chesed',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'A ordem estabelecida, a autoridade paternal e a estrutura sagrada. O administrador divino que traz organização ao caos.',
    numero_caminho: 4,
    letra_hebraica: 'Heh',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    sephirah: 'Geburah',
    elemento_conexao: 'Ar',
    significado_espiritual: 'O mestre espiritual, a tradição sagrada e a doutrina divina. O transmitidor de conhecimento que abre os portais da sabedoria revelada.',
    numero_caminho: 5,
    letra_hebraica: 'Vav',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    sephirah: 'Tiphereth',
    elemento_conexao: 'Ar',
    significado_espiritual: 'A escolha sagrada, a união dos opostos e o poder de criar através da parceria. A dança cósmica do yang e yin espiritual.',
    numero_caminho: 6,
    letra_hebraica: 'Zain',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    sephirah: 'Netzach',
    elemento_conexao: 'Água',
    significado_espiritual: 'A vitória conquistada, a vontade de ferro e a conquista dos mundos inferiores. O guerreiro espiritual que domina o lower self.',
    numero_caminho: 7,
    letra_hebraica: 'Cheth',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    sephirah: 'Hod',
    elemento_conexao: 'Ar',
    significado_espiritual: 'O julgamento cósmico, a lei divina e o equilíbrio kármico. A cortante precisão da verdade que revela e transforma através da comunicação sagrada.',
    numero_caminho: 25,
    letra_hebraica: 'Teth',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    sephirah: 'Yesod',
    elemento_conexao: 'Água',
    significado_espiritual: 'A sabedoria interior, a solidão sagrada e a busca da verdade. A luz que guia através da escuridão da ignorância.',
    numero_caminho: 8,
    letra_hebraica: 'Yod',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    sephirah: 'Chesed',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'O ciclo eterno, a lei de causa e efeito e os rumos do destino. O movimento celestial que traz sorte e transformação.',
    numero_caminho: 23,
    letra_hebraica: 'Kaph',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    sephirah: 'Tiphereth',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'O poder interior, a coragem do coração e a domesticação da besta. A força sutil que supera toda violência.',
    numero_caminho: 15,
    letra_hebraica: 'Lamed',
  },
  'O Homem Enforcado': {
    arcano: 'O Homem Enforcado',
    numero_carta: 12,
    sephirah: 'Netzach',
    elemento_conexao: 'Água',
    significado_espiritual: 'O sacrifício voluntário, a visão de mundo invertida e a rendição ao divino. O martyr que salva através da entrega.',
    numero_caminho: 20,
    letra_hebraica: 'Mem',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    sephirah: 'Malkuth',
    elemento_conexao: 'Terra',
    significado_espiritual: 'A transformação inevitável, o fim de ciclos e a morte do ego. O催化剂 que abre espaço para o novo renascer.',
    numero_caminho: 31,
    letra_hebraica: 'Nun',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    sephirah: 'Yesod',
    elemento_conexao: 'Água',
    significado_espiritual: 'O equilíbrio alquímico, a moderação sagrada e a integração dos opostos. O anjo que mistura e harmoniza as águas da vida.',
    numero_caminho: 9,
    letra_hebraica: 'Samekh',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    sephirah: 'Malkuth',
    elemento_conexao: 'Terra',
    significado_espiritual: 'A sombra revelada, a ilusão da separação e o cativeiroautoimposto. O espelho que mostra onde nos prendemos aos vícios.',
    numero_caminho: 32,
    letra_hebraica: 'Ayin',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    sephirah: 'Geburah',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'A revelação catastrófica, a queda das estruturas falsas e a purificação pelo raio. O demolir dos ídolos internos.',
    numero_caminho: 21,
    letra_hebraica: 'Peh',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    sephirah: 'Tiphereth',
    elemento_conexao: 'Água',
    significado_espiritual: 'A esperança restaurada, a cura após a crise e a luz que guia. A estrela de Betânia que derrama águas celestiais.',
    numero_caminho: 22,
    letra_hebraica: 'Tzaddi',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    sephirah: 'Yesod',
    elemento_conexao: 'Água',
    significado_espiritual: 'O inconsciente revelado, os medos primitivos e a ilusão. A luz lunar que projeta sombras do subconsciente.',
    numero_caminho: 28,
    letra_hebraica: 'Qoph',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    sephirah: 'Tiphereth',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'A verdade aclarada, o sucesso espiritual e o brilho da criança interior. O sol central da Árvore da Vida.',
    numero_caminho: 16,
    letra_hebraica: 'Resh',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    sephirah: 'Malkuth',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'O despertar final, a redenção kármica e o chamado à nova vida. A trombeta do anjo que julga com misericórdia.',
    numero_caminho: 30,
    letra_hebraica: 'Shin',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    sephirah: 'Malkuth',
    elemento_conexao: 'Terra',
    significado_espiritual: 'A completude, a integração de todos os opostos e a realização do Self. O retorno ao Éden através do conhecimento.',
    numero_caminho: 32,
    letra_hebraica: 'Tav',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_SEPHIROT_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-Sephirot correlation mapping
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Mago')
 * @returns The correlation mapping or null if not found
 */
export function getTarotSephirot(arcano: string): TarotSephirotMapping | null {
  return TAROT_SEPHIROT_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano name corresponding to a Sephirah
 * @param sephirah - Sephirah name (e.g., 'Kether', 'Tiphereth')
 * @returns The first arcano name associated with this Sephirah or null if not found
 */
export function getSephirotTarot(sephirah: string): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.sephirah === sephirah) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all available Tarot-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotSephiroths(): TarotSephirotMapping[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_SEPHIROT_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotSephirot(arcano: string): boolean {
  return arcano in TAROT_SEPHIROT_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get Sephirah by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The Sephirah name or null if not found
 */
export function getSephirotByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.sephirah;
    }
  }
  return null;
}

/**
 * Get all arcanos associated with a specific Sephirah
 * @param sephirah - The Sephirah name (e.g., 'Kether', 'Tiphereth')
 * @returns Array of arcano names or empty array if not found
 */
export function getArcanosBySephirot(sephirah: string): string[] {
  const arcanos: string[] = [];
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    if (mapping.sephirah === sephirah) {
      arcanos.push(mapping.arcano);
    }
  }
  return arcanos;
}

/**
 * Get the Sephiroth that appear in the Major Arcana (10 distinct ones)
 * @returns Array of unique Sephirah names used in the mappings
 */
export function getSephirotInTarot(): string[] {
  const sephirot = new Set<string>();
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    sephirot.add(mapping.sephirah);
  }
  return Array.from(sephirot).sort();
}

/**
 * Get all distinct elements used in the Tarot-Sephirot mappings
 * @returns Array of element names
 */
export function getElementsInTarot(): string[] {
  const elementos = new Set<string>();
  for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
    elementos.add(mapping.elemento_conexao);
  }
  return Array.from(elementos);
}

export default {
  getTarotSephirot,
  getSephirotTarot,
  getAllTarotSephiroths,
  getAllArcanos,
  hasTarotSephirot,
  getArcanoByNumber,
  getSephirotByNumber,
  getArcanosBySephirot,
  getSephirotInTarot,
  getElementsInTarot,
};