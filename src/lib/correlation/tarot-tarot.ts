/**
 * Tarot-Tarot Major Arcana Self-Correlation Module
 * Maps Tarot Major Arcana cards to themselves and to related cards based on
 * elemental, sequential, and symbolic correspondences within the Major Arcana.
 * Based on the Cabala dos Caminhos spiritual system.
 */

/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Tarot Major Arcana card and related cards
 */
export interface TarotTarotMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** Elemental association */
  elemento: Elemento;
  /** Cards that precede this one in the Fool's Journey */
  predecessores?: string[];
  /** Cards that follow this one in the Fool's Journey */
  sucessores?: string[];
  /** Cards with the same element */
  mesmo_elemento?: string[];
  /** Cards with complementary energy */
  complementares?: string[];
  /** Thematic keywords */
  palavras_chave: string[];
  /** Full spiritual meaning */
  significado_espiritual: string;
  /** Archetype represented by this arcano */
  arquétipo: string;
}

// ─── Tarot Major Arcana Self-Correlation Mapping ─────────────────────────────────

/**
 * Complete mapping of Major Arcana (0-21) to their self-correlations.
 * Each card maps to itself and related cards based on the Fool's Journey,
 * elemental correspondences, and symbolic relationships.
 */
export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping> = {
  0: {
    arcano: 'O Louco',
    numero_carta: 0,
    elemento: 'Ar',
    predecessores: [],
    sucessores: ['O Mago'],
    mesmo_elemento: ['O Mago', 'Os Enamorados', 'A Justiça', 'A Estrela', 'O Julgamento'],
    complementares: ['O Mundo'],
    palavras_chave: ['Liberdade', 'Início', 'Aventura', 'Fe', 'Espontaneidade', 'Pura potencialidade'],
    significado_espiritual: 'O início selvagem da jornada espiritual. A liberdade absoluta que transcende todas as regras. O salto de fé que abraça o desconhecido. Representa o potencial puro, a espontaneidade sagrada e a confiança no universo.',
    arquétipo: 'O Aventureiro / O Inocente',
  },
  1: {
    arcano: 'A Sacerdotisa',
    numero_carta: 1,
    elemento: 'Água',
    predecessores: ['O Louco'],
    sucessores: ['A Imperatriz'],
    mesmo_elemento: ['A Lua', 'O Carro', 'A Morte', 'O Enforcado'],
    complementares: ['O Mago'],
    palavras_chave: ['Intuição', 'Mistério', 'Véu', 'Sabedoria oculta', 'Lua', 'Feminino sagrado'],
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio. O véu entre os mundos visível e invisível. A receptividade sagrada que recebe sem julgamento. Representa o discernimento profundo e a conexão com os mistérios.',
    arquétipo: 'A Guardiã dos Mistérios / A Sacerdotisa',
  },
  2: {
    arcano: 'A Imperatriz',
    numero_carta: 2,
    elemento: 'Terra',
    predecessores: ['A Sacerdotisa'],
    sucessores: ['O Imperador'],
    mesmo_elemento: ['O Imperador', 'O Eremita', 'A Roda da Fortuna', 'O Diabo', 'O Mundo'],
    complementares: ['O Hierofante'],
    palavras_chave: ['Fertilidade', 'Abundância', 'Natureza', 'Criação', 'Mãe divina', 'Beleza'],
    significado_espiritual: 'A fertilidade criativa em todas as suas formas. A abundância natural que flui da conexão com a natureza. A expressão artística e a beleza sagrada. Representa a criação, o nurturing e a manifestação da abundância.',
    arquétipo: 'A Mãe Divina / A Criadora',
  },
  3: {
    arcano: 'O Imperador',
    numero_carta: 3,
    elemento: 'Fogo',
    predecessores: ['A Imperatriz'],
    sucessores: ['O Hierofante'],
    mesmo_elemento: ['O Hierofante', 'A Torre', 'A Temperança', 'O Sol', 'O Julgamento'],
    complementares: ['A Imperatriz'],
    palavras_chave: ['Autoridade', 'Estrutura', 'Disciplina', 'Poder', 'Ordem', 'Liderança'],
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos. A disciplina e a estrutura que sustentam a realização. O princípio patriarcal que cria fronteiras e leis. Representa o poder de autodisciplina e a liderança baseada em princípios.',
    arquétipo: 'O Pai / O Governante',
  },
  4: {
    arcano: 'O Hierofante',
    numero_carta: 4,
    elemento: 'Fogo',
    predecessores: ['O Imperador'],
    sucessores: ['Os Enamorados'],
    mesmo_elemento: ['O Imperador', 'A Torre', 'A Temperança', 'O Sol', 'O Julgamento'],
    complementares: ['A Imperatriz'],
    palavras_chave: ['Tradição', 'Espiritualidade', 'Iniciação', 'Mestre', 'Doutrina', 'Sagrado'],
    significado_espiritual: 'O mestre espiritual e a tradição sagrada. A ponte entre o conhecimento humano e divino. Os sacramentos que conectam com o transcendente. Representa a busca por significado e a educação espiritual.',
    arquétipo: 'O Sacerdote / O Mestre Espiritual',
  },
  5: {
    arcano: 'Os Enamorados',
    numero_carta: 5,
    elemento: 'Ar',
    predecessores: ['O Hierofante'],
    sucessores: ['O Carro'],
    mesmo_elemento: ['O Louco', 'A Sacerdotisa', 'A Justiça', 'A Estrela', 'O Julgamento'],
    complementares: ['A Torre'],
    palavras_chave: ['Amor', 'Escolha', 'União', 'Harmonia', 'Decisão', 'Corações'],
    significado_espiritual: 'A união das polaridades e a escolha do coração. O amor que transcende o eu individual. A harmonia entre mente, corpo e espírito. Representa o amor em todas as suas expressões e a integração das sombras.',
    arquétipo: 'O Amante / A União Sagrada',
  },
  6: {
    arcano: 'O Carro',
    numero_carta: 6,
    elemento: 'Água',
    predecessores: ['Os Enamorados'],
    sucessores: ['A Justiça'],
    mesmo_elemento: ['A Sacerdotisa', 'A Lua', 'A Morte', 'O Enforcado'],
    complementares: ['O Eremita'],
    palavras_chave: ['Vitória', 'Determinação', 'Vontade', 'Conquista', 'Equilíbrio', 'Ação'],
    significado_espiritual: 'A vitória conquistada através da vontade focada e do equilíbrio das forças opostas. A determinação que supera todos os obstáculos. Representa o triumpho sobre os desafios e a jornada em direção a um objetivo claro.',
    arquétipo: 'O Guerreiro / O Vitorioso',
  },
  7: {
    arcano: 'A Justiça',
    numero_carta: 7,
    elemento: 'Ar',
    predecessores: ['O Carro'],
    sucessores: ['O Eremita'],
    mesmo_elemento: ['O Louco', 'A Sacerdotisa', 'Os Enamorados', 'A Estrela', 'O Julgamento'],
    complementares: ['O Diabo'],
    palavras_chave: ['Justiça', 'Verdade', 'Lei cósmica', 'Equilíbrio', 'Karma', 'Integridade'],
    significado_espiritual: 'A lei cósmica de causa e efeito. O equilíbrio karma que governa todas as ações. A verdade que se manifesta inevitavelmente. Representa a integridade e a responsabilidade por nossas escolhas.',
    arquétipo: 'O Juiz Cósmico / A Justiça',
  },
  8: {
    arcano: 'O Eremita',
    numero_carta: 8,
    elemento: 'Terra',
    predecessores: ['A Justiça'],
    sucessores: ['A Roda da Fortuna'],
    mesmo_elemento: ['A Imperatriz', 'O Imperador', 'A Roda da Fortuna', 'O Diabo', 'O Mundo'],
    complementares: ['O Carro'],
    palavras_chave: ['Sabedoria', 'Iluminação', 'Solitude', 'Introspecção', 'Guia interior', 'Luz'],
    significado_espiritual: 'A sabedoria conquistada na solidão sagrada. A luz interior que brilha para o mundo. A iluminação que vem da introspecção profunda. Representa a busca da verdade e o retiro necessário para o autoconhecimento.',
    arquétipo: 'O Sábio / O Iluminado',
  },
  9: {
    arcano: 'A Roda da Fortuna',
    numero_carta: 9,
    elemento: 'Fogo',
    predecessores: ['O Eremita'],
    sucessores: ['A Força'],
    mesmo_elemento: ['O Imperador', 'O Hierofante', 'A Torre', 'A Temperança', 'O Sol', 'O Julgamento'],
    complementares: ['A Torre'],
    palavras_chave: ['Destino', 'Ciclos', 'Transformação', 'Sorte', 'Mudança', 'Roda'],
    significado_espiritual: 'O ciclo eterno do destino girando entre ascensão e queda. A lei de ação e reação cósmica. O momento perfeito onde todas as forças se alinham. Representa a transformação e a oportunidade que surge do caos.',
    arquétipo: 'A Roda / O Destino em Movimento',
  },
  10: {
    arcano: 'A Força',
    numero_carta: 10,
    elemento: 'Terra',
    predecessores: ['A Roda da Fortuna'],
    sucessores: ['O Enforcado'],
    mesmo_elemento: ['A Imperatriz', 'O Imperador', 'A Roda da Fortuna', 'O Diabo', 'O Mundo'],
    complementares: ['O Mago'],
    palavras_chave: ['Força interior', 'Coragem', 'Compaixão', 'Poder da alma', 'Domínio', 'Suavidade'],
    significado_espiritual: 'O poder da alma que domina as feras selvagens do ego. A coragem que transciende a força bruta. A compaixão que transforma a agressividade em bondade. Representa o domínio sobre os impulsos e a conquista do equilíbrio.',
    arquétipo: 'A Mestra Interior / A Força',
  },
  11: {
    arcano: 'O Enforcado',
    numero_carta: 11,
    elemento: 'Água',
    predecessores: ['A Força'],
    sucessores: ['A Morte'],
    mesmo_elemento: ['A Sacerdotisa', 'A Lua', 'O Carro', 'A Morte'],
    complementares: ['O Hierofante'],
    palavras_chave: ['Sacrifício', 'Entrega', 'Nova perspectiva', 'Pausa', 'Generosidade', 'Inversão'],
    significado_espiritual: 'O sacrifício deliberado que abre portas para novas perspectivas. A entrega que liberta a alma. A inversão do ponto de vista que revela verdades ocultas. Representa a pausa necessária e a sabedoria de saber quando parar.',
    arquétipo: 'O Sacrifício Consciente / O Martir',
  },
  12: {
    arcano: 'A Morte',
    numero_carta: 12,
    elemento: 'Água',
    predecessores: ['O Enforcado'],
    sucessores: ['A Temperança'],
    mesmo_elemento: ['A Sacerdotisa', 'A Lua', 'O Carro', 'O Enforcado'],
    complementares: ['O Sol'],
    palavras_chave: ['Transformação', 'Fim', 'Renascimento', 'Metamorfose', 'Mudança profunda', 'Portal'],
    significado_espiritual: 'A transformação inevitável que prepara o renascimento. O fim de um ciclo que possibilita um novo começo. A metamorfose que liberta a alma de velhas formas. Representa a mudança profunda e a purificação.',
    arquétipo: 'A Transformação / O Renascimento',
  },
  13: {
    arcano: 'A Temperança',
    numero_carta: 13,
    elemento: 'Fogo',
    predecessores: ['A Morte'],
    sucessores: ['O Diabo'],
    mesmo_elemento: ['O Imperador', 'O Hierofante', 'A Torre', 'O Sol', 'O Julgamento'],
    complementares: ['A Estrela'],
    palavras_chave: ['Equilíbrio', 'Alquimia', 'Harmonia', 'Moderação', 'Paciência', 'Síntese'],
    significado_espiritual: 'O equilíbrio divino entre extremos opostos. A síntese que harmoniza contrários. A alquimia espiritual que transforma chumbo em ouro. Representa a moderação, a paciência cósmica e a integração das polaridades.',
    arquétipo: 'O Alquimista / O Equilibrador',
  },
  14: {
    arcano: 'O Diabo',
    numero_carta: 14,
    elemento: 'Terra',
    predecessores: ['A Temperança'],
    sucessores: ['A Torre'],
    mesmo_elemento: ['A Imperatriz', 'O Imperador', 'A Roda da Fortuna', 'A Força', 'O Mundo'],
    complementares: ['A Justiça'],
    palavras_chave: ['Sombra', 'Ilusão', 'Prisão', 'Materialismo', 'Correntes', 'Enfrentamento'],
    significado_espiritual: 'A sombra que habita em todos os seres. As correntes da matéria que prendem a alma. A ilusão da separação que esquece a unidade divina. Representa a confrontação com a sombra e a libertação das autolimitacões.',
    arquétipo: 'A Sombra / O Prisioneiro',
  },
  15: {
    arcano: 'A Torre',
    numero_carta: 15,
    elemento: 'Fogo',
    predecessores: ['O Diabo'],
    sucessores: ['A Estrela'],
    mesmo_elemento: ['O Imperador', 'O Hierofante', 'A Roda da Fortuna', 'A Temperança', 'O Sol', 'O Julgamento'],
    complementares: ['Os Enamorados'],
    palavras_chave: ['Destruição', 'Libertação', 'Raio', 'Revelação', 'Mudança súbita', 'Novo começo'],
    significado_espiritual: 'A destruição libertadora que prepara a reconstrução. O raio que dissipa a ilusão e revela a verdade. A queda dos falsos edifícios que permite a fundação do real. Representa a libertação súbita e o novo começo.',
    arquétipo: 'O Raio / A Libertação Súbita',
  },
  16: {
    arcano: 'A Estrela',
    numero_carta: 16,
    elemento: 'Ar',
    predecessores: ['A Torre'],
    sucessores: ['A Lua'],
    mesmo_elemento: ['O Louco', 'A Sacerdotisa', 'Os Enamorados', 'A Justiça', 'O Julgamento'],
    complementares: ['A Temperança'],
    palavras_chave: ['Esperança', 'Luz', 'Inspiração', 'Orientação', 'Renovação', 'Cura'],
    significado_espiritual: 'A esperança que brilha mesmo na escuridão mais profunda. A luz que guia os caminhantes. A inspiração divina que renova a fé. Representa a orientação celestial, a renovação da esperança e a conexão com as forças cósmicas de cura.',
    arquétipo: 'A Esperança / A Luz Guiadora',
  },
  17: {
    arcano: 'A Lua',
    numero_carta: 17,
    elemento: 'Água',
    predecessores: ['A Estrela'],
    sucessores: ['O Sol'],
    mesmo_elemento: ['A Sacerdotisa', 'O Carro', 'A Morte', 'O Enforcado'],
    complementares: ['O Sol'],
    palavras_chave: ['Ilusão', 'Inconsciente', 'Medo', 'Intuição', 'Noite', 'Perigo oculto'],
    significado_espiritual: 'O reino das ilusões e da percepção distorcida. O mundo onírico que revela verdades ocultas. A intuição que navega pelas águas profundas do inconsciente. Representa os medos ocultos e a necessidade de discernimento.',
    arquétipo: 'A Ilusão / A Navegadora',
  },
  18: {
    arcano: 'O Sol',
    numero_carta: 18,
    elemento: 'Fogo',
    predecessores: ['A Lua'],
    sucessores: ['O Julgamento'],
    mesmo_elemento: ['O Imperador', 'O Hierofante', 'A Roda da Fortuna', 'A Temperança', 'A Torre', 'O Julgamento'],
    complementares: ['A Lua'],
    palavras_chave: ['Luz', 'Vitalidade', 'Sucesso', 'Clareza', 'Alegría', 'Criança interior'],
    significado_espiritual: 'A luz da consciência que ilumina todas as coisas. A vitalidade que renova o corpo e o espírito. A alegria de viver que celebra a existência. Representa a claridade mental, o sucesso garantido e a criança interior que jubila.',
    arquétipo: 'O Sol / O Iluminado',
  },
  19: {
    arcano: 'O Julgamento',
    numero_carta: 19,
    elemento: 'Fogo',
    predecessores: ['O Sol'],
    sucessores: ['O Mundo'],
    mesmo_elemento: ['O Imperador', 'O Hierofante', 'A Roda da Fortuna', 'A Temperança', 'A Torre', 'O Sol'],
    complementares: ['O Eremita'],
    palavras_chave: ['Julgamento', 'Renascimento', 'Chamado', 'Redenção', 'Trombeta', 'Eu Superior'],
    significado_espiritual: 'O chamado da alma para seu propósito divino. A trombeta que desperta os mortos para nova vida. O julgamento que liberta ou condena. Representa a redenção, a chamada interior e o renascimento através do reconhecimento do Eu Superior.',
    arquétipo: 'O Arcanjo / O Renascimento',
  },
  20: {
    arcano: 'O Mundo',
    numero_carta: 20,
    elemento: 'Terra',
    predecessores: ['O Julgamento'],
    sucessores: ['O Louco'],
    mesmo_elemento: ['A Imperatriz', 'O Imperador', 'A Roda da Fortuna', 'A Força', 'O Diabo'],
    complementares: ['O Louco'],
    palavras_chave: ['Completude', 'Integração', 'Realização', 'Ciclo completo', 'Celebração', 'Unidade'],
    significado_espiritual: 'A completude que simboliza o fim de um ciclo maior. A integração de todos os opostos em harmonia perfeita. O retorno ao paraíso após a jornada. Representa a réalisation, a integração espiritual e a celebração da wholeness.',
    arquétipo: 'O Universo / A Completude',
  },
  21: {
    arcano: 'O Louco',
    numero_carta: 21,
    elemento: 'Ar',
    predecessores: ['O Mundo'],
    sucessores: [],
    mesmo_elemento: ['O Mago', 'Os Enamorados', 'A Justiça', 'A Estrela', 'O Julgamento'],
    complementares: ['O Mundo'],
    palavras_chave: ['Retorno', 'Liberdade sagrada', 'Infinito', 'Recomeço', 'Loucura divina', 'Mestria'],
    significado_espiritual: 'O retorno ao início selvagem da jornada, agora com sabedoria conquistada. A liberdade absoluta que transcende todas as estruturas. O salto de fé que abraça o infinito. Representa o mestre que retornou ao estado original.',
    arquétipo: 'O Louco Iluminado / O Mestre Retornado',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_TAROT_MAP);
Object.values(TAROT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All22 Major Arcana card numbers
 */
export const TODOS_ARCANOS: readonly number[] = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);

/**
 * Get the tarot-tarot self-correlation mapping for a given card number
 * @param numeroCarta - Card number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarotByNumber(numeroCarta: number): TarotTarotMapping | null {
  return TAROT_TAROT_MAP[numeroCarta] ?? null;
}

/**
 * Get the self-correlation mapping for a given arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'O Mago')
 * @returns The correlation mapping or null if not found
 */
export function getTarotTarotByArcano(arcano: string): TarotTarotMapping | null {
  return Object.values(TAROT_TAROT_MAP).find((m) => m.arcano === arcano) ?? null;
}

/**
 * Get all Tarot-Tarot mappings
 * @returns Array of all correlation mappings sorted by card number
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Check if a card number exists in the mapping
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

/**
 * Get the arcano name by card number
 * @param numeroCarta - Card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numeroCarta: number): string | null {
  return TAROT_TAROT_MAP[numeroCarta]?.arcano ?? null;
}

/**
 * Get the element for a given card number
 * @param numeroCarta - Card number (0-21)
 * @returns The element or null if not found
 */
export function getElementoByNumber(numeroCarta: number): Elemento | null {
  return TAROT_TAROT_MAP[numeroCarta]?.elemento ?? null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotTarotMapping objects matching the element
 */
export function getTarotTarotByElement(elemento: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.elemento === elemento);
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_TAROT_MAP)
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => TAROT_TAROT_MAP[n].arcano);
}

/**
 * Get cards with the same element as a given card
 * @param numeroCarta - Card number (0-21)
 * @returns Array of arcano names with the same element
 */
export function getCardsByElement(numeroCarta: number): string[] {
  const mapping = TAROT_TAROT_MAP[numeroCarta];
  if (!mapping) return [];
  return getAllTarotTarots()
    .filter((m) => m.elemento === mapping.elemento && m.numero_carta !== numeroCarta)
    .map((m) => m.arcano);
}

/**
 * Get the predecessor card in the Fool's Journey
 * @param numeroCarta - Card number (0-21)
 * @returns The predecessor arcano name or null if none
 */
export function getPredecessor(numeroCarta: number): string | null {
  const mapping = TAROT_TAROT_MAP[numeroCarta];
  if (!mapping || !mapping.predecessores?.length) return null;
  return mapping.predecessores[0];
}

/**
 * Get the successor card in the Fool's Journey
 * @param numeroCarta - Card number (0-21)
 * @returns The successor arcano name or null if none
 */
export function getSuccessor(numeroCarta: number): string | null {
  const mapping = TAROT_TAROT_MAP[numeroCarta];
  if (!mapping || !mapping.sucessores?.length) return null;
  return mapping.sucessores[0];
}

/**
 * Get complementary cards (opposite energy)
 * @param numeroCarta - Card number (0-21)
 * @returns Array of complementary arcano names
 */
export function getComplementary(numeroCarta: number): string[] {
  const mapping = TAROT_TAROT_MAP[numeroCarta];
  if (!mapping?.complementares) return [];
  return mapping.complementares;
}

/**
 * Get keyword associations for a card
 * @param numeroCarta - Card number (0-21)
 * @returns Array of keywords or empty array if not found
 */
export function getKeywords(numeroCarta: number): string[] {
  const mapping = TAROT_TAROT_MAP[numeroCarta];
  if (!mapping?.palavras_chave) return [];
  return mapping.palavras_chave;
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarotByNumber,
  getTarotTarotByArcano,
  getAllTarotTarots,
  hasTarotTarot,
  getArcanoByNumber,
  getElementoByNumber,
  getTarotTarotByElement,
  getAllArcanos,
  getCardsByElement,
  getPredecessor,
  getSuccessor,
  getComplementary,
  getKeywords,
  TAROT_TAROT_MAP,
  TODOS_ARCANOS,
};
