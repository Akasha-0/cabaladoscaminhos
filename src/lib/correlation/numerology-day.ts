/**
 * Numerology-Day Correlation Module
 * Maps numerology numbers to their ruling days and spiritual meanings
 * Inverse correlation of day-numerology for lookup by number
 */

/**
 * Numerology day mapping interface
 */
export interface NumerologyDay {
  /** Numerology number (1-9 or master numbers 11, 22, 33) */
  numero: number;
  /** Day of the week associated with this number in Portuguese */
  dia: string;
  /** Associated element */
  elemento: string;
  /** Primary ruling planet */
  planeta: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Mystical theme and energetic focus */
  significado_espiritual: string;
  /** Core numerological meaning */
  significado_numerologico: string;
  /** Keywords for the number's energy */
  palavras_chave: string[];
  /** Quality of the number energy */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Recommended spiritual practices for this number-day */
  praticas_espirituais: string[];
  /** Chakra associated with this energy */
  chakra: string;
  /** Sacred color */
  cor: string;
}

/** Numerology-to-Day mapping based on planetary and numerological traditions */
const NUMEROLOGY_DAY_MAP: Record<number, NumerologyDay> = {
  1: {
    numero: 1,
    dia: 'Domingo',
    elemento: 'fogo',
    planeta: 'Sol',
    indice: 0,
    significado_espiritual: 'Dia de recarregar a energia vital e reconnectar com o propósito de alma. O Sol representa a luz divina que ilumina o caminho, a individualidade e a expressão autêntica do ser.',
    significado_numerologico: 'O número 1 representa novos começos, liderança, independência e força de vontade. É o número do pioneiro e do criador. Traz energia de renovação e confiança para iniciar ciclos.',
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
  2: {
    numero: 2,
    dia: 'Segunda-feira',
    elemento: 'água',
    planeta: 'Lua',
    indice: 1,
    significado_espiritual: 'Dia de introspecção, sensibilidade e conexão com a intuição profunda. A Lua reflete a luz do Sol no inconsciente, iluminando as emoções e memórias arquetípicas.',
    significado_numerologico: 'O número 2 representa dualidade, parceria, receptividade e harmonia. É o número da cooperação e da sintonia com os ritmos naturais. Traz energia de acolhimento e nutricalidade.',
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
  3: {
    numero: 3,
    dia: 'Quinta-feira',
    elemento: 'fogo',
    planeta: 'Júpiter',
    indice: 4,
    significado_espiritual: 'Dia de expansão, abundância e sabedoria superior. Júpiter é o guru cósmico que traz otimismo, fé e a expansão do conhecimento espiritual através da filosofia e da gratidão.',
    significado_numerologico: 'O número 3 representa criatividade, expressão e alegria. É o número da trindade sagrada, da arte e da comunicação criativa. Traz energia de expansão, otimismo e manifestação através da vibração elevada.',
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
  5: {
    numero: 5,
    dia: 'Quarta-feira',
    elemento: 'ar',
    planeta: 'Mercúrio',
    indice: 3,
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Mercúrio é o mensageiro entre céu e terra, traduzindo sabedoria em palavras e ideias em ação.',
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
  6: {
    numero: 6,
    dia: 'Sexta-feira',
    elemento: 'terra',
    planeta: 'Vênus',
    indice: 5,
    significado_espiritual: 'Dia de amor, harmonia e beleza. Vênus é a deusa do amor e da beleza, trazendo magnetismo, prazer e a conexão com o sagrado feminino através da apreciação da arte e da natureza.',
    significado_numerologico: 'O número 6 representa harmonia, responsabilidade e amor. É o número do equilíbrio, da família e do serviço amoroso. Traz energia de realce, beleza e conexões profundas.',
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
  8: {
    numero: 8,
    dia: 'Sábado',
    elemento: 'terra',
    planeta: 'Saturno',
    indice: 6,
    significado_espiritual: 'Dia de encerramento de ciclos, disciplina e trabalho interno profundo. Saturno é o mestre que testa e fortalece através de desafios, traz estrutura, maturidade e a sabedoria da perseverança.',
    significado_numerologico: 'O número 8 representa poder, autoridade e realização material e espiritual. É o número do infinito, da abundância concreta e da ação kármica. Traz energia de estrutura, disciplina e sucesso através do esforço.',
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
  9: {
    numero: 9,
    dia: 'Terça-feira',
    elemento: 'fogo',
    planeta: 'Marte',
    indice: 2,
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Marte representa a energia guerreira que rompe barreiras e transforma através do fogo da determinação e da vontade sagrada.',
    significado_numerologico: 'O número 9 representa encerramento de ciclos, conclusão e iluminação. É o número da sabedoria conquistada, da compaixão universal e da transformação profunda. Traz energia de libertação e mestria.',
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
};

/**
 * Get day correlation for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns NumerologyDay mapping or undefined if number not found
 */
export function getNumerologyDay(numero: number): NumerologyDay | undefined {
  return NUMEROLOGY_DAY_MAP[numero];
}

/**
 * Get day name for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Day name in Portuguese or undefined if number not found
 */
export function getDayNumerology(numero: number): string | undefined {
  return NUMEROLOGY_DAY_MAP[numero]?.dia;
}

/**
 * Get element for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Element or undefined if number not found
 */
export function getNumerologyElement(numero: number): string | undefined {
  return NUMEROLOGY_DAY_MAP[numero]?.elemento;
}

/**
 * Get planet for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Planet or undefined if number not found
 */
export function getNumerologyPlanet(numero: number): string | undefined {
  return NUMEROLOGY_DAY_MAP[numero]?.planeta;
}

/**
 * Get all numerology numbers mapped to days
 * @returns Array of numerology numbers
 */
export function getAllNumerologyDays(): number[] {
  return Object.keys(NUMEROLOGY_DAY_MAP).map(Number);
}

/**
 * Get all numerology-day correlations
 * @returns Array of all NumerologyDay mappings
 */
export function getAllNumerologyDayCorrelations(): NumerologyDay[] {
  return Object.values(NUMEROLOGY_DAY_MAP);
}

/**
 * Get spiritual meaning for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Spiritual meaning or undefined if number not found
 */
export function getNumerologyDaySpiritualMeaning(numero: number): string | undefined {
  return NUMEROLOGY_DAY_MAP[numero]?.significado_espiritual;
}

/**
 * Get numerology properties for a specific number
 * @param numero - Numerology number (1-9)
 * @returns Numerology properties or undefined if number not found
 */
export function getNumerologyDayProperties(numero: number): { numero: number; dia: string; elemento: string; planeta: string } | undefined {
  const mapping = NUMEROLOGY_DAY_MAP[numero];
  if (!mapping) return undefined;
  return {
    numero: mapping.numero,
    dia: mapping.dia,
    elemento: mapping.elemento,
    planeta: mapping.planeta,
  };
}

/**
 * Get practices for a specific numerology number
 * @param numero - Numerology number (1-9)
 * @returns Array of spiritual practices or undefined if number not found
 */
export function getNumerologyDayPractices(numero: number): string[] | undefined {
  return NUMEROLOGY_DAY_MAP[numero]?.praticas_espirituais;
}

/**
 * Default export with all public functions
 */
export default {
  getNumerologyDay,
  getDayNumerology,
  getNumerologyElement,
  getNumerologyPlanet,
  getAllNumerologyDays,
  getAllNumerologyDayCorrelations,
  getNumerologyDaySpiritualMeaning,
  getNumerologyDayProperties,
  getNumerologyDayPractices,
};