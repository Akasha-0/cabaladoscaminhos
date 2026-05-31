/**
 * Tarot-Tarot Spiritual Correlation Module
 */

export type TarotPathType = 'Trino' | 'Sextil' | 'Quadratura' | 'Oposição' | 'Sequência' | 'Complementar' | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  related_arcano: string;
  path_type: TarotPathType;
  spiritual_meaning: { significado: string; crescimento: string; desafio: string; };
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES = 7;
export const TOTAL_MAPPINGS = 24;

const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequência', spiritual_meaning: { significado: 'Início da jornada', crescimento: 'Despertar', desafio: 'Superar medos' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Sacerdotisa', path_type: 'Sequência', spiritual_meaning: { significado: 'Manifestação', crescimento: 'Desenvolver poderes', desafio: 'Equilibrar forças' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'III - A Imperatriz', path_type: 'Sequência', spiritual_meaning: { significado: 'Intuição', crescimento: 'Conectar-se à intuição', desafio: 'Confiar no processo' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'IV - O Imperador', path_type: 'Sequência', spiritual_meaning: { significado: 'Abundância', crescimento: 'Manifestar abundancia', desafio: 'Equilibrar criação e controle' } },
  { arcano: 'IV - O Imperador', related_arcano: 'V - O Hierofante', path_type: 'Sequência', spiritual_meaning: { significado: 'Ordem', crescimento: 'Encontrar autoridade', desafio: 'Aceitar orientação' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VI - Os Enamorados', path_type: 'Sequência', spiritual_meaning: { significado: 'Tradição', crescimento: 'Escolher com sabedoria', desafio: 'Equilibrar coração e razão' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'VII - O Carro', path_type: 'Sequência', spiritual_meaning: { significado: 'Amor e conquista', crescimento: 'Avançar com propósito', desafio: 'Manter direção' } },
  { arcano: 'VII - O Carro', related_arcano: 'VIII - A Justiça', path_type: 'Sequência', spiritual_meaning: { significado: 'Conquista e verdade', crescimento: 'Vencer com integridade', desafio: 'Equilibrar opostos' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'IX - O Eremita', path_type: 'Sequência', spiritual_meaning: { significado: 'Verdade e sabedoria', crescimento: 'Buscar iluminação', desafio: 'Ver além da aparência' } },
  { arcano: 'IX - O Eremita', related_arcano: 'X - A Roda da Fortuna', path_type: 'Sequência', spiritual_meaning: { significado: 'Sabedoria e destino', crescimento: 'Aceitar ciclos', desafio: 'Confiar no processo' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XI - A Força', path_type: 'Sequência', spiritual_meaning: { significado: 'Destino e coragem', crescimento: 'Dominar instintos', desafio: 'Equilibrar luz e sombra' } },
  { arcano: 'XI - A Força', related_arcano: 'XII - O Enforcado', path_type: 'Sequência', spiritual_meaning: { significado: 'Coragem e sacrifício', crescimento: 'Sacrificar ego', desafio: 'Aceitar perspectiva' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIII - A Morte', path_type: 'Sequência', spiritual_meaning: { significado: 'Sacrifício e transformação', crescimento: 'Aceitar mudança', desafio: 'Largar o passado' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIV - A Temperança', path_type: 'Sequência', spiritual_meaning: { significado: 'Transformação e equilíbrio', crescimento: 'Integrar opostos', desafio: 'Equilibrar extremos' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XV - O Diabo', path_type: 'Sequência', spiritual_meaning: { significado: 'Equilíbrio e tentação', crescimento: 'Reconhecer armadilhas', desafio: 'Libertar-se' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequência', spiritual_meaning: { significado: 'Tentação e libertação', crescimento: 'Quebrar correntes', desafio: 'Abandonar ilusões' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequência', spiritual_meaning: { significado: 'Destruição e esperança', crescimento: 'Renovar-se', desafio: 'Encontrar esperança' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequência', spiritual_meaning: { significado: 'Esperança e ilusão', crescimento: 'Discernir realidade', desafio: 'Confiar intuição' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequência', spiritual_meaning: { significado: 'Ilusão e clareza', crescimento: 'Discernir verdade', desafio: 'Superar medos' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequência', spiritual_meaning: { significado: 'Clareza e despertar', crescimento: 'Celebrar vitórias', desafio: 'Perdoar passado' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequência', spiritual_meaning: { significado: 'Despertar e integração', crescimento: 'Integrar lições', desafio: 'Aceitar completude' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Início e fim', crescimento: 'Ciclar jornada', desafio: 'Aceitar retorno' } },
];

Object.freeze(TAROT_TAROT_MAPPINGS);

export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter((m) => m.arcano === arcano || m.related_arcano === arcano);
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] { return TAROT_TAROT_MAPPINGS; }
export function getAllPathTypes(): TarotPathType[] { return ['Trino', 'Sextil', 'Quadratura', 'Oposição', 'Sequência', 'Complementar', 'Ancestral']; }
export function getAllMappedArcanos(): string[] {
  const s = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach((m) => { s.add(m.arcano); s.add(m.related_arcano); });
  return Array.from(s);
}
export function getRelationsForArcano(arcano: string): TarotTarotMapping[] { return getTarotTarot(arcano); }
export function getRelationsByPathType(type: TarotPathType): TarotTarotMapping[] { return TAROT_TAROT_MAPPINGS.filter((m) => m.path_type === type); }
export function getPathTypeBetween(a1: string, a2: string): TarotPathType | null {
  const m = TAROT_TAROT_MAPPINGS.find((m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
  return m ? m.path_type : null;
}
export function getSpiritualMeaningBetween(a1: string, a2: string): TarotTarotMapping['spiritual_meaning'] | null {
  const m = TAROT_TAROT_MAPPINGS.find((m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
  return m ? m.spiritual_meaning : null;
}
export function hasRelation(a1: string, a2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some((m) => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
}
export function getArcanoByNumber(n: number): string | null {
  if (n < 0 || n > 21) return null;
  return ALL_MAJOR_ARCANOS[n] ?? null;
}
export default { getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos, getRelationsForArcano, getRelationsByPathType, getPathTypeBetween, getSpiritualMeaningBetween, hasRelation, getArcanoByNumber, ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES };
