/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps pairs of Tarot Major Arcana cards for cross-reference and spiritual correlation.
 * Source: Cabala dos Caminhos spiritual system
 */

/**
 * Represents the correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source card name in Portuguese */
  carta_origem: string;
  /** Card number in the Major Arcana (0-21) */
  numero_origem: number;
  /** Target card name in Portuguese */
  carta_destino: string;
  /** Target card number in the Major Arcana (0-21) */
  numero_destino: number;
  /** Type of correlation between the cards */
  tipo_correlacao: 'complementar' | 'contrastante' | 'sequencial' | 'kármico' | 'harmônico';
  /** Description of how these cards relate spiritually */
  descricao_correlacao: string;
}

/**
 * Complete mapping of Tarot Major Arcana card pairs for spiritual correlation.
 * Each pair represents a meaningful relationship within the Tarot system.
 */
export const TAROT_TAROT_MAP: Record<string, TarotTarotMapping> = {
  'O Louco-O Mago': {
    carta_origem: 'O Louco',
    numero_origem: 0,
    carta_destino: 'O Mago',
    numero_destino: 1,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Louco representa o potencial puro e a disposicao para iniciar a jornada; o Mago canaliza essa energia em ação concreta. Juntos representam o despertar da consciência e o início da manifestação espiritual.',
  },
  'O Mago-A Imperatriz': {
    carta_origem: 'O Mago',
    numero_origem: 1,
    carta_destino: 'A Imperatriz',
    numero_destino: 3,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Mago manifesta a vontade; a Imperatriz traz a fertilidade e a abundancia. O Mago abre portas, a Imperatriz nutre o que nasce. Representam a união entre poder criativo e sua materialização.',
  },
  'A Imperatriz-O Imperador': {
    carta_origem: 'A Imperatriz',
    numero_origem: 3,
    carta_destino: 'O Imperador',
    numero_destino: 4,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'A Imperatriz representa a criatividade fertil e o principio feminino; o Imperador traz a estrutura e o principio masculino. Juntos equilibram a fertilidade com a organização para criar ordem do caos.',
  },
  'O Imperador-O Hierofante': {
    carta_origem: 'O Imperador',
    numero_origem: 4,
    carta_destino: 'O Hierofante',
    numero_destino: 5,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Imperador governa o mundo material; o Hierofante revela o mundo espiritual. A transição do poder secular para o sagrado representa a busca por significado transcendente.',
  },
  'Os Enamorados-A Justiça': {
    carta_origem: 'Os Enamorados',
    numero_origem: 6,
    carta_destino: 'A Justiça',
    numero_destino: 11,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'A escolha emocional dos Enamorados amadurece em discernimento com a Justiça. O amor inicial evolui para decisões baseadas em equidade e responsabilidade.',
  },
  'O Carro-A Força': {
    carta_origem: 'O Carro',
    numero_origem: 7,
    carta_destino: 'A Força',
    numero_destino: 8,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Carro representa conquista através da vontade; a Força representa conquista através da compaixão. A força bruta cede lugar à força interior do autocontrole e da coragem suave.',
  },
  'O Eremita-A Roda da Fortuna': {
    carta_origem: 'O Eremita',
    numero_origem: 9,
    carta_destino: 'A Roda da Fortuna',
    numero_destino: 10,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Eremita busca sabedoria no isolamento; a Roda revela que essa sabedoria deve ser aplicada no mundo dinâmico. A iluminação interior encontra expressão no destino cíclico.',
  },
  'A Morte-O Diabo': {
    carta_origem: 'A Morte',
    numero_origem: 13,
    carta_destino: 'O Diabo',
    numero_destino: 15,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'A Morte transforma; o Diabo revela o que foi criado após a transformação. A morte simbólica liberta; o Diabo mostra as prisões que ainda prendem o evoluir.',
  },
  'O Diabo-A Torre': {
    carta_origem: 'O Diabo',
    numero_origem: 15,
    carta_destino: 'A Torre',
    numero_destino: 16,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Diabo mantém em grilhões; a Torre quebra correntes. A libertação vem através da destruição catártica das estruturas que aprisionam.',
  },
  'A Torre-As Estrelas': {
    carta_origem: 'A Torre',
    numero_origem: 16,
    carta_destino: 'As Estrelas',
    numero_destino: 17,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'A queda da Torre traz desespero; as Estrelas restauram esperança. A destruição necessária abre caminho para renovação e clareza celestial.',
  },
  'O Sol-O Julgamento': {
    carta_origem: 'O Sol',
    numero_origem: 19,
    carta_destino: 'O Julgamento',
    numero_destino: 20,
    tipo_correlacao: 'sequencial',
    descricao_correlacao: 'O Sol ilumina a individualidade; o Julgamento traz a ressurreição do self verdadeiro. A luz solar desperta a consciência para a chamada da alma.',
  },
  'O Mago-O Louco': {
    carta_origem: 'O Mago',
    numero_origem: 1,
    carta_destino: 'O Louco',
    numero_destino: 0,
    tipo_correlacao: 'harmônico',
    descricao_correlacao: 'O Mago representa habilidade e recursos; o Louco representa liberdade e abandono. Juntos equilibram competência com abertura ao inexplicável, sabedoria com inocência.',
  },
  'A Imperadora-A Sacerdotisa': {
    carta_origem: 'A Imperatriz',
    numero_origem: 3,
    carta_destino: 'A Sacerdotisa',
    numero_destino: 2,
    tipo_correlacao: 'harmônico',
    descricao_correlacao: 'A Imperatriz manifesta; a Sacerdotisa revela mistérios. A abundancia exterior reflete sabedoria interior. Dualidade sagrada do principio feminino em suas manifestações.',
  },
  'A Lua-O Sol': {
    carta_origem: 'A Lua',
    numero_origem: 18,
    carta_destino: 'O Sol',
    numero_destino: 19,
    tipo_correlacao: 'contrastante',
    descricao_correlacao: 'A Lua revela ilusões e o inconsciente; o Sol traz clareza e consciência desperta. A jornada da Lua através do escuro prepara o espírito para a luz solar.',
  },
  'A Morte-O Eremita': {
    carta_origem: 'A Morte',
    numero_origem: 13,
    carta_destino: 'O Eremita',
    numero_destino: 9,
    tipo_correlacao: 'contrastante',
    descricao_correlacao: 'A Morte transforma através de rompimento; o Eremita transforma através de introspecção. A transformação externa encontra correspondência na transformação interna.',
  },
  'O Imperador-A Justiça': {
    carta_origem: 'O Imperador',
    numero_origem: 4,
    carta_destino: 'A Justiça',
    numero_destino: 11,
    tipo_correlacao: 'contrastante',
    descricao_correlacao: 'O Imperador governa com autoridade; a Justiça governa com equidade. A passagem do poder pessoal para o poder divino do equilíbrio.',
  },
  'O Diabo-A Temperança': {
    carta_origem: 'O Diabo',
    numero_origem: 15,
    carta_destino: 'A Temperança',
    numero_destino: 14,
    tipo_correlacao: 'contrastante',
    descricao_correlacao: 'O Diabo representa prisões e vícios; a Temperança representa equilíbrio e cura. A天桥 entre dependência e liberdade através da moderação.',
  },
  'Os Enamorados-O Carro': {
    carta_origem: 'Os Enamorados',
    numero_origem: 6,
    carta_destino: 'O Carro',
    numero_destino: 7,
    tipo_correlacao: 'complementar',
    descricao_correlacao: 'A escolha dos Enamorados requer a determinação do Carro para ser realizada. O amor como força motivadora encontra expressão na conquista.',
  },
  'A Sacerdotisa-A Alta Sacerdotisa': {
    carta_origem: 'A Sacerdotisa',
    numero_origem: 2,
    carta_destino: 'A Alta Sacerdotisa',
    numero_destino: 2,
    tipo_correlacao: 'complementar',
    descricao_correlacao: 'Ambas representam o principio oculto e a sabedoria divina. A Sacerdotisa busca; a Alta Sacerdotisa revela. Mistério e revelação em unidade.',
  },
  'O Hierofante-O Eremita': {
    carta_origem: 'O Hierofante',
    numero_origem: 5,
    carta_destino: 'O Eremita',
    numero_destino: 9,
    tipo_correlacao: 'complementar',
    descricao_correlacao: 'O Hierofante ensina tradição; o Eremita busca sabedoria sozinho. A instrução formal encontra a iluminação interior em perfeita harmonia.',
  },
  'A Torre-O Mundo': {
    carta_origem: 'A Torre',
    numero_origem: 16,
    carta_destino: 'O Mundo',
    numero_destino: 21,
    tipo_correlacao: 'kármico',
    descricao_correlacao: 'A queda da Torre rompe ilusões; o Mundo representa a realização do Ciclo. A destruição necessária prepara o caminho para a completude.',
  },
  'A Morte-O Julgamento': {
    carta_origem: 'A Morte',
    numero_origem: 13,
    carta_destino: 'O Julgamento',
    numero_destino: 20,
    tipo_correlacao: 'kármico',
    descricao_correlacao: 'A morte simbólica prepara a ressurreição do Julgamento. A transformação interior culmina na chamada da alma para renascimento.',
  },
  'A Roda da Fortuna-O Destino': {
    carta_origem: 'A Roda da Fortuna',
    numero_origem: 10,
    carta_destino: 'O Destino',
    numero_destino: 10,
    tipo_correlacao: 'kármico',
    descricao_correlacao: 'A Roda representa o ciclo do destino; o próprio destino como força motriz do universo. Girar e ser girado pelo karma cósmico.',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(TAROT_TAROT_MAP);
Object.values(TAROT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All Major Arcana card numbers (0-21)
 */
export const TODOS_ARCANOS_NUMEROS: readonly number[] = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);

/**
 * All Major Arcana card names
 */
export const TODOS_ARCANOS_NOMES: readonly string[] = Object.freeze([
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna', 'A Justiça',
  'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo', 'A Torre', 'A Estrela',
  'A Lua', 'O Sol', 'O Julgamento', 'O Mundo',
]);

/**
 * Normalizes card name for consistent lookup.
 */
function normalizarCarta(carta: string): string {
  const mapa: Record<string, string> = {
    'o louco': 'O Louco', 'louco': 'O Louco',
    'o mago': 'O Mago', 'mago': 'O Mago',
    'a sacerdotisa': 'A Sacerdotisa', 'sacerdotisa': 'A Sacerdotisa',
    'a imperatriz': 'A Imperatriz', 'imperatriz': 'A Imperatriz',
    'o imperador': 'O Imperador', 'imperador': 'O Imperador',
    'o hierofante': 'O Hierofante', 'hierofante': 'O Hierofante',
    'os enamorados': 'Os Enamorados', 'enamorados': 'Os Enamorados',
    'o carro': 'O Carro', 'carro': 'O Carro',
    'a força': 'A Força', 'força': 'A Força', 'forca': 'A Força',
    'o eremita': 'O Eremita', 'eremita': 'O Eremita',
    'a roda da fortuna': 'A Roda da Fortuna', 'roda da fortuna': 'A Roda da Fortuna', 'roda': 'A Roda da Fortuna',
    'a justiça': 'A Justiça', 'justiça': 'A Justiça', 'justica': 'A Justiça',
    'o enforcado': 'O Enforcado', 'enforcado': 'O Enforcado',
    'a morte': 'A Morte', 'morte': 'A Morte',
    'a temperança': 'A Temperança', 'temperança': 'A Temperança', 'temperanca': 'A Temperança',
    'o diabo': 'O Diabo', 'diabo': 'O Diabo',
    'a torre': 'A Torre', 'torre': 'A Torre',
    'a estrela': 'A Estrela', 'estrela': 'A Estrela', 'as estrelas': 'As Estrelas', 'estrelas': 'As Estrelas',
    'a lua': 'A Lua', 'lua': 'A Lua',
    'o sol': 'O Sol', 'sol': 'O Sol',
    'o julgamento': 'O Julgamento', 'julgamento': 'O Julgamento',
    'o mundo': 'O Mundo', 'mundo': 'O Mundo',
  };
  return mapa[carta.toLowerCase().trim()] ?? carta;
}

/**
 * Creates a lookup key from two card names
 */
function criarChave(carta1: string, carta2: string): string {
  const c1 = normalizarCarta(carta1);
  const c2 = normalizarCarta(carta2);
  return `${c1}-${c2}`;
}

/**
 * Get the tarot-tarot mapping between two cards.
 * @param carta1 - First card name
 * @param carta2 - Second card name
 * @returns TarotTarotMapping or null if not found
 */
export function getTarotTarot(carta1: string, carta2: string): TarotTarotMapping | null {
  const chave = criarChave(carta1, carta2);
  return TAROT_TAROT_MAP[chave] ?? null;
}

/**
 * Get all mappings for a specific card.
 * @param carta - Card name to search
 * @returns Array of TarotTarotMapping objects involving this card
 */
export function getCorrelacoesDaCarta(carta: string): TarotTarotMapping[] {
  const cartaNormalizada = normalizarCarta(carta);
  return Object.values(TAROT_TAROT_MAP).filter(
    (m) => m.carta_origem === cartaNormalizada || m.carta_destino === cartaNormalizada
  );
}

/**
 * Get all mappings of a specific type.
 * @param tipo - Correlation type ('complementar' | 'contrastante' | 'sequencial' | 'kármico' | 'harmônico')
 * @returns Array of TarotTarotMapping objects of the specified type
 */
export function getCorrelacoesPorTipo(tipo: string): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).filter((m) => m.tipo_correlacao === tipo);
}

/**
 * Get all tarot-tarot mappings.
 * @returns Array of all TarotTarotMapping objects
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP);
}

/**
 * Get card number from card name.
 * @param carta - Card name
 * @returns Card number (0-21) or null if not found
 */
export function getNumeroCarta(carta: string): number | null {
  const mapaNumeros: Record<string, number> = {
    'O Louco': 0, 'O Mago': 1, 'A Sacerdotisa': 2, 'A Imperatriz': 3,
    'O Imperador': 4, 'O Hierofante': 5, 'Os Enamorados': 6, 'O Carro': 7,
    'A Força': 8, 'O Eremita': 9, 'A Roda da Fortuna': 10, 'A Justiça': 11,
    'O Enforcado': 12, 'A Morte': 13, 'A Temperança': 14, 'O Diabo': 15,
    'A Torre': 16, 'As Estrelas': 17, 'A Lua': 18, 'O Sol': 19,
    'O Julgamento': 20, 'O Mundo': 21,
  };
  return mapaNumeros[normalizarCarta(carta)] ?? null;
}

/**
 * Get card name from card number.
 * @param numero - Card number (0-21)
 * @returns Card name or null if not found
 */
export function getNomeCarta(numero: number): string | null {
  const mapaNomes: Record<number, string> = {
    0: 'O Louco', 1: 'O Mago', 2: 'A Sacerdotisa', 3: 'A Imperatriz',
    4: 'O Imperador', 5: 'O Hierofante', 6: 'Os Enamorados', 7: 'O Carro',
    8: 'A Força', 9: 'O Eremita', 10: 'A Roda da Fortuna', 11: 'A Justiça',
    12: 'O Enforcado', 13: 'A Morte', 14: 'A Temperança', 15: 'O Diabo',
    16: 'A Torre', 17: 'As Estrelas', 18: 'A Lua', 19: 'O Sol',
    20: 'O Julgamento', 21: 'O Mundo',
  };
  return mapaNomes[numero] ?? null;
}

/**
 * Check if two cards have a correlation mapping.
 * @param carta1 - First card name
 * @param carta2 - Second card name
 * @returns True if correlation exists
 */
export function hasCorrelacao(carta1: string, carta2: string): boolean {
  return getTarotTarot(carta1, carta2) !== null;
}

/**
 * Get the description of the correlation between two cards.
 * @param carta1 - First card name
 * @param carta2 - Second card name
 * @returns Description or null if no correlation exists
 */
export function getDescricaoCorrelacao(carta1: string, carta2: string): string | null {
  return getTarotTarot(carta1, carta2)?.descricao_correlacao ?? null;
}

/**
 * Get correlation type between two cards.
 * @param carta1 - First card name
 * @param carta2 - Second card name
 * @returns Correlation type or null if no correlation exists
 */
export function getTipoCorrelacao(carta1: string, carta2: string): string | null {
  return getTarotTarot(carta1, carta2)?.tipo_correlacao ?? null;
}

export default {
  getTarotTarot,
  getCorrelacoesDaCarta,
  getCorrelacoesPorTipo,
  getAllTarotTarots,
  getNumeroCarta,
  getNomeCarta,
  hasCorrelacao,
  getDescricaoCorrelacao,
  getTipoCorrelacao,
  TAROT_TAROT_MAP,
  TODOS_ARCANOS_NUMEROS,
  TODOS_ARCANOS_NOMES,
};