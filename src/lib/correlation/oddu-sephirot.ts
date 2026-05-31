/**
 * Oddu-Ifá Cabala Sephirot Correlation Module
 * Maps the 16 Odú Ifá (Merindilogun) to their corresponding Sephiroth on the Kabbalistic Tree of Life
 * With spiritual meaning for divination and ritual practice
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OdduSephirot {
  /** Oddu number (1-16) */
  oddu_numero: number;
  /** Oddu name in Portuguese */
  oddu_nome: string;
  /** Corresponding Sephirah on the Tree of Life */
  sephirah: string;
  /** Primary element */
  elemento: ElementType;
  /** Spiritual significance and archetype */
  significado_espiritual: string;
  /** Path connection details */
  conexoes_caminho: {
    /** Path number on the Tree of Life */
    numero_caminho: number;
    /** Hebrew letter associated */
    letra_hebraica: string;
    /** Direction on the Tree of Life */
    posicao: string;
    /** Related Sephiroth connections */
    sephirot_relacionadas: string[];
  };
  /** Day of week correspondence */
  dia_semana: string;
}

// ─── Odú Ifá-to-Sephiroth Mapping (Merindilogun 1-16) ────────────────────────

export const ODDU_SEPHIROT_MAPPINGS: Record<number, OdduSephirot> = {
  // ─── 1: Okaran ─────────────────────────────────────────────────────────────
  1: {
    oddu_numero: 1,
    oddu_nome: 'Okaran',
    sephirah: 'Malkuth',
    elemento: 'éter',
    significado_espiritual:
      'Okaran (1): O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado. Representa a força necessária para iniciar grandes impérios do zero, passando pela prova de fogo da insubordinação aos obstáculos.',
    conexoes_caminho: {
      numero_caminho: 21,
      letra_hebraica: 'ת',
      posicao: 'Base da Árvore (Malkuth)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Binah'],
    },
    dia_semana: 'Segunda-feira',
  },

  // ─── 2: Ejiokô ─────────────────────────────────────────────────────────────
  2: {
    oddu_numero: 2,
    oddu_nome: 'Ejiokô',
    sephirah: 'Binah',
    elemento: 'água',
    significado_espiritual:
      'Ejiokô (2): A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas. Este odú representa a polaridade da existência e a necessidade de encontrar equilíbrio entre opostos.',
    conexoes_caminho: {
      numero_caminho: 3,
      letra_hebraica: 'ג',
      posicao: 'Pilar da Severidade (Binah)',
      sephirot_relacionadas: ['Kether', 'Chokmah'],
    },
    dia_semana: 'Segunda-feira',
  },

  // ─── 3: Etaogundá ──────────────────────────────────────────────────────────
  3: {
    oddu_numero: 3,
    oddu_nome: 'Etaogundá',
    sephirah: 'Geburah',
    elemento: 'fogo',
    significado_espiritual:
      'Etaogundá (3): A revolta, a força física, a criação de ferramentas. O corte e a separação. Este odú traz a energia da criação através do trabalho, da justiça e da força interior.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Chesed', 'Tiphereth', 'Binah'],
    },
    dia_semana: 'Terça-feira',
  },

  // ─── 4: Irosun ─────────────────────────────────────────────────────────────
  4: {
    oddu_numero: 4,
    oddu_nome: 'Irosun',
    sephirah: 'Chesed',
    elemento: 'água',
    significado_espiritual:
      'Irosun (4): O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro com clareza. Este odú confere intuição profunda e capacidade de interpretar avisos e sonhos.',
    conexoes_caminho: {
      numero_caminho: 4,
      letra_hebraica: 'ד',
      posicao: 'Pilar da Misericórdia (Chesed)',
      sephirot_relacionadas: ['Binah', 'Geburah', 'Tiphereth'],
    },
    dia_semana: 'Quinta-feira',
  },

  // ─── 5: Oxé ─────────────────────────────────────────────────────────────────
  5: {
    oddu_numero: 5,
    oddu_nome: 'Oxé',
    sephirah: 'Tiphereth',
    elemento: 'fogo',
    significado_espiritual:
      'Oxé (5): O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Este odú confere magnetismo pessoal, charme natural e a capacidade de realizar feitiçarias (magia ritual).',
    conexoes_caminho: {
      numero_caminho: 6,
      letra_hebraica: 'ו',
      posicao: 'Centro da Árvore (Tiphereth)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Quinta-feira / Sábado',
  },

  // ─── 6: Obará ───────────────────────────────────────────────────────────────
  6: {
    oddu_numero: 6,
    oddu_nome: 'Obará',
    sephirah: 'Netzach',
    elemento: 'fogo',
    significado_espiritual:
      'Obará (6): A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo. Traz a energia da realeza interior e da manifestação da prosperidade.',
    conexoes_caminho: {
      numero_caminho: 7,
      letra_hebraica: 'ז',
      posicao: 'Pilar da Misericórdia (Netzach)',
      sephirot_relacionadas: ['Chesed', 'Tiphereth', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Segunda-feira / Domingo',
  },

  // ─── 7: Odi ─────────────────────────────────────────────────────────────────
  7: {
    oddu_numero: 7,
    oddu_nome: 'Odi',
    sephirah: 'Hod',
    elemento: 'fogo',
    significado_espiritual:
      'Odi (7): A teimosia, o renascimento, as coisas ocultas, o poço profundo. Traz a energia da transmutação e do renascimento após ciclos difíceis.',
    conexoes_caminho: {
      numero_caminho: 8,
      letra_hebraica: 'ח',
      posicao: 'Pilar da Severidade (Hod)',
      sephirot_relacionadas: ['Geburah', 'Tiphereth', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Terça-feira',
  },

  // ─── 8: EjiOníle ────────────────────────────────────────────────────────────
  8: {
    oddu_numero: 8,
    oddu_nome: 'EjiOníle',
    sephirah: 'Yesod',
    elemento: 'água',
    significado_espiritual:
      'EjiOníle (8): A cabeça (Ori), a liderança, o topo do mundo, o sangue branco. Este odú representa a liderança espiritual e a conexão com o divino.',
    conexoes_caminho: {
      numero_caminho: 9,
      letra_hebraica: 'ט',
      posicao: 'Fundação (Yesod)',
      sephirot_relacionadas: ['Tiphereth', 'Netzach', 'Hod', 'Malkuth'],
    },
    dia_semana: 'Sexta-feira / Domingo',
  },

  // ─── 9: Ossá ────────────────────────────────────────────────────────────────
  9: {
    oddu_numero: 9,
    oddu_nome: 'Ossá',
    sephirah: 'Binah',
    elemento: 'ar',
    significado_espiritual:
      'Ossá (9): O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais). Este odú traz a energia das mudanças abruptas e do poder feminino ancestral.',
    conexoes_caminho: {
      numero_caminho: 3,
      letra_hebraica: 'ג',
      posicao: 'Pilar da Severidade (Binah)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Tiphereth'],
    },
    dia_semana: 'Sábado',
  },

  // ─── 10: Ofun ──────────────────────────────────────────────────────────────
  10: {
    oddu_numero: 10,
    oddu_nome: 'Ofun',
    sephirah: 'Malkuth',
    elemento: 'éter',
    significado_espiritual:
      'Ofun (10): O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação. Este odú representa a sabedoria accumulada e a capacidade de cura.',
    conexoes_caminho: {
      numero_caminho: 21,
      letra_hebraica: 'ת',
      posicao: 'Base da Árvore (Malkuth)',
      sephirot_relacionadas: ['Yesod', 'Tiphereth'],
    },
    dia_semana: 'Segunda-feira',
  },

  // ─── 11: Owarin ────────────────────────────────────────────────────────────
  11: {
    oddu_numero: 11,
    oddu_nome: 'Owarin',
    sephirah: 'Geburah',
    elemento: 'fogo',
    significado_espiritual:
      'Owarin (11): A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas. Este odú traz a energia da transformação acelerada.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Hod', 'Tiphereth', 'Binah'],
    },
    dia_semana: 'Terça-feira',
  },

  // ─── 12: Ejilsebora ────────────────────────────────────────────────────────
  12: {
    oddu_numero: 12,
    oddu_nome: 'Ejilsebora',
    sephirah: 'Hod',
    elemento: 'fogo',
    significado_espiritual:
      'Ejilsebora (12): A justiça, o fogo purificador, a guerra justa, os terremotos. Este odú traz a energia da purificação através do fogo.',
    conexoes_caminho: {
      numero_caminho: 8,
      letra_hebraica: 'ח',
      posicao: 'Pilar da Severidade (Hod)',
      sephirot_relacionadas: ['Geburah', 'Netzach', 'Tiphereth'],
    },
    dia_semana: 'Terça-feira / Quarta-feira',
  },

  // ─── 13: Olobón ────────────────────────────────────────────────────────────
  13: {
    oddu_numero: 13,
    oddu_nome: 'Olobón',
    sephirah: 'Yesod',
    elemento: 'terra',
    significado_espiritual:
      'Olobón (13): A doença, as transformações físicas, o fim de ciclos. O recolhimento. Este odú traz a energia da dissolução e do encerramento necessário.',
    conexoes_caminho: {
      numero_caminho: 9,
      letra_hebraica: 'ט',
      posicao: 'Fundação (Yesod)',
      sephirot_relacionadas: ['Malkuth', 'Tiphereth', 'Netzach'],
    },
    dia_semana: 'Segunda-feira',
  },

  // ─── 14: Iká ───────────────────────────────────────────────────────────────
  14: {
    oddu_numero: 14,
    oddu_nome: 'Iká',
    sephirah: 'Netzach',
    elemento: 'água',
    significado_espiritual:
      'Iká (14): A traição, a cobra que morde, a sabedoria oculta e a renovação da pele. Este odú traz a energia da renovação através da dor.',
    conexoes_caminho: {
      numero_caminho: 7,
      letra_hebraica: 'ז',
      posicao: 'Pilar da Misericórdia (Netzach)',
      sephirot_relacionadas: ['Hod', 'Yesod', 'Tiphereth'],
    },
    dia_semana: 'Quinta-feira',
  },

  // ─── 15: Ogbogbé ───────────────────────────────────────────────────────────
  15: {
    oddu_numero: 15,
    oddu_nome: 'Ogbogbé',
    sephirah: 'Geburah',
    elemento: 'fogo',
    significado_espiritual:
      'Ogbogbé (15): A feitiçaria, o corte pesado, as disputas por espaço ou poder. Este odú traz a energia do poder pessoal e da proteção ativa.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Binah', 'Tiphereth', 'Hod'],
    },
    dia_semana: 'Terça-feira',
  },

  // ─── 16: Alafia ────────────────────────────────────────────────────────────
  16: {
    oddu_numero: 16,
    oddu_nome: 'Alafia',
    sephirah: 'Kether',
    elemento: 'éter',
    significado_espiritual:
      'Alafia (16): A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem. Este odú representa a iluminação máxima e a conexão direta com o divino.',
    conexoes_caminho: {
      numero_caminho: 11,
      letra_hebraica: 'א',
      posicao: 'Coroa (Kether)',
      sephirot_relacionadas: ['Chokmah', 'Binah', 'Tiphereth'],
    },
    dia_semana: 'Sexta-feira',
  },
};

// Freeze to prevent accidental modifications
Object.freeze(ODDU_SEPHIROT_MAPPINGS);

// ─── Lookup Functions ─────────────────────────────────────────────────────────

/**
 * Get Oddu-Sephirot correlation mapping
 * @param oddu - Oddu number (1-16) or name
 * @returns OdduSephirot mapping or null if not found
 */
export function getOduSephirot(oddu: number | string): OdduSephirot | null {
  if (typeof oddu === 'number') {
    return ODDU_SEPHIROT_MAPPINGS[oddu] ?? null;
  }
  const nameLower = oddu.toLowerCase();
  return Object.values(ODDU_SEPHIROT_MAPPINGS).find(
    (m) => m.oddu_nome.toLowerCase() === nameLower
  ) ?? null;
}

/**
 * Get all Oddu-Sephirot mappings in a reverse structure (Sephirah → Oddu)
 * @returns Map of Sephirah names to their corresponding Oddu names
 */
export function getSephirotOdu(): Record<string, { oddu_numero: number; oddu_nome: string }> {
  const result: Record<string, { oddu_numero: number; oddu_nome: string }> = {};
  for (const mapping of Object.values(ODDU_SEPHIROT_MAPPINGS)) {
    if (!result[mapping.sephirah]) {
      result[mapping.sephirah] = {
        oddu_numero: mapping.oddu_numero,
        oddu_nome: mapping.oddu_nome,
      };
    }
  }
  return result;
}

/**
 * Get all Oddu-Sephirot mappings
 * @returns Array of all mappings sorted by Oddu number
 */
export function getAllOduSephiroths(): OdduSephirot[] {
  return Object.values(ODDU_SEPHIROT_MAPPINGS).sort((a, b) => a.oddu_numero - b.oddu_numero);
}

/**
 * Get all Oddu numbers (1-16)
 * @returns Array of Oddu numbers
 */
export function getAllOdduNumbers(): number[] {
  return Object.keys(ODDU_SEPHIROT_MAPPINGS).map(Number).sort((a, b) => a - b);
}

/**
 * Get all Oddu names in Portuguese
 * @returns Array of Oddu names sorted by number
 */
export function getAllOdduNames(): string[] {
  return getAllOduSephiroths().map((m) => m.oddu_nome);
}

/**
 * Get all unique Sephirah names
 * @returns Array of Sephirah names (deduplicated)
 */
export function getAllSephirotNames(): string[] {
  const seen = new Set<string>();
  for (const mapping of Object.values(ODDU_SEPHIROT_MAPPINGS)) {
    seen.add(mapping.sephirah);
  }
  return Array.from(seen).sort();
}

/**
 * Get Oddu by element
 * @param elemento - Element type
 * @returns Array of OdduSephirot mappings for that element
 */
export function getOdduByElement(elemento: ElementType): OdduSephirot[] {
  return Object.values(ODDU_SEPHIROT_MAPPINGS)
    .filter((m) => m.elemento === elemento)
    .sort((a, b) => a.oddu_numero - b.oddu_numero);
}

/**
 * Get Oddu by Sephirah
 * @param sephirah - Sephirah name (case-insensitive)
 * @returns Array of OdduSephirot mappings for that Sephirah
 */
export function getOdduBySephirah(sephirah: string): OdduSephirot[] {
  const nameLower = sephirah.toLowerCase();
  return Object.values(ODDU_SEPHIROT_MAPPINGS)
    .filter((m) => m.sephirah.toLowerCase() === nameLower)
    .sort((a, b) => a.oddu_numero - b.oddu_numero);
}

/**
 * Check if an Oddu number exists
 * @param odduNumero - Oddu number to check
 * @returns True if Oddu exists in mapping
 */
export function hasOdduSephirot(odduNumero: number): boolean {
  return odduNumero in ODDU_SEPHIROT_MAPPINGS;
}

/**
 * Get the element for a given Oddu number
 * @param odduNumero - Oddu number (1-16)
 * @returns Element type or null if not found
 */
export function getOdduElement(odduNumero: number): ElementType | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.elemento ?? null;
}

/**
 * Get the spiritual message for a given Oddu
 * @param odduNumero - Oddu number (1-16)
 * @returns Spiritual message or null if not found
 */
export function getOdduMessage(odduNumero: number): string | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.significado_espiritual ?? null;
}

/**
 * Get the Sephirah for a given Oddu number
 * @param odduNumero - Oddu number (1-16)
 * @returns Sephirah name or null if not found
 */
export function getSephirotByOdduNumber(odduNumero: number): string | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.sephirah ?? null;
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  getOduSephirot,
  getSephirotOdu,
  getAllOduSephiroths,
  getAllOdduNumbers,
  getAllOdduNames,
  getAllSephirotNames,
  getOdduByElement,
  getOdduBySephirah,
  hasOdduSephirot,
  getOdduElement,
  getOdduMessage,
  getSephirotByOdduNumber,
  ODDU_SEPHIROT_MAPPINGS,
};