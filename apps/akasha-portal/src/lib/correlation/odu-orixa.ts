/**
 * Odu Ifá - Orixá Correlation Mapping
 * Correlates the 16 Odu Ifá (Merindilogun) with their ruling Orixás, elements, and spiritual practices
 * Based on IDEIA.md traditional Yoruba-Jeje spiritual mappings
 */

/**
 * Represents the correlation between an Odu Ifá and its corresponding Orixá
 */
export interface OduOrixa {
  /** The Odu Ifá */
  odu: {
    /** Odu number (1-16) */
    numero: number;
    /** Odu name in Portuguese/Yoruba */
    nome: string;
    /** Odu name in Yoruba */
    nome_yoruba: string;
  };
  /** The ruling Orixá */
  orixa: {
    /** Orixá name */
    nome: string;
    /** Alternative name if applicable */
    nome_alternativo?: string;
  };
  /** Primary spiritual element */
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  /** Spiritual connection description */
  conexao_espiritual: string;
  /** Recommended spiritual practices */
  praticas_espirituais: string[];
  /** Key symbolism */
  simbolismo: string[];
}

// ─── Odu Ifá-to-Orixá Mapping ───────────────────────────────────────────────

export const ODU_ORIXA_MAPPINGS: Record<number, OduOrixa> = {
  // ─── Primary Mappings (Merindilogun Odus 1-16) ─────────────────────────────

  1: {
    odu: {
      numero: 1,
      nome: 'Okaran',
      nome_yoruba: 'Okànràn',
    },
    orixa: {
      nome: 'Oxalá',
      nome_alternativo: 'Logun Ede',
    },
    elemento: 'éter',
    conexao_espiritual:
      'Okaran é o Odu da coragem, do recomeço e da liberdade. Governado por Oxalá, representa a força criadora primordial, o princípio executivo que transforma intenção em ação. Este Odu fala da fé que move montanhas, do pioneiro que abre caminhos onde não existem.',
    simbolismo: [
      'Início absoluto',
      'Coragem perante o desconhecido',
      'Fe inabalável',
      'Libertação e renovação',
      'Força criadora',
    ],
    praticas_espirituais: [
      'Oração a Oxalá para coragem e novos começos',
      'Ritual de renovação com água benta e flores brancas',
      'Meditação sobre novos caminhos',
      'Oferenda de akasà (fubá cozido) e frutas',
      'Descarrego espiritual com leaves of justice',
    ],
  },
  2: {
    odu: {
      numero: 2,
      nome: 'Ejiokô',
      nome_yoruba: 'Ejìokò',
    },
    orixa: {
      nome: 'Oxum',
      nome_alternativo: 'Oba',
    },
    elemento: 'água',
    conexao_espiritual:
      'Ejiokô representa a dualidade, os caminhos paralelos e o equilíbrio entre forças opostas. Governado por Oxum, o Orixá das águas doces e do ouro, revela que toda escolha importante exige confiar na intuição e equilibrar elementos contrastantes.',
    simbolismo: [
      'Dualidade e escolha',
      'Equilíbrio entre extremos',
      'Intuição profunda',
      'Beleza e prosperidade',
      'Amor e fertilidade',
    ],
    praticas_espirituais: [
      'Ritual de equilíbrio com água de Oxum',
      'Oração para tomada de decisão',
      'Oferenda de mel e ouro',
      'Banho de ervas para clareza mental',
      'Trabalho com Espada de Ogum para proteção',
    ],
  },
  3: {
    odu: {
      numero: 3,
      nome: 'Etaogundá',
      nome_yoruba: 'Ẹtaọgúndá',
    },
    orixa: {
      nome: 'Iemanjá',
      nome_alternativo: 'Yemanjá',
    },
    elemento: 'fogo',
    conexao_espiritual:
      'Etaogundá traz a força da revolta e da criação de ferramentas. Governado por Iemanjá, o Grande Mar, este Odu representa o poder de transformar a matéria e criar vida através da vontade. Fala do renascimento, da proteção maternal e da energia transformadora.',
    simbolismo: [
      'Força transformadora',
      'Criação eTool-making',
      'Proteção maternal',
      'Renascimento espiritual',
      'Poder sobre a matéria',
    ],
    praticas_espirituais: [
      'Ritual de proteção com água do mar',
      'Oração a Iemanjá para transformação',
      'Oferenda de alcaparra e colônia',
      'Banho de desatamento com guiné e arruda',
      'Trabalho de queima de padrões negativos',
    ],
  },
  4: {
    odu: {
      numero: 4,
      nome: 'Irosun',
      nome_yoruba: 'Ìrosùn',
    },
    orixa: {
      nome: 'Oxum',
      nome_alternativo: 'Oba',
    },
    elemento: 'água',
    conexao_espiritual:
      'Irosun é o Odu da intuição lunar, das mensagens ocultas e do mundo espiritual. Governado por Oxum, revela os segredos entre véus, a verdade por trás das ilusões. Este Odu exige discernimento entre o real e o imaginário, entre a verdade e a enganação.',
    simbolismo: [
      'Intuição lunar',
      'Mensagens ocultas',
      'Visão além do véu',
      'Segredos revelados',
      'Ilusão e verdade',
    ],
    praticas_espirituais: [
      'Oração a Oxum para clareza de visão',
      'Ritual de proteção contra enganações',
      'Trabalho de limpeza espiritual com infusões',
      'Meditação lunar em noite de lua cheia',
      'Oferenda de mel, rosas e espelho',
    ],
  },
  5: {
    odu: {
      numero: 5,
      nome: 'Oxé',
      nome_yoruba: 'Ọ̀sà',
    },
    orixa: {
      nome: 'Ogum',
      nome_alternativo: 'Xangô',
    },
    elemento: 'fogo',
    conexao_espiritual:
      'Oxé representa a lei divina, a justiça cósmica e o julgamento. Governado por Ogum e Xangô, este Odu traz o peso da responsabilidade espiritual e a necessidade de agir com equilíbrio entre rigor e compaixão. Fala de decisões que afetam o destino.',
    simbolismo: [
      'Lei divina',
      'Justiça cósmica',
      'Julgamento espiritual',
      'Responsabilidade',
      'Equilíbrio entre rigor e misericórdia',
    ],
    praticas_espirituais: [
      'Ritual de julgamento espiritual',
      'Oração a Ogum para força e justiça',
      'Trabalho de limpeza com espada de Ogum',
      'Oferenda de pedra de raio (quartzo)',
      'Descarrego de energias pesadas de julgamento',
    ],
  },
  6: {
    odu: {
      numero: 6,
      nome: 'Obará',
      nome_yoruba: 'Ọbàlúayé',
    },
    orixa: {
      nome: 'Oxalá',
      nome_alternativo: 'Obatalá',
    },
    elemento: 'terra',
    conexao_espiritual:
      'Obará é o Odu da Terra, da mortalidade e da transformação física. Governado por Oxalá, representa a conexão entre o espiritual e o material, a relação entre vida e morte. Este Odu fala da purificação, da doença e da cura através do equilíbrio terrestrial.',
    simbolismo: [
      'Terra e mortalidade',
      'Transformação física',
      'Conexão espiritual-material',
      'Purificação',
      'Doença e cura',
    ],
    praticas_espirituais: [
      'Ritual de purificação com akasà',
      'Oração a Oxalá para cura e proteção',
      'Trabalho de limpeza com elementos terrestes',
      'Oferenda de fubá branco e frutas',
      'Trabalho de cura para enfermidades',
    ],
  },
  7: {
    odu: {
      numero: 7,
      nome: 'Odi',
      nome_yoruba: 'Òdí',
    },
    orixa: {
      nome: 'Iemanjá',
      nome_alternativo: 'Yemanjá',
    },
    elemento: 'água',
    conexao_espiritual:
      'Odi é o Odu do destino, das cartas que o destino distribui. Governado por Iemanjá, revela o que está oculto no consciente e no inconsciente. Este Odu fala das forças que direcionam a vida, das escolhas que moldam o destino e do poder de reconhecer padrões.',
    simbolismo: [
      'Destino e fatalidade',
      'Forças ocultas',
      'Consciência e inconsciente',
      'Padrões repetitivos',
      'Reconhecimento do eu',
    ],
    praticas_espirituais: [
      'Ritual de leitura do destino com cartas de Ifá',
      'Oração a Iemanjá para orientação',
      'Trabalho de proteção contra forças negativas',
      'Banho de开门 com ervas marinhas',
      'Oferenda de colônia e alimentos blancos',
    ],
  },
  8: {
    odu: {
      numero: 8,
      nome: 'Ejionlá',
      nome_yoruba: 'Ejìọnlá',
    },
    orixa: {
      nome: 'Logun Ede',
      nome_alternativo: 'Oxum',
    },
    elemento: 'água',
    conexao_espiritual:
      'Ejionlá é o Odu da fartura e da prosperidade infinita. Governado por Logun Ede, o príncipe das águas, representa a abundância cósmica, o fluxo contínuo de riqueza espiritual e material. Este Odu fala da transformação da escassez em abundância.',
    simbolismo: [
      'Abundância infinita',
      'Prosperidade cósmica',
      'Transformação da escassez',
      'Fluxo contínuo',
      'Riqueza espiritual e material',
    ],
    praticas_espirituais: [
      'Ritual de prosperidade com Logun Ede',
      'Oração para abundância',
      'Trabalho de limpeza para abrir caminhos financeiros',
      'Oferenda de milho, honey e dinheiro',
      'Banho de开门 para prosperidade',
    ],
  },
  9: {
    odu: {
      numero: 9,
      nome: 'Oshe',
      nome_yoruba: 'Ọ̀shẹ́',
    },
    orixa: {
      nome: 'Iemanjá',
      nome_alternativo: 'Nanã',
    },
    elemento: 'água',
    conexao_espiritual:
      'Oshe é o Odu da alegria, da festa e da celebração divina. Governado por Iemanjá, este Odu traz a energia de celebração, de agradecimento e de comunidade. Fala dos rituais de alegria, das oferendas de gratidão e da conexão com a diversidade cultural.',
    simbolismo: [
      'Alegría e celebração',
      'Gratidão divina',
      'Comunidade e conexão',
      'Diversidade cultural',
      'Oferendas de alegria',
    ],
    praticas_espirituais: [
      'Ritual de celebração com música e dança',
      'Oração de gratidão a Iemanjá',
      'Trabalho de elevação espiritual com alegria',
      'Oferenda de alimentos coloridos',
      'Festival de благодарность espiritual',
    ],
  },
  10: {
    odu: {
      numero: 10,
      nome: 'Ofun',
      nome_yoruba: 'Ọ̀fún',
    },
    orixa: {
      nome: 'Oxalá',
      nome_alternativo: 'Obatalá',
    },
    elemento: 'éter',
    conexao_espiritual:
      'Ofun é o Odu do silêncio, da paciência e da contemplação. Governado por Oxalá, representa a sabedoria que vem do silêncio, a verdade que se revela no tempo certo. Este Odu fala da introspecção, da meditação e do poder do não-fazer.',
    simbolismo: [
      'Silêncio e contemplação',
      'Paciência divina',
      'Introspecção',
      'Sabedoria do tempo',
      'Poder do não-fazer',
    ],
    praticas_espirituais: [
      'Meditação em silêncio',
      'Oração silenciosa a Oxalá',
      'Ritual de paciência e espera sagrada',
      'Trabalho de introspecção profunda',
      'Oferenda de silêncio e pureza',
    ],
  },
  11: {
    odu: {
      numero: 11,
      nome: 'Eyonla',
      nome_yoruba: 'Èyọ́nlá',
    },
    orixa: {
      nome: 'Nanã Buruku',
      nome_alternativo: 'Nanã',
    },
    elemento: 'terra',
    conexao_espiritual:
      'Eyonla é o Odu da sabedoria anciã, das tecnologias espirituais e do conhecimento oculto. Governado por Nanã Buruku, a anciã dos pântanos, representa a sabedoria dos tempos primordiais, o conhecimento que transcende gerações. Fala da necessidade de humildade para receber sabedoria.',
    simbolismo: [
      'Sabedoria anciã',
      'Tecnologias espirituais',
      'Conhecimento oculto',
      'Humildade perante o saber',
      'Transcendência geracional',
    ],
    praticas_espirituais: [
      'Ritual de busca de conhecimento',
      'Oração a Nanã Buruku para sabedoria',
      'Trabalho com tecnologias ancestrais',
      'Estudo de tradições espirituais',
      'Oferenda de respeto y humildad',
    ],
  },
  12: {
    odu: {
      numero: 12,
      nome: 'Merinla',
      nome_yoruba: 'Mẹ̀rìnlá',
    },
    orixa: {
      nome: 'Nanã Buruku',
      nome_alternativo: 'Nanã',
    },
    elemento: 'terra',
    conexao_espiritual:
      'Merinla é o Odu do mistério, das questões não respondidas e do desconhecido. Governado por Nanã Buruku, representa os segredos que não devem ser revelados, os mistérios que exigem respeito. Este Odu fala da reverência ao sagrado e da aceitação do incognoscível.',
    simbolismo: [
      'Mistério e desconhecido',
      'Segredos sagrados',
      'Reverência ao oculto',
      'Questions não respondidas',
      'Aceitação do incognoscível',
    ],
    praticas_espirituais: [
      'Ritual de respeito ao mistério',
      'Oração a Nanã Buruku para proteção do conhecimento',
      'Trabalho de proteção de segredos',
      'Meditação sobre o desconhecido',
      'Oferenda de respeto y silencio',
    ],
  },
  13: {
    odu: {
      numero: 13,
      nome: 'Mero',
      nome_yoruba: 'Mẹ̀rọ̀',
    },
    orixa: {
      nome: 'Oxum',
      nome_alternativo: 'Logun Ede',
    },
    elemento: 'água',
    conexao_espiritual:
      'Mero é o Odu da riqueza escondida, dos tesouros ocultos e das descobertas inesperadas. Governado por Oxum, representa a prosperidade que surge do inesperado, os tesouros encontrados em lugares improváveis. Este Odu fala da sorte, da fortuna e da revelação de tesouros.',
    simbolismo: [
      'Riqueza escondida',
      'Tesouros ocultos',
      'Descobertas inesperadas',
      'Sorte e fortuna',
      'Revelação de tesouros',
    ],
    praticas_espirituais: [
      'Ritual de busca de prosperidade',
      'Oração a Oxum para descobertas',
      'Trabalho de abertura de caminhos financeiros',
      'Oferenda de ouro e pedras preciosas',
      'Trabalho de开门 para riqueza oculta',
    ],
  },
  14: {
    odu: {
      numero: 14,
      nome: 'Jinza',
      nome_yoruba: 'Jìnza',
    },
    orixa: {
      nome: 'Ogum',
      nome_alternativo: 'Xangô',
    },
    elemento: 'fogo',
    conexao_espiritual:
      'Jinza é o Odu da guerra espiritual, das batalhas entre luz e escuridão. Governado por Ogum, representa o guerreiro que protege contra forças negativas, a espada que corta energias hostis. Este Odu fala do combate espiritual e da vitória da luz.',
    simbolismo: [
      'Guerra espiritual',
      'Batalha luz vs escuridão',
      'Proteção contra negatividades',
      'Espada cortante',
      'Vitória da luz',
    ],
    praticas_espirituais: [
      'Ritual de guerra espiritual',
      'Oração a Ogum para proteção',
      'Trabalho de limpeza com espada de Ogum',
      'Ritual de encerramento de processos',
      'Oferenda de hierro y fuego',
    ],
  },
  15: {
    odu: {
      numero: 15,
      nome: 'Jotagbe',
      nome_yoruba: 'Jọ́tágbè',
    },
    orixa: {
      nome: 'Oxalá',
      nome_alternativo: 'Obatalá',
    },
    elemento: 'éter',
    conexao_espiritual:
      'Jotagbe é o Odu da comunicação com ancestrais, das mensagens do passado. Governado por Oxalá, representa a conexão com os antepassados, a sabedoria que vem de linhagens ancestrais. Este Odu fala da honra aos mortos, do respeito às tradições e da herança espiritual.',
    simbolismo: [
      'Comunicação ancestral',
      'Mensagens do passado',
      'Linhagem espiritual',
      'Honra aos mortos',
      'Herança espiritual',
    ],
    praticas_espirituais: [
      'Ritual de comunicação com ancestrais',
      'Oração a Oxalá por proteção ancestral',
      'Trabalho de conexão com linhagem',
      'Oferenda de respeito aos antepassados',
      'Caminho de honra e tradição',
    ],
  },
  16: {
    odu: {
      numero: 16,
      nome: 'Otura',
      nome_yoruba: 'Òtúrá',
    },
    orixa: {
      nome: 'Nanã Buruku',
      nome_alternativo: 'Oxalá',
    },
    elemento: 'terra',
    conexao_espiritual:
      'Otura é o Odu do caminho, da jornada e do destino traçado. Governado por Nanã Buruku, representa o destino que se revela através do caminho, a estrada que se forma sob os pés. Este Odu fala da jornada espiritual, do caminhar consciente e do destino que se constrói.',
    simbolismo: [
      'Caminho e jornada',
      'Destino revelado',
      'Estrada sob os pés',
      'Caminhar consciente',
      'Destino em construção',
    ],
    praticas_espirituais: [
      'Ritual de abertura de caminho',
      'Oração a Nanã Buruku para orientação',
      'Trabalho de开门 para novos caminhos',
      'Caminhada espiritual consciente',
      'Oferenda de开门 y protección',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ODU_ORIXA_MAPPINGS);
// Freeze nested objects
Object.values(ODU_ORIXA_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

// ─── Query Functions ─────────────────────────────────────────────────────────

/**
 * Get the Odu-to-Orixá correlation mapping
 * @param odu - Odu number (1-16) or name (e.g., 'Okaran', 'Ejiokô')
 * @returns The correlation mapping or null if not found
 */
export function getOduOrixa(odu: number | string): OduOrixa | null {
  // If it's a number, look it up directly
  if (typeof odu === 'number') {
    return ODU_ORIXA_MAPPINGS[odu] ?? null;
  }
  // If it's a string, try to find by name (case-insensitive)
  const oduName = odu.toLowerCase().trim();
  const found = Object.values(ODU_ORIXA_MAPPINGS).find(
    (m) =>
      m.odu.nome.toLowerCase() === oduName ||
      m.odu.nome_yoruba.toLowerCase() === oduName
  );
  return found ?? null;
}

/**
 * Get the Orixá-to-Odu reverse mapping
 * @returns Map of Orixá names to their corresponding Odu numbers
 */
export function getOrixaOdu(): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const mapping of Object.values(ODU_ORIXA_MAPPINGS)) {
    const orixaName = mapping.orixa.nome;
    if (!result[orixaName]) {
      result[orixaName] = [];
    }
    if (!result[orixaName].includes(mapping.odu.numero)) {
      result[orixaName].push(mapping.odu.numero);
    }
  }
  return result;
}

/**
 * Get all available Odu-Orixá mappings
 * @returns Array of all correlation mappings sorted by Odu number
 */
export function getAllOduOrixas(): OduOrixa[] {
  return Object.values(ODU_ORIXA_MAPPINGS).sort(
    (a, b) => a.odu.numero - b.odu.numero
  );
}

/**
 * Get all Odu numbers
 * @returns Array of Odu numbers from 1 to 16
 */
export function getAllOduNumbers(): number[] {
  return Object.keys(ODU_ORIXA_MAPPINGS)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
}

/**
 * Get all Odu names
 * @returns Array of Odu names in Portuguese
 */
export function getAllOduNames(): string[] {
  return Object.values(ODU_ORIXA_MAPPINGS)
    .map((m) => m.odu.nome)
    .sort();
}

/**
 * Get all unique Orixá names
 * @returns Array of unique Orixá names
 */
export function getAllOrixaNames(): string[] {
  const orixas = new Set<string>();
  for (const mapping of Object.values(ODU_ORIXA_MAPPINGS)) {
    orixas.add(mapping.orixa.nome);
    if (mapping.orixa.nome_alternativo) {
      orixas.add(mapping.orixa.nome_alternativo);
    }
  }
  return Array.from(orixas).sort();
}

/**
 * Get Orixás by element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of Odu-Orixa mappings for that element
 */
export function getOrixasByElement(
  elemento: OduOrixa['elemento']
): OduOrixa[] {
  return Object.values(ODU_ORIXA_MAPPINGS).filter(
    (m) => m.elemento === elemento
  );
}

/**
 * Check if an Odu exists in the mapping
 * @param odu - Odu number to check
 * @returns True if Odu exists in mapping
 */
export function hasOduOrixa(odu: number): boolean {
  return odu in ODU_ORIXA_MAPPINGS;
}

/**
 * Get the element for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Element type or null if not found
 */
export function getOduElement(oduNumero: number): OduOrixa['elemento'] | null {
  return ODU_ORIXA_MAPPINGS[oduNumero]?.elemento ?? null;
}

/**
 * Get the spiritual practices for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Array of spiritual practices or null if not found
 */
export function getOduPraticasEspirituais(oduNumero: number): string[] | null {
  return ODU_ORIXA_MAPPINGS[oduNumero]?.praticas_espirituais ?? null;
}

/**
 * Get the symbolism for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Array of key symbols or null if not found
 */
export function getOduSimbolismo(oduNumero: number): string[] | null {
  return ODU_ORIXA_MAPPINGS[oduNumero]?.simbolismo ?? null;
}

/**
 * Get the Orixá name for a given Odu number
 * @param oduNumero - Odu number from 1 to 16
 * @returns Orixá name or null if not found
 */
export function getOduOrixaName(oduNumero: number): string | null {
  return ODU_ORIXA_MAPPINGS[oduNumero]?.orixa.nome ?? null;
}

/**
 * Default export with all functions
 */
export default {
  getOduOrixa,
  getOrixaOdu,
  getAllOduOrixas,
  getAllOduNumbers,
  getAllOduNames,
  getAllOrixaNames,
  getOrixasByElement,
  hasOduOrixa,
  getOduElement,
  getOduPraticasEspirituais,
  getOduSimbolismo,
  getOduOrixaName,
  ODU_ORIXA_MAPPINGS,
};