/**
 * Tarot Major Arcana - Odu Ifá Correlation Mapping
 * Correlates the 22 Tarot Major Arcana cards with Odu Ifá (Merindilogun)
 * Inverse mapping of odu-tarot.ts - keyed by arcano number for Tarot-first lookups
 */

export interface TarotOduMapping {
  /** The Tarot Major Arcana card */
  arcano: {
    /** Arcano number (0-21) */
    numero: number;
    /** Arcano name in Portuguese */
    nome: string;
  };
  /** The corresponding Odu Ifá */
  odu: {
    /** Odu number (1-16) */
    numero: number;
    /** Odu name in Portuguese */
    nome: string;
    /** Odu name in Yoruba/English */
    nomeingles: string;
  };
  /** Element connection (Terra, Água, Fogo, Ar, Éter) */
  elemento: string;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
}

// ─── Tarot Major Arcana to Odu Ifá Mapping ──────────────────────────────────
// Maps 22 Major Arcana cards to their Odu Ifá correspondences
// Based on the inverse of ODU_TAROT_MAPPINGS from odu-tarot.ts

export const TAROT_ODU_MAPPINGS: Record<number, TarotOduMapping> = {
  // ─── Major Arcana Cards ────────────────────────────────────────────────────

  0: {
    arcano: {
      numero: 0,
      nome: 'O Louco',
    },
    odu: {
      numero: 1,
      nome: 'Okaran',
      nomeingles: 'Okaran',
    },
    elemento: 'Éter',
    significado_espiritual:
      'O Louco representa o início absoluto, a coragem de seguir novos caminhos sem olhar para trás. Correlaciona-se com Okaran, que traz o primeiro sopro da jornada espiritual. Ambos falam da fé pura, do salto no vazio, da disposição para enfrentar o desconhecido com coração aberto.',
  },

  1: {
    arcano: {
      numero: 1,
      nome: 'O Mago',
    },
    odu: {
      numero: 15,
      nome: 'Ogbogbé',
      nomeingles: 'Ogbogbé',
    },
    elemento: 'Ar',
    significado_espiritual:
      'O Mago representa o poder pessoal, a manifestação através da vontade e o domínio das ferramentas internas. Correlaciona-se com Ogbogbé, que traz a força da magia e da transformação. Juntos revelam que toda criação começa com a intenção clara e o uso consciente dos recursos disponíveis.',
  },

  2: {
    arcano: {
      numero: 2,
      nome: 'A Sacerdotisa',
    },
    odu: {
      numero: 2,
      nome: 'Ejiokô',
      nomeingles: 'Ejiokô',
    },
    elemento: 'Água',
    significado_espiritual:
      'A Sacerdotisa representa o conhecimento oculto, a intuição profunda, o véu entre dois mundos. Correlaciona-se com Ejiokô, que fala da dualidade e dos caminhos paralelos. Juntos revelam que toda escolha importante envolve equilibrar forças opostas e confiar no conhecimento silencioso que vem de dentro.',
  },

  3: {
    arcano: {
      numero: 3,
      nome: 'A Imperatriz',
    },
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nomeingles: 'Oyekun',
    },
    elemento: 'Terra',
    significado_espiritual:
      'A Imperatriz é a fertilidade, a criação abundante, o princípio feminino divino. Correlaciona-se com Etaogundá, que traz a força da revolta e o poder de transformar a matéria. Ambos representam o poder de trazer algo do nada, de criar vida e riqueza através da força de vontade criadora.',
  },

  4: {
    arcano: {
      numero: 4,
      nome: 'O Imperador',
    },
    odu: {
      numero: 11,
      nome: 'Owarin',
      nomeingles: 'Owarin',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'O Imperador representa a autoridade, a estrutura e o controle sobre o mundo material. Correlaciona-se com Owarin, que traz a pressa, as mudanças rápidas e a força interior. Juntos revelam que a verdadeira liderança vem da capacidade de manter a ordem enquanto se adapta às transformações necessárias.',
  },

  5: {
    arcano: {
      numero: 5,
      nome: 'O Hierofante',
    },
    odu: {
      numero: 5,
      nome: 'Oxé',
      nomeingles: 'Oxé',
    },
    elemento: 'Ar',
    significado_espiritual:
      'O Hierofante representa a sabedoria institucional, a tradição sagrada, o mestre que transmite a doutrina divina. Correlaciona-se com Oxé, que traz o ouro espiritual, a feitiçaria sagrada e a lágrima da tradição. Ambos revelam que a verdadeira magia está na cerimônia, no ritual, na honra às tradições ancestrais.',
  },

  6: {
    arcano: {
      numero: 6,
      nome: 'Os Enamorados',
    },
    odu: {
      numero: 8,
      nome: 'EjiOníle',
      nomeingles: 'EjiOníle',
    },
    elemento: 'Ar',
    significado_espiritual:
      'Os Enamorados representam a escolha sagrada, a união dos opostos e o poder do amor. Correlaciona-se com EjiOníle, que traz a cabeça (Ori), a liderança e o sangue branco da sabedoria. Juntos confirmam que a verdadeira escolha vem do equilíbrio entre coração e mente, entre desejo e propósito.',
  },

  7: {
    arcano: {
      numero: 7,
      nome: 'O Carro',
    },
    odu: {
      numero: 7,
      nome: 'Odi',
      nomeingles: 'Odi',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'O Carro representa a vitória através da vontade, o domínio sobre as polaridades, a condução do impulso para o destino. Correlaciona-se com Odi, que fala do poço profundo, das coisas ocultas, da teimosia que transforma morte em renascimento. Ambos falam da disciplina interior necessária para vencer batalhas invisíveis.',
  },

  8: {
    arcano: {
      numero: 8,
      nome: 'A Força',
    },
    odu: {
      numero: 11,
      nome: 'Owarin',
      nomeingles: 'Owarin',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'A Força representa o domínio da paixão, a coragem de enfrentar os medos interiores, o poder da gentileza sobre a ferocidade. Correlaciona-se com Owarin, que fala da pressa e das mudanças rápidas. Ambos revelam que a verdadeira força está em manter a calma quando tudo ao redor muda, em dominar o fogo interior.',
  },

  9: {
    arcano: {
      numero: 9,
      nome: 'O Eremita',
    },
    odu: {
      numero: 9,
      nome: 'Ossá',
      nomeingles: 'Ossá',
    },
    elemento: 'Terra',
    significado_espiritual:
      'O Eremita é a busca solitária, a luz interior que guia através da escuridão, a sabedoria conquistada na solidão. Correlaciona-se com Ossá, que é o vento, as transformações rápidas e o domínio das Iyami. Ambos revelam que o poder verdadeiro exige recolhimento, que a transformação mais profunda acontece longe do olhar público.',
  },

  10: {
    arcano: {
      numero: 10,
      nome: 'A Roda da Fortuna',
    },
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'A Roda da Fortuna representa os ciclos inevitáveis, a mudança de destino, a lei de causa e efeito em movimento. Correlaciona-se com Ofun, que traz o mistério, a velhice, a cura, o sopro divino que transforma túmulo em berço. Ambos ensinam que nenhum destino é permanente, que a roda sempre gira.',
  },

  11: {
    arcano: {
      numero: 11,
      nome: 'A Justiça',
    },
    odu: {
      numero: 8,
      nome: 'EjiOníle',
      nomeingles: 'EjiOníle',
    },
    elemento: 'Ar',
    significado_espiritual:
      'A Justiça revela o equilíbrio kármico, a verdade que pesa com precisão, as consequências inevitáveis de toda ação. Correlaciona-se com EjiOníle, que representa a cabeça (Ori), a liderança e o topo do mundo. Juntos confirmam que a verdadeira liderança vem da retidão e da capacidade de equilibrar causas e efeitos.',
  },

  12: {
    arcano: {
      numero: 12,
      nome: 'O Enforcado',
    },
    odu: {
      numero: 14,
      nome: 'Iká',
      nomeingles: 'Iká',
    },
    elemento: 'Água',
    significado_espiritual:
      'O Enforcado mostra o sacrifício voluntário, a nova perspectiva alcançada através da entrega, o suspendimento do ego. Correlaciona-se com Iká, que representa a traição, a cobra que morde, a sabedoria oculta na renovação da pele. Ambos revelam que a sabedoria mais profunda vem de aceitar reverses temporariamente.',
  },

  13: {
    arcano: {
      numero: 13,
      nome: 'A Morte',
    },
    odu: {
      numero: 13,
      nome: 'Olobón',
      nomeingles: 'Olobón',
    },
    elemento: 'Água',
    significado_espiritual:
      'A Morte representa a transformação inevitável, o fim de ciclos, a reencarnação da alma. Correlaciona-se com Olobón, que traz a doença, as transformações físicas, o recolhimento necessário para a evolução. Ambos ensinam que toda morte é um nascimento disfarçado, que o fim de uma coisa é sempre o começo de outra.',
  },

  14: {
    arcano: {
      numero: 14,
      nome: 'A Temperança',
    },
    odu: {
      numero: 6,
      nome: 'Obará',
      nomeingles: 'Obará',
    },
    elemento: 'Água',
    significado_espiritual:
      'A Temperança representa o equilíbrio, a harmonização dos opostos, a moderação sagrada. Correlaciona-se com Obará, que traz a riqueza, a fartura e a sabedoria. Juntos revelam que a verdadeira abundância vem do equilíbrio entre dar e receber, entre esforço e receptividade.',
  },

  15: {
    arcano: {
      numero: 15,
      nome: 'O Diabo',
    },
    odu: {
      numero: 15,
      nome: 'Ogbogbé',
      nomeingles: 'Ogbogbé',
    },
    elemento: 'Terra',
    significado_espiritual:
      'O Diabo representa a ilusão material, os vínculos inferiores, a sombra que nos prende. Correlaciona-se com Ogbogbé, que traz a feitiçaria, o corte pesado, as disputas por espaço ou poder. Ambos alertam sobre os perigos da magia sem ética, dos pactos que parecem bons mas prendem a alma.',
  },

  16: {
    arcano: {
      numero: 16,
      nome: 'A Torre',
    },
    odu: {
      numero: 12,
      nome: 'Ejilsebora',
      nomeingles: 'Ejilsebora',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'A Torre representa a destruição necessária, a queda das estruturas falsas, a iluminação que golpeia sem aviso. Correlaciona-se com Ejilsebora, que traz a justiça, o fogo purificador, a guerra justa que traz terramotos interiores. Ambos ensinam que às vezes o destino precisa quebrar nossa resistência antes de nos mostrar o caminho verdadeiro.',
  },

  17: {
    arcano: {
      numero: 17,
      nome: 'A Estrela',
    },
    odu: {
      numero: 16,
      nome: 'Alafia',
      nomeingles: 'Alafia',
    },
    elemento: 'Água',
    significado_espiritual:
      'A Estrela representa a esperança, a inspiração, a luz que guia após a tempestade. Correlaciona-se com Alafia, que é a paz absoluta, a luz total, a confirmação dos Deuses. Ambos derramam bênçãos de água renovadora sobre a alma cansada, prometendo que dias melhores virão para quem mantém a fé.',
  },

  18: {
    arcano: {
      numero: 18,
      nome: 'A Lua',
    },
    odu: {
      numero: 4,
      nome: 'Irosun',
      nomeingles: 'Irosun',
    },
    elemento: 'Água',
    significado_espiritual:
      'A Lua representa a intuição, o inconsciente, os sonhos e as ilusões. Correlaciona-se com Irosun, que é o aviso, a visão espiritual, o sangue que corre nas veias conectando o mundo visível ao invisível. Ambos operam no domínio do não-visto, alertando sobre perigos ocultos e guiando através das águas profundas da psique.',
  },

  19: {
    arcano: {
      numero: 19,
      nome: 'O Sol',
    },
    odu: {
      numero: 6,
      nome: 'Obará',
      nomeingles: 'Obará',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'O Sol irradia vitalidade, sucesso, clareza e brilho próprio. Correlaciona-se com Obará, que representa a riqueza, a fartura, a sabedoria e a surpresa. Ambos falam do sucesso manifesto, da abundância que brilha para todos verem, da realeza que se vê mesmo quando veste roupas simples.',
  },

  20: {
    arcano: {
      numero: 20,
      nome: 'O Julgamento',
    },
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    elemento: 'Fogo',
    significado_espiritual:
      'O Julgamento representa o despertar, a chiamada interior, o renascimento da consciência. Correlaciona-se com Ofun, que traz a cura, o sopro divino que transforma túmulo em berço. Ambos falam da ressurreição interior, do chamado para uma nova vida baseado nas escolhas passadas.',
  },

  21: {
    arcano: {
      numero: 21,
      nome: 'O Mundo',
    },
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nomeingles: 'Oyekun',
    },
    elemento: 'Terra',
    significado_espiritual:
      'O Mundo representa a completude, a integração, o fim de um ciclo maior. Correlaciona-se com Etaogundá, que traz a força criadora e o poder de trazer algo do nada. Ambos celebram a realização do propósito, a dança cósmica que completa uma grande jornada e convida a começar outra.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ODU_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_ODU_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Tarot-to-Odu correlation mapping for a given arcano number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getTarotOdu(arcanoNumero: number): TarotOduMapping | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero] ?? null;
}

/**
 * Get the Odu-Tarot correlation mapping (inverse lookup)
 * @param arcanoNome - The arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns The Odu number or null if not found
 */
export function getOduTarot(arcanoNome: string): number | null {
  const entry = Object.values(TAROT_ODU_MAPPINGS).find(
    (mapping) => mapping.arcano.nome === arcanoNome
  );
  return entry?.odu.numero ?? null;
}

/**
 * Get all available Tarot-Odu mappings
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotOdus(): TarotOduMapping[] {
  return Object.values(TAROT_ODU_MAPPINGS).sort(
    (a, b) => a.arcano.numero - b.arcano.numero
  );
}

/**
 * Get all arcano numbers
 * @returns Array of arcano numbers from 0 to 21
 */
export function getAllArcanoNumbers(): number[] {
  return Object.keys(TAROT_ODU_MAPPINGS)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanoNomes(): string[] {
  return Object.values(TAROT_ODU_MAPPINGS)
    .map((m) => m.arcano.nome)
    .sort();
}

/**
 * Get all Odu numbers
 * @returns Array of unique Odu numbers that appear in the mappings
 */
export function getAllOduNumbers(): number[] {
  const oduNumbers = new Set(
    Object.values(TAROT_ODU_MAPPINGS).map((m) => m.odu.numero)
  );
  return Array.from(oduNumbers).sort((a, b) => a - b);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcanoNumero - Arcano number to check (0-21)
 * @returns True if arcano exists in mapping
 */
export function hasTarotOdu(arcanoNumero: number): boolean {
  return arcanoNumero in TAROT_ODU_MAPPINGS;
}

/**
 * Check if an arcano name exists in the mapping
 * @param arcanoNome - Arcano name to check
 * @returns True if arcano name exists in mapping
 */
export function hasArcano(arcanoNome: string): boolean {
  return Object.values(TAROT_ODU_MAPPINGS).some(
    (m) => m.arcano.nome === arcanoNome
  );
}

/**
 * Get the arcano name by number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoNome(arcanoNumero: number): string | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero]?.arcano.nome ?? null;
}

/**
 * Get the Odu number for a given arcano number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns Odu number or null if not found
 */
export function getOduByArcano(arcanoNumero: number): number | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero]?.odu.numero ?? null;
}

/**
 * Get the Odu name for a given arcano number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns Odu name or null if not found
 */
export function getOduNome(arcanoNumero: number): string | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero]?.odu.nome ?? null;
}

/**
 * Get the element for a given arcano number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns Element name or null if not found
 */
export function getElementByArcano(arcanoNumero: number): string | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero]?.elemento ?? null;
}

/**
 * Get the spiritual meaning for a given arcano number
 * @param arcanoNumero - The arcano number (0-21)
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoByArcano(arcanoNumero: number): string | null {
  return TAROT_ODU_MAPPINGS[arcanoNumero]?.significado_espiritual ?? null;
}

/**
 * Get all arcano mappings that share the same element
 * @param elemento - Element name (Terra, Água, Fogo, Ar, Éter)
 * @returns Array of TarotOduMapping or empty array
 */
export function getTarotOdusByElement(elemento: string): TarotOduMapping[] {
  return Object.values(TAROT_ODU_MAPPINGS).filter(
    (m) => m.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get all arcano mappings that share the same Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Array of TarotOduMapping or empty array
 */
export function getTarotOdusByOdu(oduNumero: number): TarotOduMapping[] {
  return Object.values(TAROT_ODU_MAPPINGS).filter(
    (m) => m.odu.numero === oduNumero
  );
}

/**
 * Default export with all functions
 */
export default {
  getTarotOdu,
  getOduTarot,
  getAllTarotOdus,
  getAllArcanoNumbers,
  getAllArcanoNomes,
  getAllOduNumbers,
  hasTarotOdu,
  hasArcano,
  getArcanoNome,
  getOduByArcano,
  getOduNome,
  getElementByArcano,
  getSignificadoByArcano,
  getTarotOdusByElement,
  getTarotOdusByOdu,
  TAROT_ODU_MAPPINGS,
};