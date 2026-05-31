/**
 * Tarot-Tarot Spiritual Correlation Module
 */
export type TarotPathType = 'Trino' | 'Sextil' | 'Quadratura' | 'Oposicao' | 'Sequencia' | 'Complementar' | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  related_arcano: string;
  path_type: TarotPathType;
  spiritual_meaning: { significado: string; crescimento: string; desafio: string; };
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justica', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Forca',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperanca', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES = 7;
export const TOTAL_MAPPINGS = 68;

const TAROT_TAROT_MAP: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequencia', spiritual_meaning: { significado: 'Inicio da jornada', crescimento: 'Despertar', desafio: 'Superar medos' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Sacerdotisa', path_type: 'Sequencia', spiritual_meaning: { significado: 'Manifestacao', crescimento: 'Desenvolver poderes', desafio: 'Equilibrar forcas' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'III - A Imperatriz', path_type: 'Sequencia', spiritual_meaning: { significado: 'Intuicao', crescimento: 'Conectar-se a intuicao', desafio: 'Confiar no processo' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'IV - O Imperador', path_type: 'Sequencia', spiritual_meaning: { significado: 'Abundancia', crescimento: 'Manifestar abundancia', desafio: 'Equilibrar criacao e controle' } },
  { arcano: 'IV - O Imperador', related_arcano: 'V - O Hierofante', path_type: 'Sequencia', spiritual_meaning: { significado: 'Ordem', crescimento: 'Encontrar autoridade', desafio: 'Aceitar orientacao' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VI - Os Enamorados', path_type: 'Sequencia', spiritual_meaning: { significado: 'Tradicao', crescimento: 'Escolher com sabedoria', desafio: 'Equilibrar coracao e razao' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'VII - O Carro', path_type: 'Sequencia', spiritual_meaning: { significado: 'Amor e conquista', crescimento: 'Avancar com proposito', desafio: 'Manter direcao' } },
  { arcano: 'VII - O Carro', related_arcano: 'VIII - A Justica', path_type: 'Sequencia', spiritual_meaning: { significado: 'Conquista e verdade', crescimento: 'Vencer com integridade', desafio: 'Equilibrar opostos' } },
  { arcano: 'VIII - A Justica', related_arcano: 'IX - O Eremita', path_type: 'Sequencia', spiritual_meaning: { significado: 'Verdade e sabedoria', crescimento: 'Buscar iluminacao', desafio: 'Ver alem da aparencia' } },
  { arcano: 'IX - O Eremita', related_arcano: 'X - A Roda da Fortuna', path_type: 'Sequencia', spiritual_meaning: { significado: 'Sabedoria e destino', crescimento: 'Aceitar ciclos', desafio: 'Confiar no processo' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XI - A Forca', path_type: 'Sequencia', spiritual_meaning: { significado: 'Destino e coragem', crescimento: 'Dominar instintos', desafio: 'Equilibrar luz e sombra' } },
  { arcano: 'XI - A Forca', related_arcano: 'XII - O Enforcado', path_type: 'Sequencia', spiritual_meaning: { significado: 'Coragem e sacrificio', crescimento: 'Sacrificar ego', desafio: 'Aceitar perspectiva' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIII - A Morte', path_type: 'Sequencia', spiritual_meaning: { significado: 'Sacrificio e transformacao', crescimento: 'Aceitar mudanca', desafio: 'Largar o passado' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIV - A Temperanca', path_type: 'Sequencia', spiritual_meaning: { significado: 'Transformacao e equilibrio', crescimento: 'Integrar opostos', desafio: 'Equilibrar extremos' } },
  { arcano: 'XIV - A Temperanca', related_arcano: 'XV - O Diabo', path_type: 'Sequencia', spiritual_meaning: { significado: 'Equilibrio e tentacao', crescimento: 'Reconhecer armadilhas', desafio: 'Libertar-se' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequencia', spiritual_meaning: { significado: 'Tentacao e libertacao', crescimento: 'Quebrar correntes', desafio: 'Abandonar ilusoes' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequencia', spiritual_meaning: { significado: 'Destruicao e esperanca', crescimento: 'Renovar-se', desafio: 'Encontrar esperanca' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequencia', spiritual_meaning: { significado: 'Esperanca e ilusao', crescimento: 'Discernir realidade', desafio: 'Confiar intuicao' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequencia', spiritual_meaning: { significado: 'Ilusao e clareza', crescimento: 'Discernir verdade', desafio: 'Superar medos' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequencia', spiritual_meaning: { significado: 'Clareza e despertar', crescimento: 'Celebrar vitorias', desafio: 'Perdoar passado' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequencia', spiritual_meaning: { significado: 'Despertar e integracao', crescimento: 'Integrar licoes', desafio: 'Aceitar completude' } },
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' } },
  { arcano: 'I - O Mago', related_arcano: 'XI - A Forca', path_type: 'Trino', spiritual_meaning: { significado: 'Vontade', crescimento: 'Transformar', desafio: 'Responsabilidade' } },
  { arcano: 'I - O Mago', related_arcano: 'XVI - A Torre', path_type: 'Oposicao', spiritual_meaning: { significado: 'Construcao', crescimento: 'Liberacao', desafio: 'Aceitar' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'IX - O Eremita', path_type: 'Trino', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Aprofundar', desafio: 'Equilibrar' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'XVIII - A Lua', path_type: 'Oposicao', spiritual_meaning: { significado: 'Verdade', crescimento: 'Discernir', desafio: 'Ilusao' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'VII - O Carro', path_type: 'Sextil', spiritual_meaning: { significado: 'Nutricao', crescimento: 'Discernimento', desafio: 'Dependencia' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Fertilidade', crescimento: 'Esperanca', desafio: 'Tempo' } },
  { arcano: 'IV - O Imperador', related_arcano: 'VIII - A Justica', path_type: 'Sequencia', spiritual_meaning: { significado: 'Autoridade', crescimento: 'Justica', desafio: 'Rigor' } },
  { arcano: 'IV - O Imperador', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Dominio', crescimento: 'Adaptacao', desafio: 'Controle' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VIII - A Justica', path_type: 'Trino', spiritual_meaning: { significado: 'Doutrina', crescimento: 'Ensinamento', desafio: 'Abertura' } },
  { arcano: 'V - O Hierofante', related_arcano: 'X - A Roda da Fortuna', path_type: 'Sextil', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Tradicao', desafio: 'Renovacao' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XIV - A Temperanca', path_type: 'Sextil', spiritual_meaning: { significado: 'Amor', crescimento: 'Harmonia', desafio: 'Tensao' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XX - O Julgamento', path_type: 'Complementar', spiritual_meaning: { significado: 'Decisao', crescimento: 'Avaliacao', desafio: 'Conflito' } },
  { arcano: 'VII - O Carro', related_arcano: 'XVI - A Torre', path_type: 'Oposicao', spiritual_meaning: { significado: 'Determinacao', crescimento: 'Triunfo', desafio: 'Queda' } },
  { arcano: 'VII - O Carro', related_arcano: 'XIX - O Sol', path_type: 'Trino', spiritual_meaning: { significado: 'Sucesso', crescimento: 'Celebracao', desafio: 'Superficialidade' } },
  { arcano: 'VIII - A Justica', related_arcano: 'XX - O Julgamento', path_type: 'Sequencia', spiritual_meaning: { significado: 'Lei', crescimento: 'Consciencia', desafio: 'Culpa' } },
  { arcano: 'VIII - A Justica', related_arcano: 'X - A Roda da Fortuna', path_type: 'Quadratura', spiritual_meaning: { significado: 'Verdade', crescimento: 'Honestidade', desafio: 'Imparcialidade' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIX - O Sol', path_type: 'Sequencia', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Guia', desafio: 'Superioridade' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XVII - A Estrela', path_type: 'Sextil', spiritual_meaning: { significado: 'Reflexao', crescimento: 'Introspeccao', desafio: 'Melancolia' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XV - O Diabo', path_type: 'Oposicao', spiritual_meaning: { significado: 'Destino', crescimento: 'Transformacao', desafio: 'Prisao' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XVIII - A Lua', path_type: 'Sextil', spiritual_meaning: { significado: 'Karma', crescimento: 'Evolucao', desafio: 'Confusao' } },
  { arcano: 'XI - A Forca', related_arcano: 'XV - O Diabo', path_type: 'Oposicao', spiritual_meaning: { significado: 'Poder', crescimento: 'Dominio', desafio: 'Dependencia' } },
  { arcano: 'XI - A Forca', related_arcano: 'XIV - A Temperanca', path_type: 'Trino', spiritual_meaning: { significado: 'Bravura', crescimento: 'Moderao', desafio: 'Intemperanca' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XVI - A Torre', path_type: 'Oposicao', spiritual_meaning: { significado: 'Perspectiva', crescimento: 'Desapego', desafio: 'Impotencia' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XX - O Julgamento', path_type: 'Complementar', spiritual_meaning: { significado: 'Renuncia', crescimento: 'Despertar', desafio: 'Confusao' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XVI - A Torre', path_type: 'Sextil', spiritual_meaning: { significado: 'Fim', crescimento: 'Liberacao', desafio: 'Trauma' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XX - O Julgamento', path_type: 'Trino', spiritual_meaning: { significado: 'Metamorphose', crescimento: 'Ressurreicao', desafio: 'Aversao' } },
  { arcano: 'XIV - A Temperanca', related_arcano: 'XVII - A Estrela', path_type: 'Sequencia', spiritual_meaning: { significado: 'Harmonia', crescimento: 'Alquimia', desafio: 'Insipidez' } },
  { arcano: 'XIV - A Temperanca', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Moderacao', crescimento: 'Sintese', desafio: 'Conflito' } },
  { arcano: 'XV - O Diabo', related_arcano: '0 - O Louco', path_type: 'Oposicao', spiritual_meaning: { significado: 'Sombra', crescimento: 'Reconhecimento', desafio: 'Projecao' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVII - A Estrela', path_type: 'Quadratura', spiritual_meaning: { significado: 'Ilusao', crescimento: 'Superacao', desafio: 'Dependencia' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XIX - O Sol', path_type: 'Sequencia', spiritual_meaning: { significado: 'Catastrofe', crescimento: 'Restauracao', desafio: 'Desespero' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVIII - A Lua', path_type: 'Sextil', spiritual_meaning: { significado: 'Desconstrucao', crescimento: 'Liberacao', desafio: 'Confusao' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Fluidez', crescimento: 'Confianca', desafio: 'Impaciencia' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XX - O Julgamento', path_type: 'Sequencia', spiritual_meaning: { significado: 'Inconsciente', crescimento: 'Despertar', desafio: 'Ilusao' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XXI - O Mundo', path_type: 'Quadratura', spiritual_meaning: { significado: 'Mundo Interior', crescimento: 'Integracao', desafio: 'Fragmentacao' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XXI - O Mundo', path_type: 'Sequencia', spiritual_meaning: { significado: 'Alegria', crescimento: 'Sucesso', desafio: 'Arrogancia' } },
  { arcano: 'XIX - O Sol', related_arcano: '0 - O Louco', path_type: 'Sextil', spiritual_meaning: { significado: 'Luz', crescimento: 'Integracao', desafio: 'Superficialidade' } },
  { arcano: 'XX - O Julgamento', related_arcano: '0 - O Louco', path_type: 'Quadratura', spiritual_meaning: { significado: 'Chamado', crescimento: 'Renovacao', desafio: 'Comparacao' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'V - O Hierofante', path_type: 'Sextil', spiritual_meaning: { significado: 'Avaliacao', crescimento: 'Responsabilidade', desafio: 'Condenacao' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'III - A Imperatriz', path_type: 'Sextil', spiritual_meaning: { significado: 'Realizacao', crescimento: 'Fertilidade', desafio: 'Satisfacao' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'I - O Mago', path_type: 'Sextil', spiritual_meaning: { significado: 'Dance', crescimento: 'Manifestacao', desafio: 'Complacencia' } },
];

export const TAROT_TAROT_MAPPINGS = TAROT_TAROT_MAP;
Object.freeze(TAROT_TAROT_MAP);
Object.freeze(ALL_MAJOR_ARCANOS);

export function getTarotTarot(arcano: string, related?: string): TarotTarotMapping | null {
  if (related) {
    return TAROT_TAROT_MAP.find(
      (m) => (m.arcano === arcano && m.related_arcano === related) || (m.arcano === related && m.related_arcano === arcano)
    ) || null;
  }
  return TAROT_TAROT_MAP.find(
    (m) => m.arcano === arcano || m.related_arcano === arcano
  ) || null;
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] { return TAROT_TAROT_MAP; }
export function getAllPathTypes(): TarotPathType[] { return ['Trino', 'Sextil', 'Quadratura', 'Oposicao', 'Sequencia', 'Complementar', 'Ancestral']; }
export function getAllMappedArcanos(): string[] {
  const s = new Set<string>();
  TAROT_TAROT_MAP.forEach((m) => { s.add(m.arcano); s.add(m.related_arcano); });
  return Array.from(s);
}
export function getRelationsForArcano(arcano: string): readonly TarotTarotMapping[] { return TAROT_TAROT_MAP.filter((m) => m.arcano === arcano || m.related_arcano === arcano); }
export function getRelationsByPathType(type: TarotPathType): readonly TarotTarotMapping[] { return TAROT_TAROT_MAP.filter((m) => m.path_type === type); }
export function getPathTypeBetween(a1: string, a2: string): TarotPathType | null {
  const m = TAROT_TAROT_MAP.find(
    (m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1)
  );
  return m ? m.path_type : null;
}
export function getSpiritualMeaningBetween(a1: string, a2: string): TarotTarotMapping['spiritual_meaning'] | null {
  const m = TAROT_TAROT_MAP.find(
    (m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1)
  );
  return m ? m.spiritual_meaning : null;
}
export function hasRelation(a1: string, a2: string): boolean {
  return TAROT_TAROT_MAP.some(
    (m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1)
  );
}
export function getArcanoByNumber(n: number): string | null {
  if (n < 0 || n > 21) return null;
  return ALL_MAJOR_ARCANOS[n] ?? null;
}
export default {
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
