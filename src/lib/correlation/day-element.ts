/**
 * Day-Element Correlation Module
 * Maps days of the week to their ruling elements and spiritual practices
 * Based on classical Western elemental traditions and IDEIA.md correlations
 */

export interface DayElement {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Primary ruling element */
  elemento: 'fogo' | 'água' | 'ar' | 'terra';
  /** Elemental quality (cardinal/fixed/mutable) */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Sacred color(s) of the day */
  cor: string;
  /** Primary direction associated with the element */
  direcao: string;
  /** Season correspondence */
  estacao: string;
  /** Associated chakra for the day */
  chakra: string;
  /** Ruling planet of the day */
  planeta: string;
  /** Zodiac sign of the day */
  signo: string;
  /** Elemental properties: strengths and qualities */
  propriedades: {
    /** What the element brings to the day */
    forta: string;
    /** Keywords associated with the day's energy */
    palavras_chave: string[];
    /** Challenges to be aware of */
    desafios: string[];
  };
  /** Mystical theme and energetic focus */
  mystere: string;
  /** Recommended spiritual practices for the day */
  praticas_espirituais: string[];
}

/** Day-to-Element mapping based on classical elemental and astrological traditions */
const DAY_ELEMENT_MAP: Record<string, DayElement> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    direcao: 'Leste',
    estacao: 'Verão',
    chakra: '3º Plexo Solar',
    planeta: 'Sol',
    signo: 'Leão',
    propriedades: {
      forta: 'Vitalidade, brilho pessoal, propósito de vida, energia radiante, liderança iluminada',
      palavras_chave: ['recarregar', 'brilho', 'propósito', 'irradiar', 'liderança', 'alegria'],
      desafios: ['egocentrismo', 'sobredose de ego', 'impaciência', 'exaustão por excesso de atividade'],
    },
    mystere: 'Dia de recarregar a energia vital, focar no poder pessoal, brilho próprio e propósito de vida. Reinar com coração generoso e irradiar luz interior.',
    praticas_espirituais: [
      'Exposição solar consciente (tomar sol com intenção)',
      'Meditação com visualização dourada no plexo solar',
      'Rituais de consagração de amuletos e talismãs',
      'Práticas de liderança e comando sagrado',
      'Gratidão pela vida e pelo propósito',
    ],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    direcao: 'Oeste',
    estacao: 'Outono',
    chakra: '6º Frontal / 4º Cardíaco',
    planeta: 'Lua',
    signo: 'Câncer',
    propriedades: {
      forta: 'Intuição profunda, sensibilidade emocional, acolhimento, conexão com o inconsciente, nutricalidade',
      palavras_chave: ['acolher', 'intuir', 'fluir', 'nutrir', 'sentir', 'receber'],
      desafios: ['vulnerabilidade excessiva', 'melancolia', 'dificuldade de estabelecer limites', 'supersensibilidade'],
    },
    mystere: 'Dia de introspecção, sensibilidade emocional e conexão com a criança interior. Acolher as emoções, nutrir-se e cultivar a intuíção profunda.',
    praticas_espirituais: [
      'Banhos de limpeza energética com ervas receptivas',
      'Meditação lunar (especialmente no luar)',
      'Diário de emoções e sonhos',
      'Práticas de autoacolhimento e autocuidado',
      'Conexão com ancestrais e memórias do sangue',
    ],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    direcao: 'Sul',
    estacao: 'Primavera',
    chakra: '2º Sacro / 5º Laríngeo',
    planeta: 'Marte',
    signo: 'Áries',
    propriedades: {
      forta: 'Coragem, ação decisiva, força guerreira, iniciação, quebra de barreiras, movimento',
      palavras_chave: ['agir', 'atacar', 'romper', 'iniciar', 'conquistar', 'transformar'],
      desafios: ['agressividade', 'impulsividade', 'conflitos desnecessários', 'impaciência extrema'],
    },
    mystere: 'Dia de força, coragem e ação decisiva. Romper barreiras, iniciar projetos audazes e canalizar a energia guerreira para a transformação.',
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Corte de demandas e laços energéticos',
      'Queima de firmezas e patuás negativados',
      'Práticas de coragem e autodefesa espiritual',
      'Ação decisiva com foco na transformação',
    ],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Cinzento',
    direcao: 'Norte',
    estacao: 'Inverno',
    chakra: '5º Laríngeo',
    planeta: 'Mercúrio',
    signo: 'Gêmeos',
    propriedades: {
      forta: 'Versatilidade mental, comunicação clara, agilidade intelectual, adaptabilidade, múltiplas perspectivas',
      palavras_chave: ['comunicar', 'adaptar', 'estudar', 'negociar', 'analisar', 'trocar'],
      desafios: ['superficialidade', 'ansiedade mental', 'inconstância', 'excesso de informação'],
    },
    mystere: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Comunicar-se com clareza, estudar, negociar e adaptar-se às circunstâncias.',
    praticas_espirituais: [
      'Defumações com alecrim e estoraque para clareza mental',
      'Práticas de comunicação assertiva',
      'Estudos e meditações sobre a verdade',
      'Rituais de agilidade nos negócios',
      'Exercícios de equilíbrio entre razão e intuição',
    ],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    direcao: 'Nordeste',
    estacao: 'Primavera',
    chakra: '4º Cardíaco / 7º Coronário',
    planeta: 'Júpiter',
    signo: 'Sagitário',
    propriedades: {
      forta: 'Expansão, abundância, sabedoria superior, fé, философствование, otimismo, crescimento',
      palavras_chave: ['expandir', 'abundar', 'saborear', 'crescer', 'crer', 'evoluir'],
      desafios: ['excesso de otimismo', 'extravagância', 'dogmatismo', 'inquietação constante'],
    },
    mystere: 'Dia de expansão, abundância e busca pelo conhecimento superior. Expandir horizontes, agradecer pelas bênçãos e filosofar sobre o sentido da vida.',
    praticas_espirituais: [
      'Rituais de fartura e prosperidade',
      'Orações de agradecimento e expansão',
      'Estudos filosóficos e espirituais profundos',
      'Busca por mentores e guias iluminados',
      'Práticas de fé e confiança no divino',
    ],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    direcao: 'Sudoeste',
    estacao: 'Outono',
    chakra: '4º Cardíaco / 1º Básico',
    planeta: 'Vênus',
    signo: 'Touro',
    propriedades: {
      forta: 'Amor, harmonia, beleza, prazer, sensualidade, estabilidade, conexão com a natureza',
      palavras_chave: ['amar', 'harmonizar', 'apreciar', 'fluir', 'atrair', 'construir'],
      desafios: ['materialismo', 'gordura emocional', 'relutância à mudança', 'posse excessiva'],
    },
    mystere: 'Dia de amor, harmonia e beleza. Cultivar relações, apreciar a natureza, dedicar-se à arte e encontrar prazer nas coisas simples da vida.',
    praticas_espirituais: [
      'Banhos de mel e rosas para magnetismo pessoal',
      'Práticas de amor próprio e autoapreciação',
      'Rituais de harmonização do lar',
      'Conexão com a natureza e a terra',
      'Cultivo de prazer e gratidão pelos sentidos',
    ],
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Preto / Azul Escuro',
    direcao: 'Norte',
    estacao: 'Inverno',
    chakra: '1º Básico / 6º Frontal',
    planeta: 'Saturno',
    signo: 'Capricórnio',
    propriedades: {
      forta: 'Estrutura, disciplina, encerramento de ciclos, purificação kármica, ancoramento, maturidade',
      palavras_chave: ['estruturar', 'disciplinar', 'encerrar', 'limitar', 'purificar', 'amadurecer'],
      desafios: ['rigidez', 'pessimismo', 'melancolia', 'medo da escassez'],
    },
    mystere: 'Dia de encerramento de ciclos, disciplina espiritual e trabalho interno profundo. Aterramento, purificação kármica e organização estrutural para o novo.',
    praticas_espirituais: [
      'Rituais de encerramento e despedida de ciclos',
      'Limpeza kármica e descarregos pesados',
      'Trabalho com ancestrais e espíritos da terra',
      'Práticas de ancoramento e aterramento profundo',
      'Organização material e espiritual do espaço sagrado',
    ],
  },
};

/**
 * Get element correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira', 'Domingo')
 * @returns DayElement mapping or undefined if day not found
 */
export function getDayElement(dia: string): DayElement | undefined {
  return DAY_ELEMENT_MAP[dia];
}

/**
 * Get element for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element name or undefined if day not found
 */
export function getElementByDay(dia: string): string | undefined {
  return DAY_ELEMENT_MAP[dia]?.elemento;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_ELEMENT_MAP);
}

/**
 * Get element for a specific day (alias for getElementByDay)
 * @param dia - Day name in Portuguese
 * @returns Element name or undefined if day not found
 */
export function getElementDays(dia: string): string | undefined {
  return DAY_ELEMENT_MAP[dia]?.elemento;
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('fogo', 'água', 'ar', 'terra')
 * @returns Array of day names
 */
export function getDaysByElemento(elemento: string): string[] {
  return Object.entries(DAY_ELEMENT_MAP)
    .filter(([_, data]) => data.elemento === elemento)
    .map(([dia]) => dia);
}

/**
 * Get all day-element correlations
 * @returns Array of all DayElement mappings
 */
export function getAllDayElements(): DayElement[] {
  return Object.values(DAY_ELEMENT_MAP);
}

/**
 * Get spiritual practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of spiritual practices or undefined if day not found
 */
export function getDayPractices(dia: string): string[] | undefined {
  return DAY_ELEMENT_MAP[dia]?.praticas_espirituais;
}

/**
 * Get element properties for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element properties or undefined if day not found
 */
export function getElementProperties(dia: string): DayElement['propriedades'] | undefined {
  return DAY_ELEMENT_MAP[dia]?.propriedades;
}

export default {
  getDayElement,
  getElementByDay,
  getAllDays,
  getElementDays,
  getDaysByElemento,
  getAllDayElements,
  getDayPractices,
  getElementProperties,
};