/**
 * Frequency-Orixá Correlation Module
 * Based on Solfeggio frequencies mapped to Orixás of Candomblé/Umbanda
 * Source: IDEIA.md - Cabala dos Caminhos framework
 * Each frequency carries the vibrational signature of an Orixá
 */

/**
 * Represents the correlation between a Solfeggio frequency and its Orixá correspondence
 */
export interface FrequencyOrixa {
  /** Frequency in Hz */
  frequencia: number;
  /** Primary Orixá name */
  orixa: string;
  /** Secondary Orixá (if applicable) */
  orixa_secundario?: string;
  /** Element associated with this frequency-Orixá */
  elemento: string;
  /** Day of week associated */
  dia_semana: string;
  /** Color correspondence */
  cor: string;
  /** Ritual tool or offering */
  ferramenta_ritual: string;
  /** Primary healing application */
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
  /** Chakra correspondence */
  chakra: string;
  /** Sephirah correspondence from Kabbalah */
  sephirah: string;
  /** Yoruba affirmation or prayer */
  oracao_yoruba: string;
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their Orixá correspondences.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Each frequency carries the vibrational signature of its corresponding Orixá.
 */
export const FREQUENCY_ORIXA_MAP: Record<number, FrequencyOrixa> = {
  396: {
    frequencia: 396,
    orixa: 'Oxalufã',
    orixa_secundario: 'Omulu',
    elemento: 'Terra',
    dia_semana: 'Segunda-feira',
    cor: 'Branco',
    ferramenta_ritual: 'Al Guidanceê (cabaça)',
    aplicacao_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
    chakra: '1º Básico (Muladhara)',
    sephirah: 'Malchut (Reino)',
    oracao_yoruba: 'Oxalufã / Obaluayê, dá-me firmeza e proteção',
  },
  417: {
    frequencia: 417,
    orixa: 'Oxum',
    orixa_secundario: 'Iemanjá',
    elemento: 'Água',
    dia_semana: 'Sábado',
    cor: 'Amarelo-dourado',
    ferramenta_ritual: 'Espelho, flores amarelas, mel',
    aplicacao_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
    chakra: '2º Sacro (Svadhisthana)',
    sephirah: 'Yesod (Fundação)',
    oracao_yoruba: 'Oxum, abre as águas da prosperidade em minha vida',
  },
  528: {
    frequencia: 528,
    orixa: 'Xangô',
    orixa_secundario: 'Logun Ede',
    elemento: 'Fogo',
    dia_semana: 'Quarta-feira',
    cor: 'Vermelho',
    ferramenta_ritual: 'Oxê ( Machado de dois Bost), pedras de raio',
    aplicacao_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
    chakra: '3º Plexo Solar (Manipura)',
    sephirah: 'Netzach (Vitória)',
    oracao_yoruba: 'Xangô, concede-me a força da justiça e do equilíbrio',
  },
  639: {
    frequencia: 639,
    orixa: 'Oxóssi',
    orixa_secundario: 'Nanã Buruquá',
    elemento: 'Ar',
    dia_semana: 'Terça-feira',
    cor: 'Verde',
    ferramenta_ritual: 'Arco e flecha, cabaça, ervas de mato',
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
    chakra: '4º Cardíaco (Anahata)',
    sephirah: 'Tiferet (Beleza/Harmonia)',
    oracao_yoruba: 'Oxóssi, guia-me pela trilha da sabedoria',
  },
  741: {
    frequencia: 741,
    orixa: 'Iansã',
    orixa_secundario: 'Obá',
    elemento: 'Ar',
    dia_semana: 'Quarta-feira',
    cor: 'Laranja',
    ferramenta_ritual: 'Eruexim (chicote), espada, fogo',
    aplicacao_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
    chakra: '5º Laríngeo (Vishuddha)',
    sephirah: 'Gevurah (Julgamento/Fortaleza)',
    oracao_yoruba: 'Iansã, dá-me coragem para transformação',
  },
  852: {
    frequencia: 852,
    orixa: 'Oxumaré',
    orixa_secundario: 'Ossaim',
    elemento: 'Éter',
    dia_semana: 'Domingo',
    cor: 'Arco-íris',
    ferramenta_ritual: 'Cobra de madeira, jimboa (serpente)',
    aplicacao_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
    chakra: '6º Frontal (Ajna)',
    sephirah: 'Chokmah (Sabedoria)',
    oracao_yoruba: 'Oxumaré, completa o ciclo da minha transformação',
  },
  963: {
    frequencia: 963,
    orixa: 'Ori',
    orixa_secundario: 'Olokun',
    elemento: 'Éter',
    dia_semana: 'Domingo',
    cor: 'Branco-dourado',
    ferramenta_ritual: 'Pranche (prancha), coco, água do mar',
    aplicacao_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
    chakra: '7º Coronário (Sahasrara)',
    sephirah: 'Kether (Coroa)',
    oracao_yoruba: 'Ori mi, que minha cabeça seja iluminada pela verdade',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_ORIXA_MAP);
Object.values(FREQUENCY_ORIXA_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-Orixá mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyOrixa mapping or null if not found
 */
export function getFrequencyOrixa(frequencia: number): FrequencyOrixa | null {
  return FREQUENCY_ORIXA_MAP[frequencia] ?? null;
}

/**
 * Get the Orixá corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Orixá name or null if not found
 */
export function getOrixaFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.orixa ?? null;
}

/**
 * Get the element corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get all frequencies mapped to a specific Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Array of FrequencyOrixa mappings
 */
export function getFrequenciesByOrixa(orixa: string): FrequencyOrixa[] {
  const normalizedOrixa = orixa.trim().toLowerCase();
  return Object.values(FREQUENCY_ORIXA_MAP).filter(
    (mapping) =>
      mapping.orixa.toLowerCase() === normalizedOrixa ||
      mapping.orixa_secundario?.toLowerCase() === normalizedOrixa
  );
}

/**
 * Get all frequencies mapped to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of FrequencyOrixa mappings
 */
export function getFrequenciesByElement(elemento: string): FrequencyOrixa[] {
  const normalizedElemento = elemento.trim().toLowerCase();
  const elementMap: Record<string, string> = {
    'fogo': 'Fogo',
    'água': 'Água',
    'agua': 'Água',
    'ar': 'Ar',
    'terra': 'Terra',
    'éter': 'Éter',
    'eter': 'Éter',
  };
  const normalized = elementMap[normalizedElemento];
  if (!normalized) return [];
  return Object.values(FREQUENCY_ORIXA_MAP).filter(
    (mapping) => mapping.elemento === normalized
  );
}

/**
 * Get all frequencies mapped to a specific day
 * @param dia - Day of week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of FrequencyOrixa mappings
 */
export function getFrequenciesByDay(dia: string): FrequencyOrixa[] {
  return Object.values(FREQUENCY_ORIXA_MAP).filter(
    (mapping) => mapping.dia_semana.toLowerCase() === dia.toLowerCase()
  );
}

/**
 * Get the healing application for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing application object or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyOrixa['aplicacao_healing'] | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.aplicacao_healing ?? null;
}

/**
 * Get the color for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Color string or null if not found
 */
export function getColorByFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.cor ?? null;
}

/**
 * Get the chakra for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra name or null if not found
 */
export function getChakraByFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.chakra ?? null;
}

/**
 * Get the sephirah for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Sephirah name or null if not found
 */
export function getSephirahByFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.sephirah ?? null;
}

/**
 * Get the Yoruba prayer for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Prayer string or null if not found
 */
export function getOrayoByFrequency(frequencia: number): string | null {
  return FREQUENCY_ORIXA_MAP[frequencia]?.oracao_yoruba ?? null;
}

/**
 * Get all registered Orixá names
 * @returns Array of unique Orixá names
 */
export function getAllOrixas(): string[] {
  const orixas = new Set<string>();
  for (const mapping of Object.values(FREQUENCY_ORIXA_MAP)) {
    orixas.add(mapping.orixa);
    if (mapping.orixa_secundario) {
      orixas.add(mapping.orixa_secundario);
    }
  }
  return Array.from(orixas).sort();
}

/**
 * Get all available frequency-Orixá mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyOrixas(): FrequencyOrixa[] {
  return Object.values(FREQUENCY_ORIXA_MAP);
}

/**
 * Get all registered element names
 * @returns Array of unique element names
 */
export function getAllElements(): string[] {
  const elements = new Set<string>();
  for (const mapping of Object.values(FREQUENCY_ORIXA_MAP)) {
    elements.add(mapping.elemento);
  }
  return Array.from(elements).sort();
}

/**
 * Get all registered days of the week
 * @returns Array of unique day names
 */
export function getAllDays(): string[] {
  const days = new Set<string>();
  for (const mapping of Object.values(FREQUENCY_ORIXA_MAP)) {
    days.add(mapping.dia_semana);
  }
  return Array.from(days).sort();
}
