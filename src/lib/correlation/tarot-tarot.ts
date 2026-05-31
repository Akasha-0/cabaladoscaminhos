/**
 * Tarot-Tarot Correlation Module
 * Maps Major Arcana cards to other cards based on spiritual paths
 */

export type TarotPathType =
  | 'tree_path'
  | 'sequential'
  | 'archetypal'
  | 'complementary'
  | 'ancestral';

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: TarotPathType;
  spiritual_meaning: string[];
}

export const ALL_MAJOR_ARCANOS = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Forca', 'O Eremita',
  'A Roda da Fortuna', 'A Justica', 'O Enforcado', 'A Morte', 'A Temperanca',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo',
] as const;

const MAPPINGS: TarotTarotMapping[] = [
  // Tree paths - main sequential journey
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'tree_path', spiritual_meaning: ['Início da jornada', 'Despertar da consciência', 'Primeiro passo'] },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'tree_path', spiritual_meaning: ['Ação e intuição', 'Manifestação criativa', 'Poder pessoal'] },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'tree_path', spiritual_meaning: ['Sabedoria oculta', 'Mistério interior', 'Conhecimento profundo'] },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'archetypal', spiritual_meaning: ['Feminino e masculino', 'Criar e governar', 'Equilíbrio dos opostos'] },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'tree_path', spiritual_meaning: ['Estrutura sagrada', 'Autoridade espiritual', 'Tradição'] },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'tree_path', spiritual_meaning: ['Tradição e escolha', 'Ensinamentos', 'Amor sagrado'] },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'tree_path', spiritual_meaning: ['Escolha e vitória', 'Decisão importante', 'Conquista'] },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justica', related_numero: 8, path_type: 'tree_path', spiritual_meaning: ['Vitória e equilíbrio', 'Controle', 'Determinação'] },
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: ['Análise e sabedoria', 'Discernimento', 'Busca da verdade'] },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'tree_path', spiritual_meaning: ['Lanterna e ciclos', 'Iluminação interior', 'Descoberta'] },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Forca', related_numero: 11, path_type: 'tree_path', spiritual_meaning: ['Destino e transformação', 'Ciclos', 'Ação'] },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'tree_path', spiritual_meaning: ['Coragem e sacrifício', 'Rendição', 'Nova perspectiva'] },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'tree_path', spiritual_meaning: ['Sacrifício e morte', 'Transformação', 'Aceitação'] },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperanca', related_numero: 14, path_type: 'tree_path', spiritual_meaning: ['Transformação e equilíbrio', 'Dissolução', 'Renascer'] },
  { arcano: 'A Temperanca', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: ['Harmonia e sombras', 'Integração', 'Confronto'] },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: ['Prisão e libertação', 'Reconhecimento', 'Quebrar correntes'] },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'sequential', spiritual_meaning: ['Destruição e esperança', 'Libertação', 'Reconstrução'] },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: ['Esperança e teste', 'Alinhamento', 'Orientação'] },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'tree_path', spiritual_meaning: ['Ilusão e verdade', 'Dissipar', 'Clareza'] },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: ['Verdade e despertar', 'Ressurreição', 'Renascimento'] },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'tree_path', spiritual_meaning: ['Chamado e completude', 'Renascimento', 'Resposta'] },
  // Sequential paths - journey connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: ['Ciclo completo', 'Integração', 'Recomeçar'] },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Estrela', related_numero: 17, path_type: 'sequential', spiritual_meaning: ['Morte e esperança', 'Transformação', 'Renascer'] },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: ['Noite e dia', 'Ilusão e verdade', 'Clareza'] },
  // Complementary paths
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Estrela', related_numero: 17, path_type: 'complementary', spiritual_meaning: ['Energia e esperança', 'Liberdade', 'Inspiração'] },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Louco', related_numero: 0, path_type: 'complementary', spiritual_meaning: ['Retorno ao início', 'Ciclo eterno', 'Novo começo'] },
  // Ancestral paths
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Louco', related_numero: 0, path_type: 'ancestral', spiritual_meaning: ['Renascimento', 'Transformação completa', 'Ciclo ancestral'] },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Morte', related_numero: 13, path_type: 'ancestral', spiritual_meaning: ['Fertilidade e morte', 'Transformação', 'Aceitar ciclo'] },
];

export const TAROT_TAROT_MAPPINGS = MAPPINGS;
export const TOTAL_MAPPINGS = MAPPINGS.length;

function getAllPathTypesSet(): TarotPathType[] {
  const types = new Set<TarotPathType>();
  MAPPINGS.forEach(m => types.add(m.path_type));
  return Array.from(types);
}

export function getTarotTarot(arcano1: string, arcano2?: string): TarotTarotMapping | null {
  const n = (s: string) => s.trim().toLowerCase();
  
  if (arcano2) {
    // Find specific relationship between two arcanos
    return MAPPINGS.find(
      m => (n(m.arcano) === n(arcano1) && n(m.related_arcano) === n(arcano2)) ||
           (n(m.arcano) === n(arcano2) && n(m.related_arcano) === n(arcano1))
    ) || null;
  }
  
  // Return first relationship for arcano
  return MAPPINGS.find(m => n(m.arcano) === n(arcano1)) || null;
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
  return Array.from(arcanoSet);
}

export function getAllArcanoRelations(arcano: string): TarotTarotMapping[] {
  const n = (s: string) => s.trim().toLowerCase();
  return MAPPINGS.filter(
    m => n(m.arcano) === n(arcano) || n(m.related_arcano) === n(arcano)
  );
}

export function getRelationsByPathType(path_type: TarotPathType): TarotTarotMapping[] {
  return MAPPINGS.filter((mapping) => mapping.path_type === path_type);
}

export function getPathsByType(path_type: TarotPathType): TarotTarotMapping[] {
  return getRelationsByPathType(path_type);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const n = (s: string) => s.trim().toLowerCase();
  const mapping = MAPPINGS.find(
    m => (n(m.arcano) === n(arcano1) && n(m.related_arcano) === n(arcano2)) ||
         (n(m.arcano) === n(arcano2) && n(m.related_arcano) === n(arcano1))
  );
  return mapping?.path_type ?? null;
}

export function getSpiritualMeaningBetween(
  arcano1: string,
  arcano2: string,
): TarotTarotMapping['spiritual_meaning'] | null {
  const n = (s: string) => s.trim().toLowerCase();
  const mapping = MAPPINGS.find(
    m => (n(m.arcano) === n(arcano1) && n(m.related_arcano) === n(arcano2)) ||
         (n(m.arcano) === n(arcano2) && n(m.related_arcano) === n(arcano1))
  );
  return mapping?.spiritual_meaning ?? null;
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  const n = (s: string) => s.trim().toLowerCase();
  return MAPPINGS.some(
    m => (n(m.arcano) === n(arcano1) && n(m.related_arcano) === n(arcano2)) ||
         (n(m.arcano) === n(arcano2) && n(m.related_arcano) === n(arcano1))
  );
}

export function hasTarotTarot(arcano1: string, arcano2: string): boolean {
  return hasRelation(arcano1, arcano2);
}

export function getArcanoByNumber(numero: number): string | null {
  const mapping = MAPPINGS.find((m) => m.numero_carta === numero);
  return mapping?.arcano ?? null;
}

export function getRelationsByNumber(numero: number): TarotTarotMapping[] {
  return MAPPINGS.filter(
    m => m.numero_carta === numero || m.related_numero === numero
  );
}

export const TOTAL_PATH_TYPES = getAllPathTypesSet().length;

export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getAllArcanoRelations,
  getRelationsByPathType,
  getPathsByType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  hasTarotTarot,
  getArcanoByNumber,
  getRelationsByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
};
