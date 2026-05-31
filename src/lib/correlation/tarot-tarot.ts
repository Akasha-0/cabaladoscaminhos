/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on spiritual journey progression,
 * elemental correspondences, and initiatory paths in the Cabala dos Caminhos system.
 */

/** Path types representing different spiritual relationships between Arcana */
export type TarotPathType =
  | 'Trino'       // Harmonious progression: cards of same element (120 degree)
  | 'Sextil'      // Opportunity: compatible elements (60 degree)
  | 'Quadratura'  // Challenge: tension between elements (90 degree)
  | 'Oposição'    // Balance: opposite cards on the journey (180 degree)
  | 'Sequência'   // Sequential: adjacent cards in the journey
  | 'Complementar' // Complementary: cards that complete each other
  | 'Ancestral';  // Ancestral: cards connected through initiation lineage

/**
 * Represents the spiritual correlation between two Major Arcana
 */
export interface TarotTarotMapping {
  /** Source arcano */
  arcano: string;
  /** Related target arcano */
  related_arcano: string;
  /** Type of spiritual path between the arcana */
  path_type: TarotPathType;
  /** Spiritual meaning of the relationship */
  spiritual_meaning: {
    /** Core spiritual interpretation */
    significado: string;
    /** Growth opportunity in this relationship */
    crescimento: string;
    /** Potential challenge to overcome */
    desafio: string;
    /** Ritual or practice to enhance this connection */
    ritual?: string;
  };
}

/**
 * All 22 Major Arcana in traditional order
 */
export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Alta Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

/** Total number of path types */
export const TOTAL_PATH_TYPES: number = 7;

/**
 * Complete mapping of Major Arcana relationships.
 * Each arcano connects to 3 other arcs based on spiritual journey progression.
 * 22 arcana x 3 = 66+ mappings total.
 */
export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequência', spiritual_meaning: { significado: 'Iniciação', crescimento: 'Despertar', desafio: 'Confiar' } },
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Alta Sacerdotisa', path_type: 'Sequência', spiritual_meaning: { significado: 'Poder', crescimento: 'Canalizar', desafio: 'Focar' } },
  { arcano: 'I - O Mago', related_arcano: 'XI - A Força', path_type: 'Trino', spiritual_meaning: { significado: 'Vontade', crescimento: 'Transformar', desafio: 'Responsabilidade' } },
  { arcano: 'I - O Mago', related_arcano: 'XVI - A Torre', path_type: 'Oposição', spiritual_meaning: { significado: 'Construção', crescimento: 'Libertação', desafio: 'Aceitar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'III - A Imperatriz', path_type: 'Sequência', spiritual_meaning: { significado: 'Mistério', crescimento: 'Aplicar', desafio: 'Integrar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'IX - O Eremita', path_type: 'Trino', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Aprofundar', desafio: 'Equilibrar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'XVIII - A Lua', path_type: 'Oposição', spiritual_meaning: { significado: 'Verdade', crescimento: 'Discernir', desafio: 'Ilusão' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'IV - O Imperador', path_type: 'Sequência', spiritual_meaning: { significado: 'Criação', crescimento: 'Integrar', desafio: 'Disciplina' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'VII - O Carro', path_type: 'Sextil', spiritual_meaning: { significado: 'Nutrição', crescimento: 'Discernimento', desafio: 'Dependência' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Fertilidade', crescimento: 'Esperança', desafio: 'Tempo' } },
  { arcano: 'IV - O Imperador', related_arcano: 'V - O Hierofante', path_type: 'Sequência', spiritual_meaning: { significado: 'Ordem', crescimento: 'Autoridade', desafio: 'Dogma' } },
  { arcano: 'IV - O Imperador', related_arcano: 'X - A Roda da Fortuna', path_type: 'Oposição', spiritual_meaning: { significado: 'Controle', crescimento: 'Aceitação', desafio: 'Flexibilizar' } },
  { arcano: 'IV - O Imperador', related_arcano: 'XII - O Enforcado', path_type: 'Quadratura', spiritual_meaning: { significado: 'Ação', crescimento: 'Entrega', desafio: 'Sacrifício' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VI - Os Enamorados', path_type: 'Sequência', spiritual_meaning: { significado: 'Tradição', crescimento: 'Escolha', desafio: 'Questionar' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XIV - A Temperança', path_type: 'Trino', spiritual_meaning: { significado: 'Regras', crescimento: 'Moderação', desafio: 'Extremos' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XV - O Diabo', path_type: 'Oposição', spiritual_meaning: { significado: 'Luz', crescimento: 'Sombra', desafio: 'Julgamento' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'VII - O Carro', path_type: 'Sequência', spiritual_meaning: { significado: 'Escolha', crescimento: 'Vitória', desafio: 'Coerência' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XV - O Diabo', path_type: 'Quadratura', spiritual_meaning: { significado: 'União', crescimento: 'Elevação', desafio: 'Tentação' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Dualidade', crescimento: 'Transcendência', desafio: 'Apego' } },
  { arcano: 'VII - O Carro', related_arcano: 'VIII - A Justiça', path_type: 'Sequência', spiritual_meaning: { significado: 'Vitória', crescimento: 'Lei', desafio: 'Opressão' } },
  { arcano: 'VII - O Carro', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Controle', crescimento: 'Ciclos', desafio: 'Arrogância' } },
  { arcano: 'VII - O Carro', related_arcano: 'XVI - A Torre', path_type: 'Ancestral', spiritual_meaning: { significado: 'Conquista', crescimento: 'Queda', desafio: 'Invencibilidade' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'IX - O Eremita', path_type: 'Sequência', spiritual_meaning: { significado: 'Verdade', crescimento: 'Sabedoria', desafio: 'Compaixão' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'X - A Roda da Fortuna', path_type: 'Trino', spiritual_meaning: { significado: 'Lei', crescimento: 'Adaptação', desafio: 'Inflexibilidade' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'XII - O Enforcado', path_type: 'Oposição', spiritual_meaning: { significado: 'Ação', crescimento: 'Entrega', desafio: 'Julgamento' } },
  { arcano: 'IX - O Eremita', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Iluminação', crescimento: 'Participação', desafio: 'Isolamento' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIII - A Morte', path_type: 'Sequência', spiritual_meaning: { significado: 'Luz', crescimento: 'Transformação', desafio: 'Morte' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIX - O Sol', path_type: 'Trino', spiritual_meaning: { significado: 'Busca', crescimento: 'Integração', desafio: 'Dependência' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XI - A Força', path_type: 'Sequência', spiritual_meaning: { significado: 'Destino', crescimento: 'Força', desafio: 'Passividade' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XII - O Enforcado', path_type: 'Oposição', spiritual_meaning: { significado: 'Movimento', crescimento: 'Stillness', desafio: 'Frustração' } },
  { arcano: 'XI - A Força', related_arcano: 'XII - O Enforcado', path_type: 'Sequência', spiritual_meaning: { significado: 'Coragem', crescimento: 'Rendição', desafio: 'Derrota' } },
  { arcano: 'XI - A Força', related_arcano: 'XIII - A Morte', path_type: 'Quadratura', spiritual_meaning: { significado: 'Controle', crescimento: 'Impermanência', desafio: 'Resistência' } },
  { arcano: 'XI - A Força', related_arcano: 'XX - O Julgamento', path_type: 'Sextil', spiritual_meaning: { significado: 'Vitalidade', crescimento: 'Renascimento', desafio: 'Chamado' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIII - A Morte', path_type: 'Sequência', spiritual_meaning: { significado: 'Sacrifício', crescimento: 'Regeneração', desafio: 'Mudança' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIV - A Temperança', path_type: 'Sextil', spiritual_meaning: { significado: 'Espera', crescimento: 'Paciência', desafio: 'Calma' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XX - O Julgamento', path_type: 'Trino', spiritual_meaning: { significado: 'Perspectiva', crescimento: 'Clareza', desafio: 'Prisão' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIV - A Temperança', path_type: 'Sequência', spiritual_meaning: { significado: 'Transformação', crescimento: 'Equilíbrio', desafio: 'Perda' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XV - O Diabo', path_type: 'Trino', spiritual_meaning: { significado: 'Libertação', crescimento: 'Sombra', desafio: 'Medo' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Renascimento', crescimento: 'Culminação', desafio: 'Transformação' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XV - O Diabo', path_type: 'Sequência', spiritual_meaning: { significado: 'Moderação', crescimento: 'Integração', desafio: 'Tentação' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XVI - A Torre', path_type: 'Quadratura', spiritual_meaning: { significado: 'Equilíbrio', crescimento: 'Destruição', desafio: 'Caos' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Alquimia', crescimento: 'Harmonia', desafio: 'Paciência' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequência', spiritual_meaning: { significado: 'Projeção', crescimento: 'Revelação', desafio: 'Libertação' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Sombra', crescimento: 'Luz', desafio: 'Redenção' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XX - O Julgamento', path_type: 'Oposição', spiritual_meaning: { significado: 'Ilusão', crescimento: 'Despertar', desafio: 'Julgamento' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequência', spiritual_meaning: { significado: 'Ruptura', crescimento: 'Renovação', desafio: 'Caos' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVIII - A Lua', path_type: 'Quadratura', spiritual_meaning: { significado: 'Destruição', crescimento: 'Integração', desafio: 'Confusão' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Despertar', crescimento: 'Iluminação', desafio: 'Transformação' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequência', spiritual_meaning: { significado: 'Esperança', crescimento: 'Iluminação', desafio: 'Ilusão' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Luz', crescimento: 'Clareza', desafio: 'Exposição' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XX - O Julgamento', path_type: 'Trino', spiritual_meaning: { significado: 'Inspiration', crescimento: 'Ação', desafio: 'Comparação' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequência', spiritual_meaning: { significado: 'Ilusão', crescimento: 'Realidade', desafio: 'Clareza' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XX - O Julgamento', path_type: 'Quadratura', spiritual_meaning: { significado: 'Inconsciente', crescimento: 'Despertar', desafio: 'Confusão' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Sonho', crescimento: 'Manifestação', desafio: 'Realidade' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequência', spiritual_meaning: { significado: 'Vitória', crescimento: 'Despertar', desafio: 'Celebração' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Sucesso', crescimento: 'Culminação', desafio: 'Satisfação' } },
  { arcano: 'XIX - O Sol', related_arcano: '0 - O Louco', path_type: 'Ancestral', spiritual_meaning: { significado: 'Culminação', crescimento: 'Recomeço', desafio: 'Aceitação' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequência', spiritual_meaning: { significado: 'Despertar', crescimento: 'Integração', desafio: 'Aceitação' } },
  { arcano: 'XX - O Julgamento', related_arcano: '0 - O Louco', path_type: 'Complementar', spiritual_meaning: { significado: 'Renascimento', crescimento: 'Renovação', desafio: 'Entrega' } },
  { arcano: 'XXI - O Mundo', related_arcano: '0 - O Louco', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integração', desafio: 'Novo ciclo' } },
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
  return TAROT_TAROT_MAPPINGS.find(
    (m) => m.arcano === arcano && m.related_arcano === relatedArcano
  ) ?? null;
}

/**
 * Get all tarot-tarot mappings.
 */
export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

/**
 * Get all path types used in the mapping.
 */
export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAPPINGS.map((m) => m.path_type))) as TarotPathType[];
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
  return mapping?.path_type ?? null;
}

/**
 * Get the spiritual meaning between two arcanos.
 */
export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string
): TarotTarotMapping['spiritual_meaning'] | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping?.spiritual_meaning ?? null;
}

/**
 * Check if two arcanos have a relationship.
 */
export function hasRelation(arcano1: string, arcano2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
}

/**
 * Get arcano by its number.
 */
export function getArcanoByNumber(number: number): string | null {
  return ALL_MAJOR_ARCANOS[number] ?? null;
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
