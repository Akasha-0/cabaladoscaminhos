/**
 * Orixá-Frequency Correlation Module
 * Based on Orixás of Candomblé/Umbanda mapped to Solfeggio frequencies
 * Source: IDEIA.md - Cabala dos Caminhos framework
 * Maps each Orixá to their corresponding vibrational frequency signature
 */

import type { FrequencyOrixa } from './frequency-orixa';

/**
 * Represents the correlation between an Orixá and its Solfeggio frequency
 */
export interface OrixaFrequency {
  /** Primary Orixá name */
  orixa: string;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** Element associated with this Orixá-frequency */
  elemento: string;
  /** Chakra correspondence */
  chakra: string;
  /** Day of week associated */
  dia_semana: string;
  /** Color correspondence */
  cor: string;
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
}

/**
 * Complete mapping of Orixás to their Solfeggio frequency correspondences.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Derived from the inverse of FREQUENCY_ORIXA_MAP.
 */
export const ORIXA_FREQUENCY_MAP: Record<string, OrixaFrequency> = {
  Oxalufã: {
    orixa: 'Oxalufã',
    frequencia: 396,
    elemento: 'Terra',
    chakra: '1º Básico (Muladhara)',
    dia_semana: 'Segunda-feira',
    cor: 'Branco',
    aplicacao_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
  },
  Omulu: {
    orixa: 'Omulu',
    frequencia: 396,
    elemento: 'Terra',
    chakra: '1º Básico (Muladhara)',
    dia_semana: 'Segunda-feira',
    cor: 'Branco',
    aplicacao_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
  },
  Oxum: {
    orixa: 'Oxum',
    frequencia: 417,
    elemento: 'Água',
    chakra: '2º Sacro (Svadhisthana)',
    dia_semana: 'Sábado',
    cor: 'Amarelo-dourado',
    aplicacao_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
  },
  Iemanjá: {
    orixa: 'Iemanjá',
    frequencia: 417,
    elemento: 'Água',
    chakra: '2º Sacro (Svadhisthana)',
    dia_semana: 'Sábado',
    cor: 'Amarelo-dourado',
    aplicacao_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
  },
  Xangô: {
    orixa: 'Xangô',
    frequencia: 528,
    elemento: 'Fogo',
    chakra: '3º Plexo Solar (Manipura)',
    dia_semana: 'Quarta-feira',
    cor: 'Vermelho',
    aplicacao_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
  },
  'Logun Ede': {
    orixa: 'Logun Ede',
    frequencia: 528,
    elemento: 'Fogo',
    chakra: '3º Plexo Solar (Manipura)',
    dia_semana: 'Quarta-feira',
    cor: 'Vermelho',
    aplicacao_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
  },
  Oxóssi: {
    orixa: 'Oxóssi',
    frequencia: 639,
    elemento: 'Ar',
    chakra: '4º Cardíaco (Anahata)',
    dia_semana: 'Terça-feira',
    cor: 'Verde',
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
  },
  'Nanã Buruquá': {
    orixa: 'Nanã Buruquá',
    frequencia: 639,
    elemento: 'Ar',
    chakra: '4º Cardíaco (Anahata)',
    dia_semana: 'Terça-feira',
    cor: 'Verde',
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
  },
  Iansã: {
    orixa: 'Iansã',
    frequencia: 741,
    elemento: 'Ar',
    chakra: '5º Laríngeo (Vishuddha)',
    dia_semana: 'Quarta-feira',
    cor: 'Laranja',
    aplicacao_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
  },
  Obá: {
    orixa: 'Obá',
    frequencia: 741,
    elemento: 'Ar',
    chakra: '5º Laríngeo (Vishuddha)',
    dia_semana: 'Quarta-feira',
    cor: 'Laranja',
    aplicacao_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
  },
  Oxumaré: {
    orixa: 'Oxumaré',
    frequencia: 852,
    elemento: 'Éter',
    chakra: '6º Frontal (Ajna)',
    dia_semana: 'Domingo',
    cor: 'Arco-íris',
    aplicacao_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
  },
  Ossaim: {
    orixa: 'Ossaim',
    frequencia: 852,
    elemento: 'Éter',
    chakra: '6º Frontal (Ajna)',
    dia_semana: 'Domingo',
    cor: 'Arco-íris',
    aplicacao_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
  },
  Ori: {
    orixa: 'Ori',
    frequencia: 963,
    elemento: 'Éter',
    chakra: '7º Coronário (Sahasrara)',
    dia_semana: 'Domingo',
    cor: 'Branco-dourado',
    aplicacao_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
  },
  Olokun: {
    orixa: 'Olokun',
    frequencia: 963,
    elemento: 'Éter',
    chakra: '7º Coronário (Sahasrara)',
    dia_semana: 'Domingo',
    cor: 'Branco-dourado',
    aplicacao_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(ORIXA_FREQUENCY_MAP);
Object.values(ORIXA_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All Solfeggio frequencies in Hz
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * All unique Orixás in the mapping
 */
export const ALL_ORIXAS = Object.keys(ORIXA_FREQUENCY_MAP);

/**
 * Get the Orixá-frequency mapping for a given Orixá name
 * @param orixa - Orixá name (case-insensitive)
 * @returns OrixaFrequency mapping or null if not found
 */
export function getOrixaFrequency(orixa: string): OrixaFrequency | null {
  const normalized = normalizeOrixaKey(orixa);
  return ORIXA_FREQUENCY_MAP[normalized] ?? null;
}

/**
 * Get the frequency corresponding to an Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyOrixa(orixa: string): number | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.frequencia ?? null;
}

/**
 * Get all Orixá-frequency mappings
 * @returns Array of all correlation mappings
 */
export function getAllOrixaFrequencies(): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP);
}

/**
 * Get the element for a given Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Element name or null if not found
 */
export function getElementByOrixa(orixa: string): string | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.elemento ?? null;
}

/**
 * Get the chakra for a given Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Chakra name or null if not found
 */
export function getChakraByOrixa(orixa: string): string | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.chakra ?? null;
}

/**
 * Get the day of week for a given Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Day name or null if not found
 */
export function getDayByOrixa(orixa: string): string | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.dia_semana ?? null;
}

/**
 * Get the color for a given Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Color or null if not found
 */
export function getColorByOrixa(orixa: string): string | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.cor ?? null;
}

/**
 * Get the healing application for a given Orixá
 * @param orixa - Orixá name (case-insensitive)
 * @returns Healing application object or null if not found
 */
export function getHealingByOrixa(orixa: string): OrixaFrequency['aplicacao_healing'] | null {
  return ORIXA_FREQUENCY_MAP[normalizeOrixaKey(orixa)]?.aplicacao_healing ?? null;
}

/**
 * Get all Orixás that correspond to a specific frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Array of OrixaFrequency mappings
 */
export function getOrixasByFrequency(frequencia: number): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    (mapping) => mapping.frequencia === frequencia
  );
}

/**
 * Get all Orixás that correspond to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of OrixaFrequency mappings
 */
export function getOrixasByElement(elemento: string): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get all Orixás associated with a specific day of the week
 * @param dia - Day of week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of OrixaFrequency mappings
 */
export function getOrixasByDay(dia: string): OrixaFrequency[] {
  return Object.values(ORIXA_FREQUENCY_MAP).filter(
    (mapping) => mapping.dia_semana.toLowerCase() === dia.toLowerCase()
  );
}

/**
 * Get all unique elements in the mapping
 * @returns Array of unique element names
 */
export function getAllElements(): string[] {
  const elements = new Set(Object.values(ORIXA_FREQUENCY_MAP).map((m) => m.elemento));
  return Array.from(elements);
}

/**
 * Normalize Orixá name for lookup
 * Handles case-insensitivity and common variations
 */
function normalizeOrixaKey(orixa: string): string {
  const normalized = orixa.trim();
  // Direct match first
  if (ORIXA_FREQUENCY_MAP[normalized]) {
    return normalized;
  }
  // Case-insensitive match
  const lower = normalized.toLowerCase();
  const match = Object.keys(ORIXA_FREQUENCY_MAP).find(
    (key) => key.toLowerCase() === lower
  );
  return match ?? normalized;
}