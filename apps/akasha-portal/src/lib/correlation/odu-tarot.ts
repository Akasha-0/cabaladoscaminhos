/**
 * Odu Ifá - Tarot Major Arcana Correlation Mapping
 * Correlates the 16 Odu Ifá (Merindilogun) with Tarot Major Arcana cards
 * Based on IDEIA.md Tabela de Correspondência Macro - aligning Ifá divination with Tarot archetypes
 */

export interface OduTarotMapping {
  /** The Odu Ifá */
  odu: {
    /** Odu number (1-16) */
    numero: number;
    /** Odu name in Portuguese */
    nome: string;
    /** Odu name in Yoruba/English */
    nomeingles: string;
  };
  /** The corresponding Tarot Major Arcana card */
  arcano: {
    /** Arcano name */
    nome: string;
    /** Card number in Major Arcana (1-21) */
    numero_carta: number;
  };
  /** Spiritual archetype and connection */
  conexao_espiritual: string;
  /** Key symbols and imagery */
  simbolismo: string[];
}

// ─── Odu Ifá to Tarot Major Arcana Mapping ─────────────────────────────────────

export const ODU_TAROT_MAPPINGS: Record<number, OduTarotMapping> = {
  // ─── Primary Mappings (Merindilogun Odus 1-16) ───────────────────────────────

  1: {
    odu: {
      numero: 1,
      nome: 'Okaran',
      nomeingles: 'Okaran',
    },
    arcano: {
      nome: 'O Louco',
      numero_carta: 0,
    },
    conexao_espiritual:
      'Okaran representa o início, a coragem de seguir novos caminhos sem olhar para trás. O Louco embodies o mesmo espíritu: o viajante que dá o primeiro passo sem conhecer o destino. Ambos falam da fé pura, do salto no vazio, da disposição para enfrentar o desconhecido com coração aberto.',
    simbolismo: [
      'Início absoluto',
      'Coragem perante o desconhecido',
      'Fe sem medo',
      'Jornada sem destino definido',
      'Libertação das convenções',
    ],
  },
  2: {
    odu: {
      numero: 2,
      nome: 'Ejiokô',
      nomeingles: 'Ejiokô',
    },
    arcano: {
      nome: 'A Sacerdotisa',
      numero_carta: 2,
    },
    conexao_espiritual:
      'Ejiokô fala da dualidade, dos caminhos duplos, da união entre opostos. A Sacerdotisa representa o conhecimento oculto, a intuição profunda, o véu entre dois mundos. Juntos revelam que toda escolha importante envolve equilibrar forças opostas e confiar no conhecimento silencioso.',
    simbolismo: [
      'Dualidade e polaridade',
      'Escolhas parallelas',
      'Intuição secreta',
      'Conhecimento lunar',
      'Equilíbrio entre luz e sombra',
    ],
  },
  3: {
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nomeingles: 'Oyekun',
    },
    arcano: {
      nome: 'A Imperatriz',
      numero_carta: 3,
    },
    conexao_espiritual:
      'Etaogundá traz a força da revolta, a criação de ferramentas, o poder de transformar a matéria. A Imperatriz é a fertilidade, a criação abundante, o princípio feminino divino. Ambos representam o poder de trazer algo do nada, de criar vida e riqueza através da força de vontade.',
    simbolismo: [
      'Força criadora',
      'Fertilidade e abundancia',
      'Poder sobre a matéria',
      'Criação de ferramentas',
      'Renascimento através da ação',
    ],
  },
  4: {
    odu: {
      numero: 4,
      nome: 'Irosun',
      nomeingles: 'Irosun',
    },
    arcano: {
      nome: 'A Lua',
      numero_carta: 18,
    },
    conexao_espiritual:
      'Irosun é o aviso, a visão espiritual, o sangue que corre nas veias conectando o mundo visível ao invisível. A Lua representa a intuição, o inconsciente, os sonhos e as ilusões. Ambos operam no domínio do não-visto, alertando sobre perigos ocultos e guiando através das águas profundas da psique.',
    simbolismo: [
      'Visão além do véu',
      'Intuição profunda',
      'Alertas do inconsciente',
      'Águas da psique',
      'Ilusões e realidade fluida',
    ],
  },
  5: {
    odu: {
      numero: 5,
      nome: 'Oxé',
      nomeingles: 'Oxé',
    },
    arcano: {
      nome: 'O Hierofante',
      numero_carta: 5,
    },
    conexao_espiritual:
      'Oxé traz o ouro, a doçura, a feitiçaria e a lágrima sagrada. O Hierofante representa a sabedoria institucional, a tradição sagrada, o mestre que transmite a doutrina divina. Ambos revelam que a verdadeira magia está na cerimônia, no ritual, na honra às tradições ancestrais que abrem portais de conhecimento.',
    simbolismo: [
      'Magia ceremonial',
      'Sabedoria tradicional',
      'Ouro espiritual',
      'Feitiçaria sagrada',
      'Transmissão de conhecimento',
    ],
  },
  6: {
    odu: {
      numero: 6,
      nome: 'Obará',
      nomeingles: 'Obará',
    },
    arcano: {
      nome: 'O Sol',
      numero_carta: 19,
    },
    conexao_espiritual:
      'Obará representa a riqueza, a fartura, a sabedoria e a surpresa. O Sol irradia vitalidade, sucesso, clareza e brilho próprio. Ambos falam do sucesso manifesto, da abundância que brilha para todos verem, da realeza que se vê mesmo quando veste roupas simples.',
    simbolismo: [
      'Riqueza manifesta',
      'Brilho pessoal',
      'Fartura solar',
      'Surpresa do destino',
      'Sucesso irradiante',
    ],
  },
  7: {
    odu: {
      numero: 7,
      nome: 'Odi',
      nomeingles: 'Odi',
    },
    arcano: {
      nome: 'O Carro',
      numero_carta: 7,
    },
    conexao_espiritual:
      'Odi fala do poço profundo, das coisas ocultas, da teimosia que transforma morte em renascimento. O Carro representa a vitória através da vontade, o domínio sobre as polaridades, a condução do impulso para o destino. Ambos hablan da disciplina interior necessária para vencer batalhas invisíveis.',
    simbolismo: [
      'Vontade triumphante',
      'Controle das polaridades',
      'Renascimento do poço',
      'Disciplina interior',
      'Condução ao destino',
    ],
  },
  8: {
    odu: {
      numero: 8,
      nome: 'EjiOníle',
      nomeingles: 'EjiOníle',
    },
    arcano: {
      nome: 'A Justiça',
      numero_carta: 11,
    },
    conexao_espiritual:
      'EjiOníle representa a cabeça (Ori), a liderança, o topo do mundo e o sangue branco da sabedoria. A Justiça revela o equilíbrio kármico, a verdade que pesa com precisão, as consequências inevitáveis de toda ação. Juntos confirmam que a verdadeira liderança vem da retidão e da capacidade de equilibrar causas e efeitos.',
    simbolismo: [
      'Liderança reta',
      'Equilíbrio kármico',
      'Sabedoria do Ori',
      'Verdade que pesa',
      'Consequências inevitáveis',
    ],
  },
  9: {
    odu: {
      numero: 9,
      nome: 'Ossá',
      nomeingles: 'Ossá',
    },
    arcano: {
      nome: 'O Eremita',
      numero_carta: 9,
    },
    conexao_espiritual:
      'Ossá é o vento, as transformações rápidas, o domínio das Iyami (bruxas ancestrais). O Eremita é a busca solitária, a luz interior que guia através da escuridão, a sabedoria conquistada na solidão. Ambos revelam que o poder verdadeiro exige recolhimento, que a transformação mais profunda acontece longe do olhar público.',
    simbolismo: [
      'Busca solitária',
      'Luz interior',
      'Transformação rápida',
      'Poder feminino ancestral',
      'Sábio na escuridão',
    ],
  },
  10: {
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    arcano: {
      nome: 'A Roda da Fortuna',
      numero_carta: 10,
    },
    conexao_espiritual:
      'Ofun traz o mistério, a velhice, a cura, o sopro divino que transforma túmulo em berço. A Roda da Fortuna representa os ciclos inevitáveis, a mudança de destino, a lei de cause e efeito em movimento. Ambos enseñam que nenhum destino é permanente, que a roda sempre gira e o que foi enterrado pode renascer.',
    simbolismo: [
      'Ciclos inevitáveis',
      'Mudança de destino',
      'Sopro transformador',
      'Morte e renascimento',
      'Lei kármica em movimento',
    ],
  },
  11: {
    odu: {
      numero: 11,
      nome: 'Owarin',
      nomeingles: 'Owarin',
    },
    arcano: {
      nome: 'A Força',
      numero_carta: 8,
    },
    conexao_espiritual:
      'Owarin fala da pressa, da ansiedade, das mudanças rápidas de rumo como vento que espalha folhas. A Força representa o domínio da passion, a coragem de enfrentar nuestros miedos interiores, o poder da gentileza sobre a野兽. Ambos revelam que a verdadeira força está em manter a calma quando tudo ao redor muda.',
    simbolismo: [
      'Força interior',
      'Coragem perante o medo',
      'Poder da calma',
      'Transformação urgente',
      'Domínio da pasión',
    ],
  },
  12: {
    odu: {
      numero: 12,
      nome: 'Ejilsebora',
      nomeingles: 'Ejilsebora',
    },
    arcano: {
      nome: 'A Torre',
      numero_carta: 16,
    },
    conexao_espiritual:
      'Ejilsebora traz a justiça, o fogo purificador, a guerra justa que traz terramotos interiores. A Torre representa a destruição necessária, a queda das estruturas falsas, a iluminação que golpeia sem aviso. Ambos enseñam que às vezes o destino precisa quebrar nossa resistência antes de nos mostrar o caminho verdadeiro.',
    simbolismo: [
      'Fogo purificador',
      'Destruição necessária',
      'Queda das estruturas falsas',
      'Iluminação que golpeia',
      'Guerra justa interior',
    ],
  },
  13: {
    odu: {
      numero: 13,
      nome: 'Olobón',
      nomeingles: 'Olobón',
    },
    arcano: {
      nome: 'A Morte',
      numero_carta: 13,
    },
    conexao_espiritual:
      'Olobón traz a doença, as transformações físicas, o recolhimento necessário para a evolução. A Morte representa a transformação inevitável, o fim de ciclos, a reencarnação da alma. Ambos ensinam que toda morte é um nascimento disfarçado, que o fim de uma coisa é sempre o começo de outra no vasto jardim do destino.',
    simbolismo: [
      'Transformação inevitável',
      'Fim de ciclos',
      'Recolhimento necessário',
      'Morte como renascimento',
      'Evolução através da perda',
    ],
  },
  14: {
    odu: {
      numero: 14,
      nome: 'Iká',
      nomeingles: 'Iká',
    },
    arcano: {
      nome: 'O Enforcado',
      numero_carta: 12,
    },
    conexao_espiritual:
      'Iká representa a traição, a cobra que morde, a sabedoria oculta na renovação da pele. O Enforcado mostra o sacrifício自愿, a nova perspectiva alcançada através da entrega, o suspendimento do ego. Ambos revelan que a sabedoria mais profunda vem de aceitar reverses temporarily, de morder a própria cauda para avançar.',
    simbolismo: [
      'Sacrifício voluntary',
      'Nova perspectiva',
      'Entrega do ego',
      'Sabedoria na reviravolta',
      'Renovação através do sacrifício',
    ],
  },
  15: {
    odu: {
      numero: 15,
      nome: 'Ogbogbé',
      nomeingles: 'Ogbogbé',
    },
    arcano: {
      nome: 'O Diabo',
      numero_carta: 15,
    },
    conexao_espiritual:
      'Ogbogbé traz a feitiçaria, o corte pesado, as disputas por espaço ou poder. O Diabo representa a ilusão material, os vínculos inferiores, a sombra que nos prende. Ambos alertam sobre os perigos da magia sem ética, dos pactos que parecem bons mas prendem a alma, da soberba que precede a queda.',
    simbolismo: [
      'Feitiçaria sem ética',
      'Ilusão material',
      'Vínculos inferiores',
      'Magia que prende',
      'Sombra que seduz',
    ],
  },
  16: {
    odu: {
      numero: 16,
      nome: 'Alafia',
      nomeingles: 'Alafia',
    },
    arcano: {
      nome: 'A Estrela',
      numero_carta: 17,
    },
    conexao_espiritual:
      'Alafia é a paz absoluta, a luz total, a confirmação dos Deuses onde tudo está bem. A Estrela representa a esperança, a inspiração, a luz que guia após a tempestade. Ambos derramam bênçãos de água renovadora sobre a alma cansada, prometendo que dias melhores virão para quem mantém a fé.',
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
Object.freeze(ODU_TAROT_MAPPINGS);
// Freeze nested objects
Object.values(ODU_TAROT_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Odu-to-Tarot correlation mapping
 * @param oduNumero - Odu number from 1 to 16
 * @returns The correlation mapping or null if not found
 */
export function getOduTarot(oduNumero: number): OduTarotMapping | null {
  return ODU_TAROT_MAPPINGS[oduNumero] ?? null;
}

/**
 * Get the Odu corresponding to a Tarot Major Arcana card
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa', 'O Sol')
 * @returns The Odu number or null if not found
 */
export function getTarotOdu(arcano: string): number | null {
  const entry = Object.values(ODU_TAROT_MAPPINGS).find(
    (mapping) => mapping.arcano.nome === arcano
  );
  return entry?.odu.numero ?? null;
}

/**
 * Get the Odu number by arcano card number
 * @param numeroCarta - The Major Arcana card number (0-21)
 * @returns The Odu number or null if not found
 */
export function getOduByArcanoNumber(numeroCarta: number): number | null {
  const entry = Object.values(ODU_TAROT_MAPPINGS).find(
    (mapping) => mapping.arcano.numero_carta === numeroCarta
  );
  return entry?.odu.numero ?? null;
}

/**
 * Get all available Odu-Tarot mappings
 * @returns Array of all correlation mappings sorted by Odu number
 */
export function getAllOduTarots(): OduTarotMapping[] {
  return Object.values(ODU_TAROT_MAPPINGS).sort(
    (a, b) => a.odu.numero - b.odu.numero
  );
}

/**
 * Get all Odu numbers
 * @returns Array of Odu numbers from 1 to 16
 */
export function getAllOduNumbers(): number[] {
  return Object.values(ODU_TAROT_MAPPINGS)
    .map((m) => m.odu.numero)
    .sort((a, b) => a - b);
}

/**
 * Get all Odu names
 * @returns Array of Odu names
 */
export function getAllOduTarotNames(): string[] {
  return Object.values(ODU_TAROT_MAPPINGS)
    .map((m) => m.odu.nome)
    .sort();
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(ODU_TAROT_MAPPINGS)
    .map((m) => m.arcano.nome)
    .sort();
}

/**
 * Check if an Odu exists in the mapping
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduTarot(oduNumero: number): boolean {
  return oduNumero in ODU_TAROT_MAPPINGS;
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotOdu(arcano: string): boolean {
  return Object.values(ODU_TAROT_MAPPINGS).some(
    (mapping) => mapping.arcano.nome === arcano
  );
}

/**
 * Get the simbolismo for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Array of key symbols or null if not found
 */
export function getOduSimbolismo(oduNumero: number): string[] | null {
  return ODU_TAROT_MAPPINGS[oduNumero]?.simbolismo ?? null;
}

/**
 * Get the spiritual connection for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Spiritual connection string or null if not found
 */
export function getOduConexaoEspiritual(oduNumero: number): string | null {
  return ODU_TAROT_MAPPINGS[oduNumero]?.conexao_espiritual ?? null;
}

/**
 * Get the arcano name for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Arcano name or null if not found
 */
export function getOduArcano(oduNumero: number): string | null {
  return ODU_TAROT_MAPPINGS[oduNumero]?.arcano.nome ?? null;
}

/**
 * Get the arcano number for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Arcano number or null if not found
 */
export function getOduArcanoNumber(oduNumero: number): number | null {
  return ODU_TAROT_MAPPINGS[oduNumero]?.arcano.numero_carta ?? null;
}

/**
 * Default export with all functions
 */
export default {
  getOduTarot,
  getTarotOdu,
  getOduByArcanoNumber,
  getAllOduTarots,
  getAllOduNumbers,
  getAllOduTarotNames,
  getAllArcanos,
  hasOduTarot,
  hasTarotOdu,
  getOduSimbolismo,
  getOduConexaoEspiritual,
  getOduArcano,
  getOduArcanoNumber,
  ODU_TAROT_MAPPINGS,
};