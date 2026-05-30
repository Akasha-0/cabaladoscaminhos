/**
 * Odu Ifá - Cabala Sephiroth Correlation Mapping
 * Based on IDEIA.md Tabela de Correspondência Macro and Matriz de Numerologia
 * Maps the 16 Odu Ifá (Merindilogun) to their corresponding Sephiroth on the Kabbalistic Tree of Life
 */

/**
 * Represents the correlation between an Odu Ifá and its corresponding Sephirah
 */
export interface OduSephirah {
  /** Odu Ifá number (1-16) */
  odu_numero: number;
  /** Odu Ifá name in Yoruba/Portuguese */
  odu_nome: string;
  /** Corresponding Sephirah on the Tree of Life */
  sephirah: string;
  /** Energy alignment classification */
  alinhamento_energetico: string;
  /** Spiritual significance and archetype */
  significado_espiritual: string;
  /** Path connection details */
  conexoes_caminho: {
    /** Path number on the Tree of Life (1-22 for Major Arcana) */
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

// ─── Odu Ifá-to-Sephiroth Mapping ────────────────────────────────────────────

export const ODU_SEPHIROT_MAPPINGS: Record<string, OduSephirah> = {
  // 1. Okaran - The Beginning / Malkuth
  Okaran: {
    odu_numero: 1,
    odu_nome: 'Okaran',
    sephirah: 'Malkuth',
    alinhamento_energetico: 'Quente / Densa',
    significado_espiritual:
      'Okaran (1): O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado. Representa a força necessária para iniciar grandes impérios do zero, passando pela prova de fogo da insubordinação aos obstáculos. Este odú traz a energia do início de ciclos, quando tudo ainda é dúvida e desafio.',
    conexoes_caminho: {
      numero_caminho: 21,
      letra_hebraica: 'ת',
      posicao: 'Base da Árvore (Malkuth)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Binah'],
    },
    dia_semana: 'Segunda-feira',
  },

  // 2. Ejiokô - Duality / Binah
  Ejioko: {
    odu_numero: 2,
    odu_nome: 'Ejiokô',
    sephirah: 'Binah',
    alinhamento_energetico: 'Fria / Limitada',
    significado_espiritual:
      'Ejiokô (2): A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas. Este odú representa a polaridade da existência e a necessidade de encontrar equilíbrio entre opostos. Traz a energia da formação da consciência através da experiência de pares (luz/sombra, ganho/perda).',
    conexoes_caminho: {
      numero_caminho: 3,
      letra_hebraica: 'ג',
      posicao: 'Pilar da Severidade (Binah)',
      sephirot_relacionadas: ['Kether', 'Chokmah'],
    },
    dia_semana: 'Segunda-feira',
  },

  // 3. Etaogundá - Creation / Geburah
  Etaogunda: {
    odu_numero: 3,
    odu_nome: 'Etaogundá',
    sephirah: 'Geburah',
    alinhamento_energetico: 'Quente / Ígnea',
    significado_espiritual:
      'Etaogundá (3): A revolta, a força física, a criação de ferramentas. O corte e a separação. Este odú traz a energia da criação através do trabalho, da justiça e da força interior. Representa a capacidade de criar ferramentas (no sentido literal e metafórico) para superar obstáculos e manter o equilíbrio.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Chesed', 'Tiphereth', 'Binah'],
    },
    dia_semana: 'Terça-feira',
  },

  // 4. Irosun - Vision / Chesed
  Irosun: {
    odu_numero: 4,
    odu_nome: 'Irosun',
    sephirah: 'Chesed',
    alinhamento_energetico: 'Fria / Expansiva',
    significado_espiritual:
      'Irosun (4): O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro com clareza. Este odú confere intuição profunda, capacidade de interpretar avisos e sonhos, e conexão com as águas geradoras. Abre a visão interior para perceber o que está além do véu.',
    conexoes_caminho: {
      numero_caminho: 4,
      letra_hebraica: 'ד',
      posicao: 'Pilar da Misericórdia (Chesed)',
      sephirot_relacionadas: ['Binah', 'Geburah', 'Tiphereth'],
    },
    dia_semana: 'Quinta-feira',
  },

  // 5. Oxé - Gold and Magic / Tiphereth
  Oxe: {
    odu_numero: 5,
    odu_nome: 'Oxé',
    sephirah: 'Tiphereth',
    alinhamento_energetico: 'Fria / Expansiva',
    significado_espiritual:
      'Oxé (5): O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual. Este odú confere magnetismo pessoal, charme natural e a capacidade de realizar feitiçarias (no sentido de magia ritual). Traz a energia da diplomacia, da autoestima elevada e da atração de recursos materiais e emocionais.',
    conexoes_caminho: {
      numero_caminho: 6,
      letra_hebraica: 'ו',
      posicao: 'Centro da Árvore (Tiphereth)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Quinta-feira / Sábado',
  },

  // 6. Obará - Wealth and Kingship / Netzach
  Obara: {
    odu_numero: 6,
    odu_nome: 'Obará',
    sephirah: 'Netzach',
    alinhamento_energetico: 'Quente / Radiante',
    significado_espiritual:
      'Obará (6): A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo. Traz a energia da realeza interior, do brilho pessoal e da manifestação da prosperidade. Conecta o consulente à força vital do sol e à capacidade de transformar recursos em abundância.',
    conexoes_caminho: {
      numero_caminho: 7,
      letra_hebraica: 'ז',
      posicao: 'Pilar da Misericórdia (Netzach)',
      sephirot_relacionadas: ['Chesed', 'Tiphereth', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Segunda-feira / Domingo',
  },

  // 7. Odi - Obstinacy and Rebirth / Hod
  Odi: {
    odu_numero: 7,
    odu_nome: 'Odi',
    sephirah: 'Hod',
    alinhamento_energetico: 'Quente / Ígnea',
    significado_espiritual:
      'Odi (7): A teimosia, o renascimento, as coisas ocultas, o poço profundo. Traz a energia da transmutação e do renascimento após ciclos difíceis. O poço profundo representa os mistérios ocultos que devem ser explorados para alcançar a transformação. Desperta a coragem de enfrentar o que está oculto.',
    conexoes_caminho: {
      numero_caminho: 8,
      letra_hebraica: 'ח',
      posicao: 'Pilar da Severidade (Hod)',
      sephirot_relacionadas: ['Geburah', 'Tiphereth', 'Yesod', 'Malkuth'],
    },
    dia_semana: 'Terça-feira',
  },

  // 8. EjiOníle - The Head / Yesod
  EjiOnile: {
    odu_numero: 8,
    odu_nome: 'EjiOníle',
    sephirah: 'Yesod',
    alinhamento_energetico: 'Fria / Magnética',
    significado_espiritual:
      'EjiOníle (8): A cabeça (Ori), a liderança, o topo do mundo, o sangue branco. Este odú representa a liderança espiritual, o cuidado com o Ori (cabeça) e a conexão com o divino. Traz a energia da paz absoluta, da pureza e do alinhamento com a sabedoria superior. É o odú do Bori e da consagração da cabeça.',
    conexoes_caminho: {
      numero_caminho: 9,
      letra_hebraica: 'ט',
      posicao: 'Fundação (Yesod)',
      sephirot_relacionadas: ['Tiphereth', 'Netzach', 'Hod', 'Malkuth'],
    },
    dia_semana: 'Sexta-feira / Domingo',
  },

  // 9. Ossá - The Wind / Binah-Tiphereth
  Ossa: {
    odu_numero: 9,
    odu_nome: 'Ossá',
    sephirah: 'Binah',
    alinhamento_energetico: 'Ar / Transformadora',
    significado_espiritual:
      'Ossá (9): O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais). Este odú traz a energia das mudanças abruptas e do poder feminino ancestral. Representa o vento que espalha e transforma, a sabedoria das mulheres antigas e a capacidade de se adaptar rapidamente às circunstâncias.',
    conexoes_caminho: {
      numero_caminho: 3,
      letra_hebraica: 'ג',
      posicao: 'Pilar da Severidade (Binah)',
      sephirot_relacionadas: ['Kether', 'Chokmah', 'Tiphereth'],
    },
    dia_semana: 'Sábado',
  },

  // 10. Ofun - Mystery / Malkuth-Yesod
  Ofun: {
    odu_numero: 10,
    odu_nome: 'Ofun',
    sephirah: 'Malkuth',
    alinhamento_energetico: 'Neutra / Central',
    significado_espiritual:
      'Ofun (10): O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação. Este odú representa a sabedoria accumulada ao longo do tempo e a capacidade de cura através da paciência. Traz a energia do alinhamento com a vontade divina e a compreensão dos mistérios ocultos.',
    conexoes_caminho: {
      numero_caminho: 21,
      letra_hebraica: 'ת',
      posicao: 'Base da Árvore (Malkuth)',
      sephirot_relacionadas: ['Yesod', 'Tiphereth'],
    },
    dia_semana: 'Segunda-feira',
  },

  // 11. Owarin - Hurry and Change / Geburah-Hod
  Owarin: {
    odu_numero: 11,
    odu_nome: 'Owarin',
    sephirah: 'Geburah',
    alinhamento_energetico: 'Fogo / Ar',
    significado_espiritual:
      'Owarin (11): A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas. Este odú traz a energia da transformação acelerada e da necessidade de adaptação constante. Representa o momento em que é preciso agir rapidamente para não perder oportunidades.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Hod', 'Tiphereth', 'Binah'],
    },
    dia_semana: 'Terça-feira',
  },

  // 12. Ejilsebora - Justice / Hod
  Ejilsebora: {
    odu_numero: 12,
    odu_nome: 'Ejilsebora',
    sephirah: 'Hod',
    alinhamento_energetico: 'Fogo / Purificador',
    significado_espiritual:
      'Ejilsebora (12): A justiça, o fogo purificador, a guerra justa, os terremotos. Este odú traz a energia da purificação através do fogo e da aplicação rigorosa da justiça. Representa o momento de prestação de contas e a necessidade de equilibrar a razão e a emoção.',
    conexoes_caminho: {
      numero_caminho: 8,
      letra_hebraica: 'ח',
      posicao: 'Pilar da Severidade (Hod)',
      sephirot_relacionadas: ['Geburah', 'Netzach', 'Tiphereth'],
    },
    dia_semana: 'Terça-feira / Quarta-feira',
  },

  // 13. Olobón - Disease / Yesod
  Olobon: {
    odu_numero: 13,
    odu_nome: 'Olobón',
    sephirah: 'Yesod',
    alinhamento_energetico: 'Terra / Água',
    significado_espiritual:
      'Olobón (13): A doença, as transformações físicas, o fim de ciclos. O recolhimento. Este odú traz a energia da dissolução e do encerramento necessário. Representa o momento de recolhimento para cura e regeneração, quando é preciso停下 e allowing for transformation.',
    conexoes_caminho: {
      numero_caminho: 9,
      letra_hebraica: 'ט',
      posicao: 'Fundação (Yesod)',
      sephirot_relacionadas: ['Malkuth', 'Tiphereth', 'Netzach'],
    },
    dia_semana: 'Segunda-feira',
  },

  // 14. Iká - Betrayal / Netzach
  Ika: {
    odu_numero: 14,
    odu_nome: 'Iká',
    sephirah: 'Netzach',
    alinhamento_energetico: 'Água / Terra',
    significado_espiritual:
      'Iká (14): A traição, a cobra que morde, a sabedoria oculta e a renovação da pele. Este odú traz a energia da renovação através da dor. Representa o momento de renovação da pele (como a cobra) e a sabedoria que vem após atravessar traições e obstáculos.',
    conexoes_caminho: {
      numero_caminho: 7,
      letra_hebraica: 'ז',
      posicao: 'Pilar da Misericórdia (Netzach)',
      sephirot_relacionadas: ['Hod', 'Yesod', 'Tiphereth'],
    },
    dia_semana: 'Quinta-feira',
  },

  // 15. Ogbogbé - Witchcraft / Geburah
  Ogbogbe: {
    odu_numero: 15,
    odu_nome: 'Ogbogbé',
    sephirah: 'Geburah',
    alinhamento_energetico: 'Fogo / Terra',
    significado_espiritual:
      'Ogbogbé (15): A feitiçaria, o corte pesado, as disputas por espaço ou poder. Este odú traz a energia do poder pessoal e da capacidade de intervir ativamente no curso dos eventos. Representa o momento de proteção ativa e de uso do poder pessoal para defender o próprio espaço.',
    conexoes_caminho: {
      numero_caminho: 5,
      letra_hebraica: 'ה',
      posicao: 'Pilar da Severidade (Geburah)',
      sephirot_relacionadas: ['Binah', 'Tiphereth', 'Hod'],
    },
    dia_semana: 'Terça-feira',
  },

  // 16. Alafia - Absolute Peace / Kether
  Alafia: {
    odu_numero: 16,
    odu_nome: 'Alafia',
    sephirah: 'Kether',
    alinhamento_energetico: 'Ar / Luz',
    significado_espiritual:
      'Alafia (16): A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem. Este odú representa a iluminação máxima e a conexão direta com o divino. Traz a energia da paz interior absoluta, da harmonia completa e do alinhamento total com o propósito espiritual.',
    conexoes_caminho: {
      numero_caminho: 11,
      letra_hebraica: 'א',
      posicao: 'Coroa (Kether)',
      sephirot_relacionadas: ['Chokmah', 'Binah', 'Tiphereth'],
    },
    dia_semana: 'Sexta-feira',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_SEPHIROT_MAPPINGS);

// ─── Query Functions ─────────────────────────────────────────────────────────

/**
 * Get the Odu-to-Sephirah correlation mapping
 * @param odu - The name of the Odu (e.g., 'Okaran', 'Irosun', 'Odi')
 * @returns The correlation mapping or null if not found
 */
export function getOduSephirah(odu: string): OduSephirah | null {
  return ODU_SEPHIROT_MAPPINGS[odu] ?? null;
}

/**
 * Get all Odu-Sephirah mappings in a reverse structure (Sephirah → Odu)
 * @returns Map of Sephirah names to their corresponding Odu names
 */
export function getSephirahOdu(): Record<string, { odu_numero: number; odu_nome: string }> {
  const result: Record<string, { odu_numero: number; odu_nome: string }> = {};
  for (const mapping of Object.values(ODU_SEPHIROT_MAPPINGS)) {
    if (!result[mapping.sephirah]) {
      result[mapping.sephirah] = {
        odu_numero: mapping.odu_numero,
        odu_nome: mapping.odu_nome,
      };
    }
  }
  return result;
}

/**
 * Get all available Odu-Sephirah mappings
 * @returns Array of all correlation mappings
 */
export function getAllOduSephirahs(): OduSephirah[] {
  return Object.values(ODU_SEPHIROT_MAPPINGS);
}

/**
 * Get all Odu names
 * @returns Array of Odu names (sorted by number)
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_SEPHIROT_MAPPINGS)
    .sort((a, b) => a.odu_numero - b.odu_numero)
    .map((m) => m.odu_nome);
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - The name of the Odu to check
 * @returns True if Odu exists in mapping
 */
export function hasOduSephirah(odu: string): boolean {
  return odu in ODU_SEPHIROT_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The Odu-Sephirah mapping or null if not found
 */
export function getOduByNumber(numero: number): OduSephirah | null {
  return (
    Object.values(ODU_SEPHIROT_MAPPINGS).find((m) => m.odu_numero === numero) ?? null
  );
}

/**
 * Get Sephirah by Odu number
 * @param numero - Odu number (1-16)
 * @returns The Sephirah name or null if not found
 */
export function getSephirahByOduNumber(numero: number): string | null {
  const mapping = getOduByNumber(numero);
  return mapping?.sephirah ?? null;
}

/**
 * Default export for convenience
 */
export default {
  getOduSephirah,
  getSephirahOdu,
  getAllOduSephirahs,
  getAllOduNames,
  hasOduSephirah,
  getOduByNumber,
  getSephirahByOduNumber,
  ODU_SEPHIROT_MAPPINGS,
};