/**
 * Day-Numerology Correlation Module
 * Maps days of the week to their ruling numerology numbers and spiritual meanings
 * Based on classical Western numerological traditions and planetary correspondences
 */

/**
 * Day numerology mapping interface
 */
export interface DayNumerology {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Numerology number associated with the day (1-9 or master numbers 11, 22, 33) */
  numero: number;
  /** Associated element of the day */
  elemento: string;
  /** Primary ruling planet */
  planeta: string;
  /** Mystical theme and energetic focus */
  significado_espiritual: string;
  /** Core numerological meaning */
  significado_numerologico: string;
  /** Keywords for the day's energy */
  palavras_chave: string[];
  /** Quality of the number energy */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Recommended spiritual practices for the day */
  praticas_espirituais: string[];
  /** Chakra associated with the day's energy */
  chakra: string;
  /** Sacred color of the day */
  cor: string;
}

/** Day-to-Numerology mapping based on planetary and numerological traditions */
const DAY_NUMEROLOGY_MAP: Record<string, DayNumerology> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    numero: 1,
    elemento: 'fogo',
    planeta: 'Sol',
    significado_espiritual: 'Dia de recarregar a energia vital e reconnectar com o propósito de alma. O Sol representa a luz divina que ilumina o caminho, a individualidade e a expressão autêntica do ser.',
    significado_numerologico: 'O número 1 representa novos começos, liderança,独立ência e força de vontade. É o número do pionero e do创造ador. Traz energia de renovação e confiança para iniciar ciclos.',
    palavras_chave: ['renovar', 'brilhar', 'liderar', 'criar', 'irradiar', 'propósito', 'alegria'],
    qualidade: 'fixed',
    praticas_espirituais: [
      'Meditação solar com visualização dourada',
      'Rituais de consagração de amuletos',
      'Práticas de afirmações para novos começos',
      'Conexão com o child interior e propósito de vida',
    ],
    chakra: '3º Plexo Solar',
    cor: 'Dourado',
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    numero: 2,
    elemento: 'água',
    planeta: 'Lua',
    significado_espiritual: 'Dia de introspecção, sensibilidade e conexão com a intuição profunda. A Lua reflete a luz do Sol no inconsciente, iluminando as emoções e memórias arquetípicas.',
    significado_numerologico: 'O número 2 representa dualidade, parceria, receptividade e harmonia. É o número da cooperaçao e da sintonia com os ritmos naturais. Traz energia de acolhimento e nutricalidade.',
    palavras_chave: ['acolher', 'intuir', 'fluir', 'nutrir', 'sentir', 'receber', 'conectar'],
    qualidade: 'cardinal',
    praticas_espirituais: [
      'Banhos de limpeza energética com ervas',
      'Diário de sonhos e emoções',
      'Meditação lunar e visualização prateada',
      'Conexão com ancestrais e memórias do sangue',
    ],
    chakra: '6º Frontal',
    cor: 'Prata',
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    numero: 9,
    elemento: 'fogo',
    planeta: 'Marte',
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Marte representa a energia guerreira que rompe barreiras e transforma através do fogo da determinação e da vontade sagrada.',
    significado_numerologico: 'O número 9 representa encerramento de ciclos, conclusão e iluminação. É o número da sabedoria conquistada, da compaixão universal e da transformação profunda. Traz energia de libertação e mestre.',
    palavras_chave: ['agir', 'romper', 'transformar', 'conquistar', 'libertar', 'coragem', 'força'],
    qualidade: 'cardinal',
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Corte de demandas e laços negativos',
      'Queima de firmezas e patuás',
      'Práticas de coragem e autodefesa espiritual',
    ],
    chakra: '1º Básico',
    cor: 'Vermelho',
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    numero: 5,
    elemento: 'ar',
    planeta: 'Mercúrio',
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatility intellectual. Mercúrio é o mensageiro entre céu e terra, traduzindo sabedoria em palavras e ideias em ação.',
    significado_numerologico: 'O número 5 representa liberdade, mudança e adaptabilidade. É o número do movimento, da curiosidade e da experiência variada. Traz energia de transformação mental e expansão de consciência.',
    palavras_chave: ['comunicar', 'adaptar', 'mudar', 'aprender', 'fluir', 'libertar', 'explorar'],
    qualidade: 'mutable',
    praticas_espirituais: [
      'Defumações com alecrim para clareza mental',
      'Práticas de comunicação assertiva',
      'Estudos de filosofia e espiritualidade',
      'Rituais de agilidade nos negócios',
    ],
    chakra: '5º Laríngeo',
    cor: 'Amarelo',
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    numero: 3,
    elemento: 'fogo',
    planeta: 'Júpiter',
    significado_espiritual: 'Dia de expansão, abundância e sabedoria superior. Júpiter é o guru cósmico que traz otimismo, fé e a expansão do conhecimento espiritual através da filosofia e da gratidão.',
    significado_numerologico: 'O número 3 representa criatividade, expressão e alegria. É o número da trindade sagrada, da arte e da comunicação criativa. Traz energia de expansão, optimism e manifestation através da vibração elevada.',
    palavras_chave: ['expandir', 'criar', 'abundar', 'celebrar', 'saborear', 'gratidão', 'alegria'],
    qualidade: 'mutable',
    praticas_espirituais: [
      'Rituais de fartura e prosperidade',
      'Práticas de gratidão e oração',
      'Estudos filosóficos e espirituais',
      'Busca por mentores e guias iluminados',
    ],
    chakra: '4º Cardíaco',
    cor: 'Azul',
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    numero: 6,
    elemento: 'terra',
    planeta: 'Vênus',
    significado_espiritual: 'Dia de amor, harmonia e beleza. Vênus é a deusa do amor e da beleza, trazendo magnetismo, prazer e a conexão com o sagrado feminino através da apreciação da arte e da natureza.',
    significado_numerologico: 'O número 6 representa harmonia, responsabilidade e amor. É o número do equilíbrio, da família e do serviço amoroso. Traz energia de nthancement, beleza e conexões profundas.',
    palavras_chave: ['amar', 'harmonizar', 'apreciar', 'conectar', 'cuidar', 'beleza', 'equilíbrio'],
    qualidade: 'fixed',
    praticas_espirituais: [
      'Banhos de mel e rosas para magnetismo',
      'Práticas de amor próprio',
      'Rituais de harmonização do lar',
      'Conexão com a natureza e a terra',
    ],
    chakra: '4º Cardíaco',
    cor: 'Verde',
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    numero: 8,
    elemento: 'terra',
    planeta: 'Saturno',
    significado_espiritual: 'Dia de encerramento de ciclos, disciplina e trabalho interno profundo. Saturno é o mestre que testa e fortalece através de desafios, traz estrutura, maturidade e a sabedoria da perseverança.',
    significado_numerologico: 'O número 8 representa poder, autoridade e realização material e espiritual. É o número do infinito, da abundância concreta e da loiçào kármica. Traz energia de estrutura, disciplina e sucesso através do esforço.',
    palavras_chave: ['estruturar', 'disciplinar', 'encerrar', 'amadurecer', 'purificar', 'conquistar', 'limitar'],
    qualidade: 'cardinal',
    praticas_espirituais: [
      'Rituais de encerramento de ciclos',
      'Limpeza kármica e descarregos',
      'Trabalho com ancestrais e espíritos da terra',
      'Práticas de ancoramento e disciplina',
    ],
    chakra: '1º Básico',
    cor: 'Preto',
  },
};

/**
 * Get numerology correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira', 'Domingo')
 * @returns DayNumerology mapping or undefined if day not found
 */
export function getDayNumerology(dia: string): DayNumerology | undefined {
  return DAY_NUMEROLOGY_MAP[dia];
}

/**
 * Get numerology number for a specific day
 * @param dia - Day name in Portuguese
 * @returns Numerology number or undefined if day not found
 */
export function getNumerologyByDay(dia: string): number | undefined {
  return DAY_NUMEROLOGY_MAP[dia]?.numero;
}
/**
 * Alias for getNumerologyByDay
 * @param dia - Day name in Portuguese
 * @returns Numerology number or undefined if day not found
 */
export function getNumerologyDay(dia: string): number | undefined {
  return DAY_NUMEROLOGY_MAP[dia]?.numero;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getNumerologyDays(): string[] {
  return Object.keys(DAY_NUMEROLOGY_MAP);
}

/**
 * Get all day-numerology correlations
 * @returns Array of all DayNumerology mappings
 */
export function getAllDayNumerology(): DayNumerology[] {
  return Object.values(DAY_NUMEROLOGY_MAP);
/**
 * Get all day-numerology correlations (plural alias)
 * @returns Array of all DayNumerology mappings
 */
export function getAllDayNumerologies(): DayNumerology[] {
  return Object.values(DAY_NUMEROLOGY_MAP);
}
}

/**
 * Get spiritual meaning for a specific day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: string): string | undefined {
  return DAY_NUMEROLOGY_MAP[dia]?.significado_espiritual;
}

/**
 * Get numerology properties for a specific day
 * @param dia - Day name in Portuguese
 * @returns Numerology properties or undefined if day not found
 */
export function getNumerologyProperties(dia: string): { numero: number; elemento: string; planeta: string } | undefined {
  const dayData = DAY_NUMEROLOGY_MAP[dia];
  if (!dayData) return undefined;
  return {
    numero: dayData.numero,
    elemento: dayData.elemento,
    planeta: dayData.planeta,
  };
}

/**
 * Get days associated with a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Array of day names
 */
export function getDaysByNumero(numero: number): string[] {
  return Object.values(DAY_NUMEROLOGY_MAP)
    .filter(day => day.numero === numero)
    .map(day => day.dia);
}

/**
 * Get practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of spiritual practices or undefined if day not found
 */
export function getDayNumerologyPractices(dia: string): string[] | undefined {
  return DAY_NUMEROLOGY_MAP[dia]?.praticas_espirituais;
}

/**
 * Default export with all public functions
 */
export default {
  getDayNumerology,
  getNumerologyByDay,
  getNumerologyDay,
  getNumerologyDays,
  getAllDayNumerology,
  getDaySpiritualMeaning,
  getNumerologyProperties,
  getDaysByNumero,
  getDayNumerologyPractices,
};