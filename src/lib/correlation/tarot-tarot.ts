/**
 * Tarot-Tarot Correlation Module
 * Maps spiritual relationships between Major Arcana cards based on Kabbalistic Tree of Life paths
 */

export type PathType = 'tree_path' | 'elemental' | 'numerological' | 'archetypal' | 'sequential';

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: PathType;
  spiritual_meaning: string;
  energy_flow: 'bidirectional';
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justica', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A Forca',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperanca', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES = 5;

export const TOTAL_MAPPINGS = 39;

const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'tree_path', spiritual_meaning: 'O Louco inicia a jornada espiritual enquanto O Mago manifesta a vontade criativa.', energy_flow: 'bidirectional' },
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'O Louco e o Mundo completam o ciclo eterno.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'tree_path', spiritual_meaning: 'O Mago domina ferramentas externas enquanto A Sacerdotisa guarda misterios internos.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'elemental', spiritual_meaning: 'O Mago representa vontade individual enquanto O Hierofante transmite tradicao coletiva.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Justica', related_numero: 8, path_type: 'numerological', spiritual_meaning: 'O Mago inicia manifestacao enquanto A Justica traz equilibrio.', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'tree_path', spiritual_meaning: 'A Sacerdotisa guarda conhecimento silencioso enquanto A Imperatriz manifesta a vida.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'archetypal', spiritual_meaning: 'A Imperatriz representa principio feminino enquanto O Imperador governa com estrutura masculina.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'A Imperatriz e mae fertilizante enquanto A Estrela traz esperança renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Morte', related_numero: 13, path_type: 'elemental', spiritual_meaning: 'A Imperatriz cria vida enquanto A Morte transforma.', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'tree_path', spiritual_meaning: 'O Imperador governa com lei externa enquanto O Hierofante transmite sabedoria interna.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'tree_path', spiritual_meaning: 'O Hierofante representa tradicao espiritual enquanto Os Enamorados revelam escolha do coracao.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'O Hierofante guarda tradicao sagrada enquanto A Estrela traz esperança renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'tree_path', spiritual_meaning: 'Os Enamorados enfrentam escolha entre caminhos enquanto O Carro conquista atraves da vontade.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justica', related_numero: 8, path_type: 'tree_path', spiritual_meaning: 'O Carro representa conquista atraves da vontade enquanto A Justica traz equilibrio e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'O Sol', related_numero: 19, path_type: 'archetypal', spiritual_meaning: 'O Carro conquista com determinacao enquanto O Sol brilha com alegria.', energy_flow: 'bidirectional' },
  { arcano: 'A Justica', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: 'A Justica traz verdade exterior enquanto O Eremita busca sabedoria interior.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'tree_path', spiritual_meaning: 'O Eremita busca iluminacao solitaria enquanto A Roda da Fortuna revela ciclos do destino.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'O Eremita segura luz da sabedoria enquanto A Lua ilumina o inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'O Sol', related_numero: 19, path_type: 'elemental', spiritual_meaning: 'O Eremita busca luz na solidao enquanto O Sol e fonte de toda luz.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Forca', related_numero: 11, path_type: 'tree_path', spiritual_meaning: 'A Roda da Fortuna governa ciclos do destino enquanto A Forca doma instintos.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'A Roda governa destino enquanto A Lua governa inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'tree_path', spiritual_meaning: 'A Forca doma o leao com coragem enquanto O Enforcado sacrifica com sabedoria.', energy_flow: 'bidirectional' },
  { arcano: 'A Forca', numero_carta: 11, related_arcano: 'O Louco', related_numero: 0, path_type: 'tree_path', spiritual_meaning: 'A Forca doma instintos com coragem enquanto O Louco entrega-se ao destino.', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Torre', related_numero: 16, path_type: 'sequential', spiritual_meaning: 'O Enforcado realiza sacrificio voluntario enquanto A Torre traz destruicao forcada.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Esperanca', related_numero: 14, path_type: 'sequential', spiritual_meaning: 'A Morte representa fim e transformacao enquanto A Esperanca traz renovacao.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Temperanca', related_numero: 14, path_type: 'elemental', spiritual_meaning: 'A Morte traz transformacao enquanto O Temperanca busca equilibrio.', energy_flow: 'bidirectional' },
  { arcano: 'A Esperanca', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: 'A Esperanca busca equilibrio divino enquanto O Diabo personifica tentacao terrena.', energy_flow: 'bidirectional' },
  { arcano: 'A Esperanca', numero_carta: 14, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'A Esperanca busca equilibrio enquanto O Julgamento desperta para avaliacao.', energy_flow: 'bidirectional' },
  { arcano: 'O Temperanca', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: 'O Temperanca busca harmonia entre extremos enquanto O Diabo representa extremismo material.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: 'O Diabo representa tentacao e escravidao enquanto A Torre traz libertacao atraves de destruicao.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'O Louco', related_numero: 0, path_type: 'archetypal', spiritual_meaning: 'O Diabo representa tentacao terrena enquanto O Louco busca liberdade espiritual.', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'sequential', spiritual_meaning: 'A Torre traz destruicao subita enquanto A Estrela traz esperança renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'A Estrela traz esperança clara enquanto A Lua revela ilusoes.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'A Estrela traz esperança renovadora enquanto O Julgamento traz desperto final.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'sequential', spiritual_meaning: 'A Lua revela ilusoes e medos enquanto O Sol traz claridade e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: 'A Lua revela o inconsciente e ilusoes enquanto O Julgamento traz renovacao atraves de despertar.', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'O Sol traz alegria e claridade enquanto O Julgamento traz despertar e renovacao.', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'O Julgamento desperta para renovacao espiritual enquanto O Mundo representa integracao completa.', energy_flow: 'bidirectional' },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'O Louco', related_numero: 0, path_type: 'sequential', spiritual_meaning: 'O Mundo completa o ciclo enquanto O Louco inicia o proximo.', energy_flow: 'bidirectional' },
];

Object.freeze(TAROT_TAROT_MAP);
TAROT_TAROT_MAP.forEach((m) => Object.freeze(m));

export const TAROT_TAROT_MAPPINGS = TAROT_TAROT_MAP;

export function getTarotTarot(arcano: string): TarotTarotMapping[] {
  const n = arcano.trim().toLowerCase();
  return TAROT_TAROT_MAP.filter((m) => m.arcano.toLowerCase() === n || m.related_arcano.toLowerCase() === n);
}

export function getAllTarotPaths(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

export function getAllArcanoRelations(arcano: string): TarotTarotMapping[] {
  return getTarotTarot(arcano);
}

export function getPathsByType(type: PathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

export function getAllPathTypes(): PathType[] {
  return Array.from(new Set(TAROT_TAROT_MAP.map((m) => m.path_type)));
}

export function hasTarotTarot(arcano1: string, arcano2: string): boolean {
  const n1 = arcano1.trim().toLowerCase();
  const n2 = arcano2.trim().toLowerCase();
  return TAROT_TAROT_MAP.some(
    (m) => (m.arcano.toLowerCase() === n1 && m.related_arcano.toLowerCase() === n2) ||
           (m.arcano.toLowerCase() === n2 && m.related_arcano.toLowerCase() === n1)
  );
}

export function getRelationsByNumber(numero: number): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.numero_carta === numero || m.related_numero === numero);
}

export function getAllMappedArcanos(): string[] {
  const set = new Set<string>();
  TAROT_TAROT_MAP.forEach((m) => { set.add(m.arcano); set.add(m.related_arcano); });
  return Array.from(set);
}

export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  return getTarotTarot(arcano);
}

export function getRelationsByPathType(type: PathType): TarotTarotMapping[] {
  return getPathsByType(type);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): PathType | null {
  const n1 = arcano1.trim().toLowerCase();
  const n2 = arcano2.trim().toLowerCase();
  const mapping = TAROT_TAROT_MAP.find(
    (m) => (m.arcano.toLowerCase() === n1 && m.related_arcano.toLowerCase() === n2) ||
           (m.arcano.toLowerCase() === n2 && m.related_arcano.toLowerCase() === n1)
  );
  return mapping ? mapping.path_type : null;
}

export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): string | null {
  const n1 = arcano1.trim().toLowerCase();
  const n2 = arcano2.trim().toLowerCase();
  const mapping = TAROT_TAROT_MAP.find(
    (m) => (m.arcano.toLowerCase() === n1 && m.related_arcano.toLowerCase() === n2) ||
           (m.arcano.toLowerCase() === n2 && m.related_arcano.toLowerCase() === n1)
  );
  return mapping ? mapping.spiritual_meaning : null;
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  return hasTarotTarot(arcano1, arcano2);
}

export function getArcanoByNumber(numero: number): string | null {
  if (numero < 0 || numero > 21) return null;
  return ALL_MAJOR_ARCANOS[numero] || null;
}

export default {
  getTarotTarot, getAllTarotPaths, getAllArcanoRelations, getPathsByType,
  getAllPathTypes, hasTarotTarot, getRelationsByNumber, getAllMappedArcanos,
  getRelationsForArcano, getRelationsByPathType, getPathTypeBetween,
  getSpiritualMeaningBetween, hasRelation, getArcanoByNumber,
  ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES,
};
