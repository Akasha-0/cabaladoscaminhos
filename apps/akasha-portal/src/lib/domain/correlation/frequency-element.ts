/**
 * Frequency-Element Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to the five elements
 * Source: IDEIA.md - Matriz de Geometria Sagrada and Cabala dos Caminhos system
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Solfeggio frequency and its elemental correspondence
 */
export interface FrequencyElementMapping {
  /** Frequency in Hz */
  frequencia: number;
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
  /** Healing applications for this frequency-element combination */
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
  /** Chakra correspondent (from frequency-chakra correlation) */
  chakra: string;
  /** Orixá with elemental affinity */
  orixa: string;
  /** Sephirah correspondence from Cabala */
  sephirah: string;
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their elemental correspondences.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Each frequency carries the vibrational signature of its corresponding element.
 */
export const FREQUENCY_ELEMENT_MAP: Record<number, FrequencyElementMapping> = {
  396: {
    frequencia: 396,
    elemento: 'Terra',
    qualidade_energetica: {
      natureza: 'Ancoramento e estabilidade',
      temperatura: 'Frio',
      umidade: 'Seco',
      acao_primaria: 'Fortalecimento e segurança',
      fluxo_energetico: 'Descendente e centrípeto',
    },
    aplicacao_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
    chakra: '1º Básico (Muladhara)',
    orixa: 'Oxalufã / Obaluayê',
    sephirah: 'Malchut (Reino)',
  },
  417: {
    frequencia: 417,
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
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
    chakra: '2º Sacro (Svadhisthana)',
    orixa: 'Oxum / Iemanjá',
    sephirah: 'Yesod (Fundação)',
  },
  528: {
    frequencia: 528,
    elemento: 'Fogo',
    qualidade_energetica: {
      natureza: 'Transformação e poder',
      temperatura: 'Quente',
      umidade: 'Seco',
      acao_primaria: 'Ativação e transmutação',
      fluxo_energetico: 'Ascendente e radiante',
    },
    aplicacao_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
    chakra: '3º Plexo Solar (Manipura)',
    orixa: 'Xangô / Logun Ede',
    sephirah: 'Netzach (Vitória)',
  },
  639: {
    frequencia: 639,
    elemento: 'Ar',
    qualidade_energetica: {
      natureza: 'Conexão e comunicação',
      temperatura: 'Neutro',
      umidade: 'Úmido',
      acao_primaria: 'Harmonização e expansão',
      fluxo_energetico: 'Bidirecional e difuso',
    },
    aplicacao_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
    chakra: '4º Cardíaco (Anahata)',
    orixa: 'Oxóssi / Nanã Buruquá',
    sephirah: 'Tiferet (Beleza/Harmonia)',
  },
  741: {
    frequencia: 741,
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
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
    chakra: '5º Laríngeo (Vishuddha)',
    orixa: 'Iansã / Obá',
    sephirah: 'Gevurah (Julgamento/Fortaleza)',
  },
  852: {
    frequencia: 852,
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
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
    chakra: '6º Frontal (Ajna)',
    orixa: 'Oxumaré / Ossaim',
    sephirah: 'Chokmah (Sabedoria)',
  },
  963: {
    frequencia: 963,
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
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura',
    },
    chakra: '7º Coronário (Sahasrara)',
    orixa: 'Ori / Olokun',
    sephirah: 'Kether (Coroa)',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_ELEMENT_MAP);
Object.values(FREQUENCY_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-element mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyElementMapping or null if not found
 */
export function getFrequencyElement(frequencia: number): FrequencyElementMapping | null {
  return FREQUENCY_ELEMENT_MAP[frequencia] ?? null;
}

/**
 * Get the element corresponding to a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): Elemento | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get all frequencies mapped to a specific element
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of FrequencyElementMapping
 */
export function getFrequenciesByElement(elemento: string): FrequencyElementMapping[] {
  const normalizedElemento = normalizeElementName(elemento);
  return Object.values(FREQUENCY_ELEMENT_MAP).filter(
    (mapping) => mapping.elemento === normalizedElemento
  );
}

/**
 * Get the healing application for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing application object or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyElementMapping['aplicacao_healing'] | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.aplicacao_healing ?? null;
}

/**
 * Get the energy quality for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Energy quality object or null if not found
 */
export function getEnergyQualityByFrequency(frequencia: number): FrequencyElementMapping['qualidade_energetica'] | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.qualidade_energetica ?? null;
}

/**
 * Get the orixá associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Orixá name or null if not found
 */
export function getOrixaByFrequency(frequencia: number): string | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.orixa ?? null;
}

/**
 * Get the sephirah associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Sephirah name or null if not found
 */
export function getSephirahByFrequency(frequencia: number): string | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.sephirah ?? null;
}

/**
 * Get the chakra associated with a frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Chakra name or null if not found
 */
export function getChakraByFrequency(frequencia: number): string | null {
  return FREQUENCY_ELEMENT_MAP[frequencia]?.chakra ?? null;
}

/**
 * Get all element names used in the mapping
 * @returns Array of unique element names
 */
export function getAllElements(): Elemento[] {
  const elements: Elemento[] = [];
  const seen = new Set<string>();
  for (const mapping of Object.values(FREQUENCY_ELEMENT_MAP)) {
    if (!seen.has(mapping.elemento)) {
      seen.add(mapping.elemento);
      elements.push(mapping.elemento);
    }
  }
  return elements;
}

/**
 * Get all available frequency-element mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyElements(): FrequencyElementMapping[] {
  return Object.values(FREQUENCY_ELEMENT_MAP);
}

/**
 * Get frequencies by their energy temperature
 * @param temperatura - Temperature quality ('Quente', 'Frio', 'Neutro')
 * @returns Array of FrequencyElementMapping
 */
export function getFrequenciesByTemperature(temperatura: string): FrequencyElementMapping[] {
  return Object.values(FREQUENCY_ELEMENT_MAP).filter(
    (mapping) => mapping.qualidade_energetica.temperatura === temperatura
  );
}

/**
 * Get frequencies by their moisture level
 * @param umidade - Moisture level ('Úmido', 'Seco', 'Neutro')
 * @returns Array of FrequencyElementMapping
 */
export function getFrequenciesByMoisture(umidade: string): FrequencyElementMapping[] {
  return Object.values(FREQUENCY_ELEMENT_MAP).filter(
    (mapping) => mapping.qualidade_energetica.umidade === umidade
  );
}

/**
 * Normalizes element name to match Elemento type
 * Handles case-insensitive matching and variations
 */
function normalizeElementName(elemento: string): Elemento | null {
  const normalized = elemento.trim().toLowerCase();
  const map: Record<string, Elemento> = {
    'fogo': 'Fogo',
    'água': 'Água',
    'agua': 'Água',
    'ar': 'Ar',
    'terra': 'Terra',
    'éter': 'Éter',
    'eter': 'Éter',
  };
  return map[normalized] ?? null;
}