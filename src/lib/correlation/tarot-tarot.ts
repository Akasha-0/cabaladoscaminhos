/**
 * Tarot-Tarot Correlation Module
 * Maps Major Arcana cards to other Major Arcana cards through paths on the Tree of Life
 * Based on the 32 paths of wisdom connecting the Sephiroth
 */

/**
 * Represents the correlation between two Tarot Major Arcana cards via Tree of Life paths
 */
export interface TarotTarotMapping {
  /** The source Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number (0-21) */
  numero_carta: number;
  /** The related Major Arcana card connected through the path */
  related_arcano: string;
  /** The related card number */
  related_numero: number;
  /** The path number on the Tree of Life (11-32) */
  numero_caminho: number;
  /** Type of path connection: same_sephirot, adjacent_path, or progression */
  path_type: 'same_sephirot' | 'adjacent_path' | 'progression';
  /** Spiritual meaning of the connection between these cards */
  spiritual_meaning: string;
}

// ─── Tarot Major Arcana to Tarot Major Arcana Mapping ─────────────────────────
// Maps Major Arcana cards to related cards through Tree of Life paths.
// Connections represent archetypal relationships, thematic parallels, and
// initiatory progressions within the 32 paths of wisdom.

export const TAROT_TAROT_MAPPINGS: Record<string, TarotTarotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    related_arcano: 'O Mago',
    related_numero: 1,
    numero_caminho: 11,
    path_type: 'progression',
    spiritual_meaning:
      'O salto da fé (O Louco) precede a manifestação da vontade (O Mago). O nada que precede o tudo. A preparação para o primeiro ato criativo na jornada do heroico.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    related_arcano: 'A Alta Sacerdotisa',
    related_numero: 2,
    numero_caminho: 12,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'O poder de manifestar (O Mago) encontra a sabedoria oculta (A Alta Sacerdotisa). A vontade masculina encontra a intuição feminina no ponto de articulação do conhecimento sagrado.',
  },
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    related_arcano: 'A Imperatriz',
    related_numero: 3,
    numero_caminho: 13,
    path_type: 'progression',
    spiritual_meaning:
      'O véu do mistério (A Alta Sacerdotisa) se levanta para revelar a abundancia criativa (A Imperatriz). A sabedoria oculta se manifesta como fertilidade criativa.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    related_arcano: 'O Imperador',
    related_numero: 4,
    numero_caminho: 14,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A fertilidade criativa (A Imperatriz) encontra sua expressão estruturada (O Imperador). O feminino criativo se conjuga com o masculino estruturante na dualidade sagrada.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    related_arcano: 'O Hierofante',
    related_numero: 5,
    numero_caminho: 15,
    path_type: 'progression',
    spiritual_meaning:
      'A autoridade marcial (O Imperador) se transforma em sabedoria espiritual (O Hierofante). O poder terreno cede ao mestre que transmite a tradição sagrada.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    related_arcano: 'Os Enamorados',
    related_numero: 6,
    numero_caminho: 16,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A iniciação sagrada (O Hierofante) conduz à escolha amorosa (Os Enamorados). O mestre apresenta o caminho do coração, onde a verdadeira iniciação aguarda.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    related_arcano: 'O Carro',
    related_numero: 7,
    numero_caminho: 17,
    path_type: 'progression',
    spiritual_meaning:
      'A escolha amorosa (Os Enamorados) encontra seu veículo de conquista (O Carro). O amor que vence se expressa através da carruagem da alma em direção ao triunfo.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    related_arcano: 'A Justiça',
    related_numero: 8,
    numero_caminho: 18,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'O triunfo conquistador (O Carro) enfrenta a lei cósmica (A Justiça). A vitória externa precisa harmonizar-se com o equilíbrio cármico interno.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    related_arcano: 'O Eremita',
    related_numero: 9,
    numero_caminho: 19,
    path_type: 'progression',
    spiritual_meaning:
      'O equilíbrio cósmico (A Justiça) conduce à sabedoria interior (O Eremita). A compreensão das leis universais leva à busca solitária da verdade interior.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    related_arcano: 'A Roda da Fortuna',
    related_numero: 10,
    numero_caminho: 20,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A sabedoria solitária (O Eremita) se integra ao destino cíclico (A Roda da Fortuna). A iluminação interior se alinha com os movimentos do destino cósmico.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    related_arcano: 'A Força',
    related_numero: 11,
    numero_caminho: 21,
    path_type: 'progression',
    spiritual_meaning:
      'O destino cíclico (A Roda da Fortuna) encontra seu domínio através da força interior (A Força). A sabedoria de navegar os ciclos através do coragem do coração.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    related_arcano: 'O Enforcado',
    related_numero: 12,
    numero_caminho: 22,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A força do coração (A Força) se expressa através do sacrifício consciente (O Enforcado). A coragem que domínio as paixões pela entrega ao fluxo divino.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    related_arcano: 'A Morte',
    related_numero: 13,
    numero_caminho: 23,
    path_type: 'progression',
    spiritual_meaning:
      'O sacrifício (O Enforcado) precede a transformação inevitável (A Morte). A entrega sagrada que poda o desnecessário prepara o caminho para o renascimento.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    related_arcano: 'A Temperança',
    related_numero: 14,
    numero_caminho: 24,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A transformação (A Morte) encontra o equilíbrio alquímico (A Temperança). A morte do velho se transfigura na harmonia que reconcilia as polaridades.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    related_arcano: 'O Diabo',
    related_numero: 15,
    numero_caminho: 25,
    path_type: 'progression',
    spiritual_meaning:
      'O equilíbrio alquímico (A Temperança) confronta as sombras materiais (O Diabo). A harmonia precisa reconhecer e transmutar as prisões interiores.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    related_arcano: 'A Torre',
    related_numero: 16,
    numero_caminho: 26,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'As amarras materiais (O Diabo) enfrentam a revelação súbita (A Torre). A matéria imprisonada é desconstruída pelo raio da verdade libertadora.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    related_arcano: 'A Estrela',
    related_numero: 17,
    numero_caminho: 27,
    path_type: 'progression',
    spiritual_meaning:
      'A destruição das ilusões (A Torre) abre espaço para a esperança renovada (A Estrela). O raio que quebra prepara o caminho para a luz restauradora.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    related_arcano: 'A Lua',
    related_numero: 18,
    numero_caminho: 28,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A esperança luminosa (A Estrela) ilumina os mares emocionais (A Lua). A luz divina que guia através das águas do inconsciente.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    related_arcano: 'O Sol',
    related_numero: 19,
    numero_caminho: 29,
    path_type: 'progression',
    spiritual_meaning:
      'O inconsciente lunar (A Lua) emerge na claridad solar (O Sol). Os medos revelados pela lua se dissolvem na luz da verdade e vitalidade.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    related_arcano: 'O Julgamento',
    related_numero: 20,
    numero_caminho: 30,
    path_type: 'adjacent_path',
    spiritual_meaning:
      'A claridad solar (O Sol) precede o julgamento divino (O Julgamento). A verdade iluminada等待着 o chamado para o renascimento interior.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    related_arcano: 'O Mundo',
    related_numero: 21,
    numero_caminho: 31,
    path_type: 'progression',
    spiritual_meaning:
      'O chamado do renascimento (O Julgamento) conduz à completude (O Mundo). A ressurreição do self prepara o retorno à unidade divina original.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    related_arcano: 'O Louco',
    related_numero: 0,
    numero_caminho: 32,
    path_type: 'same_sephirot',
    spiritual_meaning:
      'A completude (O Mundo) retorna ao ponto original (O Louco). O ciclo se completa e o louco recomeça a jornada. A eternidade que abraça todo o caminho percorrido.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_TAROT_MAPPINGS);
Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * All Major Arcana card names in order
 */
export const MAJOR_ARCANA_NAMES = [
  'O Louco',
  'O Mago',
  'A Alta Sacerdotisa',
  'A Imperatriz',
  'O Imperador',
  'O Hierofante',
  'Os Enamorados',
  'O Carro',
  'A Justiça',
  'O Eremita',
  'A Roda da Fortuna',
  'A Força',
  'O Enforcado',
  'A Morte',
  'A Temperança',
  'O Diabo',
  'A Torre',
  'A Estrela',
  'A Lua',
  'O Sol',
  'O Julgamento',
  'O Mundo',
] as const;

/**
 * All path types
 */
export const PATH_TYPES = ['same_sephirot', 'adjacent_path', 'progression'] as const;

/**
 * Get the Tarot-Tarot correlation mapping for a given arcano
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago', 'O Sol')
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarot(arcano: string): TarotTarotMapping | null {
  return TAROT_TAROT_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano that is related to a given arcano
 * @param arcano - The arcano name
 * @returns The related arcano name or null if not found
 */
export function getRelatedArcano(arcano: string): string | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.related_arcano ?? null;
}

/**
 * Get all available Tarot-Tarot mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotPaths(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return [...MAJOR_ARCANA_NAMES];
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotTarot(arcano: string): boolean {
  return arcano in TAROT_TAROT_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_TAROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.arcano ?? null;
}

/**
 * Get related arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The related arcano name or null if not found
 */
export function getRelatedByNumber(numero: number): string | null {
  const mapping = Object.values(TAROT_TAROT_MAPPINGS).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.related_arcano ?? null;
}

/**
 * Get all mappings for a specific path type
 * @param pathType - The path type ('same_sephirot', 'adjacent_path', 'progression')
 * @returns Array of mappings with this path type
 */
export function getArcanosByPathType(
  pathType: 'same_sephirot' | 'adjacent_path' | 'progression'
): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS)
    .filter((m) => m.path_type === pathType)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all path types
 * @returns Array of unique path types
 */
export function getAllPathTypes(): string[] {
  return [...PATH_TYPES];
}

/**
 * Get the path number for an arcano
 * @param arcano - The arcano name
 * @returns The path number (11-32) or null if not found
 */
export function getPathNumber(arcano: string): number | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.numero_caminho ?? null;
}

/**
 * Get the path type for an arcano
 * @param arcano - The arcano name
 * @returns The path type or null if not found
 */
export function getPathType(arcano: string): string | null {
  return TAROT_TAROT_MAPPINGS[arcano]?.path_type ?? null;
}

/**
 * Find arcs that connect through a specific path number
 * @param numeroCaminho - The path number (11-32)
 * @returns Array of mappings with this path number
 */
export function getArcanosByPathNumber(numeroCaminho: number): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAPPINGS).filter(
    (m) => m.numero_caminho === numeroCaminho
  );
}

// Freeze constants
Object.freeze(MAJOR_ARCANA_NAMES);
Object.freeze(PATH_TYPES);

// Default export with all exports
export default {
  getTarotTarot,
  getRelatedArcano,
  getAllTarotPaths,
  getAllArcanos,
  hasTarotTarot,
  getArcanoByNumber,
  getRelatedByNumber,
  getArcanosByPathType,
  getAllPathTypes,
  getPathNumber,
  getPathType,
  getArcanosByPathNumber,
  TAROT_TAROT_MAPPINGS,
  MAJOR_ARCANA_NAMES,
  PATH_TYPES,
};