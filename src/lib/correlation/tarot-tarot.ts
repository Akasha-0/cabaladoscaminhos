/**
 * Tarot-Tarot Correlation Module
 * Maps Major Arcana cards to other cards based on spiritual paths
 */

export type TarotPathType =
  | 'Trino'
  | 'Sextil'
  | 'Quadratura'
  | 'Opposicao'
  | 'Sequencia'
  | 'Complementar'
  | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: TarotPathType;
  spiritual_meaning: {
    significado: string;
    crescimento: string;
    desafio: string;
  };
}

export const ALL_MAJOR_ARCANOS = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Forca', 'O Eremita',
  'A Roda da Fortuna', 'A Justica', 'O Enforcado', 'A Morte', 'A Temperanca',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo',
] as const;

const MAPPINGS: TarotTarotMapping[] = [
  // Sequencia - Fool's Journey main path
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'Sequencia', spiritual_meaning: { significado: 'Iniciacao da jornada', crescimento: 'Despertar da consciencia', desafio: 'Superar o medo' } },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'Opposicao', spiritual_meaning: { significado: 'Acao e intuição', crescimento: 'Integrar opostos', desafio: 'Equilibrar forcas' } },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'Sequencia', spiritual_meaning: { significado: 'Mistério manifesta', crescimento: 'Sabedoria oculta', desafio: 'Conectar interno' } },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'Opposicao', spiritual_meaning: { significado: 'Feminino e masculino', crescimento: 'Equilibrio', desafio: 'Harmonizar' } },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'Sequencia', spiritual_meaning: { significado: 'Estrutura sagrada', crescimento: 'Autoridade', desafio: 'Temperar' } },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'Sequencia', spiritual_meaning: { significado: 'Tradição escolha', crescimento: 'Transmissão', desafio: 'Experienciar' } },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'Sequencia', spiritual_meaning: { significado: 'Escolha vitória', crescimento: 'Decisão', desafio: 'Integrar' } },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justica', related_numero: 8, path_type: 'Sequencia', spiritual_meaning: { significado: 'Vitória equilíbrio', crescimento: 'Conquista', desafio: 'Controlar' } },
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'Sequencia', spiritual_meaning: { significado: 'Análise sabedoria', crescimento: 'Discernimento', desafio: 'Buscar luz' } },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'Sequencia', spiritual_meaning: { significado: 'Lanterna ciclos', crescimento: 'Iluminação', desafio: 'Revelar' } },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Forca', related_numero: 11, path_type: 'Sequencia', spiritual_meaning: { significado: 'Destino transformação', crescimento: 'Aceitação', desafio: 'Dominar' } },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'Sequencia', spiritual_meaning: { significado: 'Coragem sacrifício', crescimento: 'Rendição', desafio: 'Entregar' } },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'Sequencia', spiritual_meaning: { significado: 'Sacrifício morte', crescimento: 'Perspectiva', desafio: 'Aceitar' } },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperanca', related_numero: 14, path_type: 'Sequencia', spiritual_meaning: { significado: 'Transformação equilíbrio', crescimento: 'Dissolução', desafio: 'Integrar' } },
  { arcano: 'A Temperanca', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'Sequencia', spiritual_meaning: { significado: 'Harmonia sombras', crescimento: 'Integração', desafio: 'Confrontar' } },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'Sequencia', spiritual_meaning: { significado: 'Prisão libertação', crescimento: 'Reconhecimento', desafio: 'Quebrar' } },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Sequencia', spiritual_meaning: { significado: 'Destruição esperança', crescimento: 'Libertação', desafio: 'Reconstruir' } },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'Sequencia', spiritual_meaning: { significado: 'Esperança teste', crescimento: 'Alinhamento', desafio: 'Guiar' } },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'Sequencia', spiritual_meaning: { significado: 'Ilusão verdade', crescimento: 'Dissipar', desafio: 'Brilhar' } },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'Sequencia', spiritual_meaning: { significado: 'Verdade despertar', crescimento: 'Ressurreição', desafio: 'Renascimento' } },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'Sequencia', spiritual_meaning: { significado: 'Chamado completude', crescimento: 'Renascimento', desafio: 'Responder' } },
  // Complementary - cycle connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'Complementar', spiritual_meaning: { significado: 'Ciclo completo', crescimento: 'Integração total', desafio: 'Recomeçar' } },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Complementar', spiritual_meaning: { significado: 'Energia esperança', crescimento: 'Fe inabalavel', desafio: 'Pés no chão' } },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Louco', related_numero: 0, path_type: 'Complementar', spiritual_meaning: { significado: 'Retorno ao início', crescimento: 'Ciclo eterno', desafio: 'Aceitar' } },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Mundo', related_numero: 21, path_type: 'Complementar', spiritual_meaning: { significado: 'Mãe universal', crescimento: 'Nutrição completa', desafio: 'Esquecer-se' } },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Louco', related_numero: 0, path_type: 'Ancestral', spiritual_meaning: { significado: 'Renascimento ancestral', crescimento: 'Transformação completa', desafio: 'Aceitar ciclo' } },
  // Trino - harmonious aspects
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Lua', related_numero: 18, path_type: 'Trino', spiritual_meaning: { significado: 'Mistério lunar', crescimento: 'Sabedoria profunda', desafio: 'Conectar' } },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Trino', spiritual_meaning: { significado: 'Fertilidade celestial', crescimento: 'Abundancia', desafio: 'Elevar' } },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'Trino', spiritual_meaning: { significado: 'Coragem sacrifício', crescimento: 'Rendição', desafio: 'Entregar' } },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'Trino', spiritual_meaning: { significado: 'Ilusão verdade', crescimento: 'Dissipar', desafio: 'Brilhar' } },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Justica', related_numero: 8, path_type: 'Trino', spiritual_meaning: { significado: 'Luz justiça', crescimento: 'Verdade clara', desafio: 'Equilibrar' } },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'O Sol', related_numero: 19, path_type: 'Trino', spiritual_meaning: { significado: 'Busca encontra', crescimento: 'Iluminação', desafio: 'Compartilhar' } },
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Trino', spiritual_meaning: { significado: 'Equilíbrio esperança', crescimento: 'Harmonia', desafio: 'Aceitar' } },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Sol', related_numero: 19, path_type: 'Trino', spiritual_meaning: { significado: 'Força brilha', crescimento: 'Coragem', desafio: 'Integrar' } },
  { arcano: 'A Temperanca', numero_carta: 14, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Trino', spiritual_meaning: { significado: 'Harmonia esperança', crescimento: 'Equilíbrio', desafio: 'Aceitar' } },
  // Sextil - opportunities
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'Sextil', spiritual_meaning: { significado: 'Poder escolha', crescimento: 'Alinhamento', desafio: 'Confiar' } },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'Sextil', spiritual_meaning: { significado: 'Estrutura sagrada', crescimento: 'Autoridade', desafio: 'Temperar' } },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Sextil', spiritual_meaning: { significado: 'Ciclos esperança', crescimento: 'Destino', desafio: 'Aproveitar' } },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Sextil', spiritual_meaning: { significado: 'Rendição esperança', crescimento: 'Perspectiva', desafio: 'Manter' } },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Estrela', related_numero: 17, path_type: 'Sextil', spiritual_meaning: { significado: 'Mistério esperança', crescimento: 'Sabedoria', desafio: 'Conectar' } },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'O Sol', related_numero: 19, path_type: 'Sextil', spiritual_meaning: { significado: 'Vitória ilumina', crescimento: 'Conquista', desafio: 'Manter' } },
  // Quadratura - challenges
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'Quadratura', spiritual_meaning: { significado: 'Análise sabedoria', crescimento: 'Discernimento', desafio: 'Buscar luz' } },
  { arcano: 'A Temperanca', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'Quadratura', spiritual_meaning: { significado: 'Harmonia sombras', crescimento: 'Integração', desafio: 'Confrontar' } },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'O Mundo', related_numero: 21, path_type: 'Quadratura', spiritual_meaning: { significado: 'Destruição completude', crescimento: 'Renovação', desafio: 'Recomeçar' } },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'O Sol', related_numero: 19, path_type: 'Quadratura', spiritual_meaning: { significado: 'Prisão ilumina', crescimento: 'Libertação', desafio: 'Transformar' } },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'A Torre', related_numero: 16, path_type: 'Quadratura', spiritual_meaning: { significado: 'Noite destrói', crescimento: 'Dissipar', desafio: 'Transcender' } },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'A Torre', related_numero: 16, path_type: 'Quadratura', spiritual_meaning: { significado: 'Tradição cai', crescimento: 'Quebrar', desafio: 'Reconstruir' } },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'A Morte', related_numero: 13, path_type: 'Quadratura', spiritual_meaning: { significado: 'Escolha transforma', crescimento: 'União', desafio: 'Mudança' } },
  // Opposicao - tensions
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'Opposicao', spiritual_meaning: { significado: 'Ação intuição', crescimento: 'Integrar', desafio: 'Equilibrar' } },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'Opposicao', spiritual_meaning: { significado: 'Feminino masculino', crescimento: 'Equilíbrio', desafio: 'Harmonizar' } },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Lua', related_numero: 18, path_type: 'Opposicao', spiritual_meaning: { significado: 'Luz reflexa', crescimento: 'Claridade', desafio: 'Ilusão' } },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Justica', related_numero: 8, path_type: 'Opposicao', spiritual_meaning: { significado: 'Crise justo', crescimento: 'Libertação', desafio: 'Equilibrar' } },
  // Additional connections for 60+ mappings
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Morte', related_numero: 13, path_type: 'Ancestral', spiritual_meaning: { significado: 'Fertilidade morte', crescimento: 'Transformacao', desafio: 'Aceitar ciclo' } },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Morte', related_numero: 13, path_type: 'Ancestral', spiritual_meaning: { significado: 'Esperança renascimento', crescimento: 'Aguardo', desafio: 'Transformação' } },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Torre', related_numero: 16, path_type: 'Complementar', spiritual_meaning: { significado: 'Pura energia liberada', crescimento: 'Libertação', desafio: 'Quebrar estruturas' } },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Morte', related_numero: 13, path_type: 'Ancestral', spiritual_meaning: { significado: 'Busca que morre', crescimento: 'Iluminação dissolve', desafio: 'Aceitar' } },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'A Torre', related_numero: 16, path_type: 'Sextil', spiritual_meaning: { significado: 'Vitória humilha', crescimento: 'Coragem transcende', desafio: 'Quebrar orgúlho' } },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'Trino', spiritual_meaning: { significado: 'Mistério cria', crescimento: 'Fertilidade oculta', desafio: 'Manifestar' } },
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'Sequencia', spiritual_meaning: { significado: 'Análise desperta', crescimento: 'Discernimento elevado', desafio: 'Despertar' } },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'Sextil', spiritual_meaning: { significado: 'Busca desperta', crescimento: 'Iluminação completa', desafio: 'Responder' } },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'O Mundo', related_numero: 21, path_type: 'Sequencia', spiritual_meaning: { significado: 'Ciclos completam', crescimento: 'Destino realizado', desafio: 'Aceitar' } },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'Opposicao', spiritual_meaning: { significado: 'Prisão tradiçao', crescimento: 'Libertação sagrada', desafio: 'Resgatar' } },
];

export const TAROT_TAROT_MAPPINGS = MAPPINGS;
export const TOTAL_MAPPINGS = MAPPINGS.length;

function getAllPathTypesSet(): TarotPathType[] {
  const types = new Set<TarotPathType>();
  MAPPINGS.forEach(m => types.add(m.path_type));
  return Array.from(types);
}

export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  const n = (s: string) => s.trim().toLowerCase();
  return MAPPINGS.filter(
    m => n(m.arcano) === n(arcano),
  );
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return MAPPINGS;
}

export function getAllPathTypes(): TarotPathType[] {
  return getAllPathTypesSet();
}

export function getAllMappedArcanos(): string[] {
  const arcanoSet = new Set<string>();
  MAPPINGS.forEach((mapping) => {
    arcanoSet.add(mapping.arcano);
    arcanoSet.add(mapping.related_arcano);
  });
  return Array.from(arcanoSet).sort((a, b) => {
    const getNum = (name: string) => {
      const m = MAPPINGS.find((m) => m.arcano === name);
      return m?.numero_carta ?? 99;
    };
    return getNum(a) - getNum(b);
  });
}

export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return MAPPINGS.filter(
    (mapping) => mapping.arcano === arcano || mapping.related_arcano === arcano,
  );
}

export function getRelationsByPathType(path_type: TarotPathType): TarotTarotMapping[] {
  return MAPPINGS.filter((mapping) => mapping.path_type === path_type);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const mapping = MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
  return mapping?.path_type ?? null;
}

export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string,
): TarotTarotMapping['spiritual_meaning'] | null {
  const mapping = MAPPINGS.find(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
  return mapping?.spiritual_meaning ?? null;
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  return MAPPINGS.some(
    (m) =>
      (m.arcano === arcano1 && m.related_arcano === arcano2) ||
      (m.arcano === arcano2 && m.related_arcano === arcano1),
  );
}

export function getArcanoByNumber(numero: number): string | null {
  const mapping = MAPPINGS.find((m) => m.numero_carta === numero);
  return mapping?.arcano ?? null;
}

export const TOTAL_PATH_TYPES = getAllPathTypesSet().length;

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
