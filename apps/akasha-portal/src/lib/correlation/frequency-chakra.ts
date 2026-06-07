/**
 * Frequency-Chakra Correlation Module
 * Based on Solfeggio frequencies mapped to chakras, elements, and healing properties
 * Source: IDEIA.md - Matriz de Geometria Sagrada, Frequências Solfeggio e Sons Divinos
 */

export interface FrequencyChakra {
  /** Frequency in Hz */
  frequencia: number;
  /** Chakra name in Portuguese */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Platonic solid associated with this frequency */
  poliedro_platao: string;
  /** Seed sound / mantram */
  mantram_som_semente: string;
  /** Divine name from Kabbalah */
  nome_divino_cabala: string;
  /** Elemental direction */
  direcao_elemental: string;
  /** Primary ruling element */
  elemento_regente: string;
  /** Element connection description */
  elemento_conexao: {
    /** Primary element */
    primario: string;
    /** Secondary element if any */
    secundario?: string;
    /** Elemental qualities */
    qualidades: string[];
    /** Direction of energy flow */
    fluxo_energetico: string;
  };
  /** Dynamic effect description */
  dinamica: string;
  /** Healing properties for this frequency-chakra combination */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Recommended practice */
    pratica_recomendada: string;
  };
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their corresponding
 * chakra, Platonic solid, seed sound, divine name, elemental direction, and healing properties
 */
export const FREQUENCY_CHAKRA_MAP: Record<number, FrequencyChakra> = {
  396: {
    frequencia: 396,
    chakra: '1º Básico',
    chakra_numero: 1,
    poliedro_platao: 'Ponto / Cubo de Base',
    mantram_som_semente: 'LAM',
    nome_divino_cabala: 'ADONAI HA-ARETZ',
    direcao_elemental: 'Norte',
    elemento_regente: 'Terra',
    elemento_conexao: {
      primario: 'Terra',
      secundario: undefined,
      qualidades: ['Frio', 'Seco', 'Estável'],
      fluxo_energetico: 'Descendente e centrípeto',
    },
    dinamica: 'Dissolução de medos de sobrevivência, ancoramento e firmeza material.',
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Dissolve medos de sobrevivência e sensação de insegurança',
      mental_espiritual: 'Promove clareza mental, foco e determinação',
      pratica_recomendada: 'Meditação em grupo, trabalho ancestral',
    },
  },
  417: {
    frequencia: 417,
    chakra: '2º Sacro',
    chakra_numero: 2,
    poliedro_platao: 'Cubo / Hexaedro',
    mantram_som_semente: 'VAM',
    nome_divino_cabala: 'ELOHIM GIBOR',
    direcao_elemental: 'Oeste',
    elemento_regente: 'Água',
    elemento_conexao: {
      primario: 'Água',
      secundario: undefined,
      qualidades: ['Frio', 'Úmido', 'Fluido'],
      fluxo_energetico: 'Ondulante e expansivo',
    },
    dinamica: 'Limpeza de traumas do passado, transmutação criativa e fluidez vital.',
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      pratica_recomendada: 'Trabalho emocional profundo, terapia vibracional',
    },
  },
  528: {
    frequencia: 528,
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    poliedro_platao: 'Tetraedro',
    mantram_som_semente: 'RAM',
    nome_divino_cabala: 'SHADDAI EL CHAI',
    direcao_elemental: 'Sul',
    elemento_regente: 'Fogo',
    elemento_conexao: {
      primario: 'Fogo',
      secundario: undefined,
      qualidades: ['Quente', 'Seco', 'Transformador'],
      fluxo_energetico: 'Ascendente e radiante',
    },
    dinamica: 'Transformação da força de vontade, quebra de medos e ativação do brilho.',
    propriedades_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      pratica_recomendada: 'Trabalho com intenção, cura energética avançada',
    },
  },
  639: {
    frequencia: 639,
    chakra: '4º Cardíaco',
    chakra_numero: 4,
    poliedro_platao: 'Octaedro',
    mantram_som_semente: 'YAM',
    nome_divino_cabala: 'YHVH ELOAH VA-DAATH',
    direcao_elemental: 'Leste',
    elemento_regente: 'Ar',
    elemento_conexao: {
      primario: 'Ar',
      secundario: 'Água',
      qualidades: ['Neutro', 'Úmido', 'Harmonizador'],
      fluxo_energetico: 'Bidirecional e difuso',
    },
    dinamica: 'Expansão do afeto incondicional, harmonização de relacionamentos e cura.',
    propriedades_healing: {
      fisico: 'Equilibra sistema circulatório e coração',
      emocional: 'Promove perdão, amor próprio e compaixão universal',
      mental_espiritual: 'Abre通道 de comunicação com o divino',
      pratica_recomendada: 'Trabalho com casal, cura de relacionamentos',
    },
  },
  741: {
    frequencia: 741,
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    poliedro_platao: 'Dodecaedro',
    mantram_som_semente: 'HAM',
    nome_divino_cabala: 'ELOHIM SABAOTH',
    direcao_elemental: 'Sul',
    elemento_regente: 'Ar',
    elemento_conexao: {
      primario: 'Ar',
      secundario: undefined,
      qualidades: ['Quente', 'Seco', 'Expressivo'],
      fluxo_energetico: 'Ascendente e libertador',
    },
    dinamica: 'Expressão da verdade interna, purificação e poder da palavra falada.',
    propriedades_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      pratica_recomendada: 'Cantos, mantras, trabalho com voz e som',
    },
  },
  852: {
    frequencia: 852,
    chakra: '6º Frontal',
    chakra_numero: 6,
    poliedro_platao: 'Icosaedro',
    mantram_som_semente: 'OM',
    nome_divino_cabala: 'YAH',
    direcao_elemental: 'Norte',
    elemento_regente: 'Éter',
    elemento_conexao: {
      primario: 'Éter',
      secundario: 'Ar',
      qualidades: ['Neutro', 'Puro', 'Iluminador'],
      fluxo_energetico: 'Expansivo e unificador',
    },
    dinamica: 'Despertar da intuição profunda, visão clara e dissolução de ilusões.',
    propriedades_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho',
    },
  },
  963: {
    frequencia: 963,
    chakra: '7º Coronário',
    chakra_numero: 7,
    poliedro_platao: 'Esfera (Unidade Total)',
    mantram_som_semente: 'AUM / SILÊNCIO',
    nome_divino_cabala: 'EHEIEH',
    direcao_elemental: 'Centro / Zênite',
    elemento_regente: 'Éter (Quintessência)',
    elemento_conexao: {
      primario: 'Éter',
      secundario: undefined,
      qualidades: ['Neutro', 'Puro', 'Transcendente'],
      fluxo_energetico: 'Centrípeto e ascendente simultâneo',
    },
    dinamica: 'Conexão espiritual direta com a Fonte e iluminação da mente.',
    propriedades_healing: {
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
Object.freeze(FREQUENCY_CHAKRA_MAP);
Object.values(FREQUENCY_CHAKRA_MAP).forEach((mapping) => {
  Object.freeze(mapping);
  Object.freeze(mapping.elemento_conexao);
  Object.freeze(mapping.propriedades_healing);
});

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-chakra mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyChakra mapping or null if not found
 */
export function getFrequencyChakra(frequencia: number): FrequencyChakra | null {
  return FREQUENCY_CHAKRA_MAP[frequencia] ?? null;
}

/**
 * Get the frequency for a given chakra name or number
 * @param chakra - Chakra name (e.g., '1º Básico', 'Muladhara') or number (1-7)
 * @returns Frequency in Hz or null if not found
 */
export function getChakraFrequency(chakra: string | number): number | null {
  if (typeof chakra === 'number') {
    const mapping = Object.values(FREQUENCY_CHAKRA_MAP).find(
      (m) => m.chakra_numero === chakra
    );
    return mapping?.frequencia ?? null;
  }

  // Normalize chakra name - match by number prefix or name
  const normalizedChakra = chakra.toLowerCase().trim();
  const mapping = Object.values(FREQUENCY_CHAKRA_MAP).find((m) => {
    const mapChakra = m.chakra.toLowerCase();
    // Match "1º básico" or just "básico" or "1"
    const numMatch = mapChakra.startsWith(normalizedChakra.split('º')[0] + 'º') ||
      normalizedChakra.includes(mapChakra.split('º ')[1] ?? '');
    // Match Sanskrit names (Muladhara, Svadhisthana, etc.)
    const sanskritMap: Record<string, number> = {
      'muladhara': 1,
      'svadhisthana': 2,
      'manipura': 3,
      'anahata': 4,
      'vishuddha': 5,
      'ajna': 6,
      'sahasrara': 7,
    };
    const sanskritMatch = sanskritMap[normalizedChakra] === m.chakra_numero;
    return numMatch || sanskritMatch;
  });
  return mapping?.frequencia ?? null;
}

/**
 * Get all available frequency-chakra mappings
 * @returns Array of all correlation mappings sorted by chakra number
 */
export function getAllFrequencyChakras(): FrequencyChakra[] {
  return Object.values(FREQUENCY_CHAKRA_MAP).sort(
    (a, b) => a.chakra_numero - b.chakra_numero
  );
}

/**
 * Get all frequencies mapped to a specific chakra number (1-7)
 * @param chakraNumero - Chakra number (1-7)
 * @returns Array of FrequencyChakra mappings
 */
export function getFrequenciesByChakra(chakraNumero: number): FrequencyChakra[] {
  return Object.values(FREQUENCY_CHAKRA_MAP).filter(
    (mapping) => mapping.chakra_numero === chakraNumero
  );
}

/**
 * Get the seed sound (mantram) for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Mantram string or null if not found
 */
export function getMantramByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.mantram_som_semente ?? null;
}

/**
 * Get the divine name from Kabbalah for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Divine name string or null if not found
 */
export function getDivineNameByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.nome_divino_cabala ?? null;
}

/**
 * Get the Platonic solid geometry for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Platonic solid name or null if not found
 */
export function getPoliedroByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.poliedro_platao ?? null;
}

/**
 * Get the elemental direction for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Direction string or null if not found
 */
export function getDirectionByFrequency(frequencia: number): string | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.direcao_elemental ?? null;
}

/**
 * Get the element connection for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element connection object or null if not found
 */
export function getElementByFrequency(frequencia: number): FrequencyChakra['elemento_conexao'] | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.elemento_conexao ?? null;
}

/**
 * Get the healing properties for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing properties object or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyChakra['propriedades_healing'] | null {
  return FREQUENCY_CHAKRA_MAP[frequencia]?.propriedades_healing ?? null;
}

/**
 * Get frequencies by their primary element
 * @param elemento - Element name (e.g., 'Terra', 'Água', 'Fogo', 'Ar', 'Éter')
 * @returns Array of FrequencyChakra mappings
 */
export function getFrequenciesByElement(elemento: string): FrequencyChakra[] {
  const normalized = elemento.toLowerCase().trim();
  return Object.values(FREQUENCY_CHAKRA_MAP).filter((m) => {
    return (
      m.elemento_regente.toLowerCase().includes(normalized) ||
      m.elemento_conexao.primario.toLowerCase() === normalized ||
      m.elemento_conexao.secundario?.toLowerCase() === normalized
    );
  });
}