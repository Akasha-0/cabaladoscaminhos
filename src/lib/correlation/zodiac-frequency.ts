/**
 * Zodiac-Frequency Spiritual Correlation Module
 * Maps zodiac signs to Solfeggio frequencies with element connections and healing properties.
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

/**
 * Represents the correlation between a zodiac sign and a Solfeggio frequency
 */
export interface ZodiacFrequencyMapping {
  signo: SignoZodiac;
  frequencia: number;
  elemento: Elemento;
  propriedades_healing: {
    fisico: string;
    emocional: string;
    mental_espiritual: string;
    melhor_epoca: string;
  };
}

/**
 * Complete mapping of the 12 zodiac signs to their Solfeggio frequency correspondences.
 * Based on elemental correspondences and spiritual properties from the Cabala dos Caminhos system.
 * Each sign carries the vibrational signature of its corresponding frequency.
 */
export const ZODIAC_FREQUENCY_MAP: Record<SignoZodiac, ZodiacFrequencyMapping> = {
  /** Fogo - 528Hz - transformation and creativity */
  Áries: {
    signo: 'Áries',
    frequencia: 528,
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula sistema nervoso e coração, aumenta vitalidade',
      emocional: 'Transforma raiva em ação construtiva, promove coragem',
      mental_espiritual: 'Ativa criatividade e expressão pessoal autêntica',
      melhor_epoca: 'Início de projetos, tomada de decisões importantes',
    },
  },
  /** Terra - 396Hz - grounding and release */
  Touro: {
    signo: 'Touro',
    frequencia: 396,
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos e sistema imunológico, alivia tensão muscular',
      emocional: 'Dissolve medos de perda e insegurança material',
      mental_espiritual: 'Promove estabilidade mental e paciência profunda',
      melhor_epoca: 'Períodos de mudança económica, necessidades de base',
    },
  },
  /** Ar - 417Hz - facilitation and change */
  Gémeos: {
    signo: 'Gémeos',
    frequencia: 417,
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Melhora comunicação e funções respiratórias',
      emocional: 'Liberta padrões mentais negativos e facilita adaptação',
      mental_espiritual: 'Promove flexibilidade mental e aprendizado rápido',
      melhor_epoca: 'Transições intelectuais, estudos e comunicação',
    },
  },
  /** Água - 417Hz - emotional healing */
  Câncer: {
    signo: 'Câncer',
    frequencia: 417,
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Hidrata tecidos e melhora saúde emocional',
      emocional: 'Libera traumas familiares e medos ancestrais',
      mental_espiritual: 'Facilita cura emocional profunda e adaptação',
      melhor_epoca: 'Fases de transição familiar, cura de feridas emocionais',
    },
  },
  /** Fogo - 528Hz - love and vitality */
  Leão: {
    signo: 'Leão',
    frequencia: 528,
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula coração, sistema nervoso e vitalidade',
      emocional: 'Transforma orgulho em amor próprio genuíno',
      mental_espiritual: 'Ativa criatividade, expressão e propósito de vida',
      melhor_epoca: 'Momento de buscar reconhecimento, expressing individualidade',
    },
  },
  /** Terra - 741Hz - awakening expression */
  Virgem: {
    signo: 'Virgem',
    frequencia: 741,
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Limpa sistema digestivo e fortalece intestino',
      emocional: 'Purifica perfeccionismo excessivo e análise paralisante',
      mental_espiritual: 'Desperta discernimento e organização espiritual',
      melhor_epoca: 'Rotinas de cura, trabalho detalhado, análise',
    },
  },
  /** Ar - 639Hz - harmony and relationships */
  Libra: {
    signo: 'Libra',
    frequencia: 639,
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Equilibra sistema hormonal e circulatório',
      emocional: 'Harmoniza relacionamentos e resolve conflitos',
      mental_espiritual: 'Promove justiça, equilíbrio e diplomatía',
      melhor_epoca: 'Decisões sobre parcerias, busca de harmonia em relações',
    },
  },
  /** Água - 852Hz - intuition and transformation */
  Escorpião: {
    signo: 'Escorpião',
    frequencia: 852,
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Equilibra sistema nervoso e glandular',
      emocional: 'Dissipa ilusões e revela verdades ocultas',
      mental_espiritual: 'Desperta intuição profunda e transformação radical',
      melhor_epoca: 'Períodos de regeneração, busca de verdades escondidas',
    },
  },
  /** Fogo - 528Hz - expansion and wisdom */
  Sagitário: {
    signo: 'Sagitário',
    frequencia: 528,
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Fortalece ancas, coxas e sistema circulatório',
      emocional: 'Expande perspectivas, elimina conservadorismo extremo',
      mental_espiritual: 'Promove filosofia, espiritualidade e busca de verdade',
      melhor_epoca: 'Viagens espirituais, estudos profundos, expansão de consciência',
    },
  },
  /** Terra - 741Hz - mastery and discipline */
  Capricórnio: {
    signo: 'Capricórnio',
    frequencia: 741,
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos, articulações e sistema skeletal',
      emocional: 'Transforma medo de fracasso em ambição estruturada',
      mental_espiritual: 'Promove disciplina, responsabilidade e realizações duradouras',
      melhor_epoca: 'Planeamento de carreira, construção de fundamentos',
    },
  },
  /** Ar - 741Hz - innovation and humanitarianism */
  Aquário: {
    signo: 'Aquário',
    frequencia: 741,
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Limpa garganta e vias respiratórias',
      emocional: 'Liberta pensamento rígido e rebelião interior',
      mental_espiritual: 'Desperta pensamento humanitário e inovação',
      melhor_epoca: 'Trabalhos para comunidade, buscas por liberdade individual',
    },
  },
  /** Água - 963Hz - divine connection */
  Peixes: {
    signo: 'Peixes',
    frequencia: 963,
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Restaura padrão original do corpo e regeneração celular',
      emocional: 'Promove compaixão universal e paz interior profunda',
      mental_espiritual: 'Conexão com o divino e transcendência do ego',
      melhor_epoca: 'Méditação profunda, busca espiritual, dissolução de límites',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ZODIAC_FREQUENCY_MAP);
Object.values(ZODIAC_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * All 12 zodiac signs
 */
export const TODOS_SIGNOS: readonly SignoZodiac[] = [
  'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): SignoZodiac | null {
  const normalizado = signo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const mapa: Record<string, SignoZodiac> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'cancer': 'Câncer',
    'leao': 'Leão',
    'virgem': 'Virgem',
    'libra': 'Libra',
    'escorpiao': 'Escorpião',
    'sagitario': 'Sagitário',
    'capricornio': 'Capricórnio',
    'aquario': 'Aquário',
    'peixes': 'Peixes',
  };

  return mapa[normalizado] ?? null;
}

/**
 * Get the zodiac-frequency mapping for a given sign name.
 * @param signo - Zodiac sign name (e.g., 'Áries', 'Touro')
 * @returns ZodiacFrequencyMapping or null if not found
 */
export function getZodiacFrequency(signo: string): ZodiacFrequencyMapping | null {
  const normalizado = normalizarSigno(signo);
  return normalizado ? ZODIAC_FREQUENCY_MAP[normalizado] ?? null : null;
}

/**
 * Get the zodiac sign associated with a given frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns SignoZodiac or null if not found
 */
export function getFrequencyZodiac(frequencia: number): SignoZodiac | null {
  for (const mapping of Object.values(ZODIAC_FREQUENCY_MAP)) {
    if (mapping.frequencia === frequencia) {
      return mapping.signo;
    }
  }
  return null;
}

/**
 * Get the frequency for a given sign name.
 * @param signo - Zodiac sign name
 * @returns Frequency in Hz or null if not found
 */
export function getFrequenciaFromSigno(signo: string): number | null {
  return getZodiacFrequency(signo)?.frequencia ?? null;
}

/**
 * Get all zodiac-frequency mappings.
 * @returns Array of all correlation mappings
 */
export function getAllZodiacFrequencies(): ZodiacFrequencyMapping[] {
  return Object.values(ZODIAC_FREQUENCY_MAP);
}

/**
 * Get the element for a given sign.
 * @param signo - Zodiac sign name
 * @returns Elemento or null if not found
 */
export function getElementFromSigno(signo: string): Elemento | null {
  return getZodiacFrequency(signo)?.elemento ?? null;
}

/**
 * Get the healing properties for a given sign.
 * @param signo - Zodiac sign name
 * @returns Healing properties or null if not found
 */
export function getHealingFromSigno(signo: string): ZodiacFrequencyMapping['propriedades_healing'] | null {
  return getZodiacFrequency(signo)?.propriedades_healing ?? null;
}

/**
 * Get all signs associated with a specific frequency.
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of ZodiacFrequencyMapping or empty array if not found
 */
export function getSignosByFrequencia(frequencia: number): ZodiacFrequencyMapping[] {
  return Object.values(ZODIAC_FREQUENCY_MAP).filter(
    (mapping) => mapping.frequencia === frequencia
  );
}

/**
 * Get the best epoch/time for healing practice with a given sign.
 * @param signo - Zodiac sign name
 * @returns Best epoch string or null if not found
 */
export function getBestEpochFromSigno(signo: string): string | null {
  return getZodiacFrequency(signo)?.propriedades_healing.melhor_epoca ?? null;
}

/**
 * Get all signs mapped to a specific element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of ZodiacFrequencyMapping
 */
export function getSignosByElement(elemento: string): ZodiacFrequencyMapping[] {
  return Object.values(ZODIAC_FREQUENCY_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all zodiac signs used in the mapping.
 * @returns Array of unique sign names
 */
export function getAllSigns(): SignoZodiac[] {
  return Object.values(ZODIAC_FREQUENCY_MAP).map((m) => m.signo);
}

/**
 * Get frequency mapping by zodiac sign name (case-insensitive).
 * @param signo - Zodiac sign name
 * @returns ZodiacFrequencyMapping or null if not found
 */
export function getZodiacFrequencyBySigno(signo: string): ZodiacFrequencyMapping | null {
  return getZodiacFrequency(signo);
}
