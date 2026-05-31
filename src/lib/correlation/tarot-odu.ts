/**
 * Tarot Major Arcana - Odu Ifá Correlation Mapping
 * Correlates Tarot Major Arcana cards to the 16 Odu Ifá (Merindilogun)
 * Based on IDEIA.md Tabela de Correspondência Macro - aligning Tarot archetypes with Ifá divination
 */

export interface TarotOduMapping {
  /** The Major Arcana card */
  arcano: {
    /** Card name (e.g., 'O Louco', 'A Sacerdotisa') */
    nome: string;
    /** Card number in the Major Arcana (0-21) */
    numero_carta: number;
  };
  /** The Odu Ifá */
  odu: {
    /** Odu number from 1 to 16 */
    numero: number;
    /** Odu name in Portuguese */
    nome: string;
    /** Odu name in Yoruba/Ifá */
    nomeingles: string;
  };
  /** Spiritual connection explaining the correlation */
  conexao_espiritual: string;
  /** Key symbolic meanings */
  simbolismo: string[];
}

// ─── Tarot Major Arcana to Odu Ifá Mapping ───────────────────────────────────

export const TAROT_ODU_MAPPINGS: Record<string, TarotOduMapping> = {
  // ─── Odu 1: Okaran ─────────────────────────────────────────────────────────
  'O Louco': {
    arcano: {
      nome: 'O Louco',
      numero_carta: 0,
    },
    odu: {
      numero: 1,
      nome: 'Okaran',
      nomeingles: 'Okaran',
    },
    conexao_espiritual:
      'O Louco representa o início absoluto, a coragem de seguir novos caminhos sem olhar para trás. Okaran embodies o mesmo espírito: o viajante que dá o primeiro passo sem conhecer o destino. Ambos falam da fé pura, do salto no vazio, da disposição para enfrentar o desconhecido com coração aberto.',
    simbolismo: [
      'Início absoluto',
      'Coragem perante o desconhecido',
      'Fe sem medo',
      'Jornada sem destino definido',
      'Libertação das convenções',
    ],
  },

  // ─── Odu 2: Ejiokô ──────────────────────────────────────────────────────────
  'A Sacerdotisa': {
    arcano: {
      nome: 'A Sacerdotisa',
      numero_carta: 2,
    },
    odu: {
      numero: 2,
      nome: 'Ejiokô',
      nomeingles: 'Ejiokô',
    },
    conexao_espiritual:
      'A Sacerdotisa representa o conhecimento oculto, a intuição profunda, o véu entre dois mundos. Ejiokô fala da dualidade, dos caminhos duplos, da união entre opostos. Juntos revelam que toda escolha importante envolve equilibrar forças opostas e confiar no conhecimento silencioso.',
    simbolismo: [
      'Dualidade e polaridade',
      'Escolhas paralelas',
      'Intuição secreta',
      'Conhecimento lunar',
      'Equilíbrio entre luz e sombra',
    ],
  },

  // ─── Odu 3: Etaogundá ───────────────────────────────────────────────────────
  'A Imperatriz': {
    arcano: {
      nome: 'A Imperatriz',
      numero_carta: 3,
    },
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nomeingles: 'Oyekun',
    },
    conexao_espiritual:
      'A Imperatriz é a fertilidade, a criação abundante, o princípio feminino divino. Etaogundá traz a força da revolta, a criação de ferramentas, o poder de transformar a matéria. Ambos representam o poder de trazer algo do nada, de criar vida e riqueza através da força de vontade.',
    simbolismo: [
      'Força criadora',
      'Fertilidade e abundância',
      'Poder sobre a matéria',
      'Criação de ferramentas',
      'Renascimento através da ação',
    ],
  },

  // ─── Odu 4: Irosun ─────────────────────────────────────────────────────────
  'A Lua': {
    arcano: {
      nome: 'A Lua',
      numero_carta: 18,
    },
    odu: {
      numero: 4,
      nome: 'Irosun',
      nomeingles: 'Irosun',
    },
    conexao_espiritual:
      'A Lua representa a intuição, o inconsciente, os sonhos e as ilusões. Irosun é o aviso, a visão espiritual, o sangue que corre nas veias conectando o mundo visível ao invisível. Ambos operam no domínio do não-visto, alertando sobre perigos ocultos e guiando através das águas profundas da psique.',
    simbolismo: [
      'Visão além do véu',
      'Intuição profunda',
      'Alertas do inconsciente',
      'Águas da psique',
      'Ilusões e realidade fluida',
    ],
  },

  // ─── Odu 5: Oxé ────────────────────────────────────────────────────────────
  'O Hierofante': {
    arcano: {
      nome: 'O Hierofante',
      numero_carta: 5,
    },
    odu: {
      numero: 5,
      nome: 'Oxé',
      nomeingles: 'Oxé',
    },
    conexao_espiritual:
      'O Hierofante representa a sabedoria institucional, a tradição sagrada, o mestre que transmite a doutrina divina. Oxé traz o ouro, a doçura, a feitiçaria e a lágrima sagrada. Ambos revelam que a verdadeira magia está na cerimônia, no ritual, na honra às tradições ancestrais que abrem portais de conhecimento.',
    simbolismo: [
      'Magia ceremonial',
      'Sabedoria tradicional',
      'Ouro espiritual',
      'Feitiçaria sagrada',
      'Transmissão de conhecimento',
    ],
  },

  // ─── Odu 6: Obará ──────────────────────────────────────────────────────────
  'O Sol': {
    arcano: {
      nome: 'O Sol',
      numero_carta: 19,
    },
    odu: {
      numero: 6,
      nome: 'Obará',
      nomeingles: 'Obará',
    },
    conexao_espiritual:
      'O Sol irradia vitalidade, sucesso, clareza e brilho próprio. Obará representa a riqueza, a fartura, a sabedoria e a surpresa. Ambos falam do sucesso manifesto, da abundância que brilha para todos verem, da realeza que se vê mesmo quando veste roupas simples.',
    simbolismo: [
      'Riqueza manifesta',
      'Brilho pessoal',
      'Fartura solar',
      'Surpresa do destino',
      'Sucesso irradiante',
    ],
  },

  // ─── Odu 7: Odi ────────────────────────────────────────────────────────────
  'O Carro': {
    arcano: {
      nome: 'O Carro',
      numero_carta: 7,
    },
    odu: {
      numero: 7,
      nome: 'Odi',
      nomeingles: 'Odi',
    },
    conexao_espiritual:
      'O Carro representa a vitória através da vontade, o domínio sobre as polaridades, a condução do impulso para o destino. Odi fala do poço profundo, das coisas ocultas, da teimosia que transforma morte em renascimento. Ambos falam da disciplina interior necessária para vencer batalhas invisíveis.',
    simbolismo: [
      'Vontade triumphante',
      'Controle das polaridades',
      'Renascimento do poço',
      'Disciplina interior',
      'Condução ao destino',
    ],
  },

  // ─── Odu 8: EjiOníle ───────────────────────────────────────────────────────
  'A Justiça': {
    arcano: {
      nome: 'A Justiça',
      numero_carta: 11,
    },
    odu: {
      numero: 8,
      nome: 'EjiOníle',
      nomeingles: 'EjiOníle',
    },
    conexao_espiritual:
      'A Justiça revela o equilíbrio kármico, a verdade que pesa com precisão, as consequências inevitáveis de toda ação. EjiOníle representa a cabeça (Ori), a liderança, o topo do mundo e o sangue branco da sabedoria. Juntos confirmam que a verdadeira liderança vem da retidão e da capacidade de equilibrar causas e efeitos.',
    simbolismo: [
      'Liderança reta',
      'Equilíbrio kármico',
      'Sabedoria do Ori',
      'Verdade que pesa',
      'Consequências inevitáveis',
    ],
  },

  // ─── Odu 9: Ossá ───────────────────────────────────────────────────────────
  'O Eremita': {
    arcano: {
      nome: 'O Eremita',
      numero_carta: 9,
    },
    odu: {
      numero: 9,
      nome: 'Ossá',
      nomeingles: 'Ossá',
    },
    conexao_espiritual:
      'O Eremita é a busca solitária, a luz interior que guia através da escuridão, a sabedoria conquistada na solidão. Ossá é o vento, as transformações rápidas, o domínio das Iyami (bruxas ancestrais). Ambos revelam que o poder verdadeiro exige recolhimento, que a transformação mais profunda acontece longe do olhar público.',
    simbolismo: [
      'Busca solitária',
      'Luz interior',
      'Transformação rápida',
      'Poder feminino ancestral',
      'Sábio na escuridão',
    ],
  },

  // ─── Odu 10: Ofun ──────────────────────────────────────────────────────────
  'A Roda da Fortuna': {
    arcano: {
      nome: 'A Roda da Fortuna',
      numero_carta: 10,
    },
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    conexao_espiritual:
      'A Roda da Fortuna representa os ciclos inevitáveis, a mudança de destino, a lei de cause e efeito em movimento. Ofun traz o mistério, a velhice, a cura, o sopro divino que transforma túmulo em berço. Ambos ensinam que nenhum destino é permanente, que a roda sempre gira e o que foi enterrado pode renascer.',
    simbolismo: [
      'Ciclos inevitáveis',
      'Mudança de destino',
      'Sopro transformador',
      'Morte e renascimento',
      'Lei kármica em movimento',
    ],
  },

  // ─── Odu 11: Owarin ───────────────────────────────────────────────────────
  'A Força': {
    arcano: {
      nome: 'A Força',
      numero_carta: 8,
    },
    odu: {
      numero: 11,
      nome: 'Owarin',
      nomeingles: 'Owarin',
    },
    conexao_espiritual:
      'A Força representa o domínio da paixão, a coragem de enfrentar nossos medos interiores, o poder da gentileza sobre a besta. Owarin fala da pressa, da ansiedade, das mudanças rápidas de rumo como vento que espalha folhas. Ambos revelam que a verdadeira força está em manter a calma quando tudo ao redor muda.',
    simbolismo: [
      'Força interior',
      'Coragem perante o medo',
      'Poder da calma',
      'Transformação urgente',
      'Domínio da paixão',
    ],
  },

  // ─── Odu 12: Ejilsebora ────────────────────────────────────────────────────
  'A Torre': {
    arcano: {
      nome: 'A Torre',
      numero_carta: 16,
    },
    odu: {
      numero: 12,
      nome: 'Ejilsebora',
      nomeingles: 'Ejilsebora',
    },
    conexao_espiritual:
      'A Torre representa a destruição necessária, a queda das estruturas falsas, a iluminação que golpeia sem aviso. Ejilsebora traz a justiça, o fogo purificador, a guerra justa que traz terremotos interiores. Ambos ensinam que às vezes o destino precisa quebrar nossa resistência antes de nos mostrar o caminho verdadeiro.',
    simbolismo: [
      'Fogo purificador',
      'Destruição necessária',
      'Queda das estruturas falsas',
      'Iluminação que golpeia',
      'Guerra justa interior',
    ],
  },

  // ─── Odu 13: Olobón ────────────────────────────────────────────────────────
  'A Morte': {
    arcano: {
      nome: 'A Morte',
      numero_carta: 13,
    },
    odu: {
      numero: 13,
      nome: 'Olobón',
      nomeingles: 'Olobón',
    },
    conexao_espiritual:
      'A Morte representa a transformação inevitável, o fim de ciclos, a reencarnação da alma. Olobón traz a doença, as transformações físicas, o recolhimento necessário para a evolução. Ambos ensinam que toda morte é um nascimento disfarçado, que o fim de uma coisa é sempre o começo de outra no vasto jardim do destino.',
    simbolismo: [
      'Transformação inevitável',
      'Fim de ciclos',
      'Recolhimento necessário',
      'Morte como renascimento',
      'Evolução através da perda',
    ],
  },

  // ─── Odu 14: Iká ───────────────────────────────────────────────────────────
  'O Enforcado': {
    arcano: {
      nome: 'O Enforcado',
      numero_carta: 12,
    },
    odu: {
      numero: 14,
      nome: 'Iká',
      nomeingles: 'Iká',
    },
    conexao_espiritual:
      'O Enforcado mostra o sacrifício voluntário, a nova perspectiva alcançada através da entrega, o suspendimento do ego. Iká representa a traição, a cobra que morde, a sabedoria oculta na renovação da pele. Ambos revelam que a sabedoria mais profunda vem de aceitar revezes temporários, de morder a própria cauda para avançar.',
    simbolismo: [
      'Sacrifício voluntário',
      'Nova perspectiva',
      'Entrega do ego',
      'Sabedoria na reviravolta',
      'Renovação através do sacrifício',
    ],
  },

  // ─── Odu 15: Ogbogbé ───────────────────────────────────────────────────────
  'O Diabo': {
    arcano: {
      nome: 'O Diabo',
      numero_carta: 15,
    },
    odu: {
      numero: 15,
      nome: 'Ogbogbé',
      nomeingles: 'Ogbogbé',
    },
    conexao_espiritual:
      'O Diabo representa a ilusão material, os vínculos inferiores, a sombra que nos prende. Ogbogbé traz a feitiçaria, o corte pesado, as disputas por espaço ou poder. Ambos alertam sobre os perigos da magia sem ética, dos pactos que parecem bons mas prendem a alma, da soberba que precede a queda.',
    simbolismo: [
      'Feitiçaria sem ética',
      'Ilusão material',
      'Vínculos inferiores',
      'Magia que prende',
      'Sombra que seduz',
    ],
  },

  // ─── Odu 16: Alafia ────────────────────────────────────────────────────────
  'A Estrela': {
    arcano: {
      nome: 'A Estrela',
      numero_carta: 17,
    },
    odu: {
      numero: 16,
      nome: 'Alafia',
      nomeingles: 'Alafia',
    },
    conexao_espiritual:
      'A Estrela representa a esperança, a inspiração, a luz que guia após a tempestade. Alafia é a paz absoluta, a luz total, a confirmação dos Deuses onde tudo está bem. Ambos derramam bênçãos de água renovadora sobre a alma cansada, prometendo que dias melhores virão para quem mantém a fé.',
    simbolismo: [
      'Paz absoluta',
      'Luz renovadora',
      'Esperança inabalável',
      'Confirmação divina',
      'Água de bênção',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ODU_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_ODU_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Tarot-to-Odu correlation mapping by arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa', 'O Sol')
 * @returns The correlation mapping or null if not found
 */
export function getTarotOdu(arcano: string): TarotOduMapping | null {
  return TAROT_ODU_MAPPINGS[arcano] ?? null;
}

/**
 * Get the Tarot Major Arcana card corresponding to an Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns The arcano name or null if not found
 */
export function getOduTarot(oduNumero: number): string | null {
  const entry = Object.values(TAROT_ODU_MAPPINGS).find(
    (mapping) => mapping.odu.numero === oduNumero
  );
  return entry?.arcano.nome ?? null;
}

/**
 * Get the Odu number by arcano card number
 * @param numeroCarta - The Major Arcana card number (0-21)
 * @returns The Odu number or null if not found
 */
export function getOduByTarotNumber(numeroCarta: number): number | null {
  const entry = Object.values(TAROT_ODU_MAPPINGS).find(
    (mapping) => mapping.arcano.numero_carta === numeroCarta
  );
  return entry?.odu.numero ?? null;
}

/**
 * Get the arcano number by Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns The arcano card number or null if not found
 */
export function getTarotNumberByOdu(oduNumero: number): number | null {
  const entry = Object.values(TAROT_ODU_MAPPINGS).find(
    (mapping) => mapping.odu.numero === oduNumero
  );
  return entry?.arcano.numero_carta ?? null;
}

/**
 * Get all available Tarot-Odu mappings
 * @returns Array of all correlation mappings sorted by arcano number
 */
export function getAllTarotOdus(): TarotOduMapping[] {
  return Object.values(TAROT_ODU_MAPPINGS).sort(
    (a, b) => a.arcano.numero_carta - b.arcano.numero_carta
  );
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_ODU_MAPPINGS).sort();
}

/**
 * Get all Odu numbers
 * @returns Array of Odu numbers from 1 to 16
 */
export function getAllOduNumbers(): number[] {
  return Object.values(TAROT_ODU_MAPPINGS)
    .map((m) => m.odu.numero)
    .sort((a, b) => a - b);
}

/**
 * Get all Odu names
 * @returns Array of Odu names sorted
 */
export function getAllOduNames(): string[] {
  return Object.values(TAROT_ODU_MAPPINGS)
    .map((m) => m.odu.nome)
    .sort();
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotOdu(arcano: string): boolean {
  return arcano in TAROT_ODU_MAPPINGS;
}

/**
 * Check if an Odu exists in the mapping
 * @param oduNumero - Odu number to check (1-16)
 * @returns True if Odu exists in mapping
 */
export function hasOduTarot(oduNumero: number): boolean {
  return Object.values(TAROT_ODU_MAPPINGS).some(
    (mapping) => mapping.odu.numero === oduNumero
  );
}

/**
 * Get the simbolismo for a given arcano name
 * @param arcano - Arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns Array of key symbols or null if not found
 */
export function getTarotSimbolismo(arcano: string): string[] | null {
  return TAROT_ODU_MAPPINGS[arcano]?.simbolismo ?? null;
}

/**
 * Get the spiritual connection for a given arcano name
 * @param arcano - Arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns Spiritual connection string or null if not found
 */
export function getTarotConexaoEspiritual(arcano: string): string | null {
  return TAROT_ODU_MAPPINGS[arcano]?.conexao_espiritual ?? null;
}

/**
 * Get the Odu name for a given arcano name
 * @param arcano - Arcano name
 * @returns Odu name or null if not found
 */
export function getOduNomeByArcano(arcano: string): string | null {
  return TAROT_ODU_MAPPINGS[arcano]?.odu.nome ?? null;
}

/**
 * Get the Odu number for a given arcano name
 * @param arcano - Arcano name
 * @returns Odu number or null if not found
 */
export function getOduNumeroByArcano(arcano: string): number | null {
  return TAROT_ODU_MAPPINGS[arcano]?.odu.numero ?? null;
}

/**
 * Default export with all functions
 */
export default {
  getTarotOdu,
  getOduTarot,
  getOduByTarotNumber,
  getTarotNumberByOdu,
  getAllTarotOdus,
  getAllArcanos,
  getAllOduNumbers,
  getAllOduNames,
  hasTarotOdu,
  hasOduTarot,
  getTarotSimbolismo,
  getTarotConexaoEspiritual,
  getOduNomeByArcano,
  getOduNumeroByArcano,
  TAROT_ODU_MAPPINGS,
};