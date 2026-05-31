/**
 * Tarot-Day Correlation Module
 * Maps Tarot Major Arcana cards to their ruling days of the week
 * Inverse correlation of day-tarot for lookup by arcano
 */

export interface TarotDay {
  /** Associated Major Arcana card name */
  arcano: string;
  /** Card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Element connection for the card */
  elemento: 'fogo' | 'água' | 'ar' | 'terra';
  /** Quality of the element (cardinal/fixed/mutable) */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Sacred color(s) of the card */
  cor: string;
  /** Ruling planet of the card */
  planeta: string;
  /** Spiritual meaning and energetic theme */
  significado_espiritual: string;
  /** Keywords associated with the card's energy */
  palavras_chave: string[];
  /** Mystical theme and focus */
  mystere: string;
}

/** Tarot-to-Day mapping based on classical Western esoteric traditions */
const TAROT_DAY_MAP: Record<string, TarotDay> = {
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    dia: 'Domingo',
    indice: 0,
    elemento: 'fogo',
    qualidade: 'fixed',
    cor: 'Dourado / Amarelo',
    planeta: 'Sol',
    significado_espiritual: 'Dia de recarregar a energia vital, focar no poder pessoal, brilho próprio e propósito de vida. Reinar com coração generoso e irradiar luz interior.',
    palavras_chave: ['vitalidade', 'brilho', 'propósito', 'irradiar', 'liderança', 'alegria', 'clareza', 'sucesso'],
    mystere: 'O arcano do Sol representa a iluminação da consciência e o poder de manifestar o propósito de vida. É o dia de absorver a energia solar, fortalecer o brilho pessoal e conectar-se com a luz divina que habita em cada ser.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    dia: 'Segunda-feira',
    indice: 1,
    elemento: 'água',
    qualidade: 'cardinal',
    cor: 'Prata / Branco',
    planeta: 'Lua',
    significado_espiritual: 'Dia de introspecção, sensibilidade emocional e conexão com a criança interior. Acolher as emoções, nutrir-se e cultivar a intuíção profunda.',
    palavras_chave: ['intuição', 'acolher', 'fluir', 'nutrir', 'sentir', 'receber', 'receptividade', 'mistério'],
    mystere: 'A Sacerdotisa é a guardiã dos segredos ocultos e da sabedoria interior. É o dia de silenciar a mente racional, entrar no santuário do inconsciente e deixar a voz da alma guiar os passos. O véu entre os mundos está fino.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    dia: 'Terça-feira',
    indice: 2,
    elemento: 'fogo',
    qualidade: 'cardinal',
    cor: 'Vermelho / Laranja',
    planeta: 'Marte',
    significado_espiritual: 'Dia de força, coragem e ação decisiva. Romper barreiras, iniciar projetos audazes e canalizar a energia guerreira para a transformação.',
    palavras_chave: ['determinação', 'vitória', 'conquista', 'força', 'ação', 'disciplina', 'coragem', 'superação'],
    mystere: 'O Carro representa a vitória conquistada através da vontade e do equilíbrio das polaridades. É o dia de avançar com determinação, dominar as resistências internas e conduzir a carruagem da alma rumo aos objetivos mais nobres.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    dia: 'Quarta-feira',
    indice: 3,
    elemento: 'ar',
    qualidade: 'mutable',
    cor: 'Amarelo / Cinzento',
    planeta: 'Mercúrio',
    significado_espiritual: 'Dia da mente ágil, comunicação clara e versatilidade intelectual. Comunicar-se com clareza, estudar, negociar e adaptar-se às circunstâncias.',
    palavras_chave: ['manifestação', 'poder', 'comunicação', 'ferramentas', 'habilidade', 'arte', 'estratégia', 'criatividade'],
    mystere: 'O Mago é o ser que domina as quatro ferramentas elementais e manifesta através da intenção consciente. É o dia de despertar o poder pessoal, alinhar a vontade com a ação e reconhecer que todos os recursos necessários já habitam dentro de si.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    dia: 'Quinta-feira',
    indice: 4,
    elemento: 'fogo',
    qualidade: 'mutable',
    cor: 'Azul / Roxo',
    planeta: 'Júpiter',
    significado_espiritual: 'Dia de expansão, abundância e busca pelo conhecimento superior. Expandir horizontes, agradecer pelas bênçãos e filosofar sobre o sentido da vida.',
    palavras_chave: ['ciclos', 'destino', 'transformação', 'oportunidade', 'sorte', 'expansão', 'sabedoria', 'evolução'],
    mystere: 'A Roda da Fortuna gira com a energia do destino e dos ciclos cósmicos. É o dia de reconhecer que a vida está em movimento constante, aceitar as mudanças com graça e alinhar-se com a corrente da transformação que traz ascensão e enlightenment.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    dia: 'Sexta-feira',
    indice: 5,
    elemento: 'terra',
    qualidade: 'fixed',
    cor: 'Verde / Rosa',
    planeta: 'Vênus',
    significado_espiritual: 'Dia de amor, harmonia e beleza. Cultivar relações, apreciar a natureza, dedicar-se à arte e encontrar prazer nas coisas simples da vida.',
    palavras_chave: ['amor', 'fertilidade', 'criação', 'natureza', 'beleza', 'nutrição', 'prosperidade', 'maternidade'],
    mystere: 'A Imperatriz é a grande mãe natureza, a deusa da fertilidade e do amor incondicional. É o dia de conectar-se com a energia criadora, nutrir os projetos com paciência amorosa e deixar fluir a abundância natural do universo.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    dia: 'Sábado',
    indice: 6,
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
 * Get day correlation for a specific tarot arcano
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Sacerdotisa')
 * @returns TarotDay mapping or undefined if arcano not found
 */
export function getTarotDay(arcano: string): TarotDay | undefined {
  return TAROT_DAY_MAP[arcano];
}

/**
 * Get day name by arcano
 * @param arcano - Arcano name
 * @returns Day name in Portuguese or undefined
 */
export function getDayByArcano(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.dia;
}

/**
 * Get arcano by day name
 * @param dia - Day name in Portuguese
 * @returns Arcano name or undefined
 */
export function getArcanoByDay(dia: string): string | undefined {
  const entry = Object.entries(TAROT_DAY_MAP).find(([, mapping]) => mapping.dia === dia);
  return entry ? entry[0] : undefined;
}

/**
 * Get card number by arcano
 * @param arcano - Arcano name
 * @returns Card number (0-21) or undefined
 */
export function getCardNumberByArcano(arcano: string): number | undefined {
  return TAROT_DAY_MAP[arcano]?.numero_carta;
}

/**
 * Get element by arcano
 * @param arcano - Arcano name
 * @returns Element name or undefined
 */
export function getElementByArcano(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.elemento;
}

/**
 * Get all arcanos mapped to days
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_DAY_MAP);
}

/**
 * Get the ruling planet for a specific arcano
 * @param arcano - Arcano name
 * @returns Planet name or undefined
 */
export function getPlanetByArcano(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.planeta;
}

/**
 * Get arcanos associated with a specific day
 * @param dia - Day name in Portuguese
 * @returns Array of arcano names or empty array
 */
export function getArcanosByDay(dia: string): string[] {
  return Object.entries(TAROT_DAY_MAP)
    .filter(([, mapping]) => mapping.dia === dia)
    .map(([arcano]) => arcano);
}

/**
 * Get arcanos associated with a specific element
 * @param elemento - Element name ('fogo', 'água', 'ar', 'terra')
 * @returns Array of arcano names
 */
export function getArcanosByElemento(elemento: string): string[] {
  return Object.entries(TAROT_DAY_MAP)
    .filter(([, mapping]) => mapping.elemento === elemento)
    .map(([arcano]) => arcano);
}

/**
 * Get the spiritual meaning of an arcano
 * @param arcano - Arcano name
 * @returns Spiritual meaning text or undefined
 */
export function getArcanoSignificado(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.significado_espiritual;
}

/**
 * Get the mystical theme of an arcano
 * @param arcano - Arcano name
 * @returns Mystical theme text or undefined
 */
export function getArcanoMystere(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.mystere;
}

/**
 * Get keywords for a specific arcano
 * @param arcano - Arcano name
 * @returns Array of keywords or undefined
 */
export function getArcanoKeywords(arcano: string): string[] | undefined {
  return TAROT_DAY_MAP[arcano]?.palavras_chave;
}

/**
 * Get the quality of an arcano
 * @param arcano - Arcano name
 * @returns Quality ('cardinal' | 'fixed' | 'mutable') or undefined
 */
export function getArcanoQuality(arcano: string): 'cardinal' | 'fixed' | 'mutable' | undefined {
  return TAROT_DAY_MAP[arcano]?.qualidade;
}

/**
 * Get the sacred color of an arcano
 * @param arcano - Arcano name
 * @returns Color string or undefined
 */
export function getArcanoColor(arcano: string): string | undefined {
  return TAROT_DAY_MAP[arcano]?.cor;
}

/**
 * Get all tarot-day correlations
 * @returns Array of all TarotDay mappings
 */
export function getAllTarotDays(): TarotDay[] {
  return Object.values(TAROT_DAY_MAP);
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or undefined
 */
export function getArcanoByNumber(numero: number): string | undefined {
  const entry = Object.values(TAROT_DAY_MAP).find((mapping) => mapping.numero_carta === numero);
  return entry?.arcano;
}

/**
 * Get day by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The day name or undefined
 */
export function getDayByNumber(numero: number): string | undefined {
  const entry = Object.values(TAROT_DAY_MAP).find((mapping) => mapping.numero_carta === numero);
  return entry?.dia;
}

export default {
  getTarotDay,
  getDayByArcano,
  getArcanoByDay,
  getCardNumberByArcano,
  getElementByArcano,
  getAllArcanos,
  getPlanetByArcano,
  getArcanosByDay,
  getArcanosByElemento,
  getArcanoSignificado,
  getArcanoMystere,
  getArcanoKeywords,
  getArcanoQuality,
  getArcanoColor,
  getAllTarotDays,
  getArcanoByNumber,
  getDayByNumber,
};
