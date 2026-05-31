/**
 * Tarot-Tarot Spiritual Correlation Module
 */

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
  };
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Alta Sacerdotisa', 'III - A Imperadora',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justiça', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Força',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperança', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES: number = 7;

export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequência', spiritual_meaning: { significado: 'Iniciação', crescimento: 'Despertar', desafio: 'Confiar' } },
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' } },
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Alta Sacerdotisa', path_type: 'Sequência', spiritual_meaning: { significado: 'Poder', crescimento: 'Canalizar', desafio: 'Focar' } },
  { arcano: 'I - O Mago', related_arcano: 'XI - A Força', path_type: 'Trino', spiritual_meaning: { significado: 'Vontade', crescimento: 'Transformar', desafio: 'Responsabilidade' } },
  { arcano: 'I - O Mago', related_arcano: 'XVI - A Torre', path_type: 'Oposição', spiritual_meaning: { significado: 'Construção', crescimento: 'Libertação', desafio: 'Aceitar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'III - A Imperadora', path_type: 'Sequência', spiritual_meaning: { significado: 'Mistério', crescimento: 'Aplicar', desafio: 'Integrar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'IX - O Eremita', path_type: 'Trino', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Aprofundar', desafio: 'Equilibrar' } },
  { arcano: 'II - A Alta Sacerdotisa', related_arcano: 'XVIII - A Lua', path_type: 'Oposição', spiritual_meaning: { significado: 'Verdade', crescimento: 'Discernir', desafio: 'Ilusão' } },
  { arcano: 'III - A Imperadora', related_arcano: 'IV - O Imperador', path_type: 'Sequência', spiritual_meaning: { significado: 'Criação', crescimento: 'Integrar', desafio: 'Disciplina' } },
  { arcano: 'III - A Imperadora', related_arcano: 'VII - Os Enamorados', path_type: 'Sextil', spiritual_meaning: { significado: 'Nutrição', crescimento: 'Discernimento', desafio: 'Dependência' } },
  { arcano: 'III - A Imperadora', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Fertilidade', crescimento: 'Esperança', desafio: 'Tempo' } },
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
  { arcano: 'XIII - A Morte', related_arcano: 'XVI - A Torre', path_type: 'Ancestral', spiritual_meaning: { significado: 'Regeneração', crescimento: 'Destruição', desafio: 'Necessidade' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XX - O Julgamento', path_type: 'Quadratura', spiritual_meaning: { significado: 'Fim', crescimento: 'Começo', desafio: 'Ciclo' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XV - O Diabo', path_type: 'Sequência', spiritual_meaning: { significado: 'Equilíbrio', crescimento: 'Moderação', desafio: 'Tentação' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XVI - A Torre', path_type: 'Quadratura', spiritual_meaning: { significado: 'Paz', crescimento: 'Crise', desafio: 'Calma' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Integração', crescimento: 'Completude', desafio: 'Perfeição' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequência', spiritual_meaning: { significado: 'Prisão', crescimento: 'Libertação', desafio: 'Crise' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVII - A Estrela', path_type: 'Oposição', spiritual_meaning: { significado: 'Escuridão', crescimento: 'Esperança', desafio: 'Libertação' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Bloqueio', crescimento: 'Iluminação', desafio: 'Transmutar' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequência', spiritual_meaning: { significado: 'Destruição', crescimento: 'Renovação', desafio: 'Desistir' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVIII - A Lua', path_type: 'Quadratura', spiritual_meaning: { significado: 'Revelação', crescimento: 'Ilusão', desafio: 'Discernimento' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XX - O Julgamento', path_type: 'Sextil', spiritual_meaning: { significado: 'Colapso', crescimento: 'Avaliação', desafio: 'Reconstruir' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequência', spiritual_meaning: { significado: 'Iluminação', crescimento: 'Inconsciente', desafio: 'Escuridão' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XIX - O Sol', path_type: 'Sequência', spiritual_meaning: { significado: 'Guia', crescimento: 'Luz', desafio: 'Crescimento' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Esperança', crescimento: 'Realização', desafio: 'Paciência' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequência', spiritual_meaning: { significado: 'Obscuridade', crescimento: 'Luz', desafio: 'Confrontar' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XX - O Julgamento', path_type: 'Quadratura', spiritual_meaning: { significado: 'Ilusão', crescimento: 'Verdade', desafio: 'Desejo' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XXI - O Mundo', path_type: 'Sextil', spiritual_meaning: { significado: 'Águas', crescimento: 'Integração', desafio: 'Perda' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequência', spiritual_meaning: { significado: 'Glória', crescimento: 'Renascimento', desafio: 'Apego' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XXI - O Mundo', path_type: 'Sequência', spiritual_meaning: { significado: 'Iluminação', crescimento: 'Completude', desafio: 'Parcialidade' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequência', spiritual_meaning: { significado: 'Avaliação', crescimento: 'Completude', desafio: 'Compaixão' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'I - O Mago', path_type: 'Oposição', spiritual_meaning: { significado: 'Passado', crescimento: 'Presente', desafio: 'Definição' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'IV - O Imperador', path_type: 'Sextil', spiritual_meaning: { significado: 'Lei', crescimento: 'Renovação', desafio: 'Dogma' } },
  { arcano: 'XXI - O Mundo', related_arcano: '0 - O Louco', path_type: 'Sequência', spiritual_meaning: { significado: 'Completude', crescimento: 'Recomeço', desafio: 'Apego' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'II - A Alta Sacerdotisa', path_type: 'Sextil', spiritual_meaning: { significado: 'Sabedoria', crescimento: 'Mistério', desafio: 'Perda' } },
  { arcano: 'XXI - O Mundo', related_arcano: 'III - A Imperadora', path_type: 'Sextil', spiritual_meaning: { significado: 'Criação', crescimento: 'Celebrar', desafio: 'Resultado' } },
];

export const TOTAL_MAPPINGS: number = TAROT_TAROT_MAPPINGS.length;

Object.freeze(TAROT_TAROT_MAPPINGS);
Object.freeze(ALL_MAJOR_ARCANOS);

export function getTarotTarot(arcano: string, relatedArcano: string): TarotTarotMapping | null {
  return TAROT_TAROT_MAPPINGS.find(m => m.arcano === arcano && m.related_arcano === relatedArcano) || null;
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return [...TAROT_TAROT_MAPPINGS];
}

export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAPPINGS.map(m => m.path_type))) as TarotPathType[];
}

export function getAllMappedArcanos(): string[] {
  const set = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach(m => { set.add(m.arcano); set.add(m.related_arcano); });
  return Array.from(set);
}

export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.arcano === arcano || m.related_arcano === arcano);
}

export function getRelationsByPathType(pathType: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.path_type === pathType);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const m = TAROT_TAROT_MAPPINGS.find(m =>
    (m.arcano === arcano1 && m.related_arcano === arcano2) ||
    (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return m ? m.path_type : null;
}

export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): TarotTarotMapping['spiritual_meaning'] | null {
  const m = TAROT_TAROT_MAPPINGS.find(m =>
    (m.arcano === arcano1 && m.related_arcano === arcano2) ||
    (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return m ? m.spiritual_meaning : null;
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  return TAROT_TAROT_MAPPINGS.some(m =>
    (m.arcano === arcano1 && m.related_arcano === arcano2) ||
    (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
}

export function getArcanoByNumber(number: number): string | null {
  if (number < 0 || number > 21) return null;
  return ALL_MAJOR_ARCANOS[number] || null;
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
  { arcano: '0 - O Louco', related_arcano: 'III - A Imperadora', path_type: 'Sextil', spiritual_meaning: { significado: 'Jornada', crescimento: 'Criação', desafio: 'Início' } },
  { arcano: 'I - O Mago', related_arcano: 'V - O Hierofante', path_type: 'Sextil', spiritual_meaning: { significado: 'Manifestação', crescimento: 'Tradição', desafio: 'Orientação' } },
