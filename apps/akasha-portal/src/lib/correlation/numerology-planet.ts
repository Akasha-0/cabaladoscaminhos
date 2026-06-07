/**
 * Numerology-Planet Spiritual Correlation
 * Maps numerology numbers 1-13 to their corresponding planets,
 * element connections, and spiritual meanings.
 * 
 * Based on traditional astrological correspondences and
 * the Cabala dos Caminhos mystical numerology system.
 */
export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno' | 'Netuno';

export interface NumerologyPlanetMapping {
  /** The numerology number (1-13) */
  numero: number;
  /** Associated planet */
  planeta: Planeta;
  /** Element connection for this number-planet correlation */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Energy quality type */
  qualidade_energetica: {
    tipo: 'Yang (Expressivo)' | 'Yin (Receptivo)' | 'Neutro (Equilibrado)';
    vibração: string;
  };
  /** Associated life area this number-planet governs */
  area_vida: string;
  /** Associated orixá for this correlation */
  orixa: string;
}

/**
 * Complete mapping of numerology numbers 1-13 to their planet correspondences.
 * Derived from traditional astrological correspondences and Cabala numerology.
 */
export const NUMERO_PLANETA_MAP: Record<number, NumerologyPlanetMapping> = {
  1: {
    numero: 1,
    planeta: 'Sol',
    elemento: 'Fogo',
    significado_espiritual: 'O Sol representa o núcleo do ser, a essência divina que ilumina o caminho. O número 1 carrega a força de vontade, a liderança espiritual e o propósito de vida que emana do centro do ser.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Iniciação, propósito divino, poder pessoal, individualidade, clareza mental',
    },
    area_vida: 'Identidade e Propósito',
    orixa: 'Oxalá',
  },
  2: {
    numero: 2,
    planeta: 'Lua',
    elemento: 'Água',
    significado_espiritual: 'A Lua representa a alma, os ciclos emocionais e a sabedoria intuitiva. O número 2 traz a receptividade, a conexão com o inconsciente e a capacidade de fluir com as correntes universais.',
    qualidade_energetica: {
      tipo: 'Yin (Receptivo)',
      vibração: 'Intuição profunda, receptividade, emocionalidade, conexão com ancestrais',
    },
    area_vida: 'Emocionalidade e Intuição',
    orixa: 'Iemanjá',
  },
  3: {
    numero: 3,
    planeta: 'Júpiter',
    elemento: 'Fogo',
    significado_espiritual: 'Júpiter representa a fartura cósmica, o conhecimento dos mestres e a bênção divina. O número 3 traz expansão, otimismo, sabedoria e crescimento espiritual através da expressão criativa.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Expansão, abundância, sabedoria, otimismo, crescimento espiritual',
    },
    area_vida: 'Abundância e Conhecimento',
    orixa: 'Oxum',
  },
  4: {
    numero: 4,
    planeta: 'Saturno',
    elemento: 'Terra',
    significado_espiritual: 'Saturno representa o师长 que traz provas para o crescimento, a disciplina e a mestreia terrena. O número 4 traz estrutura, estabilidade, foundations sólidos e o trabalho perseverante que sustenta a evolução.',
    qualidade_energetica: {
      tipo: 'Neutro (Equilibrado)',
      vibração: 'Disciplina, responsabilidade, encerramento de ciclos, mestreia terrena',
    },
    area_vida: 'Estrutura e Realização',
    orixa: 'Xangô',
  },
  5: {
    numero: 5,
    planeta: 'Mercúrio',
    elemento: 'Ar',
    significado_espiritual: 'Mercúrio representa a mente que conecta o céu e a terra, abrindo caminhos através da palavra e do pensamento. O número 5 traz liberdade, adaptabilidade, mudança e a alquimia interior que transforma pela experiência.',
    qualidade_energetica: {
      tipo: 'Neutro (Equilibrado)',
      vibração: 'Comunicação, mudança, adaptabilidade, agilidade mental, transformação',
    },
    area_vida: 'Comunicação e Liberdade',
    orixa: 'Ogum',
  },
  6: {
    numero: 6,
    planeta: 'Vênus',
    elemento: 'Água',
    significado_espiritual: 'Vênus representa o amor incondicional, a paz divina e a capacidade de magnetizar experiências de harmonia. O número 6 traz amor, beleza, harmonia e a responsabilidade de servir pelo coração.',
    qualidade_energetica: {
      tipo: 'Yin (Receptivo)',
      vibração: 'Amor, harmonia, beleza, doçura, magnetismo, paz divina',
    },
    area_vida: 'Amor e Harmonia',
    orixa: 'Oxum',
  },
  7: {
    numero: 7,
    planeta: 'Netuno',
    elemento: 'Água',
    significado_espiritual: 'Netuno representa a espiritualidade transcendente, a conexão com o divino e a dissolução dos limites do ego. O número 7 traz introspecção, sabedoria oculta, misticismo e a busca da verdade além do véu da matéria.',
    qualidade_energetica: {
      tipo: 'Yin (Receptivo)',
      vibração: 'Introspecção, sabedoria, misticismo, espiritualidade, busca da verdade',
    },
    area_vida: 'Espiritualidade e Sabedoria',
    orixa: 'Iansã',
  },
  8: {
    numero: 8,
    planeta: 'Saturno',
    elemento: 'Terra',
    significado_espiritual: 'Saturno representa a justiça kármica, o师长 que traz provas para o crescimento. O número 8 traz autoridade interior, gestão, perseverança e o poder pessoal que vem da superação de obstáculos.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Resiliência, autoridade interior, gestão, perseverança, poder pessoal',
    },
    area_vida: 'Autoridade e Poder',
    orixa: 'Oxalá',
  },
  9: {
    numero: 9,
    planeta: 'Marte',
    elemento: 'Fogo',
    significado_espiritual: 'Marte representa a energia de combate aos obstáculos, a limpeza de traumas e a transmutação da energia em poder criativo. O número 9 traz coragem, transformação, força vital e o humanitarismo que transcende o individual.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Coragem, transformação, força vital, ação, determinação, humanitarismo',
    },
    area_vida: 'Ação e Transformação',
    orixa: 'Ogum',
  },
  10: {
    numero: 10,
    planeta: 'Lua',
    elemento: 'Água',
    significado_espiritual: 'A Lua representa os ciclos de renovação e o retorno ao centro. O número 10 traz transformação profunda, encerramento de ciclos, manifestação material e a sabedoria de que todo fim é um novo começo.',
    qualidade_energetica: {
      tipo: 'Yin (Receptivo)',
      vibração: 'Renovação, transformação, ciclos, manifestação material, novos começos',
    },
    area_vida: 'Renovação e Ciclos',
    orixa: 'Iemanjá',
  },
  11: {
    numero: 11,
    planeta: 'Netuno',
    elemento: 'Éter',
    significado_espiritual: 'Netuno representa a iluminação espiritual, o canal entre o humano e o divino. O número 11, número mestre, traz intuição desperta, channeling, inspiração divina e o alinhamento completo com a vontade superior.',
    qualidade_energetica: {
      tipo: 'Neutro (Equilibrado)',
      vibração: 'Intuição espiritual, channeling, inspiração divina, iluminação, canalização',
    },
    area_vida: 'Iluminação e Canalização',
    orixa: 'Alafia',
  },
  12: {
    numero: 12,
    planeta: 'Júpiter',
    elemento: 'Fogo',
    significado_espiritual: 'Júpiter representa a fartura cósmica e a bênção divina que expande a consciência. O número 12 traz serviço sagrado, fé ativa e a capacidade de transformar provações em sabedoria através da integridade moral.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Justiça divina, coragem moral, fogo purificador, integridade, serviço sagrado',
    },
    area_vida: 'Serviço Sagrado e Fé',
    orixa: 'Xangô',
  },
  13: {
    numero: 13,
    planeta: 'Saturno',
    elemento: 'Terra',
    significado_espiritual: 'Saturno representa a morte e o renascimento, o师长 que traz provas e renovação. O número 13 traz transformação profunda, encerramento de ciclos kármicos, sabedoria dos ancestrais e a evolução que vem pela superação.',
    qualidade_energetica: {
      tipo: 'Yang (Expressivo)',
      vibração: 'Transformação profunda, encerramento de ciclos, sabedoria ancestral, evolução',
    },
    area_vida: 'Evolução e Renascimento',
    orixa: 'Nanã',
  },
};

/**
 * Returns the planet correlation for a given numerology number (1-13)
 * @param numero - The number to look up (must be 1-13)
 * @returns NumerologyPlanetMapping object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyPlanet(numero: number): NumerologyPlanetMapping {
  if (!Number.isInteger(numero) || numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMERO_PLANETA_MAP[numero];
}

/**
 * Get planet-numerology reverse mapping: planet to associated numbers
 * @returns Record mapping each planet to its associated numerology numbers
 */
export function getPlanetNumerology(): Record<Planeta, number[]> {
  const result: Partial<Record<Planeta, number[]>> = {};

  for (const mapping of Object.values(NUMERO_PLANETA_MAP)) {
    const planeta = mapping.planeta;
    if (!result[planeta]) {
      result[planeta] = [];
    }
    if (!result[planeta]!.includes(mapping.numero)) {
      result[planeta]!.push(mapping.numero);
    }
  }

  return result as Record<Planeta, number[]>;
}

/**
 * Get all numerology-planet mappings
 * @returns Array of all NumerologyPlanetMapping objects for numbers 1-13
 */
export function getAllNumerologyPlanets(): NumerologyPlanetMapping[] {
  return Object.values(NUMERO_PLANETA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Returns the planet name for a given number
 * @param numero - The number to look up (1-13)
 * @returns Planeta string or null if invalid
 */
export function getPlanetByNumero(numero: number): Planeta | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_PLANETA_MAP[numero].planeta;
}

/**
 * Returns the element connection for a given number
 * @param numero - The number to look up (1-13)
 * @returns Element string or null if invalid
 */
export function getElementByNumero(numero: number): 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter' | null {
  if (numero < 1 || numero > 13) return null;
  return NUMERO_PLANETA_MAP[numero].elemento;
}

/**
 * Returns all numbers associated with a given planet
 * @param planeta - Planet name (Sol, Lua, Marte, Mercúrio, Júpiter, Vênus, Saturno)
 * @returns Array of NumerologyPlanetMapping objects for the planet
 */
export function getNumerologyByPlanet(planeta: string): NumerologyPlanetMapping[] {
  const normalized = planeta.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const planetMap: Record<string, Planeta> = {
    sol: 'Sol',
    lua: 'Lua',
    marte: 'Marte',
    mercurio: 'Mercúrio',
    mercúrio: 'Mercúrio',
    jupiter: 'Júpiter',
    júpiter: 'Júpiter',
    venus: 'Vênus',
    vênus: 'Vênus',
    saturno: 'Saturno',
    netuno: 'Netuno',
  };

  const key = planetMap[normalized];
  if (!key) return [];

  return getAllNumerologyPlanets().filter((m) => m.planeta === key);
}

export default {
  getNumerologyPlanet,
  getPlanetNumerology,
  getAllNumerologyPlanets,
  getPlanetByNumero,
  getElementByNumero,
  getNumerologyByPlanet,
};
