/**
 * Tarot-Day Correlation Mapping
 * Maps Tarot Major Arcana cards to days of the week
 * Based on the Cabala dos Caminhos spiritual system
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its associated day
 */
export interface TarotDayMapping {
  /** The Major Arcana card name */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Associated day of the week */
  dia: string;
  /** Element connection for this arcano-day correlation */
  elemento_conexao: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Practical interpretation for daily life */
  interpretacao: string;
}

// ─── Tarot Major Arcana to Day Mapping ───────────────────────────────────────

export const TAROT_DAY_MAPPINGS: Record<string, TarotDayMapping> = {
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    dia: 'Domingo',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Vitalidade, irradiação do poder pessoal, sucesso e alinhamento com o propósito de vida. Clareza interior e brilho próprio que ilumina o caminho.',
    interpretacao: 'Dia de maximizar a energia pessoal, buscar reconhecimento, assumir liderança e manifestar seus talentos. Foque no brilho próprio e na energia Yang. Absorva a energia solar e conecte-se com seu propósito de vida.',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    dia: 'Segunda-feira',
    elemento_conexao: 'Água',
    significado_espiritual: 'Intuição profunda, sabedoria interior, o véu entre os mundos e os segredos ocultos. A guardiã dos mistérios que habita no santuário do inconsciente.',
    interpretacao: 'Período propício para trabalho interno, meditação, sonhos e processos de limpeza emocional. Confie na intuição, silencie a mente racional e deixe a voz da alma guiar os passos.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    dia: 'Terça-feira',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Vitória conquistada através da vontade, determinação e equilíbrio das polaridades. O guerreiro que conduz a carruagem da alma rumo à conquista.',
    interpretacao: 'Dia de avançar com determinação, dominar resistências internas e tomar decisões decisiveis. Canalize a energia guerreira para a transformação. Rompa barreiras e inicie projetos audazes.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    dia: 'Quarta-feira',
    elemento_conexao: 'Ar',
    significado_espiritual: 'Poder mental, comunicação, maestria das ferramentas internas e manifestação através da intenção consciente. O ser que domina as quatro ferramentas elementais.',
    interpretacao: 'Momento de manifestar através da mente, diplomácia e estratégia verbal. Use a comunicação como ferramenta de transformação. desperte o poder pessoal e alinhe a vontade com a ação.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    dia: 'Quinta-feira',
    elemento_conexao: 'Fogo',
    significado_espiritual: 'Ciclos cósmicos, destino, transformação e a energia do acaso que orienta a vida. A roda do destino gira trazendo ascensão e enlightenment.',
    interpretacao: 'Dia de reconhecer que a vida está em movimento constante. Aceite as mudanças com graça e alinhe-se com a corrente da transformação que traz expansão e sabedoria. Esteja aberto a novas oportunidades.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    dia: 'Sexta-feira',
    elemento_conexao: 'Terra',
    significado_espiritual: 'Amor incondicional, fertilidade, criação abundante e conexão com o divino feminino. A grande mãe natureza que nutre, prospera e cria sem esforço.',
    interpretacao: 'Período de harmonização, doçura e magnetismo pessoal. Ideal para trabalhos de amor, cura emocional e atratividade. Conecte-se com a energia criadora, nutra seus projetos e deixe fluir a abundância.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    dia: 'Sábado',
    elemento_conexao: 'Terra',
    significado_espiritual: 'Completude, encerramento de ciclos, integração de todas as experiências e realização terrena. A dança cósmica que completa uma jornada spiritual.',
    interpretacao: 'Dia de finalizações, rituais de encerramento e manifestação de projetos de longa duração. Celebre as realizações, encontre equilíbrio entre o interno e o externo. A jornada espiritual está completando sua primeira grande volta.',
  },
} as const;

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_DAY_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_DAY_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the Tarot-to-Day correlation mapping
 * @param arcano - The arcano name (e.g., 'O Sol', 'A Lua', 'O Imperador')
 * @returns The correlation mapping or null if not found
 */
export function getTarotDay(arcano: string): TarotDayMapping | null {
  return TAROT_DAY_MAPPINGS[arcano] ?? null;
}

/**
 * Get the arcano name corresponding to a day
 * @param dia - Day name (e.g., 'Domingo', 'Segunda-feira', 'Terça-feira')
 * @returns The arcano name or null if not found
 */
export function getDayTarot(dia: string): string | null {
  for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
    if (mapping.dia === dia) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get all available Tarot-Day mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotDays(): TarotDayMapping[] {
  return Object.values(TAROT_DAY_MAPPINGS);
}

/**
 * Get all arcano names
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_DAY_MAPPINGS);
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotDay(arcano: string): boolean {
  return arcano in TAROT_DAY_MAPPINGS;
}

/**
 * Get arcano by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The arcano name or null if not found
 */
export function getArcanoByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.arcano;
    }
  }
  return null;
}

/**
 * Get day by card number
 * @param numero - The Major Arcana card number (0-21)
 * @returns The day name or null if not found
 */
export function getDayByNumber(numero: number): string | null {
  for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return mapping.dia;
    }
  }
  return null;
}

/**
 * Get day by arcano name
 * @param arcano - Arcano name (e.g., 'O Sol', 'A Sacerdotisa')
 * @returns The day name or null if not found
 */
export function getDayByArcano(arcano: string): string | null {
  const mapping = TAROT_DAY_MAPPINGS[arcano];
  return mapping ? mapping.dia : null;
}

/**
 * Get element by arcano name
 * @param arcano - Arcano name
 * @returns The element connection or null if not found
 */
export function getElementByArcano(arcano: string): string | null {
  const mapping = TAROT_DAY_MAPPINGS[arcano];
  return mapping ? mapping.elemento_conexao : null;
}

/**
 * Get spiritual meaning by arcano name
 * @param arcano - Arcano name
 * @returns The spiritual meaning or null if not found
 */
export function getSignificadoByArcano(arcano: string): string | null {
  const mapping = TAROT_DAY_MAPPINGS[arcano];
  return mapping ? mapping.significado_espiritual : null;
}

/**
 * Get interpretation by arcano name
 * @param arcano - Arcano name
 * @returns The daily interpretation or null if not found
 */
export function getInterpretacaoByArcano(arcano: string): string | null {
  const mapping = TAROT_DAY_MAPPINGS[arcano];
  return mapping ? mapping.interpretacao : null;
}

/**
 * Get days associated with a specific element
 * @param elemento - Element name ('Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of days associated with the element
 */
export function getDaysByElemento(elemento: string): string[] {
  const days: string[] = [];
  for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
    if (mapping.elemento_conexao === elemento) {
      days.push(mapping.dia);
    }
  }
  return days;
}

/**
 * Get arcanos associated with a specific element
 * @param elemento - Element name ('Fogo', 'Água', 'Ar', 'Terra')
 * @returns Array of arcano names associated with the element
 */
export function getArcanosByElemento(elemento: string): string[] {
  const arcanos: string[] = [];
  for (const mapping of Object.values(TAROT_DAY_MAPPINGS)) {
    if (mapping.elemento_conexao === elemento) {
      arcanos.push(mapping.arcano);
    }
  }
  return arcanos;
}

export default {
  getTarotDay,
  getDayTarot,
  getAllTarotDays,
  getAllArcanos,
  hasTarotDay,
  getArcanoByNumber,
  getDayByNumber,
  getDayByArcano,
  getElementByArcano,
  getSignificadoByArcano,
  getInterpretacaoByArcano,
  getDaysByElemento,
  getArcanosByElemento,
};