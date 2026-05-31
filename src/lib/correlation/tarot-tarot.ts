
/**
 * Tarot-Tarot Spiritual Correlation Module
 */

/** Path types */
export type TarotPathType =
  | 'Trino'
  | 'Sextil'
  | 'Quadratura'
  | 'Oposição'
  | 'Sequência'
  | 'Complementar'
  | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  related_arcano: string;
  path_type: TarotPathType;
  spiritual_meaning: {
    significado: string;
    crescimento: string;
    desafio: string;
    ritual?: string;
  };
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Alta Sacerotisa', 'III - A Imperadora',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES = 7;

export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequência', spiritual_meaning: { significado: 'Iniciação', crescimento: 'Despertar', desafio: 'Confiar' } },
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' } },
];

export const TOTAL_MAPPINGS = TAROT_TAROT_MAPPINGS.length;

export function getTarotTarot(a: string, b: string): TarotTarotMapping | null {
  return TAROT_TAROT_MAPPINGS.find(m => m.arcano === a && m.related_arcano === b) || null;
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] { return TAROT_TAROT_MAPPINGS; }

export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAPPINGS.map(m => m.path_type))) as TarotPathType[];
}

export function getAllMappedArcanos(): string[] {
  const set = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach(m => { set.add(m.arcano); set.add(m.related_arcano); });
  return Array.from(set);
}

export function getRelationsForArcano(a: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.arcano === a || m.related_arcano === a);
}

export function getRelationsByPathType(t: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.path_type === t);
}

export function getPathTypeBetween(a1: string, a2: string): TarotPathType | null {
  const m = TAROT_TAROT_MAPPINGS.find(m => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
  return m ? m.path_type : null;
}

export function getSpiritualMeaningBetween(a1: string, a2: string): TarotTarotMapping['spiritual_meaning'] | null {
  const m = TAROT_TAROT_MAPPINGS.find(m => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
  return m ? m.spiritual_meaning : null;
}

export function hasRelation(a1: string, a2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(m => (m.arcano === a1 && m.related_arcano === a2) || (m.arcano === a2 && m.related_arcano === a1));
}

export function getArcanoByNumber(n: number): string | null {
  if (n < 0 || n > 21) return null;
  return ALL_MAJOR_ARCANOS[n] || null;
}

export default { getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos, getRelationsForArcano, getRelationsByPathType, getPathTypeBetween, getSpiritualMeaningBetween, hasRelation, getArcanoByNumber, ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES };
