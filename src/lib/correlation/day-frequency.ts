/**
 * Day-Frequency Correlation Module
 * Maps days of the week to Solfeggio frequencies and spiritual significance
 * Based on vibrational healing and classical mystical traditions
 */

/** Supported Solfeggio frequencies */
export type Frequency = number;

/** Elemental correspondence for each day */
export type Element = 'fogo' | 'água' | 'ar' | 'terra';

/** Chakra correspondence */
export type Chakra = string;

export interface DayFrequency {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Solfeggio frequency in Hz */
  frequencia: number;
  /** Frequency name/label */
  nome_frequencia: string;
  /** Associated element */
  elemento: Element;
  /** Elemental quality */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Day color correspondence */
  cor: string;
  /** Primary direction */
  direcao: string;
  /** Associated chakra */
  chakra: string;
  /** Chakra number */
  chakra_numero: number;
  /** Planetary ruler for the day */
  planeta: string;
  /** Associated Orixá (for syncretic traditions) */
  orixa: string;
  /** Vibration properties and influences */
  propriedades: {
    /** Core strengths and energies */
    forta: string;
    /** Keywords for the day's vibration */
    palavras_chave: string[];
    /** Healing applications */
    aplicacoes_cura: string[];
  };
  /** Spiritual meaning and mystical significance */
  significado_espiritual: string;
  /** Recommended healing practices */
  praticas_cura: string[];
}

/** Day-to-Frequency mapping based on Solfeggio and vibrational healing traditions */
export const DAY_FREQUENCY_MAP: Record<string, DayFrequency> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    frequencia: 528,
    nome_frequencia: 'Frequência do Amor',
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    direcao: 'Leste',
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    planeta: 'Sol',
    orixa: 'Oxum',
    propriedades: {
      forta: 'Transformação, amor incondicional, milagres, restauração do DNA, clareza mental, criatividade radiante',
      palavras_chave: ['amor', 'milagre', 'transformar', 'restauração', 'luz', 'criatividade', 'propósito'],
      aplicacoes_cura: ['Restauração celular', 'Limpeza de padrões genéticos', 'Harmonização de Relationships', 'Clareza de intenção'],
    },
    significado_espiritual: 'A frequência de 528 Hz é conhecida como a "Frequência do Amor" e "Frequência dos Milagres". Domingo, ruled by the Sol, amplifica esta frequência de transformação e amor incondicional. É o dia para realizar trabajos de restauración del DNA, limpar patrones de programación y abrirse a milagres. A vibração do sol intensifica la capacidad de irradiar amor y compassion hacia uno mismo y los demás.',
    praticas_cura: [
      'Meditação com intenção de amor incondicional',
      'Exposição solar com visualização de luz dourada',
      'Afirmações de transformação e milagres',
      'Trabalho com água solarizada',
      'Rituais de consagração de talismãs',
      'Ouvir 528 Hz durante reflexões sobre propósito',
    ],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    frequencia: 396,
    nome_frequencia: 'Frequência da Libertação',
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    direcao: 'Oeste',
    chakra: '6º Frontal',
    chakra_numero: 6,
    planeta: 'Lua',
    orixa: 'Iemanjá',
    propriedades: {
      forta: 'Libertação de culpas e medos, transformação emocional, limpeza de patrones negativos, aceitação',
      palavras_chave: ['libertar', 'limpar', 'fluir', 'aceitar', 'soltar', 'perdoar', 'curar'],
      aplicacoes_cura: ['Liberação de patrones de culpa', 'Desbloqueio emocional', 'Purificação de memorias', 'Aceitação corporal'],
    },
    significado_espiritual: 'A frequência de 396 Hz representa a libertação do peso da culpa e dos medos. Segunda-feira, ruled by the Moon, amplifica la capacidade de soltar patrones emocionales restrictivos y liberar memorias que já não servem. É o dia para trabalhar a limpeza emocional, o perdão e a aceitação - permitiendo que las águas lunares lavem las heridas del alma.',
    praticas_cura: [
      'Banhos de limpeza energética con hierbas',
      'Meditação lunar de liberação emocional',
      'Escrita terapêutica para soltar rancores',
      'Práticas de perdão a sí mismo e outros',
      'Trabalho com água lunarizada (água exposta ao luar)',
      'Ouvir 396 Hz durante ejercicios de respiración emocional',
    ],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    frequencia: 417,
    nome_frequencia: 'Frequência da Mudança',
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    direcao: 'Sul',
    chakra: '2º Sacro',
    chakra_numero: 2,
    planeta: 'Marte',
    orixa: 'Ogum',
    propriedades: {
      forta: 'Facilitação de mudanças, transmutação de situações, superação de limitaciones, ação transformadora',
      palavras_chave: ['mudar', 'transmutar', 'romper', 'iniciar', 'transformar', 'atravessar', 'conquistar'],
      aplicacoes_cura: ['Superación de patroneslimitantes', 'Transmutación de energiainterior', 'Acción decisiva para mudanças'],
    },
    significado_espiritual: 'A frequência de 417 Hz facilita a quebra de padrões y permite transmutar situações estancadas. Terça-feira, ruled by Mars, amplifica la energía de ação decisive y transformación. É o dia para romper barreras, hacer cambios audaces y transmitar la energía estancada en movimiento creativo. La vibração marciana potencia la capacidad de tomar decisões e iniciar novos ciclos.',
    praticas_cura: [
      'Rituais de proteção y banimento de energías negativas',
      'Meditação de transformação de viejo a nuevo',
      'Ejercicios de respiración para activar la energía de acción',
      'Trabalho com fogo para transmutar patrones negativos',
      'Afirmações de mudança e novo comienzo',
      'Ouvir 417 Hz durante meditación de transmutación',
    ],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    frequencia: 528,
    nome_frequencia: 'Frequência da Integridade',
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Verde / Azul',
    direcao: 'Norte',
    chakra: '4º Cardíaco',
    chakra_numero: 4,
    planeta: 'Mercúrio',
    orixa: 'Oxumaré',
    propriedades: {
      forta: 'Integridad, verdad, comunicación clara, equilíbrio, resolución de conflictos, comprensión',
      palavras_chave: ['integridade', 'verdade', 'comunicar', 'equilibrar', 'resolver', 'compreender', 'harmonizar'],
      aplicacoes_cura: ['Resolución de conflictos', 'Equilibrio emocional', 'Comunicación auténtica', 'Armonização de relaciones'],
    },
    significado_espiritual: 'A frequência de 528 Hz em quarta-feira se manifiesta em su forma de integridad y verdad. Mercúrio, planeta de la comunicación, amplifica la capacidad de expresar verdades profundas y resolver conflictos através da compreensão. É o dia para limpiar la comunicación, equilibrar perspectivas y encontrar harmony em situações complexas.',
    praticas_cura: [
      'Meditación de integridad y verdad',
      'Ejercicios de comunicación auténtica',
      'Práticas de escuta ativa e compreensão',
      'Trabalho com a garganta para liberar expressão verdadeira',
      'Affirmations de equilíbrio e resolução',
      'Ouvir 528 Hz em meditações de harmonização',
    ],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    frequencia: 639,
    nome_frequencia: 'Frequência da Harmonia',
    elemento: 'água',
    qualidade: 'fixed',
    cor: 'Azul Claro / Verde',
    direcao: 'Nordeste',
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    planeta: 'Júpiter',
    orixa: 'Oxalá',
    propriedades: {
      forta: 'Armonía en relaciones, conexión, expansión espiritual, tolerancia, sabiduría, amor universal',
      palavras_chave: ['harmonizar', 'conectar', 'expandir', 'tolerar', 'sabedoria', 'amar', 'compartilhar'],
      aplicacoes_cura: ['Harmonização de relaciones', 'Expansión de consciência', 'Conexão espiritual', 'Tolerância y compasión'],
    },
    significado_espiritual: 'A frequência de 639 Hz é a frequência da harmonia em relaciones y conexión universal. Quinta-feira, ruled by Júpiter, amplifica la capacidad de expandir la consciencia, cultivar tolerancia y desarrollar sabedoria. É o dia para trabajar en la harmonização de relaciones, superar conflictos y conectar con dimensões superiores de amor.',
    praticas_cura: [
      'Meditación de harmonia em relaciones',
      'Práticas de conexão com seres queridos',
      'Ejercicios de expansión de consciencia',
      'Afirmações de sabiduría y tolerancia',
      'Trabalho com relações familiares y de pareja',
      'Ouvir 639 Hz em meditações de conexión universal',
    ],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    frequencia: 741,
    nome_frequencia: 'Frequência da Purificação',
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Verde / Turquesa',
    direcao: 'Sudeste',
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    planeta: 'Vênus',
    orixa: 'Iansã',
    propriedades: {
      forta: 'Purificación, despertar de la intuición, expresión clara, limpieza energética, protección',
      palavras_chave: ['purificar', 'despertar', 'expressar', 'proteger', 'intuir', 'liberar', 'iluminar'],
      aplicacoes_cura: ['Purificación de ambientes', 'Despertar intuitivo', 'Limpieza energética personal', 'Protección espiritual'],
    },
    significado_espiritual: 'A frequência de 741 Hz ayuda a purifier energética y despertar la intuición. Sexta-feira, ruled by Vênus, amplifica la capacidad de limpiar energías negativas y expresar verdades profundas. É o dia para trabajar en la protección, purificación de espacios e individuos, y el despertar de capacidades intuitivas. La vibração de Vênus potencia la belleza interior y la expresión auténtica.',
    praticas_cura: [
      'Rituais de purificación de espacios',
      'Meditación de despertar intuitivo',
      'Práticas de protección energética pessoal',
      'Trabalho com crystals para limpar energías',
      'Ejercicios de expresión auténtica',
      'Ouvir 741 Hz em meditações de purificação',
    ],
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    frequencia: 852,
    nome_frequencia: 'Frequência da Espiritualidade',
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Roxo / Prata',
    direcao: 'Sudoeste',
    chakra: '6º Frontal / 7º Coroa',
    chakra_numero: 7,
    planeta: 'Saturno',
    orixa: 'Nanã',
    propriedades: {
      forta: 'Despertar espiritual, conexión con la guía interior, terceiro olho, sabedoria antiga, disciplina sagrada',
      palavras_chave: ['espiritualidade', 'despertar', 'conectar', 'guiar', 'saber', 'disciplina', 'transcender'],
      aplicacoes_cura: ['Despertar do terceiro olho', 'Conexão espiritual profunda', 'Recebimento de guía', 'Desapego y sabiduría'],
    },
    significado_espiritual: 'A frequência de 852 Hz despierta la conexión espiritual y facilita el despertar del terceiro olho. Sábado, ruled by Saturno, amplifica la capacidad de recibir guía interior, trascender limitaciones y acessar sabedoria antiga. É o dia para meditación profunda, trabajo con o terceiro olho, y conexión con dimensões espirituais. La vibração saturnina cultiva disciplina sagrada y desapego necessárias para a evolução espiritual.',
    praticas_cura: [
      'Meditação de terceiro olho',
      'Práticas de conexão espiritual profunda',
      'Ejercicios de recebimento de guía interior',
      'Trabalho com a coroa para acessar sabedoria superior',
      'Rituais de desapego e sabedoria',
      'Ouvir 852 Hz em meditações de trascendencia',
    ],
  },
};

/**
 * Get frequency correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira')
 * @returns DayFrequency mapping or undefined if day not found
 */
export function getDayFrequency(dia: string): DayFrequency | undefined {
  return DAY_FREQUENCY_MAP[dia];
}

/**
 * Get frequency for a specific day
 * @param dia - Day name in Portuguese
 * @returns Frequency in Hz or undefined if day not found
 */
export function getFrequencyDay(dia: string): number | undefined {
  return DAY_FREQUENCY_MAP[dia]?.frequencia;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_FREQUENCY_MAP);
}

/**
 * Get days associated with a specific frequency
 * @param frequencia - Frequency in Hz
 * @returns Array of day names
 */
export function getDaysByFrequency(frequencia: number): string[] {
  return Object.entries(DAY_FREQUENCY_MAP)
    .filter(([_, day]) => day.frequencia === frequencia)
    .map(([dia, _]) => dia);
}

/**
 * Get all day-frequency correlations
 * @returns Array of all DayFrequency mappings
 */
export function getAllDayFrequencies(): DayFrequency[] {
  return Object.values(DAY_FREQUENCY_MAP);
}

/**
 * Get frequency name for a specific day
 * @param dia - Day name in Portuguese
 * @returns Frequency name or undefined if day not found
 */
export function getFrequencyName(dia: string): string | undefined {
  return DAY_FREQUENCY_MAP[dia]?.nome_frequencia;
}

/**
 * Get element for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element or undefined if day not found
 */
export function getElementByDay(dia: string): Element | undefined {
  return DAY_FREQUENCY_MAP[dia]?.elemento;
}

/**
 * Get chakra for a specific day
 * @param dia - Day name in Portuguese
 * @returns Chakra or undefined if day not found
 */
export function getChakraByDay(dia: string): Chakra | undefined {
  return DAY_FREQUENCY_MAP[dia]?.chakra;
}

/**
 * Get chakra number for a specific day
 * @param dia - Day name in Portuguese
 * @returns Chakra number or undefined if day not found
 */
export function getChakraNumberByDay(dia: string): number | undefined {
  return DAY_FREQUENCY_MAP[dia]?.chakra_numero;
}

/**
 * Get spiritual meaning for a specific day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: string): string | undefined {
  return DAY_FREQUENCY_MAP[dia]?.significado_espiritual;
}

/**
 * Get healing properties for a specific day
 * @param dia - Day name in Portuguese
 * @returns Healing properties or undefined if day not found
 */
export function getHealingProperties(dia: string): DayFrequency['propriedades'] | undefined {
  return DAY_FREQUENCY_MAP[dia]?.propriedades;
}

/**
 * Get color for a specific day
 * @param dia - Day name in Portuguese
 * @returns Color or undefined if day not found
 */
export function getColorByDay(dia: string): string | undefined {
  return DAY_FREQUENCY_MAP[dia]?.cor;
}

/**
 * Get Orixá for a specific day
 * @param dia - Day name in Portuguese
 * @returns Orixá or undefined if day not found
 */
export function getOrixaByDay(dia: string): string | undefined {
  return DAY_FREQUENCY_MAP[dia]?.orixa;
}

/**
 * Get planet for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet or undefined if day not found
 */
export function getPlanetByDay(dia: string): string | undefined {
  return DAY_FREQUENCY_MAP[dia]?.planeta;
}

/**
 * Get healing practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of healing practices or undefined if day not found
 */
export function getDayPractices(dia: string): string[] | undefined {
  return DAY_FREQUENCY_MAP[dia]?.praticas_cura;
}

/**
 * Get all unique frequencies
 * @returns Array of unique frequencies in Hz
 */
export function getAllFrequencies(): number[] {
  const frequencies = new Set<number>();
  Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
    frequencies.add(day.frequencia);
  });
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get day by frequency
 * @param frequencia - Frequency in Hz
 * @returns Day name or undefined if frequency not found
 */
export function getDayByFrequency(frequencia: number): string | undefined {
  const entry = Object.entries(DAY_FREQUENCY_MAP).find(([_, day]) => day.frequencia === frequencia);
  return entry?.[0];
}

export default {
  getDayFrequency,
  getFrequencyDay,
  getAllDays,
  getDaysByFrequency,
  getAllDayFrequencies,
  getFrequencyName,
  getElementByDay,
  getChakraByDay,
  getChakraNumberByDay,
  getDaySpiritualMeaning,
  getHealingProperties,
  getColorByDay,
  getOrixaByDay,
  getPlanetByDay,
  getDayPractices,
  getAllFrequencies,
  getDayByFrequency,
};