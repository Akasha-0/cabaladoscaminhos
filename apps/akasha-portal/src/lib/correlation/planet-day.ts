/**
 * Planet-Day Correlation Module
 * Maps planets to their ruling days of the week and spiritual significance
 * Based on classical Western astrological traditions and planetary influences
 */

/** Supported planetary bodies */
export type Planet = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

/** Elemental correspondence for each planet */
export type Element = 'fogo' | 'água' | 'ar' | 'terra';

export interface PlanetDay {
  /** Planet name */
  planeta: Planet;
  /** Day of the week this planet rules */
  dia: string;
  /** Day index (0 = Sunday/Domingo) */
  indice: number;
  /** Elemental connection of the planet */
  elemento: Element;
  /** Quality of the planet's energy (cardinal/fixed/mutable) */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Sacred color(s) of the planet */
  cor: string;
  /** Associated direction */
  direcao: string;
  /** Season correspondence */
  estacao: string;
  /** Associated chakra */
  chakra: string;
  /** Symbol for the planet */
  simbolo: string;
  /** Planetary properties: strengths and qualities */
  propriedades: {
    /** What the planet brings to the day */
    forca: string;
    /** Keywords associated with the planet's energy */
    palavras_chave: string[];
    /** Challenges to be aware of */
    desafios: string[];
  };
  /** Mystical theme and energetic focus */
  mystere: string;
  /** Spiritual significance and meaning */
  significado_espiritual: string;
  /** Recommended spiritual practices for the planet's day */
  praticas_espirituais: string[];
  /** Planetary hours information */
  horas_planetarias: {
    /** First hour of the day */
    primeira_hora: string;
    /** Last hour of the day */
    ultima_hora: string;
    /** Most auspicious hours for work */
    horas_favoraveis: string[];
    /** Hours to avoid */
    horas_desfavoraveis: string[];
  };
}

/** Planet-to-Day mapping based on classical astrological traditions */
const PLANET_DAY_MAP: Record<Planet, PlanetDay> = {
  'Sol': {
    planeta: 'Sol',
    dia: 'Domingo',
    indice: 0,
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    direcao: 'Leste',
    estacao: 'Verão',
    chakra: '3º Plexo Solar',
    simbolo: '☉',
    propriedades: {
      forca: 'Vitalidade, liderança, espiritualidade, criatividade',
      palavras_chave: ['clareza', 'propósito', 'autoexpressão', 'espiritualidade'],
      desafios: ['egocentrismo', 'arrogância', 'exaustão'],
    },
    mystere: 'O Sol representa a essência divina em cada ser - o fogo central que ilumina nosso caminho espiritual e nos conecta à luz crística interior.',
    significado_espiritual: 'Dia de renovação espiritual e conexão com a luz interior. O Domingo é propício para práticas de cura energética, meditação solar e trabalho com o fogo sagrado. A energia solar fortalece a vontade, a determinação e o senso de propósito divino.',
    praticas_espirituais: [
      'Meditação com luz dourada',
      'Rituais de cura solar',
      'Trabalho com intenção e vontade',
      'Conexão com o Cristo interior',
      'Louvores e orações ao sol',
    ],
    horas_planetarias: {
      primeira_hora: 'Sol',
      ultima_hora: 'Sol',
      horas_favoraveis: ['Manhã (6-10h)', 'Meio-dia (11-13h)'],
      horas_desfavoraveis: ['Noite tardia (23h-1h)'],
    },
  },
  'Lua': {
    planeta: 'Lua',
    dia: 'Segunda-feira',
    indice: 1,
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    direcao: 'Norte',
    estacao: 'Primavera',
    chakra: '2º Sacro',
    simbolo: '☽',
    propriedades: {
      forca: 'Intuição, emoções, fertilidade, ciclos',
      palavras_chave: ['sensibilidade', 'nutrição', ' ciclos', 'intuição'],
      desafios: ['instabilidade emocional', 'hipersensibilidade', 'colapso'],
    },
    mystere: 'A Lua reflete a luz do Sol em nós - a polaridade feminina, receptiva e lunar que governa nossas emoções, memórias e o inconsciente coletivo.',
    significado_espiritual: 'Dia de purificação emocional e trabalho com o inconsciente. A Segunda-feira é ideal para práticas de limpeza kármica, cura emocional, trabalho com água sagrada e mediúnidade. A energia lunar revela verdades ocultas e facilita a conexão com ancestrais e guias.',
    praticas_espirituais: [
      'Rituais de limpeza lunar',
      'Trabalho com água sagrada',
      'Meditação de lua cheia/nova',
      'Conexão com ancestrais',
      'Práticas de intuição e clarividência',
    ],
    horas_planetarias: {
      primeira_hora: 'Lua',
      ultima_hora: 'Lua',
      horas_favoraveis: ['Noite (18-22h)', 'Madrugada (2-4h)'],
      horas_desfavoraveis: ['Meio-dia (11-14h)'],
    },
  },
  'Marte': {
    planeta: 'Marte',
    dia: 'Terça-feira',
    indice: 2,
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Escarlate',
    direcao: 'Sul',
    estacao: 'Verão',
    chakra: '1º Raiz',
    simbolo: '♂',
    propriedades: {
      forca: 'Coragem, ação, proteção, fertilidade',
      palavras_chave: ['coragem', 'ação', 'proteção', 'vigor'],
      desafios: ['agressividade', 'impulsividade', 'conflito'],
    },
    mystere: 'Marte representa o guerreiro interior - a força vital que nos protege, defende e ativa para a ação. É o fogo que transforma matéria em movimento e desejo em realidade.',
    significado_espiritual: 'Dia de ativação energética e proteção espiritual. A Terça-feira é propícia para rituais de proteção, ativação de chakras inferiores, trabalho com fogo vermelho e conquista de objetivos. A energia marciana desperta a coragem, a determinação e a capacidade de superar obstáculos.',
    praticas_espirituais: [
      'Rituais de proteção e banimento',
      'Ativação da vontade e determinação',
      'Trabalho com fogo vermelho',
      'Meditação de coragem',
      'Magia de proteção e defesa',
    ],
    horas_planetarias: {
      primeira_hora: 'Marte',
      ultima_hora: 'Marte',
      horas_favoraveis: ['Tarde (14-18h)', 'Noite (22-24h)'],
      horas_desfavoraveis: ['Manhã cedo (4-7h)'],
    },
  },
  'Mercúrio': {
    planeta: 'Mercúrio',
    dia: 'Quarta-feira',
    indice: 3,
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Laranja',
    direcao: 'Leste',
    estacao: 'Primavera',
    chakra: '5º Garganta',
    simbolo: '☿',
    propriedades: {
      forca: 'Comunicação, inteligência, comércio, viajes',
      palavras_chave: ['comunicação', 'inteligência', 'adaptação', 'viagem'],
      desafios: ['superficialidade', 'nervosismo', 'inconstância'],
    },
    mystere: 'Mercúrio é o mensageiro divino - a inteligência fluida que conecta céu e terra, consciente e inconsciente, matéria e espírito. É o princípio da comunicação universal.',
    significado_espiritual: 'Dia de comunicação espiritual e desenvolvimento mental. A Quarta-feira é ideal para estudos, rituais de aprendizado, trabalho com palavras de poder e magia de comunicação. A energia mercuriana favorece a escrita sagrada, a leitura de mensajes e a conexão com a mente divina.',
    praticas_espirituais: [
      'Magia de palavras de poder',
      'Rituais de comunicação espiritual',
      'Estudos de ciências ocultas',
      'Trabalho com inteligência artificial',
      'Meditação de clareza mental',
    ],
    horas_planetarias: {
      primeira_hora: 'Mercúrio',
      ultima_hora: 'Mercúrio',
      horas_favoraveis: ['Manhã (8-11h)', 'Tarde (15-17h)'],
      horas_desfavoraveis: ['Meia-noite (23h-1h)'],
    },
  },
  'Júpiter': {
    planeta: 'Júpiter',
    dia: 'Quinta-feira',
    indice: 4,
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    direcao: 'Nordeste',
    estacao: 'Inverno',
    chakra: '6º Terceiro Olho',
    simbolo: '♃',
    propriedades: {
      forca: 'Expansão, sabedoria, prosperidade, espiritualidade',
      palavras_chave: ['sabedoria', 'prosperidade', 'expansão', 'generosidade'],
      desafios: ['excesso', 'arrogância', 'extravagância'],
    },
    mystere: 'Júpiter representa o guru interior - a sabedoria divina que orienta, expande e eleva a consciência. É o princípio da fé, da esperança e da abundância espiritual.',
    significado_espiritual: 'Dia de expansão espiritual e cura superior. A Quinta-feira é propícia para rituais de prosperidade, trabalho com júpiteriano, magia de boa sorte e expansão da consciência. A energia jupiteriana favorece a busca por conhecimento sagrado, peregrinações e práticas devocionais.',
    praticas_espirituais: [
      'Rituais de prosperidade e abundância',
      'Meditação de sabedoria divina',
      'Trabalho com mestres ascensionados',
      'Orações de proteção e expansão',
      'Trabalho com fogo azul',
    ],
    horas_planetarias: {
      primeira_hora: 'Júpiter',
      ultima_hora: 'Júpiter',
      horas_favoraveis: ['Manhã (9-12h)', 'Tarde (15-18h)'],
      horas_desfavoraveis: ['Madrugada (1-4h)'],
    },
  },
  'Vênus': {
    planeta: 'Vênus',
    dia: 'Sexta-feira',
    indice: 5,
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    direcao: 'Oeste',
    estacao: 'Primavera',
    chakra: '4º Cardíaco',
    simbolo: '♀',
    propriedades: {
      forca: 'Amor, harmonia, beleza, fertilidade',
      palavras_chave: ['amor', 'harmonia', 'beleza', 'arte'],
      desafios: ['vaidade', 'indecisão', 'perfeccionismo'],
    },
    mystere: 'Vênus é a deusa do amor - a polaridade que atrai, nutre e cria beleza. É o princípio da união, da fertilidade e daarte de viver em harmonia com o divino.',
    significado_espiritual: 'Dia de amor e harmonia espiritual. A Sexta-feira é ideal para rituais de amor, casamento espiritual, trabalho com vênusiano e magia de relacionamentos. A energia venusiana favorece a reconciliação, a cura do coração e a conexão com a beleza divina em todas as coisas.',
    praticas_espirituais: [
      'Rituais de amor e اتحاد',
      'Trabalho com coração sagrado',
      'Meditação de amor incondicional',
      'Magia de relacionamentos',
      'Conexão com a deusa Vênus',
    ],
    horas_planetarias: {
      primeira_hora: 'Vênus',
      ultima_hora: 'Vênus',
      horas_favoraveis: ['Manhã (7-10h)', 'Tarde (15-18h)'],
      horas_desfavoraveis: ['Noite tardia (23h-2h)'],
    },
  },
  'Saturno': {
    planeta: 'Saturno',
    dia: 'Sábado',
    indice: 6,
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Preto / Cinza',
    direcao: 'Oeste',
    estacao: 'Inverno',
    chakra: '1º Raiz',
    simbolo: '♄',
    propriedades: {
      forca: 'Disciplina, limite, karma, sabedoria',
      palavras_chave: ['disciplina', 'limite', 'karma', 'sabedoria'],
      desafios: ['rigidez', 'pessimismo', 'medo'],
    },
    mystere: 'Saturno é o velho sábio - a força que testa, limita e transforma através do tempo. É o princípio da disciplina kármica, da paciência e da sabedoria conquistada pela experiência.',
    significado_espiritual: 'Dia de reflexão kármica e trabalho com limites. O Sábado é propício para rituais de proteção contra negatividades, trabalho com saturniano, magia de limpezakármica e meditação de paciência. A energia saturniana fortalece a disciplina, a paciência e a conexão com a sabedoria antiga.',
    praticas_espirituais: [
      'Rituais de proteção kármica',
      'Trabalho com ancestrais negativos',
      'Meditação de paciência',
      'Magia delimpeza e purificação',
      'Conexão com mestres antigos',
    ],
    horas_planetarias: {
      primeira_hora: 'Saturno',
      ultima_hora: 'Saturno',
      horas_favoraveis: ['Tarde (14-17h)', 'Noite (19-22h)'],
      horas_desfavoraveis: ['Manhã (6-9h)'],
    },
  },
};

/**
 * Get day correlation for a specific planet
 * @param planeta - Planet name ('Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno')
 * @returns PlanetDay mapping or undefined if planet not found
 */
export function getPlanetDay(planeta: string): PlanetDay | undefined {
  return PLANET_DAY_MAP[planeta as Planet];
}

/**
 * Get planet for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet name or undefined if day not found
 */
export function getDayPlanet(dia: string): Planet | undefined {
  const entry = Object.values(PLANET_DAY_MAP).find(p => p.dia === dia);
  return entry?.planeta;
}

/**
 * Get all planets
 * @returns Array of planet names
 */
export function getAllPlanets(): Planet[] {
  return Object.keys(PLANET_DAY_MAP) as Planet[];
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('fogo', 'água', 'ar', 'terra')
 * @returns Array of planet names for that element
 */
export function getPlanetsByElemento(elemento: string): Planet[] {
  return Object.keys(PLANET_DAY_MAP).filter(
    (p) => PLANET_DAY_MAP[p as Planet].elemento === elemento
  ) as Planet[];
}

/**
 * Get all planet-day correlations
 * @returns Array of all PlanetDay mappings
 */
export function getAllPlanetDays(): PlanetDay[] {
  return Object.values(PLANET_DAY_MAP);
}

/**
 * Get spiritual meaning for a specific planet
 * @param planeta - Planet name
 * @returns Spiritual meaning or undefined if planet not found
 */
export function getPlanetSpiritualMeaning(planeta: string): string | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.significado_espiritual;
}

/**
 * Get element for a specific planet
 * @param planeta - Planet name
 * @returns Element name or undefined if planet not found
 */
export function getElementByPlanet(planeta: string): Element | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.elemento;
}

/**
 * Get planet symbol for a specific planet
 * @param planeta - Planet name
 * @returns Planet symbol or undefined if planet not found
 */
export function getPlanetSymbol(planeta: string): string | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.simbolo;
}

/**
 * Get spiritual practices for a specific planet's day
 * @param planeta - Planet name
 * @returns Array of spiritual practices or undefined if planet not found
 */
export function getPlanetPractices(planeta: string): string[] | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.praticas_espirituais;
}

/**
 * Get planetary hours information for a specific planet
 * @param planeta - Planet name
 * @returns Planetary hours info or undefined if planet not found
 */
export function getPlanetHours(planeta: string): PlanetDay['horas_planetarias'] | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.horas_planetarias;
}

/**
 * Get planet properties for a specific planet
 * @param planeta - Planet name
 * @returns Planet properties or undefined if planet not found
 */
export function getPlanetProperties(planeta: string): PlanetDay['propriedades'] | undefined {
  return PLANET_DAY_MAP[planeta as Planet]?.propriedades;
}
