/**
 * Numerology-Moon Spiritual Correlation Module
 * Maps numerology numbers 1-13 to their corresponding lunar phases,
 * elements, and spiritual meanings.
 * 
 * Based on Cabala dos Caminhos hermetic principles and
 * the inverse correlation from moon-numerology.ts.
 */

export type FaseLua = 
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export interface NumerologyMoonMapping {
  /** The numerology number (1-13) */
  numero: number;
  /** Associated lunar phase */
  fase: FaseLua;
  /** Phase name in Portuguese */
  nome_fase: string;
  /** Element connection */
  elemento: Elemento;
  /** Secondary element for balance */
  elemento_secundario: Elemento;
  /** Spiritual meaning and archetype */
  significado_espiritual: {
    palavra_chave: string;
    energia: string;
    conexao_lunar: string;
    lição_ciclica: string;
  };
  /** Additional correlations */
  correlacoes: {
    orixa: string;
    chakra: number;
    arcanjo: string;
    sephirah: string;
  };
}

/**
 * Complete mapping of numerology numbers 1-13 to their moon phase correspondences.
 * Derived from Cabala dos Caminhos hermetic principles and lunar numerological alchemy.
 */
export const NUMERO_LUA_MAP: Record<number, NumerologyMoonMapping> = {
  1: {
    numero: 1,
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    elemento: 'Terra',
    elemento_secundario: 'Éter',
    significado_espiritual: {
      palavra_chave: 'Iniciação',
      energia: 'Potencial puro adormecido',
      conexao_lunar: 'O silêncio antes da luz, o ventre escuro de onde tudo nasce',
      lição_ciclica: 'Novos começos exigem coragem de começar',
    },
    correlacoes: {
      orixa: 'Oxalá',
      chakra: 1,
      arcanjo: 'Metatron',
      sephirah: 'Kether',
    },
  },
  2: {
    numero: 2,
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    elemento: 'Água',
    elemento_secundario: 'Terra',
    significado_espiritual: {
      palavra_chave: 'Crescimento',
      energia: 'Nutrição e expansão vital',
      conexao_lunar: 'O broto que busca a luz, a luz que nutre o crescimento',
      lição_ciclica: 'O crescimento pede paciência e confiança',
    },
    correlacoes: {
      orixa: 'Iemanjá',
      chakra: 2,
      arcanjo: 'Gabriel',
      sephirah: 'Chokmah',
    },
  },
  3: {
    numero: 3,
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    elemento: 'Fogo',
    elemento_secundario: 'Ar',
    significado_espiritual: {
      palavra_chave: 'Ação',
      energia: 'Força transformadora em movimento',
      conexao_lunar: 'A chama que queima o que impede, o vento que espalha brasas',
      lição_ciclica: 'A ação corretiva demanda coragem e discernimento',
    },
    correlacoes: {
      orixa: 'Ogum',
      chakra: 3,
      arcanjo: 'Samael',
      sephirah: 'Binah',
    },
  },
  4: {
    numero: 4,
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    elemento: 'Água',
    elemento_secundario: 'Éter',
    significado_espiritual: {
      palavra_chave: 'Culminação',
      energia: 'Plenitude e iluminação',
      conexao_lunar: 'O oceano de luz manifestada, o reflexo que revela verdades',
      lição_ciclica: 'A plenitude pede gratidão e generosidade',
    },
    correlacoes: {
      orixa: 'Oxum',
      chakra: 4,
      arcanjo: 'Rafael',
      sephirah: 'Chesed',
    },
  },
  5: {
    numero: 5,
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    elemento: 'Ar',
    elemento_secundario: 'Fogo',
    significado_espiritual: {
      palavra_chave: 'Libertação',
      energia: 'Dissolução do que não serve',
      conexao_lunar: 'O vento que limpa e transforma, a cinza que liberta',
      lição_ciclica: 'A libertação pede soltar com amor',
    },
    correlacoes: {
      orixa: 'Iansã',
      chakra: 5,
      arcanjo: 'Carmen',
      sephirah: 'Geburah',
    },
  },
  6: {
    numero: 6,
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    elemento: 'Éter',
    elemento_secundario: 'Terra',
    significado_espiritual: {
      palavra_chave: 'Transmutação',
      energia: 'Dissolução no invisível',
      conexao_lunar: 'A fumaça que revela verdades ocultas, o véu que se levanta',
      lição_ciclica: 'A transmutação pede fé no processo invisível',
    },
    correlacoes: {
      orixa: 'Xangô',
      chakra: 6,
      arcanjo: 'Azrael',
      sephirah: 'Tiphereth',
    },
  },
  7: {
    numero: 7,
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    elemento: 'Terra',
    elemento_secundario: 'Água',
    significado_espiritual: {
      palavra_chave: 'Integração',
      energia: 'Consolidação do aprendizado',
      conexao_lunar: 'A raiz que absorve águas profundas, o solo que assimila',
      lição_ciclica: 'A integração pede perdão e sabedoria',
    },
    correlacoes: {
      orixa: 'Nanã',
      chakra: 7,
      arcanjo: 'Hamiel',
      sephirah: 'Netzach',
    },
  },
  8: {
    numero: 8,
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    elemento: 'Éter',
    elemento_secundario: 'Ar',
    significado_espiritual: {
      palavra_chave: 'Renovação',
      energia: 'Ancestralidade e limiar',
      conexao_lunar: 'O portal entre mundos, a sabedoria dos antepassados',
      lição_ciclica: 'A renovação pede despedida e confiança no renascimento',
    },
    correlacoes: {
      orixa: 'Omolu',
      chakra: 8,
      arcanjo: 'Azrael',
      sephirah: 'Hod',
    },
  },
  9: {
    numero: 9,
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    elemento: 'Água',
    elemento_secundario: 'Éter',
    significado_espiritual: {
      palavra_chave: 'Iluminação',
      energia: 'Sabedoria universal',
      conexao_lunar: 'A luz que ilumina caminhos, a intuição desperta',
      lição_ciclica: 'A iluminação pede humildade e serviço',
    },
    correlacoes: {
      orixa: 'Obatalá',
      chakra: 6,
      arcanjo: 'Rafael',
      sephirah: 'Yesod',
    },
  },
  10: {
    numero: 10,
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    elemento: 'Terra',
    elemento_secundario: 'Fogo',
    significado_espiritual: {
      palavra_chave: 'Manifestação',
      energia: 'Ciclo completo de criação',
      conexao_lunar: 'O retorno ao início, a semente que contém toda a árvore',
      lição_ciclica: 'A manifestação pede gratidão pelo ciclo completo',
    },
    correlacoes: {
      orixa: 'Oxalá',
      chakra: 1,
      arcanjo: 'Metatron',
      sephirah: 'Malkuth',
    },
  },
  11: {
    numero: 11,
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    elemento: 'Ar',
    elemento_secundario: 'Fogo',
    significado_espiritual: {
      palavra_chave: 'Inspiração',
      energia: 'Canalização divina',
      conexao_lunar: 'O véu fino entre mundos, a clarividência desperta',
      lição_ciclica: 'A inspiração pede discernimento e humildade',
    },
    correlacoes: {
      orixa: 'Orunmilá',
      chakra: 7,
      arcanjo: 'Gabriel',
      sephirah: 'Kether',
    },
  },
  12: {
    numero: 12,
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    elemento: 'Fogo',
    elemento_secundario: 'Terra',
    significado_espiritual: {
      palavra_chave: 'Justiça',
      energia: 'Discernimento e equilíbrio',
      conexao_lunar: 'A espada da verdade, o equilíbrio entre razão e emoção',
      lição_ciclica: 'A justiça pede imparcialidade e coragem',
    },
    correlacoes: {
      orixa: 'Xangô',
      chakra: 3,
      arcanjo: 'Samael',
      sephirah: 'Geburah',
    },
  },
  13: {
    numero: 13,
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    elemento: 'Terra',
    elemento_secundario: 'Água',
    significado_espiritual: {
      palavra_chave: 'Transformação',
      energia: 'Morte e renascimento',
      conexao_lunar: 'A sabedoria dos mais velhos, o ciclo que se encerra para renascer',
      lição_ciclica: 'A transformação pede soltar o antigo para abraçar o novo',
    },
    correlacoes: {
      orixa: 'Omolu',
      chakra: 1,
      arcanjo: 'Azrael',
      sephirah: 'Malkuth',
    },
  },
};

/**
 * Returns the moon phase correlation for a given numerology number (1-13)
 * @param numero - The numerology number (must be 1-13)
 * @returns NumerologyMoonMapping object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyMoon(numero: number): NumerologyMoonMapping {
  if (!Number.isInteger(numero) || numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMERO_LUA_MAP[numero];
}

/**
 * Get all numerology-moon mappings
 * @returns Array of all NumerologyMoonMapping objects for numbers 1-13
 */
export function getAllNumerologyMoons(): NumerologyMoonMapping[] {
  return Object.values(NUMERO_LUA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Get the moon phase for a given numerology number
 * @param numero - The numerology number (1-13)
 * @returns The FaseLua or null if invalid
 */
export function getMoonByNumero(numero: number): FaseLua | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_LUA_MAP[numero].fase;
}

/**
 * Get all numbers associated with a given moon phase
 * @param fase - The lunar phase identifier
 * @returns Array of NumerologyMoonMapping for the phase
 */
export function getMoonNumerology(fase: string): NumerologyMoonMapping[] {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return getAllNumerologyMoons().filter(m => m.fase === faseNormalizada);
}

/**
 * Get the element for a given numerology number
 * @param numero - The numerology number (1-13)
 * @returns The Elemento or null if invalid
 */
export function getElementByNumero(numero: number): Elemento | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_LUA_MAP[numero].elemento;
}

/**
 * Get the secondary element for a given numerology number
 * @param numero - The numerology number (1-13)
 * @returns The secondary Elemento or null if invalid
 */
export function getSecondaryElementByNumero(numero: number): Elemento | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_LUA_MAP[numero].elemento_secundario;
}

/**
 * Get the chakra number for a given numerology number
 * @param numero - The numerology number (1-13)
 * @returns The chakra number or null if invalid
 */
export function getChakraByNumero(numero: number): number | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_LUA_MAP[numero].correlacoes.chakra;
}

/**
 * Get the spiritual meaning for a given numerology number
 * @param numero - The numerology number (1-13)
 * @returns The spiritual meaning or null if invalid
 */
export function getSpiritualMeaningByNumero(numero: number): NumerologyMoonMapping['significado_espiritual'] | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_LUA_MAP[numero].significado_espiritual;
}

/**
 * Get all available lunar phases from numerology mappings
 * @returns Array of unique FaseLua values
 */
export function getAvailableMoonPhases(): FaseLua[] {
  const fases = new Set(getAllNumerologyMoons().map(m => m.fase));
  return Array.from(fases) as FaseLua[];
}

/**
 * Get all numerology numbers associated with a specific element
 * @param elemento - The element name
 * @returns Array of NumerologyMoonMapping where the element is primary
 */
export function getNumerologyByElement(elemento: string): NumerologyMoonMapping[] {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    ar: 'Ar',
    terra: 'Terra',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (!key) return [];

  return getAllNumerologyMoons().filter(m => m.elemento === key);
}

/**
 * Get all numerology numbers associated with a specific chakra
 * @param chakra - The chakra number (1-8)
 * @returns Array of NumerologyMoonMapping for the chakra
 */
export function getNumerologyByChakra(chakra: number): NumerologyMoonMapping[] {
  return getAllNumerologyMoons().filter(m => m.correlacoes.chakra === chakra);
}