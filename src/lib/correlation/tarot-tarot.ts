/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to each other with spiritual and esoteric connections.
 * Source: Cabala dos Caminhos spiritual system
 */

/**
 * Represents the correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** Card number 0-21 */
  numero_carta: number;
  /** Arcano name (e.g., 'O Louco', 'A Sacerdotisa') */
  arcano: string;
  /** Related arcano name */
  arcano_relacionado: string;
  /** Related card number */
  numero_carta_relacionado: number;
  /** Type of relationship */
  tipo_relacao: 'oposto' | 'complementar' | 'sequencial' | 'reflexo' | 'cabalistico';
  /** Spiritual significance of the relationship */
  significado_espiritual: string;
}

/**
 * Complete mapping of Tarot Major Arcana relationships.
 * Based on esoteric traditions integrated with the Cabala dos Caminhos system.
 * Each card relates to others through various spiritual connections.
 */
export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping> = {
  // 0 - O Louco
  0: {
    numero_carta: 0,
    arcano: 'O Louco',
    arcano_relacionado: 'O Mundo',
    numero_carta_relacionado: 21,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'O Louco inicia a jornada e O Mundo a completa. O zero que começa e o vinte e um que encerra representam o ciclo completo da existência, onde o viajante retorna ao ponto de partida transformado pela experiência.',
  },
  // 1 - A Sacerdotisa
  1: {
    numero_carta: 1,
    arcano: 'A Sacerdotisa',
    arcano_relacionado: 'A Imperatriz',
    numero_carta_relacionado: 3,
    tipo_relacao: 'complementar',
    significado_espiritual: 'A Sacerdotisa detém o conhecimento oculto enquanto a Imperatriz manifesta a criação visível. Juntas representam a dualidade entre mistério e expressão, intuição e criatividade, véu e realidade.',
  },
  // 2 - A Imperatriz
  2: {
    numero_carta: 2,
    arcano: 'A Imperatriz',
    arcano_relacionado: 'O Imperador',
    numero_carta_relacionado: 4,
    tipo_relacao: 'complementar',
    significado_espiritual: 'A Imperatriz representa a energia criativa receptiva enquanto o Imperador representa a energia ativa e estruturadora. Sua união no arcano Os Enamorados simboliza a harmonia necessária para a criação completa.',
  },
  // 3 - O Imperador
  3: {
    numero_carta: 3,
    arcano: 'O Imperador',
    arcano_relacionado: 'A Imperatriz',
    numero_carta_relacionado: 2,
    tipo_relacao: 'complementar',
    significado_espiritual: 'O Imperador traz ordem e autoridade enquanto a Imperatriz traz fertilidade e abundância. Seu relacionamento representa o equilíbrio entre força e graça, comando e nutrição.',
  },
  // 4 - O Hierofante
  4: {
    numero_carta: 4,
    arcano: 'O Hierofante',
    arcano_relacionado: 'A Estrela',
    numero_carta_relacionado: 17,
    tipo_relacao: 'reflexo',
    significado_espiritual: 'O Hierofante transmite a sabedoria tradicional enquanto a Estrela traz esperança renovadora. O primeiro estabelece as raízes da tradição enquanto a segunda ilumina o caminho futuro com possibilidades radiantes.',
  },
  // 5 - Os Enamorados
  5: {
    numero_carta: 5,
    arcano: 'Os Enamorados',
    arcano_relacionado: 'O Carro',
    numero_carta_relacionado: 7,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'A escolha em Os Enamorados leva à vitória no Carro. A união sagrada exige movimento e determinação para navegar entre as dualidades e manifestar a harmonia elegida.',
  },
  // 6 - O Carro
  6: {
    numero_carta: 6,
    arcano: 'O Carro',
    arcano_relacionado: 'Os Enamorados',
    numero_carta_relacionado: 5,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'O Carro carrega a vitória conquistada pela escolha correta. A energia de Os Enamorados se transforma em força motriz que impulsa o viajante em direção ao destino.',
  },
  // 7 - A Força
  7: {
    numero_carta: 7,
    arcano: 'A Força',
    arcano_relacionado: 'A Justiça',
    numero_carta_relacionado: 11,
    tipo_relacao: 'cabalistico',
    significado_espiritual: 'A Força domina as forças instintivas através da coragem interior enquanto a Justiça traz equilíbrio cósmico. Ambas representam aspectos da Lei Divina operando no mundo espiritual.',
  },
  // 8 - O Eremita
  8: {
    numero_carta: 8,
    arcano: 'O Eremita',
    arcano_relacionado: 'O Sol',
    numero_carta_relacionado: 19,
    tipo_relacao: 'oposto',
    significado_espiritual: 'O Eremita busca iluminação na escuridão enquanto O Sol irradia luz absoluta. A solidão do eremita precede o brilho do sol, representando que a busca interior é caminho para a claridade.',
  },
  // 9 - A Roda da Fortuna
  9: {
    numero_carta: 9,
    arcano: 'A Roda da Fortuna',
    arcano_relacionado: 'A Torre',
    numero_carta_relacionado: 16,
    tipo_relacao: 'cabalistico',
    significado_espiritual: 'A Roda representa os ciclos do destino que eventualmente conduzem à catarse da Torre. O acaso aparente da roda dá lugar à revelação abrupta que liberta através da destruição das ilusões.',
  },
  // 10 - A Justiça
  10: {
    numero_carta: 10,
    arcano: 'A Justiça',
    arcano_relacionado: 'A Força',
    numero_carta_relacionado: 8,
    tipo_relacao: 'cabalistico',
    significado_espiritual: 'A Justiça representa o equilíbrio cósmico e a lei divina em ação. Sua conexão com a Força revela que a verdadeira justiça requer coragem para aplicar a lei com compaixão.',
  },
  // 11 - O Diabo
  11: {
    numero_carta: 11,
    arcano: 'O Diabo',
    arcano_relacionado: 'A Estrela',
    numero_carta_relacionado: 17,
    tipo_relacao: 'oposto',
    significado_espiritual: 'O Diabo representa a queda e a servidão às paixões enquanto a Estrela traz esperança restaurada. O caminho da libertação passa do aprisionamento do Diabo para a liberdade irradiante da Estrela.',
  },
  // 12 - O Enforcado
  12: {
    numero_carta: 12,
    arcano: 'O Enforcado',
    arcano_relacionado: 'O Hierofante',
    numero_carta_relacionado: 5,
    tipo_relacao: 'reflexo',
    significado_espiritual: 'O Enforcado sacrifica a perspectiva habitual para obter iluminação enquanto o Hierofante transmite a sabedoria estabelecida. O sacrifício permite receber a tradição com nova visão.',
  },
  // 13 - A Morte
  13: {
    numero_carta: 13,
    arcano: 'A Morte',
    arcano_relacionado: 'O Julgamento',
    numero_carta_relacionado: 20,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'A Morte transforma e purifica para que o Julgamento possa ressuscitar. A destruição é seguida pela ressurreição quando a alma é chamada a renascer em nova forma.',
  },
  // 14 - A Temperança
  14: {
    numero_carta: 14,
    arcano: 'A Temperança',
    arcano_relacionado: 'A Imperatriz',
    numero_carta_relacionado: 3,
    tipo_relacao: 'reflexo',
    significado_espiritual: 'A Temperança equilibra os opostos em harmonia criativa enquanto a Imperatriz manifesta essa harmonia na criação visível. A moderação é a base da verdadeira fertilidade.',
  },
  // 15 - O Diabo
  15: {
    numero_carta: 15,
    arcano: 'O Diabo',
    arcano_relacionado: 'A Estrela',
    numero_carta_relacionado: 17,
    tipo_relacao: 'oposto',
    significado_espiritual: 'O Diabo representa o aprisionamento às forças inferiores enquanto a Estrela traz a esperança de liberdade. O caminho da redenção transforma as correntes da matéria em asas de luz.',
  },
  // 16 - A Torre
  16: {
    numero_carta: 16,
    arcano: 'A Torre',
    arcano_relacionado: 'A Roda da Fortuna',
    numero_carta_relacionado: 10,
    tipo_relacao: 'cabalistico',
    significado_espiritual: 'A Torre é o momento de revelação súbita que segue os ciclos da Roda. A queda forçada da Torre quebra os véus que a Roda mantinha em movimento aparentemente aleatório.',
  },
  // 17 - A Estrela
  17: {
    numero_carta: 17,
    arcano: 'A Estrela',
    arcano_relacionado: 'O Hierofante',
    numero_carta_relacionado: 5,
    tipo_relacao: 'reflexo',
    significado_espiritual: 'A Estrela traz esperança restaurada e iluminação futura enquanto o Hierofante representa a tradição estabelecida. A estrela guia o peregrino de volta às raízes sagradas.',
  },
  // 18 - A Lua
  18: {
    numero_carta: 18,
    arcano: 'A Lua',
    arcano_relacionado: 'O Sol',
    numero_carta_relacionado: 19,
    tipo_relacao: 'oposto',
    significado_espiritual: 'A Lua ilumina com luz refletida e ilusões enquanto o Sol irradia verdade absoluta. O caminho da lua leva ao sol, transformando o reflexo em claridade direta.',
  },
  // 19 - O Sol
  19: {
    numero_carta: 19,
    arcano: 'O Sol',
    arcano_relacionado: 'O Eremita',
    numero_carta_relacionado: 9,
    tipo_relacao: 'oposto',
    significado_espiritual: 'O Sol irradia luz universal enquanto o Eremita busca a mesma luz na interioridade. Ambos representam iluminação, um externamente e outro internamente.',
  },
  // 20 - O Julgamento
  20: {
    numero_carta: 20,
    arcano: 'O Julgamento',
    arcano_relacionado: 'A Morte',
    numero_carta_relacionado: 13,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'O Julgamento segue a Morte como ressurreição da alma. A transformação da morte culmina no chamado do julgamento que proclama o renascimento espiritual.',
  },
  // 21 - O Mundo
  21: {
    numero_carta: 21,
    arcano: 'O Mundo',
    arcano_relacionado: 'O Louco',
    numero_carta_relacionado: 0,
    tipo_relacao: 'sequencial',
    significado_espiritual: 'O Mundo representa a conclusão do ciclo que começou com O Louco. A jornada completa retorna ao ponto de partida onde o viajante se torna uno com o todo.',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(TAROT_TAROT_MAP);
Object.values(TAROT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the tarot-tarot mapping for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns TarotTarotMapping or null if not found
 */
export function getTarotTarot(numeroCarta: number): TarotTarotMapping | null {
  if (numeroCarta < 0 || numeroCarta > 21) {
    return null;
  }
  return TAROT_TAROT_MAP[numeroCarta] ?? null;
}

/**
 * Get the related card number for a given card.
 * @param numeroCarta - Card number (0-21)
 * @returns Related card number or null if not found
 */
export function getCartaRelacionada(numeroCarta: number): number | null {
  return getTarotTarot(numeroCarta)?.numero_carta_relacionado ?? null;
}

/**
 * Get the related arcano name for a given card.
 * @param numeroCarta - Card number (0-21)
 * @returns Related arcano name or null if not found
 */
export function getArcanoRelacionado(numeroCarta: number): string | null {
  return getTarotTarot(numeroCarta)?.arcano_relacionado ?? null;
}

/**
 * Get the relationship type for a given card.
 * @param numeroCarta - Card number (0-21)
 * @returns Relationship type or null if not found
 */
export function getTipoRelacao(numeroCarta: number): string | null {
  return getTarotTarot(numeroCarta)?.tipo_relacao ?? null;
}

/**
 * Get the spiritual significance for a given card.
 * @param numeroCarta - Card number (0-21)
 * @returns Spiritual significance or null if not found
 */
export function getSignificadoEspiritual(numeroCarta: number): string | null {
  return getTarotTarot(numeroCarta)?.significado_espiritual ?? null;
}

/**
 * Get the arcano name for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumber(numeroCarta: number): string | null {
  return getTarotTarot(numeroCarta)?.arcano ?? null;
}

/**
 * Get all tarot-tarot mappings.
 * @returns Array of all TarotTarotMapping
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all arcano names used in the mapping.
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return getAllTarotTarots().map((m) => m.arcano);
}

/**
 * Get mappings filtered by relationship type.
 * @param tipo - Relationship type (oposto, complementar, sequencial, reflexo, cabalistico)
 * @returns Array of TarotTarotMapping matching the type
 */
export function getTarotTarotsByType(tipo: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.tipo_relacao === tipo);
}

/**
 * Check if a card number exists in the mapping.
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

/**
 * Get the reverse mapping (find card that relates to given card).
 * @param numeroCarta - Card number to find the related card for (0-21)
 * @returns TarotTarotMapping or null if not found
 */
export function getReverseMapping(numeroCarta: number): TarotTarotMapping | null {
  const mapping = getTarotTarot(numeroCarta);
  if (!mapping) return null;
  return getTarotTarot(mapping.numero_carta_relacionado);
}

/**
 * Get all cards with opposite relationships.
 * @returns Array of TarotTarotMapping with tipo_relacao = 'oposto'
 */
export function getOppositeRelationships(): TarotTarotMapping[] {
  return getTarotTarotsByType('oposto');
}

/**
 * Get all cards with complementary relationships.
 * @returns Array of TarotTarotMapping with tipo_relacao = 'complementar'
 */
export function getComplementaryRelationships(): TarotTarotMapping[] {
  return getTarotTarotsByType('complementar');
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarot,
  getCartaRelacionada,
  getArcanoRelacionado,
  getTipoRelacao,
  getSignificadoEspiritual,
  getArcanoByNumber,
  getAllTarotTarots,
  getAllArcanos,
  getTarotTarotsByType,
  hasTarotTarot,
  getReverseMapping,
  getOppositeRelationships,
  getComplementaryRelationships,
  TAROT_TAROT_MAP,
};