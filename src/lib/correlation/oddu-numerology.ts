/**
 * Odú Ifá-Numerology Correlation Module
 * Direct mappings of the 16 Odú Ifá (Merindilogun) to numerology numbers
 * With spiritual meaning for divination and numerological practice
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface NumerologyCorrelation {
  /** The numerology number (1-13) */
  numero: number;
  /** Interpretation in the context of this Odu */
  interpretacao: string;
}

export interface OduNumerologyMapping {
  /** Odu number (1-16) */
  odu_numero: number;
  /** Odu name in Portuguese */
  odu_nome: string;
  /** Odu name in Yoruba */
  odu_nome_yoruba: string;
  /** Primary numerology numbers associated with this Odu */
  numeros: NumerologyCorrelation[];
  /** Primary element */
  elemento: ElementType;
  /** Energy alignment classification */
  alinhamento_energetico: 'Quente' | 'Frio' | 'Neutro';
  /** Spiritual meaning for divination */
  significado_espiritual: string;
  /** Key spiritual message */
  mensagem_central: string;
  /** Associated colors */
  cores: string[];
  /** Key qualities and energies */
  qualidades: string[];
}

// ─── Odú Ifá-to-Numerology Mapping (Merindilogun 1-16) ───────────────────────

export const ODDU_NUMEROLOGY_MAPPINGS: Record<number, OduNumerologyMapping> = {
  // ─── 1: Okaran (Okànràn) ───────────────────────────────────────────────────
  // Numerology: 1, 10 - New beginnings, leadership, creation
  1: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    odu_nome_yoruba: 'Okànràn',
    numeros: [
      { numero: 1, interpretacao: 'Okaran em 1: O princípio absoluto, a criação primordial. O número 1 representa o início de tudo, a força vital Yang que move o universo.' },
      { numero: 10, interpretacao: 'Okaran em 10: A manifestação do poder criativo. O 10 traz a transformação que completa o ciclo de criação de Okaran.' },
    ],
    elemento: 'éter',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Coragem, recomeço, liberdade. Odu da fé que move montanhas e do pioneiro que abre caminhos.',
    mensagem_central: 'Novos inícios pedem coragem. Confie na força criadora que reside em você.',
    cores: ['branco', 'ouro'],
    qualidades: ['criação', 'coragem', 'liderança', 'início', 'liberdade'],
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  // Numerology: 2, 11 - Duality, partnership, intuition
  2: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    odu_nome_yoruba: 'Ejìokò',
    numeros: [
      { numero: 2, interpretacao: 'Ejiokô em 2: A dualidade sagrada, o princípio Yin. Representa a cooperação, a parceria e a harmonização de opostos.' },
      { numero: 11, interpretacao: 'Ejiokô em 11: A intuição suprema, o número mestre da channeling. Ejiokô revela as verdades ocultas através do terceiro olho.' },
    ],
    elemento: 'água',
    alinhamento_energetico: 'Frio',
    significado_espiritual: 'Dualidade, escolha, equilíbrio. Revela que toda decisão importante exige intuição e harmonização de opostos.',
    mensagem_central: 'Escolhas significativas pedem equilíbrio. Confie na sabedoria do seu coração.',
    cores: ['azul', 'prata'],
    qualidades: ['dualidade', 'parceria', 'intuição', 'equilíbrio', 'cooperação'],
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  // Numerology: 3, 6 - Creativity, expression, manifestation
  3: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    odu_nome_yoruba: 'Ẹtaọgúndá',
    numeros: [
      { numero: 3, interpretacao: 'Etaogundá em 3: A expressão criativa, a comunicação transformadora. O número 3 traz a capacidade de manifestar através da palavra.' },
      { numero: 6, interpretacao: 'Etaogundá em 6: A responsabilidade criativa, o serviço através do trabalho. O 6 canaliza a força de Etaogundá para o bem comum.' },
    ],
    elemento: 'fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Força transformadora, criação, trabalho. Poder de transformar matéria e criar vida através da vontade.',
    mensagem_central: 'A transformação está ao seu alcance. Canalize sua energia criativa com propósito.',
    cores: ['vermelho', 'laranja'],
    qualidades: ['força', 'transformação', 'criação', 'ação', 'vontade'],
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  // Numerology: 4, 7 - Foundation, wisdom, introspection
  4: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    odu_nome_yoruba: 'Ìrosùn',
    numeros: [
      { numero: 4, interpretacao: 'Irosun em 4: A sabedoria fundamentada, a estabilidade da prática espiritual. O número 4 traz disciplina e ritual.' },
      { numero: 7, interpretacao: 'Irosun em 7: A introspecção profunda, a busca pelos mistérios ocultos. O 7 revela o que está além do véu.' },
    ],
    elemento: 'água',
    alinhamento_energetico: 'Frio',
    significado_espiritual: 'Intuição lunar, mensagens ocultas, segredos. Revela verdades escondidas e a visão além das ilusões.',
    mensagem_central: 'Confie na sua intuição. O véu entre os mundos é fino neste momento.',
    cores: ['azul celeste', 'roxo'],
    qualidades: ['intuição', 'visão', 'sabedoria', 'mistério', 'profundidade'],
  },

  // ─── 5: Oxé ───────────────────────────────────────────────────────────────
  // Numerology: 5, 8 - Freedom, karma, material mastery
  5: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    odu_nome_yoruba: 'Ọ̀sà',
    numeros: [
      { numero: 5, interpretacao: 'Oxé em 5: A liberdade magnética, a capacidade de criar realidade. O número 5 traz charme natural e a energia da mudança.' },
      { numero: 8, interpretacao: 'Oxé em 8: O poder terreno, o karma material. O 8 representa justiça e a capacidade de dominar o mundo físico.' },
    ],
    elemento: 'fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Lei divina, justiça cósmica, julgamento. Traz responsabilidade espiritual e decisões que afetam destinos.',
    mensagem_central: 'A verdade se revelará. Age com integridade e respeito à lei divina.',
    cores: ['amarelo', 'dourado'],
    qualidades: ['justiça', 'magnetismo', 'feitiçaria', 'transformação', 'poder'],
  },

  // ─── 6: Obará ─────────────────────────────────────────────────────────────
  // Numerology: 6, 12 - Harmony, service, integration
  6: {
    odu_numero: 6,
    odu_nome: 'Obará',
    odu_nome_yoruba: 'Ọbárá',
    numeros: [
      { numero: 6, interpretacao: 'Obará em 6: A harmonia em família, o serviço sagrado. O número 6 traz beleza, responsabilidade e cuidado.' },
      { numero: 12, interpretacao: 'Obará em 12: A integração grupal, o jury cósmico. O 12 representa colaboração e reconciliação de opostos.' },
    ],
    elemento: 'terra',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Ordem, mandamento, trabalho e obediência. Traz a energia do dever cumprido e da harmonia em família.',
    mensagem_central: 'O serviço dedicado traz harmonia. Honre suas responsabilidades com amor.',
    cores: ['azul', 'branco'],
    qualidades: ['ordem', 'harmonia', 'responsabilidade', 'serviço', 'família'],
  },

  // ─── 7: Odi ────────────────────────────────────────────────────────────────
  // Numerology: 7, 9 - Mystery, completion, wisdom
  7: {
    odu_numero: 7,
    odu_nome: 'Odi',
    odu_nome_yoruba: 'Òdì',
    numeros: [
      { numero: 7, interpretacao: 'Odi em 7: A sabedoria oculta, a introspecção profunda. O número 7 representa a busca interior e os mistérios do poço.' },
      { numero: 9, interpretacao: 'Odi em 9: A transmutação completa, a medicina do renascimento. O 9 traz a sabedoria da transformação total.' },
    ],
    elemento: 'água',
    alinhamento_energetico: 'Frio',
    significado_espiritual: 'Teimosia, renascimento, poço profundo. Traz a energia da transmutação através dos mistérios ocultos.',
    mensagem_central: 'Vá ao fundo para encontrar a resposta. Os mistérios se revelam aos persistentes.',
    cores: ['preto', 'azul escuro'],
    qualidades: ['mistério', 'renascimento', 'transmutação', 'profundidade', 'sabedoria'],
  },

  // ─── 8: Ijonse ─────────────────────────────────────────────────────────────
  // Numerology: 8, 10 - Karma, sacrifice, reunion
  8: {
    odu_numero: 8,
    odu_nome: 'Ijonse',
    odu_nome_yoruba: 'Ìjọ̀nse',
    numeros: [
      { numero: 8, interpretacao: 'Ijonse em 8: O karma material, o poder terreno e a justiça. O número 8 representa a lei de causa e efeito.' },
      { numero: 10, interpretacao: 'Ijonse em 10: A reunião transformadora, o sacrifício que abre caminhos. O 10 traz renascimento após o sacrifício consciente.' },
    ],
    elemento: 'terra',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Reunião, conserto, sacrifício. Traz a energia do equilíbrio entre o material e o espiritual através do sacrifício consciente.',
    mensagem_central: 'O sacrifício de hoje é a semente do amanhã. Ajustar o karma requer coragem.',
    cores: ['marrom', 'branco'],
    qualidades: ['karma', 'sacrifício', 'reunião', 'justiça', 'conserto'],
  },

  // ─── 9: Se ─────────────────────────────────────────────────────────────────
  // Numerology: 9, 3 - Compassion, healing, expression
  9: {
    odu_numero: 9,
    odu_nome: 'Se',
    odu_nome_yoruba: 'Se',
    numeros: [
      { numero: 9, interpretacao: 'Se em 9: A medicina suprema, o humanitarianismo iluminado. O número 9 representa completion e o retorno para servir.' },
      { numero: 3, interpretacao: 'Se em 3: A cura expressiva, a comunicação curativa. O 3 traz a capacidade de transmitir sabedoria através da expressão.' },
    ],
    elemento: 'fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Medicina, sacrifício, transformação. Traz a energia da cura e do serviço aos outros com compaixão.',
    mensagem_central: 'A cura está ao seu alcance. Seu dom de servir à humanidade se manifesta agora.',
    cores: ['verde', 'branco'],
    qualidades: ['cura', 'compaixão', 'serviço', 'sabedoria', 'transformação'],
  },

  // ─── 10: Ofun ───────────────────────────────────────────────────────────────
  // Numerology: 10, 1 - Renewal, rebirth, leadership
  10: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    odu_nome_yoruba: 'Ọ̀fún',
    numeros: [
      { numero: 10, interpretacao: 'Ofun em 10: A renovação completa, o ciclo que se fecha e se abre. O número 10 representa transformação e novos começos.' },
      { numero: 1, interpretacao: 'Ofun em 1: A liderança renovadora, o primeiro passo do renascimento. O 1 traz coragem para começar após a transformação.' },
    ],
    elemento: 'éter',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Renovação, transformação, renascimento. Odu do silêncio, da paciência e da contemplação que precede o renascimento.',
    mensagem_central: 'Libere o velho para receber o novo. O renascimento está próximo.',
    cores: ['branco', 'dourado'],
    qualidades: ['renovação', 'transformação', 'renascimento', 'silêncio', 'paciência'],
  },

  // ─── 11: Nanã ───────────────────────────────────────────────────────────────
  // Numerology: 11, 2 - Wisdom, channeling, intuition
  11: {
    odu_numero: 11,
    odu_nome: 'Nanã',
    odu_nome_yoruba: 'Nànã',
    numeros: [
      { numero: 11, interpretacao: 'Nanã em 11: A sabedoria ancestral suprema, o número mestre da channeling. Nanã recebe mensagens divinas e as traduz para os mortais.' },
      { numero: 2, interpretacao: 'Nanã em 2: A sabedoria da dualidade, a harmonia entre passado e presente. O 2 traz equilíbrio para a sabedoria de Nanã.' },
    ],
    elemento: 'água',
    alinhamento_energetico: 'Frio',
    significado_espiritual: 'Velhice, sabedoria ancestral, modéstia. Traz a energia da percepção além dos sentidos e da comunicação com ancestrais.',
    mensagem_central: 'A sabedoria dos anciões guia seu caminho. Ouça os conselhos dos que já trilharam.',
    cores: ['roxo', 'azul escuro'],
    qualidades: ['sabedoria', 'ancestralidade', 'modéstia', 'intuição', 'comunicação'],
  },

  // ─── 12: Ejilsebora ─────────────────────────────────────────────────────────
  // Numerology: 12, 6 - Integration, collaboration, transformation
  12: {
    odu_numero: 12,
    odu_nome: 'Ejilsebora',
    odu_nome_yoruba: 'Ejìlà-sebòri',
    numeros: [
      { numero: 12, interpretacao: 'Ejilsebora em 12: A integração suprema, o jury cósmico. O número 12 representa a colaboração e a reconciliação de opostos.' },
      { numero: 6, interpretacao: 'Ejilsebora em 6: A transformação através do grupo, o serviço coletivo. O 6 traz harmonia para a integração de ejilsebora.' },
    ],
    elemento: 'ar',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Purificação, transformação, integração. Traz a energia da reconciliação e da transformação coletiva.',
    mensagem_central: 'A integração traz paz. Permita que as partes se encontrem no centro.',
    cores: ['branco', 'verde'],
    qualidades: ['integração', 'purificação', 'reconciliação', 'colaboração', 'transformação'],
  },

  // ─── 13: Olobón ─────────────────────────────────────────────────────────────
  // Numerology: 13, 4 - Mortality, grounding, foundation
  13: {
    odu_numero: 13,
    odu_nome: 'Olobón',
    odu_nome_yoruba: 'Òlóbòng',
    numeros: [
      { numero: 13, interpretacao: 'Olobón em 13: A transformação da mortalidade, a libertação das correntes. O número 13 traz a alquimia de transformar densidade em luz.' },
      { numero: 4, interpretacao: 'Olobón em 4: A estruturação da mudança, a fundação do novo. O 4 traz estabilidade para atravessar a transformação.' },
    ],
    elemento: 'terra',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Libertação, transformação, saída da escravidão. Traz a energia da libertação de correntes e da transformação das cinzas em vida.',
    mensagem_central: 'Das cinzas surge a vida nova. A libertação está ao seu alcance.',
    cores: ['branco', 'amarelo'],
    qualidades: ['libertação', 'transformação', 'renascimento', 'força', 'superação'],
  },

  // ─── 14: Merinlelogun (Meji) ─────────────────────────────────────────────────
  // Numerology: 14, 5 - Duality resolved, freedom
  14: {
    odu_numero: 14,
    odu_nome: 'Merinlelogun',
    odu_nome_yoruba: 'Merìnlelogun',
    numeros: [
      { numero: 14, interpretacao: 'Merinlelogun em 14: A reunião dos opostos, a integração da dualidade. O número 14 traz liberdade através do equilíbrio.' },
      { numero: 5, interpretacao: 'Merinlelogun em 5: A liberdade após a integração, o caminho aberto. O 5 traz a mudança que vem após resolver a dualidade.' },
    ],
    elemento: 'fogo',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Duplos, reunião dos opostos, integração total. Revela que tudo tem dois lados e que a sabedoria está em ver a totalidade.',
    mensagem_central: 'A integração dos opostos traz liberdade. See a totalidade além das aparências.',
    cores: ['branco', 'vermelho'],
    qualidades: ['integração', 'dualidade', 'sabedoria', 'equilíbrio', 'totalidade'],
  },

  // ─── 15: Oxunar ─────────────────────────────────────────────────────────────
  // Numerology: 15, 6 - Abundance, harmony, serpents
  15: {
    odu_numero: 15,
    odu_nome: 'Oxunar',
    odu_nome_yoruba: 'Oxu Nlá',
    numeros: [
      { numero: 15, interpretacao: 'Oxunar em 15: A abundância suprema, o magnetismo da prosperidade. O número 15 traz a capacidade de atrair riqueza material e espiritual.' },
      { numero: 6, interpretacao: 'Oxunar em 6: A abundância harmônica, o serviço que atrai prosperidade. O 6 traz equilíbrio para a energia de Oxunar.' },
    ],
    elemento: 'terra',
    alinhamento_energetico: 'Quente',
    significado_espiritual: 'Abundância, riqueza, prosperidade material e espiritual. Traz a energia do magnetismo natural e da abundância infinita.',
    mensagem_central: 'A prosperidade flui para você. Abra seu coração para receber a abundância.',
    cores: ['dourado', 'amarelo'],
    qualidades: ['abundância', 'prosperidade', 'magnetismo', 'riqueza', 'generosidade'],
  },

  // ─── 16: Oyekun ─────────────────────────────────────────────────────────────
  // Numerology: 16, 7 - Confirmation, rest, completion
  16: {
    odu_numero: 16,
    odu_nome: 'Oyekun',
    odu_nome_yoruba: 'Ọyẹ́kùn',
    numeros: [
      { numero: 16, interpretacao: 'Oyekun em 16: A confirmação divina, o descanso sagrado. O número 16 traz a paz que vem após a confirmação dos Deuses.' },
      { numero: 7, interpretacao: 'Oyekun em 7: A sabedoria da confirmação, o descanso na verdade. O 7 traz introspecção para assentar a confirmação recebida.' },
    ],
    elemento: 'ar',
    alinhamento_energetico: 'Neutro',
    significado_espiritual: 'Morte, descanso, confirmação dos Deuses. Traz a energia da verificação espiritual e do descanso após a jornada.',
    mensagem_central: 'Os Deuses confirmam seu caminho. Descanse na verdade que foi revelada.',
    cores: ['branco', 'azul celeste'],
    qualidades: ['confirmação', 'descanso', 'verificação', 'paz', 'tranquilidade'],
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODDU_NUMEROLOGY_MAPPINGS);

// ─── Lookup Functions ────────────────────────────────────────────────────────

/**
 * Get Odu-Ifá numerology correlation mapping
 * @param odu - Odu number (1-16) or name
 * @returns OduNumerologyMapping or null if not found
 */
export function getOduNumerology(odu: number | string): OduNumerologyMapping | null {
  if (typeof odu === 'number') {
    return ODDU_NUMEROLOGY_MAPPINGS[odu] ?? null;
  }
  // Search by name (case-insensitive)
  const oduLower = odu.toLowerCase();
  const found = Object.values(ODDU_NUMEROLOGY_MAPPINGS).find(
    m => m.odu_nome.toLowerCase() === oduLower || m.odu_nome_yoruba.toLowerCase() === oduLower
  );
  return found ?? null;
}

/**
 * Get numerology correlation for a specific number
 * @param numero - Numerology number (1-13)
 * @returns Array of Odu mappings that have this number
 */
export function getNumerologyOdu(numero: number): OduNumerologyMapping[] {
  return Object.values(ODDU_NUMEROLOGY_MAPPINGS).filter(m =>
    m.numeros.some(n => n.numero === numero)
  );
}

/**
 * Get all Odu-Ifá numerology mappings
 * @returns Array of all mappings sorted by Odu number
 */
export function getAllOduNumerologies(): OduNumerologyMapping[] {
  return Object.values(ODDU_NUMEROLOGY_MAPPINGS).sort((a, b) => a.odu_numero - b.odu_numero);
}

/**
 * Get all Odu numbers (1-16)
 * @returns Array of Odu numbers
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODDU_NUMEROLOGY_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Get all Odu names in Portuguese
 * @returns Array of Odu names
 */
export function getAllOduNames(): string[] {
  return Object.values(ODDU_NUMEROLOGY_MAPPINGS)
    .sort((a, b) => a.odu_numero - b.odu_numero)
    .map(m => m.odu_nome);
}

/**
 * Get all unique numerology numbers
 * @returns Array of numerology numbers (deduplicated, sorted)
 */
export function getAllNumerologyNumbers(): number[] {
  const numbers = new Set<number>();
  Object.values(ODDU_NUMEROLOGY_MAPPINGS).forEach(m => {
    m.numeros.forEach(n => numbers.add(n.numero));
  });
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Get Odús by element
 * @param elemento - Element type
 * @returns Array of OduNumerologyMapping for that element
 */
export function getOduByElement(elemento: ElementType): OduNumerologyMapping[] {
  return Object.values(ODDU_NUMEROLOGY_MAPPINGS).filter(m => m.elemento === elemento);
}

/**
 * Get all Odús for a specific numerology number
 * @param numero - Numerology number (1-13)
 * @returns Array of Odu names that have this number
 */
export function getOdusForNumber(numero: number): string[] {
  return Object.values(ODDU_NUMEROLOGY_MAPPINGS)
    .filter(m => m.numeros.some(n => n.numero === numero))
    .map(m => m.odu_nome);
}

/**
 * Get the element for a given Odu number
 * @param oduNumero - Odu number (1-16)
 * @returns Element type or null if not found
 */
export function getOduElement(oduNumero: number): ElementType | null {
  return ODDU_NUMEROLOGY_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get the spiritual message for a given Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Spiritual message or null if not found
 */
export function getOduMessage(oduNumero: number): string | null {
  return ODDU_NUMEROLOGY_MAPPINGS[oduNumero]?.mensagem_central ?? null;
}

/**
 * Get the numerology numbers for a given Odu
 * @param oduNumero - Odu number (1-16)
 * @returns Array of numerology correlations or null if not found
 */
export function getOduNumbers(oduNumero: number): NumerologyCorrelation[] | null {
  return ODDU_NUMEROLOGY_MAPPINGS[oduNumero]?.numeros ?? null;
}

/**
 * Check if an Odu number exists
 * @param oduNumero - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduNumerology(oduNumero: number): boolean {
  return oduNumero in ODDU_NUMEROLOGY_MAPPINGS;
}

// ─── Default Export ───────────────────────────────────────────────────────────
