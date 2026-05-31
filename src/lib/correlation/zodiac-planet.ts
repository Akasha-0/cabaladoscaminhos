/**
 * Zodiac-Planet Spiritual Correlation Module
 * Maps zodiac signs to planetary influences with element connections and spiritual meanings.
 * Source: Cabala dos Caminhos spiritual system
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type SignoZodiac =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/** Classical and modern planets in astrology */
export type Planeta =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vénus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno'
  | 'Urano'
  | 'Neptuno'
  | 'Plutão';

/**
 * Represents the correlation between a zodiac sign and its ruling planet
 */
export interface ZodiacPlanetMapping {
  signo: SignoZodiac;
  planeta: Planeta;
  elemento: Elemento;
  significado_spiritual: {
    descricao: string;
    qualidade_cosmica: string;
    lição_espiritual: string;
  };
  energia_manifestacao: {
    foco: string;
    força: string;
    sombra: string;
  };
}

/**
 * Complete mapping of the 12 zodiac signs to their ruling planets.
 * Based on traditional astrological rulerships and modern interpretations
 * from the Cabala dos Caminhos spiritual system.
 * Each sign carries the vibrational signature of its ruling planet.
 */
export const ZODIAC_PLANET_MAP: Record<SignoZodiac, ZodiacPlanetMapping> = {
  /** Fogo - Marte - Warrior energy, courage, initiative */
  Áries: {
    signo: 'Áries',
    planeta: 'Marte',
    elemento: 'Fogo',
    significado_spiritual: {
      descricao: 'O primeiro signo do zodíaco representa o início da jornada espiritual, a centelha divina que desperta a consciência para a ação.',
      qualidade_cosmica: 'Pioneirismo e força vital',
      lição_espiritual: 'Aprender a canalizar a energia marciana de forma constructiva, transformando impulsividade em força criativa.',
    },
    energia_manifestacao: {
      foco: 'Iniciação e pioneirismo',
      força: 'Coragem para agir, pioneirismo, vitalidade',
      sombra: 'Impaciência, agressividade, egoísmo',
    },
  },
  /** Terra - Vénus - Stability, beauty, material abundance */
  Touro: {
    signo: 'Touro',
    planeta: 'Vénus',
    elemento: 'Terra',
    significado_spiritual: {
      descricao: 'Símbolo da incarnação terrena e do vínculo com a natureza, representa a alma que busca permanência e beldade no mundo físico.',
      qualidade_cosmica: 'Abundância e permanência',
      lição_espiritual: 'Desenvolver contentamento interior enquanto transciende a dependência de posses materiais.',
    },
    energia_manifestacao: {
      foco: 'Construção e gozo sensorial',
      força: 'Persistência, reliability, apreciação da beleza',
      sombra: 'Possessividade, letargia, materialismo',
    },
  },
  /** Ar - Mercúrio - Communication, intellect, adaptability */
  Gémeos: {
    signo: 'Gémeos',
    planeta: 'Mercúrio',
    elemento: 'Ar',
    significado_spiritual: {
      descricao: 'Representa a mente dual e a capacidade de comunicar diferentes perspectivas, symbolizando a alma entre razão e emoção.',
      qualidade_cosmica: 'Versatilidade e conhecimento',
      lição_espiritual: 'Integrar os aspectos mentais e emocionais para alcançar wisdom interior.',
    },
    energia_manifestacao: {
      foco: 'Comunicação e aprendizado',
      força: 'Curiosidade, versatility, comunicação clara',
      sombra: 'Superficialidade, inconsistência, dispersão mental',
    },
  },
  /** Água - Lua - Emotions, intuition, nurturing */
  Câncer: {
    signo: 'Câncer',
    planeta: 'Lua',
    elemento: 'Água',
    significado_spiritual: {
      descricao: 'Guardião do passado e das memórias ancestrais, representa a alma que busca segurança emocional e conexão com a família.',
      qualidade_cosmica: 'Nutrição e proteção',
      lição_espiritual: 'Cultivar independência emocional enquanto honras as raízes familiares.',
    },
    energia_manifestacao: {
      foco: 'Proteção e cuidado',
      força: 'Intuição, compaixão, lealdade familiar',
      sombra: 'Manipulação emocional, vulnerabilidade excessiva, apego',
    },
  },
  /** Fogo - Sol - Identity, creativity, self-expression */
  Leão: {
    signo: 'Leão',
    planeta: 'Sol',
    elemento: 'Fogo',
    significado_spiritual: {
      descricao: 'O centro do zodíaco, representa o SELF iluminado e a capacidade de brilhar com autenticidade, irradiando luz para outros.',
      qualidade_cosmica: 'Autoexpressão e propósito',
      lição_espiritual: 'Descobrir que o verdadeiro poder vem de servir outros, não de dominar.',
    },
    energia_manifestacao: {
      foco: 'Criação e reconhecimento',
      força: 'Confiança, criatividade, generosidade, liderança',
      sombra: 'Arrogância, vaidade, necessidade de validação',
    },
  },
  /** Terra - Mercúrio - Analysis, service, perfection */
  Virgem: {
    signo: 'Virgem',
    planeta: 'Mercúrio',
    elemento: 'Terra',
    significado_spiritual: {
      descricao: 'Guardião da saúde e da purityza, representa a alma que busca perfection through service and análise detalhada.',
      qualidade_cosmica: 'Discernimento e purificação',
      lição_espiritual: 'Aceitar a imperfeição como parte da jornada espiritual enquanto mantém o desejo de growth.',
    },
    energia_manifestacao: {
      foco: 'Serviço e análise',
      força: 'Discernimento, organização, pragmatismo',
      sombra: 'Perfeccionismo, crítica excessiva, obsessão por detalhes',
    },
  },
  /** Ar - Vénus - Balance, relationships, harmony */
  Libra: {
    signo: 'Libra',
    planeta: 'Vénus',
    elemento: 'Ar',
    significado_spiritual: {
      descricao: 'Símbolo da relação e da parceria divina, representa a alma que busca harmonia e justiça nas relações interpessoais.',
      qualidade_cosmica: 'Harmonia e justiça',
      lição_espiritual: 'Equilibrar as necessidades próprias com as dos outros, discovering que a verdadeira paz vem de dentro.',
    },
    energia_manifestacao: {
      foco: 'Relacionamentos e equilíbrio',
      força: 'Diplomacia, sentido estético, buscar justiça',
      sombra: 'Indecisão, superficialidade, dependência de aprovação',
    },
  },
  /** Água - Plutão - Transformation, intensity, regeneration */
  Escorpião: {
    signo: 'Escorpião',
    planeta: 'Plutão',
    elemento: 'Água',
    significado_spiritual: {
      descricao: 'Guardião dos mistérios da vida e da morte, representa a alma que atravessa transformações profundas para renascer.',
      qualidade_cosmica: 'Regeneração e mistério',
      lição_espiritual: 'Aceitar que a morte interior é necessária para a ressurreição espiritual.',
    },
    energia_manifestacao: {
      foco: 'Transformação e再生',
      força: 'Intensidade, poder de transformação, profundidade emocional',
      sombra: 'Manipulação, ciúmes, obsessão, medo da morte',
    },
  },
  /** Fogo - Júpiter - Expansion, wisdom, optimism */
  Sagitário: {
    signo: 'Sagitário',
    planeta: 'Júpiter',
    elemento: 'Fogo',
    significado_spiritual: {
      descricao: 'O filósofo do zodíaco, representa a alma que busca truth and expansion através de experiências e conhecimento.',
      qualidade_cosmica: 'Expansão e sabedoria',
      lição_espiritual: 'Encontrar humility na jornada espiritual, reconhecendo que a wisdom verdadeira vem da experiência.',
    },
    energia_manifestacao: {
      foco: 'Exploração e busca de verdade',
      força: 'Otimismo, wisdom, busca de conhecimento, aventura',
      sombra: 'Excesso, dogmatismo, impaciência, irresponsabilidade',
    },
  },
  /** Terra - Saturno - Discipline, mastery, responsibility */
  Capricórnio: {
    signo: 'Capricórnio',
    planeta: 'Saturno',
    elemento: 'Terra',
    significado_spiritual: {
      descricao: 'O mestre do zodíaco, representa a alma que busca mestria através de disciplina e responsabilidade.',
      qualidade_cosmica: 'Mestria e estrutura',
      lição_espiritual: 'Desenvolver paciência cósmica, reconhecendo que o tempo é um aliado na construção de realizações duradouras.',
    },
    energia_manifestacao: {
      foco: 'Estrutura e realizações',
      força: 'Disciplina, responsabilidade, ambição estruturada',
      sombra: 'Rigidez, medo do fracasso, pessimismo, autocrítica excessiva',
    },
  },
  /** Ar - Urano - Innovation, humanitarianism, freedom */
  Aquário: {
    signo: 'Aquário',
    planeta: 'Urano',
    elemento: 'Ar',
    significado_spiritual: {
      descricao: 'O visionário do zodíaco, representa a alma que serve a humanidade com originalidade e detached from convenções.',
      qualidade_cosmica: 'Inovação e liberdade',
      lição_espiritual: 'Cultivar compaixão universal mantendo individualidade, integrando o singular com o coletivo.',
    },
    energia_manifestacao: {
      foco: 'Inovação e serviço à humanidade',
      força: 'Originalidade, humanitarismo, pensamento progressista',
      sombra: 'Rebelião sem propósito, frieza emocional, excentricidade',
    },
  },
  /** Água - Neptuno - Transcendence, compassion, dreams */
  Peixes: {
    signo: 'Peixes',
    planeta: 'Neptuno',
    elemento: 'Água',
    significado_spiritual: {
      descricao: 'O místico do zodíaco, representa a alma que dissolve límites para conectar-se com o divino e o universo.',
      qualidade_cosmica: 'Transcendência e compaixão',
      lição_espiritual: 'Manter boundaries saudáveis enquanto se expande para o mundo espiritual.',
    },
    energia_manifestacao: {
      foco: 'Transcendência e conexão espiritual',
      força: 'Compaixão universal, intuição profunda, espiritualidade',
      sombra: 'Ilusão, escapismo, confusão, codependência',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ZODIAC_PLANET_MAP);
Object.values(ZODIAC_PLANET_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 10 planets (classical + modern) used in astrology
 */
export const TODOS_PLANETAS: readonly Planeta[] = [
  'Sol',
  'Lua',
  'Mercúrio',
  'Vénus',
  'Marte',
  'Júpiter',
  'Saturno',
  'Urano',
  'Neptuno',
  'Plutão',
] as const;

/**
 * All 12 zodiac signs
 */
export const TODOS_SIGNOS: readonly SignoZodiac[] = [
  'Áries',
  'Touro',
  'Gémeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
] as const;

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const mapa: Record<string, SignoZodiac> = {
    aries: 'Áries',
    Áries: 'Áries',
    arie: 'Áries',
    touro: 'Touro',
    Touro: 'Touro',
    gemeos: 'Gémeos',
    Gémeos: 'Gémeos',
    gemeos: 'Gémeos',
    cancer: 'Câncer',
    Câncer: 'Câncer',
    cancro: 'Câncer',
    leao: 'Leão',
    Leão: 'Leão',
    virgem: 'Virgem',
    Virgem: 'Virgem',
    libra: 'Libra',
    Libra: 'Libra',
    balança: 'Libra',
    Balança: 'Libra',
    escorpiao: 'Escorpião',
    Escorpião: 'Escorpião',
    escorpião: 'Escorpião',
    sagitario: 'Sagitário',
    Sagitário: 'Sagitário',
    capricornio: 'Capricórnio',
    Capricórnio: 'Capricórnio',
    aquario: 'Aquário',
    Aquário: 'Aquário',
    peixes: 'Peixes',
    Peixes: 'Peixes',
  };

  const lower = signo.toLowerCase().trim();
  return mapa[lower] ?? null;
}

/**
 * Get the zodiac-planet mapping for a given sign name.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns ZodiacPlanetMapping or null if not found
 */
export function getZodiacPlanet(signo: string): ZodiacPlanetMapping | null {
  const normalizado = normalizarSigno(signo);
  if (!normalizado) return null;
  return ZODIAC_PLANET_MAP[normalizado] ?? null;
}

/**
 * Get the zodiac sign associated with a given planet.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua')
 * @returns SignoZodiac or null if not found
 */
export function getPlanetZodiac(planeta: string): SignoZodiac | null {
  const planetaUpper = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase();

  for (const [signo, mapping] of Object.entries(ZODIAC_PLANET_MAP)) {
    if (mapping.planeta === planetaUpper) {
      return signo as SignoZodiac;
    }
  }
  return null;
}

/**
 * Get the planet for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Planeta or null if not found
 */
export function getPlanetaFromSigno(signo: string): Planeta | null {
  return getZodiacPlanet(signo)?.planeta ?? null;
}

/**
 * Get all zodiac-planet mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacPlanets(): ZodiacPlanetMapping[] {
  return Object.values(ZODIAC_PLANET_MAP);
}

/**
 * Get the element for a given sign.
 * @param signo - Zodiac sign name
 * @returns Elemento or null if not found
 */
export function getElementoFromSigno(signo: string): Elemento | null {
  return getZodiacPlanet(signo)?.elemento ?? null;
}

/**
 * Get the spiritual description for a given sign.
 * @param signo - Zodiac sign name
 * @returns Spiritual description or null if not found
 */
export function getSignificadoSpiritual(signo: string): ZodiacPlanetMapping['significado_spiritual'] | null {
  return getZodiacPlanet(signo)?.significado_spiritual ?? null;
}

/**
 * Get the cosmic quality for a given sign.
 * @param signo - Zodiac sign name
 * @returns Cosmic quality string or null if not found
 */
export function getQualidadeCosmica(signo: string): string | null {
  return getZodiacPlanet(signo)?.significado_spiritual.qualidade_cosmica ?? null;
}

/**
 * Get the spiritual lesson for a given sign.
 * @param signo - Zodiac sign name
 * @returns Spiritual lesson string or null if not found
 */
export function getLicaoEspiritual(signo: string): string | null {
  return getZodiacPlanet(signo)?.significado_spiritual.lição_espiritual ?? null;
}

/**
 * Get the energy of manifestation for a given sign.
 * @param signo - Zodiac sign name
 * @returns Energy manifest or null if not found
 */
export function getEnergiaManifestacao(signo: string): ZodiacPlanetMapping['energia_manifestacao'] | null {
  return getZodiacPlanet(signo)?.energia_manifestacao ?? null;
}

/**
 * Get all signs ruled by a specific planet.
 * @param planeta - Planet name
 * @returns Array of ZodiacPlanetMapping
 */
export function getSignosByPlaneta(planeta: string): ZodiacPlanetMapping[] {
  const planetaUpper = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase();
  return Object.values(ZODIAC_PLANET_MAP).filter((m) => m.planeta === planetaUpper);
}

/**
 * Get all signs associated with a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of ZodiacPlanetMapping
 */
export function getSignosByElement(elemento: string): ZodiacPlanetMapping[] {
  return Object.values(ZODIAC_PLANET_MAP).filter((m) => m.elemento === elemento);
}

/**
 * Get the shadow energy for a given sign.
 * @param signo - Zodiac sign name
 * @returns Shadow string or null if not found
 */
export function getSombraFromSigno(signo: string): string | null {
  return getZodiacPlanet(signo)?.energia_manifestacao.sombra ?? null;
}

/**
 * Get all zodiac signs used in the mapping.
 * @returns Array of unique sign names
 */
export function getAllSigns(): SignoZodiac[] {
  return Object.values(ZODIAC_PLANET_MAP).map((m) => m.signo);
}

/**
 * Get zodiac planet mapping by sign name (case-insensitive).
 * @param signo - Zodiac sign name
 * @returns ZodiacPlanetMapping or null if not found
 */
export function getZodiacPlanetBySigno(signo: string): ZodiacPlanetMapping | null {
  return getZodiacPlanet(signo);
}

/**
 * Check if a planet has multiple signs.
 * @param planeta - Planet name
 * @returns true if planet rules multiple signs
 */
export function isPlanetaMultiplo(planeta: string): boolean {
  return getSignosByPlaneta(planeta).length > 1;
}

/**
 * Get all planets that rule multiple signs.
 * @returns Array of Planeta names
 */
export function getPlanetasMultiplos(): Planeta[] {
  return Object.values(ZODIAC_PLANET_MAP)
    .map((m) => m.planeta)
    .filter((planeta, index, arr) => arr.indexOf(planeta) !== index)
    .filter((planeta, index, arr) => arr.indexOf(planeta) === index) as Planeta[];
}

/**
 * Default export with all public functions
 */
export default {
  getZodiacPlanet,
  getPlanetZodiac,
  getAllZodiacPlanets,
  getPlanetaFromSigno,
  getElementoFromSigno,
  getSignificadoSpiritual,
  getQualidadeCosmica,
  getLicaoEspiritual,
  getEnergiaManifestacao,
  getSignosByPlaneta,
  getSignosByElement,
  getSombraFromSigno,
  getAllSigns,
  getZodiacPlanetBySigno,
  isPlanetaMultiplo,
  getPlanetasMultiplos,
  ZODIAC_PLANET_MAP,
  TODOS_PLANETAS,
  TODOS_SIGNOS,
};