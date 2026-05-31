/**
 * Tarot-Planet Spiritual Correlation Module
 * Maps Major Arcana tarot cards (0-21) to planetary influences with spiritual connections.
 * Source: Cabala dos Caminhos spiritual system
 */

/** The 22 Major Arcana tarot cards (0-21) in Portuguese */
export type TarotArcana =
  | 'O Louco'
  | 'O Mago'
  | 'A Alta Sacerdotisa'
  | 'A Imperatriz'
  | 'O Imperador'
  | 'O Hierofante'
  | 'Os Enamorados'
  | 'O Carro'
  | 'A Justiça'
  | 'O Eremita'
  | 'A Roda da Fortuna'
  | 'A Força'
  | 'O Eremita (invertido)'
  | 'A Morte'
  | 'A Temperança'
  | 'O Diabo'
  | 'A Torre'
  | 'A Estrela'
  | 'A Lua'
  | 'O Sol'
  | 'O Julgamento'
  | 'O Mundo';

/** Classical and modern planets in astrology */
export type Planeta =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vénus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno'
  | 'Urano'
  | 'Neptuno'
  | 'Plutão';

/**
 * Represents the correlation between a Tarot Major Arcana card and its planetary correspondence
 */
export interface TarotPlanetMapping {
  /** The name of the Major Arcana card in Portuguese */
  arcano: TarotArcana;
  /** The card number (0-21) */
  numero_carta: number;
  /** The ruling planet for this card */
  planeta: Planeta;
  /** The associated element */
  elemento: string;
  /** Spiritual meaning and significance */
  significado_spiritual: {
    descricao: string;
    qualidade_cosmica: string;
    lição_espiritual: string;
  };
  /** Manifestation energy and shadow aspects */
  energia_manifestacao: {
    foco: string;
    força: string;
    sombra: string;
  };
}

/**
 * Complete mapping of the 22 Major Arcana cards to their ruling planets.
 * Based on traditional tarot symbolism and astrological correspondences
 * from the Cabala dos Caminhos spiritual system.
 */
export const TAROT_PLANET_MAP: Record<number, TarotPlanetMapping> = {
  // 0. O Louco - Urano - Revolution, freedom, spontaneity
  0: {
    arcano: 'O Louco',
    numero_carta: 0,
    planeta: 'Urano',
    elemento: 'Ar',
    significado_spiritual: {
      descricao: 'O início da jornada espiritual, representando a突破 das limitações e a abertura para o novo.',
      qualidade_cosmica: 'Liberdade e transcendência',
      lição_espiritual: 'Aprender a confiar no fluxo universal sem medo do desconhecido.',
    },
    energia_manifestacao: {
      foco: 'Renovação e libertação',
      força: 'Inovação, autenticidade, coragem de ser',
      sombra: 'Irresponsabilidade, fuga da realidade, caos',
    },
  },

  // I. O Mago - Mercúrio - Manifestation, skill, will
  1: {
    arcano: 'O Mago',
    numero_carta: 1,
    planeta: 'Mercúrio',
    elemento: 'Ar',
    significado_spiritual: {
      descricao: 'A expressão do poder pessoal e da capacidade de manifestar intenções no mundo material.',
      qualidade_cosmica: 'Vontade e habilidade',
      lição_espiritual: 'Reconhecer que todos os recursos necessários já estão disponíveis dentro de nós.',
    },
    energia_manifestacao: {
      foco: 'Manifestação e habilidade',
      força: 'Comunicação, inteligência, poder de ação',
      sombra: 'Manipulação, ilusão, fraude',
    },
  },

  // II. A Alta Sacerdotisa - Lua - Intuition, mystery, the unconscious
  2: {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    planeta: 'Lua',
    elemento: 'Água',
    significado_espiritual: {
      descricao: 'O portal para o conhecimento interior e a sabedoria dos mistérios ocultos.',
      qualidade_cosmica: 'Intuição e mistério',
      lição_espiritual: 'Desenvolver a escuta interior e confiar na sabedoria do inconsciente.',
    },
    energia_manifestacao: {
      foco: 'Intuição e mistério',
      força: 'Sensibilidade, imaginação, percepção extrasensorial',
      sombra: 'Ilusão, confusão, manipulação emocional',
    },
  },

  // III. A Imperatriz - Vénus - Fertility, beauty, nature
  3: {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    planeta: 'Vénus',
    elemento: 'Terra',
    significado_espiritual: {
      descricao: 'A expressão do princípio feminino, da criatividade, fertilidade e beleza natural.',
      qualidade_cosmica: 'Fertilidade e abundância',
      lição_espiritual: 'Honrar a natureza e o sagrado feminino em todas as suas formas.',
    },
    energia_manifestacao: {
      foco: 'Criatividade e fertilidade',
      força: 'Amor, beleza, abundância, fertilidade',
      sombra: 'Dependência, obsessão, superficialidade',
    },
  },

  // IV. O Imperador - Carneiro (Exaltação de Marte) - Authority, structure, father figure
  4: {
    arcano: 'O Imperador',
    numero_carta: 4,
    planeta: 'Marte',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O princípio masculino ativo, representando autoridade, estrutura e ordem.',
      qualidade_cosmica: 'Autoridade e ordem',
      lição_espiritual: 'Estabelecer limites saudáveis e criar estrutura para realizar objetivos.',
    },
    energia_manifestacao: {
      foco: 'Autoridade e estrutura',
      força: 'Liderança, disciplina, ambição',
      sombra: 'Tirania, inflexibilidade, dominação',
    },
  },

  // V. O Hierofante - Júpiter - Spiritual wisdom, tradition, conformity
  5: {
    arcano: 'O Hierofante',
    numero_carta: 5,
    planeta: 'Júpiter',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O guardião da sabedoria espiritual e dos ensinamentos tradicionais.',
      qualidade_cosmica: 'Sabedoria e tradição',
      lição_espiritual: 'Buscar orientação em tradições espirituais estabelecidas.',
    },
    energia_manifestacao: {
      foco: 'Sabedoria e tradição',
      força: 'Fé, moralidade, ensino, tradição',
      sombra: 'Fanatismo, rigidez, dogmatismo',
    },
  },

  // VI. Os Enamorados - Vénus - Love, choice, union
  6: {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    planeta: 'Vénus',
    elemento: 'Ar',
    significado_espiritual: {
      descricao: 'O momento de escolha que define o caminho da alma em matters de amor e união.',
      qualidade_cosmica: 'Amor e escolha',
      lição_espiritual: 'Fazer escolhas alinhadas com o coração e aceitar as consequências.',
    },
    energia_manifestacao: {
      foco: 'Amor e escolha',
      força: 'União,harmonia,devoção,atratividade',
      sombra: 'Indecisão, conflito interior, apego',
    },
  },

  // VII. O Carro - Marte - Triumph, willpower, success
  7: {
    arcano: 'O Carro',
    numero_carta: 7,
    planeta: 'Marte',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'A vitória através da força de vontade e da disciplina interior.',
      qualidade_cosmica: 'Triunfo e vontade',
      lição_espiritual: 'Canalizar a energia de ação de forma disciplinada e focada.',
    },
    energia_manifestacao: {
      foco: 'Triunfo e vontade',
      força: 'Determinação, controle, conquista',
      sombra: 'Agressividade, impaciência, arrogância',
    },
  },

  // VIII. A Justiça - Libra (Exaltação de Saturno) - Justice, fairness, truth
  8: {
    arcano: 'A Justiça',
    numero_carta: 8,
    planeta: 'Saturno',
    elemento: 'Ar',
    significado_espiritual: {
      descricao: 'A lei cósmica de causa e efeito, representando equilíbrio e verdade.',
      qualidade_cosmica: 'Justiça e equilíbrio',
      lição_espiritual: 'Assumir responsabilidade pelas ações e buscar a verdade.',
    },
    energia_manifestacao: {
      foco: 'Justiça e verdade',
      força: 'Honestidade, integridade, equilíbrio',
      sombra: 'Rigor, severidade, culpa',
    },
  },

  // IX. O Eremita - Netuno - Introspection, solitude, guidance
  9: {
    arcano: 'O Eremita',
    numero_carta: 9,
    planeta: 'Netuno',
    elemento: 'Terra',
    significado_espiritual: {
      descricao: 'A jornada interior de busca por iluminação através da solidão e reflexão.',
      qualidade_cosmica: 'Iluminação interior',
      lição_espiritual: 'Buscar a luz interior através da introspecção e do silêncio.',
    },
    energia_manifestacao: {
      foco: 'Introspecção e busca',
      força: 'Sabedoria, introspecção, auto-reflexão',
      sombra: 'Isolamento, fugafobia, solidão excessiva',
    },
  },

  // X. A Roda da Fortuna - Júpiter - Cycles, fate, turning point
  10: {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    planeta: 'Júpiter',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O ciclo eterno de destino e mudança, mostrando que tudo volta.',
      qualidade_cosmica: 'Destino e ciclos',
      lição_espiritual: 'Aceitar as mudanças como parte natural da vida e aprender com elas.',
    },
    energia_manifestacao: {
      foco: 'Destino e mudança',
      força: 'Sorte, mudança, destino,karma',
      sombra: 'Fate, azar, ciclo vicioso',
    },
  },

  // XI. A Força - Netuno (tradicionalmente Leo) - Courage, patience, inner strength
  11: {
    arcano: 'A Força',
    numero_carta: 11,
    planeta: 'Netuno',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O poder da alma sobre os instintos, demonstrando coragem e compaixão.',
      qualidade_cosmica: 'Força interior',
      lição_espiritual: 'Dominar os instintos através da força da alma e da compaixão.',
    },
    energia_manifestacao: {
      foco: 'Coragem e força interior',
      força: 'Coragem, paciência, compaixão, autocontrole',
      sombra: 'Vergonha, auto-dúvida, fraqueza',
    },
  },

  // XII. O Eremita (invertido) / O Homem Pendurado - Mercurio (invertido) - Surrender, letting go
  12: {
    arcano: 'O Eremita (invertido)',
    numero_carta: 12,
    planeta: 'Mercúrio',
    elemento: 'Água',
    significado_espiritual: {
      descricao: 'A pausa forçada para revisão de valores e perspectiva interior.',
      qualidade_cosmica: 'Sacrifício e rendição',
      lição_espiritual: 'Soltar o controle e aceitar novas perspectivas.',
    },
    energia_manifestacao: {
      foco: 'Rendição e sacrifício',
      força: 'Sacrifício, fluidez, novo ângulo',
      sombra: 'Estagnação, vitimismo, conformismo',
    },
  },

  // XIII. A Morte - Plutão - Transformation, endings, rebirth
  13: {
    arcano: 'A Morte',
    numero_carta: 13,
    planeta: 'Plutão',
    elemento: 'Água',
    significado_espiritual: {
      descricao: 'A transformação inevitável que abre espaço para o renascimento.',
      qualidade_cosmica: 'Transformação e renascimento',
      lição_espiritual: 'Abraçar as terminações como portais para novos começos.',
    },
    energia_manifestacao: {
      foco: 'Transformação e metamorfose',
      força: 'Transformação, regeneração, renovação',
      sombra: 'Medo da mudança, estagnação, obsessão',
    },
  },

  // XIV. A Temperança - Sagitário (Exaltação de Netuno) - Balance, moderation, patience
  14: {
    arcano: 'A Temperança',
    numero_carta: 14,
    planeta: 'Netuno',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O equilíbrio entre extremos, criando harmonia através da moderação.',
      qualidade_cosmica: 'Equilíbrio e integração',
      lição_espiritual: 'Encontrar o ponto médio entre os extremos e integrar opostos.',
    },
    energia_manifestacao: {
      foco: 'Equilíbrio e moderação',
      força: 'Moderação, paciência, harmonia, cura',
      sombra: 'Excesso, fanatismo, ilusão',
    },
  },

  // XV. O Diabo - Saturno (tradicionalmente Capricórnio) - Shadow, bondage, material world
  15: {
    arcano: 'O Diabo',
    numero_carta: 15,
    planeta: 'Saturno',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'A sombra do inconsciente e as correntes da ilusão terrena.',
      qualidade_cosmica: 'Ilusão e sombras',
      lição_espiritual: 'Reconhecer e libertar-se das prisões criadas pela mente.',
    },
    energia_manifestacao: {
      foco: 'Ilusão e sombras',
      força: 'Conexão com sombras, criatividade sombria',
      sombra: 'Vínculos,addicções,materialismo,manipulação',
    },
  },

  // XVI. A Torre - Marte - Destruction, upheaval, revelation
  16: {
    arcano: 'A Torre',
    numero_carta: 16,
    planeta: 'Marte',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'A destruição das estruturas falsas para revelar a verdade oculta.',
      qualidade_cosmica: 'Revelação através da destruição',
      lição_espiritual: 'Aceitar que a demolição de estruturas rígidas liberta.',
    },
    energia_manifestacao: {
      foco: 'Destruição criativa',
      força: 'Liberdade, revelação, despertar, mudança brusca',
      sombra: 'Colapso, trauma, dor,ruptura',
    },
  },

  // XVII. A Estrela - Aquário (Exaltação de Vénus) - Hope, faith, future
  17: {
    arcano: 'A Estrela',
    numero_carta: 17,
    planeta: 'Vénus',
    elemento: 'Ar',
    significado_espiritual: {
      descricao: 'A estrela guia que traz esperança e fé no futuro luminoso.',
      qualidade_cosmica: 'Esperança e fé',
      lição_espiritual: 'Manter a fé e a esperança mesmo após as tempestades.',
    },
    energia_manifestacao: {
      foco: 'Esperança e renovação',
      força: 'Esperança, inspiração, fé, serenidade',
      sombra: 'Desespero, desconfiança, broken faith',
    },
  },

  // XVIII. A Lua - Lua - Illusion, fear, unconscious
  18: {
    arcano: 'A Lua',
    numero_carta: 18,
    planeta: 'Lua',
    elemento: 'Água',
    significado_espiritual: {
      descricao: 'O reino das ilusões e dos medos inconscientes que precisam ser enfrentados.',
      qualidade_cosmica: 'Ilusão e mistério',
      lição_espiritual: 'Ver através das ilusões e enfrentar os medos ocultos.',
    },
    energia_manifestacao: {
      foco: 'Intuição e ilusão',
      força: 'Imaginación, intuição, creativity',
      sombra: 'Confusion, fear, ilusión, engaño',
    },
  },

  // XIX. O Sol - Sol - Joy, success, vitality
  19: {
    arcano: 'O Sol',
    numero_carta: 19,
    planeta: 'Sol',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'A luz solar que traz alegria, sucesso e vitalidade radiante.',
      qualidade_cosmica: 'Vitória e alegria',
      lição_espiritual: 'Receber a luz do sol interior e deixar brilhar sua verdade.',
    },
    energia_manifestacao: {
      foco: 'Vitória e alegria',
      força: 'Alegria, éxito, vitalidade, claridad',
      sombra: 'Ego, arrogancia, exceso de confianza',
    },
  },

  // XX. O Julgamento - Plutão (tradicionalmente Plutão) - Judgment, rebirth, calling
  20: {
    arcano: 'O Julgamento',
    numero_carta: 20,
    planeta: 'Plutão',
    elemento: 'Fogo',
    significado_espiritual: {
      descricao: 'O chamado para renascimento espiritual e o julgamento da alma.',
      qualidade_cosmica: 'Renascimento e chamada',
      lição_espiritual: 'Responder ao chamado interior e permitir o renascimento da alma.',
    },
    energia_manifestacao: {
      foco: 'Julgamento e renascimento',
      força: 'Renascimento, llamada, trascendencia',
      sombra: 'Autojuicio, culpa, duda, condemnation',
    },
  },

  // XXI. O Mundo - Saturno (Exaltação de Júpiter) - Completion, integration, accomplishment
  21: {
    arcano: 'O Mundo',
    numero_carta: 21,
    planeta: 'Saturno',
    elemento: 'Terra',
    significado_spiritual: {
      descricao: 'A完成了 jornada cíclica e a integração de todas as lições aprendidas.',
      qualidade_cosmica: '完成了 e integração',
      lição_espiritual: 'Celentar a完成了 de um ciclo e preparar-se para um novo.',
    },
    energia_manifestacao: {
      foco: '完成了 e accomplishment',
      força: 'Logro, integración,洋洋, paz',
      sombra: 'Satisfacción, complacencia, stagnation',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(TAROT_PLANET_MAP);
Object.values(TAROT_PLANET_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 22 Major Arcana cards numbers (0-21)
 */
export const TODOS_ARCANOS: readonly number[] = Array.from({ length: 22 }, (_, i) => i) as const;

/**
 * All 10 planets (classical + modern) used in astrology
 */
export const TODOS_PLANETAS: readonly Planeta[] = [
  'Sol',
  'Lua',
  'Mercúrio',
  'Vénus',
  'Marte',
  'Júpiter',
  'Saturno',
  'Urano',
  'Neptuno',
  'Plutão',
] as const;

/**
 * Freeze arrays to prevent modifications
 */
Object.freeze(TODOS_ARCANOS);
Object.freeze(TODOS_PLANETAS);

/**
 * Get the tarot-planet mapping for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getTarotPlanet(numeroCarta: number): TarotPlanetMapping | null {
  if (numeroCarta < 0 || numeroCarta > 21) {
    return null;
  }
  return TAROT_PLANET_MAP[numeroCarta] ?? null;
}

/**
 * Get the card number associated with a given planet.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua')
 * @returns Card number or null if not found
 */
export function getPlanetTarot(planeta: string): number | null {
  const entry = Object.values(TAROT_PLANET_MAP).find((m) => m.planeta === planeta);
  return entry?.numero_carta ?? null;
}

/**
 * Get the planet for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Planeta or null if not found
 */
export function getPlanetaFromArcano(numeroCarta: number): Planeta | null {
  return TAROT_PLANET_MAP[numeroCarta]?.planeta ?? null;
}

/**
 * Get all tarot-planet mappings.
 * @returns Array of all correlation mappings
 */
export function getAllTarotPlanets(): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get the element for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Element string or null if not found
 */
export function getElementoFromArcano(numeroCarta: number): string | null {
  return TAROT_PLANET_MAP[numeroCarta]?.elemento ?? null;
}

/**
 * Get the spiritual description for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Spiritual description or null if not found
 */
export function getDescricaoEspiritual(numeroCarta: number): string | null {
  return TAROT_PLANET_MAP[numeroCarta]?.significado_spiritual.descricao ?? null;
}

/**
 * Get the arcano name for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoName(numeroCarta: number): TarotArcana | null {
  return TAROT_PLANET_MAP[numeroCarta]?.arcano ?? null;
}

/**
 * Get all cards ruled by a specific planet.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua')
 * @returns Array of TarotPlanetMapping
 */
export function getArcanosByPlaneta(planeta: string): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP).filter((m) => m.planeta === planeta);
}

/**
 * Get all cards associated with a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of TarotPlanetMapping
 */
export function getArcanosByElement(elemento: string): TarotPlanetMapping[] {
  return Object.values(TAROT_PLANET_MAP).filter((m) => m.elemento === elemento);
}

/**
 * Get the shadow energy for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Shadow string or null if not found
 */
export function getSombraFromArcano(numeroCarta: number): string | null {
  return TAROT_PLANET_MAP[numeroCarta]?.energia_manifestacao.sombra ?? null;
}

/**
 * Get all arcano names.
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): TarotArcana[] {
  return Object.values(TAROT_PLANET_MAP)
    .sort((a, b) => a.numero_carta - b.numero_carta)
    .map((m) => m.arcano);
}

/**
 * Check if a card number exists in the mapping.
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotPlanet(numeroCarta: number): boolean {
  return numeroCarta >= 0 && numeroCarta <= 21 && numeroCarta in TAROT_PLANET_MAP;
}

/**
 * Check if a planet has multiple cards.
 * @param planeta - Planet name
 * @returns true if planet rules multiple cards
 */
export function isPlanetaMultiplo(planeta: string): boolean {
  return getArcanosByPlaneta(planeta).length > 1;
}

/**
 * Get all planets that rule multiple cards.
 * @returns Array of Planeta names
 */
export function getPlanetasMultiplos(): Planeta[] {
  const counts = new Map<Planeta, number>();
  Object.values(TAROT_PLANET_MAP).forEach((m) => {
    counts.set(m.planeta, (counts.get(m.planeta) || 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([planeta]) => planeta);
}

/**
 * Get the quality for a given card number.
 * @param numeroCarta - Card number (0-21)
 * @returns Quality string or null if not found
 */
export function getQualidadeCosmica(numeroCarta: number): string | null {
  return TAROT_PLANET_MAP[numeroCarta]?.significado_spiritual.qualidade_cosmica ?? null;
}

/**
 * Default export with all public functions
 */
export default {
  getTarotPlanet,
  getPlanetTarot,
  getPlanetaFromArcano,
  getAllTarotPlanets,
  getElementoFromArcano,
  getDescricaoEspiritual,
  getArcanoName,
  getArcanosByPlaneta,
  getArcanosByElement,
  getSombraFromArcano,
  getAllArcanos,
  hasTarotPlanet,
  isPlanetaMultiplo,
  getPlanetasMultiplos,
  getQualidadeCosmica,
  TAROT_PLANET_MAP,
};