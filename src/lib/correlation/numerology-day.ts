/**
 * Numerology-Day Spiritual Correlation
 * Maps numerology numbers (1-9) to days of the week with element connections and spiritual meanings
 * Based on classical Western numerological traditions and Cabala dos Caminhos spiritual system
 */

/**
 * Available elements for correlation
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Numerology-Day mapping interface
 */
export interface NumerologyDayMapping {
  /** The numerology number (1-9) */
  numero: number;
  /** Associated day of the week */
  dia: string;
  /** Day name in Portuguese */
  dia_portugues: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Element connection */
  elemento: Elemento;
  /** Planetary ruler */
  planeta: string;
  /** Energy quality type */
  qualidade_energetica: {
    tipo: 'Quente' | 'Frio' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
    vibração: string;
  };
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Core numerological meaning for the day */
  significado_numerologico: string;
  /** Archetype/role name */
  arquétipo: string;
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

/**
 * Complete mapping of numerology numbers 1-9 to their day correspondences.
 * Based on planetary numerology and Western esoteric traditions.
 */
export const NUMERO_DIA_MAP: Record<number, NumerologyDayMapping> = {
  1: {
    numero: 1,
    dia: 'Sunday',
    dia_portugues: 'Domingo',
    indice: 0,
    elemento: 'Fogo',
    planeta: 'Sol',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Iniciação, força primal, liderança, manifestação',
    },
    significado_espiritual: 'Dia de recarregar a energia vital e reconectar com o propósito de alma. O Sol representa a luz divina que ilumina o caminho, a individualidade e a expressão autêntica do ser. O número 1 traz a energia do pioneiro, do criador, daquele que leadership o caminho.',
    significado_numerologico: 'O número 1 representa novos começos, liderança, independência e força de vontade. É o número do pioneiro e do criador. Traz energia de renovação e confiança para iniciar ciclos de transformação.',
    arquétipo: 'O Iniciador / O Líder',
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
    dia: 'Monday',
    dia_portugues: 'Segunda-feira',
    indice: 1,
    elemento: 'Água',
    planeta: 'Lua',
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Receptividade, dualidade, equilíbrio, fluídez emocional',
    },
    significado_espiritual: 'Dia de introspecção, sensibilidade e conexão com a intuição profunda. A Lua reflete a luz do Sol no inconsciente, iluminando as emoções e memórias arquetípicas. O número 2 traz a energia da parceria, da cooperação e da harmonia.',
    significado_numerologico: 'O número 2 representa dualidade, parceria, receptividade e harmonia. É o número da cooperação e da sintonia com os ritmos naturais. Traz energia de acolhimento e nutricalidade.',
    arquétipo: 'O Diplomata / O Par',
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
    dia: 'Thursday',
    dia_portugues: 'Quinta-feira',
    indice: 4,
    elemento: 'Água',
    planeta: 'Júpiter',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Expansão, abundância, otimismo, expressão criativa',
    },
    significado_espiritual: 'Dia de expansão, abundância e crescimento espiritual. Júpiter representa a expansão da consciência, a sabedoria superior e a conexão com o divino. O número 3 traz a energia da criatividade e da comunicação sagrada.',
    significado_numerologico: 'O número 3 representa comunicação, criatividade, otimismo e expressão. É o número da festividade e da alegria de viver. Traz energia de expansão e abundância em todos os níveis.',
    arquétipo: 'O Comunicador / O Criador',
    palavras_chave: ['expandir', 'celebrar', 'comunicar', 'criar', 'abundar', 'otimizar', 'celebrar'],
    qualidade: 'mutable',
    praticas_espirituais: [
      'Orações de agradecimento e prosperidade',
      'Práticas de generosidade e partilha',
      'Meditação de expansão de consciência',
      'Rituais de bênção para novos empreendimentos',
    ],
    chakra: '4º Cardíaco',
    cor: 'Azul Royale',
  },
  4: {
    numero: 4,
    dia: 'Saturday',
    dia_portugues: 'Sábado',
    indice: 6,
    elemento: 'Terra',
    planeta: 'Saturno',
    qualidade_energetica: {
      tipo: 'Frio',
      polaridade: 'Yin',
      vibração: 'Estrutura, disciplina, raízes profundas, trabalho sagrado',
    },
    significado_espiritual: 'Dia de estruturação, disciplina e trabalho interior. Saturno representa a lei cósmica, a paciência e a sabedoria conquistada através da experiência. O número 4 traz a energia da construção de alicerces sólidos.',
    significado_numerologico: 'O número 4 representa estrutura, estabilidade, trabalho e disciplina. É o número do construtor que estabelece bases sólidas para o futuro. Traz energia de organização e perseverança.',
    arquétipo: 'O Construtor / A Estrutura',
    palavras_chave: ['estruturar', 'disciplinar', 'fundamentar', 'trabalhar', 'raizar', 'organizar', 'persistir'],
    qualidade: 'cardinal',
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Práticas de meditação em solo sagrado',
      'Trabalho com ancestrais e raízes',
      'Descarrego e proteção de ambientes',
    ],
    chakra: '1º Básico',
    cor: 'Preto',
  },
  5: {
    numero: 5,
    dia: 'Wednesday',
    dia_portugues: 'Quarta-feira',
    indice: 3,
    elemento: 'Ar',
    planeta: 'Mercúrio',
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Liberdade, adaptabilidade, transformação, alquimia interior',
    },
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Mercúrio é o mensageiro entre céu e terra, traduzindo sabedoria em palavras e ideias em ação. O número 5 traz a energia da liberdade e da transformação.',
    significado_numerologico: 'O número 5 representa liberdade, mudança e adaptabilidade. É o número do movimento, da curiosidade e da experiência variada. Traz energia de transformação mental e expansão de consciência.',
    arquétipo: 'O Libertador / O Mensageiro',
    palavras_chave: ['adaptar', 'comunicar', 'transformar', 'liberar', 'curiosar', 'mover', 'fluir'],
    qualidade: 'cardinal',
    praticas_espirituais: [
      'Meditação de limpeza mental',
      'Práticas de comunicação consciente',
      'Rituais de libertação de padrões limitantes',
      'Estudos de sabedoria e escrita sagrada',
    ],
    chakra: '5º Laríngeo',
    cor: 'Amarelo',
  },
  6: {
    numero: 6,
    dia: 'Friday',
    dia_portugues: 'Sexta-feira',
    indice: 5,
    elemento: 'Terra',
    planeta: 'Vênus',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Harmonia, amor, beleza, serviços sagrado',
    },
    significado_espiritual: 'Dia do amor, da harmonia e da beleza interior. Vênus representa a energia do amor universal, da estética e do equilíbrio. O número 6 traz a energia do serviço sagrado e da conexão com o belo.',
    significado_numerologico: 'O número 6 representa harmonia, amor, beleza e serviço. É o número do healer e do equilibrador. Traz energia de paz, reconciliação e koneksião emocional.',
    arquétipo: 'O Curador / O Equilibrador',
    palavras_chave: ['harmonizar', 'amar', 'curar', 'belejar', 'servir', 'connectar', 'equilibrar'],
    qualidade: 'fixed',
    praticas_espirituais: [
      'Rituais de amor próprio e autoestima',
      'Práticas de harmonização de relacionamentos',
      'Meditação de conexão com a beleza interior',
      'Sessões de cura energética e reconciliação',
    ],
    chakra: '2º Sacro',
    cor: 'Verde',
  },
  7: {
    numero: 7,
    dia: 'Sunday',
    dia_portugues: 'Domingo',
    indice: 0,
    elemento: 'Fogo',
    planeta: 'Sol',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Sabedoria interior, introspecção, mistério, contemplação',
    },
    significado_espiritual: 'Dia de reflexão profunda, sabedoria interior e contemplação mística. O Sol em sua expressão mais elevada traz a luz da verdade íntima. O número 7 representa a busca do conhecimento sagrado.',
    significado_numerologico: 'O número 7 representa introspecção, sabedoria, espiritualidade e mistério. É o número do buscador e do contemplativo. Traz energia de busca interior e conexão com o divino.',
    arquétipo: 'O Sábio / O Contemplativo',
    palavras_chave: ['refletir', 'meditar', 'sagrar', 'buscar', 'contemplar', 'mysticar', 'iluminar'],
    qualidade: 'fixed',
    praticas_espirituais: [
      'Meditação profunda e contemplação',
      'Estudos de textos sagrados e filosofia',
      'Rituais de iniciação e despertar espiritual',
      'Práticas de silêncio e recolhimento interior',
    ],
    chakra: '6º Frontal',
    cor: 'Branco',
  },
  8: {
    numero: 8,
    dia: 'Saturday',
    dia_portugues: 'Sábado',
    indice: 6,
    elemento: 'Éter',
    planeta: 'Saturno',
    qualidade_energetica: {
      tipo: 'Neutro',
      polaridade: 'Equilibrado',
      vibração: 'Abundância material e espiritual, karma, transformação profunda',
    },
    significado_espiritual: 'Dia de manifestação de abundância e conclusão de ciclos kármicos. Saturno em sua expressão mais alta traz a energia da transformação radical. O número 8 representa o poder de criar realidade.',
    significado_numerologico: 'O número 8 representa abundância, poder, realização e karma. É o número do mestre que domina tanto o material quanto o espiritual. Traz energia de conclusão e renovação profunda.',
    arquétipo: 'O Mestre / O Manifestador',
    palavras_chave: ['manifestar', 'transformar', 'concluir', 'abundar', 'reinar', 'karmar', 'poderar'],
    qualidade: 'fixed',
    praticas_espirituais: [
      'Rituais de manifestação e abundância',
      'Práticas de destruição de obras',
      'Trabalho com lei karma e conclusões',
      'Meditação de poder pessoal e autoridade',
    ],
    chakra: '7º Coronário',
    cor: 'Violeta',
  },
  9: {
    numero: 9,
    dia: 'Tuesday',
    dia_portugues: 'Terça-feira',
    indice: 2,
    elemento: 'Fogo',
    planeta: 'Marte',
    qualidade_energetica: {
      tipo: 'Quente',
      polaridade: 'Yang',
      vibração: 'Força, coragem, ação, transformação, guerreiro sagrado',
    },
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Marte representa a energia guerreira que rompe barreiras e transforma através do fogo da determinação. O número 9 traz a energia da iluminação e da transformação profunda.',
    significado_numerologico: 'O número 9 representa encerramento de ciclos, conclusão e iluminação. É o número da sabedoria conquistada, da compaixão universal e da transformação profunda. Traz energia de libertação e mestre.',
    arquétipo: 'O Guerreiro / O Iluminado',
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
 * Returns the day correlation for a given numerology number (1-9)
 * @param numero - The number to look up (1-9)
 * @returns NumerologyDayMapping or null if invalid
 */
export function getNumerologyDay(numero: number): NumerologyDayMapping | null {
  return NUMERO_DIA_MAP[numero] ?? null;
}

/**
 * Get all numerology day mappings
 * @returns Array of all NumerologyDayMapping objects for numbers 1-9
 */
export function getAllNumerologyDays(): NumerologyDayMapping[] {
  return Object.values(NUMERO_DIA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Returns all data for the getDayNumerology export (alias function)
 * @returns Array of all NumerologyDayMapping objects
 */
export function getDayNumerology(): NumerologyDayMapping[] {
  return getAllNumerologyDays();
}

/**
 * Returns the day name for a given number
 * @param numero - The number to look up (1-9)
 * @returns Day name in Portuguese or null if invalid
 */
export function getDayByNumero(numero: number): string | null {
  return NUMERO_DIA_MAP[numero]?.dia_portugues ?? null;
}

/**
 * Returns the element for a given number
 * @param numero - The number to look up (1-9)
 * @returns Elemento or null if invalid
 */
export function getElementByNumero(numero: number): Elemento | null {
  return NUMERO_DIA_MAP[numero]?.elemento ?? null;
}

/**
 * Returns the planet for a given number
 * @param numero - The number to look up (1-9)
 * @returns Planet name or null if invalid
 */
export function getPlanetByNumero(numero: number): string | null {
  return NUMERO_DIA_MAP[numero]?.planeta ?? null;
}

/**
 * Returns the spiritual meaning for a given number
 * @param numero - The number to look up (1-9)
 * @returns Spiritual meaning or null if invalid
 */
export function getSpiritualMeaningByNumero(numero: number): string | null {
  return NUMERO_DIA_MAP[numero]?.significado_espiritual ?? null;
}

/**
 * Default export with all public functions
 */
export default {
  getNumerologyDay,
  getDayNumerology,
  getAllNumerologyDays,
  getDayByNumero,
  getElementByNumero,
  getPlanetByNumero,
  getSpiritualMeaningByNumero,
};