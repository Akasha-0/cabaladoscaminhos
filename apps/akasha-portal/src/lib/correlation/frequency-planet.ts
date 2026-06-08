/**
 * Frequency-Planet Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to classical planets
 * Source: Cabala dos Caminhos system and traditional spiritual correspondences
 */

export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno' | 'Urano' | 'Netuno' | 'Plutão';

/**
 * Represents the correlation between a Solfeggio frequency and its planetary correspondence
 */
export interface FrequencyPlanetMapping {
  /** Frequency in Hz */
  frequencia: number;
  /** Primary planet name */
  planeta: Planeta;
  /** Element associated with this frequency-planet correlation */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Healing properties for this frequency-planet combination */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice type */
    pratica_recomendada: string;
  };
  /** Astrological quality */
  qualidade_astrologica: {
    /** Planet's fundamental nature */
    natureza: string;
    /** Energy signature */
    assinatura_energetica: string;
    /** Associated life domain */
    dominio: string;
  };
  /** Chakra correspondent */
  chakra: string;
  /** Orixá with planetary affinity */
  orixa: string;
  /** Sephirah correspondence from Cabala */
  sephirah: string;
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their planetary correspondences.
 * Based on traditional spiritual and astrological correspondences.
 * Each frequency carries the vibrational signature of its corresponding planet.
 */
export const FREQUENCY_PLANET_MAP: Record<number, FrequencyPlanetMapping> = {
  396: {
    frequencia: 396,
    planeta: 'Saturno',
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos, articulações e sistema imunológico',
      emocional: 'Dissolve medos de limitação, culpa e padrões kármicos',
      mental_espiritual: 'Promove disciplina, paciência e sabedoria através da experiência',
      pratica_recomendada: 'Trabalho com ancestrais, meditação dekarma, regeneração óssea',
    },
    qualidade_astrologica: {
      natureza: 'Restrição e strukturacao',
      assinatura_energetica: 'Ancoramento profundo, resistência e perseverança',
      dominio: 'Estrutura, limites e propósito de vida',
    },
    chakra: '1º Básico (Muladhara)',
    orixa: 'Oxalufã / Obaluayê',
    sephirah: 'Malchut (Reino)',
  },
  417: {
    frequencia: 417,
    planeta: 'Netuno',
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Purifica fluidos corporais, melhora circulação e limpeza energética',
      emocional: 'Liberta ilusões, traumas emocionais e apegos do passado',
      mental_espiritual: 'Desperta intuição profunda, sensibilidade espiritual e compaixão universal',
      pratica_recomendada: 'Sonhos guiados, trabalho com водой, meditação transcendente',
    },
    qualidade_astrologica: {
      natureza: 'Dissolução e transcendência',
      assinatura_energetica: 'Unificação, expansão dimensional e conexão com o invisível',
      dominio: 'Sonhos, intuição e dimensão espiritual',
    },
    chakra: '2º Sacro (Svadhisthana)',
    orixa: 'Oxum / Iemanjá',
    sephirah: 'Yesod (Fundação)',
  },
  528: {
    frequencia: 528,
    planeta: 'Sol',
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula regeneração celular, ativa sistema nervoso e fortalece coração',
      emocional: 'Transforma dor em amor, restaura confiança e desperta o coração',
      mental_espiritual: 'Ativa criatividade, manifestação e propósito de vida',
      pratica_recomendada: 'Cura com cristais, intenção de manifestação, trabalho com luz',
    },
    qualidade_astrologica: {
      natureza: 'Transformação e poder',
      assinatura_energetica: 'Luz, clareza e poder regenerador',
      dominio: 'Identidade, propósito e expressão criativa',
    },
    chakra: '3º Plexo Solar (Manipura)',
    orixa: 'Xangô / Logun Ede',
    sephirah: 'Netzach (Vitória)',
  },
  639: {
    frequencia: 639,
    planeta: 'Vênus',
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Equilibra sistema hormonal, melhora fertilidade e harmoniza relacionamentos',
      emocional: 'Promove amor incondicional, harmonia em parcerias e autoaceitação',
      mental_espiritual: 'Desperta appreciation pela beleza, arte e valores espirituais',
      pratica_recomendada: 'Trabalho com casais, yoga cardíaco, cura de feridas emocionais',
    },
    qualidade_astrologica: {
      natureza: 'Harmonia e conexao',
      assinatura_energetica: 'Beleza, graça e conexão interpessoal',
      dominio: 'Amor, relacionamentos e valores',
    },
    chakra: '4º Cardíaco (Anahata)',
    orixa: 'Oxóssi / Nanã Buruquá',
    sephirah: 'Tiferet (Beleza/Harmonia)',
  },
  741: {
    frequencia: 741,
    planeta: 'Mercúrio',
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Purifica garganta, melhora comunicação e desobstrui canais energéticos',
      emocional: 'Liberta medo de falar verdades e facilita expressão autêntica',
      mental_espiritual: 'Desperta eloquência, sabedoria e comunicação espiritual',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e escuta ativa',
    },
    qualidade_astrologica: {
      natureza: 'Comunicação e adaptação',
      assinatura_energetica: 'Agilidade mental, versatility e poder da palavra',
      dominio: 'Comunicação, aprendizado e conexões',
    },
    chakra: '5º Laríngeo (Vishuddha)',
    orixa: 'Iansã / Obá',
    sephirah: 'Gevurah (Julgamento/Fortaleza)',
  },
  852: {
    frequencia: 852,
    planeta: 'Júpiter',
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Expande consciência, ativa terceira vista e desperta capacidades psíquicas',
      emocional: 'Dissipa ilusões, promove visão clara e expansão espiritual',
      mental_espiritual: 'Desperta sabedoria interior, compreensão profunda e intuição pura',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho, expandir consciência',
    },
    qualidade_astrologica: {
      natureza: 'Expansão e sabedoria',
      assinatura_energetica: 'Fé, optimism e conexão com o divino',
      dominio: 'Crescimento, espiritualidade e propósito superior',
    },
    chakra: '6º Frontal (Ajna)',
    orixa: 'Oxumaré / Ossaim',
    sephirah: 'Chokmah (Sabedoria)',
  },
  963: {
    frequencia: 963,
    planeta: 'Urano',
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Ativa glândula pineal, desperta consciência cósmica e acelera evolução',
      emocional: 'Promove libertação de condicionamentos, mudança rápida e despertar',
      mental_espiritual: 'Conecta com a Fonte criadora, infinito e padrão original da criação',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura e cura dimensional',
    },
    qualidade_astrologica: {
      natureza: 'Iluminação e libertação',
      assinatura_energetica: 'Despertar, inovação e conexão com o todo',
      dominio: 'Despertar, liberdade e unidade universal',
    },
    chakra: '7º Coronário (Sahasrara)',
    orixa: 'Ori / Olokun',
    sephirah: 'Kether (Coroa)',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_PLANET_MAP);
Object.values(FREQUENCY_PLANET_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-planet mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyPlanetMapping or null if not found
 */
export function getFrequencyPlanet(frequencia: number): FrequencyPlanetMapping | null {
  return FREQUENCY_PLANET_MAP[frequencia] ?? null;
}

/**
 * Get the planet corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Planet name or null if not found
 */
export function getPlanetByFrequency(frequencia: number): Planeta | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.planeta ?? null;
}

/**
 * Get all frequencies mapped to a specific planet
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Saturno')
 * @returns Array of FrequencyPlanetMapping
 */
export function getFrequenciesByPlanet(planeta: string): FrequencyPlanetMapping[] {
  return Object.values(FREQUENCY_PLANET_MAP).filter(
    (mapping) => mapping.planeta.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Get the healing properties for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing properties object or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyPlanetMapping['propriedades_healing'] | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.propriedades_healing ?? null;
}

/**
 * Get the astrological quality for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Astrological quality object or null if not found
 */
export function getAstrologicalQualityByFrequency(frequencia: number): FrequencyPlanetMapping['qualidade_astrologica'] | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.qualidade_astrologica ?? null;
}

/**
 * Get the element associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get the chakra associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra name or null if not found
 */
export function getChakraByFrequency(frequencia: number): string | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.chakra ?? null;
}

/**
 * Get the orixá associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Orixá name or null if not found
 */
export function getOrixaByFrequency(frequencia: number): string | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.orixa ?? null;
}

/**
 * Get the sephirah associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Sephirah name or null if not found
 */
export function getSephirahByFrequency(frequencia: number): string | null {
  return FREQUENCY_PLANET_MAP[frequencia]?.sephirah ?? null;
}

/**
 * Get all planet names used in the mapping
 * @returns Array of unique planet names
 */
export function getAllPlanets(): Planeta[] {
  const planets = new Set<Planeta>();
  Object.values(FREQUENCY_PLANET_MAP).forEach((mapping) => {
    planets.add(mapping.planeta);
  });
  return Array.from(planets);
}

/**
 * Get all available frequency-planet mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyPlanets(): FrequencyPlanetMapping[] {
  return Object.values(FREQUENCY_PLANET_MAP);
}

/**
 * Get frequencies by their element association
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of FrequencyPlanetMapping
 */
export function getFrequenciesByElement(elemento: string): FrequencyPlanetMapping[] {
  return Object.values(FREQUENCY_PLANET_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Normalizes planet name to match Planeta type
 * Handles case-insensitive matching and variations
 */
function normalizePlanetName(planeta: string): Planeta | null {
  const normalized = planeta.toLowerCase().trim();
  
  const planetMap: Record<string, Planeta> = {
    sol: 'Sol',
    lua: 'Lua',
    marte: 'Marte',
    mercurio: 'Mercúrio',
    mercurius: 'Mercúrio',
    jupiter: 'Júpiter',
    júpiter: 'Júpiter',
    venus: 'Vênus',
    vênus: 'Vênus',
    saturno: 'Saturno',
    urano: 'Urano',
    netuno: 'Netuno',
    plutão: 'Plutão',
  };
  
  return planetMap[normalized] ?? null;
}

/**
 * Get planet frequency by planet name
 * @param planeta - Planet name
 * @returns Frequency in Hz or null if not found
 */
export function getPlanetFrequency(planeta: string): number | null {
  const normalized = normalizePlanetName(planeta);
  if (!normalized) return null;
  
  const mapping = Object.values(FREQUENCY_PLANET_MAP).find(
    (m) => m.planeta === normalized
  );
  
  return mapping?.frequencia ?? null;
}