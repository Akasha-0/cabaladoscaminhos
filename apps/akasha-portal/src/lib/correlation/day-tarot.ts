/**
 * Day-Tarot Correlation Module
 * Maps days of the week to their ruling Tarot Major Arcana cards and spiritual meanings
 * Based on classical Western esoteric traditions and day-element.ts patterns
 */

export interface DayTarot {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Associated Major Arcana card name */
  arcano: string;
  /** Card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Element connection for the day */
  elemento: 'fogo' | 'água' | 'ar' | 'terra';
  /** Spiritual meaning and energetic theme of the day */
  significado_espiritual: string;
  /** Quality of the element (cardinal/fixed/mutable) */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Sacred color(s) of the day */
  cor: string;
  /** Ruling planet of the day */
  planeta: string;
  /** Keywords associated with the day's energy */
  palavras_chave: string[];
  /** Mystical theme and focus of the day */
  mystere: string;
}

/** Day-to-Tarot mapping based on classical Western esoteric traditions */
const DAY_TAROT_MAP: Record<string, DayTarot> = {
  'Domingo': {
    dia: 'Domingo',
    indice: 0,
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    planeta: 'Sol',
    significado_espiritual: 'Dia de recarregar a energia vital, focar no poder pessoal, brilho próprio e propósito de vida. Reinar com coração generoso e irradiar luz interior.',
    palavras_chave: ['vitalidade', 'brilho', 'propósito', 'irradiar', 'liderança', 'alegria', 'clareza', 'sucesso'],
    mystere: 'O arcano do Sol representa a iluminação da consciência e o poder de manifestar o propósito de vida. É o dia de absorver a energia solar, fortalecer o brilho pessoal e conectar-se com a luz divina que habita em cada ser.',
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    indice: 1,
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    planeta: 'Lua',
    significado_espiritual: 'Dia de introspecção, sensibilidade emocional e conexão com a criança interior. Acolher as emoções, nutrir-se e cultivar a intuíção profunda.',
    palavras_chave: ['intuição', 'acolher', 'fluir', 'nutrir', 'sentir', 'receber', 'receptividade', 'mistério'],
    mystere: 'A Sacerdotisa é a guardiã dos segredos ocultos e da sabedoria interior. É o dia de silenciar a mente racional, entrar no santuário do inconsciente e deixar a voz da alma guiar os passos. O véu entre os mundos está fino.',
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    indice: 2,
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    planeta: 'Marte',
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Romper barreiras, iniciar projetos audazes e canalizar a energia guerreira para a transformação.',
    palavras_chave: ['determinação', 'vitória', 'conquista', 'força', 'ação', 'disciplina', 'coragem', 'superação'],
    mystere: 'O Carro representa a vitória conquistada através da vontade e do equilíbrio das polaridades. É o dia de avançar com determinação, dominar as resistências internas e conduzir a carruagem da alma rumo aos objetivos mais nobres.',
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    indice: 3,
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Cinzento',
    planeta: 'Mercúrio',
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Comunicar-se com clareza, estudar, negociar e adaptar-se às circunstâncias.',
    palavras_chave: ['manifestação', 'poder', 'comunicação', 'ferramentas', 'habilidade', 'arte', 'estratégia', 'criatividade'],
    mystere: 'O Mago é o ser que domina as quatro ferramentas elementais e manifesta através da intenção consciente. É o dia de despertar o poder pessoal, alinhar a vontade com a ação e reconhecer que todos os recursos necessários já habitam dentro de si.',
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    indice: 4,
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    planeta: 'Júpiter',
    significado_espiritual: 'Dia de expansão, abundância e busca pelo conhecimento superior. Expandir horizontes, agradecer pelas bênçãos e filosofar sobre o sentido da vida.',
    palavras_chave: ['ciclos', 'destino', 'transformação', 'oportunidade', 'sorte', 'expansão', 'sabedoria', 'evolução'],
    mystere: 'A Roda da Fortuna gira com a energia do destino e dos ciclos cósmicos. É o dia de reconhecer que a vida está em movimento constante, aceitar as mudanças com graça e alinhar-se com a corrente da transformação que traz ascensão e enlightenment.',
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    indice: 5,
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    planeta: 'Vênus',
    significado_espiritual: 'Dia de amor, harmonia e beleza. Cultivar relações, apreciar a natureza, dedicar-se à arte e encontrar prazer nas coisas simples da vida.',
    palavras_chave: ['amor', 'fertilidade', 'criação', 'natureza', 'beleza', 'nutrição', 'prosperidade', 'maternidade'],
    mystere: 'A Imperatriz é a grande mãe natureza, a deusa da fertilidade e do amor incondicional. É o dia de conectar-se com a energia criadora, nutrir os projetos com paciência amorosa e deixar fluir a abundância natural do universo.',
  },
  'Sábado': {
    dia: 'Sábado',
    indice: 6,
    arcano: 'O Mundo',
    numero_carta: 21,
    elemento: 'terra',
    qualidade: 'cardinal',
    cor: 'Preto / Azul Escuro',
    planeta: 'Saturno',
    significado_espiritual: 'Dia de estruturação, disciplina e respeito aos limites. Construir bases sólidas, responsabilidades assumir e maturidade espiritual cultivar.',
    palavras_chave: ['completude', 'realização', 'integração', 'disciplina', 'limitação', 'maturidade', 'conclusão', 'equilíbrio'],
    mystere: 'O Mundo representa a conclusão de um ciclo e a integração de todas as experiências vividas. É o dia de celebrar as realizações, encontrar equilíbrio entre o interno e o externo e reconhecer que a jornada espiritual está completando sua primeira grande volta.',
  },
};

/**
 * Get tarot correlation for a specific day of the week
 * @param dia - Day name (e.g., 'Segunda-feira', 'Terça-feira', 'Domingo')
 * @returns DayTarot mapping or undefined if day not found
 */
export function getDayTarot(dia: string): DayTarot | undefined {
  return DAY_TAROT_MAP[dia];
}

/**
 * Get arcano by day name
 * @param dia - Day name in Portuguese
 * @returns Arcano name or undefined
 */
export function getArcanoByDay(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.arcano;
}

/**
 * Get day by arcano name
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Sacerdotisa')
 * @returns Day name or undefined
 */
export function getTarotDay(arcano: string): string | undefined {
  const entry = Object.entries(DAY_TAROT_MAP).find(([, mapping]) => mapping.arcano === arcano);
  return entry ? entry[0] : undefined;
}

/**
 * Get card number by day name
 * @param dia - Day name in Portuguese
 * @returns Card number (0-21) or undefined
 */
export function getCardNumberByDay(dia: string): number | undefined {
  return DAY_TAROT_MAP[dia]?.numero_carta;
}

/**
 * Get element by day name
 * @param dia - Day name in Portuguese
 * @returns Element name or undefined
 */
export function getElementByDay(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.elemento;
}

/**
 * Get all days of the week
 * @returns Array of day names
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_TAROT_MAP);
}

/**
 * Get the ruling planet for a specific day
 * @param dia - Day name in Portuguese
 * @returns Planet name or undefined
 */
export function getDayPlanet(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.planeta;
}

/**
 * Get days associated with a specific arcano
 * @param arcano - Arcano name
 * @returns Array of day names or empty array
 */
export function getDaysByArcano(arcano: string): string[] {
  return Object.entries(DAY_TAROT_MAP)
    .filter(([, mapping]) => mapping.arcano === arcano)
    .map(([dia]) => dia);
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('fogo', 'água', 'ar', 'terra')
 * @returns Array of day names
 */
export function getDaysByElemento(elemento: string): string[] {
  return Object.entries(DAY_TAROT_MAP)
    .filter(([, mapping]) => mapping.elemento === elemento)
    .map(([dia]) => dia);
}

/**
 * Get the spiritual meaning of a day
 * @param dia - Day name in Portuguese
 * @returns Spiritual meaning text or undefined
 */
export function getDaySignificado(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.significado_espiritual;
}

/**
 * Get the mystical theme of a day
 * @param dia - Day name in Portuguese
 * @returns Mystical theme text or undefined
 */
export function getDayMystere(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.mystere;
}

/**
 * Get keywords for a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of keywords or undefined
 */
export function getDayKeywords(dia: string): string[] | undefined {
  return DAY_TAROT_MAP[dia]?.palavras_chave;
}

/**
 * Get the quality of the day
 * @param dia - Day name in Portuguese
 * @returns Quality ('cardinal' | 'fixed' | 'mutable') or undefined
 */
export function getDayQuality(dia: string): 'cardinal' | 'fixed' | 'mutable' | undefined {
  return DAY_TAROT_MAP[dia]?.qualidade;
}

/**
 * Get the sacred color of the day
 * @param dia - Day name in Portuguese
 * @returns Color string or undefined
 */
export function getDayColor(dia: string): string | undefined {
  return DAY_TAROT_MAP[dia]?.cor;
}

/**
 * Get all day-tarot correlations
 * @returns Array of all DayTarot mappings
 */
export function getAllDayTarots(): DayTarot[] {
  return Object.values(DAY_TAROT_MAP);
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or undefined
 */
export function getArcanoByNumber(numero: number): string | undefined {
  const entry = Object.values(DAY_TAROT_MAP).find((mapping) => mapping.numero_carta === numero);
  return entry?.arcano;
}

/**
 * Get day by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The day name or undefined
 */
export function getDayByNumber(numero: number): string | undefined {
  const entry = Object.values(DAY_TAROT_MAP).find((mapping) => mapping.numero_carta === numero);
  return entry?.dia;
}
