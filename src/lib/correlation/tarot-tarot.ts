/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on spiritual journey progression,
 * elemental correspondences, and initiatory paths in the Cabala dos Caminhos system.
 */

/** Path types representing different spiritual relationships between Arcana */
export type TarotPathType =
  | 'tree_path'     // Tree of Life path connection
  | 'sequential'   // Sequential journey progression
  | 'elemental'     // Element correspondence
  | 'archetypal';   // Deep archetypal connection

/**
 * Represents the spiritual correlation between two Major Arcana
 */
export interface TarotTarotMapping {
  /** Source arcano name */
  arcano: string;
  /** Card number of source arcano */
  numero_carta: number;
  /** Related target arcano name */
  related_arcano: string;
  /** Card number of related arcano */
  related_numero: number;
  /** Type of spiritual path between the arcana */
  path_type: TarotPathType;
  /** Spiritual meaning of the relationship */
  spiritual_meaning: string;
  /** Energy flow direction */
  energy_flow: 'bidirectional';
}

/**
 * All 22 Major Arcana in traditional order
 */
export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

/** Total number of path types */
export const TOTAL_PATH_TYPES: number = 4;

/**
 * Complete mapping of Major Arcana relationships.
 * Each arcano connects to related arcs based on spiritual journey progression.
 */
export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  // O Louco (0) - The journey begins
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'sequential', spiritual_meaning: 'O Louco inicia a jornada espiritual encontrando a vontade criativa do Mago.', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'archetypal', spiritual_meaning: 'O Louco busca liberdade enquanto A Sacerdotisa guarda os mistérios profundos.', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'tree_path', spiritual_meaning: 'O Louco e O Mundo representam o início e o fim da jornada iniciática.', energy_flow: 'bidirectional' },

  // O Mago (1) - Manifestation
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'sequential', spiritual_meaning: 'O Mago manifesta enquanto A Sacerdotisa revela os mistérios ocultos.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'O Sol', related_numero: 19, path_type: 'elemental', spiritual_meaning: 'O Mago canaliza energia criativa que O Sol irradia em clareza.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: 'O Mago representa construção consciente enquanto A Torre traz destruição reveladora.', energy_flow: 'bidirectional' },

  // A Sacerdotisa (2) - Intuition
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'sequential', spiritual_meaning: 'A Sacerdotisa guarda sabedoria que a Imperatriz manifesta em fertilidade.', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'O Eremita', related_numero: 9, path_type: 'elemental', spiritual_meaning: 'A Sacerdotisa representa intuição enquanto O Eremita busca iluminação interior.', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'A Sacerdotisa guarda mistérios que a Lua revela em sua luz indireta.', energy_flow: 'bidirectional' },

  // A Imperatriz (3) - Abundance
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'sequential', spiritual_meaning: 'A Imperatriz cria fertilidade que O Imperador estrutura em ordem.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'tree_path', spiritual_meaning: 'A Imperatriz manifesta abundância enquanto O Hierofante transmite tradição sagrada.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Estrela', related_numero: 17, path_type: 'elemental', spiritual_meaning: 'A Imperatriz nutre fertilidade terrena enquanto A Estrela oferece esperança celestial.', energy_flow: 'bidirectional' },

  // O Imperador (4) - Structure
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'sequential', spiritual_meaning: 'O Imperador impõe ordem terrena que O Hierofante interpreta espiritualmente.', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'A Justiça', related_numero: 8, path_type: 'tree_path', spiritual_meaning: 'O Imperador governa enquanto A Justiça mantém equilíbrio cósmico.', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Carro', related_numero: 7, path_type: 'elemental', spiritual_meaning: 'O Imperador lidera com autoridade que O Carro concretiza em vitória.', energy_flow: 'bidirectional' },

  // O Hierofante (5) - Wisdom
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'tree_path', spiritual_meaning: 'O Hierofante representa tradição espiritual enquanto Os Enamorados revelam escolha do coração.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'A Justiça', related_numero: 8, path_type: 'elemental', spiritual_meaning: 'O Hierofante ensina lei sagrada enquanto A Justiça a aplica com equilíbrio.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'O Eremita', related_numero: 9, path_type: 'archetypal', spiritual_meaning: 'O Hierofante transmite sabedoria exterior que O Eremita descobre interiormente.', energy_flow: 'bidirectional' },

  // Os Enamorados (6) - Union
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'sequential', spiritual_meaning: 'Os Enamorados enfrentam escolha entre caminhos enquanto O Carro conquista através da vontade.', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'A Temperança', related_numero: 14, path_type: 'tree_path', spiritual_meaning: 'Os Enamorados representam união que A Temperança harmoniza em equilíbrio.', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: 'Os Enamorados vivem escolha que O Julgamento avalia no despertar final.', energy_flow: 'bidirectional' },

  // O Carro (7) - Victory
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justiça', related_numero: 8, path_type: 'sequential', spiritual_meaning: 'O Carro conquista através da vontade enquanto A Justiça traz equilíbrio e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'O Sol', related_numero: 19, path_type: 'archetypal', spiritual_meaning: 'O Carro conquista com determinação enquanto O Sol brilha com alegria.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Torre', related_numero: 16, path_type: 'elemental', spiritual_meaning: 'O Carro representa conquista controlada enquanto A Torre traz libertação caótica.', energy_flow: 'bidirectional' },

  // A Justiça (8) - Balance
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: 'A Justiça pesa ações enquanto O Eremita busca iluminação através da solidão.', energy_flow: 'bidirectional' },
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'sequential', spiritual_meaning: 'A Justiça mede com precisão enquanto O Julgamento desperta para renovação.', energy_flow: 'bidirectional' },
  { arcano: 'A Justiça', numero_carta: 8, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'elemental', spiritual_meaning: 'A Justiça mantém equilíbrio enquanto a Roda gira com destino cíclico.', energy_flow: 'bidirectional' },

  // O Eremita (9) - Illumination
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'tree_path', spiritual_meaning: 'O Eremita busca luz interior enquanto a Roda governa ciclos do destino.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: 'O Eremita busca luz na solidão enquanto O Sol é fonte de toda luz.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'O Eremita encontra sabedoria enquanto A Lua revela ilusões do inconsciente.', energy_flow: 'bidirectional' },

  // A Roda da Fortuna (10) - Cycles
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Força', related_numero: 11, path_type: 'sequential', spiritual_meaning: 'A Roda da Fortuna governa ciclos do destino enquanto A Força doma instintos.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'A Roda governa destino enquanto A Lua governa inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'O Diabo', related_numero: 15, path_type: 'elemental', spiritual_meaning: 'A Roda revela destino enquanto O Diabo representa tentações que aprisionam.', energy_flow: 'bidirectional' },

  // A Força (11) - Courage
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'sequential', spiritual_meaning: 'A Força doma o leão com coragem enquanto O Enforcado sacrifica com sabedoria.', energy_flow: 'bidirectional' },
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'O Louco', related_numero: 0, path_type: 'tree_path', spiritual_meaning: 'A Força doma instintos com coragem enquanto O Louco entrega-se ao destino.', energy_flow: 'bidirectional' },
  { arcano: 'A Força', numero_carta: 11, related_arcano: 'A Temperança', related_numero: 14, path_type: 'elemental', spiritual_meaning: 'A Força representa coragem que A Temperança transforma em harmonia.', energy_flow: 'bidirectional' },

  // O Enforcado (12) - Surrender
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Torre', related_numero: 16, path_type: 'sequential', spiritual_meaning: 'O Enforcado realiza sacrifício voluntário enquanto A Torre traz destruição forçada.', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'tree_path', spiritual_meaning: 'O Enforcado sacrifica perspectiva enquanto A Morte transforma através de fim inevitável.', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'archetypal', spiritual_meaning: 'O Enforcado entrega-se que O Julgamento desperta para avaliar.', energy_flow: 'bidirectional' },

  // A Morte (13) - Transformation
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperança', related_numero: 14, path_type: 'sequential', spiritual_meaning: 'A Morte representa fim e transformação enquanto A Temperança busca equilíbrio.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'A Morte transforma enquanto A Estrela traz esperança renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Diabo', related_numero: 15, path_type: 'elemental', spiritual_meaning: 'A Morte traz transformação inevitável enquanto O Diabo representa aprisionamento.', energy_flow: 'bidirectional' },

  // A Temperança (14) - Balance
  { arcano: 'A Temperança', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'sequential', spiritual_meaning: 'A Temperança busca equilíbrio divino enquanto O Diabo personifica tentação terrena.', energy_flow: 'bidirectional' },
  { arcano: 'A Temperança', numero_carta: 14, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'A Temperança integra extremos que O Julgamento desperta para avaliar.', energy_flow: 'bidirectional' },
  { arcano: 'A Temperança', numero_carta: 14, related_arcano: 'O Mundo', related_numero: 21, path_type: 'elemental', spiritual_meaning: 'A Temperança harmoniza que O Mundo completa em integração final.', energy_flow: 'bidirectional' },

  // O Diabo (15) - Shadow
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'sequential', spiritual_meaning: 'O Diabo representa tentação e escravidão enquanto A Torre traz libertação através de destruição.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'O Louco', related_numero: 0, path_type: 'archetypal', spiritual_meaning: 'O Diabo representa tentação terrena enquanto O Louco busca liberdade espiritual.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'O Diabo mantém correntes que A Estrela libera com esperança renovadora.', energy_flow: 'bidirectional' },

  // A Torre (16) - Revelation
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'sequential', spiritual_meaning: 'A Torre traz destruição súbita enquanto A Estrela traz esperança renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'O Sol', related_numero: 19, path_type: 'tree_path', spiritual_meaning: 'A Torre derriba estruturas ilusórias que O Sol ilumina em verdade.', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'A Torre revela verdade súbita que A Lua ilumina com luz indireta.', energy_flow: 'bidirectional' },

  // A Estrela (17) - Hope
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'sequential', spiritual_meaning: 'A Estrela traz esperança clara enquanto A Lua revela ilusões.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'O Sol', related_numero: 19, path_type: 'tree_path', spiritual_meaning: 'A Estrela oferece esperança que O Sol transforma em alegria radiante.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: 'A Estrela traz esperança renovadora enquanto O Julgamento traz desperto final.', energy_flow: 'bidirectional' },

  // A Lua (18) - Illusion
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: 'A Lua revela ilusões e medos enquanto O Sol traz claridade e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'A Lua revela o inconsciente e ilusões enquanto O Julgamento traz renovação através de despertar.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Mundo', related_numero: 21, path_type: 'archetypal', spiritual_meaning: 'A Lua governa o inconsciente que O Mundo integra em completude.', energy_flow: 'bidirectional' },

  // O Sol (19) - Clarity
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'sequential', spiritual_meaning: 'O Sol traz alegria e claridade enquanto O Julgamento traz despertar e renovação.', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Mundo', related_numero: 21, path_type: 'tree_path', spiritual_meaning: 'O Sol irradia luz que O Mundo dança em integração completa.', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'elemental', spiritual_meaning: 'O Sol brilha com vitalidade que A Imperatriz manifesta em fertilidade.', energy_flow: 'bidirectional' },

  // O Julgamento (20) - Awakening
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'O Julgamento desperta para renovação espiritual enquanto O Mundo representa integração completa.', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Louco', related_numero: 0, path_type: 'tree_path', spiritual_meaning: 'O Julgamento responde ao chamado que O Louco iniciou em despreendimento.', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'archetypal', spiritual_meaning: 'O Julgamento avalia como O Hierofante ensina a lei sagrada.', energy_flow: 'bidirectional' },

  // O Mundo (21) - Completion
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Louco', related_numero: 0, path_type: 'sequential', spiritual_meaning: 'O Mundo completa a jornada que O Louco iniciou em liberdade.', energy_flow: 'bidirectional' },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'tree_path', spiritual_meaning: 'O Mundo integra creation que A Imperatriz manifestou em fertilidade.', energy_flow: 'bidirectional' },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Mago', related_numero: 1, path_type: 'elemental', spiritual_meaning: 'O Mundo dança em integracao que O Mago expressa em manifestacao.', energy_flow: 'bidirectional' },
];

/** Total number of mappings */
export const TOTAL_MAPPINGS: number = TAROT_TAROT_MAPPINGS.length;

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAPPINGS);
Object.freeze(ALL_MAJOR_ARCANOS);

/**
 * Get tarot-tarot mapping between two arcana.
 */
export function getTarotTarot(
  arcano: string,
  relatedArcano: string
): TarotTarotMapping | null {
  return (
    TAROT_TAROT_MAPPINGS.find(
      (m) => m.arcano === arcano && m.related_arcano === relatedArcano
    ) || null
  );
}

/**
 * Get all tarot-tarot mappings.
 */
export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return [...TAROT_TAROT_MAPPINGS];
}

/**
 * Get all path types used in the mapping.
 */
export function getAllPathTypes(): TarotPathType[] {
  const types = new Set<TarotPathType>();
  TAROT_TAROT_MAPPINGS.forEach((m) => types.add(m.path_type));
  return Array.from(types) as TarotPathType[];
}

/**
 * Get all arcano that have mappings.
 */
export function getAllMappedArcanos(): string[] {
  const arcanos = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach((m) => {
    arcanos.add(m.arcano);
    arcanos.add(m.related_arcano);
  });
  return Array.from(arcanos);
}

/**
 * Get all relations for a specific arcano.
 */
export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(
    (m) => m.arcano === arcano || m.related_arcano === arcano
  );
}

/**
 * Get relations by path type.
 */
export function getRelationsByPathType(pathType: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.path_type === pathType);
}

/**
 * Get the path type between two arcanos.
 */
export function getPathTypeBetween(
  arcano1: string,
  arcano2: string
): TarotPathType | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping ? mapping.path_type : null;
}

/**
 * Get the spiritual meaning between two arcanos.
 */
export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string
): string | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping ? mapping.spiritual_meaning : null;
}

/**
 * Check if two arcanos have a relationship.
 */
export function hasRelation(arcano1: string, arcano2: string): boolean {
  return getPathTypeBetween(arcano1, arcano2) !== null;
}

/**
 * Get arcano by its number.
 */
export function getArcanoByNumber(number: number): string | null {
  return ALL_MAJOR_ARCANOS[number] || null;
}

/**
 * Default export with all functions and constants
 */
const tarotTarotDefaultExport = {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
};

export default tarotTarotDefaultExport;