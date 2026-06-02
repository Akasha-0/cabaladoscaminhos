/**
 * Matriz de Correlação — As 36 Casas da Mesa Real
 * =================================================
 *
 * Esta é a **regra de negócio central** do Cabala dos Caminhos. Define
 * QUAIS dados do mapa natal do consulente devem ser injetados em QUAL
 * casa quando o PromptBuilder monta o prompt para o LLM.
 *
 * @see docs/06_ai-engine-spec.md §2
 *
 * Cada entrada da matriz associa uma casa da Mesa Real a:
 *   - `astrology.primaryHouses`  — casas astrológicas relevantes
 *   - `astrology.primaryPlanets` — planetas mais importantes
 *   - `astrology.extractionKeys` — chaves para extrair do `astrologyMap`
 *   - `kabalah.aspects`          — quais números cabalísticos usar
 *   - `kabalah.extractionKeys`   — chaves para extrair do `kabalisticMap`
 *   - `tantric.aspects`          — quais números tântricos usar
 *   - `tantric.extractionKeys`   — chaves para extrair do `tantricMap`
 *
 * O PromptBuilder itera sobre `CORRELATION_MAP[houseId]` e usa
 * `extractionKeys` para sugar os valores exatos dos mapas JSON.
 */

export type ExtractionKeys = ReadonlyArray<string>;

export interface HouseCorrelation {
  /** Identificador da casa (1..36) */
  houseId: number;
  /** Nome da casa (mesmo nome da carta associada) */
  houseName: string;
  /** Tema — para o LLM entender o contexto da área de vida */
  houseTheme: string;

  astrology: {
    primaryHouses: ReadonlyArray<number>;
    primaryPlanets: ReadonlyArray<string>;
    /** Caminhos do astrologyMap que o PromptBuilder deve sugar */
    extractionKeys: ExtractionKeys;
  };

  kabalah: {
    aspects: ReadonlyArray<string>;
    extractionKeys: ExtractionKeys;
  };

  tantric: {
    aspects: ReadonlyArray<string>;
    extractionKeys: ExtractionKeys;
  };
}

// ============================================================================
// A MATRIZ DE CORRELAÇÃO — 36 ENTRADAS
// ============================================================================

export const CORRELATION_MAP: Readonly<Record<number, HouseCorrelation>> = {
  // -------------------------------------------------------------------- 1
  1: {
    houseId: 1,
    houseName: 'O Cavaleiro',
    houseTheme: 'Notícias chegando, início de movimento, o primeiro impulso da vida',
    astrology: {
      primaryHouses: [1],
      primaryPlanets: ['ascendant', 'mars'],
      extractionKeys: [
        'ascendant.sign',
        'ascendant.degree',
        'planets.mars.sign',
        'planets.mars.house',
        'houses.1',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 2
  2: {
    houseId: 2,
    houseName: 'O Trevo',
    houseTheme: 'Pequenas sortes, oportunidades rápidas, a fé que sustenta',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['jupiter'],
      extractionKeys: ['planets.jupiter.sign', 'planets.jupiter.house', 'planets.jupiter.degree'],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 3
  3: {
    houseId: 3,
    houseName: 'O Navio',
    houseTheme: 'Viagens, negócios à distância, mudanças de horizonte',
    astrology: {
      primaryHouses: [3, 9],
      primaryPlanets: ['mercury'],
      extractionKeys: [
        'planets.mercury.sign',
        'planets.mercury.house',
        'houses.3',
        'houses.9',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Número de Caminho Tântrico'], extractionKeys: ['tantricPath'] },
  },

  // -------------------------------------------------------------------- 4
  4: {
    houseId: 4,
    houseName: 'A Casa',
    houseTheme: 'Lar físico, família, moradia, estrutura doméstica',
    astrology: {
      primaryHouses: [4],
      primaryPlanets: ['moon'],
      extractionKeys: [
        'moon.sign',
        'moon.house',
        'planets.moon.sign',
        'planets.moon.house',
        'houses.4',
      ],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 5
  5: {
    houseId: 5,
    houseName: 'A Árvore',
    houseTheme: 'Saúde, vitalidade, energia vital, raízes, ancestralidade',
    astrology: {
      primaryHouses: [6],
      primaryPlanets: ['sun'],
      extractionKeys: [
        'sun.sign',
        'sun.house',
        'planets.sun.sign',
        'planets.sun.house',
        'houses.6',
      ],
    },
    kabalah: { aspects: ['Número de Destino'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 6
  6: {
    houseId: 6,
    houseName: 'As Nuvens',
    houseTheme: 'Confusão mental, dúvidas, nebulosidade, indecisão',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['neptune'],
      extractionKeys: [
        'planets.neptune.sign',
        'planets.neptune.house',
        'houses.12',
      ],
    },
    kabalah: {
      aspects: ['Números de Desafio (1º e 2º)'],
      extractionKeys: ['challenges.first', 'challenges.second'],
    },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 7
  7: {
    houseId: 7,
    houseName: 'A Serpente',
    houseTheme: 'Perigo, traição, inveja, forças ocultas, sexualidade, sabedoria oculta',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['lilith', 'pluto'],
      extractionKeys: [
        'planets.lilith.sign',
        'planets.lilith.house',
        'planets.pluto.sign',
        'planets.pluto.house',
      ],
    },
    kabalah: { aspects: ['Karma de Vida / Dívidas'], extractionKeys: ['karmaicDebts'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 8
  8: {
    houseId: 8,
    houseName: 'O Caixão',
    houseTheme: 'Fim de ciclos, transformação profunda, crises, renascimento',
    astrology: {
      primaryHouses: [8],
      primaryPlanets: ['pluto'],
      extractionKeys: [
        'planets.pluto.sign',
        'planets.pluto.house',
        'houses.8',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 9
  9: {
    houseId: 9,
    houseName: 'Os Buquês',
    houseTheme: 'Presentes, surpresas felizes, reconhecimento, beleza, alegria',
    astrology: {
      primaryHouses: [5],
      primaryPlanets: ['venus'],
      extractionKeys: [
        'planets.venus.sign',
        'planets.venus.house',
        'houses.5',
      ],
    },
    kabalah: { aspects: ['Dons Nativos'], extractionKeys: ['nativeDayNumber'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 10
  10: {
    houseId: 10,
    houseName: 'A Foice',
    houseTheme: 'Cortes necessários, decisões definitivas, colheita, perigos imediatos',
    astrology: {
      primaryHouses: [8],
      primaryPlanets: ['saturn'],
      extractionKeys: [
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.8',
      ],
    },
    kabalah: { aspects: ['Número de Desafio Principal'], extractionKeys: ['challenges.main'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 11
  11: {
    houseId: 11,
    houseName: 'O Chicote',
    houseTheme: 'Conflitos, repetição de padrões, estresse, agressividade, disputas',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['mars'],
      extractionKeys: [
        'planets.mars.sign',
        'planets.mars.house',
        'aspects',
      ],
    },
    kabalah: { aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.second', 'challenges.main'] },
    tantric: { aspects: ['Corpo Prânico — Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 12
  12: {
    houseId: 12,
    houseName: 'Os Pássaros',
    houseTheme: 'Comunicação, parcerias dinâmicas, nervosismo, trocas rápidas',
    astrology: {
      primaryHouses: [3],
      primaryPlanets: ['mercury'],
      extractionKeys: [
        'planets.mercury.sign',
        'planets.mercury.house',
        'houses.3',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 13
  13: {
    houseId: 13,
    houseName: 'A Criança',
    houseTheme: 'Novos começos, projetos iniciais, inocência, renovação, vulnerabilidade',
    astrology: {
      primaryHouses: [1],
      primaryPlanets: ['jupiter', 'ascendant'],
      extractionKeys: [
        'ascendant.sign',
        'planets.jupiter.sign',
        'planets.jupiter.house',
        'houses.1',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 14
  14: {
    houseId: 14,
    houseName: 'A Raposa',
    houseTheme: 'Astúcia, estratégia, autossuficiência, cautela, discernimento',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['mercury', 'uranus'],
      extractionKeys: [
        'planets.mercury.sign',
        'planets.mercury.house',
        'planets.uranus.sign',
        'planets.uranus.house',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 15
  15: {
    houseId: 15,
    houseName: 'O Urso',
    houseTheme: 'Poder pessoal, autoridade, finanças de grande porte, proteção, liderança',
    astrology: {
      primaryHouses: [10],
      primaryPlanets: ['sun', 'pluto'],
      extractionKeys: [
        'sun.sign',
        'sun.house',
        'planets.pluto.sign',
        'planets.pluto.house',
        'houses.10',
      ],
    },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 16
  16: {
    houseId: 16,
    houseName: 'A Estrela',
    houseTheme: 'Esperança, espiritualidade, guia divino, sonhos, missão de alma',
    astrology: {
      primaryHouses: [9],
      primaryPlanets: ['neptune'],
      extractionKeys: [
        'planets.neptune.sign',
        'planets.neptune.house',
        'houses.9',
      ],
    },
    kabalah: { aspects: ['Caminho de Vida (especialmente se 11/22/33)'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 17
  17: {
    houseId: 17,
    houseName: 'A Cegonha',
    houseTheme: 'Mudanças significativas, renovação, melhoria, movimentos inesperados',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['northNode', 'uranus'],
      extractionKeys: [
        'northNode.sign',
        'northNode.house',
        'planets.uranus.sign',
        'planets.uranus.house',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },

  // -------------------------------------------------------------------- 18
  18: {
    houseId: 18,
    houseName: 'O Cachorro',
    houseTheme: 'Lealdade, amizade, aliados, proteção, confiança',
    astrology: {
      primaryHouses: [11],
      primaryPlanets: ['venus'],
      extractionKeys: [
        'planets.venus.sign',
        'planets.venus.house',
        'houses.11',
      ],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 19
  19: {
    houseId: 19,
    houseName: 'A Torre',
    houseTheme: 'Isolamento, solidão consciente, ego, autoridade institucional, introspecção',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['saturn'],
      extractionKeys: [
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.12',
      ],
    },
    kabalah: { aspects: ['Números de Desafio'], extractionKeys: ['challenges.first', 'challenges.main'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 20
  20: {
    houseId: 20,
    houseName: 'O Jardim',
    houseTheme: 'Vida social, público, eventos, exposição, coletividade',
    astrology: {
      primaryHouses: [7, 11],
      primaryPlanets: [],
      extractionKeys: ['houses.7', 'houses.11'],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 21
  21: {
    houseId: 21,
    houseName: 'A Montanha',
    houseTheme: 'Obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['saturn'],
      extractionKeys: [
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.12',
        'aspects',
      ],
    },
    kabalah: {
      aspects: ['Números de Desafio', 'Dívidas Kármicas'],
      extractionKeys: ['challenges.first', 'challenges.main', 'karmaicDebts'],
    },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 22
  22: {
    houseId: 22,
    houseName: 'Os Caminhos',
    houseTheme: 'Escolhas, bifurcação, decisões cruciais, possibilidades múltiplas',
    astrology: {
      primaryHouses: [1, 7],
      primaryPlanets: ['northNode', 'southNode'],
      extractionKeys: [
        'northNode.sign',
        'northNode.house',
        'southNode.sign',
        'southNode.house',
        'houses.1',
        'houses.7',
      ],
    },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Caminho Tântrico'], extractionKeys: ['tantricPath'] },
  },

  // -------------------------------------------------------------------- 23
  23: {
    houseId: 23,
    houseName: 'O Rato',
    houseTheme: 'Perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['neptune', 'saturn'],
      extractionKeys: [
        'planets.neptune.sign',
        'planets.neptune.house',
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.12',
      ],
    },
    kabalah: { aspects: ['Karma de Vida / Dívidas'], extractionKeys: ['karmaicDebts'] },
    tantric: { aspects: ['Corpo Prânico — Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },

  // -------------------------------------------------------------------- 24
  24: {
    houseId: 24,
    houseName: 'O Coração',
    houseTheme: 'Amor, emoções profundas, desejos do coração, afetos',
    astrology: {
      primaryHouses: [5],
      primaryPlanets: ['venus', 'moon'],
      extractionKeys: [
        'moon.sign',
        'moon.house',
        'planets.venus.sign',
        'planets.venus.house',
        'houses.5',
      ],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 25
  25: {
    houseId: 25,
    houseName: 'O Anel',
    houseTheme: 'Contratos, comprometimentos, alianças, casamento, acordos formais',
    astrology: {
      primaryHouses: [7],
      primaryPlanets: ['saturn'],
      extractionKeys: [
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.7',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },

  // -------------------------------------------------------------------- 26
  26: {
    houseId: 26,
    houseName: 'O Livro',
    houseTheme: 'Segredos, conhecimento oculto, estudos, mistérios guardados',
    astrology: {
      primaryHouses: [9, 12],
      primaryPlanets: ['mercury'],
      extractionKeys: [
        'planets.mercury.sign',
        'planets.mercury.house',
        'houses.9',
        'houses.12',
      ],
    },
    kabalah: {
      aspects: ['Caminho de Vida 7 (se presente)'],
      extractionKeys: ['lifePath', 'lifePathMaster'],
    },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 27
  27: {
    houseId: 27,
    houseName: 'A Carta',
    houseTheme: 'Documentos, notícias escritas, mensagens formais, comunicação oficial',
    astrology: {
      primaryHouses: [3],
      primaryPlanets: ['mercury'],
      extractionKeys: [
        'planets.mercury.sign',
        'planets.mercury.house',
        'houses.3',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 28
  28: {
    houseId: 28,
    houseName: 'O Cigano',
    houseTheme: 'O consulente masculino ou a energia masculina/ativa principal',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['sun', 'mars'],
      extractionKeys: [
        'sun.sign',
        'sun.house',
        'planets.mars.sign',
        'planets.mars.house',
      ],
    },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Caminho Tântrico'], extractionKeys: ['tantricPath'] },
  },

  // -------------------------------------------------------------------- 29
  29: {
    houseId: 29,
    houseName: 'A Cigana',
    houseTheme: 'O consulente feminino ou a energia feminina/receptiva principal',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['moon', 'venus'],
      extractionKeys: [
        'moon.sign',
        'moon.house',
        'planets.venus.sign',
        'planets.venus.house',
      ],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 30
  30: {
    houseId: 30,
    houseName: 'Os Lírios',
    houseTheme: 'Paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade',
    astrology: {
      primaryHouses: [9],
      primaryPlanets: ['jupiter'],
      extractionKeys: [
        'planets.jupiter.sign',
        'planets.jupiter.house',
        'houses.9',
      ],
    },
    kabalah: { aspects: ['Caminho de Vida'], extractionKeys: ['lifePath', 'lifePathMaster'] },
    tantric: { aspects: ['Número de Destino'], extractionKeys: ['destiny'] },
  },

  // -------------------------------------------------------------------- 31
  31: {
    houseId: 31,
    houseName: 'O Sol',
    houseTheme: 'Sucesso máximo, clareza total, vitória, o ápice da realização',
    astrology: {
      primaryHouses: [10],
      primaryPlanets: ['sun'],
      extractionKeys: [
        'sun.sign',
        'sun.house',
        'houses.10',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 32
  32: {
    houseId: 32,
    houseName: 'A Lua',
    houseTheme: 'Intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['moon', 'neptune'],
      extractionKeys: [
        'moon.sign',
        'moon.house',
        'planets.neptune.sign',
        'planets.neptune.house',
        'houses.12',
      ],
    },
    kabalah: { aspects: ['Número de Motivação'], extractionKeys: ['motivation'] },
    tantric: { aspects: ['Número de Alma'], extractionKeys: ['soul', 'soulDescription'] },
  },

  // -------------------------------------------------------------------- 33
  33: {
    houseId: 33,
    houseName: 'A Chave',
    houseTheme: 'A solução que se revela, abertura de portas, a resposta esperada, importância',
    astrology: {
      primaryHouses: [],
      primaryPlanets: ['jupiter', 'northNode'],
      extractionKeys: [
        'planets.jupiter.sign',
        'planets.jupiter.house',
        'northNode.sign',
        'northNode.house',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 34
  34: {
    houseId: 34,
    houseName: 'Os Peixes',
    houseTheme: 'Dinheiro, fluxo financeiro, negócios, abundância material',
    astrology: {
      primaryHouses: [2],
      primaryPlanets: ['venus'],
      extractionKeys: [
        'planets.venus.sign',
        'planets.venus.house',
        'houses.2',
        'planetsInHouses.2',
      ],
    },
    kabalah: { aspects: ['Número de Expressão'], extractionKeys: ['expression'] },
    tantric: {
      aspects: ['Número de Karma (Material)'],
      extractionKeys: ['karma', 'karmaDescription'],
    },
  },

  // -------------------------------------------------------------------- 35
  35: {
    houseId: 35,
    houseName: 'A Âncora',
    houseTheme: 'Estabilidade, trabalho fixo, permanência, segurança de longo prazo',
    astrology: {
      primaryHouses: [6, 10],
      primaryPlanets: ['saturn'],
      extractionKeys: [
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.6',
        'houses.10',
      ],
    },
    kabalah: { aspects: ['Número de Missão'], extractionKeys: ['mission'] },
    tantric: { aspects: ['Corpo Físico — Dom Divino'], extractionKeys: ['divineGift', 'divineGiftDescription'] },
  },

  // -------------------------------------------------------------------- 36
  36: {
    houseId: 36,
    houseName: 'A Cruz',
    houseTheme: 'Fardo kármico, teste espiritual máximo, responsabilidade, superação do destino',
    astrology: {
      primaryHouses: [12],
      primaryPlanets: ['saturn', 'southNode'],
      extractionKeys: [
        'southNode.sign',
        'southNode.house',
        'planets.saturn.sign',
        'planets.saturn.house',
        'houses.12',
      ],
    },
    kabalah: { aspects: ['Karma de Vida + Dívidas Kármicas'], extractionKeys: ['karmaicDebts'] },
    tantric: { aspects: ['Número de Karma'], extractionKeys: ['karma', 'karmaDescription'] },
  },
} as const;

/**
 * Verifica se existe entrada de correlação para a casa informada.
 * Útil para validação no PromptBuilder.
 */
export function hasCorrelation(houseId: number): boolean {
  return houseId in CORRELATION_MAP;
}

/**
 * Retorna a entrada de correlação, ou lança se a casa for inválida.
 */
export function getCorrelation(houseId: number): HouseCorrelation {
  const entry = CORRELATION_MAP[houseId];
  if (!entry) {
    throw new Error(`Casa ${houseId} não encontrada no mapa de correlação`);
  }
  return entry;
}
