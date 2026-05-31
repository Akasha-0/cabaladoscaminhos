/**
 * Tarot-Tarot Correlation Module
 * Maps spiritual relationships between Major Arcana cards
 */

export type TarotPathType = 'Trino' | 'Sextil' | 'Quadratura' | 'Oposicao' | 'Sequencia' | 'Complementar' | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  arcano_numero: number;
  arcano_romano: string;
  related_arcano: string;
  related_numero: number;
  related_romano: string;
  path_type: TarotPathType;
  significado: string;
  crescimento: string;
  desafio: string;
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justica', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Forca',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperanca', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = [
  { arcano: '0 - O Louco', arcano_numero: 0, arcano_romano: '0', related_arcano: 'I - O Mago', related_numero: 1, related_romano: 'I', path_type: 'Sequencia', significado: 'Iniciacao', crescimento: 'Despertar', desafio: 'Confiar' },
  { arcano: '0 - O Louco', arcano_numero: 0, arcano_romano: '0', related_arcano: 'X - A Roda da Fortuna', related_numero: 10, related_romano: 'X', path_type: 'Complementar', significado: 'Destino', crescimento: 'Aceitar', desafio: 'Fluir' },
  { arcano: '0 - O Louco', arcano_numero: 0, arcano_romano: '0', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Ancestral', significado: 'Completude', crescimento: 'Integrar', desafio: 'Renovar' },
  { arcano: 'I - O Mago', arcano_numero: 1, arcano_romano: 'I', related_arcano: 'II - A Sacerdotisa', related_numero: 2, related_romano: 'II', path_type: 'Sequencia', significado: 'Poder', crescimento: 'Canalizar', desafio: 'Focar' },
  { arcano: 'I - O Mago', arcano_numero: 1, arcano_romano: 'I', related_arcano: 'XI - A Forca', related_numero: 11, related_romano: 'XI', path_type: 'Trino', significado: 'Vontade', crescimento: 'Transformar', desafio: 'Responsabilidade' },
  { arcano: 'I - O Mago', arcano_numero: 1, arcano_romano: 'I', related_arcano: 'XVI - A Torre', related_numero: 16, related_romano: 'XVI', path_type: 'Oposicao', significado: 'Construcao', crescimento: 'Liberacao', desafio: 'Aceitar' },
  { arcano: 'II - A Sacerdotisa', arcano_numero: 2, arcano_romano: 'II', related_arcano: 'III - A Imperatriz', related_numero: 3, related_romano: 'III', path_type: 'Sequencia', significado: 'Mistério', crescimento: 'Aplicar', desafio: 'Integrar' },
  { arcano: 'II - A Sacerdotisa', arcano_numero: 2, arcano_romano: 'II', related_arcano: 'IX - O Eremita', related_numero: 9, related_romano: 'IX', path_type: 'Trino', significado: 'Sabedoria', crescimento: 'Aprofundar', desafio: 'Equilibrar' },
  { arcano: 'II - A Sacerdotisa', arcano_numero: 2, arcano_romano: 'II', related_arcano: 'XVIII - A Lua', related_numero: 18, related_romano: 'XVIII', path_type: 'Oposicao', significado: 'Verdade', crescimento: 'Discernir', desafio: 'Ilusao' },
  { arcano: 'III - A Imperatriz', arcano_numero: 3, arcano_romano: 'III', related_arcano: 'IV - O Imperador', related_numero: 4, related_romano: 'IV', path_type: 'Sequencia', significado: 'Criacao', crescimento: 'Integrar', desafio: 'Disciplina' },
  { arcano: 'III - A Imperatriz', arcano_numero: 3, arcano_romano: 'III', related_arcano: 'VII - O Carro', related_numero: 7, related_romano: 'VII', path_type: 'Sextil', significado: 'Nutricao', crescimento: 'Discernimento', desafio: 'Dependencia' },
  { arcano: 'III - A Imperatriz', arcano_numero: 3, arcano_romano: 'III', related_arcano: 'XVII - A Estrela', related_numero: 17, related_romano: 'XVII', path_type: 'Trino', significado: 'Fertilidade', crescimento: 'Esperanca', desafio: 'Tempo' },
  { arcano: 'IV - O Imperador', arcano_numero: 4, arcano_romano: 'IV', related_arcano: 'V - O Hierofante', related_numero: 5, related_romano: 'V', path_type: 'Sequencia', significado: 'Estrutura', crescimento: 'Ordem', desafio: 'Flexibilidade' },
  { arcano: 'IV - O Imperador', arcano_numero: 4, arcano_romano: 'IV', related_arcano: 'VIII - A Justica', related_numero: 8, related_romano: 'VIII', path_type: 'Sequencia', significado: 'Autoridade', crescimento: 'Justica', desafio: 'Rigor' },
  { arcano: 'IV - O Imperador', arcano_numero: 4, arcano_romano: 'IV', related_arcano: 'X - A Roda da Fortuna', related_numero: 10, related_romano: 'X', path_type: 'Quadratura', significado: 'Dominio', crescimento: 'Adaptacao', desafio: 'Controle' },
  { arcano: 'V - O Hierofante', arcano_numero: 5, arcano_romano: 'V', related_arcano: 'VI - Os Enamorados', related_numero: 6, related_romano: 'VI', path_type: 'Sequencia', significado: 'Tradição', crescimento: 'Transmissao', desafio: 'Dogma' },
  { arcano: 'V - O Hierofante', arcano_numero: 5, arcano_romano: 'V', related_arcano: 'VIII - A Justica', related_numero: 8, related_romano: 'VIII', path_type: 'Trino', significado: 'Doutrina', crescimento: 'Ensinamento', desafio: 'Abertura' },
  { arcano: 'V - O Hierofante', arcano_numero: 5, arcano_romano: 'V', related_arcano: 'X - A Roda da Fortuna', related_numero: 10, related_romano: 'X', path_type: 'Sextil', significado: 'Sabedoria', crescimento: 'Tradicao', desafio: 'Renovacao' },
  { arcano: 'VI - Os Enamorados', arcano_numero: 6, arcano_romano: 'VI', related_arcano: 'VII - O Carro', related_numero: 7, related_romano: 'VII', path_type: 'Sequencia', significado: 'Escolha', crescimento: 'Uniao', desafio: 'Compromisso' },
  { arcano: 'VI - Os Enamorados', arcano_numero: 6, arcano_romano: 'VI', related_arcano: 'XIV - A Temperanca', related_numero: 14, related_romano: 'XIV', path_type: 'Sextil', significado: 'Amor', crescimento: 'Harmonia', desafio: 'Tensao' },
  { arcano: 'VI - Os Enamorados', arcano_numero: 6, arcano_romano: 'VI', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Complementar', significado: 'Decisao', crescimento: 'Avaliacao', desafio: 'Conflito' },
  { arcano: 'VII - O Carro', arcano_numero: 7, arcano_romano: 'VII', related_arcano: 'VIII - A Justica', related_numero: 8, related_romano: 'VIII', path_type: 'Sequencia', significado: 'Vitoria', crescimento: 'Conquista', desafio: 'Arrogancia' },
  { arcano: 'VII - O Carro', arcano_numero: 7, arcano_romano: 'VII', related_arcano: 'XVI - A Torre', related_numero: 16, related_romano: 'XVI', path_type: 'Oposicao', significado: 'Determinacao', crescimento: 'Triunfo', desafio: 'Queda' },
  { arcano: 'VII - O Carro', arcano_numero: 7, arcano_romano: 'VII', related_arcano: 'XIX - O Sol', related_numero: 19, related_romano: 'XIX', path_type: 'Trino', significado: 'Sucesso', crescimento: 'Celebracao', desafio: 'Superficialidade' },
  { arcano: 'VIII - A Justica', arcano_numero: 8, arcano_romano: 'VIII', related_arcano: 'IX - O Eremita', related_numero: 9, related_romano: 'IX', path_type: 'Sequencia', significado: 'Equilibrio', crescimento: 'Retificacao', desafio: 'Rigor' },
  { arcano: 'VIII - A Justica', arcano_numero: 8, arcano_romano: 'VIII', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Sequencia', significado: 'Lei', crescimento: 'Consciencia', desafio: 'Culpa' },
  { arcano: 'VIII - A Justica', arcano_numero: 8, arcano_romano: 'VIII', related_arcano: 'X - A Roda da Fortuna', related_numero: 10, related_romano: 'X', path_type: 'Quadratura', significado: 'Verdade', crescimento: 'Honestidade', desafio: 'Imparcialidade' },
  { arcano: 'IX - O Eremita', arcano_numero: 9, arcano_romano: 'IX', related_arcano: 'X - A Roda da Fortuna', related_numero: 10, related_romano: 'X', path_type: 'Sequencia', significado: 'Iluminacao', crescimento: 'Busca', desafio: 'Isolamento' },
  { arcano: 'IX - O Eremita', arcano_numero: 9, arcano_romano: 'IX', related_arcano: 'XIX - O Sol', related_numero: 19, related_romano: 'XIX', path_type: 'Sequencia', significado: 'Sabedoria', crescimento: 'Guia', desafio: 'Superioridade' },
  { arcano: 'IX - O Eremita', arcano_numero: 9, arcano_romano: 'IX', related_arcano: 'XVII - A Estrela', related_numero: 17, related_romano: 'XVII', path_type: 'Sextil', significado: 'Reflexao', crescimento: 'Introspeccao', desafio: 'Melancolia' },
  { arcano: 'X - A Roda da Fortuna', arcano_numero: 10, arcano_romano: 'X', related_arcano: 'XI - A Forca', related_numero: 11, related_romano: 'XI', path_type: 'Sequencia', significado: 'Ciclos', crescimento: 'Adaptacao', desafio: 'Resignacao' },
  { arcano: 'X - A Roda da Fortuna', arcano_numero: 10, arcano_romano: 'X', related_arcano: 'XV - O Diabo', related_numero: 15, related_romano: 'XV', path_type: 'Oposicao', significado: 'Destino', crescimento: 'Transformacao', desafio: 'Prisao' },
  { arcano: 'X - A Roda da Fortuna', arcano_numero: 10, arcano_romano: 'X', related_arcano: 'XVIII - A Lua', related_numero: 18, related_romano: 'XVIII', path_type: 'Sextil', significado: 'Karma', crescimento: 'Evolucao', desafio: 'Confusao' },
  { arcano: 'XI - A Forca', arcano_numero: 11, arcano_romano: 'XI', related_arcano: 'XII - O Enforcado', related_numero: 12, related_romano: 'XII', path_type: 'Sequencia', significado: 'Coragem', crescimento: 'Transcendencia', desafio: 'Fragilidade' },
  { arcano: 'XI - A Forca', arcano_numero: 11, arcano_romano: 'XI', related_arcano: 'XV - O Diabo', related_numero: 15, related_romano: 'XV', path_type: 'Oposicao', significado: 'Poder', crescimento: 'Dominio', desafio: 'Dependencia' },
  { arcano: 'XI - A Forca', arcano_numero: 11, arcano_romano: 'XI', related_arcano: 'XIV - A Temperanca', related_numero: 14, related_romano: 'XIV', path_type: 'Trino', significado: 'Bravura', crescimento: 'Moderao', desafio: 'Intemperanca' },
  { arcano: 'XII - O Enforcado', arcano_numero: 12, arcano_romano: 'XII', related_arcano: 'XIII - A Morte', related_numero: 13, related_romano: 'XIII', path_type: 'Sequencia', significado: 'Sacrificio', crescimento: 'Entrega', desafio: 'Revolta' },
  { arcano: 'XII - O Enforcado', arcano_numero: 12, arcano_romano: 'XII', related_arcano: 'XVI - A Torre', related_numero: 16, related_romano: 'XVI', path_type: 'Oposicao', significado: 'Perspectiva', crescimento: 'Desapego', desafio: 'Impotencia' },
  { arcano: 'XII - O Enforcado', arcano_numero: 12, arcano_romano: 'XII', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Complementar', significado: 'Renuncia', crescimento: 'Despertar', desafio: 'Confusao' },
  { arcano: 'XIII - A Morte', arcano_numero: 13, arcano_romano: 'XIII', related_arcano: 'XIV - A Temperanca', related_numero: 14, related_romano: 'XIV', path_type: 'Sequencia', significado: 'Transformacao', crescimento: 'Renascimento', desafio: 'Medo' },
  { arcano: 'XIII - A Morte', arcano_numero: 13, arcano_romano: 'XIII', related_arcano: 'XVI - A Torre', related_numero: 16, related_romano: 'XVI', path_type: 'Sextil', significado: 'Fim', crescimento: 'Liberacao', desafio: 'Trauma' },
  { arcano: 'XIII - A Morte', arcano_numero: 13, arcano_romano: 'XIII', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Trino', significado: 'Metamorphose', crescimento: 'Ressurreicao', desafio: 'Aversao' },
  { arcano: 'XIV - A Temperanca', arcano_numero: 14, arcano_romano: 'XIV', related_arcano: 'XV - O Diabo', related_numero: 15, related_romano: 'XV', path_type: 'Sequencia', significado: 'Equilibrio', crescimento: 'Integracao', desafio: 'Extremao' },
  { arcano: 'XIV - A Temperanca', arcano_numero: 14, arcano_romano: 'XIV', related_arcano: 'XVII - A Estrela', related_numero: 17, related_romano: 'XVII', path_type: 'Sequencia', significado: 'Harmonia', crescimento: 'Alquimia', desafio: 'Insipidez' },
  { arcano: 'XIV - A Temperanca', arcano_numero: 14, arcano_romano: 'XIV', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Sextil', significado: 'Moderacao', crescimento: 'Sintese', desafio: 'Conflito' },
  { arcano: 'XV - O Diabo', arcano_numero: 15, arcano_romano: 'XV', related_arcano: 'XVI - A Torre', related_numero: 16, related_romano: 'XVI', path_type: 'Sequencia', significado: 'Prisao', crescimento: 'Libertacao', desafio: 'Tentacao' },
  { arcano: 'XV - O Diabo', arcano_numero: 15, arcano_romano: 'XV', related_arcano: '0 - O Louco', related_numero: 0, related_romano: '0', path_type: 'Oposicao', significado: 'Sombra', crescimento: 'Reconhecimento', desafio: 'Projeccao' },
  { arcano: 'XV - O Diabo', arcano_numero: 15, arcano_romano: 'XV', related_arcano: 'XVII - A Estrela', related_numero: 17, related_romano: 'XVII', path_type: 'Quadratura', significado: 'Ilusao', crescimento: 'Superacao', desafio: 'Dependencia' },
  { arcano: 'XVI - A Torre', arcano_numero: 16, arcano_romano: 'XVI', related_arcano: 'XVII - A Estrela', related_numero: 17, related_romano: 'XVII', path_type: 'Sequencia', significado: 'Revelacao', crescimento: 'Desconstrucao', desafio: 'Trauma' },
  { arcano: 'XVI - A Torre', arcano_numero: 16, arcano_romano: 'XVI', related_arcano: 'XIX - O Sol', related_numero: 19, related_romano: 'XIX', path_type: 'Sequencia', significado: 'Catastrofe', crescimento: 'Restauracao', desafio: 'Desespero' },
  { arcano: 'XVI - A Torre', arcano_numero: 16, arcano_romano: 'XVI', related_arcano: 'XVIII - A Lua', related_numero: 18, related_romano: 'XVIII', path_type: 'Sextil', significado: 'Desconstrucao', crescimento: 'Liberacao', desafio: 'Confusao' },
  { arcano: 'XVII - A Estrela', arcano_numero: 17, arcano_romano: 'XVII', related_arcano: 'XVIII - A Lua', related_numero: 18, related_romano: 'XVIII', path_type: 'Sequencia', significado: 'Esperanca', crescimento: 'Renovacao', desafio: 'Duvida' },
  { arcano: 'XVII - A Estrela', arcano_numero: 17, arcano_romano: 'XVII', related_arcano: 'XIX - O Sol', related_numero: 19, related_romano: 'XIX', path_type: 'Sequencia', significado: 'Luz', crescimento: 'Inspiracao', desafio: 'Expectativa' },
  { arcano: 'XVII - A Estrela', arcano_numero: 17, arcano_romano: 'XVII', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Sextil', significado: 'Fluidez', crescimento: ' Confianca', desafio: 'Impaciencia' },
  { arcano: 'XVIII - A Lua', arcano_numero: 18, arcano_romano: 'XVIII', related_arcano: 'XIX - O Sol', related_numero: 19, related_romano: 'XIX', path_type: 'Sequencia', significado: 'Ilusao', crescimento: 'Claridade', desafio: 'Medo' },
  { arcano: 'XVIII - A Lua', arcano_numero: 18, arcano_romano: 'XVIII', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Sequencia', significado: 'Inconsciente', crescimento: 'Despertar', desafio: 'Ilusao' },
  { arcano: 'XVIII - A Lua', arcano_numero: 18, arcano_romano: 'XVIII', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Quadratura', significado: 'Mundo Interior', crescimento: 'Integração', desafio: ' fragmentacao' },
  { arcano: 'XIX - O Sol', arcano_numero: 19, arcano_romano: 'XIX', related_arcano: 'XX - O Julgamento', related_numero: 20, related_romano: 'XX', path_type: 'Sequencia', significado: 'Clareza', crescimento: 'Vitalidade', desafio: 'Egoismo' },
  { arcano: 'XIX - O Sol', arcano_numero: 19, arcano_romano: 'XIX', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Sequencia', significado: 'Alegria', crescimento: 'Sucesso', desafio: 'Arrogancia' },
  { arcano: 'XIX - O Sol', arcano_numero: 19, arcano_romano: 'XIX', related_arcano: '0 - O Louco', related_numero: 0, related_romano: '0', path_type: 'Sextil', significado: 'Luz', crescimento: 'Integracao', desafio: 'Superficialidade' },
  { arcano: 'XX - O Julgamento', arcano_numero: 20, arcano_romano: 'XX', related_arcano: 'XXI - O Mundo', related_numero: 21, related_romano: 'XXI', path_type: 'Sequencia', significado: 'Despertar', crescimento: 'Ressurreicao', desafio: 'Juizo' },
  { arcano: 'XX - O Julgamento', arcano_numero: 20, arcano_romano: 'XX', related_arcano: '0 - O Louco', related_numero: 0, related_romano: '0', path_type: 'Quadratura', significado: 'Chamado', crescimento: 'Renovacao', desafio: 'Comparacao' },
  { arcano: 'XX - O Julgamento', arcano_numero: 20, arcano_romano: 'XX', related_arcano: 'V - O Hierofante', related_numero: 5, related_romano: 'V', path_type: 'Sextil', significado: 'Evaluacao', crescimento: 'Responsabilidade', desafio: 'Condenacao' },
  { arcano: 'XXI - O Mundo', arcano_numero: 21, arcano_romano: 'XXI', related_arcano: '0 - O Louco', related_numero: 0, related_romano: '0', path_type: 'Ancestral', significado: 'Completude', crescimento: 'Integracao', desafio: 'Estagnacao' },
  { arcano: 'XXI - O Mundo', arcano_numero: 21, arcano_romano: 'XXI', related_arcano: 'III - A Imperatriz', related_numero: 3, related_romano: 'III', path_type: 'Sextil', significado: 'Realizacao', crescimento: 'Fertilidade', desafio: 'Satisfacao' },
  { arcano: 'XXI - O Mundo', arcano_numero: 21, arcano_romano: 'XXI', related_arcano: 'I - O Mago', related_numero: 1, related_romano: 'I', path_type: 'Sextil', significado: 'Dance', crescimento: 'Manifestacao', desafio: 'Complacencia' },
];

export const TOTAL_MAPPINGS = TAROT_TAROT_MAPPINGS.length;
export const TOTAL_PATH_TYPES = 7;

export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAPPINGS.map(m => m.path_type)));
}

export function getAllMappedArcanos(): string[] {
  const arcanos = new Set<string>();
  TAROT_TAROT_MAPPINGS.forEach(m => {
    arcanos.add(m.arcano);
    arcanos.add(m.related_arcano);
  });
  return Array.from(arcanos);
}

export function getRelationsForArcano(arcano: string): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.arcano === arcano || m.related_arcano === arcano);
}

export function getRelationsByPathType(pathType: TarotPathType): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS.filter(m => m.path_type === pathType);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    m => (m.arcano === arcano1 && m.related_arcano === arcano2) || (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  return mapping?.path_type ?? null;
}

export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): { significado: string; crescimento: string; desafio: string } | null {
  const mapping = TAROT_TAROT_MAPPINGS.find(
    m => (m.arcano === arcano1 && m.related_arcano === arcano2) || (m.arcano === arcano2 && m.related_arcano === arcano1)
  );
  if (!mapping) return null;
  return { significado: mapping.significado, crescimento: mapping.crescimento, desafio: mapping.desafio };
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  return getPathTypeBetween(arcano1, arcano2) !== null;
}

export function getArcanoByNumber(numero: number): string | null {
  return ALL_MAJOR_ARCANOS[numero] || null;
}

export default {
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
