/**
 * Numerology-Frequency Spiritual Correlation Module
 * Maps numerology numbers 1-9 to Solfeggio frequencies with their healing properties
 * Part of the Cabala dos Caminhos spiritual framework
 * 
 * This is the inverse correlation of frequency-numerology.ts
 * Here we organize by numerology number, not by frequency.
 */

export type Numerologia = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Represents the correlation between a numerology number and its Solfeggio frequency
 */
export interface NumerologyFrequencyMapping {
  /** The numerology number (1-9) */
  numero: Numerologia;
  /** Associated Solfeggio frequency in Hz */
  frequencia: number;
  /** Element connection */
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  /** Spiritual meaning and archetype */
  significado_espiritual: {
    /** Core meaning of the number */
    significado: string;
    /** Positive traits associated */
    qualidades_positivas: string[];
    /** Challenges/shadows associated */
    desafios: string[];
    /** Life path themes */
    caminho_de_vida: string;
  };
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
    /** Best time for spiritual work */
    horario_sagrado: string;
  };
  /** Chakra color associated */
  cor: string;
}

/**
 * Complete mapping of numerology numbers 1-9 to their Solfeggio frequencies.
 * Based on IDEIA.md and the Cabala dos Caminhos system data.
 * Each number carries the vibrational signature of its corresponding frequency.
 */
export const NUMEROLOGY_FREQUENCY_MAP: Record<Numerologia, NumerologyFrequencyMapping> = {
  1: {
    numero: 1,
    frequencia: 963, // The "God Frequency" - unity, source, enlightenment
    elemento: 'Éter',
    significado_espiritual: {
      significado: 'Unidade, source, iluminação e início divino',
      qualidades_positivas: ['Liderança', 'Iniciativa', 'Independência', 'Originalidade', 'Determinação'],
      desafios: ['Egoísmo', 'Impaciência', 'Arrogância', 'Autonomia excessiva'],
      caminho_de_vida: 'Manifestar a vontade divina com humildade e propósito',
    },
    propriedades_healing: {
      fisico: 'Alinhamento da coluna vertebral, fortalecimento do sistema nervoso',
      emocional: 'Conexão com a fonte divina, dissolução do ego',
      mental_espiritual: 'Expansão da consciência, ativação da glândula pineal',
      chakra: '7º Coroa (Sahasrara)',
      orixa: 'Oxum / Iemanjá',
    },
    analise_vibracional: {
      chakra_activacao: 'Coroa superior - conexão com o divino supremo',
      assinatura_orixa: 'Oxum e Iemanjá - amor divino e purificação',
      mantra: 'Eu sou a expressão da vontade divina',
      horario_sagrado: 'Meia-noite (momento de maior conexão cósmica)',
    },
    cor: 'Violeta',
  },
  2: {
    numero: 2,
    frequencia: 852, // Third eye activation - intuition, inner vision
    elemento: 'Água',
    significado_espiritual: {
      significado: 'Intuição, visão interior e sabedoria revelada',
      qualidades_positivas: ['Intuição', 'Discernimento', 'Sabedoria', 'Sensibilidade', 'Percepção extrasensorial'],
      desafios: ['Ilusões', 'Confusão mental', 'Isolamento excessivo', 'Dependência de outros'],
      caminho_de_vida: 'Desenvolver a visão interior e confiar na sabedoria intuitiva',
    },
    propriedades_healing: {
      fisico: 'Harmonização da glândula pineal, equilíbrio hormonal',
      emocional: 'Abertura do terceiro olho, desenvolvimento da clarividência',
      mental_espiritual: 'Expansão da consciência, acesso à sabedoria ancestral',
      chakra: '6º Terceiro Olho (Ajna)',
      orixa: 'Oxumarim / Logunnedé',
    },
    analise_vibracional: {
      chakra_activacao: 'Terceiro olho - percepção além dos sentidos físicos',
      assinatura_orixa: 'Oxumarim e Logunnedé - sabedoria e mistério',
      mantra: 'Eu vejo além do véu da ilusão',
      horario_sagrado: 'Entre 21h-3h (tempo de revelação)',
    },
    cor: 'Índigo',
  },
  3: {
    numero: 3,
    frequencia: 396, // Liberation - transforming fear into love
    elemento: 'Terra',
    significado_espiritual: {
      significado: 'Libertação kármica, perdão e transformação interior',
      qualidades_positivas: ['Criatividade', 'Sociabilidade', 'Otimismo', 'Expressão artística', 'Comunicação clara'],
      desafios: ['Superficialidade', 'Impaciência', 'Gossip', 'Desorganização'],
      caminho_de_vida: 'Expressar verdade interior com otimismo e alegria',
    },
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
    cor: 'Vermelho',
  },
  4: {
    numero: 4,
    frequencia: 741, // Awakening, expressing personal truth, inspiration
    elemento: 'Ar',
    significado_espiritual: {
      significado: 'Despertar espiritual, expressão da verdade pessoal',
      qualidades_positivas: ['Ordem', 'Disciplina', 'Praticidade', 'Lealdade', 'Honestidade'],
      desafios: ['Rigidez', 'Teimosia', 'Inflexibilidade', 'Materialismo excessivo'],
      caminho_de_vida: 'Construir uma vida fundamentada em valores sólidos',
    },
    propriedades_healing: {
      fisico: 'Purificação do sistema respiratório, fortalecimento dos pulmões',
      emocional: 'Liberação de padrões de pensamento negativos',
      mental_espiritual: 'Despertar para a verdade interior, inspiração criativa',
      chakra: '5º Laríngeo (Vishuddha)',
      orixa: 'Ogum / Oxóssi',
    },
    analise_vibracional: {
      chakra_activacao: 'Comunicação sagrada, expressão da verdade',
      assinatura_orixa: 'Ogum e Oxóssi - busca e conquista',
      mantra: 'Eu expreso minha verdade com clareza e propósito',
      horario_sagrado: 'Manhã (9-12h) - tempo de ação inspirada',
    },
    cor: 'Azul Claro',
  },
  5: {
    numero: 5,
    frequencia: 639, // Healing relationships, connecting with others
    elemento: 'Água',
    significado_espiritual: {
      significado: 'Harmonia nos relacionamentos, perdão e compaixão',
      qualidades_positivas: ['Adaptabilidade', 'Curiosidade', 'Liberdade', 'Versatilidade', 'Progresso'],
      desafios: ['Impaciência', 'Irresponsabilidade', 'Inconsistência', 'Superficialidade'],
      caminho_de_vida: 'Abraçar a mudança com flexibilidade e confiança',
    },
    propriedades_healing: {
      fisico: 'Harmonização do sistema digestivo, equilíbrio emocional',
      emocional: 'Dissolução de rancores, cura de feridas emocionais',
      mental_espiritual: 'Promove conexões harmoniosas, compaixão universal',
      chakra: '4º Cardíaco (Anahata)',
      orixa: 'Iemanjá / Nanã',
    },
    analise_vibracional: {
      chakra_activacao: 'Coração espiritual - unconditional love',
      assinatura_orixa: 'Iemanjá e Nanã - mãe divina e sabedoria',
      mantra: 'Eu perdoo e sou perdoado, meu coração se abre ao amor',
      horario_sagrado: 'Tarde (12-18h) - tempo de abertura emocional',
    },
    cor: 'Verde',
  },
  6: {
    numero: 6,
    frequencia: 528, // Transformation, miracles, DNA repair
    elemento: 'Terra',
    significado_espiritual: {
      significado: 'Amor incondicional, harmonia familiar e responsabilidade',
      qualidades_positivas: ['Responsabilidade', 'Cuidado', 'Harmonia', 'Compaixão', 'Devoção'],
      desafios: ['Martírio', 'Sacrifício excessivo', 'Controladora', 'Autocrítica'],
      caminho_de_vida: 'Servir aos outros com amor sem perder a si mesmo',
    },
    propriedades_healing: {
      fisico: 'Reparação do DNA, regeneração celular, fortalecimento do coração',
      emocional: 'Restauração da criança interior, cura de traumas familiares',
      mental_espiritual: 'Ativação da inteligência do coração, milagres',
      chakra: '4º Cardíaco (Anahata) e 3º Plexo Solar (Manipura)',
      orixa: 'Iansã / Obá',
    },
    analise_vibracional: {
      chakra_activacao: 'Centro do coração - amor incondicional e milagres',
      assinatura_orixa: 'Iansã e Obá - guerreira do amor e fidelidade',
      mantra: 'Eu sou um canal de amor e milagres',
      horario_sagrado: 'Pôr do sol (17-19h) - tempo de reflexão amorosa',
    },
    cor: 'Rosa',
  },
  7: {
    numero: 7,
    frequencia: 417, // Undoing situations, facilitating change
    elemento: 'Fogo',
    significado_espiritual: {
      significado: 'Despertar interior, busca espiritual e conhecimento profundo',
      qualidades_positivas: ['Sabedoria', 'Intuição', 'Perfeccionismo', 'Espiritualidade', 'Análise'],
      desafios: ['Isolamento', 'Arrogância intelectual', 'Inquietação', 'Dogmatismo'],
      caminho_de_vida: 'Buscar a verdade através da introspecção e estudo',
    },
    propriedades_healing: {
      fisico: 'Fortalece sistema imunológico, equilíbrio do sistema nervoso',
      emocional: 'Facilita mudanças, liberta padrões antigos',
      mental_espiritual: 'Promove insight, acesso à sabedoria oculta',
      chakra: '3º Plexo Solar (Manipura)',
      orixa: 'Xangô / Ibeji',
    },
    analise_vibracional: {
      chakra_activacao: 'Plexo solar - poder pessoal e transformação',
      assinatura_orixa: 'Xangô e Ibeji - justiça e dualidade sagrada',
      mantra: 'Eu permito que antigas situações se dissolvam para o novo',
      horario_sagrado: 'Noite (19-22h) - tempo de introspecção',
    },
    cor: 'Laranja',
  },
  8: {
    numero: 8,
    frequencia: 639, // Abundance, financial and spiritual prosperity
    elemento: 'Terra',
    significado_espiritual: {
      significado: 'Abundância material e espiritual, poder pessoal, sabedoria prática',
      qualidades_positivas: ['Abundância', 'Poder', 'Confiança', 'Realização', 'Wisdom prática'],
      desafios: ['Materialismo', 'Avidez', 'Intimidação', 'Excesso de controle'],
      caminho_de_vida: 'Utilizar o poder pessoal para servir ao bem maior',
    },
    propriedades_healing: {
      fisico: 'Equilíbrio do sistema circulatório, fortalecimento dos ossos',
      emocional: 'Liberação de medos financeiros, restauração da confiança',
      mental_espiritual: 'Manifestação de abundância em todos os níveis',
      chakra: '2º Sacral (Svadhisthana)',
      orixa: 'Oxum / Nanã',
    },
    analise_vibracional: {
      chakra_activacao: 'Plexo sagrado - poder criativo e abundância',
      assinatura_orixa: 'Oxum e Nanã - prosperidade e sabedoria antiga',
      mantra: 'Eu permito que a abundância flua através de mim',
      horario_sagrado: 'Manhã (6-10h) - tempo de manifesttação',
    },
    cor: 'Dourado',
  },
  9: {
    numero: 9,
    frequencia: 417, // Humanitarian, completion of cycles
    elemento: 'Fogo',
    significado_espiritual: {
      significado: 'Iluminação, compaixão universal e завершение циклов',
      qualidades_positivas: ['Compaixão', 'Humanitarismo', 'Sabedoria', 'Tolerância', 'Desprendimento'],
      desafios: ['Impaciência com a ignorância', 'Sacrifício excessivo', 'Melancolia', 'Culpa escondida'],
      caminho_de_vida: 'Servir à humanidade com compaixão e sabedoria',
    },
    propriedades_healing: {
      fisico: 'Liberação de padrões kármicos, regeneração celular',
      emocional: 'Dissolução de orgulho, compaixão universal',
      mental_espiritual: 'Despertar da sabedoria superior, servicio humanitário',
      chakra: '7º Coroa (Sahasrara) e 3º Plexo Solar (Manipura)',
      orixa: 'Omulu / Obaluayê',
    },
    analise_vibracional: {
      chakra_activacao: 'Coroa e plexo - sabedoria divina em ação',
      assinatura_orixa: 'Omulu e Obaluayê - cura kármica e renovação',
      mantra: 'Eu completo o que precisa ser completado e sigo em frente',
      horario_sagrado: 'Fim do dia (18-21h) - tempo de encerramento',
    },
    cor: 'Violeta/Dourado',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(NUMEROLOGY_FREQUENCY_MAP);
Object.values(NUMEROLOGY_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the numerology-frequency mapping for a given number
 * @param numero - Numerology number (1-9)
 * @returns NumerologyFrequencyMapping or null if not found
 */
export function getNumerologyFrequency(numero: number): NumerologyFrequencyMapping | null {
  if (numero < 1 || numero > 9 || !Number.isInteger(numero)) {
    return null;
  }
  return NUMEROLOGY_FREQUENCY_MAP[numero as Numerologia] ?? null;
}

/**
 * Get the frequency-numerology mapping (reverse lookup)
 * Returns a record mapping each frequency to its numerology number
 * @returns Record mapping frequency (Hz) to numerology number
 */
export function getFrequencyNumerology(): Record<number, Numerologia> {
  const result: Record<number, Numerologia> = {};
  for (const [num, mapping] of Object.entries(NUMEROLOGY_FREQUENCY_MAP)) {
    result[mapping.frequencia] = mapping.numero;
  }
  return result;
}

/**
 * Get all numerology-frequency mappings
 * @returns Array of all NumerologyFrequencyMapping ordered by number
 */
export function getAllNumerologyFrequencies(): NumerologyFrequencyMapping[] {
  return Object.values(NUMEROLOGY_FREQUENCY_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Get the frequency for a given numerology number
 * @param numero - Numerology number (1-9)
 * @returns Frequency in Hz or null if not found
 */
export function getFrequencyByNumerologyNumber(numero: number): number | null {
  const mapping = getNumerologyFrequency(numero);
  return mapping?.frequencia ?? null;
}

/**
 * Get the element for a given numerology number
 * @param numero - Numerology number (1-9)
 * @returns Element name or null if not found
 */
export function getElementByNumerologyNumber(numero: number): string | null {
  return getNumerologyFrequency(numero)?.elemento ?? null;
}

/**
 * Get the chakra for a given numerology number
 * @param numero - Numerology number (1-9)
 * @returns Chakra name or null if not found
 */
export function getChakraByNumerologyNumber(numero: number): string | null {
  return getNumerologyFrequency(numero)?.propriedades_healing.chakra ?? null;
}

/**
 * Get the healing properties for a given numerology number
 * @param numero - Numerology number (1-9)
 * @returns Healing properties or null if not found
 */
export function getHealingByNumerologyNumber(
  numero: number
): NumerologyFrequencyMapping['propriedades_healing'] | null {
  return getNumerologyFrequency(numero)?.propriedades_healing ?? null;
}

/**
 * Get the spiritual meaning for a given numerology number
 * @param numero - Numerology number (1-9)
 * @returns Spiritual meaning or null if not found
 */
export function getSpiritualMeaningByNumerologyNumber(
  numero: number
): NumerologyFrequencyMapping['significado_espiritual'] | null {
  return getNumerologyFrequency(numero)?.significado_espiritual ?? null;
}

/**
 * Get all numerology numbers in the mapping
 * @returns Array of numerology numbers (1-9)
 */
export function getAllNumerologyNumbers(): Numerologia[] {
  return Object.keys(NUMEROLOGY_FREQUENCY_MAP)
    .map(Number)
    .sort((a, b) => a - b) as Numerologia[];
}

/**
 * Get all unique frequencies in the mapping
 * @returns Array of frequencies in Hz
 */
export function getAllFrequencies(): number[] {
  const frequencies = new Set<number>();
  for (const mapping of Object.values(NUMEROLOGY_FREQUENCY_MAP)) {
    frequencies.add(mapping.frequencia);
  }
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get all mappings for a given element
 * @param elemento - Element name (Fogo, Água, Ar, Terra, Éter)
 * @returns Array of NumerologyFrequencyMapping for that element
 */
export function getNumerologyByElement(
  elemento: string
): NumerologyFrequencyMapping[] {
  const normalizedElement = elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return Object.values(NUMEROLOGY_FREQUENCY_MAP).filter((mapping) => {
    const mappingElement = mapping.elemento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return mappingElement === normalizedElement;
  });
}

/**
 * Get all numerology numbers for a given chakra
 * @param chakra - Chakra name (partial match supported)
 * @returns Array of NumerologyFrequencyMapping for that chakra
 */
export function getNumerologyByChakra(chakra: string): NumerologyFrequencyMapping[] {
  const normalizedChakra = chakra.toLowerCase();
  
  return Object.values(NUMEROLOGY_FREQUENCY_MAP).filter((mapping) => {
    return mapping.propriedades_healing.chakra.toLowerCase().includes(normalizedChakra);
  });
}

/**
 * Default export for convenience
 */
