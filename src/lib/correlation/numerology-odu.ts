/**
 * Numerology-Odú Ifá Correlation Mapping
 * Correlates numerology numbers (1-13) with their corresponding Odu Ifá (Merindilogun)
 * Based on IDEIA.md Tabela de Correspondência - aligning number mysticism with Ifá divination
 */

export interface NumerologyOduMapping {
  /** The number itself (1-13) */
  numero: number;
  /** Corresponding Odu Ifá */
  odu: {
    numero: number;
    nome: string;
    nomeingles: string;
  };
  /** Spiritual meaning / archetype */
  significado_espiritual: string;
  /** Energy alignment classification */
  alinhamento_energetico: 'Quente' | 'Fria' | 'Neutra';
  /** Elemental correspondence */
  elemento: string;
  /** Interpretation in the context of numerology */
  interpretacao: string;
}

// ─── Numerology to Odú Ifá Mapping ─────────────────────────────────────────────────

export const NUMEROLOGY_ODU_MAPPINGS: Record<number, NumerologyOduMapping> = {
  1: {
    numero: 1,
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    significado_espiritual:
      'Ofun (10): A renovação, a transformação, o túmulo e a ressurreição. O número 1 representa o início, a força vital, o princípio masculino Yang. Este odú traz a energia da criação primal e do renascimento espiritual.',
    alinhamento_energetico: 'Quente',
    elemento: 'Fogo',
    interpretacao:
      'Number 1 aligned with Ofun represents new beginnings, leadership, and the power to manifest destiny. It speaks of the first breath of creation and the courage to start anew.',
  },
  2: {
    numero: 2,
    odu: {
      numero: 1,
      nome: 'Ogbe',
      nomeingles: 'Ogbe',
    },
    significado_espiritual:
      'Ogbe (1): O princípio, o começo absoluto, a criação do universo. O número 2 representa a dualidade, o princípio feminino Yin, a polaridade. Este é o odú mais favorável, representando prosperidade, proteção e o nascimento de tudo.',
    alinhamento_energetico: 'Neutra',
    elemento: 'Água',
    interpretacao:
      'Number 2 aligned with Ogbe represents balance, partnership, and the duality of life. It speaks of cooperation, intuition, and the harmonious interaction between opposites.',
  },
  3: {
    numero: 3,
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nomeingles: 'Oyekun',
    },
    significado_espiritual:
      'Etaogundá (3): A revolta, a força física, a criação de ferramentas. O número 3 representa expressão, criatividade, comunicação. Este odú traz a energia da criação através do trabalho e da transformação ativa.',
    alinhamento_energetico: 'Quente',
    elemento: 'Fogo',
    interpretacao:
      'Number 3 aligned with Etaogundá represents creative expression, social grace, and the power of words. It speaks of communication as a tool for transformation and self-expression.',
  },
  4: {
    numero: 4,
    odu: {
      numero: 4,
      nome: 'Irosun',
      nomeingles: 'Irosun',
    },
    significado_espiritual:
      'Irosun (4): O aviso, a visão espiritual, o sangue que corre nas veias. O número 4 representa estrutura, estabilidade, fundamento. Este odú confere intuição profunda e a capacidade de perceber além do véu.',
    alinhamento_energetico: 'Fria',
    elemento: 'Água',
    interpretacao:
      'Number 4 aligned with Irosun represents solid foundations, inner wisdom, and the stability of ritual practice. It speaks of being grounded while maintaining spiritual vision.',
  },
  5: {
    numero: 5,
    odu: {
      numero: 5,
      nome: 'Oxé',
      nomeingles: 'Oche',
    },
    significado_espiritual:
      'Oxé (5): O ouro, a doçura, a feitiçaria, o magnetismo pessoal. O número 5 representa mudança, liberdade, aprendizado. Este odú traz charme natural e a capacidade de criar realidade através da intenção.',
    alinhamento_energetico: 'Neutra',
    elemento: 'Terra',
    interpretacao:
      'Number 5 aligned with Oxé represents freedom, adventure, and the magnetic attraction of prosperity. It speaks of the wanderer who finds gold in every path.',
  },
  6: {
    numero: 6,
    odu: {
      numero: 6,
      nome: 'Obará',
      nomeingles: 'Obará',
    },
    significado_espiritual:
      'Obará (6): O mandamento, a ordem, o trabalho e a obediência. O número 6 representa harmonia, beleza, responsabilidade. Este odú traz a energia do dever cumprido e da ordem sagrada.',
    alinhamento_energetico: 'Neutra',
    elemento: 'Terra',
    interpretacao:
      'Number 6 aligned with Obará represents responsibility, service, and the balance between giving and receiving. It speaks of home, family, and the sacred duty of caretaking.',
  },
  7: {
    numero: 7,
    odu: {
      numero: 7,
      nome: 'Odi',
      nomeingles: 'Oddi',
    },
    significado_espiritual:
      'Odi (7): A teimosia, o renascimento, o poço profundo. O número 7 representa introspecção, sabedoria, compreensão. Este odú traz a energia da transmutação através dos mistérios ocultos.',
    alinhamento_energetico: 'Fria',
    elemento: 'Água',
    interpretacao:
      'Number 7 aligned with Odi represents inner work, spiritual awakening, and the depth of hidden knowledge. It speaks of going within to find the answers that illuminate the path.',
  },
  8: {
    numero: 8,
    odu: {
      numero: 8,
      nome: 'Ijonse',
      nomeingles: 'Irosun-Meji',
    },
    significado_espiritual:
      'Ijonse (8): A reunião, o conserto, o sacrifício. O número 8 representa karma, justiça, poder terreno. Este odú traz a energia do equilíbrio entre o material e o espiritual através do sacrifício consciente.',
    alinhamento_energetico: 'Neutra',
    elemento: 'Terra',
    interpretacao:
      'Number 8 aligned with Ijonse represents strength, material mastery, and the law of cause and effect. It speaks of receiving what was sown and the power of disciplined action.',
  },
  9: {
    numero: 9,
    odu: {
      numero: 9,
      nome: 'Se',
      nomeingles: 'Ose',
    },
    significado_espiritual:
      'Se (9): A medicina, o sacrifício, a transformação. O número 9 representa completion, humanitarianismo, sabedoria. Este odú traz a energia da cura e do serviço aos outros.',
    alinhamento_energetico: 'Quente',
    elemento: 'Fogo',
    interpretacao:
      'Number 9 aligned with Se represents compassion, endings, and spiritual enlightenment. It speaks of the sage who has walked the path and returns to serve humanity.',
  },
  10: {
    numero: 10,
    odu: {
      numero: 10,
      nome: 'Ofun',
      nomeingles: 'Ofun',
    },
    significado_espiritual:
      'Ofun (10): A renovação, a transformação, o renascimento. O número 10 representa novos começos, transição, manifestação. Este é o odú da morte e ressurreição espiritual.',
    alinhamento_energetico: 'Quente',
    elemento: 'Fogo',
    interpretacao:
      'Number 10 aligned with Ofun represents transformation, letting go, and rebirth. It speaks of releasing the old to welcome the new, of endings that become beginnings.',
  },
  11: {
    numero: 11,
    odu: {
      numero: 11,
      nome: 'Nanã',
      nomeingles: 'Nanã',
    },
    significado_espiritual:
      'Nanã (11): A velhice, a sabedoria ancestral, a modéstia. O número 11 representa intuição, iluminação espiritual, percepção além dos sentidos. Este é o número mestre da channeling.',
    alinhamento_energetico: 'Fria',
    elemento: 'Água',
    interpretacao:
      'Number 11 aligned with Nanã represents spiritual insight, ancestral wisdom, and the bridge between worlds. It speaks of receiving divine messages and translating them for others.',
  },
  12: {
    numero: 12,
    odu: {
      numero: 12,
      nome: 'Ejilsebora',
      nomeingles: 'Ejila-sebori',
    },
    significado_espiritual:
      'Ejilsebora (12): A purificação, a transformação, a integração. O número 12 representa jury, integração de opostos, serviço grupal. Este é o odú da reconciliação e da transformação coletiva.',
    alinhamento_energetico: 'Neutra',
    elemento: 'Ar',
    interpretacao:
      'Number 12 aligned with Ejilsebora represents integration, collaboration, and the merging of opposites. It speaks of community, shared purpose, and the alchemy of diverse elements.',
  },
  13: {
    numero: 13,
    odu: {
      numero: 13,
      nome: 'Olobón',
      nomeingles: 'Olobon',
    },
    significado_espiritual:
      'Olobón (13): A transformação, a mudança, o fim de ciclo. O número 13 representa morte e renascimento, transformação profunda, liberação kármica. Este é o odú mais poderoso de todos.',
    alinhamento_energetico: 'Quente',
    elemento: 'Fogo',
    interpretacao:
      'Number 13 aligned with Olobón represents profound transformation, the death of the ego, and rebirth into higher consciousness. It speaks of Phoenix rising from ashes.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGY_ODU_MAPPINGS);

/**
 * Get the numerology-Odú Ifá correlation mapping for a given number
 * @param numero - Number from 1 to 13
 * @returns The correlation mapping or null if not found
 */
export function getNumerologyOdu(numero: number): NumerologyOduMapping | null {
  return NUMEROLOGY_ODU_MAPPINGS[numero] ?? null;
}

/**
 * Get the Odu by its number in the Merindilogun system (1-16)
 * @param oduNumero - Odu number from 1 to 16
 * @returns Array of numerology numbers that correlate with this Odu, or null if Odu not found in mappings
 */
export function getOduNumerology(oduNumero: number): NumerologyOduMapping[] | null {
  const matches = Object.values(NUMEROLOGY_ODU_MAPPINGS).filter(
    (mapping) => mapping.odu.numero === oduNumero
  );
  return matches.length > 0 ? matches : null;
}

/**
 * Get all available numerology-Odú mappings
 * @returns Array of all correlation mappings sorted by number
 */
export function getAllNumerologyOdus(): NumerologyOduMapping[] {
  return Object.values(NUMEROLOGY_ODU_MAPPINGS).sort((a, b) => a.numero - b.numero);
}

/**
 * Get all unique Odu names from the mappings
 * @returns Array of unique Odu names
 */
export function getAllOduNames(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  Object.values(NUMEROLOGY_ODU_MAPPINGS).forEach((mapping) => {
    if (!seen.has(mapping.odu.nome)) {
      seen.add(mapping.odu.nome);
      result.push(mapping.odu.nome);
    }
  });
  return result;
}

/**
 * Check if a numerology number exists in the mapping
 * @param numero - Number to check
 * @returns True if number exists in mapping
 */
export function hasNumerologyOdu(numero: number): boolean {
  return numero in NUMEROLOGY_ODU_MAPPINGS;
}

/**
 * Get the energy alignment for a given number
 * @param numero - Number from 1 to 13
 * @returns Energy alignment or null if not found
 */
export function getNumerologyEnergy(numero: number): string | null {
  return NUMEROLOGY_ODU_MAPPINGS[numero]?.alinhamento_energetico ?? null;
}

/**
 * Get the element for a given number
 * @param numero - Number from 1 to 13
 * @returns Element or null if not found
 */
export function getNumerologyElement(numero: number): string | null {
  return NUMEROLOGY_ODU_MAPPINGS[numero]?.elemento ?? null;
}

export default {
  getNumerologyOdu,
  getOduNumerology,
  getAllNumerologyOdus,
  getAllOduNames,
  hasNumerologyOdu,
  getNumerologyEnergy,
  getNumerologyElement,
  NUMEROLOGY_ODU_MAPPINGS,
};