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
export const TOTAL_MAPPINGS = 68;

const TAROT_TAROT_MAP: readonly TarotTarotMapping[] = [
  // Sequência - Journey progression
  { arcano: '0 - O Louco', related_arcano: 'I - O Mago', path_type: 'Sequência', spiritual_meaning: { significado: 'Início da jornada', crescimento: 'Despertar da consciência', desafio: 'Superar medos e incertezas' } },
  { arcano: 'I - O Mago', related_arcano: 'II - A Sacerdotisa', path_type: 'Sequência', spiritual_meaning: { significado: 'Manifestação e mistério', crescimento: 'Desenvolver poderes', desafio: 'Equilibrar forças opostas' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'III - A Imperatriz', path_type: 'Sequência', spiritual_meaning: { significado: 'Intuição e fertilidade', crescimento: 'Conectar-se à sabedoria interior', desafio: 'Confiar no processo' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'IV - O Imperador', path_type: 'Sequência', spiritual_meaning: { significado: 'Abundância e ordem', crescimento: 'Manifestar abundancia', desafio: 'Equilibrar criação e controle' } },
  { arcano: 'IV - O Imperador', related_arcano: 'V - O Hierofante', path_type: 'Sequência', spiritual_meaning: { significado: 'Autoridade e tradição', crescimento: 'Encontrar autoridade interior', desafio: 'Aceitar orientação' } },
  { arcano: 'V - O Hierofante', related_arcano: 'VI - Os Enamorados', path_type: 'Sequência', spiritual_meaning: { significado: 'Tradição e escolha', crescimento: 'Escolher com sabedoria', desafio: 'Equilibrar coração e razão' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'VII - O Carro', path_type: 'Sequência', spiritual_meaning: { significado: 'Amor e conquista', crescimento: 'Avançar com propósito', desafio: 'Manter direção' } },
  { arcano: 'VII - O Carro', related_arcano: 'VIII - A Justiça', path_type: 'Sequência', spiritual_meaning: { significado: 'Conquista e verdade', crescimento: 'Vencer com integridade', desafio: 'Equilibrar opostos' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'IX - O Eremita', path_type: 'Sequência', spiritual_meaning: { significado: 'Verdade e sabedoria', crescimento: 'Buscar iluminação', desafio: 'Ver além da aparência' } },
  { arcano: 'IX - O Eremita', related_arcano: 'X - A Roda da Fortuna', path_type: 'Sequência', spiritual_meaning: { significado: 'Sabedoria e destino', crescimento: 'Aceitar ciclos', desafio: 'Confiar no processo' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XI - A Força', path_type: 'Sequência', spiritual_meaning: { significado: 'Destino e coragem', crescimento: 'Dominar instintos', desafio: 'Equilibrar luz e sombra' } },
  { arcano: 'XI - A Força', related_arcano: 'XII - O Enforcado', path_type: 'Sequência', spiritual_meaning: { significado: 'Coragem e sacrifício', crescimento: 'Sacrificar ego', desafio: 'Aceitar nova perspectiva' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XIII - A Morte', path_type: 'Sequência', spiritual_meaning: { significado: 'Sacrifício e transformação', crescimento: 'Aceitar mudança', desafio: 'Largar o passado' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIV - A Temperança', path_type: 'Sequência', spiritual_meaning: { significado: 'Transformação e equilíbrio', crescimento: 'Integrar opostos', desafio: 'Equilibrar extremos' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XV - O Diabo', path_type: 'Sequência', spiritual_meaning: { significado: 'Equilíbrio e tentação', crescimento: 'Reconhecer armadilhas', desafio: 'Libertar-se de prisões' } },
  { arcano: 'XV - O Diabo', related_arcano: 'XVI - A Torre', path_type: 'Sequência', spiritual_meaning: { significado: 'Tentação e libertação', crescimento: 'Quebrar correntes', desafio: 'Abandonar ilusões' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XVII - A Estrela', path_type: 'Sequência', spiritual_meaning: { significado: 'Destruição e esperança', crescimento: 'Renovar-se', desafio: 'Encontrar esperança' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XVIII - A Lua', path_type: 'Sequência', spiritual_meaning: { significado: 'Esperança e ilusão', crescimento: 'Discernir realidade', desafio: 'Confiar na intuição' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XIX - O Sol', path_type: 'Sequência', spiritual_meaning: { significado: 'Ilusão e clareza', crescimento: 'Discernir verdade', desafio: 'Superar medos' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XX - O Julgamento', path_type: 'Sequência', spiritual_meaning: { significado: 'Clareza e despertar', crescimento: 'Celebrar vitórias', desafio: 'Perdoar passado' } },
  { arcano: 'XX - O Julgamento', related_arcano: 'XXI - O Mundo', path_type: 'Sequência', spiritual_meaning: { significado: 'Despertar e integração', crescimento: 'Integrar lições', desafio: 'Aceitar completude' } },

  // Trino - 120 degree aspects
  { arcano: '0 - O Louco', related_arcano: 'X - A Roda da Fortuna', path_type: 'Trino', spiritual_meaning: { significado: 'Liberdade e destino', crescimento: 'Aceitar ciclos', desafio: 'Fluir com mudanças' } },
  { arcano: 'I - O Mago', related_arcano: 'V - O Hierofante', path_type: 'Trino', spiritual_meaning: { significado: 'Manifestação e tradição', crescimento: 'Conectar mente e espírito', desafio: 'Integrar saber ancestral' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'X - A Roda da Fortuna', path_type: 'Trino', spiritual_meaning: { significado: 'Mistério e ciclos', crescimento: 'Aceitar destino', desafio: 'Confiar no invisível' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'VII - O Carro', path_type: 'Trino', spiritual_meaning: { significado: 'Criação e conquista', crescimento: 'Manifestar abundancia', desafio: 'Direcionar energia criativa' } },
  { arcano: 'IV - O Imperador', related_arcano: 'VIII - A Justiça', path_type: 'Trino', spiritual_meaning: { significado: 'Ordem e verdade', crescimento: 'Governar com justiça', desafio: 'Equilibrar força e razão' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XII - O Enforcado', path_type: 'Trino', spiritual_meaning: { significado: 'Amor e sacrifício', crescimento: 'Entregar-se ao amor', desafio: 'Aceitar entrega' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XVII - A Estrela', path_type: 'Trino', spiritual_meaning: { significado: 'Busca e esperança', crescimento: 'Iluminar caminho', desafio: 'Compartilhar sabedoria' } },
  { arcano: 'XI - A Força', related_arcano: 'XIX - O Sol', path_type: 'Trino', spiritual_meaning: { significado: 'Força e vitória', crescimento: 'Radiar coragem', desafio: 'Aceitar brilho próprio' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XXI - O Mundo', path_type: 'Trino', spiritual_meaning: { significado: 'Transformação e realização', crescimento: 'Renovar-se completamente', desafio: 'Aceitar fim do ciclo' } },

  // Sextil - 60 degree aspects
  { arcano: '0 - O Louco', related_arcano: 'III - A Imperatriz', path_type: 'Sextil', spiritual_meaning: { significado: 'Inocência e fertilidade', crescimento: 'Abrir-se para vida', desafio: 'Usar energia com sabedoria' } },
  { arcano: 'I - O Mago', related_arcano: 'VI - Os Enamorados', path_type: 'Sextil', spiritual_meaning: { significado: 'Manifestação e união', crescimento: 'Expressar criatividade', desafio: 'Integrar opposites' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'VII - O Carro', path_type: 'Sextil', spiritual_meaning: { significado: 'Intuição e ação', crescimento: 'Agir com wisdom', desafio: 'Equilibrar ser e fazer' } },
  { arcano: 'IV - O Imperador', related_arcano: 'X - A Roda da Fortuna', path_type: 'Sextil', spiritual_meaning: { significado: 'Estrutura e mudança', crescimento: 'Adaptar-se a ciclos', desafio: 'Flexibilizar controle' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XI - A Força', path_type: 'Sextil', spiritual_meaning: { significado: 'Ensinamento e força', crescimento: 'Dominar paixões', desafio: 'Guiar com gentileza' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'XIV - A Temperança', path_type: 'Sextil', spiritual_meaning: { significado: 'Verdade e harmonia', crescimento: 'Buscar equilíbrio', desafio: 'Aplicar justiça com compaixão' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XVIII - A Lua', path_type: 'Sextil', spiritual_meaning: { significado: 'Entrega e intuição', crescimento: 'Confiar no processo', desafio: 'Aceitar incertezas' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XIX - O Sol', path_type: 'Sextil', spiritual_meaning: { significado: 'Transformação e alegria', crescimento: 'Renovar-se com graça', desafio: 'Aceitar vitória' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XX - O Julgamento', path_type: 'Sextil', spiritual_meaning: { significado: 'Destruição e renovação', crescimento: 'Renovar crenças', desafio: 'Aceitar ruptura' } },

  // Quadratura - 90 degree challenges
  { arcano: '0 - O Louco', related_arcano: 'VI - Os Enamorados', path_type: 'Quadratura', spiritual_meaning: { significado: 'Liberdade vs união', crescimento: 'Escolher autenticamente', desafio: 'Equilibrar independentes e conexão' } },
  { arcano: 'I - O Mago', related_arcano: 'IV - O Imperador', path_type: 'Quadratura', spiritual_meaning: { significado: 'Vontade vs ordem', crescimento: 'Canalizar poder', desafio: 'Respeitar limites' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'V - O Hierofante', path_type: 'Quadratura', spiritual_meaning: { significado: 'Mistério vs tradição', crescimento: 'Integrar sabedoria oculta', desafio: 'Revelar segredos' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'XII - O Enforcado', path_type: 'Quadratura', spiritual_meaning: { significado: 'Criação vs sacrifício', crescimento: 'Transformar energia criativa', desafio: 'Soltar apegos' } },
  { arcano: 'VII - O Carro', related_arcano: 'XI - A Força', path_type: 'Quadratura', spiritual_meaning: { significado: 'Conquista vs força interior', crescimento: 'Dominar ação', desafio: 'Integrar volontà e paz' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'XVI - A Torre', path_type: 'Quadratura', spiritual_meaning: { significado: 'Verdade vs revelação', crescimento: 'Desvendar mentiras', desafio: 'Aceitar mudanças rápidas' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XIII - A Morte', path_type: 'Quadratura', spiritual_meaning: { significado: 'Busca vs transformação', crescimento: 'Mergulhar no unknown', desafio: 'Aceitar morte do ego' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XIV - A Temperança', path_type: 'Quadratura', spiritual_meaning: { significado: 'Destino vs harmonia', crescimento: 'Aceitar ciclos', desafio: 'Equilibrar forças opostas' } },

  // Complementar - duality
  { arcano: '0 - O Louco', related_arcano: 'XIX - O Sol', path_type: 'Complementar', spiritual_meaning: { significado: 'Liberdade e alegria', crescimento: 'Celebrar vida', desafio: 'Integrar espontaneidade e propósito' } },
  { arcano: 'I - O Mago', related_arcano: 'X - A Roda da Fortuna', path_type: 'Complementar', spiritual_meaning: { significado: 'Poder e destino', crescimento: 'Manifestar com propósito', desafio: 'Aceitar incertezas do destino' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'XVII - A Estrela', path_type: 'Complementar', spiritual_meaning: { significado: 'Mistério e esperança', crescimento: 'Iluminar sombras', desafio: 'Confiar no processo' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'XI - A Força', path_type: 'Complementar', spiritual_meaning: { significado: 'Criação e coragem', crescimento: 'Expressar poder criativo', desafio: 'Dominar impulsos' } },
  { arcano: 'IV - O Imperador', related_arcano: 'VIII - A Justiça', path_type: 'Complementar', spiritual_meaning: { significado: 'Autoridade e verdade', crescimento: 'Governar com justiça', desafio: 'Aplicar leis com equidade' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XVI - A Torre', path_type: 'Complementar', spiritual_meaning: { significado: 'Tradição e mudança', crescimento: 'Questionar autoridade', desafio: 'Aceitar destruição criativa' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XIII - A Morte', path_type: 'Complementar', spiritual_meaning: { significado: 'Amor e transformação', crescimento: 'Amar verdadeiramente', desafio: 'Aceitar mudanças no relacionamento' } },
  { arcano: 'VII - O Carro', related_arcano: 'IX - O Eremita', path_type: 'Complementar', spiritual_meaning: { significado: 'Ação e reflexão', crescimento: 'Integrar Doing and being', desafio: 'Equilibrar mundo exterior e interior' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'XX - O Julgamento', path_type: 'Complementar', spiritual_meaning: { significado: 'Verdade e redenção', crescimento: 'Julgarse com compaixão', desafio: 'Perdoar-se e aos outros' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XXI - O Mundo', path_type: 'Complementar', spiritual_meaning: { significado: 'Destino e realização', crescimento: 'Cumprir propósito', desafio: 'Aceitar completude' } },

  // Ancestral - karmic connections
  { arcano: '0 - O Louco', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Início e fim', crescimento: 'Completar ciclos', desafio: 'Aceitar retorno ao início' } },
  { arcano: 'I - O Mago', related_arcano: 'XVI - A Torre', path_type: 'Ancestral', spiritual_meaning: { significado: 'Poder e revelação', crescimento: 'Despertar para verdade', desafio: 'Aceitar destruição do ego' } },
  { arcano: 'II - A Sacerdotisa', related_arcano: 'XV - O Diabo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Mistério e sombra', crescimento: 'Confrontar medos', desafio: 'Integrar aspect shadow' } },
  { arcano: 'III - A Imperatriz', related_arcano: 'X - A Roda da Fortuna', path_type: 'Ancestral', spiritual_meaning: { significado: 'Criação e destino', crescimento: 'Aceitar ciclos', desafio: 'Confiar no processo' } },
  { arcano: 'IV - O Imperador', related_arcano: 'IX - O Eremita', path_type: 'Ancestral', spiritual_meaning: { significado: 'Estrutura e busca', crescimento: 'Questionar autoridade', desafio: 'Encontrar wisdom interior' } },
  { arcano: 'V - O Hierofante', related_arcano: 'XIII - A Morte', path_type: 'Ancestral', spiritual_meaning: { significado: 'Tradição e renovação', crescimento: 'Renovar crenças', desafio: 'Aceitar transformação' } },
  { arcano: 'VI - Os Enamorados', related_arcano: 'XIV - A Temperança', path_type: 'Ancestral', spiritual_meaning: { significado: 'Escolha e harmonia', crescimento: 'Equilibrar desejos', desafio: 'Encontrar meio termo' } },
  { arcano: 'VII - O Carro', related_arcano: 'XIII - A Morte', path_type: 'Ancestral', spiritual_meaning: { significado: 'Vitória e fim', crescimento: 'Aceitar conclusões', desafio: 'Saber quando parar' } },
  { arcano: 'VIII - A Justiça', related_arcano: 'XII - O Enforcado', path_type: 'Ancestral', spiritual_meaning: { significado: 'Verdade e sacrifício', crescimento: 'Assumir responsabilidade', desafio: 'Aceitar consequences' } },
  { arcano: 'IX - O Eremita', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Busca e realização', crescimento: 'Alcançar wholeness', desafio: 'Integrar todas as lições' } },
  { arcano: 'X - A Roda da Fortuna', related_arcano: 'XII - O Enforcado', path_type: 'Ancestral', spiritual_meaning: { significado: 'Destino e entrega', crescimento: 'Aceitar karma', desafio: 'Soltar need for control' } },
  { arcano: 'XI - A Força', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Força e integração', crescimento: 'Alcançar mastery', desafio: 'Integrar todas as lições' } },
  { arcano: 'XII - O Enforcado', related_arcano: 'XX - O Julgamento', path_type: 'Ancestral', spiritual_meaning: { significado: 'Sacrifício e redenção', crescimento: 'Renovar-se', desafio: 'Aceitar julgamento final' } },
  { arcano: 'XIII - A Morte', related_arcano: 'XVII - A Estrela', path_type: 'Ancestral', spiritual_meaning: { significado: 'Transformação e esperança', crescimento: 'Renovar esperança', desafio: 'Confiar no novo começo' } },
  { arcano: 'XIV - A Temperança', related_arcano: 'XV - O Diabo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Harmonia e tentação', crescimento: 'Discernir truth', desafio: 'Resistir a atrações' } },
  { arcano: 'XVI - A Torre', related_arcano: 'XIX - O Sol', path_type: 'Ancestral', spiritual_meaning: { significado: 'Destruição e clareza', crescimento: 'Verdade revelada', desafio: 'Aceitar truth' } },
  { arcano: 'XVII - A Estrela', related_arcano: 'XIX - O Sol', path_type: 'Ancestral', spiritual_meaning: { significado: 'Esperança e vitória', crescimento: 'Brilhar plenamente', desafio: 'Aceitar reconhecimento' } },
  { arcano: 'XVIII - A Lua', related_arcano: 'XX - O Julgamento', path_type: 'Ancestral', spiritual_meaning: { significado: 'Ilusão e verdade', crescimento: 'Discernir reality', desafio: 'Desvendar enganos' } },
  { arcano: 'XIX - O Sol', related_arcano: 'XXI - O Mundo', path_type: 'Ancestral', spiritual_meaning: { significado: 'Vitória e realização', crescimento: 'Completar jornada', desafio: 'Aceitar completude' } },
];

export const TAROT_TAROT_MAPPINGS = TAROT_TAROT_MAP;

// Helper functions
export function getTarotTarot(arcano: string, relatedArcano: string): TarotTarotMapping | null {
  const a1 = arcano.trim().toLowerCase();
  const a2 = relatedArcano.trim().toLowerCase();
  return TAROT_TAROT_MAP.find((m) => m.arcano.toLowerCase() === a1 && m.related_arcano.toLowerCase() === a2) || null;
}

export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAP.map((m) => m.path_type)));
}

export function getAllMappedArcanos(): string[] {
  return Array.from(new Set(TAROT_TAROT_MAP.flatMap((m) => [m.arcano, m.related_arcano])));
}

export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  const a = arcano.trim().toLowerCase();
  return TAROT_TAROT_MAP.filter((m) => m.arcano.toLowerCase() === a || m.related_arcano.toLowerCase() === a);
}

export function getRelationsByPathType(type: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const result = getTarotTarot(arcano1, arcano2);
  return result ? result.path_type : null;
}

export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): TarotTarotMapping['spiritual_meaning'] | null {
  const result = getTarotTarot(arcano1, arcano2);
  return result ? result.spiritual_meaning : null;
}

export function hasRelation(arcano1: string, arcano2: string): boolean {
  return getTarotTarot(arcano1, arcano2) !== null;
}

export function getArcanoByNumber(numero: number): string | null {
  if (numero < 0 || numero > 21) return null;
  return ALL_MAJOR_ARCANOS[numero] || null;
}

export default {
  getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos,
  getRelationsForArcano, getRelationsByPathType, getPathTypeBetween,
  getSpiritualMeaningBetween, hasRelation, getArcanoByNumber,
  ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES,
};
