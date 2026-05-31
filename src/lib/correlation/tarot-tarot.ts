/**
 * Tarot-Tarot Correlation Module
 * Maps spiritual relationships between Major Arcana cards based on Kabbalistic Tree of Life paths
 * Each path on the Tree connects two sephirot, creating meaningful connections between arcs
 */

export type TarotPathType =
  | 'tree_path'      // Paths on the Kabbalistic Tree of Life
  | 'elemental'      // Elemental correspondence
  | 'numerological'  // Number-based relationship
  | 'archetypal'     // Similar archetypes
  | 'sequential';    // Sequential journey relationship

export interface TarotTarotMapping {
  /** The Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number (0-21) */
  numero_carta: number;
  /** The related Major Arcana card name */
  related_arcano: string;
  /** The related card number (0-21) */
  related_numero: number;
  /** Type of spiritual connection */
  path_type: TarotPathType;
  /** Spiritual meaning of this connection */
  spiritual_meaning: string;
  /** Energy flow direction: bidirectional for all Tree of Life paths */
  energy_flow: 'bidirectional';
}

// All 22 Major Arcana cards in order
export const ALL_MAJOR_ARCANOS: readonly string[] = [
  'O Louco',      // 0
  'O Mago',       // 1
  'A Alta Sacerdotisa', // 2
  'A Imperatriz', // 3
  'O Imperador',  // 4
  'O Hierofante', // 5
  'Os Enamorados', // 6
  'O Carro',      // 7
  'A Justiça',    // 8
  'O Eremita',    // 9
  'A Roda da Fortuna', // 10
  'A Força',      // 11
  'O Enforcado',  // 12
  'A Morte',      // 13
  'A Temperança', // 14
  'O Diabo',      // 15
  'A Torre',      // 16
  'A Esperança',  // 17
  'A Lua',        // 18
  'O Sol',        // 19
  'O Julgamento', // 20
  'O Mundo',       // 21
] as const;

/**
 * Tarot-Tarot relationship mappings based on Tree of Life paths
 * These represent meaningful spiritual connections between Major Arcana cards
 * All mappings use bidirectional energy_flow for Tree of Life path consistency
 */
const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // Sequential journey relationships - Fool's journey path
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'tree_path', spiritual_meaning: 'Iniciação e despertar da consciência; o primeiro passo na jornada espiritual', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'Retorno ao ponto original com nova sabedoria; o fim e recomeço da jornada', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'archetypal', spiritual_meaning: 'Equilíbrio entre força criativa e autoridade estrutural', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Esperança', related_numero: 17, path_type: 'sequential', spiritual_meaning: 'Transformação e renascimento; luz após a escuridão', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Esperança', related_numero: 17, path_type: 'sequential', spiritual_meaning: 'Destruição e renovação; esperança após a queda', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: 'Dissipação das ilusões; clareza e alegria', energy_flow: 'bidirectional' },
  
  // Additional tree paths
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Alta Sacerdotisa', related_numero: 2, path_type: 'tree_path', spiritual_meaning: 'Manifestação do poder divino através da sabedoria interior', energy_flow: 'bidirectional' },
  { arcano: 'A Alta Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'tree_path', spiritual_meaning: 'Transição do conhecimento oculto para a expressão criativa', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Esperança', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'Fertilidade espiritual e esperança renovadora', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'tree_path', spiritual_meaning: 'Autoridade espiritual e tradição sagrada', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'tree_path', spiritual_meaning: 'Transformação espiritual através das escolhas e uniões', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'tree_path', spiritual_meaning: 'Assertividade na busca do equilíbrio e harmonia', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justiça', related_numero: 8, path_type: 'tree_path', spiritual_meaning: 'Vitória através do alinhamento com a lei divina', energy_flow: 'bidirectional' },
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: 'Iluminação interior e busca pela verdade', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'tree_path', spiritual_meaning: 'Ciclos cósmicos e transformação através da introspecção', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Força', related_numero: 11, path_type: 'tree_path', spiritual_meaning: 'Ação correta no momento certo; coragem diante do destino', energy_flow: 'bidirectional' },
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'tree_path', spiritual_meaning: 'Sacrifício voluntário e maestria sobre os instintos', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'tree_path', spiritual_meaning: 'Metamorfose e renascimento através da aceitação', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperança', related_numero: 14, path_type: 'tree_path', spiritual_meaning: 'Equilíbrio entre extremos; integração das sombras', energy_flow: 'bidirectional' },
  { arcano: 'A Temperança', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: 'Confronto com as ilusões e libertação das amarras', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: 'Destruição das prisões internas; revelação abrupta', energy_flow: 'bidirectional' },
  { arcano: 'A Esperança', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'Luz na escuridão; cura e inspiração', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'Transcendência e despertar da alma', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'tree_path', spiritual_meaning: 'Realização completa; síntese da jornada espiritual', energy_flow: 'bidirectional' },
  
  // Additional archetypal connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Eremita', related_numero: 9, path_type: 'archetypal', spiritual_meaning: 'Busca espiritual e solidão sagrada', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'Intuição criativa e fertilidade emocional', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'A Torre', related_numero: 16, path_type: 'elemental', spiritual_meaning: 'Destruição e reconstrução da autoridade', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Esperança', related_numero: 17, path_type: 'archetypal', spiritual_meaning: 'Determinação que leva à esperança', energy_flow: 'bidirectional' },
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'numerological', spiritual_meaning: '8 e 20 representam equilíbrio cósmico e redenção', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'O Mundo', related_numero: 21, path_type: 'numerological', spiritual_meaning: '10 e 21 = 1 (novo ciclo); destino completo', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'O Louco', related_numero: 0, path_type: 'archetypal', spiritual_meaning: 'Liberdade versus prisão; escolha entre sombra e luz', energy_flow: 'bidirectional' },
  
  // Numerological connections
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Esperança', related_numero: 17, path_type: 'numerological', spiritual_meaning: '1+7=8; poder criativo equilibrado com esperança', energy_flow: 'bidirectional' },
  { arcano: 'A Alta Sacerdotisa', numero_carta: 2, related_arcano: 'A Justiça', related_numero: 8, path_type: 'numerological', spiritual_meaning: '2+8=10; dualidade e destino', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'A Temperança', related_numero: 14, path_type: 'numerological', spiritual_meaning: '6+1+4=11; amor e harmonia restaurada', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'Revelação das ilusões e confronto com o inconsciente', energy_flow: 'bidirectional' },
  
  // Cross connections for completeness
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'archetypal', spiritual_meaning: 'Luz solar e fertilidade criativa', energy_flow: 'bidirectional' },
  { arcano: 'A Esperança', numero_carta: 17, related_arcano: 'A Justiça', related_numero: 8, path_type: 'archetypal', spiritual_meaning: 'Esperança e equilíbrio restaurado', energy_flow: 'bidirectional' },
];

// Constants
export const TOTAL_MAPPINGS = TAROT_TAROT_MAP.length;
export const TOTAL_PATH_TYPES = 5 as const;

// Record for fast lookups (both arcano and related_arcano)
const TAROT_TAROT_MAPPINGS: Record<string, TarotTarotMapping[]> = 
  TAROT_TAROT_MAP.reduce((acc, mapping) => {
    if (!acc[mapping.arcano]) acc[mapping.arcano] = [];
    acc[mapping.arcano].push(mapping);
    if (!acc[mapping.related_arcano]) acc[mapping.related_arcano] = [];
    acc[mapping.related_arcano].push(mapping);
    return acc;
  }, {} as Record<string, TarotTarotMapping[]>);

// Freeze the mapping to prevent modifications
Object.freeze(TAROT_TAROT_MAP);
TAROT_TAROT_MAP.forEach((mapping) => Object.freeze(mapping));

/**
 * Normalize arcano name for lookup (handle aliases and case)
 */
function normalizeArcano(name: string): string {
  const lower = name.toLowerCase();
  if (lower === 'a estrela' || lower === 'a esperanca') return 'A Esperança';
  for (const arcano of ALL_MAJOR_ARCANOS) {
    if (arcano.toLowerCase() === lower) return arcano;
  }
  return name;
}

/**
 * Get the Tarot-Tarot correlation mapping between two arcanos
 * @param arcano - The first arcano name
 * @param related_arcano - The related arcano name
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarot(arcano: string, related_arcano: string): TarotTarotMapping | null {
  const normalized1 = normalizeArcano(arcano);
  const normalized2 = normalizeArcano(related_arcano);
  
  return TAROT_TAROT_MAP.find(
    (m) => (m.arcano === normalized1 && m.related_arcano === normalized2) ||
           (m.arcano === normalized2 && m.related_arcano === normalized1)
  ) ?? null;
}

/**
 * Get all Tarot-Tarot correlations
 * @returns Array of all correlation mappings
 */
export function getAllTarotPaths(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Get all unique path types
 * @returns Array of all path types in use
 */
export function getAllPathTypes(): TarotPathType[] {
  return ['tree_path', 'elemental', 'numerological', 'archetypal', 'sequential'];
}

/**
 * Get all mapped arcanos
 * @returns Array of unique arcano names
 */
export function getAllMappedArcanos(): string[] {
  return [...new Set(TAROT_TAROT_MAP.flatMap(m => [m.arcano, m.related_arcano]))];
}

/**
 * Get all relationships for a specific arcano
 * @param arcano - Arcano name to find relationships for
 * @returns Array of TarotTarotMapping objects where the arcano appears
 */
export function getAllArcanoRelations(arcano: string): TarotTarotMapping[] {
  const normalized = normalizeArcano(arcano);
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano === normalized || m.related_arcano === normalized
  );
}

/**
 * Get relationships by path type
 * @param type - Path type to filter by
 * @returns Array of TarotTarotMapping objects of the specified type
 */
export function getPathsByType(type: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

/**
 * Alias for getPathsByType
 */
export const getRelationsByPathType = getPathsByType;

/**
 * Check if two arcanos have a correlation
 * @param arcano - First arcano
 * @param related - Related arcano
 * @returns True if correlation exists
 */
export function hasTarotTarot(arcano: string, related: string): boolean {
  return getTarotTarot(arcano, related) !== null;
}

/**
 * Get all relationships for a specific card number
 * @param numero - Card number (0-21)
 * @returns Array of mappings involving this card number
 */
export function getRelationsByNumber(numero: number): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter(
    (m) => m.numero_carta === numero || m.related_numero === numero
  );
}

/**
 * Get arcano by card number
 * @param numero - Card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  return ALL_MAJOR_ARCANOS[numero] ?? null;
}

// Default export with commonly used functions
export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getAllArcanoRelations,
  getPathsByType,
  hasTarotTarot,
  getRelationsByNumber,
};
