/**
 * Frequency-Numerology Spiritual Correlation Module
 * Based on Solfeggio frequencies mapped to numerology numbers 1-9
 * Source: IDEIA.md - Matriz de Geometria Sagrada and Cabala dos Caminhos system
 */

export type Numerologia = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Represents the correlation between a Solfeggio frequency and its numerological properties
 */
export interface FrequencyNumerologyMapping {
  /** Frequency in Hz */
  frequencia: number;
  /** Associated numerology number (1-9) */
  numerologia: Numerologia;
  /** Numerology meaning and characteristics */
  significado_numerologico: {
    /** Core meaning of the number */
    significado: string;
    /** Positive traits associated */
    qualidades_positivas: string[];
    /** Challenges/shadows associated */
    desafios: string[];
    /** Life path themes */
    caminho_de_vida: string;
  };
  /** Element connection from frequency-element correlation */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Healing properties */
  propriedades_healing: {
    /** Physical healing focus */
    fisico: string;
    /** Emotional healing focus */
    emocional: string;
    /** Mental/spiritual healing focus */
    mental_espiritual: string;
    /** Chakra associated */
    chakra: string;
    /** Orixá correspondence */
    orixa: string;
  };
  /** Vibration analysis */
  analise_vibracional: {
    /** Chakra activation level */
    chakra_activacao: string;
    /** Orixá energy signature */
    assinatura_orixa: string;
    /** Recommended mantra or affirmation */
    mantra: string;
    /** Best time for work */
    horario_sagrado: string;
  };
}

/**
 * Complete mapping of the 7 Solfeggio frequencies to their numerological correspondences.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Each frequency carries the vibrational signature of its corresponding number.
 */
export const FREQUENCY_NUMEROLOGY_MAP: Record<number, FrequencyNumerologyMapping> = {
  396: {
    frequencia: 396,
    numerologia: 3,
    significado_numerologico: {
      significado: 'Criatividade, expressão e comunicação',
      qualidades_positivas: ['Criatividade', 'Sociabilidade', 'Otimismo', 'Expressão artística', 'Comunicação clara'],
      desafios: ['Superficialidade', 'Impaciência', 'Gossip', 'Desorganização'],
      caminho_de_vida: 'Expressar verdade interior com otimismo e alegria',
    },
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos, sistema imunológico e órgãos vitais',
      emocional: 'Liberta medo de mudança e resíduos kármicos',
      mental_espiritual: 'Promove clareza mental e alinhamento com propósito',
      chakra: '1º Básico (Muladhara)',
      orixa: 'Oxalufã / Obaluayê',
    },
    analise_vibracional: {
      chakra_activacao: 'Ancoramento profundo, ativação do plexus sagrado',
      assinatura_orixa: 'Exu e Ogum - força de transformação e proteção',
      mantra: 'Eu libero o passado e abraço meu poder criativo',
      horario_sagrado: 'Manhã cedo (6-9h)',
    },
  },
  417: {
    frequencia: 417,
    numerologia: 3,
    significado_numerologico: {
      significado: 'Criatividade, expressão e facilitação de mudança',
      qualidades_positivas: ['Facilitação', 'Inspiração', 'Renovação', 'Expressão criativa', 'Esperança'],
      desafios: ['Instabilidade', 'Inconstância', 'Procrastinação', 'Evitar responsabilidade'],
      caminho_de_vida: 'Ser catalisador de transformação na vida dos outros',
    },
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Hidrata tecidos, melhora circulação e limpeza celular',
      emocional: 'Libera traumas emocionais e padrões do passado',
      mental_espiritual: 'Facilita adaptação, flexibilidade e renovação',
      chakra: '2º Sacro (Svadhisthana)',
      orixa: 'Oxum / Iemanjá',
    },
    analise_vibracional: {
      chakra_activacao: 'Fluxo emocional restaurado, purificação do corpo emocional',
      assinatura_orixa: 'Oxum - fluí em harmonia com a vida',
      mantra: 'Eu permito que a transformação flua através de mim',
      horario_sagrado: 'Fim de tarde (17-19h)',
    },
  },
  528: {
    frequencia: 528,
    numerologia: 9,
    significado_numerologico: {
      significado: 'Iluminação, compaixão e realização divina',
      qualidades_positivas: ['Compaixão', 'Sabedoria', 'Humanitarismo', 'Creação', 'Perdão'],
      desafios: ['Martírio', 'Vulnerabilidade excessiva', 'Cobrança emocional', 'Problemas de limite'],
      caminho_de_vida: 'Servir a humanidade com amor incondicional e sabedoria',
    },
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula metabolismo, sistema nervoso e força vital',
      emocional: 'Transforma negatividade em compaixão e amor incondicional',
      mental_espiritual: 'Ativa criatividade, intuição e manifestação',
      chakra: '3º Plexo Solar (Manipura)',
      orixa: 'Xangô / Logun Ede',
    },
    analise_vibracional: {
      chakra_activacao: 'Centro de poder ativado, integração mente-coração',
      assinatura_orixa: 'Xangô - justiça divina e poder transformador',
      mantra: 'Eu sou a frequência do amor e das soluções',
      horario_sagrado: 'Meio-dia (11-13h)',
    },
  },
  639: {
    frequencia: 639,
    numerologia: 9,
    significado_numerologico: {
      significado: 'Unidade, amor universal e harmonia nos relacionamentos',
      qualidades_positivas: ['Harmonia', 'Tolerância', 'Compaixão', 'Sacrifício', 'União'],
      desafios: ['Auto-negligência', 'Romantismo excessivo', 'Dependência', 'Sacrifício mal direcionado'],
      caminho_de_vida: 'Cultivar relacionamentos sagrados e comunidades harmônicas',
    },
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Equilibra sistema respiratório e circulatório',
      emocional: 'Harmoniza relacionamentos e promove paz interior',
      mental_espiritual: 'Abre canal de comunicação com o divino',
      chakra: '4º Cardíaco (Anahata)',
      orixa: 'Oxóssi / Nanã Buruquá',
    },
    analise_vibracional: {
      chakra_activacao: 'Coração expandido, integração de energias masculine/feminina',
      assinatura_orixa: 'Oxóssi - abundância e harmonia em todas as relações',
      mantra: 'Eu me conecto com a energia do amor universal',
      horario_sagrado: 'Manhã (7-10h)',
    },
  },
  741: {
    frequencia: 741,
    numerologia: 3,
    significado_numerologico: {
      significado: 'Expressão autêntica, verdade e despertamento da voz interior',
      qualidades_positivas: ['Autenticidade', 'Verdade', 'Expressão', 'Criatividade', 'Liberdade'],
      desafios: ['Perfecionismo', 'Autocrítica', 'Bloqueio criativo', 'Medo de exposição'],
      caminho_de_vida: 'Expressar verdade interior e despertar voz autêntica',
    },
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Limpa garganta, ouvidos e vias respiratórias',
      emocional: 'Liberta medo de falar verdades e se expressar autenticamente',
      mental_espiritual: 'Desperta sabedoria interior e expressão criativa',
      chakra: '5º Laríngeo (Vishuddha)',
      orixa: 'Iansã / Obá',
    },
    analise_vibracional: {
      chakra_activacao: 'Garganta aberta, expressão energética livre',
      assinatura_orixa: 'Iansã - força, coragem e verdade nos elementos',
      mantra: 'Eu falo minha verdade com amor e clareza',
      horario_sagrado: 'Manhã (8-11h)',
    },
  },
  852: {
    frequencia: 852,
    numerologia: 6,
    significado_numerologico: {
      significado: 'Responsabilidade, equilíbrio e serviço à luz',
      qualidades_positivas: ['Responsabilidade', 'Cuidado', 'Equilíbrio', 'Direção espiritual', 'Harmonia'],
      desafios: ['Cobrança', 'Controle', 'Preocupação excessiva', 'Sacrifício imbalanceado'],
      caminho_de_vida: 'Servir com sabedoria enquanto mantém limites saudáveis',
    },
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Equilibra glândula pineal e sistema nervoso central',
      emocional: 'Dissipa ilusões e restaura visão clara da realidade',
      mental_espiritual: 'Desperta capacidades psíquicas e consciência expandida',
      chakra: '6º Frontal (Ajna)',
      orixa: 'Oxumaré / Ossaim',
    },
    analise_vibracional: {
      chakra_activacao: 'Terceiro olho iluminado, percepção espiritual expandida',
      assinatura_orixa: 'Oxumaré - ritmo cíclico e sabedoria da cobra',
      mantra: 'Eu vejo através dos olhos da sabedoria divina',
      horario_sagrado: 'Noite (21-23h)',
    },
  },
  963: {
    frequencia: 963,
    numerologia: 9,
    significado_numerologico: {
      significado: 'Transcendência, unidade com o divino e completude',
      qualidades_positivas: ['Unidade', 'Completude', 'Sagramento', 'Fé', 'Iluminação'],
      desafios: ['Isolamento', 'Perfeccionismo espiritual', 'Desapego excessivo', 'Impaciência com outros'],
      caminho_de_vida: 'Viver em sagramento contínuo e servir como ponte para o divino',
    },
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Restaura padrão original do DNA e regeneração celular',
      emocional: 'Promove paz profunda e unidade com tudo existente',
      mental_espiritual: 'Conexão direta com a Fonte criadora e infinito',
      chakra: '7º Coronário (Sahasrara)',
      orixa: 'Ori / Olokun',
    },
    analise_vibracional: {
      chakra_activacao: 'Coroa expandida, integração com a consciência cósmica',
      assinatura_orixa: 'Ori - conexão direta com a divindade interior',
      mantra: 'Eu sou um ser de luz conectado com o infinito',
      horario_sagrado: 'Madrugada (3-5h) ou meditação profunda',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(FREQUENCY_NUMEROLOGY_MAP);
Object.values(FREQUENCY_NUMEROLOGY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 7 Solfeggio frequencies in ascending order
 */
export const SOLFEGGIO_FREQUENCIES = [396, 417, 528, 639, 741, 852, 963] as const;

/**
 * Get the frequency-numerology mapping for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns FrequencyNumerologyMapping or null if not found
 */
export function getFrequencyNumerology(frequencia: number): FrequencyNumerologyMapping | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia] ?? null;
}

/**
 * Get the numerology number for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Numerology number (1-9) or null if not found
 */
export function getNumerologyByFrequency(frequencia: number): Numerologia | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia]?.numerologia ?? null;
}

/**
 * Get the frequency corresponding to a given numerology number
 * @param numerologia - Numerology number (1-9)
 * @returns Array of FrequencyNumerologyMapping
 */
export function getFrequencyByNumerology(numerologia: number): FrequencyNumerologyMapping[] {
  return Object.values(FREQUENCY_NUMEROLOGY_MAP).filter(
    (mapping) => mapping.numerologia === numerologia
  );
}

/**
 * Get the element for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Element name or null if not found
 */
export function getElementByFrequency(frequencia: number): string | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia]?.elemento ?? null;
}

/**
 * Get the healing properties for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Healing properties or null if not found
 */
export function getHealingByFrequency(frequencia: number): FrequencyNumerologyMapping['propriedades_healing'] | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia]?.propriedades_healing ?? null;
}

/**
 * Get the vibrational analysis for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Vibrational analysis or null if not found
 */
export function getVibrationalAnalysis(frequencia: number): FrequencyNumerologyMapping['analise_vibracional'] | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia]?.analise_vibracional ?? null;
}

/**
 * Get the numerological meaning for a given frequency
 * @param frequencia - Solfeggio frequency in Hz
 * @returns Numerological meaning or null if not found
 */
export function getNumerologyMeaning(frequencia: number): FrequencyNumerologyMapping['significado_numerologico'] | null {
  return FREQUENCY_NUMEROLOGY_MAP[frequencia]?.significado_numerologico ?? null;
}

/**
 * Get all unique numerology numbers in the mapping
 * @returns Array of unique numerology numbers
 */
export function getAllNumerologyNumbers(): Numerologia[] {
  const numbers = new Set(Object.values(FREQUENCY_NUMEROLOGY_MAP).map((m) => m.numerologia));
  return Array.from(numbers).sort((a, b) => a - b) as Numerologia[];
}

/**
 * Get all available frequency-numerology mappings
 * @returns Array of all correlation mappings
 */
export function getAllFrequencyNumerology(): FrequencyNumerologyMapping[] {
  return Object.values(FREQUENCY_NUMEROLOGY_MAP);
}

/**
 * Get frequencies by element
 * @param elemento - Element name (Fogo, Água, Ar, Terra, Éter)
 * @returns Array of FrequencyNumerologyMapping
 */
export function getFrequenciesByElement(elemento: string): FrequencyNumerologyMapping[] {
  return Object.values(FREQUENCY_NUMEROLOGY_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Normalizes element name to match expected values
 * Handles case-insensitive matching and variations
 */
function normalizeElementName(elemento: string): string | null {
  const normalized = elemento.toLowerCase().trim();
  const validElements: Record<string, string> = {
    'fogo': 'Fogo',
    'água': 'Água',
    'agua': 'Água',
    'ar': 'Ar',
    'terra': 'Terra',
    'éter': 'Éter',
    'eter': 'Éter',
  };
  return validElements[normalized] ?? null;
}