
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
  | 'Oposi\u00e7\u00e3o'    // Balance: opposite cards on the journey (180 degree)
  | 'Sequ\u00eancia'   // Sequential: adjacent cards in the journey
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
  '0 - O Louco', 'I - O Mago', 'II - A Alta Sacerotisa', 'III - A Imperadora',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justi\u00e7a', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A For\u00e7a',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperan\u00e7a', 'XV - O Diabo',
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
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Inicia\u00e7\u00e3o', crescimento: 'Despertar', desafio: 'Confiar' } },
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Alta Sacerotisa', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Poder', crescimento: 'Canalizar', desafio: 'Focar' } },
  { arcano: 'I - O Mago', related_arcano: 'XI - A For\u00e7a', path_type: 'Trino', spiritual_meaning: { significado: 'Vontade', crescimento: 'Transformar', desafio: 'Responsabilidade' } },
  { arcano: 'I - O Mago', related_arcano: 'XVI - A Torre', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Constru\u00e7\u00e3o', crescimento: 'Liberta\u00e7\u00e3o', desafio: 'Aceitar' } },
  { arcano: 'II - A Alta Sacerotisa', related_arcano: 'III - A Imperadora', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Mist\u00e9rio', crescimento: 'Aplicar', desafio: 'Integrar' } },
  { arcano: 'II - A Alta Sacerotisa', related_arcano: 'IX - O Eremita', path_type: 'Trino', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Aprofundar', desafio: 'Equilibrar' } },
  { arcano: 'II - A Alta Sacerotisa', related_arcano: 'XVIII - A Lua', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Verdade', crescimento: 'Discernir', desafio: 'Ilus\u00e3o' } },
  { arcano: 'III - A Imperadora', related_arcano: 'IV - O Imperador', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Cria\u00e7\u00e3o', crescimento: 'Integrar', desafio: 'Disciplina' } },
  { arcano: 'III - A Imperadora', related_arcano: 'VII - Os Enamorados', path_type: 'Sextil', spiritual_meaning: { significado: 'Nutri\u00e7\u00e3o', crescimento: 'Discernimento', desafio: 'Depend\u00eancia' } },
  { arcano: 'III - A Imperadora', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Fertilidade', crescimento: 'Esperan\u00e7a', desafio: 'Tempo' } },
  { arcano: 'IV - O Imperador', related_arcano: 'V - O Hierofante', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Ordem', crescimento: 'Autoridade', desafio: 'Dogma' } },
  { arcano: 'IV - O Imperador', related_arcano: 'X - A Roda da Fortuna', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Controle', crescimento: 'Aceita\u00e7\u00e3o', desafio: 'Flexibilizar' } },
  { arcano: 'IV - O Imperador', related_arcano: 'XII - O Enforcado', path_type: 'Quadratura', spiritual_meaning: { significado: 'A\u00e7\u00e3o', crescimento: 'Entrega', desafio: 'Sacrif\u00edcio' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VI - Os Enamorados', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Tradi\u00e7\u00e3o', crescimento: 'Escolha', desafio: 'Questionar' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XIV - A Temperan\u00e7a', path_type: 'Trino', spiritual_meaning: { significado: 'Regras', crescimento: 'Modera\u00e7\u00e3o', desafio: 'Extremos' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XV - O Diabo', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Luz', crescimento: 'Sombra', desafio: 'Julgamento' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'VII - O Carro', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Escolha', crescimento: 'Vit\u00f3ria', desafio: 'Coer\u00eancia' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XV - O Diabo', path_type: 'Quadratura', spiritual_meaning: { significado: 'Uni\u00e3o', crescimento: 'Eleva\u00e7\u00e3o', desafio: 'Tenta\u00e7\u00e3o' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Dualidade', crescimento: 'Transcend\u00eancia', desafio: 'Apego' } },
  { arcano: 'VII - O Carro', related_arcano: 'VIII - A Justi\u00e7a', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Vit\u00f3ria', crescimento: 'Lei', desafio: 'Opress\u00e3o' } },
  { arcano: 'VII - O Carro', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Controle', crescimento: 'Ciclos', desafio: 'Arrog\u00e2ncia' } },
  { arcano: 'VII - O Carro', related_arcano: 'XVI - A Torre', path_type: 'Ancestral', spiritual_meaning: { significado: 'Conquista', crescimento: 'Queda', desafio: 'Invencibilidade' } },
  { arcano: 'VIII - A Justi\u00e7a', related_arcano: 'IX - O Eremita', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Verdade', crescimento: 'Sabedoria', desafio: 'Compaix\u00e3o' } },
  { arcano: 'VIII - A Justi\u00e7a', related_arcano: 'X - A Roda da Fortuna', path_type: 'Trino', spiritual_meaning: { significado: 'Lei', crescimento: 'Adapta\u00e7\u00e3o', desafio: 'Inflexibilidade' } },
  { arcano: 'VIII - A Justi\u00e7a', related_arcano: 'XII - O Enforcado', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'A\u00e7\u00e3o', crescimento: 'Entrega', desafio: 'Julgamento' } },
  { arcano: 'IX - O Eremita', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Ilumina\u00e7\u00e3o', crescimento: 'Participa\u00e7\u00e3o', desafio: 'Isolamento' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIII - A Morte', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Luz', crescimento: 'Transforma\u00e7\u00e3o', desafio: 'Morte' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIX - O Sol', path_type: 'Trino', spiritual_meaning: { significado: 'Busca', crescimento: 'Integra\u00e7\u00e3o', desafio: 'Depend\u00eancia' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XI - A For\u00e7a', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Destino', crescimento: 'For\u00e7a', desafio: 'Passividade' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XII - O Enforcado', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Movimento', crescimento: 'Stillness', desafio: 'Frustra\u00e7\u00e3o' } },
  { arcano: 'XI - A For\u00e7a', related_arcano: 'XII - O Enforcado', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Coragem', crescimento: 'Rendi\u00e7\u00e3o', desafio: 'Derrota' } },
  { arcano: 'XI - A For\u00e7a', related_arcano: 'XIII - A Morte', path_type: 'Quadratura', spiritual_meaning: { significado: 'Controle', crescimento: 'Imperman\u00eancia', desafio: 'Resist\u00eancia' } },
  { arcano: 'XI - A For\u00e7a', related_arcano: 'XX - O Julgamento', path_type: 'Sextil', spiritual_meaning: { significado: 'Vitalidade', crescimento: 'Renascimento', desafio: 'Chamado' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIII - A Morte', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Sacrif\u00edcio', crescimento: 'Regenera\u00e7\u00e3o', desafio: 'Mudan\u00e7a' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIV - A Temperan\u00e7a', path_type: 'Sextil', spiritual_meaning: { significado: 'Espera', crescimento: 'Paciencia', desafio: 'Calma' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XX - O Julgamento', path_type: 'Trino', spiritual_meaning: { significado: 'Perspectiva', crescimento: 'Clareza', desafio: 'Pris\u00e3o' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIV - A Temperan\u00e7a', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Transforma\u00e7\u00e3o', crescimento: 'Equil\u00edbrio', desafio: 'Perda' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XVI - A Torre', path_type: 'Ancestral', spiritual_meaning: { significado: 'Regenera\u00e7\u00e3o', crescimento: 'Destrui\u00e7\u00e3o', desafio: 'Necessidade' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XX - O Julgamento', path_type: 'Quadratura', spiritual_meaning: { significado: 'Fim', crescimento: 'Come\u00e7o', desafio: 'Ciclo' } },
  { arcano: 'XIV - A Temperan\u00e7a', related_arcano: 'XV - O Diabo', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Equil\u00edbrio', crescimento: 'Modera\u00e7\u00e3o', desafio: 'Tenta\u00e7\u00e3o' } },
  { arcano: 'XIV - A Temperan\u00e7a', related_arcano: 'XVI - A Torre', path_type: 'Quadratura', spiritual_meaning: { significado: 'Paz', crescimento: 'Crise', desafio: 'Calma' } },
  { arcano: 'XIV - A Temperan\u00e7a', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Integra\u00e7\u00e3o', crescimento: 'Completude', desafio: 'Perfei\u00e7\u00e3o' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Pris\u00e3o', crescimento: 'Liberta\u00e7\u00e3o', desafio: 'Crise' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVII - A Estrela', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Escurid\u00e3o', crescimento: 'Esperan\u00e7a', desafio: 'Liberta\u00e7\u00e3o' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Bloqueio', crescimento: 'Ilumina\u00e7\u00e3o', desafio: 'Transmutar' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Destrui\u00e7\u00e3o', crescimento: 'Renova\u00e7\u00e3o', desafio: 'Desistir' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVIII - A Lua', path_type: 'Quadratura', spiritual_meaning: { significado: 'Revela\u00e7\u00e3o', crescimento: 'Ilus\u00e3o', desafio: 'Discernimento' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XX - O Julgamento', path_type: 'Sextil', spiritual_meaning: { significado: 'Colapso', crescimento: 'Avalia\u00e7\u00e3o', desafio: 'Reconstruir' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Ilumina\u00e7\u00e3o', crescimento: 'Inconsciente', desafio: 'Escurid\u00e3o' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XIX - O Sol', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Guia', crescimento: 'Luz', desafio: 'Crescimento' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Esperan\u00e7a', crescimento: 'Realiza\u00e7\u00e3o', desafio: 'Paciencia' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Obscuridade', crescimento: 'Luz', desafio: 'Confrontar' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XX - O Julgamento', path_type: 'Quadratura', spiritual_meaning: { significado: 'Ilus\u00e3o', crescimento: 'Verdade', desafio: 'Desejo' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Aguas', crescimento: 'Integra\u00e7\u00e3o', desafio: 'Perda' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Gloria', crescimento: 'Renascimento', desafio: 'Apego' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XXI - O Mundo', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Ilumina\u00e7\u00e3o', crescimento: 'Completude', desafio: 'Parcialidade' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Avalia\u00e7\u00e3o', crescimento: 'Completude', desafio: 'Compaix\u00e3o' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'I - O Mago', path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: { significado: 'Passado', crescimento: 'Presente', desafio: 'Defini\u00e7\u00e3o' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'IV - O Imperador', path_type: 'Sextil', spiritual_meaning: { significado: 'Lei', crescimento: 'Renova\u00e7\u00e3o', desafio: 'Dogma' } },
  { arcano: 'XXI - O Mundo', related_arcano: '0 - O Louco', path_type: 'Sequ\u00eancia', spiritual_meaning: { significado: 'Completude', crescimento: 'Recome\u00e7o', desafio: 'Apego' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'II - A Alta Sacerotisa', path_type: 'Sextil', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Mist\u00e9rio', desafio: 'Perda' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'III - A Imperadora', path_type: 'Sextil', spiritual_meaning: { significado: 'Cria\u00e7\u00e3o', crescimento: 'Celebrar', desafio: 'Resultado' } },
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
  return TAROT_TAROT_MAPPINGS;
}

/**
 * Get all path types used in the mapping.
 */
export function getAllPathTypes(): TarotPathType[] {
  const types = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.path_type));
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
): TarotTarotMapping['spiritual_meaning'] | null {
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
  if (number < 0 || number > 21) return null;
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
