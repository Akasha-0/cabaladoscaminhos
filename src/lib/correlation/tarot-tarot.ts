/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on mythological connections,
 * elemental affinities, and spiritual lesson progressions.
 * Source: Cabala dos Caminhos spiritual system
 */

/**
 * Represents the type of relationship between two Tarot cards
 */
export type TarotRelationshipType =
  | 'progressão' // Progression: cards that follow each other in the Fool's Journey
  | 'oposição'        // Opposition: cards that oppose or balance each other
  | 'complementar'    // Complementary: cards that complete each other
  | 'ancestral'       // Ancestral: cards with shared wisdom or origin
  | 'aliado'          // Ally: cards that support each other
  | 'transformação'   // Transformation: cards that represent transformation stages
  | 'sombra' // Shadow: cards that represent shadow aspects
  | 'iluminação';     // Illumination: cards that represent enlightenment

/**
 * Represents the correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Source card number (0-21) */
  card_a_numero: number;
  /** Source card name in Portuguese */
  card_a_nome: string;
  /** Target card number (0-21) */
  card_b_numero: number;
  /** Target card name in Portuguese */
  card_b_nome: string;
  /** Type of relationship between the cards */
  relationship_type: TarotRelationshipType;
  /** Description of the spiritual connection */
  significado_espiritual: string;
  /** Keywords associated with this relationship */
  palavras_chave: string[];
  /** Elemental correspondence if applicable */
  elemento?: string;
  /** Whether this relationship represents a journey progression */
  é_jornada?: boolean;
}

/**
 * Complete mapping of Tarot card relationships.
 * Based on the Major Arcana Fool's Journey and spiritual correspondences
 * from the Cabala dos Caminhos system.
 */
export const TAROT_TAROT_MAP: readonly TarotTarotMapping[] = [
  // ─── Progressão: Sequential cards in the Fool's Journey ───────────────────────
  {
    card_a_numero: 0, card_a_nome: 'O Louco',
    card_b_numero: 1, card_b_nome: 'O Mago',
    relationship_type: 'progressão',
    significado_espiritual: 'O início da jornada onde o potencial bruto encontra a vontade consciente',
    palavras_chave: ['início', 'potencial', 'vontade', 'jornada'],
    elemento: 'Éter',
    é_jornada: true,
  },
  {
    card_a_numero: 1, card_a_nome: 'O Mago',
    card_b_numero: 2, card_b_nome: 'A Sacerdotisa',
    relationship_type: 'progressão',
    significado_espiritual: 'A vontade encontra a sabedoria intuitiva e o mundo interior',
    palavras_chave: ['vontade', 'intuição', 'sabedoria', 'interior'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 2, card_a_nome: 'A Sacerdotisa',
    card_b_numero: 3, card_b_nome: 'A Imperatriz',
    relationship_type: 'progressão',
    significado_espiritual: 'A sabedoria intuitiva floresce em abundância e fertilidade',
    palavras_chave: ['sabedoria', 'abundância', 'fertilidade', 'natureza'],
    elemento: 'Terra',
    é_jornada: true,
  },
  {
    card_a_numero: 3, card_a_nome: 'A Imperatriz',
    card_b_numero: 4, card_b_nome: 'O Imperador',
    relationship_type: 'progressão',
    significado_espiritual: 'A abundância natural encontra estrutura e autoridade',
    palavras_chave: ['abundância', 'estrutura', 'autoridade', 'ordem'],
    elemento: 'Terra',
    é_jornada: true,
  },
  {
    card_a_numero: 4, card_a_nome: 'O Imperador',
    card_b_numero: 5, card_b_nome: 'O Papa',
    relationship_type: 'progressão',
    significado_espiritual: 'A autoridade racional encontra a sabedoria espiritual',
    palavras_chave: ['autoridade', 'sabedoria espiritual', 'tradição', 'fé'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 5, card_a_nome: 'O Papa',
    card_b_numero: 6, card_b_nome: 'Os Enamorados',
    relationship_type: 'progressão',
    significado_espiritual: 'A sabedoria espiritual encontra o amor e a escolha',
    palavras_chave: ['sabedoria', 'amor', 'escolha', 'união'],
    elemento: 'Ar',
    é_jornada: true,
  },
  {
    card_a_numero: 6, card_a_nome: 'Os Enamorados',
    card_b_numero: 7, card_b_nome: 'O Carro',
    relationship_type: 'progressão',
    significado_espiritual: 'O amor impulsiona a conquista e a vitória',
    palavras_chave: ['amor', 'conquista', 'vitória', 'determinação'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 7, card_a_nome: 'O Carro',
    card_b_numero: 8, card_b_nome: 'A Justiça',
    relationship_type: 'progressão',
    significado_espiritual: 'A vitória conquistada deve ser equilibrada pela justiça',
    palavras_chave: ['vitória', 'justiça', 'equilíbrio', 'ação'],
    elemento: 'Ar',
    é_jornada: true,
  },
  {
    card_a_numero: 8, card_a_nome: 'A Justiça',
    card_b_numero: 9, card_b_nome: 'O Eremita',
    relationship_type: 'progressão',
    significado_espiritual: 'A justiça leva à necessidade de introspecção e busca interior',
    palavras_chave: ['justiça', 'introspecção', 'busca', 'solitude'],
    elemento: 'Terra',
    é_jornada: true,
  },
  {
    card_a_numero: 9, card_a_nome: 'O Eremita',
    card_b_numero: 10, card_b_nome: 'A Roda da Fortuna',
    relationship_type: 'progressão',
    significado_espiritual: 'A sabedoria interior encontra o destino e os ciclos do universo',
    palavras_chave: ['sabedoria', 'destino', 'ciclos', 'transformação'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 10, card_a_nome: 'A Roda da Fortuna',
    card_b_numero: 11, card_b_nome: 'A Força',
    relationship_type: 'progressão',
    significado_espiritual: 'O destino capricioso fortalece a coragem interior',
    palavras_chave: ['destino', 'coragem', 'fortaleza', 'interior'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 11, card_a_nome: 'A Força',
    card_b_numero: 12, card_b_nome: 'O Enforcado',
    relationship_type: 'progressão',
    significado_espiritual: 'A força interior permite o sacrifício e nova perspectiva',
    palavras_chave: ['força', 'sacrifício', 'perspectiva', 'renúncia'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 12, card_a_nome: 'O Enforcado',
    card_b_numero: 13, card_b_nome: 'A Morte',
    relationship_type: 'progressão',
    significado_espiritual: 'O sacrifício voluntário aceita a transformação inevitável',
    palavras_chave: ['sacrifício', 'transformação', 'morte', 'renascimento'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 13, card_a_nome: 'A Morte',
    card_b_numero: 14, card_b_nome: 'A Temperança',
    relationship_type: 'progressão',
    significado_espiritual: 'A morte física abre caminho para o equilíbrio e integração',
    palavras_chave: ['morte', 'equilíbrio', 'integração', 'cura'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 14, card_a_nome: 'A Temperança',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'progressão',
    significado_espiritual: 'O equilíbrio é testado pelas tentações e vícios',
    palavras_chave: ['equilíbrio', 'tentação', 'vício', 'materialismo'],
    elemento: 'Terra',
    é_jornada: true,
  },
  {
    card_a_numero: 15, card_a_nome: 'O Diabo',
    card_b_numero: 16, card_b_nome: 'A Torre',
    relationship_type: 'progressão',
    significado_espiritual: 'A queda nos vícios leva à revelação catastrófica',
    palavras_chave: ['queda', 'revelação', 'catástrofe', 'libertação'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 16, card_a_nome: 'A Torre',
    card_b_numero: 17, card_b_nome: 'A Estrela',
    relationship_type: 'progressão',
    significado_espiritual: 'A destruição da torre permite a esperança e renovação',
    palavras_chave: ['destruição', 'esperança', 'renovação', 'luz'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 17, card_a_nome: 'A Estrela',
    card_b_numero: 18, card_b_nome: 'A Lua',
    relationship_type: 'progressão',
    significado_espiritual: 'A esperança ilumina o caminho através das ilusões',
    palavras_chave: ['esperança', 'ilusão', 'inconsciente', 'sonhos'],
    elemento: 'Água',
    é_jornada: true,
  },
  {
    card_a_numero: 18, card_a_nome: 'A Lua',
    card_b_numero: 19, card_b_nome: 'O Sol',
    relationship_type: 'progressão',
    significado_espiritual: 'A superação das ilusões traz a luz da verdade',
    palavras_chave: ['ilusão', 'verdade', 'luz', 'alegria'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 19, card_a_nome: 'O Sol',
    card_b_numero: 20, card_b_nome: 'O Julgamento',
    relationship_type: 'progressão',
    significado_espiritual: 'A luz da verdade traz o julgamento e a redenção',
    palavras_chave: ['verdade', 'julgamento', 'redenção', 'renascimento'],
    elemento: 'Fogo',
    é_jornada: true,
  },
  {
    card_a_numero: 20, card_a_nome: 'O Julgamento',
    card_b_numero: 21, card_b_nome: 'O Mundo',
    relationship_type: 'progressão',
    significado_espiritual: 'O julgamento final conduz à completude e integração',
    palavras_chave: ['julgamento', 'completude', 'integração', 'realização'],
    elemento: 'Terra',
    é_jornada: true,
  },

  // ─── Oposição: Cards that oppose or balance each other ───────────────────────
  {
    card_a_numero: 0, card_a_nome: 'O Louco',
    card_b_numero: 21, card_b_nome: 'O Mundo',
    relationship_type: 'oposição',
    significado_espiritual: 'O eterno recomeço encontra a completude - o ciclo se fecha e reinicia',
    palavras_chave: ['início', 'fim', 'ciclo', 'completude'],
    elemento: 'Éter',
  },
  {
    card_a_numero: 3, card_a_nome: 'A Imperatriz',
    card_b_numero: 4, card_b_nome: 'O Imperador',
    relationship_type: 'oposição',
    significado_espiritual: 'A energia feminina criativa opõe-se à energia masculina estruturante',
    palavras_chave: ['feminino', 'masculino', 'criação', 'estrutura'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 5, card_a_nome: 'O Papa',
    card_b_numero: 6, card_b_nome: 'Os Enamorados',
    relationship_type: 'oposição',
    significado_espiritual: 'A fé institucional opõe-se à escolha pessoal do coração',
    palavras_chave: ['fé', 'escolha', 'tradição', 'liberdade'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 9, card_a_nome: 'O Eremita',
    card_b_numero: 7, card_b_nome: 'O Carro',
    relationship_type: 'oposição',
    significado_espiritual: 'A solidão contemplativa opõe-se à conquista ativa do mundo',
    palavras_chave: ['solitude', 'conquista', 'interior', 'exterior'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 11, card_a_nome: 'A Força',
    card_b_numero: 8, card_b_nome: 'A Justiça',
    relationship_type: 'oposição',
    significado_espiritual: 'A força interior opõe-se à justiça exterior - coração vs. mente',
    palavras_chave: ['força', 'justiça', 'coração', 'mente'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 12, card_a_nome: 'O Enforcado',
    card_b_numero: 16, card_b_nome: 'A Torre',
    relationship_type: 'oposição',
    significado_espiritual: 'O sacrifício voluntário opõe-se à destruição forçada',
    palavras_chave: ['sacrifício', 'destruição', 'voluntário', 'involuntário'],
    elemento: 'Água',
  },
  {
    card_a_numero: 15, card_a_nome: 'O Diabo',
    card_b_numero: 17, card_b_nome: 'A Estrela',
    relationship_type: 'oposição',
    significado_espiritual: 'A escuridão da tentação opõe-se à luz da esperança',
    palavras_chave: ['tentação', 'esperança', 'escuro', 'luz'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 18, card_a_nome: 'A Lua',
    card_b_numero: 19, card_b_nome: 'O Sol',
    relationship_type: 'oposição',
    significado_espiritual: 'As ilusões noturnas opõem-se à claridade diurna',
    palavras_chave: ['ilusão', 'verdade', 'noite', 'dia'],
    elemento: 'Água',
  },

  // ─── Complementar: Cards that complete each other ────────────────────────────
  {
    card_a_numero: 1, card_a_nome: 'O Mago',
    card_b_numero: 2, card_b_nome: 'A Sacerdotisa',
    relationship_type: 'complementar',
    significado_espiritual: 'A vontade consciente e a sabedoria intuitiva se complementam para criar',
    palavras_chave: ['vontade', 'intuição', 'criação', 'equilíbrio'],
    elemento: 'Éter',
  },
  {
    card_a_numero: 10, card_a_nome: 'A Roda da Fortuna',
    card_b_numero: 14, card_b_nome: 'A Temperança',
    relationship_type: 'complementar',
    significado_espiritual: 'O destino cíclico encontra o equilíbrio que transforma o karma',
    palavras_chave: ['destino', 'equilíbrio', 'karma', 'transformação'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 13, card_a_nome: 'A Morte',
    card_b_numero: 20, card_b_nome: 'O Julgamento',
    relationship_type: 'complementar',
    significado_espiritual: 'A morte e o renascimento se complementam no julgamento final',
    palavras_chave: ['morte', 'renascimento', 'julgamento', 'redenção'],
    elemento: 'Água',
  },
  {
    card_a_numero: 19, card_a_nome: 'O Sol',
    card_b_numero: 18, card_b_nome: 'A Lua',
    relationship_type: 'complementar',
    significado_espiritual: 'A luz solar e a luz lunar se complementam no equilíbrio dos opostos',
    palavras_chave: ['sol', 'lua', 'equilíbrio', 'dualidade'],
    elemento: 'Fogo',
  },

  // ─── Ancestral: Cards with shared wisdom or origin ───────────────────────────
  {
    card_a_numero: 2, card_a_nome: 'A Sacerdotisa',
    card_b_numero: 18, card_b_nome: 'A Lua',
    relationship_type: 'ancestral',
    significado_espiritual: 'A sabedoria lunar da Sacerdotisa encontra sua expressão onírica na Lua',
    palavras_chave: ['lua', 'sabedoria', 'inconsciente', 'misterio'],
    elemento: 'Água',
  },
  {
    card_a_numero: 3, card_a_nome: 'A Imperatriz',
    card_b_numero: 9, card_b_nome: 'O Eremita',
    relationship_type: 'ancestral',
    significado_espiritual: 'A abundância natural conecta-se com a sabedoria ancestral',
    palavras_chave: ['natureza', 'sabedoria', 'abundância', 'tradição'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 8, card_a_nome: 'A Justiça',
    card_b_numero: 20, card_b_nome: 'O Julgamento',
    relationship_type: 'ancestral',
    significado_espiritual: 'A justiça terrena ecoa no julgamento cósmico',
    palavras_chave: ['justiça', 'julgamento', 'cosmico', 'karma'],
    elemento: 'Ar',
  },
  {
    card_a_numero: 17, card_a_nome: 'A Estrela',
    card_b_numero: 19, card_b_nome: 'O Sol',
    relationship_type: 'ancestral',
    significado_espiritual: 'A esperança estelar prepara o caminho para a luz solar',
    palavras_chave: ['estrela', 'sol', 'esperança', 'luz'],
    elemento: 'Água',
  },

  // ─── Aliado: Cards that support each other ────────────────────────────────────
  {
    card_a_numero: 1, card_a_nome: 'O Mago',
    card_b_numero: 11, card_b_nome: 'A Força',
    relationship_type: 'aliado',
    significado_espiritual: 'A vontade do Mago é fortalecida pela coragem interior da Força',
    palavras_chave: ['vontade', 'coragem', 'força', 'poder'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 3, card_a_nome: 'A Imperatriz',
    card_b_numero: 9, card_b_nome: 'O Eremita',
    relationship_type: 'aliado',
    significado_espiritual: 'A fertilidade da Imperatriz encontra refúgio na sabedoria do Eremita',
    palavras_chave: ['fertilidade', 'sabedoria', 'refúgio', 'nutrição'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 6, card_a_nome: 'Os Enamorados',
    card_b_numero: 14, card_b_nome: 'A Temperança',
    relationship_type: 'aliado',
    significado_espiritual: 'O amor dos Enamorados é temperado pela harmonia da Temperança',
    palavras_chave: ['amor', 'harmonia', 'equilíbrio', 'relação'],
    elemento: 'Ar',
  },
  {
    card_a_numero: 10, card_a_nome: 'A Roda da Fortuna',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'aliado',
    significado_espiritual: 'Os ciclos do destino podem prender-nos às correntes do Diabo',
    palavras_chave: ['destino', 'prisão', 'ciclos', 'vício'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 16, card_a_nome: 'A Torre',
    card_b_numero: 20, card_b_nome: 'O Julgamento',
    relationship_type: 'aliado',
    significado_espiritual: 'A destruição da Torre pode levar ao despertar do Julgamento',
    palavras_chave: ['destruição', 'julgamento', 'despertar', 'renovação'],
    elemento: 'Fogo',
  },

  // ─── Transformação: Cards representing transformation stages ─────────────────
  {
    card_a_numero: 0, card_a_nome: 'O Louco',
    card_b_numero: 13, card_b_nome: 'A Morte',
    relationship_type: 'transformação',
    significado_espiritual: 'A inocência do Louco pode enfrentar a transformação da Morte',
    palavras_chave: ['inocência', 'transformação', 'morte', 'renascimento'],
    elemento: 'Éter',
  },
  {
    card_a_numero: 12, card_a_nome: 'O Enforcado',
    card_b_numero: 13, card_b_nome: 'A Morte',
    relationship_type: 'transformação',
    significado_espiritual: 'O sacrifício do Enforcado antecipa a transformação da Morte',
    palavras_chave: ['sacrifício', 'transformação', 'morte', 'renúncia'],
    elemento: 'Água',
  },
  {
    card_a_numero: 13, card_a_nome: 'A Morte',
    card_b_numero: 21, card_b_nome: 'O Mundo',
    relationship_type: 'transformação',
    significado_espiritual: 'A morte do ego conduz à realização do Mundo',
    palavras_chave: ['morte', 'ego', 'realização', 'completude'],
    elemento: 'Água',
  },
  {
    card_a_numero: 15, card_a_nome: 'O Diabo',
    card_b_numero: 16, card_b_nome: 'A Torre',
    relationship_type: 'transformação',
    significado_espiritual: 'A queda do Diabo precede a destruição catártica da Torre',
    palavras_chave: ['queda', 'destruição', 'catarse', 'libertação'],
    elemento: 'Fogo',
  },

  // ─── Sombra: Cards representing shadow aspects ────────────────────────────────
  {
    card_a_numero: 5, card_a_nome: 'O Papa',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'sombra',
    significado_espiritual: 'A espiritualidade do Papa pode esconder a manipulação do Diabo',
    palavras_chave: ['espiritualidade', 'sombra', 'manipulação', 'hipocrisia'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 8, card_a_nome: 'A Justiça',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'sombra',
    significado_espiritual: 'A justiça pode ser distorcida em julgamento cruel pelo Diabo',
    palavras_chave: ['justiça', 'sombra', 'crueldade', 'condenação'],
    elemento: 'Ar',
  },
  {
    card_a_numero: 14, card_a_nome: 'A Temperança',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'sombra',
    significado_espiritual: 'O equilíbrio forçado da Temperança pode tornar-se prisão do Diabo',
    palavras_chave: ['equilíbrio', 'sombra', 'prisão', 'vício'],
    elemento: 'Água',
  },
  {
    card_a_numero: 18, card_a_nome: 'A Lua',
    card_b_numero: 15, card_b_nome: 'O Diabo',
    relationship_type: 'sombra',
    significado_espiritual: 'As ilusões da Lua podem ser cultivadas pelo Diabo',
    palavras_chave: ['ilusão', 'sombra', 'engano', 'medo'],
    elemento: 'Água',
  },

  // ─── Iluminação: Cards representing enlightenment ─────────────────────────────
  {
    card_a_numero: 0, card_a_nome: 'O Louco',
    card_b_numero: 17, card_b_nome: 'A Estrela',
    relationship_type: 'iluminação',
    significado_espiritual: 'A luz interior do Louco brilha como a esperança da Estrela',
    palavras_chave: ['luz', 'esperança', 'início', 'inspiração'],
    elemento: 'Éter',
  },
  {
    card_a_numero: 9, card_a_nome: 'O Eremita',
    card_b_numero: 17, card_b_nome: 'A Estrela',
    relationship_type: 'iluminação',
    significado_espiritual: 'A sabedoria do Eremita encontra sua expressão luminosa na Estrela',
    palavras_chave: ['sabedoria', 'luz', 'guia', 'iluminação'],
    elemento: 'Terra',
  },
  {
    card_a_numero: 19, card_a_nome: 'O Sol',
    card_b_numero: 21, card_b_nome: 'O Mundo',
    relationship_type: 'iluminação',
    significado_espiritual: 'A luz do Sol ilumina o caminho para a completude do Mundo',
    palavras_chave: ['luz', 'completude', 'realização', 'alegria'],
    elemento: 'Fogo',
  },
  {
    card_a_numero: 20, card_a_nome: 'O Julgamento',
    card_b_numero: 21, card_b_nome: 'O Mundo',
    relationship_type: 'iluminação',
    significado_espiritual: 'O julgamento final conduz à suprema iluminação do Mundo',
    palavras_chave: ['julgamento', 'iluminação', 'redenção', 'completude'],
    elemento: 'Fogo',
  },
];

/**
 * Freeze the array to prevent modifications
 */
Object.freeze(TAROT_TAROT_MAP);

/**
 * Normalizes card name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarCarta(carta: string): string | null {
  const normalizado = carta.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const mapa: Record<string, string> = {
    'o louco': 'O Louco',
    'louco': 'O Louco',
    'the fool': 'O Louco',
    'a sacerdotisa': 'A Sacerdotisa',
    'sacerdotisa': 'A Sacerdotisa',
    'the high priestess': 'A Sacerdotisa',
    'a imperatriz': 'A Imperatriz',
    'imperatriz': 'A Imperatriz',
    'the empress': 'A Imperatriz',
    'o imperador': 'O Imperador',
    'imperador': 'O Imperador',
    'the emperor': 'O Imperador',
    'o papa': 'O Papa',
    'papa': 'O Papa',
    'the hierophant': 'O Papa',
    'os enamorados': 'Os Enamorados',
    'enamorados': 'Os Enamorados',
    'the lovers': 'Os Enamorados',
    'o carro': 'O Carro',
    'carro': 'O Carro',
    'the chariot': 'O Carro',
    'a justiça': 'A Justiça',
    'justiça': 'A Justiça',
    'justice': 'A Justiça',
    'the justice': 'A Justiça',
    'o eremita': 'O Eremita',
    'eremita': 'O Eremita',
    'the hermit': 'O Eremita',
    'a roda da fortuna': 'A Roda da Fortuna',
    'roda da fortuna': 'A Roda da Fortuna',
    'wheel of fortune': 'A Roda da Fortuna',
    'a força': 'A Força',
    'força': 'A Força',
    'strength': 'A Força',
    'o enforcado': 'O Enforcado',
    'enforcado': 'O Enforcado',
    'the hanged man': 'O Enforcado',
    'a morte': 'A Morte',
    'morte': 'A Morte',
    'death': 'A Morte',
    'a temperança': 'A Temperança',
    'temperança': 'A Temperança',
    'temperance': 'A Temperança',
    'o diabo': 'O Diabo',
    'diabo': 'O Diabo',
    'the devil': 'O Diabo',
    'a torre': 'A Torre',
    'torre': 'A Torre',
    'the tower': 'A Torre',
    'a estrela': 'A Estrela',
    'estrela': 'A Estrela',
    'the star': 'A Estrela',
    'a lua': 'A Lua',
    'lua': 'A Lua',
    'the moon': 'A Lua',
    'o sol': 'O Sol',
    'sol': 'O Sol',
    'the sun': 'O Sol',
    'o julgamento': 'O Julgamento',
    'julgamento': 'O Julgamento',
    'judgment': 'O Julgamento',
    'o mundo': 'O Mundo',
    'mundo': 'O Mundo',
    'the world': 'O Mundo',
 'o mago': 'O Mago',
    'mago': 'O Mago',
    'the magician': 'O Mago',
  };

  return mapa[normalizado] || null;
}

/**
 * Get all relationships for a specific Tarot card.
 * @param cardName - Card name (e.g., 'O Louco', 'A Imperatriz')
 * @returns Array of TarotTarotMapping objects where the card appears
 */
export function getTarotTarot(cardName: string): TarotTarotMapping[] {
  const normalizado = normalizarCarta(cardName);
  if (!normalizado) return [];

  return TAROT_TAROT_MAP.filter(
    (mapping) => mapping.card_a_nome === normalizado || mapping.card_b_nome === normalizado
  );
}

/**
 * Get all Tarot-Tarot relationships.
 * @returns Array of all correlation mappings
 */
export function getAllTarotTarots(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAP;
}

/**
 * Get relationships by type.
 * @param type - Type of relationship to filter
 * @returns Array of mappings for that relationship type
 */
export function getRelationshipsByType(type: TarotRelationshipType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((mapping) => mapping.relationship_type === type);
}

/**
 * Get all relationship types used in the mapping.
 * @returns Array of unique relationship types
 */
export function getAllRelationshipTypes(): TarotRelationshipType[] {
  const types = new Set(TAROT_TAROT_MAP.map((mapping) => mapping.relationship_type));
  return Array.from(types);
}

/**
 * Get all cards that have relationships.
 * @returns Array of unique card names
 */
export function getAllRelatedCards(): string[] {
  const cards = new Set<string>();
  TAROT_TAROT_MAP.forEach((mapping) => {
    cards.add(mapping.card_a_nome);
    cards.add(mapping.card_b_nome);
  });
  return Array.from(cards);
}

/**
 * Get the relationship between two specific cards.
 * @param card1 - First card name
 * @param card2 - Second card name
 * @returns The relationship mapping or null if not found
 */
export function getRelationBetweenCards(
  card1: string,
  card2: string
): TarotTarotMapping | null {
  const normalizado1 = normalizarCarta(card1);
  const normalizado2 = normalizarCarta(card2);
  if (!normalizado1 || !normalizado2) return null;

  return (
    TAROT_TAROT_MAP.find(
      (mapping) =>
        (mapping.card_a_nome === normalizado1 && mapping.card_b_nome === normalizado2) ||
        (mapping.card_a_nome === normalizado2 && mapping.card_b_nome === normalizado1)
    ) || null
  );
}

/**
 * Get the relationship type between two cards.
 * @param card1 - First card name
 * @param card2 - Second card name
 * @returns The relationship type or null if not found
 */
export function getRelationshipTypeBetween(
  card1: string,
  card2: string
): TarotRelationshipType | null {
  const relation = getRelationBetweenCards(card1, card2);
  return relation?.relationship_type || null;
}

/**
 * Get all cards related to a specific card by a relationship type.
 * @param cardName - Card name
 * @param type - Relationship type filter
 * @returns Array of related card names
 */
export function getRelatedCardsByType(
  cardName: string,
  type: TarotRelationshipType
): string[] {
  const normalizado = normalizarCarta(cardName);
  if (!normalizado) return [];

  return TAROT_TAROT_MAP
    .filter(
      (mapping) =>
        (mapping.card_a_nome === normalizado || mapping.card_b_nome === normalizado) &&
        mapping.relationship_type === type
    )
    .map((mapping) =>
      mapping.card_a_nome === normalizado ? mapping.card_b_nome : mapping.card_a_nome
    );
}

/**
 * Get journey progression cards (sequential cards in the Fool's Journey).
 * @returns Array of journey progression mappings
 */
export function getJourneyProgressions(): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((mapping) => mapping.é_jornada === true);
}

/**
 * Get card by its number (0-21).
 * @param numero - Card number
 * @returns Card name or null if not found
 */
export function getCardNameByNumber(numero: number): string | null {
  const cartaNumero: Record<number, string> = {
    0: 'O Louco',
    1: 'O Mago',
    2: 'A Sacerdotisa',
    3: 'A Imperatriz',
    4: 'O Imperador',
    5: 'O Papa',
    6: 'Os Enamorados',
    7: 'O Carro',
    8: 'A Justiça',
    9: 'O Eremita',
    10: 'A Roda da Fortuna',
    11: 'A Força',
    12: 'O Enforcado',
    13: 'A Morte',
    14: 'A Temperança',
    15: 'O Diabo',
    16: 'A Torre',
    17: 'A Estrela',
    18: 'A Lua',
    19: 'O Sol',
    20: 'O Julgamento',
    21: 'O Mundo',
  };
  return cartaNumero[numero] || null;
}

/**
 * Get the next card in the Fool's Journey.
 * @param cardName - Current card name
 * @returns Next card name or null if at the end
 */
export function getNextCardInJourney(cardName: string): string | null {
  const normalizado = normalizarCarta(cardName);
  if (!normalizado) return null;

  const progressions = getJourneyProgressions();
  const current = progressions.find((p) => p.card_a_nome === normalizado);
  return current?.card_b_nome || null;
}

/**
 * Get the previous card in the Fool's Journey.
 * @param cardName - Current card name
 * @returns Previous card name or null if at the beginning
 */
export function getPreviousCardInJourney(cardName: string): string | null {
  const normalizado = normalizarCarta(cardName);
  if (!normalizado) return null;

  const progressions = getJourneyProgressions();
  const current = progressions.find((p) => p.card_b_nome === normalizado);
  return current?.card_a_nome || null;
}

/**
 * Get all cards that share the same element.
 * @param elemento - Element name (Fogo, Água, Ar, Terra, Éter)
 * @returns Array of TarotTarotMapping objects with that element
 */
export function getCardsByElement(elemento: string): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((mapping) => mapping.elemento === elemento);
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getAllTarotTarots,
  getRelationshipsByType,
  getAllRelationshipTypes,
  getAllRelatedCards,
  getRelationBetweenCards,
  getRelationshipTypeBetween,
  getRelatedCardsByType,
  getJourneyProgressions,
  getCardNameByNumber,
  getNextCardInJourney,
  getPreviousCardInJourney,
  getCardsByElement,
  TAROT_TAROT_MAP,
};
