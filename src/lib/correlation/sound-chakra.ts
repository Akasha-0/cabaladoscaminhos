/**
 * Sound-Chakra Spiritual Correlation Module
 * Maps the 7 Solfeggio frequencies/sounds to their corresponding chakras,
 * including healing properties and spiritual correlations.
 *
 * Based on Cabala dos Caminhos hermetic principles and IDEIA.md system data.
 */

import type { ChakraName } from './chakra-element';

/**
 * Chakra-Sound healing properties breakdown
 */
export interface SoundChakraHealing {
  /** Physical healing focus */
  fisico: string;
  /** Emotional healing focus */
  emocional: string;
  /** Mental/spiritual healing focus */
  mental_espiritual: string;
  /** Recommended practice for this sound/chakra */
  pratica_recomendada: string;
}

/**
 * Complete sound-chakra correlation mapping
 */
export interface SoundChakra {
  /** Seed syllable / Solfeggio sound identifier */
  som: string;
  /** Frequency in Hertz */
  frequencia: number;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Chakra name in Portuguese */
  chakra: string;
  /** Sanskrit chakra name */
  chakra_sanskrit: ChakraName;
  /** Healing properties breakdown */
  healing: SoundChakraHealing;
}

/**
 * Map of Solfeggio frequencies/sounds to their corresponding chakra mappings.
 * Keyed by lowercase sound identifier for fast lookup.
 */
const SOUND_CHAKRA_MAP: Record<string, SoundChakra> = {
  lam: {
    som: 'LAM',
    frequencia: 396,
    chakra_numero: 1,
    chakra: '1º Básico',
    chakra_sanskrit: 'Muladhara',
    healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais. Estabiliza o sistema nervoso e ancoragem física.',
      emocional: 'Dissolve medos de sobrevivência, insegurança e escassez. Promove confiança básica e firmeza emocional.',
      mental_espiritual: 'Promove clareza mental, foco, determinação e conexão com a ancestralidade.',
      pratica_recomendada: 'Meditação em grupo com batimentos graves, trabalho ancestral, respiração quadrática.',
    },
  },
  vam: {
    som: 'VAM',
    frequencia: 417,
    chakra_numero: 2,
    chakra: '2º Sacro',
    chakra_sanskrit: 'Svadhisthana',
    healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular. Favorece saúde reprodutiva e vitalidade.',
      emocional: 'Libera traumas emocionais e padrões do passado. Transforma mágoas em fluidez e aceitação.',
      mental_espiritual: 'Facilita adaptação, flexibilidade, renovação criativa e abertura para novas possibilidades.',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional, práticas aquáticas e dança fluída.',
    },
  },
  ram: {
    som: 'RAM',
    frequencia: 528,
    chakra_numero: 3,
    chakra: '3º Plexo Solar',
    chakra_sanskrit: 'Manipura',
    healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital. Ativa o fogo digestivo e energia circulatória.',
      emocional: 'Transforma negatividade em compaixão. Dissolve vergonha, culpa e medo de se afirmar.',
      mental_espiritual: 'Ativa criatividade, intuição e poder de manifestação. Fortalece vontade e propósito.',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada, power yoga, pranayama kapalabhati.',
    },
  },
  yam: {
    som: 'YAM',
    frequencia: 639,
    chakra_numero: 4,
    chakra: '4º Cardíaco',
    chakra_sanskrit: 'Anahata',
    healing: {
      fisico: 'Equilibra sistema circulatório, coração e pulmões. Harmoniza pressão arterial e ritmo cardíaco.',
      emocional: 'Promove perdão, amor próprio e compaixão universal. Liberta mágoas e feridas emocionais.',
      mental_espiritual: 'Abre canais de comunicação com o divino. Integra razão e emoção em harmonia.',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos, yoga cardíaco, práticas de compaixão.',
    },
  },
  ham: {
    som: 'HAM',
    frequencia: 741,
    chakra_numero: 5,
    chakra: '5º Laríngeo',
    chakra_sanskrit: 'Vishuddha',
    healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias. Equilibra tireoide e glândulas paratireoides.',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente. Desbloqueia criatividade reprimida.',
      mental_espiritual: 'Desperta sabedoria interior, expressão criativa e comunicação com a alma.',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som, cantarolas, práticas de canto gregoriano.',
    },
  },
  om: {
    som: 'OM',
    frequencia: 852,
    chakra_numero: 6,
    chakra: '6º Frontal',
    chakra_sanskrit: 'Ajna',
    healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central. Harmoniza hemisférios cerebrais.',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade. Promove paz interior e objetividade.',
      mental_espiritual: 'Desperta capacidades psíquicas, consciência expandida e percepção além do ego.',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho, visualização criativa, Trataka.',
    },
  },
  aum: {
    som: 'AUM',
    frequencia: 963,
    chakra_numero: 7,
    chakra: '7º Coronário',
    chakra_sanskrit: 'Sahasrara',
    healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular. Integra sistema nervoso e consciência.',
      emocional: 'Promove paz profunda, unidade com tudo existente e soltura de identificações limitadas.',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito. Desperta consciência transcendental.',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura, samadhi, sahaja.',
    },
  },
};

/**
 * Lookup table for direct chakra-number to SoundChakra
 */
const CHAKRA_NUMERO_MAP: Record<number, SoundChakra> = {
  1: SOUND_CHAKRA_MAP.lam,
  2: SOUND_CHAKRA_MAP.vam,
  3: SOUND_CHAKRA_MAP.ram,
  4: SOUND_CHAKRA_MAP.yam,
  5: SOUND_CHAKRA_MAP.ham,
  6: SOUND_CHAKRA_MAP.om,
  7: SOUND_CHAKRA_MAP.aum,
};

/**
 * Normalizes input string for sound identifier lookup.
 * Removes accents and normalizes case.
 */
function normalizeSound(som: string): string {
  return som
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalizes chakra identifier for lookup.
 */
function normalizeChakra(chakra: string): string {
  const chakraMap: Record<string, string> = {
    muladhara: '1',
    svadhisthana: '2',
    manipura: '3',
    anahata: '4',
    vishuddha: '5',
    ajna: '6',
    sahasrara: '7',
    '1º básico': '1',
    '2º sacro': '2',
    '3º plexo solar': '3',
    '4º cardíaco': '4',
    '5º laríngeo': '5',
    '6º frontal': '6',
    '7º coronário': '7',
    // also accept without accents and ordinal marks
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
  };
  const key = chakra.toLowerCase().trim();
  return chakraMap[key] ?? chakra;
}

/**
 * Retrieves the complete sound-chakra mapping for a given sound/mantra.
 * @param som - Sound identifier (e.g., "LAM", "OM", "AUM") or any case/variant
 * @returns SoundChakra mapping or null if not found
 */
export function getSoundChakra(som: string): SoundChakra | null {
  if (!som) return null;
  const normalized = normalizeSound(som);
  return SOUND_CHAKRA_MAP[normalized] ?? null;
}

/**
 * Retrieves the complete sound-chakra mapping for a given chakra.
 * @param chakra - Chakra identifier (name, number, or Sanskrit name)
 * @returns SoundChakra mapping or null if not found
 */
export function getChakraSound(chakra: string): SoundChakra | null {
  if (!chakra) return null;
  const normalized = normalizeChakra(chakra);
  // Try as chakra number first
  if (/^[1-7]$/.test(normalized)) {
    return CHAKRA_NUMERO_MAP[parseInt(normalized, 10)] ?? null;
  }
  // Try as Sanskrit name via normalizeChakra result
  if (/^[1-7]$/.test(normalized)) {
    return CHAKRA_NUMERO_MAP[parseInt(normalized, 10)] ?? null;
  }
  // Fallback: try matching by chakra name
  const found = Object.values(SOUND_CHAKRA_MAP).find(
    m => m.chakra.toLowerCase() === normalized || m.chakra_sanskrit.toLowerCase() === normalized
  );
  return found ?? null;
}

/**
 * Returns all sound-chakra mappings.
 * @returns Array of all SoundChakra objects sorted by chakra number
 */
export function getAllSoundChakras(): SoundChakra[] {
  return Object.values(SOUND_CHAKRA_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}
