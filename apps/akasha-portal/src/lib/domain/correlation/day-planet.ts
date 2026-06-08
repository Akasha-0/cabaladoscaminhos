/**
 * Day-Planet Correlation Module
 * Maps days of the week to their ruling planets and spiritual significance
 * Based on classical Western astrological traditions and planetary hours
 */

/** Supported planetary ruling bodies */
export type Planet = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

/** Elemental correspondence for each planet */
export type Element = 'fogo' | 'água' | 'ar' | 'terra';

export interface DayPlanet {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Primary ruling planet */
  planeta: Planet;
  /** Planet symbol for display */
  simbolo: string;
  /** Associated element */
  elemento: Element;
  /** Elemental quality */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Day color correspondence */
  cor: string;
  /** Primary direction */
  direcao: string;
  /** Season correspondence */
  estacao: string;
  /** Associated chakra */
  chakra: string;
  /** Zodiac sign ruling the day */
  signo: string;
  /** Planetary properties and influences */
  propriedades: {
    /** Core strengths and energies */
    forta: string;
    /** Keywords for the day's energy */
    palavras_chave: string[];
    /** Challenges to be aware of */
    desafios: string[];
  };
  /** Spiritual meaning and mystical significance */
  significado_espiritual: string;
  /** Planetary hour correspondences */
  horas_planetarias: {
    /** Planet ruling the first hour */
    inicio: Planet;
    /** Best hours for spiritual work */
    horas_favoraveis: string[];
    /** Hours to use with caution */
    horas_desafio: string[];
  };
  /** Recommended spiritual practices for the day */
  praticas_espirituais: string[];
}

/** Day-to-Planet mapping based on classical astrological traditions */
const DAY_PLANET_MAP: Record<string, DayPlanet> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    planeta: 'Sol',
    simbolo: '☉',
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    direcao: 'Leste',
    estacao: 'Verão',
    chakra: '3º Plexo Solar',
    signo: 'Leão',
    propriedades: {
      forta: 'Vitalidade, brilho pessoal, propósito de vida, energia radiante, liderança iluminada, criatividade',
      palavras_chave: ['recarregar', 'brilho', 'propósito', 'irradiar', 'liderança', 'alegria', 'criatividade'],
      desafios: ['egocentrismo', 'sobredose de ego', 'impaciência', 'exaustão por excesso de atividade'],
    },
    significado_espiritual: 'O Sol representa a alma individual, o propósito de vida e a luz interior. Domingo é o dia de recarregar a energia vital, focar no poder pessoal e irradiar luz própria. É um dia de renovação espiritual e conexão com o divino dentro de si.',
    horas_planetarias: {
      inicio: 'Sol',
      horas_favoraveis: ['Sol', 'Júpiter'],
      horas_desafio: ['Saturno', 'Marte'],
    },
    praticas_espirituais: [
      'Exposição solar consciente (tomar sol com intenção)',
      'Meditação com visualização dourada no plexo solar',
      'Rituais de consagração de amuletos e talismãs',
      'Práticas de liderança e comando sagrado',
      'Gratidão pela vida e pelo propósito',
      'Rituais de cura com luz dourada',
    ],
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    planeta: 'Lua',
    simbolo: '☽',
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    direcao: 'Oeste',
    estacao: 'Outono',
    chakra: '6º Frontal / 4º Cardíaco',
    signo: 'Câncer',
    propriedades: {
      forta: 'Intuição profunda, sensibilidade emocional, acolhimento, conexão com o inconsciente, nutricalidade, memória',
      palavras_chave: ['acolher', 'intuir', 'fluir', 'nutrir', 'sentir', 'receber', 'lembrar'],
      desafios: ['vulnerabilidade excessiva', 'melancolia', 'dificuldade de estabelecer limites', 'supersensibilidade'],
    },
    significado_espiritual: 'A Lua representa o princípio feminino, a emoção e a intuíção. Segunda-feira é dia de introspecção, sensibilidade emocional e conexão com a criança interior. Acolher as emoções, nutrir-se e cultivar a intuíção profunda são práticas essenciais.',
    horas_planetarias: {
      inicio: 'Lua',
      horas_favoraveis: ['Lua', 'Vênus'],
      horas_desafio: ['Marte', 'Sol'],
    },
    praticas_espirituais: [
      'Banhos de limpeza energética com ervas receptivas',
      'Meditação lunar (especialmente no luar)',
      'Diário de emoções e sonhos',
      'Práticas de autoacolhimento e autocuidado',
      'Conexão com ancestrais e memórias do sangue',
      'Rituais de fertilidade e nutricalidade',
    ],
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    planeta: 'Marte',
    simbolo: '♂',
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    direcao: 'Sul',
    estacao: 'Primavera',
    chakra: '2º Sacro / 5º Laríngeo',
    signo: 'Áries',
    propriedades: {
      forta: 'Coragem, ação decisiva, força guerreira, iniciação, quebra de barreiras, movimento, proteção',
      palavras_chave: ['agir', 'atacar', 'romper', 'iniciar', 'conquistar', 'transformar', 'defender'],
      desafios: ['agressividade', 'impulsividade', 'conflitos desnecessários', 'impaciência extrema'],
    },
    significado_espiritual: 'Marte representa a energia Yang, a força guerreira e a ação. Terça-feira é dia de força, coragem e ação decisiva. É o momento de romper barreiras, iniciar projetos audazes e canalizar a energia guerreira para a transformação e proteção.',
    horas_planetarias: {
      inicio: 'Marte',
      horas_favoraveis: ['Marte', 'Sol'],
      horas_desafio: ['Lua', 'Júpiter'],
    },
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Corte de demandas e laços energéticos',
      'Queima de firmezas e patuás negativados',
      'Práticas de coragem e autodefesa espiritual',
      'Ação decisiva com foco na transformação',
      'Rituais de descarrego e limpeza pesada',
    ],
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    planeta: 'Mercúrio',
    simbolo: '☿',
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Cinzento',
    direcao: 'Norte',
    estacao: 'Inverno',
    chakra: '5º Laríngeo',
    signo: 'Gêmeos',
    propriedades: {
      forta: 'Versatilidade mental, comunicação clara, agilidade intelectual, adaptabilidade, múltiplas perspectivas, negociação',
      palavras_chave: ['comunicar', 'adaptar', 'estudar', 'negociar', 'analisar', 'trocar', 'aprender'],
      desafios: ['superficialidade', 'ansiedade mental', 'inconstância', 'excesso de informação'],
    },
    significado_espiritual: 'Mercúrio é o mensageiro dos deuses, representando a mente e a comunicação. Quarta-feira é dia da mente ágil, comunicação clara e versatilidade intelectual. É propício para estudar, negociar, adaptar-se e cultivar a sabedoria através da troca de ideias.',
    horas_planetarias: {
      inicio: 'Mercúrio',
      horas_favoraveis: ['Mercúrio', 'Lua'],
      horas_desafio: ['Saturno', 'Vênus'],
    },
    praticas_espirituais: [
      'Defumações com alecrim e estoraque para clareza mental',
      'Práticas de comunicação assertiva',
      'Estudos e meditações sobre a verdade',
      'Rituais de agilidade nos negócios',
      'Exercícios de equilíbrio entre razão e intuição',
      'Rituais de escrita sagrada e meditação verbal',
    ],
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    planeta: 'Júpiter',
    simbolo: '♃',
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    direcao: 'Nordeste',
    estacao: 'Primavera',
    chakra: '4º Cardíaco / 7º Coronário',
    signo: 'Sagitário',
    propriedades: {
      forta: 'Expansão, abundância, sabedoria superior, fé, filosofar, otimismo, crescimento, justiça',
      palavras_chave: ['expandir', 'abundar', 'saborear', 'crescer', 'crer', 'evoluir', 'justificar'],
      desafios: ['excesso de otimismo', 'extravagância', 'dogmatismo', 'inquietação constante'],
    },
    significado_espiritual: 'Júpiter representa a expansão, a abundância e a sabedoria superior. Quinta-feira é dia de expansão, abundância e busca pelo conhecimento divino. É momento de expandir horizontes, agradecer pelas bênçãos e filosofar sobre o sentido transcendente da vida.',
    horas_planetarias: {
      inicio: 'Júpiter',
      horas_favoraveis: ['Júpiter', 'Sol'],
      horas_desafio: ['Mercúrio', 'Lua'],
    },
    praticas_espirituais: [
      'Rituais de fartura e prosperidade',
      'Orações de agradecimento e expansão',
      'Estudos filosóficos e espirituais profundos',
      'Busca por mentores e guias iluminados',
      'Práticas de fé e confiança no divino',
      'Rituais de benção e expansão de consciência',
    ],
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    planeta: 'Vênus',
    simbolo: '♀',
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    direcao: 'Sudoeste',
    estacao: 'Outono',
    chakra: '4º Cardíaco / 1º Básico',
    signo: 'Touro',
    propriedades: {
      forta: 'Amor, harmonia, beleza, prazer, sensualidade, estabilidade, conexão com a natureza, magnetismo',
      palavras_chave: ['amar', 'harmonizar', 'apreciar', 'fluir', 'atrair', 'construir', 'sensualizar'],
      desafios: ['materialismo', 'gordura emocional', 'relutância à mudança', 'posse excessiva'],
    },
    significado_espiritual: 'Vênus representa o amor, a beleza e a harmonia. Sexta-feira é dia de amor, conexão afetiva e beleza. É propício para cultivar relações, apreciar a natureza, dedicar-se à arte e encontrar prazer nas coisas simples e sensuais da vida.',
    horas_planetarias: {
      inicio: 'Vênus',
      horas_favoraveis: ['Vênus', 'Lua'],
      horas_desafio: ['Marte', 'Saturno'],
    },
    praticas_espirituais: [
      'Banhos de mel e rosas para magnetismo pessoal',
      'Práticas de amor próprio e autoapreciação',
      'Rituais de harmonização do lar',
      'Conexão com a natureza e a terra',
      'Cultivo de prazer e gratidão pelos sentidos',
      'Rituais de amor e reconciliação',
    ],
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    planeta: 'Saturno',
    simbolo: '♄',
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Preto / Azul Escuro',
    direcao: 'Norte',
    estacao: 'Inverno',
    chakra: '1º Básico / 6º Frontal',
    signo: 'Capricórnio',
    propriedades: {
      forta: 'Estrutura, disciplina, encerramento de ciclos, purificação kármica, ancoramento, maturidade, sabedoria',
      palavras_chave: ['estruturar', 'disciplinar', 'encerrar', 'limitar', 'purificar', 'amadurecer', 'consolidar'],
      desafios: ['rigidez', 'pessimismo', 'melancolia', 'medo da escassez'],
    },
    significado_espiritual: 'Saturno representa a lei kármica, a disciplina e o tempo. Sábado é dia de encerramento de ciclos, disciplina espiritual e trabalho interno profundo. É momento de aterramento, purificação kármica e organização estrutural para o novo ciclo que virá.',
    horas_planetarias: {
      inicio: 'Saturno',
      horas_favoraveis: ['Saturno', 'Vênus'],
      horas_desafio: ['Lua', 'Mercúrio'],
    },
    praticas_espirituais: [
      'Rituais de encerramento e despedida de ciclos',
      'Limpeza kármica e descarregos pesados',
      'Trabalho com ancestrais e espíritos da terra',
      'Práticas de ancoramento e aterramento profundo',
      'Organização material e espiritual do espaço sagrado',
      'Rituais de bound meditation e disciplina',
    ],
  },
};

/**
 * Get planet correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira', 'Domingo')
 * @returns DayPlanet mapping or undefined if day not found
 */
export function getDayPlanet(dia: string): DayPlanet | undefined {
  return DAY_PLANET_MAP[dia];
}

/**
 * Get planet for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet name or undefined if day not found
 */
export function getPlanetDay(dia: string): Planet | undefined {
  return DAY_PLANET_MAP[dia]?.planeta;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_PLANET_MAP);
}

/**
 * Get days associated with a specific planet
 * @param planeta - Planet name ('Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno')
 * @returns Array of day names
 */
export function getDaysByPlaneta(planeta: Planet): string[] {
  return Object.values(DAY_PLANET_MAP)
    .filter(dp => dp.planeta === planeta)
    .map(dp => dp.dia);
}

/**
 * Get all day-planet correlations
 * @returns Array of all DayPlanet mappings
 */
export function getAllDayPlanets(): DayPlanet[] {
  return Object.values(DAY_PLANET_MAP);
}

/**
 * Get spiritual meaning for a specific day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: string): string | undefined {
  return DAY_PLANET_MAP[dia]?.significado_espiritual;
}

/**
 * Get planet properties for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet properties or undefined if day not found
 */
export function getPlanetProperties(dia: string): DayPlanet['propriedades'] | undefined {
  return DAY_PLANET_MAP[dia]?.propriedades;
}

/**
 * Get planet symbol for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet symbol or undefined if day not found
 */
export function getPlanetSymbol(dia: string): string | undefined {
  return DAY_PLANET_MAP[dia]?.simbolo;
}

/**
 * Get element for a specific day
 * @param dia - Day name in Portuguese
 * @returns Element name or undefined if day not found
 */
export function getElementByDay(dia: string): Element | undefined {
  return DAY_PLANET_MAP[dia]?.elemento;
}

/**
 * Get planetary hours information for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planetary hours info or undefined if day not found
 */
export function getPlanetaryHours(dia: string): DayPlanet['horas_planetarias'] | undefined {
  return DAY_PLANET_MAP[dia]?.horas_planetarias;
}

/**
 * Get spiritual practices for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of spiritual practices or undefined if day not found
 */
export function getDayPractices(dia: string): string[] | undefined {
  return DAY_PLANET_MAP[dia]?.praticas_espirituais;
}
