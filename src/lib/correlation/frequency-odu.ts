/**
 * Frequency-Odú Ifá Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to Odú Ifá (Merindilogun)
 * Source: Cabala dos Caminhos spiritual system
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Solfeggio frequency and its Odú Ifá correspondence
 */
export interface FrequencyOduMapping {
  /** Frequency in Hz */
  frequencia: number;
  /** Associated Odu name */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Primary element name (Portuguese) */
  elemento: Elemento;
  /** Elemental qualities and characteristics */
  qualidade_energetica: {
    /** Element's fundamental nature */
    natureza: string;
    /** Temperature/thermal quality */
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    /** Moisture level */
    umidade: 'Úmido' | 'Seco' | 'Neutro';
    /** Primary action in the body */
    acao_primaria: string;
    /** Direction of energy flow */
    fluxo_energetico: string;
  };
  /** Healing applications for this frequency-odu combination */
  aplicacao_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice type */
    pratica_recomendada: string;
  };
  /** Orixá correspondent */
  orixa: string;
  /** Chakra correspondent */
  chakra: string;
  /** Sephirah correspondence from Cabala */
  sephirah: string;
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their Odú Ifá correspondences.
 * Based on the Cabala dos Caminhos system data.
 * Each frequency carries the vibrational signature of its corresponding Odu.
 */
export const FREQUENCY_ODU_MAP: Record<number, FrequencyOduMapping> = {
  396: {
    frequencia: 396,
    odu: 'Okaran',
    numero: 1,
    elemento: 'Terra',
    qualidade_energetica: {
      natureza: 'Ancoramento e início de ciclos',
      temperatura: 'Frio',
      umidade: 'Seco',
      acao_primaria: 'Fortalecimento e abertura de caminhos',
      fluxo_energetico: 'Descendente e centrípeto',
    },
    aplicacao_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação para novos inícios',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral, rituais de abertura de caminhos',
    },
    orixa: 'Omolu',
    chakra: '1º Básico (Muladhara)',
    sephirah: 'Malkuth (Reino)',
  },
  417: {
    frequencia: 417,
    odu: 'Ofun',
    numero: 10,
    elemento: 'Água',
    qualidade_energetica: {
      natureza: 'Fluxo e transformação',
      temperatura: 'Frio',
      umidade: 'Úmido',
      acao_primaria: 'Purificação e fluidez',
      fluxo_energetico: 'Ondulante e expansivo',
    },
    aplicacao_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação interior',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional, banhos ritualísticos',
    },
    orixa: 'Iemanjá',
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Yesod (Fundação)',
  },
  528: {
    frequencia: 528,
    odu: 'Ejilsebora',
    numero: 12,
    elemento: 'Fogo',
    qualidade_energetica: {
      natureza: 'Transformação e poder purificador',
      temperatura: 'Quente',
      umidade: 'Seco',
      acao_primaria: 'Ativação e transmutação',
      fluxo_energetico: 'Ascendente e radiante',
    },
    aplicacao_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação de desejos',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada, rituais de fogo',
    },
    orixa: 'Xangô',
    chakra: '3º Plexo Solar (Manipura)',
    sephirah: 'Tiphereth (Beleza)',
  },
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino e sabedoria superior',
      pratica_recomendada: 'Rituais de reconciliação, trabalho com casal, cura de relacionamentos',
    },
      natureza: 'Conexão e harmonia',
      temperatura: 'Neutro',
      umidade: 'Seco',
      acao_primaria: 'Harmonização e expansão',
      fluxo_energetico: 'Bidirecional e difuso',
    },
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino e sabedoria superior',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos, orações de paz',
    },
    orixa: 'Oxumaré',
    chakra: '5º Laríngeo (Vishuddha)',
    sephirah: 'Hod (Glória)',
  },
  741: {
    frequencia: 741,
    odu: 'Ossá',
    numero: 9,
    elemento: 'Ar',
    qualidade_energetica: {
      natureza: 'Expressão e verdade',
      temperatura: 'Quente',
      umidade: 'Seco',
      acao_primaria: 'Purificação e expressão',
      fluxo_energetico: 'Ascendente e libertador',
    },
    aplicacao_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som, rituais de transformação rápida',
    },
    orixa: 'Oxumaré',
    chakra: '5º Laríngeo (Vishuddha)',
    sephirah: 'Gevurah (Julgamento/Fortaleza)',
  },
  852: {
    frequencia: 852,
    odu: 'Odi',
    numero: 7,
    elemento: 'Éter',
    qualidade_energetica: {
      natureza: 'Intuição e visão divina',
      temperatura: 'Neutro',
      umidade: 'Neutro',
      acao_primaria: 'Iluminação e desconstrução de ilusões',
      fluxo_energetico: 'Expansivo e unificador',
    },
    aplicacao_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho, revelação de mistérios',
    },
    orixa: 'Omolu',
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Chokmah (Sabedoria)',
  },
  963: {
    frequencia: 963,
    odu: 'Alafia',
    numero: 16,
    elemento: 'Éter',
    qualidade_energetica: {
      natureza: 'Unidade e conexão universal',
      temperatura: 'Neutro',
      umidade: 'Neutro',
      acao_primaria: 'Sagramento e transcendência',
      fluxo_energetico: 'Centrípeto e ascendente simultâneo',
    },
    aplicacao_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura, paz absoluta',
    },
    orixa: 'Oxumaré',
    chakra: '7º Coronário (Sahasrara)',
    sephirah: 'Kether (Coroa)',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_ODU_MAP);
Object.values(FREQUENCY_ODU_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-odu mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyOduMapping or null if not found
 */
export function getFrequencyOdu(frequencia: number): FrequencyOduMapping | null {
  return FREQUENCY_ODU_MAP[frequencia] ?? null;
}

/**
 * Get the Odu corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Odu name or null if not found
 */
export function getOduByFrequency(frequencia: number): string | null {
  return FREQUENCY_ODU_MAP[frequencia]?.odu ?? null;
}

/**
 * Get the Odu number for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Odu number or null if not found
 */
export function getOduNumberByFrequency(frequencia: number): number | null {
  return FREQUENCY_ODU_MAP[frequencia]?.numero ?? null;
}

/**
 * Get all frequencies mapped to a specific Odu
 * @param odu - Odu name (e.g., 'Okaran', 'Ofun', 'Ejilsebora', 'Alafia', 'Ossá', 'Odi')
 * @returns Array of FrequencyOduMapping
 */
export function getFrequenciesByOdu(odu: string): FrequencyOduMapping[] {
  return Object.values(FREQUENCY_ODU_MAP).filter((mapping) => mapping.odu === odu);
}

/**
 * Get the healing application for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing application object or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyOduMapping['aplicacao_healing'] | null {
  return FREQUENCY_ODU_MAP[frequencia]?.aplicacao_healing ?? null;
}

/**
 * Get the energy quality for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Energy quality object or null if not found
 */
export function getEnergyQualityByFrequency(frequencia: number): FrequencyOduMapping['qualidade_energetica'] | null {
  return FREQUENCY_ODU_MAP[frequencia]?.qualidade_energetica ?? null;
}

/**
 * Get the orixá associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Orixá name or null if not found
 */
export function getOrixaByFrequency(frequencia: number): string | null {
  return FREQUENCY_ODU_MAP[frequencia]?.orixa ?? null;
}

/**
 * Get the sephirah associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Sephirah name or null if not found
 */
export function getSephirahByFrequency(frequencia: number): string | null {
  return FREQUENCY_ODU_MAP[frequencia]?.sephirah ?? null;
}

/**
 * Get the chakra associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra name or null if not found
 */
export function getChakraByFrequency(frequencia: number): string | null {
  return FREQUENCY_ODU_MAP[frequencia]?.chakra ?? null;
}

/**
 * Get the element associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): Elemento | null {
  return FREQUENCY_ODU_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get all Odu names used in the mapping
 * @returns Array of unique Odu names
 */
export function getAllOduNames(): string[] {
  const odus = new Set(Object.values(FREQUENCY_ODU_MAP).map((m) => m.odu));
  return Array.from(odus).sort();
}

/**
 * Get all available frequency-odu mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyOdus(): FrequencyOduMapping[] {
  return Object.values(FREQUENCY_ODU_MAP);
}

/**
 * Get frequencies by their energy temperature
 * @param temperatura - Temperature quality ('Quente', 'Frio', 'Neutro')
 * @returns Array of FrequencyOduMapping
 */
export function getFrequenciesByTemperature(temperatura: string): FrequencyOduMapping[] {
  return Object.values(FREQUENCY_ODU_MAP).filter(
    (mapping) => mapping.qualidade_energetica.temperatura === temperatura
  );
}

/**
 * Get frequencies by their moisture level
 * @param umidade - Moisture level ('Úmido', 'Seco', 'Neutro')
 * @returns Array of FrequencyOduMapping
 */
export function getFrequenciesByMoisture(umidade: string): FrequencyOduMapping[] {
  return Object.values(FREQUENCY_ODU_MAP).filter(
    (mapping) => mapping.qualidade_energetica.umidade === umidade
  );
}

/**
 * Get frequencies by element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of FrequencyOduMapping
 */
export function getFrequenciesByElement(elemento: string): FrequencyOduMapping[] {
  return Object.values(FREQUENCY_ODU_MAP).filter((mapping) => mapping.elemento === elemento);
}

/**
 * Get the Odu-frequency mapping for a given Odu
 * @param odu - Odu name
 * @returns The frequency mapping or null if not found
 */
export function getOduFrequency(odu: string): FrequencyOduMapping | null {
  const found = Object.values(FREQUENCY_ODU_MAP).find((mapping) => mapping.odu === odu);
  return found ?? null;
}

export default {
  getFrequencyOdu,
  getOduByFrequency,
  getOduNumberByFrequency,
  getFrequenciesByOdu,
  getHealingByFrequency,
  getEnergyQualityByFrequency,
  getOrixaByFrequency,
  getSephirahByFrequency,
  getChakraByFrequency,
  getElementByFrequency,
  getAllOduNames,
  getAllFrequencyOdus,
  getFrequenciesByTemperature,
  getFrequenciesByMoisture,
  getFrequenciesByElement,
  getOduFrequency,
  FREQUENCY_ODU_MAP,
  SOLFEGGIO_FREQUENCIES,
};
